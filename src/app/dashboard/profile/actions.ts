"use server";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export async function updateProfile(data: Record<string, unknown>) {
  // Profile updates would go through Express API
  // For now, return success as a stub
  void data;
  void API_URL;
  return { success: true, error: undefined as string | undefined };
}
