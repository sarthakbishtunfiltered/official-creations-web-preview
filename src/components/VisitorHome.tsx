import { useEffect, useState } from "react";
import type { MouseEvent } from "react";
import { motion } from "framer-motion";
import {
  ArrowRightIcon,
  CheckIcon,
  ChevronDownIcon,
  DevicesIcon,
  EyeIcon,
  IconBadge,
  LayoutIcon,
  PencilIcon,
  PhoneIcon,
  RocketIcon,
} from "./icons";
import { siteConfig } from "../config";
import { proof } from "../data/proof";
import { supabase } from "../lib/supabase";
import type { TeamAccess } from "../lib/useTeamAccess";
import type { LeadKind } from "../lib/leads";
import { LeadForm } from "./LeadForm";
import { niches } from "../data/niches";

const whatsappDigits = siteConfig.whatsappNumber.replace(/\D/g, "");

// Four copies so the row loops seamlessly (the animation moves exactly half the track).
const marqueeItems = [...niches, ...niches, ...niches, ...niches];

// The tabs of the sliding navigation capsule. Only sections that are on the page get a tab.
const navLinks = [
  { id: "home", label: "Home" },
  ...(proof.samples.length > 0 ? [{ id: "samples", label: "Our work" }] : []),
  { id: "how-it-works", label: "How it works" },
  ...(proof.packages.length > 0 ? [{ id: "packages", label: "Pricing" }] : []),
  { id: "niches", label: "Industries" },
  ...(proof.testimonials.length > 0 ? [{ id: "clients", label: "Clients" }] : []),
  { id: "faq", label: "Questions" },
];

// A capsule with every tab in it. A dark pill slides to the tab you are on (or just clicked).
function NavCapsule({
  active,
  onPick,
  name,
  className,
}: {
  active: string;
  onPick: (id: string) => void;
  name: string;
  className: string;
}) {
  return (
    <nav
      aria-label="Page sections"
      className={`items-center gap-0.5 rounded-full border border-black/[0.06] bg-white/75 p-1 shadow-[0_6px_24px_rgba(40,30,0,0.08)] backdrop-blur-xl ${className}`}
    >
      {navLinks.map((link) => {
        const on = link.id === active;
        return (
          <a
            key={link.id}
            href={`#${link.id}`}
            aria-current={on ? "true" : undefined}
            onClick={(e: MouseEvent<HTMLAnchorElement>) => {
              e.preventDefault();
              onPick(link.id);
            }}
            className={`relative shrink-0 whitespace-nowrap rounded-full px-3.5 py-2 text-[14px] font-semibold transition-colors duration-200 sm:px-4 ${
              on ? "text-white" : "text-[#4A463C] hover:text-[#111111]"
            }`}
          >
            {on && (
              <motion.div
                layoutId={`nav-pill-${name}`}
                aria-hidden="true"
                className="absolute inset-0 rounded-full bg-[#111111]"
                transition={{ type: "spring", stiffness: 420, damping: 34 }}
              />
            )}
            <span className="relative">{link.label}</span>
          </a>
        );
      })}
    </nav>
  );
}

const delivery = proof.deliveryTime.trim();

const steps = [
  {
    icon: PencilIcon,
    title: "Tell us about your business",
    desc: "Send your business name, what you do, your city and your budget. The form takes about two minutes.",
  },
  {
    icon: EyeIcon,
    title: "See your website",
    desc: `Our team makes a website with your name and details already on it${
      delivery ? `, ${delivery}` : ""
    }, and shows you the finished result.`,
  },
  {
    icon: RocketIcon,
    title: "Take it live",
    desc: "Like it? We get it ready to go live. Want changes? Tell us and we update it.",
  },
];

const questions = [
  {
    q: "What is a sample?",
    a: "A website made with your business name and details, so you can see how it would look before you decide. It is your own website, not a generic example.",
  },
  {
    q: "What happens after I send the form?",
    a: "Our team gets your details and contacts you on the phone number you gave. If you asked for a sample, we show it to you when it is ready.",
  },
  ...(delivery
    ? [{ q: "How long does it take?", a: `We make your website ${delivery}. We confirm the exact time when we contact you.` }]
    : []),
  {
    q: "What if I already know I want a website?",
    a: "Choose “Place an order” in the form. Your details go to our team, and we contact you to confirm everything before anything starts.",
  },
  {
    q: "Can the website be changed?",
    a: "Yes. Tell us what you want different, such as the photos, the words or the colours, and we update it.",
  },
];

