export const CONSENT_KEY = "merchendices-consent-v1";

export function normalizeConsent(value) {
  if (!value || typeof value !== "object" || typeof value.analytics !== "boolean") return null;
  if (typeof value.decidedAt !== "string" || Number.isNaN(Date.parse(value.decidedAt))) return null;
  return { essential: true, analytics: value.analytics, decidedAt: value.decidedAt };
}

export function readConsent(storage) {
  try {
    const raw = storage.getItem(CONSENT_KEY);
    return raw ? normalizeConsent(JSON.parse(raw)) : null;
  } catch {
    return null;
  }
}

export function writeConsent(storage, analytics, decidedAt = new Date().toISOString()) {
  const decision = normalizeConsent({ essential: true, analytics: Boolean(analytics), decidedAt });
  storage.setItem(CONSENT_KEY, JSON.stringify(decision));
  return decision;
}

if (typeof document !== "undefined") {
  document.body.insertAdjacentHTML("beforeend", `
    <aside class="cookie-banner" data-cookie-banner aria-label="Cookie notice" hidden>
      <div><span>Cookie control</span><h2>Choose what stays.</h2><p>We use essential local storage to remember this choice. Optional analytics remain off unless you allow them.</p></div>
      <div class="cookie-actions">
        <button class="button button-light" type="button" data-cookie-accept>Accept all</button>
        <button class="button button-outline" type="button" data-cookie-reject>Reject non-essential</button>
        <button class="text-button" type="button" data-cookie-preferences>Preferences</button>
      </div>
    </aside>
    <div class="cookie-overlay" data-cookie-overlay hidden>
      <section class="cookie-dialog" role="dialog" aria-modal="true" aria-labelledby="cookie-title" aria-describedby="cookie-description">
        <button class="cookie-close" type="button" data-cookie-close aria-label="Close cookie preferences">×</button>
        <p class="section-kicker"><span>01</span> Privacy controls</p>
        <h2 id="cookie-title">Cookie preferences</h2>
        <p id="cookie-description">Choose whether Merchendices may use optional analytics. No advertising cookies are used.</p>
        <div class="cookie-choice"><div><strong>Essential storage</strong><p>Remembers your privacy choice. Always active.</p></div><span>Always on</span></div>
        <label class="cookie-choice"><div><strong>Optional analytics</strong><p>Reserved for anonymous site-performance measurement. No analytics tool is currently loaded.</p></div><input type="checkbox" data-cookie-analytics /></label>
        <div class="cookie-dialog-actions"><button class="button button-light" type="button" data-cookie-save>Save preferences</button><button class="text-button" type="button" data-cookie-reject>Reject non-essential</button></div>
      </section>
    </div>
  `);

  const banner = document.querySelector("[data-cookie-banner]");
  const overlay = document.querySelector("[data-cookie-overlay]");
  const analyticsInput = document.querySelector("[data-cookie-analytics]");
  let returnFocus = null;

  const applyDecision = (decision) => {
    document.documentElement.dataset.analyticsConsent = decision.analytics ? "accepted" : "rejected";
    banner.hidden = true;
    overlay.hidden = true;
    returnFocus?.focus?.();
  };
  const saveDecision = (analytics) => applyDecision(writeConsent(window.localStorage, analytics));
  const openPreferences = (trigger) => {
    returnFocus = trigger ?? document.activeElement;
    analyticsInput.checked = readConsent(window.localStorage)?.analytics ?? false;
    overlay.hidden = false;
    document.querySelector("[data-cookie-close]")?.focus();
  };
  const closePreferences = () => {
    overlay.hidden = true;
    returnFocus?.focus?.();
  };

  document.querySelectorAll("[data-cookie-accept]").forEach((button) => button.addEventListener("click", () => saveDecision(true)));
  document.querySelectorAll("[data-cookie-reject]").forEach((button) => button.addEventListener("click", () => saveDecision(false)));
  document.querySelectorAll("[data-cookie-preferences], [data-cookie-settings]").forEach((button) => button.addEventListener("click", () => openPreferences(button)));
  document.querySelector("[data-cookie-save]")?.addEventListener("click", () => saveDecision(analyticsInput.checked));
  document.querySelector("[data-cookie-close]")?.addEventListener("click", closePreferences);
  overlay.addEventListener("click", (event) => { if (event.target === overlay) closePreferences(); });
  document.addEventListener("keydown", (event) => { if (event.key === "Escape" && !overlay.hidden) closePreferences(); });

  const storedDecision = readConsent(window.localStorage);
  if (storedDecision) applyDecision(storedDecision);
  else banner.hidden = false;
}
