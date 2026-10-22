import { useEffect, useMemo } from "react";
import { loadPreview } from "../lib/previewStore";
import { templates } from "../templates/registry";

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

function closePreview() {
  // Works when this tab was opened by the generator; otherwise go back to the homepage.
  window.close();
  window.setTimeout(() => {
    window.location.href = "/";
  }, 150);
}

// The full-tab view of a generated website. Reached through /?preview=<id>.
export function PreviewPage({ id }: { id: string }) {
  const data = useMemo(() => loadPreview(id), [id]);

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

  return (
    <div className="min-h-screen bg-white">
      <div className="sticky top-0 z-40 flex items-center justify-between gap-4 bg-[#111111] px-4 py-2 text-[12px] font-semibold text-white">
        <span>Preview by Official Creations</span>
        <button type="button" onClick={closePreview} className="cursor-pointer rounded-md px-2 py-1 text-white/80 hover:text-white">
          Close preview
        </button>
      </div>
      <Template data={data} />
    </div>
  );
}
