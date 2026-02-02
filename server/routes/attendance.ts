import express from "express";
import { authenticateToken } from "../middleware/auth";
import { validate, attendanceSchemas } from "../middleware/validation";
import { asyncHandler } from "../middleware/errorHandler";
import { attendanceController } from "../controllers/attendance.controller";

const router = express.Router();

// GET /api/attendance - Get all attendance records
router.get(
  "/",
  authenticateToken,
  asyncHandler((req, res) => attendanceController.getAll(req, res))
);

// GET /api/attendance/:id - Get single attendance record
router.get(
  "/:id",
  authenticateToken,
  asyncHandler((req, res) => attendanceController.getById(req, res))
);

// POST /api/attendance/checkin - Self check-in with geofencing
router.post(
  "/checkin",
  authenticateToken,
  validate(attendanceSchemas.checkin),
  asyncHandler((req, res) => attendanceController.create(req, res))
);

// POST /api/attendance - Create attendance (admin/guide)
router.post(
  "/",
  authenticateToken,
  validate(attendanceSchemas.create),
  asyncHandler((req, res) => attendanceController.create(req, res))
);

// PUT /api/attendance/:id - Update attendance
router.put(
  "/:id",
  authenticateToken,
  validate(attendanceSchemas.update),
  asyncHandler((req, res) => attendanceController.update(req, res))
);

// PUT /api/attendance/:id/verify - Verify attendance (leader/admin)
router.put(
  "/:id/verify",
  authenticateToken,
  asyncHandler((req, res) => attendanceController.verify(req, res))
);

// DELETE /api/attendance/:id - Delete attendance
router.delete(
  "/:id",
  authenticateToken,
  asyncHandler((req, res) => attendanceController.delete(req, res))
);

export default router;
