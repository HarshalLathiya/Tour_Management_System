import pool from "../db";

const up = `
  -- Drop trigger first, then function (correct order)
  DROP TRIGGER IF EXISTS attendance_delete_immutability_trigger ON attendance;
  DROP FUNCTION IF EXISTS prevent_attendance_delete_after_24h();
  DROP FUNCTION IF EXISTS set_tour_deletion_context();
  
  -- Create a function to set a session variable indicating tour deletion is in progress
  CREATE OR REPLACE FUNCTION set_tour_deletion_context()
  RETURNS void AS $$
  BEGIN
    PERFORM set_config('app.tour_deletion_in_progress', 'true', true);
  END;
  $$ LANGUAGE plpgsql;

  -- New function that allows deletion if the tour is being deleted (cascade)
  CREATE OR REPLACE FUNCTION prevent_attendance_delete_after_24h()
  RETURNS TRIGGER AS $$
  DECLARE
    is_tour_deletion BOOLEAN := false;
  BEGIN
    BEGIN
      is_tour_deletion := current_setting('app.tour_deletion_in_progress', true)::boolean;
    EXCEPTION WHEN OTHERS THEN
      is_tour_deletion := false;
    END;
    
    IF NOT is_tour_deletion AND (CURRENT_TIMESTAMP - OLD.created_at) > INTERVAL '24 hours' THEN
      RAISE EXCEPTION 'Cannot delete attendance record after 24 hours. Record created at: %', OLD.created_at;
    END IF;

    RETURN OLD;
  END;
  $$ LANGUAGE plpgsql;

  CREATE TRIGGER attendance_delete_immutability_trigger
    BEFORE DELETE ON attendance
    FOR EACH ROW
    EXECUTE FUNCTION prevent_attendance_delete_after_24h();

  COMMENT ON FUNCTION prevent_attendance_delete_after_24h() IS
    'Prevents deletion of attendance records after 24 hours, except when the tour itself is being deleted (cascade)';
`;

const down = `
  DROP TRIGGER IF EXISTS attendance_delete_immutability_trigger ON attendance;
  DROP FUNCTION IF EXISTS prevent_attendance_delete_after_24h();
  
  -- Recreate the original function
  CREATE OR REPLACE FUNCTION prevent_attendance_delete_after_24h()
  RETURNS TRIGGER AS $$
  BEGIN
    IF (CURRENT_TIMESTAMP - OLD.created_at) > INTERVAL '24 hours' THEN
      RAISE EXCEPTION 'Cannot delete attendance record after 24 hours. Record created at: %', OLD.created_at;
    END IF;
    RETURN OLD;
  END;
  $$ LANGUAGE plpgsql;

  CREATE TRIGGER attendance_delete_immutability_trigger
    BEFORE DELETE ON attendance
    FOR EACH ROW
    EXECUTE FUNCTION prevent_attendance_delete_after_24h();
`;

async function runMigration() {
  console.log("Running migration: 010_allow_cascade_attendance_delete");

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
  console.log("Rolling back migration: 010_allow_cascade_attendance_delete");

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
