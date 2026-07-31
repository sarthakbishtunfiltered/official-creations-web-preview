import { motion } from "framer-motion";
import { LayoutGrid, Pencil, Eye, Rocket, Zap, Shield, Sparkles, CheckCircle2 } from "lucide-react";

export function HowItWorks() {
  const steps = [
    {
      num: "01",
      icon: LayoutGrid,
      title: "Choose your niche",
      desc: "Pick your business category from our premium collection of templates.",
    },
    {
      num: "02",
      icon: Pencil,
      title: "Add your details",
      desc: "Share your business information and we'll personalize everything for you.",
    },
    {
      num: "03",
      icon: Eye,
      title: "Instant preview",
      desc: "See your fully personalized website preview instantly — no waiting, no setup.",
    },
    {
      num: "04",
      icon: Rocket,
      title: "Get your website",
      desc: "Approve your preview and we'll deliver a website that's ready to go live.",
    },
  ];

  const features = [
    {
      icon: Zap,
      title: "Instant & effortless",
      desc: "See your site come to life in seconds.",
    },
    {
      icon: Shield,
      title: "100% personalized",
      desc: "Tailored to your business and brand.",
    },
    {
      icon: Sparkles,
      title: "Premium templates",
      desc: "Professionally designed for every industry.",
    },
    {
      icon: CheckCircle2,
      title: "No commitment",
      desc: "Preview first, decide later.",
    },
  ];

  return (
    <section className="w-full max-w-7xl mx-auto px-6 sm:px-12 lg:px-16 py-16 sm:py-20 lg:py-24">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="flex flex-col items-start"
      >
        <span className="text-[13px] font-bold tracking-[0.15em] text-[#6B6566] uppercase mb-3">
          HOW IT WORKS
        </span>
        <h2 className="text-[38px] sm:text-[48px] lg:text-[54px] font-bold text-[#111111] leading-[1.1] tracking-[-0.02em]">
          Preview your perfect{" "}
          <br className="hidden sm:inline" />
          website{" "}
          <span className="font-serif italic font-normal text-[#111111]">
            in minutes.
          </span>
        </h2>
        <p className="mt-4 text-[17px] sm:text-[19px] text-[#6B6566] leading-[1.5] font-medium max-w-2xl">
          We've made the process simple, fast, and transparent.
          <br className="hidden sm:inline" />
          See your future website — before it goes live.
        </p>
      </motion.div>

      {/* 4 Process Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6 mt-12 sm:mt-16">
        {steps.map((step, idx) => {
          const Icon = step.icon;
          return (
            <motion.div
              key={step.num}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className="bg-[#F4EFEF]/80 backdrop-blur-sm border border-[#D5CFD0] rounded-2xl p-6 sm:p-7 flex flex-col justify-between hover:bg-white transition-all duration-500 ease-in-out hover:-translate-y-[6px] hover:shadow-[0_16px_32px_rgba(0,0,0,0.08)] hover:border-[#111111]/30 group cursor-pointer"
            >
              <div>
                {/* Top Icon & Step indicator */}
                <div className="flex items-center justify-between w-full">
                  <div className="w-14 h-14 rounded-full bg-[#111111] flex items-center justify-center text-white shrink-0 group-hover:scale-[1.05] transition-transform duration-500 ease-in-out">
                    <Icon className="w-6 h-6 stroke-[1.8]" />
                  </div>
                  <div className="flex-1 border-t-2 border-dotted border-[#BCB6B7] mx-3" />
                  <div className="w-7 h-7 rounded-full bg-[#111111] text-white text-[11px] font-bold flex items-center justify-center shrink-0">
                    {step.num}
                  </div>
                </div>

                {/* Content */}
                <h3 className="text-[20px] font-bold text-[#111111] mt-7 mb-2">
                  {step.title}
                </h3>
                <div className="relative w-6 h-[2px] bg-[#111111] mb-3 overflow-hidden transition-all duration-500 ease-in-out group-hover:w-16">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/80 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out" />
                </div>
                <p className="text-[14px] text-[#6B6566] leading-[1.55] font-medium">
                  {step.desc}
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Bottom Feature Strip */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="mt-6 bg-[#F4EFEF]/80 border border-[#D5CFD0] rounded-2xl p-5 sm:p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 items-center"
      >
        {features.map((feat) => {
          const Icon = feat.icon;
          return (
            <div key={feat.title} className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-full bg-[#111111] text-white flex items-center justify-center shrink-0">
                <Icon className="w-5 h-5 stroke-[2]" />
              </div>
              <div>
                <h4 className="text-[14px] font-bold text-[#111111]">
                  {feat.title}
                </h4>
                <p className="text-[12px] text-[#6B6566] font-medium leading-tight">
                  {feat.desc}
                </p>
              </div>
            </div>
          );
        })}
      </motion.div>
    </section>
  );
}
