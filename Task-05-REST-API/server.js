const express = require('express');
const path    = require('path');

const app  = express();
const PORT = process.env.PORT || 3004;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─── In-Memory Data Store ────────────────────────────────────
let notes = [
  { id: 1, title: 'REST API Overview',   body: 'REST uses HTTP verbs: GET, POST, PUT, DELETE to perform CRUD operations on resources.',  tag: 'api',    createdAt: new Date(Date.now() - 86400000 * 2).toISOString() },
  { id: 2, title: 'Express Routing',     body: 'Express router maps URL paths to handler functions. Use app.get(), app.post(), app.put(), app.delete().',  tag: 'express', createdAt: new Date(Date.now() - 86400000).toISOString() },
  { id: 3, title: 'Fetch API',           body: 'The browser Fetch API makes HTTP requests using Promises. fetch(url, {method, headers, body}).',  tag: 'js',     createdAt: new Date().toISOString() },
];
let nextId = 4;

// ─── REST API Routes ─────────────────────────────────────────

// GET /api/notes — list all notes (supports ?tag= filter)
app.get('/api/notes', (req, res) => {
  const { tag } = req.query;
  const result = tag ? notes.filter(n => n.tag === tag) : notes;
  res.json({ success: true, count: result.length, data: result });
});

// GET /api/notes/:id — get single note
app.get('/api/notes/:id', (req, res) => {
  const note = notes.find(n => n.id === parseInt(req.params.id));
  if (!note) return res.status(404).json({ success: false, error: 'Note not found' });
  res.json({ success: true, data: note });
});

// POST /api/notes — create a note
app.post('/api/notes', (req, res) => {
  const { title, body, tag } = req.body;
  if (!title || !body) {
    return res.status(400).json({ success: false, error: 'title and body are required' });
  }
  const note = { id: nextId++, title, body, tag: tag || 'general', createdAt: new Date().toISOString() };
  notes.unshift(note);
  res.status(201).json({ success: true, data: note });
});

// PUT /api/notes/:id — update a note
app.put('/api/notes/:id', (req, res) => {
  const idx = notes.findIndex(n => n.id === parseInt(req.params.id));
  if (idx === -1) return res.status(404).json({ success: false, error: 'Note not found' });
  const { title, body, tag } = req.body;
  notes[idx] = { ...notes[idx], title: title || notes[idx].title, body: body || notes[idx].body, tag: tag || notes[idx].tag, updatedAt: new Date().toISOString() };
  res.json({ success: true, data: notes[idx] });
});

// DELETE /api/notes/:id — delete a note
app.delete('/api/notes/:id', (req, res) => {
  const idx = notes.findIndex(n => n.id === parseInt(req.params.id));
  if (idx === -1) return res.status(404).json({ success: false, error: 'Note not found' });
  const deleted = notes.splice(idx, 1)[0];
  res.json({ success: true, data: deleted, message: 'Note deleted' });
});

// GET /api/stats — summary stats
app.get('/api/stats', (req, res) => {
  const tags = [...new Set(notes.map(n => n.tag))];
  res.json({ success: true, data: { total: notes.length, tags, tagCounts: tags.reduce((a, t) => ({ ...a, [t]: notes.filter(n => n.tag === t).length }), {}) } });
});

// ─── Frontend Shell ──────────────────────────────────────────
app.get('*', (req, res) => {
  res.render('index', { title: 'DataVault — REST API' });
});

app.listen(PORT, () => {
  console.log(`\n🚀 Task 05 server running!`);
  console.log(`   → Local:  http://localhost:${PORT}`);
  console.log(`   → API:    http://localhost:${PORT}/api/notes`);
  console.log(`   → Task:   05 — REST API CRUD\n`);
});
