# GAS 캐시 적용 배포 가이드

## 개요
Google Apps Script (GAS) 서버에 **CacheService**를 적용하여 성능을 최적화합니다.

### 성능 개선
| 항목 | 기존 | 캐시 적용 |
|------|------|---------|
| **load (캐시 히트)** | 400~1200ms | 50~100ms |
| **load (캐시 미스)** | 400~1200ms | 400~1200ms (이후 캐싱) |
| **save** | 600~1500ms | 600~1500ms (캐시 갱신 추가) |
| **Drive API 호출 (캐시 히트)** | 4회 | 0회 |
| **파일 탐색** | 매번 폴더+파일 탐색 | ID 캐싱으로 최소화 |

---

## 배포 단계

### Step 1: GAS 에디터 접근
1. [Google Apps Script 콘솔](https://script.google.com/) 열기
2. 기존 "Gym" 프로젝트 선택

### Step 2: 코드 교체
1. **Code.gs** 파일의 모든 내용 삭제
2. `GAS_Code_Cache_Applied.gs`의 내용을 **전체 복사**하여 Code.gs에 **전체 붙여넣기**
3. **저장** (Ctrl+S 또는 ⌘+S)

### Step 3: 배포
1. GAS 에디터 상단의 **"배포"** 버튼 클릭
2. **"배포 관리"** 클릭
3. **"새 버전 생성"** 버튼 클릭
4. **"배포"** 클릭

### Step 4: 확인
- 배포 URL이 변경되지 않았는지 확인
- 웹앱의 현재 URL이 클라이언트(gym 앱)에 설정된 URL과 동일한지 확인

---

## 주요 변경사항

### 1. **CacheService** 적용
```javascript
var CACHE_KEY = 'gym_payload';
var CACHE_TTL = 21600; // 6시간
```
- **loadData()**: 캐시 히트 시 Drive 호출 0회 (50~100ms)
- **saveData()**: 저장 후 캐시 자동 갱신

### 2. **파일 ID 캐싱** (PropertiesService)
```javascript
var FILE_ID_KEY = 'data_file_id';
```
- 폴더/파일 탐색을 최초 1회로 제한
- 이후는 ID로 직접 접근 (2회의 Drive 호출 절감)

### 3. **캐시 크기 제한 처리**
- CacheService 최대 용량: **100KB**
- 데이터 초과 시 캐시 삭제 후 Drive에서만 로드
- 폴백 메커니즘으로 안정성 보장

### 4. **자동 백업** (유지)
- 10분 쿨다운 적용
- save마다 실행되지 않음 (부하 감소)

---

## 검증 체크리스트

### 배포 후 확인
- [ ] GAS 배포가 성공했는가?
- [ ] 웹앱 URL이 동일한가? (클라이언트 설정 변경 불필요)
- [ ] Load 요청 시 응답 속도가 개선되었는가?

### 클라이언트 테스트
- [ ] 운동 데이터 **로드** 동작 (캐시 히트: 빠름)
- [ ] 운동 데이터 **저장** 동작
- [ ] 첫 로드 후 두 번째 로드 시 더 빠른가? (캐시 적용 확인)

---

## 주의사항

### 캐시 무효화
- GAS 배포 후 캐시는 자동으로 유지됨
- 만약 캐시를 강제로 초기화하려면:
  ```javascript
  function clearCache() {
    CacheService.getScriptCache().removeAll();
  }
  ```
  GAS 에디터 콘솔에서 `clearCache()` 실행

### 파일 ID 캐시 리셋
- gorilla_data.json 파일을 삭제 후 재생성한 경우:
  ```javascript
  function resetFileIdCache() {
    PropertiesService.getScriptProperties().deleteProperty('data_file_id');
  }
  ```
  GAS 에디터 콘솔에서 `resetFileIdCache()` 실행

---

## 성능 모니터링

### 콘솔 로그 추가 (선택사항)
캐시 히트/미스를 추적하려면 loadData() 내에 다음 추가:
```javascript
// 캐시 히트 로그
if (cached) {
  Logger.log('[CACHE HIT] Loaded from cache');
  return { status: 'ok', payload: JSON.parse(cached) };
}
// 캐시 미스 로그
Logger.log('[CACHE MISS] Loaded from Drive');
```

GAS 실행 로그 확인: **실행 로그** 패널

---

## 롤백 방법

이전 버전으로 롤백이 필요한 경우:
1. GAS 에디터 → **배포 관리**
2. 이전 버전 선택 → **배포**
