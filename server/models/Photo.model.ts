import { BaseModel } from "./BaseModel";
import type { PhotoRow } from "../types";

/**
 * Photo Model - Handles all photo-related database operations
 */
export class PhotoModel extends BaseModel {
  constructor() {
    super("tour_photos");
  }

  /**
   * Get all photos for a specific tour
   */
  async getPhotosByTourId(tourId: number): Promise<PhotoRow[]> {
    const query = `
      SELECT tp.*, u.name as user_name, u.email as user_email
      FROM tour_photos tp
      LEFT JOIN users u ON tp.user_id = u.id
      WHERE tp.tour_id = $1
      ORDER BY tp.created_at DESC
    `;
    const result = await this.query<PhotoRow>(query, [tourId]);
    return result.rows;
  }

  /**
   * Get photo by ID
   */
  async getPhotoById(id: number): Promise<PhotoRow | null> {
    const query = `
      SELECT tp.*, u.name as user_name, u.email as user_email
      FROM tour_photos tp
      LEFT JOIN users u ON tp.user_id = u.id
      WHERE tp.id = $1
    `;
    const result = await this.query<PhotoRow>(query, [id]);
    return result.rows[0] || null;
  }

  /**
   * Create a new photo
   */
  async createPhoto(data: {
    tour_id: number;
    user_id: number;
    photo_url: string;
    caption?: string;
  }): Promise<PhotoRow> {
    const { tour_id, user_id, photo_url, caption } = data;

    const result = await this.query<PhotoRow>(
      `INSERT INTO tour_photos (tour_id, user_id, photo_url, caption)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [tour_id, user_id, photo_url, caption || null]
    );

    const row = result.rows[0];

    if (!row) {
      throw new Error("Failed to create photo: no row returned");
    }

    return row;
  }

  /**
   * Delete photo by ID
   */
  async deletePhoto(id: number): Promise<boolean> {
    return this.deleteById(id);
  }

  /**
   * Get all photos uploaded by a specific user
   */
  async getPhotosByUserId(userId: number): Promise<PhotoRow[]> {
    const query = `
      SELECT tp.*, u.name as user_name, u.email as user_email
      FROM tour_photos tp
      LEFT JOIN users u ON tp.user_id = u.id
      WHERE tp.user_id = $1
      ORDER BY tp.created_at DESC
    `;
    const result = await this.query<PhotoRow>(query, [userId]);
    return result.rows;
  }
}

// Export singleton instance
export const Photo = new PhotoModel();
