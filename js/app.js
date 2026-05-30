// ── K-School 앱 라우터 ──────────────────────────────────
let _currentPage = 'dashboard';

function navigate(page) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.sb-nav-item').forEach(n => n.classList.remove('active'));

  const pageEl = document.getElementById('page-' + page);
  if (pageEl) pageEl.classList.add('active');

  const navEl = document.querySelector(`.sb-nav-item[data-page="${page}"]`);
  if (navEl) navEl.classList.add('active');

  _currentPage = page;

  // 페이지별 렌더
  const renders = {
    dashboard:   renderDashboard,
    students:    renderStudents,
    curriculum:  renderCurriculum,
    professors:  renderProfessors,
    optimizer:   renderOptimizer,
    career:      renderCareer,
    analytics:   renderAnalytics,
    privacy:     renderPrivacy,
  };
  if (renders[page]) renders[page]();
}

// ══════════════════════════════════════
// 대시보드
// ══════════════════════════════════════
function renderDashboard() {
  const el = document.getElementById('page-dashboard');
  if (!el) return;

  // KPI
  document.getElementById('kpi-students').textContent  = '1,247';
  document.getElementById('kpi-accuracy').textContent  = '98.2%';
  document.getElementById('kpi-satisfaction').textContent = '87.2%';
  document.getElementById('kpi-utility').textContent   = '0.801';

  // 학제 타임라인
  renderTimeline();

  // 7단계 스텝
  renderSevenSteps();

  // AI 교수진
  renderProfGrid('prof-grid-dash', 5);
}

function renderTimeline() {
  const el = document.getElementById('school-timeline');
  if (!el) return;
  // 현재 활성 학제 — 예시로 '고등학교'
  const activeIdx = 3;
  el.innerHTML = SCHOOL_STAGES.map((s, i) => `
    <div class="tl-item ${i < activeIdx ? 'done' : i === activeIdx ? 'active' : ''}">
      <div class="tl-dot"></div>
      <div class="tl-label">${s.icon} ${s.label}</div>
      <div class="tl-age">${s.age}</div>
    </div>
  `).join('');
}

function renderSevenSteps() {
  const el = document.getElementById('seven-steps');
  if (!el) return;
  el.innerHTML = SEVEN_STAGES.map((s, i) => `
    <div class="step ${i < 4 ? 'done' : i === 4 ? 'active' : ''}" onclick="navigate('optimizer')">
      <div class="step-num">${i < 4 ? '✓' : s.n}</div>
      <div class="step-body">
        <div class="step-title">${s.icon} ${s.title}</div>
        <div class="step-desc">${s.desc}</div>
        ${i < 5 ? `<div class="step-meta">✓ ${s.metric}</div>` : ''}
      </div>
    </div>
  `).join('');
}

function renderProfGrid(elId, count) {
  const el = document.getElementById(elId);
  if (!el) return;
  const profs = AI_PROFESSORS.slice(0, count);
  el.innerHTML = profs.map(p => `
    <div class="prof-card" onclick="navigate('professors')">
      <div class="prof-icon">${p.icon}</div>
      <div class="prof-name">${p.name}</div>
      <div class="prof-spec">${p.spec}</div>
      <div class="prof-status"></div>
    </div>
  `).join('');
}

// ══════════════════════════════════════
// 학생 목록
// ══════════════════════════════════════
function renderStudents() {
  const el = document.getElementById('students-table-body');
  if (!el) return;

  const students = [
    { name:'김지아', age:16, stage:'고등학교', level:3, career:'AI 윤리 연구자', score:92, match:94 },
    { name:'이현우', age:11, stage:'초등학교', level:2, career:'생태학자',        score:88, match:91 },
    { name:'박서연', age:19, stage:'대학교',   level:4, career:'사회혁신가',       score:95, match:97 },
    { name:'최민준', age:14, stage:'중학교',   level:3, career:'양자컴퓨팅 연구자',score:90, match:93 },
    { name:'정유나', age:5,  stage:'유치원',   level:1, career:'(탐색 중)',         score:null, match:null },
    { name:'오다은', age:23, stage:'대학원',   level:5, career:'뇌-컴퓨터 인터페이스', score:97, match:98 },
  ];

  const stageColors = {
    '유치원':'badge-yellow', '초등학교':'badge-green', '중학교':'badge-blue',
    '고등학교':'badge-purple', '대학교':'badge-red', '대학원':'badge-green'
  };

  el.innerHTML = students.map((s, i) => `
    <tr onclick="openStudentModal(${i})" style="cursor:pointer">
      <td>
        <div style="display:flex;align-items:center;gap:10px">
          <div class="student-avatar" style="width:30px;height:30px;font-size:13px;background:${['#ff9800','#4caf50','#2196f3','#9c27b0','#f44336','#3ecf8e'][i]}22;border:1px solid ${['#ff9800','#4caf50','#2196f3','#9c27b0','#f44336','#3ecf8e'][i]}44">
            ${s.name[0]}
          </div>
          <span style="font-weight:600">${s.name}</span>
        </div>
      </td>
      <td class="td-mono">${s.age}세</td>
      <td><span class="badge ${stageColors[s.stage]}">${s.stage}</span></td>
      <td>
        <div style="display:flex;align-items:center;gap:8px">
          <div style="flex:1;height:4px;background:var(--sb-surface);border-radius:2px">
            <div style="width:${s.level/6*100}%;height:100%;background:var(--sb-green);border-radius:2px"></div>
          </div>
          <span class="td-mono">${s.level}/6</span>
        </div>
      </td>
      <td style="color:var(--sb-txt2);font-size:12px">${s.career}</td>
      <td>${s.score ? `<span style="font-weight:700;color:var(--sb-green)">${s.score}</span>` : '<span class="td-null">—</span>'}</td>
      <td>${s.match ? `<span class="badge badge-green">${s.match}%</span>` : '<span class="td-null">—</span>'}</td>
    </tr>
  `).join('');
}

