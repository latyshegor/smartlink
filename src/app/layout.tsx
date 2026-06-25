import type { Metadata } from "next";
import { Inter, Unbounded, Playfair_Display, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const sans = Inter({
  variable: "--font-sans",
  subsets: ["latin", "cyrillic"],
});
const display = Unbounded({
  variable: "--font-display",
  subsets: ["latin", "cyrillic"],
});
const serif = Playfair_Display({
  variable: "--font-serif",
  subsets: ["latin", "cyrillic"],
});
const mono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin", "cyrillic"],
});

export const metadata: Metadata = {
  title: "SmartLink — one link for every platform",
  description: "Smart links for music artists. One page, every DSP, real analytics.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body
        className={`${sans.variable} ${display.variable} ${serif.variable} ${mono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
