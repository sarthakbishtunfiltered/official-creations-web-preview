import { motion } from "framer-motion";
import { Layers, User, Send, Shield, Zap, Target, CheckCircle2, Sparkles } from "lucide-react";

export function BuiltDifferent() {
  const processItems = [
    {
      icon: Layers,
      title: "Premium Templates",
      desc: "Every niche has a high-converting, professionally designed template.",
      badge: "Pre-built & polished",
    },
    {
      icon: User,
      title: "Smart Personalization",
      desc: "Your business info replaces placeholders instantly and perfectly.",
      badge: "Real-time content swap",
    },
    {
      icon: Send,
      title: "Instant Delivery",
      desc: "Preview your website and go live with confidence.",
      badge: "Ready for deployment",
    },
  ];

  const valueCards = [
    {
      icon: Shield,
      title: "No generic designs",
      desc: "Every template is built for its industry and audience.",
    },
    {
      icon: Zap,
      title: "No waiting, no back & forth",
      desc: "See the exact result instantly — not days later.",
    },
    {
      icon: Target,
      title: "No guesswork",
      desc: "What you preview is exactly what you'll get.",
    },
    {
      icon: CheckCircle2,
      title: "Just perfect results",
      desc: "Designed to impress, built to convert.",
    },
  ];

  return (
    <section className="w-full max-w-7xl mx-auto px-6 sm:px-12 lg:px-16 py-16 sm:py-20 lg:py-24 border-t border-[#D5CFD0]/50">
      {/* Top Section: Split Title/Text & Dark Process Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
        {/* Left Column: Heading & Paragraphs */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="lg:col-span-5 flex flex-col items-start"
        >
          <span className="text-[13px] font-bold tracking-[0.15em] text-[#6B6566] uppercase mb-3">
            THE SYSTEM
          </span>

          <h2 className="text-[38px] sm:text-[48px] lg:text-[54px] font-bold text-[#111111] leading-[1.08] tracking-[-0.02em]">
            Built different.{" "}
            <span className="font-serif italic font-normal text-[#111111] block mt-1">
              Preview smarter.
            </span>
          </h2>

          <div className="mt-6 space-y-4 text-[16px] sm:text-[17px] text-[#6B6566] leading-[1.55] font-medium">
            <p>
              We don't build websites from scratch. We have a library of
              premium templates — built for results, not just looks.
            </p>
            <p>
              When you share your details, we instantly load the perfect match
              and personalize it in real time.
            </p>
          </div>
        </motion.div>

        {/* Right Column: Dark Process Card */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="lg:col-span-7 w-full"
        >
          <div className="bg-[#111111] text-white p-7 sm:p-9 rounded-2xl sm:rounded-3xl shadow-xl flex flex-col gap-6">
            <div>
              <span className="text-[12px] font-bold tracking-[0.15em] text-[#888888] uppercase block mb-1">
                OUR PROCESS
              </span>
              <h3 className="text-[24px] sm:text-[28px] font-bold text-white tracking-tight">
                Load. Personalize. Preview.
              </h3>
            </div>

            <div className="space-y-4 divide-y divide-[#262626]">
              {processItems.map((item, index) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.title}
                    className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                      index > 0 ? "pt-4" : ""
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-full bg-[#222222] border border-[#333333] text-white flex items-center justify-center shrink-0 mt-0.5 sm:mt-0">
                        <Icon className="w-5 h-5 stroke-[1.8]" />
                      </div>
                      <div>
                        <h4 className="text-[15px] font-bold text-white">
                          {item.title}
                        </h4>
                        <p className="text-[13px] text-[#A0A0A0] font-medium leading-snug max-w-sm mt-0.5">
                          {item.desc}
                        </p>
                      </div>
                    </div>

                    <span className="self-start sm:self-center px-3 py-1 bg-[#222222] text-[#CCCCCC] text-[12px] font-medium rounded-full border border-[#333333] shrink-0 whitespace-nowrap">
                      {item.badge}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </motion.div>
      </div>

      {/* 4 Feature Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6 mt-12 sm:mt-16">
        {valueCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className="bg-[#F4EFEF]/80 backdrop-blur-sm border border-[#D5CFD0] rounded-2xl p-6 sm:p-7 flex flex-col justify-between hover:bg-white transition-all duration-500 ease-in-out hover:-translate-y-[6px] hover:shadow-[0_16px_32px_rgba(0,0,0,0.08)] hover:border-[#111111]/30 group cursor-pointer"
            >
              <div>
                <div className="w-12 h-12 rounded-full border border-[#BCB6B7] bg-white/50 flex items-center justify-center text-[#111111] mb-6 group-hover:scale-[1.05] group-hover:bg-white transition-all duration-500 ease-in-out">
                  <Icon className="w-5 h-5 stroke-[1.8]" />
                </div>

                <h3 className="text-[19px] font-bold text-[#111111] mb-2">
                  {card.title}
                </h3>
                <div className="relative w-6 h-[2px] bg-[#111111] mb-3 overflow-hidden transition-all duration-500 ease-in-out group-hover:w-16">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/80 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out" />
                </div>
                <p className="text-[14px] text-[#6B6566] leading-[1.55] font-medium">
                  {card.desc}
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Bottom Highlight Strip */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="mt-6 bg-[#F4EFEF]/80 border border-[#D5CFD0] rounded-2xl p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6"
      >
        <div className="flex items-center gap-3.5 shrink-0">
          <div className="w-11 h-11 rounded-full bg-[#111111] text-white flex items-center justify-center shrink-0">
            <Sparkles className="w-5 h-5 stroke-[2]" />
          </div>
          <span className="font-bold text-[#111111] text-[15px] sm:text-[16px]">
            Real templates. Real results. Real fast.
          </span>
        </div>

        <div className="hidden sm:block w-[1px] h-6 bg-[#D5CFD0]" />

        <p className="text-[14px] text-[#6B6566] font-medium leading-relaxed">
          Our system is built to save you time and get you the perfect website
          preview in seconds.
        </p>
      </motion.div>
    </section>
  );
}
