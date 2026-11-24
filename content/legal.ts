import type { Bi, Block, ContentPage } from "./types";

const section = (id: string, title: Bi, body: Bi): Block => ({ type: "prose", id, title, body: [body] });

/**
 * Privacy policy and terms of use, built from the supplied outline only.
 * Draft wording: both pages stay unverified (noindex) until counsel approves.
 */
export const privacy: ContentPage = {
  slug: "privacy",
  status: "unverified",
  seo: {
    title: { ar: "سياسة الخصوصية | برايم لعيادات التجميل", en: "Privacy Policy | Prime Aesthetic Clinics" },
    description: {
      ar: "كيف تجمع برايم لعيادات التجميل بيانات التواصل وتستخدمها وتحميها، وحقوقك في الوصول إليها وتصحيحها وحذفها.",
      en: "How Prime Aesthetic Clinics collects, uses and protects contact information, and your rights to access, correct and delete it.",
    },
  },
  h1: { ar: "سياسة الخصوصية", en: "Privacy Policy" },
  blocks: [
    section(
      "data-we-collect",
      { ar: "البيانات التي نجمعها", en: "Data we collect" },
      {
        ar: "نجمع بيانات التواصل التي ترسلها عبر نماذج الموقع أو واتساب، وبيانات ملفات تعريف الارتباط.",
        en: "We collect the contact details you send through website forms or WhatsApp, and cookie data.",
      },
    ),
    section(
      "purpose",
      { ar: "الغرض", en: "Purpose" },
      {
        ar: "نستخدم بياناتك لترتيب المواعيد فقط، إلا إذا وافقت على تلقي رسائل تسويقية.",
        en: "We use your data to arrange appointments only, unless you consent to marketing.",
      },
    ),
    section(
      "medical-photos-and-records",
      { ar: "الصور والسجلات الطبية", en: "Medical photos and records" },
      {
        ar: "تُجمع داخل العيادة، وتُحفظ بشكل آمن، ولا تُنشر أبدًا دون موافقة كتابية.",
        en: "They are collected in the clinic, stored securely and never published without written consent.",
      },
    ),
    section(
      "sharing",
      { ar: "مشاركة البيانات", en: "Sharing" },
      {
        ar: "لا نشارك بياناتك، إلا عند وجود التزام قانوني أو مع مقدمي خدمة ملتزمين بالسرية.",
        en: "We do not share your data, except under a legal obligation or with service providers bound by confidentiality.",
      },
    ),
    section(
      "your-rights",
      { ar: "حقوقك", en: "Your rights" },
      {
        ar: "يحق لك الوصول إلى بياناتك وتصحيحها وحذفها وسحب موافقتك.",
        en: "You can access, correct and delete your data, and withdraw your consent.",
      },
    ),
    {
      type: "list",
      id: "also-covered",
      title: { ar: "موضوعات أخرى في هذه السياسة", en: "Also covered by this policy" },
      items: [
        { ar: "مدة الاحتفاظ بالبيانات", en: "Retention" },
        { ar: "ملفات تعريف الارتباط والتحليلات", en: "Cookies and analytics" },
        { ar: "التواصل بشأن طلبات الخصوصية", en: "Contact for privacy requests" },
      ],
    },
  ],
};

export const terms: ContentPage = {
  slug: "terms",
  status: "unverified",
  seo: {
    title: { ar: "شروط الاستخدام | برايم لعيادات التجميل", en: "Terms of Use | Prime Aesthetic Clinics" },
    description: {
      ar: "شروط استخدام موقع برايم لعيادات التجميل: الطبيعة التثقيفية للمحتوى، واختلاف النتائج، والملكية الفكرية والقانون الحاكم.",
      en: "Terms of use for the Prime Aesthetic Clinics website: the educational nature of content, varying results, intellectual property and governing law.",
    },
  },
  h1: { ar: "شروط الاستخدام", en: "Terms of Use" },
  blocks: [
    section(
      "educational-content",
      { ar: "الطبيعة التثقيفية للمحتوى", en: "Educational nature of content" },
      {
        ar: "محتوى الموقع للتثقيف وليس نصيحة طبية.",
        en: "Website content is educational and is not medical advice.",
      },
    ),
    section(
      "no-doctor-patient-relationship",
      { ar: "لا علاقة علاجية عبر الموقع", en: "No doctor–patient relationship" },
      {
        ar: "استخدام الموقع لا يُنشئ علاقة بين الطبيب والمريض.",
        en: "Using the website does not form a doctor–patient relationship.",
      },
    ),
    section(
      "intellectual-property",
      { ar: "الملكية الفكرية", en: "Intellectual property" },
      {
        ar: "الشعار والنصوص والصور على الموقع مملوكة لبرايم.",
        en: "The logo, text and images on the website belong to Prime.",
      },
    ),
    section(
      "governing-law",
      { ar: "القانون الحاكم", en: "Governing law" },
      { ar: "تخضع هذه الشروط لقوانين جمهورية مصر العربية.", en: "These terms are governed by the laws of Egypt." },
    ),
    {
      type: "list",
      id: "also-covered",
      title: { ar: "موضوعات أخرى في هذه الشروط", en: "Also covered by these terms" },
      items: [
        { ar: "النتائج تختلف من شخص لآخر", en: "Results vary" },
        { ar: "دقة المحتوى وتحديثه", en: "Accuracy and updates" },
        { ar: "الروابط الخارجية", en: "External links" },
        { ar: "حدود المسؤولية", en: "Limitation of liability" },
      ],
    },
  ],
};
