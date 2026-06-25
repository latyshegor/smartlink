import Link from "next/link";
import { Logo } from "@/components/Logo";

export default function NotFound() {
  return (
    <div className="admin-surface flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <div className="mb-8">
        <Logo size={26} textClass="text-[18px]" />
      </div>
      <h1
        className="text-[88px] font-bold leading-none lh-accent-text"
        style={{ fontFamily: "var(--font-display)" }}
      >
        404
      </h1>
      <p className="mt-4 text-white/55">This link doesn’t exist (yet).</p>
      <Link
        href="/"
        className="mt-8 rounded-full px-7 py-3 text-[14px] font-bold transition-transform hover:-translate-y-0.5"
        style={{ background: "var(--lh-accent)", color: "var(--lh-ink)" }}
      >
        Back to Linkhub
      </Link>
    </div>
  );
}
