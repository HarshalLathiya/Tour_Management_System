import express from "express";
import { authenticateToken, authorizeRoles } from "../middleware/auth";
import { validate, tourSchemas } from "../middleware/validation";
import { asyncHandler } from "../middleware/errorHandler";
import { tourController } from "../controllers/tour.controller";

const router = express.Router();

/**
 * Tour Routes - Delegates to TourController
 * Following MVC pattern: Routes define endpoints, Controllers handle logic
 */

// GET /api/tours - Get all tours (with optional filters)
router.get(
  "/",
  asyncHandler((req, res) => tourController.getAllTours(req, res))
);

// GET /api/tours/upcoming - Get upcoming tours
router.get(
  "/upcoming",
  asyncHandler((req, res) => tourController.getUpcomingTours(req, res))
);

// GET /api/tours/ongoing - Get ongoing tours
router.get(
  "/ongoing",
  asyncHandler((req, res) => tourController.getOngoingTours(req, res))
);

// GET /api/tours/completed - Get completed tours
router.get(
  "/completed",
  asyncHandler((req, res) => tourController.getCompletedTours(req, res))
);

// GET /api/tours/my-assigned - Get tours assigned to current leader
router.get(
  "/my-assigned",
  authenticateToken,
  asyncHandler((req, res) => tourController.getMyAssignedTours(req, res))
);

// GET /api/tours/:id - Get single tour
router.get(
  "/:id",
  asyncHandler((req, res) => tourController.getTourById(req, res))
);

// POST /api/tours - Create new tour (Admin only)
router.post(
  "/",
  authenticateToken,
  authorizeRoles("admin"),
  validate(tourSchemas.create),
  asyncHandler((req, res) => tourController.createTour(req, res))
);

// PUT /api/tours/:id - Update tour (Admin only)
router.put(
  "/:id",
  authenticateToken,
  authorizeRoles("admin"),
  validate(tourSchemas.update),
  asyncHandler((req, res) => tourController.updateTour(req, res))
);

// PUT /api/tours/:id/assign-leader - Assign leader to tour (Admin only)
router.put(
  "/:id/assign-leader",
  authenticateToken,
  authorizeRoles("admin"),
  asyncHandler((req, res) => tourController.assignLeader(req, res))
);

// DELETE /api/tours/:id/assign-leader - Unassign leader from tour (Admin only)
router.delete(
  "/:id/assign-leader",
  authenticateToken,
  authorizeRoles("admin"),
  asyncHandler((req, res) => tourController.unassignLeader(req, res))
);

// DELETE /api/tours/:id - Delete tour (Admin only)
router.delete(
  "/:id",
  authenticateToken,
  authorizeRoles("admin"),
  asyncHandler((req, res) => tourController.deleteTour(req, res))
);

export default router;
