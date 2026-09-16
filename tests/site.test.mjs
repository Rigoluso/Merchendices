import { existsSync, readFileSync } from "node:fs";
import test from "node:test";
import assert from "node:assert/strict";

test("the landing page exposes the required narrative sections", () => {
  const html = readFileSync(new URL("../site/index.html", import.meta.url), "utf8");

  for (const id of ["top", "services", "process", "work", "model", "contact"]) {
    assert.match(html, new RegExp(`id=["']${id}["']`));
  }

  assert.match(html, /MERX/);
  assert.match(html, /design/i);
  assert.match(html, /storefront/i);
  assert.match(html, /ship/i);
});

test("the MERX name replaces the former identity everywhere", () => {
  const html = readFileSync(new URL("../site/index.html", import.meta.url), "utf8");
  const logo = readFileSync(new URL("../site/logo.svg", import.meta.url), "utf8");
  const packageJson = JSON.parse(
    readFileSync(new URL("../package.json", import.meta.url), "utf8"),
  );
  const readme = readFileSync(new URL("../README.md", import.meta.url), "utf8");
  const validator = readFileSync(
    new URL("../scripts/check-site.mjs", import.meta.url),
    "utf8",
  );

  for (const content of [html, logo, readme, validator]) {
    assert.doesNotMatch(content, /creator[ -]supply/i);
  }

  assert.equal(packageJson.name, "merx");
  assert.doesNotMatch(logo, /<text\b/i);
  assert.match(logo, /id=["']mx-negative-space["']/i);
});

test("the page includes the complete service and process story", () => {
  const html = readFileSync(new URL("../site/index.html", import.meta.url), "utf8");

  for (const phrase of [
    "We design it",
    "We build the store",
    "We make every piece",
    "We ship every order",
    "Zero setup fee",
  ]) {
    assert.match(html, new RegExp(phrase, "i"));
  }
});

test("the stylesheet defines staged accent colors without a page gradient", () => {
  const css = readFileSync(new URL("../site/styles.css", import.meta.url), "utf8");

  for (const token of ["--green", "--violet", "--orange", "--cyan"]) {
    assert.match(css, new RegExp(token));
  }

  assert.doesNotMatch(css, /body[^}]*linear-gradient/is);
});

test("motion is progressive and respects reduced-motion preferences", () => {
  const css = readFileSync(new URL("../site/styles.css", import.meta.url), "utf8");
  const js = readFileSync(new URL("../site/script.js", import.meta.url), "utf8");

  assert.match(css, /prefers-reduced-motion:\s*reduce/);
  assert.match(js, /IntersectionObserver/);
  assert.match(js, /matchMedia\(["']\(prefers-reduced-motion: reduce\)["']\)/);
});

test("interactive visuals are excluded from keyboard order", () => {
  const html = readFileSync(new URL("../site/index.html", import.meta.url), "utf8");

  assert.match(html, /aria-hidden=["']true["']/);
  assert.match(html, /aria-label=["']Primary["']/);
});

test("the generated merchandise photographs are removed", () => {
  const html = readFileSync(new URL("../site/index.html", import.meta.url), "utf8");

  for (const name of ["night-shift.webp", "fulfillment.webp", "studio-pack.webp"]) {
    assert.equal(existsSync(new URL(`../site/assets/${name}`, import.meta.url)), false, name);
    assert.doesNotMatch(html, new RegExp(name.replace(".", "\\.")));
  }

  assert.doesNotMatch(html, /<img[^>]+assets\//i);
});

test("the work section uses graphic capability panels instead of product photography", () => {
  const html = readFileSync(new URL("../site/index.html", import.meta.url), "utf8");
  const css = readFileSync(new URL("../site/styles.css", import.meta.url), "utf8");

  for (const phrase of ["Identity systems", "Digital experiences", "Launch operations"]) {
    assert.match(html, new RegExp(phrase, "i"));
  }

  assert.equal((html.match(/class=["'][^"']*capability-visual/g) ?? []).length, 3);
  assert.match(css, /\.browser-shell\s*{[^}]*position:\s*absolute[^}]*inset:\s*3\.5rem 1rem 1rem/is);
});

test("the container serves the static site through unprivileged nginx", () => {
  const dockerfile = readFileSync(new URL("../Dockerfile", import.meta.url), "utf8");
  const nginx = readFileSync(new URL("../nginx.conf", import.meta.url), "utf8");

  assert.match(dockerfile, /nginx:1\.27-alpine/);
  assert.match(dockerfile, /COPY(?: --chown=\S+)? site\//);
  assert.match(dockerfile, /EXPOSE 8080/);
  assert.match(nginx, /listen\s+8080/);
  assert.match(nginx, /try_files\s+\$uri\s+\$uri\/\s+\/index\.html/);
});

test("the dimensional split-signal die is used throughout the brand", () => {
  const html = readFileSync(new URL("../site/index.html", import.meta.url), "utf8");
  const logoUrl = new URL("../site/logo.svg", import.meta.url);

  assert.equal(existsSync(logoUrl), true);
  assert.equal((html.match(/src=["']logo\.svg["']/g) ?? []).length, 5);
  assert.match(html, /rel=["']icon["'][^>]+href=["']logo\.svg["']/);
  assert.doesNotMatch(html, /favicon\.svg/);

  const logo = readFileSync(logoUrl, "utf8");
  assert.match(logo, /scanline/i);
  assert.match(logo, /id=["']crt-face["']/i);
  assert.match(logo, /id=["']spectrum-face["']/i);
  assert.match(logo, /id=["']mx-negative-space["']/i);
  assert.doesNotMatch(logo, /<text\b/i);
  for (const color of ["#a4ff00", "#8468ff", "#ff6b2c", "#48e7ff"]) {
    assert.match(logo, new RegExp(color, "i"));
  }
});

test("the work section presents capabilities rather than specific merchandise", () => {
  const html = readFileSync(new URL("../site/index.html", import.meta.url), "utf8");

  assert.doesNotMatch(html, /Night Shift Hoodie|Studio Pack|Handled with care/i);
  for (const phrase of ["Identity systems", "Digital experiences", "Launch operations"]) {
    assert.match(html, new RegExp(phrase, "i"));
  }
  assert.match(html, /dice/i);
});
