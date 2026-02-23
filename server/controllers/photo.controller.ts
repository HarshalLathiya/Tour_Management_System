import type { Request, Response } from "express";
import { Photo } from "../models/Photo.model";
import type { AuthenticatedRequest } from "../types";

function parseId(id: unknown): number {
  if (!id) throw new Error("ID is required");
  const idStr = Array.isArray(id) ? id[0] : String(id);
  const parsed = parseInt(idStr);
  if (isNaN(parsed)) throw new Error("Invalid ID format");
  return parsed;
}

/**
 * Photo Controller - Handles all photo-related operations
 */
export const photoController = {
  /**
   * Get all photos for a specific tour
   */
  async getTourPhotos(req: AuthenticatedRequest, res: Response) {
    try {
      const tourId = parseId(req.params.tourId);
      const photos = await Photo.getPhotosByTourId(tourId);

      return res.json({
        success: true,
        data: photos,
      });
    } catch (error) {
      console.error("Error fetching tour photos:", error);
      return res.status(500).json({ error: "Failed to fetch photos" });
    }
  },

  /**
   * Upload a new photo
   */
  async uploadPhoto(req: AuthenticatedRequest, res: Response) {
    try {
      const tourId = parseId(req.params.tourId);
      const userId = req.user?.id;
      const { photo_url, caption } = req.body;

      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      if (!photo_url) {
        return res.status(400).json({ error: "Photo URL is required" });
      }

      const photo = await Photo.createPhoto({
        tour_id: tourId,
        user_id: userId,
        photo_url,
        caption,
      });

      return res.status(201).json({
        success: true,
        data: photo,
      });
    } catch (error) {
      console.error("Error uploading photo:", error);
      return res.status(500).json({ error: "Failed to upload photo" });
    }
  },

  /**
   * Delete a photo
   */
  async deletePhoto(req: AuthenticatedRequest, res: Response) {
    try {
      const photoId = parseId(req.params.id);
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      // Check if photo exists
      const existingPhoto = await Photo.getPhotoById(photoId);
      if (!existingPhoto) {
        return res.status(404).json({ error: "Photo not found" });
      }

      // Allow deletion if user is admin or the photo owner
      const isAdmin = req.user?.role === "admin";
      const isOwner = existingPhoto.user_id === userId;

      if (!isAdmin && !isOwner) {
        return res.status(403).json({ error: "You can only delete your own photos" });
      }

      await Photo.deletePhoto(photoId);

      return res.json({
        success: true,
        message: "Photo deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting photo:", error);
      return res.status(500).json({ error: "Failed to delete photo" });
    }
  },
};
