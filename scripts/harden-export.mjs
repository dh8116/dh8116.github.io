// Post-build pass over the static export.
//
// GitHub Pages serves files, not headers, so a <meta http-equiv> CSP is the only
// policy this site can carry. A meta policy governs whatever the parser sees
// *after* it, so it has to sit at the very top of <head> — React hoists it after
// Next's own script tags, which is too late. This rewrites each exported page to
// put it first.
//
// `frame-ancestors` is deliberately absent: browsers ignore it in a meta policy.
//
// Second job: the Chinese pages under out/zh need <html lang="zh-Hans">, and a
// single root layout can only emit one lang attribute. Stamping it here is the
// only place that knows which export a page came from.
//
// Third job: /admin talks to api.github.com, which `connect-src 'self'` blocks
// silently — no console error the page can catch, just a fetch that never
// resolves. Those pages get that one extra origin. The rest of the site keeps
// the stricter policy, so a scripted exfiltration of anything on a content
// page still has nowhere to send it.

import { readdir, readFile, writeFile } from "node:fs/promises";
import { join, sep } from "node:path";

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

// Same policy, plus the one origin the admin pages need to reach.
const ADMIN_CSP = CSP.replace(
  "connect-src 'self'",
  "connect-src 'self' https://api.github.com"
);

const meta = (policy) =>
  `<meta http-equiv="Content-Security-Policy" content="${policy}">`;
const EXISTING = /<meta http-equiv="Content-Security-Policy"[^>]*>/gi;

async function* htmlFiles(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) yield* htmlFiles(path);
    else if (entry.name.endsWith(".html")) yield path;
  }
}

// "/zh" exports as out/zh.html; everything below it lands in out/zh/.
const ZH_PAGE = join("out", "zh.html");
const ZH_DIR = join("out", "zh") + sep;
const isChinese = (file) => file === ZH_PAGE || file.startsWith(ZH_DIR);

// Same shape for "/admin": out/admin.html plus everything under out/admin/.
const ADMIN_PAGE = join("out", "admin.html");
const ADMIN_DIR = join("out", "admin") + sep;
const isAdmin = (file) => file === ADMIN_PAGE || file.startsWith(ADMIN_DIR);
const HTML_LANG_EN = /<html([^>]*?)\slang="en"/i;

let patched = 0;
let relabelled = 0;
let relaxed = 0;
for await (const file of htmlFiles("out")) {
  const html = await readFile(file, "utf8");
  const stripped = html.replace(EXISTING, "");
  if (!stripped.includes("<head>")) {
    throw new Error(`No <head> to harden in ${file}`);
  }
  const admin = isAdmin(file);
  if (admin) relaxed += 1;
  let out = stripped.replace(
    "<head>",
    `<head>${meta(admin ? ADMIN_CSP : CSP)}`
  );

  if (isChinese(file)) {
    if (!HTML_LANG_EN.test(out)) {
      throw new Error(`No <html lang="en"> to relabel in ${file}`);
    }
    out = out.replace(HTML_LANG_EN, '<html$1 lang="zh-Hans"');
    relabelled += 1;
  }

  await writeFile(file, out);
  patched += 1;
}

console.log(
  `Hardened ${patched} exported page${patched === 1 ? "" : "s"}` +
    ` (${relabelled} relabelled zh-Hans, ${relaxed} admin)`
);
