import { useEffect, useState } from "react";
import type { CSSProperties, MouseEvent, ReactNode } from "react";
import { MotionConfig, motion } from "framer-motion";
import { BookCallModal } from "./BookCallModal";
import {
  ArrowRightIcon,
  CheckIcon,
  DevicesIcon,
  EyeIcon,
  IconBadge,
  ClinicIcon,
  InteriorIcon,
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
            className={`relative shrink-0 whitespace-nowrap rounded-full px-2.5 py-2 text-[13px] font-semibold transition-colors duration-200 max-md:flex-1 max-md:text-center sm:px-4 sm:text-[14px] ${
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
  { icon: LayoutIcon, title: "Made for your industry", accent: "industry", desc: "Templates built for your niche and its customers." },
  { icon: PhoneIcon, title: "Built for enquiries", accent: "enquiries", desc: "Call and WhatsApp buttons are part of every site." },
  { icon: DevicesIcon, title: "Fully responsive", accent: "responsive", desc: "Looks right on phones, tablets and desktops." },
  { icon: PencilIcon, title: "Easy changes", accent: "changes", desc: "Tell us what to change and we update your site." },
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

const sectionTitle = "font-display text-[32px] font-extrabold leading-[1.06] tracking-[-0.032em] sm:text-[44px] lg:text-[54px]";
const accent = "font-serif font-normal italic tracking-normal";
const card = "rounded-[28px] bg-white shadow-[0_8px_30px_rgba(40,30,0,0.06)]";
const blackBtn =
  "inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#111111] px-7 py-3.5 text-[16px] font-semibold text-white transition-colors duration-200 hover:bg-black";
const outlineBtn =
  "inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-[#111111] px-7 py-3.5 text-[16px] font-semibold text-[#111111] transition-colors duration-200 hover:bg-[#111111] hover:text-white";

// ---------------------------------------------------------------------------------------
// Industries: a floating selector and an asymmetric bento grid. Clicking an industry only
// highlights it; nothing else on the page reacts to it.
// ---------------------------------------------------------------------------------------
const LAVENDER = "#E6E1F8";
const MINT = "#D9F0E4";
const BUTTER = "#FAEFC4";
const ROSE = "#F8DDE2";
const PEACH = "#FBE3D3";
const SKY = "#DAE9F6";
const pastels = [LAVENDER, MINT, BUTTER, ROSE, PEACH, SKY];

// A small, different movement for each icon on hover.
const iconMove: Record<string, string> = {
  "interior-designers": "group-hover:-translate-y-0.5 group-hover:-rotate-6",
  photographers: "group-hover:scale-110 group-hover:rotate-[-8deg]",
  salons: "group-hover:rotate-[24deg]",
  "cloud-kitchens": "group-hover:-translate-y-1",
  architects: "group-hover:-rotate-[14deg]",
  "event-decorators": "group-hover:-translate-y-1.5 group-hover:rotate-6",
  clinics: "group-hover:rotate-90",
  "real-estate": "group-hover:-translate-y-0.5 group-hover:scale-110",
  "driving-schools": "group-hover:rotate-[70deg]",
  "ca-legal": "group-hover:-rotate-[12deg]",
};

// Which industries are shown as a coloured capsule and which as a floating name, and how each
// one is nudged so the cluster feels hand-placed instead of a row of tabs.
const composition: { pill: boolean; nudge: string }[] = [
  { pill: true, nudge: "md:mt-6" },
  { pill: false, nudge: "md:-mt-1" },
  { pill: true, nudge: "md:mt-10" },
  { pill: true, nudge: "md:mt-0" },
  { pill: false, nudge: "md:mt-8" },
  { pill: true, nudge: "md:-mt-2" },
  { pill: false, nudge: "md:mt-4" },
  { pill: true, nudge: "md:mt-9" },
  { pill: true, nudge: "md:mt-1" },
  { pill: false, nudge: "md:mt-6" },
];

function IndustryItem({
  niche,
  index,
  selected,
  onToggle,
}: {
  niche: (typeof niches)[number];
  index: number;
  selected: boolean;
  onToggle: () => void;
}) {
  const Icon = niche.icon;
  const { pill, nudge } = composition[index % composition.length] ?? composition[0]!;
  const color = pastels[index % pastels.length] ?? LAVENDER;
  const move = `transition-transform duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${iconMove[niche.id] ?? ""}`;
  const focus = "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#111111]";

  return (
    <motion.li
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.55, ease: "easeOut", delay: index * 0.05 }}
      className={`shrink-0 snap-start max-md:whitespace-nowrap ${nudge}`}
    >
      {/* A slow, tiny float; it stops for people who prefer reduced motion */}
      <motion.div
        animate={{ y: [0, -3, 0] }}
        transition={{ duration: 5 + (index % 4), repeat: Infinity, ease: "easeInOut", delay: (index % 5) * 0.4 }}
      >
        {pill ? (
          <button
            type="button"
            aria-pressed={selected}
            onClick={onToggle}
            className={`group flex cursor-pointer items-center gap-2.5 rounded-full py-2 pl-2 pr-5 text-[16px] font-bold tracking-[-0.01em] transition-all duration-300 hover:shadow-[0_8px_20px_rgba(40,30,0,0.10)] ${focus} ${
              selected ? "bg-[#111111] text-white shadow-[0_10px_24px_rgba(17,17,17,0.25)]" : "text-[#111111] hover:brightness-[0.97]"
            }`}
            style={selected ? undefined : { backgroundColor: color }}
          >
            <span
              className={`flex h-9 w-9 items-center justify-center rounded-full transition-colors duration-300 ${
                selected ? "bg-white/15" : "bg-white/75"
              }`}
            >
              <Icon className={`h-[19px] w-[19px] ${move}`} />
            </span>
            {niche.label}
          </button>
        ) : (
          <button
            type="button"
            aria-pressed={selected}
            onClick={onToggle}
            className={`group flex cursor-pointer items-center gap-3 rounded-full py-1.5 pr-3 ${focus}`}
          >
            <span
              className={`flex h-10 w-10 items-center justify-center rounded-full ring-1 transition-colors duration-300 ${
                selected ? "bg-[#111111] text-white ring-[#111111]" : "bg-transparent text-[#111111] ring-black/15 group-hover:bg-white"
              }`}
            >
              <Icon className={`h-[20px] w-[20px] ${move}`} />
            </span>
            <span
              style={{ "--hl": color } as CSSProperties}
              className={`bg-[linear-gradient(var(--hl),var(--hl))] bg-bottom-left bg-no-repeat px-0.5 font-serif text-[27px] italic leading-tight tracking-[-0.01em] transition-[background-size] duration-500 ease-out group-hover:bg-[length:100%_50%] sm:text-[31px] ${
                selected ? "bg-[length:100%_62%]" : "bg-[length:0%_50%]"
              }`}
            >
              {niche.label}
            </span>
          </button>
        )}
      </motion.div>
    </motion.li>
  );
}

function IndustrySelector() {
  const [chosen, setChosen] = useState<string | null>(null);
  return (
    <ul
      role="list"
      aria-label="Industries"
      className="-mx-6 mt-10 flex snap-x snap-proximity scroll-px-6 items-center gap-3 overflow-x-auto px-6 pb-4 pt-3 [scrollbar-width:none] md:snap-none sm:-mx-12 sm:px-12 md:mx-0 md:mt-14 md:flex md:flex-wrap md:items-center md:justify-start md:gap-x-7 md:gap-y-5 md:overflow-visible md:px-0 md:pb-0 md:pt-2 [&::-webkit-scrollbar]:hidden"
    >
      {niches.map((niche, index) => (
        <IndustryItem
          key={niche.id}
          niche={niche}
          index={index}
          selected={chosen === niche.id}
          onToggle={() => setChosen((now) => (now === niche.id ? null : niche.id))}
        />
      ))}
    </ul>
  );
}

// ---- bento cards ------------------------------------------------------------------------
const bentoCard =
  "group relative flex h-full flex-col overflow-hidden rounded-[32px] p-7 transition-all duration-500 ease-out hover:-translate-y-1.5 hover:shadow-[0_26px_50px_rgba(40,30,0,0.13)] sm:p-8";
const drift = "transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]";
const glossy = (a: string, b: string) => ({
  backgroundImage: `radial-gradient(circle at 32% 28%, #ffffff 0%, ${a} 42%, ${b} 100%)`,
});

function BentoHead({ index }: { index: number }) {
  const f = features[index]!;
  const words = f.title.split(" ");
  const lead = words.slice(0, -1).join(" ");
  const tail = words[words.length - 1];
  return (
    <div className="relative z-10">
      <IconBadge icon={f.icon} size="sm" />
      <h3 className="font-display mt-4 text-[23px] font-extrabold leading-[1.08] tracking-[-0.028em] sm:text-[27px]">
        {lead} <span className="font-serif font-normal italic tracking-normal">{tail}</span>
      </h3>
      <p className="mt-2 max-w-[300px] text-[14.5px] font-medium leading-[1.55] text-[#4A463C]">{f.desc}</p>
    </div>
  );
}

function MiniWindow({ className = "", children, url = "yourbusiness.com" }: { className?: string; children: ReactNode; url?: string }) {
  return (
    <div
      aria-hidden="true"
      className={`overflow-hidden rounded-xl bg-white shadow-[0_14px_34px_rgba(40,30,0,0.14)] ring-1 ring-black/[0.05] ${className}`}
    >
      <div className="flex items-center gap-1 border-b border-[#EFEBDF] px-2.5 py-1.5">
        <span className="h-1.5 w-1.5 rounded-full bg-[#FF5A3C]" />
        <span className="h-1.5 w-1.5 rounded-full bg-[#FDB927]" />
        <span className="h-1.5 w-1.5 rounded-full bg-[#00C26E]" />
        <span className="ml-1.5 truncate rounded-full bg-[#F3EFE4] px-2 py-[1px] text-[7px] font-semibold text-[#8A8473]">{url}</span>
      </div>
      {children}
    </div>
  );
}

function BentoIndustry() {
  return (
    <article className={bentoCard} style={{ backgroundColor: LAVENDER }}>
      <BentoHead index={0} />
      <div className="relative mt-6 min-h-[250px] flex-1">
        {/* a second industry peeking out behind, so it reads as "one template per niche" */}
        <MiniWindow
          url="yourclinic.com"
          className={`absolute bottom-[-30px] left-[1%] w-[54%] -rotate-[5deg] ${drift} group-hover:-translate-x-2 group-hover:-rotate-[9deg]`}
        >
          <div className="p-2.5">
            <div className="mb-2 flex items-center justify-between">
              <span className="h-2 w-8 rounded-full bg-[#111111]/70" />
              <span className="h-2 w-4 rounded-full bg-[#00C26E]/70" />
            </div>
            <div className="flex h-[74px] items-center justify-center rounded-lg" style={{ backgroundColor: MINT }}>
              <ClinicIcon className="h-9 w-9 text-[#111111]" />
            </div>
            <span className="mt-2 block h-1.5 w-3/4 rounded-full bg-[#111111]/15" />
          </div>
        </MiniWindow>

        <MiniWindow
          className={`absolute bottom-[-44px] right-0 w-[86%] ${drift} group-hover:-translate-y-2.5 group-hover:rotate-[1.2deg]`}
        >
          <div className="p-3">
            <div className="mb-3 flex items-center justify-between">
              <span className="font-serif text-[12px] italic">Sunrise Interiors</span>
              <span className="flex items-center gap-1.5">
                <span className="h-1 w-4 rounded-full bg-[#111111]/25" />
                <span className="h-1 w-4 rounded-full bg-[#111111]/25" />
                <span className="rounded-full bg-[#111111] px-2 py-[3px] text-[6.5px] font-bold uppercase tracking-wider text-white">Enquire</span>
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <p className="text-[15px] font-extrabold leading-[1.05] tracking-[-0.03em]">
                  Spaces designed
                  <span className="block font-serif font-normal italic tracking-normal">around you.</span>
                </p>
                <span className="mt-2 block h-1 w-full rounded-full bg-[#111111]/15" />
                <span className="mt-1 block h-1 w-4/5 rounded-full bg-[#111111]/15" />
                <span className="mt-2.5 inline-block rounded-full bg-[#6C63F0] px-2.5 py-1 text-[6.5px] font-bold uppercase tracking-wider text-white">View projects</span>
              </div>
              <div className="relative flex h-[128px] w-[34%] shrink-0 items-end justify-center overflow-hidden rounded-lg" style={{ backgroundColor: BUTTER }}>
                <span className="absolute -right-3 -top-3 h-10 w-10 rounded-full" style={{ backgroundColor: ROSE }} />
                <InteriorIcon className="mb-2 h-12 w-12 text-[#111111]" />
              </div>
            </div>
            <div className="mt-3 grid grid-cols-3 gap-1.5">
              {[LAVENDER, MINT, ROSE].map((c) => (
                <span key={c} className="h-12 rounded-md" style={{ backgroundColor: c }} />
              ))}
            </div>
          </div>
        </MiniWindow>

        <span
          aria-hidden="true"
          className={`absolute right-[6%] top-0 flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-[12px] font-bold shadow-[0_8px_20px_rgba(40,30,0,0.12)] ${drift} group-hover:-translate-y-2 group-hover:-rotate-3`}
        >
          <InteriorIcon className="h-4 w-4" />
          Interior designers
        </span>
      </div>
    </article>
  );
}

function BentoEnquiries() {
  return (
    <article className={bentoCard} style={{ backgroundColor: MINT }}>
      <BentoHead index={1} />
      <div className="relative mt-6 min-h-[250px] flex-1">
        <span
          aria-hidden="true"
          className={`absolute -left-3 bottom-4 h-14 w-14 rounded-full shadow-[0_12px_20px_rgba(60,120,90,0.25)] ${drift} group-hover:-translate-y-2 group-hover:translate-x-1`}
          style={glossy("#A9E0C4", "#4FB583")}
        />
        <div
          aria-hidden="true"
          className={`absolute bottom-[-40px] right-[2%] w-[78%] rounded-[26px] bg-white p-3 shadow-[0_16px_38px_rgba(40,30,0,0.14)] ring-1 ring-black/[0.04] ${drift} group-hover:-translate-y-1.5`}
        >
          <div className="mb-3 flex items-center gap-2 border-b border-[#EFEBDF] pb-2.5">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#111111] text-white">
              <PhoneIcon className="h-3.5 w-3.5" />
            </span>
            <div>
              <p className="text-[11px] font-bold leading-none">Sunrise Interiors</p>
              <p className="mt-1 text-[8.5px] font-medium leading-none text-[#8A8473]">Typically replies quickly</p>
            </div>
          </div>
          <p className="max-w-[88%] rounded-2xl rounded-bl-md bg-[#F3EFE4] px-3 py-2 text-[10.5px] font-medium leading-snug">
            Hi! Can I get a quote for a 2BHK?
          </p>
          <p className={`ml-auto mt-2 max-w-[82%] rounded-2xl rounded-br-md px-3 py-2 text-[10.5px] font-medium leading-snug ${drift} group-hover:translate-x-1`} style={{ backgroundColor: MINT }}>
            Of course. Sending our packages now.
          </p>
          <div className="mt-3 flex items-center justify-between rounded-full bg-[#111111] px-3 py-1.5 text-[9px] font-bold uppercase tracking-[0.14em] text-white">
            Call now
            <ArrowRightIcon className="h-3 w-3" />
          </div>
        </div>
        <div
          aria-hidden="true"
          className={`absolute left-[4%] top-0 flex items-center gap-2 rounded-2xl bg-[#111111] px-3 py-2 text-white shadow-[0_14px_30px_rgba(17,17,17,0.3)] ${drift} group-hover:-translate-y-2.5 group-hover:-rotate-2`}
        >
          <span className="relative flex h-2 w-2">
            <span className="absolute inset-0 rounded-full bg-[#00C26E]" />
          </span>
          <div>
            <p className="text-[11px] font-bold leading-none">New enquiry</p>
            <p className="mt-1 text-[9px] font-medium leading-none text-white/60">Just now</p>
          </div>
        </div>
      </div>
    </article>
  );
}

function BentoChanges() {
  return (
    <article className={bentoCard} style={{ backgroundColor: BUTTER }}>
      <BentoHead index={3} />
      <div className="relative mt-6 min-h-[170px] flex-1">
        <div
          aria-hidden="true"
          className={`absolute left-0 top-0 flex items-center gap-2 rounded-full bg-white px-3 py-1.5 shadow-[0_10px_22px_rgba(40,30,0,0.12)] ${drift} group-hover:-translate-y-1.5`}
        >
          <span className="font-serif text-[13px] italic">Aa</span>
          <span className="text-[11px] font-extrabold">B</span>
          <span className="h-3 w-px bg-black/15" />
          {[ROSE, LAVENDER, MINT].map((c, i) => (
            <span
              key={c}
              className={`h-3.5 w-3.5 rounded-full ring-1 ring-black/10 ${drift} ${i === 1 ? "group-hover:scale-125" : ""}`}
              style={{ backgroundColor: c }}
            />
          ))}
        </div>
        <div
          aria-hidden="true"
          className={`absolute inset-x-0 bottom-[-34px] top-[52px] rounded-2xl bg-white p-4 shadow-[0_14px_32px_rgba(40,30,0,0.12)] ring-1 ring-black/[0.04] ${drift} group-hover:-translate-y-1`}
        >
          <p className="text-[20px] font-extrabold leading-[1.1] tracking-[-0.03em]">
            Your studio,{" "}
            <span className="relative inline-block">
              <span className="absolute -inset-x-1 inset-y-0 rounded-[3px]" style={{ backgroundColor: LAVENDER }} />
              <span className="relative font-serif font-normal italic tracking-normal">your way</span>
              <span className="absolute -left-1.5 -top-1 h-1.5 w-1.5 rounded-[1px] bg-[#6C63F0]" />
              <span className="absolute -bottom-1 -right-1.5 h-1.5 w-1.5 rounded-[1px] bg-[#6C63F0]" />
            </span>
            <span className="ml-0.5 inline-block h-5 w-px translate-y-1 bg-[#111111]" />
          </p>
          <span className="mt-3 block h-1.5 w-full rounded-full bg-[#111111]/12" />
          <span className="mt-1.5 block h-1.5 w-3/4 rounded-full bg-[#111111]/12" />
        </div>
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          className={`absolute bottom-[8px] right-[14%] h-7 w-7 drop-shadow-md ${drift} group-hover:-translate-x-10 group-hover:-translate-y-8`}
        >
          <path d="M5 3l14 7-6 2-2 6z" fill="#111111" stroke="#fff" strokeWidth="1.4" strokeLinejoin="round" />
        </svg>
      </div>
    </article>
  );
}

function SiteSkin({ compact = false }: { compact?: boolean }) {
  return (
    <div className={compact ? "p-1.5" : "p-2.5"}>
      <div className="mb-1.5 flex items-center justify-between">
        <span className="h-1.5 w-6 rounded-full bg-[#111111]/70" />
        <span className="h-1.5 w-3 rounded-full bg-[#111111]/25" />
      </div>
      <p className={`${compact ? "text-[8px]" : "text-[13px]"} font-extrabold leading-[1.05] tracking-[-0.03em]`}>
        Spaces designed
        <span className="block font-serif font-normal italic tracking-normal">around you.</span>
      </p>
      <span className={`block rounded-md ${compact ? "mt-1.5 h-9" : "mt-2 h-[96px]"}`} style={{ backgroundColor: BUTTER }} />
      <div className="mt-1.5 grid grid-cols-3 gap-1">
        {[LAVENDER, MINT, ROSE].map((c) => (
          <span key={c} className={`rounded ${compact ? "h-3" : "h-8"}`} style={{ backgroundColor: c }} />
        ))}
      </div>
    </div>
  );
}

function BentoResponsive() {
  return (
    <article className={`${bentoCard} md:flex-row md:items-stretch md:gap-4`} style={{ backgroundColor: ROSE }}>
      <div className="md:w-[40%] md:shrink-0">
        <BentoHead index={2} />
      </div>
      <div className="relative mt-6 min-h-[250px] flex-1 md:mt-0">
        <span
          aria-hidden="true"
          className={`absolute right-[2%] top-[-6px] h-12 w-12 rounded-full shadow-[0_12px_20px_rgba(150,70,90,0.22)] ${drift} group-hover:translate-y-3`}
          style={glossy("#F5B8C4", "#D9788D")}
        />
        {/* desktop */}
        <MiniWindow
          className={`absolute right-[3%] top-[14px] w-[76%] ${drift} group-hover:translate-x-1.5 group-hover:-translate-y-1`}
        >
          <SiteSkin />
        </MiniWindow>
        {/* tablet */}
        <div
          aria-hidden="true"
          className={`absolute bottom-[-10px] left-[4%] w-[30%] overflow-hidden rounded-[14px] border-[3px] border-[#111111] bg-white shadow-[0_14px_30px_rgba(40,30,0,0.2)] ${drift} group-hover:-translate-x-1.5 group-hover:-rotate-3`}
        >
          <SiteSkin compact />
        </div>
        {/* phone */}
        <div
          aria-hidden="true"
          className={`absolute bottom-[-18px] left-[31%] w-[18%] overflow-hidden rounded-[12px] border-[3px] border-[#111111] bg-white shadow-[0_14px_30px_rgba(40,30,0,0.24)] ${drift} group-hover:translate-x-1.5 group-hover:-translate-y-2 group-hover:rotate-3`}
        >
          <SiteSkin compact />
        </div>
      </div>
    </article>
  );
}

function BentoGrid() {
  const cell = (cls: string, i: number, child: ReactNode) => (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.7, ease: "easeOut", delay: i * 0.12 }}
      className={cls}
    >
      {child}
    </motion.div>
  );
  return (
    <ul className="mt-14 grid grid-cols-1 gap-5 md:grid-cols-6 lg:grid-cols-12 lg:gap-6" role="list">
      {cell("md:col-span-6 lg:col-span-7 lg:min-h-[430px]", 0, <BentoIndustry />)}
      {cell("md:col-span-3 lg:col-span-5 lg:min-h-[430px]", 1, <BentoEnquiries />)}
      {cell("md:col-span-3 lg:col-span-4 lg:min-h-[320px]", 2, <BentoChanges />)}
      {cell("md:col-span-6 lg:col-span-8 lg:min-h-[320px]", 3, <BentoResponsive />)}
    </ul>
  );
}

