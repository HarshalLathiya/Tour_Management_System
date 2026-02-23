import express from "express";
import { authenticateToken, authorizeRoles } from "../middleware/auth";
import { asyncHandler } from "../middleware/errorHandler";
import { accommodationController } from "../controllers/accommodation.controller";

const router = express.Router();

// GET /api/accommodations/:tourId - Get all accommodations for a tour
router.get(
  "/:tourId",
  authenticateToken,
  asyncHandler((req, res) => accommodationController.getByTourId(req, res))
);

// POST /api/accommodations - Create new accommodation
router.post(
  "/",
  authenticateToken,
  asyncHandler((req, res) => accommodationController.create(req, res))
);

// PUT /api/accommodations/:id - Update accommodation
router.put(
  "/:id",
  authenticateToken,
  asyncHandler((req, res) => accommodationController.update(req, res))
);

// DELETE /api/accommodations/:id - Delete accommodation
router.delete(
  "/:id",
  authenticateToken,
  authorizeRoles("admin"),
  asyncHandler((req, res) => accommodationController.delete(req, res))
);

// GET /api/accommodations/:accommodationId/assignments - Get room assignments
router.get(
  "/:accommodationId/assignments",
  authenticateToken,
  asyncHandler((req, res) => accommodationController.getRoomAssignments(req, res))
);

// POST /api/accommodations/:accommodationId/assignments - Create room assignment
router.post(
  "/:accommodationId/assignments",
  authenticateToken,
  asyncHandler((req, res) => accommodationController.createRoomAssignment(req, res))
);

// DELETE /api/accommodations/assignments/:assignmentId - Delete room assignment
router.delete(
  "/assignments/:assignmentId",
  authenticateToken,
  asyncHandler((req, res) => accommodationController.deleteRoomAssignment(req, res))
);

// GET /api/accommodations/:tourId/participants - Get tour participants
router.get(
  "/:tourId/participants",
  authenticateToken,
  asyncHandler((req, res) => accommodationController.getTourParticipants(req, res))
);

export default router;
