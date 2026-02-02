import { BaseModel } from "./BaseModel";

export class ItineraryModel extends BaseModel {
  constructor() {
    super("itineraries");
  }

  async getByTourId(tourId: number) {
    return this.findAll({ tour_id: tourId }, "date ASC, start_time ASC");
  }

  async createItinerary(data: {
    tour_id: number;
    route_id?: number;
    date: string;
    title: string;
    description?: string;
    start_time?: string;
    end_time?: string;
    status?: string;
  }) {
    return this.create(data);
  }

  async updateStatus(id: number, status: string) {
    return this.updateById(id, { status, updated_at: new Date() });
  }
}

export class RouteModel extends BaseModel {
  constructor() {
    super("routes");
  }

  async getByTourId(tourId: number) {
    return this.findAll({ tour_id: tourId });
  }
}

export class CheckpointModel extends BaseModel {
  constructor() {
    super("checkpoints");
  }

  async getByRouteId(routeId: number) {
    return this.findAll({ route_id: routeId }, "sequence_order ASC");
  }
}

export const Itinerary = new ItineraryModel();
export const Route = new RouteModel();
export const Checkpoint = new CheckpointModel();
