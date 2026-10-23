# GNDEC TNP — Full-Stack Placement Drive Manager
> **Guru Nanak Dev Engineering College, Ludhiana**  
> **Training & Placement (TNP) Technical Team — Recruitment Assignment (Task 1)**

A production-grade, full-stack Placement Drive Management application built with **Next.js (App Router)**, styled exclusively with **Tailwind CSS**, and backed by a **real PostgreSQL database** connected via **Prisma ORM**.

---

## 🌟 Table of Contents
1. [Project Overview](#-project-overview)
2. [Core Technology Stack](#-core-technology-stack)
3. [Folder Structure](#-folder-structure)
4. [Prisma Database Schema](#-prisma-database-schema)
5. [Prerequisites & Environment Configuration](#-prerequisites--environment-configuration)
6. [Getting Started & Installation](#-getting-started--installation)
7. [REST API Documentation & curl Examples](#-rest-api-documentation--curl-examples)
8. [Features Checklist](#-features-checklist)
9. [Verification & Test Results](#-verification--test-results)

---

## 📌 Project Overview
The Training & Placement (TNP) Cell coordinates campus recruitment drives, internships, and company visits for undergraduate and postgraduate engineering students. 

This application provides:
- **Feature 1 (Add Placement Drive):** TNP coordinators can register recruitment drives with company name, job profile, drive date/time, eligible engineering branches (with fast quick-select chips), minimum CGPA cutoffs, and job types.
- **Feature 2 (View All Drives):** Real-time dynamic listing with loading spinners, clean empty-state placeholders, server error alerts, Card / Table view toggling, live search filtering by company or role, branch filtering, job type filtering, and date sorting.
- **Real Database Persistence:** Every drive is validated server-side and persisted in PostgreSQL via Prisma ORM. Data persists across browser refreshes and server restarts.

---

## 💻 Core Technology Stack

| Layer | Technology | Specification / Notes |
|---|---|---|
| **Frontend Framework** | **Next.js 14 (App Router)** | React 18, Server & Client Components |
| **Language** | **TypeScript** | Type-safe models, inputs, and API responses |
| **Styling** | **Tailwind CSS** | Strictly Tailwind CSS (no plain/custom CSS rules) |
| **Icons** | **Lucide React** | Modern, accessible UI icons |
| **Backend API** | **Next.js Route Handlers** | REST endpoints (`/api/drives`) |
| **Database** | **PostgreSQL 16** | Real relational database with UTF-8 encoding |
| **ORM** | **Prisma ORM (v5.22)** | Declarative schema, migrations, and typed queries |
| **Validation** | **Custom Server-Side Validation** | Payload sanitization, date validation, and CGPA 0.0–10.0 bounds |

---

## 📂 Folder Structure

```text
├── app/
│   ├── api/
│   │   └── drives/
│   │       └── route.ts          # REST Route Handlers (GET, POST /api/drives)
│   ├── globals.css               # Tailwind CSS directives & theme base
│   ├── layout.tsx                # App layout, metadata, header, footer
│   └── page.tsx                  # Dashboard with metrics, DriveForm & DriveList
├── components/
│   ├── DriveForm.tsx             # Feature 1: Drive creation form with validation & chips
│   ├── DriveList.tsx             # Feature 2: Cards/Table view, filters, search & states
│   └── Header.tsx                # GNDEC TNP header branding & status badges
├── lib/
│   ├── prisma.ts                 # Prisma Client singleton
│   ├── utils.ts                  # Date formatting, Tailwind cn class merger
│   └── validations.ts           # Server-side validation logic & bounds checking
├── prisma/
│   ├── migrations/               # Prisma migration history
│   │   └── 20261023033603_init/
│   │       └── migration.sql    # Generated PostgreSQL table schema
│   └── schema.prisma             # PlacementDrive model definition
├── scripts/
│   ├── start-db.ps1              # Starts local portable PostgreSQL instance
│   └── stop-db.ps1               # Stops local PostgreSQL instance
├── .env.example                  # Environment configuration template
├── .gitignore                    # Git ignore file protecting credentials & node_modules
├── next.config.mjs               # Next.js configuration
├── package.json                  # Dependencies and scripts
├── postcss.config.js             # PostCSS Tailwind plugin configuration
├── tailwind.config.ts            # Tailwind CSS design system configuration
└── tsconfig.json                 # TypeScript compiler configuration
```

---

## 🗄️ Prisma Database Schema

Defined in `prisma/schema.prisma` exactly according to the assignment specification:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model PlacementDrive {
  id             String   @id @default(cuid())
  companyName    String
  role           String
  driveDate      DateTime
  eligibleBranch String
  minCGPA        Float?
  jobType        String?
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt
}
```

---

## ⚙️ Prerequisites & Environment Configuration

### Prerequisites
- **Node.js**: v18.17.0 or later (v20+ / v24+ recommended)
- **npm**: v9+ or later
- **PostgreSQL**: Local PostgreSQL instance, hosted PostgreSQL (Neon, Supabase, Render), or the portable instance included in the workspace.

### Environment Setup (`.env`)
Create a `.env` file in the project root based on `.env.example`:

```bash
# Copy example environment configuration
cp .env.example .env
```

Set your PostgreSQL connection string and administrator deletion password in `.env`:
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/tnp_drives?schema=public"
PORT=3000
ADMIN_DELETE_PASSWORD="replace-with-a-strong-admin-password"
```

> [!IMPORTANT]
> **Admin Password Configuration:**  
> The administrator **must** set their own strong password in the local `.env` file and in the hosting provider's server-side environment variables (e.g. Vercel, Render, Railway, AWS) under `ADMIN_DELETE_PASSWORD` before using the drive deletion feature.
> 
> **Security Notice:**  
> Never commit the real `.env` file or your actual administrator password to GitHub or any public version control. The `.gitignore` file is pre-configured to protect `.env` and `.env.local`.

---

## 🚀 Getting Started & Installation

### 1. Clone the repository
```bash
git clone <repository-url>
cd "tnp project"
```

### 2. Install dependencies
```bash
npm install
```

### 3. Start or configure PostgreSQL database
- **Option A (If using local/hosted PostgreSQL server):**
  Ensure PostgreSQL is running and create the database:
  ```sql
  CREATE DATABASE tnp_drives;
  ```
- **Option B (Using workspace portable PostgreSQL scripts):**
  ```powershell
  npm run db:start
  ```

### 4. Execute Prisma migrations
Run the Prisma migration to sync the schema with PostgreSQL and generate the typed client:
```bash
npx prisma migrate dev
```

### 5. Launch the Next.js development server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) (or `http://localhost:3001` if port 3000 is occupied) in your web browser.

---

## 📡 REST API Documentation & curl Examples

The backend implements two REST endpoints under `/api/drives`.

### 1. GET `/api/drives`
Retrieves all registered placement drives ordered by drive date.

- **URL:** `/api/drives`
- **Method:** `GET`
- **Query Parameters:** `order=asc` (default) or `order=desc`
- **Expected Status Codes:**
  - `200 OK`: Returns an array of drive objects.
  - `500 Server Error`: Returned if database connection fails.

#### Sample Request:
```bash
curl -X GET http://localhost:3000/api/drives -H "Accept: application/json"
```

#### Sample 200 OK Response:
```json
[
  {
    "id": "cmvkf98rc00009vsax32ilap8",
    "companyName": "Microsoft",
    "role": "Software Development Engineer",
    "driveDate": "2026-11-15T09:30:00.000Z",
    "eligibleBranch": "CSE, IT",
    "minCGPA": 8.0,
    "jobType": "Full-Time",
    "createdAt": "2026-10-23T03:40:11.544Z",
    "updatedAt": "2026-10-23T03:40:11.544Z"
  },
  {
    "id": "cmvkf98tx00019vsajdfc1yms",
    "companyName": "Infosys",
    "role": "Specialist Programmer",
    "driveDate": "2026-11-20T10:00:00.000Z",
    "eligibleBranch": "CSE, IT, ECE",
    "minCGPA": 7.0,
    "jobType": "Full-Time",
    "createdAt": "2026-10-23T03:40:11.637Z",
    "updatedAt": "2026-10-23T03:40:11.637Z"
  }
]
```

---

### 2. POST `/api/drives`
Validates request payload and creates a new placement drive record in PostgreSQL.

- **URL:** `/api/drives`
- **Method:** `POST`
- **Headers:** `Content-Type: application/json`
- **Payload Schema:**
  - `companyName` *(string, required)*: Name of visiting company.
  - `role` *(string, required)*: Job role or profile.
  - `driveDate` *(ISO 8601 string, required)*: Date and time of drive.
  - `eligibleBranch` *(string, required)*: Eligible engineering branches (e.g. `CSE, IT`).
  - `minCGPA` *(float, optional)*: Minimum cutoff score (bounds: `0.0` to `10.0`).
  - `jobType` *(string, optional)*: `Full-Time`, `Internship`, or `Other`.
- **Expected Status Codes:**
  - `201 Created`: Entry created successfully.
  - `400 Bad Request`: Payload validation error (missing required fields, invalid date, or CGPA out of bounds).
  - `500 Server Error`: Server or database failure.

#### Sample Request (Valid Payload):
```bash
curl -X POST http://localhost:3000/api/drives \
  -H "Content-Type: application/json" \
  -d '{
    "companyName": "Google",
    "role": "Software Engineer",
    "driveDate": "2026-12-01T10:00:00.000Z",
    "eligibleBranch": "CSE, IT, ECE",
    "minCGPA": 8.5,
    "jobType": "Full-Time"
  }'
```

#### Sample 201 Created Response:
```json
{
  "id": "cmvkfgh7800003b6w5q0x9abc",
  "companyName": "Google",
  "role": "Software Engineer",
  "driveDate": "2026-12-01T10:00:00.000Z",
  "eligibleBranch": "CSE, IT, ECE",
  "minCGPA": 8.5,
  "jobType": "Full-Time",
  "createdAt": "2026-10-23T03:45:00.000Z",
  "updatedAt": "2026-10-23T03:45:00.000Z"
}
```

#### Sample Request (Invalid Payload — Testing 400 Bad Request):
```bash
curl -X POST http://localhost:3000/api/drives \
  -H "Content-Type: application/json" \
  -d '{
    "role": "Software Engineer",
    "driveDate": "invalid-date",
    "eligibleBranch": "CSE",
    "minCGPA": 15.5
  }'
```

#### Sample 400 Bad Request Response:
```json
{
  "error": "Bad Request",
  "message": "Validation failed for placement drive payload",
  "errors": {
    "companyName": "Company Name is required and cannot be empty.",
    "driveDate": "Drive Date must be a valid ISO Date/Time format.",
    "minCGPA": "Min CGPA must be between 0.0 and 10.0."
  }
}
```

---

### 3. GET `/api/drives/[id]`
Retrieves full details for a single placement drive by its database cuid ID.

- **URL:** `/api/drives/:id`
- **Method:** `GET`
- **Expected Status Codes:**
  - `200 OK`: Returns the drive JSON object.
  - `404 Not Found`: Returned if no drive exists with the given ID.
  - `500 Server Error`: Returned if database connection fails.

#### Sample Request:
```bash
curl -X GET http://localhost:3000/api/drives/cmvkf98rc00009vsax32ilap8 -H "Accept: application/json"
```

#### Sample 200 OK Response:
```json
{
  "id": "cmvkf98rc00009vsax32ilap8",
  "companyName": "Microsoft",
  "role": "Software Development Engineer",
  "driveDate": "2026-11-15T09:30:00.000Z",
  "eligibleBranch": "CSE, IT",
  "minCGPA": 8.0,
  "jobType": "Full-Time",
  "createdAt": "2026-10-23T03:40:11.544Z",
  "updatedAt": "2026-10-23T03:40:11.544Z"
}
```

#### Sample 404 Not Found Response:
```json
{
  "error": "Not Found",
  "message": "Placement drive with ID 'invalid-id' was not found."
}
```

---

### 4. DELETE `/api/drives/[id]` (Password-Protected Deletion)
Securely deletes a placement drive by ID after server-side verification of `ADMIN_DELETE_PASSWORD`.

- **URL:** `/api/drives/:id`
- **Method:** `DELETE`
- **Headers:**
  - `Content-Type: application/json`
  - *(Optional)* `x-admin-password: <password>`
- **Body Schema (JSON):**
  - `password` *(string, required)*: The administrator password configured in `ADMIN_DELETE_PASSWORD`.
- **Expected Status Codes:**
  - `200 OK`: Drive successfully verified and deleted from PostgreSQL.
  - `401 Unauthorized`: Password missing or incorrect (`"Incorrect administrator password."`).
  - `404 Not Found`: Drive with specified ID does not exist in the database.
  - `500 Server Error`: Server configuration error (missing `ADMIN_DELETE_PASSWORD` on server) or database failure.

#### Sample Request (Valid Password):
```bash
curl -X DELETE http://localhost:3000/api/drives/cmvkf98rc00009vsax32ilap8 \
  -H "Content-Type: application/json" \
  -d '{"password": "your-admin-password"}'
```

#### Sample 200 OK Response:
```json
{
  "success": true,
  "message": "Placement drive deleted successfully.",
  "deletedDriveId": "cmvkf98rc00009vsax32ilap8"
}
```

#### Sample 401 Unauthorized Response (Incorrect / Missing Password):
```json
{
  "error": "Unauthorized",
  "message": "Incorrect administrator password."
}
```

---

## ✅ Features Checklist

### Functional Requirements
- [x] **Company Name**: Required text input with real-time feedback
- [x] **Job Role**: Required text input
- [x] **Drive Date**: Required ISO Date/Time with `datetime-local` input
- [x] **Eligible Branches**: Required string with branch quick-select buttons (+ CSE, + IT, + ECE, + ME, + CE, + EE)
- [x] **Min CGPA**: Optional float with bounds checking (`0.0` - `10.0`) and quick cutoff buttons
- [x] **Job Type**: Optional selection (`Full-Time`, `Internship`, `Other`)
- [x] **POST Submission**: Submits via REST API, displays success/error banner, and clears form fields
- [x] **GET Fetching**: Fetches drives on page load via `GET /api/drives`
- [x] **Layout**: Responsive layout with Card View and Table View toggle
- [x] **Clickable Drive Cards**: Every placement card is fully clickable to navigate to `/drives/[id]`
- [x] **Placement Drive Details Page**: Dedicated route `/drives/[id]` with official GNDEC T&P styling, eligibility breakdown, and "Back to All Drives" button
- [x] **UI States**: Loading spinners, empty-state placeholder, not-found (404), and server error alert banner
- [x] **Data Persistence**: Records verified in PostgreSQL database across restarts and refreshes
- [x] **Password-Protected Drive Deletion**: Delete button on cards and details page with 2-step confirmation & password dialog, verified server-side with `ADMIN_DELETE_PASSWORD`

### Bonus Features Implemented
- [x] **Live Search**: Filter drives by company name or role in real time
- [x] **Branch Filter**: Filter list by specific engineering branch
- [x] **Job Type Filter**: Filter by Full-Time, Internship, or Other
- [x] **Drive Sorting**: Toggle between earliest first and latest first
- [x] **View Mode Switcher**: Toggle between Card Grid and Compact Data Table
- [x] **Executive Summary Bar**: Real-time summary tiles (Total Drives, Upcoming Drives, Companies Visiting, Average CGPA Cutoff)
- [x] **Print / Share Notice**: Instant print and link copy utilities on the details page

---

## 🧪 Verification & Test Results

| Test Case | Description | Expected Result | Actual Result | Status |
|---|---|---|---|---|
| **TC-01** | Production Build (`npm run build`) | Zero type errors, valid routes generated | Static & dynamic routes compiled | **PASS** |
| **TC-02** | Initial GET `/api/drives` | Status 200 OK, JSON array | Returned `[]` with status 200 | **PASS** |
| **TC-03** | POST `/api/drives` Invalid Input | Status 400 Bad Request with field errors | Status 400 returned with exact field error map | **PASS** |
| **TC-04** | POST `/api/drives` Valid Input | Status 201 Created with cuid and timestamps | Status 201 returned with persistent cuid | **PASS** |
| **TC-05** | GET `/api/drives` After Insert | Status 200 OK with created drives ordered by date | Status 200 returned all 3 drives in order | **PASS** |
| **TC-06** | Real PostgreSQL Persistence | Direct query against PostgreSQL database table | Verified rows in `PlacementDrive` table | **PASS** |
| **TC-07** | HTML Server-Side Rendering | Next.js server returns valid semantic HTML | Header, forms, Lucide icons rendered | **PASS** |
| **TC-08** | Browser Subagent Run | Playwright GUI testing | Automated browser download failed (404 on Azure CDN) | **BLOCKED (Automated Browser Driver)** |

---

## 📜 Submission Deliverables Summary
1. **Source Code**: Clean, modular Next.js App Router codebase in `app/`, `components/`, and `lib/`.
2. **README.md**: Comprehensive execution instructions, architecture, and testing results.
3. **API Documentation**: Detailed sample requests, responses, and status descriptions.
4. **Environment Configuration**: Safe `.env.example` file included with database placeholders.
5. **Database Migration**: `prisma/migrations/20261023033603_init/migration.sql` included.
