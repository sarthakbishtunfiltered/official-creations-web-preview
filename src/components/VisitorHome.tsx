import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ChevronDown, Eye, Pencil, Phone, Rocket } from "lucide-react";
import { siteConfig } from "../config";
import { supabase } from "../lib/supabase";
import type { TeamAccess } from "../lib/useTeamAccess";
import type { LeadKind } from "../lib/leads";
import { LeadForm } from "./LeadForm";
import { SupportedNiches } from "./SupportedNiches";

const whatsappDigits = siteConfig.whatsappNumber.replace(/\D/g, "");

const steps = [
  {
    icon: Pencil,
    title: "Tell us about your business",
    desc: "Send your business name, what you do, your city and your budget. The form takes about two minutes.",
  },
  {
    icon: Eye,
    title: "See your website",
    desc: "Our team makes a website with your name and details already on it, and shows you the finished result.",
  },
  {
    icon: Rocket,
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
  {
    q: "What if I already know I want a website?",
    a: "Choose “Place an order” in the form. Your details go to our team, and we contact you to confirm everything before anything starts.",
  },
  {
    q: "Can the website be changed?",
    a: "Yes. Tell us what you want different, such as the photos, the words or the colours, and we update it.",
  },
];

// What the public sees at the homepage: a short pitch and one form. Team members see the
// generator instead (see Home.tsx).
export function VisitorHome({ access }: { access: Exclude<TeamAccess, { status: "approved" | "checking" }> }) {
  const [kind, setKind] = useState<LeadKind>("sample");
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

  function choose(next: LeadKind) {
    setKind(next);
    document.getElementById("start")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  async function signOut() {
    await supabase.auth.signOut();
    window.location.reload();
  }

  const quietLink =
    "cursor-pointer text-[13px] font-semibold text-[#6B6566] underline-offset-4 transition-colors duration-200 hover:text-[#111111] hover:underline";

  return (
    <div className="flex min-h-screen flex-col overflow-x-clip bg-[#EAE4E5] pb-20 font-sans text-[#111111] md:pb-0">
      <header className="sticky top-0 z-40 border-b border-[#D5CFD0]/60 bg-[#EAE4E5]/90 backdrop-blur-md">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-3 px-6 py-4 sm:px-12 lg:px-16">
          <div className="flex items-center gap-2.5">
            <img
              src="/OC_Black-removebg-preview.png"
              alt=""
              width={32}
              height={32}
              className="h-8 w-8 object-contain"
            />
            <span className="text-[17px] font-bold tracking-tight sm:text-[19px]">Official Creations</span>
          </div>

          <div className="flex items-center gap-3 sm:gap-4">
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
                className="hidden items-center gap-2 rounded-lg border border-[#BCB6B7] px-4 py-2 text-[14px] font-medium transition-colors duration-200 hover:bg-[#BCB6B7]/10 md:inline-flex"
              >
                <Phone className="h-3.5 w-3.5 rotate-[10deg] fill-[#111111] stroke-none" />
                Chat with us
              </a>
            )}
            <button
              type="button"
              onClick={() => choose("sample")}
              className="hidden cursor-pointer rounded-lg bg-[#111111] px-5 py-2 text-[14px] font-semibold text-white transition-colors duration-200 hover:bg-black sm:inline-block"
            >
              Request a sample
            </button>
          </div>
        </div>
      </header>

      <main>
        {/* Hero */}
        <section className="mx-auto grid w-full max-w-7xl grid-cols-1 items-center gap-12 px-6 pb-16 pt-12 sm:px-12 lg:grid-cols-12 lg:gap-8 lg:px-16 lg:pb-24 lg:pt-16">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="flex flex-col items-start lg:col-span-6"
          >
            <h1 className="text-[44px] font-semibold leading-[1.05] tracking-[-0.03em] sm:text-[56px] lg:text-[72px]">
              Imagine <br />
              your brand, <br />
              <span className="mt-1 block font-serif font-normal italic tracking-wide">already online.</span>
            </h1>

            <p className="mt-8 max-w-[480px] text-[18px] font-medium leading-[1.5] text-[#6B6566] sm:text-[20px]">
              Tell us about your business. We make a website with your name on it, so you can see it before you decide.
            </p>

            <div className="mt-10 flex flex-wrap items-center gap-3 sm:gap-4">
              <button
                type="button"
                onClick={() => choose("sample")}
                className="flex cursor-pointer items-center rounded-lg bg-[#111111] px-6 py-3.5 text-[15px] font-semibold text-white shadow-sm transition-colors duration-200 hover:bg-black"
              >
                <span className="mr-2.5 h-2.5 w-2.5 shrink-0 rounded-full bg-[#FFE600] shadow-[0_0_8px_rgba(255,230,0,0.8)]" />
                Request a sample
              </button>
              <button
                type="button"
                onClick={() => choose("order")}
                className="cursor-pointer rounded-lg border border-[#BCB6B7] bg-white/40 px-6 py-3.5 text-[15px] font-semibold shadow-sm transition-colors duration-200 hover:bg-white/80"
              >
                Place an order
              </button>
            </div>

            <p className="mt-5 max-w-[420px] text-[13px] font-medium leading-[1.6] text-[#6B6566]">
              Your details go straight to our team, and we contact you on the number you give. You choose whether you
              want to see a sample first or go straight to an order.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut", delay: 0.1 }}
            className="lg:col-span-6"
          >
            <img
              src="/preview.png"
              alt="A website made for a business, shown on a laptop"
              decoding="async"
              fetchPriority="high"
              className="block h-auto w-full"
            />
          </motion.div>
        </section>

        {/* How it works: the steps really are in order */}
        <section id="how-it-works" className="border-t border-[#D5CFD0]/40">
          <div className="mx-auto w-full max-w-7xl px-6 py-16 sm:px-12 sm:py-20 lg:px-16 lg:py-24">
            <h2 className="text-[34px] font-bold leading-[1.1] tracking-[-0.02em] sm:text-[44px] lg:text-[50px]">
              From your details to <span className="font-serif font-normal italic">a live website.</span>
            </h2>

            <ol className="mt-12 grid grid-cols-1 gap-5 md:grid-cols-3">
              {steps.map((step, index) => {
                const Icon = step.icon;
                return (
                  <li
                    key={step.title}
                    className="group rounded-2xl border border-[#D5CFD0] bg-[#F4EFEF]/80 p-6 transition-all duration-300 hover:border-[#111111]/30 hover:bg-white sm:p-7"
                  >
                    <div className="flex items-center">
                      <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#111111] text-white">
                        <Icon className="h-6 w-6 stroke-[1.8]" aria-hidden="true" />
                      </span>
                      <span aria-hidden="true" className="mx-3 flex-1 border-t-2 border-dotted border-[#BCB6B7]" />
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#111111] text-[11px] font-bold text-white">
                        {index + 1}
                      </span>
                    </div>
                    <h3 className="mb-2 mt-7 text-[20px] font-bold">{step.title}</h3>
                    <p className="text-[14px] font-medium leading-[1.6] text-[#6B6566]">{step.desc}</p>
                  </li>
                );
              })}
            </ol>
          </div>
        </section>

        {/* Which businesses it is for: the same section the team homepage uses */}
        <SupportedNiches subtitle="Pick your industry in the form below and we'll build a website made for it." />

        {/* The form */}
        <section id="start" className="scroll-mt-16 border-t border-[#D5CFD0]/40">
          <div className="mx-auto grid w-full max-w-7xl grid-cols-1 items-start gap-10 px-6 py-16 sm:px-12 lg:grid-cols-12 lg:gap-16 lg:px-16 lg:py-24">
            <div className="flex flex-col items-start lg:sticky lg:top-24 lg:col-span-5">
              <h2 className="text-[36px] font-bold leading-[1.08] tracking-[-0.02em] sm:text-[46px]">
                Tell us about <span className="font-serif font-normal italic">your business.</span>
              </h2>
              <p className="mt-5 max-w-sm text-[16px] font-medium leading-[1.6] text-[#6B6566] sm:text-[17px]">
                Five details are all we need. Everything else is optional, and you can add it now or tell us later.
              </p>

              <ul className="mt-8 flex max-w-sm flex-col gap-4 text-[14px] font-medium leading-[1.6] text-[#6B6566]">
                <li>
                  <span className="block font-bold text-[#111111]">We contact you</span>
                  On the phone number you give, to talk about your business.
                </li>
                <li>
                  <span className="block font-bold text-[#111111]">You see it first</span>
                  Choose a sample and we show you your website before you decide anything.
                </li>
                <li>
                  <span className="block font-bold text-[#111111]">No pressure</span>
                  Sending the form does not start an order. We confirm everything with you first.
                </li>
              </ul>
            </div>

            <div className="lg:col-span-7">
              <LeadForm kind={kind} onKindChange={setKind} />
            </div>
          </div>
        </section>

        {/* Questions */}
        <section className="border-t border-[#D5CFD0]/40">
          <div className="mx-auto grid w-full max-w-7xl grid-cols-1 gap-10 px-6 py-16 sm:px-12 lg:grid-cols-12 lg:gap-16 lg:px-16 lg:py-24">
            <h2 className="text-[34px] font-bold leading-[1.1] tracking-[-0.02em] sm:text-[44px] lg:col-span-5">
              Common <span className="font-serif font-normal italic">questions.</span>
            </h2>

            <div className="flex flex-col gap-3 lg:col-span-7">
              {questions.map((item) => (
                <details key={item.q} className="group rounded-xl border border-[#D5CFD0] bg-[#F4EFEF]/60">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 rounded-xl px-5 py-4 text-[16px] font-bold [&::-webkit-details-marker]:hidden">
                    {item.q}
                    <ChevronDown
                      className="h-4 w-4 shrink-0 text-[#6B6566] transition-transform duration-200 group-open:rotate-180"
                      aria-hidden="true"
                    />
                  </summary>
                  <p className="px-5 pb-5 text-[15px] font-medium leading-[1.65] text-[#6B6566]">{item.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="mt-auto border-t border-[#D5CFD0]/40">
        <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center justify-between gap-3 px-6 py-6 text-[13px] font-medium text-[#6B6566] sm:px-12 lg:px-16">
          <span>© {new Date().getFullYear()} Official Creations</span>
          <a href="/login" className={quietLink}>
            Team login
          </a>
        </div>
      </footer>

      {/* Phone only: the main button stays in reach until the form is on screen */}
      {!formInView && (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-[#D5CFD0] bg-[#EAE4E5]/95 px-4 py-3 backdrop-blur-md md:hidden">
          <button
            type="button"
            onClick={() => choose("sample")}
            className="flex w-full cursor-pointer items-center justify-center rounded-xl bg-[#111111] py-3.5 text-[15px] font-semibold text-white"
          >
            <span className="mr-2.5 h-2.5 w-2.5 shrink-0 rounded-full bg-[#FFE600]" />
            Request a sample
          </button>
        </div>
      )}
    </div>
  );
}
