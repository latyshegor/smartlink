"use client";

import { useActionState } from "react";
import { login } from "@/app/admin/actions";

const ADMIN_HINT_EMAIL = "artist@smartlink.app";

export function LoginForm() {
  const [state, formAction, pending] = useActionState(login, null);

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <input
        name="email"
        type="email"
        required
        defaultValue={ADMIN_HINT_EMAIL}
        placeholder="Email"
        autoComplete="username"
        className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-[15px] text-white outline-none transition-colors placeholder:text-white/30 focus:border-white/30"
      />
      <input
        name="password"
        type="password"
        required
        placeholder="Password"
        autoComplete="current-password"
        className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-[15px] text-white outline-none transition-colors placeholder:text-white/30 focus:border-white/30"
      />
      {state?.error && (
        <p className="rounded-lg bg-red-500/15 px-3 py-2 text-[13px] text-red-300">
          {state.error}
        </p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="mt-1 rounded-xl bg-white px-4 py-3 text-[15px] font-bold text-black transition-transform hover:-translate-y-0.5 disabled:opacity-60"
      >
        {pending ? "Signing in…" : "Sign in"}
      </button>
      <p className="mt-1 text-center text-[12px] text-white/35">
        Demo: {ADMIN_HINT_EMAIL} / demo1234
      </p>
    </form>
  );
}
