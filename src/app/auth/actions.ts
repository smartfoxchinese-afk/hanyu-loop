"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type AuthState = { error?: string; message?: string };

const ERRORS: Record<string, string> = {
  "Invalid login credentials": "Email hoặc mật khẩu chưa đúng.",
  "Email not confirmed": "Bạn chưa xác nhận email. Hãy mở hộp thư và bấm link xác nhận.",
  "User already registered": "Email này đã có tài khoản. Hãy đăng nhập.",
};

function friendly(message: string) {
  if (ERRORS[message]) return ERRORS[message];
  if (/rate limit/i.test(message)) return "Bạn thao tác quá nhanh. Vui lòng đợi một chút rồi thử lại.";
  if (/password/i.test(message)) return "Mật khẩu cần ít nhất 8 ký tự.";
  return "Có lỗi xảy ra. Vui lòng thử lại.";
}

function readCredentials(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  return { email, password };
}

export async function signIn(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const supabase = await createClient();
  if (!supabase) return { error: "Website chưa được kết nối Supabase (thiếu file .env.local)." };

  const { email, password } = readCredentials(formData);
  if (!email || !password) return { error: "Hãy nhập email và mật khẩu." };

  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { error: friendly(error.message) };

  redirect("/world");
}

export async function signUp(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const supabase = await createClient();
  if (!supabase) return { error: "Website chưa được kết nối Supabase (thiếu file .env.local)." };

  const { email, password } = readCredentials(formData);
  const displayName = String(formData.get("display_name") ?? "").trim().slice(0, 40);

  if (!email || !password) return { error: "Hãy nhập email và mật khẩu." };
  if (password.length < 8) return { error: "Mật khẩu cần ít nhất 8 ký tự." };

  const h = await headers();
  const origin = h.get("origin") ?? `http://${h.get("host") ?? "localhost:3000"}`;

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${origin}/auth/callback`,
      data: displayName ? { display_name: displayName } : undefined,
    },
  });
  if (error) return { error: friendly(error.message) };

  // Nếu Supabase tắt xác nhận email thì đã có phiên ngay.
  if (data.session) redirect("/onboarding");

  return {
    message: "Đã tạo tài khoản! Hãy mở email và bấm link xác nhận, sau đó quay lại đăng nhập.",
  };
}

export async function signOut() {
  const supabase = await createClient();
  if (supabase) await supabase.auth.signOut();
  redirect("/");
}
