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
  async getAllTours(filters?: {
    status?: string;
    assignedLeaderId?: number;
  }): Promise<TourRow[]> {
    let query = `
      SELECT t.*, u.name as leader_name, u.email as leader_email
      FROM tours t
      LEFT JOIN users u ON t.assigned_leader_id = u.id
      WHERE 1=1
    `;
    const params: any[] = [];
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

    return result.rows[0];
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
    const values: any[] = [];
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
}

// Export singleton instance
export const Tour = new TourModel();
