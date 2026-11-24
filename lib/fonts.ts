import localFont from "next/font/local";
import { Fraunces, IBM_Plex_Sans_Arabic } from "next/font/google";

/**
 * Avenir Book (400) and Medium (500), extracted from the supplied collection.
 * Note: the supplied file is a desktop licence; confirm a web licence before launch.
 */
export const avenir = localFont({
  variable: "--font-avenir",
  display: "swap",
  // Fixed name so the Arabic stack can reference Avenir without its
  // Arial-backed fallback, which would otherwise capture Arabic glyphs.
  declarations: [{ prop: "font-family", value: "avenir" }],
  src: [
    { path: "../public/fonts/avenir-book.woff2", weight: "400", style: "normal" },
    { path: "../public/fonts/avenir-medium.woff2", weight: "500", style: "normal" },
    { path: "../public/fonts/avenir-heavy.woff2", weight: "700", style: "normal" },
  ],
});

/** Arabic display face. The supplied collection has a single Regular weight. */
export const alTarikh = localFont({
  variable: "--font-tarikh",
  display: "swap",
  declarations: [{ prop: "font-family", value: "alTarikh" }],
  src: [{ path: "../public/fonts/al-tarikh.woff2", weight: "400", style: "normal" }],
});

/** Arabic text face: real 400 to 700 weights for body, labels and buttons. */
export const plexArabic = IBM_Plex_Sans_Arabic({
  variable: "--font-arabic-body",
  display: "swap",
  subsets: ["arabic"],
  weight: ["400", "500", "600", "700"],
});

/**
 * Fallback for Aquavit until an Adobe Fonts kit ID is provided via
 * NEXT_PUBLIC_ADOBE_KIT_ID. Fraunces shares Aquavit's soft, flared serif feel.
 */
export const fraunces = Fraunces({
  variable: "--font-fraunces",
  display: "swap",
  subsets: ["latin"],
  weight: "variable",
  axes: ["opsz", "SOFT"],
});

export const fontVariables = [
  avenir.variable,
  alTarikh.variable,
  plexArabic.variable,
  fraunces.variable,
].join(" ");
