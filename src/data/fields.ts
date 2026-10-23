import { getNiche } from "./niches";
import type { Family, NicheId } from "./niches";

export type FieldType =
  | "text"
  | "textarea"
  | "tel"
  | "email"
  | "url"
  | "number"
  | "color"
  | "select"
  | "toggle"
  | "image"
  | "list";

export interface FieldDef {
  key: string;
  label: string;
  type: FieldType;
  required?: boolean;
  placeholder?: string;
  help?: string;
  // select: the choices
  options?: string[];
  // list: most items allowed, what one item is called, and the fields inside one item
  max?: number;
  itemName?: string;
  fields?: FieldDef[];
  // image: longest side in pixels after automatic resizing
  maxDim?: number;
}

export interface Block {
  title?: string;
  fields: FieldDef[];
}

export interface Group {
  id: string;
  title: string;
  hint?: string;
  blocks: Block[];
}

// ---------------------------------------------------------------------------
// Step 2: the six compulsory details (niche and design are picked separately)
// ---------------------------------------------------------------------------
export const coreFields: FieldDef[] = [
  { key: "businessName", label: "Business name", type: "text", required: true, placeholder: "e.g. Sunrise Interiors" },
  { key: "ownerName", label: "Owner name", type: "text", required: true, placeholder: "e.g. Alex Rivera" },
  { key: "phone", label: "Phone number", type: "tel", required: true, placeholder: "e.g. 98765 43210" },
  { key: "city", label: "City", type: "text", required: true, placeholder: "e.g. Ahmedabad" },
];

// The font looks a template can use. Blank means Modern.
export const fontStyleOptions: string[] = ["Modern", "Classic", "Bold"];

// ---------------------------------------------------------------------------
// Group 1: contact, logo, colours and words
// ---------------------------------------------------------------------------
const lookBlock: Block = {
  fields: [
    {
      key: "whatsapp",
      label: "WhatsApp number",
      type: "tel",
      placeholder: "Leave blank to use the phone number",
    },
    { key: "address", label: "Full address", type: "textarea", placeholder: "Leave blank to show only the city" },
    { key: "logo", label: "Logo", type: "image", maxDim: 800, help: "Leave blank to show the business name as text." },
    { key: "brandColor", label: "Brand color", type: "color", help: "Leave unset to use the niche's default color." },
    {
      key: "fontStyle",
      label: "Font style",
      type: "select",
      options: fontStyleOptions,
      help: "Modern is the default. Classic uses a serif for headings. Bold is heavier and tighter.",
    },
    { key: "tagline", label: "Tagline", type: "text", placeholder: "Leave blank for a default line" },
    {
      key: "about",
      label: "About text",
      type: "textarea",
      placeholder: "Leave blank for a default about section",
    },
    { key: "heroImage", label: "Hero image", type: "image", help: "The big image at the top of the page." },
  ],
};

// Keys the generated site data holds at the top level (the rest go under `fields`).
export const TOP_LEVEL_KEYS: ReadonlySet<string> = new Set([
  ...coreFields.map((f) => f.key),
  ...lookBlock.fields.map((f) => f.key),
]);

