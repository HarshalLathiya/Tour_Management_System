import type { Request, Response, NextFunction } from "express";
import { z } from "zod";

export const validate = (schema: z.ZodSchema) => {
  return (_req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(_req.body);
    if (!result.success) {
      return res.status(400).json({
        error: "Validation failed",
        details: result.error.issues.map((issue) => ({
          field: issue.path.join("."),
          message: issue.message,
        })),
      });
    }
    next();
  };
};

// ─── Auth Schemas ────────────────────────────────────────────────────────────
export const authSchemas = {
  register: z.object({
    email: z.string().email("Invalid email format"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    name: z.string().min(2, "Name must be at least 2 characters").max(100),
    role: z.enum(["admin", "guide", "tourist"]).default("tourist").optional(),
  }),

  login: z.object({
    email: z.string().email("Invalid email format"),
    password: z.string().min(1, "Password is required"),
  }),

  refresh: z.object({
    refreshToken: z.string().min(1, "Refresh token is required"),
  }),
};

// ─── Tour Schemas ────────────────────────────────────────────────────────────
export const tourSchemas = {
  create: z.object({
    name: z.string().min(3, "Name must be at least 3 characters").max(255, "Name must not exceed 255 characters"),
    description: z.string().max(5000, "Description must not exceed 5000 characters").optional(),
    start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Start date must be in YYYY-MM-DD format").optional(),
    end_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "End date must be in YYYY-MM-DD format").optional(),
    destination: z.string().max(255, "Destination must not exceed 255 characters").optional(),
    price: z.number().nonnegative("Price must be non-negative").optional(),
    status: z.enum(["planned", "ongoing", "completed", "cancelled"]).default("planned"),
    content: z.string().max(10000, "Content must not exceed 10000 characters").optional(),
  }),

  update: z.object({
    name: z.string().min(3, "Name must be at least 3 characters").max(255, "Name must not exceed 255 characters").optional(),
    description: z.string().max(5000, "Description must not exceed 5000 characters").optional(),
    start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Start date must be in YYYY-MM-DD format").optional(),
    end_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "End date must be in YYYY-MM-DD format").optional(),
    destination: z.string().max(255, "Destination must not exceed 255 characters").optional(),
    price: z.number().nonnegative("Price must be non-negative").optional(),
    status: z.enum(["planned", "ongoing", "completed", "cancelled"]).optional(),
    content: z.string().max(10000, "Content must not exceed 10000 characters").optional(),
  }),
};

// ─── Location Schemas ────────────────────────────────────────────────────────
export const locationSchemas = {
  state: z.object({
    name: z.string().min(2, "State name must be at least 2 characters").max(100),
    code: z.string().max(10).optional(),
  }),

  city: z.object({
    name: z.string().min(2, "City name must be at least 2 characters").max(100),
    state_id: z.number().int().positive("Invalid state ID"),
  }),

  place: z.object({
    name: z.string().min(2, "Place name must be at least 2 characters").max(255),
    city_id: z.number().int().positive("Invalid city ID"),
    latitude: z.number().min(-90).max(90).optional(),
    longitude: z.number().min(-180).max(180).optional(),
    description: z.string().max(2000).optional(),
    category: z
      .enum(["HISTORICAL", "NATURAL", "CULTURAL", "RELIGIOUS", "ENTERTAINMENT", "OTHER"])
      .optional(),
  }),
};

// ─── Itinerary Schemas ───────────────────────────────────────────────────────
export const itinerarySchemas = {
  create: z.object({
    tour_id: z.number().int().positive("Invalid tour ID"),
    route_id: z.number().int().positive("Invalid route ID").optional(),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format"),
    title: z.string().min(3, "Title must be at least 3 characters").max(255, "Title must not exceed 255 characters"),
    description: z.string().max(5000, "Description must not exceed 5000 characters").optional(),
    start_time: z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/, "Start time must be in HH:MM or HH:MM:SS format").optional(),
    end_time: z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/, "End time must be in HH:MM or HH:MM:SS format").optional(),
    status: z.enum(["SCHEDULED", "IN_PROGRESS", "COMPLETED", "CANCELLED"]).default("SCHEDULED"),
  }),

  update: z.object({
    tour_id: z.number().int().positive("Invalid tour ID").optional(),
    route_id: z.number().int().positive("Invalid route ID").optional(),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format").optional(),
    title: z.string().min(3, "Title must be at least 3 characters").max(255, "Title must not exceed 255 characters").optional(),
    description: z.string().max(5000, "Description must not exceed 5000 characters").optional(),
    start_time: z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/, "Start time must be in HH:MM or HH:MM:SS format").optional(),
    end_time: z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/, "End time must be in HH:MM or HH:MM:SS format").optional(),
    status: z.enum(["SCHEDULED", "IN_PROGRESS", "COMPLETED", "CANCELLED"]).optional(),
  }),
};

// ─── Attendance Schemas ──────────────────────────────────────────────────────
export const attendanceSchemas = {
  checkin: z.object({
    tour_id: z.number().int().positive("Invalid tour ID"),
    checkpoint_id: z.number().int().positive("Invalid checkpoint ID"),
    location_lat: z.number().min(-90, "Latitude must be between -90 and 90").max(90, "Latitude must be between -90 and 90"),
    location_lng: z.number().min(-180, "Longitude must be between -180 and 180").max(180, "Longitude must be between -180 and 180"),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format").optional(),
    status: z.enum(["present", "absent", "late"]).default("present"),
  }),

  create: z.object({
    user_id: z.number().int().positive("Invalid user ID"),
    tour_id: z.number().int().positive("Invalid tour ID"),
    checkpoint_id: z.number().int().positive("Invalid checkpoint ID").optional(),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format"),
    status: z.enum(["present", "absent", "late"]).default("present"),
    location_lat: z.number().min(-90).max(90).optional(),
    location_lng: z.number().min(-180).max(180).optional(),
    verified_by: z.number().int().positive("Invalid verifier ID").optional(),
  }),

  update: z.object({
    status: z.enum(["present", "absent", "late"]).optional(),
    location_lat: z.number().min(-90).max(90).optional(),
    location_lng: z.number().min(-180).max(180).optional(),
    verified_by: z.number().int().positive("Invalid verifier ID").optional(),
  }),
};

