import type { Request } from "express";

// ─── User Roles ──────────────────────────────────────────────────────────────
export type UserRole = "admin" | "guide" | "tourist";

// ─── Database Row Types ──────────────────────────────────────────────────────
export interface UserRow {
  id: number;
  email: string;
  password_hash: string;
  name: string;
  role: UserRole;
  created_at: Date;
}

export interface TourRow {
  id: number;
  name: string;
  description: string | null;
  start_date: string | null;
  end_date: string | null;
  destination: string | null;
  price: number | null;
  status: "planned" | "ongoing" | "completed" | "cancelled";
  content: string | null;
  assigned_leader_id: number | null;
  leader_assigned_at: Date | null;
  participant_count: number;
  created_at: Date;
  // Joined fields from user table
  leader_name?: string;
  leader_email?: string;
}

export interface StateRow {
  id: number;
  name: string;
  code: string | null;
  created_at: Date;
}

export interface CityRow {
  id: number;
  name: string;
  state_id: number;
  state_name?: string;
  created_at: Date;
}

export interface PlaceRow {
  id: number;
  name: string;
  city_id: number;
  city_name?: string;
  state_name?: string;
  latitude: number | null;
  longitude: number | null;
  description: string | null;
  category: "HISTORICAL" | "NATURAL" | "CULTURAL" | "RELIGIOUS" | "ENTERTAINMENT" | "OTHER";
  created_at: Date;
}

export interface CheckpointRow {
  id: number;
  route_id: number;
  place_id: number | null;
  name: string;
  description: string | null;
  sequence_order: number;
  latitude: number | null;
  longitude: number | null;
  status: "PENDING" | "ARRIVED" | "DEPARTED" | "SKIPPED";
  created_at: Date;
}

export interface IncidentRow {
  id: number;
  tour_id: number;
  reported_by: number;
  title: string;
  description: string;
  location: string | null;
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  status: "OPEN" | "RESOLVED";
  created_at: Date;
  updated_at: Date;
}

// ─── JWT Payload ─────────────────────────────────────────────────────────────
export interface JwtPayload {
  id: number;
  email: string;
  role: UserRole;
  iat?: number;
  exp?: number;
}

// ─── Authenticated Request ───────────────────────────────────────────────────
export interface AuthenticatedRequest extends Request {
  user?: JwtPayload;
}

// ─── MySQL Result Types ──────────────────────────────────────────────────────
export interface InsertResult {
  insertId: number;
  affectedRows: number;
}

export interface UpdateResult {
  affectedRows: number;
  changedRows: number;
}

// ─── Photo Types ─────────────────────────────────────────────────────────────
export interface PhotoRow {
  id: number;
  tour_id: number;
  user_id: number;
  photo_url: string;
  caption: string | null;
  created_at: Date;
  // Joined fields from user table
  user_name?: string;
  user_email?: string;
}
