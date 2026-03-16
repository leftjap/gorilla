/* ═══ app.js — 초기화, 진입점 ═══ */

function init() {
  // 더미 데이터 초기화 (없으면)
  initDummyData();

  // 진행 중인 세션 복원 (있으면)
  restoreSession();

  // 초기 월 설정
  _currentYM = getYM();
  updateMonthTitle();

  // 메인 화면 표시 (로컬 데이터로 즉시)
  showScreen('home');

  // 서버 동기화 — silent 모드 (성공 시 토스트 없음, 실패 시 인라인 배너)
  syncFromServer(function(success) {
    if (success) {
      showScreen('home');
    }
  }, true);
}

window.onload = function() {
  init();
};