// ---------------------------------------------------------------------------
// Group 2: the family block, then the extras for one niche
// ---------------------------------------------------------------------------
const familyBlocks: Record<Family, Block[]> = {
  portfolio: [
    {
      title: "Portfolio",
      fields: [
        {
          key: "projects",
          label: "Project gallery",
          type: "list",
          max: 12,
          itemName: "project",
          fields: [
            { key: "image", label: "Project image", type: "image" },
            { key: "title", label: "Project title", type: "text" },
            { key: "type", label: "Type (e.g. Living room)", type: "text" },
          ],
        },
        {
          key: "services",
          label: "Services or packages",
          type: "list",
          max: 8,
          itemName: "service",
          fields: [
            { key: "name", label: "Name", type: "text" },
            { key: "description", label: "Short description", type: "text" },
            { key: "price", label: "Starting from (optional)", type: "text" },
          ],
        },
        {
          key: "processSteps",
          label: "How we work (steps)",
          type: "list",
          max: 5,
          itemName: "step",
          fields: [
            { key: "title", label: "Step name", type: "text" },
            { key: "description", label: "Short description", type: "text" },
          ],
          help: "Leave empty to show a standard four-step process.",
        },
        { key: "openingHours", label: "Opening hours", type: "textarea", placeholder: "e.g. Mon-Sat, 10 am to 7 pm" },
        { key: "enquiryForm", label: "Show an enquiry form", type: "toggle" },
      ],
    },
  ],
  booking: [
    {
      title: "Services and booking",
      fields: [
        {
          key: "serviceList",
          label: "Services",
          type: "list",
          max: 12,
          itemName: "service",
          fields: [
            { key: "name", label: "Service name", type: "text" },
            { key: "price", label: "Price or fee", type: "text" },
            { key: "duration", label: "Duration (optional)", type: "text" },
          ],
        },
        {
          key: "staff",
          label: "Team",
          type: "list",
          max: 6,
          itemName: "team member",
          fields: [
            { key: "name", label: "Name", type: "text" },
            { key: "role", label: "Role or qualification", type: "text" },
            { key: "photo", label: "Photo", type: "image", maxDim: 800 },
          ],
        },
        {
          key: "bookingMode",
          label: "Booking button",
          type: "select",
          options: ["WhatsApp", "Call", "External link"],
        },
        { key: "bookingLink", label: "Booking page link", type: "url", help: "Only needed for 'External link'." },
        { key: "openingHours", label: "Opening hours", type: "textarea", placeholder: "e.g. Mon-Sat, 10 am to 8 pm" },
      ],
    },
  ],
  food: [
    {
      title: "Menu and ordering",
      fields: [
        {
          key: "menu",
          label: "Menu items",
          type: "list",
          max: 20,
          itemName: "menu item",
          fields: [
            { key: "name", label: "Dish name", type: "text" },
            { key: "price", label: "Price", type: "text" },
            { key: "diet", label: "Veg or non-veg", type: "select", options: ["Veg", "Non-veg"] },
            { key: "description", label: "Short description", type: "text" },
            { key: "photo", label: "Photo", type: "image", maxDim: 1000 },
          ],
        },
        { key: "orderWhatsapp", label: "Order WhatsApp number", type: "tel" },
        { key: "deliveryArea", label: "Delivery area", type: "text", placeholder: "e.g. Within 8 km of Satellite" },
        { key: "minOrder", label: "Minimum order", type: "text", placeholder: "e.g. Rs. 300" },
        { key: "orderTiming", label: "Order timing", type: "text", placeholder: "e.g. Order one day ahead" },
        { key: "zomatoLink", label: "Zomato link", type: "url" },
        { key: "swiggyLink", label: "Swiggy link", type: "url" },
        { key: "fssai", label: "FSSAI number", type: "text" },
      ],
    },
  ],
  professional: [
    {
      title: "Services and team",
      fields: [
        {
          key: "practiceAreas",
          label: "Services or practice areas",
          type: "list",
          max: 8,
          itemName: "service",
          fields: [
            { key: "title", label: "Title", type: "text" },
            { key: "description", label: "Short description", type: "text" },
          ],
        },
        {
          key: "partners",
          label: "Partners or team",
          type: "list",
          max: 6,
          itemName: "team member",
          fields: [
            { key: "name", label: "Name", type: "text" },
            { key: "qualification", label: "Qualification", type: "text" },
            { key: "photo", label: "Photo", type: "image", maxDim: 800 },
          ],
        },
        {
          key: "consultMode",
          label: "Consultation button",
          type: "select",
          options: ["Call", "WhatsApp", "Enquiry form"],
        },
      ],
    },
  ],
};

