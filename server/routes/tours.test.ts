import { describe, it, expect } from "vitest";
import { tourSchemas } from "../middleware/validation";

describe("Tour validation schemas", () => {
  describe("create schema", () => {
    it("should accept valid tour data", () => {
      const result = tourSchemas.create.safeParse({
        name: "Paris Tour 2025",
        description: "A wonderful tour of Paris",
        start_date: "2025-06-01",
        end_date: "2025-06-10",
        destination: "Paris, France",
        price: 1500,
        status: "planned",
        content: "Detailed itinerary...",
      });
      expect(result.success).toBe(true);
    });

    it("should accept minimal valid data (only name)", () => {
      const result = tourSchemas.create.safeParse({
        name: "Quick Tour",
      });
      expect(result.success).toBe(true);
    });

    it("should reject missing name", () => {
      const result = tourSchemas.create.safeParse({
        description: "Tour without a name",
      });
      expect(result.success).toBe(false);
    });

    it("should reject name too short", () => {
      const result = tourSchemas.create.safeParse({ name: "ab" });
      expect(result.success).toBe(false);
    });

    it("should reject name exceeding max length", () => {
      const result = tourSchemas.create.safeParse({ name: "x".repeat(256) });
      expect(result.success).toBe(false);
    });

    it("should reject invalid date format", () => {
      const result = tourSchemas.create.safeParse({
        name: "Tour",
        start_date: "2025/06/01", // Wrong format
      });
      expect(result.success).toBe(false);
    });

    it("should reject negative price", () => {
      const result = tourSchemas.create.safeParse({
        name: "Tour",
        price: -100,
      });
      expect(result.success).toBe(false);
    });

    it("should reject invalid status", () => {
      const result = tourSchemas.create.safeParse({
        name: "Tour",
        status: "invalid_status",
      });
      expect(result.success).toBe(false);
    });

    it("should accept valid status values", () => {
      const statuses = ["planned", "ongoing", "completed", "cancelled"];
      statuses.forEach((status) => {
        const result = tourSchemas.create.safeParse({
          name: "Tour",
          status,
        });
        expect(result.success).toBe(true);
      });
    });
  });

  describe("update schema", () => {
    it("should accept any valid field update", () => {
      const result = tourSchemas.update.safeParse({
        name: "Updated Tour Name",
        description: "Updated description",
      });
      expect(result.success).toBe(true);
    });

    it("should accept empty update (no fields)", () => {
      const result = tourSchemas.update.safeParse({});
      expect(result.success).toBe(true);
    });

    it("should accept partial updates", () => {
      const result = tourSchemas.update.safeParse({
        status: "completed",
      });
      expect(result.success).toBe(true);
    });

    it("should reject invalid field values", () => {
      const result = tourSchemas.update.safeParse({
        name: "ab", // Too short
      });
      expect(result.success).toBe(false);
    });

    it("should reject negative price", () => {
      const result = tourSchemas.update.safeParse({
        price: -500,
      });
      expect(result.success).toBe(false);
    });

    it("should accept valid date updates", () => {
      const result = tourSchemas.update.safeParse({
        start_date: "2025-07-01",
        end_date: "2025-07-15",
      });
      expect(result.success).toBe(true);
    });
  });
});
