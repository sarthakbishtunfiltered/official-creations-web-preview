import { useState } from "react";
import { motion } from "framer-motion";
import { Zap, Monitor, Smartphone, ChevronDown, ArrowRight } from "lucide-react";

const niches = [
  "Restaurant",
  "Dental Clinic",
  "Salon",
  "Real Estate",
  "Yoga & Fitness",
  "Law Firm",
  "Bakery",
  "Photography",
  "Interior Design",
  "Coaching Institute",
];

export function LiveDemo() {
  const [selectedNiche, setSelectedNiche] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [generated, setGenerated] = useState(false);

  const displayBusiness = businessName.trim() || "Sunrise Bistro";
  const displayNiche = selectedNiche || "Restaurant";

  function handleGenerate() {
    setGenerated(true);
  }

  return (
    <section className="w-full border-t border-[#D5CFD0]/40">
      {/* Top split: headline left, form right */}
      <div className="w-full max-w-7xl mx-auto px-6 sm:px-12 lg:px-16 pt-16 sm:pt-20 lg:pt-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          {/* Left: Headline */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-5 flex flex-col items-start"
          >
            <span className="text-[13px] font-bold tracking-[0.18em] text-[#6B6566] uppercase mb-4">
              LIVE DEMO
            </span>
            <h2 className="text-[38px] sm:text-[48px] lg:text-[52px] font-bold text-[#111111] leading-[1.08] tracking-[-0.02em]">
              See your website{" "}
              <br className="hidden sm:inline" />
              <span className="font-serif italic font-normal">before</span>{" "}
              it goes live.
            </h2>
            <p className="mt-5 text-[16px] sm:text-[17px] text-[#6B6566] leading-[1.6] font-medium max-w-sm">
              Pick a niche, share your details, and we'll instantly load a
              personalized website preview for your business.
            </p>
          </motion.div>

          {/* Right: Form card */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="lg:col-span-7"
          >
            <div className="bg-white/70 backdrop-blur-sm border border-[#D5CFD0] rounded-2xl p-7 sm:p-8 shadow-[0_4px_24px_rgba(0,0,0,0.04)] flex flex-col gap-5">
              {/* Step 1 */}
              <div className="flex flex-col gap-2">
                <label className="flex items-center gap-2 text-[13px] font-bold text-[#111111]">
                  <span className="w-5 h-5 rounded-full bg-[#111111] text-white text-[10px] font-bold flex items-center justify-center shrink-0">
                    1
                  </span>
                  Choose your niche
                </label>
                <div className="relative">
                  <select
                    value={selectedNiche}
                    onChange={(e) => setSelectedNiche(e.target.value)}
                    className="w-full appearance-none bg-[#F4EFEF]/80 border border-[#D5CFD0] rounded-xl px-4 py-3 text-[15px] text-[#111111] font-medium focus:outline-none focus:border-[#111111]/40 transition-colors duration-200 cursor-pointer pr-10"
                  >
                    <option value="">Select your business niche</option>
                    {niches.map((n) => (
                      <option key={n} value={n}>{n}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B6566] pointer-events-none" />
                </div>
              </div>

              {/* Step 2 & 3 */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <label className="flex items-center gap-2 text-[13px] font-bold text-[#111111]">
                    <span className="w-5 h-5 rounded-full bg-[#111111] text-white text-[10px] font-bold flex items-center justify-center shrink-0">
                      2
                    </span>
                    Business name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Sunrise Bistro"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    className="bg-[#F4EFEF]/80 border border-[#D5CFD0] rounded-xl px-4 py-3 text-[15px] text-[#111111] font-medium placeholder:text-[#A09A9B] focus:outline-none focus:border-[#111111]/40 transition-colors duration-200"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="flex items-center gap-2 text-[13px] font-bold text-[#111111]">
                    <span className="w-5 h-5 rounded-full bg-[#D5CFD0] text-[#6B6566] text-[10px] font-bold flex items-center justify-center shrink-0">
                      3
                    </span>
                    Owner name{" "}
                    <span className="text-[#A09A9B] font-medium">(optional)</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Alex Rivera"
                    value={ownerName}
                    onChange={(e) => setOwnerName(e.target.value)}
                    className="bg-[#F4EFEF]/80 border border-[#D5CFD0] rounded-xl px-4 py-3 text-[15px] text-[#111111] font-medium placeholder:text-[#A09A9B] focus:outline-none focus:border-[#111111]/40 transition-colors duration-200"
                  />
                </div>
              </div>

              {/* CTA */}
              <button
                onClick={handleGenerate}
                className="w-full bg-[#111111] hover:bg-black text-white font-semibold text-[15px] py-3.5 rounded-xl flex items-center justify-center gap-2.5 transition-colors duration-200 cursor-pointer"
              >
                Generate my preview
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Browser Preview Mockup */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7, delay: 0.15 }}
        className="w-full max-w-7xl mx-auto px-6 sm:px-12 lg:px-16 pb-16 sm:pb-20 lg:pb-24 mt-12"
      >
        <div className="border border-[#D5CFD0] rounded-2xl sm:rounded-3xl bg-white/60 backdrop-blur-sm overflow-hidden shadow-[0_8px_40px_rgba(0,0,0,0.06)]">
          {/* Left panel */}
          <div className="grid grid-cols-1 lg:grid-cols-5">
            {/* Left info panel */}
            <div className="lg:col-span-2 p-7 sm:p-8 border-b lg:border-b-0 lg:border-r border-[#D5CFD0] flex flex-col justify-between gap-8">
              <div>
                <div className="flex items-center gap-2 mb-5">
                  <Zap className="w-4 h-4 text-[#111111]" />
                  <span className="text-[12px] font-bold tracking-[0.12em] text-[#111111] uppercase">
                    Instant Preview
                  </span>
                </div>
                <h3 className="text-[28px] sm:text-[32px] font-bold text-[#111111] leading-[1.1] tracking-[-0.02em]">
                  Your personalized{" "}
                  <span className="font-serif italic font-normal">
                    website preview
                  </span>{" "}
                  is ready.
                </h3>
              </div>

              <div className="flex flex-col gap-4">
                {[
                  { icon: Zap, label: "Live preview in seconds", sub: "No waiting, no setup." },
                  { icon: Monitor, label: "100% personalized", sub: "Your details. Your brand. Instantly." },
                  { icon: Smartphone, label: "Exactly how it will look", sub: "What you see is what you get." },
                ].map(({ icon: Icon, label, sub }) => (
                  <div key={label} className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#111111] text-white flex items-center justify-center shrink-0 mt-0.5">
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <span className="text-[14px] font-bold text-[#111111] block">{label}</span>
                      <span className="text-[12px] text-[#6B6566] font-medium">{sub}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: browser window mockup */}
            <div className="lg:col-span-3 flex flex-col">
              {/* Browser chrome */}
              <div className="flex items-center gap-2 px-5 py-3.5 border-b border-[#D5CFD0] bg-[#F4EFEF]/60">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-[#FF5F57]" />
                  <div className="w-3 h-3 rounded-full bg-[#FFBD2E]" />
                  <div className="w-3 h-3 rounded-full bg-[#27C93F]" />
                </div>
                <div className="flex-1 mx-3 bg-white/80 border border-[#D5CFD0] rounded-md px-3 py-1 text-[11px] text-[#6B6566] font-medium">
                  {displayBusiness.toLowerCase().replace(/\s+/g, "")}.official-preview.com
                </div>
              </div>

              {/* Simulated website */}
              <div className="flex-1 bg-white overflow-hidden">
                {/* Mini navbar */}
                <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-[#111111] rounded-sm" />
                    <span className="text-[11px] font-bold text-[#111111] tracking-wide uppercase">
                      {displayBusiness}
                    </span>
                  </div>
                  <div className="hidden sm:flex items-center gap-4">
                    {["Home", "About", "Menu", "Gallery", "Contact"].map((item) => (
                      <span key={item} className="text-[10px] text-[#6B6566] font-medium">
                        {item}
                      </span>
                    ))}
                    <div className="px-3 py-1.5 bg-[#111111] text-white text-[10px] font-semibold rounded-md">
                      Book a Table
                    </div>
                  </div>
                </div>

                {/* Hero */}
                <div className="grid grid-cols-5 min-h-[180px] sm:min-h-[220px]">
                  <div className="col-span-3 flex flex-col justify-center px-6 py-7 bg-white">
                    <h4 className="text-[20px] sm:text-[26px] font-bold text-[#111111] leading-[1.15] tracking-tight mb-3">
                      Delicious food,{" "}
                      <span className="font-serif italic font-normal">
                        memorable moments.
                      </span>
                    </h4>
                    <p className="text-[10px] sm:text-[11px] text-[#6B6566] leading-relaxed max-w-[200px] mb-5">
                      Welcome to {displayBusiness}, where every dish is made with passion and the finest ingredients.
                    </p>
                    <div className="flex items-center gap-2.5">
                      <div className="px-3 py-1.5 bg-[#111111] text-white text-[10px] font-semibold rounded-md">
                        View Menu
                      </div>
                      <div className="px-3 py-1.5 border border-gray-200 text-[#111111] text-[10px] font-medium rounded-md">
                        Book a Table
                      </div>
                    </div>
                  </div>
                  <div
                    className="col-span-2 bg-cover bg-center"
                    style={{
                      backgroundImage:
                        "url('https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&q=80')",
                    }}
                  />
                </div>

                {/* Bottom status bar */}
                <div className="flex items-center justify-between px-5 py-2.5 bg-[#F9F7F7] border-t border-gray-100">
                  <span className="text-[10px] text-[#6B6566] font-medium">
                    ⚡ This is a <span className="font-bold text-[#111111]">live preview</span>. You can request changes before we make it yours.
                  </span>
                  <span className="text-[10px] text-[#27C93F] font-semibold">
                    ✓ Looks perfect
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
