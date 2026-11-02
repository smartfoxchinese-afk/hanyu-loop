"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isCharacterType } from "@/lib/characters";

export type OnboardingState = { error?: string };

export async function createPlayer(
  _prev: OnboardingState,
  formData: FormData,
): Promise<OnboardingState> {
  const supabase = await createClient();
  if (!supabase) return { error: "Website chưa được kết nối Supabase." };

  const type = String(formData.get("character_type") ?? "");
  const name = String(formData.get("character_name") ?? "").trim();

  if (!isCharacterType(type)) return { error: "Hãy chọn một nhân vật." };
  if (name.length < 1 || name.length > 20) return { error: "Tên nhân vật cần 1–20 ký tự." };

  const { error } = await supabase.rpc("create_player", {
    p_character_type: type,
    p_character_name: name,
  });

  if (error && !error.message.includes("player_exists")) {
    return { error: "Chưa tạo được nhân vật. Vui lòng thử lại." };
  }

  redirect("/world");
}
