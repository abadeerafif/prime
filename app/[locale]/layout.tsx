import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { dirFor, isLocale, locales } from "@/lib/i18n";
import { fontVariables } from "@/lib/fonts";
import { site } from "@/lib/site";
import { clientDictFor, dictFor, getDictionary } from "@/dictionaries";
import { Providers } from "@/components/Providers";
import "../globals.css";

export async function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: LayoutProps<"/[locale]">): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const dict = await getDictionary(locale);
  return {
    title: dict.meta.title,
    description: dict.meta.description,
    metadataBase: new URL(site.url),
    openGraph: {
      siteName: site.name[locale],
      images: [{ url: "/images/01-home-hero-1500x2000.webp", width: 1500, height: 2000 }],
    },
    icons: { icon: "/brand/logo-icon-168.png" },
  };
}

export default async function RootLayout({ children, params }: LayoutProps<"/[locale]">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const dict = clientDictFor(locale);
  const adobeKit = process.env.NEXT_PUBLIC_ADOBE_KIT_ID;

  return (
    <html
      lang={locale}
      dir={dirFor(locale)}
      data-theme="ivory"
      className={`${fontVariables} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <noscript
          dangerouslySetInnerHTML={{
            __html: "<style>[data-preloader]{display:none!important}[data-reveal]{opacity:1!important;translate:none!important}.invisible{visibility:visible!important}</style>",
          }}
        />
        {adobeKit ? (
          <link rel="stylesheet" href={`https://use.typekit.net/${adobeKit}.css`} />
        ) : null}
        {adobeKit ? (
          <style>{`:root{--font-aquavit:"aquavit";}`}</style>
        ) : null}
      </head>
      <body className="min-h-full">
        <a href="#main" className="skip-link">
          {dictFor(locale).common.skipToContent}
        </a>
        <Providers locale={locale} dict={dict}>
          {children}
        </Providers>
      </body>
    </html>
  );
}
