// One-time converter: reads prime-source.json and writes the typed content
// modules under content/. Re-run with `node content/_source/convert.mjs`
// after the source changes; do not hand-edit the generated files.
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, "..");
const src = JSON.parse(readFileSync(join(here, "prime-source.json"), "utf8"));

const BRAND = { ar: "برايم لعيادات التجميل", en: "Prime Aesthetic Clinics" };
const HAIR_BRAND = { ar: "برايم لزراعة الشعر", en: "Prime Hair Transplant" };

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

const pending = [];
const translations = [];

function logConfirm(where, original) {
  pending.push({ where, text: original });
}

function translated(where, en, ar) {
  translations.push({ where, en, ar });
}

/** Strip bracketed tokens (CONFIRM, contact placeholders, button labels) and tidy punctuation. */
function clean(s, where = "") {
  if (s == null) return s;
  let out = String(s);
  if (/\[CONFIRM/i.test(out)) logConfirm(where, out);
  out = out.replace(/\[[^\]]*\]/g, "");
  out = out.replace(/†/g, "");
  out = out.replace(/\s+/g, " ");
  out = out.replace(/\s+([.,،؛:؟?!)])/g, "$1");
  out = out.replace(/\(\s*\)/g, "");
  out = out.replace(/([.؟?])\s*\.$/, "$1");
  out = out.replace(/\s*·\s*$/, "");
  out = out.replace(/:\s*$/, "");
  return out.trim();
}

const bi = (ar, en, where = "") => ({ ar: clean(ar, where), en: clean(en, where) });

/** Bodies split off a "Title: body" string start mid-sentence in English. */
const capEn = (b) => ({ ...b, en: b.en.charAt(0).toUpperCase() + b.en.slice(1) });

function stripPrefix(s, ...prefixes) {
  let out = s.trim();
  for (const p of prefixes) {
    if (out.startsWith(p)) out = out.slice(p.length).trim();
  }
  return out;
}

/** "عربي / English" → {ar, en}. Splits at the first " / " whose right side starts in Latin script. */
function biSplit(s, where = "") {
  const m = s.match(/^(.*?)\s\/\s(?=[A-Za-z"“(0-9])(.*)$/s);
  if (!m) return bi(s, s, where);
  return bi(m[1], m[2], where);
}

function splitFirst(s, sep) {
  const i = s.indexOf(sep);
  if (i < 0) return [s, ""];
  return [s.slice(0, i), s.slice(i + sep.length)];
}

function splitTitleBody(s) {
  const m = s.match(/^(.+?)([:؟?])\s+(.*)$/s);
  if (!m) return [s, ""];
  const title = m[2] === ":" ? m[1] : m[1] + m[2];
  return [title, m[3]];
}

function seoFromIntro(h1, intro, brand = BRAND) {
  const cut = (s) => {
    if (s.length <= 155) return s;
    const part = s.slice(0, 155);
    return part.slice(0, part.lastIndexOf(" ")).replace(/[,،;؛:]$/, "") + "…";
  };
  return {
    title: { ar: `${h1.ar} | ${brand.ar}`, en: `${h1.en} | ${brand.en}` },
    description: { ar: cut(intro.ar), en: cut(intro.en) },
  };
}

function slugify(s) {
  return (
    s
      .toLowerCase()
      .replace(/&/g, "and")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 40)
      .replace(/-+$/g, "") || "section"
  );
}

function uniqueIds() {
  const seen = new Set();
  return (base) => {
    let id = base;
    let n = 2;
    while (seen.has(id)) id = `${base}-${n++}`;
    seen.add(id);
    return id;
  };
}

const stripMarker = (s) => s.replace(/^\s*(?:\(?[0-9٠-٩]+[).]|[•\-])\s*/, "").trim();

function splitList(s) {
  return s
    .split(/\s·\s/)
    .map((x) => stripMarker(x))
    .filter(Boolean);
}

/** "(1) Q? — A. (2) Q? — A." → [{q, a}] */
function numberedFaq(s) {
  return s
    .split(/\(\s*[0-9٠-٩]+\s*\)\s*/)
    .map((x) => x.trim())
    .filter(Boolean)
    .map((x) => {
      const [q, a] = splitFirst(x, " — ");
      return { q: q.trim(), a: a.trim() };
    });
}

function zipFaq(arItems, enItems, where) {
  if (arItems.length !== enItems.length) {
    throw new Error(`FAQ count mismatch at ${where}: ${arItems.length} vs ${enItems.length}`);
  }
  const out = [];
  arItems.forEach((ar, i) => {
    const en = enItems[i];
    const isPlaceholder = (x) => x.a.replace(/\[[^\]]*\]/g, "").replace(/[.\s]/g, "") === "";
    if (isPlaceholder(ar) || isPlaceholder(en)) {
      logConfirm(`${where} (FAQ dropped)`, `${ar.q} — ${ar.a} / ${en.q} — ${en.a}`);
      return;
    }
    out.push({ q: bi(ar.q, en.q, where), a: bi(ar.a, en.a, where) });
  });
  return out;
}

/** Collect "AR — …" or "EN — …" sections, with unprefixed follow-on lines kept as extras. */
function sections(lines, lang) {
  const out = [];
  let cur = null;
  const own = new RegExp(`^${lang} — (.*)$`, "s");
  for (const raw of lines) {
    const line = raw.trim();
    const m = line.match(own);
    if (m) {
      cur = { text: m[1], extra: [] };
      out.push(cur);
      continue;
    }
    if (/^(AR|EN)\b/.test(line) || /^(SEO|Meta|URL|CTA|Related|Availability|Design|Closing)/.test(line)) {
      cur = null;
      continue;
    }
    if (cur && lang === "AR") cur.extra.push(line);
  }
  return out;
}

const isFaqHeading = (h) => /FAQs?|أسئلة/.test(h);

/**
 * Turn paired AR/EN sections into blocks. `pair` gives the indices of the
 * "may suit" and "may not suit" sections, which merge into one pair block.
 */
function blocksFromSections(arSecs, enSecs, where, opts = {}) {
  if (arSecs.length < enSecs.length) {
    throw new Error(`Section mismatch at ${where}: ${arSecs.length} AR vs ${enSecs.length} EN`);
  }
  const nextId = uniqueIds();
  const blocks = [];
  const parsed = enSecs.map((en, i) => {
    const ar = arSecs[i];
    const [enHead, enBody] = splitTitleBody(en.text);
    const [arHead, arBody] = splitTitleBody(ar.text);
    return { ar, en, enHead, enBody, arHead, arBody };
  });

  parsed.forEach((p, i) => {
    if (opts.pair && i === opts.pair[1]) return;
    const title = bi(p.arHead, p.enHead, where);

    if (opts.pair && i === opts.pair[0]) {
      const ns = parsed[opts.pair[1]];
      const items = (a, e) => {
        const al = splitList(a);
        const el = splitList(e);
        if (al.length !== el.length) return [bi(a, e, where)];
        return al.map((x, k) => bi(x, el[k], where));
      };
      blocks.push({
        type: "pair",
        id: nextId("suitability"),
        title: { ar: "هل يناسبك؟", en: "Is it right for you?" },
        suits: { title, items: items(p.arBody, p.enBody) },
        notSuits: { title: bi(ns.arHead, ns.enHead, where), items: items(ns.arBody, ns.enBody) },
      });
      return;
    }

    if (isFaqHeading(p.enHead)) {
      const enItems = numberedFaq(p.enBody);
      const arItems = p.arBody.trim()
        ? numberedFaq(p.arBody)
        : p.ar.extra.map((x) => {
            const [q, a] = splitFirst(stripMarker(x), " — ");
            return { q, a };
          });
      blocks.push({
        type: "faq",
        id: nextId("faqs"),
        title,
        groups: [{ items: zipFaq(arItems, enItems, where) }],
      });
      return;
    }

    const id = nextId(slugify(p.enHead));
    const enList = splitList(p.enBody);
    const arList = splitList(p.arBody);
    if (enList.length >= 3 && enList.length === arList.length && opts.prose?.includes(i) !== true) {
      blocks.push({
        type: "list",
        id,
        title,
        items: enList.map((x, k) => bi(arList[k], x, where)).filter((x) => x.en && x.ar),
      });
      return;
    }
    blocks.push({ type: "prose", id, title, body: [capEn(bi(p.arBody, p.enBody, where))] });
  });
  return blocks;
}

/** Read "Label: value" lines into a map, splitting combined "AR H1: x · EN H1: y" lines. */
function fields(lines) {
  const map = {};
  const labels = [
    "SEO title AR",
    "SEO title EN",
    "Meta AR",
    "Meta EN",
    "AR H1",
    "EN H1",
    "AR hero",
    "EN hero",
    "AR intro",
    "EN intro",
    "AR title",
    "EN title",
    "AR sub",
    "EN sub",
    "AR narrative",
    "EN narrative",
    "CTA AR",
    "CTA EN",
    "CTA",
    "Disclaimer AR",
    "Disclaimer EN",
    "Empty state (until cases exist)",
    "Categories (filter chips)",
    "Closing line AR",
  ];
  for (const raw of lines) {
    const parts = raw.split(/\s·\s(?=(?:AR|EN) (?:H1|title):)/);
    for (const part of parts) {
      for (const l of labels) {
        if (part.startsWith(l + ":") && !(l + ":" === "CTA:" && map.CTA)) {
          map[l] = part.slice(l.length + 1).trim();
          break;
        }
      }
    }
  }
  return map;
}

function tableFrom(lines, startIndex, width, rowCount) {
  const rows = [];
  for (let r = 0; r < rowCount; r++) {
    rows.push(lines.slice(startIndex + r * width, startIndex + (r + 1) * width));
  }
  return rows;
}

function write(rel, content) {
  const path = join(root, rel);
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, content, "utf8");
}

