# Creator Supply Landing Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a maximalist, animated Creator Supply landing page that progressively introduces color, includes three original merchandise images, and runs as a static site in Docker with Nginx.

**Architecture:** Use a dependency-free static site under `public/` so the same assets can be opened by a development server or copied directly into an Nginx image. Keep page structure in semantic HTML, visual direction and responsive behavior in one stylesheet, and progressive enhancement in small JavaScript modules whose pure functions can be tested with Node's built-in test runner.

**Tech Stack:** HTML5, CSS, ES modules, Node.js built-in test runner, Docker, Nginx Alpine

**Spec:** `docs/superpowers/specs/2026-09-16-creator-supply-landing-design.md`

## Global Constraints

- The first viewport is black, charcoal, grey, and white; color enters in discrete animated stages rather than a continuous page gradient.
- Include three original merchandise images with no third-party branding and no text baked into the images.
- Represent design, storefront creation, fulfillment, and shipping accurately without invented performance metrics or customer claims.
- Provide useful keyboard behavior, visible focus states, reduced-motion behavior, and a readable mobile layout without horizontal overflow.
- Do not invent contact information, customer logos, legal links, social accounts, testimonials, or financial figures.
- The final deliverable must build and run from the included Dockerfile with Nginx.

---

### Task 1: Static Shell and Docker Contract

**Files:**
- Create: `package.json`
- Create: `tests/site-structure.test.mjs`
- Create: `public/index.html`
- Create: `public/styles.css`
- Create: `public/favicon.svg`
- Create: `Dockerfile`
- Create: `nginx.conf`
- Create: `.dockerignore`

**Interfaces:**
- Consumes: the approved design specification.
- Produces: a static document served from `/usr/share/nginx/html`, with stable section IDs `top`, `services`, `process`, `work`, `model`, and `start`.

- [ ] **Step 1: Write the failing shell test**

```js
import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

test("the landing page exposes the complete navigation contract", async () => {
  const html = await readFile(new URL("../public/index.html", import.meta.url), "utf8");
  for (const id of ["top", "services", "process", "work", "model", "start"]) {
    assert.match(html, new RegExp(`id=["']${id}["']`));
  }
  assert.match(html, /Creator Supply/);
  assert.match(html, /prefers-reduced-motion/);
});
```

- [ ] **Step 2: Run the test and confirm the expected missing-file failure**

Run: `node --test tests/site-structure.test.mjs`
Expected: FAIL with `ENOENT` for `public/index.html`.

- [ ] **Step 3: Implement the minimal shell and deployment files**

Create semantic section landmarks, stylesheet and module-script references, a compact favicon, a static `package.json` test script, `nginx.conf` with SPA-safe fallback and cache headers, and a `Dockerfile` that copies `public/` into `nginx:1.27-alpine`.

- [ ] **Step 4: Run the shell test**

Run: `npm test`
Expected: PASS for the navigation contract.

- [ ] **Step 5: Commit the shell**

```bash
git add package.json tests/site-structure.test.mjs public/index.html public/styles.css public/favicon.svg Dockerfile nginx.conf .dockerignore
git commit -m "feat: add static Creator Supply shell"
```

### Task 2: Complete Narrative and Color-Ignition Visual System

**Files:**
- Modify: `tests/site-structure.test.mjs`
- Modify: `public/index.html`
- Modify: `public/styles.css`

**Interfaces:**
- Consumes: the stable section IDs from Task 1.
- Produces: service cards with `data-service`, process stages with `data-stage`, work cards with `data-project`, and scroll-reveal elements with `data-reveal`.

- [ ] **Step 1: Add failing content and visual-contract tests**

```js
test("the page explains every responsibility and staged color system", async () => {
  const html = await readFile(new URL("../public/index.html", import.meta.url), "utf8");
  const css = await readFile(new URL("../public/styles.css", import.meta.url), "utf8");
  for (const phrase of ["Design", "Storefront", "Production", "Worldwide shipping", "Zero setup fee"]) {
    assert.match(html, new RegExp(phrase, "i"));
  }
  assert.equal((html.match(/data-service=/g) ?? []).length, 4);
  assert.equal((html.match(/data-stage=/g) ?? []).length, 4);
  assert.equal((html.match(/data-project=/g) ?? []).length, 3);
  for (const token of ["--acid", "--violet", "--orange", "--cyan"]) assert.match(css, new RegExp(token));
});
```

- [ ] **Step 2: Run the focused test and confirm missing narrative failures**

Run: `node --test --test-name-pattern="responsibility|color" tests/site-structure.test.mjs`
Expected: FAIL because the minimal shell lacks the required service, process, work, and palette contracts.

- [ ] **Step 3: Implement the complete semantic page and responsive visual system**

Build the hero, four service cards, sticky four-stage process, three-project gallery, operating-model comparison, closing invitation, and footer. Apply a black-to-color section rhythm using distinct colored panels, borders, bands, and masks. Include desktop, tablet, and mobile rules, visible focus styles, and coarse-pointer safeguards.

- [ ] **Step 4: Run all static contract tests**

Run: `npm test`
Expected: PASS for shell and narrative tests.

- [ ] **Step 5: Commit the complete static composition**

```bash
git add tests/site-structure.test.mjs public/index.html public/styles.css
git commit -m "feat: build color-ignition landing page"
```

### Task 3: Tested Motion Core and Progressive Interactions

**Files:**
- Create: `tests/motion-core.test.mjs`
- Create: `public/motion-core.mjs`
- Create: `public/script.js`
- Modify: `public/index.html`
- Modify: `public/styles.css`

**Interfaces:**
- Produces: `clamp(value, min, max): number`, `stageForProgress(progress): 0 | 1 | 2 | 3 | 4`, and `motionAllowed(reducedMotion, coarsePointer): boolean`.
- Consumes: `[data-reveal]`, `[data-stage]`, `[data-tilt]`, `[data-menu-toggle]`, and `[data-menu]` hooks from the document.

- [ ] **Step 1: Write failing pure-function tests**

```js
import test from "node:test";
import assert from "node:assert/strict";
import { clamp, stageForProgress, motionAllowed } from "../public/motion-core.mjs";

