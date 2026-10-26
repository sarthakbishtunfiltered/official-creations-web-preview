import { useEffect, useState } from "react";
import type { CSSProperties } from "react";
import { siteConfig } from "../config";
import { editUrl, loadPublicPreview, localPreviewUrl } from "../lib/previewStore";
import type { PublicPreview } from "../lib/previewStore";
import { useTeamAccess } from "../lib/useTeamAccess";
import { templates } from "../templates/registry";

type Device = "desktop" | "tablet" | "phone";

const devices: { id: Device; label: string; width: number | null }[] = [
  { id: "desktop", label: "Desktop", width: null },
  { id: "tablet", label: "Tablet", width: 820 },
  { id: "phone", label: "Phone", width: 390 },
];

// Height of the black bar at the top; templates keep their sticky menus just below it.
const BAR_HEIGHT = 44;

const whatsappDigits = siteConfig.whatsappNumber.replace(/\D/g, "");

function whatsappLink(text: string): string {
  return `https://wa.me/${whatsappDigits}?text=${encodeURIComponent(text)}`;
}

function Message({
  title,
  body,
  contact,
  team,
}: {
  title: string;
  body: string;
  // A pre-written WhatsApp message, when a WhatsApp number is set in config.
  contact?: string;
  team: boolean;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#EAE4E5] px-6 text-center font-sans">
      <h1 className="text-[28px] font-bold tracking-[-0.02em] text-[#111111]">{title}</h1>
      <p className="max-w-md text-[15px] font-medium leading-[1.6] text-[#6B6566]">{body}</p>
      {contact && whatsappDigits && (
        <a
          href={whatsappLink(contact)}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-xl bg-[#111111] px-5 py-3 text-[14px] font-semibold text-white"
        >
          Message us on WhatsApp
        </a>
      )}
      {team && (
        <a href="/" className="rounded-xl border border-[#D5CFD0] bg-white px-5 py-3 text-[14px] font-semibold text-[#111111]">
          Back to the generator
        </a>
      )}
    </div>
  );
}

// The full-tab view of a generated website, reached through /?preview=<link code>.
// Clients open it without signing in. With &frame=1 it shows only the website, which is how the
// Tablet and Phone views load it.
export function PreviewPage({ id }: { id: string }) {
  const framed = new URLSearchParams(window.location.search).has("frame");
  const access = useTeamAccess();
  const team = access.status === "approved";
  const [result, setResult] = useState<PublicPreview | null>(null);
  const [device, setDevice] = useState<Device>("desktop");

  useEffect(() => {
    let active = true;

    // One visit is counted per browser tab session, and never for the Tablet and Phone frames.
    let count = !framed;
    try {
      const key = `oc-viewed:${id}`;
      if (sessionStorage.getItem(key)) count = false;
      else if (count) sessionStorage.setItem(key, "1");
    } catch {
      // Storage unavailable: the visit is still counted once per load.
    }

    void loadPublicPreview(id, count).then((loaded) => {
      if (active) setResult(loaded);
    });

    return () => {
      active = false;
    };
  }, [id, framed]);

  useEffect(() => {
    document.title =
      result?.status === "ok" ? `${result.data.businessName} | Preview` : "Preview | Official Creations";
    // A preview is private working material, not something for search engines.
    const meta = document.createElement("meta");
    meta.name = "robots";
    meta.content = "noindex";
    document.head.appendChild(meta);
    return () => {
      meta.remove();
    };
  }, [result]);

  if (!result) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#EAE4E5] font-sans text-[15px] font-medium text-[#6B6566]">
        <p role="status">Loading preview...</p>
      </div>
    );
  }

  if (result.status === "error") {
    return (
      <Message
        title="We couldn't load this preview"
        body={`Please check your connection and try again. (${result.message})`}
        team={team}
      />
    );
  }

  if (result.status === "not_found") {
    return (
      <Message
        title="This preview link isn't valid"
        body="Check that you copied the whole link, or ask Official Creations to send it again."
        contact="Hi, my website preview link isn't working. Could you send it again?"
        team={team}
      />
    );
  }

  if (result.status === "expired" || result.status === "disabled") {
    const name = result.businessName || "this business";
    return (
      <Message
        title={result.status === "expired" ? "This preview has expired" : "This preview is switched off"}
        body="Previews stay open for 7 days. Contact Official Creations and we'll bring it back."
        contact={`Hi, I'd like to see the website preview for ${name} again.`}
        team={team}
      />
    );
  }

  // Only the "ok" result is left here.
  const { data, live } = result;
  const Template = templates[data.niche]?.[data.design];
  if (!Template) {
    return <Message title="This design isn't built yet" body="Pick a design that has a template and generate again." team={team} />;
  }

  if (framed) {
    return (
      <div className="min-h-screen bg-white">
        <Template data={data} />
      </div>
    );
  }

  // Back to the form. If this tab was opened by the generator it simply closes, which reveals
  // the generator with everything still filled in. Otherwise the form is reopened here.
  function editDetails() {
    window.close();
    window.setTimeout(() => {
      window.location.href = editUrl(id);
    }, 150);
  }

  // Closes this tab when the generator opened it; otherwise goes to the homepage.
  function closePreview() {
    window.close();
    window.setTimeout(() => {
      window.location.href = "/";
    }, 150);
  }

  const active = devices.find((d) => d.id === device) ?? devices[0];
  const width = active?.width ?? null;
  const barVars = { "--oc-top": `${BAR_HEIGHT}px` } as CSSProperties;

  return (
    <div className="min-h-screen bg-white" style={barVars}>
      <div
        className="sticky top-0 z-50 flex items-center justify-between gap-3 bg-[#111111] px-3 text-[12px] font-semibold text-white sm:px-4"
        style={{ height: BAR_HEIGHT }}
      >
        <span className="truncate">Preview by Official Creations</span>

        {/* The switcher is for large screens; on a phone the site is already a phone view. */}
        <div role="group" aria-label="Screen size" className="hidden items-center gap-1 rounded-full bg-white/10 p-1 md:flex">
          {devices.map((d) => (
            <button
              key={d.id}
              type="button"
              onClick={() => setDevice(d.id)}
              aria-pressed={device === d.id}
              className={`cursor-pointer rounded-full px-3 py-1 transition-colors duration-200 ${
                device === d.id ? "bg-white text-[#111111]" : "text-white/75 hover:text-white"
              }`}
            >
              {d.label}
            </button>
          ))}
        </div>

        <div className="flex shrink-0 items-center gap-1">
          {team ? (
            <>
              {!live && (
                <span
                  title="Clients can't open this link right now. You can see it because you're signed in."
                  className="mr-1 rounded-full bg-amber-400 px-2.5 py-1 text-[11px] font-bold text-[#111111]"
                >
                  Link not live
                </span>
              )}
              <button type="button" onClick={editDetails} className="cursor-pointer rounded-md px-2 py-1 text-white/85 hover:text-white">
                Edit details
              </button>
              <button type="button" onClick={closePreview} className="cursor-pointer rounded-md px-2 py-1 text-white/60 hover:text-white">
                Close
              </button>
            </>
          ) : (
            whatsappDigits && (
              <a
                href={whatsappLink(`Hi, I saw the website preview for ${data.businessName} and I'd like to talk.`)}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full bg-white px-3 py-1 text-[#111111]"
              >
                Chat with us
              </a>
            )
          )}
        </div>
      </div>

      {width === null ? (
        <Template data={data} />
      ) : (
        <div className="flex justify-center bg-[#E4DEDF] px-4 py-6" style={{ minHeight: `calc(100vh - ${BAR_HEIGHT}px)` }}>
          <div className="rounded-[38px] bg-[#111111] p-[10px] shadow-[0_20px_60px_rgba(0,0,0,0.25)]" style={{ width: width + 20, maxWidth: "100%" }}>
            <iframe
              title={`${active?.label ?? "Device"} view of ${data.businessName}`}
              src={`${localPreviewUrl(id)}&frame=1`}
              className="block w-full rounded-[28px] bg-white"
              style={{ height: `calc(100vh - ${BAR_HEIGHT}px - 68px)` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
