# TourSync — Global Tour Management System

A full-stack tour management platform for educational institutions and organizations. Handles attendance tracking, safety coordination, budget management, itinerary planning, and team communication.

---

## Tech Stack

| Layer         | Technology                                                           |
| ------------- | -------------------------------------------------------------------- |
| Frontend      | Next.js 14.2.4 (App Router), TypeScript, Tailwind CSS, Framer Motion |
| Backend       | Express.js (TypeScript), running on port 3001                        |
| Database      | PostgreSQL (latest) via Docker                                       |
| Auth          | Custom JWT (access + refresh tokens)                                 |
| UI Components | Radix UI, Lucide React, Sonner                                       |
| Testing       | Vitest, React Testing Library                                        |
| Linting       | ESLint 9 (flat config), Prettier, Husky + lint-staged                |

---

## Prerequisites

- **Node.js** 18 or later
- **npm** 9 or later
- **Docker Desktop** (for PostgreSQL database)

---

## Setup Guide

### 1. Clone the Repository

```bash
git clone <repo-url>
cd Tour_Management_System
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

The `.env` file should already exist at the project root. If not, create it:

```env
# PostgreSQL (Docker defaults — change in production)
POSTGRES_HOST=localhost
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=tour_management_system
POSTGRES_PORT=5433

# JWT secrets — use long random strings in production
JWT_SECRET=your_jwt_secret_at_least_32_characters
JWT_REFRESH_SECRET=your_refresh_secret_at_least_32_characters

# Server
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

> **Security**: Never commit `.env` to version control. It is listed in `.gitignore`.

### 4. Start the PostgreSQL Database

The database runs inside a Docker container. No local PostgreSQL installation is needed.

```bash
docker compose up -d
```

This starts a PostgreSQL container with:

