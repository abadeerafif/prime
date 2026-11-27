export type PhotoAsset = {
  src: string;
  width: number;
  height: number;
};

/**
 * Every supplied clinic photograph in public/images.
 * Kept in one typed map so no component can reference a missing file.
 */
export const photos = {
  hero: { src: "/images/01-home-hero-1500x2000.webp", width: 1500, height: 2000 },
  dermatology: { src: "/images/02-dermatology-1600x2000.webp", width: 1600, height: 2000 },
  botox: { src: "/images/03-botox-1600x2000.webp", width: 1600, height: 2000 },
  fillers: { src: "/images/04-fillers-1600x2000.webp", width: 1600, height: 2000 },
  "plastic-surgery": { src: "/images/05-plastic-surgery-1600x2000.webp", width: 1600, height: 2000 },
  "body-contouring": { src: "/images/06-body-contouring-1600x2000.webp", width: 1600, height: 2000 },
  dentistry: { src: "/images/07-dentistry-1600x2000.webp", width: 1600, height: 2000 },
  "oral-surgery": { src: "/images/08-oral-surgery-1600x2000.webp", width: 1600, height: 2000 },
  "hair-transplant": { src: "/images/09-hair-transplant-1600x2000.webp", width: 1600, height: 2000 },
  hairFeature: { src: "/images/10-hair-transplant-feature-1500x2000.webp", width: 1500, height: 2000 },
} as const satisfies Record<string, PhotoAsset>;

export type PhotoKey = keyof typeof photos;

/** Returns the photo for a specialty/hub id if one was supplied, otherwise null. */
export function specialtyPhoto(id: string): PhotoAsset | null {
  return id in photos ? photos[id as PhotoKey] : null;
}
