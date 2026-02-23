import pool from "../db";

const up = `
  -- Fix: Add default value back to status column since migration 002 removed it
  ALTER TABLE incidents
  ALTER COLUMN status SET DEFAULT 'OPEN';

  -- Also add IN_PROGRESS as a valid status value if not already present
  ALTER TABLE incidents DROP CONSTRAINT IF EXISTS incidents_status_check;
  ALTER TABLE incidents
  ADD CONSTRAINT incidents_status_check
    CHECK (status IN ('OPEN', 'IN_PROGRESS', 'RESOLVED'));
`;

const down = `
  ALTER TABLE incidents ALTER COLUMN status DROP DEFAULT;
`;

async function runMigration() {
  console.log("Running migration: 004_fix_incidents_status_default");

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
  console.log("Rolling back migration: 004_fix_incidents_status_default");

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
