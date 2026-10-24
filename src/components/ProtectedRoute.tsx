import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { AuthShell } from "./AuthShell";

interface ProtectedRouteProps {
  children: ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const [status, setStatus] = useState<"loading" | "allowed" | "denied">("loading");

  useEffect(() => {
    let active = true;

    async function checkAccess() {
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (error || !session) {
          if (active) setStatus("denied");
          return;
        }

        const { data: approved, error: approvalError } = await supabase.rpc("is_approved_user");

        if (approvalError || approved !== true) {
          await supabase.auth.signOut();
          if (active) setStatus("denied");
          return;
        }

        if (active) setStatus("allowed");
      } catch {
        if (active) setStatus("denied");
      }
    }

    void checkAccess();

    return () => {
      active = false;
    };
  }, []);

  if (status === "loading") {
    return (
      <AuthShell>
        <p role="status" className="text-center text-[15px] font-medium text-[#6B6566]">
          Verifying access...
        </p>
      </AuthShell>
    );
  }

  if (status === "denied") {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
