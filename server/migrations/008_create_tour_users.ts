import pool from "../db";

const migration = `
-- Create tour_users table for tour participation
CREATE TABLE IF NOT EXISTS tour_users (
  id SERIAL PRIMARY KEY,
  tour_id INT NOT NULL REFERENCES tours(id) ON DELETE CASCADE,
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role VARCHAR(20) NOT NULL DEFAULT 'participant',
  joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT unique_tour_user UNIQUE (tour_id, user_id)
);

-- Add indexes for tour_users
CREATE INDEX IF NOT EXISTS idx_tour_users_tour ON tour_users(tour_id);
CREATE INDEX IF NOT EXISTS idx_tour_users_user ON tour_users(user_id);

-- Add participant_count column to tours if not exists
ALTER TABLE tours ADD COLUMN IF NOT EXISTS participant_count INT DEFAULT 0;
ALTER TABLE tours ADD COLUMN IF NOT EXISTS assigned_leader_id INT REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE tours ADD COLUMN IF NOT EXISTS leader_assigned_at TIMESTAMP;

-- Create index for assigned_leader_id
CREATE INDEX IF NOT EXISTS idx_tours_leader ON tours(assigned_leader_id);
`;

async function runMigration() {
  try {
    console.log("Running migration 008_create_tour_users...");
    await pool.query(migration);
    console.log("Migration completed successfully!");

    // Verify table exists
    const result = await pool.query(`
      SELECT table_name FROM information_schema.tables 
      WHERE table_name = 'tour_users' AND table_schema = 'public'
    `);

    if (result.rows.length > 0) {
      console.log("✓ tour_users table created successfully");
    } else {
      console.log("✗ Failed to create tour_users table");
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
