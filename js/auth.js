// ── K-School 인증 (gopang-sso.js 위임) ──────────────────
// 백서 §12.11: K-School 최소 인증 레벨 L0 (조회)
// 중요 기능(진로 수정, 커리큘럼 변경): L1

let gopangAuth = null;
let _user = null;

async function _loadSSO() {
  if (gopangAuth) return;
  try {
    const mod = await import('https://hondi.net/auth/gopang-sso.js');
    gopangAuth = mod.gopangAuth;
  } catch(e) {
    console.warn('[Auth] gopang-sso.js 로드 실패, 로컬 폴백:', e.message);
    gopangAuth = _localFallback();
  }
}

async function initAuth() {
  await _loadSSO();
  _user = await gopangAuth.require('L0');
  if (!_user) return null;
  renderAuthBadge();
  return _user;
}

async function requireLevel(level) {
  await _loadSSO();
  const result = await gopangAuth.require(level);
  if (result) { _user = result; renderAuthBadge(); }
  return result;
}

function renderAuthBadge() {
  const el = document.getElementById('auth-badge');
  if (!el || !_user) return;
  const cfg = {
    L0:{ label:'L0', color:'var(--sb-txt3)' },
    L1:{ label:'L1', color:'#00bcd4' },
    L2:{ label:'L2', color:'var(--sb-green)' },
    L3:{ label:'L3', color:'#ff9800' },
  };
  const c = cfg[_user.level] || cfg.L0;
  el.style.color = c.color;
  el.textContent = c.label;
  el.title = _user.ipv6 || '';
  el.onclick = showAuthPanel;
}

function showAuthPanel() {
  // 고팡 앱으로 안내
  const modal = document.getElementById('auth-modal');
  const content = document.getElementById('auth-modal-content');
  if (!modal || !content) return;
  content.innerHTML = `
    <div class="modal-hd">
      <div style="font-size:20px">🔑</div>
      <div class="modal-title">고팡 인증</div>
    </div>
    <div class="modal-body">
      <div style="font-size:12px;color:var(--sb-txt2);line-height:1.8;margin-bottom:16px">
        K-School은 고팡(hondi.net) 인증을 사용합니다.<br>
        현재 레벨: <strong style="color:var(--sb-green)">${_user?.level || 'L0'}</strong>
        &nbsp;|&nbsp; IPv6: <code style="font-size:10px;color:var(--sb-txt3)">${(_user?.ipv6||'').slice(0,24)}…</code>
      </div>
      <a href="https://hondi.net" target="_blank" class="btn btn-primary" style="width:100%;justify-content:center;display:flex">고팡 앱 열기</a>
    </div>
    <div class="modal-ft">
      <button class="btn" onclick="closeModal('auth-modal')">닫기</button>
    </div>
  `;
  modal.classList.add('open');
}

function closeModal(id) {
  document.getElementById(id)?.classList.remove('open');
}

// ── 로컬 폴백 ──────────────────────────────────────────
function _localFallback() {
  const STORE = 'gopang_user_v3';
  const SESSION = 'gopang_sso_token';
  const LVL = { L0:0, L1:1, L2:2, L3:3 };

  return {
    async require(level) {
      try {
        const s = JSON.parse(sessionStorage.getItem(SESSION)||'null');
        if (s?.exp && Date.now()/1000 < s.exp && LVL[s.level] >= LVL[level])
          return { ...s, via:'session' };
      } catch {}
      const stored = JSON.parse(localStorage.getItem(STORE)||'null');
      if (!stored?.ipv6) { _showLoginPrompt(); return null; }
      const exp = Math.floor(Date.now()/1000) + 3600;
      const token = { ipv6: stored.ipv6, level: stored.authLevel||'L0', exp };
      sessionStorage.setItem(SESSION, JSON.stringify(token));
      if (LVL[token.level] < LVL[level]) { _showLoginPrompt(level); return null; }
      return { ...token, via:'local' };
    },
    async verify(level) { return this.require(level); },
    session() { try { return JSON.parse(sessionStorage.getItem(SESSION)||'null'); } catch { return null; } },
    logout() { sessionStorage.removeItem(SESSION); },
  };
}

function _showLoginPrompt(level) {
  const modal = document.getElementById('auth-modal');
  const content = document.getElementById('auth-modal-content');
  if (!modal || !content) return;
  content.innerHTML = `
    <div class="modal-hd">
      <div style="font-size:20px">🔒</div>
      <div class="modal-title">고팡 인증 필요</div>
    </div>
    <div class="modal-body">
      <div class="alert alert-yellow" style="margin-bottom:16px">
        <span>⚠️</span>
        <span>K-School은 고팡(hondi.net) 인증을 사용합니다.${level?' '+level+' 인증이 필요합니다.':''}</span>
      </div>
      <a href="https://hondi.net" target="_blank" class="btn btn-primary" style="width:100%;justify-content:center;display:flex;margin-bottom:8px">hondi.net 열기</a>
      <button class="btn" style="width:100%;justify-content:center;display:flex" onclick="location.reload()">인증 후 새로고침</button>
    </div>
    <div class="modal-ft">
      <button class="btn" onclick="closeModal('auth-modal')">닫기</button>
    </div>
  `;
  modal.classList.add('open');
}
