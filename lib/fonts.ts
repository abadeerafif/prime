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
 * Not preloaded: English pages never use it, and on Arabic pages the
 * render-blocking stylesheet starts the download at first layout.
 */
export const plexArabic = IBM_Plex_Sans_Arabic({
  variable: "--font-arabic-body",
  display: "swap",
  preload: false,
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

/**
 * The Arabic display face (Al Tarikh) is declared in globals.css against a
 * stable /fonts URL so the Arabic layout alone can preload it.
 */
export const AL_TARIKH_URL = "/fonts/al-tarikh.woff2";

export const fontVariables = [avenir.variable, avenirHeavy.variable, plexArabic.variable, fraunces.variable].join(" ");
