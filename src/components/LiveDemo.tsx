import { useEffect, useMemo, useRef, useState } from "react";
import type { FormEvent } from "react";
import { motion } from "framer-motion";
import { ArrowRight, ChevronDown } from "lucide-react";
import { coreFields, getGroups, nicheOwnedKeys } from "../data/fields";
import type { Group } from "../data/fields";
import { designs, getNiche } from "../data/niches";
import type { Design } from "../data/niches";
import { editIdFromLocation, loadPreviewForm, previewUrl, savePreview } from "../lib/previewStore";
import { buildSiteData, countFilled, validate } from "../lib/siteData";
import type { FieldValue, FormState, SiteData } from "../lib/siteData";
import { FieldControl, labelClass } from "./form/Field";
import { NicheSelect } from "./form/NicheSelect";
import { PreviewPanel } from "./PreviewPanel";
import { templates } from "../templates/registry";

const emptyForm: FormState = { niche: "", design: "simple", values: {} };

// Opened from a preview's "Edit details" button (/?edit=<id>): start with that form filled in.
function startingForm(): FormState {
  const id = editIdFromLocation();
  return (id ? loadPreviewForm(id) : null) ?? emptyForm;
}

function StepBadge({ n }: { n: number }) {
  return (
    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#111111] text-[10px] font-bold text-white">
      {n}
    </span>
  );
}

// Moves focus to the first field with an error, opening its group first if it is collapsed.
function focusFirstInvalid(errors: Record<string, string>) {
  const nodes = document.querySelectorAll<HTMLElement>("[data-field]");
  for (const node of nodes) {
    if (errors[node.dataset["field"] ?? ""]) {
      node.closest("details")?.setAttribute("open", "");
      node.focus();
      return;
    }
  }
}