const nicheExtras: Record<NicheId, FieldDef[]> = {
  "interior-designers": [
    { key: "yearsExperience", label: "Years of experience", type: "number" },
    { key: "projectTypes", label: "Project types", type: "text", placeholder: "e.g. Residential, Commercial" },
  ],
  photographers: [
    {
      key: "packages",
      label: "Packages",
      type: "list",
      max: 6,
      itemName: "package",
      fields: [
        { key: "name", label: "Package name", type: "text" },
        { key: "description", label: "What's included", type: "text" },
        { key: "price", label: "Price (optional)", type: "text" },
      ],
    },
    { key: "reelLink", label: "Video or reel link", type: "url" },
  ],
  salons: [
    { key: "serviceCategories", label: "Service categories", type: "text", placeholder: "e.g. Hair, Skin, Bridal" },
    { key: "bridalPackages", label: "Bridal packages", type: "textarea" },
    { key: "homeVisit", label: "Home visits available", type: "toggle" },
  ],
  "cloud-kitchens": [{ key: "cuisineType", label: "Cuisine type", type: "text", placeholder: "e.g. Gujarati thali" }],
  architects: [
    { key: "yearsExperience", label: "Years of experience", type: "number" },
    { key: "projectTypes", label: "Project types", type: "text", placeholder: "e.g. Residential, Commercial" },
  ],
  "event-decorators": [
    { key: "eventTypes", label: "Event types", type: "text", placeholder: "e.g. Wedding, Birthday, Corporate" },
    {
      key: "themeGallery",
      label: "Theme gallery",
      type: "list",
      max: 12,
      itemName: "theme",
      fields: [
        { key: "image", label: "Theme image", type: "image" },
        { key: "title", label: "Theme name", type: "text" },
      ],
    },
  ],
  clinics: [
    { key: "doctorName", label: "Doctor name", type: "text" },
    { key: "qualification", label: "Qualification", type: "text" },
    { key: "specialities", label: "Specialities", type: "text", placeholder: "e.g. Dental care, Orthodontics" },
    { key: "medicalRegistration", label: "Registration number", type: "text" },
  ],
  "real-estate": [
    { key: "areasServed", label: "Areas served", type: "text" },
    { key: "propertyFocus", label: "Property focus", type: "text", placeholder: "e.g. Residential flats" },
    { key: "reraNumber", label: "RERA number", type: "text" },
    {
      key: "listings",
      label: "Property listings",
      type: "list",
      max: 12,
      itemName: "listing",
      fields: [
        { key: "image", label: "Photo", type: "image" },
        { key: "title", label: "Title", type: "text" },
        { key: "price", label: "Price", type: "text" },
        { key: "area", label: "Area or size", type: "text" },
        { key: "type", label: "Type (e.g. 3 BHK)", type: "text" },
      ],
    },
  ],
  "driving-schools": [
    { key: "courses", label: "Courses", type: "text", placeholder: "e.g. Two-wheeler, Four-wheeler, Licence help" },
    { key: "instructorDetails", label: "Instructor details", type: "textarea" },
    { key: "carDetails", label: "Car and vehicle details", type: "text" },
  ],
  "ca-legal": [
    { key: "partnerNames", label: "Partner names", type: "text" },
    { key: "professionalRegistration", label: "Registration or enrolment number", type: "text" },
  ],
};

// Every key that belongs to one niche's own block (family block plus extras).
export function nicheOwnedKeys(id: NicheId): Set<string> {
  const niche = getNiche(id);
  const keys = new Set<string>();
  if (!niche) return keys;
  for (const block of familyBlocks[niche.family]) {
    for (const f of block.fields) keys.add(f.key);
  }
  for (const f of nicheExtras[id]) keys.add(f.key);
  return keys;
}

