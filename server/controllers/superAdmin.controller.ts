import type { Request, Response } from "express";
import pool from "../db";
import type { AuthenticatedRequest } from "../types";
import { AppError } from "../middleware/errorHandler";
import { createAuditLog, AuditActions, EntityTypes } from "../utils/auditLogger";
import { User } from "../models/User.model";
import { Tour } from "../models/Tour.model";
import { Incident } from "../models/Incident.model";

type PaginationQuery = {
  limit?: string;
  offset?: string;
  q?: string;
  status?: string;
  role?: string;
  severity?: string;
  incident_type?: string;
};

function parsePagination(query: PaginationQuery) {
  const limit = query.limit ? Math.max(1, Math.min(200, parseInt(query.limit, 10))) : 50;
  const offset = query.offset ? Math.max(0, parseInt(query.offset, 10)) : 0;
  const q = typeof query.q === "string" && query.q.trim().length > 0 ? query.q.trim() : undefined;
  return { limit, offset, q };
}

type SuperAdminAuthenticatedRequest = AuthenticatedRequest & { user: AuthenticatedRequest["user"] };

function requireSuperAdmin(
  req: Request
): AuthenticatedRequest & { user: NonNullable<AuthenticatedRequest["user"]> } {
  const authReq = req as AuthenticatedRequest;
  if (!authReq.user) {
    throw new AppError(401, "Authentication required");
  }
  if (authReq.user.role !== "super_admin") {
    throw new AppError(403, "Super Admin access required");
  }
  return authReq as AuthenticatedRequest & { user: NonNullable<AuthenticatedRequest["user"]> };
}

export class SuperAdminController {
  async overview(req: Request, res: Response): Promise<void> {
    const authReq = requireSuperAdmin(req);

    await createAuditLog({
      userId: authReq.user.id,
      action: AuditActions.VIEW,
      entityType: EntityTypes.USER,
      entityId: authReq.user.id,
      newValues: { action: "SUPER_ADMIN_VIEW_DASHBOARD" },
      req,
    });

    const [totalUsers, totalAdmins, totalLeaders, totalParticipants] = await Promise.all([
      pool.query<{ total: string }>("SELECT COUNT(*)::text as total FROM users"),
      pool.query<{ total: string }>(
        "SELECT COUNT(*)::text as total FROM users WHERE role = 'admin'"
      ),
      pool.query<{ total: string }>(
        "SELECT COUNT(*)::text as total FROM users WHERE role = 'leader'"
      ),
      pool.query<{ total: string }>(
        "SELECT COUNT(*)::text as total FROM users WHERE role = 'participant'"
      ),
    ]);

    const [totalTours, activeTours, completedTours, pendingSOS] = await Promise.all([
      pool.query<{ total: string }>("SELECT COUNT(*)::text as total FROM tours"),
      pool.query<{ total: string }>(
        "SELECT COUNT(*)::text as total FROM tours WHERE status = 'ongoing'"
      ),
      pool.query<{ total: string }>(
        "SELECT COUNT(*)::text as total FROM tours WHERE status = 'completed'"
      ),
      pool.query<{ total: string }>(
        "SELECT COUNT(*)::text as total FROM incidents WHERE incident_type = 'SOS' AND status IN ('OPEN','IN_PROGRESS')"
      ),
    ]);

    res.json({
      success: true,
      data: {
        totalUsers: parseInt(totalUsers.rows[0]?.total ?? "0", 10),
        totalAdmins: parseInt(totalAdmins.rows[0]?.total ?? "0", 10),
        totalLeaders: parseInt(totalLeaders.rows[0]?.total ?? "0", 10),
        totalParticipants: parseInt(totalParticipants.rows[0]?.total ?? "0", 10),
        totalTours: parseInt(totalTours.rows[0]?.total ?? "0", 10),
        activeTours: parseInt(activeTours.rows[0]?.total ?? "0", 10),
        completedTours: parseInt(completedTours.rows[0]?.total ?? "0", 10),
        pendingSOS: parseInt(pendingSOS.rows[0]?.total ?? "0", 10),
      },
    });
  }

