import { useEffect, useState } from "react";
import type { ChangeEvent, CSSProperties, FormEvent } from "react";
import { Phone } from "lucide-react";
import type { ListItem, SiteData } from "../../lib/siteData";
import type { LightboxItem } from "../shared";
import {
  ArrowIcon,
  CountUp,
  Lightbox,
  Pic,
  Reveal,
  excerpt,
  flag,
  fontVars,
  isFullPagePreview,
  list,
  readableOn,
  resolveMap,
  safeHref,
  scrollToId,
  str,
  telHref,
  useParallax,
  waHref,
} from "../shared";
import { openStatus } from "../clinics/Simple";

const INK = "#2A1B16";
const MUTED = "#7A6A60";
const CREAM = "#FBF7F2";
const BLUSH = "#F4EBE1";
const BLUSH_DEEP = "#E7D6C6";
const PLUM = "#2E1A15";
const DEFAULT_ACCENT = "#B8604C";

// Default photos for this template. Put the files in public/defaults/salons/ using these names.
// A missing file is skipped and a soft rose placeholder shows instead.
const BASE = "/defaults/salons/";
const defaultImages = {
  hero: `${BASE}hero.png`,
  about: `${BASE}about.webp`,
  gallery: [1, 2, 3, 4, 5].map((n) => `${BASE}gallery-${n}.webp`),
};
const defaultGallery = (i: number) => defaultImages.gallery[i % defaultImages.gallery.length] ?? defaultImages.hero;

// Headings use an elegant serif here. Choosing the Bold font style switches to the shared heavy look.
const HEADING = "[font-family:var(--oc-heading)] [font-weight:var(--oc-weight)] [letter-spacing:var(--oc-track)]";

const categoryFallback = ["Hair", "Skin & facials", "Makeup", "Bridal", "Nails", "Waxing & threading"];
const timeWindows = ["Morning (10 am – 1 pm)", "Afternoon (1 – 4 pm)", "Evening (4 – 8 pm)"];

function ChatIcon({ className = "h-6 w-6" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />
    </svg>
  );
}

function Kicker({ children, light = false }: { children: string; light?: boolean }) {
  return (
    <span className="text-[11px] font-semibold uppercase tracking-[0.22em]" style={{ color: light ? "rgba(255,255,255,0.7)" : MUTED }}>
      {children}
    </span>
  );
}

function Sparkle({ className = "h-4 w-4", color = "currentColor" }: { className?: string; color?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill={color} aria-hidden="true">
      <path d="M12 0c.7 6.2 2.8 9.3 12 12-9.2 2.7-11.3 5.8-12 12-.7-6.2-2.8-9.3-12-12C9.2 9.3 11.3 6.2 12 0Z" />
    </svg>
  );
}

function splitList(text: string): string[] {
  return text.split(/[,·\n]/).map((t) => t.trim()).filter(Boolean);
}

function todayIso(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function prettyDate(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  if (!y || !m || !d) return iso;
  return new Date(y, m - 1, d).toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "long" });
}

type Bridal = { name: string; price: string; items: string[] };

// One bridal package per line: "Name | Price | What is included". A line with only a name still works.
function parseBridal(text: string): Bridal[] {
  return text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const parts = line.split("|").map((p) => p.trim());
      return { name: parts[0] ?? "", price: parts.length > 1 ? (parts[1] ?? "") : "", items: splitList(parts.slice(2).join(", ")).map((t) => t.charAt(0).toUpperCase() + t.slice(1)) };
    })
    .filter((b) => b.name);
}

// Splits the tagline into up to four short stacked lines, like a poster.
function stackLines(text: string): string[] {
  const words = text.split(/\s+/).filter(Boolean);
  if (words.length <= 4) return words;
  const per = Math.ceil(words.length / 4);
  const out: string[] = [];
  for (let i = 0; i < words.length; i += per) out.push(words.slice(i, i + per).join(" "));
  return out;
}

// One big client card with a photo, flipped through with arrows.
function Testimonials({ items, accent, reviews }: { items: ListItem[]; accent: string; reviews: string }) {
  const [i, setI] = useState(0);
  const count = items.length;
  const t = items[Math.min(i, count - 1)];
  if (!t) return null;
  const go = (d: number) => setI((n) => (n + d + count) % count);
  return (
    <div>
      <div className="grid grid-cols-1 items-center gap-8 rounded-[28px] border border-black/10 bg-white p-5 sm:p-8 md:grid-cols-[1fr_320px] md:gap-12 md:p-10" aria-live="polite">
        <figure className="flex flex-col gap-5">
          <span className="text-[64px] leading-[0.6]" style={{ color: accent }} aria-hidden="true">&ldquo;</span>
          <blockquote className={`text-[24px] leading-[1.4] sm:text-[32px] ${HEADING}`}>{t["quote"]}</blockquote>
          <figcaption className="text-[14px] font-semibold">
            {t["name"]}
            {t["role"] && <span className="mt-0.5 block text-[12px] font-normal" style={{ color: MUTED }}>{t["role"]}</span>}
          </figcaption>
        </figure>
        <div className="mx-auto aspect-[4/5] w-full max-w-[320px] overflow-hidden rounded-[22px] md:max-w-none" style={{ backgroundColor: BLUSH }}>
          {t["photo"] ? (
            <Pic src={t["photo"]} alt={t["name"] ?? "Client"} tone={2} />
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center gap-3" style={{ backgroundColor: `${accent}14` }}>
              <span className={`text-[96px] italic leading-none ${HEADING}`} style={{ color: accent }}>{(t["name"] ?? "A").trim().charAt(0).toUpperCase()}</span>
              <Sparkle className="h-5 w-5" color={accent} />
            </div>
          )}
        </div>
      </div>
      <div className="mt-6 flex items-center justify-center gap-4">
        {count > 1 && (
          <>
            <button type="button" onClick={() => go(-1)} aria-label="Previous review" className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-black/5 transition-colors hover:bg-black/10">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden="true"><path d="m15 18-6-6 6-6" /></svg>
            </button>
            <span className="text-[12px] font-semibold tabular-nums" style={{ color: MUTED }}>{Math.min(i, count - 1) + 1} / {count}</span>
            <button type="button" onClick={() => go(1)} aria-label="Next review" className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-black/5 transition-colors hover:bg-black/10">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden="true"><path d="m9 18 6-6-6-6" /></svg>
            </button>
          </>
        )}
      </div>
      {reviews && (
        <div className="mt-6 text-center">
          <a href={reviews} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-[13px] font-semibold underline underline-offset-[6px]">
            Read our Google reviews <ArrowIcon className="h-3.5 w-3.5" />
          </a>
        </div>
      )}
    </div>
  );
}

