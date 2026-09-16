# Merchendices Multipage Website Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn the current MERX landing page into a smaller-scale, five-page Merchendices website with store demonstrations, contact information, and accessible cookie consent.

**Architecture:** Keep the dependency-free static site and add directory-index routes under `site/`. Shared CSS and JavaScript preserve one visual system, while a focused ES module owns consent persistence and UI behavior. The existing Docker/Nginx runtime continues serving the resulting files.

**Tech Stack:** HTML5, CSS, vanilla JavaScript ES modules, Node.js built-in test runner, Docker, Nginx 1.27 Alpine

**Spec:** `docs/superpowers/specs/2026-09-17-merchendices-multipage-design.md`

## Global Constraints

- Production brand copy is `MERCHENDICES`; `MERX` is absent from current site and package metadata.
- Main body text stays at least 16 px and regular navigation/controls stay at least 14 px.
- Example stores are explicitly labelled demonstrations, never past clients.
- Contact email is provisionally `hello@merchendices.com` and remains easy to replace.
- Cookie consent stores only the user's consent choice and does not load analytics.
- No new runtime dependencies; deployment remains static Docker/Nginx.

---

### Task 1: Brand migration and compact shared shell

**Files:**
- Modify: `tests/site.test.mjs`
- Modify: `package.json`
- Modify: `README.md`
- Modify: `scripts/check-site.mjs`
- Modify: `site/index.html`
- Modify: `site/styles.css`

**Interfaces:**
- Consumes: existing header, footer, CSS tokens, logo, and Nginx layout.
- Produces: `MERCHENDICES` shell and shared `/services/`, `/stores/`, `/about/`, `/contact/` navigation.

- [ ] Add a failing test that loads production-facing files, requires `MERCHENDICES`, rejects `MERX`, and asserts compact desktop display-size limits in CSS.
- [ ] Run `node --test tests/site.test.mjs` and confirm the brand/scale test fails because current files still use MERX and 9.8rem headings.
- [ ] Rename package and visible brand copy, change decorative `MX` to `MD`, install multipage navigation, and reduce display/card/section sizing while preserving readable body text.
- [ ] Run the tests and site checker; confirm the brand/scale contract passes.
- [ ] Commit the cohesive brand and shell change.

### Task 2: Multipage services, stores, about, and contact content

**Files:**
- Modify: `tests/site.test.mjs`
- Create: `site/services/index.html`
- Create: `site/stores/index.html`
- Create: `site/about/index.html`
- Create: `site/contact/index.html`
- Modify: `site/styles.css`
- Modify: `site/script.js`

**Interfaces:**
- Consumes: root-relative navigation, `styles.css`, `script.js`, and `logo.webp`.
- Produces: four directly addressable routes and `setupContactForm()` mail-client handoff.

- [ ] Add failing tests requiring all four route files, unique titles/descriptions, one `h1` each, current navigation, contact details, and three demonstration-store cards.
- [ ] Run tests and confirm they fail because the route files do not exist.
- [ ] Add compact inner-page heroes and page-specific content. Use three `.store-showcase` cards containing `.store-browser` UI compositions labelled `Demonstration store`.
- [ ] Add a contact form with `data-contact-form`, required fields, an inline `data-form-status`, and a `mailto:hello@merchendices.com` handoff assembled from validated values.
- [ ] Extend shared styles for inner pages, store previews, contact layout, form states, and responsive behavior.
- [ ] Run the tests and checker; confirm all local route references resolve.
- [ ] Commit the multipage content.

### Task 3: Consent state and accessible cookie controls

**Files:**
- Modify: `tests/site.test.mjs`
- Create: `tests/consent.test.mjs`
- Create: `site/cookie-consent.js`
- Modify: `site/index.html`
- Modify: `site/services/index.html`
- Modify: `site/stores/index.html`
- Modify: `site/about/index.html`
- Modify: `site/contact/index.html`
- Modify: `site/styles.css`

**Interfaces:**
- Produces: `CONSENT_KEY`, `normalizeConsent(value)`, `readConsent(storage)`, and `writeConsent(storage, value)` exports plus `[data-cookie-settings]` controls.
- Consent values: `{ essential: true, analytics: boolean, decidedAt: string }`.

- [ ] Add failing pure-state tests: missing/malformed storage returns `null`; accept writes analytics `true`; reject writes analytics `false`; essential is always `true`.
- [ ] Run `node --test tests/consent.test.mjs` and confirm failure because the module is missing.
- [ ] Implement the pure consent functions and minimal DOM initializer in `cookie-consent.js`. Inject a banner with Accept all, Reject non-essential, and Preferences controls; inject a labelled modal with an analytics checkbox and Save button.
- [ ] Load the module on all pages and add `Cookie settings` buttons to every footer.
- [ ] Style the banner and preferences modal for desktop/mobile, visible focus, overlay, and reduced motion.
- [ ] Run consent and full-site tests and confirm green.
- [ ] Commit cookie controls.

### Task 4: Validator, runtime QA, and documentation

**Files:**
- Modify: `scripts/check-site.mjs`
- Modify: `README.md`
- Modify: `tests/site.test.mjs`

**Interfaces:**
- Consumes: all static routes and their references.
- Produces: recursive static validation and current run/deployment documentation.

- [ ] Add a failing validator contract test requiring recursive HTML discovery and route-aware resolution.
- [ ] Run the test and confirm the current root-only checker fails the contract.
- [ ] Update the checker to recursively discover HTML and validate root-relative/directory links against `site/`.
- [ ] Update README with the Merchendices route map, provisional contact address, demo-store truthfulness note, cookie behavior, and Docker instructions.
- [ ] Run full Node tests, the recursive site checker, `git diff --check`, and local HTTP checks for `/`, `/services/`, `/stores/`, `/about/`, and `/contact/`.
- [ ] Inspect representative desktop and mobile screenshots, correcting overflow or scale issues through a failing regression test whenever behavior changes.
- [ ] Commit the final validated site expansion.
