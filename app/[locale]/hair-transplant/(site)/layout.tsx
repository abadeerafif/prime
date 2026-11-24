import { notFound } from "next/navigation";
import { isLocale } from "@/lib/i18n";
import { hairNavConfig } from "@/lib/nav";
import { dictFor } from "@/dictionaries";
import { Navigation } from "@/components/sections/Navigation";
import { Footer } from "@/components/sections/Footer";
import { ActionBar } from "@/components/ui/ActionBar";

export default async function HairLayout({ children, params }: LayoutProps<"/[locale]/hair-transplant">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const d = dictFor(locale);
  return (
    <>
      <Navigation config={hairNavConfig(locale)} />
      {children}
      <Footer locale={locale} variant="hair" />
      <ActionBar locale={locale} bookHref="/hair-transplant/book" bookLabel={d.hairNav.actionBar} />
    </>
  );
}
