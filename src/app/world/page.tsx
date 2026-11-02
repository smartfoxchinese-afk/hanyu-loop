import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { CHARACTERS, isCharacterType } from "@/lib/characters";
import { signOut } from "@/app/auth/actions";
import { completeQuest } from "./actions";

// Trang đọc phiên đăng nhập theo từng request, không prerender.
export const instant = false;

export const metadata: Metadata = { title: "Thế giới của tôi · HANYU LOOP" };

type Player = {
  character_type: string;
  character_name: string;
  level: number;
  xp: number;
  coins: number;
};

type Quest = { code: string; title_vi: string; xp_reward: number; coin_reward: number };

export default async function WorldPage() {
  const supabase = await createClient();
  if (!supabase) redirect("/login");

  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) redirect("/login");

  const [{ data: player }, { data: profile }, { data: quests }, { data: done }] = await Promise.all([
    supabase.from("player_profiles").select("*").eq("user_id", auth.user.id).maybeSingle(),
    supabase.from("profiles").select("display_name").eq("id", auth.user.id).maybeSingle(),
    supabase.from("quests").select("code, title_vi, xp_reward, coin_reward").order("created_at"),
    supabase.from("quest_progress").select("quest_code").eq("user_id", auth.user.id),
  ]);

  if (!player) redirect("/onboarding");

  const p = player as Player;
  const character = isCharacterType(p.character_type)
    ? CHARACTERS[p.character_type]
    : CHARACTERS.fox;
  const completed = new Set((done ?? []).map((d) => d.quest_code as string));
  const xpInLevel = p.xp % 100;

  return (
    <div className="page">
      <header className="nav">
        <Link className="logo" href="/">
          <span className="logo-mark" aria-hidden="true">🦊</span>
          <span>HANYU <b>LOOP</b></span>
        </Link>
        <form action={signOut}>
          <button className="btn ghost small" type="submit">Đăng xuất</button>
        </form>
      </header>

      <main className="world">
        <section className="player-card">
          <div className="player-avatar" aria-hidden="true">{character.emoji}</div>
          <div className="player-info">
            <p className="eyebrow">
              {profile?.display_name ? `Xin chào, ${profile.display_name}` : "Xin chào"} · Fox Village
            </p>
            <h1>{p.character_name}</h1>
            <p className="player-meta">
              {character.vi} <span lang="zh">{character.zh}</span>
            </p>
            <div className="stats">
              <span className="stat"><b>Cấp {p.level}</b></span>
              <span className="stat">⭐ {p.xp} XP</span>
              <span className="stat">🪙 {p.coins} xu</span>
            </div>
            <div
              className="xp-bar"
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={xpInLevel}
              aria-label="Kinh nghiệm trong cấp hiện tại"
            >
              <span style={{ width: `${xpInLevel}%` }} />
            </div>
            <small className="muted">{100 - xpInLevel} XP nữa để lên cấp {p.level + 1}</small>
          </div>
        </section>

        <section className="quests">
          <h2>Nhiệm vụ</h2>
          <ul>
            {((quests ?? []) as Quest[]).map((q) => {
              const isDone = completed.has(q.code);
              return (
                <li key={q.code} className={`quest${isDone ? " done" : ""}`}>
                  <div>
                    <b>{q.title_vi}</b>
                    <small>+{q.xp_reward} XP · +{q.coin_reward} xu</small>
                  </div>
                  {isDone ? (
                    <span className="badge">Đã hoàn thành ✓</span>
                  ) : (
                    <form action={completeQuest}>
                      <input type="hidden" name="quest_code" value={q.code} />
                      <button className="btn primary small" type="submit">Nhận thưởng</button>
                    </form>
                  )}
                </li>
              );
            })}
          </ul>
          <p className="muted">
            Sprint tiếp theo sẽ thêm bài học HSK 1 và nhiệm vụ thật trong Fox Village.
          </p>
        </section>
      </main>
    </div>
  );
}
