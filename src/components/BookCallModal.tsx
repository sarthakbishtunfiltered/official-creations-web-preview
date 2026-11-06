import { useEffect, useId, useRef, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { siteConfig } from "../config";
import { submitLead } from "../lib/leads";
import { ArrowRightIcon, CheckIcon } from "./icons";
import { NicheSelect } from "./form/NicheSelect";
import { labelClass } from "./form/Field";
import { getNiche } from "../data/niches";

const inputClass =
  "w-full rounded-xl border border-[#E4DFD3] bg-[#FAF8F2] px-4 py-3 text-[15px] font-medium text-[#111111] placeholder:text-[#A8A396] transition-colors duration-200 focus:border-[#111111] focus:outline-none aria-[invalid=true]:border-red-600";

// 30-minute choices from 10:00 to 18:30 (India time)
const TIMES = Array.from({ length: 18 }, (_, i) => {
  const mins = 10 * 60 + i * 30;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  const label = `${h > 12 ? h - 12 : h}:${m === 0 ? "00" : "30"} ${h >= 12 ? "PM" : "AM"}`;
  return label;
});

function todayIso(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function prettyDate(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  if (!y || !m || !d) return iso;
  return new Date(y, m - 1, d).toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short", year: "numeric" });
}

const bookingUrl = siteConfig.bookingUrl.trim();
// Google only lets its full appointment-schedule address sit inside another website. The short
// calendar.app.google links refuse to load in a frame (the box stays blank), so those open in a new tab.
const canEmbed = /^https:\/\/calendar\.google\.com\/calendar\/appointments\/schedules\//.test(bookingUrl);

type Tab = "pick" | "suggest";

export function BookCallModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const titleId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);
  const [tab, setTab] = useState<Tab>(bookingUrl ? "pick" : "suggest");
  const [form, setForm] = useState({ name: "", phone: "", email: "", business: "", niche: "", date: "", time: "", message: "", website: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [serverError, setServerError] = useState("");

  const set = (key: keyof typeof form, value: string) => setForm((f) => ({ ...f, [key]: value }));
  const on = (key: keyof typeof form) => (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => set(key, e.target.value);

  // Escape closes, the page behind stops scrolling, and focus returns to the button that opened it.
  useEffect(() => {
    if (!open) return;
    const previous = document.activeElement as HTMLElement | null;
    const scrollY = window.scrollY;
    document.body.style.overflow = "hidden";
    dialogRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "Tab" && dialogRef.current) {
        const items = dialogRef.current.querySelectorAll<HTMLElement>(
          'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),iframe,[tabindex]:not([tabindex="-1"])',
        );
        const first = items[0];
        const last = items[items.length - 1];
        if (!first || !last) return;
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
      window.scrollTo(0, scrollY);
      previous?.focus();
    };
  }, [open, onClose]);

  if (!open) return null;

  function validate(): Record<string, string> {
    const e: Record<string, string> = {};
    if (form.name.trim().length < 2) e["name"] = "Please enter your name.";
    const digits = form.phone.replace(/\D/g, "");
    if (digits.length < 10 || digits.length > 13) e["phone"] = "Please enter a valid phone number.";
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email.trim())) e["email"] = "We need your email to send the invite.";
    if (form.business.trim().length < 2) e["business"] = "Please enter your business name.";
    if (!form.niche) e["niche"] = "Please choose your business type.";
    if (!form.date) e["date"] = "Choose a day.";
    else if (form.date < todayIso()) e["date"] = "Choose today or a later day.";
    if (!form.time) e["time"] = "Choose a time.";
    return e;
  }

  async function onSubmit(ev: FormEvent) {
    ev.preventDefault();
    const found = validate();
    setErrors(found);
    setServerError("");
    if (Object.keys(found).length > 0) return;
    setSending(true);
    try {
      const nicheLabel = getNiche(form.niche)?.label ?? form.niche;
      await submitLead({
        kind: "sample",
        name: form.name.trim(),
        phone: form.phone.trim(),
        email: form.email.trim(),
        business_name: form.business.trim(),
        niche: form.niche,
        city: "Not given",
        design: "",
        budget: "",
        timeline: "",
        details: `CALL REQUEST (${nicheLabel}). Preferred time: ${prettyDate(form.date)}, ${form.time} IST.${form.message.trim() ? " " + form.message.trim() : ""}`,
        website: form.website,
      });
      setSent(true);
    } catch (err) {
      setServerError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setSending(false);
    }
  }

  const err = (k: string) => errors[k];
  const fieldProps = (k: string) => ({ "aria-invalid": err(k) ? true : undefined, "aria-describedby": err(k) ? `${k}-err` : undefined });
  const Err = ({ k }: { k: string }) =>
    err(k) ? (
      <p id={`${k}-err`} role="alert" className="mt-1 text-[12.5px] font-semibold text-red-600">
        {err(k)}
      </p>
    ) : null;

  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center sm:items-center sm:p-6" role="presentation">
      <div className="absolute inset-0 bg-[#111111]/45" onClick={onClose} aria-hidden="true" />
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className="relative flex max-h-[92vh] w-full max-w-[560px] flex-col overflow-hidden rounded-t-[28px] bg-[#FCF9F2] shadow-[0_30px_80px_rgba(0,0,0,0.3)] outline-none sm:rounded-[28px]"
      >
        <div className="flex items-start justify-between gap-4 px-6 pb-4 pt-6 sm:px-8 sm:pt-8">
          <div>
            <h2 id={titleId} className="text-[26px] font-extrabold leading-[1.1] tracking-[-0.03em] sm:text-[30px]">
              Book a <span className="font-serif font-normal italic tracking-normal">call</span>
            </h2>
            <p className="mt-1.5 text-[14.5px] font-medium text-[#6B6657]">A short video call on Google Meet. No pressure.</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-full border border-[#111111]/20 text-[#111111] transition-colors hover:bg-[#111111] hover:text-white"
          >
            <svg viewBox="0 0 16 16" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" aria-hidden="true">
              <path d="M3.5 3.5l9 9M12.5 3.5l-9 9" />
            </svg>
          </button>
        </div>

        <div className="px-6 sm:px-8">
          <div role="tablist" aria-label="How to choose a time" className="flex gap-1 rounded-full bg-[#EDEAE2] p-1">
            {(
              [
                ["pick", "Pick a time"],
                ["suggest", "Suggest a time"],
              ] as const
            ).map(([id, label]) => (
              <button
                key={id}
                type="button"
                role="tab"
                aria-selected={tab === id}
                onClick={() => setTab(id)}
                className={`flex-1 cursor-pointer rounded-full px-3 py-2 text-[14px] font-semibold transition-colors duration-200 ${
                  tab === id ? "bg-[#111111] text-white" : "text-[#4A463C] hover:text-[#111111]"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-6 pb-8 pt-5 sm:px-8">
          {tab === "pick" ? (
            bookingUrl && canEmbed ? (
              <div>
                <iframe
                  title="Pick a time on Google Calendar"
                  src={bookingUrl}
                  className="h-[520px] w-full rounded-2xl border border-[#E4DFD3] bg-white"
                />
                <p className="mt-3 text-[13px] font-medium text-[#6B6657]">
                  Choose a slot and confirm. A Google Meet link arrives in your email.{" "}
                  <a href={bookingUrl} target="_blank" rel="noopener noreferrer" className="font-semibold text-[#111111] underline underline-offset-4">
                    Open in a new tab
                  </a>
                </p>
              </div>
            ) : bookingUrl ? (
              <div className="rounded-2xl bg-[#EDEAE2] p-6 text-center">
                <p className="text-[18px] font-extrabold tracking-[-0.02em]">See open times</p>
                <p className="mx-auto mt-2 max-w-sm text-[14.5px] font-medium leading-[1.6] text-[#4A463C]">
                  Pick a slot on our Google Calendar page. Once you confirm, a Google Meet link is emailed to you.
                </p>
                <a
                  href={bookingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-5 inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#111111] px-6 py-3.5 text-[15px] font-semibold text-white transition-colors hover:bg-black"
                >
                  Open booking page
                  <ArrowRightIcon className="h-4 w-4" />
                </a>
              </div>
            ) : (
              <p className="rounded-2xl bg-[#EDEAE2] p-4 text-[14.5px] font-medium leading-[1.55] text-[#4A463C]">
                Online time-picking isn't switched on yet. Use "Suggest a time" and we'll confirm with a Google Meet link.
              </p>
            )
          ) : sent ? (
            <div className="py-6 text-center" role="status">
              <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#D9F0E4]">
                <CheckIcon className="h-6 w-6" />
              </span>
              <p className="mt-4 text-[22px] font-extrabold tracking-[-0.02em]">Request sent</p>
              <p className="mx-auto mt-2 max-w-sm text-[15px] font-medium leading-[1.6] text-[#4A463C]">
                We'll confirm {prettyDate(form.date)} at {form.time} (IST) and email you a Google Meet link.
              </p>
              <button type="button" onClick={onClose} className="mt-6 cursor-pointer rounded-xl bg-[#111111] px-6 py-3 text-[15px] font-semibold text-white hover:bg-black">
                Done
              </button>
            </div>
          ) : (
            <form onSubmit={onSubmit} noValidate className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="hidden" aria-hidden="true">
                <label>
                  Website
                  <input tabIndex={-1} autoComplete="off" value={form.website} onChange={on("website")} />
                </label>
              </div>
              <div>
                <label htmlFor="bc-name" className={labelClass}>Your name</label>
                <input id="bc-name" autoComplete="name" className={`${inputClass} mt-1.5`} value={form.name} onChange={on("name")} {...fieldProps("name")} />
                <Err k="name" />
              </div>
              <div>
                <label htmlFor="bc-phone" className={labelClass}>Phone</label>
                <input id="bc-phone" type="tel" inputMode="tel" autoComplete="tel" className={`${inputClass} mt-1.5`} value={form.phone} onChange={on("phone")} {...fieldProps("phone")} />
                <Err k="phone" />
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="bc-email" className={labelClass}>Email (the invite goes here)</label>
                <input id="bc-email" type="email" autoComplete="email" className={`${inputClass} mt-1.5`} value={form.email} onChange={on("email")} {...fieldProps("email")} />
                <Err k="email" />
              </div>
              <div>
                <label htmlFor="bc-business" className={labelClass}>Business name</label>
                <input id="bc-business" autoComplete="organization" className={`${inputClass} mt-1.5`} value={form.business} onChange={on("business")} {...fieldProps("business")} />
                <Err k="business" />
              </div>
              <div>
                <span className={labelClass}>Business type</span>
                <div className="mt-1.5">
                  <NicheSelect fieldClass={inputClass} value={form.niche} onChange={(id) => set("niche", id)} invalid={Boolean(err("niche"))} describedBy={err("niche") ? "niche-err" : undefined} />
                </div>
                <Err k="niche" />
              </div>
              <div>
                <label htmlFor="bc-date" className={labelClass}>Day</label>
                <input id="bc-date" type="date" min={todayIso()} className={`${inputClass} mt-1.5`} value={form.date} onChange={on("date")} {...fieldProps("date")} />
                <Err k="date" />
              </div>
              <div>
                <label htmlFor="bc-time" className={labelClass}>Time (IST)</label>
                <select id="bc-time" className={`${inputClass} mt-1.5`} value={form.time} onChange={on("time")} {...fieldProps("time")}>
                  <option value="">Choose a time</option>
                  {TIMES.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
                <Err k="time" />
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="bc-msg" className={labelClass}>What would you like to talk about? <span className="font-medium text-[#8A8473]">(optional)</span></label>
                <textarea id="bc-msg" rows={3} maxLength={500} className={`${inputClass} mt-1.5 resize-none`} value={form.message} onChange={on("message")} />
              </div>
              {serverError && (
                <p role="alert" className="text-[13.5px] font-semibold text-red-600 sm:col-span-2">{serverError}</p>
              )}
              <div className="sm:col-span-2">
                <button type="submit" disabled={sending} className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#111111] px-6 py-3.5 text-[15px] font-semibold text-white transition-colors hover:bg-black disabled:cursor-not-allowed disabled:opacity-60">
                  {sending ? "Sending…" : "Request this time"}
                  {!sending && <ArrowRightIcon className="h-4 w-4" />}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
