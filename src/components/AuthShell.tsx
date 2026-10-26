import type { ReactNode } from "react";

// The frame shared by the sign-in, callback and access-check screens, in the homepage's look.
export function AuthShell({ children }: { children: ReactNode }) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-[#EAE4E5] px-5 py-10 font-sans text-[#111111]">
      <a href="/" className="mb-8 flex items-center gap-2.5">
        <img
          src="/OC_Black-removebg-preview.png"
          alt=""
          width={32}
          height={32}
          className="h-8 w-8 object-contain"
        />
        <span className="text-[19px] font-bold tracking-tight">Official Creations</span>
      </a>

      <div className="w-full max-w-[420px] rounded-2xl border border-[#D5CFD0] bg-white/70 p-6 shadow-[0_4px_24px_rgba(0,0,0,0.04)] backdrop-blur-sm sm:p-8">
        {children}
      </div>

      <a href="/" className="mt-6 text-[13px] font-semibold text-[#6B6566] hover:text-[#111111]">
        Back to the homepage
      </a>
    </main>
  );
}
