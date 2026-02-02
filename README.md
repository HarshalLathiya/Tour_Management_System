# TourSync — Global Tour Management System

A full-stack tour management platform for educational institutions and organizations. Handles attendance tracking, safety coordination, budget management, itinerary planning, and team communication.

---

## Tech Stack

| Layer         | Technology                                                       |
| ------------- | ---------------------------------------------------------------- |
| Frontend      | Next.js 15 (App Router), TypeScript, Tailwind CSS, Framer Motion |
| Backend       | Express.js (TypeScript), running on port 5000                    |
| Database      | PostgreSQL 17 via Docker                                         |
| Auth          | Custom JWT (access + refresh tokens)                             |
| UI Components | Radix UI, Lucide React, Sonner                                   |
| Testing       | Vitest, React Testing Library                                    |
| Linting       | ESLint 9 (flat config), Prettier, Husky + lint-staged            |

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

### 3. Start the PostgreSQL Database

The database runs inside a Docker container. No local PostgreSQL installation is needed.

```bash
docker compose up -d
```

This starts a PostgreSQL 17 container with:

- **Host**: `localhost`
- **Port**: `5432`
- **User**: `postgres`
- **Password**: `postgres`
- **Database**: `tour_management_system`

Data is persisted in a Docker named volume (`tms-pgdata`), so it survives container restarts.

To verify the container is healthy:

```bash
docker compose ps
```

You should see `tms-postgres` with status `healthy`.

### 4. Initialize the Database Schema

This creates all 16 tables and 14 indexes:

```bash
npx tsx server/init-db.ts
```

### 5. Run Database Migrations

After initializing the schema, run migrations to add additional features:

```bash
# Run all pending migrations
npm run migrate

# Or run migrations individually
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

### 6. Configure Environment Variables

Copy the example file and fill in your values:

```bash
cp .env.example .env
```

The `.env` file should contain:

```env
# PostgreSQL (Docker defaults — change in production)
POSTGRES_HOST=localhost
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=tour_management_system
POSTGRES_PORT=5432

# JWT secrets — use long random strings in production
JWT_SECRET=your_jwt_secret_at_least_32_characters
JWT_REFRESH_SECRET=your_refresh_secret_at_least_32_characters
```

> **Security**: Never commit `.env` to version control. It is listed in `.gitignore`. Use `.env.example` as a template.

### 7. Start the Backend Server

```bash
npx tsx server/index.ts
```

The Express API starts on `http://localhost:5000`. Available routes:

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

## Project Structure

```
Tour_Management_System/
├── src/                        # Next.js frontend
│   ├── app/                    # App Router pages
│   │   ├── auth/               # Login, register, password reset
│   │   └── dashboard/          # Protected dashboard pages
│   ├── components/             # Reusable UI components
│   ├── lib/                    # Utility functions
│   ├── types/                  # Shared TypeScript types
│   └── middleware.ts           # Next.js auth middleware (cookie check)
├── server/                     # Express backend
│   ├── index.ts                # Server entry point
│   ├── db.ts                   # pg connection pool
│   ├── init-db.ts              # Schema creation script
│   ├── routes/                 # Route handlers (auth, tours, locations)
│   ├── middleware/             # Auth, validation, error handling
│   └── types/                  # Server-side type definitions
├── docker-compose.yml          # PostgreSQL container config
├── .env.example                # Environment variable template
├── eslint.config.js            # ESLint 9 flat config
├── vitest.config.ts            # Vitest test config
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

# Run tests in watch mode
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

#### Method 1: Using Docker (Recommended for CI/CD)

If your PostgreSQL is in Docker and you encounter connection issues from the host:

```bash
# Run migration directly in Docker container
docker exec tms-postgres psql -U postgres -d tour_management_system -c "$(cat server/migrations/001_add_leader_assignment.ts | grep -A 100 'const up =')"
```

Or use the pre-formatted commands:

```bash
# Migration 001
docker exec tms-postgres psql -U postgres -d tour_management_system -c "
  ALTER TABLE tours ADD COLUMN IF NOT EXISTS assigned_leader_id INT REFERENCES users(id) ON DELETE SET NULL;
  ALTER TABLE tours ADD COLUMN IF NOT EXISTS leader_assigned_at TIMESTAMP;
  ALTER TABLE tours ADD COLUMN IF NOT EXISTS participant_count INT DEFAULT 0;
  CREATE INDEX IF NOT EXISTS idx_tours_leader ON tours(assigned_leader_id);
"

