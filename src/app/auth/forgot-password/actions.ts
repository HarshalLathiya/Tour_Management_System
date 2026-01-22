"use server";

import { createAdminClient } from "@/lib/supabase/admin";

export async function adminResetPassword(email: string, newPassword: string) {
  const supabase = createAdminClient();

  // 1. Get user by email
  const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();
  
  if (listError) {
    return { error: listError.message };
  }

  const user = users.find(u => u.email === email);

  if (!user) {
    return { error: "User not found with this email." };
  }

  // 2. Update password
  const { error: updateError } = await supabase.auth.admin.updateUserById(
    user.id,
    { password: newPassword }
  );

  if (updateError) {
    return { error: updateError.message };
  }

  return { success: true };
}
