import express from "express";
import type { Request, Response } from "express";
import { authenticateToken } from "../middleware/auth";
import { validate, expenseSchemas } from "../middleware/validation";
import pool from "../db";
import { createAuditLog, AuditActions, EntityTypes } from "../utils/auditLogger";
import type { AuthenticatedRequest } from "../types";

const router = express.Router();

// GET /api/expenses - Get all expenses (with optional filters)
router.get("/", authenticateToken, async (req: Request, res: Response) => {
  try {
    const { tour_id, category } = req.query;

    let query = "SELECT * FROM expenses WHERE 1=1";
    const params: unknown[] = [];
    let paramIndex = 1;

    if (tour_id) {
      query += ` AND tour_id = $${paramIndex++}`;
      params.push(tour_id);
    }

    if (category) {
      query += ` AND category = $${paramIndex++}`;
      params.push(category);
    }

    query += " ORDER BY created_at DESC";

    const result = await pool.query(query, params);

    res.json({
      success: true,
      data: result.rows,
    });
  } catch (error) {
    console.error("Error fetching expenses:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch expenses",
    });
  }
});

// GET /api/expenses/:id - Get single expense
router.get("/:id", authenticateToken, async (req: Request, res: Response) => {
  try {
    const id = parseInt(String(req.params.id));

    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        error: "Invalid expense ID",
      });
    }

    const result = await pool.query("SELECT * FROM expenses WHERE id = $1", [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: "Expense not found",
      });
    }

    // Log the view action
    await createAuditLog({
      userId: (req as AuthenticatedRequest).user?.id,
      action: AuditActions.VIEW,
      entityType: EntityTypes.EXPENSE,
      entityId: id,
      req,
    });

    res.json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    console.error("Error fetching expense:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch expense",
    });
  }
});

// POST /api/expenses - Create new expense
router.post(
  "/",
  authenticateToken,
  validate(expenseSchemas.create),
  async (req: Request, res: Response) => {
    try {
      const userId = (req as AuthenticatedRequest).user?.id;
      const { tour_id, amount, category, description } = req.body;

      const result = await pool.query(
        `INSERT INTO expenses (tour_id, amount, category, description)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
        [tour_id, amount, category || "MISC", description || null]
      );

      // Update budget spent_amount if budget exists for this tour
      await pool.query(
        `UPDATE budgets
       SET spent_amount = spent_amount + $1
       WHERE tour_id = $2`,
        [amount, tour_id]
      );

      // Log the create action
      await createAuditLog({
        userId,
        action: AuditActions.CREATE,
        entityType: EntityTypes.EXPENSE,
        entityId: result.rows[0].id,
        newValues: { tour_id, amount, category },
        req,
      });

      res.status(201).json({
        success: true,
        data: result.rows[0],
      });
    } catch (error) {
      console.error("Error creating expense:", error);
      res.status(500).json({
        success: false,
        error: "Failed to create expense",
      });
    }
  }
);

// PUT /api/expenses/:id - Update expense
router.put(
  "/:id",
  authenticateToken,
  validate(expenseSchemas.update),
  async (req: Request, res: Response) => {
    try {
      const userId = (req as AuthenticatedRequest).user?.id;
      const id = parseInt(String(req.params.id));

      if (isNaN(id)) {
        return res.status(400).json({
          success: false,
          error: "Invalid expense ID",
        });
      }

      // Get existing expense to calculate amount difference
      const existingResult = await pool.query("SELECT * FROM expenses WHERE id = $1", [id]);

      if (existingResult.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: "Expense not found",
        });
      }

      const existingExpense = existingResult.rows[0];
      const { amount, category, description } = req.body;

      // Build dynamic update query
      const updateFields: string[] = [];
      const values: unknown[] = [];
      let paramIndex = 1;

      if (amount !== undefined) {
        updateFields.push(`amount = $${paramIndex++}`);
        values.push(amount);

        // Update budget spent_amount
        const amountDifference = amount - Number(existingExpense.amount);
        await pool.query(
          `UPDATE budgets
         SET spent_amount = spent_amount + $1
         WHERE tour_id = $2`,
          [amountDifference, existingExpense.tour_id]
        );
      }
      if (category !== undefined) {
        updateFields.push(`category = $${paramIndex++}`);
        values.push(category);
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

      const updateQuery = `UPDATE expenses SET ${updateFields.join(", ")} WHERE id = $${paramIndex} RETURNING *`;

      const result = await pool.query(updateQuery, values);

      // Log the update action
      await createAuditLog({
        userId,
        action: AuditActions.UPDATE,
        entityType: EntityTypes.EXPENSE,
        entityId: id,
        oldValues: existingExpense,
        newValues: req.body,
        req,
      });

      res.json({
        success: true,
        data: result.rows[0],
      });
    } catch (error) {
      console.error("Error updating expense:", error);
      res.status(500).json({
        success: false,
        error: "Failed to update expense",
      });
    }
  }
);

// DELETE /api/expenses/:id - Delete expense
router.delete("/:id", authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = (req as AuthenticatedRequest).user?.id;
    const id = parseInt(String(req.params.id));

    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        error: "Invalid expense ID",
      });
    }

    const result = await pool.query("DELETE FROM expenses WHERE id = $1 RETURNING *", [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: "Expense not found",
      });
    }

    const deletedExpense = result.rows[0];

    // Update budget spent_amount
    await pool.query(
      `UPDATE budgets
       SET spent_amount = spent_amount - $1
       WHERE tour_id = $2`,
      [deletedExpense.amount, deletedExpense.tour_id]
    );

    // Log the delete action
    await createAuditLog({
      userId,
      action: AuditActions.DELETE,
      entityType: EntityTypes.EXPENSE,
      entityId: id,
      oldValues: deletedExpense,
      req,
    });

    res.json({
      success: true,
      message: "Expense deleted successfully",
      data: deletedExpense,
    });
  } catch (error) {
    console.error("Error deleting expense:", error);
    res.status(500).json({
      success: false,
      error: "Failed to delete expense",
    });
  }
});

export default router;
