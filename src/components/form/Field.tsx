import { useId, useRef, useState } from "react";
import type { ChangeEvent, KeyboardEvent, ReactNode } from "react";
import { Link2, Plus, Trash2, Upload } from "lucide-react";
import type { FieldDef } from "../../data/fields";
import { MAX_FILE_BYTES, fileToCompressedDataUrl } from "../../lib/image";
import { normalizeUrl } from "../../lib/siteData";
import type { FieldValue, ListItem } from "../../lib/siteData";

export const inputClass =
  "w-full bg-[#F4EFEF]/80 border border-[#D5CFD0] rounded-xl px-4 py-3 text-[15px] text-[#111111] font-medium placeholder:text-[#A09A9B] focus:outline-none focus:border-[#111111]/40 transition-colors duration-200 aria-[invalid=true]:border-red-600";

export const labelClass = "text-[13px] font-bold text-[#111111]";

const smallButtonClass =
  "inline-flex items-center gap-1.5 rounded-lg border border-[#BCB6B7] bg-white/60 px-3 py-2 text-[13px] font-semibold text-[#111111] transition-colors duration-200 hover:bg-white disabled:cursor-not-allowed disabled:opacity-50";

// ---------------------------------------------------------------------------
// Image: upload from the device (resized automatically) or paste a link
// ---------------------------------------------------------------------------
interface ImageInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  maxDim?: number;
}

