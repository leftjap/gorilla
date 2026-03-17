/* ═══ app.js — 초기화, 진입점 ═══ */

function hideLoadingScreen() {
  var loading = document.getElementById('loadingScreen');
  if (!loading) return;
  loading.classList.add('fade-out');
  setTimeout(function() {
    loading.style.display = 'none';
  }, 500);
}

function init() {
  // 데이터 마이그레이션 (부위/종목 ID 변환, 1회만 실행)
  migrateData();

  // 진행 중인 세션 복원 (있으면)
  restoreSession();

  // 초기 월 설정
  _currentYM = getYM();
  updateMonthTitle();

  // 메인 화면 표시 (로컬 데이터로 즉시)
  showScreen('home');

  // 서버 더미 데이터 정리 (1회만 실행)
  var serverCleaned = L('wk_server_cleaned_v1');
  if (!serverCleaned) {
    syncToServer(function(success) {
      if (success) {
        S('wk_server_cleaned_v1', true);
      }
      hideLoadingScreen();
    }, true);
    return;
  }

  // 서버 동기화 — silent 모드
  syncFromServer(function(success) {
    if (success) {
      renderHome();
    }
    hideLoadingScreen();
  }, true);
}

window.onload = function() {
  init();
};
