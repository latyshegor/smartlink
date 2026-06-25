import Link from "next/link";
import { requireArtist } from "@/lib/auth";
import { logout } from "@/app/admin/actions";

export const dynamic = "force-dynamic";

export default async function LinksLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const artist = await requireArtist();

  return (
    <div className="admin-surface min-h-screen">
      <header className="sticky top-0 z-30 border-b border-white/10 bg-[#0b0b11]/80 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-3.5">
          <Link href="/admin/links" className="flex items-center gap-2 font-bold">
            <span className="text-[15px]">◆ SmartLink</span>
          </Link>
          <div className="flex items-center gap-4">
            <span className="hidden text-[13px] text-white/40 sm:block">{artist.email}</span>
            <Link
              href="/admin/links/new"
              className="rounded-full bg-white px-4 py-2 text-[13px] font-bold text-black transition-transform hover:-translate-y-0.5"
            >
              + New link
            </Link>
            <form action={logout}>
              <button className="text-[13px] text-white/50 transition-colors hover:text-white">
                Log out
              </button>
            </form>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-5 py-8">{children}</main>
    </div>
  );
}
