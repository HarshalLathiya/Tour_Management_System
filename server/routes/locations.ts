import express from "express";
import pool from "../db";
import { authenticateToken, authorizeRoles } from "../middleware/auth";
import { validate, locationSchemas } from "../middleware/validation";
import { asyncHandler } from "../middleware/errorHandler";
import type { StateRow, CityRow, PlaceRow } from "../types";

const router = express.Router();

// ─── States ──────────────────────────────────────────────────────────────────

router.get(
  "/states",
  asyncHandler(async (_req, res) => {
    const result = await pool.query<StateRow>(
      "SELECT id, name, code, created_at FROM states ORDER BY name"
    );
    res.json(result.rows);
  })
);

router.post(
  "/states",
  authenticateToken,
  authorizeRoles("admin"),
  validate(locationSchemas.state),
  asyncHandler(async (req, res) => {
    const { name, code } = req.body as { name: string; code?: string };

    const result = await pool.query<{ id: number }>(
      "INSERT INTO states (name, code) VALUES ($1, $2) RETURNING id",
      [name, code || null]
    );
    res.status(201).json({ id: result.rows[0].id, name, code });
  })
);

// ─── Cities ──────────────────────────────────────────────────────────────────

router.get(
  "/cities",
  asyncHandler(async (req, res) => {
    const stateId = req.query.state_id ? parseInt(req.query.state_id as string) : null;

    let query =
      "SELECT c.id, c.name, c.state_id, s.name as state_name, c.created_at FROM cities c JOIN states s ON c.state_id = s.id";
    const params: (number | string)[] = [];

    if (stateId) {
      query += " WHERE c.state_id = $1";
      params.push(stateId);
    }
    query += " ORDER BY c.name";

    const result = await pool.query<CityRow>(query, params);
    res.json(result.rows);
  })
);

router.post(
  "/cities",
  authenticateToken,
  authorizeRoles("admin"),
  validate(locationSchemas.city),
  asyncHandler(async (req, res) => {
    const { name, state_id } = req.body as { name: string; state_id: number };

    const result = await pool.query<{ id: number }>(
      "INSERT INTO cities (name, state_id) VALUES ($1, $2) RETURNING id",
      [name, state_id]
    );
    res.status(201).json({ id: result.rows[0].id, name, state_id });
  })
);

// ─── Places ──────────────────────────────────────────────────────────────────

router.get(
  "/places",
  asyncHandler(async (req, res) => {
    const cityId = req.query.city_id ? parseInt(req.query.city_id as string) : null;
    const category = req.query.category as string | undefined;

    let query =
      "SELECT p.id, p.name, p.city_id, c.name as city_name, s.name as state_name, p.latitude, p.longitude, p.description, p.category, p.created_at FROM places p JOIN cities c ON p.city_id = c.id JOIN states s ON c.state_id = s.id";
    const conditions: string[] = [];
    const params: (number | string)[] = [];

    if (cityId) {
      params.push(cityId);
      conditions.push("p.city_id = $" + params.length);
    }
    if (category) {
      params.push(category);
      conditions.push("p.category = $" + params.length);
    }
    if (conditions.length > 0) {
      query += " WHERE " + conditions.join(" AND ");
    }
    query += " ORDER BY p.name";

    const result = await pool.query<PlaceRow>(query, params);
    res.json(result.rows);
  })
);

router.post(
  "/places",
  authenticateToken,
  authorizeRoles("admin"),
  validate(locationSchemas.place),
  asyncHandler(async (req, res) => {
    const { name, city_id, latitude, longitude, description, category } = req.body as {
      name: string;
      city_id: number;
      latitude?: number;
      longitude?: number;
      description?: string;
      category?: string;
    };

    const result = await pool.query<{ id: number }>(
      "INSERT INTO places (name, city_id, latitude, longitude, description, category) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id",
      [name, city_id, latitude ?? null, longitude ?? null, description ?? null, category ?? "OTHER"]
    );

    res.status(201).json({
      id: result.rows[0].id,
      name,
      city_id,
      latitude,
      longitude,
      description,
      category,
    });
  })
);

export default router;
