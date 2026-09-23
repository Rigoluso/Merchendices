# Merchendices
A compact, animated multipage website for a full-service YouTuber merchandise studio. The experience starts in monochrome and introduces electric green, violet, orange, and cyan through distinct scenes.

Merchendices partners with influencers to build their shops, design their merchandise, and handle fulfillment.

## Pages

- `/` — overview
- `/services/` — design, storefront, production, and fulfillment
- `/stores/` — three clearly labelled demonstration storefronts
- `/about/` — the operating model and process
- `/contact/` — project enquiry form and direct email

The current contact address is `hello@merchendices.com`. Replace it in `site/contact/index.html` and `site/contact.js` if the production inbox differs.

The store examples are deliberately presented as demonstrations rather than client work. Replace their copy and code-built previews with real links, screenshots, and results when those assets are available.

Cookie controls store only the visitor's consent decision in local storage. Optional analytics remain off unless accepted, and the site does not currently load an analytics provider.

## Run with Docker

```sh
docker build -t merchendices .
docker run --rm -p 8080:8080 merchendices
```

Open `http://localhost:8080`.

The container serves the static site through Nginx as an unprivileged user, includes a health check, compresses text assets, and applies long-lived caching to static brand assets.

## Manage with Docker Compose

The Compose service publishes the site on host port `82`, ready for a separately managed reverse proxy such as the one serving `merchendice.com` on port 80. It does not manage or modify other web servers or containers.

When migrating from a manually created container with the same name, remove it once:

```sh
docker rm -f merchendice
```

Then manage the site from this repository:

```sh
docker compose up -d --build
docker compose stop
docker compose start
docker compose restart
docker compose logs -f
docker compose down
```

## Run without Docker

Serve the `site/` directory with any static file server. For example:

```sh
python -m http.server 8080 --directory site
```

## Validate

```sh
docker compose config --quiet
node --test tests/site.test.mjs
node scripts/check-site.mjs
```

The contact form opens a prepared message in the visitor's email client, so the static site does not collect or retain enquiry data.

The optional browser check requires Playwright and Chromium:

```sh
npm install --no-save --package-lock=false playwright
npx playwright install chromium
npm run check:browser
```

It checks all five routes at 320, 390, 768, and 1440 pixels, text contrast on solid content surfaces, process navigation (including keyboard use), immediate page navigation, and the no-JavaScript process fallback. Set `PLAYWRIGHT_MODULE_PATH` or `BROWSER_EXECUTABLE` to use an existing local installation. Decorative example artwork is excluded from the text-contrast check and should also be reviewed visually.
