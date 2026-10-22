import { useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { Phone } from "lucide-react";
import type { ListItem, SiteData } from "../../lib/siteData";
import { defaultImages, defaultProject } from "./defaults";
import {
  ArrowIcon,
  CountUp,
  Pic,
  Reveal,
  excerpt,
  flag,
  isBright,
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

const INK = "#1A1714";
const MUTED = "#6B635B";
const CARD = "#F1EBE3";

// Shown when the team has not typed their own steps.
const standardSteps: { title: string; description: string }[] = [
  { title: "Consultation", description: "We learn about your space, your style and your budget." },
  { title: "Design", description: "A clear plan with layouts and material choices to approve." },
  { title: "Execution", description: "The work is carried out and supervised on site." },
  { title: "Handover", description: "A final walkthrough so everything is just right." },
];

// Column counts for the process row, written out in full so Tailwind can see each class.
const stepColumns: Record<number, string> = {
  1: "md:grid-cols-1",
  2: "md:grid-cols-2",
  3: "md:grid-cols-3",
  4: "md:grid-cols-4",
  5: "md:grid-cols-5",
};

// Rows that slide sideways on phones and sit in a grid from tablets up.
const scroller =
  "-mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:-mx-8 sm:px-8 md:mx-0 md:grid md:overflow-visible md:px-0 md:pb-0";

function Eyebrow({ children }: { children: string }) {
  return <span className="text-[12px] font-semibold uppercase tracking-[0.14em]" style={{ color: MUTED }}>{children}</span>;
}

function Pill({ children }: { children: string }) {
  return (
    <span className="inline-flex rounded-full border border-black/15 bg-white/70 px-3 py-1 text-[11px] font-medium" style={{ color: INK }}>
      {children}
    </span>
  );
}

function ChatIcon({ className = "h-6 w-6" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />
    </svg>
  );
}

// Shape of the project tiles cycles so the grid looks like a gallery wall.
const tileShapes = ["aspect-[4/3]", "aspect-[3/4]", "aspect-square", "aspect-[3/4]", "aspect-[4/3]", "aspect-square"];

function EnquiryForm({ data, brand }: { data: SiteData; brand: string }) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");

  // There is no server behind a preview, so the enquiry opens as a WhatsApp message.
  function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const text = `Hi ${data.businessName}, I'm ${name.trim()}. ${message.trim()}${phone.trim() ? ` You can reach me on ${phone.trim()}.` : ""}`;
    window.open(waHref(data, text), "_blank", "noopener,noreferrer");
  }

  const field =
    "w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-[14px] text-white placeholder:text-white/40 focus:border-white/50 focus:outline-none";

  return (
    <form onSubmit={submit} className="flex flex-col gap-3">
      <input className={field} placeholder="Your name" value={name} onChange={(e: ChangeEvent<HTMLInputElement>) => setName(e.target.value)} required aria-label="Your name" />
      <input className={field} placeholder="Phone (optional)" value={phone} onChange={(e: ChangeEvent<HTMLInputElement>) => setPhone(e.target.value)} aria-label="Your phone" />
      <textarea className={`${field} min-h-[96px] resize-y`} placeholder="Tell us about your space" value={message} onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setMessage(e.target.value)} required aria-label="Your message" />
      <button
        type="submit"
        className="mt-1 inline-flex cursor-pointer items-center justify-center gap-2 rounded-full px-6 py-3 text-[14px] font-semibold"
        style={{ backgroundColor: brand, color: readableOn(brand) }}
      >
        Send on WhatsApp <ArrowIcon />
      </button>
    </form>
  );
}

// Each word of the headline rises into place one after another.
function HeroTitle({ text }: { text: string }) {
  const on = useEntrance();
  const words = text.split(/\s+/).filter(Boolean);
  return (
    <h1
      aria-label={text}
      className="max-w-[16ch] text-balance text-[38px] font-semibold leading-[1.02] tracking-[-0.035em] text-white sm:text-[64px] lg:text-[84px]"
    >
      {words.map((w, i) => (
        <span key={`${w}-${i}`} aria-hidden="true">
          {i > 0 && " "}
          <span className="-mb-[0.14em] inline-block overflow-hidden pb-[0.14em] align-bottom">
            <span
              className={`inline-block transition-transform duration-700 ease-out ${on ? "translate-y-0" : "translate-y-[110%]"}`}
              style={{ transitionDelay: `${i * 70}ms` }}
            >
              {w}
            </span>
          </span>
        </span>
      ))}
    </h1>
  );
}

