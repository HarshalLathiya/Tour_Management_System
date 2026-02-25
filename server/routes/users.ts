import express from "express";
import { authenticateToken, authorizeRoles } from "../middleware/auth";
import { asyncHandler } from "../middleware/errorHandler";
import { userController } from "../controllers/user.controller";

const router = express.Router();

/**
 * User Management Routes (Admin only)
 * Following MVC pattern: Routes define endpoints, Controllers handle logic
 */

// GET /api/users - Get all users (Admin only)
router.get(
  "/",
  authenticateToken,
  authorizeRoles("admin"),
  asyncHandler((req, res) => userController.getAllUsers(req, res))
);

// GET /api/users/count - Get user count by role (Admin only)
router.get(
  "/count",
  authenticateToken,
  authorizeRoles("admin"),
  asyncHandler((req, res) => userController.getUserCountByRole(req, res))
);

// GET /api/users/:id - Get user by ID (Admin only)
router.get(
  "/:id",
  authenticateToken,
  authorizeRoles("admin"),
  asyncHandler((req, res) => userController.getUserById(req, res))
);

// POST /api/users - Create new user (Admin only)
router.post(
  "/",
  authenticateToken,
  authorizeRoles("admin"),
  asyncHandler((req, res) => userController.createUser(req, res))
);

// PUT /api/users/:id - Update user (Admin only)
router.put(
  "/:id",
  authenticateToken,
  authorizeRoles("admin"),
  asyncHandler((req, res) => userController.updateUser(req, res))
);

// DELETE /api/users/:id - Delete user (Admin only)
router.delete(
  "/:id",
  authenticateToken,
  authorizeRoles("admin"),
  asyncHandler((req, res) => userController.deleteUser(req, res))
);

export default router;
