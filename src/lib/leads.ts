import { supabase } from "./supabase";

// Leads: businesses that filled in the form on the public homepage.
// Visitors can only send the form (submit_lead). Everything else is for approved team members.

export type LeadKind = "sample" | "order";
export type LeadStatus = "new" | "contacted" | "sample_sent" | "won" | "lost";

export interface Lead {
  id: string;
  created_at: string;
  updated_at: string;
  kind: LeadKind;
  name: string;
  phone: string;
  email: string | null;
  business_name: string;
  niche: string;
  city: string;
  design: string | null;
  budget: string | null;
  timeline: string | null;
  details: string | null;
  status: LeadStatus;
  notes: string | null;
  preview_token: string | null;
  handled_by_email: string | null;
}

export const LEAD_STATUS_LABELS: Record<LeadStatus, string> = {
  new: "New",
  contacted: "Contacted",
  sample_sent: "Sample sent",
  won: "Won",
  lost: "Lost",
};

export const LEAD_STATUSES = Object.keys(LEAD_STATUS_LABELS) as LeadStatus[];

// The choices in the visitor form. The wording is stored as written, so the team reads it as is.
export const BUDGET_OPTIONS = [
  "Under ₹10,000",
  "₹10,000 – ₹25,000",
  "₹25,000 – ₹50,000",
  "Above ₹50,000",
  "Not sure yet",
];

export const TIMELINE_OPTIONS = ["As soon as possible", "Within a month", "In 1–3 months", "Just exploring"];

export interface LeadInput {
  kind: LeadKind;
  name: string;
  phone: string;
  email: string;
  business_name: string;
  niche: string;
  city: string;
  design: string;
  budget: string;
  timeline: string;
  details: string;
  // The hidden trap field. People never see it, so it must stay empty.
  website: string;
}

function messageOf(error: unknown, fallback: string): string {
  if (error && typeof error === "object" && "message" in error && typeof error.message === "string") {
    return error.message;
  }
  return fallback;
}

// True when the database functions for leads have not been installed yet.
function isMissingFunction(message: string): boolean {
  return /schema cache|could not find the function|does not exist/i.test(message);
}

// A visitor sends the form. Throws an Error whose message is safe to show to the visitor.
export async function submitLead(input: LeadInput): Promise<void> {
  const { error } = await supabase.rpc("submit_lead", { p_lead: input });

  if (error) {
    if (isMissingFunction(error.message)) {
      throw new Error("Requests can't be sent right now. Please try again later.");
    }
    throw new Error(error.message);
  }
}

// ---- Team only ------------------------------------------------------------------------------

export async function listLeads(): Promise<Lead[]> {
  const { data, error } = await supabase.rpc("list_leads");

  if (error) {
    const hint = isMissingFunction(error.message)
      ? " Run supabase/leads.sql in the Supabase SQL Editor, then press Refresh."
      : "";
    throw new Error(error.message + hint);
  }

  return Array.isArray(data) ? (data as Lead[]) : [];
}

export async function getLead(id: string): Promise<Lead | null> {
  const { data, error } = await supabase.rpc("get_lead", { p_id: id });

  if (error) throw new Error(messageOf(error, "The lead could not be loaded."));

  return data ? (data as Lead) : null;
}

export interface LeadChanges {
  status?: LeadStatus;
  // An empty string clears the notes.
  notes?: string;
  preview_token?: string;
}

export async function updateLead(id: string, changes: LeadChanges): Promise<Lead> {
  const { data, error } = await supabase.rpc("update_lead", {
    p_id: id,
    p_status: changes.status,
    p_notes: changes.notes,
    p_preview_token: changes.preview_token,
  });

  if (error) throw new Error(messageOf(error, "The lead could not be saved."));

  return data as Lead;
}

export async function deleteLead(id: string): Promise<void> {
  const { error } = await supabase.rpc("delete_lead", { p_id: id });

  if (error) throw new Error(messageOf(error, "The lead could not be deleted."));
}

// ---- Helpers --------------------------------------------------------------------------------

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// /?lead=<id> opens the generator filled in from that lead.
export function leadIdFromLocation(): string | null {
  const id = new URLSearchParams(window.location.search).get("lead");
  return id && UUID.test(id) ? id : null;
}

export function leadGeneratorUrl(id: string): string {
  return `/?lead=${encodeURIComponent(id)}#live-demo`;
}

// The country code added to 10-digit phone numbers when the team opens a lead in WhatsApp.
// "91" is India. Change it here if most of your leads are elsewhere.
const DEFAULT_COUNTRY_CODE = "91";

// A phone number as WhatsApp wants it: digits only, with the country code.
export function whatsappDigits(phone: string): string {
  const digits = phone.replace(/\D/g, "");

  if (digits.length === 10) return DEFAULT_COUNTRY_CODE + digits;
  if (digits.length === 11 && digits.startsWith("0")) return DEFAULT_COUNTRY_CODE + digits.slice(1);
  return digits;
}

export function whatsappChatUrl(phone: string, text: string): string {
  return `https://wa.me/${whatsappDigits(phone)}?text=${encodeURIComponent(text)}`;
}
