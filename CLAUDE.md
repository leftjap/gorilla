# CLAUDE.md — gym

> 공통 실행 규칙은 playbook CLAUDE.md 참조.
> 이 파일은 gym 고유 주의사항만 담는다.

## gym 고유 주의
- gas/Code.js 수정 후 반드시 clasp push + 웹앱 재배포
- 캘린더 터치 핸들러: 짧은 탭 시 부모 DOM 교체 금지 — CSS 클래스 전환만 (롱프레스 타이머 보존)
- syncFromServer 타임스탬프 비교는 '>' 엄격. 같으면 서버가 덮지 않는다
- 휴식 타이머는 requestAnimationFrame + Date.now() 기반. setInterval 단독 금지
- js/workout.js는 크롤링하지 말고 사용자 업로드를 기다린다
