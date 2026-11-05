import {
  BalloonIcon,
  CameraIcon,
  ClinicIcon,
  DraftingIcon,
  HomeIcon,
  InteriorIcon,
  KitchenIcon,
  SalonIcon,
  ScalesIcon,
  SteeringIcon,
} from "../components/icons";
import type { IconComponent } from "../components/icons";

// The four template families. Niches in one family share the same form block.
export type Family = "portfolio" | "booking" | "food" | "professional";

export type NicheId =
  | "interior-designers"
  | "photographers"
  | "salons"
  | "cloud-kitchens"
  | "architects"
  | "event-decorators"
  | "clinics"
  | "real-estate"
  | "driving-schools"
  | "ca-legal";

export interface Niche {
  id: NicheId;
  label: string;
  family: Family;
  icon: IconComponent;
  // Neutral default tagline, used when the team leaves the tagline blank.
  defaultTagline: string;
  // Professional-advertising niches: no testimonials or before/after on the form.
  regulated?: boolean;
}

// The single source of truth for the 10 niches. Every component imports this list.
export const niches: Niche[] = [
  {
    id: "interior-designers",
    label: "Interior Designers",
    family: "portfolio",
    icon: InteriorIcon,
    defaultTagline: "Spaces designed around the way you live.",
  },
  {
    id: "photographers",
    label: "Wedding & Event Photographers",
    family: "portfolio",
    icon: CameraIcon,
    defaultTagline: "Your story, told one frame at a time.",
  },
  {
    id: "salons",
    label: "Boutique & Women's Salons",
    family: "booking",
    icon: SalonIcon,
    defaultTagline: "Look good. Feel even better.",
  },
  {
    id: "cloud-kitchens",
    label: "Home Cloud Kitchens",
    family: "food",
    icon: KitchenIcon,
    defaultTagline: "Home-cooked food, delivered fresh.",
  },
  {
    id: "architects",
    label: "Architects & Design Firms",
    family: "portfolio",
    icon: DraftingIcon,
    defaultTagline: "Thoughtful design, built to last.",
  },
  {
    id: "event-decorators",
    label: "Event Decorators",
    family: "portfolio",
    icon: BalloonIcon,
    defaultTagline: "Making every celebration look beautiful.",
  },
  {
    id: "clinics",
    label: "Doctors, Dentists & Clinics",
    family: "booking",
    icon: ClinicIcon,
    defaultTagline: "Caring for you and your family.",
    regulated: true,
  },
  {
    id: "real-estate",
    label: "Real Estate Agents",
    family: "professional",
    icon: HomeIcon,
    defaultTagline: "Helping you find the right place.",
  },
  {
    id: "driving-schools",
    label: "Driving Schools",
    family: "booking",
    icon: SteeringIcon,
    defaultTagline: "Learn to drive with confidence.",
  },
  {
    id: "ca-legal",
    label: "CA Firms & Legal Practices",
    family: "professional",
    icon: ScalesIcon,
    defaultTagline: "Dependable guidance for your accounts, tax and legal needs.",
    regulated: true,
  },
];

export function getNiche(id: string): Niche | undefined {
  return niches.find((n) => n.id === id);
}

export type Design = "simple" | "premium";

export const designs: { id: Design; label: string; hint: string }[] = [
  { id: "simple", label: "Simple", hint: "Clean and quick" },
  { id: "premium", label: "Premium", hint: "Richer, more detail" },
];
