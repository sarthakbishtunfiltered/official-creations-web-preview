import type { ComponentType, ReactNode } from "react";

// One icon family for the whole site, so every section speaks the same visual language:
//  - a 24px grid, one stroke weight, round caps and joins
//  - a soft "tone" layer under the line (the same colour at low opacity) that gives each icon
//    a quiet two-layer depth, the way Stripe's icons do
//  - no colour of their own: icons take the colour of the text around them
// To add an icon: draw the soft shape in `tone`, the outline in `line`, and register it below.

export type IconComponent = ComponentType<{ className?: string }>;

const STROKE = 1.6;
const STROKE_UI = 1.9;

function make(tone: ReactNode, line: ReactNode, strokeWidth = STROKE): IconComponent {
  return function Icon({ className }) {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
        focusable="false"
        className={className}
        // Inline so every icon on the site has exactly the same weight, whatever its class says.
        style={{ strokeWidth }}
      >
        {tone && (
          <g fill="currentColor" fillOpacity={0.12} stroke="none">
            {tone}
          </g>
        )}
        <g stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
          {line}
        </g>
      </svg>
    );
  };
}

// ---------------------------------------------------------------------------------------
// The ten businesses
// ---------------------------------------------------------------------------------------
export const InteriorIcon = make(
  <path d="M8 11h8v4.5H8z" />,
  <>
    <path d="M6.5 11V8.5A2.5 2.5 0 0 1 9 6h6a2.5 2.5 0 0 1 2.5 2.5V11" />
    <path d="M4 13a2 2 0 0 1 4 0v2.5h8V13a2 2 0 0 1 4 0v4a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1z" />
    <path d="M7 18v2M17 18v2" />
  </>,
);

export const CameraIcon = make(
  <path d="M4 8.5A1.5 1.5 0 0 1 5.5 7H8l1.2-2h5.6L16 7h2.5A1.5 1.5 0 0 1 20 8.5v9a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 17.5z" />,
  <>
    <path d="M4 8.5A1.5 1.5 0 0 1 5.5 7H8l1.2-2h5.6L16 7h2.5A1.5 1.5 0 0 1 20 8.5v9a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 17.5z" />
    <circle cx="12" cy="13" r="3.2" />
  </>,
);

export const SalonIcon = make(
  <>
    <circle cx="6" cy="6.5" r="2.5" />
    <circle cx="6" cy="17.5" r="2.5" />
  </>,
  <>
    <circle cx="6" cy="6.5" r="2.5" />
    <circle cx="6" cy="17.5" r="2.5" />
    <path d="M8 8 20 17M8 16 20 7" />
  </>,
);

export const KitchenIcon = make(
  <path d="M7 14h10v5H7z" />,
  <>
    <path d="M7 14a3.5 3.5 0 0 1-.6-6.9A4.5 4.5 0 0 1 12 4.5a4.5 4.5 0 0 1 5.6 2.6A3.5 3.5 0 0 1 17 14" />
    <path d="M7 14v5h10v-5M7 14h10" />
  </>,
);

export const DraftingIcon = make(
  <path d="M5 5v14h14z" />,
  <>
    <path d="M5 5v14h14z" />
    <path d="M5 9.5h2.5M5 13.5h2.5M9 19v-2.5M13 19v-2.5" />
  </>,
);

export const BalloonIcon = make(
  <path d="M12 3a5.5 6 0 0 1 5.5 6c0 3.6-2.6 6-5.5 6S6.5 12.6 6.5 9A5.5 6 0 0 1 12 3z" />,
  <>
    <path d="M12 3a5.5 6 0 0 1 5.5 6c0 3.6-2.6 6-5.5 6S6.5 12.6 6.5 9A5.5 6 0 0 1 12 3z" />
    <path d="M9.6 8.2a3 3 0 0 1 1.9-2.1" />
    <path d="M12 15v1.2c0 1.5-1.4 1.9-1.4 3.4 0 .5.2.9.6 1.4" />
  </>,
);

export const ClinicIcon = make(
  <path d="M9.5 4h5v5.5H20v5h-5.5V20h-5v-5.5H4v-5h5.5z" />,
  <path d="M9.5 4h5v5.5H20v5h-5.5V20h-5v-5.5H4v-5h5.5z" />,
);

export const HomeIcon = make(
  <path d="M6 10 12 5l6 5v10H6z" />,
  <>
    <path d="M4 11 12 4l8 7" />
    <path d="M6 9.5V20h12V9.5" />
    <path d="M10 20v-5.5h4V20" />
  </>,
);

