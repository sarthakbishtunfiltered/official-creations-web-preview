import type { ComponentType } from "react";
import type { Design, NicheId } from "../data/niches";
import type { SiteData } from "../lib/siteData";

export type TemplateComponent = ComponentType<{ data: SiteData }>;

// Register each finished template here, for example:
//   "interior-designers": { simple: InteriorSimple, premium: InteriorPremium },
// Until a template is registered, the preview panel shows the entered details instead.
export const templates: Partial<Record<NicheId, Partial<Record<Design, TemplateComponent>>>> = {};
