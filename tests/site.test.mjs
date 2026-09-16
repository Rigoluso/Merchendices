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
