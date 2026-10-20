import { motion } from "framer-motion";
import { Sparkles, Phone, Smartphone, Palette } from "lucide-react";
import { niches } from "../data/niches";

// Four copies so the row loops seamlessly (the animation moves exactly half the track).
const marqueeItems = [...niches, ...niches, ...niches, ...niches];

const featureCards = [
  {
    icon: Sparkles,
    title: "Industry-specific",
    desc: "Templates made for your niche and its customers.",
  },
  {
    icon: Phone,
    title: "Built for enquiries",
    desc: "Call and WhatsApp buttons are part of every site.",
  },
  {
    icon: Smartphone,
    title: "Fully responsive",
    desc: "Looks right on phones, tablets and desktops.",
  },
  {
    icon: Palette,
    title: "Easy changes",
    desc: "Tell us what to change and we'll update your site.",
  },
];

export function SupportedNiches() {
  return (
    <section className="w-full border-t border-[#D5CFD0]/40">
      {/* Header — contained */}
      <div className="w-full max-w-7xl mx-auto px-6 sm:px-12 lg:px-16 pt-16 sm:pt-20 lg:pt-24">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="flex flex-col items-start"
          >
            <span className="text-[13px] font-bold tracking-[0.18em] text-[#6B6566] uppercase mb-3">
              SUPPORTED NICHES
            </span>
            <h2 className="text-[38px] sm:text-[48px] lg:text-[54px] font-bold text-[#111111] leading-[1.08] tracking-[-0.02em]">
              Professional websites{" "}
              <br className="hidden sm:inline" />
              for{" "}
              <span className="font-serif italic font-normal text-[#111111]">
                every industry.
              </span>
            </h2>
            <p className="mt-4 text-[17px] sm:text-[19px] text-[#6B6566] leading-[1.5] font-medium max-w-2xl">
              Choose the industry and get a personalized website preview in
              seconds.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="flex items-center gap-2 text-[13px] font-semibold text-[#111111] tracking-wide shrink-0 pb-1"
          >
            <span aria-hidden="true">✦</span>
            <span>{niches.length} niches • Simple &amp; Premium designs</span>
          </motion.div>
        </div>
      </div>

      {/* Screen readers get the list once; the scrolling copy below is decoration */}
      <ul className="sr-only">
        {niches.map((niche) => (
          <li key={niche.id}>{niche.label}</li>
        ))}
      </ul>

      {/* Marquee — full bleed, edge-faded */}
      <div
        aria-hidden="true"
        className="mt-14 mb-14 w-full overflow-hidden"
        style={{
          maskImage:
            "linear-gradient(to right, transparent 0%, black 12%, black 88%, transparent 100%)",
          WebkitMaskImage:
            "linear-gradient(to right, transparent 0%, black 12%, black 88%, transparent 100%)",
        }}
      >
        <div className="animate-marquee flex items-center py-3">
          {marqueeItems.map((niche, idx) => {
            const Icon = niche.icon;
            return (
              <div
                key={`${niche.id}-${idx}`}
                className="flex items-center gap-3.5 shrink-0 cursor-default select-none pr-24"
              >
                <Icon className="w-[22px] h-[22px] text-[#111111] stroke-[1.6] shrink-0" />
                <span className="text-[17px] sm:text-[19px] font-medium text-[#111111] tracking-[-0.01em] whitespace-nowrap">
                  {niche.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Feature Cards — contained */}
      <div className="w-full max-w-7xl mx-auto px-6 sm:px-12 lg:px-16 pb-16 sm:pb-20 lg:pb-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5"
        >
          {featureCards.map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="group flex flex-col gap-5 p-6 sm:p-7 rounded-2xl
                         border border-[#D5CFD0] bg-[#F0EBEB]/60
                         transition-all duration-300 ease-in-out
                         hover:-translate-y-[5px]
                         hover:shadow-[0_12px_32px_rgba(0,0,0,0.07)]
                         hover:border-[#111111]/20
                         hover:bg-[#EDEAEA]"
            >
              <Icon
                className="w-5 h-5 text-[#111111] stroke-[1.75]
                           transition-transform duration-300 group-hover:scale-[1.06]"
              />
              <div>
                <h4 className="text-[15px] font-bold text-[#111111] mb-1.5 tracking-tight">
                  {title}
                </h4>
                <p className="text-[13px] text-[#6B6566] font-medium leading-relaxed">
                  {desc}
                </p>
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
