/**
 * DataVault Task 06 — Auth Frontend
 * Fetch API for register/login/me + protected views
 */
(function () {
  'use strict';

  let token = localStorage.getItem('dv_token') || '';
  let currentUser = null;

  // ─── Tab Router ───────────────────────────────────────────
  document.querySelectorAll('.dv-tab').forEach(tab => {
    tab.addEventListener('click', () => switchView(tab.dataset.view));
  });

  window.switchView = function(view) {
    document.querySelectorAll('.dv-tab').forEach(t =>
      t.classList.toggle('active', t.dataset.view === view));
    document.querySelectorAll('.dv-view').forEach(v => v.classList.remove('active'));
    document.getElementById('view-' + view).classList.add('active');
    if (view === 'dashboard') loadDashboard();
    if (view === 'users')     loadUsers();
  };

  // ─── DB Status ────────────────────────────────────────────
  async function checkDB() {
    try {
      const r = await fetch('/api/db-status');
      const d = await r.json();
      const dot   = document.getElementById('dbDot');
      const label = document.getElementById('dbLabel');
      if (d.data.state === 'connected') {
        dot.className = 'dv-db-dot connected';
        label.textContent = 'Atlas Connected';
      } else {
        dot.className = 'dv-db-dot error';
        label.textContent = d.data.state;
      }
    } catch {
      document.getElementById('dbDot').className = 'dv-db-dot error';
      document.getElementById('dbLabel').textContent = 'Disconnected';
    }
  }

  // ─── Register ─────────────────────────────────────────────
  document.getElementById('registerBtn').addEventListener('click', async () => {
    const name     = document.getElementById('regName').value.trim();
    const email    = document.getElementById('regEmail').value.trim();
    const password = document.getElementById('regPassword').value;
    const msg      = document.getElementById('regMsg');
    msg.className  = 'dv-auth-msg';

    try {
      const res  = await fetch('/api/auth/register', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();
      if (!data.success) { showMsg(msg, data.error, 'error'); return; }
      token = data.token;
      currentUser = data.user;
      localStorage.setItem('dv_token', token);
      showMsg(msg, `✅ Welcome, ${data.user.name}! Account created.`, 'success');
      showToken(token);
      updateAuthUI();
    } catch (e) {
      showMsg(msg, 'Server error: ' + e.message, 'error');
    }
  });

  // ─── Login ────────────────────────────────────────────────
  document.getElementById('loginBtn').addEventListener('click', async () => {
    const email    = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;
    const msg      = document.getElementById('loginMsg');
    msg.className  = 'dv-auth-msg';

    try {
      const res  = await fetch('/api/auth/login', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!data.success) { showMsg(msg, data.error, 'error'); return; }
      token = data.token;
      currentUser = data.user;
      localStorage.setItem('dv_token', token);
      showMsg(msg, `✅ Welcome back, ${data.user.name}!`, 'success');
      showToken(token);
      updateAuthUI();
    } catch (e) {
      showMsg(msg, 'Server error: ' + e.message, 'error');
    }
  });

  // ─── Verify Token ─────────────────────────────────────────
  document.getElementById('verifyTokenBtn').addEventListener('click', async () => {
    if (!token) return;
    try {
      const res  = await fetch('/api/auth/me', {
        headers: { 'Authorization': 'Bearer ' + token }
      });
      const data = await res.json();
      if (data.success) {
        currentUser = data.user;
        alert(`✅ Token valid!\n\nUser: ${data.user.name}\nEmail: ${data.user.email}\nRole: ${data.user.role}`);
      } else {
        alert('❌ ' + data.error);
      }
    } catch (e) {
      alert('Error: ' + e.message);
    }
  });

  // ─── Logout ───────────────────────────────────────────────
  document.getElementById('logoutBtn').addEventListener('click', () => {
    token = '';
    currentUser = null;
    localStorage.removeItem('dv_token');
    document.getElementById('tokenDisplay').innerHTML =
      '<div class="dv-token-empty"><i class="bi bi-shield-slash"></i><p>No token — register or login first</p></div>';
    document.getElementById('verifyTokenBtn').disabled = true;
    document.getElementById('logoutBtn').style.display = 'none';
  });

  // ─── Dashboard ────────────────────────────────────────────
  async function loadDashboard() {
    const locked  = document.getElementById('dashboardLocked');
    const content = document.getElementById('dashboardContent');
    if (!token) { locked.style.display = ''; content.style.display = 'none'; return; }

    try {
      const res  = await fetch('/api/auth/me', { headers: { 'Authorization': 'Bearer ' + token } });
      const data = await res.json();
      if (!data.success) { locked.style.display = ''; content.style.display = 'none'; return; }

      const u = data.user;
      locked.style.display  = 'none';
      content.style.display = '';
      document.getElementById('dashAvatar').textContent = u.name.charAt(0).toUpperCase();
      document.getElementById('dashName').textContent   = u.name;
      document.getElementById('dashEmail').textContent  = u.email;
      document.getElementById('dashRole').textContent   = u.role;
      document.getElementById('dashJoined').textContent = 'Joined ' + new Date(u.createdAt).toLocaleDateString('en-IN', { dateStyle:'medium' });
    } catch { locked.style.display = ''; content.style.display = 'none'; }
  }

  // ─── Users List ───────────────────────────────────────────
  async function loadUsers() {
    const locked  = document.getElementById('usersLocked');
    const content = document.getElementById('usersContent');
    if (!token) { locked.style.display = ''; content.style.display = 'none'; return; }

    locked.style.display  = 'none';
    content.style.display = '';
    try {
      const res  = await fetch('/api/users', { headers: { 'Authorization': 'Bearer ' + token } });
      const data = await res.json();
      if (!data.success) { locked.style.display = ''; content.style.display = 'none'; return; }

      document.getElementById('usersCount').textContent = `${data.count} user${data.count !== 1 ? 's' : ''} in MongoDB Atlas`;
      const tbody = document.getElementById('usersTableBody');
      tbody.innerHTML = data.data.map((u, i) => `
        <tr>
          <td style="color:var(--dv-text-3)">${i + 1}</td>
          <td><span class="dv-user-avatar">${u.name.charAt(0)}</span><strong>${esc(u.name)}</strong></td>
          <td style="color:var(--dv-text-2)">${esc(u.email)}</td>
          <td><span class="dv-badge">${u.role}</span></td>
          <td style="color:var(--dv-text-3);font-size:12px">${new Date(u.createdAt).toLocaleDateString('en-IN')}</td>
          <td><button class="dv-btn dv-btn-danger dv-btn-sm" onclick="deleteUser('${u._id}')"><i class="bi bi-trash3"></i></button></td>
        </tr>`).join('');
    } catch (e) { console.error(e); }
  }

  window.deleteUser = async function(id) {
    if (!confirm('Delete this user?')) return;
    try {
      await fetch('/api/users/' + id, { method: 'DELETE', headers: { 'Authorization': 'Bearer ' + token } });
      loadUsers();
    } catch (e) { alert('Error: ' + e.message); }
  };

  document.getElementById('refreshUsersBtn').addEventListener('click', loadUsers);

  // ─── Helpers ──────────────────────────────────────────────
  function showMsg(el, text, type) {
    el.textContent = text;
    el.className   = 'dv-auth-msg ' + type;
  }

  function showToken(tok) {
    const parts = tok.split('.');
    document.getElementById('tokenDisplay').innerHTML = `
      <div class="dv-token-value">
        <div class="dv-token-parts">
          <span class="jwt-header">${parts[0]}</span>
          <span>.</span>
          <span class="jwt-payload">${parts[1]}</span>
          <span>.</span>
          <span class="jwt-signature">${parts[2]}</span>
        </div>
      </div>`;
    document.getElementById('verifyTokenBtn').disabled = false;
    document.getElementById('logoutBtn').style.display = '';
  }

  function updateAuthUI() {
    if (token) showToken(token);
  }

  window.togglePw = function(id, btn) {
    const input = document.getElementById(id);
    const isPass = input.type === 'password';
    input.type = isPass ? 'text' : 'password';
    btn.innerHTML = `<i class="bi bi-eye${isPass ? '-slash' : ''}"></i>`;
  };

  function esc(s) {
    return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  }

  // ─── Init ─────────────────────────────────────────────────
  checkDB();
  setInterval(checkDB, 10000);
  if (token) showToken(token);
})();
