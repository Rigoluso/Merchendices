# Merchendice
A focused static site for creator-led product projects. Merchendice helps turn a product idea into a considered storefront and a clear delivery loop.

## Pages

- `/` — the focused overview
- `/contact/` — creator enquiry form
- `/terms/` — project terms and conditions

The contact form sends a creator enquiry through the private `mail-api` service to `merchendices@gmail.com`. It asks for a name, email, YouTube, Instagram, TikTok, other platforms, and a project brief. The visitor stays on the site and sees an inline delivery status.

Cookie controls store only the visitor's consent decision in local storage. Optional analytics remain off unless accepted, and the site does not currently load an analytics provider.

## Run with Docker

The static image can still be run on its own for layout-only checks:

```sh
docker build -t merchendices .
docker run --rm -p 8080:8080 merchendices
```

Open `http://localhost:8080`.

The container serves the static site through Nginx as an unprivileged user, includes a health check, compresses text assets, and applies long-lived caching to static brand assets. Contact delivery requires the Compose stack below.

## Manage with Docker Compose

The Compose stack publishes the site on host port `82`, ready for a separately managed reverse proxy such as the one serving `merchendice.com` on port 80. It also runs `mail-api` privately on the Compose network; no mail API or SMTP port is published to the host.

### Configure Gmail delivery

The sender account must have Google 2-Step Verification enabled. Create a Google App Password for `merchendices@gmail.com`; do not use the normal Gmail account password. On the server, create a private environment file from the template:

```sh
cp .env.example .env
chmod 600 .env
```

Set `SMTP_APP_PASSWORD` in `.env` to the generated 16-character App Password. Keep `.env` out of Git; it is ignored by this repository.

When migrating from a manually created container with the same name, remove it once:

```sh
docker rm -f merchendice
```

Then manage the site from this repository:

```sh
docker compose up -d --build
docker compose ps
curl http://127.0.0.1:82/api/healthz
docker compose stop
docker compose start
docker compose restart
docker compose logs -f
docker compose logs -f mail-api
docker compose down
```

The health endpoint should return `{"ok":true}`. A successful form submission is sent from `merchendices@gmail.com` to `MAIL_TO` (defaulting to the same account), with the creator's email used as `Reply-To`.

## Run without Docker

Serve the `site/` directory with any static file server. For example:

```sh
python -m http.server 8080 --directory site
```

## Validate

```sh
docker compose config --quiet
node --test
node scripts/check-site.mjs
```

The API tests use a fake mail transport, so they do not send real messages. Never commit a real `.env` or App Password.

The optional browser check requires Playwright and Chromium:

```sh
npm install --no-save --package-lock=false playwright
npx playwright install chromium
npm run check:browser
```

It checks all three routes at 320, 390, 768, and 1440 pixels, overflow safety, cookie settings, contact navigation, and the no-JavaScript content baseline. Set `PLAYWRIGHT_MODULE_PATH` or `BROWSER_EXECUTABLE` to use an existing local installation.