// ─── Budget Schemas ──────────────────────────────────────────────────────────
export const budgetSchemas = {
  create: z.object({
    tour_id: z.number().int().positive("Invalid tour ID"),
    total_amount: z.number().positive("Total amount must be positive"),
    spent_amount: z.number().nonnegative("Spent amount cannot be negative").default(0),
    per_participant_fee: z.number().nonnegative("Per participant fee cannot be negative").default(0),
    currency: z.string().length(3, "Currency code must be 3 characters").default("USD"),
    description: z.string().max(5000, "Description must not exceed 5000 characters").optional(),
  }),

  update: z.object({
    total_amount: z.number().positive("Total amount must be positive").optional(),
    spent_amount: z.number().nonnegative("Spent amount cannot be negative").optional(),
    per_participant_fee: z.number().nonnegative("Per participant fee cannot be negative").optional(),
    currency: z.string().length(3, "Currency code must be 3 characters").optional(),
    description: z.string().max(5000, "Description must not exceed 5000 characters").optional(),
  }),
};

// ─── Expense Schemas ─────────────────────────────────────────────────────────
export const expenseSchemas = {
  create: z.object({
    tour_id: z.number().int().positive("Invalid tour ID"),
    amount: z.number().positive("Amount must be positive"),
    category: z.enum(["TRANSPORT", "ACCOMMODATION", "FOOD", "MISC"]).default("MISC"),
    description: z.string().max(5000, "Description must not exceed 5000 characters").optional(),
  }),

  update: z.object({
    amount: z.number().positive("Amount must be positive").optional(),
    category: z.enum(["TRANSPORT", "ACCOMMODATION", "FOOD", "MISC"]).optional(),
    description: z.string().max(5000, "Description must not exceed 5000 characters").optional(),
  }),
};

// ─── Safety Protocol Schemas ─────────────────────────────────────────────────
export const safetyProtocolSchemas = {
  create: z.object({
    tour_id: z.number().int().positive("Invalid tour ID"),
    title: z.string().min(3, "Title must be at least 3 characters").max(255, "Title must not exceed 255 characters"),
    description: z.string().min(10, "Description must be at least 10 characters").max(5000, "Description must not exceed 5000 characters"),
    severity: z.enum(["low", "medium", "high", "critical"]).default("medium"),
  }),

  update: z.object({
    title: z.string().min(3, "Title must be at least 3 characters").max(255, "Title must not exceed 255 characters").optional(),
    description: z.string().min(10, "Description must be at least 10 characters").max(5000, "Description must not exceed 5000 characters").optional(),
    severity: z.enum(["low", "medium", "high", "critical"]).optional(),
  }),
};

// ─── Incident Schemas ────────────────────────────────────────────────────────
export const incidentSchemas = {
  create: z.object({
    tour_id: z.number().int().positive("Invalid tour ID"),
    title: z.string().min(3, "Title must be at least 3 characters").max(255, "Title must not exceed 255 characters"),
    description: z.string().min(10, "Description must be at least 10 characters").max(5000, "Description must not exceed 5000 characters"),
    location: z.string().max(255, "Location must not exceed 255 characters").optional(),
    severity: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]).default("MEDIUM"),
    status: z.enum(["OPEN", "RESOLVED"]).default("OPEN"),
  }),

  update: z.object({
    title: z.string().min(3, "Title must be at least 3 characters").max(255, "Title must not exceed 255 characters").optional(),
    description: z.string().min(10, "Description must be at least 10 characters").max(5000, "Description must not exceed 5000 characters").optional(),
    location: z.string().max(255, "Location must not exceed 255 characters").optional(),
    severity: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]).optional(),
    status: z.enum(["OPEN", "RESOLVED"]).optional(),
  }),
};

// ─── Announcement Schemas ────────────────────────────────────────────────────
export const announcementSchemas = {
  create: z.object({
    tour_id: z.number().int().positive("Invalid tour ID"),
    title: z.string().min(3, "Title must be at least 3 characters").max(255, "Title must not exceed 255 characters"),
    content: z.string().min(10, "Content must be at least 10 characters").max(10000, "Content must not exceed 10000 characters"),
  }),

  update: z.object({
    title: z.string().min(3, "Title must be at least 3 characters").max(255, "Title must not exceed 255 characters").optional(),
    content: z.string().min(10, "Content must be at least 10 characters").max(10000, "Content must not exceed 10000 characters").optional(),
  }),
};

// ─── Audit Log Schemas ───────────────────────────────────────────────────────
export const auditLogSchemas = {
  create: z.object({
    user_id: z.number().int().positive("Invalid user ID").optional(),
    action: z.string().min(1, "Action is required").max(100, "Action must not exceed 100 characters"),
    entity_type: z.string().min(1, "Entity type is required").max(50, "Entity type must not exceed 50 characters"),
    entity_id: z.number().int().positive("Invalid entity ID"),
    old_values: z.record(z.unknown()).optional(),
    new_values: z.record(z.unknown()).optional(),
    ip_address: z.string().max(45, "IP address must not exceed 45 characters").optional(),
    user_agent: z.string().max(1000, "User agent must not exceed 1000 characters").optional(),
  }),
};
