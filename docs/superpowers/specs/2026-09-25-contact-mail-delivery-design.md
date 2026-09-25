# Contact mail delivery design

## Goal

Replace the contact page's `mailto:` handoff with a server-side submission flow so visitors can submit an enquiry without being redirected to Outlook or another local email application. Enquiries are sent from `merchendice@gmail.com` using Gmail SMTP and delivered to the same mailbox.

## Architecture

- The existing Nginx container continues to serve the static site on port `8080` inside Docker and host port `82` through Compose.
- A new internal `mail-api` Compose service runs a small Node HTTP server on port `3000`. It is not published to the host.
- Nginx proxies the same-origin route `/api/contact` to `mail-api`, so the browser never needs a cross-origin request and no SMTP credential reaches the frontend.
- `mail-api` uses Nodemailer with Gmail SMTP. The SMTP username, Gmail app password, recipient, and allowed origin are injected through Compose environment variables from a server-only `.env` file.

## Submission flow

1. The browser validates `name`, `email`, and `message` and sends JSON to `/api/contact`.
2. The API validates and trims all fields, rejects an occupied honeypot field, limits request size, and applies a small in-memory per-IP rate limit.
3. The API sends a plain-text message with `from: merchendice@gmail.com`, `to: merchendice@gmail.com`, and `replyTo` set to the creator's submitted email.
4. The API returns a generic success or error response. SMTP details are never returned to the browser.
5. The form shows an inline status and stays on `/contact/`.

## Security and operations

- Gmail requires 2-Step Verification and a Google App Password; the normal account password must not be used.
- `.env` is ignored by Git and should be permissioned `600` on the server.
- No mail API port is exposed publicly; only Nginx can reach it over the Compose network.
- The API accepts same-origin requests and rejects disallowed `Origin` headers.
- Compose manages both containers, including restart policy and health checks.

## Verification

- Unit tests cover frontend payload creation, client validation, API validation, and successful/error API responses using a fake transport.
- Static checks confirm that the contact page no longer references `mailto:` and that `/api/contact` is wired through Nginx.
- `docker compose config --quiet`, the complete Node test suite, the static checker, and a no-cache Compose build are run before commit.
