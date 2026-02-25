import { Tour } from "../models/Tour.model";
import { User } from "../models/User.model";
import { AppError } from "../middleware/errorHandler";
import type { Request, Response } from "express";
import type { AuthenticatedRequest } from "../types";
import { createAuditLog, AuditActions, EntityTypes } from "../utils/auditLogger";

/**
 * Tour Controller - Handles tour management business logic
 */
export class TourController {
  /**
   * Get all tours
   */
  async getAllTours(req: Request, res: Response): Promise<void> {
    const { status, leader_id } = req.query as {
      status?: string;
      leader_id?: string;
    };

    const filters: Record<string, unknown> = {};
    if (status) filters.status = status;
    if (leader_id) filters.assignedLeaderId = parseInt(leader_id);

    const tours = await Tour.getAllTours(filters);

    res.json({
      success: true,
      data: tours,
    });
  }

  /**
   * Get tour by ID
   */
  async getTourById(req: Request, res: Response): Promise<void> {
    const id = parseInt(String(req.params.id));

    if (isNaN(id)) {
      throw new AppError(400, "Invalid tour ID");
    }

    const tour = await Tour.getTourById(id);

    if (!tour) {
      throw new AppError(404, "Tour not found");
    }

    // Log the view action
    const authReq = req as AuthenticatedRequest;
    await createAuditLog({
      userId: authReq.user?.id,
      action: AuditActions.VIEW,
      entityType: EntityTypes.TOUR,
      entityId: id,
      req,
    });

    res.json({
      success: true,
      data: tour,
    });
  }

  /**
   * Create a new tour (Admin only)
   */
  async createTour(req: Request, res: Response): Promise<void> {
    const authReq = req as AuthenticatedRequest;
    const userId = authReq.user?.id;

    const { name, description, start_date, end_date, destination, price, status, content } =
      req.body;

    // Validate dates
    if (start_date && end_date) {
      const startDate = new Date(start_date);
      const endDate = new Date(end_date);

      if (endDate <= startDate) {
        throw new AppError(400, "End date must be after start date");
      }
    }

    const tour = await Tour.createTour({
      name,
      description,
      start_date,
      end_date,
      destination,
      price,
      status,
      content,
    });

    // Log the create action
    await createAuditLog({
      userId,
      action: AuditActions.CREATE,
      entityType: EntityTypes.TOUR,
      entityId: tour.id,
      newValues: { name, description, start_date, end_date, destination, price, status },
      req,
    });

    res.status(201).json({
      success: true,
      message: "Tour created successfully",
      data: tour,
    });
  }

  /**
   * Update tour (Admin only)
   */
  async updateTour(req: Request, res: Response): Promise<void> {
    const authReq = req as AuthenticatedRequest;
    const userId = authReq.user?.id;

    const id = parseInt(String(req.params.id));

    if (isNaN(id)) {
      throw new AppError(400, "Invalid tour ID");
    }

    // Get old tour data for audit
    const oldTour = await Tour.getTourById(id);

    const { name, description, start_date, end_date, destination, price, status, content } =
      req.body;

    // Validate dates if both provided
    if (start_date && end_date) {
      const startDate = new Date(start_date);
      const endDate = new Date(end_date);

      if (endDate <= startDate) {
        throw new AppError(400, "End date must be after start date");
      }
    }

    const updatedTour = await Tour.updateTour(id, {
      name,
      description,
      start_date,
      end_date,
      destination,
      price,
      status,
      content,
    });

    if (!updatedTour) {
      throw new AppError(404, "Tour not found");
    }

    // Log the update action
    await createAuditLog({
      userId,
      action: AuditActions.UPDATE,
      entityType: EntityTypes.TOUR,
      entityId: id,
      oldValues: oldTour ? { ...oldTour } : undefined,
      newValues: { name, description, start_date, end_date, destination, price, status },
      req,
    });

    res.json({
      success: true,
      message: "Tour updated successfully",
      data: updatedTour,
    });
  }