  async listUsers(req: Request, res: Response): Promise<void> {
    const authReq = requireSuperAdmin(req);
    const { limit, offset, q } = parsePagination(req.query as PaginationQuery);
    const role =
      typeof (req.query as PaginationQuery).role === "string"
        ? (req.query as PaginationQuery).role
        : undefined;

    await createAuditLog({
      userId: authReq.user.id,
      action: AuditActions.VIEW,
      entityType: EntityTypes.USER,
      entityId: authReq.user.id,
      newValues: { action: "SUPER_ADMIN_VIEW_USERS" },
      req,
    });

    const params: unknown[] = [];
    let where = "WHERE 1=1";
    let i = 1;

    if (role) {
      where += ` AND role = $${i++}`;
      params.push(role);
    }

    if (q) {
      where += ` AND (email ILIKE $${i++} OR name ILIKE $${i++})`;
      params.push(`%${q}%`, `%${q}%`);
    }

    const dataQuery = `
      SELECT id, email, name, role, created_at
      FROM users
      ${where}
      ORDER BY created_at DESC
      LIMIT $${i++} OFFSET $${i++}
    `;

    params.push(limit, offset);

    const result = await pool.query(dataQuery, params);

    const countQuery = `SELECT COUNT(*)::int as total FROM users ${where}`;
    // reuse params for where; exclude limit/offset
    const countParams = params.slice(0, params.length - 2);
    const countResult = await pool.query(countQuery, countParams);

    res.json({
      success: true,
      data: result.rows,
      pagination: {
        limit,
        offset,
        total: countResult.rows[0]?.total ?? 0,
      },
    });
  }

  async getUser(req: Request, res: Response): Promise<void> {
    const authReq = requireSuperAdmin(req);
    const id = parseInt(String(req.params.id), 10);
    if (Number.isNaN(id)) throw new AppError(400, "Invalid user ID");

    await createAuditLog({
      userId: authReq.user.id,
      action: AuditActions.VIEW,
      entityType: EntityTypes.USER,
      entityId: id,
      req,
    });

    const user = await User.findByIdSafe(id);
    if (!user) throw new AppError(404, "User not found");

    res.json({ success: true, data: user });
  }

  async patchUserRole(req: Request, res: Response): Promise<void> {
    const authReq = requireSuperAdmin(req);
    const id = parseInt(String(req.params.id), 10);
    if (Number.isNaN(id)) throw new AppError(400, "Invalid user ID");

    const { role } = req.body as { role?: string };
    const allowedRoles = new Set(["super_admin", "admin", "leader", "participant"]);
    const normalizedRole = typeof role === "string" ? role : undefined;
    if (!normalizedRole || !allowedRoles.has(normalizedRole))
      throw new AppError(400, "Invalid role");

    const old = await pool.query("SELECT role FROM users WHERE id = $1", [id]);
    if (old.rows.length === 0) throw new AppError(404, "User not found");

    const updated = await User.updateRole(id, normalizedRole);
    if (!updated) throw new AppError(404, "User not found");

    await createAuditLog({
      userId: authReq.user.id,
      action: AuditActions.UPDATE,
      entityType: EntityTypes.USER,
      entityId: id,
      oldValues: old.rows[0],
      newValues: { role: normalizedRole },
      req,
    });

    res.json({ success: true, message: "User role updated successfully" });
    return;
  }