const RED = "#FF5A3C";
const YELLOW = "#FDB927";
const GREEN = "#00C26E";
const BLUE = "#6C63F0";

const features = [
  { icon: LayoutIcon, title: "Made for your industry", desc: "Templates built for your niche and its customers." },
  { icon: PhoneIcon, title: "Built for enquiries", desc: "Call and WhatsApp buttons are part of every site." },
  { icon: DevicesIcon, title: "Fully responsive", desc: "Looks right on phones, tablets and desktops." },
  { icon: PencilIcon, title: "Easy changes", desc: "Tell us what to change and we update your site." },
];

// Chalky edges: a slightly wobbly outline and a few speckles, like the shapes were drawn with chalk.
function ChalkFilter() {
  return (
    <svg width="0" height="0" aria-hidden="true" className="absolute">
      <defs>
        <filter id="chalk" x="-5%" y="-5%" width="110%" height="110%">
          <feTurbulence type="fractalNoise" baseFrequency="0.03" numOctaves="2" seed="3" result="wobble" />
          <feDisplacementMap in="SourceGraphic" in2="wobble" scale="5" result="rough" />
          <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed="8" result="grain" />
          <feColorMatrix
            in="grain"
            type="matrix"
            values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  -6 0 0 0 4.9"
            result="holes"
          />
          <feComposite in="rough" in2="holes" operator="in" />
        </filter>
      </defs>
    </svg>
  );
}

