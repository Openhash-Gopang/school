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
    professor:   renderAIProfessor,
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

  document.getElementById('kpi-students').textContent     = '1,247';
  document.getElementById('kpi-accuracy').textContent     = '98.2%';
  document.getElementById('kpi-satisfaction').textContent = '87.2%';
  document.getElementById('kpi-utility').textContent      = '0.801';

  renderTimeline();
  renderSevenSteps();
  renderProfGrid('prof-grid-dash', 5);
  renderStageBars();
}

function renderStageBars() {
  const el = document.getElementById('stage-bars');
  if (!el) return;
  const data = [
    ['🌱 유치원',   48,  '#f59e0b', 312],
    ['📚 초등학교', 312, '#22c55e', 312],
    ['🔬 중학교',   286, '#3b82f6', 312],
    ['💡 고등학교', 298, '#8b5cf6', 312],
    ['🎓 대학교',   247, '#ef4444', 312],
    ['🏆 대학원',   56,  '#3ecf8e', 312],
  ];
  el.innerHTML = data.map(([label, n, color, max]) => `
    <div style="display:flex;align-items:center;gap:10px">
      <span style="width:90px;font-size:11px;color:var(--sb-txt3);flex-shrink:0">${label}</span>
      <div style="flex:1;height:5px;background:var(--sb-surface2);border-radius:3px">
        <div style="width:${(n/max*100).toFixed(1)}%;height:100%;background:${color};border-radius:3px"></div>
      </div>
      <span style="font-size:11px;font-weight:600;color:var(--sb-txt);width:28px;text-align:right">${n}</span>
    </div>
  `).join('');
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
      <div class="card-body" style="text-align:center;padding:18px 14px">
        <div style="width:40px;height:40px;border-radius:8px;background:${p.color}18;border:1px solid ${p.color}33;display:flex;align-items:center;justify-content:center;margin:0 auto 10px;font-size:15px;font-weight:700;color:${p.color}">${p.name[0]}</div>
        <div style="font-size:13px;font-weight:600;color:var(--sb-txt);margin-bottom:3px">${p.name}</div>
        <div style="font-size:11px;color:var(--sb-txt3);line-height:1.4;margin-bottom:10px">${p.spec}</div>
        <div style="display:flex;justify-content:center;gap:5px;flex-wrap:wrap">
          <span class="badge badge-green">활성</span>
          <span class="badge badge-gray">담당 ${Math.floor(Math.random()*80+50)}명</span>
        </div>
      </div>
      <div class="card-footer">
        <span>정확도</span>
        <span style="color:var(--sb-green-txt);font-weight:600">${(Math.random()*3+96).toFixed(1)}%</span>
      </div>
    </div>
  `).join('');
}

function renderProfGrid(elId, count) {
  const el = document.getElementById(elId);
  if (!el) return;
  el.innerHTML = AI_PROFESSORS.slice(0, count).map(p => `
    <div class="prof-card" onclick="navigate('professors')">
      <div style="width:32px;height:32px;border-radius:6px;background:${p.color}18;border:1px solid ${p.color}33;display:flex;align-items:center;justify-content:center;margin:0 auto 8px;font-size:13px;font-weight:700;color:${p.color}">${p.name[0]}</div>
      <div class="prof-name">${p.name}</div>
      <div class="prof-spec">${p.spec}</div>
      <div class="prof-dot"></div>
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

// ══════════════════════════════════════
// AI 교수 채팅 (GWP ctx 연동)
// ══════════════════════════════════════

let _systemPrompt  = null;
let _chatHistory   = [];
let _studentProfile = null;

// 시스템 프롬프트 로드
async function loadSystemPrompt() {
  if (_systemPrompt) return _systemPrompt;
  try {
    const r = await fetch(SYSTEM_PROMPT_URL);
    _systemPrompt = await r.text();
  } catch(e) {
    _systemPrompt = 'You are K-School AI Professor. Adapt to the student profile provided.';
  }
  return _systemPrompt;
}

// GWP ctx 파라미터 수신 (고팡에서 호출 시)
function initGwpContext() {
  const params = new URLSearchParams(location.search);
  const ctx = params.get('ctx');
  if (!ctx) return null;
  try { return decodeURIComponent(ctx); } catch { return null; }
}

// 학생 프로파일 → 시스템 프롬프트에 주입
function buildSystemWithProfile(basePrompt, profile) {
  if (!profile) return basePrompt;
  const block = `
[STUDENT_PROFILE]
이름: ${profile.name || '학생'}
나이: ${profile.age || '미상'}세
성별: ${profile.gender || '미상'}
학제: ${profile.stage || '미상'}
성격: ${profile.personality || '미파악'}
취향: ${profile.interests || '미파악'}
학습 스타일: ${profile.learning_style || '미파악'}
현재 역량: ${profile.competencies || '미파악'}
진로 균형점: ${profile.career_balance || '미파악'}
균형점 효용: ${profile.utility_score || '미파악'}
[/STUDENT_PROFILE]
`;
  return block + '\n' + basePrompt;
}

// AI 교수에게 메시지 전송
async function sendToAIProfessor(userMessage) {
  const sysPrompt = await loadSystemPrompt();
  const fullSystem = buildSystemWithProfile(sysPrompt, _studentProfile);

  _chatHistory.push({ role: 'user', content: userMessage });

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model:      'claude-sonnet-4-20250514',
      max_tokens: 1000,
      system:     fullSystem,
      messages:   _chatHistory,
    }),
  });

  const data = await res.json();
  const reply = data.content?.find(b => b.type === 'text')?.text || '(응답 없음)';
  _chatHistory.push({ role: 'assistant', content: reply });
  return reply;
}

