import assert from "node:assert/strict";
import test from "node:test";

import { buildContactMailto } from "../site/contact.js";

test("buildContactMailto creates an encoded project enquiry", () => {
  const result = buildContactMailto({
    name: "Alex Creator",
    email: "alex@example.com",
    channel: "https://youtube.com/@alex",
    audience: "100k–500k",
    message: "A bright summer drop & store.",
  });

  assert.equal(
    result,
    "mailto:hello@merchendices.com?subject=New%20creator%20enquiry%20%E2%80%94%20Alex%20Creator&body=Name%3A%20Alex%20Creator%0AEmail%3A%20alex%40example.com%0AChannel%3A%20https%3A%2F%2Fyoutube.com%2F%40alex%0AAudience%3A%20100k%E2%80%93500k%0A%0AProject%3A%0AA%20bright%20summer%20drop%20%26%20store.",
  );
});

test("buildContactMailto trims values before composing the message", () => {
  const result = buildContactMailto({
    name: "  Nova  ",
    email: " nova@example.com ",
    channel: " ",
    audience: "Under 25k",
    message: "  First drop  ",
  });

  assert.match(result, /Nova/);
  assert.doesNotMatch(result, /%20%20Nova|Nova%20%20/);
  assert.match(result, /Channel%3A%20Not%20provided/);
});