const HEADER = "// Generated by content/_source/convert.mjs from prime-source.json. Re-run the script instead of editing this file.\n";

function tsModule(imports, exportsObj) {
  let out = HEADER;
  if (imports) out += imports + "\n";
  out += "\n";
  for (const [name, [type, value]] of Object.entries(exportsObj)) {
    out += `export const ${name}${type ? `: ${type}` : ""} = ${JSON.stringify(value, null, 2)};\n\n`;
  }
  return out;
}

function assertNoTokens(value, where) {
  const s = JSON.stringify(value);
  const m = s.match(/\[(CONFIRM|PHONE|WHATSAPP|HOURS|EMAIL|SOCIAL|MAP|DATE)[^\]]*\]/);
  if (m) throw new Error(`Placeholder left in ${where}: ${m[0]}`);
}

/* ------------------------------------------------------------------ */
/* Homepage                                                            */
/* ------------------------------------------------------------------ */

const homeSrc = src.pages.main_homepage;
const hs = homeSrc.sections;
const seoRaw = homeSrc.seo_raw;
const grab = (s, re) => {
  const m = s.match(re);
  if (!m) throw new Error(`No match for ${re}`);
  return m[1].trim();
};

const voice = src.brand_voice_and_messaging;
const aboutLines = src.pages.about_and_medical_team.about_page;
const aboutField = (prefix) => {
  const line = aboutLines.find((l) => l.startsWith(prefix));
  if (!line) throw new Error(`About line ${prefix} missing`);
  return line.slice(prefix.length).trim();
};

const introAr = hs["6_3_introduction"].ar;
const introEn = hs["6_3_introduction"].en;
const hairBandAr = hs["6_5_featured_band_hair_transplant"].ar;
const hairBandEn = hs["6_5_featured_band_hair_transplant"].en;

const SPECIALTY_PATHS = [
  "/dermatology",
  "/botox",
  "/fillers",
  "/plastic-surgery",
  "/body-contouring",
  "/dentistry",
  "/oral-surgery",
  "/hair-transplant",
];

