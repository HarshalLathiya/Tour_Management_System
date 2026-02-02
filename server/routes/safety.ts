import express from "express";
import type { Request, Response } from "express";
import { authenticateToken } from "../middleware/auth";
import { validate, safetyProtocolSchemas } from "../middleware/validation";
import pool from "../db";

const router = express.Router();

// GET /api/safety - Get all safety protocols (with optional filters)
router.get("/", authenticateToken, async (req: Request, res: Response) => {
  try {
    const { tour_id, severity } = req.query;

    let query = "SELECT * FROM safety_protocols WHERE 1=1";
    const params: unknown[] = [];
    let paramIndex = 1;

    if (tour_id) {
      query += ` AND tour_id = $${paramIndex++}`;
      params.push(tour_id);
    }

    if (severity) {
      query += ` AND severity = $${paramIndex++}`;
      params.push(severity);
    }

    query += " ORDER BY created_at DESC";

    const result = await pool.query(query, params);

    res.json({
      success: true,
      data: result.rows,
    });
  } catch (error) {
    console.error("Error fetching safety protocols:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch safety protocols",
    });
  }
});

// GET /api/safety/:id - Get single safety protocol
router.get("/:id", authenticateToken, async (req: Request, res: Response) => {
  try {
    const id = parseInt(String(req.params.id));

    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        error: "Invalid safety protocol ID",
      });
    }

    const result = await pool.query("SELECT * FROM safety_protocols WHERE id = $1", [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: "Safety protocol not found",
      });
    }

    res.json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    console.error("Error fetching safety protocol:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch safety protocol",
    });
  }
});

// POST /api/safety - Create new safety protocol
router.post("/", authenticateToken, validate(safetyProtocolSchemas.create), async (req: Request, res: Response) => {
  try {
    const { tour_id, title, description, severity } = req.body;

    const result = await pool.query(
      `INSERT INTO safety_protocols (tour_id, title, description, severity)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [tour_id, title, description, severity || "medium"]
    );

    res.status(201).json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    console.error("Error creating safety protocol:", error);
    res.status(500).json({
      success: false,
      error: "Failed to create safety protocol",
    });
  }
});

// PUT /api/safety/:id - Update safety protocol
router.put("/:id", authenticateToken, validate(safetyProtocolSchemas.update), async (req: Request, res: Response) => {
  try {
    const id = parseInt(String(req.params.id));

    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        error: "Invalid safety protocol ID",
      });
    }

    // Check if safety protocol exists
    const existingResult = await pool.query("SELECT * FROM safety_protocols WHERE id = $1", [id]);

    if (existingResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: "Safety protocol not found",
      });
    }

    const { title, description, severity } = req.body;

    // Build dynamic update query
    const updateFields: string[] = [];
    const values: unknown[] = [];
    let paramIndex = 1;

    if (title !== undefined) {
      updateFields.push(`title = $${paramIndex++}`);
      values.push(title);
    }
    if (description !== undefined) {
      updateFields.push(`description = $${paramIndex++}`);
      values.push(description);
    }
    if (severity !== undefined) {
      updateFields.push(`severity = $${paramIndex++}`);
      values.push(severity);
    }

    if (updateFields.length === 0) {
      return res.status(400).json({
        success: false,
        error: "No fields to update",
      });
    }

    values.push(id);

    const updateQuery = `UPDATE safety_protocols SET ${updateFields.join(", ")} WHERE id = $${paramIndex} RETURNING *`;

    const result = await pool.query(updateQuery, values);

    res.json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    console.error("Error updating safety protocol:", error);
    res.status(500).json({
      success: false,
      error: "Failed to update safety protocol",
    });
  }
});

// DELETE /api/safety/:id - Delete safety protocol
router.delete("/:id", authenticateToken, async (req: Request, res: Response) => {
  try {
    const id = parseInt(String(req.params.id));

    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        error: "Invalid safety protocol ID",
      });
    }

    const result = await pool.query("DELETE FROM safety_protocols WHERE id = $1 RETURNING *", [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: "Safety protocol not found",
      });
    }

    res.json({
      success: true,
      message: "Safety protocol deleted successfully",
      data: result.rows[0],
    });
  } catch (error) {
    console.error("Error deleting safety protocol:", error);
    res.status(500).json({
      success: false,
      error: "Failed to delete safety protocol",
    });
  }
});

export default router;
