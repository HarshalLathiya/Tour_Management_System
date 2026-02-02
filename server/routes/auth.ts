import express from "express";
import { authenticateToken } from "../middleware/auth";
import { validate, authSchemas } from "../middleware/validation";
import { asyncHandler } from "../middleware/errorHandler";
import { authController } from "../controllers/auth.controller";

const router = express.Router();

/**
 * Auth Routes - Delegates to AuthController
 * Following MVC pattern: Routes define endpoints, Controllers handle logic
 */

// POST /api/auth/register - Register new user
router.post(
  "/register",
  validate(authSchemas.register),
  asyncHandler((req, res) => authController.register(req, res))
);

// POST /api/auth/login - Login user
router.post(
  "/login",
  validate(authSchemas.login),
  asyncHandler((req, res) => authController.login(req, res))
);

// POST /api/auth/refresh - Refresh access token
router.post(
  "/refresh",
  validate(authSchemas.refresh),
  asyncHandler((req, res) => authController.refresh(req, res))
);

// GET /api/auth/profile - Get current user profile
router.get(
  "/profile",
  authenticateToken,
  asyncHandler((req, res) => authController.getProfile(req, res))
);

// PUT /api/auth/profile - Update user profile
router.put(
  "/profile",
  authenticateToken,
  asyncHandler((req, res) => authController.updateProfile(req, res))
);

// PUT /api/auth/change-password - Change password
router.put(
  "/change-password",
  authenticateToken,
  asyncHandler((req, res) => authController.changePassword(req, res))
);

// GET /api/auth/leaders - Get all leaders (guide role)
router.get(
  "/leaders",
  authenticateToken,
  asyncHandler((req, res) => authController.getLeaders(req, res))
);

export default router;
