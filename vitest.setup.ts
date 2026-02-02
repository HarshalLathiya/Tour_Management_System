import "@testing-library/jest-dom";

// Set required env vars for server tests
process.env.JWT_SECRET = process.env.JWT_SECRET || "test_secret_at_least_32_chars_long_for_jwt";
process.env.JWT_REFRESH_SECRET =
  process.env.JWT_REFRESH_SECRET || "test_refresh_secret_at_least_32_chars_long";
