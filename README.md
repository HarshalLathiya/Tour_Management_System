# 🌍 TourSync — Global Tour Management System

> A production-ready full-stack platform for managing educational tours, field trips, and organized group travel.

---

## 📌 Project Overview

**TourSync** is a comprehensive tour management system designed for educational institutions and organizations. It centralizes planning, attendance tracking, safety monitoring, budget management, communication, and documentation into a single scalable platform.

This system solves real-world tour coordination challenges such as:

* Fragmented communication
* Manual attendance tracking
* Emergency response delays
* Budget mismanagement
* Poor documentation control

---

## 🎯 Core Features

### 1️⃣ Tour Management

* Create, update, and manage tours
* Assign leaders (guides)
* Track participant count
* Manage tour lifecycle:

  * Planned
  * Ongoing
  * Completed
  * Cancelled

---

### 2️⃣ Attendance System

* Check-in/check-out tracking
* Location verification (lat/lng)
* Status tracking:

  * Present
  * Absent
  * Late
* Leader verification system
* 24-hour immutability protection

---

### 3️⃣ Safety & Emergency Module

* One-click SOS alerts
* Health incident reporting
* Severity levels:

  * LOW
  * MEDIUM
  * HIGH
  * CRITICAL
* Response tracking & resolution logs

---

### 4️⃣ Budget Management

* Define total tour budget
* Track expenses by category:

  * Transport
  * Accommodation
  * Food
  * Miscellaneous
* Per-participant fee calculation

---

### 5️⃣ Itinerary & Route Management

* Day-wise itinerary planning
* Checkpoints with sequence order
* Route distance & duration tracking
* Status updates (Scheduled → Completed)

---

### 6️⃣ Location Hierarchy

Structured geographic organization:

```
State → City → Place
```

Place Categories:

* Historical
* Natural
* Cultural
* Religious
* Entertainment
* Other

---

### 7️⃣ Announcements & Communication

* Tour-specific announcements
* Rich text content
* Timestamped creation

---

### 8️⃣ Accommodation Management

* Hotel bookings
* Room assignments
* Check-in/check-out tracking
* Contact information storage

---

### 9️⃣ Photo Gallery

* Upload tour photos
* User attribution
* Caption support
* Organized per tour

---

### 🔟 Audit Logging

Tracks critical system actions:

* CREATE
* UPDATE
* DELETE
* ASSIGN
* UNASSIGN

Logs include:

* User ID
* Entity type
* Old vs new values
* IP address
* User agent

---

## 👥 User Roles

| Role        | Description                | Access Level              |
| ----------- | -------------------------- | ------------------------- |
| **Admin**   | Organization Administrator | Full access               |
| **Guide**   | Tour Leader / Coordinator  | Tour control & attendance |
| **Tourist** | Participant                | View & check-in access    |

---

## 🏗 System Architecture

### Architecture Pattern

* MVC (Model-View-Controller)
* RESTful API
* Repository pattern
* Middleware-based security
* Role-Based Access Control (RBAC)

### Request Flow

```
Request
   ↓
Rate Limiter
   ↓
Authentication Middleware
   ↓
Authorization Middleware
   ↓
Validation
   ↓
Controller
   ↓
Database
   ↓
Response
```

---

## 🛠 Technology Stack

### Frontend

* Next.js 14 (App Router)
* TypeScript
* Tailwind CSS
* Framer Motion
* Radix UI
* Lucide React
* Sonner (Toast Notifications)

### Backend

* Node.js
* Express.js
* TypeScript
* PostgreSQL 17
* JWT Authentication
* bcryptjs
* Zod Validation
* express-rate-limit

### Development Tools

* Docker
* Vitest
* ESLint
* Prettier
* Husky
* lint-staged

---

## 🗄 Database Overview

The system contains **16+ relational tables**, including:

* users
* tours
* tour_users
* attendance
* incidents
* states
* cities
* places
* routes
* checkpoints
* itineraries
* budgets
* expenses
* announcements
* safety_protocols
* audit_logs
* accommodations
* photos
* notifications

### Key Design Principles

* Fully normalized schema
* Indexed frequently queried fields
* Foreign key integrity
* Controlled immutability for attendance

---

## 🔐 Authentication & Security

### JWT-Based Authentication

* Access Token (24 hours)
* Refresh Token system

### Security Measures

* Password hashing (bcrypt)
* API rate limiting
* Input validation with Zod
* Role-based access enforcement
* Middleware route protection

---

## 📂 Project Structure

```
Tour_Management_System/
│
├── server/               # Express backend
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   ├── services/
│   ├── migrations/
│   └── utils/
│
├── src/                  # Next.js frontend
│   ├── app/
│   ├── components/
│   ├── context/
│   ├── hooks/
│   └── lib/
│
├── docker-compose.yml
├── package.json
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

* Node.js 18+
* npm 9+
* Docker Desktop

---

### Installation

```bash
# Install dependencies
npm install

# Start PostgreSQL container
docker compose up -d

# Initialize database
npm run db:init

# Run migrations
npx tsx server/migrations/001_add_leader_assignment.ts

# Seed sample data
npm run db:seed

# Start backend
npm run server:dev

# Start frontend
npm run dev
```

---

## 🔑 Test Credentials

| Role    | Email                                                 | Password    |
| ------- | ----------------------------------------------------- | ----------- |
| Admin   | [admin@toursync.com](mailto:admin@toursync.com)       | password123 |
| Guide   | [guide1@toursync.com](mailto:guide1@toursync.com)     | password123 |
| Tourist | [tourist1@toursync.com](mailto:tourist1@toursync.com) | password123 |

---

## ⚙ Environment Variables

```
POSTGRES_HOST=localhost
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=tour_management_system
POSTGRES_PORT=5433

JWT_SECRET=your_jwt_secret_here
JWT_REFRESH_SECRET=your_refresh_secret_here

PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

---

## 🎨 Design System

### Primary Color

Emerald (RGB: 5,150,105)

### Semantic Colors

* Success → Green
* Warning → Amber
* Destructive → Red

---

## 🧪 Available Scripts

| Command            | Purpose          |
| ------------------ | ---------------- |
| npm run dev        | Start frontend   |
| npm run server:dev | Start backend    |
| npm run db:init    | Initialize DB    |
| npm run db:seed    | Seed data        |
| npm run build      | Production build |
| npm test           | Run tests        |
| npm run lint       | Lint code        |

---

## 📈 Project Status

Version: 1.0.0
Production-ready
Modular & Scalable

---

## 📜 License

MIT License

---

## 👨‍💻 Author

Developed By Lathiya Harshal.
