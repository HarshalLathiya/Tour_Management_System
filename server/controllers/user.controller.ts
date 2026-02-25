import { User } from "../models/User.model";
import { AppError } from "../middleware/errorHandler";
import type { Request, Response } from "express";
import type { AuthenticatedRequest } from "../types";
import { createAuditLog, AuditActions, EntityTypes } from "../utils/auditLogger";
import bcrypt from "bcryptjs";

/**
 * User Controller - Handles user management business logic (Admin)
 */
export class UserController {
  /**
   * Get all users (Admin only)
   */
  async getAllUsers(req: Request, res: Response): Promise<void> {
    const { role } = req.query as { role?: string };

    let users;
    if (role) {
      users = await User.findByRole(role);
    } else {
      // Get all users without password
      users = await User.findAllUsers();
    }

    res.json({
      success: true,
      data: users,
    });
  }

  /**
   * Get user by ID (Admin only)
   */
  async getUserById(req: Request, res: Response): Promise<void> {
    const id = parseInt(String(req.params.id));

    if (isNaN(id)) {
      throw new AppError(400, "Invalid user ID");
    }

    const user = await User.findByIdSafe(id);

    if (!user) {
      throw new AppError(404, "User not found");
    }

    res.json({
      success: true,
      data: user,
    });
  }

  /**
   * Create new user (Admin only)
   */
  async createUser(req: Request, res: Response): Promise<void> {
    const authReq = req as AuthenticatedRequest;
    const adminId = authReq.user?.id;

    const { email, password, name, role } = req.body;

    // Check if email already exists
    const exists = await User.existsByEmail(email);
    if (exists) {
      throw new AppError(400, "Email already registered");
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const newUser = await User.createUser({
      email,
      password: hashedPassword,
      name,
      role,
    });

    // Log the action
    await createAuditLog({
      userId: adminId,
      action: AuditActions.CREATE,
      entityType: EntityTypes.USER,
      entityId: newUser.id,
      newValues: { email, name, role },
      req,
    });

    res.status(201).json({
      success: true,
      message: "User created successfully",
      data: { id: newUser.id, email, name, role },
    });
  }

  /**
   * Update user (Admin only)
   */
  async updateUser(req: Request, res: Response): Promise<void> {
    const authReq = req as AuthenticatedRequest;
    const adminId = authReq.user?.id;

    const id = parseInt(String(req.params.id));

    if (isNaN(id)) {
      throw new AppError(400, "Invalid user ID");
    }

    // Get old user data for audit
    const oldUser = await User.findByIdSafe(id);

    const { name, email, role } = req.body;

    // Check if email is being changed and already exists
    if (email && email !== oldUser?.email) {
      const exists = await User.existsByEmail(email);
      if (exists) {
        throw new AppError(400, "Email already registered");
      }
    }

    // Update user
    const updatedUser = await User.updateProfile(id, { name, email });

    // If role is being changed, use the updateRole method
    if (role && role !== oldUser?.role) {
      await User.updateRole(id, role);
    }

    if (!updatedUser) {
      throw new AppError(404, "User not found");
    }

    // Log the action
    await createAuditLog({
      userId: adminId,
      action: AuditActions.UPDATE,
      entityType: EntityTypes.USER,
      entityId: id,
      oldValues: oldUser ? { ...oldUser } : undefined,
      newValues: { name, email, role },
      req,
    });

    res.json({
      success: true,
      message: "User updated successfully",
      data: updatedUser,
    });
  }

  /**
   * Delete user (Admin only)
   */
  async deleteUser(req: Request, res: Response): Promise<void> {
    const authReq = req as AuthenticatedRequest;
    const adminId = authReq.user?.id;

    const id = parseInt(String(req.params.id));

    if (isNaN(id)) {
      throw new AppError(400, "Invalid user ID");
    }

    // Prevent self-deletion
    if (id === adminId) {
      throw new AppError(400, "Cannot delete your own account");
    }

    // Get old user data for audit
    const oldUser = await User.findByIdSafe(id);

    if (!oldUser) {
      throw new AppError(404, "User not found");
    }

    const deleted = await User.deleteUser(id);

    if (!deleted) {
      throw new AppError(500, "Failed to delete user");
    }

    // Log the action
    await createAuditLog({
      userId: adminId,
      action: AuditActions.DELETE,
      entityType: EntityTypes.USER,
      entityId: id,
      oldValues: oldUser ? { ...oldUser } : undefined,
      req,
    });

    res.json({
      success: true,
      message: "User deleted successfully",
    });
  }

  /**
   * Get user count by role (Admin only)
   */
  async getUserCountByRole(req: Request, res: Response): Promise<void> {
    const { role } = req.query as { role?: string };

    if (!role) {
      throw new AppError(400, "Role is required");
    }

    const count = await User.countByRole(role);

    res.json({
      success: true,
      data: { role, count },
    });
  }
}

// Export singleton instance
export const userController = new UserController();
