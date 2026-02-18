/**
 * Application Configuration
 * Centralized configuration for all environment-dependent values
 */

export const config = {
  // API Configuration
  api: {
    baseUrl: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001",
    timeout: 30000, // 30 seconds
  },

  // Authentication
  auth: {
    tokenKey: "tms_token",
    userKey: "tms_user",
    tokenExpiry: 86400, // 24 hours in seconds
  },

  // App Info
  app: {
    name: "TourSync",
    description: "Global Tour Management System",
    version: "1.0.0",
  },

  // Feature Flags
  features: {
    enableNotifications: true,
    enableDarkMode: true,
    enablePWA: true,
  },
} as const;

// Type for the config
export type AppConfig = typeof config;
