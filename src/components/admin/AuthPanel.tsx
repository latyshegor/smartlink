"use client";

import { useActionState, useState } from "react";
import { login, signup } from "@/app/admin/actions";
import { inputCls } from "./controls";

export function AuthPanel() {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [loginState, loginAction, loginPending] = useActionState(login, null);
  const [signupState, signupAction, signupPending] = useActionState(signup, null);

  return (
    <div>
      <div className="mb-4 flex gap-1 rounded-xl border border-white/10 bg-white/5 p-1">
        <button
          onClick={() => setMode("login")}
          className={`flex-1 rounded-lg py-2 text-[14px] font-semibold transition-colors ${mode === "login" ? "bg-white text-black" : "text-white/60 hover:text-white"}`}
        >
          Sign in
        </button>
        <button
          onClick={() => setMode("signup")}
          className={`flex-1 rounded-lg py-2 text-[14px] font-semibold transition-colors ${mode === "signup" ? "bg-white text-black" : "text-white/60 hover:text-white"}`}
        >
          Create account
        </button>
      </div>

      {mode === "login" ? (
        <form action={loginAction} className="flex flex-col gap-3">
          <input name="email" type="email" required defaultValue="artist@smartlink.app" placeholder="Email" autoComplete="username" className={inputCls} />
          <input name="password" type="password" required placeholder="Password" autoComplete="current-password" className={inputCls} />
          {loginState?.error && <p className="rounded-lg bg-red-500/15 px-3 py-2 text-[13px] text-red-300">{loginState.error}</p>}
          <button type="submit" disabled={loginPending} className="mt-1 rounded-xl bg-white px-4 py-3 text-[15px] font-bold text-black transition-transform hover:-translate-y-0.5 disabled:opacity-60">
            {loginPending ? "Signing in…" : "Sign in"}
          </button>
          <p className="mt-1 text-center text-[12px] text-white/35">Demo: artist@smartlink.app / demo1234</p>
        </form>
      ) : (
        <form action={signupAction} className="flex flex-col gap-3">
          <input name="name" type="text" required placeholder="Artist or label name" autoComplete="name" className={inputCls} />
          <input name="email" type="email" required placeholder="Email" autoComplete="email" className={inputCls} />
          <input name="password" type="password" required placeholder="Password (min 6 chars)" autoComplete="new-password" className={inputCls} />
          {signupState?.error && <p className="rounded-lg bg-red-500/15 px-3 py-2 text-[13px] text-red-300">{signupState.error}</p>}
          <button type="submit" disabled={signupPending} className="mt-1 rounded-xl bg-white px-4 py-3 text-[15px] font-bold text-black transition-transform hover:-translate-y-0.5 disabled:opacity-60">
            {signupPending ? "Creating…" : "Create account & start"}
          </button>
          <p className="mt-1 text-center text-[12px] text-white/35">Free. You’ll set up your first page next.</p>
        </form>
      )}
    </div>
  );
}
