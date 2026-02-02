# Global Tour Management System (GTMS) - Requirements Document

## 📋 Project Overview

**GTMS** is a centralized digital platform to plan, manage, monitor, and secure group tours.

The system handles:
- Tour planning and route management
- Real-time attendance tracking
- Budget control and expense management
- Emergency (SOS/health) handling
- Leader reporting and coordination

**Inspiration**: Real college tour scenario where leaders managed logistics, attendance, safety, and coordination manually. GTMS replaces this with a unified digital solution.

**Target Users**: Education institutes, NGOs, corporate tours, and travel organizations globally.

---

## 🛠️ Technology Stack (Strict Requirements)

| Component | Technology | Notes |
|-----------|------------|-------|
| **Frontend** | React.js | Using Next.js 14 (React-based framework) |
| **Backend** | Node.js + Express.js | TypeScript implementation |
| **Architecture** | MVC (Model-View-Controller) | Strict separation required |
| **Database** | ~~MySQL~~ PostgreSQL | **Modified from original spec** |
| **Authentication** | JWT-based | Access + refresh tokens |
| **API Style** | RESTful APIs | Standard REST conventions |
| **Security** | RBAC (Role-Based Access Control) | 3 roles: admin, guide, tourist |

---

## 👥 User Roles & Permissions

### 🏢 Role 1: Organization (Super Admin)

**Role Code**: `admin`

**Responsibilities:**
- Create and manage tours (states, cities, dates, duration)
- Define itinerary, places, routes, and checkpoints
- Release total budget and fee per participant
- **Assign leaders to tours**
- Monitor all activities:
  - Attendance reports
  - Leader daily reports
  - SOS & health alerts
- Access analytics and historical records

**Permissions:**
- Full read/write access across the system
- Administrative and monitoring authority
- Can override attendance (with audit logging)

---

### 🧭 Role 2: Leader (Tour Leader / Coordinator)

**Role Code**: `guide`

**Responsibilities:**
- View assigned tour details and routes
- Take or verify attendance at each place/checkpoint
- Upload daily tour reports (text, images, documents)
- Receive and respond to SOS / health alerts
- Report incidents to organization

**Permissions:**
- Operational control only
- **Cannot modify budget or tour structure**
- Can only access assigned tours
- Can verify participant self-attendance

---

### 👤 Role 3: Participant (Student / Member)

**Role Code**: `tourist`

**Responsibilities:**
- View tour itinerary, budget, and rules
- **Submit self-attendance** (time-stamped, optional location)
- **Trigger SOS / health emergency alerts**
- View announcements and leader updates

**Permissions:**
- **Read-only access** to tour data
- Emergency & attendance actions enabled
- Cannot modify any tour information

---

## ✅ Core Functional Modules (MUST Implement)

### 1. Authentication & Authorization ✅

**Status**: Implemented

- [x] Secure login & registration
- [x] JWT access tokens (24h expiry)
- [x] JWT refresh tokens (7d expiry)
- [x] Role-based middleware enforcement
- [x] Password hashing (bcryptjs)

**Pending**:
- [ ] Password reset flow
- [ ] Email verification (optional)

---

### 2. Tour & Itinerary Management ✅

**Status**: Fully Implemented

**Required Features:**
- [x] State → City → Place hierarchy
- [x] Route planning with checkpoints
- [x] Date-wise and time-wise schedules
- [x] Tour CRUD operations
- [x] Tour status tracking (planned, ongoing, completed, cancelled)
- [x] **Leader assignment to tours** ✅ (Phase 1 Complete)

**Database Tables:**
- `tours` - Main tour information
- `states` - State/province data
- `cities` - Cities within states
- `places` - Specific locations with coordinates
- `routes` - Tour routes
- `checkpoints` - Waypoints along routes
- `itineraries` - Day-by-day schedules

---

### 3. Attendance Management ✅

**Status**: Fully Implemented

**Required Features:**
- [x] Place-wise attendance
- [x] Leader-verified attendance
- [x] Timestamps and location tracking (lat/lng)
- [x] Attendance history per user and per tour
- [x] Geofencing validation (500m radius)
- [x] **Participant self-attendance UI** ✅ (Phase 2 Complete)
- [x] **Immutable attendance logs** ✅ (Phase 2 Complete - PostgreSQL triggers)

**Immutability Requirements:**
- Attendance cannot be edited after submission (PostgreSQL triggers)
- All changes logged in audit trail
- Admin override requires justification

