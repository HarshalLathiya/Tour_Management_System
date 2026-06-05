const TEST_ACCESS_SECRET = "test_secret_at_least_32_chars_long_for_jwt";
const TEST_REFRESH_SECRET = "test_refresh_secret_at_least_32_chars_long";

// Deterministic secrets for test runner.
// We intentionally do not rely on NODE_ENV / dotenv state.
const isVitestRuntime = (): boolean => {
  return process.env.VITEST !== undefined || process.env.VITEST === "true";
};

export const getJwtSecret = (): string => {
  // Always return deterministic secret under vitest.
  if (isVitestRuntime()) return TEST_ACCESS_SECRET;

  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET environment variable is required");
  }
  return process.env.JWT_SECRET;
};

export const getJwtRefreshSecret = (): string => {
  // Always return deterministic refresh secret under vitest.
  if (isVitestRuntime()) return TEST_REFRESH_SECRET;

  if (!process.env.JWT_REFRESH_SECRET) {
    throw new Error("JWT_REFRESH_SECRET environment variable is required");
  }
  return process.env.JWT_REFRESH_SECRET;
};
