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

// Mock jsonwebtoken
vi.mock("jsonwebtoken", () => ({
  __esModule: true,
  default: {
    sign: vi.fn((payload) => `mock_token_${payload.id}`),
    verify: vi.fn(() => ({ id: 1, email: "test@example.com", role: "admin" })),
  },
}));

import app from "../index";

describe("Itinerary API Routes", () => {
  const authToken = "Bearer mock_token_1";

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterAll(() => {
    vi.restoreAllMocks();
  });

  describe("GET /api/itineraries", () => {
    it("should return all itineraries", async () => {
      const mockItineraries = [
        {
          id: 1,
          tour_id: 1,
          route_id: null,
          date: "2025-06-15",
          title: "Day 1 - City Tour",
          description: "Explore the city",
          start_time: "09:00:00",
          end_time: "17:00:00",
          status: "SCHEDULED",
          created_at: "2025-01-01T00:00:00Z",
          updated_at: "2025-01-01T00:00:00Z",
        },
      ];

      mockQuery.mockResolvedValueOnce({ rows: mockItineraries });

      const response = await request(app).get("/api/itineraries").set("Authorization", authToken);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].title).toBe("Day 1 - City Tour");
    });

    it("should filter itineraries by tour_id", async () => {
      const mockItineraries = [
        {
          id: 1,
          tour_id: 5,
          date: "2025-06-15",
          title: "Day 1",
          status: "SCHEDULED",
        },
      ];

      mockQuery.mockResolvedValueOnce({ rows: mockItineraries });

      const response = await request(app)
        .get("/api/itineraries?tour_id=5")
        .set("Authorization", authToken);

      expect(response.status).toBe(200);
      expect(response.body.data[0].tour_id).toBe(5);
      expect(mockQuery).toHaveBeenCalledWith(expect.stringContaining("WHERE tour_id = $1"), ["5"]);
    });

    it("should return 401 without authentication", async () => {
      const response = await request(app).get("/api/itineraries");

      expect(response.status).toBe(401);
    });
  });

  describe("GET /api/itineraries/:id", () => {
    it("should return single itinerary by id", async () => {
      const mockItinerary = {
        id: 1,
        tour_id: 1,
        date: "2025-06-15",
        title: "Day 1 - City Tour",
        status: "SCHEDULED",
      };

      mockQuery.mockResolvedValueOnce({ rows: [mockItinerary] });

      const response = await request(app).get("/api/itineraries/1").set("Authorization", authToken);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(1);
    });

    it("should return 404 if itinerary not found", async () => {
      mockQuery.mockResolvedValueOnce({ rows: [] });

      const response = await request(app)
        .get("/api/itineraries/999")
        .set("Authorization", authToken);

      expect(response.status).toBe(404);
      expect(response.body.error).toBe("Itinerary not found");
    });

    it("should return 400 for invalid id", async () => {
      const response = await request(app)
        .get("/api/itineraries/invalid")
        .set("Authorization", authToken);

      expect(response.status).toBe(400);
      expect(response.body.error).toBe("Invalid itinerary ID");
    });
  });

  describe("POST /api/itineraries", () => {
    it("should create new itinerary with valid data", async () => {
      const newItinerary = {
        tour_id: 1,
        date: "2025-06-15",
        title: "Day 1 - City Tour",
        description: "Explore the city highlights",
        start_time: "09:00",
        end_time: "17:00",
        status: "SCHEDULED",
      };

      const mockCreatedItinerary = {
        id: 1,
        ...newItinerary,
        route_id: null,
        created_at: "2025-01-01T00:00:00Z",
        updated_at: "2025-01-01T00:00:00Z",
      };

      mockQuery.mockResolvedValueOnce({ rows: [mockCreatedItinerary] });

      const response = await request(app)
        .post("/api/itineraries")
        .set("Authorization", authToken)
        .send(newItinerary);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.title).toBe("Day 1 - City Tour");
      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining("INSERT INTO itineraries"),
        expect.arrayContaining([1, null, "2025-06-15", "Day 1 - City Tour"])
      );
    });

    it("should return 400 for missing required fields", async () => {
      const response = await request(app)
        .post("/api/itineraries")
        .set("Authorization", authToken)
        .send({
          title: "Day 1",
          // Missing tour_id and date
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe("Validation failed");
    });

    it("should return 400 for invalid date format", async () => {
      const response = await request(app)
        .post("/api/itineraries")
        .set("Authorization", authToken)
        .send({
          tour_id: 1,
          date: "15-06-2025", // Wrong format
          title: "Day 1",
        });

      expect(response.status).toBe(400);
      expect(response.body.details).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            field: "date",
            message: expect.stringContaining("YYYY-MM-DD"),
          }),
        ])
      );
    });

    it("should return 400 for title too short", async () => {
      const response = await request(app)
        .post("/api/itineraries")
        .set("Authorization", authToken)
        .send({
          tour_id: 1,
          date: "2025-06-15",
          title: "D1", // Too short
        });

      expect(response.status).toBe(400);
      expect(response.body.details).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            field: "title",
            message: expect.stringContaining("at least 3 characters"),
          }),
        ])
      );
    });
  });

  describe("PUT /api/itineraries/:id", () => {
    it("should update itinerary with valid data", async () => {
      const existingItinerary = {
        id: 1,
        tour_id: 1,
        date: "2025-06-15",
        title: "Day 1",
        status: "SCHEDULED",
      };

      const updatedData = {
        title: "Day 1 - Updated",
        status: "IN_PROGRESS",
      };

      const mockUpdatedItinerary = {
        ...existingItinerary,
        ...updatedData,
      };

      // Mock check if exists
      mockQuery.mockResolvedValueOnce({ rows: [existingItinerary] });
      // Mock update
      mockQuery.mockResolvedValueOnce({ rows: [mockUpdatedItinerary] });

      const response = await request(app)
        .put("/api/itineraries/1")
        .set("Authorization", authToken)
        .send(updatedData);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.title).toBe("Day 1 - Updated");
      expect(response.body.data.status).toBe("IN_PROGRESS");
    });

    it("should return 404 if itinerary not found", async () => {
      mockQuery.mockResolvedValueOnce({ rows: [] });

      const response = await request(app)
        .put("/api/itineraries/999")
        .set("Authorization", authToken)
        .send({ title: "Updated" });

      expect(response.status).toBe(404);
      expect(response.body.error).toBe("Itinerary not found");
    });

    it("should return 400 if no fields to update", async () => {
      mockQuery.mockResolvedValueOnce({ rows: [{ id: 1 }] });

      const response = await request(app)
        .put("/api/itineraries/1")
        .set("Authorization", authToken)
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.error).toBe("No fields to update");
    });

    it("should return 400 for invalid id", async () => {
      const response = await request(app)
        .put("/api/itineraries/invalid")
        .set("Authorization", authToken)
        .send({ title: "Updated" });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe("Invalid itinerary ID");
    });
  });

  describe("DELETE /api/itineraries/:id", () => {
    it("should delete itinerary successfully", async () => {
      const mockDeletedItinerary = {
        id: 1,
        tour_id: 1,
        title: "Day 1",
      };

      mockQuery.mockResolvedValueOnce({ rows: [mockDeletedItinerary] });

      const response = await request(app)
        .delete("/api/itineraries/1")
        .set("Authorization", authToken);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe("Itinerary deleted successfully");
      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining("DELETE FROM itineraries WHERE id = $1"),
        [1]
      );
    });

    it("should return 404 if itinerary not found", async () => {
      mockQuery.mockResolvedValueOnce({ rows: [] });

      const response = await request(app)
        .delete("/api/itineraries/999")
        .set("Authorization", authToken);

      expect(response.status).toBe(404);
      expect(response.body.error).toBe("Itinerary not found");
    });

    it("should return 400 for invalid id", async () => {
      const response = await request(app)
        .delete("/api/itineraries/invalid")
        .set("Authorization", authToken);

      expect(response.status).toBe(400);
      expect(response.body.error).toBe("Invalid itinerary ID");
    });
  });
});
