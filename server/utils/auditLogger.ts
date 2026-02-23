import pool from "../db";
import type { Request } from "express";

/**
 * Audit Logger Utility
 * Helper function to create audit log entries for system actions
 */
export interface AuditLogParams {
  userId?: number;
  action: string;
  entityType: string;
  entityId?: number | string;
  oldValues?: unknown;
  newValues?: unknown;
  req?: Request;
}

/**
 * Create an audit log entry
 */
export async function createAuditLog({
  userId,
  action,
  entityType,
  entityId,
  oldValues,
  newValues,
  req,
}: AuditLogParams): Promise<void> {
  try {
    const ipAddress = req?.ip || (req?.headers["x-forwarded-for"] as string) || null;
    const userAgent = req?.headers["user-agent"] || null;

    await pool.query(
      `INSERT INTO audit_logs (user_id, action, entity_type, entity_id, old_values, new_values, ip_address, user_agent)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [
        userId || null,
        action,
        entityType,
        entityId || null,
        oldValues ? JSON.stringify(oldValues) : null,
        newValues ? JSON.stringify(newValues) : null,
        ipAddress,
        userAgent,
      ]
    );
  } catch (error) {
    // Don't throw - audit logging should not break main operations
    console.error("Failed to create audit log:", error);
  }
}

/**
 * Common audit actions
 */
export const AuditActions = {
  CREATE: "CREATE",
  UPDATE: "UPDATE",
  DELETE: "DELETE",
  VIEW: "VIEW",
  LOGIN: "LOGIN",
  LOGOUT: "LOGOUT",
  ASSIGN: "ASSIGN",
  UNASSIGN: "UNASSIGN",
  VERIFY: "VERIFY",
  ACKNOWLEDGE: "ACKNOWLEDGE",
} as const;

/**
 * Common entity types
 */
export const EntityTypes = {
  TOUR: "tour",
  USER: "user",
  ATTENDANCE: "attendance",
  INCIDENT: "incident",
  ANNOUNCEMENT: "announcement",
  BUDGET: "budget",
  EXPENSE: "expense",
  ITINERARY: "itinerary",
  LOCATION: "location",
  SAFETY: "safety",
} as const;
