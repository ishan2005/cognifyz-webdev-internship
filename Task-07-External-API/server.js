require('dotenv').config();
const express   = require('express');
const rateLimit = require('express-rate-limit');
const fetch     = require('node-fetch');
const path      = require('path');

const app  = express();
const PORT = process.env.PORT || 3006;
const API_KEY = process.env.WEATHER_API_KEY;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

// ─── Rate Limiters ───────────────────────────────────────────

// General API limiter — 30 req / 15 min
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: 'Too many requests — try again in 15 minutes.' },
  handler: (req, res, next, options) => {
    res.status(429).json(options.message);
  }
});

// Strict search limiter — 10 req / 1 min (for weather endpoint)
const searchLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: 'Search rate limit hit — max 10 searches/minute.' },
  handler: (req, res, next, options) => {
    res.status(429).json(options.message);
  }
});

app.use('/api', apiLimiter);

// ─── Weather API Route ────────────────────────────────────────
app.get('/api/weather', searchLimiter, async (req, res) => {
  const city = (req.query.city || '').trim();
  if (!city) return res.status(400).json({ success: false, error: 'city parameter is required' });

  if (!API_KEY || API_KEY === 'your_openweathermap_api_key_here') {
    // Return mock data if no API key set
    return res.json({
      success: true,
      mock: true,
      data: {
        city: city,
        country: 'IN',
        temp: 32,
        feels_like: 35,
        humidity: 68,
        pressure: 1008,
        wind_speed: 4.5,
        wind_deg: 200,
        visibility: 6000,
        description: 'Partly cloudy',
        icon: '02d',
        sunrise: new Date().setHours(6, 15),
        sunset: new Date().setHours(18, 45),
        lat: 28.6139, lon: 77.209,
        fetchedAt: new Date().toISOString()
      },
      rateLimit: {
        limit: req.rateLimit.limit,
        remaining: req.rateLimit.remaining,
        resetTime: new Date(req.rateLimit.resetTime).toISOString()
      }
    });
  }

  try {
    const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric`;
    const wRes  = await fetch(weatherUrl);
    const wData = await wRes.json();
    if (wData.cod === '404' || wData.cod === 404) return res.status(404).json({ success: false, error: `City "${city}" not found` });
    if (wData.cod === 401) return res.status(401).json({ success: false, error: 'Invalid API key — check your .env file' });
    const name    = wData.name;
    const country = wData.sys.country;
    const lat     = wData.coord.lat;
    const lon     = wData.coord.lon;

    res.json({
      success: true,
      mock: false,
      data: {
        city: name,
        country,
        temp: Math.round(wData.main.temp),
        feels_like: Math.round(wData.main.feels_like),
        humidity: wData.main.humidity,
        pressure: wData.main.pressure,
        wind_speed: wData.wind.speed,
        wind_deg: wData.wind.deg,
        visibility: wData.visibility,
        description: wData.weather[0].description,
        icon: wData.weather[0].icon,
        sunrise: wData.sys.sunrise * 1000,
        sunset: wData.sys.sunset * 1000,
        lat, lon,
        fetchedAt: new Date().toISOString()
      },
      rateLimit: {
        limit: req.rateLimit.limit,
        remaining: req.rateLimit.remaining,
        resetTime: new Date(req.rateLimit.resetTime).toISOString()
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to fetch weather: ' + err.message });
  }
});

// Multi-city forecast
app.get('/api/weather/cities', searchLimiter, async (req, res) => {
  const cities = ['Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Kolkata'];
  const mockData = cities.map(c => ({
    city: c, country: 'IN',
    temp: Math.floor(Math.random() * 15) + 25,
    description: ['Sunny', 'Partly cloudy', 'Overcast', 'Light rain', 'Clear'][Math.floor(Math.random() * 5)],
    humidity: Math.floor(Math.random() * 40) + 40,
    icon: ['01d','02d','03d','10d','01d'][Math.floor(Math.random() * 5)]
  }));
  res.json({ success: true, mock: !API_KEY || API_KEY === 'your_openweathermap_api_key_here', data: mockData });
});

// Rate limit status
app.get('/api/rate-status', (req, res) => {
  res.json({ success: true, info: 'Rate limits: /api/weather → 10 req/min · /api/* → 30 req/15min', windowMs: 60000 });
});

// Frontend
app.get('*', (req, res) => res.render('index', { title: 'DataVault — Weather API' }));

app.listen(PORT, () => {
  console.log(`\n🚀 Task 07 server running!`);
  console.log(`   → Local:   http://localhost:${PORT}`);
  console.log(`   → API Key: ${API_KEY && API_KEY !== 'your_openweathermap_api_key_here' ? '✅ Set' : '⚠️  Not set (using mock data)'}`);
  console.log(`   → Task:    07 — External API + Rate Limiting\n`);
});
