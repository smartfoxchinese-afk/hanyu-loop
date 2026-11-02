import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import OnboardingForm from "./OnboardingForm";
import { createClient } from "@/lib/supabase/server";

// Trang đọc phiên đăng nhập theo từng request, không prerender.
export const instant = false;

export const metadata: Metadata = { title: "Tạo nhân vật · HANYU LOOP" };

export default async function OnboardingPage() {
  const supabase = await createClient();
  if (!supabase) redirect("/login");

  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) redirect("/login");

  const { data: player } = await supabase
    .from("player_profiles")
    .select("user_id")
    .eq("user_id", auth.user.id)
    .maybeSingle();
  if (player) redirect("/world");

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
          <p className="eyebrow">Bước 1 · Tạo nhân vật</p>
          <h1>Ai sẽ cùng bạn khám phá?</h1>
          <p className="lead">
            Nhân vật sẽ lớn lên theo hành trình học của bạn. Mỗi tài khoản có một nhân vật.
          </p>
        </div>
        <OnboardingForm />
      </main>
    </div>
  );
}
