import pool from "../db";

const up = `
  CREATE TABLE IF NOT EXISTS tour_users (
    id SERIAL PRIMARY KEY,
    tour_id INT NOT NULL REFERENCES tours(id) ON DELETE CASCADE,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(20) NOT NULL DEFAULT 'participant' CHECK (role IN ('participant', 'guide', 'leader')),
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(tour_id, user_id)
  );

  CREATE INDEX IF NOT EXISTS idx_tour_users_tour ON tour_users(tour_id);
  CREATE INDEX IF NOT EXISTS idx_tour_users_user ON tour_users(user_id);
`;

const down = `
  DROP INDEX IF EXISTS idx_tour_users_user;
  DROP INDEX IF EXISTS idx_tour_users_tour;
  DROP TABLE IF EXISTS tour_users;
`;

async function runMigration() {
  console.log("Running migration: 006_create_tour_users");

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
  console.log("Rolling back migration: 006_create_tour_users");

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