- **Host**: `localhost`
- **Port**: `5433` (mapped from container's 5432)
- **User**: `postgres`
- **Password**: `postgres`
- **Database**: `tour_management_system`

Data is persisted in a Docker named volume (`tms-pgdata`), so it survives container restarts.

To verify the container is healthy:

```bash
docker compose ps
```

You should see `tms-postgres` with status `healthy`.

### 5. Initialize the Database Schema

This creates all 16 tables and indexes:

```bash
npx tsx server/init-db.ts
```

### 6. Run Database Migrations

After initializing the schema, run migrations to add additional features:

```bash
# Run migrations individually
npx tsx server/migrations/001_add_leader_assignment.ts
npx tsx server/migrations/002_add_sos_emergency_fields.ts
npx tsx server/migrations/003_add_attendance_immutability_trigger.ts
```

**Available Migrations:**

1. **001_add_leader_assignment.ts** - Adds leader assignment fields to tours table
2. **002_add_sos_emergency_fields.ts** - Adds SOS/emergency incident types and health categories
3. **003_add_attendance_immutability_trigger.ts** - Adds triggers to prevent attendance modifications after 24h

To rollback a migration:

```bash
npx tsx server/migrations/001_add_leader_assignment.ts down
```

See the [Database Migrations](#database-migrations) section below for detailed documentation.

### 7. Seed the Database (Optional)

Populate the database with sample data for development and testing:

```bash
npm run db:seed
```

This creates:

| Data                     | Count                                          |
| ------------------------ | ---------------------------------------------- |
| Users                    | 10 (2 admins, 3 guides, 5 tourists)            |
| Tours                    | 10 (planned / ongoing / completed / cancelled) |
| States / Cities / Places | 5 / 12 / 15                                    |
| Announcements            | 10                                             |
| Budgets & Expenses       | 10 / 20                                        |
| Attendance records       | 16                                             |
| Incidents                | 3                                              |
| Safety protocols         | 5                                              |

> **Warning**: Running `db:seed` clears all existing data before inserting. Do not run in production.

**Test credentials** (all use password `password123`):

| Role    | Email                   |
| ------- | ----------------------- |
| Admin   | `admin@toursync.com`    |
| Guide   | `guide1@toursync.com`   |
| Tourist | `tourist1@toursync.com` |

---

### 8. Start the Backend Server

**Development (with auto-reload):**

```bash
npm run server:dev
```

**Single run:**

```bash
npm run server:start
```

The Express API starts on `http://localhost:3001`. Available routes:

| Route                        | Description                                             |
| ---------------------------- | ------------------------------------------------------- |
| `POST /api/auth/register`    | Register a new user                                     |
| `POST /api/auth/login`       | Login and receive JWT tokens                            |
| `POST /api/auth/refresh`     | Refresh an expired access token                         |
| `GET /api/tours`             | List all tours                                          |
| `GET /api/tours/:id`         | Get a single tour                                       |
| `POST /api/tours`            | Create a tour (admin only)                              |
| `PUT /api/tours/:id`         | Update a tour (admin only)                              |
| `DELETE /api/tours/:id`      | Delete a tour (admin only)                              |
| `GET /api/locations/states`  | List states                                             |
| `POST /api/locations/states` | Create a state (admin only)                             |
| `GET /api/locations/cities`  | List cities (filter by `?state_id=`)                    |
| `POST /api/locations/cities` | Create a city (admin only)                              |
| `GET /api/locations/places`  | List places (filter by `?city_id=` and/or `?category=`) |
| `POST /api/locations/places` | Create a place (admin only)                             |

### 8. Start the Frontend

In a separate terminal:

```bash
npm run dev
```

The Next.js app starts on `http://localhost:3000`.

---

## Available Scripts

| Script                  | Description                                      |
| ----------------------- | ------------------------------------------------ |
| `npm run dev`           | Start frontend dev server (port 3000)            |
| `npm run server:dev`    | Start backend with auto-reload (port 3001)       |
| `npm run server:start`  | Start backend single run (port 3001)             |
| `npm run db:init`       | Initialize database schema (creates all tables)  |
| `npm run db:seed`       | Seed database with sample data (clears existing) |
| `npm run build`         | Build Next.js for production                     |
| `npm start`             | Start production frontend                        |
| `npm test`              | Run tests (watch mode)                           |
| `npm run test:coverage` | Run tests with coverage report                   |
| `npm run lint`          | Run ESLint                                       |
| `npm run lint:fix`      | Auto-fix ESLint errors                           |
| `npm run format`        | Format all files with Prettier                   |
| `npm run format:check`  | Check formatting (no changes)                    |
| `npm run type-check`    | TypeScript type check (no emit)                  |
| `npm run prepush`       | Run all checks before pushing                    |

---

## Project Structure

```
Tour_Management_System/
├── src/                        # Next.js frontend
│   ├── app/                    # App Router pages
│   │   ├── auth/               # Login, register, password reset
│   │   └── dashboard/          # Protected dashboard pages
│   ├── components/             # Reusable UI components
│   │   ├── ui/                 # Radix UI base components
│   │   └── features/           # Feature-specific components
│   ├── context/                # React context (AuthContext)
│   ├── lib/                    # API client and utilities
│   ├── config/                 # App configuration
│   ├── types/                  # Shared TypeScript types
│   └── middleware.ts           # Next.js auth middleware (cookie check)
├── server/                     # Express backend
│   ├── index.ts                # Server entry point
│   ├── db.ts                   # pg connection pool
│   ├── init-db.ts              # Schema creation script
│   ├── routes/                 # Route handlers
│   ├── middleware/             # Auth, validation, rate limiting, error handling
│   ├── models/                 # Database models
│   ├── controllers/            # Route controllers
│   ├── services/               # Business logic services
│   ├── utils/                  # Utility functions (geofencing, etc.)
│   ├── migrations/             # Database migration scripts
│   └── types/                  # Server-side type definitions
├── .github/workflows/          # GitHub Actions CI/CD
├── docker-compose.yml          # PostgreSQL container config
├── vitest.config.ts            # Vitest test config
├── eslint.config.js            # ESLint 9 flat config
└── package.json
```

---

## Authentication Flow

1. User registers or logs in via `POST /api/auth/login`
2. Server returns a JWT access token (short-lived) and a refresh token
3. The frontend stores the access token in both `localStorage` (for API calls) and a `token` cookie (for Next.js middleware)
4. The Next.js middleware (`src/middleware.ts`) checks the cookie on every request:
   - No token → redirect to `/auth/login`
   - Token present → allow access to `/dashboard/*`
5. To refresh, call `POST /api/auth/refresh` with the refresh token

---

## Running Tests

```bash
# Run all tests once
npm test

# Run tests with UI
npm run test:ui

# Generate coverage report
npm run test:coverage
```

Tests are written with Vitest. Test files live alongside source files (e.g., `server/routes/tours.test.ts`).

---

## Linting and Formatting

```bash
# Lint
npm run lint

# Auto-fix lint errors
npm run lint:fix

# Format all files
npm run format

# Check formatting (no changes)
npm run format:check

# Type check (no emit)
npm run type-check
```

Pre-commit hooks (via Husky + lint-staged) automatically run lint and format on staged files.

---

## Full Validation (Before Pushing)

Run all checks in one command:

```bash
npm run prepush
```

This executes: type-check → lint → format check → tests.

---

## Docker Reference

| Command                                                                   | What it does                       |
| ------------------------------------------------------------------------- | ---------------------------------- |
| `docker compose up -d`                                                    | Start PostgreSQL in background     |
| `docker compose down`                                                     | Stop and remove the container      |
| `docker compose down -v`                                                  | Stop container and delete all data |
| `docker compose logs -f`                                                  | Stream container logs              |
| `docker exec -it tms-postgres psql -U postgres -d tour_management_system` | Open a psql shell                  |

---

## Database Schema (16 tables)

`users`, `organizations`, `tours`, `tour_leaders`, `tour_participants`, `states`, `cities`, `places`, `routes`, `checkpoints`, `attendance`, `incidents`, `budgets`, `expenses`, `announcements`, `audit_logs`

Indexes are created on all foreign keys and commonly queried columns during `init-db.ts`.

---

## Database Migrations

### Overview

Database migrations are version-controlled schema changes that can be applied incrementally. Each migration file is located in `server/migrations/` and can be run or rolled back independently.

### Migration Architecture

All migration files follow this structure:

```typescript
import pool from "../db";

const up = `
  -- SQL statements to apply the migration
  ALTER TABLE ...
`;

const down = `
  -- SQL statements to rollback the migration
  ALTER TABLE ...
`;

async function runMigration() {
  console.log("Running migration: XXX_migration_name");
  try {
    await pool.query(up);
    console.log("✓ Migration completed successfully");
    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error("✗ Migration failed:", error);
    await pool.end();
    process.exit(1);
  }
}

async function rollbackMigration() {
  console.log("Rolling back migration: XXX_migration_name");
  try {
    await pool.query(down);
    console.log("✓ Rollback completed successfully");
    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error("✗ Rollback failed:", error);
    await pool.end();
    process.exit(1);
  }
}

const action = process.argv[2];
if (action === "down") {
  rollbackMigration();
} else {
  runMigration();
}

export { up, down };
```

### Available Migrations

#### 001_add_leader_assignment.ts

**Purpose**: Adds leader assignment functionality to tours

**Changes:**

- Adds `assigned_leader_id` column (foreign key to `users` table)
- Adds `leader_assigned_at` timestamp column
- Adds `participant_count` integer column (default: 0)
- Creates index on `assigned_leader_id` for performance

**Run:**

```bash
npx tsx server/migrations/001_add_leader_assignment.ts
```

**Rollback:**

```bash
npx tsx server/migrations/001_add_leader_assignment.ts down
```

**Database Changes:**

```sql
ALTER TABLE tours
  ADD COLUMN assigned_leader_id INT REFERENCES users(id) ON DELETE SET NULL,
  ADD COLUMN leader_assigned_at TIMESTAMP,
  ADD COLUMN participant_count INT DEFAULT 0;

CREATE INDEX idx_tours_leader ON tours(assigned_leader_id);
```

---

#### 002_add_sos_emergency_fields.ts

**Purpose**: Enhances incident tracking with SOS and health emergency categorization

**Changes:**

- Adds `incident_type` enum column (SOS, HEALTH, GENERAL)
- Adds `health_category` enum column (INJURY, ILLNESS, LOST, EMERGENCY, OTHER)
- Updates `status` constraint to include `IN_PROGRESS` state
- Adds `responded_by` foreign key (tracks who responded)
- Adds `response_time` timestamp
- Adds `resolution_notes` text field
- Creates indexes on `incident_type` and `status`

**Run:**

```bash
npx tsx server/migrations/002_add_sos_emergency_fields.ts
```

**Rollback:**

```bash
npx tsx server/migrations/002_add_sos_emergency_fields.ts down
```

**Database Changes:**

```sql
ALTER TABLE incidents
  ADD COLUMN incident_type VARCHAR(20) DEFAULT 'GENERAL'
    CHECK (incident_type IN ('SOS', 'HEALTH', 'GENERAL')),
  ADD COLUMN health_category VARCHAR(20)
    CHECK (health_category IN ('INJURY', 'ILLNESS', 'LOST', 'EMERGENCY', 'OTHER')),
  ADD COLUMN responded_by INT REFERENCES users(id) ON DELETE SET NULL,
  ADD COLUMN response_time TIMESTAMP,
  ADD COLUMN resolution_notes TEXT;

ALTER TABLE incidents DROP CONSTRAINT incidents_status_check;
ALTER TABLE incidents ADD CONSTRAINT incidents_status_check
  CHECK (status IN ('OPEN', 'IN_PROGRESS', 'RESOLVED'));

CREATE INDEX idx_incidents_type ON incidents(incident_type);
CREATE INDEX idx_incidents_status ON incidents(status);
```

---

#### 003_add_attendance_immutability_trigger.ts

**Purpose**: Enforces data integrity by preventing attendance record modifications after 24 hours

**Changes:**

- Creates `prevent_attendance_update_after_24h()` function
- Creates `prevent_attendance_delete_after_24h()` function
- Adds `attendance_immutability_trigger` (prevents updates after 24h)
- Adds `attendance_delete_immutability_trigger` (prevents deletions after 24h)

**Run:**

```bash
npx tsx server/migrations/003_add_attendance_immutability_trigger.ts
```

**Rollback:**

```bash
npx tsx server/migrations/003_add_attendance_immutability_trigger.ts down
```

**Database Changes:**

```sql
CREATE OR REPLACE FUNCTION prevent_attendance_update_after_24h()
RETURNS TRIGGER AS $$
BEGIN
  IF (CURRENT_TIMESTAMP - OLD.created_at) > INTERVAL '24 hours' THEN
    RAISE EXCEPTION 'Cannot modify attendance record after 24 hours';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER attendance_immutability_trigger
  BEFORE UPDATE ON attendance
  FOR EACH ROW
  EXECUTE FUNCTION prevent_attendance_update_after_24h();

-- Similar function and trigger for DELETE operations
```

**Why 24 hours?**

- Ensures audit trail integrity
- Prevents retroactive tampering with attendance data
- Allows reasonable window for legitimate corrections
- Compliance with data governance requirements

---

### Running Migrations

#### Method 1: Using Node.js/TypeScript (Recommended)

```bash
# Run migration
npx tsx server/migrations/001_add_leader_assignment.ts

# Rollback migration
npx tsx server/migrations/001_add_leader_assignment.ts down
```

#### Method 2: Using Docker directly

```bash
# Migration 001
docker exec tms-postgres psql -U postgres -d tour_management_system -c "
  ALTER TABLE tours ADD COLUMN IF NOT EXISTS assigned_leader_id INT REFERENCES users(id) ON DELETE SET NULL;
  ALTER TABLE tours ADD COLUMN IF NOT EXISTS leader_assigned_at TIMESTAMP;
  ALTER TABLE tours ADD COLUMN IF NOT EXISTS participant_count INT DEFAULT 0;
  CREATE INDEX IF NOT EXISTS idx_tours_leader ON tours(assigned_leader_id);
"
```

#### Method 3: Using psql CLI

```bash
# Enter PostgreSQL shell
docker exec -it tms-postgres psql -U postgres -d tour_management_system

# Inside psql, paste the SQL from the migration file
```

---

### Creating New Migrations

1. **Create a new migration file** in `server/migrations/`:

```bash
touch server/migrations/004_your_migration_name.ts
```

2. **Use the template structure** shown in the Migration Architecture section above.

3. **Best Practices**:
   - Use `IF NOT EXISTS` / `IF EXISTS` for idempotency
   - Always provide both `up` and `down` migrations
   - Test rollback before committing
   - Use transactions for complex migrations
   - Number migrations sequentially (001, 002, 003...)

---

### Verifying Migrations

After running migrations, verify the changes:

```bash
# Check table structure
docker exec tms-postgres psql -U postgres -d tour_management_system -c "\d tours"

# Check indexes
docker exec tms-postgres psql -U postgres -d tour_management_system -c "
  SELECT indexname, indexdef
  FROM pg_indexes
  WHERE tablename = 'tours';
"

# Check triggers
docker exec tms-postgres psql -U postgres -d tour_management_system -c "
  SELECT trigger_name, event_manipulation, event_object_table
  FROM information_schema.triggers
  WHERE trigger_schema = 'public';
"
```

---

## Troubleshooting

**Connection Refused Error:**

- Ensure Docker container is running: `docker compose ps`
- Check if PostgreSQL is bound to correct port (5433): `docker compose logs tms-postgres`
- Verify `.env` has `POSTGRES_PORT=5433`

**Migration Already Applied:**

- Migrations use `IF NOT EXISTS` / `IF EXISTS` clauses, so re-running is safe
- If unsure, check database schema first

**Trigger Not Firing:**

- Verify trigger exists: `SELECT * FROM information_schema.triggers WHERE trigger_name = 'attendance_immutability_trigger';`
- Check PostgreSQL logs: `docker compose logs tms-postgres`

**Rollback Fails:**

- May indicate dependent objects exist
- Manually inspect with `\d+ table_name` in psql
- Use `CASCADE` carefully if needed

---

## License

MIT
