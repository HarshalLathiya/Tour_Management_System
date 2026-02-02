import { describe, it, expect, vi, beforeEach, afterAll } from "vitest";
import request from "supertest";

// Hoist mock functions before vi.mock calls
const { mockQuery } = vi.hoisted(() => ({
  mockQuery: vi.fn(),
}));

// Mock pg pool before imports
vi.mock("../db", () => ({
  default: { query: mockQuery },
}));

// Mock bcryptjs
vi.mock("bcryptjs", () => ({
  __esModule: true,
  default: {
    hash: vi.fn().mockResolvedValue("$2a$10$hashedpasswordmockvalue"),
    compare: vi.fn(),
  },
}));

// Mock jsonwebtoken
vi.mock("jsonwebtoken", () => ({
  __esModule: true,
  default: {
    sign: vi.fn((payload, secret) => `mock_token_${payload.id}`),
    verify: vi.fn(),
  },
}));

import app from "../index";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

describe("Auth API Routes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterAll(() => {
    vi.restoreAllMocks();
  });

  describe("POST /api/auth/register", () => {
    it("should register a new user successfully", async () => {
      // Mock: no existing user
      mockQuery.mockResolvedValueOnce({ rows: [] });
      // Mock: insert user returns id
      mockQuery.mockResolvedValueOnce({ rows: [{ id: 1 }] });

      const response = await request(app).post("/api/auth/register").send({
        email: "newuser@example.com",
        password: "password123",
        name: "New User",
        role: "tourist",
      });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty("message", "User registered successfully");
      expect(response.body).toHaveProperty("token");
      expect(response.body.user).toMatchObject({
        id: 1,
        email: "newuser@example.com",
        name: "New User",
        role: "tourist",
      });

      // Verify password was hashed
      expect(bcrypt.hash).toHaveBeenCalledWith("password123", 10);

      // Verify token was signed
      expect(jwt.sign).toHaveBeenCalledWith(
        { id: 1, email: "newuser@example.com", role: "tourist" },
        process.env.JWT_SECRET,
        { expiresIn: "24h" }
      );
    });

    it("should return 409 if user already exists", async () => {
      // Mock: existing user found
      mockQuery.mockResolvedValueOnce({ rows: [{ id: 42 }] });

      const response = await request(app).post("/api/auth/register").send({
        email: "existing@example.com",
        password: "password123",
        name: "Existing User",
      });

      expect(response.status).toBe(409);
      expect(response.body).toHaveProperty("error", "User already exists");

      // Should not attempt to hash password or create user
      expect(bcrypt.hash).not.toHaveBeenCalled();
    });

    it("should return 400 for invalid email", async () => {
      const response = await request(app).post("/api/auth/register").send({
        email: "not-an-email",
        password: "password123",
        name: "Test User",
      });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("error", "Validation failed");
      expect(response.body.details).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            field: "email",
            message: expect.stringContaining("email"),
          }),
        ])
      );
    });

    it("should return 400 for short password", async () => {
      const response = await request(app).post("/api/auth/register").send({
        email: "test@example.com",
        password: "short",
        name: "Test User",
      });

      expect(response.status).toBe(400);
      expect(response.body.details).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            field: "password",
            message: expect.stringContaining("8 characters"),
          }),
        ])
      );
    });

    it("should return 400 for missing required fields", async () => {
      const response = await request(app).post("/api/auth/register").send({});

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("error", "Validation failed");
    });

    it("should default to tourist role if not specified", async () => {
      mockQuery.mockResolvedValueOnce({ rows: [] });
      mockQuery.mockResolvedValueOnce({ rows: [{ id: 5 }] });

      const response = await request(app).post("/api/auth/register").send({
        email: "tourist@example.com",
        password: "password123",
        name: "Tourist User",
      });

      expect(response.status).toBe(201);
      expect(response.body.user.role).toBe("tourist");
    });
  });

  describe("POST /api/auth/login", () => {
    it("should login with valid credentials", async () => {
      const mockUser = {
        id: 10,
        email: "user@example.com",
        password: "$2a$10$hashedpassword",
        name: "Test User",
        role: "admin",
      };

      // Mock: user found
      mockQuery.mockResolvedValueOnce({ rows: [mockUser] });
      // Mock: password matches
      (bcrypt.compare as ReturnType<typeof vi.fn>).mockResolvedValueOnce(true);

      const response = await request(app).post("/api/auth/login").send({
        email: "user@example.com",
        password: "correctpassword",
      });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("message", "Login successful");
      expect(response.body).toHaveProperty("token");
      expect(response.body).toHaveProperty("refreshToken");
      expect(response.body.user).toMatchObject({
        id: 10,
        email: "user@example.com",
        name: "Test User",
        role: "admin",
      });

      expect(bcrypt.compare).toHaveBeenCalledWith("correctpassword", mockUser.password);
      expect(jwt.sign).toHaveBeenCalledTimes(2); // access + refresh tokens
    });

    it("should return 401 for non-existent user", async () => {
      // Mock: no user found
      mockQuery.mockResolvedValueOnce({ rows: [] });

      const response = await request(app).post("/api/auth/login").send({
        email: "nonexistent@example.com",
        password: "anypassword",
      });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty("error", "Invalid credentials");
      expect(bcrypt.compare).not.toHaveBeenCalled();
    });

    it("should return 401 for wrong password", async () => {
      const mockUser = {
        id: 15,
        email: "user@example.com",
        password: "$2a$10$hashedpassword",
        name: "Test User",
        role: "guide",
      };

      mockQuery.mockResolvedValueOnce({ rows: [mockUser] });
      (bcrypt.compare as ReturnType<typeof vi.fn>).mockResolvedValueOnce(false);

      const response = await request(app).post("/api/auth/login").send({
        email: "user@example.com",
        password: "wrongpassword",
      });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty("error", "Invalid credentials");
    });

    it("should return 400 for invalid email format", async () => {
      const response = await request(app).post("/api/auth/login").send({
        email: "not-an-email",
        password: "anypassword",
      });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("error", "Validation failed");
    });
  });

  describe("POST /api/auth/refresh", () => {
    it("should refresh token with valid refresh token", async () => {
      const mockUser = {
        id: 20,
        email: "user@example.com",
        name: "Test User",
        role: "tourist",
      };

      // Mock: JWT verify succeeds
      (jwt.verify as ReturnType<typeof vi.fn>).mockReturnValueOnce({
        id: 20,
        email: "user@example.com",
      });

      // Mock: user found in DB
      mockQuery.mockResolvedValueOnce({ rows: [mockUser] });

      const response = await request(app).post("/api/auth/refresh").send({
        refreshToken: "valid_refresh_token_mock",
      });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("token");
      expect(response.body.user).toMatchObject({
        id: 20,
        email: "user@example.com",
        name: "Test User",
        role: "tourist",
      });

      expect(jwt.verify).toHaveBeenCalledWith(
        "valid_refresh_token_mock",
        process.env.JWT_REFRESH_SECRET
      );
    });

    it("should return 403 for invalid refresh token", async () => {
      // Mock: JWT verify throws error
      (jwt.verify as ReturnType<typeof vi.fn>).mockImplementationOnce(() => {
        throw new Error("Invalid token");
      });

      const response = await request(app).post("/api/auth/refresh").send({
        refreshToken: "invalid_token",
      });

      expect(response.status).toBe(403);
      expect(response.body).toHaveProperty("error", "Invalid refresh token");
    });

    it("should return 404 if user no longer exists", async () => {
      (jwt.verify as ReturnType<typeof vi.fn>).mockReturnValueOnce({
        id: 999,
        email: "deleted@example.com",
      });

      // Mock: user not found
      mockQuery.mockResolvedValueOnce({ rows: [] });

      const response = await request(app).post("/api/auth/refresh").send({
        refreshToken: "valid_token_but_user_deleted",
      });

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty("error", "User not found");
    });
  });

  describe("GET /api/auth/profile", () => {
    it("should return user profile with valid token", async () => {
      const mockUser = {
        id: 30,
        email: "profile@example.com",
        name: "Profile User",
        role: "guide",
        created_at: "2025-01-01T00:00:00Z",
      };

      // Mock: JWT verify succeeds
      (jwt.verify as ReturnType<typeof vi.fn>).mockReturnValueOnce({
        id: 30,
        email: "profile@example.com",
        role: "guide",
      });

      // Mock: user found in DB
      mockQuery.mockResolvedValueOnce({ rows: [mockUser] });

      const response = await request(app)
        .get("/api/auth/profile")
        .set("Authorization", "Bearer valid_token");

      expect(response.status).toBe(200);
      expect(response.body.user).toMatchObject({
        id: 30,
        email: "profile@example.com",
        name: "Profile User",
        role: "guide",
      });
    });

    it("should return 401 without authorization header", async () => {
      const response = await request(app).get("/api/auth/profile");

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty("error");
    });

    it("should return 403 with invalid token", async () => {
      (jwt.verify as ReturnType<typeof vi.fn>).mockImplementationOnce(() => {
        throw new Error("Invalid token");
      });

      const response = await request(app)
        .get("/api/auth/profile")
        .set("Authorization", "Bearer invalid_token");

      expect(response.status).toBe(403);
      expect(response.body).toHaveProperty("error");
    });

    it("should return 404 if user not found", async () => {
      (jwt.verify as ReturnType<typeof vi.fn>).mockReturnValueOnce({
        id: 888,
        email: "ghost@example.com",
        role: "tourist",
      });

      // Mock: user not found in DB
      mockQuery.mockResolvedValueOnce({ rows: [] });

      const response = await request(app)
        .get("/api/auth/profile")
        .set("Authorization", "Bearer valid_token");

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty("error", "User not found");
    });
  });
});
