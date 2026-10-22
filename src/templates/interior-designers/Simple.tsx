import { useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { Phone } from "lucide-react";
import type { ListItem, SiteData } from "../../lib/siteData";
import {
  ArrowIcon,
  Pic,
  excerpt,
  flag,
  isBright,
  list,
  readableOn,
  safeHref,
  scrollToId,
  str,
  telHref,
  waHref,
} from "../shared";

const INK = "#1A1714";
const MUTED = "#6B635B";
const CARD = "#F1EBE3";

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

export function InteriorSimple({ data }: { data: SiteData }) {
  const projects = list(data, "projects");
  const services = list(data, "services");
  const gallery = list(data, "extraGallery");
  const beforeAfter = list(data, "beforeAfter");
  const testimonials = list(data, "testimonials");
  const faqs = list(data, "faqs");

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
  const maps = safeHref(str(data, "mapsLink"));
  const email = str(data, "email");
  const secondPhone = str(data, "secondPhone");
  const certifications = str(data, "certifications");

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

  const socials: [string, string][] = [
    ["Instagram", safeHref(str(data, "instagram"))],
    ["Facebook", safeHref(str(data, "facebook"))],
    ["YouTube", safeHref(str(data, "youtube"))],
  ];

  return (
    <div className="bg-[#E8DFD3] p-2.5 font-sans sm:p-5" style={{ color: INK }}>
      <div className="overflow-hidden rounded-[20px] bg-white">
        {banner && (
          <div className="px-4 py-2 text-center text-[12px] font-semibold" style={{ backgroundColor: brand, color: onBrand }}>
            {banner}
          </div>
        )}

        {/* Navigation */}
        <header className="flex items-center justify-between gap-4 px-4 py-4 sm:px-8">
          <div className="flex min-w-0 items-center gap-3">
            {data.logo ? (
              <img src={data.logo} alt={`${data.businessName} logo`} className="h-9 w-auto max-w-[140px] object-contain" />
            ) : (
              <span className="truncate text-[20px] font-semibold tracking-[-0.02em]">{data.businessName}</span>
            )}
          </div>
          <nav className="hidden items-center gap-6 md:flex" aria-label="Sections">
            {nav.filter((n) => n.show).map((n) => (
              <button key={n.id} type="button" onClick={() => scrollToId(n.id)} className="cursor-pointer text-[13px] font-medium hover:opacity-60" style={{ color: INK }}>
                {n.label}
              </button>
            ))}
          </nav>
          <a
            href={telHref(data.phone)}
            className="inline-flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-[13px] font-semibold"
            style={{ backgroundColor: brand, color: onBrand }}
          >
            <Phone className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">{data.phone}</span>
            <span className="sm:hidden">Call</span>
          </a>
        </header>

        <main className="flex flex-col gap-14 px-4 pb-4 sm:gap-20 sm:px-8 sm:pb-8">
          {/* Hero */}
          <section className="relative min-h-[460px] overflow-hidden rounded-[22px] sm:min-h-[560px]">
            <div className="absolute inset-0">
              <Pic src={data.heroImage} alt={`${data.businessName} interior`} tone={1} />
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/15 to-black/25" />
            <div className="relative flex min-h-[460px] flex-col justify-between gap-10 p-5 sm:min-h-[560px] sm:p-9">
              <div>
                <span className="mb-4 inline-block rounded-full border border-white/40 bg-white/10 px-3 py-1 text-[12px] font-medium text-white backdrop-blur">
                  Interior design · {data.city}
                </span>
                <h1 className="max-w-[16ch] text-balance text-[38px] font-semibold leading-[1.02] tracking-[-0.035em] text-white sm:text-[64px] lg:text-[84px]">
                  {data.tagline}
                </h1>
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
            <div className="relative min-h-[300px] overflow-hidden rounded-[22px] md:col-span-2 md:row-span-2 md:min-h-[420px]">
              <div className="absolute inset-0">
                <Pic src={first?.["image"] || aboutImage} alt={first?.["title"] || "Featured work"} tone={0} />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent" />
              <div className="absolute bottom-0 left-0 rounded-tr-[22px] bg-white px-5 py-4 sm:px-7 sm:py-5">
                <span className="block text-[11px] font-medium" style={{ color: MUTED }}>{first?.["type"] || "Featured"}</span>
                <span className="block text-[24px] font-semibold leading-[1.1] tracking-[-0.02em] sm:text-[34px]">
                  {first?.["title"] || data.nicheLabel}
                </span>
              </div>
            </div>

            <div className="flex flex-col justify-between gap-6 rounded-[22px] p-5 sm:p-6" style={{ backgroundColor: CARD }}>
              <div className="flex flex-wrap gap-2">
                {(typeList.length > 0 ? typeList : ["Interior design"]).slice(0, 4).map((t) => (
                  <Pill key={t}>{t}</Pill>
                ))}
              </div>
              <p className="text-[20px] font-semibold leading-[1.2] tracking-[-0.02em]">
                Based in {data.city}, led by {data.ownerName}.
              </p>
            </div>

            <div className="relative min-h-[200px] overflow-hidden rounded-[22px]">
              <div className="absolute inset-0">
                <Pic src={ownerPhoto} alt={data.ownerName} tone={3} />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent" />
              <div className="absolute bottom-4 left-5 right-5 text-white">
                <span className="block text-[11px] text-white/80">Designer</span>
                <span className="block text-[17px] font-semibold">{data.ownerName}</span>
              </div>
            </div>
          </section>

          {/* Numbers */}
          {stats.length > 0 && (
            <section aria-label="In numbers" className={`grid grid-cols-2 gap-8 text-center ${stats.length >= 4 ? "md:grid-cols-4" : stats.length === 3 ? "md:grid-cols-3" : ""}`}>
              {stats.map((s) => (
                <div key={s.label + s.value}>
                  <div className="text-[44px] font-semibold leading-none tracking-[-0.03em] sm:text-[56px]">{s.value}</div>
                  <div className="mt-2 text-[12px]" style={{ color: MUTED }}>{s.label}</div>
                </div>
              ))}
            </section>
          )}

          {/* About */}
          <section id="ts-about" className="grid grid-cols-1 items-center gap-8 md:grid-cols-2 md:gap-12">
            <div className="aspect-[4/3] overflow-hidden rounded-[22px]">
              <Pic src={aboutImage || ownerPhoto} alt={`About ${data.businessName}`} tone={2} />
            </div>
            <div className="flex flex-col items-start gap-4">
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
            </div>
          </section>

          {/* Services */}
          {services.length > 0 && (
            <section id="ts-services" className="flex flex-col gap-8">
              <div className="flex flex-col gap-3">
                <Eyebrow>What we do</Eyebrow>
                <h2 className="text-[30px] font-semibold leading-[1.1] tracking-[-0.025em] sm:text-[42px]">Our services</h2>
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {services.map((s: ListItem, i) => (
                  <div key={s.id} className="flex flex-col gap-3 rounded-[22px] p-5 sm:p-6" style={{ backgroundColor: CARD }}>
                    <span className="text-[12px] font-semibold" style={{ color: MUTED }}>{String(i + 1).padStart(2, "0")}</span>
                    <h3 className="text-[20px] font-semibold tracking-[-0.02em]">{s["name"]}</h3>
                    {s["description"] && <p className="text-[14px] leading-[1.6]" style={{ color: MUTED }}>{s["description"]}</p>}
                    {s["price"] && <p className="mt-auto pt-2 text-[13px] font-semibold">From {s["price"]}</p>}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Projects */}
          {projects.length > 0 && (
            <section id="ts-work" className="flex flex-col gap-8">
              <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
                <h2 className="text-[30px] font-semibold leading-[1.1] tracking-[-0.025em] sm:text-[42px]">
                  Explore our <br className="hidden sm:inline" />recent work
                </h2>
                {brochure && (
                  <a href={brochure} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 self-start rounded-full px-5 py-2.5 text-[13px] font-semibold sm:self-auto" style={{ backgroundColor: brand, color: onBrand }}>
                    View brochure <ArrowIcon className="h-3.5 w-3.5" />
                  </a>
                )}
              </div>
              <div className="columns-2 gap-3 md:columns-3">
                {projects.map((p, i) => (
                  <figure key={p.id} className="relative mb-3 break-inside-avoid overflow-hidden rounded-[18px]">
                    <div className={tileShapes[i % tileShapes.length]}>
                      <Pic src={p["image"]} alt={p["title"] || `Project ${i + 1}`} tone={i} />
                    </div>
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    <figcaption className="absolute bottom-3 left-4 right-14 text-white">
                      {p["type"] && <span className="block text-[11px] text-white/80">{p["type"]}</span>}
                      <span className="block text-[15px] font-semibold leading-tight">{p["title"]}</span>
                    </figcaption>
                    <span className="absolute bottom-3 right-3 flex h-8 w-8 items-center justify-center rounded-full bg-white" style={{ color: INK }}>
                      <ArrowIcon className="h-3.5 w-3.5" />
                    </span>
                  </figure>
                ))}
              </div>
            </section>
          )}

          {/* More photos */}
          {gallery.length > 0 && (
            <section className="flex flex-col gap-6" aria-label="More photos">
              <h2 className="text-[24px] font-semibold tracking-[-0.02em] sm:text-[30px]">More from our studio</h2>
              <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                {gallery.map((g, i) => (
                  <figure key={g.id} className="flex flex-col gap-2">
                    <div className="aspect-square overflow-hidden rounded-[16px]">
                      <Pic src={g["image"]} alt={g["caption"] || `Photo ${i + 1}`} tone={i + 2} />
                    </div>
                    {g["caption"] && <figcaption className="text-[12px]" style={{ color: MUTED }}>{g["caption"]}</figcaption>}
                  </figure>
                ))}
              </div>
            </section>
          )}

          {/* Before and after */}
          {beforeAfter.length > 0 && (
            <section className="flex flex-col gap-8">
              <h2 className="text-[30px] font-semibold leading-[1.1] tracking-[-0.025em] sm:text-[42px]">Before &amp; after</h2>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {beforeAfter.map((b, i) => (
                  <div key={b.id} className="flex flex-col gap-3">
                    <div className="grid grid-cols-2 gap-2">
                      {(["before", "after"] as const).map((side) => (
                        <div key={side} className="relative aspect-[4/5] overflow-hidden rounded-[16px]">
                          <Pic src={b[side]} alt={`${b["title"] || "Project"} ${side}`} tone={i + (side === "after" ? 2 : 0)} />
                          <span className="absolute left-2 top-2 rounded-full bg-white px-2.5 py-0.5 text-[11px] font-semibold capitalize" style={{ color: INK }}>{side}</span>
                        </div>
                      ))}
                    </div>
                    {b["title"] && <p className="text-[14px] font-semibold">{b["title"]}</p>}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Testimonials */}
          {testimonials.length > 0 && (
            <section className="flex flex-col gap-8">
              <h2 className="text-[30px] font-semibold leading-[1.1] tracking-[-0.025em] sm:text-[42px]">Kind words</h2>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                {testimonials.map((t) => (
                  <blockquote key={t.id} className="flex flex-col justify-between gap-5 rounded-[22px] p-6" style={{ backgroundColor: CARD }}>
                    <p className="text-[15px] leading-[1.65]">“{t["quote"]}”</p>
                    <footer className="text-[13px] font-semibold">{t["name"]}</footer>
                  </blockquote>
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
              <h2 className="text-[30px] font-semibold leading-[1.1] tracking-[-0.025em] sm:text-[42px]">Questions</h2>
              <div className="flex flex-col md:col-span-2">
                {faqs.map((f) => (
                  <details key={f.id} className="group border-b border-black/10 py-4">
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-[16px] font-semibold [&::-webkit-details-marker]:hidden">
                      {f["question"]}
                      <span className="text-[20px] leading-none transition-transform duration-200 group-open:rotate-45" aria-hidden="true">+</span>
                    </summary>
                    <p className="mt-3 text-[14px] leading-[1.7]" style={{ color: MUTED }}>{f["answer"]}</p>
                  </details>
                ))}
              </div>
            </section>
          )}
        </main>

        {/* Contact */}
        <footer id="ts-contact" className="bg-[#111111] px-5 py-12 text-white sm:px-10 sm:py-16">
          <div className="grid grid-cols-1 gap-10 md:grid-cols-2 md:gap-14">
            <div className="flex flex-col gap-5">
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
            </div>
            {flag(data, "enquiryForm") && <EnquiryForm data={data} brand={footerBrand} />}
          </div>

          <div className="mt-12 grid grid-cols-2 gap-8 text-[13px] sm:grid-cols-3">
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
              {maps && <a href={maps} target="_blank" rel="noopener noreferrer" className="text-white/60 hover:text-white">Open in Maps</a>}
            </div>
            {socials.some(([, href]) => href) && (
              <div className="flex flex-col gap-2">
                <span className="font-semibold">Follow</span>
                {socials.filter(([, href]) => href).map(([label, href]) => (
                  <a key={label} href={href} target="_blank" rel="noopener noreferrer" className="text-white/60 hover:text-white">{label}</a>
                ))}
              </div>
            )}
          </div>

          <div className="mt-12 flex flex-col-reverse items-start justify-between gap-6 border-t border-white/10 pt-8 sm:flex-row sm:items-end">
            <span className="text-[12px] text-white/40">© {new Date().getFullYear()} {data.businessName}</span>
            <span className="break-words text-[36px] font-semibold leading-none tracking-[-0.04em] sm:text-right sm:text-[64px]">
              {data.businessName}
            </span>
          </div>
        </footer>
      </div>
    </div>
  );
}
