import pool from "../db";

const up = `
  -- Add incident type and health category to incidents table
  ALTER TABLE incidents
  ADD COLUMN IF NOT EXISTS incident_type VARCHAR(20) DEFAULT 'GENERAL'
    CHECK (incident_type IN ('SOS', 'HEALTH', 'GENERAL'));

  ALTER TABLE incidents
  ADD COLUMN IF NOT EXISTS health_category VARCHAR(20)
    CHECK (health_category IN ('INJURY', 'ILLNESS', 'LOST', 'EMERGENCY', 'OTHER'));

  -- Add IN_PROGRESS to status enum
  ALTER TABLE incidents DROP CONSTRAINT IF EXISTS incidents_status_check;
  ALTER TABLE incidents
  ADD CONSTRAINT incidents_status_check
    CHECK (status IN ('OPEN', 'IN_PROGRESS', 'RESOLVED'));

  -- Add response tracking fields
  ALTER TABLE incidents
  ADD COLUMN IF NOT EXISTS responded_by INT REFERENCES users(id) ON DELETE SET NULL;

  ALTER TABLE incidents
  ADD COLUMN IF NOT EXISTS response_time TIMESTAMP;

  ALTER TABLE incidents
  ADD COLUMN IF NOT EXISTS resolution_notes TEXT;

  -- Add indexes
  CREATE INDEX IF NOT EXISTS idx_incidents_type ON incidents(incident_type);
  CREATE INDEX IF NOT EXISTS idx_incidents_status ON incidents(status);
`;

const down = `
  DROP INDEX IF EXISTS idx_incidents_status;
  DROP INDEX IF EXISTS idx_incidents_type;

  ALTER TABLE incidents DROP COLUMN IF EXISTS resolution_notes;
  ALTER TABLE incidents DROP COLUMN IF EXISTS response_time;
  ALTER TABLE incidents DROP COLUMN IF EXISTS responded_by;

  ALTER TABLE incidents DROP CONSTRAINT IF EXISTS incidents_status_check;
  ALTER TABLE incidents
  ADD CONSTRAINT incidents_status_check CHECK (status IN ('OPEN', 'RESOLVED'));

  ALTER TABLE incidents DROP COLUMN IF EXISTS health_category;
  ALTER TABLE incidents DROP COLUMN IF EXISTS incident_type;
`;

async function runMigration() {
  console.log("Running migration: 002_add_sos_emergency_fields");

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
  console.log("Rolling back migration: 002_add_sos_emergency_fields");

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
