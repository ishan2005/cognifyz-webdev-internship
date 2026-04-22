const express = require('express');
const path    = require('path');

const app  = express();
const PORT = process.env.PORT || 3002;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));

// ─── Routes ─────────────────────────────────────────────────

// Landing page — showcases all responsive + animation concepts
app.get('/', (req, res) => {
  res.render('index', {
    title: 'DataVault UI — Responsive Design Showcase',
    features: [
      { icon: 'bi-grid-3x3-gap', title: 'Bootstrap 5 Grid', desc: '12-column responsive grid with flexbox utilities and breakpoints.', color: 'blue' },
      { icon: 'bi-palette2', title: 'CSS Custom Properties', desc: 'Design tokens via CSS variables for consistent theming.', color: 'purple' },
      { icon: 'bi-phone', title: 'Mobile-First', desc: 'Layouts adapt fluidly from 320px to 1920px screen widths.', color: 'green' },
      { icon: 'bi-stars', title: 'CSS Animations', desc: '@keyframes, transitions, and scroll-triggered reveal effects.', color: 'orange' },
      { icon: 'bi-window-stack', title: 'Glassmorphism', desc: 'Frosted-glass cards with backdrop-filter blur effects.', color: 'pink' },
      { icon: 'bi-moon-stars', title: 'Light/Dark Ready', desc: 'CSS variables enable instant theme switching.', color: 'teal' },
    ],
    stats: [
      { value: '5', label: 'Breakpoints', suffix: '' },
      { value: '60', label: 'FPS Animations', suffix: '+' },
      { value: '100', label: 'Lighthouse Score', suffix: '' },
      { value: '320', label: 'Min Width (px)', suffix: '' },
    ],
    techStack: [
      { name: 'Bootstrap 5.3', badge: 'CSS Framework', icon: 'bi-bootstrap' },
      { name: 'CSS Variables', badge: 'Design Tokens', icon: 'bi-braces' },
      { name: '@keyframes', badge: 'Animations', icon: 'bi-play-circle' },
      { name: 'Flexbox / Grid', badge: 'Layout', icon: 'bi-layout-three-columns' },
      { name: 'backdrop-filter', badge: 'Glassmorphism', icon: 'bi-layers' },
      { name: 'Media Queries', badge: 'Responsive', icon: 'bi-phone-landscape' },
    ],
  });
});

// 404
app.use((req, res) => res.redirect('/'));

app.listen(PORT, () => {
  console.log(`\n🚀 Task 03 server running!`);
  console.log(`   → Local: http://localhost:${PORT}`);
  console.log(`   → Task:  03 — Responsive UI Design\n`);
});
