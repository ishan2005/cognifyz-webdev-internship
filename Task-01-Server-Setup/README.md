<div align="center">

# Task 01 — Server Setup & Landing Page

### 🟢 Level: Beginner | Cognifyz Web Dev Internship

[![Status](https://img.shields.io/badge/Status-✅%20Completed-brightgreen?style=for-the-badge)]()
[![Express](https://img.shields.io/badge/Express.js-4.x-000000?style=for-the-badge&logo=express)](https://expressjs.com/)
[![EJS](https://img.shields.io/badge/EJS-Templating-A91E50?style=for-the-badge)](https://ejs.co/)

</div>

---

## 🎯 Task Objective

Set up a Node.js + Express server with EJS templating. Build a fully server-side rendered **landing page** for the DataVault application with a working contact form.

---

## 🎬 LinkedIn Video

> ▶️ **[Watch the walkthrough on LinkedIn →](https://linkedin.com)**

---

## 🧠 Concepts Covered

| Concept | Description |
|---------|-------------|
| **Node.js + Express** | Set up an HTTP server with Express framework |
| **EJS Templating** | Server-side HTML rendering with dynamic data |
| **EJS Partials** | Reusable `header.ejs` and `footer.ejs` partials |
| **Express Routing** | `GET /`, `GET /contact`, `POST /contact` routes |
| **Static Files** | Serving CSS and JS from `public/` directory |
| **Form Handling** | `express.urlencoded` to parse POST form data |
| **Template Variables** | Passing data from route to EJS views |

---

## 📂 Folder Structure

```
Task-01-Server-Setup/
├── package.json
├── server.js                  ← Express app entry point
├── views/
│   ├── partials/
│   │   ├── header.ejs         ← Shared <head> + navbar
│   │   └── footer.ejs         ← Shared footer
│   └── index.ejs              ← Landing page
└── public/
    └── css/
        └── style.css          ← Custom styles
```

---

## 🚀 How to Run

```bash
cd Task-01-Server-Setup
npm install
npm start
# Visit → http://localhost:3000
```

---

## 📸 Preview

> Server renders EJS templates and serves the landing page at `http://localhost:3000`

---

## 🔗 Navigation

[← Back to Main](../README.md) | [Next Task →](../Task-02-Form-Validation/)