export function InteriorSimple({ data }: { data: SiteData }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const heroImage = useParallax<HTMLDivElement>();
  const fullPage = isFullPagePreview();

  const projects = list(data, "projects");
  const services = list(data, "services");
  const gallery = list(data, "extraGallery");
  const beforeAfter = list(data, "beforeAfter");
  const testimonials = list(data, "testimonials");
  const faqs = list(data, "faqs");
  const typedSteps = list(data, "processSteps").filter((s) => s["title"]);
  const steps = typedSteps.length > 0 ? typedSteps.map((s) => ({ title: s["title"] ?? "", description: s["description"] ?? "" })) : standardSteps;

  const brand = data.brandColor;
  const onBrand = readableOn(brand);
  // On the dark contact section, a very dark brand colour would vanish, so fall back to white.
  const footerBrand = isBright(brand) ? brand : "#FFFFFF";

  const projectTypes = str(data, "projectTypes");
  const typeList = projectTypes.split(",").map((t) => t.trim()).filter(Boolean);
  const buttonText = str(data, "buttonText") || "Book a free consultation";
  const banner = str(data, "announcementBanner");
  const aboutImage = str(data, "aboutImage");
  const ownerPhoto = str(data, "ownerPhoto");
  const first = projects[0];
  const brochure = safeHref(str(data, "brochureLink"));
  const reviews = safeHref(str(data, "googleReviewsLink"));
  const email = str(data, "email");
  const secondPhone = str(data, "secondPhone");
  const certifications = str(data, "certifications");
  const hours = str(data, "openingHours");

  // The map: the exact spot if the team gave one, otherwise just the area (never a business name).
  const map = resolveMap(data);

  // The numbers row: the ones the team typed, or else whatever facts we have.
  let stats: { value: string; label: string }[] = list(data, "keyNumbers").map((n) => ({
    value: n["value"] ?? "",
    label: n["label"] ?? "",
  }));
  if (stats.length === 0) {
    const years = str(data, "yearsExperience");
    const est = str(data, "yearEstablished");
    if (years) stats.push({ value: `${years}+`, label: "Years of experience" });
    if (est) stats.push({ value: est, label: "Established" });
    if (projects.length > 0) stats.push({ value: `${projects.length}`, label: "Projects shown" });
  }
  stats = stats.filter((s) => s.value);

  const nav: { id: string; label: string; show: boolean }[] = [
    { id: "ts-work", label: "Work", show: projects.length > 0 },
    { id: "ts-services", label: "Services", show: services.length > 0 },
    { id: "ts-about", label: "About", show: true },
    { id: "ts-contact", label: "Contact", show: true },
  ];
  const navShown = nav.filter((n) => n.show);

  const socials: [string, string][] = [
    ["Instagram", safeHref(str(data, "instagram"))],
    ["Facebook", safeHref(str(data, "facebook"))],
    ["YouTube", safeHref(str(data, "youtube"))],
  ];

  function go(id: string) {
    setMenuOpen(false);
    scrollToId(id);
  }

  return (
    <div className={`bg-white font-sans ${fullPage ? "pb-20 md:pb-0" : ""}`} style={{ color: INK }}>
      <div className="overflow-hidden bg-white">
        {banner && (
          <div className="px-4 py-2 text-center text-[12px] font-semibold" style={{ backgroundColor: brand, color: onBrand }}>
            {banner}
          </div>
        )}

        {/* Navigation */}
        <header className="mx-auto flex w-full max-w-[1400px] items-center justify-between gap-3 px-4 py-4 sm:px-8">
          <div className="flex min-w-0 items-center gap-3">
            {data.logo ? (
              <img src={data.logo} alt={`${data.businessName} logo`} className="h-9 w-auto max-w-[140px] object-contain" />
            ) : (
              <span className="truncate text-[20px] font-semibold tracking-[-0.02em]">{data.businessName}</span>
            )}
          </div>
          <nav className="hidden items-center gap-6 md:flex" aria-label="Sections">
            {navShown.map((n) => (
              <button key={n.id} type="button" onClick={() => go(n.id)} className="cursor-pointer text-[13px] font-medium hover:opacity-60" style={{ color: INK }}>
                {n.label}
              </button>
            ))}
          </nav>
          <div className="flex shrink-0 items-center gap-2">
            <a
              href={telHref(data.phone)}
              className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-[13px] font-semibold"
              style={{ backgroundColor: brand, color: onBrand }}
            >
              <Phone className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">{data.phone}</span>
              <span className="sm:hidden">Call</span>
            </a>
            <button
              type="button"
              onClick={() => setMenuOpen((o) => !o)}
              aria-expanded={menuOpen}
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-black/15 md:hidden"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="h-4 w-4" aria-hidden="true">
                {menuOpen ? <path d="M6 6l12 12M18 6 6 18" /> : <path d="M4 8h16M4 16h16" />}
              </svg>
            </button>
          </div>
        </header>
        {menuOpen && (
          <nav className="animate-pop mx-4 mb-2 flex flex-col overflow-hidden rounded-2xl md:hidden" style={{ backgroundColor: CARD }} aria-label="Menu">
            {navShown.map((n) => (
              <button key={n.id} type="button" onClick={() => go(n.id)} className="flex cursor-pointer items-center justify-between border-b border-black/10 px-5 py-3.5 text-left text-[15px] font-semibold last:border-b-0">
                {n.label}
                <ArrowIcon className="h-4 w-4" />
              </button>
            ))}
          </nav>
        )}

        <main className="mx-auto flex w-full max-w-[1400px] flex-col gap-14 px-4 pb-10 sm:gap-20 sm:px-8 sm:pb-16">
          {/* Hero */}
          <section className="relative min-h-[460px] overflow-hidden rounded-[22px] sm:min-h-[560px]">
            <div ref={heroImage} className="absolute inset-0 will-change-transform">
              <Pic src={data.heroImage} fallback={defaultImages.hero} alt={`${data.businessName} interior`} tone={1} />
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/15 to-black/25" />
            <div className="relative flex min-h-[460px] flex-col justify-between gap-10 p-5 sm:min-h-[560px] sm:p-9">
              <div>
                <span className="mb-4 inline-block rounded-full border border-white/40 bg-white/10 px-3 py-1 text-[12px] font-medium text-white backdrop-blur">
                  Interior design · {data.city}
                </span>
                <HeroTitle text={data.tagline} />
              </div>
              <div className="max-w-md rounded-2xl border border-white/25 bg-white/15 p-4 text-white backdrop-blur-md sm:p-5">
                <p className="text-[13px] leading-[1.6] text-white/90">{excerpt(data.about, 150)}</p>
                <a
                  href={waHref(data)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-[13px] font-semibold"
                  style={{ color: INK }}
                >
                  {buttonText} <ArrowIcon className="h-3.5 w-3.5" />
                </a>
              </div>
            </div>
          </section>

          {/* Featured */}
          <section className="grid grid-cols-1 gap-3 md:grid-cols-3 md:grid-rows-2">
            <Reveal className="group relative min-h-[300px] overflow-hidden rounded-[22px] md:col-span-2 md:row-span-2 md:min-h-[420px]">
              <div className="absolute inset-0 transition-transform duration-[900ms] ease-out group-hover:scale-105">
                <Pic src={first?.["image"] || aboutImage} fallback={defaultImages.featured} alt={first?.["title"] || "Featured work"} tone={0} />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent" />
              <div className="absolute bottom-0 left-0 rounded-tr-[22px] bg-white px-5 py-4 sm:px-7 sm:py-5">
                <span className="block text-[11px] font-medium" style={{ color: MUTED }}>{first?.["type"] || "Featured"}</span>
                <span className="block text-[24px] font-semibold leading-[1.1] tracking-[-0.02em] sm:text-[34px]">
                  {first?.["title"] || data.nicheLabel}
                </span>
              </div>
            </Reveal>

            <Reveal delay={120} className="h-full">
              <div className="flex h-full flex-col justify-between gap-6 rounded-[22px] p-5 sm:p-6" style={{ backgroundColor: CARD }}>
                <div className="flex flex-wrap gap-2">
                  {(typeList.length > 0 ? typeList : ["Interior design"]).slice(0, 4).map((t) => (
                    <Pill key={t}>{t}</Pill>
                  ))}
                </div>
                <p className="text-[20px] font-semibold leading-[1.2] tracking-[-0.02em]">
                  Based in {data.city}, led by {data.ownerName}.
                </p>
              </div>
            </Reveal>

            <Reveal delay={240} className="group relative min-h-[200px] overflow-hidden rounded-[22px]">
              <div className="absolute inset-0 transition-transform duration-[900ms] ease-out group-hover:scale-105">
                <Pic src={ownerPhoto} alt={data.ownerName} tone={3} />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent" />
              <div className="absolute bottom-4 left-5 right-5 text-white">
                <span className="block text-[11px] text-white/80">Designer</span>
                <span className="block text-[17px] font-semibold">{data.ownerName}</span>
              </div>
            </Reveal>
          </section>

          {/* Numbers */}
          {stats.length > 0 && (
            <section aria-label="In numbers" className={`grid grid-cols-2 gap-8 text-center ${stats.length >= 4 ? "md:grid-cols-4" : stats.length === 3 ? "md:grid-cols-3" : ""}`}>
              {stats.map((s, i) => (
                <Reveal key={s.label + s.value} delay={i * 100}>
                  <div className="text-[44px] font-semibold leading-none tracking-[-0.03em] sm:text-[56px]">
                    <CountUp value={s.value} />
                  </div>
                  <div className="mt-2 text-[12px]" style={{ color: MUTED }}>{s.label}</div>
                </Reveal>
              ))}
            </section>
          )}

          {/* About */}
          <section id="ts-about" className="grid grid-cols-1 items-center gap-8 md:grid-cols-2 md:gap-12">
            <Reveal className="aspect-[4/3] overflow-hidden rounded-[22px]">
              <Pic src={aboutImage || ownerPhoto} fallback={defaultImages.about} alt={`About ${data.businessName}`} tone={2} />
            </Reveal>
            <Reveal delay={120} className="flex flex-col items-start gap-4">
              <Eyebrow>{`About · ${data.city}`}</Eyebrow>
              <h2 className="text-[30px] font-semibold leading-[1.1] tracking-[-0.025em] sm:text-[42px]">
                About {data.businessName}
              </h2>
              <p className="whitespace-pre-line text-[15px] leading-[1.7]" style={{ color: MUTED }}>{data.about}</p>
              {certifications && (
                <p className="text-[13px] font-medium" style={{ color: INK }}>{certifications}</p>
              )}
              <button
                type="button"
                onClick={() => scrollToId("ts-contact")}
                className="inline-flex cursor-pointer items-center gap-2 rounded-full px-5 py-2.5 text-[13px] font-semibold"
                style={{ backgroundColor: brand, color: onBrand }}
              >
                Contact us <ArrowIcon className="h-3.5 w-3.5" />
              </button>
            </Reveal>
          </section>

          {/* Scrolling band of what the studio designs */}
          {typeList.length > 0 && (
            <div aria-hidden="true" className="-mx-4 overflow-hidden border-y border-black/10 py-4 sm:-mx-8">
              <div className="animate-marquee" style={{ animationDuration: "45s" }}>
                {Array.from({ length: 8 }, (_, rep) =>
                  typeList.map((t) => (
                    <span key={`${rep}-${t}`} className="flex shrink-0 items-center gap-8 pr-8 text-[22px] font-semibold tracking-[-0.02em] sm:text-[30px]">
                      {t}
                      <span className="inline-block h-2 w-2 rounded-full" style={{ backgroundColor: brand }} />
                    </span>
                  )),
                )}
              </div>
            </div>
          )}

          {/* How we work */}
          <section id="ts-process" className="flex flex-col gap-10">
            <Reveal className="flex flex-col gap-3">
              <Eyebrow>How we work</Eyebrow>
              <h2 className="text-[30px] font-semibold leading-[1.1] tracking-[-0.025em] sm:text-[42px]">
                From first call to the final handover
              </h2>
            </Reveal>
            <ol className={`grid grid-cols-1 gap-8 md:gap-6 ${stepColumns[Math.min(steps.length, 5)] ?? "md:grid-cols-4"}`}>
              {steps.map((s, i) => (
                <li key={`${s.title}-${i}`}>
                  <Reveal delay={i * 110} className="relative h-full pl-14 md:pl-0 md:pt-14">
                    <span
                      className="absolute left-0 top-0 flex h-9 w-9 items-center justify-center rounded-full text-[13px] font-bold"
                      style={{ backgroundColor: brand, color: onBrand }}
                    >
                      {i + 1}
                    </span>
                    {i < steps.length - 1 && (
                      <>
                        <span className="absolute -bottom-8 left-[17px] top-10 w-px bg-black/15 md:hidden" aria-hidden="true" />
                        <span className="absolute left-11 right-[-1.5rem] top-[18px] hidden h-px bg-black/15 md:block" aria-hidden="true" />
                      </>
                    )}
                    <h3 className="text-[19px] font-semibold tracking-[-0.02em]">{s.title}</h3>
                    {s.description && <p className="mt-2 text-[14px] leading-[1.6]" style={{ color: MUTED }}>{s.description}</p>}
                  </Reveal>
                </li>
              ))}
            </ol>
          </section>

          {/* Services */}
          {services.length > 0 && (
            <section id="ts-services" className="flex flex-col gap-8">
              <Reveal className="flex flex-col gap-3">
                <Eyebrow>What we do</Eyebrow>
                <h2 className="text-[30px] font-semibold leading-[1.1] tracking-[-0.025em] sm:text-[42px]">Our services</h2>
              </Reveal>
              <div className={`${scroller} md:grid-cols-2 lg:grid-cols-3`}>
                {services.map((s: ListItem, i) => (
                  <Reveal key={s.id} delay={(i % 3) * 100} className="min-w-[78%] snap-start sm:min-w-[46%] md:min-w-0">
                    <div className="flex h-full flex-col gap-3 rounded-[22px] p-5 transition-transform duration-500 hover:-translate-y-1 sm:p-6" style={{ backgroundColor: CARD }}>
                      <span className="text-[12px] font-semibold" style={{ color: MUTED }}>{String(i + 1).padStart(2, "0")}</span>
                      <h3 className="text-[20px] font-semibold tracking-[-0.02em]">{s["name"]}</h3>
                      {s["description"] && <p className="text-[14px] leading-[1.6]" style={{ color: MUTED }}>{s["description"]}</p>}
                      {s["price"] && <p className="mt-auto pt-2 text-[13px] font-semibold">From {s["price"]}</p>}
                    </div>
                  </Reveal>
                ))}
              </div>
            </section>
          )}

          {/* Projects */}
          {projects.length > 0 && (
            <section id="ts-work" className="flex flex-col gap-8">
              <Reveal className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
                <h2 className="text-[30px] font-semibold leading-[1.1] tracking-[-0.025em] sm:text-[42px]">
                  Explore our <br className="hidden sm:inline" />recent work
                </h2>
                {brochure && (
                  <a href={brochure} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 self-start rounded-full px-5 py-2.5 text-[13px] font-semibold sm:self-auto" style={{ backgroundColor: brand, color: onBrand }}>
                    View brochure <ArrowIcon className="h-3.5 w-3.5" />
                  </a>
                )}
              </Reveal>
              <div className="columns-2 gap-3 md:columns-3">
                {projects.map((p, i) => (
                  <Reveal key={p.id} delay={(i % 3) * 90} className="mb-3 break-inside-avoid">
                    <figure className="group relative overflow-hidden rounded-[18px]">
                      <div className={tileShapes[i % tileShapes.length]}>
                        <div className="h-full w-full transition-transform duration-[900ms] ease-out group-hover:scale-105">
                          <Pic src={p["image"]} fallback={defaultProject(i)} alt={p["title"] || `Project ${i + 1}`} tone={i} />
                        </div>
                      </div>
                      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                      <figcaption className="absolute bottom-3 left-4 right-14 text-white">
                        {p["type"] && <span className="block text-[11px] text-white/80">{p["type"]}</span>}
                        <span className="block text-[15px] font-semibold leading-tight">{p["title"]}</span>
                      </figcaption>
                      <span className="absolute bottom-3 right-3 flex h-8 w-8 items-center justify-center rounded-full bg-white transition-transform duration-500 group-hover:rotate-45" style={{ color: INK }}>
                        <ArrowIcon className="h-3.5 w-3.5" />
                      </span>
                    </figure>
                  </Reveal>
                ))}
              </div>
            </section>
          )}

          {/* More photos */}
          {gallery.length > 0 && (
            <section className="flex flex-col gap-6" aria-label="More photos">
              <Reveal>
                <h2 className="text-[24px] font-semibold tracking-[-0.02em] sm:text-[30px]">More from our studio</h2>
              </Reveal>
              <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                {gallery.map((g, i) => (
                  <Reveal key={g.id} delay={(i % 4) * 80}>
                    <figure className="group flex flex-col gap-2">
                      <div className="aspect-square overflow-hidden rounded-[16px]">
                        <div className="h-full w-full transition-transform duration-[900ms] ease-out group-hover:scale-105">
                          <Pic src={g["image"]} fallback={defaultProject(i + 3)} alt={g["caption"] || `Photo ${i + 1}`} tone={i + 2} />
                        </div>
                      </div>
                      {g["caption"] && <figcaption className="text-[12px]" style={{ color: MUTED }}>{g["caption"]}</figcaption>}
                    </figure>
                  </Reveal>
                ))}
              </div>
            </section>
          )}

          {/* Before and after */}
          {beforeAfter.length > 0 && (
            <section className="flex flex-col gap-8">
              <Reveal>
                <h2 className="text-[30px] font-semibold leading-[1.1] tracking-[-0.025em] sm:text-[42px]">Before &amp; after</h2>
              </Reveal>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {beforeAfter.map((b, i) => (
                  <Reveal key={b.id} delay={(i % 2) * 120} className="flex flex-col gap-3">
                    <div className="grid grid-cols-2 gap-2">
                      {(["before", "after"] as const).map((side) => (
                        <div key={side} className="relative aspect-[4/5] overflow-hidden rounded-[16px]">
                          <Pic src={b[side]} alt={`${b["title"] || "Project"} ${side}`} tone={i + (side === "after" ? 2 : 0)} />
                          <span className="absolute left-2 top-2 rounded-full bg-white px-2.5 py-0.5 text-[11px] font-semibold capitalize" style={{ color: INK }}>{side}</span>
                        </div>
                      ))}
                    </div>
                    {b["title"] && <p className="text-[14px] font-semibold">{b["title"]}</p>}
                  </Reveal>
                ))}
              </div>
            </section>
          )}

          {/* Testimonials */}
          {testimonials.length > 0 && (
            <section className="flex flex-col gap-8">
              <Reveal>
                <h2 className="text-[30px] font-semibold leading-[1.1] tracking-[-0.025em] sm:text-[42px]">Kind words</h2>
              </Reveal>
              <div className={`${scroller} md:grid-cols-3`}>
                {testimonials.map((t, i) => (
                  <Reveal key={t.id} delay={(i % 3) * 100} className="min-w-[82%] snap-start sm:min-w-[46%] md:min-w-0">
                    <blockquote className="flex h-full flex-col justify-between gap-5 rounded-[22px] p-6" style={{ backgroundColor: CARD }}>
                      <p className="text-[15px] leading-[1.65]">“{t["quote"]}”</p>
                      <footer className="text-[13px] font-semibold">{t["name"]}</footer>
                    </blockquote>
                  </Reveal>
                ))}
              </div>
              {reviews && (
                <a href={reviews} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 self-start text-[13px] font-semibold underline underline-offset-4">
                  Read our Google reviews <ArrowIcon className="h-3.5 w-3.5" />
                </a>
              )}
            </section>
          )}

          {/* FAQs */}
          {faqs.length > 0 && (
            <section className="grid grid-cols-1 gap-8 md:grid-cols-3">
              <Reveal>
                <h2 className="text-[30px] font-semibold leading-[1.1] tracking-[-0.025em] sm:text-[42px]">Questions</h2>
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
        </main>

        {/* Contact */}
        <footer id="ts-contact" className="bg-[#111111] py-12 text-white sm:py-16">
          <div className="mx-auto w-full max-w-[1400px] px-5 sm:px-8">
          <div className="grid grid-cols-1 gap-10 md:grid-cols-2 md:gap-14">
            <Reveal className="flex flex-col gap-5">
              <h2 className="text-[34px] font-semibold leading-[1.08] tracking-[-0.03em] sm:text-[48px]">
                Let&rsquo;s talk about <br className="hidden sm:inline" />your space.
              </h2>
              <p className="max-w-sm text-[14px] leading-[1.7] text-white/60">
                {data.businessName} · {data.address || data.city}
              </p>
              {!flag(data, "enquiryForm") && (
                <a
                  href={waHref(data)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 self-start rounded-full px-6 py-3 text-[14px] font-semibold"
                  style={{ backgroundColor: footerBrand, color: readableOn(footerBrand) }}
                >
                  {buttonText} <ArrowIcon />
                </a>
              )}
            </Reveal>
            {flag(data, "enquiryForm") && (
              <Reveal delay={120}>
                <EnquiryForm data={data} brand={footerBrand} />
              </Reveal>
            )}
          </div>

          {/* Details beside the map */}
          <div className="mt-12 grid grid-cols-1 gap-8 border-t border-white/10 pt-10 md:grid-cols-[3fr_2fr] md:gap-10">
            <Reveal className="grid grid-cols-1 content-start gap-6 text-[13px] min-[420px]:grid-cols-2">
              <div className="flex flex-col gap-2">
                <span className="font-semibold">Contact</span>
                <a href={telHref(data.phone)} className="text-white/60 hover:text-white">{data.phone}</a>
                {secondPhone && <a href={telHref(secondPhone)} className="text-white/60 hover:text-white">{secondPhone}</a>}
                <a href={waHref(data)} target="_blank" rel="noopener noreferrer" className="text-white/60 hover:text-white">WhatsApp</a>
                {email && <a href={`mailto:${email}`} className="break-all text-white/60 hover:text-white">{email}</a>}
              </div>
              <div className="flex flex-col gap-2">
                <span className="font-semibold">Visit</span>
                <span className="whitespace-pre-line text-white/60">{data.address || data.city}</span>
              </div>
              {hours && (
                <div className="flex flex-col gap-2 rounded-2xl border border-white/10 bg-white/5 p-4 min-[420px]:col-span-2">
                  <span className="font-semibold">Opening hours</span>
                  <span className="whitespace-pre-line text-white/60">{hours}</span>
                </div>
              )}
              {socials.some(([, href]) => href) && (
                <div className="flex flex-col gap-2 min-[420px]:col-span-2">
                  <span className="font-semibold">Follow</span>
                  <div className="flex flex-wrap gap-x-5 gap-y-2">
                    {socials.filter(([, href]) => href).map(([label, href]) => (
                      <a key={label} href={href} target="_blank" rel="noopener noreferrer" className="text-white/60 hover:text-white">{label}</a>
                    ))}
                  </div>
                </div>
              )}
            </Reveal>

            <Reveal delay={120} className="flex flex-col gap-2 md:h-full">
              <div className="h-[200px] overflow-hidden rounded-[18px] border border-white/10 bg-white/5 md:h-auto md:min-h-[200px] md:flex-1">
                <iframe
                  title={`Map of ${data.city}`}
                  src={map.src}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="block h-full w-full"
                />
              </div>
              <a
                href={map.href}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 self-start text-[13px] font-semibold underline underline-offset-4"
              >
                Open in Google Maps <ArrowIcon className="h-3.5 w-3.5" />
              </a>
            </Reveal>
          </div>

          <div className="mt-12 flex flex-col-reverse items-start justify-between gap-6 border-t border-white/10 pt-8 sm:flex-row sm:items-end">
            <span className="text-[12px] text-white/40">© {new Date().getFullYear()} {data.businessName}</span>
            <span className="break-words text-[36px] font-semibold leading-none tracking-[-0.04em] sm:text-right sm:text-[64px]">
              {data.businessName}
            </span>
          </div>
          </div>
        </footer>
      </div>

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
            href={waHref(data)}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Chat on WhatsApp"
            className="group fixed bottom-6 right-6 z-40 hidden h-14 w-14 items-center justify-center rounded-full text-white shadow-[0_10px_30px_rgba(0,0,0,0.25)] transition-transform duration-300 hover:scale-105 md:flex"
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
