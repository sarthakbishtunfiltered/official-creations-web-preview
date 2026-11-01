import App from "../App";
import { useTeamAccess } from "../lib/useTeamAccess";
import { VisitorHome } from "./VisitorHome";

// The homepage. Approved team members get the website generator; everyone else gets the
// visitor page with the request form.
export function Home() {
  const access = useTeamAccess();

  if (access.status === "checking") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#EAE4E5] font-sans text-[15px] font-medium text-[#6B6566]">
        <p role="status">Loading...</p>
      </div>
    );
  }

  if (access.status === "approved") {
    return <App access={access} />;
  }

  return <VisitorHome access={access} />;
}
