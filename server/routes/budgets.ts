import express from "express";
import type { Request, Response } from "express";
import { authenticateToken } from "../middleware/auth";
import { validate, budgetSchemas } from "../middleware/validation";
import pool from "../db";
import { createAuditLog, AuditActions, EntityTypes } from "../utils/auditLogger";
import type { AuthenticatedRequest } from "../types";

const router = express.Router();

// GET /api/budgets - Get all budgets (with optional tour_id filter)
router.get("/", authenticateToken, async (req: Request, res: Response) => {
  try {
    const { tour_id } = req.query;

    let query = "SELECT * FROM budgets";
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
    console.error("Error fetching budgets:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch budgets",
    });
  }
});

// GET /api/budgets/:id - Get single budget
router.get("/:id", authenticateToken, async (req: Request, res: Response) => {
  try {
    const id = parseInt(String(req.params.id));

    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        error: "Invalid budget ID",
      });
    }

    const result = await pool.query("SELECT * FROM budgets WHERE id = $1", [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: "Budget not found",
      });
    }

    // Log the view action
    await createAuditLog({
      userId: (req as AuthenticatedRequest).user?.id,
      action: AuditActions.VIEW,
      entityType: EntityTypes.BUDGET,
      entityId: id,
      req,
    });

    res.json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    console.error("Error fetching budget:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch budget",
    });
  }
});

// POST /api/budgets - Create new budget
router.post(
  "/",
  authenticateToken,
  validate(budgetSchemas.create),
  async (req: Request, res: Response) => {
    try {
      const userId = (req as AuthenticatedRequest).user?.id;
      const { tour_id, total_amount, spent_amount, per_participant_fee, currency, description } =
        req.body;

      // Check if budget already exists for this tour
      const existingResult = await pool.query("SELECT id FROM budgets WHERE tour_id = $1", [
        tour_id,
      ]);

      if (existingResult.rows.length > 0) {
        return res.status(409).json({
          success: false,
          error: "Budget already exists for this tour",
        });
      }

      const result = await pool.query(
        `INSERT INTO budgets (tour_id, total_amount, spent_amount, per_participant_fee, currency, description)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
        [
          tour_id,
          total_amount,
          spent_amount || 0,
          per_participant_fee || 0,
          currency || "USD",
          description || null,
        ]
      );

      // Log the create action
      await createAuditLog({
        userId,
        action: AuditActions.CREATE,
        entityType: EntityTypes.BUDGET,
        entityId: result.rows[0].id,
        newValues: { tour_id, total_amount, currency },
        req,
      });

      res.status(201).json({
        success: true,
        data: result.rows[0],
      });
    } catch (error) {
      console.error("Error creating budget:", error);
      res.status(500).json({
        success: false,
        error: "Failed to create budget",
      });
    }
  }
);

// PUT /api/budgets/:id - Update budget
router.put(
  "/:id",
  authenticateToken,
  validate(budgetSchemas.update),
  async (req: Request, res: Response) => {
    try {
      const userId = (req as AuthenticatedRequest).user?.id;
      const id = parseInt(String(req.params.id));

      if (isNaN(id)) {
        return res.status(400).json({
          success: false,
          error: "Invalid budget ID",
        });
      }

      // Check if budget exists
      const existingResult = await pool.query("SELECT * FROM budgets WHERE id = $1", [id]);

      if (existingResult.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: "Budget not found",
        });
      }

      const { total_amount, spent_amount, per_participant_fee, currency, description } = req.body;

      // Build dynamic update query
      const updateFields: string[] = [];
      const values: unknown[] = [];
      let paramIndex = 1;

      if (total_amount !== undefined) {
        updateFields.push(`total_amount = $${paramIndex++}`);
        values.push(total_amount);
      }
      if (spent_amount !== undefined) {
        updateFields.push(`spent_amount = $${paramIndex++}`);
        values.push(spent_amount);
      }
      if (per_participant_fee !== undefined) {
        updateFields.push(`per_participant_fee = $${paramIndex++}`);
        values.push(per_participant_fee);
      }
      if (currency !== undefined) {
        updateFields.push(`currency = $${paramIndex++}`);
        values.push(currency);
      }
      if (description !== undefined) {
        updateFields.push(`description = $${paramIndex++}`);
        values.push(description);
      }

      if (updateFields.length === 0) {
        return res.status(400).json({
          success: false,
          error: "No fields to update",
        });
      }

      values.push(id);

      const updateQuery = `UPDATE budgets SET ${updateFields.join(", ")} WHERE id = $${paramIndex} RETURNING *`;

      const result = await pool.query(updateQuery, values);

      // Log the update action
      await createAuditLog({
        userId,
        action: AuditActions.UPDATE,
        entityType: EntityTypes.BUDGET,
        entityId: id,
        oldValues: existingResult.rows[0],
        newValues: req.body,
        req,
      });

      res.json({
        success: true,
        data: result.rows[0],
      });
    } catch (error) {
      console.error("Error updating budget:", error);
      res.status(500).json({
        success: false,
        error: "Failed to update budget",
      });
    }
  }
);

// DELETE /api/budgets/:id - Delete budget
router.delete("/:id", authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = (req as AuthenticatedRequest).user?.id;
    const id = parseInt(String(req.params.id));

    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        error: "Invalid budget ID",
      });
    }

    const result = await pool.query("DELETE FROM budgets WHERE id = $1 RETURNING *", [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: "Budget not found",
      });
    }

    // Log the delete action
    await createAuditLog({
      userId,
      action: AuditActions.DELETE,
      entityType: EntityTypes.BUDGET,
      entityId: id,
      oldValues: result.rows[0],
      req,
    });

    res.json({
      success: true,
      message: "Budget deleted successfully",
      data: result.rows[0],
    });
  } catch (error) {
    console.error("Error deleting budget:", error);
    res.status(500).json({
      success: false,
      error: "Failed to delete budget",
    });
  }
});

export default router;