**Database Tables:**
- `attendance` - Check-in records
- `attendance_audit` - Change history (to be created)

---

### 4. Budget & Fee Management ⚠️

**Status**: Partially Implemented

**Required Features:**
- [x] Organization-defined total budget
- [x] Per-participant fee field
- [x] Spent amount tracking
- [x] Expense categorization (TRANSPORT, ACCOMMODATION, FOOD, MISC)
- [ ] **Automatic fee calculation** ❌ (Phase 2 Priority)
  - Formula: `per_participant_fee = total_budget / participant_count`
- [ ] **Read-only enforcement for leaders/participants** ⚠️

**Database Tables:**
- `budgets` - Tour budgets
- `expenses` - Expense tracking

---

### 5. SOS & Health Emergency Module ✅

**Status**: Fully Implemented

**Required Features:**
- [x] Incident reporting (basic)
- [x] Severity levels (LOW, MEDIUM, HIGH, CRITICAL)
- [x] Status tracking (OPEN, RESOLVED)
- [x] **One-click SOS button for participants** ✅ (Phase 2 Complete)
- [x] **Health issue categorization** ✅ (Phase 2 Complete)
  - INJURY, ILLNESS, LOST, EMERGENCY, OTHER
- [x] **Incident lifecycle: OPEN → IN_PROGRESS → RESOLVED** ✅
- [x] **Instant notification to assigned leader** ✅ (Phase 2 Complete - SSE)
- [x] **Instant notification to organization** ✅ (Phase 2 Complete - SSE)
- [x] **Full audit log of emergencies** ✅ (responded_by, response_time, resolution_notes)

**Database Tables:**
- `incidents` - Incident records
- `incident_timeline` - Audit trail (to be created)
- `emergency_contacts` - Emergency contact info (to be created)

**Critical UI Components:**
- Participant: One-click SOS button (prominent, always accessible)
- Leader: Real-time alert dashboard
- Organization: Incident monitoring panel

---

### 6. Reporting System ⚠️

**Status**: Basic Implementation

**Required Features:**
- [x] Announcements system
- [x] File upload support (text, images, documents)
- [ ] **Daily reports by leaders** ⚠️ (Phase 3 Priority)
- [ ] **Archived and searchable reports** ⚠️ (Phase 3 Priority)

**Database Tables:**
- `announcements` - Reports/announcements
- `report_files` - Uploaded documents

---

## 🏗️ Backend Requirements (MVC Architecture)

### Current State: ✅ FULLY MVC COMPLIANT

**Implemented Structure (Phase 1 Complete):**
```
server/
  models/            ← ✅ COMPLETE
    BaseModel.ts           # Reusable CRUD operations
    User.model.ts          # User database operations
    Tour.model.ts          # Tour database operations
    Attendance.model.ts    # Attendance database operations
    Budget.model.ts        # Budget/Expense operations
    Incident.model.ts      # Incident operations (with SOS methods)
    Announcement.model.ts  # Announcement operations
    Itinerary.model.ts     # Itinerary/Route/Checkpoint operations
    Location.model.ts      # State/City/Place operations
    index.ts               # Barrel exports

  controllers/       ← ✅ COMPLETE
    auth.controller.ts        # Authentication business logic
    tour.controller.ts        # Tour management logic
    attendance.controller.ts  # Attendance logic with geofencing
    budget.controller.ts      # Budget management logic
    expense.controller.ts     # Expense tracking logic
    incident.controller.ts    # Incident + SOS + notifications
    announcement.controller.ts # Announcements logic

  routes/            ← ✅ REFACTORED - Clean endpoint definitions
    auth.ts               # Delegates to authController
    tours.ts              # Delegates to tourController
    attendance.ts         # Delegates to attendanceController
    budgets.ts            # Delegates to budgetController
    expenses.ts           # Delegates to expenseController
    incidents.ts          # Delegates to incidentController
    announcements.ts      # Delegates to announcementController
    notifications.ts      # SSE endpoint for real-time notifications

  middleware/        ← ✅ CORRECT
    auth.ts
    validation.ts
    errorHandler.ts
    rateLimiter.ts

  services/          ← ✅ IMPLEMENTED
    notification.service.ts  # SSE notification management

  utils/             ← ✅ IMPLEMENTED
    geofencing.ts            # Haversine distance calculation

  migrations/        ← ✅ IMPLEMENTED
    001_add_leader_assignment.ts
    002_add_sos_emergency_fields.ts
    003_add_attendance_immutability_trigger.ts
```

