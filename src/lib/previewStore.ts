import { designs, getNiche } from "../data/niches";
import { buildSiteData } from "./siteData";
import type { FormState, SiteData } from "./siteData";

// A preview opens in its own browser tab, so what the team typed is handed over through
// localStorage (shared by every tab of this site). The website itself is rebuilt from the form
// each time, which also lets "Edit details" put the form back as it was. Only the last few
// previews are kept.
const PREFIX = "oc-preview:";
const INDEX = "oc-preview-ids";
const KEEP = 5;

function readIds(): string[] {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(INDEX) ?? "[]");
    return Array.isArray(parsed) ? parsed.filter((x): x is string => typeof x === "string") : [];
  } catch {
    return [];
  }
}

function newId(): string {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

// Stores the form and returns the preview's id, or null if the browser won't store it
// (private mode, or the images are too big for the storage limit).
export function savePreview(form: FormState): string | null {
  const json = JSON.stringify(form);
  const attempt = (): string | null => {
    const id = newId();
    localStorage.setItem(PREFIX + id, json);
    const ids = [...readIds(), id];
    while (ids.length > KEEP) {
      const old = ids.shift();
      if (old) localStorage.removeItem(PREFIX + old);
    }
    localStorage.setItem(INDEX, JSON.stringify(ids));
    return id;
  };
  try {
    return attempt();
  } catch {
    // Probably full: drop the older previews and try once more.
    try {
      for (const old of readIds()) localStorage.removeItem(PREFIX + old);
      localStorage.removeItem(INDEX);
      return attempt();
    } catch {
      return null;
    }
  }
}

function isFormState(v: unknown): v is FormState {
  if (typeof v !== "object" || v === null) return false;
  const o = v as Record<string, unknown>;
  const values = o["values"];
  return (
    typeof o["niche"] === "string" &&
    getNiche(o["niche"]) !== undefined &&
    typeof o["design"] === "string" &&
    designs.some((d) => d.id === o["design"]) &&
    typeof values === "object" &&
    values !== null &&
    !Array.isArray(values)
  );
}

export function loadPreviewForm(id: string): FormState | null {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(PREFIX + id) ?? "null");
    return isFormState(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export function loadPreview(id: string): SiteData | null {
  const form = loadPreviewForm(id);
  if (!form) return null;
  try {
    return buildSiteData(form);
  } catch {
    return null;
  }
}

function baseUrl(): URL {
  const url = new URL(window.location.href);
  url.search = "";
  url.hash = "";
  return url;
}

export function previewUrl(id: string): string {
  const url = baseUrl();
  url.searchParams.set("preview", id);
  return url.toString();
}

// The generator page with the form filled in from a stored preview.
export function editUrl(id: string): string {
  const url = baseUrl();
  url.searchParams.set("edit", id);
  url.hash = "live-demo";
  return url.toString();
}

export function previewIdFromLocation(): string | null {
  return new URLSearchParams(window.location.search).get("preview") || null;
}

export function editIdFromLocation(): string | null {
  return new URLSearchParams(window.location.search).get("edit") || null;
}
