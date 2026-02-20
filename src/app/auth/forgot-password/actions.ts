"use server";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export async function adminResetPassword(email: string, newPassword: string) {
  try {
    const res = await fetch(`${API_URL}/api/auth/direct-reset`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        newPassword,
      }),
      cache: "no-store",
    });

    const data = await res.json();

    if (!res.ok) {
      return { error: data.error || "Reset failed" };
    }

    return { success: true };
  } catch {
    return { error: "Server error" };
  }
}
