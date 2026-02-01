import express from "express";
import pool from "../db";
import { authenticateToken, authorizeRoles } from "../middleware/auth";

const router = express.Router();

// States endpoints
router.get("/states", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM states ORDER BY name");
    res.json(rows);
  } catch (error) {
    console.error("Error fetching states:", error);
    res.status(500).json({ error: "Failed to fetch states." });
  }
});

router.post(
  "/states",
  authenticateToken,
  authorizeRoles("admin"),
  async (req, res) => {
    const { name, code } = req.body;
    try {
      const [result] = await pool.query(
        "INSERT INTO states (name, code) VALUES (?, ?)",
        [name, code],
      );
      res.status(201).json({ id: (result as any).insertId, name, code });
    } catch (error) {
      console.error("Error creating state:", error);
      res.status(500).json({ error: "Failed to create state." });
    }
  },
);

// Cities endpoints
router.get("/cities", async (req, res) => {
  const { state_id } = req.query;
  try {
    let query =
      "SELECT c.*, s.name as state_name FROM cities c JOIN states s ON c.state_id = s.id";
    const params = [];
    if (state_id) {
      query += " WHERE c.state_id = ?";
      params.push(state_id);
    }
    query += " ORDER BY c.name";
    const [rows] = await pool.query(query, params);
    res.json(rows);
  } catch (error) {
    console.error("Error fetching cities:", error);
    res.status(500).json({ error: "Failed to fetch cities." });
  }
});

router.post(
  "/cities",
  authenticateToken,
  authorizeRoles("admin"),
  async (req, res) => {
    const { name, state_id } = req.body;
    try {
      const [result] = await pool.query(
        "INSERT INTO cities (name, state_id) VALUES (?, ?)",
        [name, state_id],
      );
      res.status(201).json({ id: (result as any).insertId, name, state_id });
    } catch (error) {
      console.error("Error creating city:", error);
      res.status(500).json({ error: "Failed to create city." });
    }
  },
);

// Places endpoints
router.get("/places", async (req, res) => {
  const { city_id, category } = req.query;
  try {
    let query =
      "SELECT p.*, c.name as city_name, s.name as state_name FROM places p JOIN cities c ON p.city_id = c.id JOIN states s ON c.state_id = s.id";
    const params = [];
    if (city_id) {
      query += " WHERE p.city_id = ?";
      params.push(city_id);
    }
    if (category) {
      query += city_id ? " AND" : " WHERE";
      query += " p.category = ?";
      params.push(category);
    }
    query += " ORDER BY p.name";
    const [rows] = await pool.query(query, params);
    res.json(rows);
  } catch (error) {
    console.error("Error fetching places:", error);
    res.status(500).json({ error: "Failed to fetch places." });
  }
});

router.post(
  "/places",
  authenticateToken,
  authorizeRoles("admin"),
  async (req, res) => {
    const { name, city_id, latitude, longitude, description, category } =
      req.body;
    try {
      const [result] = await pool.query(
        "INSERT INTO places (name, city_id, latitude, longitude, description, category) VALUES (?, ?, ?, ?, ?, ?)",
        [name, city_id, latitude, longitude, description, category],
      );
      res.status(201).json({
        id: (result as any).insertId,
        name,
        city_id,
        latitude,
        longitude,
        description,
        category,
      });
    } catch (error) {
      console.error("Error creating place:", error);
      res.status(500).json({ error: "Failed to create place." });
    }
  },
);

export default router;
