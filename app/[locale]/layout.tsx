import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { dirFor, isLocale, locales } from "@/lib/i18n";
import { fontVariables } from "@/lib/fonts";
import { site } from "@/lib/site";
import { getDictionary } from "@/dictionaries";
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
      images: [{ url: "/brand/logo-landscape-charcoal.png", width: 1024, height: 300 }],
    },
    icons: { icon: "/brand/logo-icon.png" },
  };
}

export default async function RootLayout({ children, params }: LayoutProps<"/[locale]">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const dict = await getDictionary(locale);
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
        {adobeKit ? (
          <link rel="stylesheet" href={`https://use.typekit.net/${adobeKit}.css`} />
        ) : null}
        {adobeKit ? (
          <style>{`:root{--font-aquavit:"aquavit";}`}</style>
        ) : null}
      </head>
      <body className="min-h-full">
        <Providers locale={locale} dict={dict}>
          {children}
        </Providers>
      </body>
    </html>
  );
}