// ---------------------------------------------------------------------------------------
// Questions: thin-line accordion rows. The answer height animates with a grid-row transition.
// ---------------------------------------------------------------------------------------
const faqTints = [LAVENDER, SKY, ROSE, MINT];

function FaqRow({ index, q, a, open, onToggle }: { index: number; q: string; a: string; open: boolean; onToggle: () => void }) {
  const tint = faqTints[index % faqTints.length] ?? LAVENDER;
  const panel = `faq-panel-${index}`;
  return (
    <li className="group border-b border-[#111111]/15 first:border-t">
      <h3>
        <button
          type="button"
          aria-expanded={open}
          aria-controls={panel}
          onClick={onToggle}
          className="flex w-full cursor-pointer items-start gap-4 py-6 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#111111] sm:gap-6 sm:py-7"
        >
          <span className="mt-[9px] w-7 shrink-0 font-serif text-[15px] italic tabular-nums text-[#8A8473]">
            {String(index + 1).padStart(2, "0")}
          </span>
          <span className="flex-1">
            <span
              style={{ "--tint": tint } as CSSProperties}
              className="bg-[linear-gradient(var(--tint),var(--tint))] bg-[length:0%_38%] bg-bottom-left bg-no-repeat font-[Inter,sans-serif] text-[19px] font-semibold leading-[1.3] tracking-[-0.022em] transition-[background-size] duration-500 ease-out [box-decoration-break:clone] group-hover:bg-[length:100%_36%] sm:text-[24px]"
            >
              {q}
            </span>
          </span>
          <span
            className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border transition-all duration-300 ${
              open ? "border-[#111111] bg-[#111111] text-white" : "border-[#111111]/25 text-[#111111] group-hover:border-[#111111]"
            }`}
          >
            <svg viewBox="0 0 16 16" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" aria-hidden="true">
              <path d="M3 8h10" />
              <path d="M8 3v10" className={`origin-center transition-transform duration-300 [transform-box:fill-box] ${open ? "scale-y-0" : "scale-y-100"}`} />
            </svg>
          </span>
        </button>
      </h3>
      <div
        id={panel}
        role="region"
        className={`grid transition-[grid-template-rows,opacity] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none ${
          open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className="overflow-hidden">
          <p className="max-w-[640px] pb-8 pl-11 pr-12 font-[Inter,sans-serif] text-[16px] font-normal leading-[1.75] tracking-[-0.003em] text-[#4A463C] sm:pl-[52px] sm:text-[17px]">{a}</p>
        </div>
      </div>
    </li>
  );
}

function FaqList() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  return (
    <ul role="list" className="lg:col-span-9">
      {questions.map((item, i) => (
        <FaqRow
          key={item.q}
          index={i}
          q={item.q}
          a={item.a}
          open={openIndex === i}
          onToggle={() => setOpenIndex((now) => (now === i ? null : i))}
        />
      ))}
    </ul>
  );
}