**MVC Separation Requirements:**
1. **Models**: Database operations only (CRUD, queries)
2. **Controllers**: Business logic, validation, orchestration
3. **Routes**: Endpoint definitions, route to controller methods
4. **Middleware**: Reusable cross-cutting concerns

---

## 🗄️ Database Requirements (PostgreSQL)

### Schema Requirements:

✅ **Fully normalized schema** - Current: 3NF compliance
✅ **Strong referential integrity** - Using foreign keys with CASCADE/SET NULL
✅ **Proper indexing** - 14 indexes created for performance

### Required Tables:

- [x] `users` - User accounts & roles
- [x] `tours` - Tour information
- [x] `states`, `cities`, `places` - Location hierarchy
- [x] `routes`, `checkpoints` - Route planning
- [x] `itineraries` - Day-by-day schedules
- [x] `attendance` - Check-in records
- [x] `budgets`, `expenses` - Budget tracking
- [x] `incidents` - SOS & incidents
- [x] `announcements`, `report_files` - Reporting
- [x] `audit_logs` - Change tracking
- [x] `safety_protocols` - Safety guidelines

### Tables to Add (Phase 2):

- [ ] `attendance_audit` - Immutability audit trail
- [ ] `incident_timeline` - SOS incident lifecycle
- [ ] `emergency_contacts` - Participant emergency contacts
- [ ] `tour_participants` - Many-to-many relationship (tours ↔ users)

### Schema Modifications (Phase 1): ✅ COMPLETE

- [x] Add `assigned_leader_id INT REFERENCES users(id)` to `tours` table
- [x] Add `leader_assigned_at TIMESTAMP` to `tours` table
- [x] Add `participant_count INT DEFAULT 0` to `tours` table
- [x] Migration file: `001_add_leader_assignment.ts`

### Schema Modifications (Phase 2): ✅ COMPLETE

- [x] Add `incident_type` enum to `incidents` (SOS, HEALTH, GENERAL)
- [x] Add `health_category` enum to `incidents` (INJURY, ILLNESS, LOST, EMERGENCY, OTHER)
- [x] Add `IN_PROGRESS` to `incidents.status` enum
- [x] Add `responded_by INT REFERENCES users(id)` to `incidents`
- [x] Add `response_time TIMESTAMP` to `incidents`
- [x] Add `resolution_notes TEXT` to `incidents`
- [x] Migration file: `002_add_sos_emergency_fields.ts`
- [x] Add PostgreSQL triggers for attendance immutability (24h lock)
- [x] Migration file: `003_add_attendance_immutability_trigger.ts`

---

## 🎨 Frontend Requirements (React)

### Current State: ✅ Mostly Compliant

**Framework**: Next.js 14 (React-based) ✅
**Styling**: Tailwind CSS ✅
**UI Components**: Radix UI ✅

### Required Features:

#### 1. Role-Based Dashboards ⚠️

**Organization Dashboard** (`/dashboard` - role: admin):
- [x] Tour management page
- [x] Basic statistics
- [x] **Leader assignment UI** ✅ (Phase 1 - LeaderAssignment component)
- [x] **Attendance reports viewer** ✅ (Existing attendance page)
- [ ] **Leader daily reports viewer** ⚠️ (Phase 3)
- [x] **SOS alert monitor** ✅ (Phase 2 - Real-time SSE notifications)
- [ ] **Analytics/historical records** ⚠️ (Phase 3)

**Leader Dashboard** (`/dashboard` - role: guide):
- [x] **"My Assigned Tours" page** ✅ (Phase 1 - API endpoint implemented)
- [x] Tour details viewer
- [x] **Attendance verification panel** ✅ (Existing attendance page)
- [ ] **Daily report upload form** ❌ (Phase 3)
- [x] **SOS alert dashboard** ✅ (Phase 2 - Real-time SSE notifications)

**Participant Dashboard** (`/dashboard` - role: tourist):
- [x] Tour itinerary viewer
- [x] Budget viewer (read-only)
- [x] **Self-attendance check-in page** ✅ (Phase 2 - /dashboard/attendance/checkin)
- [x] **One-click SOS button** ✅ (Phase 2 - SOSButton component in safety tab)
- [x] Announcements viewer

#### 2. Protected Routes ✅

- [x] Middleware-based route protection
- [x] Role-based access control
- [x] Redirect to login if unauthorized

#### 3. Responsive UI ✅

