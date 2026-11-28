/**
 * Builds the Arabic web fonts in public/fonts from the brand originals in
 * "Fonts PRIME/". Node built-ins only. Run with `npm run fonts`.
 *
 * Al Tarikh ships as an Apple AAT font: it joins letters only through its
 * `morx` table and has no OpenType GSUB. Chrome, Edge and Firefox ignore
 * `morx`, so every letter rendered in its isolated form, with gaps between
 * letters. The font does carry every joined form, mapped to the Arabic
 * Presentation Forms-B codepoints, so this script generates a standard GSUB
 * (init / medi / fina, plus the lam-alef rlig) and a GDEF from that cmap,
 * drops the AAT-only tables, and writes a WOFF.
 *
 * Palestine already has proper OpenType tables; it is only wrapped as WOFF.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { deflateSync } from "node:zlib";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SRC = path.join(root, "Fonts PRIME");
const OUT = path.join(root, "public", "fonts");

/* ------------------------------------------------------------------ */
/* sfnt reading and writing                                             */
/* ------------------------------------------------------------------ */

/** Reads the tables of one face; `faceIndex` selects a face in a .ttc. */
function readFace(buf, faceIndex = 0) {
  let off = 0;
  if (buf.toString("ascii", 0, 4) === "ttcf") off = buf.readUInt32BE(12 + faceIndex * 4);
  const flavor = buf.readUInt32BE(off);
  const numTables = buf.readUInt16BE(off + 4);
  const tables = new Map();
  for (let i = 0; i < numTables; i++) {
    const r = off + 12 + i * 16;
    const tag = buf.toString("ascii", r, r + 4);
    const o = buf.readUInt32BE(r + 8);
    const len = buf.readUInt32BE(r + 12);
    tables.set(tag, Buffer.from(buf.subarray(o, o + len)));
  }
  return { flavor, tables };
}

const pad4 = (n) => (n + 3) & ~3;

function checksum(buf) {
  const padded = Buffer.alloc(pad4(buf.length));
  buf.copy(padded);
  let sum = 0;
  for (let i = 0; i < padded.length; i += 4) sum = (sum + padded.readUInt32BE(i)) >>> 0;
  return sum;
}

/** Assembles a valid sfnt (checksums, checkSumAdjustment) from a table map. */
function buildSfnt(flavor, tables) {
  const tags = [...tables.keys()].sort();
  const n = tags.length;
  const head = Buffer.from(tables.get("head"));
  head.writeUInt32BE(0, 8);
  tables.set("head", head);

  const es = Math.floor(Math.log2(n));
  const searchRange = 16 * 2 ** es;
  const dirLen = 12 + 16 * n;
  let size = dirLen;
  for (const t of tags) size += pad4(tables.get(t).length);

  const out = Buffer.alloc(size);
  out.writeUInt32BE(flavor, 0);
  out.writeUInt16BE(n, 4);
  out.writeUInt16BE(searchRange, 6);
  out.writeUInt16BE(es, 8);
  out.writeUInt16BE(n * 16 - searchRange, 10);
  let offset = dirLen;
  tags.forEach((tag, i) => {
    const data = tables.get(tag);
    const r = 12 + i * 16;
    out.write(tag, r, "ascii");
    out.writeUInt32BE(checksum(data), r + 4);
    out.writeUInt32BE(offset, r + 8);
    out.writeUInt32BE(data.length, r + 12);
    data.copy(out, offset);
    offset += pad4(data.length);
  });
  const headOffset = out.readUInt32BE(12 + tags.indexOf("head") * 16 + 8);
  out.writeUInt32BE((0xb1b0afba - checksum(out)) >>> 0, headOffset + 8);
  return out;
}

