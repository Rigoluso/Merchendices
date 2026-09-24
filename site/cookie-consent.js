export const CONSENT_KEY = "merchendices-cookie-choice";

export function normalizeConsent(value) {
  if (!value || typeof value !== "object") return null;
  return {
    essential: true,
    analytics: Boolean(value.analytics),
    decidedAt: String(value.decidedAt || ""),
  };
}

export function readConsent(storage) {
  try {
    const parsed = JSON.parse(storage.getItem(CONSENT_KEY) || "null");
    return parsed && parsed.decidedAt ? normalizeConsent(parsed) : null;
  } catch {
    return null;
  }
}

export function writeConsent(storage, analytics, decidedAt = new Date().toISOString()) {
  const value = normalizeConsent({ essential: true, analytics, decidedAt });
  storage.setItem(CONSENT_KEY, JSON.stringify(value));
  return value;
}

if (typeof document !== "undefined") {
  const markup = `
    <div class="cookie-banner" data-cookie-banner hidden role="region" aria-label="Cookie notice">
      <div><p class="eyebrow"><span class="dot dot-teal" aria-hidden="true"></span> Your choice</p><h2>Small cookie, clear choice.</h2><p>We use essential storage to remember this preference. Optional analytics stays off unless you choose it.</p></div>
      <div class="cookie-actions"><button class="button button-paper" type="button" data-cookie-reject>Keep essentials only</button><button class="button button-teal" type="button" data-cookie-accept>Allow optional analytics</button></div>
    </div>
    <div class="cookie-overlay" data-cookie-dialog hidden>
      <section class="cookie-dialog" role="dialog" aria-modal="true" aria-labelledby="cookie-title">
        <button class="dialog-close" type="button" data-cookie-close aria-label="Close cookie settings">×</button>
        <p class="eyebrow"><span class="dot dot-amber" aria-hidden="true"></span> Cookie settings</p><h2 id="cookie-title">Choose what stays on.</h2>
        <p>Essential storage remembers your choice. Optional analytics is currently not loaded; this preference records whether it may be introduced later.</p>
        <label class="cookie-option"><span><strong>Essential storage</strong><small>Always active so your choice can be remembered.</small></span><input type="checkbox" checked disabled /></label>
        <label class="cookie-option"><span><strong>Optional analytics</strong><small>Off by default. Choose only if you want anonymous usage measurement.</small></span><input type="checkbox" data-cookie-analytics /></label>
        <div class="cookie-dialog-actions"><button class="button button-paper" type="button" data-cookie-close>Cancel</button><button class="button button-teal" type="button" data-cookie-save>Save choice</button></div>
      </section>
    </div>`;
  document.body.insertAdjacentHTML("beforeend", markup);
  const banner = document.querySelector("[data-cookie-banner]");
  const dialog = document.querySelector("[data-cookie-dialog]");
  const analytics = dialog.querySelector("[data-cookie-analytics]");
  const storage = window.localStorage;
  const existing = readConsent(storage);
  const setDialog = (open) => { dialog.hidden = !open; if (open) analytics.focus(); };
  const save = (allowAnalytics) => { writeConsent(storage, allowAnalytics); banner.hidden = true; setDialog(false); };
  if (!existing) banner.hidden = false;
  document.querySelectorAll("[data-cookie-settings]").forEach((button) => button.addEventListener("click", () => setDialog(true)));
  document.querySelectorAll("[data-cookie-close]").forEach((button) => button.addEventListener("click", () => setDialog(false)));
  document.querySelector("[data-cookie-reject]")?.addEventListener("click", () => save(false));
  document.querySelector("[data-cookie-accept]")?.addEventListener("click", () => save(true));
  document.querySelector("[data-cookie-save]")?.addEventListener("click", () => save(analytics.checked));
}
