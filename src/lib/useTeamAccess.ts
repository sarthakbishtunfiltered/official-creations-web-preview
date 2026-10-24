import { useEffect, useState } from "react";
import { supabase } from "./supabase";

export type TeamAccess =
  | { status: "checking" }
  | { status: "signed_out" }
  | { status: "denied"; email: string }
  | { status: "approved"; email: string }
  | { status: "error"; message: string };

// Who is looking at the page: nobody signed in, someone signed in but not approved, or a team
// member. The approval answer comes from the same database check (is_approved_user) that the
// login page and the dashboard use.
export function useTeamAccess(): TeamAccess {
  const [access, setAccess] = useState<TeamAccess>({ status: "checking" });

  useEffect(() => {
    let active = true;

    async function check() {
      try {
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();

        if (sessionError) throw sessionError;

        if (!session) {
          if (active) setAccess({ status: "signed_out" });
          return;
        }

        const email = session.user.email || "";
        const { data: approved, error: approvalError } = await supabase.rpc("is_approved_user");

        if (approvalError) throw approvalError;

        if (active) setAccess(approved === true ? { status: "approved", email } : { status: "denied", email });
      } catch (error) {
        if (active) {
          setAccess({
            status: "error",
            message: error instanceof Error ? error.message : "We couldn't check your access.",
          });
        }
      }
    }

    void check();

    return () => {
      active = false;
    };
  }, []);

  return access;
}
