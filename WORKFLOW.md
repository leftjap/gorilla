# WORKFLOW.md — 운동 기록 앱 작업 가이드

## 프로젝트 경로

```
C:\Users\leftj\Documents\바이브 코딩\workout\
```

모든 파일 경로는 이 디렉토리 기준이다.

---

## 이 문서의 용도

이 문서는 AI가 코드 수정 요청을 받았을 때 따라야 하는 규칙이다.

**작업 흐름 요약**

1. 사용자가 이 문서 + 필요한 파일들을 업로드하고 수정 요청을 보낸다.
2. AI는 이 문서를 읽고 요청을 분석한다.
3. AI는 업로드된 파일들을 참조하거나 추가 파일 업로드를 요청한다.
4. AI는 **방향 확인서**를 출력한다 (해결 방향 + 영향 범위 요약).
5. 사용자가 방향을 승인하거나 수정을 요청한다.
6. 사용자가 승인하면, AI는 영향 범위 분석을 수행하고 작업지시서를 출력한다.
7. 사용자가 작업지시서를 VS Code 에이전트에 복사해서 실행한다.

---

## 0. 작업 흐름

### 프로토콜

AI는 사용자의 요청을 받으면, 먼저 **트랙 A(즉시 진행)** 또는 **트랙 B(방향 확인)** 중 어느 쪽인지 판단한다.

#### 트랙 A — 즉시 진행
**조건 (모두 충족해야 한다):**
- 요청이 명확하다
- 해법이 하나뿐이다
- 영향 범위가 좁다 (1~2개 파일)

**흐름:** 요청 분석 → 바로 작업지시서 출력

#### 트랙 B — 방향 확인 후 진행
**조건 (하나라도 해당하면 트랙 B):**
- 해법이 여러 개이고 선택이 필요하다
- 영향 범위가 넓다 (3개 이상 파일)
- 기존 동작이 바뀔 수 있어서 의도 확인이 필요하다

**흐름:** 요청 분석 → 방향 확인서 출력 → 승인 → 작업지시서 출력

판단이 애매하면 트랙 B를 선택한다.

---

## 1. 작업 유형 판별

**기능 추가** — 새로운 기능을 만든다.
**버그 수정** — 기존 기능이 의도대로 동작하지 않는 것을 고친다.
**정리(리팩토링)** — 동작을 바꾸지 않고 코드 구조를 개선한다.

---

## 2. 작업지시서 출력 규칙

### 형식

각 Step에 파일, 위치, 작업(구체적 코드 포함), 완료 확인을 명시한다.
한 Step에 한 파일, 한 가지 변경만 한다.

### WORKFLOW.md 갱신 규칙

코드 변경으로 아래가 바뀌면 WORKFLOW.md 갱신 Step을 포함한다:
- 7번(파일별 상세 맵): 함수/상수 추가·삭제·이름 변경
- 8번(전역 상태 변수): 추가·삭제
- 9번(핵심 함수 호출 체인): 흐름 변경
- 10번(데이터 스키마): 필드 변경
- 6번(파일 구조): 새 파일 추가

### 커밋 규칙

모든 작업지시서의 마지막 Step에 커밋을 포함한다.
- 커밋 메시지 형식: `[작업유형]: [변경 요약]`
- 작업유형: feat / fix / chore / refactor

---

## 3. 기능 추가 시 규칙

- 새 함수를 만들기 전에 기존 함수 중 같은 일을 하는 것이 있는지 확인한다.
- 새 CSS 규칙을 추가할 때, 같은 선택자가 이미 존재하는지 먼저 검색한다.
- `!important`는 사용하지 않는다.

---

## 4. 버그 수정 시 규칙

- 수정 전에 원인을 먼저 설명한다.
- 새 규칙을 추가해서 덮어쓰는 방식으로 고치지 않는다. 원래 잘못된 코드를 직접 수정한다.

---

## 5. 절대 건드리지 않는 파일

- `workout.html` — 초기 시안 파일. 참고용.
- `workout_기획서.md` — 기획 문서. 참고용.

---

## 6. 파일 구조

```
index.html        — DOM 구조, 화면 레이아웃
style.css          — 전체 스타일 (모바일 우선, 추후 반응형)
js/storage.js      — LocalStorage, 상수, 유틸, 종목 마스터 데이터
js/data.js         — 세션/PR/인바디 CRUD, 통계 함수, 칼로리 추정
js/ui.js           — 화면 전환, 대시보드, 캘린더, 히스토리 렌더링
js/workout.js      — 운동 진행 화면 (부위 선택, 세트 입력, 타이머, PR 감지)
js/stats.js        — 통계 차트, 인바디 기록 UI
js/app.js          — 초기화, 진입점
WORKFLOW.md        — AI 작업 가이드 (이 파일)
```

