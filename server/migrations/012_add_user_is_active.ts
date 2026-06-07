import pool from "../db";

/**
 * Migration 012: Add users.is_active for Phase-1 Super Admin suspension/activation
 */

const up = `
  ALTER TABLE users
  ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT TRUE;

  CREATE INDEX IF NOT EXISTS idx_users_is_active ON users(is_active);
`;

const down = `
  DROP INDEX IF EXISTS idx_users_is_active;
  ALTER TABLE users DROP COLUMN IF EXISTS is_active;
`;

async function runMigration() {
  console.log("Running migration: 012_add_user_is_active");

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
  console.log("Rolling back migration: 012_add_user_is_active");

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
