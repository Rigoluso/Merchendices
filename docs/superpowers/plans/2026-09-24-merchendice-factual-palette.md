# Merchendice Factual Palette Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace slogan-like marketing copy and make all five approved palette colors visibly structure the Merchendice site.

**Architecture:** Keep the existing dependency-free three-route static site. Update shared page copy and the shared stylesheet while preserving the existing JavaScript modules and Docker/Nginx boundary.

**Tech Stack:** Semantic HTML, vanilla CSS, browser JavaScript modules, Node built-in tests, Nginx Docker image.

**Spec:** `docs/superpowers/specs/2026-09-24-merchendice-factual-palette-design.md`

## Global Constraints

- Preserve `Dockerfile`, `compose.yaml`, `nginx.conf`, `site/logo.webp`, contact mail behavior, cookie settings, and terms content.
- Use `#011627`, `#FDFFFC`, `#2EC4B6`, `#E71D36`, and `#FF9F1C` visibly in the stylesheet.
- Keep `/`, `/contact/`, and `/terms/` responsive from 320px upward.
- Do not add stock, AI-generated, or merchandise photography.

## Review Focus

- Removed slogans must not remain in page copy; pinned by `tests/site.test.mjs`.
- Every approved color must be used in CSS; pinned by `tests/site.test.mjs`.
- Equal service cards must not overflow narrow viewports; pinned by the existing browser checker.
- Contact, cookie, and terms routes must continue to work; pinned by existing unit/browser checks.

### Task 1: Pin the factual copy and palette contract

**Files:** Modify `tests/site.test.mjs`.

- [ ] Add a failing test that requires factual headings and rejects the removed slogan phrases.
- [ ] Add a failing test that requires all five exact palette values in `site/styles.css`.
- [ ] Run `node --test tests/site.test.mjs` and confirm the new assertions fail against the current copy.

### Task 2: Rebuild the shared homepage presentation

**Files:** Modify `site/index.html`, `site/contact/index.html`, `site/terms/index.html`, `site/styles.css`.

- [ ] Replace hero, service, process, and CTA copy with direct descriptions.
- [ ] Give the three service cards Teal, Red, and Amber surfaces and keep equal columns.
- [ ] Add a Paper process surface with Teal and Amber markers and a Red contact panel.
- [ ] Keep the logo, links, forms, cookie mount points, and legal sections intact.
- [ ] Run unit tests and the static route validator.

### Task 3: Verify the rebuilt site and deployment boundary

**Files:** Modify none beyond tests if needed.

- [ ] Run `node --test tests/*.test.mjs`.
- [ ] Run `node scripts/check-site.mjs` and the available responsive browser preview/checks.
- [ ] Confirm `git diff -- Dockerfile compose.yaml nginx.conf` is empty.
- [ ] Commit and push the finished change to `main`.
