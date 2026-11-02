"use client";

import { useActionState, useState } from "react";
import { signIn, signUp, type AuthState } from "@/app/auth/actions";

export default function LoginForm({ linkError }: { linkError: boolean }) {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [signInState, signInAction, signingIn] = useActionState<AuthState, FormData>(signIn, {});
  const [signUpState, signUpAction, signingUp] = useActionState<AuthState, FormData>(signUp, {});

  const isSignUp = mode === "signup";
  const state = isSignUp ? signUpState : signInState;
  const pending = isSignUp ? signingUp : signingIn;

  return (
    <div className="auth-card">
      <div className="auth-tabs" role="tablist">
        <button
          type="button"
          role="tab"
          aria-selected={!isSignUp}
          className={!isSignUp ? "active" : ""}
          onClick={() => setMode("signin")}
        >
          Đăng nhập
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={isSignUp}
          className={isSignUp ? "active" : ""}
          onClick={() => setMode("signup")}
        >
          Tạo tài khoản
        </button>
      </div>

      {linkError && !state.error && !state.message && (
        <p className="form-error">Link xác nhận đã hết hạn hoặc không hợp lệ. Hãy đăng nhập lại.</p>
      )}

      <form action={isSignUp ? signUpAction : signInAction} className="auth-form">
        {isSignUp && (
          <label>
            Tên của bạn
            <input name="display_name" type="text" maxLength={40} placeholder="Ví dụ: Thắm" />
          </label>
        )}
        <label>
          Email
          <input name="email" type="email" required autoComplete="email" placeholder="ban@email.com" />
        </label>
        <label>
          Mật khẩu
          <input
            name="password"
            type="password"
            required
            minLength={isSignUp ? 8 : undefined}
            autoComplete={isSignUp ? "new-password" : "current-password"}
            placeholder={isSignUp ? "Ít nhất 8 ký tự" : ""}
          />
        </label>

        {state.error && <p className="form-error">{state.error}</p>}
        {state.message && <p className="form-ok">{state.message}</p>}

        <button className="btn primary" type="submit" disabled={pending}>
          {pending ? "Đang xử lý…" : isSignUp ? "Tạo tài khoản" : "Vào thế giới"}
        </button>
      </form>
    </div>
  );
}
