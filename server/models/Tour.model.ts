import { BaseModel } from "./BaseModel";
import type { TourRow } from "../types";

/**
 * Tour Model - Handles all tour-related database operations
 */
export class TourModel extends BaseModel {
  constructor() {
    super("tours");
  }

  /**
   * Get all tours with optional filters
   */
  async getAllTours(filters?: { status?: string; assignedLeaderId?: number }): Promise<TourRow[]> {
    let query = `
      SELECT t.*, u.name as leader_name, u.email as leader_email
      FROM tours t
      LEFT JOIN users u ON t.assigned_leader_id = u.id
      WHERE 1=1
    `;
    const params: unknown[] = [];
    let paramIndex = 1;

    if (filters?.status) {
      query += ` AND t.status = $${paramIndex++}`;
      params.push(filters.status);
    }

    if (filters?.assignedLeaderId) {
      query += ` AND t.assigned_leader_id = $${paramIndex++}`;
      params.push(filters.assignedLeaderId);
    }

    query += " ORDER BY t.created_at DESC";

    const result = await this.query<TourRow>(query, params);
    return result.rows;
  }

  /**
   * Get tour by ID with leader details
   */
  async getTourById(id: number): Promise<TourRow | null> {
    const query = `
      SELECT t.*, u.name as leader_name, u.email as leader_email
      FROM tours t
      LEFT JOIN users u ON t.assigned_leader_id = u.id
      WHERE t.id = $1
    `;
    const result = await this.query<TourRow>(query, [id]);
    return result.rows[0] || null;
  }

