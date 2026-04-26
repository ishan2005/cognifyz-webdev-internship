const express = require('express');
const path    = require('path');

const app  = express();
const PORT = process.env.PORT || 3003;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Single shell route — all routing is hash-based (client-side)
app.get('*', (req, res) => {
  res.render('index', { title: 'DataVault — Advanced UI' });
});

app.listen(PORT, () => {
  console.log(`\n🚀 Task 04 server running!`);
  console.log(`   → Local: http://localhost:${PORT}`);
  console.log(`   → Task:  04 — Advanced UI & Dynamic DOM\n`);
});
