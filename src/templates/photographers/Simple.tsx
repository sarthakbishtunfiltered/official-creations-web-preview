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
  fontVars,
  isFullPagePreview,
  list,
  readableOn,
  resolveMap,
  safeHref,
  scrollToId,
  str,
  telHref,
  useEntrance,
  useParallax,
  waHref,
} from "../shared";

const INK = "#1C1917";
const MUTED = "#6F675E";
const IVORY = "#FBF8F3";
const TINT = "#F2ECE3";
const DEFAULT_ACCENT = "#7A5C45";

// Default photos for this template. Put the files in public/defaults/photographers/ using these
// names. A missing file is skipped and a warm placeholder shows instead.
const BASE = "/defaults/photographers/";
const defaultImages = {
  hero: `${BASE}hero.webp`,
  about: `${BASE}about.webp`,
  stories: [1, 2, 3, 4, 5, 6].map((n) => `${BASE}project-${n}.webp`),
};
const defaultStory = (i: number) => defaultImages.stories[i % defaultImages.stories.length];

// Headings use an elegant serif here. Choosing the Bold font style switches to the shared heavy look.
const HEADING = "[font-family:var(--oc-heading)] [font-weight:var(--oc-weight)] [letter-spacing:var(--oc-track)]";

const standardSteps = [
  { title: "Say hello", description: "Tell us your date, your plans and the feeling you want." },
  { title: "Plan together", description: "We agree the schedule, the places and the shot list." },
  { title: "The big day", description: "We stay calm, quiet and close, so moments happen naturally." },
  { title: "Your story", description: "Edited photographs, delivered in a private online gallery." },
];

const eventFallback = ["Weddings", "Pre-wedding", "Engagements", "Receptions", "Candid portraits", "Events"];

const stepColumns: Record<number, string> = { 1: "md:grid-cols-1", 2: "md:grid-cols-2", 3: "md:grid-cols-3", 4: "md:grid-cols-4", 5: "md:grid-cols-5" };

// Staggered spots for the story grid, so it reads like a magazine spread.
const storySlots = [
  "md:col-span-7 aspect-[4/3]",
  "md:col-span-5 aspect-[3/4] md:mt-24",
  "md:col-span-4 aspect-[3/4]",
  "md:col-span-4 aspect-[3/4] md:mt-16",
  "md:col-span-4 aspect-[3/4] md:mt-6",
];

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
  return new Date(y, m - 1, d).toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "long", year: "numeric" });
}

// Turns a YouTube or Vimeo link into an embeddable address. Anything else is just a link.
// The hero photo. A wide photo fills the whole banner. A tall or square photo is shown whole instead of cropped,
// sitting over a soft blurred copy of itself so there are no empty bars.
const heroFocusY: Record<string, string> = { "Top": "8%", "Upper middle": "30%", "Middle": "50%", "Lower middle": "68%", "Bottom": "92%" };

function HeroPhoto({ src, alt, focus }: { src: string; alt: string; focus: string }) {
  const [failed, setFailed] = useState(false);
  const [wide, setWide] = useState(true);
  const url = src && !failed ? src : defaultImages.hero;
  const isDefault = url === defaultImages.hero;
  return (
    <>
      {!wide && !isDefault && <img src={url} alt="" aria-hidden="true" className="absolute inset-0 h-full w-full scale-110 object-cover blur-2xl" />}
      <img
        src={url}
        alt={alt}
        onLoad={(e: { currentTarget: HTMLImageElement }) => setWide(isDefault || e.currentTarget.naturalWidth / Math.max(e.currentTarget.naturalHeight, 1) >= 1.35)}
        onError={() => setFailed(true)}
        className={`relative h-full w-full ${wide || isDefault ? "object-cover" : "object-contain"}`}
        style={{ objectPosition: `50% ${heroFocusY[focus] ?? "68%"}` }}
      />
    </>
  );
}

// Hero background video: a direct video file (.mp4 / .webm) or a YouTube / Vimeo link. Plays muted and looping.
type HeroVideoSource = { kind: "file" | "embed"; src: string };
function heroVideoSource(link: string): HeroVideoSource | null {
  try {
    const u = new URL(link);
    const host = u.hostname.replace(/^www\./, "");
    if (/\.(mp4|webm|m4v)$/i.test(u.pathname)) return { kind: "file", src: u.toString() };
    let yt = "";
    if (host === "youtu.be") yt = u.pathname.slice(1);
    else if (host.endsWith("youtube.com")) yt = u.searchParams.get("v") || /\/(?:shorts|embed)\/([\w-]+)/.exec(u.pathname)?.[1] || "";
    if (yt) return { kind: "embed", src: `https://www.youtube-nocookie.com/embed/${yt}?autoplay=1&mute=1&loop=1&playlist=${yt}&controls=0&modestbranding=1&playsinline=1&rel=0&disablekb=1` };
    if (host === "vimeo.com") {
      const id = /^\/(\d+)/.exec(u.pathname)?.[1];
      if (id) return { kind: "embed", src: `https://player.vimeo.com/video/${id}?background=1&autoplay=1&loop=1&muted=1` };
    }
  } catch {
    return null;
  }
  return null;
}

