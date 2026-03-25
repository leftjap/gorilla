# AGENTS.md — 운동 기록 앱 작업 가이드

> **공통 규칙**: AI의 응답은 간결한 경어체로 작성합니다.

## 이 문서의 용도

이 문서는 AI가 코드 수정 요청을 받았을 때 따라야 하는 규칙이다.

**작업 흐름 요약**

1. 사용자가 이 문서를 업로드하고 수정 요청을 보낸다.
2. AI는 이 문서를 읽고 요청을 분석한다.
3. AI는 파일 구조(6번)에서 관련 파일을 특정한 뒤, GitHub raw URL로 직접 크롤링한다. 크롤링 불가 조건(17번 참조)에 해당하면 사용자에게 추가 파일을 요청한다.
4. AI는 **방향 확인서**를 출력한다 (트랙 B일 때만).
5. 사용자가 승인하면 AI는 **작업지시서**를 출력한다.
6. 사용자가 작업지시서를 VS Code 에이전트에 복사해서 실행한다.

---

## 0. 작업 흐름

### 트랙 A — 즉시 진행

**조건 (모두 충족):**
- 요청이 명확하다 (무엇을 어떻게 바꿀지 특정 가능)
- 해법이 하나뿐이다
- 영향 범위가 좁다 (1~2개 파일, 고위험 함수 미포함)

**흐름:** 요청 분석 → 필요 파일 크롤링 → 영향 범위 분석 → **바로 작업지시서 출력**

---

### 트랙 B — 방향 확인 후 진행

**조건 (하나라도 해당):**
- 해법이 여러 개이고 선택이 필요하다
- 영향 범위가 넓다 (3개 이상 파일, 고위험 함수 포함)
- 기존 동작이 바뀔 수 있어서 의도 확인이 필요하다

**흐름:** 요청 분석 → 필요 파일 크롤링 → **방향 확인서 출력** → 승인 후 **작업지시서 출력**

---

### 트랙 판단 규칙

- 매 요청마다 트랙을 판단하고 `[트랙 A]` 또는 `[트랙 B]`를 표기한다.
- 판단이 애매하면 트랙 B를 선택한다.
- 사용자가 "바로 만들어" 등 즉시 진행을 명시하면 트랙 A로 전환한다.

---

### 방향 확인서 형식 (트랙 B에서만 사용)

```
## 방향 확인: [요청 요약]

### 요청 이해
- [1~3문장 정리]

### 원인 분석 (버그 수정일 때만)
- [어디서 어떤 값이 적용되어서 이런 결과가 나오는지]

### 해결 방향
- [어떤 파일의 어떤 함수를 어떻게 바꿀 것인지]

### 영향 범위
- [영향 받는 전역 변수, 함수]

### 대안 (있을 경우)
- [다른 접근법 장단점]
```

---

### 파일 업로드 요청 기준

| 작업 유형 | 필요 파일 | 추가 확인 가능 |
|---|---|---|
| CSS만 변경 | style.css | — |
| JS 함수 수정 | 해당 JS | 호출 관계 파일 |
| 홈 화면 UI | ui.js + style.css | storage.js, data.js |
| 운동 화면 | workout.js + style.css | data.js |
| 데이터 스키마 | storage.js + data.js | workout.js, ui.js |
| 통계/인바디 | stats.js + style.css | data.js |
| 레이아웃/화면 전환 | style.css + ui.js | index.html |

---

## 1. 작업 유형 판별

**기능 추가** — 새로운 기능을 만든다.
**버그 수정** — 기존 기능이 의도대로 동작하지 않는 것을 고친다.
**정리(리팩토링)** — 동작을 바꾸지 않고 코드 구조를 개선한다.

---

## 2. 작업지시서 출력 규칙

### 형식

```
⚠️ 모든 Step을 빠짐없이 순서대로 실행하세요. 특히 마지막 커밋 Step을 절대 생략하지 마세요.

## 프로젝트 경로 (모든 Step에서 이 절대 경로를 사용하세요)
- 프로젝트: C:\dev\apps\gym\

모든 파일은 이미 존재합니다. 새로 만들지 마세요.

## 작업지시서: [기능명 또는 수정 대상]
작업 유형: [기능 추가 / 버그 수정 / 정리]

### 영향 범위 분석
- 영향 받는 전역 변수: [목록]
- 영향 받는 함수: [목록]
- 고위험 함수 수정 여부: [있음/없음]

### Step 1
- 파일: [절대 경로]
- 위치: [함수명]
- 작업: [정확히 무엇을 추가/수정/삭제하는지]
- 교체 코드: [함수 전체 코드]
- 영향 받는 함수: [이 변경으로 동작이 달라질 수 있는 다른 함수]
- 영향 받는 전역 상태: [이 변경이 읽거나 쓰는 전역 변수]
- 완료 확인: [이 단계가 끝나면 어떤 상태여야 하는지]

### Step N-1 — playbook.md 갱신
- 파일: C:\dev\playbook\playbook.md
- [백로그 상태 변경 내용]

### Step N — 커밋 & 푸시
cd "C:\dev\apps\gym"
git add -A
git commit -m "[타입]: [요약]"
git push origin main

⛔ 여기서 작업을 종료하세요.

### 최종 확인 (사용자 수동)
- [확인할 동작]
```

