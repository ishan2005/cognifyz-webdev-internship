<div align="center">

<img src="https://img.shields.io/badge/DataVault-Complete-0969da?style=for-the-badge&logo=databricks&logoColor=white" alt="DataVault Complete" height="40"/>

# DataVault — Complete

### All 8 Cognifyz Web Dev Internship tasks merged into one production-ready full-stack application

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Render-46E3B7?style=for-the-badge&logo=render&logoColor=white)](https://datavault-complete.onrender.com)
[![Node.js](https://img.shields.io/badge/Node.js-22.x-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express.js-4.x-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![JWT](https://img.shields.io/badge/JWT-Auth-FB015B?style=for-the-badge&logo=jsonwebtokens&logoColor=white)](https://jwt.io/)

</div>

---

## 🗺️ What Is This?

**DataVault Complete** is the capstone of the [Cognifyz Technologies Web Development Internship](https://github.com/ishan2005/cognifyz-webdev-internship). Instead of eight separate standalone apps, all tasks have been unified into **one cohesive Single Page Application** running on a single Express.js server — with real MongoDB Atlas persistence, JWT authentication, live weather data, server-side logging, in-memory caching, and scheduled background jobs.

---

## ✨ Features At A Glance

| Section | What It Demonstrates | Tasks Covered |
|---------|----------------------|---------------|
| 🔐 **Auth** | Register / Login · JWT tokens · bcrypt hashing · protected routes | 02, 06 |
| 📋 **Dashboard** | Protected user profile · recent notes · weather widget · stats | 06 |
| 📝 **Notes Manager** | Full CRUD · MongoDB Atlas · tag filtering · search · real-time API responses | 05, 06 |
| 🌦️ **Live Weather** | OpenWeatherMap API · 30 s cache · 10 req/min rate limiter · quick-city pills | 07 |
| 🖥️ **Server Monitor** | Morgan request log · node-cache status · flush · three cron jobs with live log | 08 |
| 🎨 **Showcase** | CSS keyframe animations · glassmorphism · responsive grid · skill progress bars | 03 |
| ⚡ **Advanced UI** | Password strength meter · DOM manipulation lab · localStorage Todo app | 04 |
| 🏠 **Home** | Landing page · task cards · SPA navigation | 01 |

---

## 🏗️ Tech Stack

```
Runtime          Node.js
Framework        Express.js 4
View Engine      EJS (server-side rendering)
Database         MongoDB Atlas + Mongoose 8
Authentication   JSON Web Tokens (jsonwebtoken) + bcryptjs
External API     OpenWeatherMap API
Rate Limiting    express-rate-limit
In-Memory Cache  node-cache (30 s TTL)
Logging          morgan (custom stream → in-app log table)
Background Jobs  node-cron (every 10 s, 30 s, 1 min)
Styling          Vanilla CSS + Bootstrap Icons
```

---

## 📁 Project Structure

```
DataVault-Complete/
├── server.js          ← All routes + middleware + cron + DB in one file
├── package.json
├── .env               ← Secrets (not committed — see below)
├── .gitignore
├── views/
│   └── index.ejs      ← Single EJS template (full SPA HTML)
└── public/
    ├── css/
    │   └── style.css  ← Complete design system (dark theme, glass, animations)
    └── js/
        └── app.js     ← All client-side JS (SPA routing, Fetch calls, DOM)
```

---

## 🚀 Local Development

### Prerequisites
- **Node.js** ≥ 18
- A **MongoDB Atlas** cluster (free tier works great)
- An **OpenWeatherMap** API key (free tier)

### Steps

```bash
# 1. Clone the repo
git clone https://github.com/ishan2005/cognifyz-webdev-internship.git
cd cognifyz-webdev-internship/DataVault-Complete

# 2. Install dependencies
npm install

# 3. Create your .env file (see template below)
cp .env.example .env   # or create manually

# 4. Start with hot-reload
npm run dev

# → Open http://localhost:4000
```

### `.env` template

```env
MONGO_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/datavault-complete
JWT_SECRET=your_super_secret_jwt_key_here
WEATHER_API_KEY=your_openweathermap_api_key
PORT=4000
NODE_ENV=development
```

> **Note:** The weather endpoint falls back to mock data automatically if `WEATHER_API_KEY` is missing or invalid, so the app works even without a key.

---

## ☁️ Deploying to Render (Free)

1. Push your code to GitHub (make sure `.env` is in `.gitignore` ✅).
2. Go to [render.com](https://render.com) → **New → Web Service**.
3. Connect your GitHub repo and select the `DataVault-Complete` folder as the **Root Directory** (or deploy from a separate repo).
4. Use these settings:

   | Setting | Value |
   |---------|-------|
   | **Runtime** | Node |
   | **Build Command** | `npm install` |
   | **Start Command** | `npm start` |

5. Add **Environment Variables** in the Render dashboard:
   - `MONGO_URI`
   - `JWT_SECRET`
   - `WEATHER_API_KEY`
   - `NODE_ENV` = `production`

6. Hit **Deploy** — Render provisions a free HTTPS URL automatically.

---

## 🔌 API Reference

### Auth
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/api/auth/register` | ❌ | Create a new account |
| `POST` | `/api/auth/login` | ❌ | Login, receive JWT |
| `GET` | `/api/auth/me` | ✅ JWT | Get current user profile |

### Notes (MongoDB CRUD)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/api/notes` | ✅ | List your notes (filter by `?tag=`) |
| `GET` | `/api/notes/:id` | ✅ | Get a single note |
| `POST` | `/api/notes` | ✅ | Create a note |
| `PUT` | `/api/notes/:id` | ✅ | Update a note |
| `DELETE` | `/api/notes/:id` | ✅ | Delete a note |
| `GET` | `/api/notes-stats` | ✅ | Tag breakdown + count |

### Weather
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/api/weather?city=Mumbai` | ❌ | Live weather · cached 30 s · limited 10 req/min |

### Server
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/api/logs` | ❌ | Last 50 morgan request logs |
| `GET` | `/api/cron-logs` | ❌ | Cron job execution history |
| `GET` | `/api/cache-status` | ❌ | Cache keys, hit/miss stats |
| `POST` | `/api/cache/flush` | ❌ | Manually flush all cache |
| `GET` | `/api/db-status` | ❌ | MongoDB connection state |

> **JWT Auth:** Pass the token as `Authorization: Bearer <token>` in request headers.

---

## ⏰ Cron Jobs

Three background jobs run automatically on the server:

| Job | Schedule | Action |
|-----|----------|--------|
| 📦 Cache Sweep | every 10 s | Logs cache key count and hit/miss stats |
| 📊 Stats Snapshot | every 30 s | Logs total requests, hits, and misses |
| 🧹 Cache Flush | every 1 min | Clears all cache keys for fresh data |

Live output is visible in the **Server → Cron Jobs** tab of the app.

---

## 🎬 Internship Task Index

> Each of the 8 individual tasks exists as a standalone app in the parent repo. DataVault Complete is the unified final version.

| # | Task | Concepts |
|---|------|----------|
| 01 | Server Setup & Landing Page | Express, EJS, static files |
| 02 | Form Validation | Client-side JS, server validation |
| 03 | Responsive UI Design | Bootstrap 5, CSS keyframe animations |
| 04 | Advanced UI & Dynamic DOM | Password meter, hash routing, localStorage |
| 05 | REST API — CRUD | GET/POST/PUT/DELETE, Fetch API |
| 06 | Database & Authentication | MongoDB Atlas, Mongoose, JWT, bcrypt |
| 07 | External API & Rate Limiting | OpenWeatherMap, express-rate-limit |
| 08 | Logging, Caching & Cron Jobs | morgan, node-cache, node-cron |

---

## 📜 License

MIT © [Ishan Agrawal](https://github.com/ishan2005)

---

<div align="center">

Built with ❤️ by **[Ishan Agrawal](https://github.com/ishan2005)** · Cognifyz Technologies Web Dev Internship

[![GitHub](https://img.shields.io/badge/GitHub-ishan2005-181717?style=flat-square&logo=github)](https://github.com/ishan2005)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-agrawalishan2005-0A66C2?style=flat-square&logo=linkedin)](https://linkedin.com/in/agrawalishan2005)

</div>
