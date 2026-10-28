# AICTE Integrated Complaint Monitoring & Tracking Dashboard

[![Smart India Hackathon](https://img.shields.io/badge/SIH-2026-orange.svg)](https://sih.gov.in)
[![Problem Statement ID](https://img.shields.io/badge/Problem%20ID-SIH26264-blue.svg)](https://sih.gov.in)
[![Stack](https://img.shields.io/badge/Stack-React%20%7C%20Node.js%20%7C%20Express%20%7C%20MongoDB%20%7C%20Tailwind-green.svg)]()
[![License](https://img.shields.io/badge/License-MIT-lightgrey.svg)]()

> **Smart India Hackathon (SIH) Problem Statement ID:** `SIH26264`  
> **Title:** Integrated Dashboard for Monitoring and Tracking Institution-Related Complaint Cases Across AICTE Bureaus/Cells

A production-style full-stack platform engineered for the **All India Council for Technical Education (AICTE)**. The system enables educational institutions to lodge, track, and clarify regulatory grievances while allowing authorized AICTE officers across specialized bureaus and cells to triage, investigate, assign, resolve, and audit cases with automated SLA deadline tracking and AI decision support.

---

## 🏛️ System Architecture

```
aicte-complaint-system/
├── client/                     # Frontend Single Page Application (SPA)
│   ├── src/
│   │   ├── api/                # Axios API services (Auth, Complaints, Dashboard, Admin, AI)
│   │   ├── components/
│   │   │   ├── common/         # Buttons, Inputs, Modals, Badges, Cards, Pagination, DemoBanner
│   │   │   ├── complaints/     # Timeline, PriorityBadge, StatusBadge, MessageThread, Modals
│   │   │   └── layout/         # Header, Deep Navy Sidebar, AppLayout
│   │   ├── context/            # AuthContext, ToastContext, NotificationContext
│   │   ├── pages/              # 16 Complete Production Screens
│   │   ├── App.jsx             # Protected Route Guards & React Router v6
│   │   └── main.jsx
│   ├── vite.config.js          # Vite config with backend proxy and Vitest setup
│   └── tailwind.config.js      # AICTE institutional design tokens
├── server/                     # Backend Express.js REST API
│   ├── src/
│   │   ├── config/             # DB connector (MongoDB / Atlas), Swagger OpenAPI
│   │   ├── controllers/        # Auth, Complaint, Dashboard, Bureau, Institution, Audit, AI
│   │   ├── middleware/         # JWT Auth, RBAC, Zod Validation, RateLimiter, ErrorHandler
│   │   ├── models/             # User, Institution, Department, Complaint, Message, AuditLog
│   │   ├── routes/             # RESTful API route definitions
│   │   ├── services/           # AI NLP Engine, Audit Logger, Notifications, CSV Streaming
│   │   ├── utils/              # ID Generator (AICTE-YYYY-XXXXX), SLA Deadlines
│   │   ├── validators/         # Zod schemas for all request payloads
│   │   ├── app.js              # Express app with Helmet, CORS, Rate Limiters
│   │   └── server.js           # Server entry point with connection validation
│   └── tests/                  # Vitest API test suite (Supertest + MongoDB Memory Server)
├── scripts/
│   └── seed.js                 # Realistic synthetic demo seed across 7 AICTE Bureaus
├── docs/
│   ├── architecture.md         # Detailed Mermaid architectural diagrams & state machine
│   └── swagger.json
├── .env.example                # Sample environment variables
├── package.json                # Root concurrent scripts
└── README.md                   # Complete documentation
```

---

## 🚀 Key Features

### 1. Complete Complaint Lifecycle & Workflow
- **Standardized Case IDs**: Automated generation of AICTE complaint reference IDs in format `AICTE-YYYY-XXXXX` (e.g. `AICTE-2026-10492`).
- **7-Stage Lifecycle**: `Submitted` ➔ `Under Review` ➔ `In Progress` ➔ `Awaiting Institution Response` ➔ `Resolved` ➔ `Closed` ➔ `Reopened`.
- **Target SLA & Overdue Engine**: Deadlines calculated automatically by priority:
  - **Critical**: 48 hours SLA (urgent safety / court contempt)
  - **High**: 7 days SLA
  - **Medium**: 14 days SLA
  - **Low**: 30 days SLA
- **Public Clarifications vs. Confidential Officer Notes**: Strictly segregated at database and API levels. Institution representatives can only view and post public communications; officers and admins can author internal investigative notes completely hidden from institutions.
- **Appeals & Reopening**: Resolved complaints can be reopened by institutions with mandatory justification.
- **Duplicate Detection**: Real-time warning alert if an institution submits similar complaints within 30 days.

### 2. Multi-Role RBAC Authorization & Data Isolation
- **Institution User**: Restricted strictly to their own institution's complaints (`{ institution: user.institution }`).
- **Bureau Officer**: Restricted to complaints assigned to their bureau (`{ department: user.department }`) or assigned officer pool.
- **Administrator**: Cross-bureau oversight, user management, bureau configurations, audit logs, and global CSV export.

### 3. AI-Assisted Decision Support (Dual-Mode)
- **Automatic Bureau Routing**: Analyzes grievance text and recommends appropriate AICTE Bureau (`Approval Bureau`, `Grievance Cell`, `Finance Bureau`, `Student Development Cell`, etc.).
- **Dynamic Priority & Explanation**: Elevates priority for harassment, safety threats, or impending cutoffs with full transparent rationales.
- **Precedent Similarity Scoring**: Discovers related or duplicate complaints in the system.
- **Officer Briefing Generator**: Generates 3-bullet TL;DR summaries for rapid executive review.
- **Zero-Dependency Fallback**: Works **100% offline** via domain-specific rule-based NLP classifier if no Gemini/OpenAI API key is configured.

### 4. Interactive Live Dashboard & Analytics (Recharts)
- **8 KPI Cards**: Total Cases, Newly Submitted, Pending Review, In Progress, Resolved, SLA Overdue, Avg Resolution Time (Days), Resolution Rate (%).
- **Interactive Visualizations**:
  - Donut Chart: Complaint Status Distribution
  - Grouped Bar Chart: Bureau Workload (Open vs. Resolved)
  - Line Chart: Submission & Resolution Trends over time
  - Horizontal Bar Chart: Urgency Priority Distribution
  - Escalation Queue: SLA Overdue Cases Ranked by Days Elapsed
  - Live Activity Feed: Chronological status transitions and audit milestones
- **Unified Filtering**: Time Range (7d, 30d, 90d, All) and Bureau filters automatically recalculate all cards and charts from the same dataset.

### 5. Institutional Design System
- Built to Indian national institutional standards:
  - Deep Navy Sidebar (`#0f172a`)
  - Clean Slate/White surfaces (`#f8fafc`)
  - Royal Blue Primary Actions (`#2563eb`)
  - Emerald Green for Resolved (`#10b981`)
  - Amber for Pending Review (`#f59e0b`)
  - Ruby Red for Critical & Overdue (`#dc2626`)
  - Violet for In Progress (`#7c3aed`)

---

## 👥 Synthetic Demo Accounts & 1-Click Fast Switcher

The application features a sticky top bar with **1-Click Demo Evaluation Sign-In** allowing hackathon judges to switch roles instantly without typing passwords:

| Role | Name | Email | Password | Assigned Scope |
| :--- | :--- | :--- | :--- | :--- |
| **Administrator** | Dr. Ramesh Sharma | `admin@aicte.gov.in` | `Password@123` | National AICTE Oversight (Full Admin) |
| **Bureau Officer** | Dr. Sunita Deshmukh | `officer.ab@aicte.gov.in` | `Password@123` | Approval Bureau (AB) |
| **Grievance Officer** | Col. Vikramaditya Rathore | `officer.grc@aicte.gov.in` | `Password@123` | Grievance Redressal Cell (GRC) |
| **Finance Officer** | Sh. Anil K. Chawla | `officer.fb@aicte.gov.in` | `Password@123` | Finance Bureau (FB) |
| **Scholarships Officer**| Smt. Priya Nair | `officer.sdc@aicte.gov.in` | `Password@123` | Student Development Cell (SDC) |
| **Institution User** | Prof. Alok Mukherjee | `principal@dtie.edu.in` | `Password@123` | Delhi Tech Inst of Eng (DTIE) |
| **Institution User** | Dr. Manisha Kulkarni | `director@matr.ac.in` | `Password@123` | Maharashtra Academy (MATR) |
| **Institution User** | Dr. K. Srinivas | `registrar@bnims.edu.in` | `Password@123` | Bengaluru National Inst (BNIMS) |

*(All seed data is completely fictional and synthetic, created exclusively for demonstration purposes).*

---

## 🛠️ Windows Installation & Setup Guide

### Prerequisites
- **Node.js**: v20 or v24 LTS ([Download Node.js](https://nodejs.org/))
- **MongoDB**: Local Community Server or MongoDB Atlas free cloud cluster ([MongoDB Community](https://www.mongodb.com/try/download/community))
- **PowerShell** or Command Prompt

### Step 1: Install Dependencies
Open PowerShell in the project directory:
```powershell
# Install root, server, and client dependencies
npm run install:all
```

### Step 2: Configure Environment Variables
Copy `.env.example` to `server/.env` (or root `.env`):
```powershell
cp .env.example server/.env
```
Default configuration (`server/.env`):
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://127.0.0.1:27017/aicte_complaints
JWT_SECRET=super_secret_jwt_token_change_in_production_min32chars
JWT_EXPIRES_IN=7d
COOKIE_NAME=aicte_auth_token
CLIENT_ORIGIN=http://localhost:5173
AI_PROVIDER=rule_based
```

> **Note on MongoDB**:
> - **Local MongoDB**: Run `net start MongoDB` in an Administrator PowerShell window.
> - **MongoDB Atlas**: Paste your cloud connection string into `MONGODB_URI` in `server/.env`.
> - If MongoDB is not yet running, the server and seed script print clear, human-friendly setup instructions without silent data failure.

### Step 3: Seed Synthetic Demo Data
Seed realistic fictional AICTE bureaus, demo users, institutions, and grievance cases:
```powershell
npm run seed
```

### Step 4: Run the Application
Start both Express backend (Port 5000) and React Vite frontend (Port 5173) concurrently:
```powershell
npm run dev
```

Visit the application in your browser:
- **Frontend Dashboard**: [http://localhost:5173](http://localhost:5173)
- **Interactive Swagger OpenAPI Docs**: [http://localhost:5000/api/docs](http://localhost:5000/api/docs)
- **Health Check Endpoint**: [http://localhost:5000/api/health](http://localhost:5000/api/health)

---

## 🧪 Running Automated Tests

The codebase includes comprehensive automated tests for both backend APIs and frontend UI components.

### 1. Run Complete Test Suite
```powershell
npm test
```

### 2. Run Backend API Tests (Vitest + Supertest)
```powershell
npm run test:server
```
*Tests verify:*
- Registration, password hashing, and JWT HttpOnly cookie issuance
- Multi-role authorization checks (`admin`, `officer`, `institution`)
- Strict multi-tenant institutional data isolation
- Complaint generation with unique reference IDs
- Lifecycle status transitions and SLA deadline calculations
- Public clarifications vs. confidential internal officer notes isolation
- Case reopening with mandatory grounds
- Aggregated dashboard KPI and chart metrics

### 3. Run Frontend UI Tests (Vitest + React Testing Library)
```powershell
npm run test:client
```
*Tests verify:*
- Color-coded institutional status badges (`Resolved`, `In Progress`, `Awaiting Response`)
- SLA priority badges (`Critical`, `High`, `Medium`, `Low`)
- Button loading and disabled states
- Login screen rendering and 1-click evaluation shortcuts

---

## 📡 REST API Summary

Full interactive documentation is accessible at `/api/docs`.

| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/health` | System health & live DB status | Public |
| `POST` | `/api/auth/register` | Register institution user or officer | Public |
| `POST` | `/api/auth/login` | Authenticate & issue HTTP-only cookie | Public |
| `POST` | `/api/auth/logout` | Terminate session & clear cookies | Authenticated |
| `GET` | `/api/auth/me` | Fetch active user profile | Authenticated |
| `POST` | `/api/complaints` | Lodge new grievance case | Institution / Admin |
| `GET` | `/api/complaints` | Server-paginated, filtered complaints | Authenticated (Scoped) |
| `GET` | `/api/complaints/:id` | Full case details, history, messages | Authenticated (Scoped) |
| `PATCH`| `/api/complaints/:id/status` | Transition case lifecycle state | Officer / Admin |
| `PATCH`| `/api/complaints/:id/assignment` | Assign responsible bureau officer | Officer / Admin |
| `POST` | `/api/complaints/:id/messages`| Add clarification or internal note | Authenticated |
| `POST` | `/api/complaints/:id/reopen` | Reopen resolved grievance with reason| Institution / Admin |
| `GET` | `/api/dashboard/summary` | Real-time KPIs, charts, overdue list | Authenticated (Scoped) |
| `GET` | `/api/reports/complaints.csv`| Download filtered ledger report | Authenticated (Scoped) |
| `POST` | `/api/ai/analyze` | AI category, priority & routing | Authenticated |
| `GET` | `/api/departments` | List AICTE bureaus & caseload | Authenticated |
| `GET` | `/api/institutions` | Institutions directory & filter | Authenticated |
| `GET` | `/api/users` | Admin user account management | Admin only |
| `GET` | `/api/audit-logs` | Security and operational audit log | Admin only |
| `GET` | `/api/notifications` | User in-app notifications | Authenticated |

---

## 🔒 Security Measures
- **HTTP-Only Cookies**: JWT tokens stored with `httpOnly: true`, `sameSite: 'lax'`, preventing XSS token theft.
- **Password Hashing**: Salted bcrypt hashing (10 salt rounds).
- **NoSQL Injection Defenses**: Input validation via Zod schemas and sanitized MongoDB query operators.
- **Helmet Headers**: Standard HTTP security headers enabled.
- **CORS Protection**: Restricted to configured client origins with credentials support.
- **Rate Limiting**: Dedicated rate limiting on authentication routes to mitigate brute force attacks.
- **Audit Logging**: Sensitive actions logged with timestamp, user ID, role, action, and IP address.

---

## 📄 License
Developed for the Smart India Hackathon (SIH) under the AICTE Grievance Redressal initiative.
