/**
 * DataVault Task 08 — Server Features Frontend
 * Live request logs, cache hit/miss demo, cron job live feed
 */
(function () {
  'use strict';

  let autoInterval = null;
  let isAuto = false;

  // ─── Tab Router ───────────────────────────────────────────
  document.querySelectorAll('.dv-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.dv-tab').forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.dv-view').forEach(v => v.classList.remove('active'));
      tab.classList.add('active');
      document.getElementById('view-' + tab.dataset.view).classList.add('active');
    });
  });

  // ─── Hit endpoint ─────────────────────────────────────────
  window.hit = async function (url) {
    try { await fetch(url); } catch {}
  };

  // ─── Auto-fire toggle ─────────────────────────────────────
  window.toggleAuto = function () {
    isAuto = !isAuto;
    const btn = document.getElementById('autoBtn');
    if (isAuto) {
      btn.innerHTML = '<i class="bi bi-stop-fill"></i> Stop Auto';
      btn.style.cssText = 'background:#ffebe9;border-color:#cf222e;color:#cf222e';
      autoInterval = setInterval(() => {
        const urls = ['/api/products', '/api/products/1', '/api/products/2', '/api/cache-status'];
        fetch(urls[Math.floor(Math.random() * urls.length)]);
      }, 800);
    } else {
      btn.innerHTML = '<i class="bi bi-play-fill"></i> Auto-fire';
      btn.style.cssText = 'background:#dafbe1;border-color:#1a7f37;color:#1a7f37';
      clearInterval(autoInterval);
    }
  };

  // ─── Refresh Logs ─────────────────────────────────────────
  async function refreshLogs() {
    const [logsRes, statsRes] = await Promise.all([
      fetch('/api/logs'), fetch('/api/cache-status')
    ]);
    const logs  = await logsRes.json();
    const stats = await statsRes.json();

    // Update stats chips
    if (stats.success) {
      const c = stats.data.counter;
      document.getElementById('statReqs').textContent   = c.requests;
      document.getElementById('statHits').textContent   = c.cacheHits;
      document.getElementById('statMisses').textContent = c.cacheMisses;
      document.getElementById('statCron').textContent   = c.cronRuns;
    }

    // Render log rows
    const body = document.getElementById('logBody');
    if (!logs.data.length) {
      body.innerHTML = '<div class="dv-log-empty">No requests yet — click a button above to generate logs</div>';
      return;
    }
    body.innerHTML = logs.data.map(r => {
      const cls = r.status >= 500 ? 's5xx' : r.status >= 400 ? 's4xx' : 's2xx';
      const mCls = r.method === 'POST' ? 'post' : r.method === 'DELETE' ? 'delete' : 'get';
      const ts = new Date(r.time).toLocaleTimeString('en-IN');
      const msColor = r.ms > 150 ? 'color:var(--dv-orange)' : 'color:var(--dv-text-3)';
      return `<div class="dv-log-row ${mCls}">
        <span class="method">${r.method}</span>
        <span>${r.url}</span>
        <span><span class="dv-status ${cls}">${r.status}</span></span>
        <span style="color:var(--dv-text-3)">${r.bytes || '—'}</span>
        <span style="${msColor}">${r.ms?.toFixed(1) || '—'}ms</span>
        <span class="dv-ts">${ts}</span>
      </div>`;
    }).join('');
  }

  // ─── Cache Dashboard ──────────────────────────────────────
  document.getElementById('fetchAllBtn').addEventListener('click', async () => {
    const btn = document.getElementById('fetchAllBtn');
    btn.disabled = true;
    btn.innerHTML = '<i class="bi bi-hourglass-split"></i> Fetching...';
    const t0  = Date.now();
    const res = await fetch('/api/products');
    const ms  = Date.now() - t0;
    const data = await res.json();
    btn.disabled = false;
    btn.innerHTML = '<i class="bi bi-download"></i> Fetch All Products';

    const srcEl = document.getElementById('cacheSource');
    srcEl.style.display = 'flex';
    if (data.source === 'cache') {
      srcEl.className = 'dv-cache-source source-cache';
      srcEl.innerHTML = `⚡ Cache HIT — served in ${ms}ms (from memory, no DB call)`;
    } else {
      srcEl.className = 'dv-cache-source source-db';
      srcEl.innerHTML = `🗄️ Cache MISS — fetched from DB in ${ms}ms, now cached for 30s`;
    }

    const result = document.getElementById('productsResult');
    result.innerHTML = data.data.map(p => `
      <div class="dv-product-row">
        <span><strong>#${p.id}</strong> ${p.name}</span>
        <span>${p.price ? '₹' + p.price : ''} <span class="dv-product-tag">${p.category}</span></span>
      </div>`).join('');
    refreshCacheStats();
  });

  document.getElementById('flushBtn').addEventListener('click', async () => {
    await fetch('/api/cache/flush', { method: 'POST' });
    const srcEl = document.getElementById('cacheSource');
    srcEl.style.display = 'flex';
    srcEl.className = 'dv-cache-source source-db';
    srcEl.innerHTML = '🗑️ Cache flushed — next fetch will hit the database';
    document.getElementById('productsResult').innerHTML = '';
    refreshCacheStats();
  });

  async function refreshCacheStats() {
    const res  = await fetch('/api/cache-status');
    const data = await res.json();
    if (!data.success) return;
    const d = data.data;
    document.getElementById('cacheKeys').textContent   = d.keyCount;
    document.getElementById('cacheHits').textContent   = d.stats.hits;
    document.getElementById('cacheMisses').textContent = d.stats.misses;
    const keyList = document.getElementById('cachedKeysList');
    keyList.innerHTML = d.keys.length
      ? d.keys.map(k => `<span class="dv-key-chip">${k}</span>`).join('')
      : '<span style="font-size:12px;color:var(--dv-text-3)">No keys cached</span>';
  }

  // ─── Cron Logs ────────────────────────────────────────────
  async function refreshCronLogs() {
    const res  = await fetch('/api/cron-logs');
    const data = await res.json();
    const body = document.getElementById('cronLogBody');
    if (!data.data.length) {
      body.innerHTML = '<div class="dv-log-empty">Waiting for first cron run... (up to 10 seconds)</div>';
      return;
    }
    body.innerHTML = data.data.map(r => {
      const ts = new Date(r.time).toLocaleTimeString('en-IN');
      return `<div class="dv-cron-log-row">
        <span class="dv-cron-job">${r.job}<span class="dv-cron-sched">${r.schedule}</span></span>
        <span class="dv-cron-msg">${r.message}</span>
        <span class="dv-cron-time">${ts}</span>
      </div>`;
    }).join('');
  }

  // ─── Init — auto-refresh ──────────────────────────────────
  refreshLogs();
  refreshCacheStats();
  refreshCronLogs();

  setInterval(refreshLogs,     2000);
  setInterval(refreshCacheStats, 5000);
  setInterval(refreshCronLogs,   3000);
})();
