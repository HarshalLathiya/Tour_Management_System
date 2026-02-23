import express from "express";
import type { Request, Response } from "express";
import { authenticateToken } from "../middleware/auth";
import { validate, announcementSchemas } from "../middleware/validation";
import pool from "../db";
import { createAuditLog, AuditActions, EntityTypes } from "../utils/auditLogger";

interface AuthenticatedRequest extends Request {
  user?: { id: unknown };
}

const router = express.Router();

// GET /api/announcements - Get all announcements (with optional tour_id filter)
router.get("/", authenticateToken, async (req: Request, res: Response) => {
  try {
    const { tour_id } = req.query;

    let query = "SELECT * FROM announcements";
    const params: unknown[] = [];

    if (tour_id) {
      query += " WHERE tour_id = $1";
      params.push(tour_id);
    }

    query += " ORDER BY created_at DESC";

    const result = await pool.query(query, params);

    res.json({
      success: true,
      data: result.rows,
    });
  } catch (error) {
    console.error("Error fetching announcements:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch announcements",
    });
  }
});

// GET /api/announcements/:id - Get single announcement
router.get("/:id", authenticateToken, async (req: Request, res: Response) => {
  try {
    const id = parseInt(String(req.params.id));

    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        error: "Invalid announcement ID",
      });
    }

    const result = await pool.query("SELECT * FROM announcements WHERE id = $1", [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: "Announcement not found",
      });
    }

    // Log the view action
    await createAuditLog({
      userId: (req as AuthenticatedRequest).user?.id as number | undefined,
      action: AuditActions.VIEW,
      entityType: EntityTypes.ANNOUNCEMENT,
      entityId: id,
      req,
    });

    res.json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    console.error("Error fetching announcement:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch announcement",
    });
  }
});

// POST /api/announcements - Create new announcement
router.post(
  "/",
  authenticateToken,
  validate(announcementSchemas.create),
  async (req: Request, res: Response) => {
    try {
      const userId = (req as AuthenticatedRequest).user?.id;
      const { tour_id, title, content } = req.body;

      const result = await pool.query(
        `INSERT INTO announcements (tour_id, title, content)
       VALUES ($1, $2, $3)
       RETURNING *`,
        [tour_id, title, content]
      );

      // Log the create action
      await createAuditLog({
        userId: userId as number | undefined,
        action: AuditActions.CREATE,
        entityType: EntityTypes.ANNOUNCEMENT,
        entityId: result.rows[0].id,
        newValues: { tour_id, title },
        req,
      });

      res.status(201).json({
        success: true,
        data: result.rows[0],
      });
    } catch (error) {
      console.error("Error creating announcement:", error);
      res.status(500).json({
        success: false,
        error: "Failed to create announcement",
      });
    }
  }
);

// PUT /api/announcements/:id - Update announcement
router.put(
  "/:id",
  authenticateToken,
  validate(announcementSchemas.update),
  async (req: Request, res: Response) => {
    try {
      const userId = (req as AuthenticatedRequest).user?.id;
      const id = parseInt(String(req.params.id));

      if (isNaN(id)) {
        return res.status(400).json({
          success: false,
          error: "Invalid announcement ID",
        });
      }

      // Check if announcement exists
      const existingResult = await pool.query("SELECT * FROM announcements WHERE id = $1", [id]);

      if (existingResult.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: "Announcement not found",
        });
      }

      const { title, content } = req.body;

      // Build dynamic update query
      const updateFields: string[] = [];
      const values: unknown[] = [];
      let paramIndex = 1;

      if (title !== undefined) {
        updateFields.push(`title = $${paramIndex++}`);
        values.push(title);
      }
      if (content !== undefined) {
        updateFields.push(`content = $${paramIndex++}`);
        values.push(content);
      }

      if (updateFields.length === 0) {
        return res.status(400).json({
          success: false,
          error: "No fields to update",
        });
      }

      values.push(id);

      const updateQuery = `UPDATE announcements SET ${updateFields.join(", ")} WHERE id = $${paramIndex} RETURNING *`;

      const result = await pool.query(updateQuery, values);

      // Log the update action
      await createAuditLog({
        userId: userId as number | undefined,
        action: AuditActions.UPDATE,
        entityType: EntityTypes.ANNOUNCEMENT,
        entityId: id,
        oldValues: existingResult.rows[0],
        newValues: { title, content },
        req,
      });

      res.json({
        success: true,
        data: result.rows[0],
      });
    } catch (error) {
      console.error("Error updating announcement:", error);
      res.status(500).json({
        success: false,
        error: "Failed to update announcement",
      });
    }
  }
);

// DELETE /api/announcements/:id - Delete announcement
router.delete("/:id", authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = (req as AuthenticatedRequest).user?.id;
    const id = parseInt(String(req.params.id));

    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        error: "Invalid announcement ID",
      });
    }

    const result = await pool.query("DELETE FROM announcements WHERE id = $1 RETURNING *", [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: "Announcement not found",
      });
    }

    // Log the delete action
    await createAuditLog({
      userId: userId as number | undefined,
      action: AuditActions.DELETE,
      entityType: EntityTypes.ANNOUNCEMENT,
      entityId: id,
      oldValues: result.rows[0],
      req,
    });

    res.json({
      success: true,
      message: "Announcement deleted successfully",
      data: result.rows[0],
    });
  } catch (error) {
    console.error("Error deleting announcement:", error);
    res.status(500).json({
      success: false,
      error: "Failed to delete announcement",
    });
  }
});

export default router;
