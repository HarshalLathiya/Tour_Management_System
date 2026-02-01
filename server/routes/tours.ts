import express from "express";
import pool from "../db";
import { authenticateToken, authorizeRoles } from "../middleware/auth";

const router = express.Router();

// Get all tours
router.get("/", async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT * FROM tours ORDER BY created_at DESC",
    );
    res.json(rows);
  } catch (error) {
    console.error("Error fetching tours:", error);
    res.status(500).json({ error: "Failed to fetch tours." });
  }
});

// Get a single tour by ID
router.get("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await pool.query("SELECT * FROM tours WHERE id = ?", [id]);
    if ((rows as any[]).length === 0) {
      return res.status(404).json({ error: "Tour not found." });
    }
    res.json((rows as any[])[0]);
  } catch (error) {
    console.error("Error fetching tour:", error);
    res.status(500).json({ error: "Failed to fetch tour." });
  }
});

// Create a new tour (admin only)
router.post(
  "/",
  authenticateToken,
  authorizeRoles("admin"),
  async (req, res) => {
    const { content } = req.body;
    try {
      const [result] = await pool.query(
        "INSERT INTO tours (content) VALUES (?)",
        [content],
      );
      res.status(201).json({ id: (result as any).insertId, content });
    } catch (error) {
      console.error("Error creating tour:", error);
      res.status(500).json({ error: "Failed to create tour." });
    }
  },
);

// Update a tour (admin only)
router.put(
  "/:id",
  authenticateToken,
  authorizeRoles("admin"),
  async (req, res) => {
    const { id } = req.params;
    const { content } = req.body;
    try {
      const [result] = await pool.query(
        "UPDATE tours SET content = ? WHERE id = ?",
        [content, id],
      );
      if ((result as any).affectedRows === 0) {
        return res.status(404).json({ error: "Tour not found." });
      }
      res.json({ id, content });
    } catch (error) {
      console.error("Error updating tour:", error);
      res.status(500).json({ error: "Failed to update tour." });
    }
  },
);

// Delete a tour (admin only)
router.delete(
  "/:id",
  authenticateToken,
  authorizeRoles("admin"),
  async (req, res) => {
    const { id } = req.params;
    try {
      const [result] = await pool.query("DELETE FROM tours WHERE id = ?", [id]);
      if ((result as any).affectedRows === 0) {
        return res.status(404).json({ error: "Tour not found." });
      }
      res.json({ message: "Tour deleted successfully." });
    } catch (error) {
      console.error("Error deleting tour:", error);
      res.status(500).json({ error: "Failed to delete tour." });
    }
  },
);

export default router;
