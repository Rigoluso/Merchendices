# Merchendice Site Rebuild Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the existing showcase site with a compact Merchendices static site that preserves Docker/Nginx hosting, reuses the dice logo, adds cookie settings and terms, and provides a preformatted creator enquiry email flow.

**Architecture:** Three static HTML routes share one stylesheet and two small browser modules. `contact.js` validates and formats form data into a `mailto:` URL; `cookie-consent.js` stores only the user's consent choice and exposes a settings dialog. The existing Nginx/Docker boundary remains the deployment layer.

**Tech Stack:** Semantic HTML, vanilla CSS, browser JavaScript modules, Node's built-in test runner, Playwright browser checks, Nginx in Docker.

**Spec:** `docs/superpowers/specs/2026-09-24-merchendice-rebuild-design.md`

## Global Constraints

- Preserve `Dockerfile`, `compose.yaml`, and `nginx.conf` unchanged.
- Reuse `site/logo.webp`; do not add stock, AI-generated, or merchandise photographs.
- Use `#011627`, `#FDFFFC`, `#2EC4B6`, `#E71D36`, and `#FF9F1C` as the visual palette.
- The only public routes are `/`, `/contact/`, and `/terms/`.
- Contact mail must target `merchendices@gmail.com` and include every requested field.
- JavaScript must enhance the site; HTML content and navigation remain usable without it.

## Review Focus

- A 320px viewport must not clip headings, controls, or the logo — browser overflow test in Task 3.
- The cookie dialog must be reachable from both the first-visit banner and footer settings button — consent interaction test in Task 3.
- Empty contact fields must not create a mailto URL, while valid fields must preserve multiline content — contact unit test in Task 2.
- The old routes and motion/demo assets must not survive the replacement — route inventory test in Task 1.
- Docker/Nginx configuration must remain identical — `git diff -- Dockerfile compose.yaml nginx.conf` check in Task 4.

---

### Task 1: Pin the replacement contract with failing tests

**Files:**
- Modify: `tests/site.test.mjs`
- Modify: `tests/contact.test.mjs`
- Modify: `scripts/check-site.mjs`
- Modify: `scripts/check-browser.mjs`

**Interfaces:**
- Tests define the required three-route inventory, palette tokens, legal/cookie markup, contact fields, and absence of removed page assets.

- [ ] **Step 1: Write failing assertions**

  Replace assumptions about five routes and the old process with assertions for exactly `/`, `/contact/`, and `/terms/`; require `merchendices@gmail.com`, all seven contact inputs, cookie settings, terms headings, the five palette values, and the preserved logo. Add assertions that `site/about`, `site/services`, `site/stores`, `site/motion-core.js`, and generated merchandise files do not exist.

- [ ] **Step 2: Run the focused suite to verify RED**

  Run: `node --test tests/site.test.mjs tests/contact.test.mjs`

  Expected: FAIL because the current site still exposes the old routes and does not have the new terms/contact contract.

- [ ] **Step 3: Update browser expectations**

  Make the browser checker visit only `/`, `/contact/`, and `/terms/`; check the new no-overflow and no-JavaScript baselines, cookie settings visibility, and contact route reachability.

### Task 2: Build the new semantic pages and contact mail flow

**Files:**
- Replace: `site/index.html`
- Replace: `site/contact/index.html`
- Create: `site/terms/index.html`
- Replace: `site/contact.js`

**Interfaces:**
- `contact.js` reads `form[data-contact-form]`, validates required `name`, `email`, and `message`, then assigns `window.location.href` to a `mailto:merchendices@gmail.com` URL containing labels for all fields.

- [ ] **Step 1: Add the three page shells**

  Use shared header/footer links, a skip link, a logo image at `/logo.webp`, and one semantic `<main>` per route. Keep the homepage to a hero, one offer section, one CSS-built workflow visual, and one contact CTA.

