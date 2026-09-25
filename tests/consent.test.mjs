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
  assert.equal(readConsent(createStorage('{"legacy":"yes"}')), null);
});

test("normalizeConsent keeps only a valid decision timestamp", () => {
  assert.deepEqual(
    normalizeConsent({ legacy: false, decidedAt: "2026-09-17T10:00:00.000Z" }),
    { decidedAt: "2026-09-17T10:00:00.000Z" },
  );
});

test("writeConsent stores only the essential decision", () => {
  const storage = createStorage();

  const consent = writeConsent(storage, "2026-09-17T10:00:00.000Z");

  assert.deepEqual(consent, { decidedAt: "2026-09-17T10:00:00.000Z" });
  assert.deepEqual(readConsent(storage), consent);
});