  /**
   * Create a new tour
   */
  async createTour(data: {
    name: string;
    description?: string;
    start_date?: Date | string;
    end_date?: Date | string;
    destination?: string;
    price?: number;
    status?: string;
    content?: string;
  }): Promise<TourRow> {
    const {
      name,
      description,
      start_date,
      end_date,
      destination,
      price,
      status = "planned",
      content,
    } = data;

    const result = await this.query<TourRow>(
      `INSERT INTO tours (name, description, start_date, end_date, destination, price, status, content)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING *`,
      [name, description, start_date, end_date, destination, price, status, content]
    );

    const row = result.rows[0];

    if (!row) {
      throw new Error("Failed to create tour: no row returned");
    }

    return row;
  }
  /**
   * Update tour by ID
   */
  async updateTour(
    id: number,
    data: {
      name?: string;
      description?: string;
      start_date?: Date | string;
      end_date?: Date | string;
      destination?: string;
      price?: number;
      status?: string;
      content?: string;
    }
  ): Promise<TourRow | null> {
    const fields: string[] = [];
    const values: unknown[] = [];
    let paramIndex = 1;

    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined) {
        fields.push(`${key} = $${paramIndex++}`);
        values.push(value);
      }
    });

    if (fields.length === 0) {
      return null;
    }

    values.push(id);

    const query = `
      UPDATE tours
      SET ${fields.join(", ")}
      WHERE id = $${paramIndex}
      RETURNING *
    `;

    const result = await this.query<TourRow>(query, values);
    return result.rows[0] || null;
  }

  /**
   * Delete tour by ID
   */
  async deleteTour(id: number): Promise<boolean> {
    return this.deleteById(id);
  }

  /**
   * Assign leader to tour
   */
  async assignLeader(tourId: number, leaderId: number): Promise<TourRow | null> {
    const result = await this.query<TourRow>(
      `UPDATE tours
       SET assigned_leader_id = $1, leader_assigned_at = CURRENT_TIMESTAMP
       WHERE id = $2
       RETURNING *`,
      [leaderId, tourId]
    );

    return result.rows[0] || null;
  }

  /**
   * Unassign leader from tour
   */
  async unassignLeader(tourId: number): Promise<TourRow | null> {
    const result = await this.query<TourRow>(
      `UPDATE tours
       SET assigned_leader_id = NULL, leader_assigned_at = NULL
       WHERE id = $1
       RETURNING *`,
      [tourId]
    );

    return result.rows[0] || null;
  }

  /**
   * Get all tours assigned to a specific leader
   */
  async getToursByLeaderId(leaderId: number): Promise<TourRow[]> {
    const query = `
      SELECT t.*, u.name as leader_name, u.email as leader_email
      FROM tours t
      LEFT JOIN users u ON t.assigned_leader_id = u.id
      WHERE t.assigned_leader_id = $1
      ORDER BY t.start_date ASC
    `;
    const result = await this.query<TourRow>(query, [leaderId]);
    return result.rows;
  }

  /**
   * Get tours by status
   */
  async getToursByStatus(status: string): Promise<TourRow[]> {
    return this.findAll<TourRow>({ status }, "start_date ASC");
  }

  /**
   * Count tours by status
   */
  async countByStatus(status: string): Promise<number> {
    return this.count({ status });
  }

  /**
   * Get upcoming tours (future start date)
   */
  async getUpcomingTours(): Promise<TourRow[]> {
    const query = `
      SELECT t.*, u.name as leader_name, u.email as leader_email
      FROM tours t
      LEFT JOIN users u ON t.assigned_leader_id = u.id
      WHERE t.start_date > CURRENT_DATE
      ORDER BY t.start_date ASC
    `;
    const result = await this.query<TourRow>(query);
    return result.rows;
  }

  /**
   * Get ongoing tours (current date between start and end)
   */
  async getOngoingTours(): Promise<TourRow[]> {
    const query = `
      SELECT t.*, u.name as leader_name, u.email as leader_email
      FROM tours t
      LEFT JOIN users u ON t.assigned_leader_id = u.id
      WHERE CURRENT_DATE BETWEEN t.start_date AND t.end_date
      ORDER BY t.start_date ASC
    `;
    const result = await this.query<TourRow>(query);
    return result.rows;
  }

  /**
   * Get completed tours (past end date)
   */
  async getCompletedTours(): Promise<TourRow[]> {
    const query = `
      SELECT t.*, u.name as leader_name, u.email as leader_email
      FROM tours t
      LEFT JOIN users u ON t.assigned_leader_id = u.id
      WHERE t.end_date < CURRENT_DATE
      ORDER BY t.end_date DESC
    `;
    const result = await this.query<TourRow>(query);
    return result.rows;
  }

  /**
   * Get tour participants
   */
  async getTourParticipants(
    tourId: number
  ): Promise<{ id: number; user_id: number; full_name: string; email: string }[]> {
    const query = `
      SELECT tu.id, tu.user_id, u.name as full_name, u.email
      FROM tour_users tu
      JOIN users u ON tu.user_id = u.id
      WHERE tu.tour_id = $1 AND tu.status = 'approved'
      ORDER BY u.name ASC
    `;
    const result = await this.query<{
      id: number;
      user_id: number;
      full_name: string;
      email: string;
    }>(query, [tourId]);
    return result.rows;
  }

  /**
   * Join a tour as participant
   * Returns null if user is already a participant
   */
  async joinTour(
    tourId: number,
    userId: number
  ): Promise<{ id: number; tour_id: number; user_id: number } | null> {
    const result = await this.query<{ id: number; tour_id: number; user_id: number }>(
      `INSERT INTO tour_users (tour_id, user_id, role, joined_at)
       VALUES ($1, $2, 'participant', CURRENT_TIMESTAMP)
       ON CONFLICT (tour_id, user_id) DO NOTHING
       RETURNING id, tour_id, user_id`,
      [tourId, userId]
    );

    // If no row was returned (conflict occurred), return null
    if (!result.rows[0]) {
      return null;
    }

    // Update participant count
    await this.query(
      `UPDATE tours SET participant_count = (
        SELECT COUNT(*) FROM tour_users WHERE tour_id = $1
      ) WHERE id = $1`,
      [tourId]
    );

    return result.rows[0];
  }

  /**
   * Leave a tour
   */
  async leaveTour(tourId: number, userId: number): Promise<boolean> {
    const result = await this.query(`DELETE FROM tour_users WHERE tour_id = $1 AND user_id = $2`, [
      tourId,
      userId,
    ]);

    // Update participant count
    await this.query(
      `UPDATE tours SET participant_count = (
        SELECT COUNT(*) FROM tour_users WHERE tour_id = $1
      ) WHERE id = $1`,
      [tourId]
    );

    return result.rowCount !== null && result.rowCount > 0;
  }

  /**
   * Check if user is already a participant
   */
  async isParticipant(tourId: number, userId: number): Promise<boolean> {
    const result = await this.query(
      `SELECT 1 FROM tour_users WHERE tour_id = $1 AND user_id = $2 AND status = 'approved'`,
      [tourId, userId]
    );
    return result.rows.length > 0;
  }

  /**
   * Get all tours a user is participating in (approved only)
   */
  async getUserTours(userId: number): Promise<TourRow[]> {
    const query = `
      SELECT t.*, u.name as leader_name, u.email as leader_email
      FROM tours t
      LEFT JOIN users u ON t.assigned_leader_id = u.id
      INNER JOIN tour_users tu ON t.id = tu.tour_id
      WHERE tu.user_id = $1 AND tu.status = 'approved'
      ORDER BY t.start_date DESC
    `;
    const result = await this.query<TourRow>(query, [userId]);
    return result.rows;
  }

  /**
   * Check if user has a date conflict with any existing approved tours
   * Returns the conflicting tour if one exists
   */
  async checkDateConflict(
    userId: number,
    startDate: Date | string,
    endDate: Date | string,
    excludeTourId?: number
  ): Promise<{ id: number; name: string; start_date: Date; end_date: Date } | null> {
    const query = `
      SELECT t.id, t.name, t.start_date, t.end_date
      FROM tours t
      INNER JOIN tour_users tu ON t.id = tu.tour_id
      WHERE tu.user_id = $1 
        AND tu.status = 'approved'
        AND t.status != 'cancelled'
        AND t.start_date <= $3
        AND t.end_date >= $2
        ${excludeTourId ? "AND t.id != $4" : ""}
      LIMIT 1
    `;

    const params: unknown[] = [userId, startDate, endDate];
    if (excludeTourId) {
      params.push(excludeTourId);
    }

    const result = await this.query<{ id: number; name: string; start_date: Date; end_date: Date }>(
      query,
      params
    );
    return result.rows[0] || null;
  }

  /**
   * Request to join a tour (creates pending request)
   */
  async requestJoinTour(
    tourId: number,
    userId: number
  ): Promise<{ id: number; tour_id: number; user_id: number; status: string } | null> {
    const result = await this.query<{
      id: number;
      tour_id: number;
      user_id: number;
      status: string;
    }>(
      `INSERT INTO tour_users (tour_id, user_id, role, status, requested_at)
       VALUES ($1, $2, 'participant', 'pending', CURRENT_TIMESTAMP)
       ON CONFLICT (tour_id, user_id) DO UPDATE SET
         status = EXCLUDED.status,
         requested_at = CURRENT_TIMESTAMP
       WHERE tour_users.status = 'rejected'
       RETURNING id, tour_id, user_id, status`,
      [tourId, userId]
    );

    // If no row was returned, user already has a pending/approved request
    if (!result.rows[0]) {
      return null;
    }

    return result.rows[0];
  }

  /**
   * Get pending join requests for a tour
   */
  async getPendingRequests(
    tourId: number
  ): Promise<
    { id: number; user_id: number; full_name: string; email: string; requested_at: Date }[]
  > {
    const query = `
      SELECT tu.id, tu.user_id, u.name as full_name, u.email, tu.requested_at
      FROM tour_users tu
      JOIN users u ON tu.user_id = u.id
      WHERE tu.tour_id = $1 AND tu.status = 'pending'
      ORDER BY tu.requested_at ASC
    `;
    const result = await this.query<{
      id: number;
      user_id: number;
      full_name: string;
      email: string;
      requested_at: Date;
    }>(query, [tourId]);
    return result.rows;
  }

  /**
   * Get user's join requests
   */
  async getUserRequests(
    userId: number
  ): Promise<
    { id: number; tour_id: number; status: string; requested_at: Date; tour_name?: string }[]
  > {
    const query = `
      SELECT tu.id, tu.tour_id, tu.status, tu.requested_at, t.name as tour_name
      FROM tour_users tu
      LEFT JOIN tours t ON tu.tour_id = t.id
      WHERE tu.user_id = $1
      ORDER BY tu.requested_at DESC
    `;
    const result = await this.query<{
      id: number;
      tour_id: number;
      status: string;
      requested_at: Date;
      tour_name?: string;
    }>(query, [userId]);
    return result.rows;
  }

  /**
   * Approve a join request
   */
  async approveRequest(
    requestId: number,
    approvedBy: number
  ): Promise<{ id: number; tour_id: number; user_id: number; status: string } | null> {
    const result = await this.query<{
      id: number;
      tour_id: number;
      user_id: number;
      status: string;
    }>(
      `UPDATE tour_users 
       SET status = 'approved', approved_by = $1, approved_at = CURRENT_TIMESTAMP, joined_at = CURRENT_TIMESTAMP
       WHERE id = $2 AND status = 'pending'
       RETURNING id, tour_id, user_id, status`,
      [approvedBy, requestId]
    );

    if (!result.rows[0]) {
      return null;
    }

    const { tour_id } = result.rows[0];

    // Update participant count
    await this.query(
      `UPDATE tours SET participant_count = (
        SELECT COUNT(*) FROM tour_users WHERE tour_id = $1 AND status = 'approved'
      ) WHERE id = $1`,
      [tour_id]
    );

    return result.rows[0];
  }

  /**
   * Reject a join request
   */
  async rejectRequest(
    requestId: number,
    rejectionReason?: string
  ): Promise<{ id: number; tour_id: number; user_id: number; status: string } | null> {
    const result = await this.query<{
      id: number;
      tour_id: number;
      user_id: number;
      status: string;
    }>(
      `UPDATE tour_users 
       SET status = 'rejected', rejection_reason = $1
       WHERE id = $2 AND status = 'pending'
       RETURNING id, tour_id, user_id, status`,
      [rejectionReason || null, requestId]
    );

    return result.rows[0] || null;
  }

  /**
   * Check if user has any approved tour on a specific date range
   */
  async hasApprovedTourOnDates(
    userId: number,
    startDate: Date | string,
    endDate: Date | string
  ): Promise<boolean> {
    const conflict = await this.checkDateConflict(userId, startDate, endDate);
    return conflict !== null;
  }
}

// Export singleton instance
export const Tour = new TourModel();