function HeroVideo({ source, poster }: { source: HeroVideoSource; poster: string }) {
  const [still] = useState(() => typeof window !== "undefined" && typeof window.matchMedia === "function" && window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  if (still) return null;
  if (source.kind === "file") {
    return <video className="absolute inset-0 h-full w-full object-cover" src={source.src} poster={poster || undefined} autoPlay muted loop playsInline preload="metadata" aria-hidden="true" />;
  }
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      <iframe
        title="Background film"
        src={source.src}
        allow="autoplay; encrypted-media"
        tabIndex={-1}
        className="absolute left-1/2 top-1/2 max-w-none -translate-x-1/2 -translate-y-1/2 border-0"
        style={{ width: "max(100%, calc(max(88vh, 540px) * 1.7778))", height: "max(100%, 56.25vw)" }}
      />
    </div>
  );
}

function videoEmbed(link: string): string {
  try {
    const u = new URL(link);
    const host = u.hostname.replace(/^www\./, "");
    if (host === "youtu.be") return `https://www.youtube-nocookie.com/embed/${u.pathname.slice(1)}?autoplay=1&rel=0`;
    if (host.endsWith("youtube.com")) {
      const id = u.searchParams.get("v") || /\/(?:shorts|embed)\/([\w-]+)/.exec(u.pathname)?.[1];
      return id ? `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0` : "";
    }
    if (host === "vimeo.com") {
      const id = /^\/(\d+)/.exec(u.pathname)?.[1];
      return id ? `https://player.vimeo.com/video/${id}?autoplay=1` : "";
    }
  } catch {
    return "";
  }
  return "";
}

function EnquiryForm({ data, accent, eventTypes }: { data: SiteData; accent: string; eventTypes: string[] }) {
  const [name, setName] = useState("");
  const [date, setDate] = useState("");
  const [type, setType] = useState("");
  const [place, setPlace] = useState("");
  const [message, setMessage] = useState("");

  // There is no server behind a preview, so the enquiry opens as a WhatsApp message.
  function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const text = `Hi ${data.businessName}, I'm ${name.trim()}.${type ? ` I'm planning ${type.toLowerCase()}` : " I'd like to ask about a shoot"}${date ? ` on ${prettyDate(date)}` : ""}${place.trim() ? ` in ${place.trim()}` : ""}. ${message.trim()}`;
    window.open(waHref(data, text.replace(/\s+/g, " ").trim()), "_blank", "noopener,noreferrer");
  }

  const field =
    "w-full border-0 border-b border-white/25 bg-transparent px-0 py-3 text-[15px] text-white placeholder:text-white/45 focus:border-white/70 focus:outline-none focus:ring-0 [color-scheme:dark]";

  return (
    <form onSubmit={submit} className="grid grid-cols-1 gap-x-6 gap-y-2 sm:grid-cols-2">
      <input className={`${field} sm:col-span-2`} placeholder="Your names" value={name} onChange={(e: ChangeEvent<HTMLInputElement>) => setName(e.target.value)} required aria-label="Your names" />
      <input type="date" min={todayIso()} className={field} value={date} onChange={(e: ChangeEvent<HTMLInputElement>) => setDate(e.target.value)} aria-label="Event date" />
      <select className={`${field} [&>option]:text-black`} value={type} onChange={(e: ChangeEvent<HTMLSelectElement>) => setType(e.target.value)} aria-label="Type of event">
        <option value="">Type of event</option>
        {eventTypes.map((t) => (
          <option key={t} value={t}>{t}</option>
        ))}
      </select>
      <input className={`${field} sm:col-span-2`} placeholder="Where is it?" value={place} onChange={(e: ChangeEvent<HTMLInputElement>) => setPlace(e.target.value)} aria-label="Location" />
      <textarea className={`${field} min-h-[88px] resize-y sm:col-span-2`} placeholder="Tell us a little about it" value={message} onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setMessage(e.target.value)} aria-label="Message" />
      <div className="mt-5 sm:col-span-2">
        <button
          type="submit"
          className="inline-flex cursor-pointer items-center gap-2 rounded-full px-7 py-3.5 text-[14px] font-semibold transition-transform duration-300 hover:-translate-y-0.5"
          style={{ backgroundColor: accent, color: readableOn(accent) }}
        >
          Check my date <ArrowIcon className="h-3.5 w-3.5" />
        </button>
        <p className="mt-3 text-[12px] text-white/50">Opens WhatsApp with your details. We reply personally.</p>
      </div>
    </form>
  );
}

