import { motion } from "framer-motion";
import { Phone } from "lucide-react";
import { HowItWorks } from "<div className=""></div>/components/HowItWorks";
import { BuiltDifferent } from "./components/BuiltDifferent";
import { SupportedNiches } from "./components/SupportedNiches";
import { LiveDemo } from "./components/LiveDemo";
import { ProfileMenu } from "./components/ProfileMenu";
import { GlassNavbar } from "./components/GlassNavbar";
import type { TeamAccess } from "./lib/useTeamAccess";
import { siteConfig } from "./config";

const whatsappDigits = siteConfig.whatsappNumber.replace(/\D/g, "");

const navLinks = [
  { href: "#how-it-works", label: "How it works" },
  { href: "#built-different", label: "Our approach" },
  { href: "#supported-niches", label: "Industries" },
  { href: "#live-demo", label: "Live demo" },
];

// The team's homepage with the website generator. Home.tsx decides who sees it.
function App({ access }: { access: TeamAccess }) {
  return (
    <div className="min-h-screen overflow-x-hidden bg-[#EAE4E5] font-sans text-[#111111]">
      <GlassNavbar
        links={navLinks}
        actions={
          <div className="flex items-center gap-2 sm:gap-3">
            {(access.status === "approved" || access.status === "denied") && (
              <ProfileMenu access={access} />
            )}

            {siteConfig.loginHref &&
              (access.status === "signed_out" || access.status === "error") && (
                <a
                  href={siteConfig.loginHref}
                  className="hidden rounded-full px-4 py-2.5 text-[13px] font-semibold text-[#393536] transition-colors hover:bg-black/5 sm:inline-flex"
                >
                  Login
                </a>
              )}

            {whatsappDigits && (
              <a
                href={`https://wa.me/${whatsappDigits}`}
                target="_blank"
                rel="noopener noreferrer"
                className="hidden items-center gap-2 rounded-full px-3 py-2.5 text-[13px] font-semibold text-[#393536] transition-colors hover:bg-black/5 sm:inline-flex"
              >
                <Phone className="h-3.5 w-3.5 rotate-[10deg] fill-current stroke-none" />
                Book a call
              </a>
            )}

            {siteConfig.pricingHref && (
              <a
                href={siteConfig.pricingHref}
                className="rounded-full bg-[#111111] px-4 py-2.5 text-[13px] font-semibold text-white shadow-[0_3px_10px_rgba(0,0,0,0.14)] transition-all hover:-translate-y-0.5 hover:bg-black sm:px-5"
              >
                See pricing
              </a>
            )}
          </div>
        }
      />

      {/* Hero Section Container */}
      <main className="mx-auto flex w-full max-w-7xl items-center justify-center px-6 py-16 sm:px-12 lg:px-16 lg:py-24">
        <div className="grid w-full grid-cols-1 items-center gap-12 lg:grid-cols-12 lg:gap-8">
          {/* Left Column: Heading & Paragraph */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut", delay: 0.1 }}
            className="flex flex-col items-start lg:col-span-6"
          >
            <h1 className="text-left text-[44px] font-semibold leading-[1.05] tracking-[-0.03em] text-[#111111] sm:text-[56px] lg:text-[76px]">
              Imagine <br />
              your brand, <br />
              <span className="mt-1 block font-serif font-normal italic tracking-wide">
                already online.
              </span>
            </h1>

            <p className="mt-8 max-w-[460px] text-left text-[18px] font-medium leading-[1.4] text-[#7F7A7B] sm:text-[20px]">
              Preview a professionally designed website{" "}
              <br className="hidden sm:inline" />
              personalized with your business name{" "}
              <br className="hidden sm:inline" />
              in seconds.
            </p>

            <div className="mt-10 flex flex-wrap items-center gap-3 sm:gap-4">
              <a
                href="#live-demo"
                className="flex items-center rounded-xl bg-[#111111] px-6 py-3.5 text-[15px] font-semibold text-white shadow-sm transition-colors duration-200 hover:bg-black"
              >
                <span className="mr-2.5 h-2.5 w-2.5 shrink-0 rounded-full bg-[#FFE600] shadow-[0_0_8px_rgba(255,230,0,0.8)]" />
                Preview my website
              </a>

              <a
                href={siteConfig.pricingHref || "#how-it-works"}
                className="rounded-xl border border-[#BCB6B7] bg-white/40 px-6 py-3.5 text-[15px] font-semibold text-[#111111] shadow-sm transition-colors duration-200 hover:bg-white/80"
              >
                {siteConfig.pricingHref ? "See pricing" : "See how it works"}
              </a>
            </div>
          </motion.div>

          {/* Right Column: Floating Browser Mockup */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
            className="w-full lg:col-span-6"
          >
            <img
              src="/preview.png"
              alt="Website Preview"
              decoding="async"
              fetchPriority="high"
              className="block h-auto w-full"
            />
          </motion.div>
        </div>
      </main>

      <div id="how-it-works" className="scroll-mt-28">
        <HowItWorks />
      </div>
      <div id="built-different" className="scroll-mt-28">
        <BuiltDifferent />
      </div>
      <div id="supported-niches" className="scroll-mt-28">
        <SupportedNiches />
      </div>
      <div id="live-demo" className="scroll-mt-28">
        <LiveDemo access={access} />
      </div>
    </div>
  );
}

export default App;
