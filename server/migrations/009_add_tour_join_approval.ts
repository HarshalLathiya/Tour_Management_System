import pool from "../db";

const migration = `
-- Add status column to tour_users for approval workflow
ALTER TABLE tour_users ADD COLUMN IF NOT EXISTS status VARCHAR(20) NOT NULL DEFAULT 'approved';

-- Add requested_at column to track when request was made
ALTER TABLE tour_users ADD COLUMN IF NOT EXISTS requested_at TIMESTAMP;

-- Add approved_by column to track who approved the request
ALTER TABLE tour_users ADD COLUMN IF NOT EXISTS approved_by INT REFERENCES users(id) ON DELETE SET NULL;

-- Add approved_at column to track when request was approved
ALTER TABLE tour_users ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP;

-- Add rejection_reason column
ALTER TABLE tour_users ADD COLUMN IF NOT EXISTS rejection_reason TEXT;

-- Add indexes for status filtering
CREATE INDEX IF NOT EXISTS idx_tour_users_status ON tour_users(status);
`;

const downMigration = `
DROP INDEX IF EXISTS idx_tour_users_status;
ALTER TABLE tour_users DROP COLUMN IF EXISTS rejection_reason;
ALTER TABLE tour_users DROP COLUMN IF EXISTS requested_at;
ALTER TABLE tour_users DROP COLUMN IF EXISTS status;
`;

async function runMigration() {
  try {
    console.log("Running migration 009_add_tour_join_approval...");
    await pool.query(migration);
    console.log("Migration completed successfully!");

    // Verify the column exists
    const result = await pool.query(`
      SELECT column_name FROM information_schema.columns 
      WHERE table_name = 'tour_users' AND column_name = 'status'
    `);

    if (result.rows.length > 0) {
      console.log("✓ status column added to tour_users table");
    } else {
      console.log("✗ Failed to add status column");
    }

    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error("Migration failed:", error);
    await pool.end();
    process.exit(1);
  }
}

runMigration();
