require('dotenv').config();
const express    = require('express');
const mongoose   = require('mongoose');
const morgan     = require('morgan');
const NodeCache  = require('node-cache');
const cron       = require('node-cron');
const rateLimit  = require('express-rate-limit');
const fetch      = require('node-fetch');
const bcrypt     = require('bcryptjs');
const jwt        = require('jsonwebtoken');
const path       = require('path');

const app  = express();
const PORT = process.env.PORT || 4000;

// ─── Cache ───────────────────────────────────────────────────
const cache = new NodeCache({ stdTTL: 30, checkperiod: 10 });

// ─── Log stores ──────────────────────────────────────────────
const reqLogs = [], cronLogs = [];
const MAX = 100;
const push = (arr, item) => { arr.unshift(item); if (arr.length > MAX) arr.pop(); };
let counter = { requests: 0, cacheHits: 0, cacheMisses: 0, cronRuns: 0 };

// ─── Morgan ──────────────────────────────────────────────────
app.use(morgan(':method :url :status :res[content-length] b - :response-time ms', {
  stream: { write: msg => {
    const p = msg.trim().split(' ');
    push(reqLogs, { id: Date.now(), method: p[0], url: p[1], status: parseInt(p[2]),
      bytes: p[3], ms: parseFloat(p[5]), time: new Date().toISOString() });
  }}
}));

// ─── Express setup ────────────────────────────────────────────
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─── MongoDB ──────────────────────────────────────────────────
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB Atlas connected'))
  .catch(e => console.error('❌ MongoDB:', e.message));

// ─── Schemas ─────────────────────────────────────────────────
const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  role: { type: String, default: 'user' },
  createdAt: { type: Date, default: Date.now }
});
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12); next();
});
userSchema.methods.matchPassword = function(p) { return bcrypt.compare(p, this.password); };
const User = mongoose.model('User', userSchema);

const noteSchema = new mongoose.Schema({
  title: { type: String, required: true },
  body:  { type: String, required: true },
  tag:   { type: String, default: 'general' },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});
const Note = mongoose.model('Note', noteSchema);

// ─── JWT helpers ──────────────────────────────────────────────
const signToken = id => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });
const protect = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ success: false, error: 'Not authorised' });
  try { req.userId = jwt.verify(token, process.env.JWT_SECRET).id; next(); }
  catch { res.status(401).json({ success: false, error: 'Token expired' }); }
};

// ─── Rate Limiters ────────────────────────────────────────────
const weatherLimiter = rateLimit({
  windowMs: 60 * 1000, max: 10,
  standardHeaders: true, legacyHeaders: false,
  handler: (req, res) => res.status(429).json({ success: false, error: 'Rate limit: 10 req/min' })
});

// ─── Cron Jobs ────────────────────────────────────────────────
cron.schedule('*/10 * * * * *', () => {
  counter.cronRuns++;
  const s = cache.getStats();
  push(cronLogs, { id: Date.now(), job: '📦 Cache Sweep', schedule: 'every 10s',
    message: `${cache.keys().length} key(s) · ${s.hits} hits · ${s.misses} misses`,
    time: new Date().toISOString() });
});
cron.schedule('*/30 * * * * *', () => {
  counter.cronRuns++;
  push(cronLogs, { id: Date.now(), job: '📊 Stats Snapshot', schedule: 'every 30s',
    message: `Reqs: ${counter.requests} · Cache hits: ${counter.cacheHits} · Misses: ${counter.cacheMisses}`,
    time: new Date().toISOString() });
});
cron.schedule('* * * * *', () => {
  counter.cronRuns++;
  cache.flushAll();
  push(cronLogs, { id: Date.now(), job: '🧹 Cache Flush', schedule: 'every 1 min',
    message: 'All keys cleared', time: new Date().toISOString() });
});

// ══════════════════════════════════════════════════════════════
// API ROUTES
// ══════════════════════════════════════════════════════════════

