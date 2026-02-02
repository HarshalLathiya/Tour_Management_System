import express from "express";
import type { Request, Response } from "express";
import { authenticateToken } from "../middleware/auth";
import { validate, itinerarySchemas } from "../middleware/validation";
import pool from "../db";

const router = express.Router();

// GET /api/itineraries - Get all itineraries (with optional tour_id filter)
router.get("/", authenticateToken, async (req: Request, res: Response) => {
  try {
    const tourId = req.query.tour_id;

    let query = "SELECT * FROM itineraries";
    const params: unknown[] = [];

    if (tourId) {
      query += " WHERE tour_id = $1";
      params.push(tourId);
    }

    query += " ORDER BY date ASC, start_time ASC";

    const result = await pool.query(query, params);

    res.json({
      success: true,
      data: result.rows,
    });
  } catch (error) {
    console.error("Error fetching itineraries:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch itineraries",
    });
  }
});

// GET /api/itineraries/:id - Get single itinerary by ID
router.get("/:id", authenticateToken, async (req: Request, res: Response) => {
  try {
    const id = parseInt(String(req.params.id));

    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        error: "Invalid itinerary ID",
      });
    }

    const result = await pool.query("SELECT * FROM itineraries WHERE id = $1", [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: "Itinerary not found",
      });
    }

    res.json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    console.error("Error fetching itinerary:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch itinerary",
    });
  }
});

// POST /api/itineraries - Create new itinerary
router.post(
  "/",
  authenticateToken,
  validate(itinerarySchemas.create),
  async (req: Request, res: Response) => {
    try {
      const { tour_id, route_id, date, title, description, start_time, end_time, status } =
        req.body;

      const result = await pool.query(
        `INSERT INTO itineraries (tour_id, route_id, date, title, description, start_time, end_time, status, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, CURRENT_TIMESTAMP)
       RETURNING *`,
        [
          tour_id,
          route_id || null,
          date,
          title,
          description || null,
          start_time || null,
          end_time || null,
          status || "SCHEDULED",
        ]
      );

      res.status(201).json({
        success: true,
        data: result.rows[0],
      });
    } catch (error) {
      console.error("Error creating itinerary:", error);
      res.status(500).json({
        success: false,
        error: "Failed to create itinerary",
      });
    }
  }
);

// PUT /api/itineraries/:id - Update itinerary
router.put(
  "/:id",
  authenticateToken,
  validate(itinerarySchemas.update),
  async (req: Request, res: Response) => {
    try {
      const id = parseInt(String(req.params.id));

      if (isNaN(id)) {
        return res.status(400).json({
          success: false,
          error: "Invalid itinerary ID",
        });
      }

      // Check if itinerary exists
      const existingResult = await pool.query("SELECT * FROM itineraries WHERE id = $1", [id]);

      if (existingResult.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: "Itinerary not found",
        });
      }

      const { tour_id, route_id, date, title, description, start_time, end_time, status } =
        req.body;

      // Build dynamic update query
      const updateFields: string[] = [];
      const values: unknown[] = [];
      let paramIndex = 1;

      if (tour_id !== undefined) {
        updateFields.push(`tour_id = $${paramIndex++}`);
        values.push(tour_id);
      }
      if (route_id !== undefined) {
        updateFields.push(`route_id = $${paramIndex++}`);
        values.push(route_id);
      }
      if (date !== undefined) {
        updateFields.push(`date = $${paramIndex++}`);
        values.push(date);
      }
      if (title !== undefined) {
        updateFields.push(`title = $${paramIndex++}`);
        values.push(title);
      }
      if (description !== undefined) {
        updateFields.push(`description = $${paramIndex++}`);
        values.push(description);
      }
      if (start_time !== undefined) {
        updateFields.push(`start_time = $${paramIndex++}`);
        values.push(start_time);
      }
      if (end_time !== undefined) {
        updateFields.push(`end_time = $${paramIndex++}`);
        values.push(end_time);
      }
      if (status !== undefined) {
        updateFields.push(`status = $${paramIndex++}`);
        values.push(status);
      }

      if (updateFields.length === 0) {
        return res.status(400).json({
          success: false,
          error: "No fields to update",
        });
      }

      updateFields.push(`updated_at = CURRENT_TIMESTAMP`);
      values.push(id);

      const updateQuery = `UPDATE itineraries SET ${updateFields.join(", ")} WHERE id = $${paramIndex} RETURNING *`;

      const result = await pool.query(updateQuery, values);

      res.json({
        success: true,
        data: result.rows[0],
      });
    } catch (error) {
      console.error("Error updating itinerary:", error);
      res.status(500).json({
        success: false,
        error: "Failed to update itinerary",
      });
    }
  }
);

// DELETE /api/itineraries/:id - Delete itinerary
router.delete("/:id", authenticateToken, async (req: Request, res: Response) => {
  try {
    const id = parseInt(String(req.params.id));

    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        error: "Invalid itinerary ID",
      });
    }

    const result = await pool.query("DELETE FROM itineraries WHERE id = $1 RETURNING *", [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: "Itinerary not found",
      });
    }

    res.json({
      success: true,
      message: "Itinerary deleted successfully",
      data: result.rows[0],
    });
  } catch (error) {
    console.error("Error deleting itinerary:", error);
    res.status(500).json({
      success: false,
      error: "Failed to delete itinerary",
    });
  }
});

export default router;
