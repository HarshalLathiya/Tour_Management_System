import { describe, it, expect, vi, beforeEach, afterAll } from "vitest";
import request from "supertest";

const { mockQuery } = vi.hoisted(() => ({
  mockQuery: vi.fn(),
}));

vi.mock("../db", () => ({
  default: { query: mockQuery },
}));

vi.mock("jsonwebtoken", () => ({
  __esModule: true,
  default: {
    verify: vi.fn(),
  },
}));

import app from "../index";
import jwt from "jsonwebtoken";

describe("Tours API Routes", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Safe default: prevents undefined return values from causing crashes
    // when the controller triggers more DB queries than the tests explicitly mock.
    mockQuery.mockResolvedValue({ rows: [] });
  });

  afterAll(() => {
    vi.restoreAllMocks();
  });

  // Mock user for authenticated requests
  const mockAdminUser = {
    id: 1,
    email: "admin@example.com",
    role: "admin",
    name: "Admin User",
  };

  const mockGuideUser = {
    id: 2,
    email: "guide@example.com",
    role: "guide",
    name: "Guide User",
  };

  const mockTouristUser = {
    id: 3,
    email: "tourist@example.com",
    role: "tourist",
    name: "Tourist User",
  };

  describe("POST /api/tours/:id/join - Join Tour", () => {
    it("should allow tourist to join a tour", async () => {
      // Mock: JWT verify returns tourist user
      (jwt.verify as ReturnType<typeof vi.fn>).mockReturnValueOnce(mockTouristUser);

      // Mock: Tour exists (TourController checks tour.status and optionally checksDateConflict)
      mockQuery.mockResolvedValueOnce({
        rows: [
          {
            id: 1,
            name: "Test Tour",
            status: "planned",
            start_date: null,
            end_date: null,
          },
        ],
      });

      // Mock: User not already participating (TourModel.isParticipant -> SELECT ...; returns rows length)
      mockQuery.mockResolvedValueOnce({ rows: [] });

      // Mock: User requests (no existing request)
      mockQuery.mockResolvedValueOnce({ rows: [] });

      // Mock: Create join request (TourModel.requestJoinTour -> RETURNING ... status)
      mockQuery.mockResolvedValueOnce({
        rows: [
          {
            id: 1,
            tour_id: 1,
            user_id: 3,
            status: "pending",
          },
        ],
      });

      const response = await request(app)
        .post("/api/tours/1/join")
        .set("Authorization", "Bearer valid_token");

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty("success", true);
      expect(response.body).toHaveProperty(
        "message",
        "Join request submitted successfully. Waiting for admin approval."
      );
    });

    it("should return 404 if tour not found", async () => {
      (jwt.verify as ReturnType<typeof vi.fn>).mockReturnValueOnce(mockTouristUser);
      mockQuery.mockResolvedValueOnce({ rows: [] });

      const response = await request(app)
        .post("/api/tours/999/join")
        .set("Authorization", "Bearer valid_token");

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty("error", "Tour not found");
    });

    it("should return 400 if already participating", async () => {
      (jwt.verify as ReturnType<typeof vi.fn>).mockReturnValueOnce(mockTouristUser);
      mockQuery.mockResolvedValueOnce({
        rows: [{ id: 1, name: "Test Tour" }],
      });
      mockQuery.mockResolvedValueOnce({
        rows: [{ id: 1, tour_id: 1, user_id: 3 }],
      });

      const response = await request(app)
        .post("/api/tours/1/join")
        .set("Authorization", "Bearer valid_token");

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("error", "Already participating in this tour");
    });

    it("should return 401 without authorization", async () => {
      const response = await request(app).post("/api/tours/1/join");

      expect(response.status).toBe(401);
    });
  });

  describe("DELETE /api/tours/:id/leave - Leave Tour", () => {
    it("should allow tourist to leave a tour", async () => {
      (jwt.verify as ReturnType<typeof vi.fn>).mockReturnValueOnce(mockTouristUser);

      // Mock: Tour exists
      mockQuery.mockResolvedValueOnce({
        rows: [{ id: 1, name: "Test Tour" }],
      });

      // Mock: User is participating
      mockQuery.mockResolvedValueOnce({
        rows: [{ id: 1, tour_id: 1, user_id: 3 }],
      });

      // Mock: Delete participation (TourModel.leaveTour expects rowCount)
      mockQuery.mockResolvedValueOnce({ rows: [{ id: 1 }], rowCount: 1 });

      const response = await request(app)
        .delete("/api/tours/1/leave")
        .set("Authorization", "Bearer valid_token");

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("success", true);
      expect(response.body).toHaveProperty("message", "Successfully left the tour");
    });

    it("should return 404 if not participating", async () => {
      (jwt.verify as ReturnType<typeof vi.fn>).mockReturnValueOnce(mockTouristUser);
      mockQuery.mockResolvedValueOnce({
        rows: [{ id: 1, name: "Test Tour" }],
      });
      mockQuery.mockResolvedValueOnce({ rows: [] });

      const response = await request(app)
        .delete("/api/tours/1/leave")
        .set("Authorization", "Bearer valid_token");

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("error", "You are not a participant of this tour");
    });
  });

  describe("GET /api/tours/:id/participation - Check Participation", () => {
    it("should return participation status", async () => {
      (jwt.verify as ReturnType<typeof vi.fn>).mockReturnValueOnce(mockTouristUser);

      // Mock: User is participating
      mockQuery.mockResolvedValueOnce({
        rows: [{ id: 1, tour_id: 1, user_id: 3 }],
      });

      const response = await request(app)
        .get("/api/tours/1/participation")
        .set("Authorization", "Bearer valid_token");

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("success", true);
      expect(response.body.data).toHaveProperty("isParticipating", true);
    });

    it("should return false when not participating", async () => {
      (jwt.verify as ReturnType<typeof vi.fn>).mockReturnValueOnce(mockTouristUser);
      mockQuery.mockResolvedValueOnce({ rows: [] });

      const response = await request(app)
        .get("/api/tours/1/participation")
        .set("Authorization", "Bearer valid_token");

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveProperty("isParticipating", false);
    });
  });

  describe("GET /api/tours - Get All Tours", () => {
    it("should return list of tours", async () => {
      (jwt.verify as ReturnType<typeof vi.fn>).mockReturnValueOnce(mockGuideUser);
      mockQuery.mockResolvedValueOnce({
        rows: [
          { id: 1, name: "Tour 1", status: "planned" },
          { id: 2, name: "Tour 2", status: "ongoing" },
        ],
      });

      const response = await request(app)
        .get("/api/tours")
        .set("Authorization", "Bearer valid_token");

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("success", true);
      expect(response.body.data).toHaveLength(2);
    });
  });
});
