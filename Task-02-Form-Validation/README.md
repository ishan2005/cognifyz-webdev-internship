<div align="center">

# Task 02 — Form Validation

### 🟢 Level: Beginner | Cognifyz Web Dev Internship

[![Status](https://img.shields.io/badge/Status-✅%20Completed-brightgreen?style=for-the-badge)]()
[![Express](https://img.shields.io/badge/Express.js-4.x-000000?style=for-the-badge&logo=express)](https://expressjs.com/)
[![JavaScript](https://img.shields.io/badge/Vanilla%20JS-Client%20Validation-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)]()

</div>

---

## 🎯 Task Objective

Implement **real-time client-side JavaScript validation** and **server-side validation** for a registration form. Data is temporarily stored in an in-memory `Map` (no database yet — that comes in Task 06).

---

## 🎬 LinkedIn Video

> ▶️ **[Watch the walkthrough on LinkedIn →](https://linkedin.com)**

---

## 🧠 Concepts Covered

| Concept | Description |
|---------|-------------|
| **Client-Side Validation** | Real-time inline feedback on every `input` / `blur` event |
| **Password Strength Bar** | Visual strength meter — Weak → Fair → Strong |
| **Password Checklist** | Live checklist: 8+ chars, uppercase, number, match |
| **Show/Hide Password** | Eye toggle button on password field |
| **Server-Side Validation** | Express route validates all fields before storing |
| **In-Memory Map Store** | `Map<email, userObject>` — no database needed |
| **Duplicate Check** | Server rejects already-registered emails |
| **Age Validation** | DOB must be 18+ years ago |
| **Indian Phone Validation** | Must start with 6-9, exactly 10 digits |
| **Submit Guard** | JS prevents form submission if any field is invalid |

---

## 📂 Folder Structure

```
Task-02-Form-Validation/
├── package.json
├── server.js                  ← Express + server-side validation + Map store
├── public/
│   ├── css/
│   │   └── style.css          ← GitHub light theme
│   └── js/
│       └── validation.js      ← ALL client-side validation logic
└── views/
    ├── partials/
    │   ├── header.ejs
    │   └── footer.ejs
    ├── register.ejs            ← Registration form (6 fields)
    └── users.ejs               ← GitHub-style users table
```

---

## 🚀 How to Run

```bash
cd Task-02-Form-Validation
npm install
npm start
# Visit → http://localhost:3001
# Register → http://localhost:3001/register
# Users   → http://localhost:3001/users
```

---

## ✅ Form Fields & Validation Rules

| Field | Client Rule | Server Rule |
|-------|------------|-------------|
| Full Name | Min 2 chars | Min 2 chars |
| Email | Valid format regex | Valid format + duplicate check |
| Password | 8+ chars, 1 uppercase, 1 number | Same |
| Confirm Password | Must match password | Must match |
| Phone | 10-digit Indian (6-9 start) | Same regex |
| Date of Birth | Age must be 18+ | Age must be 18+ |

---

## 🔗 Navigation

[← Previous Task](../Task-01-Server-Setup/) | [Back to Main](../README.md) | [Next Task →](../Task-03-Responsive-Design/)
