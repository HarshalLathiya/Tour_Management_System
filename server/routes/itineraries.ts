import express from "express";
import { authenticateToken } from "../middleware/auth";

const router = express.Router();

// Add your itinerary routes here
router.get("/", (req, res) => {
  res.json({ message: "Get all itineraries" });
});

export default router;