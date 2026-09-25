import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, isAbsolute, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const siteRoot = resolve(root, "site");
const requiredFiles = [
  "index.html",
  "styles.css",
  "site.js",
  "contact.js",
  "cookie-consent.js",
  "logo.webp",
  "contact/index.html",
  "terms/index.html",
];

function collectHtml(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = resolve(directory, entry.name);
    if (entry.isDirectory()) return collectHtml(path);
    return entry.isFile() && entry.name.endsWith(".html") ? [path] : [];
  });
}

function resolveReference(documentPath, reference) {
  const clean = reference.split(/[?#]/, 1)[0];
  if (!clean) return null;
  const routePath = clean.endsWith("/") ? `${clean}index.html` : clean;
  return routePath.startsWith("/")
    ? resolve(siteRoot, routePath.replace(/^\/+/, ""))
    : resolve(dirname(documentPath), routePath);
}

for (const file of requiredFiles) {
  const path = resolve(siteRoot, file);
  if (!existsSync(path)) throw new Error(`Missing required file: site/${file}`);
  if (statSync(path).size === 0) throw new Error(`Empty required file: site/${file}`);
}

const htmlFiles = collectHtml(siteRoot);
let referenceCount = 0;

for (const htmlPath of htmlFiles) {
  const html = readFileSync(htmlPath, "utf8");
  const references = [...html.matchAll(/(?:href|src)="([^"]+)"/g)].map((match) => match[1]);

  for (const reference of references) {
    if (/^(?:https?:|mailto:|tel:|data:|#)/.test(reference)) continue;
    const assetPath = resolveReference(htmlPath, reference);
    if (!assetPath) continue;
    const fromRoot = relative(siteRoot, assetPath);
    if (fromRoot.startsWith("..") || isAbsolute(fromRoot) || !existsSync(assetPath)) {
      throw new Error(`Broken local reference in ${relative(siteRoot, htmlPath)}: ${reference}`);
    }
    referenceCount += 1;
  }
}

const sourceFiles = [
  ...htmlFiles,
  resolve(siteRoot, "styles.css"),
  resolve(siteRoot, "site.js"),
  resolve(siteRoot, "contact.js"),
  resolve(siteRoot, "cookie-consent.js"),
];
for (const path of sourceFiles) {
  const source = readFileSync(path, "utf8");
  if (/\b(?:TODO|TBD)\b/.test(source)) throw new Error(`Unfinished marker in site/${relative(siteRoot, path)}`);
}

const contactScript = readFileSync(resolve(siteRoot, "contact.js"), "utf8");
if (/mailto:|window\.location/.test(contactScript)) {
  throw new Error("Contact form must submit to the server API, not a local mail client");
}

const nginxConfig = readFileSync(resolve(root, "nginx.conf"), "utf8");
if (!/location\s*=\s*\/api\/contact/.test(nginxConfig) || !/proxy_pass\s+http:\/\/mail-api:3000\/contact/.test(nginxConfig)) {
  throw new Error("Nginx is missing the private contact API proxy");
}

console.log(`Merchendice site validated: ${htmlFiles.length} HTML documents and ${referenceCount} local references checked.`);
