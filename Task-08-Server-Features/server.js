require('dotenv').config();
const express  = require('express');
const morgan   = require('morgan');
const NodeCache= require('node-cache');
const cron     = require('node-cron');
const path     = require('path');
const fs       = require('fs');

const app  = express();
const PORT = process.env.PORT || 3007;

// ─── Cache (TTL = 30 sec for demo visibility) ────────────────
const cache = new NodeCache({ stdTTL: 30, checkperiod: 10 });

// ─── In-memory log store ──────────────────────────────────────
const reqLogs  = [];   // HTTP request logs
const cronLogs = [];   // Cron job history
const MAX_LOGS = 100;

function pushLog(arr, entry) {
  arr.unshift(entry);
  if (arr.length > MAX_LOGS) arr.pop();
}

// ─── Morgan HTTP Logging ──────────────────────────────────────
const morganFormat = ':method :url :status :res[content-length] b - :response-time ms';
app.use(morgan(morganFormat, {
  stream: {
    write: (msg) => {
      const parts = msg.trim().split(' ');
      pushLog(reqLogs, {
        id: Date.now(),
        method: parts[0],
        url: parts[1],
        status: parseInt(parts[2]),
        bytes: parts[3],
        ms: parseFloat(parts[5]),
        time: new Date().toISOString()
      });
    }
  }
}));

// ─── Express Setup ────────────────────────────────────────────
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

// ─── Fake data generator ──────────────────────────────────────
const products = [
  { id:1, name:'Node.js Handbook', price:29.99, category:'books' },
  { id:2, name:'Express Mastery', price:24.99, category:'books' },
  { id:3, name:'MongoDB Atlas Guide', price:19.99, category:'books' },
  { id:4, name:'JWT Security Token', price:9.99, category:'auth' },
  { id:5, name:'REST API Blueprint', price:34.99, category:'api' },
];

let counter = { requests: 0, cacheHits: 0, cacheMisses: 0, cronRuns: 0 };

// ─── Cron Jobs ────────────────────────────────────────────────

// Every 10 seconds — cache sweep report
cron.schedule('*/10 * * * * *', () => {
  counter.cronRuns++;
  const keys  = cache.keys();
  const stats = cache.getStats();
  const entry = {
    id: Date.now(),
    job: '📦 Cache Sweep',
    schedule: 'every 10s',
    message: `${keys.length} key(s) cached · ${stats.hits} hits · ${stats.misses} misses`,
    time: new Date().toISOString()
  };
  pushLog(cronLogs, entry);
  console.log(`[CRON] ${entry.job}: ${entry.message}`);
});

// Every 30 seconds — counter reset alert
cron.schedule('*/30 * * * * *', () => {
  counter.cronRuns++;
  const entry = {
    id: Date.now(),
    job: '📊 Stats Snapshot',
    schedule: 'every 30s',
    message: `Total reqs: ${counter.requests} · Cache hits: ${counter.cacheHits} · Misses: ${counter.cacheMisses}`,
    time: new Date().toISOString()
  };
  pushLog(cronLogs, entry);
  console.log(`[CRON] ${entry.job}: ${entry.message}`);
});

// Every minute — cache flush
cron.schedule('* * * * *', () => {
  counter.cronRuns++;
  cache.flushAll();
  const entry = {
    id: Date.now(),
    job: '🧹 Cache Flush',
    schedule: 'every 1 min',
    message: 'All cache keys cleared — fresh data on next request',
    time: new Date().toISOString()
  };
  pushLog(cronLogs, entry);
  console.log(`[CRON] ${entry.job}: ${entry.message}`);
});

// ─── API Routes ───────────────────────────────────────────────

// GET /api/products — with caching
app.get('/api/products', (req, res) => {
  counter.requests++;
  const cacheKey = 'products_all';
  const cached = cache.get(cacheKey);

  if (cached) {
    counter.cacheHits++;
    return res.json({ success: true, source: 'cache', data: cached, cacheStats: cache.getStats() });
  }

  // Simulate DB delay
  setTimeout(() => {
    cache.set(cacheKey, products);
    counter.cacheMisses++;
    res.json({ success: true, source: 'database', data: products, cacheStats: cache.getStats() });
  }, 200);
});

// GET /api/products/:id — with per-item caching
app.get('/api/products/:id', (req, res) => {
  counter.requests++;
  const id = parseInt(req.params.id);
  const cacheKey = `product_${id}`;
  const cached = cache.get(cacheKey);

  if (cached) {
    counter.cacheHits++;
    return res.json({ success: true, source: 'cache', data: cached });
  }

  const product = products.find(p => p.id === id);
  if (!product) return res.status(404).json({ success: false, error: 'Product not found' });
  cache.set(cacheKey, product);
  counter.cacheMisses++;
  res.json({ success: true, source: 'database', data: product });
});

// GET /api/cache-status
app.get('/api/cache-status', (req, res) => {
  counter.requests++;
  const stats = cache.getStats();
  res.json({
    success: true,
    data: {
      keys: cache.keys(),
      keyCount: cache.keys().length,
      stats,
      ttl: 30,
      counter
    }
  });
});

// POST /api/cache/flush — manual flush
app.post('/api/cache/flush', (req, res) => {
  counter.requests++;
  cache.flushAll();
  pushLog(cronLogs, {
    id: Date.now(), job: '🗑️ Manual Flush', schedule: 'on-demand',
    message: 'Cache manually flushed by user', time: new Date().toISOString()
  });
  res.json({ success: true, message: 'Cache flushed', keys: cache.keys() });
});

// GET /api/logs — request logs
app.get('/api/logs', (req, res) => {
  res.json({ success: true, data: reqLogs.slice(0, 50) });
});

// GET /api/cron-logs
app.get('/api/cron-logs', (req, res) => {
  res.json({ success: true, data: cronLogs });
});

// Frontend
app.get('*', (req, res) => res.render('index', { title: 'DataVault — Server Features' }));

app.listen(PORT, () => {
  console.log(`\n🚀 Task 08 server running!`);
  console.log(`   → Local: http://localhost:${PORT}`);
  console.log(`   → Task:  08 — Logging (morgan) + Caching (node-cache) + Cron (node-cron)\n`);
  console.log(`   Cron jobs scheduled:`);
  console.log(`   • Cache Sweep   — every 10 seconds`);
  console.log(`   • Stats Snapshot — every 30 seconds`);
  console.log(`   • Cache Flush   — every 1 minute\n`);
});