const home = {
  seo: {
    title: bi(grab(seoRaw, /SEO title AR: (.*?) SEO title EN:/), grab(seoRaw, /SEO title EN: (.*?) Meta AR:/)),
    description: bi(grab(seoRaw, /Meta AR: (.*?) Meta EN:/), grab(seoRaw, /Meta EN: (.*)$/)),
  },
  hero: {
    brand: BRAND,
    lines: {
      ar: ["تخصصات متعددة", "ومعيار طبي واحد"],
      en: ["Many specialties.", "One medical", "standard."],
    },
    intro: bi(grab(hs["6_1_hero"].ar, /AR sub: (.*?) CTAs:/), grab(hs["6_1_hero"].en, /EN sub: (.*?) CTAs:/)),
  },
  trust: hs["6_2_trust_strip"].map((x) => bi(x.ar, x.en)),
  statement: bi(voice.brand_promise.ar, voice.brand_promise.en),
  pillars: [
    {
      title: bi(grab(introAr, /AR H2: (.*?) AR:/), grab(introEn, /EN H2: (.*?) EN:/)),
      body: bi(grab(introAr, / AR: (.*)$/), grab(introEn, / EN: (.*)$/)),
    },
    {
      title: bi(voice.tagline_options[0].ar, voice.tagline_options[0].en),
      body: bi(aboutField("AR (approach):"), aboutField("EN (approach):")),
    },
  ],
  specialties: hs["6_4_specialties_grid"].map((c, i) => ({
    path: SPECIALTY_PATHS[i],
    name: biSplit(c.card),
    line: bi(c.ar_line, c.en_line),
  })),
  hairBand: {
    label: HAIR_BRAND,
    title: bi(grab(hairBandAr, /AR H2: (.*?) AR:/), grab(hairBandEn, /EN H2: (.*?) EN:/)),
    body: bi(grab(hairBandAr, / AR: (.*?) CTA:/), grab(hairBandEn, / EN: (.*?) CTA:/)),
    explore: bi(grab(hairBandAr, /CTA: \[(.*?)\]/), grab(hairBandEn, /CTA: \[(.*?)\]/)),
    candidate: bi(grab(hairBandAr, /\] \[(.*?)\]/), grab(hairBandEn, /\] \[(.*?)\]/)),
  },
  teamTitle: bi(
    grab(hs["6_6_medical_team_teaser"].heading, /AR H2: (.*?) ·/),
    grab(hs["6_6_medical_team_teaser"].heading, /EN H2: (.*?) Three/),
  ),
  steps: hs["6_7_how_a_visit_works"].map((s) => {
    const [arT, arB] = splitFirst(s.ar, ": ");
    const [enT, enB] = splitFirst(s.en, ": ");
    return { title: bi(arT, enT), body: capEn(bi(arB, enB)) };
  }),
  results: {
    title: bi(
      grab(hs["6_8_results_teaser"], /AR H2: (.*?) ·/),
      grab(hs["6_8_results_teaser"], /EN H2: (.*?) patients AR:/),
    ),
    body: bi(
      grab(hs["6_8_results_teaser"], /patients AR: (.*?) · EN:/),
      grab(hs["6_8_results_teaser"], / · EN: (.*?) \[CONFIRM/),
    ),
  },
  guideTitle: bi(
    grab(hs["6_9_patient_education_teaser"], /AR H2: (.*?) ·/),
    grab(hs["6_9_patient_education_teaser"], /EN H2: (.*?) Three/),
  ),
  faqs: hs["6_10_faq"].map((raw) => {
    const s = raw.replace(/^\d+\.\s*/, "");
    const [arPart, enPart] = splitFirst(s, " · EN: ");
    const [aq, aa] = splitFirst(stripPrefix(arPart, "AR:"), " — ");
    const [eq, ea] = splitFirst(enPart, " — ");
    return { q: bi(aq, eq), a: bi(aa, ea) };
  }),
  finalCta: bi(
    grab(hs["6_11_final_cta_band"], /^AR: (.*?) \[/),
    grab(hs["6_11_final_cta_band"], /EN: (.*?) \[/),
  ),
};

/* ------------------------------------------------------------------ */
/* About and corporate page heroes                                     */
/* ------------------------------------------------------------------ */

const aboutBody = bi(aboutField("AR:"), aboutField("EN:"));
const about = {
  seo: {
    title: bi(aboutField("SEO title AR:"), aboutField("SEO title EN:")),
    description: seoFromIntro(aboutBody, aboutBody).description,
  },
  h1: bi(aboutField("AR H1:"), aboutField("EN H1:")),
  body: aboutBody,
  approach: bi(aboutField("AR (approach):"), aboutField("EN (approach):")),
  values: splitList(aboutField("Values (AR / EN):")).map((v) => biSplit(v)),
};

const team = src.pages.about_and_medical_team.medical_team_listing_page;
const support = src.pages.supporting_and_legal_pages;
const heroPair = (arLine, enLine, arLabel, enLabel) => {
  const h1 = bi(grab(arLine, /AR H1: (.*?) — /), grab(enLine, /EN H1: (.*?) — /));
  const intro = bi(grab(arLine, new RegExp(`${arLabel}: (.*)$`)), grab(enLine, new RegExp(`${enLabel}: (.*)$`)));
  return { h1, intro, seo: seoFromIntro(h1, intro) };
};

const corporate = {
  doctors: heroPair(team[0], team[1], "AR intro", "EN intro"),
  results: heroPair(support["15_1_main_before_and_after_gallery"][0], support["15_1_main_before_and_after_gallery"][1], "AR intro", "EN intro"),
  blog: heroPair(support["15_2_patient_education_blog_hub"][0], support["15_2_patient_education_blog_hub"][1], "AR intro", "EN intro"),
  contact: heroPair(support["15_4_contact"][0], support["15_4_contact"][1], "AR intro", "EN intro"),
  book: heroPair(support["15_5_book_consultation"][0], support["15_5_book_consultation"][1], "AR sub", "EN sub"),
  faq: {
    h1: { ar: "الأسئلة الشائعة", en: "Frequently Asked Questions" },
    seo: {
      title: { ar: `الأسئلة الشائعة | ${BRAND.ar}`, en: `FAQs | ${BRAND.en}` },
      description: bi(
        "إجابات عن الحجز والاستشارة والتكلفة والخصوصية في برايم لعيادات التجميل بالمهندسين.",
        "Answers about booking, consultations, cost and privacy at Prime Aesthetic Clinics in Mohandessin.",
      ),
    },
  },
  specialties: {
    h1: { ar: "تخصصاتنا", en: "Our Specialties" },
    intro: bi(
      "في برايم، لكل تخصص طبيبه. اختر التخصص لتتعرف على الخدمات والطبيب المسؤول عنها.",
      "At Prime, every specialty has its own specialist. Choose a specialty to see its services and the doctor who leads it.",
    ),
  },
  resultsFilters: splitList(stripPrefix(support["15_1_main_before_and_after_gallery"][2], "Filters:")).map((f) =>
    biSplit(f.replace(/→.*$/, "")),
  ),
};
corporate.specialties.seo = seoFromIntro(corporate.specialties.h1, corporate.specialties.intro);
translated("/faq meta description", corporate.faq.seo.description.en, corporate.faq.seo.description.ar);
translated("/specialties intro", corporate.specialties.intro.en, corporate.specialties.intro.ar);

/* ------------------------------------------------------------------ */
/* Doctors                                                             */
/* ------------------------------------------------------------------ */

const AREAS_AR = {
  "dr-esraa-ezzat": [
    "الجلدية",
    "صحة البشرة",
    "حب الشباب وآثاره",
    "التصبغات والكلف",
    "التقشير الكيميائي",
    "معززات نضارة البشرة",
    "البوتوكس",
    "الفيلر",
    "تجديد الوجه غير الجراحي",
  ],
  "dr-mahmoud-wagih": [
    "كشف الأسنان",
    "تجميل الأسنان",
    "تبييض الأسنان",
    "الفينير",
    "تصميم الابتسامة",
    "التيجان",
    "الحشوات والترميمات",
    "زراعة الأسنان",
    "جراحة الفم",
    "خلع ضرس العقل",
    "الخلع الجراحي",
  ],
  "dr-mahmoud-abdeen": [
    "جراحة التجميل",
    "تنسيق القوام",
    "شفط الدهون",
    "شد البطن",
    "جراحات تجميل الوجه",
    "زراعة الشعر",
    "استعادة الشعر للرجال",
  ],
};
const DOCTOR_HUBS = {
  "dr-esraa-ezzat": ["dermatology", "medical-aesthetics", "botox", "fillers"],
  "dr-mahmoud-wagih": ["dentistry", "oral-surgery"],
  "dr-mahmoud-abdeen": ["plastic-surgery", "body-contouring"],
};

const teaserDoctors = hs["6_6_medical_team_teaser"].doctors.map((d) => {
  const { ar, en } = biSplit(d);
  const [arName, arTitle] = splitFirst(ar, " — ");
  const [enName, enTitle] = splitFirst(en, " — ");
  return { name: bi(arName, enName), title: bi(arTitle, enTitle) };
});

const doctors = src.pages.about_and_medical_team.doctors.map((d, i) => {
  const where = `/doctors/${d.id}`;
  const f = (prefix) => {
    const line = d.content.find((l) => l.startsWith(prefix));
    if (!line) throw new Error(`${d.id}: ${prefix} missing`);
    return line.slice(prefix.length).trim();
  };
  const areasEn = splitList(clean(f("Areas:"), where));
  const areasAr = AREAS_AR[d.id];
  if (areasEn.length !== areasAr.length) throw new Error(`${d.id}: areas count ${areasEn.length}`);
  areasEn.forEach((en, k) => translated(`${where} area`, en, areasAr[k]));
  const faqs = f("FAQs:")
    .split(/\(\s*\d\s*\)\s*/)
    .map((x) => x.trim())
    .filter(Boolean)
    .map((x) => {
      const pair = x.match(/^(.*?)\s\/\s(?=[A-Z])(.*)$/s);
      const [aq, aa] = splitFirst(pair[1], " — ");
      const [eq, ea] = splitFirst(pair[2], " — ");
      return { ar: { q: aq, a: aa }, en: { q: eq, a: ea } };
    });
  return {
    id: d.id,
    name: teaserDoctors[i].name,
    title: teaserDoctors[i].title,
    seo: { title: bi(f("SEO title AR:"), f("SEO title EN:")), description: bi(f("Meta AR:"), f("Meta EN:")) },
    headline: bi(f("Headline AR:"), f("Headline EN:")),
    bio: bi(f("Short bio AR:"), f("Short bio EN:")),
    areas: areasEn.map((en, k) => ({ ar: areasAr[k], en })),
    approach: bi(f("Approach AR:"), f("Approach EN:")),
    faqs: zipFaq(
      faqs.map((x) => x.ar),
      faqs.map((x) => x.en),
      where,
    ),
    hubs: DOCTOR_HUBS[d.id],
  };
});

/* ------------------------------------------------------------------ */
/* Benchmark pages                                                     */
/* ------------------------------------------------------------------ */

function heroSplit(s) {
  const m = s.match(/^(.+?[.!?])\s+(.*)$/s);
  return m ? [m[1], m[2]] : [s, ""];
}

function benchmark(id, where, opts) {
  const page = src.pages.service_page_template_and_benchmarks.benchmark_pages.find((p) => p.id === id);
  const lines = page.content;
  const fl = fields(lines);
  const [arLine, arIntro] = heroSplit(fl["AR hero"]);
  const [enLine, enIntro] = heroSplit(fl["EN hero"]);
  const blocks = blocksFromSections(sections(lines, "AR"), sections(lines, "EN"), where, opts);
  return {
    seo: { title: bi(fl["SEO title AR"], fl["SEO title EN"]), description: bi(fl["Meta AR"], fl["Meta EN"]) },
    h1: bi(fl["AR H1"], fl["EN H1"]),
    heroLine: bi(arLine, enLine),
    intro: bi(arIntro, enIntro),
    blocks,
  };
}

const botoxBench = benchmark("botox-overview", "/botox", { pair: [1, 2] });
{
  const whyAr = sections(
    src.pages.service_page_template_and_benchmarks.benchmark_pages[0].content,
    "AR",
  ).find((s) => s.text.startsWith("لماذا برايم"));
  const items = splitList(whyAr.text.replace(/^لماذا برايم؟\s*/, "")).filter((x) => !/^\[CONFIRM/.test(x));
  logConfirm("/botox why Prime (point dropped)", whyAr.text);
  const en = ["Assessment by the dermatology and aesthetic skin specialist", "Doses set for each area", "A follow-up visit to review the result"];
  items.forEach((ar, k) => translated("/botox why Prime", en[k], ar));
  botoxBench.blocks.push({
    type: "list",
    id: "why-prime",
    title: { ar: "لماذا برايم؟", en: "Why Prime?" },
    items: items.map((ar, k) => ({ ar: clean(ar), en: en[k] })),
  });
}
const liposuction = benchmark("liposuction", "/body-contouring/liposuction", { pair: [1, 2] });
const veneers = benchmark("dental-veneers", "/dentistry/veneers", { pair: [1, 2] });
{
  const steps = veneers.blocks.find((b) => b.id === "steps");
  steps.type = "steps";
  steps.items = steps.items.map((x) => ({ body: x }));
}

/* ------------------------------------------------------------------ */
/* Hubs                                                                */
/* ------------------------------------------------------------------ */

const HUB_META = {
  dermatology: { doctor: "dr-esraa-ezzat", column: "skin" },
  "medical-aesthetics": { doctor: "dr-esraa-ezzat", column: "skin" },
  botox: { doctor: "dr-esraa-ezzat", column: "skin" },
  fillers: { doctor: "dr-esraa-ezzat", column: "skin" },
  "plastic-surgery": { doctor: "dr-mahmoud-abdeen", column: "surgery" },
  "body-contouring": { doctor: "dr-mahmoud-abdeen", column: "surgery" },
  dentistry: { doctor: "dr-mahmoud-wagih", column: "smile" },
  "oral-surgery": { doctor: "dr-mahmoud-wagih", column: "smile" },
};

const hubNames = src.sitemap_and_navigation.main_site_specialty_hubs;
const hubCopy = src.pages.specialty_hubs_and_inventory.hub_hero_copy;
const hubs = Object.keys(HUB_META).map((id) => {
  const nameRow = hubNames.find((h) => h["URL slug"] === id);
  const copyIndex = hubNames.indexOf(nameRow);
  const copy = hubCopy[copyIndex];
  const [arH1, arIntro] = splitFirst(copy["AR H1 + intro"], " — ");
  const [enH1, enIntro] = splitFirst(copy["EN H1 + intro"], " — ");
  const h1 = bi(arH1, enH1);
  const intro = bi(arIntro, enIntro);
  const hub = {
    id,
    name: biSplit(nameRow["Hub (AR / EN)"]),
    h1,
    intro,
    ...HUB_META[id],
    seo: seoFromIntro(h1, intro),
  };
  if (id === "botox") {
    hub.h1 = botoxBench.h1;
    hub.heroLine = botoxBench.heroLine;
    hub.intro = botoxBench.intro;
    hub.seo = botoxBench.seo;
    hub.blocks = botoxBench.blocks;
    hub.related = ["/botox/forehead-lines", "/fillers/botox-vs-fillers", "/dermatology/skin-boosters"];
  }
  return hub;
});

/* ------------------------------------------------------------------ */
/* Service pages                                                       */
/* ------------------------------------------------------------------ */

const drafts = src.individual_service_page_drafts;
const servicesByHub = Object.fromEntries(Object.keys(HUB_META).map((h) => [h, []]));

function draftBlocks(lang) {
  return (key) => {
    const raw = lang[key];
    const [head, body] = splitFirst(raw, "  ");
    return { head: head.trim().replace(/\.$/, ""), body: body.trim() };
  };
}

for (const d of drafts.services) {
  const route = d.proposed_routes.find((r) => r.startsWith("/en/"));
  const [, , hub, slug] = route.split("/");
  const where = `/${hub}/${slug}`;
  const ar = draftBlocks(d.arabic);
  const en = draftBlocks(d.english);
  const h1 = bi(d.arabic.h1, d.english.h1, where);
  const intro = bi(d.arabic.intro, d.english.intro, where);
  const block = (key, id) => {
    const a = ar(key);
    const e = en(key);
    return { type: "prose", id, title: bi(a.head, e.head, where), body: [bi(a.body, e.body, where)] };
  };
  servicesByHub[hub].push({
    slug,
    hub,
    status: "unverified",
    seo: seoFromIntro(h1, intro),
    h1,
    intro,
    blocks: [block("what_assessment_covers", "assessment"), block("what_to_know", "what-to-know")],
    closing: bi(stripPrefix(d.arabic.cta, "الحجز:"), stripPrefix(d.english.cta, "CTA:"), where),
    doctor: HUB_META[hub].doctor,
  });
}

{
  const cmp = drafts.editorial_comparison_page;
  const h1 = bi(cmp.arabic.h1, cmp.english.h1);
  const body = bi(cmp.arabic.body, cmp.english.body);
  servicesByHub.fillers.push({
    slug: "botox-vs-fillers",
    hub: "fillers",
    status: "unverified",
    seo: seoFromIntro(h1, body),
    h1,
    blocks: [{ type: "prose", id: "the-difference", body: [body] }],
    doctor: "dr-esraa-ezzat",
  });
}

servicesByHub["body-contouring"].push({
  slug: "liposuction",
  hub: "body-contouring",
  status: "unverified",
  ...liposuction,
  doctor: "dr-mahmoud-abdeen",
});
servicesByHub.dentistry.splice(2, 0, {
  slug: "veneers",
  hub: "dentistry",
  status: "unverified",
  ...veneers,
  doctor: "dr-mahmoud-wagih",
});

for (const list of Object.values(servicesByHub)) {
  for (const s of list) {
    s.related = list
      .filter((o) => o.slug !== s.slug)
      .slice(0, 3)
      .map((o) => `/${o.hub}/${o.slug}`);
  }
}

/* ------------------------------------------------------------------ */
/* Hair mini-site                                                      */
/* ------------------------------------------------------------------ */

const hairSrc = src.hair_transplant_minisite;
const hh = hairSrc.H1_homepage.sections;
const hmeta = fields(hairSrc.H1_homepage.metadata);
const HAIR_CLOSING = {
  ar: "احجز استشارة لتقييم حالة شعرك ومعرفة الخيارات المناسبة لك.",
  en: "Book a consultation to understand your hair loss and the appropriate options.",
};
const H = "/hair-transplant";

const h2Pair = (arr, a = 0) => ({
  title: bi(stripPrefix(arr[a], "AR H2:"), stripPrefix(arr[a + 2], "EN H2:")),
  body: bi(stripPrefix(arr[a + 1], "AR:"), stripPrefix(arr[a + 3], "EN:"), `${H} home`),
});

const tech = hh["10_6_techniques"];
const techCard = (arLine, enLine, path) => {
  const [at, ab] = splitTitleBody(arLine);
  const [et, eb] = splitTitleBody(enLine);
  return { title: bi(at, et), body: bi(ab, eb), path };
};
const assess = hh["10_7_how_candidacy_is_assessed"];
const spec = hh["10_8_specialist_intro"];
const optHead = hh["10_5_hair_restoration_options"].heading;
const whyHead = hh["10_13_why_choose_prime"].heading;
const formLines = hh["10_14_consultation_request_form"];
const disclaimerLine = hh["10_16_location_and_contact"][2];

const CONCERN_PATHS = [
  `${H}/hairline-restoration`,
  `${H}/crown-hair-transplant`,
  `${H}/male-pattern-baldness`,
  `${H}/am-i-a-candidate`,
  `${H}/am-i-a-candidate`,
];

if (/\[CONFIRM/.test(tech[5])) logConfirm(`${H} techniques`, tech[5]);

const hairHome = {
  seo: { title: bi(hmeta["SEO title AR"], hmeta["SEO title EN"]), description: bi(hmeta["Meta AR"], hmeta["Meta EN"]) },
  hero: {
    h1: bi(stripPrefix(hh["10_1_hero"][0], "AR H1 (proposed):"), stripPrefix(hh["10_1_hero"][4], "EN H1 (proposed):")),
    sub: bi(stripPrefix(hh["10_1_hero"][1], "AR sub:"), stripPrefix(hh["10_1_hero"][5], "EN sub:")),
    brandLine: bi(stripPrefix(hh["10_1_hero"][3], "Brand line under logo:"), stripPrefix(hh["10_1_hero"][7], "Brand line:")),
    book: bi(grab(hh["10_1_hero"][2], /\[(.*?)\]/), grab(hh["10_1_hero"][6], /\[(.*?)\]/)),
    candidate: { ar: "هل أنا مرشح للزراعة؟", en: "Am I a candidate?" },
  },
  intro: h2Pair(hh["10_2_introduction"]),
  concerns: hh["10_3_common_male_hair_loss_concerns"].map((c, i) => {
    const [at, ab] = splitFirst(c.ar, " — ");
    const [et, eb] = splitFirst(c.en, " — ");
    return { title: bi(at, et), body: capEn(bi(ab, eb)), path: CONCERN_PATHS[i] };
  }),
  whenToConsider: h2Pair(hh["10_4_when_to_consider"]),
  options: {
    title: bi(grab(optHead, /AR H2: (.*?) ·/), grab(optHead, /EN H2: (.*)$/)),
    items: hh["10_5_hair_restoration_options"].options.map((o) => {
      const [at, ab] = splitFirst(o.ar, ": ");
      const [et, eb] = splitFirst(o.en, ": ");
      return { title: bi(at, et), body: capEn(bi(ab, eb, `${H} options`)) };
    }),
  },
  techniques: {
    title: bi(stripPrefix(tech[0], "AR H2:"), stripPrefix(tech[6], "EN H2:")),
    intro: bi(stripPrefix(tech[1], "AR:"), stripPrefix(tech[7], "EN:")),
    cards: [
      techCard(tech[2], tech[8], `${H}/fue`),
      techCard(tech[3], tech[9], `${H}/dhi`),
      techCard(tech[4], tech[10], `${H}/fue-vs-dhi`),
    ],
  },
  assessment: {
    title: bi(stripPrefix(assess[0], "AR H2:"), stripPrefix(assess[6], "EN H2:")),
    items: assess.slice(1, 6).map((ar, k) => {
      const [at, ab] = splitFirst(ar, " — ");
      const [et, eb] = splitFirst(assess[7 + k], " — ");
      return { title: bi(at, et), body: capEn(bi(ab, eb)) };
    }),
  },
  specialist: {
    title: bi(stripPrefix(spec[0], "AR H2:"), stripPrefix(spec[3], "EN H2:")),
    body: bi(stripPrefix(spec[1], "AR:"), stripPrefix(spec[4], "EN:"), `${H} specialist intro`),
  },
  journey: {
    title: { ar: "رحلتك خطوة بخطوة", en: "Your journey, step by step" },
    steps: hh["10_9_patient_journey_timeline"].steps.map((s) => bi(s.ar, s.en)),
    link: { ar: "خطوات زراعة الشعر بالتفصيل", en: "Full step-by-step guide" },
  },
  expectations: h2Pair(hh["10_11_recovery_and_expectations"]),
  faqPreview: hh["10_12_faq_preview"].map((raw) => {
    const s = raw.replace(/^(\d+\.|•)\s*/, "");
    const pair = s.match(/^(.*?)\s\/\s(?=[A-Z])(.*)$/s);
    const [aq, aa] = splitFirst(pair[1], " — ");
    const [eq, ea] = splitFirst(pair[2], " — ");
    return { q: bi(aq, eq), a: bi(aa, ea) };
  }),
  whyPrime: {
    title: bi(grab(whyHead, /AR H2: (.*?) ·/), grab(whyHead, /EN H2: (.*)$/)),
    points: hh["10_13_why_choose_prime"].points.map((p) => bi(p.ar, p.en)),
  },
  form: {
    title: bi(stripPrefix(formLines[0], "AR H2:"), stripPrefix(formLines[3], "EN H2:")),
    text: bi(stripPrefix(formLines[1], "AR text:"), stripPrefix(formLines[4], "EN text:")),
  },
  related: [`${H}/fue-vs-dhi`, `${H}/growth-timeline`, `${H}/am-i-a-candidate`],
  disclaimer: biSplit(stripPrefix(disclaimerLine, "Disclaimer line:")),
};
translated(`${H} journey title`, hairHome.journey.title.en, hairHome.journey.title.ar);

/* Hair subpages */

const sub = hairSrc.subpages;
const HAIR_SLUGS = {
  H2: "what-is-hair-transplant",
  H3: "male-pattern-baldness",
  H4: "hairline-restoration",
  H5: "crown-hair-transplant",
  H6: "fue",
  H7: "dhi",
  H8: "fue-vs-dhi",
  H9: "procedure-steps",
  H10: "recovery",
  H11: "growth-timeline",
  H12: "results",
  H13: "specialist",
  H14: "am-i-a-candidate",
  H15: "cost",
  H16: "faq",
};
const HAIR_STATUS = { H6: "unverified", H7: "unverified", H12: "hidden" };
const p = (k) => `${H}/${HAIR_SLUGS[k]}`;
const HAIR_RELATED = {
  H2: ["H3", "H14", "H11"],
  H3: ["H14", "H2", "H4"],
  H4: ["H5", "H11", "H14"],
  H5: ["H4", "H11", "H14"],
  H6: ["H7", "H8", "H9"],
  H7: ["H6", "H8", "H4"],
  H8: ["H6", "H7", "H14"],
  H9: ["H10", "H11", "H14"],
  H10: ["H11", "H9", "H16"],
  H11: ["H10", "H16", "H14"],
  H12: ["H14", "H11", "H13"],
  H14: ["H3", "H2", "H15"],
  H15: ["H14", "H16", "H13"],
  H16: ["H14", "H15", "H11"],
};

function hairBase(key, extra) {
  const lines = sub[key].content;
  const fl = fields(lines);
  const page = {
    slug: HAIR_SLUGS[key],
    status: HAIR_STATUS[key] ?? "confirmed",
    seo: { title: bi(fl["SEO title AR"], fl["SEO title EN"]), description: bi(fl["Meta AR"], fl["Meta EN"]) },
    h1: bi(fl["AR H1"], fl["EN H1"]),
    blocks: [],
    closing: HAIR_CLOSING,
    related: (HAIR_RELATED[key] ?? []).map(p),
    doctor: "dr-mahmoud-abdeen",
  };
  if (fl["AR intro"] && fl["EN intro"]) page.intro = bi(fl["AR intro"], fl["EN intro"], p(key));
  return Object.assign(page, extra ? extra(lines, fl, page) : {});
}

const proseSections = (key, opts) =>
  blocksFromSections(sections(sub[key].content, "AR"), sections(sub[key].content, "EN"), p(key), opts);

const hairPages = [];
for (const k of ["H2", "H3", "H4", "H5", "H6", "H7"]) {
  const page = hairBase(k);
  page.blocks = proseSections(k);
  hairPages.push(page);
}

// H8: comparison table
hairPages.push(
  hairBase("H8", (lines) => {
    const start = lines.findIndex((l) => l.startsWith("المعيار"));
    const groups = tableFrom(lines, start, 3, 8);
    const columns = groups[0].map((c) => biSplit(c));
    const rows = groups.slice(1).map((g) => g.map((c) => biSplit(c)));
    const cta = lines.find((l) => l.startsWith("CTA:"));
    const blocks = [{ type: "table", id: "comparison", title: { ar: "مقارنة سريعة", en: "At a glance" }, columns, rows }];
    blocks.push(...proseSections("H8"));
    return { blocks, closing: biSplit(stripPrefix(cta, "CTA:")) };
  }),
);

// H9: ten steps
hairPages.push(
  hairBase("H9", (lines) => {
    const start = lines.findIndex((l) => l === "1");
    const items = tableFrom(lines, start, 3, 10).map(([, ar, en]) => {
      const [at, ab] = splitFirst(ar, ": ");
      const [et, eb] = splitFirst(en, ": ");
      return { title: bi(at, et), body: capEn(bi(ab, eb, p("H9"))) };
    });
    return { blocks: [{ type: "steps", id: "steps", title: { ar: "المراحل", en: "The stages" }, items }] };
  }),
);

// H10: recovery table and warning callout
hairPages.push(
  hairBase("H10", (lines) => {
    const start = lines.findIndex((l) => l.startsWith("الأيام"));
    const rows = tableFrom(lines, start, 3, 6).map(([period, ar, en]) => [biSplit(period), bi(ar, en, p("H10"))]);
    const arC = lines.find((l) => l.startsWith("AR — تواصل"));
    const enC = lines.find((l) => l.startsWith("EN — Contact"));
    const [at, ab] = splitTitleBody(stripPrefix(arC, "AR —"));
    const [et, eb] = splitTitleBody(stripPrefix(enC, "EN —"));
    const arItems = splitList(ab);
    const enItems = splitList(eb);
    return {
      blocks: [
        {
          type: "table",
          id: "milestones",
          title: { ar: "المراحل الأولى", en: "Early milestones" },
          columns: [
            { ar: "الفترة", en: "Period" },
            { ar: "ما المتوقع", en: "What to expect" },
          ],
          rows,
        },
        { type: "callout", id: "contact-the-clinic", title: bi(at, et), items: enItems.map((e, k) => bi(arItems[k], e)) },
      ],
    };
  }),
);

// H11: growth timeline
const H11_NOTES_AR = [
  "اسأل الطبيب إذا انتشر الاحمرار أو زاد الألم.",
  "طبيعي ومتوقع.",
  "اسأل الطبيب إذا كانت الحبوب مؤلمة أو كثيرة.",
  "طبيعي.",
  "طبيعي.",
  "يُنصح بزيارة مراجعة.",
  "التقييم النهائي؛ ناقش الخطوات التالية عند الحاجة.",
];
hairPages.push(
  hairBase("H11", (lines) => {
    const start = lines.findIndex((l) => l.startsWith("٠–٢"));
    const items = tableFrom(lines, start, 4, 7).map(([period, ar, en, note], k) => {
      translated(`${p("H11")} note`, note, H11_NOTES_AR[k]);
      return { period: biSplit(period), body: bi(ar, en), note: { ar: H11_NOTES_AR[k], en: note } };
    });
    const closingLine = lines.find((l) => l.startsWith("Closing line AR:"));
    const [ar, en] = splitFirst(stripPrefix(closingLine, "Closing line AR:"), " · EN: ");
    return {
      blocks: [{ type: "timeline", id: "timeline", title: { ar: "شهرًا بشهر", en: "Month by month" }, items }],
      closing: bi(ar, en),
    };
  }),
);

// H12: results (hidden until consented images exist)
hairPages.push(
  hairBase("H12", (lines, fl) => {
    const chips = splitList(clean(fl["Categories (filter chips)"]))
      .map((c) => biSplit(c.replace(/\((when available|if offered)\)/, "")))
      .filter((c) => c.en);
    const empty = fl["Empty state (until cases exist)"];
    return {
      blocks: [
        { type: "list", id: "categories", title: { ar: "التصنيفات", en: "Categories" }, items: chips },
        {
          type: "prose",
          id: "coming-soon",
          body: [bi(grab(empty, /AR: (.*?) EN:/), grab(empty, /EN: (.*)$/))],
        },
        { type: "prose", id: "disclaimer", body: [bi(fl["Disclaimer AR"], fl["Disclaimer EN"])] },
      ],
    };
  }),
);

// H13: specialist
hairPages.push(
  hairBase("H13", (lines, fl) => ({
    heroLine: bi(fl["AR title"], fl["EN title"]),
    blocks: [{ type: "prose", id: "approach", body: [bi(fl["AR narrative"], fl["EN narrative"])] }],
    related: [p("H4"), p("H5"), p("H6"), p("H7"), "/plastic-surgery", "/body-contouring"],
    closing: { ar: "احجز استشارة مع د. محمود عابدين", en: "Book a consultation with Dr. Mahmoud Abdeen" },
  })),
);

// H14: candidacy factors and quiz
hairPages.push(
  hairBase("H14", (lines) => {
    const start = lines.findIndex((l) => l.startsWith("العمر واستقرار"));
    const rows = tableFrom(lines, start, 3, 6).map(([factor, ar, en]) => [biSplit(factor), bi(ar, en)]);
    return {
      blocks: [
        {
          type: "table",
          id: "factors",
          title: { ar: "العوامل التي تحدد القرار", en: "What decides suitability" },
          columns: [
            { ar: "العامل", en: "Factor" },
            { ar: "ما يعنيه", en: "What it means" },
          ],
          rows,
        },
        { type: "quiz", id: "questionnaire", title: { ar: "استبيان مبدئي", en: "Preliminary questionnaire" } },
      ],
    };
  }),
);

// H15: cost
hairPages.push(
  hairBase("H15", (lines, fl) => {
    const start = lines.findIndex((l) => l.startsWith("تعقيد الحالة"));
    const rows = tableFrom(lines, start, 3, 6).map(([factor, ar, en]) => [biSplit(factor), bi(ar, en)]);
    return {
      blocks: [
        {
          type: "table",
          id: "cost-factors",
          title: { ar: "ما الذي يحدد التكلفة؟", en: "What shapes the cost" },
          columns: [
            { ar: "العامل", en: "Factor" },
            { ar: "التفاصيل", en: "Detail" },
          ],
          rows,
        },
        ...proseSections("H15"),
      ],
      closing: bi(fl["CTA AR"], fl["CTA EN"]),
    };
  }),
);

// H16: 22 FAQs in four groups
hairPages.push(
  hairBase("H16", (lines) => {
    const ai = lines.indexOf("Arabic");
    const ei = lines.indexOf("English");
    const parse = (l) => {
      const [q, a] = splitFirst(l, " — ");
      return { q, a };
    };
    const ar = lines.slice(ai + 1, ei).map(parse);
    const en = lines.slice(ei + 1).map(parse);
    if (ar.length !== 22 || en.length !== 22) throw new Error(`H16 count ${ar.length}/${en.length}`);
    const range = (a, b) => zipFaq(ar.slice(a, b), en.slice(a, b), p("H16"));
    const title = src.sitemap_and_navigation.hair_transplant_minisite_pages.find((r) => r.Page === "H16 FAQs");
    return {
      h1: { ar: title["AR title"], en: "Hair Transplant FAQs" },
      blocks: [
        {
          type: "faq",
          id: "faqs",
          title: { ar: "الأسئلة والإجابات", en: "Questions and answers" },
          groups: [
            { title: { ar: "الملاءمة", en: "Suitability" }, items: range(0, 6) },
            { title: { ar: "الإجراء", en: "The procedure" }, items: range(6, 12) },
            { title: { ar: "التعافي والنمو", en: "Recovery & growth" }, items: range(12, 18) },
            { title: { ar: "النتائج والتكلفة", en: "Results & cost" }, items: range(18, 22) },
          ],
        },
      ],
    };
  }),
);

/* H17 booking page */

const bookLines = sub.H17.content;
const bfl = fields(bookLines);
const bIdx = (s) => bookLines.findIndex((l) => l.startsWith(s));
const benefits = bookLines.slice(bIdx("Consultation benefits") + 1, bIdx("How it works")).map((b) => biSplit(b));
const howItWorks = bookLines.slice(bIdx("How it works") + 1, bIdx("Form:")).map((l) => {
  const [a, e] = splitFirst(l, " / EN: ");
  return bi(stripPrefix(a, "AR:"), e);
});
const waLine = bookLines[bIdx("WhatsApp CTA")];
const thanksLine = bookLines[bIdx("Thank-you page")];
const hairBook = {
  seo: { title: bi(bfl["SEO title AR"], bfl["SEO title EN"]), description: bi(bfl["Meta AR"], bfl["Meta EN"]) },
  h1: bi(bfl["AR H1"], bfl["EN H1"]),
  sub: bi(bfl["AR sub"], bfl["EN sub"]),
  benefitsTitle: { ar: "ماذا تتضمن الاستشارة", en: "What the consultation includes" },
  benefits,
  howTitle: { ar: "كيف تتم", en: "How it works" },
  howItWorks,
  privacyNote: bi(
    stripPrefix(bookLines[bIdx("Privacy reassurance AR")], "Privacy reassurance AR:"),
    stripPrefix(bookLines[bIdx("Privacy reassurance EN")], "Privacy reassurance EN:"),
  ),
  whatsappPrefill: bi(grab(waLine, /«(.*?)»/), grab(waLine, /prefilled: "(.*?)"/)),
  thanks: bi(grab(thanksLine, /AR: (.*?) \/ EN:/), grab(thanksLine, /EN: (.*?) \+/)),
};
translated(`${H}/book section titles`, "What the consultation includes / How it works", "ماذا تتضمن الاستشارة / كيف تتم");

/* H14 questionnaire */

const qLines = sub.H14.content;
const qStart = qLines.findIndex((l) => l.startsWith("كم عمرك"));
const OPTION_EN = [
  ["Under 25", "25–35", "35–45", "Over 45"],
  ["Less than a year", "1–3 years", "Longer"],
  ["The front", "The crown", "Both", "General thinning"],
  ["Yes", "No", "Not sure"],
  ["Yes", "No"],
  ["Yes", "No"],
];
const quiz = {
  questions: qLines.slice(qStart, qStart + 6).map((l, i) => {
    const m = l.match(/^(.*?)\s\/\s(.*?)\s\((.*)\)$/);
    const optsAr = m[3].split(/\s\/\s/);
    optsAr.forEach((o, k) => translated(`${p("H14")} quiz option`, OPTION_EN[i][k], o));
    return {
      q: bi(m[1], m[2]),
      options: optsAr.map((o, k) => ({ ar: o.trim(), en: OPTION_EN[i][k] })),
    };
  }),
  result: bi(
    grab(qLines[qStart + 7], /^AR: (.*?) \[dynamic/),
    grab(qLines[qStart + 8], /^EN: (.*?) \[dynamic/),
  ),
  dynamicRecent: {
    ar: grab(qLines[qStart + 7], /\[dynamic: "(.*?)" \//),
    en: "As your hair loss is recent or fast, the doctor may start with diagnosis and treatment before discussing a transplant.",
  },
  dynamicPrevious: {
    ar: grab(qLines[qStart + 7], /\/ "(.*?)"\]/),
    en: "As you've had a previous transplant, bring any information about it to your consultation.",
  },
  privacy: { ar: "لا تُحفظ إجاباتك ولا تُرسل إلى أي جهة.", en: "Your answers are not stored or sent anywhere." },
};
translated(`${p("H14")} quiz`, quiz.dynamicRecent.en, quiz.dynamicRecent.ar);
translated(`${p("H14")} quiz`, quiz.dynamicPrevious.en, quiz.dynamicPrevious.ar);
translated(`${p("H14")} quiz`, quiz.privacy.en, quiz.privacy.ar);

/* ------------------------------------------------------------------ */
/* Articles                                                            */
/* ------------------------------------------------------------------ */

const ARTICLE_SLUGS = [
  "why-men-lose-hair",
  "how-many-grafts",
  "fue-and-dhi-labels",
  "hair-growth-after-transplant",
  "is-a-transplant-suitable",
];
const articles = src.priority_education_article_drafts.articles.map((a, i) => {
  const h1 = bi(a.arabic.title, a.english.title);
  const body = a.arabic.paragraphs.map((ar, k) => bi(ar, a.english.paragraphs[k]));
  return {
    slug: ARTICLE_SLUGS[i],
    status: "unverified",
    seo: seoFromIntro(h1, bi(a.arabic.paragraphs[0], a.english.paragraphs[0]), HAIR_BRAND),
    h1,
    blocks: [{ type: "prose", id: "article", body }],
    closing: bi(
      stripPrefix(splitFirst(a.arabic.cta_and_links, " | ")[0], "دعوة للإجراء:"),
      stripPrefix(splitFirst(a.english.cta_and_links, " | ")[0], "CTA:"),
    ),
    related: [`${H}/male-pattern-baldness`, `${H}/am-i-a-candidate`, `${H}/book`],
    doctor: "dr-mahmoud-abdeen",
  };
});

/* ------------------------------------------------------------------ */
/* Write files                                                         */
/* ------------------------------------------------------------------ */

const all = { home, about, corporate, doctors, hubs, servicesByHub, hairHome, hairPages, hairBook, quiz, articles };
for (const [k, v] of Object.entries(all)) assertNoTokens(v, k);

write("home.ts", tsModule(null, { home: [null, home] }));
write("about.ts", tsModule(null, { about: [null, about], corporate: [null, corporate] }));
write("doctors.ts", tsModule('import type { Doctor } from "./types";', { doctors: ["Doctor[]", doctors] }));
write("hubs.ts", tsModule('import type { Hub } from "./types";', { hubs: ["Hub[]", hubs] }));

const camel = (s) => s.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
for (const [hub, list] of Object.entries(servicesByHub)) {
  write(
    `services/${hub}.ts`,
    tsModule('import type { ServicePage } from "../types";', { [`${camel(hub)}Services`]: ["ServicePage[]", list] }),
  );
}
write(
  "services/index.ts",
  HEADER +
    Object.keys(servicesByHub)
      .map((h) => `import { ${camel(h)}Services } from "./${h}";`)
      .join("\n") +
    '\nimport type { ServicePage } from "../types";\n\nexport const services: ServicePage[] = [\n' +
    Object.keys(servicesByHub)
      .map((h) => `  ...${camel(h)}Services,`)
      .join("\n") +
    "\n];\n",
);
write("hair/home.ts", tsModule(null, { hairHome: [null, hairHome] }));
write("hair/pages.ts", tsModule('import type { ContentPage } from "../types";', { hairPages: ["ContentPage[]", hairPages] }));
write("hair/book.ts", tsModule(null, { hairBook: [null, hairBook] }));
write("hair/quiz.ts", tsModule(null, { quiz: [null, quiz] }));
write("articles.ts", tsModule('import type { ContentPage } from "./types";', { articles: ["ContentPage[]", articles] }));

const md = [
  "# Content pending confirmation",
  "",
  "Generated by `content/_source/convert.mjs`. Every item below was removed from the live copy or added by translation, and needs the clinic's confirmation before launch.",
  "",
  "## Contact details (set as environment variables, see `.env.example`)",
  "",
  "- [ ] Phone, WhatsApp number, email, opening hours, Google Maps embed, social profile URLs",
  "- [ ] Before/after images with signed consent (results pages stay hidden until then)",
  "- [ ] Legal entity name and final privacy policy and terms of use text (pages show a draft notice)",
  "",
  "## Removed `[CONFIRM]` items",
  "",
  ...pending.map((x) => `- [ ] **${x.where}**: ${x.text.replace(/\n/g, " ")}`),
  "",
  "## Translations added (no source text in that language)",
  "",
  ...translations.map((x) => `- [ ] **${x.where}**: "${x.en}" → "${x.ar}"`),
  "",
];
write("PENDING.md", md.join("\n"));

console.log(
  `Wrote content: ${hubs.length} hubs, ${Object.values(servicesByHub).flat().length} services, ${hairPages.length} hair pages, ${articles.length} articles; ${pending.length} pending, ${translations.length} translations.`,
);
