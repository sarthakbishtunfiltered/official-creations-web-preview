import { useEffect, useId, useRef, useState } from "react";
import type { KeyboardEvent } from "react";
import { Check, ChevronDown } from "lucide-react";
import { getNiche, niches } from "../../data/niches";
import { inputClass } from "./Field";

interface Props {
  value: string;
  onChange: (id: string) => void;
  invalid?: boolean;
  describedBy?: string;
}

// Stops a click on an option from pulling focus off the trigger button.
function keepFocus(e: { preventDefault(): void }) {
  e.preventDefault();
}

// A styled replacement for the native <select>: the browser draws a native option list itself,
// so it cannot be styled. Keyboard: arrows, Home/End, Enter/Space to pick, Escape to close.
export function NicheSelect({ value, onChange, invalid, describedBy }: Props) {
  const listId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const selected = getNiche(value);

  useEffect(() => {
    if (!open) return;
    function onDown(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  useEffect(() => {
    if (open) document.getElementById(`${listId}-${active}`)?.scrollIntoView({ block: "nearest" });
  }, [open, active, listId]);

  function openList() {
    const i = niches.findIndex((n) => n.id === value);
    setActive(i >= 0 ? i : 0);
    setOpen(true);
  }

  function pick(index: number) {
    const niche = niches[index];
    if (niche) onChange(niche.id);
    setOpen(false);
  }

  function onKeyDown(e: KeyboardEvent<HTMLButtonElement>) {
    if (!open) {
      if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        e.preventDefault();
        openList();
      }
      return;
    }
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setActive((a) => Math.min(a + 1, niches.length - 1));
        break;
      case "ArrowUp":
        e.preventDefault();
        setActive((a) => Math.max(a - 1, 0));
        break;
      case "Home":
        e.preventDefault();
        setActive(0);
        break;
      case "End":
        e.preventDefault();
        setActive(niches.length - 1);
        break;
      case "Enter":
      case " ":
        e.preventDefault();
        pick(active);
        break;
      case "Escape":
        e.preventDefault();
        setOpen(false);
        break;
      case "Tab":
        setOpen(false);
        break;
    }
  }

  const SelectedIcon = selected?.icon;

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        id="niche"
        data-field="niche"
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        aria-activedescendant={open ? `${listId}-${active}` : undefined}
        aria-invalid={invalid ? true : undefined}
        aria-describedby={describedBy}
        onClick={() => (open ? setOpen(false) : openList())}
        onKeyDown={onKeyDown}
        className={`${inputClass} flex cursor-pointer items-center gap-3 pr-11 text-left ${
          open ? "border-[#111111]/40 bg-white" : "hover:bg-white"
        }`}
      >
        {SelectedIcon && (
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#111111] text-white">
            <SelectedIcon className="h-4 w-4 stroke-[1.8]" />
          </span>
        )}
        <span className={`truncate ${selected ? "" : "text-[#A09A9B]"}`}>
          {selected ? selected.label : "Select the business niche"}
        </span>
        <ChevronDown
          className={`pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6B6566] transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {open && (
        <ul
          id={listId}
          role="listbox"
          aria-label="Business niche"
          className="animate-pop absolute left-0 right-0 top-full z-30 mt-2 max-h-[320px] overflow-y-auto rounded-2xl border border-[#D5CFD0] bg-white p-1.5 shadow-[0_16px_40px_rgba(0,0,0,0.12)]"
        >
          {niches.map((n, i) => {
            const Icon = n.icon;
            const isSelected = n.id === value;
            return (
              <li
                key={n.id}
                id={`${listId}-${i}`}
                role="option"
                aria-selected={isSelected}
                data-value={n.id}
                onMouseEnter={() => setActive(i)}
                onMouseDown={keepFocus}
                onClick={() => pick(i)}
                className={`flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-[14px] font-semibold text-[#111111] transition-colors duration-100 ${
                  i === active ? "bg-[#F4EFEF]" : ""
                }`}
              >
                <span
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border transition-colors duration-100 ${
                    isSelected
                      ? "border-[#111111] bg-[#111111] text-white"
                      : "border-[#D5CFD0] bg-white text-[#111111]"
                  }`}
                >
                  <Icon className="h-4 w-4 stroke-[1.8]" />
                </span>
                <span className="flex-1">{n.label}</span>
                {isSelected && <Check className="h-4 w-4 shrink-0 text-[#111111]" />}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
