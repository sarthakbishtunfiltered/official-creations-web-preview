import { motion } from "framer-motion";
import {
  Stethoscope,
  Armchair,
  Camera,
  Scissors,
  Dumbbell,
  Building2,
  GraduationCap,
  ChefHat,
  Scale,
  Home,
  Sparkles,
  Layers,
  Smartphone,
  Palette,
} from "lucide-react";

const niches = [
  { label: "Dentists", icon: Stethoscope },
  { label: "Interior Designers", icon: Armchair },
  { label: "Wedding Photographers", icon: Camera },
  { label: "Salons", icon: Scissors },
  { label: "Yoga & Fitness", icon: Dumbbell },
  { label: "Architects", icon: Building2 },
  { label: "Coaching Institutes", icon: GraduationCap },
  { label: "Home Bakers", icon: ChefHat },
  { label: "CA Firms & Legal Practices", icon: Scale },
  { label: "Real Estate", icon: Home },
];

// Quadruple for seamless infinite loop
const marqueeItems = [...niches, ...niches, ...niches, ...niches];

const featureCards = [
  {
    icon: Sparkles,
    title: "Industry-Specific",
    desc: "Templates crafted for your niche and target audience.",
  },
  {
    icon: Layers,
    title: "Conversion-Focused",
    desc: "Designed to attract, engage, and convert visitors.",
  },
  {
    icon: Smartphone,
    title: "Fully Responsive",
    desc: "Flawless presentation across every device and screen size.",
  },
  {
    icon: Palette,
    title: "Easy Customization",
    desc: "Request changes anytime and we'll refine it for you.",
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
              Select your industry and get an instantly personalized website
              preview — built to represent your business perfectly.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="flex items-center gap-2 text-[13px] font-semibold text-[#111111] tracking-wide shrink-0 pb-1"
          >
            <span>✦</span>
            <span>10+ Niches • Updated regularly</span>
          </motion.div>
        </div>
      </div>

      {/* Marquee — full bleed, edge-faded */}
      <div
        className="mt-14 mb-14 w-full overflow-hidden"
        style={{
          maskImage:
            "linear-gradient(to right, transparent 0%, black 12%, black 88%, transparent 100%)",
          WebkitMaskImage:
            "linear-gradient(to right, transparent 0%, black 12%, black 88%, transparent 100%)",
        }}
      >
        <div className="animate-marquee flex items-center py-3" style={{ gap: "96px" }}>
          {marqueeItems.map((niche, idx) => {
            const Icon = niche.icon;
            return (
              <div
                key={`${niche.label}-${idx}`}
                className="group flex items-center gap-3.5 shrink-0 cursor-default select-none"
              >
                <Icon
                  className="w-[22px] h-[22px] text-[#111111] stroke-[1.6] flex-shrink-0
                             transition-transform duration-400 ease-out group-hover:scale-[1.08]"
                />
                <span
                  className="text-[17px] sm:text-[19px] font-medium text-[#111111]
                             tracking-[-0.01em] whitespace-nowrap
                             transition-all duration-300 ease-out
                             group-hover:font-semibold"
                >
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
                         cursor-pointer
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