// Flat colour shapes, the page's signature decoration. They are decoration only.
function Shape({ kind, color, className }: { kind: "half" | "tri" | "dot" | "quarter"; color: string; className: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 100 100" style={{ filter: "url(#chalk)" }} className={`pointer-events-none absolute z-0 ${className}`}>
      {kind === "half" && <path d="M0 100 A100 100 0 0 1 100 0 Z" fill={color} />}
      {kind === "tri" && <path d="M0 0 L100 0 L0 100 Z" fill={color} />}
      {kind === "dot" && <circle cx="50" cy="50" r="50" fill={color} />}
      {kind === "quarter" && <path d="M0 100 L0 0 A100 100 0 0 1 100 100 Z" fill={color} />}
    </svg>
  );
}

// The two groups of shapes that frame the top of the page, one on each edge.
function ShapesLeft({ className }: { className: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 316 560" style={{ filter: "url(#chalk)" }} className={`pointer-events-none absolute z-0 ${className}`}>
      <polygon points="0,20 65,20 62,170 0,105" fill={RED} />
      <polygon points="0,185 104,290 0,400" fill={YELLOW} />
      <path d="M92 190 L172 262 A54 54 0 0 0 92 190 Z" fill={BLUE} />
      <path d="M130 497 L293 326 A118 118 0 0 0 130 497 Z" fill={GREEN} />
      <circle cx="53" cy="487" r="30" fill={RED} />
    </svg>
  );
}

function ShapesRight({ className }: { className: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 250 440" style={{ filter: "url(#chalk)" }} className={`pointer-events-none absolute z-0 ${className}`}>
      <polygon points="188,50 250,0 250,50" fill={BLUE} />
      <path d="M127 88 H250 A61 61 0 0 1 127 88 Z" fill={RED} />
      <polygon points="0,200 195,200 195,395" fill={YELLOW} />
      <circle cx="245" cy="372" r="30" fill={BLUE} />
      <polygon points="230,300 250,285 250,325" fill={GREEN} />
    </svg>
  );
}

const sectionTitle = "text-[38px] font-extrabold leading-[1.05] tracking-[-0.035em] sm:text-[52px] lg:text-[60px]";
const accent = "font-serif font-normal italic tracking-normal";
const card = "rounded-[28px] bg-white shadow-[0_8px_30px_rgba(40,30,0,0.06)]";
const blackBtn =
  "inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#111111] px-7 py-3.5 text-[16px] font-semibold text-white transition-colors duration-200 hover:bg-black";
const outlineBtn =
  "inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-[#111111] px-7 py-3.5 text-[16px] font-semibold text-[#111111] transition-colors duration-200 hover:bg-[#111111] hover:text-white";

// What the public sees at the homepage: the pitch with the request form beside it, then the
// proof from src/data/proof.ts. Team members see the generator instead (see Home.tsx).
export function VisitorHome({ access }: { access: Exclude<TeamAccess, { status: "approved" | "checking" }> }) {
  const [kind, setKind] = useState<LeadKind>("sample");
  const [packageName, setPackageName] = useState<string | null>(null);
  // On a phone a bar with the main button stays at the bottom until the form itself is on screen.
  const [formInView, setFormInView] = useState(false);

  useEffect(() => {
    const target = document.getElementById("start");
    if (!target || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(([entry]) => setFormInView(Boolean(entry?.isIntersecting)), {
      threshold: 0.05,
    });
    observer.observe(target);
    return () => observer.disconnect();
  }, []);

  // Which tab is lit: the last section whose top has passed just under the header.
  const [activeTab, setActiveTab] = useState("home");
  useEffect(() => {
    let frame = 0;
    function update() {
      frame = 0;
      let current = navLinks[0]?.id ?? "home";
      for (const link of navLinks) {
        const el = document.getElementById(link.id);
        if (el && el.getBoundingClientRect().top <= 140) current = link.id;
      }
      // At the very bottom of the page the last tab wins, even if its section is short.
      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4) {
        current = navLinks[navLinks.length - 1]?.id ?? current;
      }
      setActiveTab(current);
    }
    function onScroll() {
      if (!frame) frame = requestAnimationFrame(update);
    }
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  function goToTab(id: string) {
    setActiveTab(id);
    if (id === "home") {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function goToForm(next: LeadKind, chosenPackage: string | null = null) {
    setKind(next);
    setPackageName(chosenPackage);
    document.getElementById("start")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  async function signOut() {
    await supabase.auth.signOut();
    window.location.reload();
  }

  const quietLink =
    "cursor-pointer text-[14px] font-semibold text-[#6B6657] underline-offset-4 transition-colors duration-200 hover:text-[#111111] hover:underline";


  return (
    <div className="flex min-h-screen flex-col overflow-x-clip bg-[#FCF9F2] pb-20 font-[Manrope,Inter,sans-serif] text-[#111111] md:pb-0">
      <ChalkFilter />

      <header className="sticky top-0 z-40 bg-[#FCF9F2]/90 backdrop-blur-md">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-3 px-6 py-4 sm:px-12 lg:px-16">
          <div className="flex items-center gap-2.5">
            <img src="/OC_Black-removebg-preview.png" alt="" width={36} height={36} className="h-9 w-9 object-contain" />
            <span className="text-[18px] font-extrabold tracking-tight">Official Creations</span>
          </div>

          <NavCapsule active={activeTab} onPick={goToTab} name="wide" className="hidden md:flex" />

          <div className="flex items-center gap-3 sm:gap-5">
            {access.status === "denied" ? (
              <button type="button" onClick={() => void signOut()} className={quietLink}>
                Sign out
              </button>
            ) : (
              <a href="/login" className={quietLink}>
                Team login
              </a>
            )}
            {whatsappDigits && (
              <a
                href={`https://wa.me/${whatsappDigits}`}
                target="_blank"
                rel="noopener noreferrer"
                className="hidden items-center gap-2 text-[14px] font-semibold md:inline-flex"
              >
                <PhoneIcon className="h-4 w-4" />
                Chat with us
              </a>
            )}
            <button
              type="button"
              onClick={() => goToForm("sample", packageName)}
              className="hidden cursor-pointer rounded-xl bg-[#111111] px-5 py-2.5 text-[15px] font-semibold text-white transition-colors hover:bg-black sm:inline-flex"
            >
              Get started
            </button>
          </div>
        </div>

        {/* On phones the same capsule sits in its own row and scrolls sideways */}
        <div className="overflow-x-auto px-4 pb-3 md:hidden [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <NavCapsule active={activeTab} onPick={goToTab} name="narrow" className="flex w-max" />
        </div>
      </header>

      <main>
        {/* Big centred headline between the two shape groups, with the request form right below it */}
        <section id="home" className="relative">
          <ShapesLeft className="-left-6 top-6 hidden h-[420px] w-[236px] lg:block xl:left-0 xl:h-[500px] xl:w-[282px]" />
          <ShapesRight className="-right-4 top-4 hidden h-[330px] w-[188px] lg:block xl:right-0 xl:h-[400px] xl:w-[227px]" />

          <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-col items-center px-6 pb-16 pt-8 text-center sm:px-12 lg:px-16 lg:pb-24 lg:pt-10">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: "easeOut" }}
              className="flex flex-col items-center"
            >
              <h1 className="text-[48px] font-extrabold leading-[1.0] tracking-[-0.045em] sm:text-[68px] lg:text-[80px]">
                Your website,
                <span className={`block ${accent}`}>already made.</span>
              </h1>

              <p className="mt-6 max-w-[520px] text-[19px] font-medium leading-[1.5] text-[#4A463C]">
                Tell us about your business. We build a website with your name on it, so you can see it before you decide.
              </p>

              <div className="mt-8 flex flex-wrap justify-center gap-3">
                <button type="button" onClick={() => goToForm("sample")} className={blackBtn}>
                  Request a sample
                  <ArrowRightIcon className="h-4 w-4" />
                </button>
                <a href="#how-it-works" className={outlineBtn}>
                  How it works
                </a>
              </div>

              <ul className="mt-8 flex flex-wrap justify-center gap-x-7 gap-y-2 text-[14px] font-semibold">
                {[
                  "Your details go straight to our team",
                  "We contact you on the number you give",
                  "Sending the form does not start an order",
                ].map((line) => (
                  <li key={line} className="flex items-center gap-2">
                    <span className="flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full bg-[#111111] text-white">
                      <CheckIcon className="h-3 w-3" />
                    </span>
                    {line}
                  </li>
                ))}
              </ul>

              {delivery && (
                <p className="mt-5 rounded-xl bg-[#FDB927] px-4 py-3 text-[14px] font-bold">We make your website {delivery}.</p>
              )}
            </motion.div>

            <motion.div
              id="start"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: "easeOut", delay: 0.1 }}
              className="mt-12 w-full max-w-[760px] scroll-mt-24 text-left"
            >
              <div className="rounded-[36px] bg-[#EDEAE2] p-3 sm:p-5">
                <LeadForm
                  kind={kind}
                  onKindChange={setKind}
                  packageName={packageName}
                  onClearPackage={() => setPackageName(null)}
                />
              </div>
            </motion.div>
          </div>
        </section>

        {/* Websites already made */}
        {proof.samples.length > 0 && (
          <section id="samples" className="scroll-mt-32 md:scroll-mt-24">
            <div className="mx-auto w-full max-w-7xl px-6 py-16 sm:px-12 sm:py-20 lg:px-16 lg:py-24">
              <h2 className={sectionTitle}>
                Websites we have <span className={accent}>made.</span>
              </h2>

              <ul className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {proof.samples.map((sample) => {
                  const inner = (
                    <div className="rounded-[28px] bg-[#EDEAE2] p-3">
                      <img
                        src={sample.image}
                        alt={`Website made for ${sample.title}`}
                        loading="lazy"
                        decoding="async"
                        className="aspect-[4/3] w-full rounded-[20px] bg-white object-cover object-top"
                      />
                      <p className="mt-4 px-2 text-[18px] font-extrabold">{sample.title}</p>
                      <p className="px-2 pb-2 text-[14px] font-medium text-[#6B6657]">{sample.niche}</p>
                    </div>
                  );
                  return (
                    <li key={sample.title}>
                      {sample.href ? (
                        <a
                          href={sample.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block transition-transform duration-300 hover:-translate-y-1"
                        >
                          {inner}
                        </a>
                      ) : (
                        inner
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          </section>
        )}

        {/* How it works: the steps really are in order */}
        <section id="how-it-works" className="scroll-mt-32 px-3 sm:px-6 md:scroll-mt-24">
          <div className="relative mx-auto grid w-full max-w-7xl grid-cols-1 items-center gap-10 overflow-hidden rounded-[36px] bg-[#EDEAE2] px-6 py-16 sm:px-12 sm:py-20 lg:grid-cols-12 lg:gap-12 lg:px-16 lg:py-24">
            <div className="lg:col-span-6">
              <h2 className={sectionTitle}>
                From your details to <span className={accent}>a live website.</span>
              </h2>

              <ol className="mt-10 flex flex-col gap-4">
                {steps.map((step, index) => (
                  <li key={step.title} className={`${card} flex items-start gap-5 p-6`}>
                    <IconBadge icon={step.icon} size="lg" />
                    <div>
                      <p className="mb-1 text-[12px] font-bold uppercase tracking-[0.14em] text-[#6B6657]">Step {index + 1}</p>
                      <h3 className="mb-1.5 text-[20px] font-extrabold leading-[1.15] tracking-[-0.02em]">{step.title}</h3>
                      <p className="text-[15px] font-medium leading-[1.6] text-[#4A463C]">{step.desc}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, ease: "easeOut" }}
              className="lg:col-span-6"
            >
              <img
                src="/macbook-mockup.webp"
                alt="A website made for a business, shown on a laptop"
                width={1134}
                height={1075}
                loading="lazy"
                decoding="async"
                className="mx-auto h-auto w-full max-w-[560px] select-none drop-shadow-[0_30px_40px_rgba(40,30,0,0.18)] lg:max-w-none"
              />
            </motion.div>
          </div>
        </section>

        {/* Prices */}
        {proof.packages.length > 0 && (
          <section id="packages" className="scroll-mt-32 md:scroll-mt-24">
            <div className="mx-auto w-full max-w-7xl px-6 py-16 sm:px-12 sm:py-20 lg:px-16 lg:py-24">
              <h2 className={sectionTitle}>
                What it <span className={accent}>costs.</span>
              </h2>

              <ul className="mt-12 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
                {proof.packages.map((pack) => (
                  <li key={pack.name} className={`${card} flex flex-col p-7`}>
                    <h3 className="text-[20px] font-extrabold">{pack.name}</h3>
                    <p className="mt-1 text-[40px] font-extrabold tracking-[-0.03em]">{pack.price}</p>
                    <ul className="mt-5 flex flex-1 flex-col gap-2.5 text-[15px] font-medium leading-[1.5] text-[#4A463C]">
                      {pack.points.map((point) => (
                        <li key={point} className="flex items-start gap-2.5">
                          <CheckIcon className="mt-0.5 h-4 w-4 shrink-0 text-[#111111]" />
                          {point}
                        </li>
                      ))}
                    </ul>
                    <button type="button" onClick={() => goToForm("order", pack.name)} className={`${blackBtn} mt-7`}>
                      Choose {pack.name}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        )}

        {/* Which businesses it is for */}
        <section id="niches" className="scroll-mt-32 md:scroll-mt-24">
          <div className="mx-auto w-full max-w-7xl px-6 pt-16 sm:px-12 sm:pt-20 lg:px-16 lg:pt-24">
            <h2 className={`${sectionTitle} max-w-3xl`}>
              A website for <span className={accent}>every industry.</span>
            </h2>
            <p className="mt-5 max-w-xl text-[18px] font-medium leading-[1.5] text-[#4A463C]">
              Pick your industry in the form and we'll build a website made for it.
            </p>

          </div>

          {/* Screen readers get the list once; the moving line below is decoration */}
          <ul className="sr-only">
            {niches.map((niche) => (
              <li key={niche.id}>{niche.label}</li>
            ))}
          </ul>

          <div
            aria-hidden="true"
            className="my-2 w-full overflow-hidden"
            style={{
              maskImage: "linear-gradient(to right, transparent 0%, black 12%, black 88%, transparent 100%)",
              WebkitMaskImage: "linear-gradient(to right, transparent 0%, black 12%, black 88%, transparent 100%)",
            }}
          >
            <div className="animate-marquee flex items-center py-3">
              {marqueeItems.map((niche, idx) => {
                const Icon = niche.icon;
                return (
                  <div key={`${niche.id}-${idx}`} className="flex shrink-0 cursor-default select-none items-center gap-3.5 pr-20">
                    <IconBadge icon={Icon} size="md" />
                    <span className="whitespace-nowrap text-[19px] font-bold tracking-[-0.01em] sm:text-[22px]">{niche.label}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mx-auto w-full max-w-7xl px-6 pb-16 sm:px-12 sm:pb-20 lg:px-16 lg:pb-24">
            <ul className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {features.map((f) => (
                <li key={f.title} className="rounded-[24px] bg-[#EDEAE2] p-6">
                  <IconBadge icon={f.icon} size="md" className="mb-5" />
                  <h3 className="text-[17px] font-extrabold tracking-[-0.01em]">{f.title}</h3>
                  <p className="mt-2 text-[14px] font-medium leading-[1.55] text-[#4A463C]">{f.desc}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* What clients say */}
        {proof.testimonials.length > 0 && (
          <section id="clients" className="scroll-mt-32 md:scroll-mt-24">
            <div className="mx-auto w-full max-w-7xl px-6 py-16 sm:px-12 sm:py-20 lg:px-16 lg:py-24">
              <h2 className={sectionTitle}>
                What our clients <span className={accent}>say.</span>
              </h2>

              <ul className="mt-12 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
                {proof.testimonials.map((item) => (
                  <li key={item.name + item.business} className={`${card} flex flex-col p-7`}>
                    <blockquote className="flex-1 text-[19px] font-semibold leading-[1.5] tracking-[-0.01em]">“{item.quote}”</blockquote>
                    <div className="mt-7 flex items-center gap-3">
                      <span
                        aria-hidden="true"
                        className="flex h-11 w-11 items-center justify-center rounded-full bg-[#111111] text-[16px] font-bold text-white"
                      >
                        {item.name.trim().charAt(0).toUpperCase()}
                      </span>
                      <div>
                        <p className="text-[15px] font-bold">{item.name}</p>
                        <p className="text-[14px] font-medium text-[#6B6657]">{item.business}</p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        )}

        {/* Questions */}
        <section id="faq" className="scroll-mt-32 md:scroll-mt-24">
          <div className="mx-auto grid w-full max-w-7xl grid-cols-1 gap-10 px-6 py-16 sm:px-12 lg:grid-cols-12 lg:gap-16 lg:px-16 lg:py-24">
            <h2 className={`${sectionTitle} lg:col-span-5`}>
              Common <span className={accent}>questions.</span>
            </h2>

            <div className="flex flex-col gap-3 lg:col-span-7">
              {questions.map((item) => (
                <details key={item.q} className="group rounded-[20px] bg-white shadow-[0_4px_16px_rgba(40,30,0,0.04)]">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 rounded-[20px] px-6 py-5 text-[17px] font-bold [&::-webkit-details-marker]:hidden">
                    {item.q}
                    <ChevronDownIcon
                      className="h-5 w-5 shrink-0 text-[#6B6657] transition-transform duration-200 group-open:rotate-180"
                      aria-hidden="true"
                    />
                  </summary>
                  <p className="px-6 pb-6 text-[15px] font-medium leading-[1.65] text-[#4A463C]">{item.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* Closing call to action */}
        <section className="px-3 pb-6 sm:px-6">
          <div className="relative mx-auto w-full max-w-7xl overflow-hidden rounded-[36px] bg-[#111111] px-6 py-16 text-center text-white sm:py-20">
            <Shape kind="half" color={GREEN} className="-left-8 bottom-0 h-32 w-32 rotate-[10deg]" />
            <Shape kind="tri" color={YELLOW} className="-right-6 top-0 h-32 w-32 rotate-[90deg]" />
            <Shape kind="dot" color={RED} className="right-[18%] bottom-8 hidden h-9 w-9 sm:block" />
            <h2 className="relative mx-auto max-w-3xl text-[38px] font-extrabold leading-[1.05] tracking-[-0.035em] sm:text-[56px]">
              See your website <span className={`${accent} text-[#FDB927]`}>before you decide.</span>
            </h2>
            <button
              type="button"
              onClick={() => goToForm("sample")}
              className="relative mt-9 inline-flex cursor-pointer items-center gap-2 rounded-xl bg-white px-8 py-4 text-[16px] font-semibold text-[#111111] transition-colors hover:bg-[#FDB927]"
            >
              Request a sample
              <ArrowRightIcon className="h-4 w-4" />
            </button>
          </div>
        </section>
      </main>

      <footer className="mt-auto">
        <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center justify-between gap-3 px-6 py-6 text-[14px] font-medium text-[#6B6657] sm:px-12 lg:px-16">
          <span>© {new Date().getFullYear()} Official Creations</span>
          <a href="/login" className={quietLink}>
            Team login
          </a>
        </div>
      </footer>

      {/* Phone only: the main button stays in reach until the form is on screen */}
      {!formInView && (
        <div className="fixed inset-x-0 bottom-0 z-40 bg-[#FCF9F2]/95 px-4 py-3 shadow-[0_-8px_24px_rgba(40,30,0,0.08)] backdrop-blur-md md:hidden">
          <button
            type="button"
            onClick={() => goToForm("sample", packageName)}
            className="flex w-full cursor-pointer items-center justify-center rounded-xl bg-[#111111] py-3.5 text-[15px] font-semibold text-white"
          >
            <span className="mr-2.5 h-2.5 w-2.5 shrink-0 rounded-full bg-[#FDB927]" />
            Request a sample
          </button>
        </div>
      )}
    </div>
  );
}