// ══════════════════════════════════════
// 커리큘럼
// ══════════════════════════════════════
function renderCurriculum() {
  const el = document.getElementById('curriculum-panel');
  if (!el) return;

  el.innerHTML = `<div class="code-panel"><span class="code-cmt">-- K-School AI 개인 맞춤형 커리큘럼 (김지아, 16세, 고등학교 2학년)</span>
<span class="code-cmt">-- 진로 목표: AI 윤리 연구자 | 균형점 효용: 0.847</span>
<span class="code-cmt">-- 생성일: 2026-05-30 | 담당 AI: prof-10 (진로), prof-01 (사고), prof-08 (기술)</span>

<span class="code-kw">SELECT</span> subject, unit, week, difficulty, ai_professor
<span class="code-kw">FROM</span>   curriculum
<span class="code-kw">WHERE</span>  student_id = <span class="code-str">'김지아'</span>
  <span class="code-kw">AND</span>  semester   = <span class="code-str">'2026-2'</span>
<span class="code-kw">ORDER BY</span> priority <span class="code-kw">ASC</span>;

<span class="code-cmt">/*
  subject              unit                      week  diff  professor
  ─────────────────────────────────────────────────────────────────────
  철학·윤리학           AI 윤리의 기초             1-3   ★★★★  사고 교수
  수학 (통계)           확률론과 데이터 분석       1-4   ★★★   수리 교수
  AI·머신러닝           지도학습·비지도학습 원리   2-5   ★★★★  기술 교수
  영어·논문작성         학술 글쓰기와 발표         1-4   ★★★   언어 교수
  사회과학              AI가 사회에 미치는 영향    3-5   ★★★   사회 교수
  심리학 입문           인간 인지와 편향           4-6   ★★★   감성 교수
  프로젝트 (PBL)        AI 윤리 시뮬레이션 설계   5-8   ★★★★★ 진로 교수
  체육·건강             인지 능력 강화 신체활동   매주   ★★    체육 교수
*/</span></div>`;
}

// ══════════════════════════════════════
// AI 교수진
// ══════════════════════════════════════
function renderProfessors() {
  const el = document.getElementById('professors-grid');
  if (!el) return;

  el.innerHTML = AI_PROFESSORS.map(p => `
    <div class="card" style="cursor:pointer" onclick="openProfModal('${p.id}')">
      <div class="card-body" style="text-align:center">
        <div style="font-size:36px;margin-bottom:10px">${p.icon}</div>
        <div style="font-size:14px;font-weight:700;color:var(--sb-txt);margin-bottom:4px">${p.name}</div>
        <div style="font-size:11px;color:var(--sb-txt3);margin-bottom:12px">${p.spec}</div>
        <div style="display:flex;justify-content:center;gap:6px;flex-wrap:wrap">
          <span class="badge badge-green">활성</span>
          <span class="badge badge-gray">담당 ${Math.floor(Math.random()*80+50)}명</span>
        </div>
      </div>
      <div class="card-footer" style="display:flex;justify-content:space-between">
        <span>정확도</span>
        <span style="color:var(--sb-green);font-weight:700">${(Math.random()*3+96).toFixed(1)}%</span>
      </div>
    </div>
  `).join('');
}

// ══════════════════════════════════════
// 7단계 최적화
// ══════════════════════════════════════
function renderOptimizer() {
  const el = document.getElementById('optimizer-steps');
  if (!el) return;

  el.innerHTML = SEVEN_STAGES.map((s, i) => `
    <div class="step ${i < 4 ? 'done' : i === 4 ? 'active' : ''}">
      <div class="step-num">${i < 4 ? '✓' : s.n}</div>
      <div class="step-body">
        <div class="step-title">${s.icon} 단계 ${s.n}: ${s.title}</div>
        <div class="step-desc">${s.desc}</div>
        <div class="step-meta">${s.metric}</div>
      </div>
      <div style="margin-left:auto;flex-shrink:0">
        ${i < 4
          ? `<span class="badge badge-green">완료</span>`
          : i === 4
          ? `<span class="badge badge-blue">진행 중</span>`
          : `<span class="badge badge-gray">대기</span>`
        }
      </div>
    </div>
  `).join('');
}