// ── Auth ──────────────────────────────────────────────────────
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) return res.status(400).json({ success: false, error: 'All fields required' });
    if (await User.findOne({ email })) return res.status(409).json({ success: false, error: 'Email already registered' });
    const user = await User.create({ name, email, password });
    const token = signToken(user._id);
    res.status(201).json({ success: true, token, user: { id: user._id, name: user.name, email: user.email, role: user.role, createdAt: user.createdAt } });
  } catch(e) { res.status(500).json({ success: false, error: e.message }); }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await user.matchPassword(password)))
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    const token = signToken(user._id);
    res.json({ success: true, token, user: { id: user._id, name: user.name, email: user.email, role: user.role, createdAt: user.createdAt } });
  } catch(e) { res.status(500).json({ success: false, error: e.message }); }
});

app.get('/api/auth/me', protect, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password');
    if (!user) return res.status(404).json({ success: false, error: 'Not found' });
    res.json({ success: true, user });
  } catch(e) { res.status(500).json({ success: false, error: e.message }); }
});

// ── Notes CRUD (MongoDB) ──────────────────────────────────────
app.get('/api/notes', protect, async (req, res) => {
  try {
    counter.requests++;
    const { tag } = req.query;
    const filter = { userId: req.userId };
    if (tag) filter.tag = tag;
    const notes = await Note.find(filter).sort('-createdAt');
    const tags = [...new Set(notes.map(n => n.tag))];
    const tagCounts = {};
    notes.forEach(n => { tagCounts[n.tag] = (tagCounts[n.tag] || 0) + 1; });
    res.json({ success: true, count: notes.length, data: notes, tags, tagCounts });
  } catch(e) { res.status(500).json({ success: false, error: e.message }); }
});

app.get('/api/notes/:id', protect, async (req, res) => {
  try {
    const note = await Note.findOne({ _id: req.params.id, userId: req.userId });
    if (!note) return res.status(404).json({ success: false, error: 'Not found' });
    res.json({ success: true, data: note });
  } catch(e) { res.status(500).json({ success: false, error: e.message }); }
});

app.post('/api/notes', protect, async (req, res) => {
  try {
    counter.requests++;
    const { title, body, tag } = req.body;
    if (!title || !body) return res.status(400).json({ success: false, error: 'Title and body required' });
    const note = await Note.create({ title, body, tag: tag || 'general', userId: req.userId });
    res.status(201).json({ success: true, data: note });
  } catch(e) { res.status(500).json({ success: false, error: e.message }); }
});

app.put('/api/notes/:id', protect, async (req, res) => {
  try {
    counter.requests++;
    const note = await Note.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      { ...req.body, updatedAt: new Date() },
      { new: true }
    );
    if (!note) return res.status(404).json({ success: false, error: 'Not found' });
    res.json({ success: true, data: note });
  } catch(e) { res.status(500).json({ success: false, error: e.message }); }
});

app.delete('/api/notes/:id', protect, async (req, res) => {
  try {
    counter.requests++;
    const note = await Note.findOneAndDelete({ _id: req.params.id, userId: req.userId });
    if (!note) return res.status(404).json({ success: false, error: 'Not found' });
    res.json({ success: true, message: 'Deleted', data: note });
  } catch(e) { res.status(500).json({ success: false, error: e.message }); }
});

app.get('/api/notes-stats', protect, async (req, res) => {
  try {
    const notes = await Note.find({ userId: req.userId });
    const tags = [...new Set(notes.map(n => n.tag))];
    const tagCounts = {};
    notes.forEach(n => { tagCounts[n.tag] = (tagCounts[n.tag] || 0) + 1; });
    res.json({ success: true, data: { total: notes.length, tags, tagCounts } });
  } catch(e) { res.status(500).json({ success: false, error: e.message }); }
});

