# ServiceDesk Pro — IT Helpdesk & Asset Management System

ServiceDesk Pro is a modern, enterprise-ready IT Service Management (ITSM) and Asset Management solution built with the MERN stack.

---

## 🛠 Tech Stack

- **Backend**: Node.js, Express.js (ES Modules)
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (Access Tokens + Refresh Tokens) with bcryptjs password hashing
- **Authorization**: Role-Based Access Control (RBAC) & Department scoping
- **Lifecycle Engine**: Strict state machine validation & SLA policy deadline monitoring
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
│   │   ├── config/             # DB & seed configuration
│   │   ├── controllers/        # Request handling and response dispatch
│   │   ├── jobs/               # Background task definitions (SLA escalation monitor)
│   │   ├── middleware/         # Auth, RBAC, error & 404 middleware
│   │   ├── models/             # Mongoose schemas (User, Department, Ticket, SlaPolicy, etc.)
│   │   ├── routes/             # RESTful API route definitions
│   │   ├── services/           # Business logic (Ticket, SLA, Audit, Notifications)
│   │   ├── utils/              # Tokens, constants, errors, responses
│   │   └── validators/         # Input validation middleware
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
3. Seed the database with demo departments, SLA policies, and role-based test users:
   ```bash
   npm run seed
   ```
4. Start the backend:
   ```bash
   # Development mode (with live watch)
   npm run dev

   # Or standard production start
   npm start
   ```

### 3. Run Automated Tests
Execute the end-to-end test suite (authenticates test roles, tests lifecycle transitions, SLA deadline calculations, audit logging, comments, and work logs):
```bash
cd server
npm test
```

---

## 👥 Demo Seed Credentials

| Role | Email | Password |
|---|---|---|
| **System Admin** | `admin@servicedesk.local` | `Password@123` |
| **IT Manager** | `manager@servicedesk.local` | `Password@123` |
| **Technician** | `tech1@servicedesk.local` | `Password@123` |
| **Employee** | `employee1@servicedesk.local` | `Password@123` |

---

## 🔄 Ticket Lifecycle State Machine

```text
    ┌────────┐
    │  OPEN  │ ──(Assign)──> ┌──────────┐
    └────────┘               │ ASSIGNED │ ──(Start)──> ┌─────────────┐
                             └──────────┘              │ IN_PROGRESS │
                                                       └─────────────┘
                                                              │
                                                          (Resolve)
                                                              ▼
    ┌────────┐               ┌──────────┐              ┌─────────────┐
    │ CLOSED │ <───(Close)── │ REOPENED │ <──(Reopen)─ │  RESOLVED   │
    └────────┘               └──────────┘              └─────────────┘
                                  │
                               (Start)
                                  ▼
                           ┌─────────────┐
                           │ IN_PROGRESS │
                           └─────────────┘
```

Invalid transitions (e.g. attempting to resolve an unassigned `OPEN` ticket, or modifying status via generic PATCH) are rejected with HTTP 400.

---

## 📡 API Endpoints Catalog

### Health & Auth
| Method | Endpoint | Description | Access |
|---|---|---|---|
| `GET` | `/api/health` | Service & database connectivity check | Public |
| `POST` | `/api/auth/register` | Register employee account | Public |
| `POST` | `/api/auth/login` | Authenticate with email/password | Public |
| `POST` | `/api/auth/refresh` | Rotate access token | Public |
| `GET` | `/api/auth/me` | Fetch active user profile | Authenticated |
| `POST` | `/api/auth/logout` | Revoke session refresh token | Authenticated |

### Tickets & Workflow
| Method | Endpoint | Description | Access |
|---|---|---|---|
| `POST` | `/api/tickets` | Create ticket (auto-calculates SLA deadlines) | Authenticated |
| `GET` | `/api/tickets` | List tickets (scoped by role with search/filter/pagination) | Authenticated |
| `GET` | `/api/tickets/:id` | Get ticket details | Scoped |
| `PATCH` | `/api/tickets/:id` | Update ticket metadata (title, category, priority) | Authorized |
| `POST` | `/api/tickets/:id/assign` | Assign technician to ticket (`OPEN` $\rightarrow$ `ASSIGNED`) | `system_admin`, `it_manager` |
| `POST` | `/api/tickets/:id/start` | Start ticket work (`ASSIGNED` $\rightarrow$ `IN_PROGRESS`) | Assigned Technician, Managers |
| `POST` | `/api/tickets/:id/resolve` | Mark ticket resolved with notes (`IN_PROGRESS` $\rightarrow$ `RESOLVED`) | Assigned Technician, Managers |
| `POST` | `/api/tickets/:id/reopen` | Reopen resolved ticket (`RESOLVED` $\rightarrow$ `REOPENED`) | Requester, Managers |
| `POST` | `/api/tickets/:id/close` | Confirm closure of resolved ticket (`RESOLVED` $\rightarrow$ `CLOSED`) | Requester, Managers |
| `GET` | `/api/tickets/:id/audit` | View immutable audit trail history for ticket | Scoped |

### Ticket Comments & Work Logs
| Method | Endpoint | Description | Access |
|---|---|---|---|
| `GET` | `/api/tickets/:id/comments` | List comments (internal notes hidden from employee) | Scoped |
| `POST` | `/api/tickets/:id/comments` | Post comment (employees or support staff) | Scoped |
| `GET` | `/api/tickets/:id/worklogs` | View technician work time records | Technicians, Managers |
| `POST` | `/api/tickets/:id/worklogs` | Log effort time in minutes | Technicians, Managers |

### SLA Policies
| Method | Endpoint | Description | Access |
|---|---|---|---|
| `GET` | `/api/sla` | List configured SLA targets | Authenticated |
| `GET` | `/api/sla/:id` | Get specific SLA policy | Authenticated |
| `POST` | `/api/sla` | Create new SLA policy | `system_admin`, `it_manager` |
| `PATCH` | `/api/sla/:id` | Update SLA response/resolution targets | `system_admin`, `it_manager` |
| `DELETE` | `/api/sla/:id` | Delete SLA policy | `system_admin`, `it_manager` |

### Notifications
| Method | Endpoint | Description | Access |
|---|---|---|---|
| `GET` | `/api/notifications` | View in-app user notifications (with unread count) | Authenticated |
| `PATCH` | `/api/notifications/:id/read` | Mark notification as read | Authenticated |
| `PATCH` | `/api/notifications/read-all` | Mark all notifications as read | Authenticated |
