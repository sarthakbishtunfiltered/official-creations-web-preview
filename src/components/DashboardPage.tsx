import { useCallback, useEffect, useMemo, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { getNiche } from "../data/niches";
import { previewUrl } from "../lib/previewStore";
import { supabase } from "../lib/supabase";

type PreviewStatus =
  | "preview_created"
  | "preview_viewed"
  | "meeting_booked"
  | "offer_sent"
  | "client_won"
  | "client_lost";

interface Preview {
  id: string;
  business_name: string | null;
  niche: string | null;
  status: PreviewStatus;
  is_active: boolean;
  expires_at: string;
  total_views: number;
  first_viewed_at: string | null;
  last_viewed_at: string | null;
  created_at: string;
}

interface TeamMember {
  email: string;
  role: "owner" | "team_member";
  added_at: string;
}

const STATUS_LABELS: Record<PreviewStatus, string> = {
  preview_created: "Preview Created",
  preview_viewed: "Preview Viewed",
  meeting_booked: "Meeting Booked",
  offer_sent: "Offer Sent",
  client_won: "Client Won",
  client_lost: "Client Lost",
};

const STATUSES = Object.keys(STATUS_LABELS) as PreviewStatus[];

// Colours for the small status labels. The words carry the meaning; colour is only a hint.
const STATUS_TONE: Record<PreviewStatus, string> = {
  preview_created: "bg-[#E4DEDF] text-[#4A4546]",
  preview_viewed: "bg-amber-100 text-amber-900",
  meeting_booked: "bg-sky-100 text-sky-900",
  offer_sent: "bg-violet-100 text-violet-900",
  client_won: "bg-emerald-100 text-emerald-900",
  client_lost: "bg-red-100 text-red-900",
};

type Tab = "overview" | "previews" | "team";
type Filter = "all" | "opened" | "not_opened" | "expiring" | "expired" | "closed";

const HOUR = 3_600_000;
const DAY = 24 * HOUR;

const primaryButton =
  "cursor-pointer rounded-lg bg-[#111111] px-4 py-2 text-[13px] font-semibold text-white transition-colors duration-200 hover:bg-black disabled:cursor-not-allowed disabled:opacity-50";
const quietButton =
  "cursor-pointer rounded-lg border border-[#D5CFD0] bg-white px-3.5 py-2 text-[13px] font-semibold text-[#111111] transition-colors duration-200 hover:bg-[#F4EFEF] disabled:cursor-not-allowed disabled:opacity-50";
const dangerButton =
  "cursor-pointer rounded-lg border border-red-200 bg-white px-3.5 py-2 text-[13px] font-semibold text-red-700 transition-colors duration-200 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50";
const cardClass = "rounded-2xl border border-[#D5CFD0] bg-white/70 p-5 sm:p-6";

function errorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;

  if (typeof error === "object" && error !== null && "message" in error) {
    return String(error.message);
  }

  return String(error);
}

function formatDate(value: string | null): string {
  return value ? new Date(value).toLocaleString() : "Not yet";
}

// "5 min ago", "3 hr ago", "yesterday", "4 days ago".
function timeAgo(value: string | null): string {
  if (!value) return "never";
  const diff = Date.now() - new Date(value).getTime();
  if (diff < 60_000) return "just now";
  const minutes = Math.floor(diff / 60_000);
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hr ago`;
  const days = Math.floor(hours / 24);
  return days === 1 ? "yesterday" : `${days} days ago`;
}

function timeLeft(value: string): string {
  const diff = new Date(value).getTime() - Date.now();
  if (diff <= 0) return "Expired";
  const hours = Math.floor(diff / HOUR);
  if (hours < 1) return "Expires in under an hour";
  if (hours < 48) return `Expires in ${hours} hr`;
  return `Expires in ${Math.floor(hours / 24)} days`;
}

function views(preview: Preview): number {
  return preview.total_views || 0;
}

function isExpired(preview: Preview): boolean {
  return new Date(preview.expires_at).getTime() <= Date.now();
}

// A link a client can open right now.
function isLive(preview: Preview): boolean {
  return preview.is_active && !isExpired(preview);
}

// Won or lost: nothing left to chase.
function isClosed(preview: Preview): boolean {
  return preview.status === "client_won" || preview.status === "client_lost";
}

function nicheLabel(preview: Preview): string {
  if (!preview.niche) return "Unspecified niche";
  return getNiche(preview.niche)?.label ?? preview.niche;
}

function StatCard({ label, value, hint }: { label: string; value: string | number; hint?: string }) {
  return (
    <section className={cardClass}>
      <p className="text-[12px] font-bold uppercase tracking-[0.1em] text-[#6B6566]">{label}</p>
      <p className="mt-2 text-[34px] font-bold leading-none tracking-[-0.02em]">{value}</p>
      {hint && <p className="mt-2 text-[12px] font-medium text-[#6B6566]">{hint}</p>}
    </section>
  );
}

function StatusPill({ status }: { status: PreviewStatus }) {
  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-bold ${STATUS_TONE[status]}`}>
      {STATUS_LABELS[status]}
    </span>
  );
}