// AI 교수 탭 렌더링
function renderAIProfessor() {
  const el = document.getElementById('tab-professor');
  if (!el) return;

  const gwpCtx = initGwpContext();

  el.innerHTML = `
    <div style="max-width:720px;margin:0 auto">
      <!-- 교수 프로파일 카드 -->
      <div class="card" style="margin-bottom:14px">
        <div class="card-body" style="display:flex;align-items:center;gap:14px">
          <div style="width:48px;height:48px;border-radius:10px;background:var(--sb-green-bg);border:1px solid var(--sb-green-bd);display:flex;align-items:center;justify-content:center;flex-shrink:0">
            <span data-icon="cpu" data-icon-class="icon-xl" style="color:var(--sb-green-txt)"></span>
          </div>
          <div style="flex:1">
            <div style="font-size:14px;font-weight:600;color:var(--sb-txt);margin-bottom:2px">AI 교수</div>
            <div style="font-size:11px;color:var(--sb-txt3);line-height:1.5">${AI_PROFESSOR.domains.join(' · ')}</div>
          </div>
          <span class="badge badge-green">온라인</span>
        </div>
      </div>

      <!-- 채팅창 -->
      <div class="card">
        <div id="chat-messages" style="min-height:320px;max-height:480px;overflow-y:auto;padding:16px;display:flex;flex-direction:column;gap:12px">
          ${gwpCtx
            ? `<div style="background:var(--sb-yellow-bg);border:1px solid var(--sb-yellow-bd);border-radius:var(--r2);padding:10px 13px;font-size:12px;color:var(--sb-yellow-txt)">
                고팡에서 이어받은 질문: <strong>"${gwpCtx}"</strong>
               </div>`
            : `<div style="text-align:center;padding:24px;color:var(--sb-txt4);font-size:13px">
                AI 교수에게 무엇이든 물어보세요
               </div>`
          }
        </div>
        <div style="border-top:1px solid var(--sb-border);padding:12px 14px;display:flex;gap:8px">
          <input class="sb-input" id="chat-input" placeholder="질문을 입력하세요…"
            onkeydown="if(event.key==='Enter'&&!event.shiftKey){event.preventDefault();chatSend()}"
            style="flex:1">
          <button class="btn btn-primary" onclick="chatSend()" id="chat-send-btn">
            <span data-icon="zap" data-icon-class="icon-sm"></span> 전송
          </button>
        </div>
      </div>
    </div>
  `;

  // data-icon 처리
  el.querySelectorAll('[data-icon]').forEach(e => {
    e.innerHTML = ic(e.dataset.icon, e.dataset.iconClass || '');
  });

  // GWP ctx가 있으면 자동 전송
  if (gwpCtx) {
    setTimeout(() => chatSendMessage(gwpCtx), 300);
  }
}

async function chatSend() {
  const inp = document.getElementById('chat-input');
  if (!inp || !inp.value.trim()) return;
  const msg = inp.value.trim();
  inp.value = '';
  await chatSendMessage(msg);
}

async function chatSendMessage(msg) {
  const container = document.getElementById('chat-messages');
  const btn       = document.getElementById('chat-send-btn');
  if (!container) return;

  // 사용자 메시지
  container.innerHTML += `
    <div style="display:flex;justify-content:flex-end">
      <div style="max-width:75%;background:var(--sb-green);color:#fff;border-radius:var(--r2) var(--r2) 0 var(--r2);padding:9px 13px;font-size:13px;line-height:1.5">${escHtml(msg)}</div>
    </div>`;
  container.scrollTop = container.scrollHeight;

  if (btn) { btn.disabled = true; btn.textContent = '…'; }

  // AI 응답
  try {
    const reply = await sendToAIProfessor(msg);
    container.innerHTML += `
      <div style="display:flex;justify-content:flex-start;gap:8px">
        <div style="width:28px;height:28px;border-radius:6px;background:var(--sb-green-bg);border:1px solid var(--sb-green-bd);display:flex;align-items:center;justify-content:center;flex-shrink:0;font-size:11px;font-weight:700;color:var(--sb-green-txt)">AI</div>
        <div style="max-width:75%;background:var(--sb-surface);border:1px solid var(--sb-border);border-radius:var(--r2) var(--r2) var(--r2) 0;padding:9px 13px;font-size:13px;line-height:1.6;color:var(--sb-txt)">${reply.replace(/\n/g,'<br>')}</div>
      </div>`;
  } catch(e) {
    container.innerHTML += `<div style="color:var(--sb-red-txt);font-size:12px;padding:8px">오류: ${e.message}</div>`;
  }

  container.scrollTop = container.scrollHeight;
  if (btn) { btn.disabled = false; btn.innerHTML = ic('zap','icon-sm') + ' 전송'; }
}

function escHtml(s) {
  return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}
