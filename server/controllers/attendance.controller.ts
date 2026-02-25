import pool from "../db";
import { Attendance } from "../models/Attendance.model";
import { AppError } from "../middleware/errorHandler";
import { isWithinGeofence } from "../utils/geofencing";
import type { Request, Response } from "express";
import type { AuthenticatedRequest } from "../types";
import { createAuditLog, AuditActions, EntityTypes } from "../utils/auditLogger";

export class AttendanceController {
  async getAll(req: Request, res: Response): Promise<void> {
    const { tour_id, user_id, date, status } = req.query;

    // Build query with user join to get participant names
    let query = `
      SELECT 
        a.id, a.user_id, a.tour_id, a.date, a.status, 
        a.checkpoint_id, a.verified_by, a.verification_time,
        a.location_lat, a.location_lng, a.created_at,
        u.name as user_name, u.email as user_email
      FROM attendance a
      LEFT JOIN users u ON a.user_id = u.id
      WHERE 1=1
    `;
    const params: unknown[] = [];
    let paramIndex = 1;

    if (tour_id) {
      query += ` AND a.tour_id = $${paramIndex++}`;
      params.push(parseInt(tour_id as string));
    }
    if (user_id) {
      query += ` AND a.user_id = $${paramIndex++}`;
      params.push(parseInt(user_id as string));
    }
    if (date) {
      query += ` AND a.date = $${paramIndex++}`;
      params.push(date);
    }
    if (status) {
      query += ` AND a.status = $${paramIndex++}`;
      params.push(status);
    }

    query += ` ORDER BY a.date DESC, a.created_at DESC`;

    // Execute custom query
    const result = await pool.query(query, params);

    res.json({
      success: true,
      data: result.rows,
    });
  }

  async getById(req: Request, res: Response): Promise<void> {
    const id = parseInt(String(req.params.id));
    if (isNaN(id)) throw new AppError(400, "Invalid attendance ID");

    const record = await Attendance.findById(id);
    if (!record) throw new AppError(404, "Attendance record not found");

    // Log the view action
    const authReq = req as AuthenticatedRequest;
    await createAuditLog({
      userId: authReq.user?.id,
      action: AuditActions.VIEW,
      entityType: EntityTypes.ATTENDANCE,
      entityId: id,
      req,
    });

    res.json({ success: true, data: record });
  }

  async create(req: Request, res: Response): Promise<void> {
    const authReq = req as AuthenticatedRequest;
    const userId = authReq.user!.id;

    const {
      tour_id,
      date,
      status,
      checkpoint_id,
      location_lat,
      location_lng,
      place_lat,
      place_lng,
    } = req.body;

    // Geofence validation if location provided
    if (location_lat && location_lng && place_lat && place_lng) {
      const { isWithin } = isWithinGeofence(location_lat, location_lng, place_lat, place_lng);

      if (!isWithin) {
        throw new AppError(400, "Location is outside geofence radius");
      }
    }

    const record = await Attendance.createAttendance({
      user_id: userId,
      tour_id,
      date,
      status,
      checkpoint_id,
      location_lat,
      location_lng,
    });

    // Log the create action
    await createAuditLog({
      userId,
      action: AuditActions.CREATE,
      entityType: EntityTypes.ATTENDANCE,
      entityId: record.id,
      newValues: { tour_id, date, status, checkpoint_id },
      req,
    });

    res.status(201).json({ success: true, data: record });
  }

  async update(req: Request, res: Response): Promise<void> {
    const authReq = req as AuthenticatedRequest;
    const userId = authReq.user!.id;

    const id = parseInt(String(req.params.id));
    if (isNaN(id)) throw new AppError(400, "Invalid attendance ID");

    // Get old record for audit
    const oldRecord = await Attendance.findById(id);

    const { status } = req.body;
    const updated = await Attendance.updateStatus(id, status);

    if (!updated) throw new AppError(404, "Attendance record not found");

    // Log the update action
    await createAuditLog({
      userId,
      action: AuditActions.UPDATE,
      entityType: EntityTypes.ATTENDANCE,
      entityId: id,
      oldValues: oldRecord ? { status: oldRecord.status } : undefined,
      newValues: { status },
      req,
    });

    res.json({ success: true, data: updated });
  }

  async verify(req: Request, res: Response): Promise<void> {
    const authReq = req as AuthenticatedRequest;
    const userId = authReq.user!.id;

    const id = parseInt(String(req.params.id));
    if (isNaN(id)) throw new AppError(400, "Invalid attendance ID");

    const verified = await Attendance.verifyAttendance(id, userId);
    if (!verified) throw new AppError(404, "Attendance record not found");

    // Log the verify action
    await createAuditLog({
      userId,
      action: AuditActions.VERIFY,
      entityType: EntityTypes.ATTENDANCE,
      entityId: id,
      newValues: { verified_by: userId },
      req,
    });

    res.json({ success: true, data: verified });
  }

  async delete(req: Request, res: Response): Promise<void> {
    const authReq = req as AuthenticatedRequest;
    const userId = authReq.user!.id;

    const id = parseInt(String(req.params.id));
    if (isNaN(id)) throw new AppError(400, "Invalid attendance ID");

    // Get old record for audit
    const oldRecord = await Attendance.findById(id);

    const deleted = await Attendance.deleteById(id);
    if (!deleted) throw new AppError(404, "Attendance record not found");

    // Log the delete action
    await createAuditLog({
      userId,
      action: AuditActions.DELETE,
      entityType: EntityTypes.ATTENDANCE,
      entityId: id,
      oldValues: oldRecord || undefined,
      req,
    });

    res.json({ success: true, message: "Attendance record deleted" });
  }

  async getUnverified(req: Request, res: Response): Promise<void> {
    const tour_id = req.params.tour_id;

    if (!tour_id || Array.isArray(tour_id)) {
      throw new AppError(400, "Tour ID is required");
    }

    const parsedTourId = parseInt(tour_id);
    if (isNaN(parsedTourId)) {
      throw new AppError(400, "Invalid Tour ID");
    }

    const query = `
      SELECT 
        a.id, a.user_id, a.tour_id, a.date, a.status, 
        a.checkpoint_id, a.verified_by, a.verification_time,
        a.location_lat, a.location_lng, a.created_at,
        u.name as user_name, u.email as user_email
      FROM attendance a
      LEFT JOIN users u ON a.user_id = u.id
      WHERE a.tour_id = $1 AND a.verified_by IS NULL
      ORDER BY a.date DESC, a.created_at DESC
    `;

    const result = await pool.query(query, [parsedTourId]);

    res.json({
      success: true,
      data: result.rows,
    });
  }
}

export const attendanceController = new AttendanceController();
