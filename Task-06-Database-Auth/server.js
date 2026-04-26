require('dotenv').config();
const express   = require('express');
const mongoose  = require('mongoose');
const path      = require('path');
const bcrypt    = require('bcryptjs');
const jwt       = require('jsonwebtoken');

const app  = express();
const PORT = process.env.PORT || 3005;

// ─── Middleware ──────────────────────────────────────────────
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─── MongoDB Connection ──────────────────────────────────────
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB Atlas connected — datavault'))
  .catch(err => console.error('❌ MongoDB error:', err.message));

// ─── User Schema & Model ─────────────────────────────────────
const userSchema = new mongoose.Schema({
  name:      { type: String, required: true, trim: true, minlength: 2 },
  email:     { type: String, required: true, unique: true, lowercase: true, trim: true },
  password:  { type: String, required: true, minlength: 6 },
  role:      { type: String, enum: ['user', 'admin'], default: 'user' },
  avatar:    { type: String, default: '' },
  createdAt: { type: Date, default: Date.now },
});

// Hash password before save
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Compare password method
userSchema.methods.matchPassword = async function (plain) {
  return bcrypt.compare(plain, this.password);
};

const User = mongoose.model('User', userSchema);

// ─── JWT Helper ──────────────────────────────────────────────
function signToken(id) {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });
}

// ─── Auth Middleware ─────────────────────────────────────────
function protect(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1]
    || req.cookies?.token;
  if (!token) return res.status(401).json({ success: false, error: 'Not authorised — no token' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.id;
    next();
  } catch {
    res.status(401).json({ success: false, error: 'Token invalid or expired' });
  }
}

// ─── API Routes ──────────────────────────────────────────────

// POST /api/auth/register
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ success: false, error: 'All fields required' });
    if (await User.findOne({ email }))
      return res.status(409).json({ success: false, error: 'Email already registered' });
    const user = await User.create({ name, email, password });
    const token = signToken(user._id);
    res.status(201).json({
      success: true,
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role, createdAt: user.createdAt }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/auth/login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ success: false, error: 'Email and password required' });
    const user = await User.findOne({ email });
    if (!user || !(await user.matchPassword(password)))
      return res.status(401).json({ success: false, error: 'Invalid email or password' });
    const token = signToken(user._id);
    res.json({
      success: true,
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role, createdAt: user.createdAt }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/auth/me — protected route
app.get('/api/auth/me', protect, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password');
    if (!user) return res.status(404).json({ success: false, error: 'User not found' });
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/users — protected, list all users (admin view)
app.get('/api/users', protect, async (req, res) => {
  try {
    const users = await User.find().select('-password').sort('-createdAt');
    res.json({ success: true, count: users.length, data: users });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE /api/users/:id — delete a user
app.delete('/api/users/:id', protect, async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ success: false, error: 'User not found' });
    res.json({ success: true, message: 'User deleted', data: user });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/db-status
app.get('/api/db-status', (req, res) => {
  const states = ['disconnected', 'connected', 'connecting', 'disconnecting'];
  const state  = mongoose.connection.readyState;
  res.json({ success: true, db: { state: states[state], host: mongoose.connection.host, name: mongoose.connection.name } });
});

// Frontend shell
app.get('*', (req, res) => res.render('index', { title: 'DataVault — Auth' }));

app.listen(PORT, () => {
  console.log(`\n🚀 Task 06 server running!`);
  console.log(`   → Local: http://localhost:${PORT}`);
  console.log(`   → Task:  06 — MongoDB Atlas + JWT Auth\n`);
});
