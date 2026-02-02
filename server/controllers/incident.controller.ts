import { Incident } from "../models/Incident.model";
import { User } from "../models/User.model";
import { AppError } from "../middleware/errorHandler";
import { notificationService } from "../services/notification.service";
import type { Request, Response } from "express";
import type { AuthenticatedRequest } from "../types";

export class IncidentController {
  async getAll(req: Request, res: Response): Promise<void> {
    const { tour_id, severity, status, incident_type } = req.query;

    const filters: any = {};
    if (tour_id) filters.tour_id = parseInt(tour_id as string);
    if (severity) filters.severity = severity;
    if (status) filters.status = status;
    if (incident_type) filters.incident_type = incident_type;

    const incidents = await Incident.getAll(filters);

    res.json({ success: true, data: incidents });
  }

  async getById(req: Request, res: Response): Promise<void> {
    const id = parseInt(req.params.id);
    if (isNaN(id)) throw new AppError(400, "Invalid incident ID");

    const incident = await Incident.findById(id);
    if (!incident) throw new AppError(404, "Incident not found");

    res.json({ success: true, data: incident });
  }

  async create(req: Request, res: Response): Promise<void> {
    const reportedBy = (req as AuthenticatedRequest).user!.id;
    const {
      tour_id,
      title,
      description,
      location,
      severity,
      status,
      incident_type,
      health_category,
    } = req.body;

    const incident = await Incident.createIncident({
      tour_id,
      reported_by: reportedBy,
      title,
      description,
      location,
      severity,
      status,
      incident_type,
      health_category,
    });

    res.status(201).json({ success: true, data: incident });
  }

  async triggerSOS(req: Request, res: Response): Promise<void> {
    const reportedBy = (req as AuthenticatedRequest).user!.id;
    const { tour_id, location, description } = req.body;

    const sos = await Incident.triggerSOS({
      tour_id,
      reported_by: reportedBy,
      location,
      description,
    });

    // Get user info for notification
    const user = await User.findByIdSafe(reportedBy);
    const reportedByName = user?.name || "Unknown User";

    // Send real-time notification to leaders and admins
    notificationService.notifySOSAlert({
      incidentId: sos.id,
      tourId: tour_id,
      reportedBy,
      reportedByName,
      location,
      description,
    });

    res.status(201).json({
      success: true,
      message: "SOS alert triggered successfully",
      data: sos,
    });
  }

  async reportHealth(req: Request, res: Response): Promise<void> {
    const reportedBy = (req as AuthenticatedRequest).user!.id;
    const { tour_id, health_category, description, location, severity } = req.body;

    if (!health_category) {
      throw new AppError(400, "Health category is required");
    }

    const healthIssue = await Incident.reportHealth({
      tour_id,
      reported_by: reportedBy,
      health_category,
      description,
      location,
      severity: severity || "MEDIUM",
    });

    // Get user info for notification
    const user = await User.findByIdSafe(reportedBy);
    const reportedByName = user?.name || "Unknown User";

    // Send notification to leaders
    notificationService.notifyHealthIssue({
      incidentId: healthIssue.id,
      tourId: tour_id,
      reportedBy,
      reportedByName,
      healthCategory: health_category,
      description,
      severity: severity || "MEDIUM",
    });

    res.status(201).json({
      success: true,
      message: "Health issue reported successfully",
      data: healthIssue,
    });
  }

  async respond(req: Request, res: Response): Promise<void> {
    const id = parseInt(req.params.id);
    const respondedBy = (req as AuthenticatedRequest).user!.id;

    if (isNaN(id)) throw new AppError(400, "Invalid incident ID");

    const incident = await Incident.respondToIncident(id, respondedBy);
    if (!incident) throw new AppError(404, "Incident not found");

    // Get responder info
    const responder = await User.findByIdSafe(respondedBy);
    const respondedByName = responder?.name || "Unknown User";

    // Notify the reporter
    notificationService.notifyIncidentResponse({
      incidentId: id,
      respondedBy,
      respondedByName,
      reportedBy: incident.reported_by,
    });

    res.json({
      success: true,
      message: "Incident marked as in progress",
      data: incident,
    });
  }

  async resolve(req: Request, res: Response): Promise<void> {
    const id = parseInt(req.params.id);
    const resolvedBy = (req as AuthenticatedRequest).user!.id;
    const { resolution_notes } = req.body;

    if (isNaN(id)) throw new AppError(400, "Invalid incident ID");
    if (!resolution_notes) {
      throw new AppError(400, "Resolution notes are required");
    }

    const incident = await Incident.resolveIncident(id, resolution_notes);
    if (!incident) throw new AppError(404, "Incident not found");

    // Get resolver info
    const resolver = await User.findByIdSafe(resolvedBy);
    const resolvedByName = resolver?.name || "Unknown User";

    // Notify the reporter
    notificationService.notifyIncidentResolution({
      incidentId: id,
      resolvedBy,
      resolvedByName,
      reportedBy: incident.reported_by,
      resolutionNotes: resolution_notes,
    });

    res.json({
      success: true,
      message: "Incident resolved successfully",
      data: incident,
    });
  }

  async update(req: Request, res: Response): Promise<void> {
    const id = parseInt(req.params.id);
    if (isNaN(id)) throw new AppError(400, "Invalid incident ID");

    const updated = await Incident.updateById(id, req.body);
    if (!updated) throw new AppError(404, "Incident not found");

    res.json({ success: true, data: updated });
  }

  async delete(req: Request, res: Response): Promise<void> {
    const id = parseInt(req.params.id);
    if (isNaN(id)) throw new AppError(400, "Invalid incident ID");

    const deleted = await Incident.deleteById(id);
    if (!deleted) throw new AppError(404, "Incident not found");

    res.json({ success: true, message: "Incident deleted" });
  }
}

export const incidentController = new IncidentController();
