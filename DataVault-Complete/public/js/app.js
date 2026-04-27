'use strict';
// ─── State ────────────────────────────────────────────────────
let token = localStorage.getItem('dv_token') || null;
let user  = JSON.parse(localStorage.getItem('dv_user') || 'null');
let todos = JSON.parse(localStorage.getItem('dv_todos') || '[]');
let autoInterval = null;
let isAuto = false;
let noteFilter = 'all';

// ─── Router ───────────────────────────────────────────────────
const views = ['home','auth','dashboard','notes','weather','server','showcase','advanced'];
window.go = function(view) {
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
  const el = document.getElementById('view-' + view);
  if (el) el.classList.add('active');
  const btn = document.querySelector(`[data-view="${view}"]`);
  if (btn) btn.classList.add('active');
  if (view === 'dashboard') loadDashboard();
  if (view === 'notes') loadNotes();
  if (view === 'server') { refreshLogs(); refreshCacheStats(); refreshCronLogs(); }
};
document.querySelectorAll('.nav-btn').forEach(b => b.addEventListener('click', () => go(b.dataset.view)));

// ─── Helpers ──────────────────────────────────────────────────
const authHeaders = () => ({ 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` });
function showMsg(id, msg, ok) {
  const el = document.getElementById(id);
  el.textContent = msg; el.className = 'auth-msg ' + (ok ? 'ok' : 'err'); el.style.display = 'block';
}

// ─── Nav update ───────────────────────────────────────────────
function updateNav() {
  const chip = document.getElementById('userChip');
  const btn  = document.getElementById('logoutBtn');
  if (user) { chip.textContent = user.name.split(' ')[0]; chip.style.display = ''; btn.style.display = ''; }
  else { chip.style.display = 'none'; btn.style.display = 'none'; }
}
window.logout = function() {
  token = null; user = null;
  localStorage.removeItem('dv_token'); localStorage.removeItem('dv_user');
  updateNav(); go('auth');
};

// ─── DB status ────────────────────────────────────────────────
async function checkDB() {
  try {
    const r = await fetch('/api/db-status');
    const d = await r.json();
    const dot = document.getElementById('dbDot');
    dot.className = 'db-dot ' + (d.data.state === 'connected' ? 'connected' : 'error');
    dot.title = d.data.state;
  } catch {}
}
checkDB(); setInterval(checkDB, 10000);

// ─── Auth ─────────────────────────────────────────────────────
document.getElementById('regBtn').addEventListener('click', async () => {
  const name = document.getElementById('regName').value.trim();
  const email = document.getElementById('regEmail').value.trim();
  const pass = document.getElementById('regPass').value;
  if (!name || !email || !pass) return showMsg('regMsg', 'All fields required', false);
  try {
    const r = await fetch('/api/auth/register', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ name, email, password: pass }) });
    const d = await r.json();
    if (!d.success) return showMsg('regMsg', d.error, false);
    token = d.token; user = d.user;
    localStorage.setItem('dv_token', token); localStorage.setItem('dv_user', JSON.stringify(user));
    showMsg('regMsg', `Welcome, ${d.user.name}! Account created.`, true);
    updateNav(); showToken(token); document.getElementById('verifyBtn').disabled = false;
  } catch(e) { showMsg('regMsg', e.message, false); }
});

document.getElementById('loginBtn').addEventListener('click', async () => {
  const email = document.getElementById('loginEmail').value.trim();
  const pass  = document.getElementById('loginPass').value;
  if (!email || !pass) return showMsg('loginMsg', 'All fields required', false);
  try {
    const r = await fetch('/api/auth/login', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ email, password: pass }) });
    const d = await r.json();
    if (!d.success) return showMsg('loginMsg', d.error, false);
    token = d.token; user = d.user;
    localStorage.setItem('dv_token', token); localStorage.setItem('dv_user', JSON.stringify(user));
    showMsg('loginMsg', `Signed in as ${d.user.name}!`, true);
    updateNav(); showToken(token); document.getElementById('verifyBtn').disabled = false;
  } catch(e) { showMsg('loginMsg', e.message, false); }
});

function showToken(t) {
  const parts = t.split('.');
  const colors = ['#cf222e','#8250df','#0969da'];
  document.getElementById('tokenBox').innerHTML = parts.map((p,i) => `<span style="color:${colors[i]}">${p}</span>`).join('<span style="color:#666">.</span>');
}

document.getElementById('verifyBtn').addEventListener('click', async () => {
  if (!token) return;
  const r = await fetch('/api/auth/me', { headers: authHeaders() });
  const d = await r.json();
  alert(d.success ? `✅ ${d.user.name} (${d.user.email}) · Role: ${d.user.role}` : '❌ ' + d.error);
});

// ─── Dashboard ────────────────────────────────────────────────
async function loadDashboard() {
  if (!user) { document.getElementById('dashLocked').style.display = 'flex'; document.getElementById('dashContent').style.display = 'none'; return; }
  document.getElementById('dashLocked').style.display = 'none'; document.getElementById('dashContent').style.display = 'block';
  document.getElementById('dashAvatar').textContent = user.name[0].toUpperCase();
  document.getElementById('dashName').textContent = user.name;
  document.getElementById('dashEmail').textContent = user.email;
  document.getElementById('dashRole').textContent = user.role;
  document.getElementById('dashJoined').textContent = '· Joined ' + new Date(user.createdAt).toLocaleDateString('en-IN');
  try {
    const r = await fetch('/api/notes', { headers: authHeaders() });
    const d = await r.json();
    const el = document.getElementById('dashNotes');
    if (!d.data?.length) { el.innerHTML = '<p class="muted">No notes yet. <a href="#" onclick="go(\'notes\')">Create one!</a></p>'; }
    else { el.innerHTML = d.data.slice(0,3).map(n => `<div class="note-card"><h4>${n.title}</h4><p>${n.body}</p><span class="note-tag">${n.tag}</span></div>`).join(''); }
    const stats = document.getElementById('dashStats');
    stats.innerHTML = `<div class="stat-row"><span>Total Notes</span><strong>${d.count}</strong></div><div class="stat-row"><span>Tags</span><strong>${d.tags?.join(', ') || '—'}</strong></div>`;
  } catch {}
}

window.dashWeather = async function() {
  const city = document.getElementById('dashCity').value.trim();
  if (!city) return;
  const r = await fetch(`/api/weather?city=${encodeURIComponent(city)}`);
  const d = await r.json();
  const el = document.getElementById('dashWeatherResult');
  if (!d.success) return (el.innerHTML = `<p style="color:var(--red)">${d.error}</p>`);
  const wd = d.data;
  const icons = {'01d':'☀️','01n':'🌙','02d':'⛅','03d':'☁️','09d':'🌧️','10d':'🌦️','11d':'⛈️','13d':'❄️','50d':'🌫️'};
  el.innerHTML = `<div style="display:flex;align-items:center;gap:12px;padding:10px;background:var(--bg2);border-radius:8px"><span style="font-size:32px">${icons[wd.icon]||'🌤️'}</span><div><strong>${wd.city}</strong><br><span style="font-size:20px;font-weight:800;color:var(--blue)">${wd.temp}°C</span> <span class="muted">${wd.description}</span></div></div>`;
};

// ─── Notes ────────────────────────────────────────────────────
async function loadNotes() {
  if (!user) { document.getElementById('notesLocked').style.display = 'flex'; document.getElementById('notesContent').style.display = 'none'; return; }
  document.getElementById('notesLocked').style.display = 'none'; document.getElementById('notesContent').style.display = 'block';
  const query = noteFilter !== 'all' ? `?tag=${noteFilter}` : '';
  const r = await fetch(`/api/notes${query}`, { headers: authHeaders() });
  const d = await r.json();
  document.getElementById('noteResponse').textContent = JSON.stringify(d, null, 2).slice(0, 500);
  if (!d.success) return;
  document.getElementById('nStatTotal').textContent = d.count;
  document.getElementById('nStatTags').textContent = d.tags?.length || 0;
  const tagList = document.getElementById('nTagList');
  tagList.innerHTML = (d.tags || []).map(t => `<span class="tag-chip">${t} (${d.tagCounts[t]})</span>`).join('');
  const search = document.getElementById('noteSearch').value.toLowerCase();
  const filtered = (d.data || []).filter(n => n.title.toLowerCase().includes(search) || n.body.toLowerCase().includes(search));
  const list = document.getElementById('notesList');
  list.innerHTML = filtered.length ? filtered.map(n => `
    <div class="note-card">
      <h4>${n.title}</h4><p>${n.body}</p>
      <div class="note-actions">
        <span class="note-tag">${n.tag}</span>
        <span class="muted" style="font-size:11px;flex:1">${new Date(n.createdAt).toLocaleDateString()}</span>
        <button class="btn btn-outline btn-sm" onclick="editNote('${n._id}','${n.title.replace(/'/g,"\\'")}','${n.body.replace(/'/g,"\\'")}','${n.tag}')"><i class="bi bi-pencil"></i></button>
        <button class="btn btn-sm" style="background:#ffebe9;border-color:var(--red);color:var(--red)" onclick="deleteNote('${n._id}')"><i class="bi bi-trash3"></i></button>
      </div>
    </div>`).join('') : '<p class="muted" style="padding:20px;text-align:center">No notes found</p>';
  // filter tabs
  const filterEl = document.getElementById('noteTagFilter');
  filterEl.innerHTML = ['all', ...(d.tags || [])].map(t => `<button class="filter-tab ${t===noteFilter?'active':''}" onclick="setFilter('${t}')">${t}</button>`).join('');
}

window.setFilter = function(f) { noteFilter = f; loadNotes(); };
document.getElementById('noteSearch').addEventListener('input', () => loadNotes());

document.getElementById('noteSubmit').addEventListener('click', async () => {
  const id    = document.getElementById('editId').value;
  const title = document.getElementById('noteTitle').value.trim();
  const body  = document.getElementById('noteBody').value.trim();
  const tag   = document.getElementById('noteTag').value;
  if (!title || !body) return alert('Title and body required');
  const method = id ? 'PUT' : 'POST';
  const url    = id ? `/api/notes/${id}` : '/api/notes';
  const r = await fetch(url, { method, headers: authHeaders(), body: JSON.stringify({ title, body, tag }) });
  const d = await r.json();
  document.getElementById('noteResponse').textContent = JSON.stringify(d, null, 2);
  if (d.success) { document.getElementById('noteTitle').value=''; document.getElementById('noteBody').value=''; document.getElementById('editId').value=''; cancelEdit(); loadNotes(); }
  else alert(d.error);
});

window.editNote = function(id, title, body, tag) {
  document.getElementById('editId').value = id;
  document.getElementById('noteTitle').value = title;
  document.getElementById('noteBody').value = body;
  document.getElementById('noteTag').value = tag;
  document.getElementById('noteSubmit').innerHTML = '<i class="bi bi-check-lg"></i> Update';
  document.getElementById('noteCancelEdit').style.display = '';
  document.getElementById('noteFormTitle').innerHTML = '<i class="bi bi-pencil-fill" style="color:var(--orange)"></i> Edit Note <span class="pill put">PUT</span>';
};
window.cancelEdit = function() {
  document.getElementById('editId').value = '';
  document.getElementById('noteTitle').value = ''; document.getElementById('noteBody').value = '';
  document.getElementById('noteSubmit').innerHTML = '<i class="bi bi-plus-lg"></i> Create';
  document.getElementById('noteCancelEdit').style.display = 'none';
  document.getElementById('noteFormTitle').innerHTML = '<i class="bi bi-plus-circle-fill" style="color:var(--green)"></i> Create Note <span class="pill post">POST</span>';
};
document.getElementById('noteCancelEdit').addEventListener('click', cancelEdit);

window.deleteNote = async function(id) {
  if (!confirm('Delete this note?')) return;
  const r = await fetch(`/api/notes/${id}`, { method: 'DELETE', headers: authHeaders() });
  const d = await r.json();
  document.getElementById('noteResponse').textContent = JSON.stringify(d, null, 2);
  loadNotes();
};

// ─── Weather ──────────────────────────────────────────────────
const wIcons = {'01d':'☀️','01n':'🌙','02d':'⛅','02n':'⛅','03d':'☁️','04d':'☁️','09d':'🌧️','10d':'🌦️','11d':'⛈️','13d':'❄️','50d':'🌫️'};
function windDir(d){return ['N','NE','E','SE','S','SW','W','NW'][Math.round(d/45)%8];}
function fmtTime(ms){return new Date(ms).toLocaleTimeString('en-IN',{hour:'2-digit',minute:'2-digit'});}

async function searchWeather(city) {
  document.getElementById('weatherResult').innerHTML = '<p class="muted" style="padding:20px;text-align:center"><i class="bi bi-cloud-arrow-down" style="font-size:24px;display:block"></i>Fetching...</p>';
  document.getElementById('wError').style.display = 'none';
  try {
    const r = await fetch(`/api/weather?city=${encodeURIComponent(city)}`);
    const d = await r.json();
    if (d.rateLimit) {
      document.getElementById('wRateBar').style.display = 'flex';
      const rem = d.rateLimit.remaining; const lim = d.rateLimit.limit;
      document.getElementById('wRateText').textContent = `${rem} / ${lim} remaining`;
      const fill = document.getElementById('wRateFill');
      const pct = (rem/lim)*100;
      fill.style.width = pct+'%'; fill.style.background = pct<=20?'var(--red)':pct<=50?'var(--orange)':'var(--green)';
      document.getElementById('wRateReset').textContent = 'Resets: '+new Date(d.rateLimit.resetTime).toLocaleTimeString('en-IN');
    }
    if (!d.success) {
      document.getElementById('weatherResult').innerHTML='';
      document.getElementById('wErrTitle').textContent = r.status===429?'Rate Limited':'Error';
      document.getElementById('wErrMsg').textContent = d.error;
      document.getElementById('wError').style.display='flex'; return;
    }
    const w = d.data;
    document.getElementById('weatherResult').innerHTML = `
      <div class="weather-card">
        <div class="wc-head">
          <div><div class="wc-city">${w.city}</div><div class="wc-loc">📍 ${w.country} · ${w.lat?.toFixed(2)}°N, ${w.lon?.toFixed(2)}°E</div><div class="wc-icon">${wIcons[w.icon]||'🌤️'}</div><div class="wc-desc">${w.description}</div></div>
          <div style="text-align:right"><div class="wc-temp">${w.temp}°C</div><div class="wc-feels">Feels like ${w.feels_like}°C</div>${d.source==='cache'?'<span class="pill get" style="margin-top:6px">⚡ Cached</span>':''}</div>
        </div>
        <div class="wc-stats">
          <div class="wc-stat"><div class="wc-stat-lbl">💧 Humidity</div><div class="wc-stat-val">${w.humidity}%</div></div>
          <div class="wc-stat"><div class="wc-stat-lbl">💨 Wind</div><div class="wc-stat-val">${w.wind_speed} m/s ${windDir(w.wind_deg||0)}</div></div>
          <div class="wc-stat"><div class="wc-stat-lbl">📊 Pressure</div><div class="wc-stat-val">${w.pressure} hPa</div></div>
          <div class="wc-stat"><div class="wc-stat-lbl">👁️ Visibility</div><div class="wc-stat-val">${((w.visibility||0)/1000).toFixed(1)} km</div></div>
          <div class="wc-stat"><div class="wc-stat-lbl">🌅 Sunrise</div><div class="wc-stat-val">${fmtTime(w.sunrise)}</div></div>
          <div class="wc-stat"><div class="wc-stat-lbl">🌇 Sunset</div><div class="wc-stat-val">${fmtTime(w.sunset)}</div></div>
        </div>
        <div class="wc-foot"><span>Source: ${d.source}</span><span>${new Date(w.fetchedAt).toLocaleString('en-IN')}</span></div>
      </div>`;
  } catch(e) { document.getElementById('wErrTitle').textContent='Error'; document.getElementById('wErrMsg').textContent=e.message; document.getElementById('wError').style.display='flex'; document.getElementById('weatherResult').innerHTML=''; }
}
document.getElementById('wSearchBtn').addEventListener('click', () => { const c=document.getElementById('wCity').value.trim(); if(c) searchWeather(c); });
document.getElementById('wCity').addEventListener('keydown', e => { if(e.key==='Enter'){const c=e.target.value.trim();if(c)searchWeather(c);} });
document.querySelectorAll('.city-pill').forEach(p => p.addEventListener('click', () => { document.getElementById('wCity').value=p.dataset.city; searchWeather(p.dataset.city); }));

// ─── Server Monitor ───────────────────────────────────────────
document.querySelectorAll('.stab').forEach(t => t.addEventListener('click', () => {
  document.querySelectorAll('.stab').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.stab-view').forEach(v => v.classList.remove('active'));
  t.classList.add('active');
  document.getElementById('stab-'+t.dataset.stab).classList.add('active');
  if(t.dataset.stab==='scache') refreshCacheStats();
  if(t.dataset.stab==='scron') refreshCronLogs();
}));
window.hit = async url => { try { await fetch(url, token?{headers:authHeaders()}:{}); } catch {} };
window.toggleAuto = function() {
  isAuto = !isAuto;
  const btn = document.getElementById('sAutoBtn');
  if (isAuto) { btn.innerHTML='<i class="bi bi-stop-fill"></i> Stop'; btn.style.cssText='background:#ffebe9;border-color:var(--red);color:var(--red)'; autoInterval=setInterval(()=>hit(['/api/cache-status','/api/notes-stats'][Math.floor(Math.random()*2)]),800); }
  else { btn.innerHTML='<i class="bi bi-play-fill"></i> Auto-fire'; btn.style.cssText='background:#dafbe1;border-color:var(--green);color:var(--green)'; clearInterval(autoInterval); }
};
async function refreshLogs() {
  const [lr, sr] = await Promise.all([fetch('/api/logs'), fetch('/api/cache-status')]);
  const logs = await lr.json(); const stats = await sr.json();
  if (stats.success) { const c=stats.data.counter; document.getElementById('sReqs').textContent=c.requests; document.getElementById('sCHits').textContent=c.cacheHits; document.getElementById('sCMiss').textContent=c.cacheMisses; document.getElementById('sCron').textContent=c.cronRuns; }
  const body = document.getElementById('sLogBody');
  if (!logs.data.length) { body.innerHTML='<div class="log-empty">No requests yet — fire some above</div>'; return; }
  body.innerHTML = logs.data.map(r => {
    const cls=r.status>=400?'s4xx':'s2xx'; const mCls=r.method==='POST'?'post':r.method==='DELETE'?'del':'get';
    return `<div class="log-row ${mCls}"><span class="method">${r.method}</span><span>${r.url}</span><span><span class="status ${cls}">${r.status}</span></span><span style="color:${r.ms>150?'var(--orange)':'var(--text2)'}">${r.ms?.toFixed(1)}ms</span><span class="muted" style="font-size:11px">${new Date(r.time).toLocaleTimeString('en-IN')}</span></div>`;
  }).join('');
}
async function refreshCacheStats() {
  const r = await fetch('/api/cache-status'); const d = await r.json();
  if (!d.success) return;
  document.getElementById('cKeys').textContent=d.data.keyCount;
  document.getElementById('cHits').textContent=d.data.stats.hits;
  document.getElementById('cMiss').textContent=d.data.stats.misses;
  document.getElementById('cKeyList').innerHTML=d.data.keys.map(k=>`<span class="tag-chip">${k}</span>`).join('') || '<span class="muted" style="font-size:12px">No keys cached</span>';
}
window.flushCache = async () => { await fetch('/api/cache/flush',{method:'POST'}); refreshCacheStats(); };
async function refreshCronLogs() {
  const r = await fetch('/api/cron-logs'); const d = await r.json();
  const el = document.getElementById('cronLogBody');
  if (!d.data.length) { el.innerHTML='<div class="log-empty">Waiting for cron (up to 10s)...</div>'; return; }
  el.innerHTML=d.data.map(r=>`<div class="cron-log-row"><span class="cron-job">${r.job}</span><span class="cron-msg">${r.message}</span><span class="cron-time">${new Date(r.time).toLocaleTimeString('en-IN')}</span></div>`).join('');
}
setInterval(refreshLogs, 2000); setInterval(refreshCacheStats, 5000); setInterval(refreshCronLogs, 3000);

// ─── Password Meter ───────────────────────────────────────────
document.getElementById('pwInput').addEventListener('input', function() {
  const p=this.value; let score=0;
  const checks=[{re:/[A-Z]/,label:'Uppercase'},{re:/[a-z]/,label:'Lowercase'},{re:/[0-9]/,label:'Number'},{re:/[^A-Za-z0-9]/,label:'Symbol'},{re:/.{8,}/,label:'8+ chars'},{re:/.{12,}/,label:'12+ chars'}];
  const det=checks.map(c=>{const ok=c.re.test(p);if(ok)score++;return `<span class="pw-req ${ok?'ok':'fail'}">${ok?'✓':'✗'} ${c.label}</span>`;});
  const bar=document.getElementById('pwBar');
  const pct=Math.min(100,score*17);
  const col=pct<30?'var(--red)':pct<60?'var(--orange)':'var(--green)';
  bar.style.width=pct+'%'; bar.style.background=col;
  const labels=['','Weak','Weak','Fair','Good','Strong','Very Strong'];
  document.getElementById('pwLabel').textContent=p?labels[score]||'Very Strong':'Type a password...';
  document.getElementById('pwDetails').innerHTML=det.join('');
});
window.genPw = function() {
  const chars='abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
  const pw=Array.from({length:16},()=>chars[Math.floor(Math.random()*chars.length)]).join('');
  document.getElementById('pwInput').value=pw;
  document.getElementById('pwInput').dispatchEvent(new Event('input'));
};

// ─── DOM Lab ──────────────────────────────────────────────────
window.addEl = function() {
  const text=document.getElementById('domText').value.trim();
  const tag=document.getElementById('domTag').value;
  const color=document.getElementById('domColor').value;
  if(!text) return;
  const el=document.createElement(tag);
  el.textContent=text; el.style.color=color; el.style.marginBottom='8px';
  el.style.padding='6px 0'; el.style.borderBottom='1px solid var(--border)'; el.style.cursor='pointer';
  el.title='Click to remove'; el.addEventListener('click',()=>el.remove());
  document.getElementById('domOutput').appendChild(el);
  document.getElementById('domText').value='';
};

// ─── Todo ─────────────────────────────────────────────────────
function saveTodos() { localStorage.setItem('dv_todos', JSON.stringify(todos)); }
function renderTodos() {
  const el=document.getElementById('todoList');
  el.innerHTML=todos.map((t,i)=>`<div class="todo-item ${t.done?'done':''}"><input type="checkbox" class="todo-checkbox" ${t.done?'checked':''} onchange="toggleTodo(${i})"/><span>${t.text}</span><button class="btn btn-sm" style="background:#ffebe9;border-color:var(--red);color:var(--red)" onclick="delTodo(${i})"><i class="bi bi-x"></i></button></div>`).join('');
}
window.addTodo=function(){const t=document.getElementById('todoInput').value.trim();if(!t)return;todos.unshift({text:t,done:false});document.getElementById('todoInput').value='';saveTodos();renderTodos();};
window.toggleTodo=function(i){todos[i].done=!todos[i].done;saveTodos();renderTodos();};
window.delTodo=function(i){todos.splice(i,1);saveTodos();renderTodos();};
window.clearDone=function(){todos=todos.filter(t=>!t.done);saveTodos();renderTodos();};
renderTodos();

// ─── Task routing from hero ───────────────────────────────────
const task01Route='home',task02Route='auth',task03Route='showcase',task04Route='advanced',task05Route='notes',task06Route='auth',task07Route='weather',task08Route='server';

// ─── Hamburger menu ───────────────────────────────────────────
const hamburger = document.getElementById('navHamburger');
const navbar    = document.querySelector('.navbar');
hamburger.addEventListener('click', () => {
  navbar.classList.toggle('nav-mobile-open');
  hamburger.innerHTML = navbar.classList.contains('nav-mobile-open')
    ? '<i class="bi bi-x-lg"></i>'
    : '<i class="bi bi-list"></i>';
});
// Close menu when any nav button is clicked
document.querySelectorAll('.nav-btn').forEach(b => b.addEventListener('click', () => {
  navbar.classList.remove('nav-mobile-open');
  hamburger.innerHTML = '<i class="bi bi-list"></i>';
}));

// ─── Init ─────────────────────────────────────────────────────
updateNav();
if (user && token) { document.getElementById('verifyBtn').disabled=false; showToken(token); }
searchWeather('Mumbai');
