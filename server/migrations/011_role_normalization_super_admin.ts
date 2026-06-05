import pool from "../db";

/**
 * Migration 011: Role normalization for Phase-1 Super Admin
 * - Global roles (users.role):
 *    guide -> leader
 *    tourist -> participant
 *    add super_admin
 * - Tour-scoped roles (tour_users.role):
 *    guide -> leader
 * - Update CHECK constraints accordingly.
 */

const up = `
  -- 1) Phase-1 compatibility mode:
  -- Do NOT rewrite legacy role strings yet (tests/seed still use guide/tourist).

  -- 2) Update users.role CHECK constraint to accept both legacy + normalized roles.
  DO $$
  BEGIN
    IF EXISTS (
      SELECT 1 FROM pg_constraint
      WHERE conname = 'users_role_check'
    ) THEN
      ALTER TABLE users DROP CONSTRAINT users_role_check;
    END IF;
  END $$;

  ALTER TABLE users
  ADD CONSTRAINT users_role_check CHECK (role IN ('super_admin', 'admin', 'leader', 'participant', 'guide', 'tourist'));

  -- 3) Update tour_users.role CHECK constraint to accept both legacy + normalized roles.
  DO $$
  BEGIN
    IF EXISTS (
      SELECT 1 FROM pg_constraint
      WHERE conname = 'tour_users_role_check'
    ) THEN
      ALTER TABLE tour_users DROP CONSTRAINT tour_users_role_check;
    END IF;
  END $$;

  ALTER TABLE tour_users
  ADD CONSTRAINT tour_users_role_check CHECK (role IN ('participant', 'leader', 'guide'));
`;

const down = `
  -- Rollback restores legacy role names (best-effort; not guaranteed to recover deleted rows)
  UPDATE users SET role = 'guide' WHERE role = 'leader';
  UPDATE users SET role = 'tourist' WHERE role = 'participant';

  UPDATE tour_users SET role = 'guide' WHERE role = 'leader';

  -- Drop and recreate constraints with legacy sets
  DO $$
  BEGIN
    IF EXISTS (
      SELECT 1 FROM pg_constraint
      WHERE conname = 'users_role_check'
    ) THEN
      ALTER TABLE users DROP CONSTRAINT users_role_check;
    END IF;
  END $$;

  ALTER TABLE users
  ADD CONSTRAINT users_role_check CHECK (role IN ('admin', 'guide', 'tourist'));

  DO $$
  BEGIN
    IF EXISTS (
      SELECT 1 FROM pg_constraint
      WHERE conname = 'tour_users_role_check'
    ) THEN
      ALTER TABLE tour_users DROP CONSTRAINT tour_users_role_check;
    END IF;
  END $$;

  ALTER TABLE tour_users
  ADD CONSTRAINT tour_users_role_check CHECK (role IN ('participant', 'guide', 'leader'));
`;

async function runMigration() {
  try {
    console.log("Running migration 011_role_normalization_super_admin...");
    await pool.query(up);
    console.log("Migration completed successfully!");
    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error("Migration failed:", error);
    await pool.end();
    process.exit(1);
  }
}

async function rollbackMigration() {
  try {
    console.log("Rolling back migration 011_role_normalization_super_admin...");
    await pool.query(down);
    console.log("Rollback completed successfully!");
    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error("Rollback failed:", error);
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
