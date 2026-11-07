import { useEffect, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { Phone } from "lucide-react";
import type { SiteData } from "../../lib/siteData";
import type { LightboxItem } from "../shared";
import {
  ArrowIcon,
  CountUp,
  HEAD,
  Lightbox,
  Pic,
  Reveal,
  excerpt,
  fontVars,
  isFullPagePreview,
  flag,
  list,
  readableOn,
  resolveMap,
  safeHref,
  scrollToId,
  str,
  telHref,
  useEntrance,
  waHref,
} from "../shared";

const INK = "#14181F";
const MUTED = "#5F6672";
const SOFT = "#F5F6F8";
const DEFAULT_NAVY = "#1E2D78";

// Default photos for this template. Put the files in public/defaults/clinics/ using these names.
// A missing file is skipped and a calm portrait placeholder shows instead.
const BASE = "/defaults/clinics/";
const defaultImages = {
  hero: `${BASE}hero.webp`,
  about: `${BASE}about.webp`,
  banner: `${BASE}banner.webp`,
};

function ChatIcon({ className = "h-6 w-6" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />
    </svg>
  );
}

function initials(name: string): string {
  const parts = name.replace(/^dr\.?\s+/i, "").split(/\s+/).filter(Boolean);
  return ((parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "")).toUpperCase();
}

// A photo from the team, then the default file, then a soft portrait placeholder.
function Photo({ src, fallback, alt, name, brand }: { src?: string; fallback?: string; alt: string; name: string; brand: string }) {
  const [failed, setFailed] = useState<string[]>([]);
  const current = [src, fallback].find((s): s is string => Boolean(s) && !failed.includes(s as string));
  if (current) {
    return <img src={current} alt={alt} loading="lazy" onError={() => setFailed((f) => [...f, current])} className="h-full w-full object-cover object-top" />;
  }
  return (
    <span role="img" aria-label={alt} className="relative block h-full w-full overflow-hidden" style={{ backgroundColor: `${brand}14` }}>
      <svg viewBox="0 0 200 240" className="absolute inset-x-0 bottom-0 h-[88%] w-full" aria-hidden="true">
        <circle cx="100" cy="82" r="38" fill={brand} opacity="0.16" />
        <path d="M20 240c0-52 36-84 80-84s80 32 80 84Z" fill={brand} opacity="0.16" />
      </svg>
      <span className={`absolute inset-x-0 top-[34%] text-center text-[44px] ${HEAD}`} style={{ color: brand, opacity: 0.55 }}>
        {initials(name)}
      </span>
    </span>
  );
}


// ---- opening hours -> "Open now" ------------------------------------------------------------
const DAY_KEYS = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];

function toMinutes(raw: string, meridiem?: string): number | null {
  const m = /^(\d{1,2})(?::(\d{2}))?\s*(am|pm)?$/i.exec(raw.trim());
  if (!m) return null;
  let h = parseInt(m[1] ?? "0", 10);
  const min = parseInt(m[2] ?? "0", 10);
  const mer = (m[3] ?? meridiem ?? "").toLowerCase();
  if (h > 24 || min > 59) return null;
  if (mer === "pm" && h < 12) h += 12;
  if (mer === "am" && h === 12) h = 0;
  return h * 60 + min;
}

// Reads lines like "Mon-Sat, 10 am to 7 pm" and "Sun: Closed". Anything it cannot read is skipped,
// and if nothing can be read no badge is shown.
export function parseHours(text: string): Record<number, [number, number][]> | null {
  const week: Record<number, [number, number][]> = {};
  let understood = false;
  for (const line of text.split(/\n|;/)) {
    const d = /^\s*(mon|tue|wed|thu|fri|sat|sun)[a-z]*\s*(?:(?:-|–|to)\s*(mon|tue|wed|thu|fri|sat|sun)[a-z]*)?/i.exec(line);
    if (!d) continue;
    const from = DAY_KEYS.indexOf((d[1] ?? "").toLowerCase());
    const to = d[2] ? DAY_KEYS.indexOf(d[2].toLowerCase()) : from;
    const days: number[] = [];
    for (let i = from; ; i = (i + 1) % 7) {
      days.push(i);
      if (i === to) break;
      if (days.length > 7) break;
    }
    const rest = line.slice(d[0].length);
    const ranges: [number, number][] = [];
    const re = /(\d{1,2}(?::\d{2})?)\s*(am|pm)?\s*(?:to|-|–)\s*(\d{1,2}(?::\d{2})?)\s*(am|pm)?/gi;
    let m: RegExpExecArray | null;
    while ((m = re.exec(rest)) !== null) {
      let end = toMinutes(m[3] ?? "", m[4]);
      let start = toMinutes(m[1] ?? "", m[2] ?? m[4]);
      if (start === null || end === null) continue;
      if (!m[2] && m[4] && start >= end) start -= 12 * 60;
      if (end === 0) end = 24 * 60;
      if (end > start) ranges.push([start, end]);
    }
    if (ranges.length > 0 || /closed/i.test(rest)) {
      understood = true;
      for (const day of days) week[day] = ranges;
    }
  }
  return understood ? week : null;
}

function clock(mins: number): string {
  const h = Math.floor(mins / 60) % 24;
  const m = mins % 60;
  return `${h % 12 === 0 ? 12 : h % 12}${m ? `:${String(m).padStart(2, "0")}` : ""} ${h >= 12 ? "PM" : "AM"}`;
}

export function openStatus(text: string): { open: boolean; label: string } | null {
  const week = parseHours(text);
  if (!week) return null;
  const parts = new Intl.DateTimeFormat("en-US", { timeZone: "Asia/Kolkata", weekday: "short", hour: "numeric", minute: "numeric", hour12: false }).formatToParts(new Date());
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "";
  const day = DAY_KEYS.indexOf(get("weekday").toLowerCase());
  const now = (parseInt(get("hour"), 10) % 24) * 60 + parseInt(get("minute"), 10);
  if (day < 0) return null;
  const today = week[day] ?? [];
  const current = today.find(([a, b]) => now >= a && now < b);
  if (current) return { open: true, label: `Open now · until ${clock(current[1])}` };
  const later = today.filter(([a]) => a > now).sort((x, y) => x[0] - y[0])[0];
  if (later) return { open: false, label: `Closed · opens today ${clock(later[0])}` };
  for (let i = 1; i <= 7; i++) {
    const d = (day + i) % 7;
    const first = [...(week[d] ?? [])].sort((x, y) => x[0] - y[0])[0];
    if (first) return { open: false, label: `Closed · opens ${i === 1 ? "tomorrow" : (DAY_KEYS[d] ?? "").replace(/^./, (c) => c.toUpperCase())} ${clock(first[0])}` };
  }
  return { open: false, label: "Closed" };
}