// ── Weather ───────────────────────────────────────────────────
app.get('/api/weather', weatherLimiter, async (req, res) => {
  counter.requests++;
  const city = (req.query.city || '').trim();
  if (!city) return res.status(400).json({ success: false, error: 'city param required' });

  const cacheKey = `weather_${city.toLowerCase()}`;
  const cached = cache.get(cacheKey);
  if (cached) {
    counter.cacheHits++;
    return res.json({ success: true, source: 'cache', data: cached, rateLimit: { limit: req.rateLimit.limit, remaining: req.rateLimit.remaining, resetTime: new Date(req.rateLimit.resetTime).toISOString() } });
  }

  const KEY = process.env.WEATHER_API_KEY;
  if (!KEY || KEY === 'your_openweathermap_api_key_here') {
    return res.json({ success: true, mock: true, source: 'mock', data: { city, country: 'IN', temp: 32, feels_like: 35, humidity: 68, pressure: 1008, wind_speed: 4.5, wind_deg: 200, visibility: 6000, description: 'Partly cloudy', icon: '02d', sunrise: new Date().setHours(6,15), sunset: new Date().setHours(18,45), lat: 28.61, lon: 77.20, fetchedAt: new Date().toISOString() }, rateLimit: { limit: 10, remaining: 9, resetTime: new Date().toISOString() } });
  }

  try {
    counter.cacheMisses++;
    const wRes  = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${KEY}&units=metric`);
    const wData = await wRes.json();
    if (wData.cod === '404' || wData.cod === 404) return res.status(404).json({ success: false, error: `City "${city}" not found` });
    if (wData.cod === 401) return res.status(401).json({ success: false, error: 'Invalid API key' });
    const d = { city: wData.name, country: wData.sys.country, temp: Math.round(wData.main.temp), feels_like: Math.round(wData.main.feels_like), humidity: wData.main.humidity, pressure: wData.main.pressure, wind_speed: wData.wind.speed, wind_deg: wData.wind.deg, visibility: wData.visibility, description: wData.weather[0].description, icon: wData.weather[0].icon, sunrise: wData.sys.sunrise * 1000, sunset: wData.sys.sunset * 1000, lat: wData.coord.lat, lon: wData.coord.lon, fetchedAt: new Date().toISOString() };
    cache.set(cacheKey, d);
    res.json({ success: true, source: 'api', data: d, rateLimit: { limit: req.rateLimit.limit, remaining: req.rateLimit.remaining, resetTime: new Date(req.rateLimit.resetTime).toISOString() } });
  } catch(e) { res.status(500).json({ success: false, error: e.message }); }
});

// ── Server features ───────────────────────────────────────────
app.get('/api/logs',       (req, res) => res.json({ success: true, data: reqLogs.slice(0, 50) }));
app.get('/api/cron-logs',  (req, res) => res.json({ success: true, data: cronLogs }));
app.get('/api/cache-status', (req, res) => {
  counter.requests++;
  res.json({ success: true, data: { keys: cache.keys(), keyCount: cache.keys().length, stats: cache.getStats(), counter } });
});
app.post('/api/cache/flush', (req, res) => {
  cache.flushAll();
  push(cronLogs, { id: Date.now(), job: '🗑️ Manual Flush', schedule: 'on-demand', message: 'Cache flushed by user', time: new Date().toISOString() });
  res.json({ success: true, message: 'Cache flushed' });
});
app.get('/api/db-status', (req, res) => {
  const states = ['disconnected','connected','connecting','disconnecting'];
  res.json({ success: true, data: { state: states[mongoose.connection.readyState], host: mongoose.connection.host, name: mongoose.connection.name } });
});

// ── Frontend (all routes → SPA) ───────────────────────────────
app.get('*', (req, res) => res.render('index', { title: 'DataVault — Complete' }));

app.listen(PORT, () => {
  console.log(`\n🚀 DataVault Complete running!`);
  console.log(`   → http://localhost:${PORT}`);
  console.log(`   → All 8 Cognifyz tasks merged\n`);
});