  /**
   * Delete tour (Admin only)
   */
  async deleteTour(req: Request, res: Response): Promise<void> {
    const authReq = req as AuthenticatedRequest;
    const userId = authReq.user?.id;

    const id = parseInt(String(req.params.id));

    if (isNaN(id)) {
      throw new AppError(400, "Invalid tour ID");
    }

    // Get old tour data for audit
    const oldTour = await Tour.getTourById(id);

    const deleted = await Tour.deleteTour(id);

    if (!deleted) {
      throw new AppError(404, "Tour not found");
    }

    // Log the delete action
    await createAuditLog({
      userId,
      action: AuditActions.DELETE,
      entityType: EntityTypes.TOUR,
      entityId: id,
      oldValues: oldTour ? { ...oldTour } : undefined,
      req,
    });

    res.json({
      success: true,
      message: "Tour deleted successfully",
    });
  }

  /**
   * Assign leader to tour (Admin only)
   */
  async assignLeader(req: Request, res: Response): Promise<void> {
    const authReq = req as AuthenticatedRequest;
    const userId = authReq.user?.id;

    const tourId = parseInt(String(req.params.id));
    const { leader_id } = req.body as { leader_id: number };

    if (isNaN(tourId)) {
      throw new AppError(400, "Invalid tour ID");
    }

    if (!leader_id) {
      throw new AppError(400, "Leader ID is required");
    }

    // Check if tour exists
    const tour = await Tour.getTourById(tourId);
    if (!tour) {
      throw new AppError(404, "Tour not found");
    }

    // Check if user exists and has 'guide' role
    const leader = await User.findByIdSafe(leader_id);
    if (!leader) {
      throw new AppError(404, "Leader not found");
    }

    if (leader.role !== "guide") {
      throw new AppError(400, "User must have 'guide' role to be assigned as leader");
    }

    // Assign leader
    const updatedTour = await Tour.assignLeader(tourId, leader_id);

    // Log the assign action
    await createAuditLog({
      userId,
      action: AuditActions.ASSIGN,
      entityType: EntityTypes.TOUR,
      entityId: tourId,
      oldValues: { assigned_leader_id: tour.assigned_leader_id },
      newValues: { assigned_leader_id: leader_id, leader_name: leader.name },
      req,
    });

    res.json({
      success: true,
      message: "Leader assigned successfully",
      data: updatedTour,
    });
  }

  /**
   * Unassign leader from tour (Admin only)
   */
  async unassignLeader(req: Request, res: Response): Promise<void> {
    const authReq = req as AuthenticatedRequest;
    const currentUserId = authReq.user?.id;

    const tourId = parseInt(String(req.params.id));

    if (isNaN(tourId)) {
      throw new AppError(400, "Invalid tour ID");
    }

    // Check if tour exists
    const tour = await Tour.getTourById(tourId);
    if (!tour) {
      throw new AppError(404, "Tour not found");
    }

    // Unassign leader
    const updatedTour = await Tour.unassignLeader(tourId);

    // Log the unassign action
    await createAuditLog({
      userId: currentUserId,
      action: AuditActions.UNASSIGN,
      entityType: EntityTypes.TOUR,
      entityId: tourId,
      oldValues: { assigned_leader_id: tour.assigned_leader_id },
      newValues: { assigned_leader_id: null },
      req,
    });

    res.json({
      success: true,
      message: "Leader unassigned successfully",
      data: updatedTour,
    });
  }

  /**
   * Get tours assigned to current leader
   */
  async getMyAssignedTours(req: Request, res: Response): Promise<void> {
    const userId = (req as AuthenticatedRequest).user!.id;
    const userRole = (req as AuthenticatedRequest).user!.role;

    // Only leaders can access this endpoint
    if (userRole !== "guide") {
      throw new AppError(403, "Only leaders can access their assigned tours");
    }

    const tours = await Tour.getToursByLeaderId(userId);

    res.json({
      success: true,
      data: tours,
    });
  }

  /**
   * Get upcoming tours
   */
  async getUpcomingTours(_req: Request, res: Response): Promise<void> {
    const tours = await Tour.getUpcomingTours();

    res.json({
      success: true,
      data: tours,
    });
  }

  /**
   * Get ongoing tours
   */
  async getOngoingTours(_req: Request, res: Response): Promise<void> {
    const tours = await Tour.getOngoingTours();

    res.json({
      success: true,
      data: tours,
    });
  }

