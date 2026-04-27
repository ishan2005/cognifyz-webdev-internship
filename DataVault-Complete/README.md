<div align="center">

<br/>

<img src="https://img.shields.io/badge/DataVault-Complete-0969da?style=for-the-badge&logo=databricks&logoColor=white" alt="DataVault Complete" height="36"/>

<h1>DataVault — Complete</h1>

<p><strong>All 8 Cognifyz Web Dev Internship tasks unified into one production-ready full-stack application.</strong><br/>
Authentication · REST API · MongoDB Atlas · Live Weather · Logging · Caching · Cron Jobs</p>

<br/>

[![Live Demo](https://img.shields.io/badge/🚀%20Live%20Demo-cognifyz--webdev--internship.onrender.com-46E3B7?style=for-the-badge&logo=render&logoColor=white)](https://cognifyz-webdev-internship.onrender.com)

<br/>

[![Node.js](https://img.shields.io/badge/Node.js-22.x-339933?style=flat-square&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express.js-4.x-000000?style=flat-square&logo=express&logoColor=white)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=flat-square&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![JWT](https://img.shields.io/badge/JWT-Auth-FB015B?style=flat-square&logo=jsonwebtokens&logoColor=white)](https://jwt.io/)
[![EJS](https://img.shields.io/badge/EJS-Templates-A91E50?style=flat-square)](https://ejs.co/)
[![License](https://img.shields.io/badge/License-MIT-yellow?style=flat-square)](LICENSE)
[![Deployed on Render](https://img.shields.io/badge/Deployed%20on-Render-46E3B7?style=flat-square&logo=render)](https://render.com)

<br/>

</div>

---

## 📌 Overview

**DataVault Complete** is the capstone project of the **Cognifyz Technologies Web Development Internship**. Rather than shipping 8 isolated apps, every task has been unified into a single, cohesive **Single Page Application** served by one Express.js server — complete with real persistence, live APIs, JWT security, server-side observability, and responsive design across all screen sizes.

> 🔗 **Live at → [https://cognifyz-webdev-internship.onrender.com](https://cognifyz-webdev-internship.onrender.com)**

---

## ✨ Features

| # | Section | What It Showcases | Tasks |
|---|---------|-------------------|-------|
| 🔐 | **Authentication** | Register/Login · JWT tokens · bcrypt password hashing · protected routes | 02, 06 |
| 🧑‍💼 | **Dashboard** | Protected user profile · recent notes widget · live weather widget · stats | 06 |
| 📝 | **Notes Manager** | Full CRUD · MongoDB Atlas persistence · tag filtering · live-search · API response inspector | 05, 06 |
| 🌦️ | **Live Weather** | OpenWeatherMap API · 30 s server-side cache · 10 req/min rate limiter · 8 quick-city pills | 07 |
| 🖥️ | **Server Monitor** | Morgan request log table · cache key inspector · flush button · 3 live cron jobs | 08 |
| 🎨 | **Design Showcase** | CSS keyframe animations · glassmorphism · responsive grid · skill progress bars | 03 |
| ⚡ | **Advanced UI** | Password strength meter · DOM manipulation lab · localStorage Todo app | 04 |
| 🏠 | **Home** | Landing page · task overview cards · SPA hash-based navigation | 01 |

---

## 🏗️ Architecture

```
Browser (SPA)
    │  Fetch API calls
    ▼
Express.js  ─── Morgan logging ──► In-memory log store
    │
    ├── /api/auth/*      ─── bcrypt + JWT ──► MongoDB Atlas (Users)
    ├── /api/notes/*     ─── Mongoose     ──► MongoDB Atlas (Notes)
    ├── /api/weather     ─── node-cache (30s TTL) ──► OpenWeatherMap API
    ├── /api/cache-status, /api/logs, /api/cron-logs
    └── /* ──► EJS render (index.ejs → SPA shell)

Background (node-cron)
    ├── every 10s  → Cache sweep log
    ├── every 30s  → Stats snapshot log
    └── every 1min → Auto cache flush
```

---

## 🛠️ Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Runtime | **Node.js 22** | JavaScript server runtime |
| Framework | **Express.js 4** | HTTP server & routing |
| View Engine | **EJS** | Server-side HTML templating |
| Database | **MongoDB Atlas + Mongoose 8** | User & note persistence |
| Auth | **jsonwebtoken + bcryptjs** | JWT sessions, password hashing |
| External API | **OpenWeatherMap** | Real-time weather data |
| Rate Limiting | **express-rate-limit** | 10 req/min on weather endpoint |
| Caching | **node-cache** | In-memory cache with 30 s TTL |
| Logging | **morgan** | HTTP request logging (custom stream) |
| Scheduler | **node-cron** | Background jobs every 10 s / 30 s / 1 min |
| Icons | **Bootstrap Icons 1.11** | UI icon set (CDN) |
| Font | **Inter (Google Fonts)** | Clean sans-serif typography |
| Hosting | **Render** | Free-tier cloud deployment |

---

## 📁 Project Structure

```
DataVault-Complete/
├── server.js            ← Express server, all routes, schemas, cron, cache
├── package.json
├── .env                 ← Secret keys (not committed)
├── .env.example         ← Template for new contributors
├── .gitignore
├── views/
│   └── index.ejs        ← Single EJS template (SPA shell)
└── public/
    ├── css/
    │   └── style.css    ← Design system: tokens, components, 3 responsive breakpoints
    └── js/
        └── app.js       ← SPA router, all Fetch calls, UI logic
```

---

## 🚀 Getting Started Locally

### Prerequisites
- **Node.js** ≥ 18
- A free **[MongoDB Atlas](https://www.mongodb.com/cloud/atlas)** cluster
- A free **[OpenWeatherMap](https://openweathermap.org/api)** API key *(optional — app falls back to mock data)*

### Setup

```bash
# 1. Clone the repository
git clone https://github.com/ishan2005/cognifyz-webdev-internship.git
cd cognifyz-webdev-internship/DataVault-Complete

# 2. Install dependencies
npm install

# 3. Configure environment variables
cp .env.example .env
# Edit .env with your MongoDB URI, JWT secret, and weather API key

# 4. Start dev server with hot-reload
npm run dev
```

Open **http://localhost:4000** in your browser.

### Environment Variables

```env
MONGO_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/datavault-complete
JWT_SECRET=your_long_random_secret_here
WEATHER_API_KEY=your_openweathermap_key        # optional
PORT=4000
NODE_ENV=development
```

---

## 🔌 API Reference

### Auth
| Method | Endpoint | Protected | Description |
|--------|----------|-----------|-------------|
| `POST` | `/api/auth/register` | ❌ | Create account, returns JWT |
| `POST` | `/api/auth/login` | ❌ | Login, returns JWT |
| `GET` | `/api/auth/me` | ✅ | Get current user profile |

### Notes
| Method | Endpoint | Protected | Description |
|--------|----------|-----------|-------------|
| `GET` | `/api/notes` | ✅ | List notes (filter: `?tag=`) |
| `GET` | `/api/notes/:id` | ✅ | Get single note |
| `POST` | `/api/notes` | ✅ | Create note |
| `PUT` | `/api/notes/:id` | ✅ | Update note |
| `DELETE` | `/api/notes/:id` | ✅ | Delete note |
| `GET` | `/api/notes-stats` | ✅ | Tag counts & totals |

### Weather
| Method | Endpoint | Protected | Description |
|--------|----------|-----------|-------------|
| `GET` | `/api/weather?city=Mumbai` | ❌ | Live weather · cached 30 s · rate limited |

### Server Observability
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/logs` | Last 50 morgan request logs |
| `GET` | `/api/cron-logs` | Cron job execution history |
| `GET` | `/api/cache-status` | Keys, stats, hit/miss counter |
| `POST` | `/api/cache/flush` | Manually flush all cache keys |
| `GET` | `/api/db-status` | MongoDB connection state |

> **Auth header:** `Authorization: Bearer <token>`

---

## ⏰ Background Cron Jobs

Three jobs run automatically from server start:

| Job | Schedule | Action |
|-----|----------|--------|
| 📦 Cache Sweep | `*/10 * * * * *` — every 10 s | Logs cached key count + hit/miss stats |
| 📊 Stats Snapshot | `*/30 * * * * *` — every 30 s | Logs total requests, hits & misses |
| 🧹 Cache Flush | `* * * * *` — every 1 min | Clears all keys, forces fresh fetches |

Live output is visible in real-time in the **Server → Cron Jobs** tab.

---

## ☁️ Deploying to Render

1. Push your fork to GitHub
2. Go to [render.com](https://render.com) → **New → Web Service**
3. Connect your repo, set **Root Directory** → `DataVault-Complete`
4. Use these settings:

   | Field | Value |
   |-------|-------|
   | Runtime | `Node` |
   | Build Command | `npm install` |
   | Start Command | `npm start` |

5. Add environment variables: `MONGO_URI`, `JWT_SECRET`, `WEATHER_API_KEY`, `NODE_ENV=production`
6. Deploy — Render auto-redeploys on every `git push` ✅

---

## 📱 Responsive Design

The UI adapts across three breakpoints:

| Breakpoint | Layout |
|---|---|
| > 900 px | Full navbar with all 8 links |
| ≤ 900 px (tablet) | Hamburger menu · 2-column grids |
| ≤ 600 px (mobile) | Stacked single-column · full-width buttons |
| ≤ 400 px (small phone) | Compact typography · single-column everything |

---

## 🗺️ Internship Task Index

| # | Task | Core Concepts | Folder |
|---|------|--------------|--------|
| 01 | Server Setup & Landing Page | Express, EJS, static files, routing | `Task-01-Server-Setup` |
| 02 | Form Validation | Client-side JS, server validation, regex | `Task-02-Form-Validation` |
| 03 | Responsive UI Design | Bootstrap 5, CSS keyframe animations, glassmorphism | `Task-03-Responsive-Design` |
| 04 | Advanced UI & Dynamic DOM | Password meter, hash routing, localStorage | `Task-04-Advanced-UI` |
| 05 | REST API — CRUD | GET/POST/PUT/DELETE endpoints, Fetch API | `Task-05-REST-API` |
| 06 | Database & Authentication | MongoDB Atlas, Mongoose, JWT, bcrypt | `Task-06-Database-Auth` |
| 07 | External API & Rate Limiting | OpenWeatherMap, express-rate-limit, caching | `Task-07-External-API` |
| 08 | Logging, Caching & Cron Jobs | morgan, node-cache, node-cron | `Task-08-Server-Features` |

> Each task also exists as a **standalone app** in its own folder with a separate README.

---

## 📜 License

This project is licensed under the **MIT License** — see the [LICENSE](../LICENSE) file for details.

---

<div align="center">

<br/>

Made with ❤️ by **[Ishan Agrawal](https://github.com/ishan2005)**

**Cognifyz Technologies · Web Development Internship · 2026**

<br/>

[![GitHub](https://img.shields.io/badge/GitHub-ishan2005-181717?style=flat-square&logo=github)](https://github.com/ishan2005)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-agrawalishan2005-0A66C2?style=flat-square&logo=linkedin)](https://linkedin.com/in/agrawalishan2005)
[![Live App](https://img.shields.io/badge/Live%20App-Visit%20Now-46E3B7?style=flat-square&logo=render)](https://cognifyz-webdev-internship.onrender.com)

<br/>

</div>
