import Link from "next/link";
import { requireArtist } from "@/lib/auth";
import { LinkEditor } from "@/components/admin/LinkEditor";
import { DEFAULT_THEME } from "@/lib/theme";

export const dynamic = "force-dynamic";

export default async function NewLink() {
  await requireArtist();
  return (
    <div>
      <div className="mb-6">
        <Link href="/admin/links" className="text-[13px] text-white/40 hover:text-white">
          ← Back to links
        </Link>
        <h1 className="mt-2 text-2xl font-bold" style={{ fontFamily: "var(--font-display)" }}>
          New smart link
        </h1>
      </div>
      <LinkEditor
        initial={{
          title: "",
          artistName: "",
          coverUrl: "",
          slug: "",
          releaseDate: "",
          theme: { ...DEFAULT_THEME },
          platforms: {},
        }}
      />
    </div>
  );
}