/** Wraps an sfnt as WOFF 1.0, zlib-compressing each table. */
function sfntToWoff(sfnt) {
  const flavor = sfnt.readUInt32BE(0);
  const n = sfnt.readUInt16BE(4);
  const entries = [];
  for (let i = 0; i < n; i++) {
    const r = 12 + i * 16;
    const o = sfnt.readUInt32BE(r + 8);
    const len = sfnt.readUInt32BE(r + 12);
    const data = sfnt.subarray(o, o + len);
    const z = deflateSync(data, { level: 9 });
    entries.push({
      tag: sfnt.toString("ascii", r, r + 4),
      sum: sfnt.readUInt32BE(r + 4),
      orig: data,
      stored: z.length < data.length ? z : data,
    });
  }
  entries.sort((a, b) => (a.tag < b.tag ? -1 : 1));
  let size = 44 + 20 * n;
  let sfntSize = 12 + 16 * n;
  for (const e of entries) {
    size += pad4(e.stored.length);
    sfntSize += pad4(e.orig.length);
  }
  const out = Buffer.alloc(size);
  out.write("wOFF", 0, "ascii");
  out.writeUInt32BE(flavor, 4);
  out.writeUInt32BE(size, 8);
  out.writeUInt16BE(n, 12);
  out.writeUInt32BE(sfntSize, 16);
  out.writeUInt16BE(1, 20);
  let offset = 44 + 20 * n;
  entries.forEach((e, i) => {
    const r = 44 + i * 20;
    out.write(e.tag, r, "ascii");
    out.writeUInt32BE(offset, r + 4);
    out.writeUInt32BE(e.stored.length, r + 8);
    out.writeUInt32BE(e.orig.length, r + 12);
    out.writeUInt32BE(e.sum, r + 16);
    e.stored.copy(out, offset);
    offset += pad4(e.stored.length);
  });
  return out;
}

/** Unicode to glyph id, from the Windows Unicode BMP (3,1) format 4 subtable. */
function readCmap(cmap) {
  const count = cmap.readUInt16BE(2);
  let sub = -1;
  for (let i = 0; i < count; i++) {
    const r = 4 + i * 8;
    const o = cmap.readUInt32BE(r + 4);
    if (cmap.readUInt16BE(r) === 3 && cmap.readUInt16BE(r + 2) === 1 && cmap.readUInt16BE(o) === 4) sub = o;
  }
  if (sub < 0) throw new Error("no (3,1) format 4 cmap");
  const segX2 = cmap.readUInt16BE(sub + 6);
  const ends = sub + 14;
  const starts = ends + segX2 + 2;
  const deltas = starts + segX2;
  const ranges = deltas + segX2;
  const map = new Map();
  for (let i = 0; i < segX2 / 2; i++) {
    const end = cmap.readUInt16BE(ends + i * 2);
    const start = cmap.readUInt16BE(starts + i * 2);
    const delta = cmap.readInt16BE(deltas + i * 2);
    const ro = cmap.readUInt16BE(ranges + i * 2);
    for (let c = start; c <= end && c !== 0xffff; c++) {
      let g;
      if (ro === 0) g = (c + delta) & 0xffff;
      else {
        g = cmap.readUInt16BE(ranges + i * 2 + ro + (c - start) * 2);
        if (g) g = (g + delta) & 0xffff;
      }
      if (g) map.set(c, g);
    }
  }
  return map;
}

/* ------------------------------------------------------------------ */
/* OpenType layout tables                                               */
/* ------------------------------------------------------------------ */

const u16 = (...vals) => {
  const b = Buffer.alloc(vals.length * 2);
  vals.forEach((v, i) => b.writeUInt16BE(v, i * 2));
  return b;
};
const tagBuf = (t) => Buffer.from(t, "ascii");

const coverage = (gids) => Buffer.concat([u16(1, gids.length), u16(...gids)]);

/** SingleSubst format 2 from a Map(gid -> gid). */
function singleSubst(map) {
  const from = [...map.keys()].sort((a, b) => a - b);
  const head = 6 + from.length * 2;
  return Buffer.concat([u16(2, head, from.length), u16(...from.map((g) => map.get(g))), coverage(from)]);
}

/** LigatureSubst format 1 from Map(firstGid -> [{ components:[gid], lig }]). */
function ligatureSubst(map) {
  const firsts = [...map.keys()].sort((a, b) => a - b);
  const sets = firsts.map((g) => {
    const ligs = map.get(g).map(({ components, lig }) => u16(lig, components.length + 1, ...components));
    let off = 2 + ligs.length * 2;
    const offs = ligs.map((l) => {
      const o = off;
      off += l.length;
      return o;
    });
    return Buffer.concat([u16(ligs.length, ...offs), ...ligs]);
  });
  let off = 6 + firsts.length * 2;
  const setOffs = sets.map((s) => {
    const o = off;
    off += s.length;
    return o;
  });
  return Buffer.concat([u16(1, off, firsts.length, ...setOffs), ...sets, coverage(firsts)]);
}

