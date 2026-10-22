import { designs, getNiche } from "../data/niches";
import type { SiteData } from "./siteData";

// A preview opens in its own browser tab, so the generated site data is handed over through
// localStorage (shared by every tab of this site). Only the last few previews are kept.
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

// Stores the preview and returns its id, or null if the browser won't store it
// (private mode, or the images are too big for the storage limit).
export function savePreview(data: SiteData): string | null {
  const json = JSON.stringify(data);
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

function isText(v: unknown): v is string {
  return typeof v === "string";
}

function isSiteData(v: unknown): v is SiteData {
  if (typeof v !== "object" || v === null) return false;
  const o = v as Record<string, unknown>;
  const fields = o["fields"];
  return (
    isText(o["niche"]) &&
    getNiche(o["niche"]) !== undefined &&
    isText(o["design"]) &&
    designs.some((d) => d.id === o["design"]) &&
    ["businessName", "ownerName", "phone", "whatsapp", "city", "tagline", "about", "brandColor"].every((k) => isText(o[k])) &&
    typeof fields === "object" &&
    fields !== null
  );
}

export function loadPreview(id: string): SiteData | null {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(PREFIX + id) ?? "null");
    return isSiteData(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export function previewUrl(id: string): string {
  const url = new URL(window.location.href);
  url.search = "";
  url.hash = "";
  url.searchParams.set("preview", id);
  return url.toString();
}

export function previewIdFromLocation(): string | null {
  return new URLSearchParams(window.location.search).get("preview") || null;
}
