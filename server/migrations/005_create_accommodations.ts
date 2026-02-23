import pool from "../db";

const up = `
  CREATE TABLE IF NOT EXISTS accommodations (
    id SERIAL PRIMARY KEY,
    tour_id INT NOT NULL REFERENCES tours(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    address TEXT,
    check_in_date DATE,
    check_out_date DATE,
    contact_number VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS room_assignments (
    id SERIAL PRIMARY KEY,
    accommodation_id INT NOT NULL REFERENCES accommodations(id) ON DELETE CASCADE,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    room_number VARCHAR(50),
    room_type VARCHAR(50),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(accommodation_id, user_id)
  );

  CREATE INDEX IF NOT EXISTS idx_accommodations_tour ON accommodations(tour_id);
  CREATE INDEX IF NOT EXISTS idx_room_assignments_accommodation ON room_assignments(accommodation_id);
  CREATE INDEX IF NOT EXISTS idx_room_assignments_user ON room_assignments(user_id);
`;

const down = `
  DROP INDEX IF EXISTS idx_room_assignments_user;
  DROP INDEX IF EXISTS idx_room_assignments_accommodation;
  DROP INDEX IF EXISTS idx_accommodations_tour;
  DROP TABLE IF EXISTS room_assignments;
  DROP TABLE IF EXISTS accommodations;
`;

async function runMigration() {
  console.log("Running migration: 005_create_accommodations");

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
  console.log("Rolling back migration: 005_create_accommodations");

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
