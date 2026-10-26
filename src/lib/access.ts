import { supabase } from "./supabase";

export type RequestStatus = "approved" | "pending" | "rejected";

// A signed-in person who isn't approved asks the owner for access. Safe to call again: it never
// creates a second request. Throws if the database function isn't installed yet.
export async function requestAccess(): Promise<RequestStatus> {
  const { data, error } = await supabase.rpc("request_access");

  if (error) throw error;

  if (data === "approved" || data === "pending" || data === "rejected") return data;

  throw new Error("Unexpected answer while requesting access.");
}

export const PENDING_MESSAGE =
  "Your request has been sent to the owner. You can sign in once it is approved.";

export const REJECTED_MESSAGE =
  "Your request was declined. Contact the owner if you think this is a mistake.";
