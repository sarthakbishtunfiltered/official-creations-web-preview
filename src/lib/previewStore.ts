import { siteConfig } from "../config";
import { designs, getNiche } from "../data/niches";
import { buildSiteData } from "./siteData";
import type { FormState, SiteData } from "./siteData";
import { supabase } from "./supabase";

// Previews live in the Supabase "previews" table. Each one has a long random link code, and
// the link a client opens is "/?preview=<code>". Only signed-in team members can create or edit
// a preview; anyone with the code can open it while it is active and not expired.

// Photos travel inside the preview for now, so keep the whole thing to a sensible size.
const MAX_FORM_CHARS = 4_000_000;

function messageOf(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === "object" && error !== null && "message" in error) return String(error.message);
  return String(error);
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

// Saves a new preview, or updates the one with this link code. Returns the link code.
// Throws a readable message if it can't be saved.
export async function savePreview(form: FormState, token: string | null = null): Promise<string> {
  if (JSON.stringify(form).length > MAX_FORM_CHARS) {
    throw new Error("The photos are too large to save. Use smaller photos, or paste image links instead.");
  }

  const { data, error } = await supabase.rpc("save_preview", { p_form: form, p_token: token });

  if (error) throw new Error(messageOf(error));

  const saved = typeof data === "object" && data !== null ? (data as Record<string, unknown>)["token"] : null;

  if (typeof saved !== "string" || saved === "") {
    throw new Error("The preview could not be saved. Please try again.");
  }

  return saved;
}

// Team only: the form as it was saved, for "Edit details".
export async function loadFormForEdit(token: string): Promise<FormState | null> {
  const { data, error } = await supabase.rpc("get_preview_form", { p_token: token });

  if (error) throw new Error(messageOf(error));

  return isFormState(data) ? data : null;
}

export type PublicPreview =
  | { status: "ok"; data: SiteData; live: boolean }
  | { status: "expired"; businessName: string }
  | { status: "disabled"; businessName: string }
  | { status: "not_found" }
  | { status: "error"; message: string };

// What a visitor gets when they open a link. count=false is used for the Tablet and Phone
// frames, so one visit is not counted several times.
export async function loadPublicPreview(token: string, count: boolean): Promise<PublicPreview> {
  try {
    const { data, error } = await supabase.rpc("get_public_preview", { p_token: token, p_count: count });

    if (error) throw error;

    const result = typeof data === "object" && data !== null ? (data as Record<string, unknown>) : {};
    const status = result["status"];
    const businessName = typeof result["business_name"] === "string" ? result["business_name"] : "";

    if (status === "ok") {
      const form = result["form"];
      if (!isFormState(form)) return { status: "not_found" };
      return { status: "ok", data: buildSiteData(form), live: result["live"] !== false };
    }

    if (status === "expired") return { status: "expired", businessName };
    if (status === "disabled") return { status: "disabled", businessName };

    return { status: "not_found" };
  } catch (error) {
    return { status: "error", message: messageOf(error) };
  }
}

// ---- Links -------------------------------------------------------------------------------

function currentSiteUrl(): URL {
  const url = new URL(window.location.href);
  url.pathname = "/";
  url.search = "";
  url.hash = "";
  return url;
}

function withParam(base: URL, key: string, value: string): string {
  base.searchParams.set(key, value);
  return base.toString();
}

// The link to send a client: on the public address if one is set, otherwise the current one.
export function previewUrl(token: string): string {
  let base = currentSiteUrl();
  if (siteConfig.publicUrl) {
    try {
      base = new URL(siteConfig.publicUrl);
      base.pathname = "/";
      base.search = "";
      base.hash = "";
    } catch {
      base = currentSiteUrl();
    }
  }
  return withParam(base, "preview", token);
}

// The same preview on the address this page is open at: what the team opens themselves.
export function localPreviewUrl(token: string): string {
  return withParam(currentSiteUrl(), "preview", token);
}

// The generator page with the form filled in from a saved preview.
export function editUrl(token: string): string {
  const url = currentSiteUrl();
  url.searchParams.set("edit", token);
  url.hash = "live-demo";
  return url.toString();
}

export function previewIdFromLocation(): string | null {
  return new URLSearchParams(window.location.search).get("preview") || null;
}

export function editIdFromLocation(): string | null {
  return new URLSearchParams(window.location.search).get("edit") || null;
}