  /**
   * Get completed tours
   */
  async getCompletedTours(_req: Request, res: Response): Promise<void> {
    const tours = await Tour.getCompletedTours();

    res.json({
      success: true,
      data: tours,
    });
  }

  /**
   * Get tour participants
   */
  async getTourParticipants(req: Request, res: Response): Promise<void> {
    const tourId = parseInt(String(req.params.id));

    if (isNaN(tourId)) {
      throw new AppError(400, "Invalid tour ID");
    }

    // Check if tour exists
    const tour = await Tour.getTourById(tourId);
    if (!tour) {
      throw new AppError(404, "Tour not found");
    }

    // Get participants from tour_users table
    const participants = await Tour.getTourParticipants(tourId);

    res.json({
      success: true,
      data: participants,
    });
  }

  /**
   * Join a tour as participant
   */
  async joinTour(req: Request, res: Response): Promise<void> {
    const authReq = req as AuthenticatedRequest;
    const userId = authReq.user?.id;

    const tourId = parseInt(String(req.params.id));

    if (isNaN(tourId)) {
      throw new AppError(400, "Invalid tour ID");
    }

    // Check if tour exists
    const tour = await Tour.getTourById(tourId);
    if (!tour) {
      throw new AppError(404, "Tour not found");
    }

    // Check if tour is not cancelled
    if (tour.status === "cancelled") {
      throw new AppError(400, "Cannot join a cancelled tour");
    }

    // Check if already a participant
    const isAlreadyParticipant = await Tour.isParticipant(tourId, userId!);
    if (isAlreadyParticipant) {
      throw new AppError(400, "You are already a participant of this tour");
    }

    // Join the tour
    await Tour.joinTour(tourId, userId!);

    // Log the action
    await createAuditLog({
      userId,
      action: AuditActions.JOIN,
      entityType: EntityTypes.TOUR,
      entityId: tourId,
      newValues: { action: "joined tour" },
      req,
    });

    res.json({
      success: true,
      message: "Successfully joined the tour",
    });
  }

  /**
   * Leave a tour
   */
  async leaveTour(req: Request, res: Response): Promise<void> {
    const authReq = req as AuthenticatedRequest;
    const userId = authReq.user?.id;

    const tourId = parseInt(String(req.params.id));

    if (isNaN(tourId)) {
      throw new AppError(400, "Invalid tour ID");
    }

    // Check if tour exists
    const tour = await Tour.getTourById(tourId);
    if (!tour) {
      throw new AppError(404, "Tour not found");
    }

    // Check if already a participant
    const isParticipant = await Tour.isParticipant(tourId, userId!);
    if (!isParticipant) {
      throw new AppError(400, "You are not a participant of this tour");
    }

    // Leave the tour
    const left = await Tour.leaveTour(tourId, userId!);

    if (!left) {
      throw new AppError(500, "Failed to leave tour");
    }

    // Log the action
    await createAuditLog({
      userId,
      action: AuditActions.LEAVE,
      entityType: EntityTypes.TOUR,
      entityId: tourId,
      newValues: { action: "left tour" },
      req,
    });

    res.json({
      success: true,
      message: "Successfully left the tour",
    });
  }

  /**
   * Check if current user is participant of a tour
   */
  async checkParticipation(req: Request, res: Response): Promise<void> {
    const authReq = req as AuthenticatedRequest;
    const userId = authReq.user?.id;

    const tourId = parseInt(String(req.params.id));

    if (isNaN(tourId)) {
      throw new AppError(400, "Invalid tour ID");
    }

    const isParticipant = await Tour.isParticipant(tourId, userId!);

    res.json({
      success: true,
      data: { isParticipant },
    });
  }

  /**
   * Get all tours a user is participating in
   */
  async getUserTours(req: Request, res: Response): Promise<void> {
    const userId = parseInt(String(req.params.userId));

    if (isNaN(userId)) {
      throw new AppError(400, "Invalid user ID");
    }

    const tours = await Tour.getUserTours(userId);

    res.json({
      success: true,
      data: tours,
    });
  }
}

// Export singleton instance
export const tourController = new TourController();
