"use client";

import { useRef, useState } from "react";
import {
  ThemeConfig,
  THEME_PRESETS,
  DEFAULT_THEME,
  BackgroundType,
  FontKey,
  ButtonStyle,
} from "@/lib/theme";
import { fileToDataUrl } from "@/lib/upload";
import { Field, Segmented, ColorField, inputCls } from "./controls";

interface Props {
  theme: ThemeConfig;
  onPatch: (p: Partial<ThemeConfig>) => void;
  onReset?: () => void;
  showPresets?: boolean;
  onExtractAccent?: () => Promise<void> | void;
  extracting?: boolean;
}

export function ThemeControls({
  theme,
  onPatch,
  onReset,
  showPresets = true,
  onExtractAccent,
  extracting,
}: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploadErr, setUploadErr] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  async function onPickImage(file?: File) {
    if (!file) return;
    setUploadErr(null);
    setUploading(true);
    try {
      const dataUrl = await fileToDataUrl(file);
      onPatch({ bgImage: dataUrl, background: "image" });
    } catch (e) {
      setUploadErr(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {showPresets && (
        <Field label="Start from a preset">
          <div className="flex flex-wrap gap-2">
            {THEME_PRESETS.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => onPatch({ ...p.config })}
                className="rounded-full border border-white/15 px-3.5 py-1.5 text-[13px] font-semibold hover:bg-white/10"
              >
                {p.label}
              </button>
            ))}
          </div>
        </Field>
      )}

      <Field label="Background">
        <Segmented<BackgroundType>
          value={theme.background}
          options={[
            ["cover", "Cover blur"],
            ["image", "Custom image"],
            ["gradient", "Gradient"],
            ["solid", "Solid"],
          ]}
          onChange={(v) => onPatch({ background: v })}
        />
      </Field>

      {theme.background === "image" && (
        <div className="flex flex-col gap-2">
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => onPickImage(e.target.files?.[0])}
          />
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="rounded-xl border border-white/15 px-4 py-2.5 text-[13px] font-semibold hover:bg-white/10 disabled:opacity-50"
            >
              {uploading ? "Processing…" : theme.bgImage ? "Replace image" : "⬆ Upload image"}
            </button>
            {theme.bgImage && (
              <button
                type="button"
                onClick={() => onPatch({ bgImage: "" })}
                className="rounded-xl border border-white/15 px-3 py-2.5 text-[13px] font-semibold text-white/60 hover:bg-white/10"
              >
                Remove
              </button>
            )}
          </div>
          <Field label="…or paste an image URL">
            <input
              className={inputCls}
              value={theme.bgImage.startsWith("data:") ? "" : theme.bgImage}
              onChange={(e) => onPatch({ bgImage: e.target.value })}
              placeholder="https://…/background.jpg"
            />
          </Field>
          {uploadErr && <p className="text-[12px] text-red-300">{uploadErr}</p>}
        </div>
      )}

      {(theme.background === "cover" || theme.background === "image") && (
        <Field label={`Background blur — ${theme.coverBlur}px`}>
          <input
            type="range"
            min={0}
            max={120}
            value={theme.coverBlur}
            onChange={(e) => onPatch({ coverBlur: +e.target.value })}
            className="w-full"
          />
        </Field>
      )}

      {(theme.background === "gradient" || theme.background === "solid") && (
        <div className="grid grid-cols-2 gap-3">
          <ColorField
            label={theme.background === "solid" ? "Color" : "Color 1"}
            value={theme.bgFrom}
            onChange={(v) => onPatch({ bgFrom: v })}
          />
          {theme.background === "gradient" && (
            <ColorField label="Color 2" value={theme.bgTo} onChange={(v) => onPatch({ bgTo: v })} />
          )}
        </div>
      )}
      {theme.background === "gradient" && (
        <Field label={`Gradient angle — ${theme.bgAngle}°`}>
          <input
            type="range"
            min={0}
            max={360}
            value={theme.bgAngle}
            onChange={(e) => onPatch({ bgAngle: +e.target.value })}
            className="w-full"
          />
        </Field>
      )}

      <Field label="Font">
        <Segmented<FontKey>
          value={theme.font}
          options={[
            ["display", "Display"],
            ["sans", "Sans"],
            ["serif", "Serif"],
            ["mono", "Mono"],
          ]}
          onChange={(v) => onPatch({ font: v })}
        />
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Accent">
          <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-2 py-1.5">
            <input
              type="color"
              value={theme.accent}
              onChange={(e) => onPatch({ accent: e.target.value })}
              className="h-8 w-9 shrink-0 cursor-pointer rounded bg-transparent"
            />
            <input
              value={theme.accent}
              onChange={(e) => onPatch({ accent: e.target.value })}
              className="w-full bg-transparent text-[14px] uppercase outline-none"
            />
            {onExtractAccent && (
              <button
                type="button"
                onClick={() => onExtractAccent()}
                disabled={extracting}
                title="Pull accent from cover"
                className="shrink-0 rounded-lg border border-white/15 px-2 py-1 text-[12px] font-semibold hover:bg-white/10 disabled:opacity-50"
              >
                {extracting ? "…" : "🎨"}
              </button>
            )}
          </div>
        </Field>
        <Field label="Text scheme">
          <Segmented<string>
            value={theme.dark ? "dark" : "light"}
            options={[
              ["dark", "Light text"],
              ["light", "Dark text"],
            ]}
            onChange={(v) => onPatch({ dark: v === "dark" })}
          />
        </Field>
      </div>

      <Field label="Button style">
        <Segmented<ButtonStyle>
          value={theme.buttonStyle}
          options={[
            ["glass", "Glass"],
            ["solid", "Solid"],
            ["outline", "Outline"],
          ]}
          onChange={(v) => onPatch({ buttonStyle: v })}
        />
      </Field>

      <Field label={`Corner radius — ${theme.radius}px`}>
        <input
          type="range"
          min={0}
          max={36}
          value={theme.radius}
          onChange={(e) => onPatch({ radius: +e.target.value })}
          className="w-full"
        />
      </Field>

      {onReset && (
        <button type="button" onClick={onReset} className="self-start text-[12px] text-white/40 hover:text-white">
          Reset theme
        </button>
      )}
    </div>
  );
}

export { DEFAULT_THEME };
