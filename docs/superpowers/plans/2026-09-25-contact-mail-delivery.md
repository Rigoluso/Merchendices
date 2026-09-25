# Contact mail delivery Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the contact page's local `mailto:` handoff with a secure Dockerized API that sends enquiries from `merchendices@gmail.com` through Gmail SMTP.

**Architecture:** Keep the existing unprivileged Nginx container for static files and proxy `/api/contact` over the Compose network to a private Node `mail-api` service. The API validates JSON, applies a honeypot and in-memory rate limit, and uses Nodemailer with a Gmail App Password injected from a server-only `.env` file.

**Tech Stack:** Static HTML/CSS/ES modules, Node 22 HTTP server, Nodemailer Gmail SMTP, Docker Compose, Nginx 1.27 Alpine, Node test runner.

**Spec:** `docs/superpowers/specs/2026-09-25-contact-mail-delivery-design.md`

## Global Constraints

- Gmail requires 2-Step Verification and a Google App Password; the normal account password must not be used.
- `.env` is ignored by Git and should be permissioned `600` on the server.
- No mail API port is exposed publicly; only Nginx can reach it over the Compose network.
- The API accepts same-origin requests and rejects disallowed `Origin` headers.
- Compose manages both containers, including restart policy and health checks.
- Form submissions send `from: merchendices@gmail.com`, `to: merchendices@gmail.com`, and `replyTo` as the submitted creator email.

## Review Focus

- Invalid or missing required fields must return a useful 400 response and never call SMTP; covered by Task 2 API validation tests.
- A non-empty honeypot must be rejected without sending; covered by Task 2 spam-control test.
- A disallowed `Origin` must receive 403 while same-origin requests continue; covered by Task 2 request-boundary test.
- A transport failure must return a generic 502 without exposing credentials or SMTP internals; covered by Task 2 failure-path test.
- The browser must stay on `/contact/` and show inline success/error states instead of navigating to a mail client; covered by Task 1 browser-facing module test and Task 3 static assertions.

### Task 1: Replace the frontend mailto flow

**Files:**
- Modify: `site/contact.js`
- Modify: `site/contact/index.html`
- Test: `tests/contact.test.mjs`

**Interfaces:**
- Produces `buildContactPayload(values)` returning `{ name, email, youtube, instagram, tiktok, otherPlatforms, message, website }` with trimmed values.
- Produces `validateContactValues(values)` returning `{ valid, missing }` for required `name`, `email`, and `message`.
- The browser submits JSON to `POST /api/contact` and handles `{ ok: true }` or `{ error: string }` responses.

- [ ] **Step 1: Write the failing frontend tests**

Replace the mailto assertions with tests that import `buildContactPayload` and `validateContactValues`, assert all seven creator fields plus `website` are retained/trimmed, assert invalid email/missing required fields are rejected, and assert no generated value contains `mailto:`.

- [ ] **Step 2: Run the contact tests to verify they fail**

Run: `node --test tests/contact.test.mjs`

Expected: FAIL because `buildContactPayload` and `validateContactValues` do not exist and the current module still builds a `mailto:` URL.

- [ ] **Step 3: Implement the minimal browser submission flow**

In `site/contact.js`, add the two exported pure helpers, replace `window.location.href` with:

```js
const response = await fetch("/api/contact", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(buildContactPayload(values)),
});
const result = await response.json();
if (!response.ok) throw new Error(result.error || "Unable to send your enquiry.");
status.textContent = "Message sent. We will reply by email.";
```

Keep the existing required-field focus behavior, show `Sending…` while waiting, show a generic error on network/API failure, and never navigate away from the page. Add a visually hidden `website` input to `site/contact/index.html`, change the explanatory copy from “opens an email” to “sends your enquiry”, and change the button label from “Prepare email” to “Send enquiry”.

- [ ] **Step 4: Run the contact tests to verify they pass**

Run: `node --test tests/contact.test.mjs`

Expected: PASS with no `mailto:` references in the module.

- [ ] **Step 5: Commit the frontend slice**

```sh
git add site/contact.js site/contact/index.html tests/contact.test.mjs
git commit -m "feat: submit contact enquiries to mail api"
```

### Task 2: Build and test the private mail API

**Files:**
- Create: `mail-api/package.json`
- Create: `mail-api/Dockerfile`
- Create: `mail-api/server.mjs`
- Create: `tests/mail-api.test.mjs`

**Interfaces:**
- `validateSubmission(payload)` returns `{ ok: true, value }` or `{ ok: false, status, error }`.
- `buildMessage(value, { from, to })` returns Nodemailer mail options with `from`, `to`, `replyTo`, `subject`, and plain-text `text`.
- `createMailServer({ transport, env, rateLimiter })` returns a Node HTTP server for `/healthz` and `POST /contact`.

- [ ] **Step 1: Write failing API tests**

Create tests using Node's built-in `http` client and a fake `transport.sendMail` function. Cover: health response, successful valid submission and exact mail fields, missing/invalid required fields returning 400 without sending, honeypot returning 400, disallowed origin returning 403, rate-limit returning 429, and transport rejection returning generic 502.

- [ ] **Step 2: Run the API tests to verify they fail**

Run: `node --test tests/mail-api.test.mjs`

Expected: FAIL because `mail-api/server.mjs` does not exist.

- [ ] **Step 3: Implement the minimal API**

