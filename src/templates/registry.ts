import type { ComponentType } from "react";
import type { Design, NicheId } from "../data/niches";
import type { SiteData } from "../lib/siteData";
import { ClinicSimple } from "./clinics/Simple";
import { PhotographerSimple } from "./photographers/Simple";
import { InteriorSimple } from "./interior-designers/Simple";

export type TemplateComponent = ComponentType<{ data: SiteData }>;

// Register each finished template here. Until a template is registered, the preview panel
// shows the entered details instead.
export const templates: Partial<Record<NicheId, Partial<Record<Design, TemplateComponent>>>> = {
  "interior-designers": { simple: InteriorSimple },
  clinics: { simple: ClinicSimple },
  photographers: { simple: PhotographerSimple },
};
