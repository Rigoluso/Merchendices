import { existsSync, readFileSync } from "node:fs";
import test from "node:test";
import assert from "node:assert/strict";

test("the landing page exposes the required narrative sections", () => {
  const html = readFileSync(new URL("../site/index.html", import.meta.url), "utf8");

  for (const id of ["top", "services", "process", "work", "model", "contact"]) {
    assert.match(html, new RegExp(`id=["']${id}["']`));
  }

  assert.match(html, /Creator Supply/);
  assert.match(html, /design/i);
  assert.match(html, /storefront/i);
  assert.match(html, /ship/i);
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

test("all three merchandise campaign images are local and present", () => {
  for (const name of ["night-shift.webp", "fulfillment.webp", "studio-pack.webp"]) {
    assert.equal(existsSync(new URL(`../site/assets/${name}`, import.meta.url)), true, name);
  }
});

test("campaign images use responsive local markup and useful alt text", () => {
  const html = readFileSync(new URL("../site/index.html", import.meta.url), "utf8");

  for (const name of ["night-shift.webp", "fulfillment.webp", "studio-pack.webp"]) {
    assert.match(html, new RegExp(`src=["']assets/${name}["']`));
  }

  assert.match(html, /width=["']1600["']\s+height=["']1200["']/);
  assert.match(html, /alt=["'][^"']{20,}["']/);
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

test("the split-signal dice logo is used throughout the brand", () => {
  const html = readFileSync(new URL("../site/index.html", import.meta.url), "utf8");
  const logoUrl = new URL("../site/logo.svg", import.meta.url);

  assert.equal(existsSync(logoUrl), true);
  assert.equal((html.match(/src=["']logo\.svg["']/g) ?? []).length, 2);

  const logo = readFileSync(logoUrl, "utf8");
  assert.match(logo, /scanline/i);
  for (const color of ["#a4ff00", "#8468ff", "#ff6b2c", "#48e7ff"]) {
    assert.match(logo, new RegExp(color, "i"));
  }
});

test("the work section presents capability studies rather than specific merchandise", () => {
  const html = readFileSync(new URL("../site/index.html", import.meta.url), "utf8");

  assert.doesNotMatch(html, /Night Shift Hoodie|Studio Pack|Handled with care/i);
  for (const phrase of ["Apparel design study", "Packaging experience study", "Creator identity study"]) {
    assert.match(html, new RegExp(phrase, "i"));
  }
  assert.match(html, /dice/i);
});
