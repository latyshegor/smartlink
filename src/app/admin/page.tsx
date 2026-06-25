import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { LoginForm } from "@/components/admin/LoginForm";

export const dynamic = "force-dynamic";

export default async function AdminLogin() {
  const session = await getSession();
  if (session.artistId) redirect("/admin/links");

  return (
    <div className="admin-surface flex min-h-screen items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-white/70">
            ◆ SmartLink
          </span>
          <h1
            className="mt-5 text-2xl font-bold"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Artist admin
          </h1>
          <p className="mt-2 text-[14px] text-white/50">Sign in to manage your pages</p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
