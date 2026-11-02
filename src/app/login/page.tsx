import type { Metadata } from "next";
import Link from "next/link";
import LoginForm from "./LoginForm";
import { getSupabaseEnv } from "@/lib/supabase/env";

// Trang đọc phiên đăng nhập theo từng request, không prerender.
export const instant = false;

export const metadata: Metadata = { title: "Đăng nhập · HANYU LOOP" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const configured = getSupabaseEnv() !== null;

  return (
    <div className="page">
      <header className="nav">
        <Link className="logo" href="/">
          <span className="logo-mark" aria-hidden="true">🦊</span>
          <span>HANYU <b>LOOP</b></span>
        </Link>
      </header>

      <main className="auth-wrap">
        <div className="auth-intro">
          <p className="eyebrow">欢迎 · Chào mừng</p>
          <h1>Bước vào Fox Village</h1>
          <p className="lead">
            Tạo tài khoản để lưu nhân vật, kinh nghiệm và hành trình học tiếng Trung của bạn.
          </p>
        </div>

        {configured ? (
          <LoginForm linkError={error === "link"} />
        ) : (
          <div className="auth-card">
            <p className="form-error">
              Website chưa được kết nối Supabase. Hãy tạo file <code>.env.local</code> theo mẫu{" "}
              <code>.env.example</code> rồi chạy lại <code>npm run dev</code>.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
