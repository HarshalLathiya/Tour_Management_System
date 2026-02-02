import { Attendance } from "../models/Attendance.model";
import { AppError } from "../middleware/errorHandler";
import { isWithinGeofence } from "../utils/geofencing";
import type { Request, Response } from "express";
import type { AuthenticatedRequest } from "../types";

export class AttendanceController {
  async getAll(req: Request, res: Response): Promise<void> {
    const { tour_id, user_id, date, status } = req.query;

    const filters: any = {};
    if (tour_id) filters.tour_id = parseInt(tour_id as string);
    if (user_id) filters.user_id = parseInt(user_id as string);
    if (date) filters.date = date;
    if (status) filters.status = status;

    const records = await Attendance.getAll(filters);

    res.json({
      success: true,
      data: records,
    });
  }

  async getById(req: Request, res: Response): Promise<void> {
    const id = parseInt(req.params.id);
    if (isNaN(id)) throw new AppError(400, "Invalid attendance ID");

    const record = await Attendance.findById(id);
    if (!record) throw new AppError(404, "Attendance record not found");

    res.json({ success: true, data: record });
  }

  async create(req: Request, res: Response): Promise<void> {
    const userId = (req as AuthenticatedRequest).user!.id;
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
      const { isWithin } = isWithinGeofence(
        location_lat,
        location_lng,
        place_lat,
        place_lng
      );

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

    res.status(201).json({ success: true, data: record });
  }

  async update(req: Request, res: Response): Promise<void> {
    const id = parseInt(req.params.id);
    if (isNaN(id)) throw new AppError(400, "Invalid attendance ID");

    const { status } = req.body;
    const updated = await Attendance.updateStatus(id, status);

    if (!updated) throw new AppError(404, "Attendance record not found");

    res.json({ success: true, data: updated });
  }

  async verify(req: Request, res: Response): Promise<void> {
    const id = parseInt(req.params.id);
    const verifiedBy = (req as AuthenticatedRequest).user!.id;

    if (isNaN(id)) throw new AppError(400, "Invalid attendance ID");

    const verified = await Attendance.verifyAttendance(id, verifiedBy);
    if (!verified) throw new AppError(404, "Attendance record not found");

    res.json({ success: true, data: verified });
  }

  async delete(req: Request, res: Response): Promise<void> {
    const id = parseInt(req.params.id);
    if (isNaN(id)) throw new AppError(400, "Invalid attendance ID");

    const deleted = await Attendance.deleteById(id);
    if (!deleted) throw new AppError(404, "Attendance record not found");

    res.json({ success: true, message: "Attendance record deleted" });
  }
}

export const attendanceController = new AttendanceController();
