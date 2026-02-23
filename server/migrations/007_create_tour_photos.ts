import pool from "../db";

const up = `
  CREATE TABLE IF NOT EXISTS tour_photos (
    id SERIAL PRIMARY KEY,
    tour_id INT NOT NULL REFERENCES tours(id) ON DELETE CASCADE,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    photo_url TEXT NOT NULL,
    caption TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );

  CREATE INDEX IF NOT EXISTS idx_tour_photos_tour ON tour_photos(tour_id);
  CREATE INDEX IF NOT EXISTS idx_tour_photos_user ON tour_photos(user_id);
`;

const down = `
  DROP INDEX IF EXISTS idx_tour_photos_user;
  DROP INDEX IF EXISTS idx_tour_photos_tour;
  DROP TABLE IF EXISTS tour_photos;
`;

async function runMigration() {
  console.log("Running migration: 007_create_tour_photos");

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
  console.log("Rolling back migration: 007_create_tour_photos");

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
