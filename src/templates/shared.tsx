import { useState } from "react";
import type { ListItem, SiteData } from "../lib/siteData";

// ---- reading the optional fields ------------------------------------------------------------

export function str(data: SiteData, key: string): string {
  const v = data.fields[key];
  return typeof v === "string" ? v : "";
}

export function list(data: SiteData, key: string): ListItem[] {
  const v = data.fields[key];
  return Array.isArray(v) ? v : [];
}

export function flag(data: SiteData, key: string): boolean {
  return data.fields[key] === true;
}

// Only ever link to real web addresses.
export function safeHref(url: string): string {
  return /^https?:\/\//i.test(url) ? url : "";
}

// First ~n characters, cut at a word boundary.
export function excerpt(text: string, n: number): string {
  if (text.length <= n) return text;
  const cut = text.slice(0, n);
  const space = cut.lastIndexOf(" ");
  return `${(space > n * 0.6 ? cut.slice(0, space) : cut).trimEnd()}…`;
}

// ---- phone and WhatsApp links ----------------------------------------------------------------

export function telHref(phone: string): string {
  return `tel:${phone.replace(/[^\d+]/g, "")}`;
}

// A 10-digit number is treated as Indian (91 is added); anything longer is used as typed.
export function waNumber(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 10) return `91${digits}`;
  if (digits.length === 11 && digits.startsWith("0")) return `91${digits.slice(1)}`;
  return digits;
}

export function waHref(data: SiteData, message?: string): string {
  const text = message ?? str(data, "whatsappMessage");
  const base = `https://wa.me/${waNumber(data.whatsapp)}`;
  return text ? `${base}?text=${encodeURIComponent(text)}` : base;
}

// ---- colour ----------------------------------------------------------------------------------

function luminance(hex: string): number {
  const n = parseInt(hex.slice(1), 16);
  const channel = (v: number) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * channel((n >> 16) & 255) + 0.7152 * channel((n >> 8) & 255) + 0.0722 * channel(n & 255);
}

// Black or white, whichever reads better on the given #rrggbb colour.
export function readableOn(hex: string): string {
  return luminance(hex) > 0.4 ? "#111111" : "#FFFFFF";
}

export function isBright(hex: string): boolean {
  return luminance(hex) > 0.2;
}

// ---- images ----------------------------------------------------------------------------------

const tones: [string, string][] = [
  ["#CDBBA6", "#A98F76"],
  ["#A68B72", "#7A5E48"],
  ["#D9CDBD", "#B9A68E"],
  ["#8A6A52", "#5B4333"],
  ["#BFA58C", "#8E7157"],
];

interface PicProps {
  src?: string;
  alt: string;
  tone?: number;
  className?: string;
}

// An uploaded or linked image. With no image, or if the link is broken, a calm placeholder is shown.
export function Pic({ src, alt, tone = 0, className = "" }: PicProps) {
  const [failed, setFailed] = useState("");
  if (src && src !== failed) {
    return (
      <img
        src={src}
        alt={alt}
        loading="lazy"
        onError={() => setFailed(src)}
        className={`h-full w-full object-cover ${className}`}
      />
    );
  }
  const pair = tones[tone % tones.length];
  const from = pair ? pair[0] : "#CDBBA6";
  const to = pair ? pair[1] : "#A98F76";
  return (
    <div
      role="img"
      aria-label={alt}
      className={`h-full w-full ${className}`}
      style={{ background: `linear-gradient(135deg, ${from}, ${to})` }}
    />
  );
}

// Small diagonal arrow used on tiles and links.
export function ArrowIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M7 17 17 7M8 7h9v9" />
    </svg>
  );
}

export function scrollToId(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}
