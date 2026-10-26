import { getNiche } from "../data/niches";
import type { Design, Family, NicheId } from "../data/niches";
import { TOP_LEVEL_KEYS, fieldsFor, fontStyleOptions } from "../data/fields";
import type { FieldDef } from "../data/fields";

// One row inside a list field (a project, a service, a menu item ...).
export interface ListItem {
  id: string;
  [key: string]: string;
}

export type FieldValue = string | boolean | ListItem[];
export type Values = Record<string, FieldValue>;

// What the form holds while the team is typing.
export interface FormState {
  niche: NicheId | "";
  design: Design;
  values: Values;
}

// What a template receives. Every one of the 20 templates reads this same shape.
export interface SiteData {
  niche: NicheId;
  nicheLabel: string;
  family: Family;
  design: Design;
  businessName: string;
  ownerName: string;
  phone: string;
  whatsapp: string;
  city: string;
  address: string;
  tagline: string;
  about: string;
  brandColor: string;
  // "modern", "classic" or "bold": which font look the template should use.
  fontStyle: string;
  logo: string;
  heroImage: string;
  // Everything else that was filled in. Blank fields are left out, so a
  // template shows a section only when its key exists here.
  fields: Record<string, FieldValue>;
  createdAt: string;
}

const DEFAULT_BRAND_COLOR = "#111111";

function text(value: FieldValue | undefined): string {
  return typeof value === "string" ? value.trim() : "";
}

export function isValidPhone(value: string): boolean {
  const digits = value.replace(/\D/g, "");
  return digits.length >= 10 && digits.length <= 13;
}

// Accepts "example.com/page" as well as full links; returns null if it isn't a web link.
export function normalizeUrl(input: string): string | null {
  const trimmed = input.trim();
  if (!trimmed) return null;
  const withScheme = /^[a-z][a-z0-9+.-]*:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  try {
    const url = new URL(withScheme);
    if (url.protocol !== "http:" && url.protocol !== "https:") return null;
    if (!url.hostname.includes(".")) return null;
    return url.toString();
  } catch {
    return null;
  }
}

// Checks only the fields that apply to the chosen niche. Returns { fieldKey: message }.
export function validate(state: FormState): Record<string, string> {
  const errors: Record<string, string> = {};
  if (!state.niche) errors["niche"] = "Choose a niche.";

  for (const def of fieldsFor(state.niche)) {
    const value = text(state.values[def.key]);
    if (!value) {
      if (def.required) errors[def.key] = `${def.label} is required.`;
      continue;
    }
    if (def.type === "tel" && !isValidPhone(value)) {
      errors[def.key] = "Enter a valid phone number (10 digits, or with country code).";
    } else if (def.type === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      errors[def.key] = "Enter a valid email address.";
    } else if (def.type === "url" && !normalizeUrl(value)) {
      errors[def.key] = "Enter a valid link, for example https://example.com.";
    } else if (def.type === "number" && !/^\d{1,4}$/.test(value)) {
      errors[def.key] = "Enter a whole number.";
    } else if (def.type === "color" && !/^#[0-9a-f]{6}$/i.test(value)) {
      errors[def.key] = "Pick a color.";
    }
  }
  return errors;
}

function cleanValue(def: FieldDef, raw: FieldValue | undefined): FieldValue | undefined {
  switch (def.type) {
    case "toggle":
      return raw === true ? true : undefined;
    case "list": {
      const items = Array.isArray(raw) ? raw : [];
      const cleaned: ListItem[] = [];
      for (const item of items) {
        const next: ListItem = { id: item.id };
        let hasContent = false;
        for (const sub of def.fields ?? []) {
          const subValue = (item[sub.key] ?? "").trim();
          if (!subValue) continue;
          next[sub.key] = sub.type === "url" ? (normalizeUrl(subValue) ?? subValue) : subValue;
          hasContent = true;
        }
        if (hasContent) cleaned.push(next);
      }
      return cleaned.length > 0 ? cleaned.slice(0, def.max ?? cleaned.length) : undefined;
    }
    case "url": {
      const value = text(raw);
      return value ? (normalizeUrl(value) ?? value) : undefined;
    }
    default: {
      const value = text(raw);
      return value ? value : undefined;
    }
  }
}

// Turns the validated form into the object a template reads, filling in the
// defaults for anything the team left blank.
export function buildSiteData(state: FormState): SiteData {
  const niche = getNiche(state.niche);
  if (!niche) throw new Error("Choose a niche before generating a site.");

  const get = (key: string) => text(state.values[key]);

  const fields: Record<string, FieldValue> = {};
  for (const def of fieldsFor(niche.id)) {
    if (TOP_LEVEL_KEYS.has(def.key)) continue;
    const cleaned = cleanValue(def, state.values[def.key]);
    if (cleaned !== undefined) fields[def.key] = cleaned;
  }

  const businessName = get("businessName");
  const ownerName = get("ownerName");
  const phone = get("phone");
  const city = get("city");
  const color = get("brandColor");
  const chosenFont = get("fontStyle").toLowerCase();
  const fontStyle = fontStyleOptions.some((o) => o.toLowerCase() === chosenFont) ? chosenFont : "modern";

  return {
    niche: niche.id,
    nicheLabel: niche.label,
    family: niche.family,
    design: state.design,
    businessName,
    ownerName,
    phone,
    whatsapp: get("whatsapp") || phone,
    city,
    address: get("address"),
    tagline: get("tagline") || niche.defaultTagline,
    about:
      get("about") ||
      `${businessName} is based in ${city} and led by ${ownerName}. Get in touch to talk about what you need.`,
    brandColor: /^#[0-9a-f]{6}$/i.test(color) ? color : DEFAULT_BRAND_COLOR,
    fontStyle: fontStyle,
    logo: get("logo"),
    heroImage: get("heroImage"),
    fields,
    createdAt: new Date().toISOString(),
  };
}

// How many optional fields in a group have something typed in (for the "3 added" badge).
export function countFilled(fieldsInGroup: FieldDef[], values: Values): number {
  let count = 0;
  for (const def of fieldsInGroup) {
    if (cleanValue(def, values[def.key]) !== undefined) count += 1;
  }
  return count;
}
