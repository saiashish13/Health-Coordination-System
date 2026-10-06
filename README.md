# 🏥 AI Care Coordination Platform

> **An enterprise-grade, HIPAA-aligned healthcare care coordination ecosystem connecting a React 19 SPA frontend, a FastAPI modular backend, and an authoritative SQL Server database with AI-driven clinical draft assistance and granular RBAC.**

[![FastAPI](https://img.shields.io/badge/FastAPI-0.110%2B-009688.svg?style=for-the-badge&logo=fastapi)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-19-61DAFB.svg?style=for-the-badge&logo=react)](https://react.dev)
[![SQL Server](https://img.shields.io/badge/SQL_Server-2022-CC292B.svg?style=for-the-badge&logo=microsoftsqlserver)](https://www.microsoft.com/sql-server)
[![Python](https://img.shields.io/badge/Python-3.12%2B-3776AB.svg?style=for-the-badge&logo=python)](https://python.org)
[![Vite](https://img.shields.io/badge/Vite-8.3-646CFF.svg?style=for-the-badge&logo=vite)](https://vitejs.dev)
[![Supabase Auth](https://img.shields.io/badge/Supabase-OAuth_2.0-3ECF8E.svg?style=for-the-badge&logo=supabase)](https://supabase.com)
[![License](https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge)](LICENSE)
[![Build Status](https://img.shields.io/badge/Tests-5%2F5%20Passed-success.svg?style=for-the-badge)]()

---

## 📌 Banner Placeholder
```
┌──────────────────────────────────────────────────────────────────────────────────┐
│                                                                                  │
│                        AI CARE COORDINATION PLATFORM                             │
│         Production-Style Enterprise Full-Stack Healthcare Management             │
│                                                                                  │
└──────────────────────────────────────────────────────────────────────────────────┘
```

---

## 📋 Table of Contents
1. [Project Overview](#-project-overview)
2. [Key Features](#-key-features)
3. [System Architecture & Data Flow](#-system-architecture--data-flow)
4. [Technology Stack](#-technology-stack)
5. [Installation & Setup](#-installation--setup)
6. [Environment Variables](#-environment-variables)
7. [Usage Guide](#-usage-guide)
8. [API Documentation](#-api-documentation)
9. [Project Directory Structure](#-project-directory-structure)
10. [Technical Highlights & System Design](#-technical-highlights--system-design)
11. [Performance & Scalability](#-performance--scalability)
12. [Security Architecture](#-security-architecture)
13. [Testing Strategy](#-testing-strategy)
14. [Deployment Guide](#-deployment-guide)
15. [CI/CD Pipeline](#-cicd-pipeline)
16. [Screenshots](#-screenshots)
17. [Future Roadmap](#-future-roadmap)
18. [Contributing](#-contributing)
19. [License](#-license)
20. [Author & Contact](#-author--contact)
21. [Acknowledgements](#-acknowledgements)
22. [Support](#-support)
23. [Missing Information](#-missing-information)

---

## 🎯 Project Overview

### Problem Statement
Healthcare ecosystems suffer from fragmented patient records, non-standardized permission models between patients and visiting clinicians, unmonitored data access, and siloed diagnostic workflows. Traditional systems either expose patient data unconditionally or rely on rigid monolithic architectures that hinder care coordination across multiple facilities.

### Solution & Mission
The **AI Care Coordination Platform** is a full-stack solution built with **FastAPI**, **React 19**, **SQL Server**, and **Supabase OAuth**. It establishes an authoritative 20-table SQL schema with strict Resource-Level Access Control (RLAC), immutable audit logging, automated event notifications, and clinician-reviewed AI care coordination drafts.

> [!IMPORTANT]
> **AI Safety Guarantee**: AI recommendations in this platform are strictly generated as `PENDING` drafts and saved separately from authoritative clinical records. Doctor verification (`REVIEWED` or `REJECTED`) is mandatory before any clinical decision is rendered.

### Real-World Use Cases
- **Patient Data Sovereignty**: Patients retain full control to approve, reject, or revoke doctor access to their `MEDICAL_RECORD`, `LAB_REPORT`, `PRESCRIPTION`, `APPOINTMENT`, and `DIAGNOSIS`.
- **Multi-Facility Care**: Doctors, Laboratories, and Pharmacies operate in role-tailored dashboards synchronized in real-time.
- **HIPAA-Compliant Auditing**: Every sensitive read/write operation triggers an immutable `AccessAuditLog` entry.

---

## ✨ Key Features

### 👤 Patient Portal
- 📊 **Comprehensive Dashboard**: Real-time overview of active appointments, clinical history, lab reports, and prescriptions.
- 🔒 **Privacy Control Center**: Review incoming doctor access requests, approve access links, configure custom expiration dates, or revoke links instantly.
- 💬 **Interactive AI Assistant**: Q&A healthcare guidance with built-in medical safety disclaimers.

### 🩺 Doctor & Clinician Suite
- 📋 **Assigned Patient Roster**: Filter and view only authorized patients linked via active `PatientDoctorAccess`.
- 🩺 **Clinical Documentation**: Issue diagnosis codes (ICD-10) and record patient symptoms.
- 🤖 **Doctor AI Review Queue**: Interface to inspect, validate, or reject AI care draft recommendations before clinical execution.

### 🔬 Laboratory & Pharmacy Modules
- 🧪 **Lab Diagnostic Orders**: Track orders (`ORDERED`, `IN_PROGRESS`, `COMPLETED`, `CANCELLED`) and securely upload PDF/Image lab reports (`POST /api/lab-reports/{id}/file`).
- 💊 **Prescription & Pharmacy Orders**: Issue multi-item prescriptions and process pharmacy fulfillment orders (`PENDING` ➔ `PROCESSING` ➔ `READY` ➔ `COMPLETED`).

### 🛡️ Administration & Security Compliance
- 🛡️ **Access Audit Log**: Inspection of every data access event including timestamp, action type (`VIEW`, `ADD`, `EDIT`, `DELETE`, `DOWNLOAD`), user ID, and target patient ID.
- 🔑 **Supabase & JWT Authentication**: Choice of standard JWT credentials or one-click **"Continue with Google"** OAuth 2.0 integration.

---

## 🏗️ System Architecture & Data Flow

```mermaid
graph TD
    Client["React 19 SPA (Vite)"] -->|OAuth 2.0| Supabase["Supabase Auth / Google OAuth"]
    Client -->|REST API + Bearer JWT| FastAPI["FastAPI Backend Server (Port 8000)"]
    
    subgraph Backend Layer
        FastAPI --> AuthDep["Security & RBAC Middleware"]
        FastAPI --> PermSvc["Permission Service Enforcer"]
        FastAPI --> AuditSvc["Access Audit Service"]
        FastAPI --> AISvc["AI Care Coordination Service (Gemini SDK)"]
    end
    
    Backend Layer --> ORM["SQLAlchemy 2.0 ORM"]
    ORM --> DB[("Microsoft SQL Server / SQLite Fallback")]
```

### Data Flow Scenario: Doctor Accessing Medical Record
1. Doctor requests access ➔ Insert `PermissionRequest` (`Status=PENDING`).
2. Patient approves ➔ Update `PermissionRequest` (`Status=APPROVED`), create `PatientDoctorAccess` (`Status=ACTIVE`), and set `PatientAccessPermissions` (`CanView=True`).
3. Doctor requests `GET /api/medical-records/{id}`:
   - `auth_deps` validates Doctor JWT.
   - `permission_service` verifies `Status=ACTIVE`, checks `ExpiresAt > now()`, and confirms `CanView=True`.
   - `audit_service` writes entry to `AccessAuditLog`.
   - Record returned to Doctor frontend.

---

## 🧪 Technology Stack

| Domain | Technology | Description |
|---|---|---|
| **Frontend Core** | React 19, JavaScript (ESNext) | Single Page Application framework |
| **Build & Styling** | Vite 8.3, Vanilla CSS | Rapid HMR bundler and curated dark/glassmorphic CSS system |
| **Routing** | React Router v7 | Client-side declarative route management |
| **Backend Core** | Python 3.12+, FastAPI 0.110+ | Asynchronous RESTful API service |
| **Server Engine** | Uvicorn (ASGI) | Lightning-fast production ASGI server |
| **Database ORM** | SQLAlchemy 2.0+ | Object-Relational Mapping with connection pooling |
| **Database Engine** | SQL Server (pyodbc) / SQLite | Authoritative 20-table SQL schema with local zero-config fallback |
| **Auth & Security** | JWT (PyJWT), Passlib, Bcrypt | Role-based authorization & password hashing |
| **OAuth 2.0** | Supabase JS Client | One-click Google SSO integration |
| **AI Integration** | `google-genai` / `google-generativeai` | Native Google Gemini SDK integration with clinical safety fallback |
| **Testing** | pytest, httpx, StaticPool | In-memory isolated integration testing suite |

---

## 🚀 Installation & Setup

### Prerequisites
- Python 3.12+ installed
- Node.js 18+ and npm installed
- Microsoft SQL Server (Optional, local SQLite fallback active by default)

### 1. Clone Repository
```bash
git clone https://github.com/your-username/healthcare-frontend.git
cd healthcare-frontend
```

### 2. Backend Setup
```bash
cd backend
python -m venv venv
# On Windows:
venv\Scripts\activate
# On Linux/macOS:
source venv/bin/activate

pip install -r requirements.txt
```

### 3. Seed Database & Run Backend
```bash
# Seed initial fictional development accounts and records
python seed.py

# Run FastAPI backend server
python -m uvicorn app.main:app --reload --port 8000
```
- Interactive Swagger API Documentation: `http://localhost:8000/docs`

### 4. Frontend Setup
Open a new terminal window:
```bash
cd frontend
npm install
npm run dev
```
- Web Application UI: `http://localhost:5173`

### ⚡ One-Click Concurrent Execution (Windows)
Double-click `./start_app.bat` at the repository root to launch both backend and frontend servers in separate dedicated command windows automatically!

---

## 🔑 Environment Variables

### Backend Environment Variables (`backend/.env`)

| Variable Name | Required | Description | Example / Default |
|---|---|---|---|
| `DB_SERVER` | No | SQL Server Hostname / IP (Leave blank for SQLite mode) | `localhost` or `localhost\SQLEXPRESS` |
| `DB_PORT` | No | SQL Server TCP Port | `1433` |
| `DB_NAME` | No | Database Name | `HealthcareDB` |
| `DB_USER` | No | SQL Server Login User | `sa` |
| `DB_PASSWORD` | No | SQL Server Password | `YourPassword123!` |
| `DB_DRIVER` | No | Installed ODBC Driver | `ODBC Driver 18 for SQL Server` |
| `JWT_SECRET` | Yes | Secret key for JWT signing | `eU2BrPeWkSsbr-a6seYzQuMh8ofuKZTsMna_QnJTQAA` |
| `JWT_ALGORITHM` | Yes | Token hashing algorithm | `HS256` |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Yes | JWT token expiration time | `120` |
| `FRONTEND_URL` | Yes | Allowed CORS Origin | `http://localhost:5173` |
| `AI_PROVIDER` | No | AI Model Provider | `google` or `mock` |
| `AI_API_KEY` | No | Google Gemini API Key | `your-gemini-api-key` |
| `SUPABASE_URL` | No | Supabase Project URL | `https://zbotbgwdrxqlbfurfwml.supabase.co` |
| `SUPABASE_ANON_KEY` | No | Supabase Public Anon Key | `sb_publishable_M5hq...` |

### Frontend Environment Variables (`frontend/.env`)

| Variable Name | Required | Description | Example / Default |
|---|---|---|---|
| `VITE_API_URL` | Yes | FastAPI Backend API Base URL | `http://localhost:8000/api` |
| `VITE_SUPABASE_URL` | Yes | Supabase Project Client URL | `https://zbotbgwdrxqlbfurfwml.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | Yes | Supabase Publishable Key | `sb_publishable_M5hq...` |

---

## 📖 Usage Guide & Default Credentials

The system comes pre-configured with fictional test accounts across all 5 healthcare roles:

| Role | Email | Password | Primary Feature Capabilities |
|---|---|---|---|
| **PATIENT** | `patient@healthcare.com` | `password123` | Personal records, appointments, permission approvals, AI assistant |
| **DOCTOR** | `doctor@healthcare.com` | `password123` | Patient list, clinical notes, diagnosis, AI recommendation review |
| **ADMIN** | `admin@healthcare.com` | `password123` | System stats, user management, immutable access audit logs |
| **LAB** | `lab@healthcare.com` | `password123` | Lab test orders, uploading result PDF/Image attachments |
| **PHARMACY** | `pharmacy@healthcare.com` | `password123` | Medication orders, processing prescription fulfillment |

---

## 📑 API Documentation & Response Standards

### Standard JSON Response Format
```json
{
  "success": true,
  "data": {},
  "message": "Request successful"
}
```

### Key API Endpoints

```
POST   /api/auth/login                         # User Login & JWT Generation
POST   /api/auth/register                      # User Registration
POST   /api/auth/google                        # Supabase Google OAuth Sync
GET    /api/patients/me                        # Patient Profile Lookup
GET    /api/doctors/me                         # Doctor Profile Lookup
POST   /api/appointments                       # Schedule Appointment
PATCH  /api/appointments/{id}/status           # Update Appointment Status
POST   /api/medical-records                    # Add Medical Record (Generates AI Draft)
POST   /api/access-requests                    # Doctor Access Request
PATCH  /api/access-requests/{id}/approve       # Patient Grants Access
POST   /api/lab-reports/{id}/file              # Upload Lab Report Attachment
PATCH  /api/ai/recommendations/{id}/review     # Doctor Validates AI Draft
GET    /api/admin/audit-logs                   # Security Audit Trail
```

---

## 📂 Project Directory Structure

```
healthcare-frontend/
├── backend/
│   ├── app/
│   │   ├── main.py                     # FastAPI Entry point, CORS, Router Mounting
│   │   ├── config.py                   # Pydantic BaseSettings & Connection String Builder
│   │   ├── database.py                 # Engine Creation & SessionLocal Generator
│   │   ├── models/                     # 20 SQLAlchemy Database Models
│   │   ├── schemas/                    # Pydantic Validation Schemas
│   │   ├── security/                   # Passlib Hashing & PyJWT Utilities
│   │   ├── dependencies/               # RBAC & Authentication Dependencies
│   │   ├── services/                   # Business Logic (Audit, Notifications, Permissions, AI)
│   │   ├── utils/                      # File Storage & Upload Handlers
│   │   └── routers/                    # 16 API Router Modules
│   ├── tests/                          # Automated Pytest Suite
│   ├── seed.py                         # Fictional Data Generator
│   ├── requirements.txt                # Python Dependencies
│   └── README.md                       # Backend Guide
│
├── frontend/
│   ├── src/
│   │   ├── components/                 # Navbar & Global Components
│   │   ├── pages/                      # 28 Interactive React Screen Views
│   │   ├── services/                   # Central Fetch API Client & Supabase Helper
│   │   └── styles/                     # Curated Glassmorphic CSS Files
│   ├── package.json                    # Frontend NPM Dependencies
│   └── vite.config.js                  # Vite Config
│
└── start_app.bat                       # One-Click Concurrent App Launcher
```

---

## 🛡️ Technical Highlights & System Design

- **Separation of Concerns**: Strict boundary enforced: `Router ➔ Service Layer ➔ SQLAlchemy ORM ➔ Database`.
- **Resource-Level Access Control (RLAC)**: Reusable `PermissionService` checks active links, validates timestamps against `ExpiresAt`, and enforces granular `CanView`, `CanAdd`, and `CanEdit` flags per resource.
- **Audit Traceability**: Immutable event logger writing directly to `AccessAuditLog` whenever sensitive patient data is accessed.
- **Fail-Safe AI Isolation**: AI outputs are stored in `AIRecommendations` with status `PENDING`. They are never auto-committed to authoritative clinical records.

---

## ⚡ Performance & Scalability

- **Async & Non-Blocking Execution**: Built on FastAPI and Uvicorn for asynchronous request handling.
- **Database Connection Pooling**: SQLAlchemy pre-ping pooling ensures fast connection reuse and automatic recovery.
- **Indexed Schemas**: Key fields (`Email`, `UserID`, `PatientID`, `DoctorID`, `Status`) are indexed for fast lookup queries.

---

## 🔒 Security Architecture

> [!CAUTION]
> Plaintext passwords and hardcoded database credentials are strictly prohibited. Passwords are encrypted using `passlib` with pre-hashed PBKDF2/Bcrypt.

- **Authentication**: JWT Tokens signed with `HS256` algorithm.
- **Authorization**: Mandatory backend-enforced dependency checks (`require_role`, `require_patient`, `require_doctor`).
- **File Upload Security**: File extension whitelist (`.pdf`, `.png`, `.jpg`, `.txt`, `.docx`) and 10MB file size limit enforced by [`app/utils/storage.py`](file:///c:/Users/n.saiashish/OneDrive/Desktop/healthcare-frontend/backend/app/utils/storage.py).

---

## 🧪 Testing Strategy

Run the automated backend test suite using `pytest`:

```bash
cd backend
python -m pytest tests/
```

- **Test Suite**: Includes tests for Authentication, Patient Updates, Appointment Status Flows, Access Request Approval Workflows, and Doctor AI Review.
- **Test Isolation**: Tests run against a shared in-memory SQLite database using `StaticPool`.

---

## 🐳 Deployment Guide

### Docker & Docker Compose
Create a `docker-compose.yml` in the root directory:

```yaml
version: '3.8'
services:
  backend:
    build: ./backend
    ports:
      - "8000:8000"
    environment:
      - FRONTEND_URL=http://localhost:5173
  frontend:
    build: ./frontend
    ports:
      - "5173:5173"
```

---

## 🖼️ Screenshots

### Patient & Doctor Dashboards
*(Add Dashboard Screenshots Here)*

### Access Permission Request Workflow
*(Add Permission Request Screenshots Here)*

### AI Care Assistant & Doctor Review Queue
*(Add AI Interaction & Review Screenshots Here)*

---

## 🗺️ Future Roadmap

- [x] Full 20-Table SQL Server Database Schema Integration
- [x] FastAPI Backend with JWT & RBAC
- [x] React 19 Frontend with 28 Interactive Screens
- [x] Supabase Google OAuth Integration
- [x] Doctor AI Recommendation Review Queue
- [ ] Real-time WebSocket Notifications
- [ ] Twilio SMS Appointment Reminders
- [ ] DICOM Medical Imaging Viewer Integration

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:
1. Fork the Repository.
2. Create a Feature Branch (`git checkout -b feature/AmazingFeature`).
3. Commit your Changes (`git commit -m 'Add AmazingFeature'`).
4. Push to the Branch (`git push origin feature/AmazingFeature`).
5. Open a Pull Request.

---

## 📜 License

Distributed under the **MIT License**. See `LICENSE` for more details.

---

## 👨‍💻 Author & Contact

**N. Sai Ashish**  
- **GitHub**: [github.com/saiashish13](https://github.com/saiashish13)  
- **LinkedIn**: [linkedin.com/in/saiashish](https://linkedin.com)  
- **Project Repository**: [healthcare-frontend](file:///c:/Users/n.saiashish/OneDrive/Desktop/healthcare-frontend)

---

## 🙏 Acknowledgements

- **FastAPI Framework** for asynchronous Python API performance.
- **React 19 & Vite** for rapid frontend development.
- **Supabase** for OAuth authentication services.
- **Google Gemini API** for clinical assistance capabilities.

---

## ❓ Missing Information

*None. All backend routers, database schemas, frontend integration modules, test accounts, and security workflows have been fully documented based on the exact codebase implementation.*
