import { createRequire } from "node:module";
import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import assert from "node:assert/strict";

const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_MODULE_PATH || "playwright");
const root = fileURLToPath(new URL("../site/", import.meta.url));
const server = createServer(async (req, res) => {
  try {
    let file = path.join(root, new URL(req.url, "http://localhost").pathname);
    if (!file.startsWith(root)) throw Error("Invalid path");
    if ((await stat(file)).isDirectory()) file = path.join(file, "index.html");
    res.setHeader("Content-Type", ({ ".js": "text/javascript", ".css": "text/css", ".html": "text/html", ".webp": "image/webp" })[path.extname(file)] || "text/plain");
    res.end(await readFile(file));
  } catch {
    res.writeHead(404);
    res.end();
  }
});
await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
const origin = `http://127.0.0.1:${server.address().port}`;
let browser;

try {
  browser = await chromium.launch(process.env.BROWSER_EXECUTABLE ? { executablePath: process.env.BROWSER_EXECUTABLE } : {});
  const routes = ["/", "/contact/", "/terms/"];
  for (const width of [320, 390, 768, 1440]) {
    const page = await browser.newPage({ viewport: { width, height: 900 }, reducedMotion: "reduce" });
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    for (const route of routes) {
      await page.goto(origin + route);
      const overflow = await page.evaluate(() => {
        const problems = [];
        if (document.documentElement.scrollWidth > innerWidth + 1) problems.push("page");
        for (const element of document.querySelectorAll("h1,h2,h3,p,.button,input,textarea")) {
          const box = element.getBoundingClientRect();
          if (box.width && (box.right > innerWidth + 2 || box.left < -2)) problems.push(element.textContent.trim());
        }
        return [...new Set(problems)];
      });
      assert.deepEqual(overflow, [], `${width} ${route} overflow`);
      const rails = await page.evaluate(() => [...document.querySelectorAll(".site-header, .page-wrap")].map((element) => {
        const box = element.getBoundingClientRect();
        const styles = getComputedStyle(element);
        return { left: box.left, right: box.right, paddingLeft: parseFloat(styles.paddingLeft) };
      }));
      const lefts = rails.map((rail) => rail.left);
      const rights = rails.map((rail) => rail.right);
      assert.ok(Math.max(...lefts) - Math.min(...lefts) <= 1, `${width} ${route} left rails drift`);
      assert.ok(Math.max(...rights) - Math.min(...rights) <= 1, `${width} ${route} right rails drift`);
      assert.ok(rails.every((rail) => rail.paddingLeft >= 16), `${width} ${route} gutter too narrow`);
      assert.equal(await page.locator("main").isVisible(), true, `${width} ${route} main visible`);
      assert.equal(await page.locator("[data-cookie-settings]").count() > 0, true, `${route} cookie settings`);
      console.log(width, route, "layout OK");
    }
    assert.deepEqual(errors, [], `${width} browser errors`);
    await page.close();
  }

  const cookiePage = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await cookiePage.goto(origin);
  const reject = cookiePage.locator("[data-cookie-reject]").first();
  if (await reject.isVisible()) await reject.click();
  await cookiePage.locator("[data-cookie-settings]").first().click();
  assert.equal(await cookiePage.locator("[data-cookie-dialog]").isVisible(), true, "cookie dialog opens");
  await cookiePage.locator("[data-cookie-close]").first().click();
  assert.equal(await cookiePage.locator("[data-cookie-dialog]").isVisible(), false, "cookie dialog closes");
  await cookiePage.close();

  const navigationPage = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await navigationPage.goto(origin);
  await navigationPage.getByRole("link", { name: "Contact", exact: true }).click();
  await navigationPage.waitForURL("**/contact/", { timeout: 1000, waitUntil: "commit" });
  assert.equal(await navigationPage.locator("[data-contact-form]").isVisible(), true, "contact form reachable");
  await navigationPage.close();

  const fallback = await browser.newPage({ javaScriptEnabled: false });
  await fallback.goto(origin);
  assert.equal(await fallback.locator("main").isVisible(), true, "no-JS main visible");
  await fallback.close();
  console.log("Responsive layout, cookie settings, contact navigation, and no-JS content OK");
} finally {
  await browser?.close();
  server.close();
}