// Drag the handle to compare before and after.
function BeforeAfter({ before, after, title }: { before: string; after: string; title: string }) {
  const [pos, setPos] = useState(50);
  return (
    <div className="flex flex-col gap-3">
      <div className="relative aspect-[4/5] select-none overflow-hidden rounded-[24px]" style={{ backgroundColor: BLUSH }}>
        <div className="absolute inset-0">
          <Pic src={after} alt={`${title} after`} tone={2} />
        </div>
        <div className="absolute inset-0" style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}>
          <Pic src={before} alt={`${title} before`} tone={4} />
        </div>
        <span className="pointer-events-none absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em]" style={{ color: INK }}>Before</span>
        <span className="pointer-events-none absolute right-3 top-3 rounded-full bg-white/90 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em]" style={{ color: INK }}>After</span>
        <span className="pointer-events-none absolute bottom-0 top-0 w-0.5 bg-white shadow-[0_0_12px_rgba(0,0,0,0.3)]" style={{ left: `${pos}%` }} aria-hidden="true">
          <span className="absolute left-1/2 top-1/2 flex h-10 w-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white shadow-lg" style={{ color: INK }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5"><path d="m9 6-6 6 6 6M15 6l6 6-6 6" /></svg>
          </span>
        </span>
        <input
          type="range"
          min={0}
          max={100}
          value={pos}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setPos(Number(e.target.value))}
          aria-label={`Compare before and after: ${title}`}
          className="absolute inset-0 h-full w-full cursor-ew-resize opacity-0"
        />
      </div>
      {title && <p className={`text-center text-[20px] ${HEADING}`}>{title}</p>}
    </div>
  );
}

type BookingProps = {
  data: SiteData;
  accent: string;
  serviceNames: string[];
  service: string;
  onService: (s: string) => void;
  homeVisit: boolean;
};

function BookingForm({ data, accent, serviceNames, service, onService, homeVisit }: BookingProps) {
  const [name, setName] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [atHome, setAtHome] = useState(false);
  const [message, setMessage] = useState("");

  // There is no server behind a preview, so the request opens as a WhatsApp message.
  function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const text = `Hi ${data.businessName}, I'm ${name.trim()}. I'd like to book ${service || "an appointment"}${date ? ` on ${prettyDate(date)}` : ""}${time ? `, ${time.toLowerCase()}` : ""}${atHome ? ", at my home" : ""}. ${message.trim()}`;
    window.open(waHref(data, text.replace(/\s+/g, " ").trim()), "_blank", "noopener,noreferrer");
  }

  const field =
    "w-full rounded-2xl border border-black/10 bg-white px-4 py-3.5 text-[15px] placeholder:text-black/40 focus:border-black/40 focus:outline-none focus:ring-0";

  return (
    <form onSubmit={submit} className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      <input className={`${field} sm:col-span-2`} placeholder="Your name" value={name} onChange={(e: ChangeEvent<HTMLInputElement>) => setName(e.target.value)} required aria-label="Your name" />
      <select className={`${field} sm:col-span-2`} value={service} onChange={(e: ChangeEvent<HTMLSelectElement>) => onService(e.target.value)} aria-label="Service">
        <option value="">Choose a service (optional)</option>
        {serviceNames.map((s) => (
          <option key={s} value={s}>{s}</option>
        ))}
      </select>
      <input type="date" min={todayIso()} className={field} value={date} onChange={(e: ChangeEvent<HTMLInputElement>) => setDate(e.target.value)} aria-label="Preferred day" />
      <select className={field} value={time} onChange={(e: ChangeEvent<HTMLSelectElement>) => setTime(e.target.value)} aria-label="Preferred time">
        <option value="">Preferred time</option>
        {timeWindows.map((t) => (
          <option key={t} value={t}>{t}</option>
        ))}
      </select>
      {homeVisit && (
        <label className="flex cursor-pointer items-center gap-3 rounded-2xl border border-black/10 bg-white px-4 py-3.5 text-[14px] sm:col-span-2">
          <input type="checkbox" checked={atHome} onChange={(e: ChangeEvent<HTMLInputElement>) => setAtHome(e.target.checked)} className="h-4 w-4 rounded" style={{ accentColor: accent }} />
          Please come to my home
        </label>
      )}
      <textarea className={`${field} min-h-[84px] resize-y sm:col-span-2`} placeholder="Anything we should know? (optional)" value={message} onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setMessage(e.target.value)} aria-label="Message" />
      <div className="mt-2 sm:col-span-2">
        <button
          type="submit"
          className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-full px-7 py-4 text-[15px] font-semibold transition-transform duration-300 hover:-translate-y-0.5 sm:w-auto"
          style={{ backgroundColor: accent, color: readableOn(accent) }}
        >
          Request my appointment <ArrowIcon className="h-3.5 w-3.5" />
        </button>
        <p className="mt-3 text-[12px]" style={{ color: MUTED }}>Opens WhatsApp with your details. We confirm your slot personally.</p>
      </div>
    </form>
  );
}

