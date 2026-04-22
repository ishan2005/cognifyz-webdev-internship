const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// ─── View Engine ───────────────────────────────────────────────────────────────
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// ─── Static Files ──────────────────────────────────────────────────────────────
app.use(express.static(path.join(__dirname, 'public')));

// ─── Body Parser ───────────────────────────────────────────────────────────────
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// ─── Routes ────────────────────────────────────────────────────────────────────

// GET / — Landing page
app.get('/', (req, res) => {
  res.render('index', {
    title: 'DataVault — Secure Your Data',
    message: null,
    messageType: null,
  });
});

// POST /contact — Handle contact form submission
app.post('/contact', (req, res) => {
  const { name, email, subject, message } = req.body;

  // Basic server-side check (full validation in Task 02)
  if (!name || !email || !message) {
    return res.render('index', {
      title: 'DataVault — Secure Your Data',
      message: 'Please fill in all required fields.',
      messageType: 'error',
    });
  }

  console.log(`📩 New contact from: ${name} <${email}> | Subject: ${subject}`);

  res.render('index', {
    title: 'DataVault — Secure Your Data',
    message: `Thanks ${name}! Your message has been received. We'll get back to you at ${email}.`,
    messageType: 'success',
  });
});

// ─── 404 Handler ───────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).render('index', {
    title: 'Page Not Found',
    message: 'Oops! The page you are looking for does not exist.',
    messageType: 'error',
  });
});

// ─── Start Server ──────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🚀 DataVault server is running!`);
  console.log(`   → Local:   http://localhost:${PORT}`);
  console.log(`   → Task:    01 — Server Setup & Landing Page\n`);
});