// A small arch-window piece that sits beside the heading.
function FaqHeadingArt() {
  return (
    <div aria-hidden="true" className="group relative hidden h-[190px] w-[190px] shrink-0 md:block lg:h-[230px] lg:w-[230px]">
      <span className="absolute inset-x-[14%] bottom-0 top-0 rounded-t-full" style={{ backgroundColor: LAVENDER }} />
      <span className={`absolute bottom-0 left-0 h-[46%] w-[46%] rounded-full ${drift} group-hover:-translate-y-2`} style={{ backgroundColor: MINT }} />
      <span className={`absolute right-0 top-[22%] h-[30%] w-[30%] rounded-full ${drift} group-hover:translate-y-2`} style={{ backgroundColor: ROSE }} />
      <span className="absolute bottom-[26%] right-[8%] h-[26%] w-[26%] rounded-tl-full" style={{ backgroundColor: SKY }} />
      <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full">
        <path d="M28 30c8-10 18-10 26 0s18 10 26 0" fill="none" stroke="#111111" strokeWidth="1.6" strokeLinecap="round" />
        <circle cx="50" cy="62" r="2.2" fill="#111111" />
      </svg>
      <span className="absolute -left-4 top-[14%] -rotate-[8deg] rounded-xl rounded-bl-sm bg-white px-3 py-1.5 font-serif text-[16px] italic shadow-[0_10px_22px_rgba(40,30,0,0.12)]">
        psst, ask away
      </span>
    </div>
  );
}