Add `mail-api/package.json` with a pinned Nodemailer dependency and `start` script. Implement `server.mjs` with a 32 KiB JSON body limit, `GET /healthz`, `POST /contact`, origin checking against `ALLOWED_ORIGIN` (allowing missing Origin for command-line health/testing), required-field/email validation, honeypot rejection, a five-submissions-per-IP/ten-minute limiter, and generic JSON errors. Create the Gmail transporter only in the runtime entrypoint using `SMTP_USER` and `SMTP_APP_PASSWORD`, and set `from` to `SMTP_USER`, `to` to `MAIL_TO`, and `replyTo` to the submitted email.

- [ ] **Step 4: Add the non-root API image**

Use `node:22-alpine`, copy `package*.json`, run `npm ci --omit=dev`, copy `server.mjs`, set `USER node`, expose `3000`, and run `node server.mjs`.

- [ ] **Step 5: Run the API tests to verify they pass**

Run: `node --test tests/mail-api.test.mjs`

Expected: PASS for all validation, security, success, and failure cases.

- [ ] **Step 6: Commit the API slice**

```sh
git add mail-api tests/mail-api.test.mjs
git commit -m "feat: add private gmail contact api"
```

### Task 3: Wire Compose and Nginx

**Files:**
- Modify: `compose.yaml`
- Modify: `nginx.conf`
- Modify: `.gitignore`
- Modify: `tests/site.test.mjs`

**Interfaces:**
- Compose service `mail-api` builds from `./mail-api`, exposes only internal `3000`, reads `SMTP_USER`, `SMTP_APP_PASSWORD`, `MAIL_TO`, and `ALLOWED_ORIGIN`, and has a health check.
- Nginx serves exact same-origin `POST /api/contact` by proxying to `http://mail-api:3000/contact`.

- [ ] **Step 1: Write failing wiring assertions**

Extend `tests/site.test.mjs` to assert Compose contains `mail-api`, `SMTP_APP_PASSWORD`, no `ports` entry under `mail-api`, Nginx contains `/api/contact`, `proxy_pass http://mail-api:3000/contact`, and the contact HTML contains no `mailto:` copy.

- [ ] **Step 2: Run the site tests to verify they fail**

Run: `node --test tests/site.test.mjs`

Expected: FAIL because Compose and Nginx currently contain only the static service and the contact page still describes the mail client.

- [ ] **Step 3: Implement Compose and Nginx wiring**

Add the `mail-api` service with `restart: unless-stopped`, environment variables, internal `expose: ["3000"]`, and a Node health check. Add an Nginx exact location with proxy headers, `proxy_http_version 1.1`, and `client_max_body_size 32k`. Add `.env` and `.env.*` to `.gitignore` while leaving `.env.example` trackable.

- [ ] **Step 4: Run wiring tests and Compose validation**

Run: `node --test tests/site.test.mjs` and `docker compose config --quiet`

Expected: both exit 0; Compose will read the variable names without publishing the mail API port.

- [ ] **Step 5: Commit the infrastructure slice**

```sh
git add compose.yaml nginx.conf .gitignore tests/site.test.mjs
git commit -m "feat: proxy contact submissions to private mail api"
```

### Task 4: Document server setup and run full verification

**Files:**
- Create: `.env.example`
- Modify: `README.md`
- Modify: `package.json`
- Modify: `scripts/check-site.mjs`

**Interfaces:**
- `.env.example` documents non-secret variable names and defaults without containing a credential.
- README documents Google App Password creation, server `.env` permissions, Compose commands, health checks, and the fact that the normal Gmail password must not be used.

- [ ] **Step 1: Add static regression checks**

Update `scripts/check-site.mjs` to inspect `site/contact.js` and fail if `mailto:` or `window.location` is present, and inspect `nginx.conf` for `/api/contact` proxy wiring.

- [ ] **Step 2: Run static checks to verify the new assertions fail if wiring is incomplete**

Run: `node scripts/check-site.mjs`

Expected: PASS after Task 1 and Task 3 are present; if any old mailto reference remains, the checker fails with its file path.

- [ ] **Step 3: Add deployment documentation and environment template**

Document:

```dotenv
SMTP_USER=merchendices@gmail.com
SMTP_APP_PASSWORD=replace-with-16-character-google-app-password
MAIL_TO=merchendices@gmail.com
ALLOWED_ORIGIN=https://merchendice.com
```

Include server commands `cp .env.example .env`, `chmod 600 .env`, `docker compose up -d --build`, `docker compose ps`, `curl http://127.0.0.1:82/api/healthz`, `docker compose logs -f mail-api`, and `docker compose stop/start`. Explicitly say `.env` must never be committed.

- [ ] **Step 4: Run the complete verification suite**

Run: `node --test`, `node scripts/check-site.mjs`, and `docker compose config --quiet`.

Expected: all Node tests pass, the static validator reports three HTML documents and no broken references, and Compose exits successfully.

- [ ] **Step 5: Build the images without cache**

Run: `docker compose build --no-cache`

Expected: both `merchendice` and `mail-api` images build successfully.

- [ ] **Step 6: Commit the documentation and verification slice**

```sh
git add .env.example README.md package.json scripts/check-site.mjs
git commit -m "docs: document gmail contact deployment"
```

- [ ] **Step 7: Push the completed work to main**

```sh
git push origin main
```
