// Finds broken internal links in the static export: every href/src that starts with "/"
// in out/**/*.html must point at a file in out/. Run after `npm run build`.
//
//   npm run check:links

import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";

const OUT = path.resolve("out");

function* htmlFiles(dir) {
  for (const name of readdirSync(dir)) {
    const full = path.join(dir, name);
    if (statSync(full).isDirectory()) yield* htmlFiles(full);
    else if (name.endsWith(".html")) yield full;
  }
}

function targetExists(urlPath) {
  const clean = decodeURIComponent(urlPath.split(/[?#]/)[0]);
  if (clean === "" || clean === "/") return existsSync(path.join(OUT, "index.html"));
  const file = path.join(OUT, clean);
  if (clean.endsWith("/")) return existsSync(path.join(file, "index.html"));
  return existsSync(file) || existsSync(`${file}.html`) || existsSync(path.join(file, "index.html"));
}

if (!existsSync(OUT)) {
  console.error("out/ not found. Run `npm run build` first.");
  process.exit(1);
}

const broken = new Map(); // target -> pages linking to it
let pages = 0;
let links = 0;

for (const file of htmlFiles(OUT)) {
  pages++;
  const html = readFileSync(file, "utf8");
  for (const [, url] of html.matchAll(/\s(?:href|src)="(\/(?!\/)[^"]*)"/g)) {
    links++;
    if (targetExists(url)) continue;
    const from = "/" + path.relative(OUT, file).replace(/\\/g, "/");
    const list = broken.get(url) ?? [];
    if (list.length < 3) list.push(from);
    broken.set(url, list);
  }
}

console.log(`Checked ${links} internal links on ${pages} pages.`);
if (broken.size === 0) {
  console.log("No broken links.");
} else {
  console.log(`${broken.size} broken targets:`);
  for (const [url, from] of broken) console.log(`  ${url}  (from ${from.join(", ")})`);
  process.exit(1);
}
