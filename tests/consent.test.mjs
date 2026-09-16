import assert from "node:assert/strict";
import test from "node:test";

import {
  CONSENT_KEY,
  normalizeConsent,
  readConsent,
  writeConsent,
} from "../site/cookie-consent.js";

function createStorage(initialValue = null) {
  const values = new Map();
  if (initialValue !== null) values.set(CONSENT_KEY, initialValue);
  return {
    getItem(key) { return values.get(key) ?? null; },
    setItem(key, value) { values.set(key, value); },
  };
}

test("readConsent returns null for missing and malformed decisions", () => {
  assert.equal(readConsent(createStorage()), null);
  assert.equal(readConsent(createStorage("not-json")), null);
  assert.equal(readConsent(createStorage('{"analytics":"yes"}')), null);
});

test("normalizeConsent always keeps essential storage enabled", () => {
  assert.deepEqual(
    normalizeConsent({ essential: false, analytics: true, decidedAt: "2026-09-17T10:00:00.000Z" }),
    { essential: true, analytics: true, decidedAt: "2026-09-17T10:00:00.000Z" },
  );
});

test("writeConsent records accepted and rejected non-essential storage", () => {
  const acceptedStorage = createStorage();
  const rejectedStorage = createStorage();

  const accepted = writeConsent(acceptedStorage, true, "2026-09-17T10:00:00.000Z");
  const rejected = writeConsent(rejectedStorage, false, "2026-09-17T10:01:00.000Z");

  assert.deepEqual(readConsent(acceptedStorage), accepted);
  assert.equal(accepted.analytics, true);
  assert.deepEqual(readConsent(rejectedStorage), rejected);
  assert.equal(rejected.analytics, false);
});
