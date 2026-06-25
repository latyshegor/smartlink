"use client";

// Shared form primitives used by both the link editor and the onboarding wizard.

export const inputCls =
  "w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-[15px] text-white outline-none transition-colors placeholder:text-white/25 focus:border-white/30";

export function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[13px] font-medium text-white/60">{label}</span>
      {children}
    </label>
  );
}

export function Segmented<T extends string>({
  value,
  options,
  onChange,
}: {
  value: T;
  options: [T, string][];
  onChange: (v: T) => void;
}) {
  return (
    <div className="flex gap-1 rounded-xl border border-white/10 bg-white/5 p-1">
      {options.map(([v, label]) => (
        <button
          key={v}
          type="button"
          onClick={() => onChange(v)}
          className={`flex-1 rounded-lg px-2 py-2 text-[13px] font-semibold transition-colors ${
            value === v ? "bg-white text-black" : "text-white/60 hover:text-white"
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

export function ColorField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <Field label={label}>
      <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-2 py-1.5">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-8 w-9 shrink-0 cursor-pointer rounded bg-transparent"
        />
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-transparent text-[14px] uppercase outline-none"
        />
      </div>
    </Field>
  );
}

export function PhoneFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto w-full max-w-[320px]">
      <div className="relative aspect-[9/19] overflow-hidden rounded-[2.4rem] border-[10px] border-black bg-black shadow-2xl">
        <div className="no-scrollbar h-full w-full overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}