---

## 7. 파일별 상세 맵

### js/storage.js
**역할:** 앱의 기반 유틸리티. 다른 모든 JS보다 먼저 로드된다.

**전역 상수:**
- `K` — LocalStorage 키 객체 (sessions, prs, inbody, settings)
- `BODY_PARTS` — 부위 그룹 배열 [{id, name, color, bg}, ...] (chest, back, lower, shoulder, daily, interval)
- `EQUIPMENT` — 장비 타입 객체 {barbell, dumbbell, machine, cable, bodyweight, cardio}
- `EXERCISES` — 종목 마스터 배열 [{id, name, bodyPart, equipment, defaultSets, defaultReps, defaultRestSec, met, sortOrder}, ...]

**유틸 함수:**
- `L(key)` / `S(key, val)` — LocalStorage 읽기/쓰기
- `today()`, `getLocalYMD(date)`, `getWeekStartDate()` — 날짜 유틸
- `formatDuration(min)`, `formatDate(dateStr)`, `getYM(dateStr)` — 날짜 포맷
- `formatNum(n)` — 숫자 포맷 (천단위 콤마)
- `genId()` — 고유 ID 생성

**종목 조회:**
- `getExercise(id)` — ID로 종목 조회
- `getExercisesByPart(partId)` — 부위별 종목 목록 (sortOrder 정렬)
- `getBodyPart(id)` — 부위 정보 조회

### js/data.js
**역할:** 세션/PR/인바디 CRUD + 통계 함수.

**세션 CRUD:**
- `getSessions()`, `saveSessions(arr)` — 전체 세션 읽기/쓰기
- `getSession(id)` — 단일 세션 조회
- `saveSession(session)` — 세션 저장 (신규/업데이트)
- `deleteSession(id)` — 세션 삭제

**PR 관리:**
- `getPRs()`, `savePRs(obj)` — PR 데이터 읽기/쓰기
- `checkPR(exerciseId, weight, reps)` — PR 여부 판정 + 갱신. 반환: {isPR, prevBest}
- `getExercisePRs(exerciseId)` — 종목별 PR 히스토리
- `getRecentPRs(count)` — 최근 PR 목록

**인바디:**
- `getInbodyRecords()`, `saveInbodyRecords(arr)` — 인바디 읽기/쓰기
- `addInbodyRecord(record)` — 인바디 기록 추가
- `getLatestWeight()` — 최신 체중 (칼로리 계산용)

**통계:**
- `getWeekSummary()` — 이번 주 요약 {count, volume, duration, calories}
- `getMonthSummary(ym)` — 월간 요약
- `getStreak()` — 연속 운동 일수
- `getSessionsByMonth(ym)` — 월별 세션 목록
- `estimateCalories(session)` — MET 기반 칼로리 추정

### js/ui.js
**역할:** 화면 전환, 대시보드 렌더링, 캘린더.

**화면 전환:**
- `showScreen(screenId)` — 화면 전환 ('home'|'workout'|'stats')
- `activeScreen` — 현재 화면 ID

**대시보드:**
- `renderHome()` — 홈 화면 전체 렌더
- `renderWeekSummary()` — 이번 주 요약 카드
- `renderStreak()` — 스트릭 바
- `renderRecentPRs()` — 최근 PR 카드
- `renderCalendar(ym)` — 월간 캘린더 (부위 컬러 도트)
- `renderDayDetail(dateStr)` — 날짜 탭 시 세션 요약

**히스토리:**
- `renderHistory()` — 세션 히스토리 리스트

### js/workout.js
**역할:** 운동 진행 화면의 핵심 로직.

**전역 상태:**
- `_currentSession` — 진행 중인 세션 객체
- `_selectedParts` — 선택된 부위 ID 배열 (순서 유지)
- `_restTimer` — 휴식 타이머 {endTime, exerciseId, setIndex}
- `_workoutStartTime` — 운동 시작 시각 (Date.now())

**부위 선택:**
- `renderPartSelector()` — 부위 태그 선택 UI
- `togglePart(partId)` — 부위 선택/해제 토글
- `startWorkout()` — 선택 확정, 세션 생성, 타이머 시작

**종목/세트:**
- `renderExerciseCards()` — 종목 카드 전체 렌더
- `renderExerciseCard(exerciseId, index)` — 단일 종목 카드
- `renderSetRow(exerciseId, setIndex)` — 세트 행
- `toggleWarmup(exerciseId, setIndex)` — 워밍업 토글
- `completeSet(exerciseId, setIndex)` — 세트 완료 처리 → PR 감지 + 타이머 시작
- `addSet(exerciseId)` — 세트 추가
- `getLastSessionSets(exerciseId)` — 지난번 같은 종목 세트 데이터 조회

