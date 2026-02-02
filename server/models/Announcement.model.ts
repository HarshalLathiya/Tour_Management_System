import { BaseModel } from "./BaseModel";

export class AnnouncementModel extends BaseModel {
  constructor() {
    super("announcements");
  }

  async getByTourId(tourId: number) {
    return this.findAll({ tour_id: tourId }, "created_at DESC");
  }

  async createAnnouncement(data: { title: string; content: string; tour_id?: number }) {
    return this.create(data);
  }
}

export class SafetyProtocolModel extends BaseModel {
  constructor() {
    super("safety_protocols");
  }

  async getByTourId(tourId: number) {
    return this.findAll({ tour_id: tourId }, "severity DESC, created_at DESC");
  }
}

export const Announcement = new AnnouncementModel();
export const SafetyProtocol = new SafetyProtocolModel();
