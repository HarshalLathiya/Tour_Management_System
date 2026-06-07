import express from "express";
import { authenticateToken } from "../middleware/auth";
import { asyncHandler } from "../middleware/errorHandler";
import { superAdminController } from "../controllers/superAdmin.controller";

const router = express.Router();

// GET /api/super-admin/overview - Super Admin overview metrics
router.get(
  "/overview",
  authenticateToken,
  asyncHandler((req, res) => superAdminController.overview(req, res))
);

// GET /api/super-admin/users - List all users
router.get(
  "/users",
  authenticateToken,
  asyncHandler((req, res) => superAdminController.listUsers(req, res))
);

// PATCH /api/super-admin/users/:id/role - Promote/Demote user role
router.patch(
  "/users/:id/role",
  authenticateToken,
  asyncHandler((req, res) => superAdminController.patchUserRole(req, res))
);

// PATCH /api/super-admin/users/:id/status - Activate/Suspend user
router.patch(
  "/users/:id/status",
  authenticateToken,
  asyncHandler((req, res) => superAdminController.patchUserStatus(req, res))
);

// GET /api/super-admin/tours - List all tours
router.get(
  "/tours",
  authenticateToken,
  asyncHandler((req, res) => superAdminController.listTours(req, res))
);

// GET /api/super-admin/incidents - List all incidents (SOS/health/general)
router.get(
  "/incidents",
  authenticateToken,
  asyncHandler((req, res) => superAdminController.listIncidents(req, res))
);

// GET /api/super-admin/audit-logs - View platform audit logs
router.get(
  "/audit-logs",
  authenticateToken,
  asyncHandler((req, res) => superAdminController.auditLogs(req, res))
);

// GET /api/super-admin/analytics - Platform analytics summary
router.get(
  "/analytics",
  authenticateToken,
  asyncHandler((req, res) => superAdminController.analytics(req, res))
);

export default router;