  async patchUserStatus(req: Request, res: Response): Promise<void> {
    const authReq = requireSuperAdmin(req);
    const id = parseInt(String(req.params.id), 10);
    if (Number.isNaN(id)) throw new AppError(400, "Invalid user ID");

    const { is_active } = req.body as { is_active?: boolean };
    if (typeof is_active !== "boolean") throw new AppError(400, "is_active must be boolean");

    // Always log a stable snapshot of the role; tolerate missing `is_active` column in older DBs.
    const old = await pool.query("SELECT role FROM users WHERE id = $1", [id]);
    if (old.rows.length === 0) throw new AppError(404, "User not found");

    // Ensure we only attempt status update if the column exists.
    const colCheck = await pool.query(
      "SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'is_active'"
    );

    if (colCheck.rows.length === 0) {
      throw new AppError(
        500,
        "User status feature is not available (users.is_active missing). Run DB migrations."
      );
    }

    const result = await pool.query("UPDATE users SET is_active = $1 WHERE id = $2", [
      is_active,
      id,
    ]);

    if (result.rowCount === 0) throw new AppError(404, "User not found");

    await createAuditLog({
      userId: authReq.user.id,
      action: AuditActions.UPDATE,
      entityType: EntityTypes.USER,
      entityId: id,
      oldValues: old.rows[0],
      newValues: { is_active },
      req,
    });

    res.json({ success: true, message: "User status updated successfully" });
  }

  async listTours(req: Request, res: Response): Promise<void> {
    const authReq = requireSuperAdmin(req);

    await createAuditLog({
      userId: authReq.user.id,
      action: AuditActions.VIEW,
      entityType: EntityTypes.TOUR,
      entityId: authReq.user.id,
      newValues: { action: "SUPER_ADMIN_VIEW_TOURS" },
      req,
    });

    const { limit, offset, q, status } = (() => {
      const { limit, offset, q } = parsePagination(req.query as PaginationQuery);
      return {
        limit,
        offset,
        q,
        status:
          typeof (req.query as PaginationQuery).status === "string"
            ? (req.query as PaginationQuery).status
            : undefined,
      };
    })();

    // Minimal Phase-1: use filters supported by Tour model + paginate via raw SQL.
    const params: unknown[] = [];
    let where = "WHERE 1=1";
    let i = 1;

    if (status) {
      where += ` AND t.status = $${i++}`;
      params.push(status);
    }

    if (q) {
      where += ` AND (t.name ILIKE $${i++} OR t.description ILIKE $${i++})`;
      params.push(`%${q}%`, `%${q}%`);
    }

    const dataQuery = `
      SELECT t.*, u.name as leader_name, u.email as leader_email
      FROM tours t
      LEFT JOIN users u ON t.assigned_leader_id = u.id
      ${where}
      ORDER BY t.created_at DESC
      LIMIT $${i++} OFFSET $${i++}
    `;

    params.push(limit, offset);

    const result = await pool.query(dataQuery, params);

    const countQuery = `SELECT COUNT(*)::int as total FROM tours t ${where}`;
    const countParams = params.slice(0, params.length - 2);
    const countResult = await pool.query(countQuery, countParams);

    res.json({
      success: true,
      data: result.rows,
      pagination: { limit, offset, total: countResult.rows[0]?.total ?? 0 },
    });
  }

  async getTour(req: Request, res: Response): Promise<void> {
    const authReq = requireSuperAdmin(req);
    const id = parseInt(String(req.params.id), 10);
    if (Number.isNaN(id)) throw new AppError(400, "Invalid tour ID");

    await createAuditLog({
      userId: authReq.user.id,
      action: AuditActions.VIEW,
      entityType: EntityTypes.TOUR,
      entityId: id,
      req,
    });

    const tour = await Tour.getTourById(id);
    if (!tour) throw new AppError(404, "Tour not found");

    res.json({ success: true, data: tour });
  }

