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
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | Digits only, international format. Enquiry form and WhatsApp button use it; without it the form falls back to email. |
| `NEXT_PUBLIC_SITE_URL` | Public URL for Open Graph metadata. |

## Structure

- `app/[locale]/` — root layout (fonts, `lang`/`dir`, metadata) and the page
- `proxy.ts` — locale redirect from `/` using cookie, then `Accept-Language`
- `dictionaries/` — all copy (`en.json`, `ar.json`)
- `components/sections/` — Preloader, Navigation, Hero, Philosophy, Treatments, Experience, Journey, Booking, Footer
- `components/motion/` — SmoothScroll (Lenis + GSAP), SplitReveal, Reveal, ImageReveal, Parallax, MagneticButton, Cursor, ThemeShift, ScrollProgress
- `components/bloom/` — `BloomMark` (the bloom as strokeable SVG) and `BloomStage` (the persistent scroll-driven bloom)
- `lib/motion.ts` — shared easing and duration tokens; `lib/gsap.ts` registers plugins and the `prime` eases
- `public/brand/` — URL-safe copies of the logos and icons; `public/fonts/` — Avenir, Al Tarikh and Palestine as woff2

## Replacing placeholders

- **Photography**: every image frame renders `components/ui/PhotoFrame.tsx`. Swap its contents for `next/image` once photography exists; reveal and parallax wrappers stay as they are.
- **Copy and facts**: addresses, phone numbers and hours live in the dictionaries and are marked "to be confirmed".
- **Arabic**: written for layout and tone; have a native speaker review before launch.
- **Avenir**: the supplied `.ttc` is a desktop licence. Confirm a web licence before going live.

## Notes

- Page colour shifts are driven by `data-theme-section` on each section (`ivory`, `grey`, `wood`, `charcoal`) and mirrored onto `<html data-theme>`.
- `prefers-reduced-motion` disables smooth scroll, pinning, parallax and draw animations.
- In development, append `#slow-intro` to the URL to watch the preloader choreography at reduced speed.