- [ ] **Step 2: Add the contact form fields**

  Include labeled inputs named `name`, `email`, `youtube`, `instagram`, `tiktok`, `otherPlatforms`, and `message`; use `required` only on name, email, and message. Add a clear status region for validation.

- [ ] **Step 3: Add terms content and cookie entry points**

  Add sections for scope, approvals, production/payment, shipping, intellectual property, privacy/cookies, and contact. Put “Cookie settings” in every footer and include the consent mount point in each page.

- [ ] **Step 4: Implement the mailto formatter**

  Validate required fields, encode a subject containing “Merchendices creator enquiry”, and encode a body with every field label plus a blank-safe fallback. Do not call a server.

- [ ] **Step 5: Run the focused tests**

  Run: `node --test tests/site.test.mjs tests/contact.test.mjs`

  Expected: PASS for content and contact behavior; visual tests remain pending until styles are replaced.

### Task 3: Add the focused visual system and consent behavior

**Files:**
- Replace: `site/styles.css`
- Replace: `site/cookie-consent.js`
- Create: `site/site.js`

**Interfaces:**
- CSS exposes `--midnight`, `--paper`, `--teal`, `--red`, and `--amber` and styles the three routes responsively.
- `cookie-consent.js` exposes a banner, modal settings dialog, `localStorage` key `merchendices-cookie-choice`, and buttons with `data-cookie-accept`, `data-cookie-reject`, and `data-cookie-settings`.

- [ ] **Step 1: Implement layout tokens and page surfaces**

  Build sharp, compact panels with a midnight header, paper reading surface, teal/amber visual accents, and red CTA buttons. Use grid/flex layouts that collapse at 700px and avoid fixed-width content.

- [ ] **Step 2: Implement intuitive CSS visuals**

  Create the workflow visual from borders, dots, lines, and the logo rather than images. Add only restrained hover/reveal transitions and disable them under reduced motion.

- [ ] **Step 3: Implement cookie consent**

  Show the banner only when no choice is stored; keep optional analytics disabled and undisclosed as a non-loading preference. The settings dialog must close via cancel/close and persist the selected choice.

- [ ] **Step 4: Implement shared progressive enhancement**

  `site.js` adds a small menu toggle for narrow screens and a reveal class only when IntersectionObserver exists. It must not delay native navigation or hide page content when scripts fail.

- [ ] **Step 5: Run browser checks**

  Run: `node scripts/check-browser.mjs`

  Expected: PASS for 320, 390, 768, and 1440px layouts, contrast, cookie controls, contact navigation, and no-JavaScript content.

### Task 4: Remove obsolete implementation and verify deployment boundary

**Files:**
- Delete: `site/about/index.html`
- Delete: `site/services/index.html`
- Delete: `site/stores/index.html`
- Delete: `site/motion-core.js`
- Delete: any old generated artwork files if present
- Modify: `README.md`

**Interfaces:**
- The Docker image still copies `site/` into Nginx and exposes the same port; no config contract changes.

- [ ] **Step 1: Delete old site-only assets**

  Remove the old route directories and motion module after the replacement pages no longer import them. Leave the logo, Dockerfile, compose file, and Nginx config intact.

- [ ] **Step 2: Update the README**

  Document the three routes, local Docker commands, mailto behavior, cookie settings, and terms page.

- [ ] **Step 3: Run the complete verification**

  Run:

  ```powershell
  node --test tests/*.test.mjs
  node scripts/check-site.mjs
  node scripts/check-browser.mjs
  git diff -- Dockerfile compose.yaml nginx.conf
  git diff --check
  ```

  Expected: all tests pass, the site validator reports three HTML documents, the browser checker passes all viewport checks, the Docker/Nginx diff is empty, and whitespace validation is clean.

- [ ] **Step 4: Commit the replacement**

  ```powershell
  git add README.md scripts site tests
  git commit -m "feat: rebuild merchendices static site"
  git push origin main
  ```
