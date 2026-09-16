# Creator Supply

A maximalist, animated landing page for a full-service YouTuber merchandise studio. The experience starts in monochrome and introduces electric green, violet, orange, and cyan through distinct scroll-led scenes.

## Run with Docker

```sh
docker build -t creator-supply .
docker run --rm -p 8080:8080 creator-supply
```

Open `http://localhost:8080`.

The container serves the static site through Nginx as an unprivileged user, includes a health check, compresses text assets, and applies long-lived caching to generated campaign images.

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

The closing contact panel is intentionally not connected to an external destination because no production email address or form endpoint was supplied.
