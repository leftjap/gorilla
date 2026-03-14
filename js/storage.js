/* ═══ storage.js — 상수, 유틸, 종목 마스터 ═══ */

// ── LocalStorage 키 ──
const K = {
  sessions: 'wk_sessions',
  prs: 'wk_prs',
  inbody: 'wk_inbody',
  settings: 'wk_settings'
};

// ── LocalStorage 읽기/쓰기 ──
function L(key) {
  try { return JSON.parse(localStorage.getItem(key)); }
  catch { return null; }
}
function S(key, val) {
  localStorage.setItem(key, JSON.stringify(val));
}

// ── 날짜 유틸 ──
function today() {
  return new Date().toISOString().slice(0, 10);
}

function getLocalYMD(date) {
  const d = date || new Date();
  return d.getFullYear() + '-' +
    String(d.getMonth() + 1).padStart(2, '0') + '-' +
    String(d.getDate()).padStart(2, '0');
}

function getWeekStartDate() {
  const now = new Date();
  const day = now.getDay();
  const diff = now.getDate() - day + (day === 0 ? -6 : 1);
  const mon = new Date(now);
  mon.setDate(diff);
  return getLocalYMD(mon);
}

function formatDuration(min) {
  if (min < 60) return min + '분';
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m > 0 ? h + '시간 ' + m + '분' : h + '시간';
}

function formatDate(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  const month = d.getMonth() + 1;
  const day = d.getDate();
  const weekday = ['일', '월', '화', '수', '목', '금', '토'][d.getDay()];
  return month + '월 ' + day + '일 (' + weekday + ')';
}

function formatDateShort(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  return (d.getMonth() + 1) + '/' + d.getDate();
}

function getYM(dateStr) {
  return dateStr ? dateStr.slice(0, 7) : today().slice(0, 7);
}

function getDaysInMonth(ym) {
  const [y, m] = ym.split('-').map(Number);
  return new Date(y, m, 0).getDate();
}

function getFirstDayOfMonth(ym) {
  const [y, m] = ym.split('-').map(Number);
  return new Date(y, m - 1, 1).getDay();
}

// ── 숫자 포맷 ──
function formatNum(n) {
  if (n == null) return '0';
  return Number(n).toLocaleString('ko-KR');
}

// ── ID 생성 ──
function genId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

// ── 부위 그룹 정의 ──
const BODY_PARTS = [
  { id: 'chest',    name: '가슴',    color: '#e87461', bg: '#fdf1ef' },
  { id: 'back',     name: '등',      color: '#4a90d9', bg: '#e8f0fe' },
  { id: 'lower',    name: '하체',    color: '#f0a848', bg: '#fef5e8' },
  { id: 'shoulder', name: '어깨',    color: '#8b5cf6', bg: '#f0ebfe' },
  { id: 'daily',    name: '데일리',  color: '#34c759', bg: '#e8f8ee' },
  { id: 'interval', name: '인터벌',  color: '#ff6b9d', bg: '#fee8f0' }
];

// ── 장비 타입 ──
const EQUIPMENT = {
  barbell: '바벨',
  dumbbell: '덤벨',
  machine: '머신',
  cable: '케이블',
  bodyweight: '맨몸',
  cardio: '유산소'
};

// ── 종목 마스터 데이터 ──
const EXERCISES = [
  // 가슴
  { id: 'incline_bench', name: '인클라인 벤치프레스', bodyPart: 'chest', equipment: 'barbell', defaultSets: 4, defaultReps: 8, defaultRestSec: 90, met: 5, sortOrder: 0 },

  // 등
  { id: 'lat_pulldown', name: '랫풀다운', bodyPart: 'back', equipment: 'cable', defaultSets: 3, defaultReps: 12, defaultRestSec: 90, met: 4, sortOrder: 0 },
  { id: 'seated_row', name: '시티드 로우', bodyPart: 'back', equipment: 'cable', defaultSets: 3, defaultReps: 12, defaultRestSec: 90, met: 4, sortOrder: 1 },
  { id: 'face_pull', name: '페이스 풀', bodyPart: 'back', equipment: 'cable', defaultSets: 3, defaultReps: 15, defaultRestSec: 60, met: 3, sortOrder: 2 },
  { id: 'barbell_row', name: '바벨 로우', bodyPart: 'back', equipment: 'barbell', defaultSets: 3, defaultReps: 10, defaultRestSec: 90, met: 5, sortOrder: 3 },
  { id: 'deadlift', name: '데드리프트', bodyPart: 'back', equipment: 'barbell', defaultSets: 3, defaultReps: 5, defaultRestSec: 120, met: 6, sortOrder: 4 },

  // 하체
  { id: 'leg_extension', name: '레그 익스텐션', bodyPart: 'lower', equipment: 'machine', defaultSets: 4, defaultReps: 12, defaultRestSec: 60, met: 4, sortOrder: 0 },
  { id: 'leg_curl', name: '레그 컬', bodyPart: 'lower', equipment: 'machine', defaultSets: 3, defaultReps: 12, defaultRestSec: 60, met: 4, sortOrder: 1 },
  { id: 'barbell_squat', name: '바벨 백 스쿼트', bodyPart: 'lower', equipment: 'barbell', defaultSets: 4, defaultReps: 5, defaultRestSec: 120, met: 6, sortOrder: 2 },
  { id: 'leg_press', name: '레그 프레스', bodyPart: 'lower', equipment: 'machine', defaultSets: 4, defaultReps: 10, defaultRestSec: 90, met: 5, sortOrder: 3 },

  // 어깨
  { id: 'ohp', name: '오버헤드 프레스', bodyPart: 'shoulder', equipment: 'barbell', defaultSets: 4, defaultReps: 8, defaultRestSec: 90, met: 5, sortOrder: 0 },
  { id: 'side_lateral', name: '사이드 레터럴 레이즈', bodyPart: 'shoulder', equipment: 'dumbbell', defaultSets: 3, defaultReps: 15, defaultRestSec: 60, met: 3, sortOrder: 1 },

  // 데일리
  { id: 'wrist_curl', name: '바벨 리스트 컬', bodyPart: 'daily', equipment: 'barbell', defaultSets: 3, defaultReps: 15, defaultRestSec: 45, met: 3, sortOrder: 0 },
  { id: 'situp', name: '싯업', bodyPart: 'daily', equipment: 'bodyweight', defaultSets: 3, defaultReps: 20, defaultRestSec: 45, met: 4, sortOrder: 1 },

  // 인터벌 (유산소 — reps 사용하지 않음, durationMin 별도 입력)
  { id: 'running', name: '러닝', bodyPart: 'interval', equipment: 'cardio', defaultSets: 1, defaultReps: 0, defaultRestSec: 0, met: 9, sortOrder: 0 }
];

// ── 종목 조회 헬퍼 ──
function getExercise(id) {
  return EXERCISES.find(function(e) { return e.id === id; });
}

function getExercisesByPart(partId) {
  return EXERCISES
    .filter(function(e) { return e.bodyPart === partId; })
    .sort(function(a, b) { return a.sortOrder - b.sortOrder; });
}

function getBodyPart(id) {
  return BODY_PARTS.find(function(p) { return p.id === id; });
}
