# ServiceDesk Pro — Frontend Client

The frontend client for **ServiceDesk Pro**, an enterprise IT service desk and asset lifecycle management platform. Built using React 19, Vite 8, Tailwind CSS v4, and React Router 7.

---

## 🛠️ Technology Stack

- **Framework**: [React 19](https://react.dev/)
- **Bundler & Dev Server**: [Vite 8](https://vite.dev/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) via `@tailwindcss/vite`
- **Routing**: [React Router 7](https://reactrouter.com/)
- **HTTP Client**: [Axios](https://axios-http.com/)
- **Typography**: Inter (Google Fonts) & JetBrains Mono

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js (v18+ recommended)
- ServiceDesk Pro backend running on `http://localhost:5000`

### 2. Installation
Navigate to the `client/` directory and install dependencies:
```bash
cd client
npm install
```

### 3. Environment Configuration
Create a `.env` file in the `client/` directory (or copy from `.env.example`):
```bash
cp .env.example .env
```

Available environment variables:
```env
# Backend API Base URL (must start with VITE_ to be exposed to client)
VITE_API_BASE_URL=http://localhost:5000/api
```

> **Security Note:** Never add backend secrets (MongoDB URI, JWT secrets, OpenRouter API keys) to the frontend `.env`. Only public frontend settings should use `VITE_*`.

### 4. Running the Development Server
```bash
npm run dev
```
The Vite development server will start at:
```
http://localhost:5173/
```

### 5. Production Build & Preview
```bash
npm run build
npm run preview
```

---

## 📁 Architecture & Folder Structure

```text
client/src/
├── assets/                  # Static assets and icons
├── components/
│   ├── common/              # Generic shared helpers
│   ├── layout/              # Structural components (Sidebar, Topbar, PageContainer)
│   ├── ui/                  # Reusable UI primitives (Button, Input, Select, Modal, Badge, Spinner, etc.)
│   └── forms/               # Form components
├── constants/
│   └── roles.js             # RBAC role constants, labels, and permission helpers
├── contexts/
│   └── AuthContext.jsx      # Authentication provider, session management, and login/logout actions
├── hooks/                   # Custom reusable React hooks
├── layouts/
│   └── AppLayout.jsx        # Main application layout shell with responsive sidebar & topbar
├── pages/
│   ├── auth/                # Login & Registration pages with demo account autofill
│   ├── dashboard/           # System overview & portal dashboard
│   ├── tickets/             # Ticket management & SLA monitoring
│   ├── assets/              # IT asset & vendor lifecycle inventory
│   ├── knowledge/           # Knowledge base & troubleshooting articles
│   ├── notifications/       # Real-time alert center
│   ├── profile/             # User profile & account credentials
│   ├── health/              # Backend health ping & latency verification
│   └── NotFound.jsx         # 404 error page
├── routes/
│   └── ProtectedRoute.jsx   # Route guard with session hydration & RBAC checks
├── services/
│   └── api.js               # Axios instance with request/response interceptors & error formatting
├── utils/
│   └── errorHandler.js      # Normalized backend error extraction utilities
├── App.jsx                  # Main router setup and route declarations
├── main.jsx                 # Application entry point with React 19 root
└── index.css                # Tailwind CSS v4 directives and base typography
```

---

## 🛡️ Authentication & RBAC

The client supports role-based access control matching the backend:
- `system_admin`: Full administrative access
- `it_manager`: IT management and priority modifications
- `technician`: Ticket assignments and troubleshooting
- `asset_manager`: Hardware and vendor lifecycle operations
- `employee`: Self-service portal and requester access

---

## 📡 Backend Health Verification

The frontend includes a built-in health diagnostic route at `/health-check`. It tests live connectivity to `GET /api/health`, reporting server status, latency, and database connectivity.
