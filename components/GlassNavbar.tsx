import { useEffect, useState, type ReactNode } from "react";
import { motion } from "framer-motion";

export type GlassNavLink = {
  href: string;
  label: string;
};

type GlassNavbarProps = {
  links: GlassNavLink[];
  actions?: ReactNode;
};

export function GlassNavbar({ links, actions }: GlassNavbarProps) {
  const [activeHref, setActiveHref] = useState(links[0]?.href ?? "");
  const linkTargets = links.map((link) => link.href).join("|");

  useEffect(() => {
    const sections = links
      .map((link) => document.querySelector<HTMLElement>(link.href))
      .filter((section): section is HTMLElement => Boolean(section));

    if (!sections.length || typeof IntersectionObserver === "undefined") return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

        if (visible?.target instanceof HTMLElement) {
          setActiveHref(`#${visible.target.id}`);
        }
      },
      {
        rootMargin: "-22% 0px -62% 0px",
        threshold: [0, 0.15, 0.35, 0.6],
      }
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, [linkTargets]);

  return (
    <header className="oc-glass-header sticky top-0 z-50 px-3 pt-3 sm:px-5 sm:pt-4">
      <div className="oc-glass-nav mx-auto flex w-full max-w-[1380px] items-center justify-between gap-2 rounded-full px-3 py-2 sm:px-4 sm:py-2.5">
        <a
          href="/"
          aria-label="Official Creations home"
          className="flex min-w-0 shrink-0 items-center gap-2 rounded-full py-1 pl-1 pr-2"
        >
          <img
            src="/OC_Black-removebg-preview.png"
            alt=""
            width={32}
            height={32}
            className="h-8 w-8 object-contain"
          />
          <span className="hidden whitespace-nowrap text-[14px] font-extrabold tracking-[-0.035em] text-[#171614] sm:inline">
            Official Creations
          </span>
          <span className="whitespace-nowrap text-[15px] font-extrabold tracking-[-0.045em] text-[#171614] sm:hidden">
            OC
          </span>
        </a>

        <nav aria-label="Page sections" className="oc-glass-links hidden items-center gap-0.5 lg:flex">
          {links.map((link) => {
            const isActive = activeHref === link.href;
            return (
              <motion.a
                key={link.href}
                href={link.href}
                onClick={() => setActiveHref(link.href)}
                aria-current={isActive ? "location" : undefined}
                className={`relative isolate whitespace-nowrap rounded-full px-4 py-2.5 text-[13px] font-semibold transition-colors duration-200 ${
                  isActive ? "text-[#171614]" : "text-[#625E59] hover:text-[#171614]"
                }`}
              >
                {isActive && (
                  <motion.span
                    layoutId="oc-glass-active-tab"
                    className="oc-glass-active-pill absolute inset-0 -z-10 rounded-full"
                    transition={{ type: "spring", stiffness: 430, damping: 34, mass: 0.75 }}
                  />
                )}
                <span className="relative">{link.label}</span>
              </motion.a>
            );
          })}
        </nav>

        <div className="flex shrink-0 items-center justify-end gap-1.5 sm:gap-2">
          {actions}
        </div>
      </div>
    </header>
  );
}
