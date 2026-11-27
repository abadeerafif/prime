import localFont from "next/font/local";
import { Fraunces, IBM_Plex_Sans_Arabic, Noto_Naskh_Arabic } from "next/font/google";

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
  ],
});

/**
 * Avenir Heavy joins the same "avenir" family, but only Arabic bold text
 * reaches it (for Latin words inside it), so it is not preloaded.
 */
export const avenirHeavy = localFont({
  variable: "--font-avenir-heavy",
  display: "swap",
  preload: false,
  adjustFontFallback: false,
  declarations: [{ prop: "font-family", value: "avenir" }],
  src: [{ path: "../public/fonts/avenir-heavy.woff2", weight: "700", style: "normal" }],
});

/**
 * Arabic text face: real 400 to 700 weights for body, labels and buttons.
 * Preloaded because Arabic is the default locale.
 */
export const plexArabic = IBM_Plex_Sans_Arabic({
  variable: "--font-arabic-body",
  display: "swap",
  preload: true,
  subsets: ["arabic"],
  weight: ["400", "500", "600", "700"],
});

/**
 * Arabic display face. Noto Naskh has real 400 to 700 weights, so headlines
 * can take emphasis without a faux bold. Preloaded with the body face.
 */
export const notoNaskhArabic = Noto_Naskh_Arabic({
  variable: "--font-arabic-display",
  display: "swap",
  preload: true,
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
});

export const fontVariables = [
  avenir.variable,
  avenirHeavy.variable,
  plexArabic.variable,
  notoNaskhArabic.variable,
  fraunces.variable,
].join(" ");
