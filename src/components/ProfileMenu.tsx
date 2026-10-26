import { useEffect, useRef, useState } from "react";
import { supabase } from "../lib/supabase";
import type { TeamAccess } from "../lib/useTeamAccess";

type SignedIn = Extract<TeamAccess, { status: "approved" | "denied" }>;

// The round profile button in the corner once someone is signed in.
export function ProfileMenu({ access }: { access: SignedIn }) {
  const [open, setOpen] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  const approved = access.status === "approved";
  const initial = (access.email.trim().charAt(0) || "?").toUpperCase();

  // Owner or team member, for the label in the menu.
  useEffect(() => {
    if (!approved) return;
    let active = true;
    void supabase.rpc("is_owner_user").then(({ data, error }) => {
      if (active && !error) setIsOwner(data === true);
    });
    return () => {
      active = false;
    };
  }, [approved]);

  // Close on a click elsewhere or on Escape.
  useEffect(() => {
    if (!open) return;
    function onPointer(event: MouseEvent) {
      if (wrapRef.current && event.target instanceof Node && !wrapRef.current.contains(event.target)) {
        setOpen(false);
      }
    }
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  async function signOut() {
    await supabase.auth.signOut();
    window.location.href = "/";
  }

  const itemClass =
    "block w-full cursor-pointer rounded-lg px-3 py-2 text-left text-[14px] font-semibold text-[#111111] hover:bg-[#F4EFEF]";

  return (
    <div ref={wrapRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`Account menu, signed in as ${access.email}`}
        className="relative flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-[#111111] text-[15px] font-bold text-white transition-colors duration-200 hover:bg-black"
      >
        {initial}
        <span
          className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-[#EAE4E5] ${
            approved ? "bg-emerald-500" : "bg-amber-500"
          }`}
          aria-hidden="true"
        />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 z-50 mt-2 w-64 rounded-xl border border-[#D5CFD0] bg-white p-2 shadow-[0_12px_32px_rgba(0,0,0,0.12)]"
        >
          <div className="border-b border-[#D5CFD0] px-3 pb-3 pt-2">
            <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-[#6B6566]">
              {approved ? (isOwner ? "Signed in as owner" : "Signed in as team member") : "Not approved"}
            </p>
            <p className="mt-1 truncate text-[13px] font-semibold text-[#111111]">{access.email}</p>
          </div>

          <div className="pt-2">
            {approved && (
              <>
                <a role="menuitem" href="/dashboard" className={itemClass}>
                  Dashboard
                </a>
                <a role="menuitem" href="/#live-demo" onClick={() => setOpen(false)} className={itemClass}>
                  Generator
                </a>
              </>
            )}
            <button type="button" role="menuitem" onClick={() => void signOut()} className={`${itemClass} text-red-700`}>
              Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
