import type { Bi, Block, Faq } from "./types";
import { home } from "./home";
import { doctors } from "./doctors";

const group = (title: Bi, items: Faq[]) => ({ title, items });

/** General FAQ page: built only from answers supplied in the source. */
export const generalFaq: Block = {
  type: "faq",
  id: "faqs",
  title: { ar: "أسئلة وإجابات", en: "Questions and answers" },
  groups: [
    group({ ar: "الحجز والاستشارة", en: "Booking and consultation" }, home.faqs.slice(0, 2)),
    group({ ar: "التكلفة", en: "Cost" }, home.faqs.slice(2, 3)),
    group({ ar: "الموقع والخصوصية", en: "Location and privacy" }, home.faqs.slice(3, 5)),
    ...doctors.map((d) => group(d.name, d.faqs)),
  ],
};