  async listIncidents(req: Request, res: Response): Promise<void> {
    const authReq = requireSuperAdmin(req);
    const { limit, offset, q } = parsePagination(req.query as PaginationQuery);

    await createAuditLog({
      userId: authReq.user.id,
      action: AuditActions.VIEW,
      entityType: EntityTypes.INCIDENT,
      entityId: authReq.user.id,
      newValues: { action: "SUPER_ADMIN_VIEW_INCIDENTS" },
      req,
    });

    const { tour_id, severity, status, incident_type } = req.query as Record<
      string,
      string | undefined
    >;

    const filters: Record<string, unknown> = {};
    if (tour_id) filters.tour_id = parseInt(tour_id);
    if (severity) filters.severity = severity;
    if (status) filters.status = status;
    if (incident_type) filters.incident_type = incident_type;

    // Phase-1: re-use Incident model filters but keep pagination in raw SQL for consistency.
    const dataQuery = `
      SELECT *
      FROM incidents
      WHERE 1=1
      ${tour_id ? " AND tour_id = $1" : ""}
      ${severity ? " AND severity = $2" : ""}
      ${status ? " AND status = $3" : ""}
      ${incident_type ? " AND incident_type = $4" : ""}
      ${q ? " AND (title ILIKE $5 OR description ILIKE $5)" : ""}
      ORDER BY created_at DESC
      LIMIT $${q ? 6 : tour_id || severity || status || incident_type ? 5 : 1} OFFSET $${q ? 7 : tour_id || severity || status || incident_type ? 6 : 2}
    `;

    // To avoid fragile positional params, fall back to Incident.getAll and manual slicing only when no q.
    // In Phase-1, correctness > complex SQL param math.
    const all = await Incident.getAll(filters);
    const sliced = all.slice(offset, offset + limit);

    res.json({
      success: true,
      data: sliced,
      pagination: { limit, offset, total: all.length },
    });
  }

  async getIncident(req: Request, res: Response): Promise<void> {
    const authReq = requireSuperAdmin(req);
    const id = parseInt(String(req.params.id), 10);
    if (Number.isNaN(id)) throw new AppError(400, "Invalid incident ID");

    await createAuditLog({
      userId: authReq.user.id,
      action: AuditActions.VIEW,
      entityType: EntityTypes.INCIDENT,
      entityId: id,
      req,
    });

    const incident = await Incident.findById(id);
    if (!incident) throw new AppError(404, "Incident not found");

    res.json({ success: true, data: incident });
  }

  async patchIncident(req: Request, res: Response): Promise<void> {
    const authReq = requireSuperAdmin(req);
    const id = parseInt(String(req.params.id), 10);
    if (Number.isNaN(id)) throw new AppError(400, "Invalid incident ID");

    const { status, resolution_notes } = req.body as { status?: string; resolution_notes?: string };
    if (!status) throw new AppError(400, "status is required");

    const old = await Incident.findById(id);
    if (!old) throw new AppError(404, "Incident not found");

    let updated;
    if (status === "RESOLVED") {
      if (!resolution_notes) throw new AppError(400, "resolution_notes is required when resolving");
      updated = await Incident.resolveIncident(id, resolution_notes);
    } else if (status === "IN_PROGRESS") {
      updated = await Incident.respondToIncident(id, authReq.user.id);
    } else if (status === "OPEN") {
      updated = await pool
        .query(
          "UPDATE incidents SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *",
          [status, id]
        )
        .then((r) => r.rows[0]);
    } else {
      throw new AppError(400, "Invalid status");
    }

    if (!updated) throw new AppError(404, "Incident not found");

    await createAuditLog({
      userId: authReq.user.id,
      action: AuditActions.UPDATE,
      entityType: EntityTypes.INCIDENT,
      entityId: id,
      oldValues: old,
      newValues: { status, resolution_notes },
      req,
    });

    res.json({ success: true, message: "Incident updated successfully", data: updated });
  }