test("stageForProgress maps scroll progress to five stable stages", () => {
  assert.deepEqual([0, 0.24, 0.25, 0.5, 0.75, 1].map(stageForProgress), [0, 0, 1, 2, 3, 4]);
});

test("motion is disabled for reduced motion or coarse pointers", () => {
  assert.equal(motionAllowed(false, false), true);
  assert.equal(motionAllowed(true, false), false);
  assert.equal(motionAllowed(false, true), false);
});

test("clamp bounds values", () => {
  assert.equal(clamp(-1, 0, 1), 0);
  assert.equal(clamp(2, 0, 1), 1);
});
```

- [ ] **Step 2: Run the motion tests and confirm the missing-module failure**

Run: `node --test tests/motion-core.test.mjs`
Expected: FAIL with module-not-found for `public/motion-core.mjs`.

- [ ] **Step 3: Implement the pure motion helpers**

```js
export const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

export function stageForProgress(progress) {
  const bounded = clamp(progress, 0, 1);
  if (bounded >= 1) return 4;
  return Math.floor(bounded * 4);
}

export const motionAllowed = (reducedMotion, coarsePointer) => !reducedMotion && !coarsePointer;
```

- [ ] **Step 4: Run the motion tests and confirm they pass**

Run: `node --test tests/motion-core.test.mjs`
Expected: PASS for all three motion-core behaviors.

- [ ] **Step 5: Add progressive enhancement**

Use `IntersectionObserver` for reveal states, scroll progress for the process stage and header signal, pointer transforms for tilt cards only when `motionAllowed` returns true, and a keyboard-accessible mobile menu with synchronized `aria-expanded`. Ensure the document remains complete with JavaScript disabled.

- [ ] **Step 6: Run the complete test suite**

Run: `npm test`
Expected: PASS for all structure and motion tests.

- [ ] **Step 7: Commit the motion system**

```bash
git add tests/motion-core.test.mjs public/motion-core.mjs public/script.js public/index.html public/styles.css
git commit -m "feat: add progressive scroll interactions"
```

### Task 4: Original Merchandise Imagery

**Files:**
- Create: `public/assets/creator-apparel.png`
- Create: `public/assets/fulfillment-studio.png`
- Create: `public/assets/complete-collection.png`
- Modify: `tests/site-structure.test.mjs`
- Modify: `public/index.html`
- Modify: `public/styles.css`

**Interfaces:**
- Consumes: the three `[data-project]` cards created in Task 2.
- Produces: three locally served images with explicit dimensions and descriptive alternative text.

- [ ] **Step 1: Add a failing local-image contract test**

```js
test("all three example projects use local descriptive images", async () => {
  const html = await readFile(new URL("../public/index.html", import.meta.url), "utf8");
  for (const name of ["creator-apparel.png", "fulfillment-studio.png", "complete-collection.png"]) {
    assert.match(html, new RegExp(`/assets/${name}`));
    await readFile(new URL(`../public/assets/${name}`, import.meta.url));
  }
  assert.equal((html.match(/<img[^>]+alt=["'][^"']{12,}["']/g) ?? []).length, 3);
});
```

- [ ] **Step 2: Run the focused test and confirm missing-asset failure**

Run: `node --test --test-name-pattern="local descriptive images" tests/site-structure.test.mjs`
Expected: FAIL because the three generated image files do not exist.

- [ ] **Step 3: Generate one coherent three-image editorial campaign set**

Generate: (1) monochrome-forward heavyweight hoodie and tee on a studio set with a restrained acid-green accent, (2) colorful premium fulfillment workbench with folded apparel and recyclable mailers, and (3) a maximalist complete creator collection with hoodie, cap, tee, and accessories. Use no logos, people, or baked-in text.

- [ ] **Step 4: Integrate image paths, dimensions, alt text, and responsive framing**

Use `loading="lazy"` for below-the-fold assets, fixed aspect-ratio containers, and `object-fit: cover` so layout does not jump while assets load.

- [ ] **Step 5: Run the complete test suite**

Run: `npm test`
Expected: PASS, including all local image checks.

- [ ] **Step 6: Commit the imagery**

```bash
git add public/assets tests/site-structure.test.mjs public/index.html public/styles.css
git commit -m "feat: add original merchandise imagery"
```

### Task 5: Deployment and Final Verification

**Files:**
- Modify: `tests/site-structure.test.mjs`
- Modify: `README.md`
- Modify: `Dockerfile`
- Modify: `nginx.conf`

**Interfaces:**
- Consumes: the complete `public/` site.
- Produces: an Nginx container exposing port `80`, a `/healthz` endpoint returning `200`, and concise local run instructions.

- [ ] **Step 1: Add failing deployment-contract checks**

```js
test("container configuration exposes nginx and a health endpoint", async () => {
  const dockerfile = await readFile(new URL("../Dockerfile", import.meta.url), "utf8");
  const nginx = await readFile(new URL("../nginx.conf", import.meta.url), "utf8");
  assert.match(dockerfile, /FROM nginx:1\.27-alpine/);
  assert.match(dockerfile, /EXPOSE 80/);
  assert.match(nginx, /location = \/healthz/);
  assert.match(nginx, /try_files \$uri \$uri\/ \/index\.html/);
});
```

- [ ] **Step 2: Run the deployment test and confirm the health-contract failure**

Run: `node --test --test-name-pattern="container configuration" tests/site-structure.test.mjs`
Expected: FAIL until the health endpoint and exact fallback contract are present.

- [ ] **Step 3: Finish Docker/Nginx configuration and documentation**

Add the exact health response, security headers, immutable caching for hashed or image assets, no-cache behavior for HTML, and README commands for `docker build -t creator-supply .` and `docker run --rm -p 8080:80 creator-supply`.

- [ ] **Step 4: Run fresh complete verification**

Run: `npm test`
Expected: all tests pass with zero failures.

Run: `docker build -t creator-supply .`
Expected: image build exits with code 0.

Run: `docker run --rm -d --name creator-supply-check -p 8080:80 creator-supply`
Expected: container ID is returned.

Run: `Invoke-WebRequest -UseBasicParsing http://localhost:8080/healthz`
Expected: status code 200 and body `ok`.

Run: `Invoke-WebRequest -UseBasicParsing http://localhost:8080/`
Expected: status code 200 and HTML containing `Creator Supply`.

Run: `docker stop creator-supply-check`
Expected: container stops cleanly.

- [ ] **Step 5: Commit deployment completion**

```bash
git add tests/site-structure.test.mjs README.md Dockerfile nginx.conf
git commit -m "docs: add Docker deployment workflow"
```