function ImageInput({ label, value, onChange, maxDim = 1600 }: ImageInputProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [draft, setDraft] = useState("");
  const [broken, setBroken] = useState(false);

  async function handleFile(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setMessage("Please choose an image file.");
      return;
    }
    if (file.size > MAX_FILE_BYTES) {
      setMessage("That image is over 15 MB. Choose a smaller one.");
      return;
    }
    setBusy(true);
    setMessage("");
    try {
      onChange(await fileToCompressedDataUrl(file, maxDim));
    } catch {
      setMessage("Couldn't read that image. Try another file or paste a link.");
    } finally {
      setBusy(false);
    }
  }

  function commitLink() {
    const trimmed = draft.trim();
    if (!trimmed) {
      setMessage("");
      return;
    }
    const url = normalizeUrl(trimmed);
    if (!url) {
      setMessage("That doesn't look like a valid link.");
      return;
    }
    setBroken(false);
    setMessage("");
    setDraft("");
    onChange(url);
  }

  function handleLinkKey(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault();
      commitLink();
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="sr-only"
        tabIndex={-1}
        aria-label={`Upload ${label}`}
        onChange={handleFile}
      />

      {value ? (
        <div className="flex items-center gap-3">
          <img
            key={value}
            src={value}
            alt=""
            onError={() => setBroken(true)}
            onLoad={() => setBroken(false)}
            className="h-14 w-14 shrink-0 rounded-lg border border-[#D5CFD0] bg-white object-cover"
          />
          <div className="flex flex-wrap gap-2">
            <button type="button" className={smallButtonClass} onClick={() => fileRef.current?.click()} disabled={busy}>
              <Upload className="h-3.5 w-3.5" />
              Replace
            </button>
            <button
              type="button"
              className={smallButtonClass}
              onClick={() => {
                onChange("");
                setBroken(false);
                setMessage("");
              }}
            >
              <Trash2 className="h-3.5 w-3.5" />
              Remove
            </button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <button type="button" className={smallButtonClass} onClick={() => fileRef.current?.click()} disabled={busy}>
            <Upload className="h-3.5 w-3.5" />
            {busy ? "Processing..." : "Upload image"}
          </button>
          <span className="text-[12px] font-medium text-[#6B6566]">or</span>
          <div className="flex min-w-0 flex-1 items-center gap-2">
            <input
              type="text"
              inputMode="url"
              value={draft}
              placeholder="Paste an image link"
              aria-label={`${label} link`}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setDraft(e.target.value)}
              onKeyDown={handleLinkKey}
              onBlur={commitLink}
              className="min-w-0 flex-1 rounded-lg border border-[#D5CFD0] bg-[#F4EFEF]/80 px-3 py-2 text-[13px] font-medium text-[#111111] placeholder:text-[#A09A9B] focus:border-[#111111]/40 focus:outline-none"
            />
            {draft.trim() && (
              <button type="button" className={smallButtonClass} onClick={commitLink}>
                <Link2 className="h-3.5 w-3.5" />
                Use link
              </button>
            )}
          </div>
        </div>
      )}

      {broken && (
        <p className="text-[12px] font-medium text-red-700" role="alert">
          This link doesn't load as an image. Use a direct image link, or upload the file.
        </p>
      )}
      {message && (
        <p className="text-[12px] font-medium text-red-700" role="alert">
          {message}
        </p>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// List: a repeatable group of small fields (projects, services, menu items ...)
// ---------------------------------------------------------------------------
let itemCounter = 0;
const nextItemId = () => `item-${(itemCounter += 1)}`;

interface ListInputProps {
  def: FieldDef;
  items: ListItem[];
  onChange: (items: ListItem[]) => void;
}

function ListInput({ def, items, onChange }: ListInputProps) {
  const max = def.max ?? 10;
  const itemName = def.itemName ?? "item";
  const subFields = def.fields ?? [];

  function addItem() {
    if (items.length >= max) return;
    onChange([...items, { id: nextItemId() }]);
  }

  function removeItem(id: string) {
    onChange(items.filter((item) => item.id !== id));
  }

  function updateItem(id: string, key: string, value: string) {
    onChange(items.map((item) => (item.id === id ? { ...item, [key]: value } : item)));
  }

  return (
    <div className="flex flex-col gap-3">
      {items.map((item, index) => (
        <div
          key={item.id}
          className="flex flex-col gap-2 rounded-xl border border-[#D5CFD0] bg-white/60 p-3"
        >
          <div className="flex items-center justify-between">
            <span className="text-[12px] font-bold text-[#6B6566]">
              {itemName.charAt(0).toUpperCase() + itemName.slice(1)} {index + 1}
            </span>
            <button
              type="button"
              aria-label={`Remove ${itemName} ${index + 1}`}
              onClick={() => removeItem(item.id)}
              className="rounded-md p-1 text-[#6B6566] transition-colors duration-200 hover:bg-[#F4EFEF] hover:text-[#111111]"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {subFields.map((sub) => {
              const subValue = item[sub.key] ?? "";
              if (sub.type === "image") {
                return (
                  <div key={sub.key} className="sm:col-span-2">
                    <ImageInput
                      label={`${itemName} ${index + 1} ${sub.label}`}
                      value={subValue}
                      maxDim={sub.maxDim ?? 1200}
                      onChange={(v) => updateItem(item.id, sub.key, v)}
                    />
                  </div>
                );
              }
              if (sub.type === "select") {
                return (
                  <select
                    key={sub.key}
                    aria-label={`${itemName} ${index + 1} ${sub.label}`}
                    value={subValue}
                    onChange={(e: ChangeEvent<HTMLSelectElement>) => updateItem(item.id, sub.key, e.target.value)}
                    className="w-full rounded-lg border border-[#D5CFD0] bg-[#F4EFEF]/80 px-3 py-2 text-[13px] font-medium text-[#111111] focus:border-[#111111]/40 focus:outline-none"
                  >
                    <option value="">{sub.label}</option>
                    {(sub.options ?? []).map((o) => (
                      <option key={o} value={o}>
                        {o}
                      </option>
                    ))}
                  </select>
                );
              }
              return (
                <input
                  key={sub.key}
                  type="text"
                  aria-label={`${itemName} ${index + 1} ${sub.label}`}
                  placeholder={sub.label}
                  value={subValue}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => updateItem(item.id, sub.key, e.target.value)}
                  className="w-full rounded-lg border border-[#D5CFD0] bg-[#F4EFEF]/80 px-3 py-2 text-[13px] font-medium text-[#111111] placeholder:text-[#A09A9B] focus:border-[#111111]/40 focus:outline-none"
                />
              );
            })}
          </div>
        </div>
      ))}

      <div className="flex items-center gap-3">
        <button type="button" className={smallButtonClass} onClick={addItem} disabled={items.length >= max}>
          <Plus className="h-3.5 w-3.5" />
          Add {itemName}
        </button>
        <span className="text-[12px] font-medium text-[#6B6566]">
          {items.length} of {max}
        </span>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// One field of any type, with its label, help text and error
// ---------------------------------------------------------------------------
interface FieldControlProps {
  def: FieldDef;
  value: FieldValue | undefined;
  error?: string;
  onChange: (key: string, value: FieldValue) => void;
}

export function FieldControl({ def, value, error, onChange }: FieldControlProps) {
  const id = useId();
  const helpId = `${id}-help`;
  const errorId = `${id}-error`;
  const text = typeof value === "string" ? value : "";
  const describedBy = [def.help ? helpId : "", error ? errorId : ""].filter(Boolean).join(" ") || undefined;
  const invalid = error ? true : undefined;

  const label = (
    <span className={labelClass}>
      {def.label}
      {def.required && (
        <span className="text-red-700" aria-hidden="true">
          {" "}
          *
        </span>
      )}
    </span>
  );

  let control: ReactNode;
  switch (def.type) {
    case "textarea":
      control = (
        <textarea
          id={id}
          data-field={def.key}
          rows={3}
          value={text}
          placeholder={def.placeholder}
          aria-invalid={invalid}
          aria-describedby={describedBy}
          onChange={(e: ChangeEvent<HTMLTextAreaElement>) => onChange(def.key, e.target.value)}
          className={`${inputClass} resize-y`}
        />
      );
      break;
    case "select":
      control = (
        <select
          id={id}
          data-field={def.key}
          value={text}
          aria-invalid={invalid}
          aria-describedby={describedBy}
          onChange={(e: ChangeEvent<HTMLSelectElement>) => onChange(def.key, e.target.value)}
          className={inputClass}
        >
          <option value="">Choose...</option>
          {(def.options ?? []).map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
      );
      break;
    case "color":
      control = (
        <div className="flex items-center gap-3">
          <input
            id={id}
            data-field={def.key}
            type="color"
            value={text || "#111111"}
            aria-describedby={describedBy}
            onChange={(e: ChangeEvent<HTMLInputElement>) => onChange(def.key, e.target.value)}
            className="h-11 w-14 cursor-pointer rounded-lg border border-[#D5CFD0] bg-transparent p-1"
          />
          <span className="text-[13px] font-medium text-[#6B6566]">{text ? text.toUpperCase() : "Default color"}</span>
          {text && (
            <button type="button" className={smallButtonClass} onClick={() => onChange(def.key, "")}>
              Reset
            </button>
          )}
        </div>
      );
      break;
    case "toggle":
      return (
        <label className="flex cursor-pointer items-center gap-3">
          <input
            type="checkbox"
            role="switch"
            data-field={def.key}
            checked={value === true}
            onChange={(e: ChangeEvent<HTMLInputElement>) => onChange(def.key, e.target.checked)}
            className="peer sr-only"
          />
          <span className="relative h-6 w-11 shrink-0 rounded-full bg-[#BCB6B7] transition-colors duration-200 after:absolute after:left-0.5 after:top-0.5 after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-transform after:content-[''] peer-checked:bg-[#111111] peer-checked:after:translate-x-5 peer-focus-visible:ring-2 peer-focus-visible:ring-[#111111]/40" />
          <span className={labelClass}>{def.label}</span>
        </label>
      );
    case "image":
      control = (
        <ImageInput
          label={def.label}
          value={text}
          maxDim={def.maxDim}
          onChange={(v) => onChange(def.key, v)}
        />
      );
      break;
    case "list":
      control = (
        <ListInput
          def={def}
          items={Array.isArray(value) ? value : []}
          onChange={(items) => onChange(def.key, items)}
        />
      );
      break;
    default:
      control = (
        <input
          id={id}
          data-field={def.key}
          type={def.type === "number" ? "number" : def.type === "tel" ? "tel" : def.type === "email" ? "email" : "text"}
          inputMode={def.type === "number" ? "numeric" : def.type === "url" ? "url" : undefined}
          min={def.type === "number" ? 0 : undefined}
          value={text}
          placeholder={def.placeholder}
          aria-invalid={invalid}
          aria-describedby={describedBy}
          onChange={(e: ChangeEvent<HTMLInputElement>) => onChange(def.key, e.target.value)}
          className={inputClass}
        />
      );
  }

  const usesLabelFor = def.type !== "image" && def.type !== "list";

  return (
    <div className="flex flex-col gap-2" role={usesLabelFor ? undefined : "group"} aria-label={usesLabelFor ? undefined : def.label}>
      {usesLabelFor ? <label htmlFor={id}>{label}</label> : label}
      {control}
      {def.help && (
        <p id={helpId} className="text-[12px] font-medium text-[#6B6566]">
          {def.help}
        </p>
      )}
      {error && (
        <p id={errorId} className="text-[12px] font-medium text-red-700">
          {error}
        </p>
      )}
    </div>
  );
}
