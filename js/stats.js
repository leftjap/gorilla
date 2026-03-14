/* ═══ stats.js — 통계 화면, 인바디 기록 ═══ */

var _statsPeriod = 'week'; // 'week' | 'month'
var _inbodyFormMode = null; // 'add' | 'edit'

// ══ 통계 화면 전체 렌더 ══
function renderStats() {
  renderPeriodStats(_statsPeriod);
  renderHistory();
  renderInbodySection();
}

// ══ 기간별 통계 ══
function renderPeriodStats(period) {
  _statsPeriod = period;
  var el = document.getElementById('periodStats');
  if (!el) return;

  var data = period === 'week' ? getWeekSummary() : getMonthSummary();

  el.innerHTML =
    '<div class="period-tabs">' +
      '<button class="period-tab' + (period === 'week' ? ' active' : '') + '" onclick="renderPeriodStats(\'week\')">이번 주</button>' +
      '<button class="period-tab' + (period === 'month' ? ' active' : '') + '" onclick="renderPeriodStats(\'month\')">이번 달</button>' +
    '</div>' +
    '<div class="period-cards">' +
      '<div class="period-card">' +
        '<div class="period-card-num">' + data.count + '회</div>' +
        '<div class="period-card-label">운동 횟수</div>' +
      '</div>' +
      '<div class="period-card">' +
        '<div class="period-card-num">' + formatNum(data.volume) + '<small>kg</small></div>' +
        '<div class="period-card-label">총 볼륨</div>' +
      '</div>' +
      '<div class="period-card">' +
        '<div class="period-card-num">' + formatDuration(data.duration) + '</div>' +
        '<div class="period-card-label">운동 시간</div>' +
      '</div>' +
      '<div class="period-card">' +
        '<div class="period-card-num">' + formatNum(data.calories) + '<small>kcal</small></div>' +
        '<div class="period-card-label">소모 칼로리</div>' +
      '</div>' +
    '</div>';
}

// ══ 볼륨 차트 ══
function renderVolumeChart() {
  var el = document.getElementById('volumeChart');
  if (!el) return;

  // TODO: 2차에서 차트 라이브러리 추가
  el.innerHTML = '<div class="chart-placeholder">볼륨 추이 (준비 중)</div>';
}

// ══ 칼로리 차트 ══
function renderCalorieChart() {
  var el = document.getElementById('calorieChart');
  if (!el) return;

  // TODO: 2차에서 차트 라이브러리 추가
  el.innerHTML = '<div class="chart-placeholder">칼로리 추이 (준비 중)</div>';
}

// ══ 인바디 섹션 ══
function renderInbodySection() {
  var el = document.getElementById('inbodySection');
  if (!el) return;

  var records = getInbodyRecords();
  var latest = records.length > 0 ? records[records.length - 1] : null;

  var html =
    '<div class="inbody-header">' +
      '<span class="section-title">신체 기록</span>' +
      '<button class="inbody-add-btn" onclick="openInbodyForm()">+ 기록</button>' +
    '</div>';

  if (latest) {
    html +=
      '<div class="inbody-current">' +
        '<div class="inbody-item">' +
          '<div class="inbody-label">체중</div>' +
          '<div class="inbody-val">' + latest.weight + ' <small>kg</small></div>' +
        '</div>';

    if (latest.bodyFatPct) {
      html +=
        '<div class="inbody-item">' +
          '<div class="inbody-label">체지방률</div>' +
          '<div class="inbody-val">' + latest.bodyFatPct + ' <small>%</small></div>' +
        '</div>';
    }

    if (latest.muscleMass) {
      html +=
        '<div class="inbody-item">' +
          '<div class="inbody-label">근육량</div>' +
          '<div class="inbody-val">' + latest.muscleMass + ' <small>kg</small></div>' +
        '</div>';
    }

    html +=
        '<div class="inbody-item">' +
          '<div class="inbody-label">측정일</div>' +
          '<div class="inbody-val">' + formatDate(latest.date) + '</div>' +
        '</div>' +
      '</div>';
  } else {
    html += '<div class="inbody-empty">아직 기록이 없습니다</div>';
  }

  html +=
    '<div class="inbody-chart" id="inbodyChart"></div>' +
    '<div class="inbody-form" id="inbodyForm" style="display:none;"></div>';

  el.innerHTML = html;

  // 차트 초기화
  renderInbodyChart();
}