- [x] Mobile-friendly design (Tailwind)
- [x] Clean, modern interface
- [x] Accessibility considerations

#### 4. Data Visualization ⚠️

- [ ] **Attendance charts/tables** ⚠️ (Phase 3)
- [ ] **Budget utilization display** ⚠️
- [ ] **SOS alert notifications** ❌ (Phase 2)
- [ ] **Report listings** ⚠️

---

## 🔒 Non-Functional Requirements

### 1. Security ✅

**Current Implementation:**
- [x] JWT authentication
- [x] Role-based authorization
- [x] Password hashing (bcryptjs, 10 rounds)
- [x] Rate limiting (auth: 5/15min, general: 100/15min)
- [x] Input validation (Zod schemas)

**Phase 4 Requirements:**
- [ ] SQL injection prevention audit
- [ ] XSS protection verification
- [ ] CSRF protection
- [ ] Security headers (helmet.js)
- [ ] HTTPS enforcement (production)

### 2. Scalability ⚠️

**Requirements:**
- Support multiple organizations & tours simultaneously
- Handle hundreds of participants per tour
- Efficient database queries with proper indexing

**Phase 4 Tasks:**
- [ ] Connection pool optimization
- [ ] Query performance testing
- [ ] Load testing

### 3. Maintainability ⚠️

**Requirements:**
- Clean, well-documented code
- Consistent coding standards
- Proper folder structure (MVC)

**Phase 1 Tasks:**
- [ ] Refactor to strict MVC
- [ ] Add JSDoc comments
- [ ] Code quality review

### 4. Production-Ready ⚠️

**Requirements:**
- Deployable to production environment
- Proper error handling
- Logging and monitoring

**Phase 4 Tasks:**
- [ ] Production environment setup
- [ ] Deployment guide
- [ ] Error tracking (optional: Sentry)

---

## 📦 Deliverables (Section 9)

### Required Deliverables:

- [x] **Complete backend** (Node.js + Express + PostgreSQL) ✅
  - [x] MVC architecture ✅
  - [x] All core modules ✅
  - [x] RESTful APIs ✅
  - [x] Real-time notifications (SSE) ✅

- [x] **Complete frontend** (React.js) ⚠️
  - [x] Role-based dashboards ✅
  - [x] Core features ✅
  - [ ] Phase 3 features pending ⚠️

- [x] **Database schema & relationships** ✅
  - [x] Normalized schema
  - [x] Foreign keys
  - [ ] ER diagram documentation ⚠️

- [ ] **REST API documentation** ❌
  - [ ] Swagger/OpenAPI spec
  - [ ] Request/response examples

- [x] **Proper folder structure** ⚠️
  - [x] Current structure adequate
  - [ ] MVC compliance ❌

- [ ] **Ready for deployment** ⚠️
  - [ ] Production config
  - [ ] Deployment guide

---

## 🎯 Implementation Phases

### **Phase 1: MVC Refactoring & Leader Assignment** ✅ COMPLETE

**Goal**: Achieve MVC compliance and add leader assignment

**Completed Implementation**:
- ✅ BaseModel with reusable CRUD operations
- ✅ 9 model files (User, Tour, Attendance, Budget, Incident, Location, Itinerary, Announcement)
- ✅ 7 controller files (auth, tour, attendance, budget, expense, incident, announcement)
- ✅ Refactored all routes to delegate to controllers
- ✅ Leader assignment endpoints (GET /tours/my-assigned, PUT /tours/:id/assign-leader)
- ✅ LeaderAssignment UI component
- ✅ Migration: 001_add_leader_assignment.ts
- ✅ Centralized API service (src/lib/api.ts)

**Completion Criteria**: ✅ ALL MET
- ✅ Strict MVC separation achieved
- ✅ Leaders can be assigned to tours via UI
- ✅ Database schema updated

---

### **Phase 2: SOS/Emergency & Attendance** ✅ COMPLETE

**Goal**: Complete emergency system and participant self-attendance

**Completed Implementation**:
- ✅ SOSButton component with geolocation capture
- ✅ Health issue categorization (INJURY, ILLNESS, LOST, EMERGENCY, OTHER)
- ✅ Real-time SSE notifications (notificationService + useNotifications hook)
- ✅ Incident lifecycle (OPEN → IN_PROGRESS → RESOLVED)
- ✅ Participant self-attendance page (/dashboard/attendance/checkin)
- ✅ Geofencing validation (Haversine distance)
- ✅ Attendance immutability (PostgreSQL triggers - 24h lock)
- ✅ Migration: 002_add_sos_emergency_fields.ts
- ✅ Migration: 003_add_attendance_immutability_trigger.ts
- ✅ SSE notification routes and service
- ✅ Incident controller with SOS methods (triggerSOS, reportHealth, respond, resolve)

