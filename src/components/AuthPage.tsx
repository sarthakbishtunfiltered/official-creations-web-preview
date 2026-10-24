import { useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { AuthShell } from "./AuthShell";

const fieldClass =
  "mt-2 block w-full rounded-xl border border-[#D5CFD0] bg-white px-4 py-3 text-[16px] text-[#111111] placeholder:text-[#A09A9B] focus:border-[#111111] focus:outline-none";

export function AuthPage() {
  const navigate = useNavigate();

  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function verifyApproval() {
    const { data, error } = await supabase.rpc("is_approved_user");

    if (error) {
      await supabase.auth.signOut();
      setMessage("Unable to verify access: " + error.message);
      return false;
    }

    if (data !== true) {
      await supabase.auth.signOut();
      setMessage("Access denied. Your email address is not approved for Official Creations.");
      return false;
    }

    return true;
  }

  async function handleGoogleSignIn() {
    setGoogleLoading(true);
    setMessage("");

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) throw error;
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Unable to sign in with Google. Please try again.",
      );
      setGoogleLoading(false);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setLoading(true);
    setMessage("");

    try {
      const normalizedEmail = email.trim().toLowerCase();

      if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email: normalizedEmail,
          password,
        });

        if (error) throw error;

        if (!data.session) {
          setMessage(
            "If registration is permitted, check your email for a confirmation link before signing in.",
          );
          return;
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: normalizedEmail,
          password,
        });

        if (error) throw error;
      }

      const approved = await verifyApproval();

      if (approved) {
        navigate("/dashboard", { replace: true });
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const busy = loading || googleLoading;

  return (
    <AuthShell>
      <span className="text-[12px] font-bold uppercase tracking-[0.18em] text-[#6B6566]">Team access</span>

      <h1 className="mt-3 text-[34px] font-bold leading-[1.08] tracking-[-0.02em]">
        {mode === "login" ? (
          <>
            Welcome <span className="font-serif font-normal italic">back.</span>
          </>
        ) : (
          <>
            Create your <span className="font-serif font-normal italic">account.</span>
          </>
        )}
      </h1>

      <p className="mt-3 text-[15px] font-medium leading-[1.6] text-[#6B6566]">
        Sign in with an email address approved for internal access.
      </p>

      <button
        type="button"
        onClick={handleGoogleSignIn}
        disabled={busy}
        className="mt-7 flex w-full cursor-pointer items-center justify-center gap-3 rounded-xl border border-[#D5CFD0] bg-white py-3.5 text-[14px] font-semibold text-[#111111] transition-colors duration-200 hover:bg-[#F4EFEF] disabled:cursor-not-allowed disabled:opacity-60"
      >
        <GoogleIcon />
        {googleLoading ? "Connecting to Google..." : "Continue with Google"}
      </button>

      <div className="my-6 flex items-center gap-3 text-[11px] font-bold uppercase tracking-[0.12em] text-[#A09A9B]">
        <span className="h-px flex-1 bg-[#D5CFD0]" />
        or use email
        <span className="h-px flex-1 bg-[#D5CFD0]" />
      </div>

      <form onSubmit={handleSubmit}>
        <label htmlFor="email" className="block text-[13px] font-bold">
          Email address
        </label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(event: ChangeEvent<HTMLInputElement>) => setEmail(event.target.value)}
          className={fieldClass}
        />

        <label htmlFor="password" className="mt-4 block text-[13px] font-bold">
          Password
        </label>
        <input
          id="password"
          type="password"
          autoComplete={mode === "login" ? "current-password" : "new-password"}
          minLength={6}
          required
          value={password}
          onChange={(event: ChangeEvent<HTMLInputElement>) => setPassword(event.target.value)}
          className={fieldClass}
        />

        <button
          type="submit"
          disabled={busy}
          className="mt-6 w-full cursor-pointer rounded-xl bg-[#111111] py-3.5 text-[15px] font-semibold text-white transition-colors duration-200 hover:bg-black disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Please wait..." : mode === "login" ? "Sign in" : "Create account"}
        </button>
      </form>

      {message && (
        <p
          role="alert"
          className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-[13px] font-medium leading-[1.5] text-red-800 [overflow-wrap:anywhere]"
        >
          {message}
        </p>
      )}

      <button
        type="button"
        onClick={() => {
          setMode(mode === "login" ? "signup" : "login");
          setMessage("");
        }}
        className="mt-6 cursor-pointer text-[13px] font-semibold text-[#6B6566] underline-offset-4 hover:text-[#111111] hover:underline"
      >
        {mode === "login" ? "Need an account? Create one" : "Already have an account? Sign in"}
      </button>
    </AuthShell>
  );
}

function GoogleIcon() {
  return (
    <svg width="19" height="19" viewBox="0 0 48 48" aria-hidden="true" className="shrink-0">
      <path
        fill="#4285F4"
        d="M43.6 24.5c0-1.4-.1-2.8-.4-4.1H24v7.8h11a9.4 9.4 0 0 1-4.1 6.2v5.1h6.6c3.9-3.6 6.1-8.8 6.1-15Z"
      />
      <path
        fill="#34A853"
        d="M24 44c5.5 0 10.2-1.8 13.5-4.9l-6.6-5.1c-1.8 1.2-4 2-6.9 2-5.3 0-9.8-3.6-11.4-8.4H5.8v5.3A20 20 0 0 0 24 44Z"
      />
      <path
        fill="#FBBC05"
        d="M12.6 27.6a12 12 0 0 1 0-7.2v-5.3H5.8a20 20 0 0 0 0 17.8l6.8-5.3Z"
      />
      <path
        fill="#EA4335"
        d="M24 12c3 0 5.7 1 7.8 3.1l5.8-5.8A19.4 19.4 0 0 0 24 4 20 20 0 0 0 5.8 15.1l6.8 5.3C14.2 15.6 18.7 12 24 12Z"
      />
    </svg>
  );
}
