import assert from "node:assert/strict";
import test from "node:test";

import { buildContactPayload, validateContactValues } from "../site/contact.js";

test("buildContactPayload trims and preserves every creator field", () => {
  const result = buildContactPayload({
    name: "  Alex Creator  ",
    email: " alex@example.com ",
    youtube: " https://youtube.com/@alex ",
    instagram: " @alex ",
    tiktok: " alexclips ",
    otherPlatforms: " Twitch: alexlive ",
    message: " A bright summer drop. ",
    website: " ",
  });

  assert.deepEqual(result, {
    name: "Alex Creator",
    email: "alex@example.com",
    youtube: "https://youtube.com/@alex",
    instagram: "@alex",
    tiktok: "alexclips",
    otherPlatforms: "Twitch: alexlive",
    message: "A bright summer drop.",
    website: "",
  });
  assert.doesNotMatch(JSON.stringify(result), /mailto:/i);
});

test("validateContactValues reports missing required fields and invalid email", () => {
  assert.deepEqual(
    validateContactValues({ name: "", email: "not-an-email", message: "" }),
    { valid: false, missing: ["name", "email", "message"] },
  );
});

test("validateContactValues accepts a complete submission", () => {
  assert.deepEqual(
    validateContactValues({ name: "Nova", email: "nova@example.com", message: "First drop" }),
    { valid: true, missing: [] },
  );
});