// Each word of the headline rises into place one after another.
function HeroTitle({ text }: { text: string }) {
  const on = useEntrance();
  const words = text.split(/\s+/).filter(Boolean);
  const italicFrom = Math.max(words.length - 2, 1);
  return (
    <h1 aria-label={text} className={`max-w-[15ch] text-balance text-[44px] leading-[1.02] text-white sm:text-[76px] lg:text-[104px] ${HEADING}`}>
      {words.map((w, i) => (
        <span key={`${w}-${i}`} aria-hidden="true">
          {i > 0 && " "}
          <span className="-mb-[0.26em] inline-block overflow-hidden pb-[0.26em] align-bottom">
            <span
              className={`inline-block transition-transform duration-[900ms] ease-out ${on ? "translate-y-0" : "translate-y-[110%]"} ${i >= italicFrom ? "italic" : ""}`}
              style={{ transitionDelay: `${i * 90}ms` }}
            >
              {w}
            </span>
          </span>
        </span>
      ))}
    </h1>
  );
}

// The film: shows a poster, and only loads the player once someone presses play.
function Film({ link, poster, accent }: { link: string; poster: string; accent: string }) {
  const [playing, setPlaying] = useState(false);
  const embed = videoEmbed(link);
  return (
    <div className="relative aspect-video overflow-hidden rounded-[6px] bg-black">
      {playing && embed ? (
        <iframe title="Our film" src={embed} allow="autoplay; fullscreen; picture-in-picture" allowFullScreen className="absolute inset-0 h-full w-full" />
      ) : (
        <>
          <div className="absolute inset-0 opacity-90">
            <Pic src={poster} fallback={defaultImages.hero} alt="" tone={3} />
          </div>
          <div className="absolute inset-0 bg-black/30" />
          {embed ? (
            <button
              type="button"
              onClick={() => setPlaying(true)}
              aria-label="Play the film"
              className="group absolute inset-0 flex cursor-pointer items-center justify-center"
            >
              <span className="flex h-20 w-20 items-center justify-center rounded-full bg-white/90 transition-transform duration-300 group-hover:scale-110" style={{ color: accent }}>
                <svg viewBox="0 0 24 24" className="ml-1 h-7 w-7" fill="currentColor" aria-hidden="true"><path d="M8 5v14l11-7z" /></svg>
              </span>
            </button>
          ) : (
            <a href={link} target="_blank" rel="noopener noreferrer" className="group absolute inset-0 flex items-center justify-center">
              <span className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-[14px] font-semibold" style={{ color: INK }}>
                Watch the film <ArrowIcon className="h-3.5 w-3.5" />
              </span>
            </a>
          )}
        </>
      )}
    </div>
  );
}

