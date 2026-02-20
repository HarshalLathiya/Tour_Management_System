import { pathToFileURL, fileURLToPath } from "url";
import path from "path";
import dotenv from "dotenv";

// Load environment variables first
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, "../.env.local") });
dotenv.config({ path: path.resolve(__dirname, "../.env") });

import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth";
import locationRoutes from "./routes/locations";
import itineraryRoutes from "./routes/itineraries";
import toursRoutes from "./routes/tours";
import attendanceRoutes from "./routes/attendance";
import budgetRoutes from "./routes/budgets";
import expenseRoutes from "./routes/expenses";
import safetyRoutes from "./routes/safety";
import incidentRoutes from "./routes/incidents";
import announcementRoutes from "./routes/announcements";
import auditLogRoutes from "./routes/auditLogs";
import notificationRoutes from "./routes/notifications";
import { errorHandler } from "./middleware/errorHandler";
import { authLimiter, apiLimiter } from "./middleware/rateLimiter";

const app = express();

app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);
app.use(express.json());

// Apply rate limiters
app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/locations", apiLimiter, locationRoutes);
app.use("/api/itineraries", apiLimiter, itineraryRoutes);
app.use("/api/tours", apiLimiter, toursRoutes);
app.use("/api/attendance", apiLimiter, attendanceRoutes);
app.use("/api/budgets", apiLimiter, budgetRoutes);
app.use("/api/expenses", apiLimiter, expenseRoutes);
app.use("/api/safety", apiLimiter, safetyRoutes);
app.use("/api/incidents", apiLimiter, incidentRoutes);
app.use("/api/announcements", apiLimiter, announcementRoutes);
app.use("/api/audit-logs", apiLimiter, auditLogRoutes);
app.use("/api/notifications", notificationRoutes);

// Global error handler — must be last
app.use(errorHandler);

// Export app for testing
export default app;

// Only start server if file is run directly
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const PORT = process.env.PORT || 3001;
  app.listen(PORT, () => {
    console.warn(`Server running on port ${PORT}`);
  });
}
