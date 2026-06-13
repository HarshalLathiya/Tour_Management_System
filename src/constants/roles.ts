export const ROLES = {
  SUPER_ADMIN: "super_admin",
  ADMIN: "admin",
  LEADER: "leader",
  PARTICIPANT: "participant",
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];