export const SteeringIcon = make(
  <circle cx="12" cy="12" r="8" />,
  <>
    <circle cx="12" cy="12" r="8" />
    <circle cx="12" cy="12" r="2" />
    <path d="M4.2 12H10M14 12h5.8M12 14v6" />
  </>,
);

export const ScalesIcon = make(
  <>
    <path d="M5 7 2 13a3 3 0 0 0 6 0z" />
    <path d="M19 7l-3 6a3 3 0 0 0 6 0z" />
  </>,
  <>
    <path d="M12 4v16M7.5 20h9M5 7h14" />
    <path d="M5 7 2 13a3 3 0 0 0 6 0zM19 7l-3 6a3 3 0 0 0 6 0z" />
  </>,
);

// ---------------------------------------------------------------------------------------
// What the service is
// ---------------------------------------------------------------------------------------
export const LayoutIcon = make(
  <path d="M4 5.5A1.5 1.5 0 0 1 5.5 4h13A1.5 1.5 0 0 1 20 5.5V9.5H4z" />,
  <>
    <path d="M4 5.5A1.5 1.5 0 0 1 5.5 4h13A1.5 1.5 0 0 1 20 5.5v13a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 18.5z" />
    <path d="M4 9.5h16M10 9.5V20" />
  </>,
);

export const PhoneIcon = make(
  <path d="M5 4h3.6l1.9 4.6-2.3 1.4a11 11 0 0 0 5.8 5.8l1.4-2.3L20 15.4V19a1 1 0 0 1-1 1A15 15 0 0 1 4 5a1 1 0 0 1 1-1z" />,
  <path d="M5 4h3.6l1.9 4.6-2.3 1.4a11 11 0 0 0 5.8 5.8l1.4-2.3L20 15.4V19a1 1 0 0 1-1 1A15 15 0 0 1 4 5a1 1 0 0 1 1-1z" />,
);

export const DevicesIcon = make(
  <rect x="14.5" y="9.5" width="6.5" height="10.5" rx="1.6" />,
  <>
    <path d="M14 14V6.5A1.5 1.5 0 0 0 12.5 5h-8A1.5 1.5 0 0 0 3 6.5v8A1.5 1.5 0 0 0 4.5 16H11" />
    <path d="M2 19h9.5" />
    <rect x="14.5" y="9.5" width="6.5" height="10.5" rx="1.6" />
    <path d="M17 17.5h1.5" />
  </>,
);

export const PencilIcon = make(
  <path d="M4.5 19.5 5.6 15 16 4.6a2.1 2.1 0 0 1 3 3L8.6 18z" />,
  <>
    <path d="M4.5 19.5 5.6 15 16 4.6a2.1 2.1 0 0 1 3 3L8.6 18z" />
    <path d="M14 6.6l3 3" />
  </>,
);

export const EyeIcon = make(
  <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z" />,
  <>
    <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z" />
    <circle cx="12" cy="12" r="2.8" />
  </>,
);

export const RocketIcon = make(
  <path d="M12 3c3.6 2 5 5.6 4.6 9.6L12 17l-4.6-4.4C7 8.6 8.4 5 12 3z" />,
  <>
    <path d="M12 3c3.6 2 5 5.6 4.6 9.6L12 17l-4.6-4.4C7 8.6 8.4 5 12 3z" />
    <circle cx="12" cy="9.5" r="1.6" />
    <path d="M7.6 12.6 4.8 14.6l1.6 3.4 2.8-1.4M16.4 12.6l2.8 2-1.6 3.4-2.8-1.4M12 17v3.5" />
  </>,
);

export const LayersIcon = make(
  <path d="M12 3.5 21 8.5l-9 5-9-5z" />,
  <>
    <path d="M12 3.5 21 8.5l-9 5-9-5z" />
    <path d="M3 12.5l9 5 9-5M3 16.5l9 5 9-5" />
  </>,
);

export const UserIcon = make(
  <circle cx="12" cy="8" r="3.5" />,
  <>
    <circle cx="12" cy="8" r="3.5" />
    <path d="M5 20a7 7 0 0 1 14 0" />
  </>,
);

export const SendIcon = make(
  <path d="M21 3 14.5 21l-4-7-7-4z" />,
  <>
    <path d="M21 3 14.5 21l-4-7-7-4z" />
    <path d="M21 3 10.5 14" />
  </>,
);

export const ShieldIcon = make(
  <path d="M12 3l7.5 3v5.5c0 4.5-3 8-7.5 9.5-4.5-1.5-7.5-5-7.5-9.5V6z" />,
  <>
    <path d="M12 3l7.5 3v5.5c0 4.5-3 8-7.5 9.5-4.5-1.5-7.5-5-7.5-9.5V6z" />
    <path d="M9 12l2 2 4-4" />
  </>,
);

