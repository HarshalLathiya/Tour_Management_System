import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import request from "supertest";
import app from "../index";
import pool from "../db";

describe("Announcements API Routes", () => {
  let authToken: string;
  let tourId: number;
  let announcementId: number;

  beforeAll(async () => {
    // Create test user
    await pool.query("DELETE FROM users WHERE email = $1", ["announce-test@example.com"]);
    const userResult = await pool.query(
      "INSERT INTO users (email, password_hash, name, role) VALUES ($1, $2, $3, $4) RETURNING id",
      ["announce-test@example.com", "$2a$10$test", "Announce Test", "guide"]
    );
    const userId = userResult.rows[0].id;

    // Login to get token
    const loginRes = await request(app).post("/api/auth/login").send({
      email: "announce-test@example.com",
      password: "Password123!",
    });
    authToken = loginRes.body.token;

    // Create test tour
    const tourResult = await pool.query(
      "INSERT INTO tours (name, created_by) VALUES ($1, $2) RETURNING id",
      ["Announcement Test Tour", userId]
    );
    tourId = tourResult.rows[0].id;
  });

  afterAll(async () => {
    // Cleanup
    if (tourId) {
      await pool.query("DELETE FROM announcements WHERE tour_id = $1", [tourId]);
      await pool.query("DELETE FROM tours WHERE id = $1", [tourId]);
    }
    await pool.query("DELETE FROM users WHERE email = $1", ["announce-test@example.com"]);
  });

  beforeEach(async () => {
    // Clean announcements before each test
    if (tourId) {
      await pool.query("DELETE FROM announcements WHERE tour_id = $1", [tourId]);
    }
  });

  describe("POST /api/announcements", () => {
    it("should create a new announcement", async () => {
      const response = await request(app)
        .post("/api/announcements")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          tour_id: tourId,
          title: "Important Update",
          content: "Please arrive 30 minutes early tomorrow.",
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty("id");
      expect(response.body.data.title).toBe("Important Update");
      announcementId = response.body.data.id;
    });

    it("should return 400 for missing required fields", async () => {
      const response = await request(app)
        .post("/api/announcements")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          tour_id: tourId,
          // Missing title and content
        });

      expect(response.status).toBe(400);
    });

    it("should return 401 without authentication", async () => {
      const response = await request(app).post("/api/announcements").send({
        tour_id: tourId,
        title: "Test",
        content: "Test content",
      });

      expect(response.status).toBe(401);
    });
  });

  describe("GET /api/announcements", () => {
    beforeEach(async () => {
      // Create test announcements
      await pool.query(
        "INSERT INTO announcements (tour_id, title, content) VALUES ($1, $2, $3), ($1, $4, $5)",
        [tourId, "Announcement 1", "Content 1", "Announcement 2", "Content 2"]
      );
    });

    it("should get all announcements", async () => {
      const response = await request(app)
        .get("/api/announcements")
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThanOrEqual(2);
    });

    it("should filter announcements by tour_id", async () => {
      const response = await request(app)
        .get(`/api/announcements?tour_id=${tourId}`)
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data.length).toBeGreaterThanOrEqual(2);
      response.body.data.forEach((announcement: { tour_id: number }) => {
        expect(announcement.tour_id).toBe(tourId);
      });
    });

    it("should return 401 without authentication", async () => {
      const response = await request(app).get("/api/announcements");
      expect(response.status).toBe(401);
    });
  });

  describe("GET /api/announcements/:id", () => {
    beforeEach(async () => {
      const result = await pool.query(
        "INSERT INTO announcements (tour_id, title, content) VALUES ($1, $2, $3) RETURNING id",
        [tourId, "Single Announcement", "Test content"]
      );
      announcementId = result.rows[0].id;
    });

    it("should get announcement by id", async () => {
      const response = await request(app)
        .get(`/api/announcements/${announcementId}`)
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(announcementId);
      expect(response.body.data.title).toBe("Single Announcement");
    });

    it("should return 404 for non-existent announcement", async () => {
      const response = await request(app)
        .get("/api/announcements/99999")
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.status).toBe(404);
      expect(response.body.error).toBe("Announcement not found");
    });

    it("should return 400 for invalid id", async () => {
      const response = await request(app)
        .get("/api/announcements/invalid")
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.status).toBe(400);
    });
  });

  describe("PUT /api/announcements/:id", () => {
    beforeEach(async () => {
      const result = await pool.query(
        "INSERT INTO announcements (tour_id, title, content) VALUES ($1, $2, $3) RETURNING id",
        [tourId, "Original Title", "Original content"]
      );
      announcementId = result.rows[0].id;
    });

    it("should update announcement", async () => {
      const response = await request(app)
        .put(`/api/announcements/${announcementId}`)
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          title: "Updated Title",
          content: "Updated content",
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.title).toBe("Updated Title");
      expect(response.body.data.content).toBe("Updated content");
    });

    it("should update only title", async () => {
      const response = await request(app)
        .put(`/api/announcements/${announcementId}`)
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          title: "Only Title Updated",
        });

      expect(response.status).toBe(200);
      expect(response.body.data.title).toBe("Only Title Updated");
    });

    it("should return 404 for non-existent announcement", async () => {
      const response = await request(app)
        .put("/api/announcements/99999")
        .set("Authorization", `Bearer ${authToken}`)
        .send({ title: "Test" });

      expect(response.status).toBe(404);
    });

    it("should return 400 for invalid id", async () => {
      const response = await request(app)
        .put("/api/announcements/invalid")
        .set("Authorization", `Bearer ${authToken}`)
        .send({ title: "Test" });

      expect(response.status).toBe(400);
    });

    it("should return 400 when no fields to update", async () => {
      const response = await request(app)
        .put(`/api/announcements/${announcementId}`)
        .set("Authorization", `Bearer ${authToken}`)
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.error).toBe("No fields to update");
    });
  });

  describe("DELETE /api/announcements/:id", () => {
    beforeEach(async () => {
      const result = await pool.query(
        "INSERT INTO announcements (tour_id, title, content) VALUES ($1, $2, $3) RETURNING id",
        [tourId, "To Be Deleted", "Content"]
      );
      announcementId = result.rows[0].id;
    });

    it("should delete announcement", async () => {
      const response = await request(app)
        .delete(`/api/announcements/${announcementId}`)
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe("Announcement deleted successfully");

      // Verify deletion
      const checkRes = await request(app)
        .get(`/api/announcements/${announcementId}`)
        .set("Authorization", `Bearer ${authToken}`);
      expect(checkRes.status).toBe(404);
    });

    it("should return 404 for non-existent announcement", async () => {
      const response = await request(app)
        .delete("/api/announcements/99999")
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.status).toBe(404);
    });

    it("should return 400 for invalid id", async () => {
      const response = await request(app)
        .delete("/api/announcements/invalid")
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.status).toBe(400);
    });
  });
});
