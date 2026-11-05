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
  MobileIcon,
  PencilIcon,
  PhoneIcon,
  SparkIcon,
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
    num: "01",
    title: "Tell us",
    label: "Your input",
    accent: "#FF5A3C",
    desc: "Share your business details, requirements and budget.",
  },
  {
    num: "02",
    title: "See it",
    label: "Your website",
    accent: "#6C63F0",
    desc: `Explore your personalised website preview${delivery ? `, ready ${delivery}` : ""}.`,
  },
  {
    num: "03",
    title: "Go live",
    label: "Your launch",
    accent: "#00C26E",
    desc: "Approve the design and get your website ready to launch.",
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

// ---------------------------------------------------------------------------------------
// The three miniature interfaces of the "details to live website" journey. Pure decoration
// (hidden from screen readers); each part fades up in turn once the section is on screen.
// ---------------------------------------------------------------------------------------
const miniShell =
  "w-full max-w-[200px] rounded-xl bg-white p-3 shadow-[0_10px_26px_rgba(40,30,0,0.10)] ring-1 ring-black/[0.04] transition-all duration-500 ease-out group-hover:-translate-y-1.5 group-hover:shadow-[0_18px_34px_rgba(40,30,0,0.14)]";

function rise(i: number) {
  return {
    initial: { opacity: 0, y: 8 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.5, ease: "easeOut", delay: 0.7 + i * 0.12 },
  };
}

function MiniForm() {
  const label = "mb-1 block text-[7px] font-bold uppercase tracking-[0.12em] text-[#8A8473]";
  const field = "flex h-[18px] items-center rounded-[5px] border border-[#E9E4D6] bg-[#FAF8F2] px-1.5";
  return (
    <div aria-hidden="true" className={miniShell}>
      <motion.div {...rise(0)} className="mb-2.5 flex items-center gap-1.5">
        <span className="h-4 w-4 rounded-full bg-[#FF5A3C]" />
        <span className="h-1.5 w-12 rounded-full bg-[#111111]/80" />
      </motion.div>
      <motion.div {...rise(1)} className="mb-2">
        <span className={label}>Business name</span>
        <div className={field}>
          <span className="h-1 w-14 rounded-full bg-[#111111]/70" />
          <span className="ml-0.5 h-2.5 w-px bg-[#FF5A3C]" />
        </div>
      </motion.div>
      <motion.div {...rise(2)} className="mb-2">
        <span className={label}>Industry</span>
        <div className={`${field} justify-between`}>
          <span className="h-1 w-10 rounded-full bg-[#111111]/60" />
          <span className="h-1.5 w-1.5 rotate-45 border-b border-r border-[#8A8473]" />
        </div>
      </motion.div>
      <motion.div {...rise(3)}>
        <span className={label}>Requirements</span>
        <div className="flex h-8 flex-col justify-center gap-1 rounded-[5px] border border-[#E9E4D6] bg-[#FAF8F2] px-1.5">
          <span className="h-1 w-full rounded-full bg-[#111111]/20" />
          <span className="h-1 w-3/5 rounded-full bg-[#111111]/20" />
        </div>
      </motion.div>
    </div>
  );
}

function MiniBrowser() {
  return (
    <div aria-hidden="true" className={`${miniShell} p-0`}>
      <div className="flex items-center gap-1 border-b border-[#EFEBDF] px-2.5 py-2">
        <span className="h-1.5 w-1.5 rounded-full bg-[#FF5A3C]" />
        <span className="h-1.5 w-1.5 rounded-full bg-[#FDB927]" />
        <span className="h-1.5 w-1.5 rounded-full bg-[#00C26E]" />
        <span className="ml-1.5 h-2.5 flex-1 rounded-full bg-[#F3EFE4]" />
      </div>
      <div className="p-2.5">
        <motion.div {...rise(0)} className="mb-2.5 flex items-center justify-between">
          <span className="h-2.5 w-2.5 rounded-[3px] bg-[#111111]" />
          <span className="flex items-center gap-1.5">
            <span className="h-1 w-3 rounded-full bg-[#111111]/30" />
            <span className="h-1 w-3 rounded-full bg-[#111111]/30" />
            <span className="h-2 w-5 rounded-full bg-[#111111]" />
          </span>
        </motion.div>
        <motion.div {...rise(1)} className="mb-2.5 flex items-center gap-2">
          <div className="flex-1">
            <span className="mb-1 block h-1.5 w-full rounded-full bg-[#111111]" />
            <span className="mb-1.5 block h-1.5 w-2/3 rounded-full bg-[#111111]" />
            <span className="mb-0.5 block h-1 w-full rounded-full bg-[#111111]/20" />
            <span className="mb-2 block h-1 w-4/5 rounded-full bg-[#111111]/20" />
            <span className="block h-2.5 w-9 rounded-full bg-[#6C63F0]" />
          </div>
          <div className="relative h-[52px] w-[58px] shrink-0 overflow-hidden rounded-lg bg-[#EDEAE2]">
            <span className="absolute -bottom-3 -left-2 h-8 w-8 rounded-full bg-[#FDB927]" />
            <span className="absolute -right-2 top-1 h-7 w-7 rounded-full bg-[#00C26E]/80" />
          </div>
        </motion.div>
        <motion.div {...rise(2)} className="grid grid-cols-3 gap-1.5">
          {[0, 1, 2].map((n) => (
            <div key={n}>
              <span className="mb-1 block h-5 rounded-[4px] bg-[#F3EFE4]" />
              <span className="block h-1 w-4/5 rounded-full bg-[#111111]/20" />
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}

function MiniLaunch() {
  return (
    <div aria-hidden="true" className={`${miniShell} relative text-center`}>
      <span className="absolute right-3 top-3 h-1.5 w-1.5 rounded-full bg-[#FDB927]" />
      <span className="absolute left-3 top-6 h-1.5 w-1.5 rotate-45 bg-[#6C63F0]" />
      <span className="absolute bottom-[52px] right-4 h-1 w-1 rounded-full bg-[#FF5A3C]" />
      <motion.div
        initial={{ opacity: 0, scale: 0.6 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ type: "spring", stiffness: 260, damping: 16, delay: 0.9 }}
        className="mx-auto mb-2 mt-1 flex h-9 w-9 items-center justify-center rounded-full bg-[#00C26E]/15 text-[#00A85C] ring-1 ring-[#00C26E]/30"
      >
        <CheckIcon className="h-[18px] w-[18px]" />
      </motion.div>
      <motion.div {...rise(1)}>
        <p className="text-[10px] font-bold leading-none">Design approved</p>
        <span className="mx-auto mt-1.5 block h-1 w-16 rounded-full bg-[#111111]/20" />
        <span className="mx-auto mt-1 block h-1 w-11 rounded-full bg-[#111111]/20" />
      </motion.div>
      <motion.div
        {...rise(2)}
        className="mt-3 flex items-center justify-center gap-1.5 rounded-full bg-[#111111] py-1.5 text-[8px] font-bold uppercase tracking-[0.14em] text-white"
      >
        Go live
        <ArrowRightIcon className="h-2.5 w-2.5" />
      </motion.div>
    </div>
  );
}

const miniatures = [MiniForm, MiniBrowser, MiniLaunch];

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
          <div className="relative isolate mx-auto grid w-full max-w-7xl grid-cols-1 items-center gap-10 overflow-hidden rounded-[36px] bg-[radial-gradient(ellipse_at_72%_45%,#FDFBF5_0%,#F6F2E8_48%,#ECE7DA_100%)] px-6 py-16 sm:px-12 sm:py-20 lg:gap-12 lg:px-16 lg:py-24 xl:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
            {/* Very faint paper grain over the warm gradient */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 -z-10 opacity-[0.07]"
              style={{
                backgroundImage:
                  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 0 .25 0 0 0 0 .2 0 0 0 0 .1 0 0 0 1.4 -.2'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
              }}
            />

            <div className="relative z-10">
              <h2 className={`${sectionTitle} max-w-3xl`}>
                From your details to <span className={`${accent} whitespace-nowrap`}>a live website.</span>
              </h2>

              {/* One continuous journey: a thin line runs through three stages, left to right
                  (top to bottom on a phone) */}
              <ol className="mt-12 grid grid-cols-1 gap-x-8 md:mt-14 md:grid-cols-3">
                {steps.map((step, index) => {
                  const Mini = miniatures[index] ?? MiniForm;
                  const last = index === steps.length - 1;
                  const lineDelay = 0.25 + index * 0.55;
                  return (
                    <li key={step.title} className="group relative pb-12 pl-10 last:pb-0 md:pb-0 md:pl-0">
                      {/* Phone: the line runs down the left edge */}
                      {!last && (
                        <motion.div
                          aria-hidden="true"
                          initial={{ scaleY: 0 }}
                          whileInView={{ scaleY: 1 }}
                          viewport={{ once: true }}
                          transition={{ duration: 0.55, ease: "easeInOut", delay: lineDelay }}
                          style={{ transformOrigin: "top" }}
                          className="absolute bottom-0 left-[6px] top-[34px] w-px bg-[#111111]/20 md:hidden"
                        />
                      )}
                      <motion.div
                        initial={{ opacity: 0, y: 18 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, ease: "easeOut", delay: index * 0.18 }}
                      >
                        <p className="text-[56px] font-extrabold leading-none tracking-[-0.06em] transition-transform duration-500 group-hover:-translate-y-0.5 lg:text-[68px]">
                          {step.num}
                        </p>

                        {/* The marker sits on the line */}
                        <div className="relative mt-5 hidden h-4 md:block">
                          <motion.div
                            aria-hidden="true"
                            initial={{ scale: 0 }}
                            whileInView={{ scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ type: "spring", stiffness: 300, damping: 18, delay: lineDelay - 0.1 }}
                            className="absolute left-0 top-0 h-4 w-4 rounded-full border-2 bg-[#FCF9F2] transition-transform duration-300 group-hover:scale-125"
                            style={{ borderColor: step.accent }}
                          />
                          <motion.div
                            aria-hidden="true"
                            initial={{ scaleX: 0 }}
                            whileInView={{ scaleX: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.55, ease: "easeInOut", delay: lineDelay }}
                            style={{
                              transformOrigin: "left",
                              background: last
                                ? "linear-gradient(to right, rgba(17,17,17,0.2), rgba(17,17,17,0))"
                                : "rgba(17,17,17,0.2)",
                            }}
                            className={`absolute left-4 top-[7px] h-px ${last ? "right-0" : "-right-8"}`}
                          />
                        </div>
                      </motion.div>

                      {/* Phone: the marker beside the number */}
                      <motion.div
                        aria-hidden="true"
                        initial={{ scale: 0 }}
                        whileInView={{ scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ type: "spring", stiffness: 300, damping: 18, delay: lineDelay - 0.1 }}
                        className="absolute left-0 top-[26px] h-[14px] w-[14px] rounded-full border-2 bg-[#FCF9F2] md:hidden"
                        style={{ borderColor: step.accent }}
                      />

                      <p className="mb-3 mt-6 flex items-center gap-2 text-[10.5px] font-bold uppercase tracking-[0.16em] text-[#6B6657]">
                        <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: step.accent }} />
                        {step.label}
                      </p>
                      <div className="flex items-start md:h-[188px]">
                        <Mini />
                      </div>

                      <h3 className="mt-6 text-[24px] font-extrabold leading-[1.1] tracking-[-0.025em]">{step.title}</h3>
                      <p className="mt-2 max-w-[240px] text-[14.5px] font-medium leading-[1.55] text-[#4A463C]">{step.desc}</p>
                    </li>
                  );
                })}
              </ol>
            </div>

            {/* The laptop stage: a few quiet shapes behind, the laptop, three small cards around it */}
            <div className="relative">
              <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-0">
                <Shape kind="half" color={GREEN} className="-right-6 top-[4%] h-24 w-24 rotate-[20deg] sm:h-32 sm:w-32" />
                <Shape kind="tri" color={YELLOW} className="-bottom-4 right-[2%] h-20 w-20 rotate-[90deg] sm:h-28 sm:w-28" />
                <Shape kind="quarter" color={BLUE} className="left-[2%] top-[2%] h-14 w-14 rotate-[200deg] sm:h-20 sm:w-20" />
                <Shape kind="dot" color={RED} className="bottom-[8%] left-[6%] h-7 w-7 sm:h-9 sm:w-9" />
              </div>

              <motion.div
                initial={{ opacity: 0, y: 28, scale: 0.96 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="relative z-10"
              >
                {/* Soft contact shadow under the laptop for depth */}
                <div
                  aria-hidden="true"
                  className="absolute inset-x-[2%] bottom-[0%] h-[14%] rounded-[50%] bg-[#2A2210]/15 blur-3xl"
                />
                <div
                  aria-hidden="true"
                  className="absolute inset-x-[12%] bottom-[4%] h-[7%] rounded-[50%] bg-[#2A2210]/35 blur-xl"
                />
                <img
                  src="/macbook-mockup.webp"
                  alt="A website made for a business, shown on a laptop"
                  width={1134}
                  height={1075}
                  loading="lazy"
                  decoding="async"
                  className="relative mx-auto h-auto w-full max-w-[600px] select-none xl:max-w-none xl:scale-[1.12]"
                />
              </motion.div>

              {[
                { icon: EyeIcon, title: "Preview ready", sub: "Made with your details", pos: "left-0 -top-6 sm:top-[-2%] sm:-left-6", delay: 0.35 },
                { icon: MobileIcon, title: "Mobile responsive", sub: "Phone, tablet, desktop", pos: "bottom-[-6%] right-0 sm:bottom-auto sm:top-[44%] sm:-right-2", delay: 0.5 },
                { icon: SparkIcon, title: "Customised for your business", sub: "", pos: "bottom-[2%] left-[4%] hidden sm:flex", delay: 0.65 },
              ].map((c) => (
                <motion.div
                  key={c.title}
                  initial={{ opacity: 0, y: 14 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, ease: "easeOut", delay: c.delay }}
                  className={`absolute z-20 flex max-w-[210px] items-center gap-2.5 rounded-2xl bg-white p-2.5 pr-3.5 shadow-[0_10px_28px_rgba(40,30,0,0.12)] ring-1 ring-black/[0.05] ${c.pos}`}
                >
                  <IconBadge icon={c.icon} size="sm" />
                  <div className="min-w-0">
                    <p className="text-[12.5px] font-bold leading-tight sm:text-[13px]">{c.title}</p>
                    {c.sub && <p className="mt-0.5 hidden text-[11px] font-medium sm:block leading-tight text-[#6B6657]">{c.sub}</p>}
                  </div>
                </motion.div>
              ))}
            </div>
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
