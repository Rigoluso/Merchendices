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

## Run without Docker

Serve the `site/` directory with any static file server. For example:

```sh
python -m http.server 8080 --directory site
```

## Validate

```sh
node --test tests/site.test.mjs
node scripts/check-site.mjs
```

The contact form opens a prepared message in the visitor's email client, so the static site does not collect or retain enquiry data.
