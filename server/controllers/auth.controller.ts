import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { User } from "../models/User.model";
import { AppError } from "../middleware/errorHandler";
import type { JwtPayload } from "../types";
import type { Request, Response } from "express";
import type { AuthenticatedRequest } from "../types";

const JWT_SECRET = process.env.JWT_SECRET!;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET!;

if (!JWT_SECRET || !JWT_REFRESH_SECRET) {
  throw new Error("JWT_SECRET and JWT_REFRESH_SECRET environment variables are required");
}

/**
 * Auth Controller - Handles authentication business logic
 */
export class AuthController {
  /**
   * Register a new user
   */
  async register(req: Request, res: Response): Promise<void> {
    const {
      email,
      password,
      name,
      role = "tourist",
    } = req.body as {
      email: string;
      password: string;
      name: string;
      role?: string;
    };

    // Check if user already exists
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      throw new AppError(409, "User already exists");
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const result = await User.createUser({
      email,
      password: hashedPassword,
      name,
      role,
    });

    const userId = result.id;

    // Generate token
    const token = jwt.sign({ id: userId, email, role }, JWT_SECRET, {
      expiresIn: "24h",
    });

    res.status(201).json({
      message: "User registered successfully",
      token,
      user: { id: userId, email, name, role },
    });
  }

  /**
   * Login user
   */
  async login(req: Request, res: Response): Promise<void> {
    const { email, password } = req.body as { email: string; password: string };

    // Find user by email
    const user = await User.findByEmail(email);
    if (!user) {
      throw new AppError(401, "Invalid credentials");
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      throw new AppError(401, "Invalid credentials");
    }

    // Generate tokens
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: "24h" }
    );

    const refreshToken = jwt.sign(
      { id: user.id, email: user.email },
      JWT_REFRESH_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      message: "Login successful",
      token,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
  }

  /**
   * Refresh access token
   */
  async refresh(req: Request, res: Response): Promise<void> {
    const { refreshToken } = req.body as { refreshToken: string };

    // Verify refresh token
    let decoded: JwtPayload;
    try {
      decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET) as JwtPayload;
    } catch {
      throw new AppError(403, "Invalid refresh token");
    }

    // Find user
    const user = await User.findByIdSafe(decoded.id);
    if (!user) {
      throw new AppError(404, "User not found");
    }

    // Generate new access token
    const newToken = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: "24h" }
    );

    res.json({
      token: newToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
  }

  /**
   * Get user profile
   */
  async getProfile(req: Request, res: Response): Promise<void> {
    const userId = (req as AuthenticatedRequest).user!.id;

    // Find user
    const user = await User.findByIdSafe(userId);
    if (!user) {
      throw new AppError(404, "User not found");
    }

    res.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
  }

  /**
   * Update user profile
   */
  async updateProfile(req: Request, res: Response): Promise<void> {
    const userId = (req as AuthenticatedRequest).user!.id;
    const { name, email } = req.body as { name?: string; email?: string };

    // Check if email is already taken by another user
    if (email) {
      const existingUser = await User.findByEmail(email);
      if (existingUser && existingUser.id !== userId) {
        throw new AppError(409, "Email already in use");
      }
    }

    // Update profile
    const updatedUser = await User.updateProfile(userId, { name, email });
    if (!updatedUser) {
      throw new AppError(400, "No fields to update");
    }

    res.json({
      message: "Profile updated successfully",
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        name: updatedUser.name,
        role: updatedUser.role,
      },
    });
  }

  /**
   * Change password
   */
  async changePassword(req: Request, res: Response): Promise<void> {
    const userId = (req as AuthenticatedRequest).user!.id;
    const { currentPassword, newPassword } = req.body as {
      currentPassword: string;
      newPassword: string;
    };

    // Find user with password
    const user = await User.findByIdWithPassword(userId);
    if (!user) {
      throw new AppError(404, "User not found");
    }

    // Verify current password
    const isValidPassword = await bcrypt.compare(currentPassword, user.password);
    if (!isValidPassword) {
      throw new AppError(401, "Current password is incorrect");
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await User.updatePassword(userId, hashedPassword);

    res.json({
      message: "Password changed successfully",
    });
  }

  /**
   * Get all leaders (users with 'guide' role)
   */
  async getLeaders(_req: Request, res: Response): Promise<void> {
    const leaders = await User.getAllLeaders();

    res.json({
      success: true,
      data: leaders,
    });
  }
}

// Export singleton instance
export const authController = new AuthController();
