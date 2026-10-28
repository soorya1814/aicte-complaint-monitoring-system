# 🚀 AICTE Grievance & Complaint Monitoring Portal — Team Quickstart Guide

**Problem Statement ID:** `SIH26264`  
**Title:** Integrated Dashboard for Monitoring and Tracking Institution-Related Complaint Cases Across AICTE Bureaus/Cells

Welcome to the project! This guide will help you set up and run the entire application on your local machine in under 3 minutes.

---

## 📋 Prerequisites

- **Node.js** (v18.0.0 or higher) — [Download Node.js](https://nodejs.org/)
- **npm** (comes bundled with Node.js)
- **MongoDB** (optional — a built-in memory server is included so you don't even need MongoDB installed!)

---

## ⚡ Quick Start (3 Steps)

### Step 1: Install Dependencies
Open a terminal in the unzipped project folder and run:
```bash
npm run setup
```
*(This automatically runs `npm install` for the root, backend `server/`, and frontend `client/`)*

### Step 2: Start the Database (If you don't have MongoDB installed)
If you do not have MongoDB running locally, start the built-in local database service:
```bash
npm run db
```
*(Leave this terminal window running)*

### Step 3: Seed Demo Data & Launch
In a new terminal window, populate the realistic demo records (7 AICTE bureaus, 4 colleges, 7 sample users, 8 active grievances):
```bash
npm run seed
```

Then start both backend and frontend concurrently:
```bash
npm run dev
```

That's it!
- **Frontend Dashboard:** [http://localhost:5173](http://localhost:5173)
- **Backend REST API:** [http://localhost:5000](http://localhost:5000)
- **Interactive Swagger Docs:** [http://localhost:5000/api/docs](http://localhost:5000/api/docs)

---

## 👥 Demo Logins & Credentials

You don't even have to type credentials — click any of the **1-Click Demo Login** buttons on the top evaluation banner!

Or use the manual credentials below:

| Role | Email | Password | Access / Capabilities |
| :--- | :--- | :--- | :--- |
| **Central Admin** | `admin@aicte-india.org` | `Password@123` | Full bureau visibility, officer reassignment, user & college directory, SLA escalation monitoring |
| **Bureau Officer** | `officer.approval@aicte-india.org` | `Password@123` | Approval Bureau caseload, timeline status progression, internal investigative notes |
| **College / Institution** | `principal@delhitechnical.edu.in` | `Password@123` | Lodging complaints, real-time case tracking, clarification replies, reopening resolved cases |

---

## 🧪 Running Automated Tests

To run the complete test suite (both backend API and frontend component tests):
```bash
npm test
```

To build for production:
```bash
npm run build
```

---

## 💡 Architecture & Technologies

- **Frontend:** React 18, Vite, Tailwind CSS, Lucide React, Recharts
- **Backend:** Node.js, Express.js, MongoDB with Mongoose, JWT (HTTP-only cookies), Zod, Helmet, Rate-Limiting
- **Documentation:** Interactive Swagger OpenAPI 3.0 at `/api/docs`
