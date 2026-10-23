import { useEffect, useMemo, useState } from "react";
import type { CSSProperties } from "react";
import { editUrl, loadPreview, previewUrl } from "../lib/previewStore";
import { templates } from "../templates/registry";

type Device = "desktop" | "tablet" | "phone";

const devices: { id: Device; label: string; width: number | null }[] = [
  { id: "desktop", label: "Desktop", width: null },
  { id: "tablet", label: "Tablet", width: 820 },
  { id: "phone", label: "Phone", width: 390 },
];

// Height of the black bar at the top; templates keep their sticky menus just below it.
const BAR_HEIGHT = 44;

function Message({ title, body }: { title: string; body: string }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#EAE4E5] px-6 text-center font-sans">
      <h1 className="text-[28px] font-bold tracking-[-0.02em] text-[#111111]">{title}</h1>
      <p className="max-w-md text-[15px] font-medium leading-[1.6] text-[#6B6566]">{body}</p>
      <a href="/" className="rounded-xl bg-[#111111] px-5 py-3 text-[14px] font-semibold text-white">
        Back to the generator
      </a>
    </div>
  );
}

// The full-tab view of a generated website. Reached through /?preview=<id>.
// With &frame=1 it shows only the website, which is how the Tablet and Phone views load it.
export function PreviewPage({ id }: { id: string }) {
  const data = useMemo(() => loadPreview(id), [id]);
  const framed = useMemo(() => new URLSearchParams(window.location.search).has("frame"), []);
  const [device, setDevice] = useState<Device>("desktop");

  useEffect(() => {
    document.title = data ? `${data.businessName} | Preview` : "Preview not found";
    // A preview is private working material, not something for search engines.
    const meta = document.createElement("meta");
    meta.name = "robots";
    meta.content = "noindex";
    document.head.appendChild(meta);
    return () => {
      meta.remove();
    };
  }, [data]);

  if (!data) {
    return (
      <Message
        title="This preview isn't available"
        body="It was generated in a different browser, or it has been replaced by newer previews. Go back to the generator and press Generate again."
      />
    );
  }

  const Template = templates[data.niche]?.[data.design];
  if (!Template) {
    return <Message title="This design isn't built yet" body="Pick a design that has a template and generate again." />;
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
          <button type="button" onClick={editDetails} className="cursor-pointer rounded-md px-2 py-1 text-white/85 hover:text-white">
            Edit details
          </button>
          <button type="button" onClick={closePreview} className="cursor-pointer rounded-md px-2 py-1 text-white/60 hover:text-white">
            Close
          </button>
        </div>
      </div>

      {width === null ? (
        <Template data={data} />
      ) : (
        <div className="flex justify-center bg-[#E4DEDF] px-4 py-6" style={{ minHeight: `calc(100vh - ${BAR_HEIGHT}px)` }}>
          <div className="rounded-[38px] bg-[#111111] p-[10px] shadow-[0_20px_60px_rgba(0,0,0,0.25)]" style={{ width: width + 20, maxWidth: "100%" }}>
            <iframe
              title={`${active?.label ?? "Device"} view of ${data.businessName}`}
              src={`${previewUrl(id)}&frame=1`}
              className="block w-full rounded-[28px] bg-white"
              style={{ height: `calc(100vh - ${BAR_HEIGHT}px - 68px)` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