export const BoltIcon = make(
  <path d="M13 3 5 13.5h6L10 21l8-10.5h-6z" />,
  <path d="M13 3 5 13.5h6L10 21l8-10.5h-6z" />,
);

export const TargetIcon = make(
  <circle cx="12" cy="12" r="5" />,
  <>
    <circle cx="12" cy="12" r="9" />
    <circle cx="12" cy="12" r="5" />
    <circle cx="12" cy="12" r="1.2" />
  </>,
);

export const SparkIcon = make(
  <path d="M11 4l1.9 5.1L18 11l-5.1 1.9L11 18l-1.9-5.1L4 11l5.1-1.9z" />,
  <>
    <path d="M11 4l1.9 5.1L18 11l-5.1 1.9L11 18l-1.9-5.1L4 11l5.1-1.9z" />
    <path d="M19 16v4M17 18h4" />
  </>,
);

export const MonitorIcon = make(
  <path d="M3 6.5A1.5 1.5 0 0 1 4.5 5h15A1.5 1.5 0 0 1 21 6.5V15H3z" />,
  <>
    <path d="M3 6.5A1.5 1.5 0 0 1 4.5 5h15A1.5 1.5 0 0 1 21 6.5v9a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 15.5z" />
    <path d="M9 20h6M12 17v3" />
  </>,
);

export const MobileIcon = make(
  <rect x="6.5" y="3" width="11" height="18" rx="2.5" />,
  <>
    <rect x="6.5" y="3" width="11" height="18" rx="2.5" />
    <path d="M10.5 17.5h3" />
  </>,
);

// ---------------------------------------------------------------------------------------
// Controls (same weight, a touch bolder so they stay crisp at small sizes)
// ---------------------------------------------------------------------------------------
export const ArrowRightIcon = make(null, <path d="M5 12h14M13 6l6 6-6 6" />, STROKE_UI);
export const CheckIcon = make(null, <path d="M5 12.5l4.5 4.5L19 7.5" />, STROKE_UI);
export const ChevronDownIcon = make(null, <path d="M6 9l6 6 6-6" />, STROKE_UI);
export const PlusIcon = make(null, <path d="M12 5v14M5 12h14" />, STROKE_UI);

export const LinkIcon = make(
  null,
  <>
    <path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1" />
    <path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1" />
  </>,
);

export const UploadIcon = make(
  null,
  <>
    <path d="M12 16V4M7 9l5-5 5 5" />
    <path d="M4 15v3.5A1.5 1.5 0 0 0 5.5 20h13a1.5 1.5 0 0 0 1.5-1.5V15" />
  </>,
);

export const TrashIcon = make(
  <path d="M6.5 7.5h11l-.8 11a1.5 1.5 0 0 1-1.5 1.4H8.8a1.5 1.5 0 0 1-1.5-1.4z" />,
  <>
    <path d="M4 7.5h16M9.5 7.5V5a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1v2.5" />
    <path d="M6.5 7.5l.8 11a1.5 1.5 0 0 0 1.5 1.4h6.4a1.5 1.5 0 0 0 1.5-1.4l.8-11" />
  </>,
);

// ---------------------------------------------------------------------------------------
// A tile to put an icon in: the same quiet, slightly raised square everywhere on the site.
// ---------------------------------------------------------------------------------------
const sizes = {
  sm: { box: "h-9 w-9 rounded-[11px]", glyph: "h-[18px] w-[18px]" },
  md: { box: "h-11 w-11 rounded-[14px]", glyph: "h-[22px] w-[22px]" },
  lg: { box: "h-14 w-14 rounded-[18px]", glyph: "h-7 w-7" },
} as const;

export function IconBadge({
  icon: Glyph,
  size = "md",
  dark = false,
  className = "",
}: {
  icon: IconComponent;
  size?: keyof typeof sizes;
  dark?: boolean;
  className?: string;
}) {
  const s = sizes[size];
  return (
    <span
      aria-hidden="true"
      className={`inline-flex shrink-0 items-center justify-center ${s.box} ${
        dark
          ? "bg-[#111111] text-white shadow-[0_6px_16px_rgba(17,17,17,0.22)]"
          : "bg-gradient-to-b from-white to-[#F3F0E8] text-[#111111] shadow-[inset_0_1px_0_rgba(255,255,255,0.95),0_0_0_1px_rgba(17,17,17,0.07),0_1px_2px_rgba(40,30,0,0.08),0_8px_18px_rgba(40,30,0,0.06)]"
      } ${className}`}
    >
      <Glyph className={s.glyph} />
    </span>
  );
}