### 파일 경로 규칙

프로젝트 루트: `C:\dev\apps\gym\`
- 모든 Step에서 절대 경로 사용. 상대 경로 금지.

### Haiku를 위한 코드 제공 규칙

- **함수 수정 시**: 함수 전체를 교체 코드로 제공. 부분 비교 방식 금지.
- **CSS 수정 시**: 선택자 블록 전체를 교체 코드로 제공.
- **새 코드 추가 시**: 삽입 위치를 "어떤 함수/선택자 바로 아래"로 명시.
- 한 Step에 한 파일, 한 가지 변경만.
- "적절히 추가해줘" 같은 모호한 표현 금지.

### AGENTS.md 갱신 규칙

코드 변경으로 아래가 바뀌면 AGENTS.md 갱신 Step을 포함한다:
- 6번(파일 구조): 새 파일 추가 시
- 수정 금지 파일(5번) 변경 시

**갱신하지 않는 경우:** CSS만 변경, 함수 내부 로직만 수정하고 인터페이스 동일한 경우.

### 작업 실패 시 AGENTS.md 처리

사용자가 실패/미해결 보고 시, 직전 AGENTS.md 갱신이 유효한지 확인하고 필요 시 되돌린다.

### playbook.md 갱신 규칙

모든 작업지시서의 커밋 Step 직전에 playbook.md 갱신 Step을 포함한다.
- 파일: `C:\dev\playbook\playbook.md`
- 갱신 대상: 백로그 표에서 해당 작업의 상태 변경
- 별도 커밋:
  ```
  cd "C:\dev\playbook"
  git add playbook.md
  git commit -m "update: playbook.md [변경 요약]"
  git push origin main
  ```
- 불필요한 경우: CSS만 변경, 오타 수정 등 백로그에 등록된 작업이 아닌 사소한 수정

### 파일 내용 일괄 치환 규칙

- 사용: VS Code Ctrl+H 또는 PowerShell `(Get-Content) -replace`
- 금지: `sed`, `tr` 등 Unix 도구 (Windows 환경에서 한글 인코딩·백슬래시 문제)
- PowerShell 치환 시 `[regex]::Escape()` 필수

### AI 응답 규칙

- 작업 규모를 부풀리지 않는다. 한 번에 할 수 있으면 묻지 않고 한 번에 한다.
- 선택지를 나열하는 것으로 끝내지 않는다. AI의 추천을 반드시 붙이고 근거를 밝힌다.
- 확신 수준을 구분한다: "확실합니다" / "높은 확률이지만 검증 필요" / "추측입니다".
- 코드 작업에서 사용자의 접근에 문제가 보이면 근거와 함께 지적한다.

### 커밋 & 푸시 규칙

모든 작업지시서의 마지막 Step에 커밋과 푸시를 포함한다. 푸시까지 완료해야 작업이 끝난다.
- 커밋 메시지 형식: `[타입]: [요약]` (feat/fix/chore/refactor)

---

## 3. 기능 추가 시 규칙

- 새 함수를 만들기 전에 기존 파일에서 같은 일을 하는 함수가 있는지 크롤링으로 확인한다.
- 새 CSS 규칙 추가 시 같은 선택자가 이미 존재하는지 검색한다.
- `!important`는 사용하지 않는다.

---

## 4. 버그 수정 시 규칙

- 수정 전에 원인을 먼저 설명한다.
- 새 규칙을 추가해서 덮어쓰는 방식으로 고치지 않는다. 원래 잘못된 코드를 직접 수정한다.

---

## 5. 절대 건드리지 않는 파일

- `workout.html` — 초기 시안. 참고용.
- `workout_기획서.md` — 초기 기획 문서. 동결.
- `INSTRUCTIONS.md` — 폐기됨. git log로 대체.

---

## 6. 파일 구조 (주의사항 포함)

```
index.html        — DOM 구조, 화면 레이아웃
style.css          — 전체 스타일 (모바일 우선). ⚠️ !important 절대 금지
js/storage.js      — LocalStorage, 상수(K,BODY_PARTS,EQUIPMENT,EXERCISES), 유틸, 종목 마스터.
                     ⚠️ migrateData()는 wk_migrated_v2 플래그로 1회만 실행