function splitList(text: string): string[] {
  return text.split(/[,·\n]/).map((t) => t.trim()).filter(Boolean);
}

// A service that opens to show what it involves, with a button to book it.
function ServiceCard({ name, description, price, duration, brand, bookHref }: { name: string; description: string; price: string; duration: string; brand: string; bookHref: string }) {
  const [open, setOpen] = useState(false);
  const expandable = Boolean(description);
  const meta = [duration, price ? `Fee: ${price}` : ""].filter(Boolean).join(" · ");
  const inner = (
    <>
      <span className="flex h-8 w-8 items-center justify-center self-end rounded-full border border-black/15 transition-transform duration-500" style={{ color: brand, transform: open ? "rotate(135deg)" : undefined }}>
        <ArrowIcon className="h-3.5 w-3.5" />
      </span>
      <span className="block">
        <span className="block text-[17px] font-semibold leading-snug tracking-[-0.01em]" style={{ color: brand }}>{name}</span>
        {meta && <span className="mt-2 block text-[13px] leading-[1.6]" style={{ color: MUTED }}>{meta}</span>}
      </span>
    </>
  );
  return (
    <div className="flex h-full min-h-[150px] flex-col bg-white transition-colors duration-300 hover:bg-[#F5F6F8]">
      {expandable ? (
        <button type="button" aria-expanded={open} onClick={() => setOpen((o) => !o)} className="flex w-full flex-1 cursor-pointer flex-col justify-between gap-6 p-6 text-left">
          {inner}
        </button>
      ) : (
        <div className="flex flex-1 flex-col justify-between gap-6 p-6">{inner}</div>
      )}
      {expandable && (
        <div className={`grid transition-[grid-template-rows,opacity] duration-500 ease-out motion-reduce:transition-none ${open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}>
          <div className="overflow-hidden">
            <div className="px-6 pb-6">
              <p className="text-[14px] leading-[1.65]" style={{ color: MUTED }}>{description}</p>
              <a href={bookHref} target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex items-center gap-2 text-[13px] font-semibold underline underline-offset-4" style={{ color: brand }}>
                Book this <ArrowIcon className="h-3.5 w-3.5" />
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const APPOINTMENT_TIMES = Array.from({ length: 25 }, (_, i) => clock(8 * 60 + i * 30));

function todayIso(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function prettyDate(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  if (!y || !m || !d) return iso;
  return new Date(y, m - 1, d).toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" });
}

function EnquiryForm({ data, brand, subjects }: { data: SiteData; brand: string; subjects: string[] }) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [subject, setSubject] = useState("");
  const [day, setDay] = useState("");
  const [time, setTime] = useState("");
  const [message, setMessage] = useState("");

  // A preview has no server behind it, so the request opens as a WhatsApp message.
  function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const text = `Hi ${data.businessName}, I'm ${name.trim()}.${subject ? ` I'd like to ask about ${subject}.` : ""}${day ? ` Preferred day: ${prettyDate(day)}${time ? `, ${time}` : ""}.` : ""} ${message.trim()}${phone.trim() ? ` You can reach me on ${phone.trim()}.` : ""}`;
    window.open(waHref(data, text.replace(/\s+/g, " ").trim()), "_blank", "noopener,noreferrer");
  }

  const field =
    "w-full border-0 border-b border-black/15 bg-transparent px-0 py-3 text-[15px] placeholder:text-[#8A919C] focus:border-black/60 focus:outline-none focus:ring-0";

  return (
    <form onSubmit={submit} className="grid grid-cols-1 gap-x-6 gap-y-2 sm:grid-cols-2">
      <input className={field} placeholder="Full name" value={name} onChange={(e: ChangeEvent<HTMLInputElement>) => setName(e.target.value)} required aria-label="Full name" />
      <input className={field} placeholder="Phone" inputMode="tel" value={phone} onChange={(e: ChangeEvent<HTMLInputElement>) => setPhone(e.target.value)} aria-label="Phone" />
      <select className={`${field} sm:col-span-2`} value={subject} onChange={(e: ChangeEvent<HTMLSelectElement>) => setSubject(e.target.value)} aria-label="Reason for visit">
        <option value="">Reason for visit</option>
        {subjects.map((s) => (
          <option key={s} value={s}>{s}</option>
        ))}
        <option value="a general enquiry">General enquiry</option>
      </select>
      <input type="date" min={todayIso()} className={field} value={day} onChange={(e: ChangeEvent<HTMLInputElement>) => setDay(e.target.value)} aria-label="Preferred day" />
      <select className={field} value={time} onChange={(e: ChangeEvent<HTMLSelectElement>) => setTime(e.target.value)} aria-label="Preferred time">
        <option value="">Preferred time</option>
        {APPOINTMENT_TIMES.map((t) => (
          <option key={t} value={t}>{t}</option>
        ))}
      </select>
      <textarea className={`${field} min-h-[88px] resize-y sm:col-span-2`} placeholder="Message" value={message} onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setMessage(e.target.value)} aria-label="Message" />
      <div className="mt-4 sm:col-span-2">
        <button
          type="submit"
          className="inline-flex cursor-pointer items-center gap-2 rounded-full px-7 py-3.5 text-[14px] font-semibold transition-transform duration-300 hover:-translate-y-0.5"
          style={{ backgroundColor: brand, color: readableOn(brand) }}
        >
          Request appointment <ArrowIcon className="h-3.5 w-3.5" />
        </button>
        <p className="mt-3 text-[12px]" style={{ color: MUTED }}>Opens WhatsApp with your request. We will confirm the time with you.</p>
      </div>
    </form>
  );
}

// Each word of the headline rises into place one after another; the last words take the brand colour.
function HeroTitle({ text, brand }: { text: string; brand: string }) {
  const on = useEntrance();
  const words = text.split(/\s+/).filter(Boolean);
  const accentFrom = Math.max(words.length - 2, Math.ceil(words.length / 2));
  return (
    <h1 aria-label={text} className={`text-balance text-[40px] leading-[1.04] sm:text-[56px] lg:text-[64px] ${HEAD}`}>
      {words.map((w, i) => (
        <span key={`${w}-${i}`} aria-hidden="true">
          {i > 0 && " "}
          <span className="-mb-[0.14em] inline-block overflow-hidden pb-[0.14em] align-bottom">
            <span
              className={`inline-block transition-transform duration-700 ease-out ${on ? "translate-y-0" : "translate-y-[110%]"}`}
              style={{ transitionDelay: `${i * 70}ms`, color: i >= accentFrom ? brand : undefined }}
            >
              {w}
            </span>
          </span>
        </span>
      ))}
    </h1>
  );
}

export function ClinicSimple({ data }: { data: SiteData }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [bannerOk, setBannerOk] = useState(true);
  const fullPage = isFullPagePreview();

  // Brand colour: the team's choice, or a calm navy when none was set.
  const brand = data.brandColor.toLowerCase() === "#111111" ? DEFAULT_NAVY : data.brandColor;
  const onBrand = readableOn(brand);

  const doctor = str(data, "doctorName") || data.ownerName;
  const qualification = str(data, "qualification");
  const specialities = str(data, "specialities").split(",").map((s) => s.trim()).filter(Boolean);
  const registration = str(data, "medicalRegistration");
  const services = list(data, "serviceList").filter((s) => s["name"]);
  const team = list(data, "staff").filter((s) => s["name"]);
  const faqs = list(data, "faqs");
  // Reviews only show when the team has switched them on and added at least one.
  const doctors = list(data, "doctors").filter((d) => d["name"]);
  const firstVisit = list(data, "firstVisit").filter((x) => x["title"]);
  const results = list(data, "treatmentResults").filter((x) => x["before"] || x["after"]);
  const tips = list(data, "healthTips").filter((x) => x["title"]);
  const gallery = list(data, "extraGallery");
  const insurance = splitList(str(data, "insurance"));
  const languages = splitList(str(data, "languages"));
  const memberships = splitList(str(data, "memberships"));
  const awards = splitList(str(data, "certifications"));
  const emergency = str(data, "emergencyPhone");
  const offerTitle = str(data, "offerTitle");
  const offerText = str(data, "offerText");
  const [viewer, setViewer] = useState<number | null>(null);
  const [status, setStatus] = useState<{ open: boolean; label: string } | null>(null);
  const reviewItems = flag(data, "showReviews") ? list(data, "reviews").filter((r) => r["quote"]) : [];
  const ownerPhoto = str(data, "ownerPhoto");
  const aboutImage = str(data, "aboutImage");
  const banner = str(data, "announcementBanner");
  const buttonText = str(data, "buttonText") || "Book a consultation";
  const email = str(data, "email");
  const secondPhone = str(data, "secondPhone");
  const hours = str(data, "openingHours");
  const reviews = safeHref(str(data, "googleReviewsLink"));
  const brochure = safeHref(str(data, "brochureLink"));
  const bookingLink = safeHref(str(data, "bookingLink"));
  const bookingMode = str(data, "bookingMode") || "WhatsApp";
  const map = resolveMap(data);

  useEffect(() => {
    if (!hours) {
      setStatus(null);
      return;
    }
    const update = () => setStatus(openStatus(hours));
    update();
    const id = window.setInterval(update, 60000);
    return () => window.clearInterval(id);
  }, [hours]);
  const galleryItems: LightboxItem[] = gallery.map((g, i) => ({ src: g["image"], title: g["caption"] || `Photo ${i + 1}` }));
  const hasGood = insurance.length + languages.length + memberships.length + awards.length > 0;
  const heroPhoto = data.heroImage || ownerPhoto;

  // The booking button follows the team's choice.
  const book = (() => {
    if (bookingMode === "Call") return { href: telHref(data.phone), external: false };
    if (bookingMode === "External link" && bookingLink) return { href: bookingLink, external: true };
    return { href: waHref(data), external: true };
  })();
  const bookProps = book.external ? { target: "_blank", rel: "noopener noreferrer" } : {};

  let stats: { value: string; label: string }[] = list(data, "keyNumbers").map((n) => ({ value: n["value"] ?? "", label: n["label"] ?? "" }));
  if (stats.length === 0) {
    const est = str(data, "yearEstablished");
    if (est) stats.push({ value: est, label: "Established" });
    if (services.length > 0) stats.push({ value: `${services.length}`, label: "Services offered" });
    if (team.length > 0) stats.push({ value: `${team.length + 1}`, label: "Doctors and staff" });
  }
  stats = stats.filter((s) => s.value);

  const nav = [
    { id: "cl-about", label: "About", show: true },
    { id: "cl-doctors", label: "Doctors", show: doctors.length > 0 },
    { id: "cl-services", label: "Services", show: services.length > 0 },
    { id: "cl-visit", label: "First visit", show: firstVisit.length > 0 },
    { id: "cl-team", label: "Team", show: team.length > 0 },
    { id: "cl-reviews", label: "Reviews", show: reviewItems.length > 0 },
    { id: "cl-tips", label: "Health tips", show: tips.length > 0 },
    { id: "cl-faq", label: "FAQs", show: faqs.length > 0 },
    { id: "cl-contact", label: "Contact", show: true },
  ].filter((n) => n.show);

  const socials: [string, string][] = [
    ["Instagram", safeHref(str(data, "instagram"))],
    ["Facebook", safeHref(str(data, "facebook"))],
    ["YouTube", safeHref(str(data, "youtube"))],
  ];

  function go(id: string) {
    setMenuOpen(false);
    scrollToId(id);
  }

  const btn = "inline-flex items-center gap-2 rounded-full px-6 py-3 text-[14px] font-semibold transition-transform duration-300 hover:-translate-y-0.5";

  return (
    <div className={`bg-white font-sans ${fullPage ? "pb-20 md:pb-0" : ""}`} style={{ color: INK, ...fontVars(data) }}>
      <div className="overflow-x-clip bg-white">
        {banner && (
          <div className="px-4 py-2 text-center text-[12px] font-semibold" style={{ backgroundColor: brand, color: onBrand }}>
            {banner}
          </div>
        )}

        {/* Navigation */}
        <div className="sticky top-[var(--oc-top,0px)] z-30 bg-white/90 backdrop-blur">
          <header className="mx-auto flex w-full max-w-[1280px] items-center justify-between gap-3 px-5 py-4 sm:px-10">
            {data.logo ? (
              <img src={data.logo} alt={`${data.businessName} logo`} className="h-9 w-auto max-w-[150px] object-contain" />
            ) : (
              <span className="truncate text-[15px] font-bold tracking-[-0.01em]">{data.businessName}</span>
            )}
            <nav className="hidden items-center gap-6 lg:flex" aria-label="Sections">
              {nav.map((n) => (
                <button key={n.id} type="button" onClick={() => go(n.id)} className="cursor-pointer text-[13px] font-medium transition-opacity hover:opacity-60">
                  {n.label}
                </button>
              ))}
            </nav>
            <div className="flex shrink-0 items-center gap-2">
              <a href={book.href} {...bookProps} className="hidden rounded-full px-5 py-2 text-[13px] font-semibold sm:inline-flex" style={{ backgroundColor: brand, color: onBrand }}>
                Consultation
              </a>
              <a href={telHref(data.phone)} aria-label="Call" className="flex h-9 w-9 items-center justify-center rounded-full sm:hidden" style={{ backgroundColor: brand, color: onBrand }}>
                <Phone className="h-4 w-4" />
              </a>
              <button
                type="button"
                onClick={() => setMenuOpen((o) => !o)}
                aria-expanded={menuOpen}
                aria-label={menuOpen ? "Close menu" : "Open menu"}
                className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-black/15 lg:hidden"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="h-4 w-4" aria-hidden="true">
                  {menuOpen ? <path d="M6 6l12 12M18 6 6 18" /> : <path d="M4 8h16M4 16h16" />}
                </svg>
              </button>
            </div>
          </header>
          {menuOpen && (
            <nav className="animate-pop mx-4 mb-2 flex flex-col overflow-hidden rounded-2xl lg:hidden" style={{ backgroundColor: SOFT }} aria-label="Menu">
              {nav.map((n) => (
                <button key={n.id} type="button" onClick={() => go(n.id)} className="flex cursor-pointer items-center justify-between border-b border-black/10 px-5 py-3.5 text-left text-[15px] font-semibold last:border-b-0">
                  {n.label}
                  <ArrowIcon className="h-4 w-4" />
                </button>
              ))}
            </nav>
          )}
        </div>

        {/* Hero */}
        <section className="relative">
          <div className="absolute inset-x-0 bottom-0 hidden h-[22%] md:block" style={{ backgroundColor: brand }} aria-hidden="true" />
          <div className="relative mx-auto grid w-full max-w-[1280px] grid-cols-1 items-end gap-6 px-5 pt-8 sm:px-10 sm:pt-12 md:grid-cols-12 md:gap-4">
            <div className="flex flex-col items-start gap-5 pb-4 md:col-span-5 md:pb-36">
              {status && (
                <span className="inline-flex items-center gap-2 rounded-full border border-black/10 px-3 py-1 text-[12px] font-medium" role="status">
                  <span className={`h-2 w-2 rounded-full ${status.open ? "bg-[#18A558]" : "bg-[#B8BEC8]"}`} aria-hidden="true" />
                  {status.label}
                </span>
              )}
              <span className="font-serif text-[15px] italic" style={{ color: MUTED }}>
                {qualification || specialities[0] || data.nicheLabel}
              </span>
              <HeroTitle text={data.tagline} brand={brand} />
              <p className="max-w-sm text-[15px] leading-[1.65]" style={{ color: MUTED }}>
                {specialities.length > 0 ? `${specialities.slice(0, 3).join(", ")}, with care that is personal to you.` : `Personal care from ${doctor}, in ${data.city}.`}
              </p>
              <a href={book.href} {...bookProps} className={btn} style={{ backgroundColor: brand, color: onBrand }}>
                {buttonText} <ArrowIcon className="h-3.5 w-3.5" />
              </a>
            </div>

            {/* The doctor, in an arch in front of a coloured band */}
            <div className="relative order-first mx-auto w-full max-w-[340px] md:order-none md:col-span-4 md:max-w-none">
              <div className="aspect-[4/5] w-full overflow-hidden rounded-t-[999px]" style={{ backgroundColor: `${brand}12` }}>
                <Photo src={heroPhoto} fallback={defaultImages.hero} alt={doctor} name={doctor} brand={brand} />
              </div>
            </div>

            <Reveal delay={150} className="hidden self-start md:col-span-3 md:block md:pt-10">
              <div className="flex flex-col gap-3">
                <span className="text-[40px] font-bold leading-none" style={{ color: brand }} aria-hidden="true">&ldquo;</span>
                <p className="font-serif text-[16px] italic leading-[1.55]" style={{ color: MUTED }}>
                  {excerpt(data.about, 130)}
                </p>
                <span className="text-[12px] font-semibold">{doctor}</span>
              </div>
            </Reveal>
          </div>
        </section>

        {/* Numbers */}
        {stats.length > 0 && (
          <section aria-label="In numbers" className="mx-auto grid w-full max-w-[1280px] grid-cols-2 gap-x-6 gap-y-10 px-5 py-14 sm:px-10 sm:py-20 md:grid-cols-4">
            {stats.map((s, i) => (
              <Reveal key={s.label + s.value} delay={i * 100} className="border-l border-black/10 pl-5 first:border-l-0 first:pl-0 md:first:border-l md:first:pl-5">
                <div className="text-[13px] font-semibold">{s.label}</div>
                <div className={`mt-3 text-[40px] leading-none sm:text-[48px] ${HEAD}`} style={{ color: brand }}>
                  <CountUp value={s.value} />
                </div>
              </Reveal>
            ))}
          </section>
        )}

        {/* Good to know */}
        {hasGood && (
          <section aria-label="Good to know" className="mx-auto w-full max-w-[1280px] px-5 pb-14 sm:px-10 sm:pb-20">
            <div className="grid grid-cols-1 gap-px overflow-hidden rounded-2xl bg-black/10 sm:grid-cols-2 lg:grid-cols-4">
              {(
                [
                  ["Insurance and payments", insurance],
                  ["Languages we speak", languages],
                  ["Memberships", memberships],
                  ["Awards and certifications", awards],
                ] as [string, string[]][]
              )
                .filter(([, items]) => items.length > 0)
                .map(([label, items]) => (
                  <Reveal key={label} className="bg-white">
                    <div className="flex h-full flex-col gap-3 p-5">
                      <span className="text-[12px] font-semibold uppercase tracking-[0.12em]" style={{ color: MUTED }}>{label}</span>
                      <div className="flex flex-wrap gap-1.5">
                        {items.map((t) => (
                          <span key={t} className="rounded-full px-3 py-1 text-[12.5px] font-medium" style={{ backgroundColor: `${brand}12`, color: brand }}>{t}</span>
                        ))}
                      </div>
                    </div>
                  </Reveal>
                ))}
            </div>
          </section>
        )}

        {/* About */}
        <section id="cl-about" className="scroll-mt-[calc(var(--oc-top,0px)+72px)]" style={{ backgroundColor: SOFT }}>
          <div className="mx-auto grid w-full max-w-[1280px] grid-cols-1 items-stretch md:grid-cols-2">
            <Reveal className="relative min-h-[340px] md:min-h-[520px]">
              <div className="absolute inset-0">
                <Photo src={aboutImage || ownerPhoto} fallback={defaultImages.about} alt={`About ${doctor}`} name={doctor} brand={brand} />
              </div>
            </Reveal>
            <Reveal delay={120} className="flex flex-col items-start justify-center gap-4 px-5 py-12 sm:px-10 md:px-14 md:py-16">
              <h2 className={`text-[30px] leading-[1.1] sm:text-[40px] ${HEAD}`}>About {doctor}</h2>
              {(qualification || specialities.length > 0) && (
                <span className="font-serif text-[14px] italic" style={{ color: MUTED }}>{qualification || specialities.join(" · ")}</span>
              )}
              <p className="whitespace-pre-line text-[15px] leading-[1.75]" style={{ color: MUTED }}>{data.about}</p>
              {specialities.length > 0 && qualification && (
                <div className="flex flex-wrap gap-2">
                  {specialities.map((s) => (
                    <span key={s} className="rounded-full border px-3 py-1 text-[12px] font-medium" style={{ borderColor: `${brand}40`, color: brand }}>{s}</span>
                  ))}
                </div>
              )}
              <div className="flex flex-col gap-1 text-[12.5px]">
                <span><strong>Location:</strong> {data.city}</span>
                {registration && <span><strong>Registration no.:</strong> {registration}</span>}
                
              </div>
              {reviews && (
                <a href={reviews} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-[13px] font-semibold underline underline-offset-4">
                  See us on Google <ArrowIcon className="h-3.5 w-3.5" />
                </a>
              )}
            </Reveal>
          </div>
        </section>

        {/* Doctors */}
        {doctors.length > 0 && (
          <section id="cl-doctors" className="scroll-mt-[calc(var(--oc-top,0px)+72px)] mx-auto w-full max-w-[1280px] px-5 pt-16 sm:px-10 sm:pt-24">
            <Reveal>
              <h2 className={`text-[30px] leading-[1.1] sm:text-[42px] ${HEAD}`}>Our doctors</h2>
            </Reveal>
            <div className="mt-10 grid grid-cols-1 gap-5 md:grid-cols-2">
              {doctors.map((d, i) => (
                <Reveal key={d.id} delay={(i % 2) * 100}>
                  <article className="group grid h-full grid-cols-[120px_1fr] gap-5 rounded-2xl border border-black/10 p-4 transition-colors duration-300 hover:bg-[#F5F6F8] sm:grid-cols-[160px_1fr] sm:p-5">
                    <div className="aspect-[4/5] overflow-hidden rounded-xl">
                      <Photo src={d["photo"]} alt={d["name"] ?? "Doctor"} name={d["name"] ?? ""} brand={brand} />
                    </div>
                    <div className="flex flex-col justify-center gap-1.5">
                      <h3 className="text-[18px] font-semibold leading-tight tracking-[-0.01em]">{d["name"]}</h3>
                      {d["qualification"] && <p className="text-[13px]" style={{ color: MUTED }}>{d["qualification"]}</p>}
                      <div className="mt-1 flex flex-wrap gap-1.5">
                        {d["speciality"] && <span className="rounded-full px-3 py-1 text-[12px] font-medium" style={{ backgroundColor: `${brand}12`, color: brand }}>{d["speciality"]}</span>}
                        {d["experience"] && <span className="rounded-full border border-black/10 px-3 py-1 text-[12px] font-medium">{d["experience"]}</span>}
                      </div>
                      {d["bio"] && <p className="mt-2 text-[13.5px] leading-[1.6]" style={{ color: MUTED }}>{d["bio"]}</p>}
                    </div>
                  </article>
                </Reveal>
              ))}
            </div>
          </section>
        )}

        {/* Services */}
        {services.length > 0 && (
          <section id="cl-services" className="scroll-mt-[calc(var(--oc-top,0px)+72px)] mx-auto w-full max-w-[1280px] px-5 py-16 sm:px-10 sm:py-24">
            <Reveal className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
              <h2 className={`max-w-xl text-[30px] leading-[1.1] sm:text-[42px] ${HEAD}`}>How we can help you</h2>
              {brochure && (
                <a href={brochure} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-[13px] font-semibold underline underline-offset-4">
                  View price list <ArrowIcon className="h-3.5 w-3.5" />
                </a>
              )}
            </Reveal>
            <div className="mt-10 grid grid-cols-1 items-start gap-px overflow-hidden rounded-2xl bg-black/10 sm:grid-cols-2 lg:grid-cols-3">
              {services.map((s, i) => (
                <Reveal key={s.id} delay={(i % 3) * 90} className="bg-white">
                  <ServiceCard
                    name={s["name"] ?? ""}
                    description={s["description"] ?? ""}
                    price={s["price"] ?? ""}
                    duration={s["duration"] ?? ""}
                    brand={brand}
                    bookHref={waHref(data, `Hi ${data.businessName}, I'd like to book: ${s["name"] ?? "an appointment"}.`)}
                  />
                </Reveal>
              ))}
            </div>
          </section>
        )}

        {/* Results */}
        {results.length > 0 && (
          <section id="cl-results" className="mx-auto w-full max-w-[1280px] px-5 pb-16 sm:px-10 sm:pb-24">
            <Reveal className="max-w-xl">
              <h2 className={`text-[30px] leading-[1.1] sm:text-[42px] ${HEAD}`}>Treatment results</h2>
              <p className="mt-3 text-[14px] leading-[1.65]" style={{ color: MUTED }}>Shared with the patients&rsquo; consent. Results vary from person to person.</p>
            </Reveal>
            <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2">
              {results.map((x, i) => (
                <Reveal key={x.id} delay={(i % 2) * 100} className="flex flex-col gap-3">
                  <div className="grid grid-cols-2 gap-2">
                    {(["before", "after"] as const).map((side) => (
                      <div key={side} className="relative aspect-[4/3] overflow-hidden rounded-xl">
                        <Pic src={x[side]} alt={`${x["title"] || "Treatment"} ${side}`} tone={i + (side === "after" ? 2 : 0)} />
                        <span className="absolute left-2 top-2 rounded-full bg-white px-2.5 py-0.5 text-[11px] font-semibold capitalize">{side}</span>
                      </div>
                    ))}
                  </div>
                  {x["title"] && <p className="text-[14px] font-semibold">{x["title"]}</p>}
                </Reveal>
              ))}
            </div>
          </section>
        )}

        {/* First visit */}
        {firstVisit.length > 0 && (
          <section id="cl-visit" className="scroll-mt-[calc(var(--oc-top,0px)+72px)] mx-auto w-full max-w-[1280px] px-5 pb-16 sm:px-10 sm:pb-24" style={{}}>
            <Reveal>
              <h2 className={`text-[30px] leading-[1.1] sm:text-[42px] ${HEAD}`}>What to expect on your first visit</h2>
            </Reveal>
            <ol className={`mt-10 grid grid-cols-1 gap-8 md:gap-6 ${({ 1: "md:grid-cols-1", 2: "md:grid-cols-2", 3: "md:grid-cols-3", 4: "md:grid-cols-4", 5: "md:grid-cols-5" } as Record<number, string>)[Math.min(firstVisit.length, 5)] ?? "md:grid-cols-4"}`}>
              {firstVisit.map((st, i) => (
                <li key={st.id}>
                  <Reveal delay={i * 110} className="relative h-full pl-14 md:pl-0 md:pt-14">
                    <span className="absolute left-0 top-0 flex h-9 w-9 items-center justify-center rounded-full text-[13px] font-bold" style={{ backgroundColor: brand, color: onBrand }}>{i + 1}</span>
                    {i < firstVisit.length - 1 && (
                      <>
                        <span className="absolute -bottom-8 left-[17px] top-10 w-px bg-black/15 md:hidden" aria-hidden="true" />
                        <span className="absolute left-11 right-[-1.5rem] top-[18px] hidden h-px bg-black/15 md:block" aria-hidden="true" />
                      </>
                    )}
                    <h3 className={`text-[19px] ${HEAD}`}>{st["title"]}</h3>
                    {st["description"] && <p className="mt-2 text-[14px] leading-[1.6]" style={{ color: MUTED }}>{st["description"]}</p>}
                  </Reveal>
                </li>
              ))}
            </ol>
          </section>
        )}

        {/* Inside the clinic */}
        {gallery.length > 0 && (
          <section id="cl-photos" className="mx-auto w-full max-w-[1280px] px-5 pb-16 sm:px-10 sm:pb-24" aria-label="Inside the clinic">
            <Reveal>
              <h2 className={`text-[30px] leading-[1.1] sm:text-[42px] ${HEAD}`}>Inside the clinic</h2>
            </Reveal>
            <div className="mt-10 grid grid-cols-2 gap-3 md:grid-cols-4">
              {gallery.map((g, i) => (
                <Reveal key={g.id} delay={(i % 4) * 80}>
                  <button type="button" onClick={() => setViewer(i)} aria-label={`View ${g["caption"] || `photo ${i + 1}`} larger`} className="group block w-full cursor-zoom-in text-left">
                    <span className="block aspect-[4/3] overflow-hidden rounded-xl">
                      <span className="block h-full w-full transition-transform duration-[900ms] ease-out group-hover:scale-105">
                        <Pic src={g["image"]} alt={g["caption"] || `Photo ${i + 1}`} tone={i} />
                      </span>
                    </span>
                    {g["caption"] && <span className="mt-2 block text-[12px]" style={{ color: MUTED }}>{g["caption"]}</span>}
                  </button>
                </Reveal>
              ))}
            </div>
          </section>
        )}

        {/* Team */}
        {team.length > 0 && (
          <section id="cl-team" className="scroll-mt-[calc(var(--oc-top,0px)+72px)] mx-auto w-full max-w-[1280px] px-5 pb-16 sm:px-10 sm:pb-24">
            <Reveal>
              <h2 className={`text-[30px] leading-[1.1] sm:text-[42px] ${HEAD}`}>Meet the team</h2>
            </Reveal>
            <div className="mt-10 grid grid-cols-2 gap-5 md:grid-cols-4">
              {team.map((m, i) => (
                <Reveal key={m.id} delay={(i % 4) * 90} className="flex flex-col gap-3">
                  <div className="aspect-[4/5] overflow-hidden rounded-2xl">
                    <Photo src={m["photo"]} alt={m["name"] ?? "Team member"} name={m["name"] ?? ""} brand={brand} />
                  </div>
                  <div>
                    <p className="text-[15px] font-semibold">{m["name"]}</p>
                    {m["role"] && <p className="text-[13px]" style={{ color: MUTED }}>{m["role"]}</p>}
                  </div>
                </Reveal>
              ))}
            </div>
          </section>
        )}

        {/* Patient reviews: typed in by the team, shown only when switched on */}
        {reviewItems.length > 0 && (
          <section id="cl-reviews" className="scroll-mt-[calc(var(--oc-top,0px)+72px)] mx-auto w-full max-w-[1280px] px-5 pb-16 sm:px-10 sm:pb-24">
            <Reveal className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
              <div>
                <h2 className={`text-[30px] leading-[1.1] sm:text-[42px] ${HEAD}`}>What patients say</h2>
                <p className="mt-3 max-w-md text-[14.5px] leading-[1.65]" style={{ color: MUTED }}>Words our patients have shared about their visits.</p>
              </div>
              {reviews && (
                <a href={reviews} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 self-start text-[13px] font-semibold underline underline-offset-4 sm:self-auto">
                  Read all reviews on Google <ArrowIcon className="h-3.5 w-3.5" />
                </a>
              )}
            </Reveal>
            <div className="-mx-5 mt-10 flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-2 [scrollbar-width:none] sm:-mx-10 sm:px-10 md:mx-0 md:grid md:grid-cols-3 md:overflow-visible md:px-0 md:pb-0 [&::-webkit-scrollbar]:hidden">
              {reviewItems.map((r, i) => {
                const stars = Math.min(5, Math.max(1, parseInt(r["rating"] ?? "5", 10) || 5));
                return (
                  <Reveal key={r.id} delay={(i % 3) * 100} className="min-w-[84%] snap-start sm:min-w-[46%] md:min-w-0">
                    <figure className="flex h-full flex-col justify-between gap-6 rounded-2xl border border-black/10 p-6 transition-colors duration-300 hover:bg-[#F5F6F8]">
                      <div>
                        <div className="flex gap-0.5" role="img" aria-label={`${stars} out of 5 stars`}>
                          {[1, 2, 3, 4, 5].map((n) => (
                            <svg key={n} viewBox="0 0 20 20" className="h-4 w-4" aria-hidden="true" fill={n <= stars ? brand : "none"} stroke={brand} strokeWidth="1.4">
                              <path d="M10 1.8l2.5 5.3 5.7.7-4.2 4 1.1 5.7L10 14.7 4.9 17.5 6 11.8l-4.2-4 5.7-.7Z" strokeLinejoin="round" />
                            </svg>
                          ))}
                        </div>
                        <blockquote className="mt-4 text-[15px] leading-[1.7]">&ldquo;{r["quote"]}&rdquo;</blockquote>
                      </div>
                      {r["name"] && <figcaption className="text-[13px] font-semibold">{r["name"]}</figcaption>}
                    </figure>
                  </Reveal>
                );
              })}
            </div>
          </section>
        )}

        {/* Health tips */}
        {tips.length > 0 && (
          <section id="cl-tips" className="mx-auto w-full max-w-[1280px] px-5 pb-16 sm:px-10 sm:pb-24">
            <Reveal>
              <h2 className={`text-[30px] leading-[1.1] sm:text-[42px] ${HEAD}`}>Health tips</h2>
            </Reveal>
            <div className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-3">
              {tips.map((t, i) => (
                <Reveal key={t.id} delay={(i % 3) * 100}>
                  <article className="flex h-full flex-col gap-3 rounded-2xl p-6 transition-transform duration-500 hover:-translate-y-1" style={{ backgroundColor: SOFT }}>
                    <span className="text-[12px] font-semibold" style={{ color: brand }}>{String(i + 1).padStart(2, "0")}</span>
                    <h3 className="text-[18px] font-semibold leading-snug tracking-[-0.01em]">{t["title"]}</h3>
                    {t["text"] && <p className="text-[14px] leading-[1.65]" style={{ color: MUTED }}>{t["text"]}</p>}
                  </article>
                </Reveal>
              ))}
            </div>
          </section>
        )}

        {/* Offer */}
        {offerTitle && (
          <section aria-label="Offer" className="mx-auto w-full max-w-[1280px] px-5 pb-16 sm:px-10 sm:pb-24">
            <Reveal>
              <div className="flex flex-col items-start justify-between gap-5 rounded-2xl px-6 py-7 sm:flex-row sm:items-center sm:px-10 sm:py-8" style={{ backgroundColor: `${brand}12` }}>
                <div>
                  <span className="text-[12px] font-semibold uppercase tracking-[0.12em]" style={{ color: brand }}>Current offer</span>
                  <p className={`mt-2 text-[24px] leading-[1.15] sm:text-[30px] ${HEAD}`}>{offerTitle}</p>
                  {offerText && <p className="mt-2 text-[14px]" style={{ color: MUTED }}>{offerText}</p>}
                </div>
                <a href={book.href} {...bookProps} className={`${btn} shrink-0`} style={{ backgroundColor: brand, color: onBrand }}>
                  {buttonText} <ArrowIcon className="h-3.5 w-3.5" />
                </a>
              </div>
            </Reveal>
          </section>
        )}

        {/* Call to action */}
        <section aria-label="Book a visit">
          {bannerOk && (
            <div className="relative h-[220px] overflow-hidden sm:h-[300px]" style={{ backgroundColor: SOFT }}>
              <img src={defaultImages.banner} alt="" loading="lazy" onError={() => setBannerOk(false)} className="h-full w-full object-cover object-top" />
            </div>
          )}
          <div className="px-5 py-14 text-center sm:py-20" style={{ backgroundColor: brand, color: onBrand }}>
            <Reveal className="mx-auto flex max-w-2xl flex-col items-center gap-4">
              <h2 className={`text-[28px] leading-[1.15] sm:text-[40px] ${HEAD}`}>Not sure if you need to see a doctor?</h2>
              <p className="text-[15px] leading-[1.65] opacity-80">Talk to us and we&rsquo;ll help you decide the right next step for your health.</p>
              <a href={book.href} {...bookProps} className="mt-2 inline-flex items-center gap-2 rounded-full bg-white px-7 py-3.5 text-[14px] font-semibold transition-transform duration-300 hover:-translate-y-0.5" style={{ color: brand }}>
                {buttonText} <ArrowIcon className="h-3.5 w-3.5" />
              </a>
            </Reveal>
          </div>
        </section>

        {/* FAQs */}
        {faqs.length > 0 && (
          <section id="cl-faq" className="scroll-mt-[calc(var(--oc-top,0px)+72px)] mx-auto grid w-full max-w-[1280px] grid-cols-1 gap-8 px-5 py-16 sm:px-10 sm:py-24 md:grid-cols-3">
            <Reveal>
              <h2 className={`text-[30px] leading-[1.1] sm:text-[42px] ${HEAD}`}>Common questions</h2>
            </Reveal>
            <Reveal delay={100} className="flex flex-col md:col-span-2">
              {faqs.map((f) => (
                <details key={f.id} className="group border-b border-black/10 py-4">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-[16px] font-semibold [&::-webkit-details-marker]:hidden">
                    {f["question"]}
                    <span className="text-[20px] leading-none transition-transform duration-200 group-open:rotate-45" aria-hidden="true">+</span>
                  </summary>
                  <p className="mt-3 text-[14px] leading-[1.7]" style={{ color: MUTED }}>{f["answer"]}</p>
                </details>
              ))}
            </Reveal>
          </section>
        )}

        {/* Contact */}
        <section id="cl-contact" className="scroll-mt-[calc(var(--oc-top,0px)+72px)] mx-auto grid w-full max-w-[1280px] grid-cols-1 gap-12 px-5 py-16 sm:px-10 sm:py-24 md:grid-cols-2 md:gap-16">
          <Reveal className="flex flex-col items-start gap-5">
            <h2 className={`text-[32px] leading-[1.1] sm:text-[44px] ${HEAD}`}>
              Get in touch with <br className="hidden sm:inline" />{doctor}
            </h2>
            <p className="max-w-sm text-[14.5px] leading-[1.7]" style={{ color: MUTED }}>
              Have a question or want to book a visit? Send us a message and we&rsquo;ll get back to you shortly.
            </p>
            <div className="flex flex-col gap-1.5 text-[14px]">
              <a href={telHref(data.phone)} className="font-semibold hover:underline">{data.phone}</a>
              {secondPhone && <a href={telHref(secondPhone)} className="font-semibold hover:underline">{secondPhone}</a>}
              {email && <a href={`mailto:${email}`} className="break-all hover:underline" style={{ color: MUTED }}>{email}</a>}
              <span className="whitespace-pre-line" style={{ color: MUTED }}>{data.address || data.city}</span>
            </div>
            {emergency && (
              <a href={telHref(emergency)} className="flex items-center gap-3 rounded-2xl border px-4 py-3 text-[13px] transition-colors hover:bg-[#F5F6F8]" style={{ borderColor: `${brand}40` }}>
                <span className="flex h-9 w-9 items-center justify-center rounded-full" style={{ backgroundColor: brand, color: onBrand }}><Phone className="h-4 w-4" /></span>
                <span>
                  <span className="block font-semibold">Emergency or after hours</span>
                  <span style={{ color: MUTED }}>{emergency}</span>
                </span>
              </a>
            )}
            {hours && (
              <div className="rounded-2xl p-4 text-[13px]" style={{ backgroundColor: SOFT }}>
                <span className="block font-semibold">Clinic timings</span>
                <span className="mt-1 block whitespace-pre-line" style={{ color: MUTED }}>{hours}</span>
              </div>
            )}
          </Reveal>
          <Reveal delay={120}>
            <EnquiryForm data={data} brand={brand} subjects={services.map((s) => s["name"] ?? "").filter(Boolean)} />
            <div className="mt-10 h-[220px] overflow-hidden rounded-2xl border border-black/10">
              <iframe title={`Map of ${data.city}`} src={map.src} loading="lazy" referrerPolicy="no-referrer-when-downgrade" className="block h-full w-full" />
            </div>
            <a href={map.href} target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex items-center gap-2 text-[13px] font-semibold underline underline-offset-4">
              Open in Google Maps <ArrowIcon className="h-3.5 w-3.5" />
            </a>
          </Reveal>
        </section>

        {/* Footer */}
        <footer className="bg-[#1B1E24] px-5 py-12 text-center text-white sm:py-14">
          <div className="mx-auto flex max-w-[1280px] flex-col items-center gap-6">
            <span className="text-[20px] font-bold tracking-[-0.01em]">{data.businessName}</span>
            <nav className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-[12px]" aria-label="Footer">
              {nav.map((n) => (
                <button key={n.id} type="button" onClick={() => go(n.id)} className="cursor-pointer text-white/70 hover:text-white">{n.label}</button>
              ))}
              {socials.filter(([, href]) => href).map(([label, href]) => (
                <a key={label} href={href} target="_blank" rel="noopener noreferrer" className="text-white/70 hover:text-white">{label}</a>
              ))}
            </nav>
            <p className="text-[11px] text-white/40">
              © {new Date().getFullYear()} {data.businessName}. All rights reserved.{registration ? ` Reg. no. ${registration}.` : ""}
            </p>
          </div>
        </footer>
      </div>

      {viewer !== null && galleryItems.length > 0 && (
        <Lightbox items={galleryItems} index={viewer} onClose={() => setViewer(null)} onIndex={(i) => setViewer(i)} />
      )}

      {/* Quick actions: a bar on phones, a round WhatsApp button on larger screens */}
      {fullPage && (
        <>
          <div className="fixed inset-x-0 bottom-0 z-40 flex gap-2 border-t border-black/10 bg-white/95 px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur md:hidden">
            <a href={telHref(data.phone)} className="flex flex-1 items-center justify-center gap-2 rounded-full border border-black/15 py-3 text-[14px] font-semibold" style={{ color: INK }}>
              <Phone className="h-4 w-4" /> Call
            </a>
            <a href={waHref(data)} target="_blank" rel="noopener noreferrer" className="flex flex-1 items-center justify-center gap-2 rounded-full py-3 text-[14px] font-semibold" style={{ backgroundColor: brand, color: onBrand }}>
              <ChatIcon className="h-4 w-4" /> WhatsApp
            </a>
          </div>
          <a
            href={book.href}
            {...bookProps}
            className="fixed bottom-7 right-24 z-40 hidden items-center gap-2 rounded-full px-5 py-3 text-[14px] font-semibold shadow-[0_10px_30px_rgba(0,0,0,0.2)] transition-transform duration-300 hover:-translate-y-0.5 md:inline-flex"
            style={{ backgroundColor: brand, color: onBrand }}
          >
            Book appointment <ArrowIcon className="h-3.5 w-3.5" />
          </a>
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
