import { supabase } from "../lib/supabase";
import type { TeamAccess } from "../lib/useTeamAccess";

// Shown in place of the generator form until a team member is signed in.
export function TeamGate({ access }: { access: Exclude<TeamAccess, { status: "approved" }> }) {
  async function switchAccount() {
    await supabase.auth.signOut();
    window.location.href = "/login";
  }

  const button =
    "inline-flex cursor-pointer items-center justify-center rounded-xl bg-[#111111] px-6 py-3.5 text-[15px] font-semibold text-white transition-colors duration-200 hover:bg-black";

  return (
    <div className="flex flex-col items-start gap-5 rounded-2xl border border-[#D5CFD0] bg-white/70 p-6 shadow-[0_4px_24px_rgba(0,0,0,0.04)] backdrop-blur-sm sm:p-8">
      <span className="text-[12px] font-bold uppercase tracking-[0.18em] text-[#6B6566]">Team only</span>

      {access.status === "checking" && (
        <p role="status" className="text-[15px] font-medium text-[#6B6566]">
          Checking your access...
        </p>
      )}

      {access.status === "signed_out" && (
        <>
          <h3 className="text-[28px] font-bold leading-[1.1] tracking-[-0.02em]">
            Sign in to <span className="font-serif font-normal italic">generate</span> previews.
          </h3>
          <p className="max-w-md text-[15px] font-medium leading-[1.6] text-[#6B6566]">
            The generator is for the Official Creations team. Sign in with your approved email, then come back here.
          </p>
          <a href="/login" className={button}>
            Sign in
          </a>
        </>
      )}

      {access.status === "denied" && (
        <>
          <h3 className="text-[28px] font-bold leading-[1.1] tracking-[-0.02em]">
            This account isn&rsquo;t <span className="font-serif font-normal italic">approved.</span>
          </h3>
          <p role="alert" className="max-w-md text-[15px] font-medium leading-[1.6] text-[#6B6566] [overflow-wrap:anywhere]">
            {access.email} is not on the approved list. Ask the owner to approve it, or sign in with a different account.
          </p>
          <button type="button" onClick={() => void switchAccount()} className={button}>
            Use a different account
          </button>
        </>
      )}

      {access.status === "error" && (
        <>
          <h3 className="text-[28px] font-bold leading-[1.1] tracking-[-0.02em]">
            We couldn&rsquo;t check your <span className="font-serif font-normal italic">access.</span>
          </h3>
          <p role="alert" className="max-w-md text-[15px] font-medium leading-[1.6] text-red-800 [overflow-wrap:anywhere]">
            {access.message}
          </p>
          <button type="button" onClick={() => window.location.reload()} className={button}>
            Try again
          </button>
        </>
      )}
    </div>
  );
}