// What the client has done with the link: the most useful line on every row.
function Activity({ preview }: { preview: Preview }) {
  const count = views(preview);

  let dot = "bg-[#A09A9B]";
  let headline = "Not opened yet";
  if (count > 0) {
    dot = "bg-emerald-500";
    headline = `Opened · ${count} view${count === 1 ? "" : "s"}`;
  }

  let timing: string;
  if (!preview.is_active) {
    timing = "Link switched off";
  } else if (isExpired(preview)) {
    timing = "Link expired";
  } else {
    timing = timeLeft(preview.expires_at);
  }

  return (
    <div className="min-w-0">
      <p className="flex items-center gap-2 text-[13px] font-bold">
        <span className={`h-2 w-2 shrink-0 rounded-full ${dot}`} aria-hidden="true" />
        {headline}
      </p>
      <p className="mt-1 text-[12px] font-medium text-[#6B6566]">
        {count > 0 ? `Last viewed ${timeAgo(preview.last_viewed_at)}` : `Created ${timeAgo(preview.created_at)}`}
      </p>
      <p className="mt-0.5 text-[12px] font-medium text-[#6B6566]">{timing}</p>
    </div>
  );
}

export function DashboardPage() {
  const navigate = useNavigate();

  const [isOwner, setIsOwner] = useState(false);
  const [currentEmail, setCurrentEmail] = useState("");
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [previews, setPreviews] = useState<Preview[]>([]);
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [newEmail, setNewEmail] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError) {
        throw new Error("Session check: " + sessionError.message);
      }

      if (!session) {
        navigate("/login", { replace: true });
        return;
      }

      setCurrentEmail(session.user.email || "");

      const { data: approved, error: approvalError } = await supabase.rpc("is_approved_user");

      if (approvalError) {
        throw new Error("Approval check: " + approvalError.message);
      }

      if (approved !== true) {
        await supabase.auth.signOut();
        navigate("/login", { replace: true });
        return;
      }

      const { data: ownerResult, error: ownerError } = await supabase.rpc("is_owner_user");

      if (ownerError) {
        throw new Error("Owner check: " + ownerError.message);
      }

      const owner = ownerResult === true;
      setIsOwner(owner);

      const { data: previewData, error: previewError } = await supabase
        .from("previews")
        .select(
          "id,business_name,niche,status,is_active,expires_at,total_views,first_viewed_at,last_viewed_at,created_at",
        )
        .order("created_at", { ascending: false });

      if (previewError) {
        throw new Error("Loading previews: " + previewError.message);
      }

      setPreviews((previewData || []) as Preview[]);

      if (owner) {
        const { data: teamData, error: teamError } = await supabase
          .from("approved_emails")
          .select("email,role,added_at")
          .order("added_at", { ascending: false });

        if (teamError) {
          throw new Error("Loading team: " + teamError.message);
        }

        setTeam((teamData || []) as TeamMember[]);
      } else {
        setTeam([]);
      }
    } catch (err: unknown) {
      console.error("Dashboard loading error:", err);
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    void loadDashboard();
  }, [loadDashboard]);

  // Confirmation messages fade away on their own.
  useEffect(() => {
    if (!notice) return;
    const timer = window.setTimeout(() => setNotice(""), 4000);
    return () => window.clearTimeout(timer);
  }, [notice]);

  async function handleSignOut() {
    const { error: signOutError } = await supabase.auth.signOut();

    if (signOutError) {
      setError("Sign out failed: " + signOutError.message);
      return;
    }

    navigate("/login", { replace: true });
  }

  async function addTeamMember(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!isOwner) {
      setError("Only the owner can approve teammates.");
      return;
    }

    const email = newEmail.trim().toLowerCase();

    if (!email || !email.includes("@")) {
      setError("Enter a valid email address.");
      return;
    }

    setBusy(true);
    setError("");
    setNotice("");

    try {
      const { error: insertError } = await supabase.from("approved_emails").insert({ email, role: "team_member" });

      if (insertError) {
        throw new Error("Approving teammate: " + insertError.message);
      }

      setNewEmail("");
      await loadDashboard();
      setNotice("Access approved for " + email + ".");
    } catch (err: unknown) {
      console.error("Add teammate error:", err);
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  async function revokeTeamMember(email: string) {
    if (!isOwner) return;

    const confirmed = window.confirm("Revoke access for " + email + "?");

    if (!confirmed) return;

    setBusy(true);
    setError("");
    setNotice("");

    try {
      const { error: deleteError } = await supabase
        .from("approved_emails")
        .delete()
        .eq("email", email)
        .eq("role", "team_member");

      if (deleteError) {
        throw new Error("Revoking access: " + deleteError.message);
      }

      await loadDashboard();
      setNotice("Access revoked for " + email + ".");
    } catch (err: unknown) {
      console.error("Revoke teammate error:", err);
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  async function updatePreview(id: string, changes: Partial<Pick<Preview, "status" | "is_active" | "expires_at">>) {
    setBusy(true);
    setError("");
    setNotice("");

    try {
      const { error: updateError } = await supabase.from("previews").update(changes).eq("id", id);

      if (updateError) {
        throw new Error("Updating preview: " + updateError.message);
      }

      await loadDashboard();
      setNotice("Preview updated.");
    } catch (err: unknown) {
      console.error("Update preview error:", err);
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  async function extendExpiry(preview: Preview) {
    const expiry = new Date(preview.expires_at);
    const now = new Date();
    const base = expiry > now ? expiry : now;

    base.setDate(base.getDate() + 7);

    await updatePreview(preview.id, {
      expires_at: base.toISOString(),
    });
  }

  async function deletePreview(preview: Preview) {
    const confirmed = window.confirm(
      "Permanently delete the preview for " + (preview.business_name || "this business") + "?",
    );

    if (!confirmed) return;

    setBusy(true);
    setError("");
    setNotice("");

    try {
      const { error: deleteError } = await supabase.from("previews").delete().eq("id", preview.id);

      if (deleteError) {
        throw new Error("Deleting preview: " + deleteError.message);
      }

      await loadDashboard();
      setNotice("Preview deleted.");
    } catch (err: unknown) {
      console.error("Delete preview error:", err);
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  async function copyLink(preview: Preview) {
    try {
      await navigator.clipboard.writeText(previewUrl(preview.id));
      setError("");
      setNotice("Link copied. Paste it into WhatsApp or email.");
    } catch {
      setError("Your browser blocked copying. Use Open, then copy the address from the tab.");
    }
  }

  // ---- Numbers for the overview ---------------------------------------------------------------

  const stats = useMemo(() => {
    const opened = previews.filter((p) => views(p) > 0).length;
    return {
      total: previews.length,
      live: previews.filter(isLive).length,
      opened,
      openRate: previews.length === 0 ? 0 : Math.round((opened / previews.length) * 100),
      totalViews: previews.reduce((sum, p) => sum + views(p), 0),
      meetings: previews.filter((p) => p.status === "meeting_booked").length,
      won: previews.filter((p) => p.status === "client_won").length,
    };
  }, [previews]);

  // The three lists that tell the team who to contact today.
  const attention = useMemo(() => {
    const now = Date.now();
    const open = previews.filter((p) => !isClosed(p));

    // Opened the link but nobody has moved them forward yet: the warmest leads.
    const followUp = open
      .filter((p) => views(p) > 0 && (p.status === "preview_created" || p.status === "preview_viewed"))
      .sort((a, b) => new Date(b.last_viewed_at ?? 0).getTime() - new Date(a.last_viewed_at ?? 0).getTime());

    // Sent over a day ago and never opened: needs a nudge.
    const neverOpened = open
      .filter((p) => isLive(p) && views(p) === 0 && now - new Date(p.created_at).getTime() > DAY)
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

    // Still live but running out of time.
    const expiring = open
      .filter((p) => isLive(p) && new Date(p.expires_at).getTime() - now < 2 * DAY)
      .sort((a, b) => new Date(a.expires_at).getTime() - new Date(b.expires_at).getTime());

    return { followUp, neverOpened, expiring };
  }, [previews]);

  const pipeline = STATUSES.map((status) => ({
    status,
    count: previews.filter((p) => p.status === status).length,
  }));

  // ---- The previews list ----------------------------------------------------------------------

  const filterCounts: Record<Filter, number> = {
    all: previews.length,
    opened: previews.filter((p) => views(p) > 0).length,
    not_opened: previews.filter((p) => views(p) === 0).length,
    expiring: attention.expiring.length,
    expired: previews.filter((p) => isExpired(p)).length,
    closed: previews.filter(isClosed).length,
  };

  const filterLabels: Record<Filter, string> = {
    all: "All",
    opened: "Opened",
    not_opened: "Not opened",
    expiring: "Expiring soon",
    expired: "Expired",
    closed: "Won or lost",
  };

  const visiblePreviews = previews.filter((p) => {
    const query = search.trim().toLowerCase();
    if (query && !(p.business_name ?? "").toLowerCase().includes(query)) return false;

    switch (filter) {
      case "opened":
        return views(p) > 0;
      case "not_opened":
        return views(p) === 0;
      case "expiring":
        return attention.expiring.some((e) => e.id === p.id);
      case "expired":
        return isExpired(p);
      case "closed":
        return isClosed(p);
      default:
        return true;
    }
  });

  const navItems: { id: Tab; label: string }[] = [
    { id: "overview", label: "Overview" },
    { id: "previews", label: "Website Previews" },
  ];

  if (isOwner) {
    navItems.push({ id: "team", label: "Team Management" });
  }

  if (loading && previews.length === 0 && !error) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#EAE4E5] font-sans text-[15px] font-medium text-[#6B6566]">
        Loading your dashboard...
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#EAE4E5] font-sans text-[#111111]">
      <header className="border-b border-[#D5CFD0] bg-white/50 backdrop-blur-sm">
        <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center justify-between gap-4 px-5 py-4 sm:px-8">
          <div className="flex items-center gap-3">
            <img
              src="/OC_Black-removebg-preview.png"
              alt=""
              width={32}
              height={32}
              className="h-8 w-8 object-contain"
            />
            <div>
              <p className="text-[17px] font-bold leading-tight tracking-tight">Official Creations</p>
              <p className="text-[12px] font-medium text-[#6B6566]">
                {isOwner ? "Owner dashboard" : "Team dashboard"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="hidden max-w-[220px] truncate text-[13px] font-medium text-[#6B6566] md:inline">
              {currentEmail}
            </span>
            <span className="rounded-full bg-[#111111] px-2.5 py-1 text-[11px] font-bold text-white">
              {isOwner ? "Owner" : "Team"}
            </span>
            <a href="/#live-demo" className={`${quietButton} inline-block`}>
              Generator
            </a>
            <button type="button" className={quietButton} onClick={() => void loadDashboard()} disabled={busy || loading}>
              {loading ? "Refreshing..." : "Refresh"}
            </button>
            <button type="button" className={quietButton} onClick={handleSignOut}>
              Sign out
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto w-full max-w-7xl px-5 py-6 sm:px-8 sm:py-8">
        <nav aria-label="Dashboard sections" className="mb-6 flex flex-wrap gap-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setActiveTab(item.id)}
              aria-current={activeTab === item.id ? "page" : undefined}
              className={`cursor-pointer rounded-full px-4 py-2 text-[13px] font-semibold transition-colors duration-200 ${
                activeTab === item.id
                  ? "bg-[#111111] text-white"
                  : "border border-[#D5CFD0] bg-white/70 text-[#111111] hover:bg-white"
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>

        {error && (
          <section role="alert" className="mb-5 rounded-2xl border border-red-200 bg-red-50 p-5 text-red-800">
            <p className="text-[14px] font-bold">Something went wrong</p>
            <p className="mt-1 text-[13px] font-medium [overflow-wrap:anywhere]">{error}</p>
          </section>
        )}

        {notice && (
          <section
            role="status"
            className="mb-5 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-3 text-[13px] font-semibold text-emerald-900"
          >
            {notice}
          </section>
        )}

        {activeTab === "overview" && (
          <div className="flex flex-col gap-6">
            <div>
              <h2 className="text-[30px] font-bold leading-[1.1] tracking-[-0.02em] sm:text-[36px]">
                Your sales <span className="font-serif font-normal italic">pipeline</span>
              </h2>
              <p className="mt-2 text-[14px] font-medium text-[#6B6566]">
                See who has opened their website preview, and who to contact today.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
              <StatCard label="Previews sent" value={stats.total} hint={`${stats.live} live now`} />
              <StatCard label="Opened" value={stats.opened} hint={`${stats.openRate}% of previews`} />
              <StatCard label="Total views" value={stats.totalViews} />
              <StatCard label="Meetings booked" value={stats.meetings} />
              <StatCard label="Clients won" value={stats.won} />
            </div>

            {previews.length === 0 ? (
              <section className={cardClass}>
                <h3 className="text-[18px] font-bold">No previews yet</h3>
                <p className="mt-2 max-w-xl text-[14px] font-medium leading-[1.6] text-[#6B6566]">
                  Nothing has been saved to Supabase yet. Previews you generate on the homepage are still kept in the
                  browser only, so they will show up here once the generator is connected to the database.
                </p>
              </section>
            ) : (
              <>
                <section className={cardClass}>
                  <h3 className="text-[18px] font-bold">Who to contact today</h3>
                  <div className="mt-5 grid grid-cols-1 gap-6 lg:grid-cols-3">
                    <AttentionList
                      title="Opened, follow up now"
                      empty="Nobody is waiting for a reply."
                      items={attention.followUp}
                      detail={(p) => `${views(p)} view${views(p) === 1 ? "" : "s"} · last ${timeAgo(p.last_viewed_at)}`}
                      actionLabel="Meeting booked"
                      onAction={(p) => void updatePreview(p.id, { status: "meeting_booked" })}
                      busy={busy}
                    />
                    <AttentionList
                      title="Sent, never opened"
                      empty="Every sent link has been opened."
                      items={attention.neverOpened}
                      detail={(p) => `Sent ${timeAgo(p.created_at)}`}
                      actionLabel="Copy link"
                      onAction={(p) => void copyLink(p)}
                      busy={busy}
                    />
                    <AttentionList
                      title="Expiring soon"
                      empty="Nothing is about to expire."
                      items={attention.expiring}
                      detail={(p) => timeLeft(p.expires_at)}
                      actionLabel="Extend 7 days"
                      onAction={(p) => void extendExpiry(p)}
                      busy={busy}
                    />
                  </div>
                </section>

                <section className={cardClass}>
                  <h3 className="text-[18px] font-bold">Pipeline</h3>
                  <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
                    {pipeline.map(({ status, count }) => (
                      <div key={status} className="rounded-xl border border-[#D5CFD0] bg-white p-4">
                        <p className="text-[26px] font-bold leading-none">{count}</p>
                        <p className="mt-2 text-[12px] font-semibold text-[#6B6566]">{STATUS_LABELS[status]}</p>
                      </div>
                    ))}
                  </div>
                </section>

                <section className={cardClass}>
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="text-[18px] font-bold">Recent previews</h3>
                    <button type="button" className={quietButton} onClick={() => setActiveTab("previews")}>
                      Manage previews
                    </button>
                  </div>
                  <ul className="mt-4 divide-y divide-[#D5CFD0]">
                    {previews.slice(0, 5).map((preview) => (
                      <li key={preview.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                        <div className="min-w-0">
                          <p className="truncate text-[14px] font-bold">{preview.business_name || "Untitled business"}</p>
                          <p className="text-[12px] font-medium text-[#6B6566]">
                            {nicheLabel(preview)} &middot; created {timeAgo(preview.created_at)}
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-[12px] font-semibold text-[#6B6566]">
                            {views(preview)} view{views(preview) === 1 ? "" : "s"}
                          </span>
                          <StatusPill status={preview.status} />
                        </div>
                      </li>
                    ))}
                  </ul>
                </section>
              </>
            )}
          </div>
        )}

        {activeTab === "previews" && (
          <div className="flex flex-col gap-5">
            <div>
              <h2 className="text-[30px] font-bold leading-[1.1] tracking-[-0.02em] sm:text-[36px]">
                Website <span className="font-serif font-normal italic">previews</span>
              </h2>
              <p className="mt-2 text-[14px] font-medium text-[#6B6566]">
                Every link you have sent, what the client did with it, and where the deal stands.
              </p>
            </div>

            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div role="group" aria-label="Filter previews" className="flex flex-wrap gap-2">
                {(Object.keys(filterLabels) as Filter[]).map((id) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setFilter(id)}
                    aria-pressed={filter === id}
                    className={`cursor-pointer rounded-full px-3.5 py-1.5 text-[12px] font-semibold transition-colors duration-200 ${
                      filter === id
                        ? "bg-[#111111] text-white"
                        : "border border-[#D5CFD0] bg-white/70 text-[#111111] hover:bg-white"
                    }`}
                  >
                    {filterLabels[id]} <span className="opacity-60">{filterCounts[id]}</span>
                  </button>
                ))}
              </div>
              <input
                type="search"
                value={search}
                onChange={(event: ChangeEvent<HTMLInputElement>) => setSearch(event.target.value)}
                placeholder="Search by business name"
                aria-label="Search by business name"
                className="w-full rounded-xl border border-[#D5CFD0] bg-white px-4 py-2.5 text-[14px] placeholder:text-[#A09A9B] focus:border-[#111111] focus:outline-none lg:max-w-xs"
              />
            </div>

            {previews.length === 0 ? (
              <section className={cardClass}>
                <p className="text-[14px] font-medium leading-[1.6] text-[#6B6566]">
                  No database previews yet. The generator still needs to be connected to Supabase.
                </p>
              </section>
            ) : visiblePreviews.length === 0 ? (
              <section className={cardClass}>
                <p className="text-[14px] font-medium text-[#6B6566]">No previews match this filter.</p>
              </section>
            ) : (
              <ul className="flex flex-col gap-3">
                {visiblePreviews.map((preview) => (
                  <li
                    key={preview.id}
                    className="flex flex-col gap-4 rounded-2xl border border-[#D5CFD0] bg-white/70 p-5 xl:flex-row xl:items-center xl:gap-6"
                  >
                    <div className="min-w-0 xl:w-[24%]">
                      <p className="truncate text-[16px] font-bold">{preview.business_name || "Untitled business"}</p>
                      <p className="mt-1 text-[12px] font-medium text-[#6B6566]">{nicheLabel(preview)}</p>
                      <p className="mt-0.5 text-[12px] font-medium text-[#6B6566]">
                        Created {formatDate(preview.created_at)}
                      </p>
                    </div>

                    <div className="xl:w-[22%]">
                      <Activity preview={preview} />
                    </div>

                    <div className="flex flex-col gap-1.5 xl:w-[17%]">
                      <label
                        htmlFor={`status-${preview.id}`}
                        className="text-[11px] font-bold uppercase tracking-[0.1em] text-[#6B6566]"
                      >
                        Sales status
                      </label>
                      <select
                        id={`status-${preview.id}`}
                        value={preview.status}
                        disabled={busy}
                        onChange={(event: ChangeEvent<HTMLSelectElement>) =>
                          void updatePreview(preview.id, {
                            status: event.target.value as PreviewStatus,
                          })
                        }
                        className="w-full cursor-pointer rounded-lg border border-[#D5CFD0] bg-white px-3 py-2 text-[13px] font-semibold focus:border-[#111111] focus:outline-none disabled:opacity-50"
                      >
                        {STATUSES.map((status) => (
                          <option key={status} value={status}>
                            {STATUS_LABELS[status]}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="flex flex-wrap gap-2 xl:flex-1 xl:justify-end">
                      <a
                        href={previewUrl(preview.id)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`${quietButton} inline-block`}
                      >
                        Open
                      </a>
                      <button type="button" className={quietButton} disabled={busy} onClick={() => void copyLink(preview)}>
                        Copy link
                      </button>
                      <button type="button" className={quietButton} disabled={busy} onClick={() => void extendExpiry(preview)}>
                        +7 days
                      </button>
                      <button
                        type="button"
                        className={quietButton}
                        disabled={busy}
                        onClick={() => void updatePreview(preview.id, { is_active: !preview.is_active })}
                      >
                        {preview.is_active ? "Disable" : "Enable"}
                      </button>
                      <button type="button" className={dangerButton} disabled={busy} onClick={() => void deletePreview(preview)}>
                        Delete
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {activeTab === "team" && isOwner && (
          <div className="flex flex-col gap-5">
            <div>
              <h2 className="text-[30px] font-bold leading-[1.1] tracking-[-0.02em] sm:text-[36px]">
                Your <span className="font-serif font-normal italic">team</span>
              </h2>
              <p className="mt-2 text-[14px] font-medium text-[#6B6566]">
                Only approved email addresses can open this dashboard.
              </p>
            </div>

            <section className={cardClass}>
              <form onSubmit={addTeamMember} className="flex flex-col gap-3 sm:flex-row">
                <label htmlFor="new-member" className="sr-only">
                  Teammate email address
                </label>
                <input
                  id="new-member"
                  type="email"
                  required
                  placeholder="teammate@example.com"
                  value={newEmail}
                  onChange={(event: ChangeEvent<HTMLInputElement>) => setNewEmail(event.target.value)}
                  className="min-w-0 flex-1 rounded-xl border border-[#D5CFD0] bg-white px-4 py-3 text-[14px] placeholder:text-[#A09A9B] focus:border-[#111111] focus:outline-none"
                />
                <button type="submit" disabled={busy} className={`${primaryButton} py-3`}>
                  {busy ? "Please wait..." : "Approve teammate"}
                </button>
              </form>
              <p className="mt-3 text-[12px] font-medium leading-[1.6] text-[#6B6566]">
                The teammate then signs in on the login page with this email, using Google or a password.
              </p>
            </section>

            <section className={`${cardClass} overflow-x-auto`}>
              <table className="w-full min-w-[520px] border-collapse text-left text-[13px]">
                <thead>
                  <tr className="text-[11px] font-bold uppercase tracking-[0.1em] text-[#6B6566]">
                    <th className="border-b border-[#D5CFD0] px-3 py-3">Email</th>
                    <th className="border-b border-[#D5CFD0] px-3 py-3">Role</th>
                    <th className="border-b border-[#D5CFD0] px-3 py-3">Added</th>
                    <th className="border-b border-[#D5CFD0] px-3 py-3">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {team.map((member) => (
                    <tr key={member.email}>
                      <td className="border-b border-[#D5CFD0]/60 px-3 py-3 font-semibold">{member.email}</td>
                      <td className="border-b border-[#D5CFD0]/60 px-3 py-3">
                        {member.role === "owner" ? "Owner" : "Team Member"}
                      </td>
                      <td className="border-b border-[#D5CFD0]/60 px-3 py-3 text-[#6B6566]">
                        {formatDate(member.added_at)}
                      </td>
                      <td className="border-b border-[#D5CFD0]/60 px-3 py-3">
                        {member.role === "team_member" ? (
                          <button
                            type="button"
                            className={dangerButton}
                            disabled={busy}
                            onClick={() => void revokeTeamMember(member.email)}
                          >
                            Revoke access
                          </button>
                        ) : (
                          <span className="text-[#6B6566]">Protected</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
          </div>
        )}
      </div>
    </main>
  );
}

interface AttentionListProps {
  title: string;
  empty: string;
  items: Preview[];
  detail: (preview: Preview) => string;
  actionLabel: string;
  onAction: (preview: Preview) => void;
  busy: boolean;
}

function AttentionList({ title, empty, items, detail, actionLabel, onAction, busy }: AttentionListProps) {
  return (
    <div className="min-w-0">
      <h4 className="flex items-center gap-2 text-[12px] font-bold uppercase tracking-[0.1em] text-[#6B6566]">
        {title}
        <span className="rounded-full bg-[#111111] px-2 py-0.5 text-[11px] text-white">{items.length}</span>
      </h4>

      {items.length === 0 ? (
        <p className="mt-3 text-[13px] font-medium text-[#6B6566]">{empty}</p>
      ) : (
        <ul className="mt-3 flex flex-col gap-2">
          {items.slice(0, 4).map((preview) => (
            <li key={preview.id} className="flex items-center justify-between gap-3 rounded-xl border border-[#D5CFD0] bg-white p-3">
              <div className="min-w-0">
                <p className="truncate text-[13px] font-bold">{preview.business_name || "Untitled business"}</p>
                <p className="text-[12px] font-medium text-[#6B6566]">{detail(preview)}</p>
              </div>
              <button type="button" className={`${quietButton} shrink-0 px-3 py-1.5 text-[12px]`} disabled={busy} onClick={() => onAction(preview)}>
                {actionLabel}
              </button>
            </li>
          ))}
          {items.length > 4 && (
            <li className="text-[12px] font-medium text-[#6B6566]">+ {items.length - 4} more in Website Previews</li>
          )}
        </ul>
      )}
    </div>
  );
}
