import Link from "next/link";

export default function NotFound() {
  return (
    <div className="admin-surface flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <h1 className="text-6xl font-bold" style={{ fontFamily: "var(--font-display)" }}>
        404
      </h1>
      <p className="mt-3 text-white/60">This smart link doesn’t exist.</p>
      <Link
        href="/"
        className="mt-7 rounded-full bg-white px-6 py-3 text-[14px] font-bold text-black"
      >
        Back home
      </Link>
    </div>
  );
}