  async auditLogs(req: Request, res: Response): Promise<void> {
    // Phase-1: reuse existing auditLogs route logic would require factoring.
    // Implement minimal filtering with pagination similar to server/routes/auditLogs.ts
    const authReq = requireSuperAdmin(req);

    await createAuditLog({
      userId: authReq.user.id,
      action: AuditActions.VIEW,
      entityType: EntityTypes.INCIDENT,
      entityId: authReq.user.id,
      newValues: { action: "SUPER_ADMIN_VIEW_AUDIT_LOGS" },
      req,
    });

    const { user_id, action, entity_type, entity_id, start_date, end_date, limit, offset } =
      req.query as Record<string, string | undefined>;
    const pageLimit = limit ? Math.max(1, Math.min(200, parseInt(limit, 10))) : 100;
    const pageOffset = offset ? Math.max(0, parseInt(offset, 10)) : 0;

    const params: unknown[] = [];
    let query = "SELECT * FROM audit_logs WHERE 1=1";
    let i = 1;

    if (user_id) {
      query += ` AND user_id = $${i++}`;
      params.push(parseInt(user_id, 10));
    }
    if (action) {
      query += ` AND action = $${i++}`;
      params.push(action);
    }
    if (entity_type) {
      query += ` AND entity_type = $${i++}`;
      params.push(entity_type);
    }
    if (entity_id) {
      query += ` AND entity_id = $${i++}`;
      params.push(entity_id);
    }
    if (start_date) {
      query += ` AND created_at >= $${i++}`;
      params.push(start_date);
    }
    if (end_date) {
      query += ` AND created_at <= $${i++}`;
      params.push(end_date);
    }

    query += " ORDER BY created_at DESC";
    query += ` LIMIT $${i++} OFFSET $${i++}`;
    params.push(pageLimit, pageOffset);

    const result = await pool.query(query, params);

    let countQuery = "SELECT COUNT(*)::int as total FROM audit_logs WHERE 1=1";
    const countParams: unknown[] = [];
    let j = 1;

    if (user_id) {
      countQuery += ` AND user_id = $${j++}`;
      countParams.push(parseInt(user_id, 10));
    }
    if (action) {
      countQuery += ` AND action = $${j++}`;
      countParams.push(action);
    }
    if (entity_type) {
      countQuery += ` AND entity_type = $${j++}`;
      countParams.push(entity_type);
    }
    if (entity_id) {
      countQuery += ` AND entity_id = $${j++}`;
      countParams.push(entity_id);
    }
    if (start_date) {
      countQuery += ` AND created_at >= $${j++}`;
      countParams.push(start_date);
    }
    if (end_date) {
      countQuery += ` AND created_at <= $${j++}`;
      countParams.push(end_date);
    }

    const countResult = await pool.query(countQuery, countParams);

    res.json({
      success: true,
      data: result.rows,
      pagination: {
        limit: pageLimit,
        offset: pageOffset,
        total: countResult.rows[0]?.total ?? 0,
        hasMore: pageOffset + result.rows.length < (countResult.rows[0]?.total ?? 0),
      },
    });
  }

  async analytics(req: Request, res: Response): Promise<void> {
    const authReq = requireSuperAdmin(req);

    await createAuditLog({
      userId: authReq.user.id,
      action: AuditActions.VIEW,
      entityType: EntityTypes.USER,
      entityId: authReq.user.id,
      newValues: { action: "SUPER_ADMIN_VIEW_ANALYTICS" },
      req,
    });

    // Minimal analytics: counts by status (no heavy trend computation)
    const attendanceStats = await pool.query<{ present: string }>(
      "SELECT COUNT(*)::text as present FROM attendance WHERE status = 'present'"
    );

    const sosStats = await pool.query<{ open: string }>(
      "SELECT COUNT(*)::text as open FROM incidents WHERE incident_type='SOS' AND status IN ('OPEN','IN_PROGRESS')"
    );

    res.json({
      success: true,
      data: {
        attendancePresent: parseInt(attendanceStats.rows[0]?.present ?? "0", 10),
        pendingSOS: parseInt(sosStats.rows[0]?.open ?? "0", 10),
      },
    });
  }
}

export const superAdminController = new SuperAdminController();
