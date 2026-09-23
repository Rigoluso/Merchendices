import { existsSync, readFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import test from "node:test";
import assert from "node:assert/strict";

test("the landing page exposes the required narrative sections", () => {
  const html = readFileSync(new URL("../site/index.html", import.meta.url), "utf8");

  for (const id of ["top", "services", "process", "work", "model", "contact"]) {
    assert.match(html, new RegExp(`id=["']${id}["']`));
  }

  assert.match(html, /MERCHENDICES/);
  assert.match(html, /design/i);
  assert.match(html, /storefront/i);
  assert.match(html, /ship/i);
});

test("the Merchendices name replaces former identities everywhere", () => {
  const html = readFileSync(new URL("../site/index.html", import.meta.url), "utf8");
  const packageJson = JSON.parse(
    readFileSync(new URL("../package.json", import.meta.url), "utf8"),
  );
  const readme = readFileSync(new URL("../README.md", import.meta.url), "utf8");
  const validator = readFileSync(
    new URL("../scripts/check-site.mjs", import.meta.url),
    "utf8",
  );

  for (const content of [html, readme, validator]) {
    assert.doesNotMatch(content, /creator[ -]supply/i);
    assert.doesNotMatch(content, /\bMERX\b/i);
    assert.match(content, /merchendices/i);
  }

  assert.equal(packageJson.name, "merchendices");
});

test("the display scale stays compact while body copy remains readable", () => {
  const css = readFileSync(new URL("../site/styles.css", import.meta.url), "utf8");
  const heroMax = Number(css.match(/--display-hero-max:\s*([\d.]+)rem/)?.[1]);
  const sectionMax = Number(css.match(/--display-section-max:\s*([\d.]+)rem/)?.[1]);
  const sectionSpace = Number(css.match(/--section-space-max:\s*([\d.]+)rem/)?.[1]);

  assert.ok(heroMax > 0 && heroMax <= 7.6, `hero max is ${heroMax}rem`);
  assert.ok(sectionMax > 0 && sectionMax <= 6.4, `section max is ${sectionMax}rem`);
  assert.ok(sectionSpace > 0 && sectionSpace <= 9, `section spacing is ${sectionSpace}rem`);
  assert.match(css, /body\s*{[^}]*font-size:\s*1rem/is);
});

test("the current-page style does not hide the contact button label", () => {
  const css = readFileSync(new URL("../site/styles.css", import.meta.url), "utf8");

  assert.doesNotMatch(css, /\.site-header\s+\[aria-current=["']page["']\]/);
  assert.match(css, /\.site-header\s+nav\s+\[aria-current=["']page["']\][^{]*{[^}]*color:\s*var\(--white\)/is);
});

test("the site validator accepts navigation rooted at the deployed site", () => {
  const result = spawnSync(process.execPath, ["scripts/check-site.mjs"], {
    cwd: new URL("..", import.meta.url),
    encoding: "utf8",
  });

  assert.equal(result.status, 0, result.stderr || result.stdout);
});

test("the site validator checks every HTML route recursively", () => {
  const result = spawnSync(process.execPath, ["scripts/check-site.mjs"], {
    cwd: new URL("..", import.meta.url),
    encoding: "utf8",
  });

  assert.equal(result.status, 0, result.stderr || result.stdout);
  assert.match(result.stdout, /5 HTML documents/);
});

test("the site provides complete services, stores, about, and contact routes", () => {
  const routes = [
    ["services", "Services"],
    ["stores", "Stores"],
    ["about", "About"],
    ["contact", "Discuss your products"],
  ];
  const titles = new Set();

  for (const [route, label] of routes) {
    const url = new URL(`../site/${route}/index.html`, import.meta.url);
    assert.equal(existsSync(url), true, `/${route}/ exists`);
    const html = readFileSync(url, "utf8");
    const title = html.match(/<title>([^<]+)<\/title>/i)?.[1];
    titles.add(title);
    assert.match(html, /<meta\s+name=["']description["'][^>]+content=["'][^"']+["']/i);
    assert.equal((html.match(/<h1\b/gi) ?? []).length, 1, `/${route}/ has one h1`);
    assert.match(html, new RegExp(`href=["']/${route}/["'][^>]+aria-current=["']page["']`, "i"));
    assert.match(html, new RegExp(`>${label}\\b`, "i"));
    assert.match(html, /MERCHENDICES/);
    assert.match(html, /src=["']\/logo\.webp["']/);
    assert.match(html, /href=["']\/styles\.css["']/);
  }

  assert.equal(titles.size, routes.length);
});

test("the stores page presents three honest demonstration storefronts", () => {
  const html = readFileSync(new URL("../site/stores/index.html", import.meta.url), "utf8");

  assert.equal((html.match(/class=["'][^"']*store-showcase\b/g) ?? []).length, 3);
  assert.equal((html.match(/<p class=["']store-label["']>Demonstration store/gi) ?? []).length, 3);
  assert.match(html, /store-browser/);
  assert.doesNotMatch(html, /sales generated|conversion rate|revenue increased/i);
  assert.match(html, /not live stores or client projects/i);
});

test("the contact page publishes a direct address and a complete enquiry form", () => {
  const html = readFileSync(new URL("../site/contact/index.html", import.meta.url), "utf8");

  assert.match(html, /href=["']mailto:hello@merchendices\.com["']/i);
  assert.match(html, /data-contact-form/);
  for (const field of ["name", "email", "channel", "audience", "message"]) {
    assert.match(html, new RegExp(`name=["']${field}["']`, "i"));
  }
  assert.match(html, /data-form-status[^>]+aria-live=["']polite["']/i);
});

test("every page loads shared cookie controls and exposes settings", () => {
  const pages = [
    new URL("../site/index.html", import.meta.url),
    ...["services", "stores", "about", "contact"].map(
      (route) => new URL(`../site/${route}/index.html`, import.meta.url),
    ),
  ];

  for (const page of pages) {
    const html = readFileSync(page, "utf8");
    assert.match(html, /type=["']module["'][^>]+src=["']\/cookie-consent\.js["']/i);
    assert.match(html, /data-cookie-settings/);
  }
});

test("the page includes the complete service and process story", () => {
  const html = readFileSync(new URL("../site/index.html", import.meta.url), "utf8");

  for (const phrase of [
    "Product design",
    "Online stores",
    "Production",
    "Order fulfillment",
    "Zero setup fee",
  ]) {
    assert.match(html, new RegExp(phrase, "i"));
  }
});

test("the stylesheet defines staged accent colors without a page gradient", () => {
  const css = readFileSync(new URL("../site/styles.css", import.meta.url), "utf8");

  for (const token of ["--green", "--violet", "--orange", "--cyan"]) {
    assert.match(css, new RegExp(token));
  }

  assert.doesNotMatch(css, /body[^}]*linear-gradient/is);
});

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

test("the generated merchandise photographs are removed", () => {
  const html = readFileSync(new URL("../site/index.html", import.meta.url), "utf8");

  for (const name of ["night-shift.webp", "fulfillment.webp", "studio-pack.webp"]) {
    assert.equal(existsSync(new URL(`../site/assets/${name}`, import.meta.url)), false, name);
    assert.doesNotMatch(html, new RegExp(name.replace(".", "\\.")));
  }

  assert.doesNotMatch(html, /<img[^>]+assets\//i);
});

test("the work section uses graphic capability panels instead of product photography", () => {
  const html = readFileSync(new URL("../site/index.html", import.meta.url), "utf8");
  const css = readFileSync(new URL("../site/styles.css", import.meta.url), "utf8");

  for (const phrase of ["Identity systems", "Digital experiences", "Launch operations"]) {
    assert.match(html, new RegExp(phrase, "i"));
  }

  assert.equal((html.match(/class=["'][^"']*capability-visual/g) ?? []).length, 3);
  assert.match(css, /\.browser-shell\s*{[^}]*position:\s*absolute[^}]*inset:\s*3\.5rem 1rem 1rem/is);
});

test("the container serves the static site through unprivileged nginx", () => {
  const dockerfile = readFileSync(new URL("../Dockerfile", import.meta.url), "utf8");
  const nginx = readFileSync(new URL("../nginx.conf", import.meta.url), "utf8");

  assert.match(dockerfile, /nginx:1\.27-alpine/);
  assert.match(dockerfile, /COPY(?: --chown=\S+)? site\//);
  assert.match(dockerfile, /EXPOSE 8080/);
  assert.match(nginx, /listen\s+8080/);
  assert.match(nginx, /try_files\s+\$uri\s+\$uri\/\s+\/index\.html/);
});

test("the supplied optimized logo is used throughout the brand", () => {
  const html = readFileSync(new URL("../site/index.html", import.meta.url), "utf8");
  const logoUrl = new URL("../site/logo.webp", import.meta.url);

  assert.equal(existsSync(logoUrl), true);
  assert.equal(existsSync(new URL("../site/logo.svg", import.meta.url)), false);
  const imageSources = [...html.matchAll(/<img\b[^>]*src=["']([^"']+)["']/g)].map((match) => match[1]);
  assert.ok(imageSources.length > 0);
  assert.ok(imageSources.every((src) => src === "logo.webp"), "all brand illustrations reuse the supplied logo");
  assert.match(html, /rel=["']icon["'][^>]+href=["']logo\.webp["'][^>]+type=["']image\/webp["']/);

  const logo = readFileSync(logoUrl);
  assert.equal(logo.subarray(0, 4).toString("ascii"), "RIFF");
  assert.equal(logo.subarray(8, 12).toString("ascii"), "WEBP");
  assert.ok(logo.byteLength <= 160 * 1024, `logo is ${logo.byteLength} bytes`);
});

test("the work section presents capabilities rather than specific merchandise", () => {
  const html = readFileSync(new URL("../site/index.html", import.meta.url), "utf8");

  assert.doesNotMatch(html, /Night Shift Hoodie|Studio Pack|Handled with care/i);
  for (const phrase of ["Identity systems", "Digital experiences", "Launch operations"]) {
    assert.match(html, new RegExp(phrase, "i"));
  }
  assert.match(html, /dice/i);
});
