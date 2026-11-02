"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

// Chỉ gửi mã nhiệm vụ. Số XP/xu do database quyết định, không lấy từ trình duyệt.
export async function completeQuest(formData: FormData) {
  const supabase = await createClient();
  if (!supabase) return;

  const code = String(formData.get("quest_code") ?? "");
  if (!/^[a-z0-9_]{3,60}$/.test(code)) return;

  await supabase.rpc("complete_quest", { p_quest_code: code });
  revalidatePath("/world");
}