// ══════════════════════════════════════
// 진로 예측
// ══════════════════════════════════════
function renderCareer() {
  const el = document.getElementById('career-bars');
  if (!el) return;

  const careers = [
    { label:'AI 윤리 연구자',    pct:94, color:'#3ecf8e' },
    { label:'사회혁신 디자이너', pct:87, color:'#2196f3' },
    { label:'인지과학자',        pct:81, color:'#9c27b0' },
    { label:'교육공학자',        pct:76, color:'#ff9800' },
    { label:'정책 분석가',       pct:71, color:'#f44336' },
  ];

  el.innerHTML = `<div class="progress-wrap">${careers.map(c => `
    <div class="progress-row">
      <span class="progress-label">${c.label}</span>
      <div class="progress-track">
        <div class="progress-fill" style="width:${c.pct}%;background:${c.color}"></div>
      </div>
      <span class="progress-val" style="color:${c.color}">${c.pct}%</span>
    </div>
  `).join('')}</div>`;
}

// ══════════════════════════════════════
// 분석
// ══════════════════════════════════════
function renderAnalytics() {
  const el = document.getElementById('analytics-panel');
  if (!el) return;

  const metrics = [
    { label:'학습 성취도 개선', val:'36.1%', trend:'↑ Khan Academy 대비 3배', up:true },
    { label:'진로 명확성 향상', val:'31.4%', trend:'↑ 기존 대비 3.2배',       up:true },
    { label:'프라이버시 보호',  val:'100%',  trend:'✓ 재식별 공격 완전 차단',   up:true },
    { label:'편향 보정 시간',   val:'0.00초', trend:'✓ 실시간 즉시 처리',        up:true },
    { label:'개인-사회 통합효용',val:'0.801', trend:'↑ 기존 0.520 대비 41.3%', up:true },
    { label:'만족도',           val:'87.2%', trend:'↑ 기존 64.9% 대비 34.3%', up:true },
  ];

  el.innerHTML = `<div class="grid grid-3" style="gap:12px">${metrics.map(m => `
    <div class="kpi">
      <div class="kpi-label">${m.label}</div>
      <div class="kpi-value">${m.val}</div>
      <div class="kpi-trend ${m.up?'up':'down'}">${m.trend}</div>
    </div>
  `).join('')}</div>`;
}

// ══════════════════════════════════════
// 프라이버시
// ══════════════════════════════════════
function renderPrivacy() {
  const el = document.getElementById('privacy-panel');
  if (!el) return;

  el.innerHTML = `
    <div class="grid grid-3" style="gap:12px;margin-bottom:20px">
      <div class="kpi">
        <div class="kpi-label">재식별 공격 저항률</div>
        <div class="kpi-value" style="color:var(--sb-green)">100%</div>
        <div class="kpi-trend up">100회 공격 시도 차단</div>
      </div>
      <div class="kpi">
        <div class="kpi-label">k-익명성 달성률</div>
        <div class="kpi-value" style="color:var(--sb-green)">97.8%</div>
        <div class="kpi-trend up">k≥5 기준</div>
      </div>
      <div class="kpi">
        <div class="kpi-label">차분 프라이버시 손실률</div>
        <div class="kpi-value" style="color:var(--sb-green)">0.001%</div>
        <div class="kpi-trend up">ε=1.0 수준</div>
      </div>
    </div>
    <div class="section-hd">EduCrypt 3단계 암호화</div>
    <div class="sb-table-wrap">
      <table class="sb-table">
        <thead><tr><th>단계</th><th>알고리즘</th><th>용도</th><th>상태</th></tr></thead>
        <tbody>
          <tr><td>1단계</td><td class="td-mono">AES-256-GCM</td><td>개인정보 암호화</td><td><span class="badge badge-green">활성</span></td></tr>
          <tr><td>2단계</td><td class="td-mono">Paillier 동형암호</td><td>연산 중 데이터 보호</td><td><span class="badge badge-green">활성</span></td></tr>
          <tr><td>3단계</td><td class="td-mono">RSA-OAEP</td><td>키 교환</td><td><span class="badge badge-green">활성</span></td></tr>
        </tbody>
      </table>
    </div>
  `;
}

// ══════════════════════════════════════
// 모달
// ══════════════════════════════════════
function openStudentModal(idx) {
  const students = ['김지아', '이현우', '박서연', '최민준', '정유나', '오다은'];
  const modal = document.getElementById('student-modal');
  const title = document.getElementById('student-modal-title');
  if (!modal || !title) return;
  title.textContent = students[idx] + ' — 학습 프로파일';
  modal.classList.add('open');
}

function openProfModal(id) {
  const prof = AI_PROFESSORS.find(p => p.id === id);
  if (!prof) return;
  const modal = document.getElementById('prof-modal');
  if (!modal) return;
  document.getElementById('prof-modal-title').textContent = prof.name + ' (' + prof.spec + ')';
  modal.classList.add('open');
}
