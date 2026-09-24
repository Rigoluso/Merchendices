import assert from "node:assert/strict";
import test from "node:test";

import { buildContactMailto } from "../site/contact.js";

test("buildContactMailto includes every requested creator field", () => {
  const result = buildContactMailto({
    name: "Alex Creator",
    email: "alex@example.com",
    youtube: "https://youtube.com/@alex",
    instagram: "@alex",
    tiktok: "alexclips",
    otherPlatforms: "Twitch: alexlive",
    message: "A bright summer drop.",
  });

  assert.match(result, /^mailto:merchendices@gmail\.com\?/);
  assert.match(result, /Merchendice%20creator%20enquiry/);
  for (const label of ["Name", "Email", "YouTube", "Instagram", "TikTok", "Other platforms", "Project brief"]) {
    assert.match(result, new RegExp(encodeURIComponent(label).replace(/ /g, "%20"), "i"), label);
  }
  assert.match(result, /alex%40example\.com/);
  assert.match(result, /summer%20drop/);
});

test("buildContactMailto trims values and keeps blank optional fields readable", () => {
  const result = buildContactMailto({
    name: "  Nova  ",
    email: " nova@example.com ",
    youtube: " ",
    instagram: " ",
    tiktok: " ",
    otherPlatforms: " ",
    message: "  First drop  ",
  });

  assert.match(result, /Nova/);
  assert.doesNotMatch(result, /%20%20Nova|Nova%20%20/);
  assert.match(result, /YouTube%3A%20Not%20provided/);
});
