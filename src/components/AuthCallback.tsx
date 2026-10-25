import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { PENDING_MESSAGE, REJECTED_MESSAGE, requestAccess } from "../lib/access";
import { supabase } from "../lib/supabase";
import { AuthShell } from "./AuthShell";

export function AuthCallback() {
  const navigate = useNavigate();
  const [message, setMessage] = useState("Verifying your account...");
  // What the screen is showing. Anything other than "working" gets a "Return to sign in" button.
  const [state, setState] = useState<"working" | "pending" | "rejected" | "failed">("working");

  useEffect(() => {
    let cancelled = false;

    async function verifyUser() {
      try {
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();

        if (sessionError) {
          throw sessionError;
        }

        if (!session) {
          navigate("/login", { replace: true });
          return;
        }

        setMessage("Checking your access permissions...");

        const { data: approved, error: approvalError } = await supabase.rpc("is_approved_user");

        if (approvalError) {
          throw approvalError;
        }

        if (approved !== true) {
          // Not approved yet: add the email to the owner's list of requests, then sign out.
          let next: "pending" | "rejected" | "failed" = "failed";
          let text = "Access denied. Your email is not approved for Official Creations.";

          try {
            const status = await requestAccess();
            if (status === "approved") {
              if (!cancelled) navigate("/dashboard", { replace: true });
              return;
            }
            next = status;
            text = status === "pending" ? PENDING_MESSAGE : REJECTED_MESSAGE;
          } catch {
            // Requests aren't set up in the database yet: fall back to the plain refusal.
          }

          await supabase.auth.signOut();

          if (!cancelled) {
            setMessage(text);
            setState(next);
          }

          return;
        }

        if (!cancelled) {
          navigate("/dashboard", { replace: true });
        }
      } catch (error) {
        if (!cancelled) {
          setMessage(error instanceof Error ? error.message : "Authentication failed. Please try again.");
          setState("failed");
        }
      }
    }

    void verifyUser();

    return () => {
      cancelled = true;
    };
  }, [navigate]);

  return (
    <AuthShell>
      <span className="text-[12px] font-bold uppercase tracking-[0.18em] text-[#6B6566]">Google sign-in</span>

      <h1 className="mt-3 text-[30px] font-bold leading-[1.1] tracking-[-0.02em]">
        {state === "pending" ? (
          <>
            Request <span className="font-serif font-normal italic">sent.</span>
          </>
        ) : state === "rejected" ? (
          <>
            Request <span className="font-serif font-normal italic">declined.</span>
          </>
        ) : state === "failed" ? (
          <>
            We couldn&rsquo;t <span className="font-serif font-normal italic">sign you in.</span>
          </>
        ) : (
          <>
            One <span className="font-serif font-normal italic">moment.</span>
          </>
        )}
      </h1>

      <p
        role={state === "failed" || state === "rejected" ? "alert" : "status"}
        className={`mt-3 text-[15px] font-medium leading-[1.6] [overflow-wrap:anywhere] ${
          state === "failed" ? "text-red-800" : "text-[#6B6566]"
        }`}
      >
        {message}
      </p>

      {state !== "working" && (
        <button
          type="button"
          onClick={() => navigate("/login", { replace: true })}
          className="mt-6 w-full cursor-pointer rounded-xl bg-[#111111] py-3.5 text-[15px] font-semibold text-white transition-colors duration-200 hover:bg-black"
        >
          Return to sign in
        </button>
      )}
    </AuthShell>
  );
}