**Completion Criteria**: ✅ ALL MET
- ✅ SOS alerts work end-to-end with real-time notifications
- ✅ Participants can self-check-in with location verification
- ✅ Attendance cannot be edited after 24 hours

---

### **Phase 3: Reporting & Dashboards** (Week 5)

**Goal**: Complete role-based dashboards and reporting

**Tasks**: 28 tasks
- Leader daily report upload
- Organization report viewer
- Role-specific dashboard features
- Data visualization
- Searchable report archive

**Completion Criteria**:
- Each role has complete dashboard
- Leaders can upload daily reports
- Reports are searchable

---

### **Phase 4: Production Readiness** (Week 6)

**Goal**: Security, documentation, deployment

**Tasks**: 22 tasks
- Security hardening
- API documentation (Swagger)
- Deployment setup
- User guides
- Code quality review

**Completion Criteria**:
- System is production-ready
- All documentation complete
- Deployment guide available

---

## 📊 Progress Tracking

### Overall Completion: ~85%

| Module | Implementation | Testing | Documentation | Total |
|--------|---------------|---------|---------------|-------|
| **Authentication** | 100% | 80% | 70% | 83% |
| **Tour Management** | 100% | 60% | 60% | 73% |
| **Attendance** | 100% | 50% | 60% | 70% |
| **Budget** | 80% | 40% | 40% | 53% |
| **SOS/Emergency** | 100% | 40% | 60% | 67% |
| **Reporting** | 60% | 30% | 30% | 40% |
| **MVC Architecture** | 100% | 60% | 80% | 80% |
| **Real-time Notifications** | 100% | 40% | 60% | 67% |
| **OVERALL** | **93%** | **50%** | **58%** | **67%** |

### Completed Phases:

✅ **Phase 1: MVC Refactoring & Leader Assignment** (100%)
- Full MVC separation (models, controllers, routes)
- BaseModel with reusable CRUD operations
- Leader assignment feature with UI
- Database migration system established

✅ **Phase 2: SOS/Emergency & Attendance** (100%)
- One-click SOS button with geolocation
- Health issue categorization (INJURY, ILLNESS, LOST, EMERGENCY, OTHER)
- Incident lifecycle (OPEN → IN_PROGRESS → RESOLVED)
- Real-time SSE notifications to leaders/admins
- Participant self-attendance check-in with geofencing
- Attendance immutability (24h lock with PostgreSQL triggers)

### In Progress:

⚠️ **Phase 3: Reporting & Dashboards** (40%)
- Leader daily report upload (pending)
- Enhanced role-based dashboards (partial)
- Data visualization (pending)

---

## ❌ Features NOT in Core Requirements (Extra/Optional)

These are valuable features but **NOT required** by the specification:

### Performance Enhancements:
- Redis caching
- CDN integration
- Database read replicas
- Query optimization beyond basic indexing
- Service worker (offline mode)

### DevOps Features:
- Docker containerization
- CI/CD pipeline automation (basic CI exists)
- Automated backups
- APM/Monitoring tools (Sentry, etc.)
- Auto-scaling

### Advanced Analytics:
- Attendance trend charts
- Budget utilization graphs
- Tour performance metrics
- Comparative analytics
- Exportable reports (PDF/Excel)

### Real-Time Features:
- WebSocket/Socket.IO implementation
- Real-time location sharing
- Live attendance updates
- Push notifications

### Advanced UI:
- QR code attendance scanner
- Mobile app (React Native)
- PWA features
- Multi-language support

### Integrations:
- Email notifications (SendGrid/AWS SES)
- SMS notifications (Twilio)
- Weather API
- Google Maps visualization
- Calendar export (iCal)

### Other:
- Multi-currency support
- Tour templates
- Gamification
- AI features
- Social media sharing

**Note**: These features can be implemented in Phase 5+ after core requirements are complete.

---

## 🔄 Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2025-02-01 | Initial requirements document |
| 1.1 | 2025-02-01 | Modified: MySQL → PostgreSQL |

---

## 📞 Support & Questions

For clarifications on requirements, refer to the original specification or discuss with the project team.

---

**End of Requirements Document**