**타이머:**
- `startRestTimer(seconds)` — 휴식 타이머 시작 (Date.now + seconds)
- `renderRestTimer()` — 타이머 표시 업데이트 (requestAnimationFrame)
- `dismissRestTimer()` — 타이머 수동 종료

**완료:**
- `finishWorkout()` — 세션 저장, 완료 요약 표시
- `renderWorkoutSummary(session)` — 완료 요약 카드

### js/stats.js
**역할:** 통계 화면, 인바디 기록 UI.

**통계:**
- `renderStats()` — 통계 화면 전체 렌더
- `renderPeriodStats(period)` — 주간/월간 통계 카드 ('week'|'month')
- `renderVolumeChart()` — 볼륨 추이 미니 차트
- `renderCalorieChart()` — 칼로리 추이 미니 차트

**인바디:**
- `renderInbodySection()` — 인바디 섹션 렌더
- `renderInbodyChart()` — 인바디 시계열 그래프
- `openInbodyForm()` — 인바디 입력 폼 열기
- `saveInbodyForm()` — 인바디 입력 저장

### js/app.js
**역할:** 앱 초기화, 진입점.

**초기화:**
- `window.onload` → `init()`
- `init()` — 초기 렌더링, 이벤트 등록

---

## 8. 전역 상태 변수 목록

| 변수명 | 파일 | 역할 |
|---|---|---|
| activeScreen | ui.js | 현재 화면 ID |
| _currentSession | workout.js | 진행 중인 세션 객체 |
| _selectedParts | workout.js | 선택된 부위 ID 배열 |
| _restTimer | workout.js | 휴식 타이머 상태 |
| _workoutStartTime | workout.js | 운동 시작 시각 |

---

## 9. 핵심 함수 호출 체인

### 운동 시작 ~ 완료 흐름
```
showScreen('workout')
→ renderPartSelector()
→ [사용자가 부위 태그 탭] togglePart(partId)
→ startWorkout() → _currentSession 생성 + _workoutStartTime 기록
→ renderExerciseCards()
  → renderExerciseCard() × N
    → renderSetRow() × M (지난번 값 프리필)
→ [사용자가 세트 체크] completeSet(exerciseId, setIndex)
  → checkPR() → PR이면 인라인 표시
  → startRestTimer(seconds)
  → renderRestTimer() (requestAnimationFrame 루프)
→ [전종목 완료] finishWorkout()
  → estimateCalories(session)
  → saveSession(session)
  → renderWorkoutSummary(session)
```

### 홈 화면 렌더
```
showScreen('home')
→ renderHome()
  → renderWeekSummary() → getWeekSummary()
  → renderStreak() → getStreak()
  → renderRecentPRs() → getRecentPRs()
  → renderCalendar() → getSessionsByMonth()
```

---

## 10. 데이터 스키마

### 세션 로그 (K.sessions)
```
{ id, date, startTime, endTime,
  tags: ['lower', 'shoulder', 'daily', 'interval'],
  exercises: [
    { exerciseId, sortOrder, sets: [
      { weight, reps, done, isWarmup, isPR }
    ]}
  ],
  totalVolume, totalVolumeExWarmup,
  totalCalories, durationMin, memo }
```

### PR 기록 (K.prs)
```
{ "exerciseId": [
  { weight, reps, volume, estimated1RM, date, sessionId }
]}
```

### 인바디 기록 (K.inbody)
```
[{ id, date, weight, bodyFatPct, muscleMass, memo }]
```

---

## 11. 웹앱 제약사항

- **진동 불가** — iOS Safari Vibration API 미지원
- **백그라운드 타이머** — setInterval이 멈플 수 있음. Date.now() 기반으로 복귀 시 남은 시간 재계산
- **소리 제한** — 1차에서 소리 미포함

---

## 12. 자주 겪는 실수 체크리스트

- [ ] 종목 카드에서 지난번 값 프리필이 올바른 세션을 참조하는가?
- [ ] 워밍업 세트가 PR 판정과 볼륨 집계에서 제외되는가?
- [ ] 휴식 타이머가 Date.now() 기반인가? (setInterval만 의존하면 안 됨)
- [ ] 세트 체크 시 자동저장이 되는가? (앱 꺼져도 데이터 유지)
- [ ] 운동 완료 요약의 볼륨이 워밍업을 제외한 값인가?
- [ ] 캘린더 도트 색상이 부위 태그와 일치하는가?
- [ ] estimateCalories에서 최신 체중을 사용하는가?
