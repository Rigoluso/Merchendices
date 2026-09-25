import { existsSync, readFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import test from "node:test";
import assert from "node:assert/strict";

const root = new URL("../", import.meta.url);
const site = new URL("../site/", import.meta.url);
const read = (path) => readFileSync(new URL(path, site), "utf8");

test("the replacement exposes exactly the focused public routes", () => {
  const expected = ["index.html", "contact/index.html", "terms/index.html"];
  const actual = expected.filter((path) => existsSync(new URL(path, site)));
  assert.deepEqual(actual, expected);
  for (const removed of ["about/index.html", "services/index.html", "stores/index.html", "motion-core.js"]) {
    assert.equal(existsSync(new URL(removed, site)), false, `removed asset still exists: ${removed}`);
  }
});

test("each public page shares the Merchendice shell and legal entry points", () => {
  for (const path of ["index.html", "contact/index.html", "terms/index.html"]) {
    const html = read(path);
    assert.match(html, /<title>[^<]*Merchendice/i);
    assert.match(html, /<main\b/);
    assert.match(html, /src=["']\/logo\.webp["']/);
    assert.match(html, /href=["']\/styles\.css["']/);
    assert.match(html, /type=["']module["'][^>]+src=["']\/cookie-consent\.js["']/i);
    assert.match(html, /data-cookie-settings/);
    assert.match(html, /href=["']\/terms\/["']/);
  }
});

test("the homepage stays concise and uses the supplied palette", () => {
  const html = read("index.html");
  const css = read("styles.css");
  for (const phrase of ["Creator merchandise", "Services", "Contact"]) {
    assert.match(html, new RegExp(phrase, "i"));
  }
  for (const color of ["#011627", "#FDFFFC", "#2EC4B6", "#E71D36", "#FF9F1C"]) {
    assert.match(css, new RegExp(color, "i"));
  }
  assert.doesNotMatch(html, /process-stage|store-browser|capability-visual|night-shift|fulfillment\.webp/i);
  assert.ok((html.match(/<section\b/g) ?? []).length <= 5, "homepage should stay compact");
});

test("the homepage does not expose numbered workflow stages", () => {
  const html = read("index.html");
  assert.doesNotMatch(html, /\b0[1-4]\b/);
});

test("all page shells use one centered rail and mobile-safe gutters", () => {
  const css = read("styles.css");
  assert.match(css, /--content-max\s*:/);
  assert.match(css, /--page-gutter\s*:/);
  assert.match(css, /\.page-wrap\s*,\s*\.site-header\s*\{/);
  assert.match(css, /\.legal-copy\s*\{[^}]*max-width\s*:\s*none/s);
});

test("the homepage uses factual copy instead of slogans", () => {
  const html = read("index.html");
  for (const phrase of ["Creator merchandise", "Services", "Process", "Fulfilment"]) {
    assert.match(html, new RegExp(phrase, "i"), phrase);
  }
  for (const phrase of ["Develop your next", "A clear route", "No mystery process", "A product, made personal"]) {
    assert.doesNotMatch(html, new RegExp(phrase, "i"), phrase);
  }
});

test("the homepage gives each palette color a visible surface role", () => {
  const css = read("styles.css");
  for (const color of ["#011627", "#FDFFFC", "#2EC4B6", "#E71D36", "#FF9F1C"]) {
    assert.match(css, new RegExp(color, "i"), color);
  }
  for (const selector of [".offer-card-teal", ".offer-card-red", ".offer-card-amber", ".process-panel", ".contact-panel"]) {
    assert.match(css, new RegExp(selector.replace(".", "\\.")), selector);
  }
});

test("contact page publishes every requested creator field and recipient", () => {
  const html = read("contact/index.html");
  assert.match(html, /merchendice@gmail\.com/i);
  for (const field of ["name", "email", "youtube", "instagram", "tiktok", "otherPlatforms", "message"]) {
    assert.match(html, new RegExp(`name=["']${field}["']`, "i"), field);
  }
  assert.match(html, /data-contact-form/);
  assert.match(html, /data-form-status[^>]+aria-live=["']polite["']/i);
});

test("terms page covers the operating agreements", () => {
  const html = read("terms/index.html");
  for (const phrase of ["Scope", "Approvals", "Production", "Shipping", "Intellectual property", "Privacy", "merchendice@gmail.com"]) {
    assert.match(html, new RegExp(phrase, "i"), phrase);
  }
});

test("the supplied logo is the only brand image and remains optimized", () => {
  const html = read("index.html");
  const logo = new URL("logo.webp", site);
  assert.equal(existsSync(logo), true);
  const imageSources = [...html.matchAll(/<img\b[^>]*src=["']([^"']+)["']/g)].map((match) => match[1]);
  assert.ok(imageSources.length > 0);
  assert.ok(imageSources.every((src) => src === "/logo.webp"));
  const bytes = readFileSync(logo);
  assert.equal(bytes.subarray(0, 4).toString("ascii"), "RIFF");
  assert.equal(bytes.subarray(8, 12).toString("ascii"), "WEBP");
  assert.ok(bytes.byteLength <= 160 * 1024);
});

test("the site validator accepts the focused route inventory", () => {
  const result = spawnSync(process.execPath, ["scripts/check-site.mjs"], {
    cwd: root,
    encoding: "utf8",
  });
  assert.equal(result.status, 0, result.stderr || result.stdout);
  assert.match(result.stdout, /3 HTML documents/);
});

test("the deployment boundary remains an unprivileged nginx container", () => {
  const dockerfile = readFileSync(new URL("../Dockerfile", import.meta.url), "utf8");
  const compose = readFileSync(new URL("../compose.yaml", import.meta.url), "utf8");
  const nginx = readFileSync(new URL("../nginx.conf", import.meta.url), "utf8");
  assert.match(dockerfile, /nginx:1\.27-alpine/);
  assert.match(dockerfile, /USER nginx/);
  assert.match(compose, /merchendice/);
  assert.match(nginx, /listen\s+8080/);
});

test("contact delivery stays private behind the nginx proxy", () => {
  const compose = readFileSync(new URL("../compose.yaml", import.meta.url), "utf8");
  const nginx = readFileSync(new URL("../nginx.conf", import.meta.url), "utf8");
  const contact = read("contact/index.html");
  const mailApiBlock = compose.match(/  mail-api:[\s\S]*?(?=\n  \w|$)/)?.[0] ?? "";

  assert.match(compose, /mail-api:/);
  assert.match(compose, /SMTP_APP_PASSWORD/);
  assert.match(mailApiBlock, /expose:\s*\n\s*- ["']?3000/);
  assert.doesNotMatch(mailApiBlock, /ports:/);
  assert.match(nginx, /location\s*=\s+\/api\/contact/);
  assert.match(nginx, /proxy_pass\s+http:\/\/mail-api:3000\/contact/);
  assert.doesNotMatch(contact, /mailto:|Prepare email|opens an email/i);
});
