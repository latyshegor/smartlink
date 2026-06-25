import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/session";
import { AuthPanel } from "@/components/admin/AuthPanel";
import { Logo } from "@/components/Logo";

export const dynamic = "force-dynamic";

export default async function AdminLogin() {
  const session = await getSession();
  if (session.artistId) redirect("/admin/links");

  return (
    <div className="admin-surface flex min-h-screen flex-col px-6">
      <header className="py-6">
        <Link href="/">
          <Logo size={24} textClass="text-[17px]" />
        </Link>
      </header>
      <div className="flex flex-1 items-center justify-center pb-16">
        <div className="w-full max-w-sm">
          <div className="mb-8 text-center">
            <h1
              className="text-[28px] font-bold tracking-[-0.02em]"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Your studio
            </h1>
            <p className="mt-2 text-[14px] text-white/50">Build your smart link in minutes</p>
          </div>
          <AuthPanel />
        </div>
      </div>
    </div>
  );
}
