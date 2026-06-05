import jwt from "jsonwebtoken";
import type { Response, NextFunction } from "express";
import type { AuthenticatedRequest, JwtPayload } from "../types";
import { getJwtSecret } from "../utils/jwt";

export const authenticateToken = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Access token required" });
  }

  try {
    // Temporary debug for vitest failures (remove after stabilization)
    if (process.env.VITEST !== undefined) {
      // eslint-disable-next-line no-console
      console.log("[auth-debug] VITEST:", process.env.VITEST);
      // eslint-disable-next-line no-console
      console.log("[auth-debug] JWT_SECRET:", getJwtSecret());
      // eslint-disable-next-line no-console
      console.log("[auth-debug] token prefix:", String(token).slice(0, 10));
    }

    const decoded = jwt.verify(token, getJwtSecret()) as JwtPayload;
    req.user = decoded;
    next();
  } catch {
    return res.status(403).json({ error: "Invalid or expired token" });
  }
};

export const authorizeRoles = (...roles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: "Authentication required" });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: "Insufficient permissions" });
    }

    next();
  };
};
