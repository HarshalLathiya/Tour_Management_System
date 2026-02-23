import { BaseModel } from "./BaseModel";

export interface AccommodationData {
  id?: number;
  tour_id: number;
  name: string;
  address?: string;
  check_in_date?: string;
  check_out_date?: string;
  contact_number?: string;
}

export interface RoomAssignmentData {
  id?: number;
  accommodation_id: number;
  user_id: number;
  room_number?: string;
  room_type?: string;
  notes?: string;
}

interface RoomAssignmentRow {
  id: number;
  accommodation_id: number;
  user_id: number;
  room_number: string | null;
  room_type: string | null;
  notes: string | null;
  created_at: Date;
  updated_at: Date;
  profile_full_name: string | null;
}

export class AccommodationModel extends BaseModel {
  constructor() {
    super("accommodations");
  }

  async getByTourId(tourId: number) {
    return this.findAll({ tour_id: tourId }, "created_at DESC");
  }

  async createAccommodation(data: AccommodationData) {
    return this.create(data as unknown as Record<string, unknown>);
  }

  async updateAccommodation(id: number, data: Partial<AccommodationData>) {
    return this.updateById(id, { ...data, updated_at: new Date() });
  }

  async deleteAccommodation(id: number) {
    return this.deleteById(id);
  }

  async getRoomAssignments(accommodationId: number) {
    const result = await this.query<RoomAssignmentRow>(
      `SELECT ra.*, u.name as profile_full_name 
       FROM room_assignments ra 
       LEFT JOIN users u ON ra.user_id = u.id 
       WHERE ra.accommodation_id = $1 
       ORDER BY ra.created_at DESC`,
      [accommodationId]
    );
    // Transform the result to match frontend expected format
    return result.rows.map((row) => ({
      ...row,
      profile: {
        full_name: row.profile_full_name || "Unknown",
      },
    }));
  }

  async createRoomAssignment(data: RoomAssignmentData) {
    return this.query(
      `INSERT INTO room_assignments (accommodation_id, user_id, room_number, room_type, notes) 
       VALUES ($1, $2, $3, $4, $5) 
       RETURNING *`,
      [data.accommodation_id, data.user_id, data.room_number, data.room_type, data.notes]
    );
  }

  async deleteRoomAssignment(id: number) {
    return this.query("DELETE FROM room_assignments WHERE id = $1 RETURNING *", [id]);
  }

  async getTourParticipants(tourId: number) {
    // First try to get participants from attendance table
    const result = await this.query(
      `SELECT DISTINCT a.user_id, u.name 
       FROM attendance a 
       JOIN users u ON a.user_id = u.id 
       WHERE a.tour_id = $1`,
      [tourId]
    );

    // If no participants from attendance, get all users (excluding admin)
    if (result.rows.length === 0) {
      const allUsers = await this.query(
        `SELECT id as user_id, name FROM users WHERE role != 'admin'`
      );
      return allUsers.rows;
    }

    return result.rows;
  }
}

export const Accommodation = new AccommodationModel();
