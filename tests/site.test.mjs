import { readFileSync } from "node:fs";
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
