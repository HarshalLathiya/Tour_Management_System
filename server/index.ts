import authRoutes from "./routes/auth";
import locationRoutes from "./routes/locations";
import itineraryRoutes from "./routes/itineraries";
import toursRoutes from "./routes/tours";
import { authenticateToken, authorizeRoles } from "./middleware/auth";

import express from "express";

const app = express();

// Middleware
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/locations", locationRoutes);
app.use("/api/itineraries", itineraryRoutes);
app.use("/api/tours", toursRoutes);

// Start server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
