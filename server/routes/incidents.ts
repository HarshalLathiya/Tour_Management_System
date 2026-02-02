import express from "express";
import { authenticateToken, authorizeRoles } from "../middleware/auth";
import { validate, incidentSchemas } from "../middleware/validation";
import { asyncHandler } from "../middleware/errorHandler";
import { incidentController } from "../controllers/incident.controller";

const router = express.Router();

// GET /api/incidents - Get all incidents
router.get("/", authenticateToken, asyncHandler((req, res) => incidentController.getAll(req, res)));

// GET /api/incidents/:id - Get single incident
router.get("/:id", authenticateToken, asyncHandler((req, res) => incidentController.getById(req, res)));

// POST /api/incidents/sos - Trigger SOS alert (one-click emergency)
router.post("/sos", authenticateToken, asyncHandler((req, res) => incidentController.triggerSOS(req, res)));

// POST /api/incidents/health - Report health issue
router.post("/health", authenticateToken, asyncHandler((req, res) => incidentController.reportHealth(req, res)));

// POST /api/incidents - Create general incident
router.post(
  "/",
  authenticateToken,
  validate(incidentSchemas.create),
  asyncHandler((req, res) => incidentController.create(req, res))
);

// PUT /api/incidents/:id/respond - Mark incident as in progress (leader/admin)
router.put(
  "/:id/respond",
  authenticateToken,
  authorizeRoles("admin", "guide"),
  asyncHandler((req, res) => incidentController.respond(req, res))
);

// PUT /api/incidents/:id/resolve - Resolve incident (leader/admin)
router.put(
  "/:id/resolve",
  authenticateToken,
  authorizeRoles("admin", "guide"),
  asyncHandler((req, res) => incidentController.resolve(req, res))
);

// PUT /api/incidents/:id - Update incident
router.put(
  "/:id",
  authenticateToken,
  validate(incidentSchemas.update),
  asyncHandler((req, res) => incidentController.update(req, res))
);

// DELETE /api/incidents/:id - Delete incident
router.delete(
  "/:id",
  authenticateToken,
  authorizeRoles("admin"),
  asyncHandler((req, res) => incidentController.delete(req, res))
);

export default router;
