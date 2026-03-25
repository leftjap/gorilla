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
  var restored = restoreSession();

  // 초기 월 설정
  _currentYM = getYM();
  updateMonthTitle();

  // 복원된 세션이 있으면 운동 화면, 없으면 홈 화면
  if (restored) {
    showScreen('workout', 'replace');
  } else {
    showScreen('home', 'replace');
  }

  // 서버 동기화 — silent 모드
  syncFromServer(function(success) {
    if (success) {
      // 운동 화면이면 renderHome 불필요
      var mainView = document.getElementById('main-view');
      if (mainView && mainView.style.display !== 'none') {
        renderHome();
      }
    }
    hideLoadingScreen();
  }, true);
}

// ══ 탭 비활성화/종료 시 세션 즉시 저장 ══
document.addEventListener('visibilitychange', function() {
  if (document.visibilityState === 'hidden') {
    if (typeof _currentSession !== 'undefined' && _currentSession && !_isFinishing) {
      autoSaveSession();
    }
  }
});

window.addEventListener('beforeunload', function() {
  if (typeof _currentSession !== 'undefined' && _currentSession && !_isFinishing) {
    autoSaveSession();
  }
});

window.onload = function() {
  init();
};
