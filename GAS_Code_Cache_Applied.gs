// ═══ Gym — 운동 기록 GAS 서버 (캐시 적용) ═══

var AUTH_TOKEN = 'gym2026';
var CACHE_KEY = 'gym_payload';
var CACHE_TTL = 21600; // 6시간 (초)
var FILE_ID_KEY = 'data_file_id';

function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents || '{}');
    if (data.token !== AUTH_TOKEN) {
      return _json({ status: 'error', message: 'Unauthorized' });
    }
    var result;
    switch (data.action) {
      case 'save':
        result = saveData(data.payload);
        break;
      case 'load':
        result = loadData();
        break;
      default:
        result = { status: 'error', message: 'Unknown action' };
    }
    return _json(result);
  } catch (err) {
    return _json({ status: 'error', message: String(err) });
  }
}

function doGet(e) {
  return _json({ status: 'ok', message: 'Gym GAS is running' });
}

function _json(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

// ── 파일 ID 캐싱으로 Drive 탐색 최소화 ──
function getDataFileId() {
  var props = PropertiesService.getScriptProperties();
  var fileId = props.getProperty(FILE_ID_KEY);

  // 캐싱된 ID가 있으면 유효성 확인
  if (fileId) {
    try {
      var file = DriveApp.getFileById(fileId);
      if (!file.isTrashed()) return fileId;
    } catch (e) {
      // 파일 삭제됨 → 아래에서 재생성
    }
  }

  // 폴더/파일 탐색 (최초 1회 또는 파일 유실 시)
  var folder = getOrCreateFolder(DriveApp.getRootFolder(), 'gym');
  var files = folder.getFilesByName('gorilla_data.json');
  var file;
  if (files.hasNext()) {
    file = files.next();
  } else {
    file = folder.createFile('gorilla_data.json', '{}', MimeType.PLAIN_TEXT);
  }

  props.setProperty(FILE_ID_KEY, file.getId());
  return file.getId();
}

function getOrCreateFolder(parent, name) {
  var folders = parent.getFoldersByName(name);
  if (folders.hasNext()) return folders.next();
  return parent.createFolder(name);
}

// ── 저장 ──
function saveData(payload) {
  var lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    var jsonStr = JSON.stringify(payload);

    // Drive에 저장
    var fileId = getDataFileId();
    DriveApp.getFileById(fileId).setContent(jsonStr);

    // 캐시 갱신 (100KB 이하만)
    if (jsonStr.length <= 100000) {
      try {
        CacheService.getScriptCache().put(CACHE_KEY, jsonStr, CACHE_TTL);
      } catch (e) { /* 캐시 실패 무시 */ }
    } else {
      // 초과 시 캐시 삭제 (stale 방지)
      try {
        CacheService.getScriptCache().remove(CACHE_KEY);
      } catch (e) { }
    }

    // 백업
    _backupDataIfNeeded(jsonStr);

    return { status: 'ok' };
  } catch (e) {
    return { status: 'error', message: String(e) };
  } finally {
    lock.releaseLock();
  }
}

// ── 불러오기 ──
function loadData() {
  try {
    // 1차: 캐시에서 읽기
    var cache = CacheService.getScriptCache();
    var cached = cache.get(CACHE_KEY);
    if (cached) {
      return { status: 'ok', payload: JSON.parse(cached) };
    }

    // 2차: Drive에서 읽기
    var fileId = getDataFileId();
    var content = DriveApp.getFileById(fileId).getBlob().getDataAsString();
    var payload = JSON.parse(content || '{}');

    // 캐시에 저장 (100KB 이하만)
    var jsonStr = JSON.stringify(payload);
    if (jsonStr.length <= 100000) {
      try {
        cache.put(CACHE_KEY, jsonStr, CACHE_TTL);
      } catch (e) { }
    }

    return { status: 'ok', payload: payload };
  } catch (e) {
    return { status: 'error', message: String(e) };
  }
}

// ── 자동 백업 (10분 쿨다운) ──
function _backupDataIfNeeded(content) {
  try {
    var props = PropertiesService.getScriptProperties();
    var lastBackup = parseInt(props.getProperty('backup_ts') || '0');
    var now = new Date().getTime();
    if (now - lastBackup < 600000) return;

    if (!content || content === '{}') return;

    var folder = getOrCreateFolder(DriveApp.getRootFolder(), 'gym');
    var backupName = 'gorilla_data_backup.json';
    var backupFiles = folder.getFilesByName(backupName);
    if (backupFiles.hasNext()) {
      backupFiles.next().setContent(content);
    } else {
      folder.createFile(backupName, content, MimeType.PLAIN_TEXT);
    }
    props.setProperty('backup_ts', String(now));
  } catch (e) {
    console.warn('_backupDataIfNeeded fail (ignored):', e);
  }
}
