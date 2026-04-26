/**
 * DataVault Task 04 — Hash-Based Router
 * Listens to hashchange, shows matching view, updates active tab
 */
(function () {
  'use strict';
  const routes = ['dashboard', 'password', 'dom', 'todo'];

  function getRoute() {
    const hash = window.location.hash.replace('#/', '').trim();
    return routes.includes(hash) ? hash : 'dashboard';
  }

  function navigate(route) {
    document.querySelectorAll('.dv-view').forEach(v => {
      v.classList.add('hidden');
      v.classList.remove('fade-in');
    });
    const target = document.getElementById('view-' + route);
    if (target) {
      target.classList.remove('hidden');
      void target.offsetWidth;
      target.classList.add('fade-in');
    }
    document.querySelectorAll('.dv-tab').forEach(t =>
      t.classList.toggle('active', t.dataset.route === route)
    );
    const hd = document.getElementById('currentHashDisplay');
    if (hd) hd.textContent = '#/' + route;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function init() {
    if (!window.location.hash || window.location.hash === '#') {
      window.location.hash = '#/dashboard';
    } else {
      navigate(getRoute());
    }
  }

  window.addEventListener('hashchange', () => navigate(getRoute()));
  document.readyState === 'loading'
    ? document.addEventListener('DOMContentLoaded', init)
    : init();
})();
