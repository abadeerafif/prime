import type { Locale } from "@/lib/i18n";

export type Bi = { ar: string; en: string };
export const t = (v: Bi, locale: Locale) => v[locale];

export type Status = "confirmed" | "unverified" | "hidden";
export type DoctorId = "dr-esraa-ezzat" | "dr-mahmoud-wagih" | "dr-mahmoud-abdeen";
export type HubId =
  | "dermatology"
  | "medical-aesthetics"
  | "botox"
  | "fillers"
  | "plastic-surgery"
  | "body-contouring"
  | "dentistry"
  | "oral-surgery";

export type Faq = { q: Bi; a: Bi };

export type Block =
  | { type: "prose"; id: string; title?: Bi; body: Bi[] }
  | { type: "list"; id: string; title: Bi; intro?: Bi; items: Bi[] }
  | {
      type: "pair";
      id: string;
      title: Bi;
      suits: { title: Bi; items: Bi[] };
      notSuits: { title: Bi; items: Bi[] };
    }
  | { type: "steps"; id: string; title: Bi; items: { title?: Bi; body: Bi }[] }
  | { type: "table"; id: string; title?: Bi; columns: Bi[]; rows: Bi[][] }
  | { type: "timeline"; id: string; title?: Bi; items: { period: Bi; body: Bi; note: Bi }[] }
  | { type: "callout"; id: string; title: Bi; items: Bi[] }
  | { type: "faq"; id: string; title: Bi; groups: { title?: Bi; items: Faq[] }[] }
  | { type: "quiz"; id: string; title: Bi };

export type ContentPage = {
  slug: string;
  status: Status;
  seo: { title: Bi; description: Bi };
  h1: Bi;
  heroLine?: Bi;
  intro?: Bi;
  blocks: Block[];
  /** Sentence shown in the closing call-to-action band. */
  closing?: Bi;
  /** Registry paths, e.g. "/botox/forehead-lines". */
  related?: string[];
  doctor?: DoctorId;
};

export type ServicePage = ContentPage & { hub: HubId };

export type Seo = { title: Bi; description: Bi };

export type Doctor = {
  id: DoctorId;
  name: Bi;
  title: Bi;
  seo: Seo;
  headline: Bi;
  bio: Bi;
  areas: Bi[];
  approach: Bi;
  faqs: Faq[];
  hubs: HubId[];
};

export type Hub = {
  id: HubId;
  name: Bi;
  h1: Bi;
  intro: Bi;
  heroLine?: Bi;
  doctor: DoctorId;
  column: "skin" | "surgery" | "smile";
  seo: Seo;
  blocks?: Block[];
  related?: string[];
};

/** Hero copy for a simple corporate page. */
export type PageIntro = { seo: Seo; h1: Bi; intro?: Bi };
