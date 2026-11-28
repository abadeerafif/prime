# PRIME CLINICS — landing page

Bilingual (English / Arabic, RTL-aware) landing page for PRIME CLINICS, built with Next.js, Tailwind CSS, GSAP and Lenis. The page is a single scroll story in which the logo's bloom is drawn in the preloader, opens behind the hero, travels through the sections and settles as a seal beside the booking form.

## Run

```bash
npm install
npm run dev        # http://localhost:3000 -> redirects to /en or /ar
npm run build
npm start
```

Copy `.env.example` to `.env.local` and fill in:

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_ADOBE_KIT_ID` | Adobe Fonts kit containing Aquavit. Until set, the display face falls back to Fraunces. |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | Digits only, international format (defaults to `201016895099`). Enquiry form and WhatsApp button use it. |
| `NEXT_PUBLIC_PHONE` | Clinic phone numbers separated by `\|` or `,` (defaults to `+20 101 689 5099 \| +20 109 207 9155`). |
| `NEXT_PUBLIC_SITE_URL` | Public URL for Open Graph metadata. |

## Structure

- `app/[locale]/` — root layout (fonts, `lang`/`dir`, metadata); `(main)` holds the clinic site, `hair-transplant/(site)` the hair mini-site and `hair-transplant/(focus)` its distraction-free booking page
- `proxy.ts` — locale redirect from `/` using cookie, then `Accept-Language`
- `dictionaries/` — UI strings (`en.json`, `ar.json`); only `clientDictFor` reaches the browser
- `content/` — bilingual page content, the route registry and `PENDING.md` (items awaiting clinic confirmation)
- `components/sections/` — Preloader, Navigation, Hero, TrustStrip, Philosophy, Treatments, HairBand, Team, Guide, HomeFaq, Journey, Booking, Footer
- `components/motion/` — SmoothScroll (Lenis + GSAP), SplitReveal, Reveal, ImageReveal, MagneticButton, ThemeShift, ScrollProgress
- `components/ui/` and `components/templates/` — shared blocks (PageHero, NumberedList, AddressBlock, ContactRows, cards) and page templates
- `components/bloom/` — `BloomMark` (the bloom as strokeable SVG) and `BloomStage` (the persistent scroll-driven bloom)
- `lib/motion.ts` — shared duration and stagger tokens; `lib/gsap.ts` registers plugins and the `prime` eases
- `public/brand/` — logos (full-size originals for Open Graph, `-480`/`-384`/`-168` copies sized for display) and icons; `public/fonts/` — Avenir and Al Tarikh as woff2

## Replacing placeholders

- **Photography**: supplied images live in `public/images/` and are mapped in `lib/images.ts`, rendered via `Photo` in `components/ui/PhotoFrame.tsx`.
- **Copy and facts**: addresses, phone numbers and hours live in the dictionaries and are marked "to be confirmed".
- **Arabic**: written for layout and tone; have a native speaker review before launch.
- **Avenir**: the supplied `.ttc` is a desktop licence. Confirm a web licence before going live.

## Notes

- Page colour shifts are driven by `data-theme-section` on each section (`ivory`, `grey`, `wood`, `charcoal`) and mirrored onto `<html data-theme>`.
- `prefers-reduced-motion` disables smooth scroll, pinning, parallax, reveals and draw animations.
- Inner-page heroes and the header enter with CSS only (`.enter` in `globals.css`) so the headline paints before JavaScript loads; everything below the fold still uses GSAP.
- Fonts: Avenir and Fraunces for Latin; Palestine (Arabic headlines) and Al Tarikh (Arabic text) are the brand Arabic faces, self-hosted through `next/font/local` in `lib/fonts.ts` and limited to Arabic by `unicode-range`. All are preloaded. Originals live in `Fonts PRIME/`; the Arabic web files are generated from them with `npm run fonts` (adds OpenType joining to Al Tarikh and closes Palestine's join seams) — never edit `public/fonts/*.woff` by hand.
- In development, append `#slow-intro` to the URL to watch the preloader choreography at reduced speed.
