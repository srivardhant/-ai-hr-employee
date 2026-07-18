# 🧠 AI HR Employee Platform

> A full-stack, AI-powered Human Resource Management System built with **Next.js 16**, **PostgreSQL (Supabase)**, **Prisma ORM**, and **Google Calendar API** — covering the entire employee lifecycle from job posting to exit.

**Live Demo → [ai-hr-employee.vercel.app](https://ai-hr-employee.vercel.app)**

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Login Credentials](#login-credentials)
3. [Tech Stack](#tech-stack)
4. [Features & How They Work](#features--how-they-work)
   - [Authentication](#1-authentication)
   - [Dashboard](#2-dashboard)
   - [Recruitment & Job Openings](#3-recruitment--job-openings)
   - [Candidate Management](#4-candidate-management)
   - [Interview Scheduling](#5-interview-scheduling)
   - [Evaluations](#6-evaluations)
   - [Offer Management](#7-offer-management)
   - [Employee Management](#8-employee-management)
   - [Onboarding](#9-onboarding)
   - [Training & Development](#10-training--development)
   - [Payroll](#11-payroll)
   - [Leave Management](#12-leave-management)
   - [Performance Reviews](#13-performance-reviews)
   - [Promotions](#14-promotions)
   - [Employee Engagement](#15-employee-engagement)
   - [Exit Management](#16-exit-management)
   - [AI Assistant](#17-ai-assistant)
   - [Workflow Automation](#18-workflow-automation)
   - [Notifications](#19-notifications)
   - [Google Calendar Integration](#20-google-calendar-integration)
   - [Settings](#21-settings)
5. [Local Development](#local-development)
6. [Environment Variables](#environment-variables)
7. [Database Seeding](#database-seeding)
8. [Deployment](#deployment)
9. [Project Structure](#project-structure)

---

## Overview

The **AI HR Employee Platform** is a production-grade HRMS that replaces fragmented spreadsheets and disconnected tools with one unified system. It automates the most repetitive HR workflows using AI — from resume screening and interview scheduling to payroll processing and performance reviews.

### What it solves
- HR teams spend hours manually posting jobs, reading resumes, scheduling interviews, writing offer letters, processing payroll, and tracking leaves
- Each process typically lives in a different tool (ATS, calendar, payroll software, spreadsheet)
- Data gets lost between steps, especially when candidates transition to employees

### How it solves it
- **Single platform** for the entire employee lifecycle
- **AI scoring** on resumes so HR doesn't read 200 applications manually
- **Google Calendar + Meet** auto-created when an interview is scheduled
- **Automated workflows** for onboarding, offboarding, payroll, and promotions
- **Real-time notifications** across all HR events

---

## Login Credentials

### 👑 HR Admin (Full Access)

| Field | Value |
|---|---|
| **Email** | `srivardhan@aihr.com` |
| **Password** | `srivardhan123` |
| **Role** | HR Director |
| **Access** | All modules — full read/write/approve |

---

### 👔 Managers

| Name | Email | Password | Department |
|---|---|---|---|
| Srikar | `srikar@aihr.com` | `srikar123` | Engineering |
| Vikram | `vikram@aihr.com` | `vikram123` | Sales |

---

### 👤 Employees

| Name | Email | Password | Role | Department |
|---|---|---|---|---|
| Yuvan | `yuvan@aihr.com` | `yuvan123` | Senior Software Engineer | Engineering |
| Hemanth | `hemanth@aihr.com` | `hemanth123` | Software Engineer | Engineering |
| Srivally | `srivally@aihr.com` | `srivally123` | Lead UI/UX Designer | Design |
| Srujana | `srujana@aihr.com` | `srujana123` | Marketing Manager | Marketing |
| Rahul | `rahul@aihr.com` | `rahul123` | Senior Sales Executive | Sales |
| Ananya | `ananya@aihr.com` | `ananya123` | QA Engineer | Engineering |
| Karthik | `karthik@aihr.com` | `karthik123` | Finance Analyst | Finance |
| Divya | `divya@aihr.com` | `divya123` | HR Specialist | HR |

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | Next.js 16 (App Router + Turbopack) |
| **Language** | TypeScript |
| **Database** | PostgreSQL via Supabase |
| **ORM** | Prisma 5 |
| **Styling** | Tailwind CSS 4 |
| **Auth** | Custom session-based (bcrypt passwords) |
| **AI** | Google Gemini API |
| **Calendar** | Google Calendar API v3 + Google Meet |
| **Email** | Resend API |
| **Charts** | Recharts |
| **Animations** | Framer Motion |
| **Deployment** | Vercel |

---

## Features & How They Work

---

### 1. Authentication

**Route:** `/login`

The platform uses a custom session system. Passwords are hashed using `bcryptjs`. On login:

1. User submits email + password
2. Server validates credentials against the database
3. Session is stored (user role, id, name) and the user is redirected to the dashboard

**Roles:**
- `ADMIN` / `HR` — full access to all modules
- `MANAGER` — can view/manage their team, approve leaves, add interview feedback
- `EMPLOYEE` — can view their own profile, payslips, leaves, and training

---

### 2. Dashboard

**Route:** `/`

The landing page after login. Shows a real-time overview of the entire company:

- **Stat cards** — total employees, active candidates, interviews scheduled today, payroll pending
- **Hiring funnel chart** — visual breakdown of candidates at each stage (Applied → Hired)
- **Department distribution** — donut chart showing headcount per department
- **Recent activity timeline** — last 10 HR events (hires, offers, interviews, leaves)
- **AI Insights panel** — AI-generated observations about your workforce trends
- **Upcoming interviews** — next 5 scheduled interviews with times and candidate names

All data is fetched live from the database on every page load.

---

### 3. Recruitment & Job Openings

**Route:** `/recruitment`

Manage all open roles at the company.

**How it works:**

1. Click **+ New Job Opening** to create a role with title, department, description, requirements, salary range, location, and number of openings
2. Each job opening has a status: `OPEN`, `CLOSED`, or `ON_HOLD`
3. Job openings are linked to candidates — when you create a candidate, you associate them with a specific opening
4. Dashboard hiring funnel updates automatically as candidates progress through stages

**Job Opening Fields:**
- Title, Department, Location, Type (Full-time / Part-time / Contract)
- Salary min/max range
- Number of openings
- Description and requirements

**Active Job Openings (seeded):**

| Role | Department | Openings |
|---|---|---|
| Senior Software Engineer | Engineering | 2 |
| Product Designer | Design | 1 |
| Digital Marketing Specialist | Marketing | 1 |
| Enterprise Sales Executive | Sales | 2 |
| QA Automation Engineer | Engineering | 1 |

---

### 4. Candidate Management

**Route:** `/recruitment` → Candidates tab

Track every candidate from application to hire.

**Candidate Lifecycle:**
```
APPLIED → SCREENING → SHORTLISTED → INTERVIEW → EVALUATED → OFFERED → HIRED / REJECTED
```

**How it works:**

1. Add a candidate manually (name, email, phone, experience, skills, resume URL, source)
2. Each candidate is linked to a job opening
3. **AI Screen Score (0–100)** — an automated score assigned based on skills and experience match
4. Status updates as the candidate progresses (can be changed manually or auto-updated by scheduling an interview)
5. Clicking a candidate shows their full profile, interview history, evaluation scores, and offer status

**Sources tracked:** LinkedIn, Website, Referral, Job Board

**Seeded Candidates:**

| Name | Job | AI Score | Status |
|---|---|---|---|
| Srinivas Rao | Senior SWE | 87.5 | Shortlisted |
| Ramesh Babu | Senior SWE | 79.0 | Interview |
| Priya Sharma | Product Designer | 91.0 | Interview |
| Varshitha Reddy | Product Designer | 68.0 | Screening |
| Mahender Goud | Marketing | 82.0 | Shortlisted |
| Ananya Verma | Marketing | 55.0 | Applied |
| Suresh Kumar | Sales | 88.5 | Offered |
| Rama Krishnan | Sales | 74.0 | Interview |
| Nikhil Joshi | QA Engineer | 86.0 | Evaluated |
| Kavitha Nair | QA Engineer | 64.0 | Screening |
| Rohit Mehta | Senior SWE | 42.0 | Rejected |
| Deepika Singh | Senior SWE | 73.0 | Applied |

---

### 5. Interview Scheduling

**Route:** `/interviews`

Schedule, track and manage all candidate interviews — fully integrated with Google Calendar and Google Meet.

**How it works:**

1. Click **+ Schedule Interview**
2. Select the candidate, date/time (in your local timezone), duration, interview type, and panel members
3. On submission:
   - A **Google Calendar event** is created instantly on the connected company Google account
   - A **Google Meet link** is generated and embedded in the event
   - A **confirmation email** is sent to the candidate with the Meet link and calendar invite
   - The `CALENDAR SYNC` column shows `Synced` (green) or `Failed` (red)
4. If sync fails, hit **Retry** to re-attempt

**Interview Types:**
- HR Screening
- Technical Interview
- Cultural Review
- Final Director Review

**Calendar Sync Status:**
- `Pending` — sync in progress
- `Synced` — event in Google Calendar with Meet link ready
- `Failed` — sync error (reconnect Google in Settings, then Retry)

---

### 6. Evaluations

**Route:** `/evaluations`

Score candidates after interviews and generate an AI-powered hire/no-hire recommendation.

**Scores (0–10 each):**
- **Technical Score** — coding/domain knowledge
- **HR Score** — attitude, professionalism
- **Communication Score** — clarity, articulation
- **Cultural Fit Score** — alignment with company values

The overall score is auto-computed. An **AI Summary** explains the recommendation.

**Recommendations:** `STRONG_HIRE` | `HIRE` | `MAYBE` | `NO_HIRE`

---

### 7. Offer Management

**Route:** `/offers`

Create, send, and track job offers to selected candidates.

**Offer flow:**
1. HR creates an offer: salary, joining date, department, position, benefits, expiry date
2. Status: `DRAFT` → `SENT` → `ACCEPTED` / `REJECTED` / `EXPIRED`
3. When accepted: candidate status becomes `HIRED` and onboarding begins

---

### 8. Employee Management

**Route:** `/employees`

Full directory of all current employees with search, filter, and profile management.

**Features:**
- View employees in grid or list view
- Filter by department, status, or search by name
- Click any employee to view their full profile:
  - Personal details (name, gender, DOB, phone, address)
  - Job details (department, position, manager, join date, salary)
  - Training progress, leave history, payroll summary, performance ratings, recognitions

**Employee statuses:** `ACTIVE` | `ON_LEAVE` | `TERMINATED` | `RESIGNED`

**Org Chart:** `/org-chart` — visual reporting hierarchy tree

---

### 9. Onboarding

**Route:** `/onboarding`

Structured onboarding for newly hired employees.

**Steps tracked:**
- Welcome letter sent
- IT equipment assigned
- Company email created
- Orientation scheduled
- First day meeting set

**Status:** `PENDING` → `IN_PROGRESS` → `COMPLETED`

An AI-generated welcome letter can be created per employee from the onboarding page.

---

### 10. Training & Development

**Route:** `/training`

Assign, track, and manage training courses for all employees.

**Mandatory (auto-assigned to all employees):**
- Workplace Safety & Compliance
- Cybersecurity Awareness
- AI Ethics & Responsible AI Usage
- Data Privacy & GDPR
- Diversity & Inclusion

**Optional (assignable per employee):**
- Effective Communication Skills
- Leadership & Management Essentials
- Advanced TypeScript & Node.js

**Progress tracking:** `ASSIGNED` → `IN_PROGRESS` → `COMPLETED` / `OVERDUE` with 0–100% progress bar.

---

### 11. Payroll

**Route:** `/payroll`

Generate, process, and track monthly payroll for all employees.

**Auto-calculated per employee:**

| Component | Formula |
|---|---|
| Base Salary | From employee record |
| Allowances | 20% of base |
| Tax | 10% of base |
| Deductions | 5% of base |
| Bonuses | Manual entry |
| **Net Pay** | Base + Allowances − Tax − Deductions + Bonuses |

**Status:** `DRAFT` → `PROCESSED` → `PAID` / `FAILED`

Pre-seeded with last 3 months of payroll for all employees.

---

### 12. Leave Management

**Route:** `/leave`

Employees apply for leave; managers/HR approve or reject.

**Leave Types:** Casual | Sick | Annual | Maternity | Paternity | Unpaid

**Flow:**
1. Employee submits leave request with type, dates, and reason → status: `PENDING`
2. HR/Manager approves or rejects → status: `APPROVED` / `REJECTED`
3. Approver's name and timestamp recorded

Leave history is visible on each employee's profile page.

---

### 13. Performance Reviews

**Route:** `/performance`

Quarterly performance review cycle for all employees.

**Review includes:**
- Overall rating (1.0–5.0)
- Written feedback
- Goals achieved this quarter
- Areas for improvement
- **AI Suggestions** — recommended trainings or actions based on rating

**Status:** `PENDING` → `IN_PROGRESS` → `COMPLETED`

Pre-seeded with Q1 reviews for all 10 employees.

---

### 14. Promotions

**Route:** `/promotions`

Track and approve employee promotions and salary revisions.

**Flow:**
1. HR proposes promotion: from/to position, from/to salary
2. Salary revision % auto-calculated
3. Status: `PROPOSED` → `APPROVED` → `IMPLEMENTED` / `REJECTED`
4. On implementation: employee's position and salary are updated

---

### 15. Employee Engagement

**Route:** `/engagement`

Pulse surveys and recognition to measure and boost morale.

**Surveys:**
1. HR creates survey with custom questions
2. Status: `DRAFT` → `ACTIVE` → `CLOSED`
3. Employees submit responses (optionally anonymous)
4. Results show average ratings and comments

**Recognition:**
- HR/managers award employees for outstanding work
- Categories: General | Innovation | Teamwork | Leadership | Customer
- Points system (up to 750 points for top awards)

**Seeded recognitions:**
| Employee | Award | Points |
|---|---|---|
| Srikar | Best Engineering Manager | 750 |
| Rahul | Top Sales Performer | 600 |
| Yuvan | Best Technical Delivery | 500 |
| Srivally | Outstanding Design Quality | 400 |
| Srujana | Marketing Campaign MVP | 350 |

---

### 16. Exit Management

**Route:** `/exit`

Structured offboarding when an employee resigns or is terminated.

**Checklist tracks:**
- Exit interview completed
- Assets returned (laptop, access cards)
- IT access revoked
- Final settlement calculated and paid

**Status:** `INITIATED` → `IN_PROGRESS` → `COMPLETED`

Employee status is updated to `RESIGNED` or `TERMINATED` on completion.

---

### 17. AI Assistant

**Floating button** — bottom-right corner on every page

A chatbot that understands your live HR data and answers plain-English questions.

**Example queries:**
- *"How many employees do we have in Engineering?"*
- *"Who has the highest performance rating this quarter?"*
- *"List all pending leave requests"*
- *"Who are the candidates currently in the interview stage?"*
- *"What trainings are overdue?"*
- *"Show upcoming interviews this week"*

The AI fetches live data and responds with natural language + structured lists.

---

### 18. Workflow Automation

**Route:** `/workflow`

Run multi-step AI workflows that automate complex HR processes end-to-end.

| Workflow | What it does |
|---|---|
| **Onboarding** | Generates welcome letter, creates checklist, sets orientation schedule |
| **Offboarding** | Creates exit checklist, sends farewell email, processes clearance |
| **Promotion** | Writes promotion letter, updates records, notifies manager |
| **Payroll** | Validates salaries, flags anomalies, processes batch |
| **Custom** | Describe any HR task in plain text — AI executes step by step |

Every run is logged with step statuses, outputs, and timestamps.

---

### 19. Notifications

**Route:** `/inbox` (bell icon in navbar)

Real-time notification system for all HR events.

| Type | Used for |
|---|---|
| `INFO` | General updates |
| `SUCCESS` | Approvals, completions |
| `WARNING` | Upcoming deadlines, expiring offers |
| `ERROR` | Failed syncs, payroll errors |
| `WORKFLOW` | AI workflow step updates |

Unread count shows as a badge on the navbar bell icon.

---

### 20. Google Calendar Integration

**Route:** `/settings` → Google Calendar section

Connects your Google account to auto-create interview events with Meet links.

**Setup steps:**
1. Go to **Settings → Google Calendar**
2. Click **Connect Google Account**
3. Sign in and grant calendar permissions
4. Connection status shows **Connected ✓**

**What happens after connecting:**
- Every scheduled interview → Google Calendar event created instantly
- Google Meet link auto-generated and stored
- Confirmation email sent to candidate with Meet link + calendar invite
- `CALENDAR SYNC` column on Interviews page shows `Synced` (green)

**If sync fails:**
- Click **Retry** on the failed interview row
- If it still fails, reconnect Google in Settings (token may have expired)

---

### 21. Settings

**Route:** `/settings`

Configure the platform to your needs.

- **Company profile** — name, logo, contact details
- **Google Calendar** — connect/disconnect Google account
- **Email provider** — configure from-email for outgoing notifications
- **Account** — update your name, email, password, avatar

---

## Local Development

### Prerequisites
- Node.js 20+
- PostgreSQL database (or Supabase free tier)
- Google Cloud project with Calendar API enabled

### Setup

```bash
# 1. Clone the repository
git clone https://github.com/srivardhan713/ai-hr-employee.git
cd ai-hr-employee

# 2. Install dependencies
npm install

# 3. Copy environment variables
cp .env.example .env.local
# Fill in your values in .env.local

# 4. Push the database schema
npx prisma db push

# 5. Seed the database
$env:DATABASE_URL="your_direct_db_url"
$env:DIRECT_URL="your_direct_db_url"
node prisma/seed-prod.mjs

# 6. Start the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and log in with `srivardhan@aihr.com` / `srivardhan123`.

---

## Environment Variables

Create a `.env.local` file in the project root:

```env
# PostgreSQL Database (Supabase)
DATABASE_URL="postgresql://USER:PASSWORD@HOST:6543/postgres?pgbouncer=true&connection_limit=1"
DIRECT_URL="postgresql://USER:PASSWORD@HOST:5432/postgres"

# AI Provider (Google Gemini)
AI_API_KEY=your_gemini_api_key
AI_PROVIDER=google

# Google Calendar OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REDIRECT_URI=https://your-domain.vercel.app/api/google/callback

# App URL
NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app

# Company Google Account (used for calendar events)
COMPANY_GOOGLE_EMAIL=yourcompany@gmail.com

# Email Provider (Resend)
EMAIL_PROVIDER_API_KEY=your_resend_api_key
EMAIL_FROM=yourcompany@gmail.com
```

---

## Database Seeding

The seed script populates the production database with realistic sample data. It is **idempotent** — running it multiple times will not duplicate data.

```bash
# Windows PowerShell
$env:DATABASE_URL="your_direct_connection_string"
$env:DIRECT_URL="your_direct_connection_string"
node prisma/seed-prod.mjs
```

**What gets seeded:**

| Entity | Count |
|---|---|
| Employees | 10 (+1 admin = 11 total) |
| Job Openings | 5 |
| Candidates | 12 |
| Interviews | 6 |
| Evaluations | 2 |
| Offers | 1 |
| Training Courses | 8 |
| Training Assignments | All employees × mandatory courses |
| Payroll Records | 3 months × all employees |
| Performance Reviews | Q1 for all employees |
| Recognitions | 5 |

---

## Deployment

Deployed on **Vercel** with **Supabase** PostgreSQL.

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy to production
vercel --prod
```

**`vercel.json`:**
```json
{
  "buildCommand": "npx prisma generate && next build"
}
```

> `prisma db push` is excluded from the build command intentionally — the `DIRECT_URL` env var is not available in Vercel's build environment. Run schema migrations separately.

After deploying, seed the production DB once using `node prisma/seed-prod.mjs`.

---

## Project Structure

```
ai-hr-employee/
├── prisma/
│   ├── schema.prisma           # Full DB schema (16 models)
│   ├── seed.ts                 # Base seed (admin user only)
│   └── seed-prod.mjs           # Full production seed script
│
├── src/
│   ├── app/
│   │   ├── (dashboard)/        # All authenticated pages
│   │   │   ├── interviews/     # Interview scheduling
│   │   │   ├── recruitment/    # Jobs + candidates
│   │   │   ├── employees/      # Employee directory + profiles
│   │   │   ├── payroll/        # Payroll processing
│   │   │   ├── leave/          # Leave management
│   │   │   ├── performance/    # Performance reviews
│   │   │   ├── training/       # Training management
│   │   │   ├── onboarding/     # New hire onboarding
│   │   │   ├── promotions/     # Promotion tracking
│   │   │   ├── engagement/     # Surveys + recognition
│   │   │   ├── exit/           # Exit management
│   │   │   ├── workflow/       # AI workflow automation
│   │   │   ├── evaluations/    # Candidate evaluations
│   │   │   ├── offers/         # Job offers
│   │   │   └── settings/       # Platform settings
│   │   │
│   │   └── api/                # API route handlers
│   │       ├── interviews/
│   │       │   ├── route.ts            # GET + POST
│   │       │   └── [id]/
│   │       │       ├── route.ts        # PUT + DELETE
│   │       │       └── sync/route.ts   # Google Calendar sync
│   │       ├── google/
│   │       │   ├── connect/            # OAuth start
│   │       │   ├── callback/           # OAuth callback
│   │       │   └── status/             # Connection status
│   │       └── seed/route.ts           # DB seed endpoint
│   │
│   ├── components/
│   │   ├── ui/                 # Base UI (Button, Modal, Table, Select...)
│   │   ├── layout/             # Sidebar, Header, PageHeader
│   │   ├── dashboard/          # Charts, StatCards, ActivityTimeline
│   │   ├── ai/                 # AI Assistant chatbot
│   │   └── workflow/           # Workflow runner UI
│   │
│   └── lib/
│       ├── google-calendar.ts  # Google Calendar + Meet integration
│       ├── email-service.ts    # Resend email templates
│       ├── ai.ts               # Gemini AI client
│       ├── workflow-engine.ts  # Multi-step workflow executor
│       ├── validators.ts       # Zod validation schemas
│       └── prisma.ts           # Prisma client singleton
│
├── vercel.json                 # Vercel deployment config
└── package.json
```

---

## License

MIT © 2026 Srivardhan | Built with ❤️ using Next.js, Prisma, and Google APIs