js/data.js         — 세션/PR/인바디 CRUD + 통계 함수.
                     ⚠️ checkPR()은 PR 갱신까지 수행 — 호출 시 부작용 주의
                     ⚠️ estimateCalories()는 getLatestWeight() 의존 (기본값 70)
js/ui.js           — 화면 전환(showScreen), 대시보드, 캘린더, 히스토리.
                     ⚠️ showScreen()은 History API pushState/replaceState 연동 — 잘못 호출 시 뒤로가기 깨짐
                     ⚠️ _selectedWeekDate가 null이면 최신 세션 날짜로 폴백
                     ⚠️ renderWeekCal()은 터치 이벤트 직접 바인딩 — onclick 사용 금지 (§15 참조)
js/workout.js      — 운동 진행 화면 (부위 선택, 세트 입력, 타이머, PR 감지).
                     ⚠️ completeSet()이 checkPR()+startRestTimer()+autoSaveSession() 연쇄 호출
                     ⚠️ _currentSession은 운동 중 전체 상태 — null 체크 필수
                     ⚠️ syncExercisesWithSettings()는 설정→운동 복귀 시만 호출 (기록 있는 종목 보존)
                     ⚠️ bodyweight/cardio 종목은 weight 처리가 다름 — renderSetRow, completeSet 분기 확인
js/stats.js        — 통계 차트, 인바디 기록 UI.
                     ⚠️ renderStatsMonthCal()은 터치 이벤트 직접 바인딩 (§15 참조)
js/settings.js     — 설정 화면, 종목 관리 (추가/삭제/숨김).
                     ⚠️ goBackFromSettings()는 _settingsReturnTo에 따라 분기 ('workout' 또는 'home')
js/sync.js         — GAS 서버 동기화.
                     ⚠️ syncToServer는 finishWorkout()에서 자동 호출
                     ⚠️ syncFromServer는 init()에서 자동 호출
                     ⚠️ _syncInProgress로 중복 호출 방지 — 플래그 해제 누락 시 동기화 영구 차단
js/swipe-back.js   — iOS 스타일 스와이프 뒤로가기.
                     ⚠️ EDGE_WIDTH=30, THRESHOLD=0.35 — 운동 요약 화면에서는 비활성