export function PhotographerSimple({ data }: { data: SiteData }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [viewer, setViewer] = useState<{ kind: "story" | "gallery"; index: number } | null>(null);
  const heroRef = useParallax<HTMLDivElement>(0.06);
  const fullPage = isFullPagePreview();

  const realStories = list(data, "projects");
  // With no projects added yet, show the default pictures (no names or captions) so the page still looks complete.
  const stories = realStories.length > 0 ? realStories : defaultImages.stories.map((_, i) => ({ id: `default-${i}`, image: "", title: "", type: "" }));
  const services = list(data, "services").filter((s) => s["name"]);
  const packages = list(data, "packages").filter((p) => p["name"]);
  const testimonials = list(data, "testimonials");
  const faqs = list(data, "faqs");
  const gallery = list(data, "extraGallery");
  const typedSteps = list(data, "processSteps").filter((s) => s["title"]);
  const steps = typedSteps.length > 0 ? typedSteps.map((s) => ({ title: s["title"] ?? "", description: s["description"] ?? "" })) : standardSteps;

  const accent = data.brandColor.toLowerCase() === "#111111" ? DEFAULT_ACCENT : data.brandColor;
  const onAccent = readableOn(accent);

  const buttonText = str(data, "buttonText") || "Check availability";
  const banner = str(data, "announcementBanner");
  const reelLink = safeHref(str(data, "reelLink"));
  const heroVideoLink = safeHref(str(data, "heroVideo"));
  const heroVideo = heroVideoLink ? heroVideoSource(heroVideoLink) : null;
  const reviews = safeHref(str(data, "googleReviewsLink"));
  const brochure = safeHref(str(data, "brochureLink"));
  const ownerPhoto = str(data, "ownerPhoto");
  const aboutImage = str(data, "aboutImage");
  const email = str(data, "email");
  const secondPhone = str(data, "secondPhone");
  const hours = str(data, "openingHours");
  const certifications = str(data, "certifications");
  const map = resolveMap(data);

  const typeNames = Array.from(new Set(stories.map((s) => s["type"] ?? "").filter(Boolean)));
  const bandWords = typeNames.length > 0 ? typeNames : eventFallback;
  const eventTypes = typeNames.length > 0 ? typeNames : eventFallback;

  let stats: { value: string; label: string }[] = list(data, "keyNumbers").map((n) => ({ value: n["value"] ?? "", label: n["label"] ?? "" }));
  if (stats.length === 0) {
    const est = str(data, "yearEstablished");
    if (est) stats.push({ value: est, label: "Established" });
    if (realStories.length > 0) stats.push({ value: `${realStories.length}`, label: "Stories shown" });
  }
  stats = stats.filter((s) => s.value);

  const nav = [
    { id: "ph-stories", label: "Stories", show: stories.length > 0 },
    { id: "ph-film", label: "Film", show: Boolean(reelLink) },
    { id: "ph-packages", label: "Packages", show: packages.length > 0 },
    { id: "ph-about", label: "About", show: true },
    { id: "ph-contact", label: "Contact", show: true },
  ].filter((n) => n.show);

  const storyItems: LightboxItem[] = stories.map((p, i) => ({ src: p["image"], fallback: defaultStory(i), title: p["title"], caption: p["type"] }));
  const galleryItems: LightboxItem[] = gallery.map((g, i) => ({ src: g["image"], fallback: defaultStory(i + 2), title: g["caption"] }));

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const socials: [string, string][] = [
    ["Instagram", safeHref(str(data, "instagram"))],
    ["Facebook", safeHref(str(data, "facebook"))],
    ["YouTube", safeHref(str(data, "youtube"))],
  ];

  function go(id: string) {
    setMenuOpen(false);
    scrollToId(id);
  }

  // Serif headings by default; the Bold font style keeps the shared heavy look.
  const vars: CSSProperties =
    data.fontStyle === "bold"
      ? fontVars(data)
      : ({ ...fontVars(data), "--oc-heading": "'Newsreader', Georgia, 'Times New Roman', serif", "--oc-weight": "400", "--oc-track": "-0.02em" } as CSSProperties);

  const btn = "inline-flex items-center gap-2 rounded-full px-6 py-3 text-[14px] font-semibold transition-transform duration-300 hover:-translate-y-0.5";

  return (
    <div className={`font-sans ${fullPage ? "pb-20 md:pb-0" : ""}`} style={{ backgroundColor: IVORY, color: INK, ...vars }}>
      <div className="overflow-x-clip">
        {banner && (
          <div className="px-4 py-2 text-center text-[12px] font-semibold" style={{ backgroundColor: accent, color: onAccent }}>
            {banner}
          </div>
        )}

        {/* Navigation */}
        <div className={`sticky top-[var(--oc-top,0px)] z-30 border-b backdrop-blur transition-colors duration-300 ${scrolled ? "border-black/10" : "border-transparent"}`} style={{ backgroundColor: `${IVORY}E6` }}>
          <header className="mx-auto flex w-full max-w-[1400px] items-center justify-between gap-3 px-5 py-4 sm:px-10">
            {data.logo ? (
              <img src={data.logo} alt={`${data.businessName} logo`} className="h-9 w-auto max-w-[150px] object-contain" />
            ) : (
              <span className={`truncate text-[22px] ${HEADING}`}>{data.businessName}</span>
            )}
            <nav className="hidden items-center gap-8 md:flex" aria-label="Sections">
              {nav.map((n) => (
                <button key={n.id} type="button" onClick={() => go(n.id)} className="cursor-pointer text-[12px] font-semibold uppercase tracking-[0.16em] transition-opacity hover:opacity-50">
                  {n.label}
                </button>
              ))}
            </nav>
            <div className="flex shrink-0 items-center gap-2">
              <button
                type="button"
                onClick={() => go("ph-contact")}
                className="hidden rounded-full border px-5 py-2 text-[12px] font-semibold uppercase tracking-[0.14em] transition-colors duration-300 hover:bg-[#1C1917] hover:text-white sm:inline-flex"
                style={{ borderColor: INK }}
              >
                Check dates
              </button>
              <a href={telHref(data.phone)} aria-label="Call" className="flex h-9 w-9 items-center justify-center rounded-full sm:hidden" style={{ backgroundColor: accent, color: onAccent }}>
                <Phone className="h-4 w-4" />
              </a>
              <button
                type="button"
                onClick={() => setMenuOpen((o) => !o)}
                aria-expanded={menuOpen}
                aria-label={menuOpen ? "Close menu" : "Open menu"}
                className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-black/20 md:hidden"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="h-4 w-4" aria-hidden="true">
                  {menuOpen ? <path d="M6 6l12 12M18 6 6 18" /> : <path d="M4 8h16M4 16h16" />}
                </svg>
              </button>
            </div>
          </header>
          {menuOpen && (
            <nav className="animate-pop mx-4 mb-2 flex flex-col overflow-hidden rounded-2xl md:hidden" style={{ backgroundColor: TINT }} aria-label="Menu">
              {nav.map((n) => (
                <button key={n.id} type="button" onClick={() => go(n.id)} className="flex cursor-pointer items-center justify-between border-b border-black/10 px-5 py-3.5 text-left text-[15px] font-semibold last:border-b-0">
                  {n.label}
                  <ArrowIcon className="h-4 w-4" />
                </button>
              ))}
            </nav>
          )}
        </div>

        {/* Hero: one big photograph, the headline sitting low like a magazine cover */}
        <section className="relative h-[88vh] min-h-[540px] max-h-[980px] overflow-hidden">
          <div ref={heroRef} className="absolute inset-0 will-change-transform [transform-origin:50%_75%]">
            <HeroPhoto src={data.heroImage} alt={`${data.businessName} photography`} focus={str(data, "heroFocus")} />
          </div>
          {heroVideo && <HeroVideo source={heroVideo} poster={data.heroImage} />}
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-black/30" />
          <div className="relative mx-auto flex h-full w-full max-w-[1400px] flex-col justify-end gap-8 px-5 pb-10 sm:px-10 sm:pb-14">
            <div className="flex flex-col gap-5">
              <Kicker light>{`Wedding & event photography · ${data.city}`}</Kicker>
              <HeroTitle text={data.tagline} />
            </div>
            <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end">
              <p className="max-w-sm text-[14px] leading-[1.7] text-white/80">{excerpt(data.about, 130)}</p>
              <div className="flex flex-wrap items-center gap-4">
                <button type="button" onClick={() => go("ph-contact")} className={`${btn} cursor-pointer bg-white`} style={{ color: INK }}>
                  {buttonText} <ArrowIcon className="h-3.5 w-3.5" />
                </button>
                {reelLink && (
                  <button type="button" onClick={() => go("ph-film")} className="inline-flex cursor-pointer items-center gap-2 text-[13px] font-semibold text-white underline underline-offset-[6px]">
                    Watch the film
                  </button>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Scrolling band of what is shot */}
        <div aria-hidden="true" className="overflow-hidden border-b border-black/10 py-5">
          <div className="animate-marquee" style={{ animationDuration: "50s" }}>
            {Array.from({ length: 8 }, (_, rep) =>
              bandWords.map((t) => (
                <span key={`${rep}-${t}`} className={`flex shrink-0 items-center gap-8 pr-8 text-[26px] italic sm:text-[34px] ${HEADING}`}>
                  {t}
                  <span className="inline-block h-1.5 w-1.5 rounded-full" style={{ backgroundColor: accent }} />
                </span>
              )),
            )}
          </div>
        </div>

        {/* About */}
        <section id="ph-about" className="scroll-mt-[calc(var(--oc-top,0px)+72px)] mx-auto grid w-full max-w-[1400px] grid-cols-1 items-center gap-10 px-5 py-16 sm:px-10 sm:py-24 md:grid-cols-12 md:gap-14">
          <Reveal className="md:col-span-5">
            <div className="relative mx-auto max-w-[420px] md:max-w-none">
              <div className="aspect-[4/5] overflow-hidden rounded-t-[999px]">
                <Pic src={aboutImage || ownerPhoto} fallback={defaultImages.about} alt={`About ${data.businessName}`} tone={2} />
              </div>
              <span className="absolute -bottom-4 -right-2 rounded-full px-5 py-2 text-[13px] italic shadow-[0_10px_24px_rgba(0,0,0,0.15)] sm:-right-6" style={{ backgroundColor: accent, color: onAccent }}>
                Hello, I&rsquo;m {data.ownerName.split(" ")[0]}
              </span>
            </div>
          </Reveal>
          <Reveal delay={120} className="flex flex-col items-start gap-6 md:col-span-7">
            <Kicker>About us</Kicker>
            <p className={`text-[26px] leading-[1.25] sm:text-[38px] ${HEADING}`}>{excerpt(data.about, 220)}</p>
            {data.about.length > 220 && <p className="max-w-xl whitespace-pre-line text-[15px] leading-[1.8]" style={{ color: MUTED }}>{data.about}</p>}
            {certifications && <p className="text-[13px] font-medium">{certifications}</p>}
            {stats.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-x-10 gap-y-6 border-t border-black/10 pt-6">
                {stats.map((s) => (
                  <div key={s.label + s.value}>
                    <div className={`text-[40px] leading-none sm:text-[48px] ${HEADING}`} style={{ color: accent }}><CountUp value={s.value} /></div>
                    <div className="mt-2 text-[12px]" style={{ color: MUTED }}>{s.label}</div>
                  </div>
                ))}
              </div>
            )}
          </Reveal>
        </section>

        {/* Stories */}
        {stories.length > 0 && (
          <section id="ph-stories" className="scroll-mt-[calc(var(--oc-top,0px)+72px)] mx-auto w-full max-w-[1400px] px-5 pb-16 sm:px-10 sm:pb-24">
            <Reveal className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
              <div className="flex flex-col gap-3">
                <Kicker>Selected work</Kicker>
                <h2 className={`text-[36px] leading-[1.05] sm:text-[60px] ${HEADING}`}>Stories we&rsquo;ve <span className="italic">told</span></h2>
              </div>
              {brochure && (
                <a href={brochure} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 self-start text-[13px] font-semibold underline underline-offset-[6px] sm:self-auto">
                  Download the price list <ArrowIcon className="h-3.5 w-3.5" />
                </a>
              )}
            </Reveal>
            <div className="mt-12 grid grid-cols-1 gap-x-6 gap-y-10 md:grid-cols-12">
              {stories.map((p, i) => (
                <Reveal key={p.id} delay={(i % 3) * 100} className={`${(storySlots[i % storySlots.length] ?? "").split(" ").filter((c) => c.startsWith("md:col-span") || c.startsWith("md:mt")).join(" ")}`}>
                  <button
                    type="button"
                    onClick={() => setViewer({ kind: "story", index: i })}
                    aria-label={`View ${p["title"] || `story ${i + 1}`} larger`}
                    className="group block w-full cursor-zoom-in text-left"
                  >
                    <span className={`block overflow-hidden ${(storySlots[i % storySlots.length] ?? "").split(" ").filter((c) => c.startsWith("aspect")).join(" ")}`}>
                      <span className="block h-full w-full transition-transform duration-[1200ms] ease-out group-hover:scale-[1.04]">
                        <Pic src={p["image"]} fallback={defaultStory(i)} alt={p["title"] || `Story ${i + 1}`} tone={i} />
                      </span>
                    </span>
                    <span className="mt-4 flex items-baseline justify-between gap-4">
                      <span className={`text-[22px] leading-tight sm:text-[26px] ${HEADING}`}>{p["title"]}</span>
                      <span className="shrink-0 text-[12px] italic" style={{ color: MUTED }}>{p["type"] || String(i + 1).padStart(2, "0")}</span>
                    </span>
                  </button>
                </Reveal>
              ))}
            </div>
          </section>
        )}

        {/* Film */}
        {reelLink && (
          <section id="ph-film" className="scroll-mt-[calc(var(--oc-top,0px)+72px)] px-5 py-16 sm:px-10 sm:py-24" style={{ backgroundColor: INK, color: "#fff" }}>
            <div className="mx-auto w-full max-w-[1100px]">
              <Reveal className="mb-10 flex flex-col items-center gap-3 text-center">
                <Kicker light>The film</Kicker>
                <h2 className={`text-[34px] leading-[1.05] sm:text-[56px] ${HEADING}`}>Moments, <span className="italic">in motion</span></h2>
              </Reveal>
              <Reveal delay={100}>
                <Film link={reelLink} poster={data.heroImage} accent={accent} />
              </Reveal>
            </div>
          </section>
        )}

        {/* Gallery */}
        {gallery.length > 0 && (
          <section className="mx-auto w-full max-w-[1400px] px-5 py-16 sm:px-10 sm:py-24" aria-label="More photographs">
            <Reveal>
              <h2 className={`text-[30px] sm:text-[44px] ${HEADING}`}>More <span className="italic">frames</span></h2>
            </Reveal>
            <div className="mt-10 grid grid-cols-2 gap-3 md:grid-cols-4">
              {gallery.map((g, i) => (
                <Reveal key={g.id} delay={(i % 4) * 80}>
                  <button type="button" onClick={() => setViewer({ kind: "gallery", index: i })} aria-label={`View ${g["caption"] || `photo ${i + 1}`} larger`} className="group block w-full cursor-zoom-in text-left">
                    <span className="block aspect-[3/4] overflow-hidden">
                      <span className="block h-full w-full transition-transform duration-[1200ms] ease-out group-hover:scale-105">
                        <Pic src={g["image"]} fallback={defaultStory(i + 2)} alt={g["caption"] || `Photo ${i + 1}`} tone={i + 1} />
                      </span>
                    </span>
                    {g["caption"] && <span className="mt-2 block text-[12px] italic" style={{ color: MUTED }}>{g["caption"]}</span>}
                  </button>
                </Reveal>
              ))}
            </div>
          </section>
        )}

        {/* Services */}
        {services.length > 0 && (
          <section id="ph-services" className="scroll-mt-[calc(var(--oc-top,0px)+72px)] mx-auto w-full max-w-[1400px] px-5 py-16 sm:px-10 sm:py-24">
            <Reveal className="mb-10 flex flex-col gap-3">
              <Kicker>What we cover</Kicker>
              <h2 className={`text-[34px] leading-[1.05] sm:text-[52px] ${HEADING}`}>Every kind of <span className="italic">celebration</span></h2>
            </Reveal>
            <ol className="border-t border-black/15">
              {services.map((s: ListItem, i) => (
                <li key={s.id}>
                  <Reveal delay={(i % 4) * 70}>
                    <div className="group grid grid-cols-[40px_1fr] items-baseline gap-x-4 gap-y-2 border-b border-black/15 py-6 transition-colors duration-300 hover:bg-[#F2ECE3] sm:grid-cols-[60px_1fr_1.4fr_auto] sm:px-3 sm:py-7">
                      <span className="text-[13px] italic" style={{ color: MUTED }}>{String(i + 1).padStart(2, "0")}</span>
                      <h3 className={`text-[24px] leading-tight transition-transform duration-500 group-hover:translate-x-2 sm:text-[30px] ${HEADING}`}>{s["name"]}</h3>
                      <p className="col-start-2 text-[14px] leading-[1.65] sm:col-start-auto" style={{ color: MUTED }}>{s["description"]}</p>
                      {s["price"] && <span className="col-start-2 text-[13px] font-semibold sm:col-start-auto">{s["price"]}</span>}
                    </div>
                  </Reveal>
                </li>
              ))}
            </ol>
          </section>
        )}

        {/* Packages */}
        {packages.length > 0 && (
          <section id="ph-packages" className="scroll-mt-[calc(var(--oc-top,0px)+72px)] px-5 py-16 sm:px-10 sm:py-24" style={{ backgroundColor: TINT }}>
            <div className="mx-auto w-full max-w-[1400px]">
              <Reveal className="mb-12 flex flex-col gap-3">
                <Kicker>Packages</Kicker>
                <h2 className={`text-[34px] leading-[1.05] sm:text-[52px] ${HEADING}`}>Pick what <span className="italic">fits your day</span></h2>
              </Reveal>
              <div className={`grid grid-cols-1 gap-5 ${packages.length >= 3 ? "md:grid-cols-3" : packages.length === 2 ? "md:grid-cols-2" : "md:max-w-lg"}`}>
                {packages.map((p, i) => {
                  const items = splitList(p["description"] ?? "");
                  return (
                    <Reveal key={p.id} delay={(i % 3) * 110} className="h-full">
                      <div className="group flex h-full flex-col gap-5 bg-white p-7 transition-transform duration-500 hover:-translate-y-1.5 sm:p-8">
                        <span className="text-[12px] italic" style={{ color: MUTED }}>{String(i + 1).padStart(2, "0")}</span>
                        <h3 className={`text-[28px] leading-tight ${HEADING}`}>{p["name"]}</h3>
                        {p["price"] && <p className="text-[18px] font-semibold" style={{ color: accent }}>{p["price"]}</p>}
                        {items.length > 1 ? (
                          <ul className="flex flex-col gap-2.5 text-[14px] leading-[1.5]">
                            {items.map((it) => (
                              <li key={it} className="flex gap-3">
                                <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full" style={{ backgroundColor: accent }} aria-hidden="true" />
                                {it}
                              </li>
                            ))}
                          </ul>
                        ) : (
                          items[0] && <p className="text-[14px] leading-[1.7]" style={{ color: MUTED }}>{items[0]}</p>
                        )}
                        <a
                          href={waHref(data, `Hi ${data.businessName}, I'd like to know more about the ${p["name"] ?? ""} package.`)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-auto inline-flex items-center gap-2 pt-4 text-[13px] font-semibold underline underline-offset-[6px]"
                        >
                          Ask about this package <ArrowIcon className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" />
                        </a>
                      </div>
                    </Reveal>
                  );
                })}
              </div>
            </div>
          </section>
        )}

        {/* How we work */}
        <section id="ph-process" className="scroll-mt-[calc(var(--oc-top,0px)+72px)] mx-auto w-full max-w-[1400px] px-5 py-16 sm:px-10 sm:py-24">
          <Reveal className="mb-12 flex flex-col gap-3">
            <Kicker>How it works</Kicker>
            <h2 className={`text-[34px] leading-[1.05] sm:text-[52px] ${HEADING}`}>From hello to <span className="italic">your album</span></h2>
          </Reveal>
          <ol className={`grid grid-cols-1 gap-8 md:gap-6 ${stepColumns[Math.min(steps.length, 5)] ?? "md:grid-cols-4"}`}>
            {steps.map((s, i) => (
              <li key={`${s.title}-${i}`}>
                <Reveal delay={i * 110} className="relative h-full pl-14 md:pl-0 md:pt-14">
                  <span className="absolute left-0 top-0 flex h-9 w-9 items-center justify-center rounded-full text-[13px] italic" style={{ backgroundColor: accent, color: onAccent }}>{i + 1}</span>
                  {i < steps.length - 1 && (
                    <>
                      <span className="absolute -bottom-8 left-[17px] top-10 w-px bg-black/15 md:hidden" aria-hidden="true" />
                      <span className="absolute left-11 right-[-1.5rem] top-[18px] hidden h-px bg-black/15 md:block" aria-hidden="true" />
                    </>
                  )}
                  <h3 className={`text-[22px] ${HEADING}`}>{s.title}</h3>
                  {s.description && <p className="mt-2 text-[14px] leading-[1.65]" style={{ color: MUTED }}>{s.description}</p>}
                </Reveal>
              </li>
            ))}
          </ol>
        </section>

        {/* Testimonials */}
        {testimonials.length > 0 && (
          <section className="px-5 py-16 sm:px-10 sm:py-24" style={{ backgroundColor: TINT }}>
            <div className="mx-auto w-full max-w-[1400px]">
              <Reveal className="mb-12 flex flex-col gap-3">
                <Kicker>Kind words</Kicker>
                <h2 className={`text-[34px] leading-[1.05] sm:text-[52px] ${HEADING}`}>From the <span className="italic">people we shot</span></h2>
              </Reveal>
              <div className={`grid grid-cols-1 gap-10 ${testimonials.length > 1 ? "md:grid-cols-2" : ""}`}>
                {testimonials.map((t, i) => (
                  <Reveal key={t.id} delay={(i % 2) * 120}>
                    <figure className="flex h-full flex-col gap-5">
                      <span className="text-[56px] italic leading-none" style={{ color: accent }} aria-hidden="true">&ldquo;</span>
                      <blockquote className={`-mt-6 text-[22px] leading-[1.4] sm:text-[27px] ${HEADING}`}>{t["quote"]}</blockquote>
                      <figcaption className="text-[13px] font-semibold uppercase tracking-[0.14em]">{t["name"]}</figcaption>
                    </figure>
                  </Reveal>
                ))}
              </div>
              {reviews && (
                <a href={reviews} target="_blank" rel="noopener noreferrer" className="mt-10 inline-flex items-center gap-2 text-[13px] font-semibold underline underline-offset-[6px]">
                  Read our Google reviews <ArrowIcon className="h-3.5 w-3.5" />
                </a>
              )}
            </div>
          </section>
        )}

        {/* FAQs */}
        {faqs.length > 0 && (
          <section className="mx-auto grid w-full max-w-[1400px] grid-cols-1 gap-8 px-5 py-16 sm:px-10 sm:py-24 md:grid-cols-3">
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

        {/* Contact */}
        <footer id="ph-contact" className="scroll-mt-[calc(var(--oc-top,0px)+72px)] px-5 py-16 text-white sm:px-10 sm:py-24" style={{ backgroundColor: INK }}>
          <div className="mx-auto w-full max-w-[1400px]">
            <div className="grid grid-cols-1 gap-12 md:grid-cols-2 md:gap-16">
              <Reveal className="flex flex-col gap-6">
                <Kicker light>Let&rsquo;s talk</Kicker>
                <h2 className={`text-[40px] leading-[1.02] sm:text-[68px] ${HEADING}`}>
                  Is your date <span className="italic">still free?</span>
                </h2>
                <p className="max-w-sm text-[14px] leading-[1.75] text-white/60">
                  {data.businessName} · {data.address || data.city}
                </p>
                <div className="flex flex-col gap-1.5 text-[14px]">
                  <a href={telHref(data.phone)} className="font-semibold hover:underline">{data.phone}</a>
                  {secondPhone && <a href={telHref(secondPhone)} className="font-semibold hover:underline">{secondPhone}</a>}
                  {email && <a href={`mailto:${email}`} className="break-all text-white/70 hover:underline">{email}</a>}
                </div>
                {hours && (
                  <div className="max-w-xs border-t border-white/15 pt-4 text-[13px]">
                    <span className="block font-semibold">Studio hours</span>
                    <span className="mt-1 block whitespace-pre-line text-white/60">{hours}</span>
                  </div>
                )}
                {socials.some(([, href]) => href) && (
                  <div className="flex flex-wrap gap-x-6 gap-y-2 text-[13px]">
                    {socials.filter(([, href]) => href).map(([label, href]) => (
                      <a key={label} href={href} target="_blank" rel="noopener noreferrer" className="underline underline-offset-[6px] text-white/70 hover:text-white">{label}</a>
                    ))}
                  </div>
                )}
              </Reveal>
              <Reveal delay={120}>
                <EnquiryForm data={data} accent={accent} eventTypes={eventTypes} />
              </Reveal>
            </div>

            <Reveal className="mt-14 flex flex-col gap-2">
              <div className="h-[220px] overflow-hidden border border-white/10 bg-white/5">
                <iframe title={`Map of ${data.city}`} src={map.src} loading="lazy" referrerPolicy="no-referrer-when-downgrade" className="block h-full w-full" />
              </div>
              <a href={map.href} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 self-start text-[13px] font-semibold underline underline-offset-[6px]">
                Open in Google Maps <ArrowIcon className="h-3.5 w-3.5" />
              </a>
            </Reveal>

            <div className="mt-14 flex flex-col-reverse items-start justify-between gap-6 border-t border-white/15 pt-8 sm:flex-row sm:items-end">
              <span className="text-[12px] text-white/40">© {new Date().getFullYear()} {data.businessName}</span>
              <span className={`break-words text-[40px] italic leading-none sm:text-right sm:text-[72px] ${HEADING}`}>{data.businessName}</span>
            </div>
          </div>
        </footer>
      </div>

      {viewer && (
        <Lightbox
          items={viewer.kind === "story" ? storyItems : galleryItems}
          index={viewer.index}
          onClose={() => setViewer(null)}
          onIndex={(index) => setViewer({ kind: viewer.kind, index })}
        />
      )}

      {fullPage && (
        <>
          <div className="fixed inset-x-0 bottom-0 z-40 flex gap-2 border-t border-black/10 px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur md:hidden" style={{ backgroundColor: `${IVORY}F2` }}>
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
