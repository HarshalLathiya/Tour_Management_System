import { BaseModel } from "./BaseModel";
import type { UserRow } from "../types";

/**
 * User Model - Handles all user-related database operations
 */
export class UserModel extends BaseModel {
  constructor() {
    super("users");
  }

  /**
   * Find user by email
   */
  async findByEmail(email: string): Promise<UserRow | null> {
    return this.findOne<UserRow>({ email });
  }

  /**
   * Find user by ID (without password)
   */
  async findByIdSafe(id: number): Promise<Omit<UserRow, "password_hash"> | null> {
    const result = await this.query<Omit<UserRow, "password_hash">>(
      "SELECT id, email, name, role, created_at FROM users WHERE id = $1",
      [id]
    );
    return result.rows[0] || null;
  }

  /**
   * Find user by ID (with password for authentication)
   */
  async findByIdWithPassword(id: number): Promise<UserRow | null> {
    return this.findById<UserRow>(id);
  }

  /**
   * Create a new user
   */
  async createUser(data: {
    email: string;
    password: string;
    name: string;
    role?: string;
  }): Promise<{ id: number }> {
    const { email, password, name, role = "tourist" } = data;

    const result = await this.query<{ id: number }>(
      "INSERT INTO users (email, password_hash, name, role) VALUES ($1, $2, $3, $4) RETURNING id",
      [email, password, name, role]
    );

    return result.rows[0]!;
  }

  /**
   * Check if user exists by email
   */
  async existsByEmail(email: string): Promise<boolean> {
    return this.exists({ email });
  }

  /**
   * Update user profile
   */
  async updateProfile(
    id: number,
    data: { name?: string; email?: string }
  ): Promise<Omit<UserRow, "password_hash"> | null> {
    const updateData: Record<string, unknown> = {};

    if (data.name !== undefined) updateData.name = data.name;
    if (data.email !== undefined) updateData.email = data.email;

    if (Object.keys(updateData).length === 0) {
      return null;
    }

    const result = await this.query<Omit<UserRow, "password_hash">>(
      `UPDATE users
       SET ${Object.keys(updateData)
         .map((key, idx) => `${key} = $${idx + 1}`)
         .join(", ")}
       WHERE id = $${Object.keys(updateData).length + 1}
       RETURNING id, email, name, role, created_at`,
      [...Object.values(updateData), id]
    );

    return result.rows[0] || null;
  }

  /**
   * Update user password
   */
  async updatePassword(id: number, hashedPassword: string): Promise<boolean> {
    const result = await this.query("UPDATE users SET password_hash = $1 WHERE id = $2", [
      hashedPassword,
      id,
    ]);
    return result.rowCount !== null && result.rowCount > 0;
  }

  /**
   * Get all users with a specific role
   */
  async findByRole(role: string): Promise<Omit<UserRow, "password_hash">[]> {
    const result = await this.query<Omit<UserRow, "password_hash">>(
      "SELECT id, email, name, role, created_at FROM users WHERE role = $1 ORDER BY name ASC",
      [role]
    );
    return result.rows;
  }

  /**
   * Get all leaders (users with 'guide' role)
   */
  async getAllLeaders(): Promise<Omit<UserRow, "password_hash">[]> {
    return this.findByRole("guide");
  }

  /**
   * Get user count by role
   */
  async countByRole(role: string): Promise<number> {
    return this.count({ role });
  }

  /**
   * Delete user by ID
   */
  async deleteUser(id: number): Promise<boolean> {
    return this.deleteById(id);
  }

  /**
   * Find user by email (with password hash)
   */
  async findByEmailWithPassword(email: string): Promise<UserRow | null> {
    const result = await this.query<UserRow>("SELECT * FROM users WHERE email = $1", [email]);

    return result.rows[0] || null;
  }
}

// Export singleton instance
export const User = new UserModel();
