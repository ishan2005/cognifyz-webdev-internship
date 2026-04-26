/**
 * DataVault Task 07 — Weather API Frontend
 * Fetch weather, show rate limit bar, cities dashboard, spam tester
 */
(function () {
  'use strict';

  // ─── Tab Router ───────────────────────────────────────────
  document.querySelectorAll('.dv-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.dv-tab').forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.dv-view').forEach(v => v.classList.remove('active'));
      tab.classList.add('active');
      document.getElementById('view-' + tab.dataset.view).classList.add('active');
      if (tab.dataset.view === 'cities') loadCities();
    });
  });

  // ─── Weather icons ────────────────────────────────────────
  const icons = {
    '01d':'☀️','01n':'🌙','02d':'⛅','02n':'⛅','03d':'☁️','03n':'☁️',
    '04d':'☁️','04n':'☁️','09d':'🌧️','09n':'🌧️','10d':'🌦️','10n':'🌦️',
    '11d':'⛈️','11n':'⛈️','13d':'❄️','13n':'❄️','50d':'🌫️','50n':'🌫️'
  };
  function getIcon(code) { return icons[code] || '🌤️'; }

  function windDir(deg) {
    const dirs = ['N','NE','E','SE','S','SW','W','NW'];
    return dirs[Math.round(deg / 45) % 8];
  }

  function formatTime(ms) {
    return new Date(ms).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  }

  // ─── Search ───────────────────────────────────────────────
  async function searchWeather(city) {
    const result   = document.getElementById('weatherResult');
    const errorCard= document.getElementById('errorCard');
    const rateBar  = document.getElementById('rateBar');
    errorCard.style.display = 'none';
    result.innerHTML = '<div style="text-align:center;padding:32px;color:var(--dv-text-3)"><i class="bi bi-cloud-arrow-down" style="font-size:32px;display:block;margin-bottom:8px;animation:spin 1.5s linear infinite"></i>Fetching weather...</div>';

    try {
      const res  = await fetch('/api/weather?city=' + encodeURIComponent(city));
      const data = await res.json();

      // Show rate bar
      if (data.rateLimit) {
        rateBar.style.display = 'flex';
        const rem = data.rateLimit.remaining;
        const lim = data.rateLimit.limit;
        const pct = (rem / lim) * 100;
        document.getElementById('rateText').textContent = `${rem} / ${lim} requests remaining`;
        const fill = document.getElementById('rateFill');
        fill.style.width = pct + '%';
        fill.className = 'dv-rate-fill' + (pct <= 20 ? ' danger' : pct <= 50 ? ' warn' : '');
        document.getElementById('rateReset').textContent = 'Resets: ' + new Date(data.rateLimit.resetTime).toLocaleTimeString('en-IN');
      }

      if (!data.success) {
        result.innerHTML = '';
        document.getElementById('errorTitle').textContent = res.status === 429 ? '🚫 Rate Limited!' : 'Error';
        document.getElementById('errorMsg').textContent = data.error;
        errorCard.style.display = 'flex';
        return;
      }

      const d = data.data;
      result.innerHTML = `
        <div class="dv-weather-card">
          <div class="dv-wc-header">
            <div>
              <div class="dv-wc-city">${d.city}</div>
              <div class="dv-wc-country">📍 ${d.country} · ${d.lat.toFixed(2)}°N, ${d.lon.toFixed(2)}°E</div>
              <div class="dv-wc-icon">${getIcon(d.icon)}</div>
              <div class="dv-wc-desc">${d.description}</div>
            </div>
            <div class="dv-wc-temp-block">
              <div class="dv-wc-temp">${d.temp}°C</div>
              <div class="dv-wc-feels">Feels like ${d.feels_like}°C</div>
              ${data.mock ? '<span class="dv-mock-badge">⚠️ Mock Data</span>' : ''}
            </div>
          </div>
          <div class="dv-wc-stats">
            <div class="dv-wc-stat"><div class="dv-wc-stat-label">💧 Humidity</div><div class="dv-wc-stat-val">${d.humidity}%</div></div>
            <div class="dv-wc-stat"><div class="dv-wc-stat-label">💨 Wind</div><div class="dv-wc-stat-val">${d.wind_speed} m/s ${windDir(d.wind_deg)}</div></div>
            <div class="dv-wc-stat"><div class="dv-wc-stat-label">📊 Pressure</div><div class="dv-wc-stat-val">${d.pressure} hPa</div></div>
            <div class="dv-wc-stat"><div class="dv-wc-stat-label">👁️ Visibility</div><div class="dv-wc-stat-val">${(d.visibility/1000).toFixed(1)} km</div></div>
            <div class="dv-wc-stat"><div class="dv-wc-stat-label">🌅 Sunrise</div><div class="dv-wc-stat-val">${formatTime(d.sunrise)}</div></div>
            <div class="dv-wc-stat"><div class="dv-wc-stat-label">🌇 Sunset</div><div class="dv-wc-stat-val">${formatTime(d.sunset)}</div></div>
          </div>
          <div class="dv-wc-footer">
            <span>Fetched: ${new Date(d.fetchedAt).toLocaleString('en-IN')}</span>
            <span>Source: OpenWeatherMap API</span>
          </div>
        </div>`;
    } catch (e) {
      result.innerHTML = '';
      document.getElementById('errorTitle').textContent = 'Network Error';
      document.getElementById('errorMsg').textContent = e.message;
      errorCard.style.display = 'flex';
    }
  }

  document.getElementById('searchBtn').addEventListener('click', () => {
    const city = document.getElementById('cityInput').value.trim();
    if (city) searchWeather(city);
  });

  document.getElementById('cityInput').addEventListener('keydown', e => {
    if (e.key === 'Enter') {
      const city = e.target.value.trim();
      if (city) searchWeather(city);
    }
  });

  document.querySelectorAll('.dv-city-pill').forEach(pill => {
    pill.addEventListener('click', () => {
      document.getElementById('cityInput').value = pill.dataset.city;
      searchWeather(pill.dataset.city);
    });
  });

  // ─── Cities Dashboard ─────────────────────────────────────
  async function loadCities() {
    const grid = document.getElementById('citiesGrid');
    grid.innerHTML = '<div class="dv-loading"><i class="bi bi-arrow-clockwise"></i><p>Loading cities...</p></div>';
    try {
      const res  = await fetch('/api/weather/cities');
      const data = await res.json();
      if (!data.success) { grid.innerHTML = '<p>Error loading cities</p>'; return; }
      grid.innerHTML = data.data.map(c => `
        <div class="dv-city-card">
          <div class="dv-city-card-name">${c.city}</div>
          <div class="dv-city-card-icon">${getIcon(c.icon)}</div>
          <div class="dv-city-card-temp">${c.temp}°C</div>
          <div class="dv-city-card-desc">${c.description}</div>
          <div class="dv-city-card-hum">💧 ${c.humidity}% humidity</div>
        </div>`).join('');
    } catch (e) {
      grid.innerHTML = '<p style="color:var(--dv-red)">Error: ' + e.message + '</p>';
    }
  }

  // ─── Rate Limit Tester ────────────────────────────────────
  let reqCount = 0, reqOk = 0, reqLimited = 0;

  document.getElementById('spamBtn').addEventListener('click', async () => {
    reqCount++;
    document.getElementById('reqCount').textContent = reqCount;
    const responses = document.getElementById('rlResponses');
    try {
      const res  = await fetch('/api/weather?city=Mumbai');
      const data = await res.json();
      const ts   = new Date().toLocaleTimeString('en-IN');
      if (res.status === 429) {
        reqLimited++;
        document.getElementById('reqLimited').textContent = reqLimited;
        const el = document.createElement('div');
        el.className = 'dv-rl-resp limited';
        el.innerHTML = `🚫 [${ts}] 429 Too Many Requests — ${data.error}`;
        responses.prepend(el);
      } else {
        reqOk++;
        document.getElementById('reqOk').textContent = reqOk;
        const remaining = data.rateLimit?.remaining ?? '?';
        const el = document.createElement('div');
        el.className = 'dv-rl-resp ok';
        el.innerHTML = `✅ [${ts}] 200 OK — ${remaining} requests remaining`;
        responses.prepend(el);
      }
    } catch (e) {
      const el = document.createElement('div');
      el.className = 'dv-rl-resp limited';
      el.textContent = `[${new Date().toLocaleTimeString()}] Network error: ${e.message}`;
      responses.prepend(el);
    }
  });

  // ─── Init — load Mumbai on start ─────────────────────────
  searchWeather('Mumbai');
})();
