import { BaseModel } from "./BaseModel";

export class IncidentModel extends BaseModel {
  constructor() {
    super("incidents");
  }

  async getAll(filters?: {
    tour_id?: number;
    severity?: string;
    status?: string;
    incident_type?: string;
  }) {
    return this.findAll(filters, "created_at DESC");
  }

  async createIncident(data: {
    tour_id: number;
    reported_by: number;
    title: string;
    description: string;
    location?: string;
    severity?: string;
    status?: string;
    incident_type?: string;
    health_category?: string;
  }) {
    // Set default status to "OPEN" if not provided or null
    const incidentData = {
      ...data,
      status: data.status || "OPEN",
    };
    return this.create(incidentData);
  }

  async triggerSOS(data: {
    tour_id: number;
    reported_by: number;
    location?: string;
    description?: string;
  }) {
    return this.create({
      ...data,
      title: "SOS Emergency Alert",
      description: data.description || "SOS Emergency Alert triggered",
      incident_type: "SOS",
      severity: "CRITICAL",
      status: "OPEN",
    });
  }

  async reportHealth(data: {
    tour_id: number;
    reported_by: number;
    health_category: string;
    description: string;
    location?: string;
    severity?: string;
  }) {
    return this.create({
      ...data,
      title: `Health Issue: ${data.health_category}`,
      incident_type: "HEALTH",
      status: "OPEN",
    });
  }

  async respondToIncident(id: number, respondedBy: number) {
    return this.updateById(id, {
      status: "IN_PROGRESS",
      responded_by: respondedBy,
      response_time: new Date(),
      updated_at: new Date(),
    });
  }

  async resolveIncident(id: number, resolution: string) {
    return this.updateById(id, {
      status: "RESOLVED",
      resolution_notes: resolution,
      updated_at: new Date(),
    });
  }
}

export const Incident = new IncidentModel();
