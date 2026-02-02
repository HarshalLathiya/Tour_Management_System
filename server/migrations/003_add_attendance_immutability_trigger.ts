import pool from "../db";

const up = `
  -- Function to prevent updates to attendance records after 24 hours
  CREATE OR REPLACE FUNCTION prevent_attendance_update_after_24h()
  RETURNS TRIGGER AS $$
  BEGIN
    -- Allow updates within 24 hours of creation
    IF (CURRENT_TIMESTAMP - OLD.created_at) > INTERVAL '24 hours' THEN
      RAISE EXCEPTION 'Cannot modify attendance record after 24 hours. Record created at: %', OLD.created_at;
    END IF;

    RETURN NEW;
  END;
  $$ LANGUAGE plpgsql;

  -- Trigger to enforce immutability on UPDATE
  CREATE TRIGGER attendance_immutability_trigger
    BEFORE UPDATE ON attendance
    FOR EACH ROW
    EXECUTE FUNCTION prevent_attendance_update_after_24h();

  -- Function to prevent deletion of attendance records after 24 hours
  CREATE OR REPLACE FUNCTION prevent_attendance_delete_after_24h()
  RETURNS TRIGGER AS $$
  BEGIN
    -- Allow deletions within 24 hours of creation
    IF (CURRENT_TIMESTAMP - OLD.created_at) > INTERVAL '24 hours' THEN
      RAISE EXCEPTION 'Cannot delete attendance record after 24 hours. Record created at: %', OLD.created_at;
    END IF;

    RETURN OLD;
  END;
  $$ LANGUAGE plpgsql;

  -- Trigger to prevent deletion after 24 hours
  CREATE TRIGGER attendance_delete_immutability_trigger
    BEFORE DELETE ON attendance
    FOR EACH ROW
    EXECUTE FUNCTION prevent_attendance_delete_after_24h();

  -- Add comment for documentation
  COMMENT ON TRIGGER attendance_immutability_trigger ON attendance IS
    'Prevents updates to attendance records after 24 hours to ensure data integrity';

  COMMENT ON TRIGGER attendance_delete_immutability_trigger ON attendance IS
    'Prevents deletion of attendance records after 24 hours to ensure audit trail';
`;

const down = `
  -- Drop triggers
  DROP TRIGGER IF EXISTS attendance_immutability_trigger ON attendance;
  DROP TRIGGER IF EXISTS attendance_delete_immutability_trigger ON attendance;

  -- Drop functions
  DROP FUNCTION IF EXISTS prevent_attendance_update_after_24h();
  DROP FUNCTION IF EXISTS prevent_attendance_delete_after_24h();
`;

async function runMigration() {
  console.log("Running migration: 003_add_attendance_immutability_trigger");

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
  console.log("Rolling back migration: 003_add_attendance_immutability_trigger");

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