// An artistic composition for the contact prompt: stacked arches, a quarter-circle, a tiny site, a sticker.
function ContactArt() {
  return (
    <div aria-hidden="true" className="group relative mx-auto h-[300px] w-full max-w-[460px] sm:h-[360px] lg:h-[400px]">
      <span className="absolute bottom-0 left-[4%] h-[86%] w-[44%] rounded-t-full" style={{ backgroundColor: LAVENDER }} />
      <span className={`absolute bottom-0 left-[36%] h-[64%] w-[34%] rounded-t-full ${drift} group-hover:-translate-y-3`} style={{ backgroundColor: MINT }} />
      <span className="absolute bottom-0 right-[2%] h-[48%] w-[28%] rounded-tl-full" style={{ backgroundColor: ROSE }} />
      <span className={`absolute right-[10%] top-[8%] h-[22%] w-[22%] rounded-full ${drift} group-hover:translate-y-3`} style={{ backgroundColor: SKY }} />
      <span className="absolute left-[2%] top-[10%] h-[18%] w-[18%] rounded-full border border-[#111111]/70" />
      <MiniWindow
        url="yourbusiness.com"
        className={`absolute bottom-[10%] left-[14%] w-[62%] -rotate-[4deg] ${drift} group-hover:-rotate-[1deg] group-hover:-translate-y-1`}
      >
        <div className="p-3">
          <p className="text-[19px] font-extrabold leading-[1.02] tracking-[-0.035em]">
            Hello,
            <span className="block font-serif font-normal italic tracking-normal">new customers.</span>
          </p>
          <span className="mt-2.5 block h-1 w-4/5 rounded-full bg-[#111111]/15" />
          <span className="mt-1.5 block h-1 w-3/5 rounded-full bg-[#111111]/15" />
          <span className="mt-3 inline-block rounded-full bg-[#111111] px-2.5 py-1 text-[7px] font-bold uppercase tracking-wider text-white">Call now</span>
        </div>
      </MiniWindow>
      <span
        className={`absolute right-[6%] top-[38%] flex h-[92px] w-[92px] rotate-[10deg] items-center justify-center rounded-full bg-[#111111] text-center font-serif text-[19px] italic leading-[1.05] text-white shadow-[0_14px_26px_rgba(17,17,17,0.28)] ${drift} group-hover:rotate-[24deg]`}
      >
        say
        <br />
        hello
      </span>
    </div>
  );
}

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
    transition: { duration: 0.5, ease: "easeOut" as const, delay: 0.7 + i * 0.12 },
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
  const [bookingOpen, setBookingOpen] = useState(false);
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
      <BookCallModal open={bookingOpen} onClose={() => setBookingOpen(false)} />

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
              <button
                type="button"
                onClick={() => setBookingOpen(true)}
                className="cursor-pointer rounded-xl border border-[#111111] px-4 py-2 text-[14px] font-semibold text-[#111111] transition-colors duration-200 hover:bg-[#111111] hover:text-white sm:px-5 sm:py-2.5 sm:text-[15px]"
              >
                Book a call
              </button>
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
          <NavCapsule active={activeTab} onPick={goToTab} name="narrow" className="flex w-full min-w-max justify-between" />
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
              <h1 className="font-display text-[40px] font-extrabold leading-[1.02] tracking-[-0.04em] sm:text-[58px] lg:text-[72px]">
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

                      <h3 className="font-display mt-6 text-[22px] font-extrabold leading-[1.12] tracking-[-0.022em]">{step.title}</h3>
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
                    <h3 className="font-display text-[19px] font-extrabold">{pack.name}</h3>
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
          {/* Reduced motion: no floating, tilting or sliding; everything simply sits still. */}
          <MotionConfig reducedMotion="user">
            <style>{`@media (prefers-reduced-motion: reduce){.oc-industries *{transition:none!important;animation:none!important;translate:none!important;rotate:none!important;scale:none!important}}`}</style>
            <div className="oc-industries mx-auto w-full max-w-7xl px-6 pb-16 pt-16 sm:px-12 sm:pb-20 sm:pt-20 lg:px-16 lg:pb-24 lg:pt-24">
              <h2 className={`${sectionTitle} max-w-3xl`}>
                A website for <span className={accent}>every industry.</span>
              </h2>
              <p className="mt-5 max-w-xl text-[18px] font-medium leading-[1.5] text-[#4A463C]">
                Pick your industry in the form and we'll build a website made for it.
              </p>

              <IndustrySelector />
              <BentoGrid />
            </div>
          </MotionConfig>
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
          <div className="mx-auto w-full max-w-7xl px-6 py-16 sm:px-12 lg:px-16 lg:py-24">
            {/* Asymmetric heading: the words are flush left and the small artwork floats off to the right */}
            <div className="flex items-end justify-between gap-8">
              <h2 className="font-display text-[clamp(38px,8.6vw,124px)] font-extrabold uppercase leading-[0.9] tracking-[-0.05em]">
                You ask,
                <br />
                <span className="font-serif font-normal normal-case italic leading-[0.95] tracking-[-0.035em]">we answer.</span>
              </h2>
              <div className="md:mb-4 lg:mr-6">
                <FaqHeadingArt />
              </div>
            </div>

            <div className="mt-12 grid grid-cols-1 gap-8 lg:mt-20 lg:grid-cols-12 lg:gap-16">
              <p className="max-w-[260px] font-[Inter,sans-serif] text-[15px] font-medium leading-[1.6] text-[#6B6657] lg:col-span-3 lg:pt-7">
                <span className="mb-3 block h-px w-8 bg-[#111111]" />
                What people usually ask before they say yes.
              </p>
              <FaqList />
            </div>

            {/* Contact: an editorial split, words on the left and an artwork on the right */}
            <div className="mt-20 grid grid-cols-1 items-center gap-12 border-t border-[#111111] pt-12 sm:mt-28 lg:grid-cols-12 lg:gap-16 lg:pt-16">
              <div className="lg:col-span-7">
                <p className="font-serif text-[16px] italic text-[#6B6657]">Contact</p>
                <p className="font-display mt-3 text-[clamp(34px,6.2vw,88px)] font-extrabold leading-[0.96] tracking-[-0.045em]">
                  Still have
                  <br />
                  questions?
                  <br />
                  <span className="font-serif font-normal italic tracking-[-0.03em]">Let's talk.</span>
                </p>
                <p className="mt-6 max-w-md font-[Inter,sans-serif] text-[17px] leading-[1.65] text-[#4A463C]">
                  Tell us about your business and we'll reply in plain words, with no pressure to start.
                </p>
                <div className="mt-9 flex flex-wrap items-center gap-x-7 gap-y-4">
                  <button type="button" onClick={() => setBookingOpen(true)} className={`${blackBtn} group`}>
                    Get in touch
                    <ArrowRightIcon className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                  </button>
                  {whatsappDigits && (
                    <a
                      href={`https://wa.me/${whatsappDigits}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 border-b border-[#111111]/40 pb-0.5 text-[15px] font-semibold transition-colors hover:border-[#111111]"
                    >
                      <PhoneIcon className="h-4 w-4" />
                      Or message us on WhatsApp
                    </a>
                  )}
                </div>
              </div>
              <div className="lg:col-span-5">
                <ContactArt />
              </div>
            </div>
          </div>
        </section>

        {/* Closing call to action */}
        <section className="px-3 pb-6 sm:px-6">
          <div className="relative mx-auto w-full max-w-7xl overflow-hidden rounded-[36px] bg-[#111111] px-6 py-16 text-center text-white sm:py-20">
            <Shape kind="half" color={GREEN} className="-left-8 bottom-0 h-32 w-32 rotate-[10deg]" />
            <Shape kind="tri" color={YELLOW} className="-right-6 top-0 h-32 w-32 rotate-[90deg]" />
            <Shape kind="dot" color={RED} className="right-[18%] bottom-8 hidden h-9 w-9 sm:block" />
            <h2 className="font-display relative mx-auto max-w-3xl text-[32px] font-extrabold leading-[1.06] tracking-[-0.032em] sm:text-[48px]">
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
