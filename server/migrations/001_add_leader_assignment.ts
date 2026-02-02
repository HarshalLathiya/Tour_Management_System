import pool from "../db";

/**
 * Migration: Add leader assignment fields to tours table
 * Date: 2025-02-01
 * Description: Adds assigned_leader_id and leader_assigned_at columns to support leader assignment feature
 */

const up = `
  -- Add assigned_leader_id column (foreign key to users table)
  ALTER TABLE tours
  ADD COLUMN IF NOT EXISTS assigned_leader_id INT REFERENCES users(id) ON DELETE SET NULL;

  -- Add leader_assigned_at timestamp column
  ALTER TABLE tours
  ADD COLUMN IF NOT EXISTS leader_assigned_at TIMESTAMP;

  -- Add participant_count column for budget calculations
  ALTER TABLE tours
  ADD COLUMN IF NOT EXISTS participant_count INT DEFAULT 0;

  -- Create index for leader assignment queries
  CREATE INDEX IF NOT EXISTS idx_tours_leader ON tours(assigned_leader_id);

  -- Create index for participant count
  CREATE INDEX IF NOT EXISTS idx_tours_participant_count ON tours(participant_count);
`;

const down = `
  -- Remove indexes
  DROP INDEX IF EXISTS idx_tours_participant_count;
  DROP INDEX IF EXISTS idx_tours_leader;

  -- Remove columns
  ALTER TABLE tours DROP COLUMN IF EXISTS participant_count;
  ALTER TABLE tours DROP COLUMN IF EXISTS leader_assigned_at;
  ALTER TABLE tours DROP COLUMN IF EXISTS assigned_leader_id;
`;

async function runMigration() {
  console.log("Running migration: 001_add_leader_assignment");

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
  console.log("Rolling back migration: 001_add_leader_assignment");

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

// Run migration if executed directly
const action = process.argv[2];

if (action === "down") {
  rollbackMigration();
} else {
  runMigration();
}

export { up, down };
