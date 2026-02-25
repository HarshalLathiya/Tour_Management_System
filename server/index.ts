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
import accommodationRoutes from "./routes/accommodations";
import photoRoutes from "./routes/photos";
import userRoutes from "./routes/users";
import { errorHandler } from "./middleware/errorHandler";
import { authLimiter, apiLimiter, readLimiter } from "./middleware/rateLimiter";

const app = express();

app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);
// Increase JSON body limit to 20MB for image uploads (base64)
app.use(express.json({ limit: "20mb" }));

// Apply rate limiters - use readLimiter for GET requests, apiLimiter for mutations
// This allows more read operations (viewing data) while keeping mutations protected

// Auth routes - use authLimiter for all auth endpoints
app.use("/api/auth", authLimiter, authRoutes);

// Helper function to apply appropriate rate limiter based on HTTP method
const applyRateLimiter = (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  if (req.method === "GET") {
    return readLimiter(req, res, next);
  }
  return apiLimiter(req, res, next);
};

// Locations - GET uses readLimiter, mutations use apiLimiter
app.use("/api/locations", applyRateLimiter, locationRoutes);

// Itineraries - GET uses readLimiter, mutations use apiLimiter
app.use("/api/itineraries", applyRateLimiter, itineraryRoutes);

// Tours - GET uses readLimiter, mutations use apiLimiter
app.use("/api/tours", applyRateLimiter, toursRoutes);

// Attendance - GET uses readLimiter, mutations use apiLimiter
app.use("/api/attendance", applyRateLimiter, attendanceRoutes);

// Budgets - GET uses readLimiter, mutations use apiLimiter
app.use("/api/budgets", applyRateLimiter, budgetRoutes);

// Expenses - GET uses readLimiter, mutations use apiLimiter
app.use("/api/expenses", applyRateLimiter, expenseRoutes);

// Safety - GET uses readLimiter, mutations use apiLimiter
app.use("/api/safety", applyRateLimiter, safetyRoutes);

// Incidents - GET uses readLimiter, mutations use apiLimiter
app.use("/api/incidents", applyRateLimiter, incidentRoutes);

// Announcements - GET uses readLimiter, mutations use apiLimiter
app.use("/api/announcements", applyRateLimiter, announcementRoutes);

// Audit Logs - GET uses readLimiter, mutations use apiLimiter
app.use("/api/audit-logs", applyRateLimiter, auditLogRoutes);

// Notifications - no rate limiter
app.use("/api/notifications", notificationRoutes);

// Accommodations - GET uses readLimiter, mutations use apiLimiter
app.use("/api/accommodations", applyRateLimiter, accommodationRoutes);

// Photos - GET uses readLimiter, mutations use apiLimiter
app.use("/api/photos", applyRateLimiter, photoRoutes);

// Users - GET uses readLimiter, mutations use apiLimiter (Admin only)
app.use("/api/users", applyRateLimiter, userRoutes);

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
