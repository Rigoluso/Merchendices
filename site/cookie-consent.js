export const CONSENT_KEY = "merchendices-cookie-choice";

export function normalizeConsent(value) {
  if (!value || typeof value !== "object") return null;

  const decidedAt = String(value.decidedAt || "");
  return decidedAt ? { decidedAt } : null;
}

export function readConsent(storage) {
  try {
    return normalizeConsent(JSON.parse(storage.getItem(CONSENT_KEY) || "null"));
  } catch {
    return null;
  }
}

export function writeConsent(
  storage,
  decidedAt = new Date().toISOString(),
) {
  const value = normalizeConsent({ decidedAt });
  storage.setItem(CONSENT_KEY, JSON.stringify(value));
  return value;
}

if (typeof document !== "undefined") {
  const markup = `
    <div class="cookie-banner" data-cookie-banner hidden role="region" aria-label="Cookie notice">
      <div>
        <p class="eyebrow"><span class="dot dot-teal" aria-hidden="true"></span> Cookie notice</p>
        <h2>Essential storage only.</h2>
        <p>We store one essential preference so we remember that you have seen this notice.</p>
      </div>
      <div class="cookie-actions">
        <button class="button button-teal" type="button" data-cookie-accept>Continue</button>
      </div>
    </div>
    <div class="cookie-overlay" data-cookie-dialog hidden>
      <section class="cookie-dialog" role="dialog" aria-modal="true" aria-labelledby="cookie-title">
        <button class="dialog-close" type="button" data-cookie-close aria-label="Close cookie settings">×</button>
        <p class="eyebrow"><span class="dot dot-amber" aria-hidden="true"></span> Cookie settings</p>
        <h2 id="cookie-title">Essential storage only.</h2>
        <p>This site stores one essential preference in local storage. No optional analytics or advertising cookies are loaded.</p>
        <div class="cookie-dialog-actions">
          <button class="button button-paper" type="button" data-cookie-close>Cancel</button>
          <button class="button button-teal" type="button" data-cookie-save>Save choice</button>
        </div>
      </section>
    </div>`;

  document.body.insertAdjacentHTML("beforeend", markup);
  const banner = document.querySelector("[data-cookie-banner]");
  const dialog = document.querySelector("[data-cookie-dialog]");
  const saveButton = dialog.querySelector("[data-cookie-save]");
  const storage = window.localStorage;

  const setDialog = (open) => {
    dialog.hidden = !open;
    if (open) saveButton.focus();
  };
  const save = () => {
    writeConsent(storage);
    banner.hidden = true;
    setDialog(false);
  };

  if (!readConsent(storage)) banner.hidden = false;

  document
    .querySelectorAll("[data-cookie-settings]")
    .forEach((button) => button.addEventListener("click", () => setDialog(true)));
  document
    .querySelectorAll("[data-cookie-close]")
    .forEach((button) => button.addEventListener("click", () => setDialog(false)));
  document
    .querySelector("[data-cookie-accept]")
    ?.addEventListener("click", save);
  saveButton.addEventListener("click", save);
}
