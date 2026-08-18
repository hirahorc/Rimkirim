#!/usr/bin/env node
/**
 * Article cover checker — lists every article's cover slot and whether the
 * file exists in /public, with dimensions and aspect ratio (target 16:9,
 * ≥ 1200px wide). Exit code 1 when any cover is missing or off-spec, so it
 * can gate CI. Usage: npm run check:covers
 */
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

const ROOT = process.cwd();
const CONTENT = path.join(ROOT, "content", "articles");
const PUBLIC = path.join(ROOT, "public");
const MIN_WIDTH = 1200;
const TARGET_RATIO = 16 / 9;
const RATIO_TOLERANCE = 0.03;

function imageSize(file) {
  const buf = fs.readFileSync(file);
  // PNG: IHDR at byte 16
  if (buf.readUInt32BE(0) === 0x89504e47) {
    return { w: buf.readUInt32BE(16), h: buf.readUInt32BE(20) };
  }
  // JPEG: walk segments to a SOFn marker
  if (buf[0] === 0xff && buf[1] === 0xd8) {
    let i = 2;
    while (i < buf.length) {
      if (buf[i] !== 0xff) return null;
      const marker = buf[i + 1];
      const len = buf.readUInt16BE(i + 2);
      if (marker >= 0xc0 && marker <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(marker)) {
        return { h: buf.readUInt16BE(i + 5), w: buf.readUInt16BE(i + 7) };
      }
      i += 2 + len;
    }
  }
  // WebP (VP8/VP8L/VP8X) — good enough for our purposes
  if (buf.toString("ascii", 0, 4) === "RIFF" && buf.toString("ascii", 8, 12) === "WEBP") {
    const chunk = buf.toString("ascii", 12, 16);
    if (chunk === "VP8X") return { w: 1 + buf.readUIntLE(24, 3), h: 1 + buf.readUIntLE(27, 3) };
    if (chunk === "VP8 ") return { w: buf.readUInt16LE(26) & 0x3fff, h: buf.readUInt16LE(28) & 0x3fff };
    if (chunk === "VP8L") {
      const b = buf.readUInt32LE(21);
      return { w: 1 + (b & 0x3fff), h: 1 + ((b >> 14) & 0x3fff) };
    }
  }
  return null;
}

const files = fs.readdirSync(CONTENT).filter((f) => f.endsWith(".md")).sort();
const rows = [];
let problems = 0;
// covers are shared by the id/en pair, so report each cover path once
const seen = new Map();
for (const f of files) {
  const slug = f.replace(/\.md$/, "");
  const { data } = matter(fs.readFileSync(path.join(CONTENT, f), "utf8"));
  const cover = String(data.cover ?? `/articles/${slug}.jpg`);
  if (seen.has(cover)) {
    seen.get(cover).slugs.push(`${slug} (${data.lang})`);
    continue;
  }
  const abs = path.join(PUBLIC, cover);
  const row = { cover, slugs: [`${slug} (${data.lang})`], status: "", note: "" };
  if (!fs.existsSync(abs)) {
    row.status = "MISSING";
    problems++;
  } else {
    const size = imageSize(abs);
    if (!size) {
      row.status = "UNREADABLE";
      problems++;
    } else {
      const ratio = size.w / size.h;
      const ratioOk = Math.abs(ratio - TARGET_RATIO) <= RATIO_TOLERANCE;
      const widthOk = size.w >= MIN_WIDTH;
      row.note = `${size.w}×${size.h} (${ratio.toFixed(2)}:1)`;
      if (ratioOk && widthOk) row.status = "OK";
      else {
        row.status = "OFF-SPEC";
        row.note += !ratioOk ? " · want 16:9" : "";
        row.note += !widthOk ? ` · want ≥${MIN_WIDTH}px wide` : "";
        problems++;
      }
    }
  }
  seen.set(cover, row);
  rows.push(row);
}

const icon = { OK: "✅", MISSING: "⚠️ ", "OFF-SPEC": "❗", UNREADABLE: "❓" };
console.log(`\nArticle covers (${rows.length} slots, target 16:9 ≥ ${MIN_WIDTH}px)\n`);
for (const r of rows) {
  console.log(`${icon[r.status]}  ${r.status.padEnd(9)} ${r.cover}${r.note ? `  ${r.note}` : ""}`);
  console.log(`   ${r.slugs.join("  ·  ")}`);
}
console.log(problems === 0 ? "\nAll covers present and on spec.\n" : `\n${problems} cover slot(s) need attention. Drop files into public/articles/ with the paths above.\n`);
process.exit(problems === 0 ? 0 : 1);
