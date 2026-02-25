# TourSync — Comprehensive Project Documentation

> A complete technical guide to the Tour Management System

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Technology Stack](#technology-stack)
3. [Architecture](#architecture)
4. [Features](#features)
5. [Database Schema](#database-schema)
6. [API Endpoints](#api-endpoints)
7. [Frontend Structure](#frontend-structure)
8. [Authentication](#authentication)
9. [Project Structure](#project-structure)
10. [Getting Started](#getting-started)
11. [Configuration](#configuration)

---

## Project Overview

**TourSync** is a full-stack tour management platform designed for educational institutions and organizations. It provides comprehensive solutions for managing educational tours, field trips, and group travel experiences.

### Core Capabilities

- **Tour Management**: Create, update, and manage tour packages with detailed itineraries
- **Attendance Tracking**: Real-time attendance with checkpoint verification and location tracking
- **Safety & Emergency**: SOS alerts, health incident reporting, and safety protocols
- **Budget Management**: Track expenses, budgets, and per-participant costs
- **Team Communication**: Announcements and notifications for tour participants
- **Accommodation Management**: Hotel bookings and room assignments
- **Photo Gallery**: Capture and share tour memories

### Target Users

| Role        | Description                 | Access Level                        |
| ----------- | --------------------------- | ----------------------------------- |
| **Admin**   | Organization administrators | Full system access                  |
| **Guide**   | Tour leaders/coordinators   | Tour management, attendance, safety |
| **Tourist** | Tour participants           | View tours, check-in, announcements |

---

## Technology Stack

### Frontend

| Technology    | Version  | Purpose                         |
| ------------- | -------- | ------------------------------- |
| Next.js       | 14.2.4   | React framework with App Router |
| TypeScript    | ^5.9.3   | Type-safe JavaScript            |
| Tailwind CSS  | ^3.4.1   | Utility-first CSS framework     |
| Framer Motion | ^11.2.10 | Animation library               |
| Radix UI      | Latest   | Accessible UI primitives        |
| Lucide React  | ^0.468.0 | Icon library                    |
| Sonner        | ^2.0.7   | Toast notifications             |

### Backend

| Technology         | Version | Purpose               |
| ------------------ | ------- | --------------------- |
| Express.js         | ^5.2.1  | Node.js web framework |
| TypeScript         | ^5.9.3  | Type-safe JavaScript  |
| PostgreSQL         | 17      | Relational database   |
| JWT                | ^9.0.2  | Authentication tokens |
| bcryptjs           | ^3.0.3  | Password hashing      |
| express-rate-limit | ^8.2.1  | API rate limiting     |
| Zod                | ^3.24.0 | Schema validation     |
| pg                 | ^8.13.0 | PostgreSQL client     |

### Development Tools

| Technology  | Purpose                   |
| ----------- | ------------------------- |
| Vitest      | Testing framework         |
| ESLint 9    | Code linting              |
| Prettier    | Code formatting           |
| Husky       | Git hooks                 |
| lint-staged | Pre-commit checks         |
| Docker      | Database containerization |
| nodemon     | Development auto-reload   |

---

## Architecture

### Design Patterns

The project follows several key architectural patterns:

#### 1. MVC (Model-View-Controller)

```
Routes → Controllers → Models → Database
   ↓         ↓           ↓
  API     Business    Data Access
Endpoint  Logic       Layer
```

**Example: Creating a Tour**

```
POST /api/tours
  ↓
routes/tours.ts (route definition)
  ↓
controllers/tour.controller.ts (business logic)
  ↓
models/Tour.model.ts (database operations)
  ↓
PostgreSQL Database
```

#### 2. Repository Pattern

Each model extends `BaseModel` providing common CRUD operations:

```
typescript
class TourModel extends BaseModel {
  async getAllTours(filters?: {...}): Promise<TourRow[]>
  async getTourById(id: number): Promise<TourRow | null>
  async createTour(data: {...}): Promise<TourRow>
  // ... more methods
}
```

#### 3. Middleware Pipeline

Requests flow through middleware layers:

```
Request → Rate Limiter → Auth Check → Validation → Controller → Response
   ↓            ↓            ↓           ↓            ↓
Protection   Security   Authorization  Sanitization  Business Logic
```

#### 4. Singleton Pattern

Controllers and services use singleton pattern:

```
typescript
// Export singleton instance
export const tourController = new TourController();
```

### API Design

RESTful API with consistent response format:

```
typescript
// Success Response
{
  "success": true,
  "data": {...},
  "message": "Operation successful"
}

// Error Response
{
  "success": false,
  "error": "Error message"
}
```

---

## Features

### 1. Tour Management

**Capabilities:**

- Create tours with name, description, dates, destination, price
- Assign tour leaders (guides) to tours
- Track participant count
- Tour status management: planned, ongoing, completed, cancelled
- View upcoming, ongoing, and completed tours

**Key Features:**

- Leader assignment with audit trail
- Participant management via tour_users table
- Tour content rich text support

### 2. Attendance System

**Capabilities:**

- Check-in/check-out at checkpoints
- Location verification (lat/lng)
- Status tracking: present, absent, late
- Verification by tour leaders
- 24-hour immutability (after 24h, records cannot be modified)

**Database Trigger:**

```
sql
-- Prevents attendance modifications after 24 hours
CREATE TRIGGER attendance_immutability_trigger
  BEFORE UPDATE ON attendance
  FOR EACH ROW
  EXECUTE FUNCTION prevent_attendance_update_after_24h();
```

### 3. Safety & Emergency

**Incident Types:**

- **SOS**: One-click emergency alert
- **Health**: Health-related incidents
- **General**: General issues

**Health Categories:**

- Injury, Illness, Lost, Emergency, Other

**Features:**

- Severity levels: LOW, MEDIUM, HIGH, CRITICAL
- Response tracking (who responded, response time)
- Resolution notes
- One-click SOS trigger

### 4. Budget Management

**Capabilities:**

- Set total budget per tour
- Track spent amount
- Per-participant fee calculation
- Expense categorization: TRANSPORT, ACCOMMODATION, FOOD, MISC

### 5. Itinerary Planning

**Features:**

- Day-by-day itinerary
- Route management with checkpoints
- Time scheduling (start_time, end_time)
- Status tracking: SCHEDULED, IN_PROGRESS, COMPLETED, CANCELLED

### 6. Location Management

**Hierarchy:**

```
State → City → Place
```

**Place Categories:**

- HISTORICAL, NATURAL, CULTURAL, RELIGIOUS, ENTERTAINMENT, OTHER

**Features:**

- GPS coordinates (latitude, longitude)
- Category classification
- Rich descriptions

### 7. Announcements

**Features:**

- Tour-specific announcements
- Rich content support
- Timestamped creation

### 8. Accommodations

**Capabilities:**

- Hotel/accommodation booking
- Check-in/check-out dates
- Contact information
- Room assignments to participants

### 9. Photo Gallery

**Features:**

- Tour photo uploads
- User attribution
- Caption support
- Base64 or URL storage

### 10. Audit Logging

**Tracked Actions:**

- CREATE, UPDATE, DELETE, VIEW, ASSIGN, UNASSIGN

**Logged Information:**

- User ID
- Action type
- Entity type and ID
- Old and new values (JSONB)
- IP address
- User agent

---

## Database Schema

### Core Tables (16+ Tables)

#### 1. `users` — User Accounts

| Column        | Type         | Constraints                   |
| ------------- | ------------ | ----------------------------- |
| id            | SERIAL       | PRIMARY KEY                   |
| email         | VARCHAR(255) | UNIQUE, NOT NULL              |
| password_hash | VARCHAR(255) | NOT NULL                      |
| name          | VARCHAR(255) |                               |
| role          | VARCHAR(20)  | CHECK (admin, guide, tourist) |
| created_at    | TIMESTAMP    | DEFAULT NOW()                 |

#### 2. `tours` — Tour Packages

| Column             | Type          | Constraints                                    |
| ------------------ | ------------- | ---------------------------------------------- |
| id                 | SERIAL        | PRIMARY KEY                                    |
| name               | VARCHAR(255)  | NOT NULL                                       |
| description        | TEXT          |                                                |
| start_date         | DATE          |                                                |
| end_date           | DATE          |                                                |
| destination        | VARCHAR(255)  |                                                |
| price              | NUMERIC(10,2) |                                                |
| status             | VARCHAR(20)   | CHECK (planned, ongoing, completed, cancelled) |
| content            | TEXT          |                                                |
| assigned_leader_id | INT           | FK → users(id)                                 |
| participant_count  | INT           | DEFAULT 0                                      |

#### 3. `tour_users` — Tour Participants

| Column  | Type        | Constraints           |
| ------- | ----------- | --------------------- |
| id      | SERIAL      | PRIMARY KEY           |
| tour_id | INT         | FK → tours(id)        |
| user_id | INT         | FK → users(id)        |
| role    | VARCHAR(20) | DEFAULT 'participant' |

#### 4. `attendance` — Check-in Records

| Column        | Type          | Constraints                   |
| ------------- | ------------- | ----------------------------- |
| id            | SERIAL        | PRIMARY KEY                   |
| user_id       | INT           | FK → users(id)                |
| tour_id       | INT           | FK → tours(id)                |
| date          | DATE          |                               |
| status        | VARCHAR(10)   | CHECK (present, absent, late) |
| checkpoint_id | INT           | FK → checkpoints(id)          |
| verified_by   | INT           | FK → users(id)                |
| location_lat  | NUMERIC(10,8) |                               |
| location_lng  | NUMERIC(11,8) |                               |

#### 5. `incidents` — Safety Incidents

| Column           | Type         | Constraints                         |
| ---------------- | ------------ | ----------------------------------- |
| id               | SERIAL       | PRIMARY KEY                         |
| tour_id          | INT          | FK → tours(id)                      |
| reported_by      | INT          | FK → users(id)                      |
| title            | VARCHAR(255) | NOT NULL                            |
| description      | TEXT         | NOT NULL                            |
| location         | VARCHAR(255) |                                     |
| severity         | VARCHAR(10)  | CHECK (LOW, MEDIUM, HIGH, CRITICAL) |
| status           | VARCHAR(10)  | CHECK (OPEN, IN_PROGRESS, RESOLVED) |
| incident_type    | VARCHAR(20)  | (SOS, HEALTH, GENERAL)              |
| responded_by     | INT          | FK → users(id)                      |
| response_time    | TIMESTAMP    |                                     |
| resolution_notes | TEXT         |                                     |

#### 6. `states` — Geographic States

| Column | Type         | Constraints      |
| ------ | ------------ | ---------------- |
| id     | SERIAL       | PRIMARY KEY      |
| name   | VARCHAR(100) | UNIQUE, NOT NULL |
| code   | VARCHAR(10)  | UNIQUE           |

#### 7. `cities` — Cities within States

| Column   | Type         | Constraints     |
| -------- | ------------ | --------------- |
| id       | SERIAL       | PRIMARY KEY     |
| name     | VARCHAR(100) | NOT NULL        |
| state_id | INT          | FK → states(id) |

#### 8. `places` — Tourist Places

| Column      | Type          | Constraints     |
| ----------- | ------------- | --------------- |
| id          | SERIAL        | PRIMARY KEY     |
| name        | VARCHAR(255)  | NOT NULL        |
| city_id     | INT           | FK → cities(id) |
| latitude    | NUMERIC(10,8) |                 |
| longitude   | NUMERIC(11,8) |                 |
| description | TEXT          |                 |
| category    | VARCHAR(20)   |                 |

#### 9. `routes` — Tour Routes

| Column             | Type         | Constraints    |
| ------------------ | ------------ | -------------- |
| id                 | SERIAL       | PRIMARY KEY    |
| tour_id            | INT          | FK → tours(id) |
| name               | VARCHAR(255) | NOT NULL       |
| description        | TEXT         |                |
| total_distance     | NUMERIC(8,2) |                |
| estimated_duration | INT          |                |
| status             | VARCHAR(20)  |                |

#### 10. `checkpoints` — Route Checkpoints

| Column         | Type          | Constraints                                 |
| -------------- | ------------- | ------------------------------------------- |
| id             | SERIAL        | PRIMARY KEY                                 |
| route_id       | INT           | FK → routes(id)                             |
| place_id       | INT           | FK → places(id)                             |
| name           | VARCHAR(255)  | NOT NULL                                    |
| sequence_order | INT           | NOT NULL                                    |
| latitude       | NUMERIC(10,8) |                                             |
| longitude      | NUMERIC(11,8) |                                             |
| status         | VARCHAR(10)   | CHECK (PENDING, ARRIVED, DEPARTED, SKIPPED) |

#### 11. `itineraries` — Daily Itineraries

| Column      | Type         | Constraints     |
| ----------- | ------------ | --------------- |
| id          | SERIAL       | PRIMARY KEY     |
| tour_id     | INT          | FK → tours(id)  |
| route_id    | INT          | FK → routes(id) |
| date        | DATE         | NOT NULL        |
| title       | VARCHAR(255) | NOT NULL        |
| description | TEXT         |                 |
| start_time  | TIME         |                 |
| end_time    | TIME         |                 |
| status      | VARCHAR(20)  |                 |

#### 12. `budgets` — Tour Budgets

| Column              | Type          | Constraints    |
| ------------------- | ------------- | -------------- |
| id                  | SERIAL        | PRIMARY KEY    |
| tour_id             | INT           | FK → tours(id) |
| total_amount        | NUMERIC(10,2) | NOT NULL       |
| spent_amount        | NUMERIC(10,2) | DEFAULT 0      |
| per_participant_fee | NUMERIC(10,2) | DEFAULT 0      |
| currency            | VARCHAR(3)    | DEFAULT 'USD'  |
| description         | TEXT          |                |

#### 13. `expenses` — Individual Expenses

| Column      | Type          | Constraints                            |
| ----------- | ------------- | -------------------------------------- |
| id          | SERIAL        | PRIMARY KEY                            |
| tour_id     | INT           | FK → tours(id)                         |
| amount      | NUMERIC(10,2) | NOT NULL                               |
| category    | VARCHAR(20)   | (TRANSPORT, ACCOMMODATION, FOOD, MISC) |
| description | TEXT          |                                        |

#### 14. `announcements` — Tour Announcements

| Column  | Type         | Constraints    |
| ------- | ------------ | -------------- |
| id      | SERIAL       | PRIMARY KEY    |
| title   | VARCHAR(255) | NOT NULL       |
| content | TEXT         | NOT NULL       |
| tour_id | INT          | FK → tours(id) |

#### 15. `safety_protocols` — Safety Guidelines

| Column      | Type         | Constraints    |
| ----------- | ------------ | -------------- |
| id          | SERIAL       | PRIMARY KEY    |
| tour_id     | INT          | FK → tours(id) |
| title       | VARCHAR(255) | NOT NULL       |
| description | TEXT         | NOT NULL       |
| severity    | VARCHAR(10)  |                |

#### 16. `audit_logs` — Activity Log

| Column      | Type         | Constraints    |
| ----------- | ------------ | -------------- |
| id          | SERIAL       | PRIMARY KEY    |
| user_id     | INT          | FK → users(id) |
| action      | VARCHAR(100) | NOT NULL       |
| entity_type | VARCHAR(50)  | NOT NULL       |
| entity_id   | INT          | NOT NULL       |
| old_values  | JSONB        |                |
| new_values  | JSONB        |                |
| ip_address  | VARCHAR(45)  |                |
| user_agent  | TEXT         |                |

### Additional Tables

- `accommodations` — Hotel bookings
- `accommodation_assignments` — Room assignments
- `photos` — Tour photos
- `report_files` — Announcement attachments
- `notifications` — User notifications

### Database Indexes

```
sql
-- Tour indexes
CREATE INDEX idx_tours_status ON tours(status);
CREATE INDEX idx_tours_dates ON tours(start_date, end_date);

-- Attendance indexes
CREATE INDEX idx_attendance_tour_user ON attendance(tour_id, user_id);
CREATE INDEX idx_attendance_checkpoint ON attendance(checkpoint_id);

-- Budget indexes
CREATE INDEX idx_budgets_tour ON budgets(tour_id);
CREATE INDEX idx_expenses_tour ON expenses(tour_id);

-- Incident indexes
CREATE INDEX idx_incidents_tour ON incidents(tour_id);
CREATE INDEX idx_incidents_severity ON incidents(severity);

-- Audit indexes
CREATE INDEX idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
```

---

## API Endpoints

### Authentication

| Method | Endpoint             | Description          | Auth     |
| ------ | -------------------- | -------------------- | -------- |
| POST   | `/api/auth/register` | Register new user    | Public   |
| POST   | `/api/auth/login`    | Login & get tokens   | Public   |
| POST   | `/api/auth/refresh`  | Refresh access token | Public   |
| GET    | `/api/auth/profile`  | Get current user     | Required |
| GET    | `/api/auth/leaders`  | Get all guides       | Required |

### Tours

| Method | Endpoint                       | Description             | Auth     | Roles |
| ------ | ------------------------------ | ----------------------- | -------- | ----- |
| GET    | `/api/tours`                   | List all tours          | Optional | All   |
| GET    | `/api/tours/upcoming`          | Upcoming tours          | Optional | All   |
| GET    | `/api/tours/ongoing`           | Ongoing tours           | Optional | All   |
| GET    | `/api/tours/completed`         | Completed tours         | Optional | All   |
| GET    | `/api/tours/my-assigned`       | Leader's assigned tours | Required | Guide |
| GET    | `/api/tours/:id`               | Get tour details        | Required | All   |
| GET    | `/api/tours/:id/participants`  | Tour participants       | Required | All   |
| POST   | `/api/tours`                   | Create tour             | Required | Admin |
| PUT    | `/api/tours/:id`               | Update tour             | Required | Admin |
| PUT    | `/api/tours/:id/assign-leader` | Assign leader           | Required | Admin |
| DELETE | `/api/tours/:id/assign-leader` | Unassign leader         | Required | Admin |
| DELETE | `/api/tours/:id`               | Delete tour             | Required | Admin |

### Attendance

| Method | Endpoint                     | Description   | Auth     | Roles        |
| ------ | ---------------------------- | ------------- | -------- | ------------ |
| GET    | `/api/attendance`            | List records  | Required | Admin, Guide |
| GET    | `/api/attendance/:id`        | Get record    | Required | All          |
| POST   | `/api/attendance/checkin`    | Check-in      | Required | All          |
| POST   | `/api/attendance`            | Create record | Required | Guide        |
| PUT    | `/api/attendance/:id`        | Update record | Required | Guide        |
| PUT    | `/api/attendance/:id/verify` | Verify record | Required | Guide        |
| DELETE | `/api/attendance/:id`        | Delete record | Required | Admin        |

### Incidents

| Method | Endpoint                     | Description         | Auth     | Roles        |
| ------ | ---------------------------- | ------------------- | -------- | ------------ |
| GET    | `/api/incidents`             | List incidents      | Required | All          |
| GET    | `/api/incidents/:id`         | Get incident        | Required | All          |
| POST   | `/api/incidents/sos`         | Trigger SOS         | Required | All          |
| POST   | `/api/incidents/health`      | Report health issue | Required | All          |
| POST   | `/api/incidents`             | Create incident     | Required | All          |
| PUT    | `/api/incidents/:id/respond` | Mark in progress    | Required | Admin, Guide |
| PUT    | `/api/incidents/:id/resolve` | Resolve incident    | Required | Admin, Guide |
| PUT    | `/api/incidents/:id`         | Update incident     | Required | Admin, Guide |
| DELETE | `/api/incidents/:id`         | Delete incident     | Required | Admin        |

### Budgets & Expenses

| Method | Endpoint           | Description   | Auth     | Roles |
| ------ | ------------------ | ------------- | -------- | ----- |
| GET    | `/api/budgets`     | List budgets  | Required | Admin |
| GET    | `/api/budgets/:id` | Get budget    | Required | Admin |
| POST   | `/api/budgets`     | Create budget | Required | Admin |
| PUT    | `/api/budgets/:id` | Update budget | Required | Admin |
| DELETE | `/api/budgets/:id` | Delete budget | Required | Admin |

| Method | Endpoint            | Description    | Auth     | Roles |
| ------ | ------------------- | -------------- | -------- | ----- |
| GET    | `/api/expenses`     | List expenses  | Required | Admin |
| POST   | `/api/expenses`     | Create expense | Required | Admin |
| PUT    | `/api/expenses/:id` | Update expense | Required | Admin |
| DELETE | `/api/expenses/:id` | Delete expense | Required | Admin |

### Locations

| Method | Endpoint                | Description  | Auth   |
| ------ | ----------------------- | ------------ | ------ |
| GET    | `/api/locations/states` | List states  | Public |
| POST   | `/api/locations/states` | Create state | Admin  |
| GET    | `/api/locations/cities` | List cities  | Public |
| POST   | `/api/locations/cities` | Create city  | Admin  |
| GET    | `/api/locations/places` | List places  | Public |
| POST   | `/api/locations/places` | Create place | Admin  |

### Other Endpoints

- **Announcements**: CRUD at `/api/announcements`
- **Itineraries**: CRUD at `/api/itineraries`
- **Accommodations**: CRUD at `/api/accommodations`
- **Photos**: CRUD at `/api/photos`
- **Safety**: Read at `/api/safety`
- **Audit Logs**: Read at `/api/audit-logs`
- **Notifications**: Read at `/api/notifications`

---

## Frontend Structure

### App Router Structure

```
src/app/
├── page.tsx                    # Landing page
├── layout.tsx                  # Root layout
├── globals.css                 # Global styles
│
├── auth/                       # Authentication pages
│   ├── login/page.tsx         # Login page
│   ├── register/page.tsx      # Registration page
│   ├── forgot-password/       # Password reset
│   ├── verify-email/          # Email verification
│   └── update-password/       # Password update
│
└── dashboard/                  # Protected dashboard
    ├── layout.tsx             # Dashboard layout (with sidebar)
    ├── page.tsx               # Dashboard home
    │
    ├── tours/                 # Tour management
    │   ├── page.tsx           # Tours list
    │   ├── new/               # Create tour
    │   │   └── page.tsx
    │   └── [id]/              # Tour details
    │       └── page.tsx
    │
    ├── attendance/           # Attendance tracking
    │   ├── page.tsx
    │   └── checkin/           # Check-in page
    │       └── page.tsx
    │
    ├── safety/                # Safety & SOS
    │   └── page.tsx
    │
    ├── budget/               # Budget management
    │   └── page.tsx
    │
    ├── announcements/        # Announcements
    │   └── page.tsx
    │
    ├── profile/              # User profile
    │   ├── page.tsx
    │   └── actions.ts       # Profile actions
    │
    └── audit-logs/          # Audit logs (admin)
        └── page.tsx
```

### Components

```
src/components/
├── ui/                       # Base UI components
│   ├── button.tsx
│   ├── input.tsx
│   ├── card.tsx
│   ├── badge.tsx
│   ├── dialog.tsx
│   ├── select.tsx
│   ├── tabs.tsx
│   └── ...
│
├── features/                 # Feature-specific components
│   ├── FormInput.tsx
│   ├── PageHeader.tsx
│   ├── LoadingSpinner.tsx
│   ├── ErrorMessage.tsx
│   └── ...
│
├── Sidebar.tsx              # Main sidebar navigation
├── DashboardStats.tsx       # Statistics cards
├── LeaderAssignment.tsx     # Tour leader assignment
├── photo-gallery.tsx       # Photo gallery
├── accommodation-manager.tsx # Accommodation manager
├── document-vault.tsx       # Document storage
├── SOSButton.tsx           # Emergency SOS button
└── BackButton.tsx          # Navigation back button
```

### Context & Hooks

```
src/context/
└── AuthContext.tsx          # Authentication context

src/hooks/
└── use-notifications.ts     # Notifications hook
```

### API Client

```
src/lib/
├── api.ts                   # API client & services
├── utils.ts                 # Utility functions
```

---

## Authentication

### JWT Token System

The application uses a dual-token system:

1. **Access Token** (short-lived)
   - Stored in: localStorage + cookie
   - Used for: API requests
   - Expiry: 24 hours

2. **Refresh Token** (longer-lived)
   - Used to obtain new access tokens
   - Automatically refreshed

### Login Flow

```
1. User enters email/password
2. POST /api/auth/login
3. Server validates credentials
4. Server generates JWT tokens
5. Frontend stores tokens:
   - localStorage (for API calls)
   - Cookie (for middleware)
6. Redirect to dashboard
```

### Middleware Protection

```
typescript
// src/middleware.ts
// Checks cookie on every request
// Redirects to /auth/login if not authenticated
```

### Role-Based Access Control (RBAC)

| Route                 | Admin | Guide | Tourist |
| --------------------- | ----- | ----- | ------- |
| /dashboard/tours/new  | ✓     | ✗     | ✗       |
| /dashboard/attendance | ✓     | ✓     | ✗       |
| /dashboard/budget     | ✓     | ✗     | ✗       |
| /dashboard/audit-logs | ✓     | ✗     | ✗       |

---

## Project Structure

```
Tour_Management_System/
│
├── .github/workflows/        # CI/CD pipelines
│
├── public/                   # Static assets
│   ├── manifest.json        # PWA manifest
│   └── sw.js                # Service worker
│
├── server/                   # Backend (Express.js)
│   ├── index.ts             # Server entry point
│   ├── db.ts               # Database connection
│   ├── init-db.ts          # Schema initialization
│   ├── seed-db.ts          # Database seeding
│   │
│   ├── controllers/        # Route controllers
│   │   ├── tour.controller.ts
│   │   ├── auth.controller.ts
│   │   ├── attendance.controller.ts
│   │   ├── incident.controller.ts
│   │   └── ...
│   │
│   ├── models/              # Database models
│   │   ├── BaseModel.ts
│   │   ├── Tour.model.ts
│   │   ├── User.model.ts
│   │   ├── Attendance.model.ts
│   │   └── ...
│   │
│   ├── routes/             # API routes
│   │   ├── tours.ts
│   │   ├── auth.ts
│   │   ├── attendance.ts
│   │   └── ...
│   │
│   ├── middleware/        # Express middleware
│   │   ├── auth.ts         # JWT authentication
│   │   ├── errorHandler.ts # Error handling
│   │   ├── rateLimiter.ts  # Rate limiting
│   │   └── validation.ts   # Zod validation
│   │
│   ├── migrations/         # Database migrations
│   │   ├── 001_add_leader_assignment.ts
│   │   ├── 002_add_sos_emergency_fields.ts
│   │   └── ...
│   │
│   ├── services/           # Business logic
│   │   └── notification.service.ts
│   │
│   ├── types/              # TypeScript types
│   │   └── index.ts
│   │
│   └── utils/              # Utilities
│       ├── auditLogger.ts
│       └── geofencing.ts
│
├── src/                     # Frontend (Next.js)
│   ├── app/                # App Router pages
│   │   ├── auth/          # Authentication pages
│   │   └── dashboard/     # Protected pages
│   │
│   ├── components/        # React components
│   │   ├── ui/            # Base components
│   │   ├── features/     # Feature components
│   │   └── ...
│   │
│   ├── context/            # React context
│   │   └── AuthContext.tsx
│   │
│   ├── hooks/             # Custom hooks
│   │
│   ├── lib/               # Libraries
│   │   └── api.ts         # API client
│   │
│   ├── config/            # Configuration
│   │   └── index.ts
│   │
│   ├── types/             # TypeScript types
│   │   └── index.ts
│   │
│   ├── middleware.ts      # Next.js middleware
│   └── globals.css        # Global styles
│
├── docker-compose.yml      # PostgreSQL container
├── package.json           # Root dependencies
├── tsconfig.json          # TypeScript config
├── tailwind.config.ts    # Tailwind CSS config
├── eslint.config.js      # ESLint config
├── vitest.config.ts      # Test config
└── README.md             # Original documentation
```

---

## Getting Started

### Prerequisites

- **Node.js** 18+
- **npm** 9+
- **Docker Desktop**

### Installation Steps

```
bash
# 1. Install dependencies
npm install

# 2. Start PostgreSQL
docker compose up -d

# 3. Initialize database
npm run db:init

# 4. Run migrations
npx tsx server/migrations/001_add_leader_assignment.ts
npx tsx server/migrations/002_add_sos_emergency_fields.ts
npx tsx server/migrations/003_add_attendance_immutability_trigger.ts

# 5. Seed database (optional)
npm run db:seed

# 6. Start backend
npm run server:dev

# 7. Start frontend (separate terminal)
npm run dev
```

### Test Credentials

| Role    | Email                 | Password    |
| ------- | --------------------- | ----------- |
| Admin   | admin@toursync.com    | password123 |
| Guide   | guide1@toursync.com   | password123 |
| Tourist | tourist1@toursync.com | password123 |

---

## Configuration

### Environment Variables

```
env
# Database
POSTGRES_HOST=localhost
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=tour_management_system
POSTGRES_PORT=5433

# JWT
JWT_SECRET=your_jwt_secret_at_least_32_characters
JWT_REFRESH_SECRET=your_refresh_secret_at_least_32_characters

# Server
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

### App Configuration

```
typescript
// src/config/index.ts
export const config = {
  api: {
    baseUrl: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001",
  },
  auth: {
    tokenKey: "tms_token",
    userKey: "tms_user",
    tokenExpiry: 86400, // 24 hours
  },
  app: {
    name: "TourSync",
    version: "1.0.0",
  },
};
```

---

## Design System

### Color Palette

**Primary: Emerald**

- 50-900: Light to dark emerald shades
- RGB: 5, 150, 105

**Background**: Light mode (#FFFFFF), Dark mode (#0D1B14)

**Semantic Colors**:

- Success: Green (142, 76%, 36%)
- Warning: Amber (38, 92%, 50%)
- Destructive: Red (0, 84%, 60%)

### Component Classes

```
css
/* Buttons */
.btn-primary    /* Primary action */
.btn-secondary  /* Secondary action */
.btn-outline   /* Outlined */
.btn-ghost     /* Minimal */
.btn-destructive /* Danger */

/* Cards */
.card          /* Standard card */
.card-hover    /* Interactive card */

/* Status Badges */
.status-planned
.status-ongoing
.status-completed
.status-cancelled
```

---

## Available Scripts

| Script               | Description              |
| -------------------- | ------------------------ |
| `npm run dev`        | Frontend dev server      |
| `npm run server:dev` | Backend with auto-reload |
| `npm run db:init`    | Initialize database      |
| `npm run db:seed`    | Seed sample data         |
| `npm run build`      | Production build         |
| `npm test`           | Run tests                |
| `npm run lint`       | Lint code                |
| `npm run format`     | Format code              |
| `npm run prepush`    | Full validation          |

---

## Development Guidelines

### Code Style

- Use **Prettier** for formatting
- Use **ESLint** for linting
- Follow **TypeScript** best practices
- Use **Zod** for validation schemas

### Testing

- Write tests alongside components
- Use **Vitest** for unit tests
- Target: Core business logic and components

### Git Workflow

```
bash
# Before pushing
npm run prepush

# This runs:
# 1. Type check
# 2. Lint
# 3. Format check
# 4. Tests
```

---

## License

MIT License

---

## Credits

Built with care for educational institutions and tour operators.

**Version**: 1.0.0  
**Last Updated**: 2026
