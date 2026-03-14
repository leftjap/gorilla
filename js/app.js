/* ═══ app.js — 초기화, 진입점 ═══ */

function init() {
  // 진행 중인 세션 복원 (있으면)
  restoreSession();

  // 홈 화면 렌더
  renderHome();

  // 탭바 초기 상태
  showScreen('home');
}

window.onload = function() {
  init();
};
