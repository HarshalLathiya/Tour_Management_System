import express from "express";
import { authenticateToken } from "../middleware/auth";
import { notificationService } from "../services/notification.service";
import type { AuthenticatedRequest } from "../types";

const router = express.Router();

/**
 * SSE endpoint for real-time notifications
 * GET /api/notifications/stream
 */
router.get("/stream", authenticateToken, (req, res) => {
  const user = (req as AuthenticatedRequest).user!;

  // Add client to notification service
  notificationService.addClient(user.id, user.role, res);

  // Keep connection alive with periodic heartbeat
  const heartbeat = setInterval(() => {
    res.write(":heartbeat\n\n");
  }, 30000); // Every 30 seconds

  // Clean up on disconnect
  req.on("close", () => {
    clearInterval(heartbeat);
  });
});

export default router;
