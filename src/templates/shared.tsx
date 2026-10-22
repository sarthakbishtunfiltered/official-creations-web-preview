import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
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
  // Shown when there is no uploaded image, or the uploaded link is broken.
  fallback?: string;
  alt: string;
  tone?: number;
  className?: string;
}

// An uploaded or linked image. Order: the team's image, then the template's default photo,
// then a calm placeholder. A file that fails to load is skipped, so a missing default is harmless.
export function Pic({ src, fallback, alt, tone = 0, className = "" }: PicProps) {
  const [failed, setFailed] = useState<string[]>([]);
  const current = [src, fallback].find((s): s is string => Boolean(s) && !failed.includes(s as string));
  if (current) {
    return (
      <img
        src={current}
        alt={alt}
        loading="lazy"
        onError={() => setFailed((f) => [...f, current])}
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

// ---- map ---------------------------------------------------------------------------------------

// Accepts the pasted "Embed a map" code or just its link, and returns the embed address only if
// it really is a Google Maps address. Anything else is ignored.
export function parseMapEmbed(input: string): string {
  const raw = input.trim();
  if (!raw) return "";
  const fromTag = /src=["']([^"']+)["']/i.exec(raw);
  const url = (fromTag ? (fromTag[1] ?? "") : raw).replace(/&amp;/g, "&").trim();
  return /^https:\/\/www\.google\.com\/maps(\/embed)?\?/.test(url) ? url : "";
}

// The place Google Maps should show. It is only ever an area: the typed address, or else just
// the city. The business name is deliberately left out, because searching for a name makes Google
// jump to whichever business with that name it likes.
export function mapQuery(data: SiteData): string {
  const address = data.address.replace(/\s*\n\s*/g, ", ").trim();
  if (!address) return data.city;
  return address.toLowerCase().includes(data.city.toLowerCase()) ? address : `${address}, ${data.city}`;
}

export function mapSearchEmbed(query: string): string {
  return `https://www.google.com/maps?q=${encodeURIComponent(query)}&output=embed`;
}

// Google's documented "Maps URLs" format for opening a search in the Maps app or site.
export function mapOpenHref(query: string): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

// A full Google Maps link (the long kind, copied from the address bar) holds the exact spot as
// latitude and longitude. Returns "lat,lng", or "" for short links and anything else.
export function parseMapCoords(link: string): string {
  if (!/^https:\/\/(www\.google\.[a-z.]+|maps\.google\.[a-z.]+)\/maps/.test(link)) return "";
  const pin = /!3d(-?\d{1,3}\.\d+)!4d(-?\d{1,3}\.\d+)/.exec(link);
  const view = /@(-?\d{1,3}\.\d+),(-?\d{1,3}\.\d+)/.exec(link);
  const m = pin ?? view;
  return m ? `${m[1]},${m[2]}` : "";
}

// What to show in the map box, and where "Open in Maps" should go. In order of preference:
// the embed code the team pasted, the exact spot from a full Google Maps link, then the area.
export function resolveMap(data: SiteData): { src: string; href: string } {
  const query = mapQuery(data);
  const link = safeHref(str(data, "mapsLink"));
  const coords = parseMapCoords(link);
  const src =
    parseMapEmbed(str(data, "mapEmbed")) ||
    (coords ? `https://www.google.com/maps?q=${coords}&z=16&output=embed` : mapSearchEmbed(query));
  return { src, href: link || mapOpenHref(query) };
}

// ---- motion ------------------------------------------------------------------------------------

export function prefersReducedMotion(): boolean {
  return typeof window !== "undefined" && typeof window.matchMedia === "function" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

// True a moment after the first paint, so first-view animations have a starting state to move from.
export function useEntrance(): boolean {
  const [on, setOn] = useState(prefersReducedMotion);
  useEffect(() => {
    if (on) return;
    const id = window.setTimeout(() => setOn(true), 40);
    return () => window.clearTimeout(id);
  }, [on]);
  return on;
}

interface RevealProps {
  children: ReactNode;
  delay?: number;
  className?: string;
}

// Fades and lifts its content into place when it scrolls into view. With reduced motion
// (or no IntersectionObserver) the content is simply shown.
export function Reveal({ children, delay = 0, className = "" }: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(() => prefersReducedMotion() || typeof IntersectionObserver === "undefined");
  const [settled, setSettled] = useState(false);

  useEffect(() => {
    if (shown) return;
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setShown(true);
          io.disconnect();
        }
      },
      { threshold: 0.1, rootMargin: "0px 0px -6% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [shown]);

  return (
    <div
      ref={ref}
      onTransitionEnd={() => setSettled(true)}
      className={`transition-[opacity,translate] duration-700 ease-out ${shown ? "translate-y-0 opacity-100" : "translate-y-7 opacity-0"} ${className}`}
      style={{ transitionDelay: shown && !settled ? `${delay}ms` : "0ms" }}
    >
      {children}
    </div>
  );
}

// A number that counts up when it scrolls into view ("120+", "₹5 Cr", "1,200"). Text that
// holds no number is shown as it is.
export function CountUp({ value }: { value: string }) {
  const match = /^(\D*?)(\d[\d,]*)(.*)$/.exec(value);
  const target = match ? parseInt((match[2] ?? "0").replace(/,/g, ""), 10) : 0;
  const animate = match !== null && !prefersReducedMotion() && typeof IntersectionObserver !== "undefined";
  const ref = useRef<HTMLSpanElement>(null);
  const [current, setCurrent] = useState(animate ? 0 : target);

  useEffect(() => {
    const el = ref.current;
    if (!animate || !el) return;
    let frame = 0;
    const io = new IntersectionObserver((entries) => {
      if (!entries.some((e) => e.isIntersecting)) return;
      io.disconnect();
      const start = performance.now();
      const tick = (now: number) => {
        const t = Math.min((now - start) / 1400, 1);
        setCurrent(Math.round(target * (1 - (1 - t) ** 3)));
        if (t < 1) frame = requestAnimationFrame(tick);
      };
      frame = requestAnimationFrame(tick);
    });
    io.observe(el);
    return () => {
      io.disconnect();
      if (frame) cancelAnimationFrame(frame);
    };
  }, [animate, target]);

  if (!match) return <>{value}</>;
  const digits = match[2] ?? "";
  const shown = digits.includes(",") ? current.toLocaleString("en-IN") : String(current);
  return (
    <span ref={ref} aria-label={value}>
      <span aria-hidden="true">
        {match[1]}
        {shown}
        {match[3]}
      </span>
    </span>
  );
}

// Moves an image slowly as the page scrolls. The element must sit inside a clipping parent.
export function useParallax<T extends HTMLElement>(strength = 0.05) {
  const ref = useRef<T>(null);
  useEffect(() => {
    const el = ref.current;
    const box = el?.parentElement;
    if (!el || !box || prefersReducedMotion()) return;
    let frame = 0;
    const update = () => {
      frame = 0;
      const r = box.getBoundingClientRect();
      const y = Math.min(Math.max(-r.top, 0), r.height) * strength;
      el.style.transform = `translate3d(0, ${y.toFixed(1)}px, 0) scale(1.14)`;
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [strength]);
  return ref;
}

// True when the site is open on its own full-page preview tab (fixed buttons make sense there).
export function isFullPagePreview(): boolean {
  return typeof window !== "undefined" && new URLSearchParams(window.location.search).has("preview");
}
