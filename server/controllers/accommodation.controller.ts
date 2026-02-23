import { Accommodation } from "../models/Accommodation.model";
import { AppError } from "../middleware/errorHandler";
import type { Request, Response } from "express";
import type { AuthenticatedRequest } from "../types";

function parseId(id: unknown): number {
  if (!id) throw new AppError(400, "ID is required");
  const idStr = Array.isArray(id) ? id[0] : String(id);
  const parsed = parseInt(idStr);
  if (isNaN(parsed)) throw new AppError(400, "Invalid ID format");
  return parsed;
}

export class AccommodationController {
  async getByTourId(req: Request, res: Response): Promise<void> {
    const tourId = parseId(req.params.tourId);
    const accommodations = await Accommodation.getByTourId(tourId);
    res.json({ success: true, data: accommodations });
  }

  async create(req: Request, res: Response): Promise<void> {
    const authReq = req as AuthenticatedRequest;
    const userId = authReq.user!.id;

    const { tour_id, name, address, check_in_date, check_out_date, contact_number } = req.body;

    if (!tour_id || !name) {
      throw new AppError(400, "Tour ID and name are required");
    }

    const accommodation = await Accommodation.createAccommodation({
      tour_id: parseInt(tour_id),
      name,
      address,
      check_in_date,
      check_out_date,
      contact_number,
    });

    res.status(201).json({ success: true, data: accommodation });
  }

  async update(req: Request, res: Response): Promise<void> {
    const id = parseId(req.params.id);
    const updated = await Accommodation.updateAccommodation(id, req.body);

    if (!updated) {
      throw new AppError(404, "Accommodation not found");
    }

    res.json({ success: true, data: updated });
  }

  async delete(req: Request, res: Response): Promise<void> {
    const id = parseId(req.params.id);
    const deleted = await Accommodation.deleteAccommodation(id);

    if (!deleted) {
      throw new AppError(404, "Accommodation not found");
    }

    res.json({ success: true, message: "Accommodation deleted" });
  }

  async getRoomAssignments(req: Request, res: Response): Promise<void> {
    const accommodationId = parseId(req.params.accommodationId);
    const assignments = await Accommodation.getRoomAssignments(accommodationId);
    res.json({ success: true, data: assignments });
  }

  async createRoomAssignment(req: Request, res: Response): Promise<void> {
    const accommodationId = parseId(req.params.accommodationId);
    const { user_id, room_number, room_type, notes } = req.body;

    if (!user_id) {
      throw new AppError(400, "User ID is required");
    }

    const assignment = await Accommodation.createRoomAssignment({
      accommodation_id: accommodationId,
      user_id: parseInt(user_id),
      room_number,
      room_type,
      notes,
    });

    res.status(201).json({ success: true, data: assignment.rows[0] });
  }

  async deleteRoomAssignment(req: Request, res: Response): Promise<void> {
    const assignmentId = parseId(req.params.assignmentId);
    const deleted = await Accommodation.deleteRoomAssignment(assignmentId);

    if (!deleted) {
      throw new AppError(404, "Room assignment not found");
    }

    res.json({ success: true, message: "Room assignment deleted" });
  }

  async getTourParticipants(req: Request, res: Response): Promise<void> {
    const tourId = parseId(req.params.tourId);
    const participants = await Accommodation.getTourParticipants(tourId);
    res.json({ success: true, data: participants });
  }
}

export const accommodationController = new AccommodationController();
