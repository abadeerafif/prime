import { notFound } from "next/navigation";
import { isLocale } from "@/lib/i18n";
import { mainNavConfig } from "@/lib/nav";
import { dictFor } from "@/dictionaries";
import { Navigation } from "@/components/sections/Navigation";
import { Footer } from "@/components/sections/Footer";
import { ActionBar } from "@/components/ui/ActionBar";

export default async function MainLayout({ children, params }: LayoutProps<"/[locale]">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const d = dictFor(locale);
  return (
    <>
      <Navigation config={mainNavConfig(locale)} />
      {children}
      <Footer locale={locale} />
      <ActionBar locale={locale} bookHref="/book" bookLabel={d.nav.cta} />
    </>
  );
}