export function LiveDemo() {
  const [form, setForm] = useState<FormState>(startingForm);
  const [showErrors, setShowErrors] = useState(false);
  const [result, setResult] = useState<SiteData | null>(null);
  const [previewId, setPreviewId] = useState<string | null>(null);
  const previewRef = useRef<HTMLDivElement>(null);

  const errors = useMemo(() => validate(form), [form]);
  const groups = useMemo(() => getGroups(form.niche), [form.niche]);
  const visibleErrors = showErrors ? errors : {};

  useEffect(() => {
    if (result) previewRef.current?.scrollIntoView({ block: "start" });
  }, [result]);

  // Coming back from a preview to edit: drop ?edit= from the address bar and show the form.
  useEffect(() => {
    if (!editIdFromLocation()) return;
    window.history.replaceState(null, "", window.location.pathname);
    document.getElementById("live-demo")?.scrollIntoView({ block: "start" });
  }, []);

  function setValue(key: string, value: FieldValue) {
    setForm((prev) => ({ ...prev, values: { ...prev.values, [key]: value } }));
  }

  function changeNiche(id: string) {
    const next = getNiche(id)?.id ?? "";
    setForm((prev) => {
      const values = { ...prev.values };
      // Drop the old niche's own fields, but keep any that the new niche shares.
      if (prev.niche) {
        const keep: Set<string> = next ? nicheOwnedKeys(next) : new Set<string>();
        for (const key of nicheOwnedKeys(prev.niche)) {
          if (!keep.has(key)) delete values[key];
        }
      }
      return { ...prev, niche: next, values };
    });
  }

  function changeDesign(design: Design) {
    setForm((prev) => ({ ...prev, design }));
  }

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (Object.keys(errors).length > 0) {
      setShowErrors(true);
      focusFirstInvalid(errors);
      return;
    }
    const data = buildSiteData(form);
    // Open the finished site in its own tab. This runs inside the click, so pop-up blockers allow it.
    let id: string | null = null;
    if (templates[data.niche]?.[data.design]) {
      id = savePreview(form);
      if (id) window.open(previewUrl(id), "_blank");
    }
    setPreviewId(id);
    setResult(data);
  }

  function clearAll() {
    setForm(emptyForm);
    setShowErrors(false);
    setResult(null);
    setPreviewId(null);
  }

  function renderGroup(group: Group) {
    const allFields = group.blocks.flatMap((b) => b.fields);
    const filled = countFilled(allFields, form.values);

    // Until a niche is chosen, its own group is shown greyed out and can't be opened.
    if (group.blocks.length === 0) {
      return (
        <div
          key={group.id}
          className="rounded-xl border border-[#D5CFD0] bg-[#F4EFEF]/40 px-4 py-3 text-[14px] font-bold text-[#111111] opacity-60"
        >
          {group.title} <span className="font-medium text-[#6B6566]">({group.hint ?? "optional"})</span>
        </div>
      );
    }

    return (
      <details key={group.id} className="group rounded-xl border border-[#D5CFD0] bg-[#F4EFEF]/60">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-xl px-4 py-3 text-[14px] font-bold text-[#111111] [&::-webkit-details-marker]:hidden">
          <span>
            {group.title} <span className="font-medium text-[#6B6566]">(optional)</span>
          </span>
          <span className="flex items-center gap-3">
            {filled > 0 && (
              <span className="rounded-full bg-[#111111] px-2 py-0.5 text-[11px] font-semibold text-white">{filled} added</span>
            )}
            <ChevronDown className="h-4 w-4 text-[#6B6566] transition-transform duration-200 group-open:rotate-180" />
          </span>
        </summary>

        <div className="flex flex-col gap-6 px-4 pb-5 pt-2">
          {group.blocks.map((block, i) => (
            <div key={block.title ?? `block-${i}`} className="flex flex-col gap-4">
              {block.title && (
                <h4 className="text-[12px] font-bold uppercase tracking-[0.1em] text-[#6B6566]">{block.title}</h4>
              )}
              {block.fields.map((def) => (
                <FieldControl
                  key={def.key}
                  def={def}
                  value={form.values[def.key]}
                  error={visibleErrors[def.key]}
                  onChange={setValue}
                />
              ))}
            </div>
          ))}
        </div>
      </details>
    );
  }

  return (
    <section id="live-demo" className="w-full border-t border-[#D5CFD0]/40">
      <div className="mx-auto w-full max-w-7xl px-6 pt-16 sm:px-12 sm:pt-20 lg:px-16 lg:pt-24">
        <div className="grid grid-cols-1 items-start gap-12 lg:grid-cols-12 lg:gap-16">
          {/* Left: headline */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="flex flex-col items-start lg:sticky lg:top-8 lg:col-span-5"
          >
            <span className="mb-4 text-[13px] font-bold uppercase tracking-[0.18em] text-[#6B6566]">LIVE DEMO</span>
            <h2 className="text-[38px] font-bold leading-[1.08] tracking-[-0.02em] text-[#111111] sm:text-[48px] lg:text-[52px]">
              See your website{" "}
              <br className="hidden sm:inline" />
              <span className="font-serif font-normal italic">before</span> it goes live.
            </h2>
            <p className="mt-5 max-w-sm text-[16px] font-medium leading-[1.6] text-[#6B6566] sm:text-[17px]">
              Pick a niche, enter the business details, and get a personalized website preview. Six details are all it takes.
            </p>
          </motion.div>

          {/* Right: form card */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="lg:col-span-7"
          >
            <form
              noValidate
              autoComplete="off"
              onSubmit={handleSubmit}
              className="flex flex-col gap-6 rounded-2xl border border-[#D5CFD0] bg-white/70 p-6 shadow-[0_4px_24px_rgba(0,0,0,0.04)] backdrop-blur-sm sm:p-8"
            >
              {/* Step 1: niche and design */}
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <label htmlFor="niche" className={`flex items-center gap-2 ${labelClass}`}>
                    <StepBadge n={1} />
                    Choose your niche <span className="text-red-700" aria-hidden="true">*</span>
                  </label>
                  <NicheSelect
                    value={form.niche}
                    onChange={changeNiche}
                    invalid={Boolean(visibleErrors["niche"])}
                    describedBy={visibleErrors["niche"] ? "niche-error" : undefined}
                  />
                  {visibleErrors["niche"] && (
                    <p id="niche-error" className="text-[12px] font-medium text-red-700">
                      {visibleErrors["niche"]}
                    </p>
                  )}
                </div>

                <fieldset className="flex flex-col gap-2">
                  <legend className="mb-2 text-[13px] font-bold text-[#111111]">Design</legend>
                  <div className="grid grid-cols-2 gap-3">
                    {designs.map((d) => (
                      <label
                        key={d.id}
                        className={`flex cursor-pointer flex-col rounded-xl border px-4 py-3 transition-colors duration-200 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-[#111111]/40 ${
                          form.design === d.id
                            ? "border-[#111111] bg-white"
                            : "border-[#D5CFD0] bg-[#F4EFEF]/80 hover:bg-white"
                        }`}
                      >
                        <input
                          type="radio"
                          name="design"
                          value={d.id}
                          checked={form.design === d.id}
                          onChange={() => changeDesign(d.id)}
                          className="sr-only"
                        />
                        <span className="text-[14px] font-bold text-[#111111]">{d.label}</span>
                        <span className="text-[12px] font-medium text-[#6B6566]">{d.hint}</span>
                      </label>
                    ))}
                  </div>
                </fieldset>
              </div>

              {/* Step 2: the compulsory details */}
              <div className="flex flex-col gap-4">
                <p className={`flex items-center gap-2 ${labelClass}`}>
                  <StepBadge n={2} />
                  Business details
                </p>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {coreFields.map((def) => (
                    <FieldControl
                      key={def.key}
                      def={def}
                      value={form.values[def.key]}
                      error={visibleErrors[def.key]}
                      onChange={setValue}
                    />
                  ))}
                </div>
              </div>

              {/* Step 3: everything else is optional */}
              <div className="flex flex-col gap-3">
                <p className={`flex items-center gap-2 ${labelClass}`}>
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#D5CFD0] text-[10px] font-bold text-[#6B6566]">
                    3
                  </span>
                  Add more detail <span className="font-medium text-[#A09A9B]">(optional)</span>
                </p>
                {groups.map(renderGroup)}
              </div>

              {showErrors && Object.keys(errors).length > 0 && (
                <p className="text-[13px] font-medium text-red-700" role="alert">
                  Please fix the {Object.keys(errors).length === 1 ? "field" : "fields"} marked above.
                </p>
              )}

              <div className="flex flex-col gap-3">
                <button
                  type="submit"
                  className="flex w-full cursor-pointer items-center justify-center gap-2.5 rounded-xl bg-[#111111] py-3.5 text-[15px] font-semibold text-white transition-colors duration-200 hover:bg-black"
                >
                  Generate my preview
                  <ArrowRight className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={clearAll}
                  className="self-center text-[13px] font-semibold text-[#6B6566] underline-offset-4 hover:text-[#111111] hover:underline"
                >
                  Clear the form
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      </div>

      {/* Preview */}
      <div
        ref={previewRef}
        className="mx-auto mt-12 w-full max-w-7xl px-6 pb-16 sm:px-12 sm:pb-20 lg:px-16 lg:pb-24"
        aria-live="polite"
      >
        <PreviewPanel data={result} previewId={previewId} />
      </div>
    </section>
  );
}