function lookup(type, flag, subtable) {
  return Buffer.concat([u16(type, flag, 1, 8), subtable]);
}

/** GSUB with DFLT and arab scripts; features maps tag -> lookup index. */
function buildGsub(lookups, features) {
  const featTags = Object.keys(features).sort();

  const langSys = u16(0, 0xffff, featTags.length, ...featTags.map((_, i) => i));
  const script = Buffer.concat([u16(4, 0), langSys]);
  const scriptTags = ["DFLT", "arab"];
  const scriptList = Buffer.concat([
    u16(scriptTags.length),
    ...scriptTags.map((t, i) => Buffer.concat([tagBuf(t), u16(2 + scriptTags.length * 6 + i * script.length)])),
    ...scriptTags.map(() => script),
  ]);

  const featTables = featTags.map((t) => u16(0, 1, features[t]));
  const featList = Buffer.concat([
    u16(featTags.length),
    ...featTags.map((t, i) => Buffer.concat([tagBuf(t), u16(2 + featTags.length * 6 + i * 6)])),
    ...featTables,
  ]);

  let off = 2 + lookups.length * 2;
  const lookupOffs = lookups.map((l) => {
    const o = off;
    off += l.length;
    return o;
  });
  const lookupList = Buffer.concat([u16(lookups.length, ...lookupOffs), ...lookups]);

  const scriptOff = 10;
  const featOff = scriptOff + scriptList.length;
  const lookupOff = featOff + featList.length;
  return Buffer.concat([u16(1, 0, scriptOff, featOff, lookupOff), scriptList, featList, lookupList]);
}

/** GDEF v1.0 with only a glyph class definition. */
function buildGdef(classes) {
  const classDef = Buffer.concat([u16(1, 0, classes.length), u16(...classes)]);
  return Buffer.concat([u16(1, 0, 12, 0, 0, 0), classDef]);
}

/* ------------------------------------------------------------------ */
/* Al Tarikh                                                            */
/* ------------------------------------------------------------------ */

function buildAlTarikh() {
  const { flavor, tables } = readFace(readFileSync(path.join(SRC, "Al Tarikh.ttc")), 0);
  const cmap = readCmap(tables.get("cmap"));
  const numGlyphs = tables.get("maxp").readUInt16BE(4);

  // Presentation Forms-B lists each letter as isol, fina[, init, medi]:
  // consecutive codepoints that normalise to the same base form one group.
  const groups = [];
  for (let c = 0xfe80; c <= 0xfefc; c++) {
    const base = String.fromCodePoint(c).normalize("NFKC");
    const last = groups.at(-1);
    if (last && last.base === base) last.cps.push(c);
    else groups.push({ base, cps: [c] });
  }

  const fina = new Map();
  const init = new Map();
  const medi = new Map();
  const lamAlef = {}; // alef codepoint -> { isol, fina } ligature glyphs
  for (const { base, cps } of groups) {
    const chars = [...base];
    if (chars.length === 2 && chars[0] === "ل") {
      lamAlef[chars[1].codePointAt(0)] = { isol: cmap.get(cps[0]), fina: cmap.get(cps[1]) };
      continue;
    }
    if (chars.length !== 1) continue;
    const g = cmap.get(base.codePointAt(0));
    if (!g) continue;
    const add = (map, cp) => {
      const form = cp && cmap.get(cp);
      if (form && form !== g) map.set(g, form);
    };
    if (cps.length >= 2) add(fina, cps[1]);
    if (cps.length === 4) {
      add(init, cps[2]);
      add(medi, cps[3]);
    }
  }

  // rlig: lam (initial or medial) + final alef -> lam-alef (isolated or final)
  const lam = cmap.get(0x644);
  const ligs = new Map();
  for (const [alef, lig] of Object.entries(lamAlef)) {
    const alefFina = fina.get(cmap.get(Number(alef)));
    if (!alefFina || !lig.isol || !lig.fina) continue;
    const push = (first, glyph) => {
      if (!first) return;
      if (!ligs.has(first)) ligs.set(first, []);
      ligs.get(first).push({ components: [alefFina], lig: glyph });
    };
    push(init.get(lam), lig.isol);
    push(medi.get(lam), lig.fina);
  }

  const IGNORE_MARKS = 0x0008;
  const lookups = [
    lookup(1, IGNORE_MARKS, singleSubst(fina)),
    lookup(1, IGNORE_MARKS, singleSubst(medi)),
    lookup(1, IGNORE_MARKS, singleSubst(init)),
    lookup(4, IGNORE_MARKS, ligatureSubst(ligs)),
  ];
  tables.set("GSUB", buildGsub(lookups, { fina: 0, medi: 1, init: 2, rlig: 3 }));

  // GDEF: marks are zero-width and skipped inside the lam-alef ligature.
  const classes = new Array(numGlyphs).fill(1);
  for (const { isol, fina: f } of Object.values(lamAlef)) {
    if (isol) classes[isol] = 2;
    if (f) classes[f] = 2;
  }
  for (const cp of [0x64b, 0x64c, 0x64d, 0x64e, 0x64f, 0x650, 0x651, 0x652, 0x653, 0x654, 0x655, 0x670]) {
    const g = cmap.get(cp);
    if (g) classes[g] = 3;
  }
  tables.set("GDEF", buildGdef(classes));

  for (const t of ["morx", "feat", "Zapf", "just", "ltag", "meta"]) tables.delete(t);

  const woff = sfntToWoff(buildSfnt(flavor, tables));
  writeFileSync(path.join(OUT, "al-tarikh.woff"), woff);
  console.log(
    `al-tarikh.woff  ${woff.length} bytes  fina ${fina.size}  medi ${medi.size}  init ${init.size}  lam-alef ${[...ligs.values()].flat().length}`,
  );
}

