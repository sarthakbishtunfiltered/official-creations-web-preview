import { Monitor, Smartphone, Zap } from "lucide-react";
import { designs } from "../data/niches";
import type { SiteData } from "../lib/siteData";
import { templates } from "../templates/registry";

const emptyPoints = [
  { icon: Zap, label: "Live preview in seconds", sub: "Fill in the details above and press Generate." },
  { icon: Monitor, label: "Built from your details", sub: "Your name, contact info and photos go straight in." },
  { icon: Smartphone, label: "Works on every screen", sub: "Check it on a phone, tablet or desktop." },
];

interface PreviewPanelProps {
  data: SiteData | null;
}

export function PreviewPanel({ data }: PreviewPanelProps) {
  if (!data) {
    return (
      <div className="flex flex-col gap-8 p-7 sm:p-8">
        <div>
          <div className="mb-5 flex items-center gap-2">
            <Zap className="h-4 w-4 text-[#111111]" />
            <span className="text-[12px] font-bold uppercase tracking-[0.12em] text-[#111111]">Instant Preview</span>
          </div>
          <h3 className="text-[28px] font-bold leading-[1.1] tracking-[-0.02em] text-[#111111] sm:text-[32px]">
            Your website{" "}
            <span className="font-serif font-normal italic">preview</span> will appear here.
          </h3>
        </div>
        <div className="flex flex-col gap-4">
          {emptyPoints.map(({ icon: Icon, label, sub }) => (
            <div key={label} className="flex items-start gap-3">
              <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#111111] text-white">
                <Icon className="h-3.5 w-3.5" />
              </div>
              <div>
                <span className="block text-[14px] font-bold text-[#111111]">{label}</span>
                <span className="text-[12px] font-medium text-[#6B6566]">{sub}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const Template = templates[data.niche]?.[data.design];
  const designLabel = designs.find((d) => d.id === data.design)?.label ?? data.design;
  const extraCount = Object.keys(data.fields).length;

  const rows: [string, string][] = [
    ["Niche", data.nicheLabel],
    ["Design", designLabel],
    ["Business name", data.businessName],
    ["Owner", data.ownerName],
    ["Phone", data.phone],
    ["WhatsApp", data.whatsapp],
    ["City", data.city],
    ["Tagline", data.tagline],
  ];

  return (
    <div className="flex flex-col gap-6 p-7 sm:p-8">
      <div>
        <div className="mb-5 flex items-center gap-2">
          <Zap className="h-4 w-4 text-[#111111]" />
          <span className="text-[12px] font-bold uppercase tracking-[0.12em] text-[#111111]">Instant Preview</span>
        </div>
        <h3 className="text-[28px] font-bold leading-[1.1] tracking-[-0.02em] text-[#111111] sm:text-[32px]">
          Your personalized{" "}
          <span className="font-serif font-normal italic">website preview</span> is ready.
        </h3>
      </div>

      {Template ? (
        <div className="overflow-hidden rounded-2xl border border-[#D5CFD0] bg-white">
          <div className="bg-[#111111] px-4 py-2 text-center text-[12px] font-semibold text-white">
            Preview by Official Creations
          </div>
          <Template data={data} />
        </div>
      ) : (
        <div className="rounded-2xl border border-[#D5CFD0] bg-white/70 p-5 sm:p-6">
          <p className="text-[15px] font-bold text-[#111111]">
            The {designLabel} design for {data.nicheLabel} isn't built yet.
          </p>
          <p className="mt-1 text-[13px] font-medium leading-relaxed text-[#6B6566]">
            Your details are ready. As soon as this template is added, it fills in automatically.
          </p>

          <dl className="mt-5 grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2">
            {rows.map(([term, detail]) => (
              <div key={term} className="min-w-0">
                <dt className="text-[11px] font-bold uppercase tracking-[0.1em] text-[#6B6566]">{term}</dt>
                <dd className="break-words text-[14px] font-medium text-[#111111]">{detail}</dd>
              </div>
            ))}
          </dl>

          <div className="mt-5 flex flex-wrap items-center gap-4">
            {data.logo && (
              <img src={data.logo} alt="Uploaded logo" className="h-14 w-14 rounded-lg border border-[#D5CFD0] bg-white object-contain" />
            )}
            {data.heroImage && (
              <img src={data.heroImage} alt="Uploaded hero" className="h-14 w-24 rounded-lg border border-[#D5CFD0] bg-white object-cover" />
            )}
            <span
              className="h-6 w-6 rounded-full border border-[#D5CFD0]"
              style={{ backgroundColor: data.brandColor }}
              role="img"
              aria-label={`Brand color ${data.brandColor}`}
            />
            <span className="text-[13px] font-medium text-[#6B6566]">
              {extraCount === 0 ? "No extra details added." : `${extraCount} extra detail${extraCount === 1 ? "" : "s"} added.`}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
