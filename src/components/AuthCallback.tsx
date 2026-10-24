import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { AuthShell } from "./AuthShell";

export function AuthCallback() {
  const navigate = useNavigate();
  const [message, setMessage] = useState("Verifying your account...");
  // True once something has gone wrong, which is when the "Return to sign in" button appears.
  const [failed, setFailed] = useState(false);

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
          await supabase.auth.signOut();

          if (!cancelled) {
            setMessage("Access denied. Your email is not approved for Official Creations.");
            setFailed(true);
          }

          return;
        }

        if (!cancelled) {
          navigate("/dashboard", { replace: true });
        }
      } catch (error) {
        if (!cancelled) {
          setMessage(error instanceof Error ? error.message : "Authentication failed. Please try again.");
          setFailed(true);
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
        {failed ? (
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
        role={failed ? "alert" : "status"}
        className={`mt-3 text-[15px] font-medium leading-[1.6] [overflow-wrap:anywhere] ${
          failed ? "text-red-800" : "text-[#6B6566]"
        }`}
      >
        {message}
      </p>

      {failed && (
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
