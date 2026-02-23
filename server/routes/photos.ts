import { Router } from "express";
import { photoController } from "../controllers/photo.controller";
import { authenticateToken } from "../middleware/auth";

const router = Router();

// All photo routes require authentication
router.use(authenticateToken);

// GET /api/photos/:tourId - Get all photos for a tour
router.get("/:tourId", photoController.getTourPhotos);

// POST /api/photos/:tourId - Upload a new photo
router.post("/:tourId", photoController.uploadPhoto);

// DELETE /api/photos/:id - Delete a photo
router.delete("/:id", photoController.deletePhoto);

export default router;
