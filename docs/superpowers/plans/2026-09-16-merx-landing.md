# MERX Landing Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a complete animated MERX landing page that is served as static files by a production Nginx Docker image.

**Architecture:** A dependency-free single-page site lives in `site/` and uses semantic HTML, a focused stylesheet, and progressive-enhancement JavaScript. Generated merchandise campaign images are local assets. The root Dockerfile packages the static directory into an unprivileged Nginx runtime with a dedicated configuration for compression, caching, and SPA-safe routing.

**Tech Stack:** HTML5, CSS, vanilla JavaScript, Node.js built-in test runner, Docker, Nginx 1.27 Alpine

**Spec:** `docs/superpowers/specs/2026-09-16-merx-landing-design.md`

## Global Constraints

- Keep the implementation to one static marketing route with no database, authentication, external service, or persistent client state.
- The first viewport uses only black, graphite, grey, and white; electric green, violet, orange, and cyan enter in distinct stages further down.
- Include exactly three coherent, locally stored merchandise example images with no third-party trademarks or baked-in text.
- Use discrete scroll events, masks, stacking, and panel entrances; do not implement the page progression as one continuous background gradient.
- Preserve complete content and navigation when JavaScript or animation is unavailable.
- Implement `prefers-reduced-motion`, keyboard focus states, responsive layouts, useful alternative text, metadata, and a site-specific favicon.
- Do not invent customer names, testimonials, financial figures, legal links, social accounts, contact information, or client performance claims.
- The runtime image must serve the finished site through Nginx and expose port `8080`.

---

### Task 1: Establish the static application contract

**Files:**
- Create: `package.json`
- Create: `tests/site.test.mjs`
- Create: `site/index.html`
- Create: `site/styles.css`
- Create: `site/script.js`
- Create: `site/favicon.svg`

**Interfaces:**
- Produces: a static document with IDs `top`, `services`, `process`, `work`, `model`, and `contact`; CSS entry point `styles.css`; JavaScript entry point `script.js`.
- Consumes: the approved copy and structure from the design spec.

- [ ] **Step 1: Write the failing structure test**

```js
import { readFileSync } from "node:fs";
import test from "node:test";
import assert from "node:assert/strict";

test("the landing page exposes the required narrative sections", () => {
  const html = readFileSync(new URL("../site/index.html", import.meta.url), "utf8");
  for (const id of ["top", "services", "process", "work", "model", "contact"]) {
    assert.match(html, new RegExp(`id=["']${id}["']`));
  }
  assert.match(html, /MERX/);
  assert.match(html, /design/i);
  assert.match(html, /storefront/i);
  assert.match(html, /ship/i);
});
```

- [ ] **Step 2: Run the test and verify it fails**

Run: `node --test tests/site.test.mjs`

Expected: FAIL because `site/index.html` does not exist.

- [ ] **Step 3: Create the semantic page shell and metadata**

Create `site/index.html` with a sticky header, hero, six named page regions, footer, stylesheet link, deferred script, title `MERX — Merch, made for your channel`, a concise service description, viewport metadata, and `favicon.svg`. Every navigation control is a real anchor linked to one of the named regions.

- [ ] **Step 4: Add the initial visual tokens and progressive enhancement hook**

Define color tokens for black, graphite, white, green, violet, orange, and cyan in `site/styles.css`. Add a visually hidden skip link, visible focus states, a readable type scale, and `.js [data-reveal]` as the only hidden-at-rest reveal selector. In `site/script.js`, add the `js` class to the document root before setting up any animation.

- [ ] **Step 5: Run the structure test**

Run: `node --test tests/site.test.mjs`

Expected: PASS.

- [ ] **Step 6: Commit the application shell**

```bash
git add package.json tests/site.test.mjs site/index.html site/styles.css site/script.js site/favicon.svg
git commit -m "feat: establish MERX landing page shell"
```

### Task 2: Build the maximalist monochrome-to-color narrative

**Files:**
- Modify: `tests/site.test.mjs`
- Modify: `site/index.html`
- Modify: `site/styles.css`

**Interfaces:**
- Consumes: the section IDs and global token names created in Task 1.
- Produces: `.service-grid`, `.process-stage`, `.work-grid`, `.split-model`, `.closing-panel`, and `[data-accent]` compositions used by Task 3.

- [ ] **Step 1: Add failing content and styling assertions**

```js
test("the page includes the complete service and process story", () => {
  const html = readFileSync(new URL("../site/index.html", import.meta.url), "utf8");
  for (const phrase of [
    "We design it",
    "We build the store",
    "We make every piece",
    "We ship every order",
    "Zero setup fee",
  ]) assert.match(html, new RegExp(phrase, "i"));
});