export function SalonSimple({ data }: { data: SiteData }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [tab, setTab] = useState("All");
  const [service, setService] = useState("");
  const [viewer, setViewer] = useState<number | null>(null);
  const [status, setStatus] = useState<{ open: boolean; label: string } | null>(null);
  const heroRef = useParallax<HTMLDivElement>(0.03);

  const fullPage = isFullPagePreview();

  const services = list(data, "serviceList").filter((s) => s["name"]);
  const bridal = parseBridal(str(data, "bridalPackages"));
  const team = list(data, "staff").filter((s) => s["name"]);
  const testimonials = list(data, "testimonials");
  const faqs = list(data, "faqs");
  const makeovers = list(data, "beforeAfter").filter((b) => b["before"] && b["after"]);
  const realGallery = list(data, "extraGallery");
  const gallery = realGallery.length > 0 ? realGallery : defaultImages.gallery.map((_, i) => ({ id: `default-${i}`, image: "", caption: "" }));

  const accent = data.brandColor.toLowerCase() === "#111111" ? DEFAULT_ACCENT : data.brandColor;
  const onAccent = readableOn(accent);

  const buttonText = str(data, "buttonText") || "Book an appointment";
  const banner = str(data, "announcementBanner");
  const reviews = safeHref(str(data, "googleReviewsLink"));
  const brochure = safeHref(str(data, "brochureLink"));
  const ownerPhoto = str(data, "ownerPhoto");
  const aboutImage = str(data, "aboutImage");
  const email = str(data, "email");
  const secondPhone = str(data, "secondPhone");
  const hours = str(data, "openingHours");
  const certifications = str(data, "certifications");
  const brands = splitList(str(data, "productBrands"));
  const offerTitle = str(data, "offerTitle");
  const offerText = str(data, "offerText");
  const homeVisit = flag(data, "homeVisit");
  const ladiesOnly = flag(data, "ladiesOnly");
  const bookingMode = str(data, "bookingMode");
  const bookingLink = safeHref(str(data, "bookingLink"));
  const map = resolveMap(data);

  // Category tabs: the owner's own order first, then any extra categories found on the services.
  const typedCategories = splitList(str(data, "serviceCategories"));
  const usedCategories = Array.from(new Set(services.map((s) => (s["category"] ?? "").trim()).filter(Boolean)));
  const categories = Array.from(new Set([...typedCategories.filter((c) => usedCategories.some((u) => u.toLowerCase() === c.toLowerCase())), ...usedCategories]));
  const bandWords = typedCategories.length > 0 ? typedCategories : usedCategories.length > 0 ? usedCategories : categoryFallback;
  const shownServices = tab === "All" ? services : services.filter((s) => (s["category"] ?? "").toLowerCase() === tab.toLowerCase());
  const serviceNames = [...services.map((s) => s["name"] ?? ""), ...bridal.map((b) => b.name)].filter(Boolean);

  let stats: { value: string; label: string }[] = list(data, "keyNumbers").map((n) => ({ value: n["value"] ?? "", label: n["label"] ?? "" }));
  if (stats.length === 0) {
    const est = str(data, "yearEstablished");
    if (est) stats.push({ value: est, label: "Since" });
    if (services.length > 0) stats.push({ value: `${services.length}`, label: "Services" });
  }
  stats = stats.filter((s) => s.value);

  const nav = [
    { id: "sl-services", label: "Services", show: services.length > 0 },
    { id: "sl-bridal", label: "Bridal", show: bridal.length > 0 },
    { id: "sl-gallery", label: "Gallery", show: true },
    { id: "sl-team", label: "Team", show: team.length > 0 },
    { id: "sl-about", label: "About", show: true },
    { id: "sl-book", label: "Book", show: true },
  ].filter((n) => n.show);

  const galleryItems: LightboxItem[] = gallery.map((g, i) => ({ src: g["image"], fallback: defaultGallery(i), title: g["caption"] }));
  const cutout = /^data:image\/png|\.png(\?|#|$)/i.test(data.heroImage || defaultImages.hero);
  const wordSize = `clamp(44px, ${Math.min(15, 96 / Math.max(data.businessName.length, 6)).toFixed(2)}vw, 220px)`;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const update = () => setStatus(hours ? openStatus(hours) : null);
    update();
    const id = window.setInterval(update, 60000);
    return () => window.clearInterval(id);
  }, [hours]);

  const socials: [string, string][] = [
    ["Instagram", safeHref(str(data, "instagram"))],
    ["Facebook", safeHref(str(data, "facebook"))],
    ["YouTube", safeHref(str(data, "youtube"))],
  ];

  function go(id: string) {
    setMenuOpen(false);
    scrollToId(id);
  }

  // The main button follows the booking choice: the form below, a phone call, or the salon's own booking page.
  const mainHref = bookingMode === "Call" ? telHref(data.phone) : bookingMode === "External link" && bookingLink ? bookingLink : "";
  function pick(name: string) {
    if (mainHref) return;
    setService(name);
    go("sl-book");
  }

  const vars: CSSProperties =
    data.fontStyle === "bold"
      ? fontVars(data)
      : ({ ...fontVars(data), "--oc-heading": "'Newsreader', Georgia, 'Times New Roman', serif", "--oc-weight": "400", "--oc-track": "-0.02em" } as CSSProperties);

  const btn = "inline-flex items-center gap-2 rounded-full px-7 py-3.5 text-[14px] font-semibold transition-transform duration-300 hover:-translate-y-0.5";
  const mainButton = (cls: string, style: CSSProperties, label: string) =>
    mainHref ? (
      <a href={mainHref} target={mainHref.startsWith("http") ? "_blank" : undefined} rel="noopener noreferrer" className={cls} style={style}>
        {label} <ArrowIcon className="h-3.5 w-3.5" />
      </a>
    ) : (
      <button type="button" onClick={() => go("sl-book")} className={`${cls} cursor-pointer`} style={style}>
        {label} <ArrowIcon className="h-3.5 w-3.5" />
      </button>
    );

  return (
    <div className={`font-sans ${fullPage ? "pb-20 md:pb-0" : ""}`} style={{ backgroundColor: CREAM, color: INK, ...vars }}>
      <div className="overflow-x-clip">
        {banner && (
          <div className="px-4 py-2 text-center text-[12px] font-semibold" style={{ backgroundColor: accent, color: onAccent }}>
            {banner}
          </div>
        )}

        {/* Navigation */}
        <div className={`sticky top-[var(--oc-top,0px)] z-30 border-b backdrop-blur transition-colors duration-300 ${scrolled ? "border-white/15" : "border-transparent"}`} style={{ backgroundColor: `${PLUM}F2`, color: CREAM }}>
          <header className="mx-auto flex w-full max-w-[1400px] items-center justify-between gap-3 px-5 py-4 sm:px-10">
            {data.logo ? (
              <img src={data.logo} alt={`${data.businessName} logo`} className="h-9 w-auto max-w-[150px] object-contain" />
            ) : (
              <span className={`truncate text-[24px] ${HEADING}`}>{data.businessName}</span>
            )}
            <nav className="hidden items-center gap-7 lg:flex" aria-label="Sections">
              {nav.map((n) => (
                <button key={n.id} type="button" onClick={() => go(n.id)} className="cursor-pointer text-[12px] font-semibold uppercase tracking-[0.16em] transition-opacity hover:opacity-50">
                  {n.label}
                </button>
              ))}
            </nav>
            <div className="flex shrink-0 items-center gap-2">
              {mainButton("hidden items-center gap-2 rounded-full px-5 py-2.5 text-[12px] font-semibold uppercase tracking-[0.12em] transition-transform duration-300 hover:-translate-y-0.5 sm:inline-flex", { backgroundColor: accent, color: onAccent }, "Book now")}
              <a href={telHref(data.phone)} aria-label="Call" className="flex h-9 w-9 items-center justify-center rounded-full sm:hidden" style={{ backgroundColor: accent, color: onAccent }}>
                <Phone className="h-4 w-4" />
              </a>
              <button
                type="button"
                onClick={() => setMenuOpen((o) => !o)}
                aria-expanded={menuOpen}
                aria-label={menuOpen ? "Close menu" : "Open menu"}
                className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-white/30 lg:hidden"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="h-4 w-4" aria-hidden="true">
                  {menuOpen ? <path d="M6 6l12 12M18 6 6 18" /> : <path d="M4 8h16M4 16h16" />}
                </svg>
              </button>
            </div>
          </header>
          {menuOpen && (
            <nav className="animate-pop mx-4 mb-2 flex flex-col overflow-hidden rounded-2xl lg:hidden" style={{ backgroundColor: "#3D251D" }} aria-label="Menu">
              {nav.map((n) => (
                <button key={n.id} type="button" onClick={() => go(n.id)} className="flex cursor-pointer items-center justify-between border-b border-white/10 px-5 py-3.5 text-left text-[15px] font-semibold last:border-b-0">
                  {n.label}
                  <ArrowIcon className="h-4 w-4" />
                </button>
              ))}
            </nav>
          )}
        </div>

        {/* Hero: the salon name huge on dark chocolate, the portrait standing in front of it */}
        <section className="relative overflow-hidden pb-0 pt-8 sm:pt-12" style={{ backgroundColor: PLUM, color: CREAM }}>
          <span className="pointer-events-none absolute left-1/2 top-1/3 h-[420px] w-[620px] -translate-x-1/2 rounded-full blur-3xl" style={{ backgroundColor: `${accent}33` }} aria-hidden="true" />
          <div
            aria-hidden="true"
            className={`relative z-0 select-none px-3 text-center uppercase leading-[0.9] ${HEADING}`}
            style={{ fontSize: wordSize }}
          >
            {data.businessName}
          </div>
          <h1 className="sr-only">{`${data.businessName} · ${data.tagline}`}</h1>

          <div className="relative z-10 mx-auto mt-6 w-full max-w-[1400px] px-5 sm:px-10 md:mt-[var(--ov)] md:h-[640px]" style={{ "--ov": `calc(${wordSize} * -0.62)` } as CSSProperties}>
            <div ref={heroRef} className={`relative mx-auto will-change-transform md:absolute md:bottom-0 md:left-1/2 md:-translate-x-1/2 ${cutout ? "aspect-square w-[min(92%,460px)] md:w-[min(40vw,560px)]" : "aspect-[4/5] w-[min(82%,400px)] md:w-[min(34vw,460px)]"}`}>
              {cutout ? (
                <div className="h-full w-full drop-shadow-[0_30px_40px_rgba(0,0,0,0.35)]">
                  <Pic src={data.heroImage} fallback={defaultImages.hero} alt={data.businessName} tone={1} fit="contain" className="object-bottom" />
                </div>
              ) : (
                <div className="h-full w-full overflow-hidden rounded-t-[999px] shadow-[0_30px_60px_-20px_rgba(0,0,0,0.6)]">
                  <Pic src={data.heroImage} fallback={defaultImages.hero} alt={data.businessName} tone={1} />
                </div>
              )}
            </div>

            <div className="relative z-20 mt-8 flex flex-col items-start gap-6 pb-14 md:absolute md:bottom-16 md:left-10 md:mt-0 md:max-w-[300px] md:pb-0">
              <div className="flex flex-wrap items-center gap-3">
                <Kicker light>{`Women's salon · ${data.city}`}</Kicker>
                {status && (
                  <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-[12px] font-semibold">
                    <span className="h-2 w-2 rounded-full" style={{ backgroundColor: status.open ? "#46C27F" : "#E0A04A" }} aria-hidden="true" />
                    {status.label}
                  </span>
                )}
              </div>
              <p className={`text-[34px] leading-[1.12] sm:text-[40px] ${HEADING}`} aria-hidden="true">
                {stackLines(data.tagline).map((line) => (
                  <span key={line} className="block">{line}</span>
                ))}
              </p>
              <div className="flex flex-wrap items-center gap-4">
                {mainButton(btn, { backgroundColor: accent, color: onAccent }, buttonText)}
              </div>
              {(ladiesOnly || homeVisit || brands.length > 0) && (
                <ul className="flex flex-wrap gap-2">
                  {ladiesOnly && <li className="inline-flex items-center gap-2 rounded-full border border-white/20 px-3.5 py-1.5 text-[12px] font-semibold"><Sparkle className="h-3 w-3" color={accent} />Ladies-only space</li>}
                  {homeVisit && <li className="inline-flex items-center gap-2 rounded-full border border-white/20 px-3.5 py-1.5 text-[12px] font-semibold"><Sparkle className="h-3 w-3" color={accent} />We come to you</li>}
                  {brands.length > 0 && <li className="inline-flex items-center gap-2 rounded-full border border-white/20 px-3.5 py-1.5 text-[12px] font-semibold"><Sparkle className="h-3 w-3" color={accent} />{brands.slice(0, 3).join(" · ")}</li>}
                </ul>
              )}
            </div>

            <button
              type="button"
              onClick={() => go(services.length > 0 ? "sl-services" : "sl-gallery")}
              className="absolute bottom-20 right-10 z-20 hidden w-[200px] cursor-pointer flex-col items-center gap-3 text-center md:flex"
            >
              <span className="block aspect-[4/3] w-full overflow-hidden rounded-xl border border-white/20">
                <Pic src={gallery[0]?.["image"]} fallback={defaultGallery(1)} alt="" tone={2} />
              </span>
              <span className="text-[13px] leading-snug text-white/80">{excerpt(offerText || data.about, 56)}</span>
            </button>
          </div>
        </section>

        {/* Scrolling band of what we do */}
        <div aria-hidden="true" className="overflow-hidden py-4" style={{ backgroundColor: accent, color: onAccent }}>
          <div className="animate-marquee" style={{ animationDuration: "45s" }}>
            {Array.from({ length: 8 }, (_, rep) =>
              bandWords.map((t) => (
                <span key={`${rep}-${t}`} className={`flex shrink-0 items-center gap-7 pr-7 text-[24px] italic sm:text-[30px] ${HEADING}`}>
                  {t}
                  <Sparkle className="h-4 w-4" />
                </span>
              )),
            )}
          </div>
        </div>

        {/* Statement */}
        <section id="sl-about" className="scroll-mt-[calc(var(--oc-top,0px)+72px)] mx-auto w-full max-w-[1200px] px-5 py-16 sm:px-10 sm:py-24">
          <Reveal className="flex flex-col items-start gap-8">
            <Kicker>About us</Kicker>
            <p className={`text-[30px] leading-[1.3] sm:text-[46px] ${HEADING}`}>
              Beauty that feels{" "}
              <span className="mx-1 inline-block h-[0.85em] w-[1.7em] overflow-hidden rounded-full align-[-0.1em]">
                <Pic src={aboutImage || ownerPhoto} fallback={defaultImages.about} alt="" tone={2} />
              </span>{" "}
              like <span className="italic" style={{ color: accent }}>you</span>, only{" "}
              <span className="mx-1 inline-block h-[0.85em] w-[1.7em] overflow-hidden rounded-full align-[-0.1em]">
                <Pic src="" fallback={defaultGallery(2)} alt="" tone={3} />
              </span>{" "}
              more radiant.
            </p>
            <p className="max-w-2xl whitespace-pre-line text-[16px] leading-[1.85]" style={{ color: MUTED }}>{data.about}</p>
            <p className="text-[14px] font-semibold">
              {data.ownerName ? `${data.ownerName}, ` : ""}
              <span className="font-normal" style={{ color: MUTED }}>{data.ownerName ? "founder" : ""}</span>
            </p>
            {certifications && <p className="text-[13px] font-medium">{certifications}</p>}
            {stats.length > 0 && (
              <div className="flex w-full flex-wrap gap-x-12 gap-y-6 border-t border-black/10 pt-8">
                {stats.map((s) => (
                  <div key={s.label + s.value}>
                    <div className={`text-[44px] leading-none sm:text-[56px] ${HEADING}`} style={{ color: accent }}><CountUp value={s.value} /></div>
                    <div className="mt-2 text-[12px]" style={{ color: MUTED }}>{s.label}</div>
                  </div>
                ))}
              </div>
            )}
          </Reveal>
        </section>

        {/* Services */}
        {services.length > 0 && (
          <section id="sl-services" className="scroll-mt-[calc(var(--oc-top,0px)+72px)] px-5 py-16 sm:px-10 sm:py-24" style={{ backgroundColor: BLUSH }}>
            <div className="mx-auto w-full max-w-[1400px]">
              <Reveal className="mb-10 flex flex-col gap-3">
                <Kicker>Services & prices</Kicker>
                <h2 className={`text-[36px] leading-[1.05] sm:text-[60px] ${HEADING}`}>Treat yourself, <span className="italic">beautifully</span></h2>
                {brochure && (
                  <a href={brochure} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 self-start text-[13px] font-semibold underline underline-offset-[6px]">
                    Download the full price list <ArrowIcon className="h-3.5 w-3.5" />
                  </a>
                )}
              </Reveal>
              {categories.length > 1 && (
                <div className="-mx-5 mb-8 flex gap-2 overflow-x-auto px-5 pb-2 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0" role="tablist" aria-label="Service categories">
                  {["All", ...categories].map((c) => {
                    const on = tab === c;
                    return (
                      <button
                        key={c}
                        type="button"
                        role="tab"
                        aria-selected={on}
                        onClick={() => setTab(c)}
                        className="shrink-0 cursor-pointer rounded-full border px-5 py-2.5 text-[13px] font-semibold transition-colors duration-300"
                        style={on ? { backgroundColor: INK, color: "#fff", borderColor: INK } : { backgroundColor: "rgba(255,255,255,0.6)", borderColor: "rgba(0,0,0,0.12)" }}
                      >
                        {c}
                      </button>
                    );
                  })}
                </div>
              )}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {shownServices.map((s: ListItem, i) => (
                  <Reveal key={s.id} delay={(i % 4) * 60}>
                    <div className="group flex h-full items-start gap-4 rounded-[24px] bg-white p-6 transition-transform duration-500 hover:-translate-y-1 sm:p-7">
                      <span className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full" style={{ backgroundColor: `${accent}1F`, color: accent }}>
                        <Sparkle className="h-4 w-4" />
                      </span>
                      <div className="flex min-w-0 flex-1 flex-col gap-2">
                        <div className="flex items-baseline justify-between gap-4">
                          <h3 className={`text-[22px] leading-tight sm:text-[25px] ${HEADING}`}>{s["name"]}</h3>
                          {s["price"] && <span className="shrink-0 text-[16px] font-semibold" style={{ color: accent }}>{s["price"]}</span>}
                        </div>
                        {s["description"] && <p className="text-[14px] leading-[1.65]" style={{ color: MUTED }}>{s["description"]}</p>}
                        <div className="mt-2 flex items-center justify-between gap-3">
                          <span className="text-[12px] font-medium" style={{ color: MUTED }}>{s["duration"] ? `⏱ ${s["duration"]}` : ""}</span>
                          {mainHref ? (
                            <a href={mainHref} target={mainHref.startsWith("http") ? "_blank" : undefined} rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-[13px] font-semibold underline underline-offset-[5px]">
                              Book <ArrowIcon className="h-3 w-3" />
                            </a>
                          ) : (
                            <button type="button" onClick={() => pick(s["name"] ?? "")} className="inline-flex cursor-pointer items-center gap-1.5 text-[13px] font-semibold underline underline-offset-[5px]">
                              Book <ArrowIcon className="h-3 w-3" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </Reveal>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Offer */}
        {(offerTitle || offerText) && (
          <section className="mx-auto w-full max-w-[1400px] px-5 pt-10 sm:px-10 sm:pt-16">
            <Reveal>
              <div className="flex flex-col items-start justify-between gap-5 rounded-[28px] p-7 sm:flex-row sm:items-center sm:p-10" style={{ backgroundColor: accent, color: onAccent }}>
                <div className="flex items-start gap-4">
                  <Sparkle className="mt-1 h-7 w-7 shrink-0" />
                  <div>
                    {offerTitle && <h2 className={`text-[28px] leading-tight sm:text-[38px] ${HEADING}`}>{offerTitle}</h2>}
                    {offerText && <p className="mt-1 text-[15px] opacity-90">{offerText}</p>}
                  </div>
                </div>
                {mainButton("inline-flex shrink-0 items-center gap-2 rounded-full bg-white px-6 py-3 text-[14px] font-semibold transition-transform duration-300 hover:-translate-y-0.5", { color: INK }, "Claim this offer")}
              </div>
            </Reveal>
          </section>
        )}

        {/* Bridal */}
        {bridal.length > 0 && (
          <section id="sl-bridal" className="scroll-mt-[calc(var(--oc-top,0px)+72px)] mt-16 px-5 py-16 text-white sm:mt-24 sm:px-10 sm:py-24" style={{ backgroundColor: PLUM }}>
            <div className="mx-auto w-full max-w-[1400px]">
              <Reveal className="mb-12 flex flex-col gap-3">
                <Kicker light>Bridal</Kicker>
                <h2 className={`text-[36px] leading-[1.05] sm:text-[60px] ${HEADING}`}>The bridal <span className="italic">edit</span></h2>
                <p className="max-w-lg text-[15px] leading-[1.75] text-white/70">
                  Your big day deserves unhurried care. Book your date early, as bridal slots fill quickly{homeVisit ? ", and we can come to you" : ""}.
                </p>
              </Reveal>
              <div className={`grid grid-cols-1 gap-5 ${bridal.length >= 3 ? "md:grid-cols-3" : bridal.length === 2 ? "md:grid-cols-2" : "md:max-w-lg"}`}>
                {bridal.map((b, i) => (
                  <Reveal key={`${b.name}-${i}`} delay={(i % 3) * 110} className="h-full">
                    <div className="flex h-full flex-col gap-5 rounded-[28px] border border-white/15 bg-white/[0.06] p-7 transition-transform duration-500 hover:-translate-y-1.5 sm:p-8">
                      <Sparkle className="h-5 w-5" color={BLUSH_DEEP} />
                      <h3 className={`text-[28px] leading-tight ${HEADING}`}>{b.name}</h3>
                      {b.price && <p className="text-[20px] font-semibold" style={{ color: BLUSH_DEEP }}>{b.price}</p>}
                      {b.items.length > 0 && (
                        <ul className="flex flex-col gap-2.5 text-[14px] leading-[1.5] text-white/80">
                          {b.items.map((it) => (
                            <li key={it} className="flex gap-3">
                              <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full" style={{ backgroundColor: BLUSH_DEEP }} aria-hidden="true" />
                              {it}
                            </li>
                          ))}
                        </ul>
                      )}
                      {mainHref ? (
                        <a href={mainHref} target={mainHref.startsWith("http") ? "_blank" : undefined} rel="noopener noreferrer" className="mt-auto inline-flex items-center gap-2 pt-3 text-[13px] font-semibold underline underline-offset-[6px]">
                          Reserve this date <ArrowIcon className="h-3.5 w-3.5" />
                        </a>
                      ) : (
                        <button type="button" onClick={() => pick(b.name)} className="mt-auto inline-flex cursor-pointer items-center gap-2 self-start pt-3 text-[13px] font-semibold underline underline-offset-[6px]">
                          Reserve this date <ArrowIcon className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  </Reveal>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Before and after */}
        {makeovers.length > 0 && (
          <section className="mx-auto w-full max-w-[1400px] px-5 py-16 sm:px-10 sm:py-24" aria-label="Before and after">
            <Reveal className="mb-10 flex flex-col gap-3">
              <Kicker>Real results</Kicker>
              <h2 className={`text-[34px] leading-[1.05] sm:text-[54px] ${HEADING}`}>See the <span className="italic">difference</span></h2>
              <p className="text-[14px]" style={{ color: MUTED }}>Drag the handle to compare.</p>
            </Reveal>
            <div className={`grid grid-cols-1 gap-8 ${makeovers.length >= 3 ? "md:grid-cols-3" : makeovers.length === 2 ? "md:grid-cols-2" : "md:max-w-md"}`}>
              {makeovers.map((m, i) => (
                <Reveal key={m.id} delay={(i % 3) * 100}>
                  <BeforeAfter before={m["before"] ?? ""} after={m["after"] ?? ""} title={m["title"] ?? ""} />
                </Reveal>
              ))}
            </div>
          </section>
        )}

        {/* Gallery */}
        <section id="sl-gallery" className="scroll-mt-[calc(var(--oc-top,0px)+72px)] mx-auto w-full max-w-[1400px] px-5 py-16 sm:px-10 sm:py-24">
          <Reveal className="mb-10 flex flex-col gap-3">
            <Kicker>Our work</Kicker>
            <h2 className={`text-[34px] leading-[1.05] sm:text-[54px] ${HEADING}`}>A look <span className="italic">inside</span></h2>
          </Reveal>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-5">
            {gallery.map((g, i) => {
              const span = i % 3 === 1 ? "md:mt-12" : "";
              const ratio = "aspect-[4/5]";
              return (
                <Reveal key={g.id} delay={(i % 3) * 80} className={span}>
                  <button type="button" onClick={() => setViewer(i)} aria-label={`View ${g["caption"] || `photo ${i + 1}`} larger`} className="group block w-full cursor-zoom-in text-left">
                    <span className={`block overflow-hidden rounded-[22px] ${ratio}`}>
                      <span className="block h-full w-full transition-transform duration-[1200ms] ease-out group-hover:scale-105">
                        <Pic src={g["image"]} fallback={defaultGallery(i)} alt={g["caption"] || `Photo ${i + 1}`} tone={i} />
                      </span>
                    </span>
                    {g["caption"] && <span className="mt-2 block text-[12px] italic" style={{ color: MUTED }}>{g["caption"]}</span>}
                  </button>
                </Reveal>
              );
            })}
          </div>
        </section>

        {/* Team */}
        {team.length > 0 && (
          <section id="sl-team" className="scroll-mt-[calc(var(--oc-top,0px)+72px)] px-5 py-16 sm:px-10 sm:py-24" style={{ backgroundColor: BLUSH }}>
            <div className="mx-auto w-full max-w-[1400px]">
              <Reveal className="mb-12 flex flex-col gap-3">
                <Kicker>The team</Kicker>
                <h2 className={`text-[34px] leading-[1.05] sm:text-[54px] ${HEADING}`}>The hands behind <span className="italic">your glow</span></h2>
              </Reveal>
              <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-4">
                {team.map((m, i) => (
                  <Reveal key={m.id} delay={(i % 4) * 90}>
                    <div className="flex flex-col items-center gap-4 text-center">
                      <div className="aspect-[3/4] w-full overflow-hidden rounded-t-[999px] rounded-b-[20px]">
                        <Pic src={m["photo"]} fallback={defaultGallery(i + 1)} alt={m["name"] ?? "Team member"} tone={i + 2} />
                      </div>
                      <div>
                        <h3 className={`text-[22px] ${HEADING}`}>{m["name"]}</h3>
                        {m["role"] && <p className="mt-1 text-[13px]" style={{ color: MUTED }}>{m["role"]}</p>}
                      </div>
                    </div>
                  </Reveal>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Testimonials */}
        {testimonials.length > 0 && (
          <section className="mx-auto w-full max-w-[1400px] px-5 py-16 sm:px-10 sm:py-24">
            <Reveal className="mb-12 flex flex-col gap-3">
              <Kicker>Kind words</Kicker>
              <h2 className={`text-[34px] leading-[1.05] sm:text-[54px] ${HEADING}`}>What our <span className="italic">glow-getters say</span></h2>
            </Reveal>
            <Testimonials items={testimonials} accent={accent} reviews={reviews} />
          </section>
        )}

        {/* FAQs */}
        {faqs.length > 0 && (
          <section className="mx-auto grid w-full max-w-[1400px] grid-cols-1 gap-8 px-5 pb-16 sm:px-10 sm:pb-24 md:grid-cols-3">
            <Reveal>
              <h2 className={`text-[34px] leading-[1.05] sm:text-[48px] ${HEADING}`}>Good to <span className="italic">know</span></h2>
            </Reveal>
            <Reveal delay={100} className="flex flex-col md:col-span-2">
              {faqs.map((f) => (
                <details key={f.id} className="group border-b border-black/15 py-5">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-[17px] font-semibold [&::-webkit-details-marker]:hidden">
                    {f["question"]}
                    <span className="text-[22px] leading-none transition-transform duration-200 group-open:rotate-45" aria-hidden="true">+</span>
                  </summary>
                  <p className="mt-3 text-[14.5px] leading-[1.75]" style={{ color: MUTED }}>{f["answer"]}</p>
                </details>
              ))}
            </Reveal>
          </section>
        )}

        {/* Booking */}
        <section id="sl-book" className="scroll-mt-[calc(var(--oc-top,0px)+72px)] px-5 py-16 sm:px-10 sm:py-24" style={{ backgroundColor: BLUSH }}>
          <div className="mx-auto grid w-full max-w-[1400px] grid-cols-1 gap-10 md:grid-cols-12 md:gap-14">
            <Reveal className="flex flex-col gap-6 md:col-span-5">
              <Kicker>Book a visit</Kicker>
              <h2 className={`text-[38px] leading-[1.03] sm:text-[60px] ${HEADING}`}>
                Your <span className="italic" style={{ color: accent }}>glow-up</span> starts here
              </h2>
              <div className="flex flex-col gap-1.5 text-[15px]">
                <span className="font-semibold">{data.businessName}</span>
                <span style={{ color: MUTED }}>{data.address || data.city}</span>
                <a href={telHref(data.phone)} className="mt-2 font-semibold hover:underline">{data.phone}</a>
                {secondPhone && <a href={telHref(secondPhone)} className="font-semibold hover:underline">{secondPhone}</a>}
                {email && <a href={`mailto:${email}`} className="break-all hover:underline" style={{ color: MUTED }}>{email}</a>}
              </div>
              {hours && (
                <div className="max-w-xs rounded-2xl bg-white p-5 text-[13.5px]">
                  <span className="block font-semibold">Opening hours</span>
                  <span className="mt-1 block whitespace-pre-line" style={{ color: MUTED }}>{hours}</span>
                  {status && <span className="mt-3 inline-flex items-center gap-2 text-[12.5px] font-semibold"><span className="h-2 w-2 rounded-full" style={{ backgroundColor: status.open ? "#2E9D5B" : "#B8782A" }} aria-hidden="true" />{status.label}</span>}
                </div>
              )}
              {socials.some(([, href]) => href) && (
                <div className="flex flex-wrap gap-x-6 gap-y-2 text-[13px]">
                  {socials.filter(([, href]) => href).map(([label, href]) => (
                    <a key={label} href={href} target="_blank" rel="noopener noreferrer" className="font-semibold underline underline-offset-[6px]">{label}</a>
                  ))}
                </div>
              )}
            </Reveal>
            <Reveal delay={120} className="md:col-span-7">
              <div className="rounded-[32px] bg-white/70 p-6 sm:p-9">
                {mainHref ? (
                  <div className="flex flex-col items-start gap-4">
                    <p className="text-[15px] leading-[1.7]" style={{ color: MUTED }}>
                      {bookingMode === "Call" ? "Call us and we will find you the best slot." : "Pick your slot on our booking page."}
                    </p>
                    {mainButton(btn, { backgroundColor: accent, color: onAccent }, bookingMode === "Call" ? `Call ${data.phone}` : buttonText)}
                    <p className="mt-2 text-[13px]" style={{ color: MUTED }}>
                      Prefer WhatsApp?{" "}
                      <a href={waHref(data, `Hi ${data.businessName}, I'd like to book an appointment.`)} target="_blank" rel="noopener noreferrer" className="font-semibold underline underline-offset-[5px]" style={{ color: INK }}>
                        Message us
                      </a>
                    </p>
                  </div>
                ) : (
                  <BookingForm data={data} accent={accent} serviceNames={serviceNames} service={service} onService={setService} homeVisit={homeVisit} />
                )}
              </div>
            </Reveal>
          </div>

        </section>

        {/* Footer */}
        <footer className="overflow-hidden px-5 pb-8 pt-14 text-white sm:px-10" style={{ backgroundColor: PLUM }}>
          <div className="mx-auto w-full max-w-[1400px]">
            <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
              <p className={`max-w-md text-[26px] leading-tight sm:text-[34px] ${HEADING}`}>
                Look good. <span className="italic">Feel even better.</span>
              </p>
              {mainButton(`${btn} bg-white`, { color: INK }, buttonText)}
            </div>
            <div
              aria-hidden="true"
              className={`mt-12 select-none text-center leading-[0.85] ${HEADING}`}
              style={{ fontSize: wordSize, color: "rgba(255,255,255,0.10)" }}
            >
              {data.businessName}
            </div>
            <Reveal className="mt-12 flex flex-col gap-4">
              <div className="flex flex-wrap items-end justify-between gap-3">
                <div className="flex flex-col gap-1">
                  <Kicker light>Find us</Kicker>
                  <p className={`text-[26px] leading-tight sm:text-[34px] ${HEADING}`}>{data.address || data.city}</p>
                </div>
                <a href={map.href} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-[13px] font-semibold underline underline-offset-[6px]">
                  Open in Google Maps <ArrowIcon className="h-3.5 w-3.5" />
                </a>
              </div>
              <div className="h-[280px] overflow-hidden rounded-[28px] border border-white/15 bg-white/5 sm:h-[360px]">
                <iframe title={`Map of ${data.city}`} src={map.src} loading="lazy" referrerPolicy="no-referrer-when-downgrade" className="block h-full w-full" />
              </div>
            </Reveal>
            <div className="mt-8 flex flex-col items-start justify-between gap-3 border-t border-white/15 pt-6 text-[12px] text-white/50 sm:flex-row">
              <span>© {new Date().getFullYear()} {data.businessName}</span>
              <span>{data.address || data.city}</span>
            </div>
          </div>
        </footer>
      </div>

      {viewer !== null && (
        <Lightbox items={galleryItems} index={viewer} onClose={() => setViewer(null)} onIndex={(index) => setViewer(index)} />
      )}

      {fullPage && (
        <>
          <div className="fixed inset-x-0 bottom-0 z-40 flex gap-2 border-t border-black/10 px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur md:hidden" style={{ backgroundColor: `${CREAM}F2` }}>
            <a href={telHref(data.phone)} className="flex flex-1 items-center justify-center gap-2 rounded-full border border-black/20 py-3 text-[14px] font-semibold" style={{ color: INK }}>
              <Phone className="h-4 w-4" /> Call
            </a>
            <a href={waHref(data)} target="_blank" rel="noopener noreferrer" className="flex flex-1 items-center justify-center gap-2 rounded-full py-3 text-[14px] font-semibold" style={{ backgroundColor: accent, color: onAccent }}>
              <ChatIcon className="h-4 w-4" /> WhatsApp
            </a>
          </div>
          <a
            href={waHref(data)}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Chat on WhatsApp"
            className="fixed bottom-6 right-6 z-40 hidden h-14 w-14 items-center justify-center rounded-full text-white shadow-[0_10px_30px_rgba(0,0,0,0.25)] transition-transform duration-300 hover:scale-105 md:flex"
            style={{ backgroundColor: "#25D366" }}
          >
            <span className="absolute inset-0 rounded-full motion-safe:animate-ping" style={{ backgroundColor: "#25D366", opacity: 0.35 }} aria-hidden="true" />
            <ChatIcon className="relative h-6 w-6" />
          </a>
        </>
      )}
    </div>
  );
}
