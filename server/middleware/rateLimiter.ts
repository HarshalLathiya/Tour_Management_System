import rateLimit from "express-rate-limit";
import type { Request, Response } from "express";

// Skip rate limiting in test environment
const skip = () => process.env.NODE_ENV === "test";

/**
 * Rate limiter for authentication endpoints (login, register, password reset)
 * Stricter limits to prevent brute force attacks
 */
export const authLimiter =
  process.env.NODE_ENV === "production"
    ? rateLimit({
        skip,
        windowMs: 15 * 60 * 1000,
        max: 5,
        message: {
          success: false,
          error: "Too many authentication attempts. Please try again after 15 minutes.",
        },
        standardHeaders: true,
        legacyHeaders: false,
        handler: (req: Request, res: Response) => {
          res.status(429).json({
            success: false,
            error: "Too many authentication attempts. Please try again after 15 minutes.",
          });
        },
      })
    : rateLimit({
        windowMs: 60 * 1000, // 1 minute in development
        max: 100, // allow many attempts while testing
      });
/**
 * Rate limiter for general API endpoints
 * Moderate limits for normal API usage
 */
export const apiLimiter = rateLimit({
  skip,
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    success: false,
    error: "Too many requests. Please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req: Request, res: Response) => {
    res.status(429).json({
      success: false,
      error: "Too many requests. Please try again later.",
    });
  },
});

/**
 * Rate limiter for file upload endpoints
 * Stricter limits to prevent abuse of file storage
 */
export const uploadLimiter = rateLimit({
  skip,
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20, // Limit each IP to 20 uploads per hour
  message: {
    success: false,
    error: "Too many file uploads. Please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req: Request, res: Response) => {
    res.status(429).json({
      success: false,
      error: "Too many file uploads. Please try again later.",
    });
  },
});

/**
 * Rate limiter for read-only endpoints (GET requests)
 * More lenient limits for viewing data
 */
export const readLimiter = rateLimit({
  skip,
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 60, // Limit each IP to 60 requests per minute
  message: {
    success: false,
    error: "Too many requests. Please slow down.",
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false,
  handler: (req: Request, res: Response) => {
    res.status(429).json({
      success: false,
      error: "Too many requests. Please slow down.",
    });
  },
});
