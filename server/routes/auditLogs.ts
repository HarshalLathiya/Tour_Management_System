import express from "express";
import type { Request, Response } from "express";
import { authenticateToken } from "../middleware/auth";
import { validate, auditLogSchemas } from "../middleware/validation";
import pool from "../db";
import type { AuthenticatedRequest } from "../types";

const router = express.Router();

// GET /api/audit-logs - Get all audit logs (with powerful filtering)
router.get("/", authenticateToken, async (req: Request, res: Response) => {
  try {
    const { user_id, action, entity_type, entity_id, start_date, end_date, limit, offset } =
      req.query;

    let query = "SELECT * FROM audit_logs WHERE 1=1";
    const params: unknown[] = [];
    let paramIndex = 1;

    // Apply filters
    if (user_id) {
      query += ` AND user_id = $${paramIndex++}`;
      params.push(user_id);
    }

    if (action) {
      query += ` AND action = $${paramIndex++}`;
      params.push(action);
    }

    if (entity_type) {
      query += ` AND entity_type = $${paramIndex++}`;
      params.push(entity_type);
    }

    if (entity_id) {
      query += ` AND entity_id = $${paramIndex++}`;
      params.push(entity_id);
    }

    if (start_date) {
      query += ` AND created_at >= $${paramIndex++}`;
      params.push(start_date);
    }

    if (end_date) {
      query += ` AND created_at <= $${paramIndex++}`;
      params.push(end_date);
    }

    // Order by most recent first
    query += " ORDER BY created_at DESC";

    // Apply pagination
    const pageLimit = limit ? parseInt(String(limit)) : 100; // Default 100 records
    const pageOffset = offset ? parseInt(String(offset)) : 0;

    query += ` LIMIT $${paramIndex++} OFFSET $${paramIndex++}`;
    params.push(pageLimit, pageOffset);

    const result = await pool.query(query, params);

    // Get total count for pagination metadata
    let countQuery = "SELECT COUNT(*) as total FROM audit_logs WHERE 1=1";
    const countParams: unknown[] = [];
    let countParamIndex = 1;

    if (user_id) {
      countQuery += ` AND user_id = $${countParamIndex++}`;
      countParams.push(user_id);
    }
    if (action) {
      countQuery += ` AND action = $${countParamIndex++}`;
      countParams.push(action);
    }
    if (entity_type) {
      countQuery += ` AND entity_type = $${countParamIndex++}`;
      countParams.push(entity_type);
    }
    if (entity_id) {
      countQuery += ` AND entity_id = $${countParamIndex++}`;
      countParams.push(entity_id);
    }
    if (start_date) {
      countQuery += ` AND created_at >= $${countParamIndex++}`;
      countParams.push(start_date);
    }
    if (end_date) {
      countQuery += ` AND created_at <= $${countParamIndex++}`;
      countParams.push(end_date);
    }

    const countResult = await pool.query(countQuery, countParams);
    const total = parseInt(countResult.rows[0].total);

    res.json({
      success: true,
      data: result.rows,
      pagination: {
        limit: pageLimit,
        offset: pageOffset,
        total,
        hasMore: pageOffset + result.rows.length < total,
      },
    });
  } catch (error) {
    console.error("Error fetching audit logs:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch audit logs",
    });
  }
});

// GET /api/audit-logs/:id - Get single audit log
router.get("/:id", authenticateToken, async (req: Request, res: Response) => {
  try {
    const id = parseInt(String(req.params.id));

    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        error: "Invalid audit log ID",
      });
    }

    const result = await pool.query("SELECT * FROM audit_logs WHERE id = $1", [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: "Audit log not found",
      });
    }

    res.json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    console.error("Error fetching audit log:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch audit log",
    });
  }
});

// POST /api/audit-logs - Create audit log entry (typically system-generated)
router.post(
  "/",
  authenticateToken,
  validate(auditLogSchemas.create),
  async (req: Request, res: Response) => {
    try {
      const authReq = req as AuthenticatedRequest;
      const currentUserId = authReq.user?.id;

      const {
        user_id,
        action,
        entity_type,
        entity_id,
        old_values,
        new_values,
        ip_address,
        user_agent,
      } = req.body;

      // Use authenticated user if not provided
      const effectiveUserId = user_id || currentUserId;

      const result = await pool.query(
        `INSERT INTO audit_logs (user_id, action, entity_type, entity_id, old_values, new_values, ip_address, user_agent)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
        [
          effectiveUserId || null,
          action,
          entity_type,
          entity_id,
          old_values ? JSON.stringify(old_values) : null,
          new_values ? JSON.stringify(new_values) : null,
          ip_address || req.ip || null,
          user_agent || req.get("user-agent") || null,
        ]
      );

      res.status(201).json({
        success: true,
        data: result.rows[0],
      });
    } catch (error) {
      console.error("Error creating audit log:", error);
      res.status(500).json({
        success: false,
        error: "Failed to create audit log",
      });
    }
  }
);

// GET /api/audit-logs/entity/:type/:id - Get audit trail for specific entity
router.get("/entity/:type/:id", authenticateToken, async (req: Request, res: Response) => {
  try {
    const entityType = req.params.type;
    const entityId = parseInt(String(req.params.id));

    if (isNaN(entityId)) {
      return res.status(400).json({
        success: false,
        error: "Invalid entity ID",
      });
    }

    const result = await pool.query(
      "SELECT * FROM audit_logs WHERE entity_type = $1 AND entity_id = $2 ORDER BY created_at DESC",
      [entityType, entityId]
    );

    res.json({
      success: true,
      data: result.rows,
      metadata: {
        entity_type: entityType,
        entity_id: entityId,
        total_changes: result.rows.length,
      },
    });
  } catch (error) {
    console.error("Error fetching entity audit trail:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch entity audit trail",
    });
  }
});

// GET /api/audit-logs/user/:userId - Get all actions by specific user
router.get("/user/:userId", authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = parseInt(String(req.params.userId));

    if (isNaN(userId)) {
      return res.status(400).json({
        success: false,
        error: "Invalid user ID",
      });
    }

    const result = await pool.query(
      "SELECT * FROM audit_logs WHERE user_id = $1 ORDER BY created_at DESC LIMIT 100",
      [userId]
    );

    res.json({
      success: true,
      data: result.rows,
      metadata: {
        user_id: userId,
        total_actions: result.rows.length,
      },
    });
  } catch (error) {
    console.error("Error fetching user audit trail:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch user audit trail",
    });
  }
});

export default router;
