<div align="center">

# 🛡️ Stark Security

### AI-Powered Bug Bounty & Pentest Platform

> _"Fortifying digital frontiers — one vulnerability at a time."_

[![Python](https://img.shields.io/badge/Python-3.10+-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![License](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)](LICENSE)

</div>

---

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Installation](#-installation)
- [Environment Variables](#-security--api-keys)
- [Project Structure](#-project-structure)
- [Contributors](#-contributors)

---

## ⚡ Features

| Feature | Description |
|---|---|
| **🤖 AI Security Advisor** | A step-by-step, AI-driven security readiness assessment that guides companies through targeted questions and delivers a scored report with actionable recommendations. |
| **📊 Dual Dashboards** | Purpose-built interfaces for **Hackers** (bounty explorer, leaderboard, stats) and **Companies** (campaign manager, analytics, AI advisor). |
| **🎯 Bounty Campaign Manager** | Companies can launch time-boxed security audit campaigns with start/end dates, descriptions, and real-time status tracking. |
| **🔒 Modern & Secure Stack** | Built on FastAPI, React, and Tailwind CSS with session-based auth, environment-managed secrets, and clean separation of concerns. |

---

## 🧰 Tech Stack

### Backend

| Technology | Role |
|---|---|
| **FastAPI** | High-performance Python web framework for REST APIs |
| **SQLAlchemy** | ORM for database modeling and queries |
| **SQLite** | Lightweight relational database (dev/demo) |
| **Pydantic** | Request/response validation and serialization |
| **python-dotenv** | Environment variable management |

### Frontend

| Technology | Role |
|---|---|
| **React 18** | Component-based UI framework |
| **Tailwind CSS** | Utility-first styling with a custom "Dark Cyber" theme |
| **Lucide React** | Modern, consistent icon library |

### AI Engine

| Technology | Role |
|---|---|
| **ai_of_stark** | Custom-built Security Advisor module with question generation and recommendation engine |
| **Groq LLM** | Large language model backend for intelligent, context-aware assessments |

---

## 🚀 Installation

### Prerequisites

- Python 3.10+
- Node.js 18+ & npm

### 1. Clone the Repository

```bash
git clone https://github.com/khadijaumud/stark.git
cd stark
```

### 2. Backend Setup

```bash
# Create and activate a virtual environment
python -m venv venv

# Windows
venv\Scripts\activate

# macOS / Linux
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
pip install "bcrypt==4.0.1"

# (Optional) Seed demo data
python seed_data.py

# Start the backend server
uvicorn main:app --reload
```

The API will be available at `http://127.0.0.1:8000`.


### 3. Frontend Setup (React + Vite)

cd stark.2/Frontend

# Install dependencies
npm install

# Start the development server
npm run dev

The app will open at `http://localhost:5173`.

---

## 🔐 Security & API Keys

This project follows security best practices — **no API keys are hardcoded** in the source code.

### Environment Setup

Create a `.env` file in the project root using the provided example:

```bash
cp .env.example .env
```

### Required Variables

| Variable | Description | Required |
|---|---|---|
| `GROQ_API_KEY` | API key for the Groq LLM (powers the AI Security Advisor) | Optional* |
| `SESSION_SECRET_KEY` | Secret key for session middleware | Recommended |
| `DATABASE_URL` | Database connection string (defaults to `sqlite:///./app.db`) | Optional |

> \* If `GROQ_API_KEY` is not set, the AI Security Advisor will use a built-in fallback with deterministic questions — the feature remains fully functional for demos.

### `.env.example`

```env
GROQ_API_KEY=your_groq_api_key_here
SESSION_SECRET_KEY=change-this-to-a-random-secret
DATABASE_URL=sqlite:///./app.db
```

---


## 📁 Project Structure

```
stark/
└── HACK/
    ├── main.py                  # FastAPI application & endpoints
    ├── app_core.py              # SQLAlchemy models & DB setup
    ├── seed_data.py             # Demo data seeder
    ├── requirements.txt         # Python dependencies
    ├── .env.example             # Environment variable template
    ├── api/
    │   └── ai_assessment.py     # AI assessment router
    ├── ai_of_stark/
    │   └── AI agent/
    │       └── ai_security_advisor/
    │           ├── question_generator.py
    │           ├── recommendation_engine.py
    │           └── llm_client.py
    └── stark.2/
        └── Frontend/
            ├── api.js           # API client helpers
            └── src/
                └── pages/
                    ├── CompanyDashboard.jsx
                    └── HackerDashboard.jsx
```

---

## 👥 Contributors

| Name | Role | GitHub |
|---|---|---|
| **Khadija Umudova** | Backend Developer | [@khadijaumud](https://github.com/khadijaumud) |
| **Javidan Askerov** | Backend Developer | [@cavidaneskerov](https://github.com/cavidaneskerov) |
| **Mahammad Akhmedov** | Frontend Developer | [@theehmedov](https://github.com/theehmedov) |
| **Murad Isgandarli** | Frontend Developer | [@Velatryx](https://github.com/Velatryx) |
| **Ruhan Farajov** | Frontend Developer | [@ruhanfarajov](https://github.com/ruhanfarajov) |
> Want to contribute? Feel free to open an issue or submit a pull request.

---

<div align="center">

**Built with 🖤 for the cybersecurity community.**

_Stark Security — Because every system deserves a shield._

</div>