test("the stylesheet defines staged accent colors without a page gradient", () => {
  const css = readFileSync(new URL("../site/styles.css", import.meta.url), "utf8");
  for (const token of ["--green", "--violet", "--orange", "--cyan"]) assert.match(css, new RegExp(token));
  assert.doesNotMatch(css, /body[^}]*linear-gradient/is);
});
```

- [ ] **Step 2: Run the tests and verify the new assertions fail**

Run: `node --test tests/site.test.mjs`

Expected: FAIL on missing service/process copy and composed class names.

- [ ] **Step 3: Implement the page content**

Build the hero around `Your channel. Your world. Your merch.` and a concise explanation of the free setup model. Add four service cards, four process stages, three image figure shells, the responsibility split, closing invitation, and minimal footer. Keep examples explicitly conceptual, with labels such as `Night Shift Hoodie`, `Signal Cap`, and `Studio Pack`, not purported client work.

- [ ] **Step 4: Implement the visual system**

Use oversized editorial type, rounded dark cards, inset borders, a background grid, layered frames, offset labels, and alternating asymmetric section layouts. Keep the hero monochrome. Introduce green in services, violet in process, orange in work, cyan in the operating model, and all accents in the closing section through separate blocks and borders.

- [ ] **Step 5: Add responsive layouts**

At widths below `900px`, remove sticky process positioning and reduce overlapping offsets. Below `640px`, switch all grids to one column, keep tap targets at least `44px`, and prevent decorative bands from increasing page width.

- [ ] **Step 6: Run the tests**

Run: `node --test tests/site.test.mjs`

Expected: PASS.

- [ ] **Step 7: Commit the complete static composition**

```bash
git add tests/site.test.mjs site/index.html site/styles.css
git commit -m "feat: create the color ignition landing narrative"
```

### Task 3: Add accessible scroll and pointer motion

**Files:**
- Modify: `tests/site.test.mjs`
- Modify: `site/index.html`
- Modify: `site/styles.css`
- Modify: `site/script.js`

**Interfaces:**
- Consumes: `[data-reveal]`, `[data-accent]`, `.process-stage`, and `.tilt-card` elements from Task 2.
- Produces: `setActiveStage(stageIndex: number): void`, intersection-driven `.is-visible`, `.is-active`, and `data-scroll-progress` states.

- [ ] **Step 1: Add failing motion and accessibility tests**

```js
test("motion is progressive and respects reduced-motion preferences", () => {
  const css = readFileSync(new URL("../site/styles.css", import.meta.url), "utf8");
  const js = readFileSync(new URL("../site/script.js", import.meta.url), "utf8");
  assert.match(css, /prefers-reduced-motion:\s*reduce/);
  assert.match(js, /IntersectionObserver/);
  assert.match(js, /matchMedia\(["']\(prefers-reduced-motion: reduce\)["']\)/);
});

test("interactive visuals are excluded from keyboard order", () => {
  const html = readFileSync(new URL("../site/index.html", import.meta.url), "utf8");
  assert.match(html, /aria-hidden=["']true["']/);
  assert.match(html, /aria-label=["']Primary["']/);
});
```

- [ ] **Step 2: Run the tests and verify they fail**

Run: `node --test tests/site.test.mjs`

Expected: FAIL on missing observer, reduced-motion query, and accessibility attributes.

- [ ] **Step 3: Implement reveal and process-stage state**

Create one `IntersectionObserver` for reveal nodes and another for `.process-stage` nodes. `setActiveStage(stageIndex)` updates the process canvas data attribute and active navigation marker. Use CSS transforms and clip paths for entrances; never animate content visibility in a way that prevents reading.

- [ ] **Step 4: Implement restrained pointer effects**

Enable card tilt and magnetic button offsets only when `(hover: hover) and (pointer: fine)` matches. Reset transforms on pointer leave. Clamp card rotation to `4deg` and button displacement to `8px`.

- [ ] **Step 5: Implement reduced motion**

When reduced motion is requested, do not attach pointer handlers, mark all reveal nodes visible immediately, and use CSS to reduce all animation and transition durations to `0.01ms` while preserving discrete accent colors.

- [ ] **Step 6: Run the tests**

Run: `node --test tests/site.test.mjs`

Expected: PASS.

- [ ] **Step 7: Commit motion behavior**

```bash
git add tests/site.test.mjs site/index.html site/styles.css site/script.js
git commit -m "feat: add accessible staged motion"
```

### Task 4: Generate and integrate the merchandise imagery

**Files:**
- Create: `site/assets/night-shift.webp`
- Create: `site/assets/fulfillment.webp`
- Create: `site/assets/studio-pack.webp`
- Modify: `tests/site.test.mjs`
- Modify: `site/index.html`
- Modify: `site/styles.css`

**Interfaces:**
- Consumes: the three figure shells in `#work`.
- Produces: three local `1600×1200` WebP editorial campaign assets referenced by relative URLs.

- [ ] **Step 1: Add a failing local-image contract test**

```js
import { existsSync } from "node:fs";

test("all three merchandise campaign images are local and present", () => {
  for (const name of ["night-shift.webp", "fulfillment.webp", "studio-pack.webp"]) {
    assert.equal(existsSync(new URL(`../site/assets/${name}`, import.meta.url)), true, name);
  }
});
```

- [ ] **Step 2: Run the test and verify it fails**

Run: `node --test tests/site.test.mjs`

Expected: FAIL listing the three missing image files.

- [ ] **Step 3: Generate one coherent image set**

Use a single image-generation request for three separate `4:3` editorial product photographs: a black heavyweight creator hoodie on a chrome studio chair with green rim light; folded apparel and recyclable shipping packaging on a violet/orange fulfillment table; and a coordinated hoodie, cap, and tee collection on a cyan-lit modular set. Require photoreal materials, premium campaign lighting, no people, no readable text, no logos, and consistent art direction.

- [ ] **Step 4: Inspect and save the generated assets**

Confirm that each image is merchandise-focused, contains no visible brand mark or malformed text, and shares the same lighting language. Save the selected files with the exact filenames in the interface block.

- [ ] **Step 5: Integrate responsive image markup**

Use explicit `width="1600" height="1200"`, descriptive alt text, `loading="lazy"` for below-fold images, and `object-fit: cover`. Do not apply image text overlays that reduce product visibility.

- [ ] **Step 6: Run the tests**

Run: `node --test tests/site.test.mjs`

Expected: PASS.

- [ ] **Step 7: Commit imagery**

```bash
git add site/assets site/index.html site/styles.css tests/site.test.mjs
git commit -m "feat: add MERX campaign imagery"
```

### Task 5: Package the site for Docker and Nginx

**Files:**
- Create: `Dockerfile`
- Create: `.dockerignore`
- Create: `nginx.conf`
- Create: `scripts/check-site.mjs`
- Modify: `package.json`
- Modify: `tests/site.test.mjs`
- Create: `README.md`

**Interfaces:**
- Consumes: the complete `site/` static directory.
- Produces: container image command `docker build -t merx .` and runtime command `docker run --rm -p 8080:8080 merx`.

- [ ] **Step 1: Add failing delivery tests**

```js
test("the container serves the static site through unprivileged nginx", () => {
  const dockerfile = readFileSync(new URL("../Dockerfile", import.meta.url), "utf8");
  const nginx = readFileSync(new URL("../nginx.conf", import.meta.url), "utf8");
  assert.match(dockerfile, /nginx:1\.27-alpine/);
  assert.match(dockerfile, /COPY site\//);
  assert.match(dockerfile, /EXPOSE 8080/);
  assert.match(nginx, /listen\s+8080/);
  assert.match(nginx, /try_files\s+\$uri\s+\$uri\/\s+\/index\.html/);
});
```

- [ ] **Step 2: Run the tests and verify they fail**

Run: `node --test tests/site.test.mjs`

Expected: FAIL because Docker and Nginx files do not exist.

- [ ] **Step 3: Implement the runtime image**

Use `FROM nginx:1.27-alpine`, remove the default server configuration, copy `nginx.conf`, copy `site/` into `/usr/share/nginx/html/`, switch writable runtime paths to `/tmp`, and expose `8080`. Configure `gzip`, a restrictive baseline of security headers compatible with the local scripts/styles, immutable one-year caching for `/assets/`, and no-cache HTML delivery.

- [ ] **Step 4: Add deterministic static checks**

Create `scripts/check-site.mjs` to parse local `href` and `src` values from `site/index.html`, assert every referenced local file exists, reject unfinished-work markers, and require non-empty HTML/CSS/JS files. Add `test` and `check` scripts to `package.json`.

- [ ] **Step 5: Document operation**

Document the two Docker commands above, direct static hosting from `site/`, the service scope, and the fact that the closing contact area intentionally awaits a real contact destination.

- [ ] **Step 6: Run delivery checks**

Run: `node --test tests/site.test.mjs`

Run: `node scripts/check-site.mjs`

Expected: both exit successfully.

- [ ] **Step 7: Build and smoke-test when Docker is available**

Run: `docker build -t merx .`

Run: `docker run --rm -d --name merx-test -p 8080:8080 merx`

Run: `node -e "fetch('http://127.0.0.1:8080').then(r=>{if(!r.ok)throw Error(String(r.status));return r.text()}).then(t=>{if(!t.includes('MERX'))throw Error('missing brand')})"`

Run: `docker stop merx-test`

Expected: build succeeds, the page responds with HTTP 200 and contains the brand name, and the test container stops cleanly. If Docker is not installed on the execution host, report that exact limitation after all non-Docker checks pass.

- [ ] **Step 8: Commit container delivery**

```bash
git add Dockerfile .dockerignore nginx.conf scripts/check-site.mjs package.json tests/site.test.mjs README.md
git commit -m "build: package landing page for nginx"
```

### Task 6: Final verification

**Files:**
- Modify only if verification exposes a defect.

**Interfaces:**
- Consumes: the complete site and delivery configuration.
- Produces: verification evidence for structure, asset integrity, responsive safeguards, reduced motion, and container readiness.

- [ ] **Step 1: Run the full test suite**

Run: `node --test tests/site.test.mjs`

Expected: all tests pass with zero failures.

- [ ] **Step 2: Run asset and completeness validation**

Run: `node scripts/check-site.mjs`

Expected: reports successful validation and exits `0`.

- [ ] **Step 3: Check repository whitespace and state**

Run: `git diff --check`

Run: `git status --short`

Expected: no whitespace errors; only intended uncommitted verification fixes, if any.

- [ ] **Step 4: Verify the final commit history**

Run: `git log --oneline -6`

Expected: design, shell, narrative, motion, imagery, and container-delivery commits are present.
