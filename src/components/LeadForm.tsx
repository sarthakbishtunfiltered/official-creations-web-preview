import { useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { ArrowRight, Check, ChevronDown } from "lucide-react";
import { siteConfig } from "../config";
import { BUDGET_OPTIONS, TIMELINE_OPTIONS, submitLead } from "../lib/leads";
import type { LeadInput, LeadKind } from "../lib/leads";
import { isValidPhone } from "../lib/siteData";
import { inputClass, labelClass } from "./form/Field";
import { NicheSelect } from "./form/NicheSelect";

const whatsappDigits = siteConfig.whatsappNumber.replace(/\D/g, "");

type Draft = Omit<LeadInput, "kind">;

const emptyDraft: Draft = {
  name: "",
  phone: "",
  email: "",
  business_name: "",
  niche: "",
  city: "",
  design: "",
  budget: "",
  timeline: "",
  details: "",
  website: "",
};

const kinds: { id: LeadKind; title: string; hint: string }[] = [
  { id: "sample", title: "Request a sample", hint: "We build a preview with your business details first." },
  { id: "order", title: "Place an order", hint: "You already know you want a website." },
];

const designChoices: { id: string; title: string; hint: string }[] = [
  { id: "", title: "Not sure", hint: "We'll suggest one" },
  { id: "simple", title: "Simple", hint: "Clean and quick" },
  { id: "premium", title: "Premium", hint: "Richer, more detail" },
];

const EMAIL = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

function validate(draft: Draft): Record<string, string> {
  const errors: Record<string, string> = {};

  if (draft.name.trim().length < 2) errors["name"] = "Please enter your name.";
  if (!isValidPhone(draft.phone)) errors["phone"] = "Enter a phone number with 10 digits.";
  if (draft.email.trim() && !EMAIL.test(draft.email.trim())) errors["email"] = "That email address does not look right.";
  if (draft.business_name.trim().length < 2) errors["business_name"] = "Please enter your business name.";
  if (!draft.niche) errors["niche"] = "Choose your business type.";
  if (draft.city.trim().length < 2) errors["city"] = "Please enter your city.";
  if (draft.details.length > 2000) errors["details"] = "Please keep this under 2000 characters.";

  return errors;
}

function ErrorText({ id, message }: { id: string; message: string | undefined }) {
  if (!message) return null;
  return (
    <p id={id} className="mt-1.5 text-[12px] font-medium text-red-700">
      {message}
    </p>
  );
}

export function LeadForm({ kind, onKindChange }: { kind: LeadKind; onKindChange: (kind: LeadKind) => void }) {
  const [draft, setDraft] = useState<Draft>(emptyDraft);
  const [showErrors, setShowErrors] = useState(false);
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState("");
  const [sentKind, setSentKind] = useState<LeadKind | null>(null);

  const errors = validate(draft);
  const shown = showErrors ? errors : {};
  // How many of the collapsed optional fields have something in them.
  const moreFilled = [draft.email, draft.design, draft.timeline, draft.details].filter((v) => v.trim() !== "").length;

  function set<K extends keyof Draft>(key: K, value: Draft[K]) {
    setDraft((prev) => ({ ...prev, [key]: value }));
  }

  function text(key: keyof Draft) {
    return {
      value: draft[key],
      onChange: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => set(key, e.target.value),
    };
  }

  function focusFirstInvalid() {
    const order = ["name", "phone", "business_name", "city", "niche", "email", "details"];
    const first = order.find((key) => errors[key]);
    if (!first) return;
    const field = document.getElementById(first);
    // A problem in the collapsed group: open it first, or the field can't take focus.
    field?.closest("details")?.setAttribute("open", "");
    field?.focus();
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (sending) return;

    if (Object.keys(errors).length > 0) {
      setShowErrors(true);
      focusFirstInvalid();
      return;
    }

    setSending(true);
    setSendError("");

    try {
      await submitLead({
        kind,
        ...draft,
        name: draft.name.trim(),
        phone: draft.phone.trim(),
        email: draft.email.trim(),
        business_name: draft.business_name.trim(),
        city: draft.city.trim(),
        details: draft.details.trim(),
      });
      setSentKind(kind);
    } catch (error) {
      setSendError(error instanceof Error ? error.message : "Something went wrong. Please try again.");
    } finally {
      setSending(false);
    }
  }

  function sendAnother() {
    setDraft(emptyDraft);
    setShowErrors(false);
    setSendError("");
    setSentKind(null);
  }

  if (sentKind) {
    return (
      <div
        role="status"
        className="flex flex-col items-start gap-4 rounded-2xl border border-[#D5CFD0] bg-white/70 p-6 shadow-[0_4px_24px_rgba(0,0,0,0.04)] sm:p-8"
      >
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-emerald-800">
          <Check className="h-5 w-5" aria-hidden="true" />
        </span>
        <h3 className="text-[28px] font-bold leading-[1.1] tracking-[-0.02em]">
          Thank you. <span className="font-serif font-normal italic">We have your request.</span>
        </h3>
        <p className="max-w-md text-[15px] font-medium leading-[1.6] text-[#6B6566]">
          {sentKind === "sample"
            ? "Our team will prepare a sample for your business and contact you on the number you gave."
            : "Our team will contact you on the number you gave to confirm the details of your order."}
        </p>
        <div className="flex flex-wrap items-center gap-3">
          {whatsappDigits && (
            <a
              href={`https://wa.me/${whatsappDigits}?text=${encodeURIComponent("Hi, I just sent a request on your website.")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-xl bg-[#111111] px-5 py-3 text-[14px] font-semibold text-white transition-colors duration-200 hover:bg-black"
            >
              Message us on WhatsApp
            </a>
          )}
          <button
            type="button"
            onClick={sendAnother}
            className="cursor-pointer text-[13px] font-semibold text-[#6B6566] underline-offset-4 hover:text-[#111111] hover:underline"
          >
            Send another request
          </button>
        </div>
      </div>
    );
  }

  return (
    <form
      noValidate
      autoComplete="on"
      onSubmit={handleSubmit}
      className="relative flex flex-col gap-6 rounded-2xl border border-[#D5CFD0] bg-white/70 p-6 shadow-[0_4px_24px_rgba(0,0,0,0.04)] backdrop-blur-sm sm:p-8"
    >
      {/* Trap for bots: people never see or reach this field. */}
      <div aria-hidden="true" className="absolute -left-[9999px] top-0 h-0 w-0 overflow-hidden">
        <label htmlFor="website">Leave this empty</label>
        <input
          id="website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={draft.website}
          onChange={(e: ChangeEvent<HTMLInputElement>) => set("website", e.target.value)}
        />
      </div>

      <fieldset className="flex flex-col gap-2">
        <legend className={`mb-2 ${labelClass}`}>What would you like?</legend>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {kinds.map((k) => (
            <label
              key={k.id}
              className={`flex cursor-pointer flex-col rounded-xl border px-4 py-3 transition-colors duration-200 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-[#111111]/40 ${
                kind === k.id ? "border-[#111111] bg-white" : "border-[#D5CFD0] bg-[#F4EFEF]/80 hover:bg-white"
              }`}
            >
              <input
                type="radio"
                name="kind"
                value={k.id}
                checked={kind === k.id}
                onChange={() => onKindChange(k.id)}
                className="sr-only"
              />
              <span className="text-[14px] font-bold text-[#111111]">{k.title}</span>
              <span className="text-[12px] font-medium text-[#6B6566]">{k.hint}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="name" className={`mb-2 block ${labelClass}`}>
            Your name <span className="text-red-700" aria-hidden="true">*</span>
          </label>
          <input
            id="name"
            type="text"
            autoComplete="name"
            className={inputClass}
            aria-invalid={Boolean(shown["name"])}
            aria-describedby={shown["name"] ? "name-error" : undefined}
            {...text("name")}
          />
          <ErrorText id="name-error" message={shown["name"]} />
        </div>

        <div>
          <label htmlFor="phone" className={`mb-2 block ${labelClass}`}>
            Phone or WhatsApp <span className="text-red-700" aria-hidden="true">*</span>
          </label>
          <input
            id="phone"
            type="tel"
            autoComplete="tel"
            inputMode="tel"
            placeholder="e.g. 98765 43210"
            className={inputClass}
            aria-invalid={Boolean(shown["phone"])}
            aria-describedby={shown["phone"] ? "phone-error" : undefined}
            {...text("phone")}
          />
          <ErrorText id="phone-error" message={shown["phone"]} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="business_name" className={`mb-2 block ${labelClass}`}>
            Business name <span className="text-red-700" aria-hidden="true">*</span>
          </label>
          <input
            id="business_name"
            type="text"
            autoComplete="organization"
            placeholder="e.g. Sunrise Interiors"
            className={inputClass}
            aria-invalid={Boolean(shown["business_name"])}
            aria-describedby={shown["business_name"] ? "business_name-error" : undefined}
            {...text("business_name")}
          />
          <ErrorText id="business_name-error" message={shown["business_name"]} />
        </div>

        <div>
          <label htmlFor="city" className={`mb-2 block ${labelClass}`}>
            City <span className="text-red-700" aria-hidden="true">*</span>
          </label>
          <input
            id="city"
            type="text"
            autoComplete="address-level2"
            placeholder="e.g. Ahmedabad"
            className={inputClass}
            aria-invalid={Boolean(shown["city"])}
            aria-describedby={shown["city"] ? "city-error" : undefined}
            {...text("city")}
          />
          <ErrorText id="city-error" message={shown["city"]} />
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="niche" className={`mb-2 block ${labelClass}`}>
            What kind of business is it? <span className="text-red-700" aria-hidden="true">*</span>
          </label>
          <NicheSelect
            value={draft.niche}
            onChange={(id) => set("niche", id)}
            invalid={Boolean(shown["niche"])}
            describedBy={shown["niche"] ? "niche-error" : undefined}
          />
          <ErrorText id="niche-error" message={shown["niche"]} />
        </div>
      </div>

      <div>
        <label htmlFor="budget" className={`mb-2 block ${labelClass}`}>
          Budget <span className="font-medium text-[#A09A9B]">(optional)</span>
        </label>
        <select id="budget" className={inputClass} {...text("budget")}>
          <option value="">Choose a range</option>
          {BUDGET_OPTIONS.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>

      <details className="group rounded-xl border border-[#D5CFD0] bg-[#F4EFEF]/60">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-xl px-4 py-3 text-[14px] font-bold text-[#111111] [&::-webkit-details-marker]:hidden">
          <span>
            Add more detail <span className="font-medium text-[#6B6566]">(optional)</span>
          </span>
          <span className="flex items-center gap-3">
            {moreFilled > 0 && (
              <span className="rounded-full bg-[#111111] px-2 py-0.5 text-[11px] font-semibold text-white">
                {moreFilled} added
              </span>
            )}
            <ChevronDown
              className="h-4 w-4 text-[#6B6566] transition-transform duration-200 group-open:rotate-180"
              aria-hidden="true"
            />
          </span>
        </summary>

        <div className="flex flex-col gap-5 px-4 pb-5 pt-2">
          <div>
            <label htmlFor="email" className={`mb-2 block ${labelClass}`}>
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              className={inputClass}
              aria-invalid={Boolean(shown["email"])}
              aria-describedby={shown["email"] ? "email-error" : undefined}
              {...text("email")}
            />
            <ErrorText id="email-error" message={shown["email"]} />
          </div>

          <fieldset className="flex flex-col gap-2">
            <legend className={`mb-2 ${labelClass}`}>Design style</legend>
            <div className="grid grid-cols-3 gap-3">
              {designChoices.map((d) => (
                <label
                  key={d.id || "none"}
                  className={`flex cursor-pointer flex-col rounded-xl border px-3 py-3 transition-colors duration-200 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-[#111111]/40 ${
                    draft.design === d.id ? "border-[#111111] bg-white" : "border-[#D5CFD0] bg-[#F4EFEF]/80 hover:bg-white"
                  }`}
                >
                  <input
                    type="radio"
                    name="design"
                    value={d.id}
                    checked={draft.design === d.id}
                    onChange={() => set("design", d.id)}
                    className="sr-only"
                  />
                  <span className="text-[14px] font-bold text-[#111111]">{d.title}</span>
                  <span className="text-[12px] font-medium text-[#6B6566]">{d.hint}</span>
                </label>
              ))}
            </div>
          </fieldset>

          <div>
            <label htmlFor="timeline" className={`mb-2 block ${labelClass}`}>
              When do you need it?
            </label>
            <select id="timeline" className={inputClass} {...text("timeline")}>
              <option value="">Choose one</option>
              {TIMELINE_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="details" className={`mb-2 block ${labelClass}`}>
              Anything we should know?
            </label>
            <textarea
              id="details"
              rows={4}
              placeholder="Your services, your style, a website you like, anything that helps."
              className={inputClass}
              aria-invalid={Boolean(shown["details"])}
              aria-describedby={shown["details"] ? "details-error" : undefined}
              {...text("details")}
            />
            <ErrorText id="details-error" message={shown["details"]} />
          </div>
        </div>
      </details>

      {showErrors && Object.keys(errors).length > 0 && (
        <p className="text-[13px] font-medium text-red-700" role="alert">
          Please fix the {Object.keys(errors).length === 1 ? "field" : "fields"} marked above.
        </p>
      )}

      {sendError && (
        <p
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-[13px] font-medium leading-[1.5] text-red-800 [overflow-wrap:anywhere]"
        >
          {sendError}
        </p>
      )}

      <button
        type="submit"
        disabled={sending}
        className="flex w-full cursor-pointer items-center justify-center gap-2.5 rounded-xl bg-[#111111] py-3.5 text-[15px] font-semibold text-white transition-colors duration-200 hover:bg-black disabled:cursor-not-allowed disabled:opacity-60"
      >
        {sending ? "Sending..." : kind === "sample" ? "Request my sample" : "Send my order request"}
        {!sending && <ArrowRight className="h-4 w-4" />}
      </button>

      <p className="text-center text-[12px] font-medium text-[#6B6566]">
        We only use your details to contact you about your website.
      </p>
    </form>
  );
}
