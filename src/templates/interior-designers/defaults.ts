// Default photos for this template. Put the files in public/defaults/interior-designers/ using
// exactly these names. Any file that is missing is skipped and a placeholder shows instead.
const BASE = "defaults/interior-designers/";

export const defaultImages = {
  hero: `${BASE}hero.webp`,
  featured: `${BASE}featured.webp`,
  about: `${BASE}about.webp`,
  projects: [1, 2, 3, 4, 5, 6].map((n) => `${BASE}project-${n}.webp`),
};

// Project and gallery tiles take the defaults in turn.
export function defaultProject(index: number): string {
  return defaultImages.projects[index % defaultImages.projects.length] ?? defaultImages.featured;
}