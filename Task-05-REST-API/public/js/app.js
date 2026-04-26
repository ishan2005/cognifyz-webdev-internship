/**
 * DataVault Task 05 — REST API Frontend
 * Fetch API calls for full CRUD + tab routing + API tester
 */
(function () {
  'use strict';

  const API = '/api/notes';
  let allNotes = [];
  let activeTag = '';
  let searchQuery = '';
  let editMode = false;

  // ─── Tab Router ──────────────────────────────────────────────
  document.querySelectorAll('.dv-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.dv-tab').forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.dv-view').forEach(v => v.classList.remove('active'));
      tab.classList.add('active');
      document.getElementById('view-' + tab.dataset.view).classList.add('active');
    });
  });

  // ─── Fetch helpers ────────────────────────────────────────────
  async function apiFetch(url, opts = {}) {
    const res = await fetch(url, {
      headers: { 'Content-Type': 'application/json' },
      ...opts,
    });
    const data = await res.json();
    showLog(data, res.status);
    return data;
  }

  function showLog(data, status) {
    const el = document.getElementById('responseBody');
    if (el) el.textContent = JSON.stringify(data, null, 2);
  }

  // ─── Load Notes ───────────────────────────────────────────────
  async function loadNotes() {
    const url = activeTag ? `${API}?tag=${activeTag}` : API;
    const data = await apiFetch(url);
    allNotes = data.data || [];
    renderNotes();
    loadStats();
    buildTagFilters();
  }

  function renderNotes() {
    const list = document.getElementById('notesList');
    const q = searchQuery.toLowerCase();
    const filtered = allNotes.filter(n =>
      !q || n.title.toLowerCase().includes(q) || n.body.toLowerCase().includes(q)
    );

    if (filtered.length === 0) {
      list.innerHTML = `<div class="dv-notes-empty"><i class="bi bi-journals"></i><p>No notes found.</p></div>`;
      return;
    }

    list.innerHTML = filtered.map(n => `
      <div class="dv-note-card" id="note-${n.id}">
        <div class="dv-note-top">
          <div class="dv-note-title">${esc(n.title)}</div>
          <span class="dv-note-tag">${esc(n.tag)}</span>
        </div>
        <div class="dv-note-body">${esc(n.body)}</div>
        <div class="dv-note-footer">
          <span class="dv-note-id">ID: ${n.id} · ${formatDate(n.updatedAt || n.createdAt)}</span>
          <div class="dv-note-actions">
            <button class="dv-btn dv-btn-default dv-btn-sm" onclick="editNote(${n.id})">
              <i class="bi bi-pencil"></i> Edit
            </button>
            <button class="dv-btn dv-btn-danger dv-btn-sm" onclick="deleteNote(${n.id})">
              <i class="bi bi-trash3"></i>
            </button>
          </div>
        </div>
      </div>`).join('');
  }

  async function loadStats() {
    const data = await apiFetch('/api/stats');
    if (!data.success) return;
    document.getElementById('statTotal').textContent = data.data.total;
    document.getElementById('statTags').textContent  = data.data.tags.length;
    const tagList = document.getElementById('statTagList');
    tagList.innerHTML = Object.entries(data.data.tagCounts).map(([tag, count]) =>
      `<span class="dv-tag-chip">${tag} (${count})</span>`
    ).join('');
  }

  function buildTagFilters() {
    const tags = [...new Set(allNotes.map(n => n.tag))];
    const bar = document.getElementById('tagFilter');
    bar.innerHTML = `<button class="dv-filter ${!activeTag ? 'active' : ''}" data-tag="">All</button>` +
      tags.map(t => `<button class="dv-filter ${activeTag === t ? 'active' : ''}" data-tag="${t}">${t}</button>`).join('');
    bar.querySelectorAll('.dv-filter').forEach(btn => {
      btn.addEventListener('click', () => {
        activeTag = btn.dataset.tag;
        bar.querySelectorAll('.dv-filter').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        renderNotes();
      });
    });
  }

  // ─── Create / Update ──────────────────────────────────────────
  document.getElementById('submitBtn').addEventListener('click', async () => {
    const title = document.getElementById('noteTitle').value.trim();
    const body  = document.getElementById('noteBody').value.trim();
    const tag   = document.getElementById('noteTag').value;
    const id    = document.getElementById('editId').value;
    if (!title || !body) return alert('Title and body are required.');

    if (editMode && id) {
      await apiFetch(`${API}/${id}`, { method: 'PUT', body: JSON.stringify({ title, body, tag }) });
    } else {
      await apiFetch(API, { method: 'POST', body: JSON.stringify({ title, body, tag }) });
    }
    resetForm();
    loadNotes();
  });

  window.editNote = function (id) {
    const note = allNotes.find(n => n.id === id);
    if (!note) return;
    document.getElementById('editId').value   = id;
    document.getElementById('noteTitle').value = note.title;
    document.getElementById('noteBody').value  = note.body;
    document.getElementById('noteTag').value   = note.tag;
    document.getElementById('submitBtn').innerHTML = '<i class="bi bi-check-lg"></i> Update Note';
    document.getElementById('cancelEditBtn').style.display = '';
    document.getElementById('formTitle').innerHTML =
      '<i class="bi bi-pencil-fill" style="color:var(--dv-orange)"></i> Edit Note <span class="dv-method-pill put">PUT</span>';
    editMode = true;
    document.getElementById('noteFormCard').scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  window.deleteNote = async function (id) {
    const card = document.getElementById('note-' + id);
    if (card) { card.style.opacity = '0'; card.style.transform = 'translateX(8px)'; card.style.transition = 'all .15s ease'; }
    await apiFetch(`${API}/${id}`, { method: 'DELETE' });
    setTimeout(loadNotes, 150);
  };

  document.getElementById('cancelEditBtn').addEventListener('click', resetForm);

  function resetForm() {
    document.getElementById('editId').value = '';
    document.getElementById('noteTitle').value = '';
    document.getElementById('noteBody').value  = '';
    document.getElementById('noteTag').value   = 'general';
    document.getElementById('submitBtn').innerHTML = '<i class="bi bi-plus-lg"></i> Create Note';
    document.getElementById('cancelEditBtn').style.display = 'none';
    document.getElementById('formTitle').innerHTML =
      '<i class="bi bi-plus-circle-fill" style="color:var(--dv-green)"></i> Create Note <span class="dv-method-pill post">POST</span>';
    editMode = false;
  }

  // ─── Search ───────────────────────────────────────────────────
  document.getElementById('searchInput').addEventListener('input', e => {
    searchQuery = e.target.value;
    renderNotes();
  });

  document.getElementById('refreshBtn').addEventListener('click', loadNotes);

  // ─── API Tester ───────────────────────────────────────────────
  document.getElementById('reqMethod').addEventListener('change', function () {
    document.getElementById('bodyGroup').style.display =
      ['POST','PUT'].includes(this.value) ? '' : 'none';
  });

  document.querySelectorAll('.dv-quick-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.getElementById('reqMethod').value = btn.dataset.method;
      document.getElementById('reqUrl').value    = btn.dataset.url;
      document.getElementById('reqBody').value   = btn.dataset.body || '';
      document.getElementById('bodyGroup').style.display =
        ['POST','PUT'].includes(btn.dataset.method) ? '' : 'none';
    });
  });

  document.getElementById('sendReqBtn').addEventListener('click', async () => {
    const method  = document.getElementById('reqMethod').value;
    const url     = document.getElementById('reqUrl').value.trim();
    const bodyTxt = document.getElementById('reqBody').value.trim();
    const respEl  = document.getElementById('apiRespBody');
    const statusEl= document.getElementById('respStatus');
    const timeEl  = document.getElementById('respTime');

    respEl.textContent = '// Loading...';
    const t0 = Date.now();
    try {
      const opts = { method, headers: { 'Content-Type': 'application/json' } };
      if (['POST','PUT'].includes(method) && bodyTxt) opts.body = bodyTxt;
      const res  = await fetch(url, opts);
      const ms   = Date.now() - t0;
      const data = await res.json();
      respEl.textContent = JSON.stringify(data, null, 2);
      statusEl.textContent = res.status + ' ' + res.statusText;
      statusEl.className   = 'dv-status-badge ' + (res.ok ? 'status-2xx' : 'status-4xx');
      timeEl.textContent   = ms + 'ms';
      if (res.ok) loadNotes();
    } catch (e) {
      respEl.textContent = '// Error: ' + e.message;
    }
  });

  // ─── Helpers ─────────────────────────────────────────────────
  function esc(str) {
    return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  }
  function formatDate(iso) {
    if (!iso) return '';
    return new Date(iso).toLocaleString('en-IN', { dateStyle:'short', timeStyle:'short' });
  }

  // ─── Init ─────────────────────────────────────────────────────
  loadNotes();
})();
