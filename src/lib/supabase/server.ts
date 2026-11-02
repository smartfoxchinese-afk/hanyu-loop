import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { getSupabaseEnv } from "./env";

/** Supabase client cho Server Components, Server Actions và Route Handlers. */
export async function createClient() {
  // Đọc cookie trước: buộc trang render theo từng request, kể cả khi chưa cấu hình .env.
  const cookieStore = await cookies();

  const env = getSupabaseEnv();
  if (!env) return null;

  return createServerClient(env.url, env.key, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          );
        } catch {
          // Gọi từ Server Component: bỏ qua, proxy.ts sẽ làm mới phiên.
        }
      },
    },
  });
}
