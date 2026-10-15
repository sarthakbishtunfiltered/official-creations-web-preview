import { motion } from "framer-motion";
import { Phone } from "lucide-react";
import { HowItWorks } from "./components/HowItWorks";
import { BuiltDifferent } from "./components/BuiltDifferent";
import { SupportedNiches } from "./components/SupportedNiches";
import { LiveDemo } from "./components/LiveDemo";

function App() {
  return (
    <div className="min-h-screen bg-[#EAE4E5] flex flex-col font-sans select-none overflow-x-hidden">
      {/* Navigation Bar */}
      <motion.header
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full max-w-7xl mx-auto px-6 sm:px-12 lg:px-16 pt-8 pb-4 flex items-center justify-between"
      >
        {/* Logo and Brand */}
        <div className="flex items-center gap-2.5">
          <img
            src="/OC_Black-removebg-preview.png"
            alt="Official Creations Logo"
            className="w-8 h-8 object-contain"
          />
          <span className="text-[19px] font-bold text-[#111111] tracking-tight">
            Official Creations
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <button className="px-5 py-2 border border-[#BCB6B7] bg-transparent text-[#111111] hover:bg-[#BCB6B7]/10 transition-colors duration-200 rounded-lg text-[14px] font-medium cursor-pointer">
            Login
          </button>

          <button className="flex items-center gap-2 px-5 py-2 border border-[#BCB6B7] bg-transparent text-[#111111] hover:bg-[#BCB6B7]/10 transition-colors duration-200 rounded-lg text-[14px] font-medium cursor-pointer">
            <Phone className="w-3.5 h-3.5 fill-[#111111] stroke-none rotate-[10deg]" />
            Book a call
          </button>

          <button className="px-5 py-2 bg-[#111111] text-white hover:bg-black transition-colors duration-200 rounded-lg text-[14px] font-semibold cursor-pointer">
            See pricing
          </button>
        </div>
      </motion.header>

      {/* Hero Section Container */}
      <main className="w-full max-w-7xl mx-auto px-6 sm:px-12 lg:pl-16 lg:pr-4 flex items-center justify-center py-16 lg:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center w-full">
          {/* Left Column: Heading & Paragraph */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut", delay: 0.1 }}
            className="lg:col-span-6 flex flex-col items-start"
          >
            {/* Main Headline */}
            <h1 className="text-[52px] sm:text-[50px] lg:text-[76px] font-semibold text-[#111111] leading-[1.05] tracking-[-0.03em] text-left">
              Imagine <br />
              your brand, <br />
              <span className="font-serif italic font-normal tracking-wide block mt-1">
                already online.
              </span>
            </h1>

            {/* Subtitle / Paragraph */}
            <p className="mt-8 text-[18px] sm:text-[20px] text-[#7F7A7B] leading-[1.4] text-left font-medium max-w-[460px]">
              Preview a professionally designed website{" "}
              <br className="hidden sm:inline" />
              personalized with your business name{" "}
              <br className="hidden sm:inline" />
              in seconds.
            </p>

            {/* Action CTAs */}
            <div className="flex items-center gap-4 mt-10">
              <button className="flex items-center bg-[#111111] text-white px-6 py-3.5 rounded-lg font-semibold text-[15px] hover:bg-black transition-colors duration-200 shadow-sm cursor-pointer">
                <span className="w-2.5 h-2.5 rounded-full bg-[#FFE600] mr-2.5 shrink-0 shadow-[0_0_8px_rgba(255,230,0,0.8)]" />
                Preview my website
              </button>

              <button className="border border-[#BCB6B7] bg-white/40 text-[#111111] px-6 py-3.5 rounded-lg font-semibold text-[15px] hover:bg-white/80 transition-colors duration-200 shadow-sm cursor-pointer">
                See pricing
              </button>
            </div>
          </motion.div>

          {/* Right Column: Floating Browser Mockup */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
            className="lg:col-span-6 w-full"
          >
            {/* Floating Browser Mockup */}
            <div className="w-full">
              <img
                src="/preview.png"
                alt="Website Preview"
                className="w-full h-auto block"
              />
            </div>
          </motion.div>
        </div>
      </main>

      {/* Section 1: How It Works */}
      <HowItWorks />

      {/* Section 2: Built Different */}
      <BuiltDifferent />

      {/* Section 3: Supported Niches */}
      <SupportedNiches />

      {/* Section 4: Live Demo */}
      <LiveDemo />
    </div>
  );
}

export default App;
