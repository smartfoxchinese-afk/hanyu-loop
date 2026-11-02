"use client";

import { useActionState, useState } from "react";
import { createPlayer, type OnboardingState } from "./actions";
import { CHARACTERS, type CharacterType } from "@/lib/characters";

export default function OnboardingForm() {
  const [selected, setSelected] = useState<CharacterType>("fox");
  const [state, action, pending] = useActionState<OnboardingState, FormData>(createPlayer, {});

  return (
    <form action={action} className="auth-card onboarding">
      <fieldset className="char-grid">
        <legend>Chọn bạn đồng hành</legend>
        {(Object.keys(CHARACTERS) as CharacterType[]).map((key) => {
          const c = CHARACTERS[key];
          return (
            <label key={key} className={`char-option${selected === key ? " selected" : ""}`}>
              <input
                type="radio"
                name="character_type"
                value={key}
                checked={selected === key}
                onChange={() => setSelected(key)}
              />
              <span className="char-emoji" aria-hidden="true">{c.emoji}</span>
              <span className="char-name">{c.vi}</span>
              <span className="char-zh" lang="zh">{c.zh}</span>
              <small>{c.note}</small>
            </label>
          );
        })}
      </fieldset>

      <label className="auth-form">
        Đặt tên cho nhân vật
        <input
          name="character_name"
          type="text"
          required
          maxLength={20}
          defaultValue="Xiao Hu"
        />
      </label>

      {state.error && <p className="form-error">{state.error}</p>}

      <button className="btn primary" type="submit" disabled={pending}>
        {pending ? "Đang tạo…" : "Bắt đầu hành trình"}
      </button>
    </form>
  );
}