// ---------------------------------------------------------------------------
// Group 3: more options, the same for every niche
// ---------------------------------------------------------------------------
function moreBlocks(id: NicheId | ""): Block[] {
  const niche = id ? getNiche(id) : undefined;
  const regulated = niche?.regulated === true;

  const trust: FieldDef[] = [
    {
      key: "keyNumbers",
      label: "Key numbers",
      type: "list",
      max: 4,
      itemName: "number",
      fields: [
        { key: "label", label: "Label (e.g. Projects done)", type: "text" },
        { key: "value", label: "Value (e.g. 120+)", type: "text" },
      ],
    },
    { key: "certifications", label: "Certifications and awards", type: "text" },
    { key: "googleReviewsLink", label: "Google reviews link", type: "url" },
    {
      key: "faqs",
      label: "FAQs",
      type: "list",
      max: 6,
      itemName: "question",
      fields: [
        { key: "question", label: "Question", type: "text" },
        { key: "answer", label: "Answer", type: "text" },
      ],
    },
  ];

  // Doctors, CAs and lawyers have advertising rules, so these stay off their forms.
  if (!regulated) {
    trust.push({
      key: "testimonials",
      label: "Testimonials",
      type: "list",
      max: 6,
      itemName: "testimonial",
      fields: [
        { key: "name", label: "Client name", type: "text" },
        { key: "quote", label: "What they said", type: "text" },
      ],
    });
    if (niche?.family === "portfolio") {
      trust.push({
        key: "beforeAfter",
        label: "Before and after",
        type: "list",
        max: 6,
        itemName: "comparison",
        fields: [
          { key: "title", label: "Title", type: "text" },
          { key: "before", label: "Before image", type: "image" },
          { key: "after", label: "After image", type: "image" },
        ],
      });
    }
  }

  return [
    {
      title: "Photos",
      fields: [
        { key: "ownerPhoto", label: "Owner photo", type: "image", maxDim: 1000 },
        { key: "aboutImage", label: "About-section image", type: "image" },
        {
          key: "extraGallery",
          label: "Extra gallery photos",
          type: "list",
          max: 12,
          itemName: "photo",
          fields: [
            { key: "image", label: "Photo", type: "image" },
            { key: "caption", label: "Caption (optional)", type: "text" },
          ],
        },
      ],
    },
    { title: "Trust and proof", fields: trust },
    {
      title: "Contact and social",
      fields: [
        { key: "email", label: "Email", type: "email" },
        { key: "secondPhone", label: "Second phone number", type: "tel" },
        {
          key: "mapsLink",
          label: "Google Maps link",
          type: "url",
          help: "Paste the full link from the browser address bar to show that exact spot on the map. Short links only work for the Open in Maps button.",
        },
        {
          key: "mapEmbed",
          label: "Google Maps embed code (for the map)",
          type: "text",
          placeholder: "Paste the embed code or link",
          help: "Optional. In Google Maps: Share, then Embed a map, then copy. Leave blank to use the address.",
        },
        { key: "instagram", label: "Instagram link", type: "url" },
        { key: "facebook", label: "Facebook link", type: "url" },
        { key: "youtube", label: "YouTube link", type: "url" },
        { key: "yearEstablished", label: "Year established", type: "number" },
      ],
    },
    {
      title: "Offers",
      fields: [
        { key: "announcementBanner", label: "Announcement banner", type: "text", placeholder: "e.g. Festive offer: 10% off" },
        { key: "buttonText", label: "Main button text", type: "text", placeholder: "e.g. Book a free consultation" },
        { key: "whatsappMessage", label: "Pre-filled WhatsApp message", type: "text" },
        { key: "brochureLink", label: "Brochure or price list link", type: "url" },
        { key: "paymentLink", label: "UPI ID or payment link", type: "text" },
      ],
    },
    {
      title: "Search listing (SEO)",
      fields: [
        { key: "pageTitle", label: "Page title", type: "text", help: "Written automatically if left blank." },
        { key: "metaDescription", label: "Page description", type: "textarea", help: "Written automatically if left blank." },
      ],
    },
  ];
}

// The optional groups shown under the compulsory fields, for the chosen niche.
export function getGroups(id: NicheId | ""): Group[] {
  const niche = id ? getNiche(id) : undefined;
  const nicheBlocks: Block[] = niche
    ? [
        ...familyBlocks[niche.family],
        { title: "More about the business", fields: nicheExtras[niche.id] },
      ]
    : [];

  return [
    { id: "look", title: "Logo, colors and words", blocks: [lookBlock] },
    {
      id: "niche",
      title: niche ? `${niche.label} details` : "Niche details",
      hint: niche ? undefined : "Choose a niche to see its extra details.",
      blocks: nicheBlocks,
    },
    { id: "more", title: "More options", blocks: moreBlocks(id) },
  ];
}

// Every field that applies to the chosen niche, in form order (used for checks and output).
export function fieldsFor(id: NicheId | ""): FieldDef[] {
  const all: FieldDef[] = [...coreFields];
  for (const group of getGroups(id)) {
    for (const block of group.blocks) all.push(...block.fields);
  }
  return all;
}
