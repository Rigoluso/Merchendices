import { existsSync, readFileSync, statSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const siteRoot = resolve(root, "site");
const requiredFiles = ["index.html", "styles.css", "script.js", "logo.webp"];

for (const file of requiredFiles) {
  const path = resolve(siteRoot, file);
  if (!existsSync(path)) throw new Error(`Missing required file: site/${file}`);
  if (statSync(path).size === 0) throw new Error(`Empty required file: site/${file}`);
}

const html = readFileSync(resolve(siteRoot, "index.html"), "utf8");
const references = [...html.matchAll(/(?:href|src)="([^"]+)"/g)].map((match) => match[1]);

for (const reference of references) {
  if (/^(?:https?:|mailto:|tel:|data:|#)/.test(reference)) continue;
  const cleanPath = reference.split(/[?#]/, 1)[0];
  const assetPath = resolve(siteRoot, cleanPath);
  if (!assetPath.startsWith(siteRoot) || !existsSync(assetPath)) {
    throw new Error(`Broken local reference: ${reference}`);
  }
}

for (const file of ["index.html", "styles.css", "script.js"]) {
  const source = readFileSync(resolve(siteRoot, file), "utf8");
  if (/\b(?:TODO|TBD)\b/.test(source)) throw new Error(`Unfinished marker in site/${file}`);
}

console.log(`MERX site validated: ${references.length} local and navigational references checked.`);