/* ------------------------------------------------------------------ */
/* Palestine                                                            */
/* ------------------------------------------------------------------ */

/** Glyph names from a format 2.0 post table (custom names only). */
function postNames(post, numGlyphs) {
  if (post.readUInt32BE(0) !== 0x20000) return [];
  const idx = [];
  for (let i = 0; i < numGlyphs; i++) idx.push(post.readUInt16BE(34 + i * 2));
  const custom = [];
  for (let q = 34 + numGlyphs * 2; q < post.length; q += 1 + post[q]) {
    custom.push(post.toString("latin1", q + 1, q + 1 + post[q]));
  }
  return idx.map((i) => (i >= 258 ? custom[i - 258] : ""));
}

/**
 * Palestine's joining glyphs only touch (their connecting strokes end exactly
 * on the glyph edge), so anti-aliasing leaves a light hairline at every join,
 * which reads as a gap between letters. Glyphs that connect to the preceding
 * letter (final, medial and kashida forms) are made JOIN_OVERLAP units
 * narrower. In right-to-left text the outline then reaches that much past its
 * pen start, over the preceding letter's connecting stroke, and the seam
 * closes. Outlines are untouched.
 */
const JOIN_OVERLAP = 20; // font units; the em is 1000

function buildPalestine() {
  const { flavor, tables } = readFace(readFileSync(path.join(SRC, "alfont_com_Palestine-Regular.ttf")));
  const numGlyphs = tables.get("maxp").readUInt16BE(4);
  const numHMetrics = tables.get("hhea").readUInt16BE(34);
  const hmtx = Buffer.from(tables.get("hmtx"));
  const names = postNames(tables.get("post"), numGlyphs);
  const joinsPrevious = /\.fina|\.medi|KASHIDA|^uni0640$/;
  let tightened = 0;
  names.forEach((name, g) => {
    if (g >= numHMetrics || !joinsPrevious.test(name)) return;
    const adv = hmtx.readUInt16BE(g * 4);
    if (adv <= JOIN_OVERLAP * 2) return;
    hmtx.writeUInt16BE(adv - JOIN_OVERLAP, g * 4);
    tightened++;
  });
  tables.set("hmtx", hmtx);
  // The digital signature no longer matches the edited tables.
  tables.delete("DSIG");

  const woff = sfntToWoff(buildSfnt(flavor, tables));
  writeFileSync(path.join(OUT, "palestine.woff"), woff);
  console.log(`palestine.woff  ${woff.length} bytes  joins tightened ${tightened}`);
}

buildAlTarikh();
buildPalestine();