# Migration 002
docker exec tms-postgres psql -U postgres -d tour_management_system -c "
  ALTER TABLE incidents
  ADD COLUMN IF NOT EXISTS incident_type VARCHAR(20) DEFAULT 'GENERAL'
    CHECK (incident_type IN ('SOS', 'HEALTH', 'GENERAL'));
  ALTER TABLE incidents
  ADD COLUMN IF NOT EXISTS health_category VARCHAR(20)
    CHECK (health_category IN ('INJURY', 'ILLNESS', 'LOST', 'EMERGENCY', 'OTHER'));
  ALTER TABLE incidents DROP CONSTRAINT IF EXISTS incidents_status_check;
  ALTER TABLE incidents ADD CONSTRAINT incidents_status_check
    CHECK (status IN ('OPEN', 'IN_PROGRESS', 'RESOLVED'));
  ALTER TABLE incidents ADD COLUMN IF NOT EXISTS responded_by INT REFERENCES users(id) ON DELETE SET NULL;
  ALTER TABLE incidents ADD COLUMN IF NOT EXISTS response_time TIMESTAMP;
  ALTER TABLE incidents ADD COLUMN IF NOT EXISTS resolution_notes TEXT;
  CREATE INDEX IF NOT EXISTS idx_incidents_type ON incidents(incident_type);
  CREATE INDEX IF NOT EXISTS idx_incidents_status ON incidents(status);
"

# Migration 003 (Attendance Triggers)
docker exec tms-postgres psql -U postgres -d tour_management_system -c "
  CREATE OR REPLACE FUNCTION prevent_attendance_update_after_24h()
  RETURNS TRIGGER AS \$\$
  BEGIN
    IF (CURRENT_TIMESTAMP - OLD.created_at) > INTERVAL '24 hours' THEN
      RAISE EXCEPTION 'Cannot modify attendance record after 24 hours. Record created at: %', OLD.created_at;
    END IF;
    RETURN NEW;
  END;
  \$\$ LANGUAGE plpgsql;

  CREATE TRIGGER attendance_immutability_trigger
    BEFORE UPDATE ON attendance
    FOR EACH ROW
    EXECUTE FUNCTION prevent_attendance_update_after_24h();

  CREATE OR REPLACE FUNCTION prevent_attendance_delete_after_24h()
  RETURNS TRIGGER AS \$\$
  BEGIN
    IF (CURRENT_TIMESTAMP - OLD.created_at) > INTERVAL '24 hours' THEN
      RAISE EXCEPTION 'Cannot delete attendance record after 24 hours. Record created at: %', OLD.created_at;
    END IF;
    RETURN OLD;
  END;
  \$\$ LANGUAGE plpgsql;

  CREATE TRIGGER attendance_delete_immutability_trigger
    BEFORE DELETE ON attendance
    FOR EACH ROW
    EXECUTE FUNCTION prevent_attendance_delete_after_24h();
"
```

#### Method 2: Using Node.js/TypeScript

If you have direct PostgreSQL access from your host:

```bash
# Run migration
npx tsx server/migrations/001_add_leader_assignment.ts

# Rollback migration
npx tsx server/migrations/001_add_leader_assignment.ts down
```

#### Method 3: Using psql CLI

```bash
# Enter PostgreSQL shell
docker exec -it tms-postgres psql -U postgres -d tour_management_system

# Inside psql, paste the SQL from the migration file
# Or execute from file:
\i /path/to/migration.sql
```

---

### Creating New Migrations

1. **Create a new migration file** in `server/migrations/`:

```bash
touch server/migrations/004_your_migration_name.ts
```

2. **Use the template structure**:

```typescript
import pool from "../db";

const up = `
  -- Your SQL statements here
  ALTER TABLE your_table ADD COLUMN new_column VARCHAR(255);
`;

const down = `
  -- Reverse the changes
  ALTER TABLE your_table DROP COLUMN new_column;
`;

async function runMigration() {
  console.log("Running migration: 004_your_migration_name");
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
  console.log("Rolling back migration: 004_your_migration_name");
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

3. **Best Practices**:
   - Use `IF NOT EXISTS` / `IF EXISTS` for idempotency
   - Always provide both `up` and `down` migrations
   - Test rollback before committing
   - Use transactions for complex migrations
   - Document the purpose and changes in comments
   - Number migrations sequentially (001, 002, 003...)

---

### Verifying Migrations

After running migrations, verify the changes:

```bash
# Check table structure
docker exec tms-postgres psql -U postgres -d tour_management_system -c "\d tours"

# Check for specific columns
docker exec tms-postgres psql -U postgres -d tour_management_system -c "
  SELECT column_name, data_type, is_nullable
  FROM information_schema.columns
  WHERE table_name = 'tours' AND column_name = 'assigned_leader_id';
"

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

### Troubleshooting

**Connection Refused Error:**

- Ensure Docker container is running: `docker compose ps`
- Check if PostgreSQL is bound to correct port: `docker compose logs tms-postgres`
- Verify `.env` has correct `POSTGRES_HOST` (use `localhost` for local Docker)

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
