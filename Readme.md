# ServiceDesk Pro — IT Helpdesk & Asset Management System

ServiceDesk Pro is a modern, enterprise-ready IT Service Management (ITSM) and Asset Management solution built with the MERN stack.

---

## 🛠 Tech Stack

- **Backend**: Node.js, Express.js (ES Modules)
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (Access Tokens + Refresh Tokens) with bcryptjs password hashing
- **Authorization**: Role-Based Access Control (RBAC) & Department scoping
- **Frontend**: React 19, Vite 8

---

## 📁 Repository Structure

```text
servicedesk-pro/
├── client/                     # Frontend (React 19 + Vite)
│   ├── src/
│   ├── package.json
│   └── vite.config.js
├── server/                     # Backend (Node.js ESM + Express)
│   ├── src/
│   │   ├── config/             # DB & environmental configuration
│   │   ├── controllers/        # Request handling and response dispatch
│   │   ├── middleware/         # Auth, RBAC, error & 404 middleware
│   │   ├── models/             # Mongoose schemas & data models (User, Department, ...)
│   │   ├── routes/             # RESTful API route definitions
│   │   ├── services/           # Reusable business logic
│   │   ├── utils/              # Tokens, errors, responses
│   │   ├── validators/         # Input validation middleware
│   │   └── jobs/               # Background task definitions (escalations, SLA)
│   ├── server.js               # Server entry point
│   ├── package.json
│   ├── .env.example            # Environment variable template
│   └── test_runner.js          # Automated end-to-end API test suite
├── .gitignore
└── Readme.md
```

---

## 🚀 Getting Started

### 1. Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [MongoDB](https://www.mongodb.com/try/download/community) running locally on port `27017` or a MongoDB Atlas URI

### 2. Backend Setup
1. Open a terminal in the `server` directory:
   ```bash
   cd server
   npm install
   ```
2. Configure your environment variables:
   - Copy `.env.example` to `.env`:
     ```bash
     copy .env.example .env
     ```
   - Customize `PORT`, `MONGODB_URI`, `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, and `CLIENT_URL` if needed.
3. Start the backend:
   ```bash
   # Development mode (with live watch)
   npm run dev

   # Or standard production start
   npm start
   ```
4. Verify backend health:
   - Visit: `http://localhost:5000/api/health`

### 3. Run Automated Tests
Run the comprehensive end-to-end API verification suite:
```bash
cd server
npm test
```

### 4. Frontend Setup
1. Open a separate terminal in the `client` directory:
   ```bash
   cd client
   npm install
   ```
2. Start the Vite development server:
   ```bash
   npm run dev
   ```
3. Open `http://localhost:5173` in your browser.

---

## 📡 API Endpoints Overview

| Method | Endpoint | Description | Access |
|---|---|---|---|
| `GET` | `/api/health` | Service & database connectivity check | Public |
| `POST` | `/api/auth/register` | Register new employee account | Public |
| `POST` | `/api/auth/login` | Authenticate with email/password | Public |
| `POST` | `/api/auth/refresh` | Rotate and issue new access token | Public |
| `GET` | `/api/auth/me` | Fetch authenticated user profile | Protected (All roles) |
| `POST` | `/api/auth/logout` | Revoke session refresh token | Protected (All roles) |
| `GET` | `/api/departments` | List active departments | Public / Authenticated |
| `GET` | `/api/departments/:id` | Get department details | Public / Authenticated |
| `POST` | `/api/departments` | Create new department | `system_admin`, `it_manager` |
| `PATCH` | `/api/departments/:id` | Update department details | `system_admin`, `it_manager` |
| `GET` | `/api/users` | List users with pagination and search | `system_admin`, `it_manager`, `technician` |
| `GET` | `/api/users/:id` | Get user by ID | Protected |
| `PATCH` | `/api/users/:id` | Update user details (role guarded) | Protected |

---

## 🛡️ Security Features
- Passwords hashed with `bcryptjs` (salt rounds: 10).
- Dual-token authentication: short-lived access tokens (`15m`) + refresh tokens (`7d`).
- Cross-Origin Resource Sharing (CORS) restricted to configured `CLIENT_URL`.
- Role-based authorization guardrails (public users cannot self-assign privileged roles).
- Centralized error handler preventing stack trace leaks in production.
