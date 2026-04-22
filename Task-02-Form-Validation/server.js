const express = require('express');
const path    = require('path');

const app  = express();
const PORT = process.env.PORT || 3001;

// ─── In-Memory Store (Task 02 — no DB yet) ─────────────────
// Key: email (string) → Value: user object
const usersMap = new Map();

// ─── View Engine ────────────────────────────────────────────
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// ─── Static Files ───────────────────────────────────────────
app.use(express.static(path.join(__dirname, 'public')));

// ─── Body Parser ────────────────────────────────────────────
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// ─── Server-Side Validation Helper ──────────────────────────
function validateUser({ name, email, password, confirmPassword, phone, dob }) {
  const errors = {};

  // Name
  if (!name || name.trim().length < 2)
    errors.name = 'Name must be at least 2 characters.';

  // Email
  const emailRx = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRx.test(email))
    errors.email = 'Please enter a valid email address.';
  else if (usersMap.has(email.toLowerCase()))
    errors.email = 'This email is already registered.';

  // Password
  const passRx = /^(?=.*[A-Z])(?=.*\d).{8,}$/;
  if (!password || !passRx.test(password))
    errors.password = 'Password must be 8+ chars with 1 uppercase and 1 number.';

  // Confirm Password
  if (password !== confirmPassword)
    errors.confirmPassword = 'Passwords do not match.';

  // Phone
  const phoneRx = /^[6-9]\d{9}$/;
  if (!phone || !phoneRx.test(phone.replace(/\s/g, '')))
    errors.phone = 'Enter a valid 10-digit Indian mobile number.';

  // Date of Birth (must be 18+)
  if (!dob) {
    errors.dob = 'Date of birth is required.';
  } else {
    const birthDate = new Date(dob);
    const today     = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
    if (age < 18) errors.dob = 'You must be at least 18 years old.';
  }

  return errors;
}

// ─── Routes ─────────────────────────────────────────────────

// GET / → redirect to register
app.get('/', (req, res) => res.redirect('/register'));

// GET /register
app.get('/register', (req, res) => {
  res.render('register', {
    title: 'Register — DataVault',
    errors: {},
    old: {},
    success: null,
  });
});

// POST /register
app.post('/register', (req, res) => {
  const { name, email, password, confirmPassword, phone, dob } = req.body;
  const old    = { name, email, phone, dob };
  const errors = validateUser({ name, email, password, confirmPassword, phone, dob });

  if (Object.keys(errors).length > 0) {
    return res.render('register', {
      title: 'Register — DataVault',
      errors,
      old,
      success: null,
    });
  }

  // Store user (no password in plain text — Task 06 adds bcrypt)
  usersMap.set(email.toLowerCase(), {
    id:        Date.now().toString(),
    name:      name.trim(),
    email:     email.toLowerCase(),
    phone,
    dob,
    createdAt: new Date().toISOString(),
  });

  console.log(`✅ New user registered: ${name} <${email}>`);
  res.redirect('/users');
});

// GET /users — view all registered users
app.get('/users', (req, res) => {
  const users = Array.from(usersMap.values()).reverse();
  res.render('users', {
    title: 'Registered Users — DataVault',
    users,
  });
});

// ─── 404 ────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).redirect('/register');
});

// ─── Start ───────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🚀 Task 02 server running!`);
  console.log(`   → Local:  http://localhost:${PORT}`);
  console.log(`   → Task:   02 — Form Validation\n`);
});