// ══ 인바디 차트 ══
function renderInbodyChart() {
  var el = document.getElementById('inbodyChart');
  if (!el) return;

  var records = getInbodyRecords();
  if (records.length === 0) {
    el.innerHTML = '';
    return;
  }

  // 최근 10개 기록 표시
  var recentRecords = records.slice(Math.max(0, records.length - 10));

  var html = '<div class="inbody-list">';
  for (var i = recentRecords.length - 1; i >= 0; i--) {
    var r = recentRecords[i];
    html +=
      '<div class="inbody-history-item">' +
        '<div class="inbody-history-date">' + formatDate(r.date) + '</div>' +
        '<div class="inbody-history-data">' +
          r.weight + 'kg';

    if (r.bodyFatPct) html += ' · ' + r.bodyFatPct + '%';
    if (r.muscleMass) html += ' · ' + r.muscleMass + 'kg';

    html +=
        '</div>' +
      '</div>';
  }
  html += '</div>';

  el.innerHTML = html;
}

// ══ 인바디 입력 폼 열기 ══
function openInbodyForm() {
  var el = document.getElementById('inbodyForm');
  if (!el) return;

  _inbodyFormMode = 'add';

  var html =
    '<div class="inbody-form-content">' +
      '<div class="form-title">신체 기록 추가</div>' +
      '<div class="form-group">' +
        '<label>측정일</label>' +
        '<input type="date" id="inbodyDate" value="' + today() + '">' +
      '</div>' +
      '<div class="form-group">' +
        '<label>체중 (kg) *</label>' +
        '<input type="number" id="inbodyWeight" placeholder="70.0" step="0.1">' +
      '</div>' +
      '<div class="form-group">' +
        '<label>체지방률 (%)</label>' +
        '<input type="number" id="inbodyFat" placeholder="20.0" step="0.1">' +
      '</div>' +
      '<div class="form-group">' +
        '<label>근육량 (kg)</label>' +
        '<input type="number" id="inbodyMuscle" placeholder="55.0" step="0.1">' +
      '</div>' +
      '<div class="form-group">' +
        '<label>메모</label>' +
        '<input type="text" id="inbodyMemo" placeholder="(선택사항)">' +
      '</div>' +
      '<div class="form-actions">' +
        '<button class="btn-cancel" onclick="closeInbodyForm()">취소</button>' +
        '<button class="btn-save" onclick="saveInbodyForm()">저장</button>' +
      '</div>' +
    '</div>';

  el.innerHTML = html;
  el.style.display = 'block';
  el.scrollIntoView({ behavior: 'smooth' });
}

// ══ 인바디 입력 저장 ══
function saveInbodyForm() {
  var weight = parseFloat(document.getElementById('inbodyWeight').value);
  var date = document.getElementById('inbodyDate').value;

  if (!weight || weight <= 0) {
    alert('체중을 입력하세요');
    return;
  }

  var record = {
    id: genId(),
    date: date || today(),
    weight: weight,
    bodyFatPct: parseFloat(document.getElementById('inbodyFat').value) || null,
    muscleMass: parseFloat(document.getElementById('inbodyMuscle').value) || null,
    memo: document.getElementById('inbodyMemo').value || ''
  };

  addInbodyRecord(record);
  closeInbodyForm();
  renderInbodySection();
}

function closeInbodyForm() {
  var el = document.getElementById('inbodyForm');
  if (el) {
    el.style.display = 'none';
    el.innerHTML = '';
  }
  _inbodyFormMode = null;
}
