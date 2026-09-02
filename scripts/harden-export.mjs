// Post-build pass over the static export.
//
// GitHub Pages serves files, not headers, so a <meta http-equiv> CSP is the only
// policy this site can carry. A meta policy governs whatever the parser sees
// *after* it, so it has to sit at the very top of <head> — React hoists it after
// Next's own script tags, which is too late. This rewrites each exported page to
// put it first.
//
// `frame-ancestors` is deliberately absent: browsers ignore it in a meta policy.

import { readdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

const CSP = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data:",
  "font-src 'self' data:",
  "connect-src 'self'",
  "manifest-src 'self'",
  "media-src 'none'",
  "frame-src 'none'",
  "worker-src 'self'",
  "form-action 'none'",
  "upgrade-insecure-requests",
].join("; ");

const META = `<meta http-equiv="Content-Security-Policy" content="${CSP}">`;
const EXISTING = /<meta http-equiv="Content-Security-Policy"[^>]*>/gi;

async function* htmlFiles(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) yield* htmlFiles(path);
    else if (entry.name.endsWith(".html")) yield path;
  }
}

let patched = 0;
for await (const file of htmlFiles("out")) {
  const html = await readFile(file, "utf8");
  const stripped = html.replace(EXISTING, "");
  if (!stripped.includes("<head>")) {
    throw new Error(`No <head> to harden in ${file}`);
  }
  await writeFile(file, stripped.replace("<head>", `<head>${META}`));
  patched += 1;
}

console.log(`Hardened ${patched} exported page${patched === 1 ? "" : "s"}`);
