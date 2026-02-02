import { BaseModel } from "./BaseModel";

export class AttendanceModel extends BaseModel {
  constructor() {
    super("attendance");
  }

  async getAll(filters?: { tour_id?: number; user_id?: number; date?: string; status?: string }) {
    return this.findAll(filters, "date DESC, created_at DESC");
  }

  async createAttendance(data: {
    user_id: number;
    tour_id: number;
    date: string;
    status: string;
    checkpoint_id?: number;
    location_lat?: number;
    location_lng?: number;
    verified_by?: number;
  }) {
    return this.create(data);
  }

  async verifyAttendance(id: number, verifiedBy: number) {
    return this.updateById(id, {
      verified_by: verifiedBy,
      verification_time: new Date(),
    });
  }

  async updateStatus(id: number, status: string) {
    return this.updateById(id, { status });
  }
}

export const Attendance = new AttendanceModel();