js/app.js          — 초기화(init), 진입점. window.onload에서 init() 호출
manifest.json      — PWA 매니페스트
icon.jpg           — 앱 아이콘
AGENTS.md          — AI 작업 가이드 (이 파일)
gas/Code.js        — 운동앱 전용 GAS 서버
```

---

## 7. 고위험 함수 목록

아래 함수를 수정할 때는 트랙 B를 적용하고 영향 범위를 반드시 분석한다:
- `showScreen()` — 화면 전환 + History API 연동
- `renderExerciseCards()` — 종목 카드 전체 렌더 + 이벤트 바인딩
- `completeSet()` — PR 감지 + 타이머 + 자동저장 연쇄
- `finishWorkout()` — 세션 저장 + 동기화 + 요약 렌더
- `init()` — 마이그레이션 + 동기화 + 복원 + 첫 렌더

---

## 8. 모바일 고려사항

- iOS Safari는 Vibration API를 지원하지 않는다.
- setInterval은 백그라운드에서 멈춘다. Date.now() 기반으로 경과 시간을 계산한다.
- 터치 이벤트 핸들러에서 불필요한 리렌더를 방지한다 (1프레임 1렌더 원칙).

---

## 9. 코드 비대화 방지

80줄 이상의 함수는 분리를 검토한다. 중복 코드보다 기존 함수 재사용을 우선한다.
CSS는 기존 선택자를 확인하고 중복 방지한다. "쓰고 버리는 코드"를 쓰지 않는다.

---

## 10. 실수 체크리스트

- 세트 완료 시 볼륨이 정확히 계산되는가?
- PR 판정이 정확한가?
- Date.now() 기반 타이머인가? (setInterval 의존 금지)
- 세션이 정상 저장되는가? (빈 세트 포함 여부 확인)
- 화면 전환 후 뒤로가기가 정상인가?
- 유산소/맨몸 종목 분기가 정상인가?
- estimateCalories에 체중이 반영되는가?
- showScreen 호출 시 historyAction이 올바른가?

---

## 11. 영향 범위 분석 규칙

1. 수정 대상 파일을 변경하면 다른 파일의 어떤 함수가 영향받는지 분석한다.
2. 전역 상태를 변경하면 해당 상태를 읽는 모든 함수를 확인한다.
3. showScreen, renderHome, renderExerciseCards 등 고위험 함수 수정 시 전체 흐름 테스트를 요구한다.

---

## 12. 문서 참조 규칙

| 파일 | 용도 | 참조 방법 |
|---|---|---|
| AGENTS.md | AI 작업 규칙 | 항상 첫 번째로 읽음 |
| workout_기획서.md | 초기 기획 | 동결. 참조만 가능 |
| INSTRUCTIONS.md | 폐기됨 | git log로 대체 |

- `workout_기획서.md`와 `INSTRUCTIONS.md`는 수정 Step에 포함하지 않는다.

---

## 13. 제스처/터치 구현 규칙

**배경**: onclick 이벤트를 사용하면 iOS Safari에서 300ms 딜레이가 발생하고, 롱프레스와 충돌한다.

**규칙:**
- 캘린더·목록 등 터치 인터랙션이 필요한 곳은 `touchstart/touchend` 직접 바인딩
- `onclick` 사용 금지 (캘린더, 종목 네비 등)
- DOM을 다시 그리면(innerHTML 교체) 이벤트가 소실됨 — **리렌더 시 이벤트 재바인딩 필수**
- `touchmove` 10px 이상이면 탭 취소
- 롱프레스: `touchstart` 600ms 타이머, `touchend`에서 취소

**영향 받는 함수:**
- `renderWeekCal()` — 주간 캘린더 터치
- `selectWeekDate()` — 리렌더 시 이벤트 재바인딩
- `renderStatsMonthCal()` — 통계 캘린더 터치
- `selectStatsDate()` → `renderStatsWorkoutCard()`만 재렌더 (전체 리렌더 금지)
- `renderExerciseNav()` — 종목 네비 롱프레스

---

## 14. 더미데이터 + 서버 정리 이력

`initDummyData()`는 비활성화됨. GAS `syncFromServer()`로 서버 데이터를 사용한다.
1회성 정리(`wk_server_cleaned_v1`)가 완료된 상태.

**주의:**
- `syncFromServer()`의 날짜 비교는 `>=`가 아닌 `>`
- `syncToServer()`에서 `saveLastSyncTime()` 호출 순서 변경 금지

---

## 15. 소스 참조 프로토콜

### URL

| 항목 | 값 |
|---|---|
| 배포 URL | `https://leftjap.github.io/gym/` |
| GitHub raw base | `https://raw.githubusercontent.com/leftjap/gym/main/` |

### AI 크롤링 규칙

1. AGENTS.md(이 문서)를 먼저 읽는다.
2. 파일 구조(6번)에서 관련 파일을 특정한다.
3. GitHub raw URL로 크롤링한다.
   - JS, CSS, MD, HTML만 크롤링 가능
   - `github.com/blob` URL은 GitHub UI HTML이므로 사용하지 않는다
   - 5줄 이상의 코드를 인용할 때는 "출처: [파일명]" 표기

### 크롤링 불가 항목 (사용자에게 요청)

- JS 런타임 변수값, LocalStorage 실제 데이터
- DOM computed style, display 상태
- GAS 서버 응답, 네트워크 상태
- iOS Safari 실기기 동작
- 사용자 입력/조작 결과

### 컨텍스트 압축(Compaction) 대응

대화가 길어져 압축이 발생하면:
- AGENTS.md(이 문서)의 규칙을 GitHub raw에서 다시 크롤링한다.
- 작업 중이던 파일의 관련 부분을 GitHub raw URL로 1회 재확인한다.
- 4줄 이상의 이전 코드를 기억에서 인용하지 않는다. 반드시 재크롤링한다.

### 디버깅 프로토콜

**1단계 — AI 분석 (코드만):**
AGENTS.md + 관련 파일 크롤링으로 원인 분석. 확인 불가 항목은 2단계로.

**2단계 — 사용자 콘솔 확인 (필요 시):**
구체적인 콘솔 명령어를 제공하고 결과를 받아 분석.
- "확인해 주세요"만 쓰지 않는다. 정확한 명령어와 기대 결과를 제시한다.

**3단계 — 수정 (확인 후):**
1단계와 2단계 결과를 기반으로 작업지시서를 출력한다.
