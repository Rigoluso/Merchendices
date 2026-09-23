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
    res.setHeader("Content-Type", ({".js":"text/javascript",".css":"text/css",".html":"text/html",".webp":"image/webp"})[path.extname(file)] || "text/plain");
    res.end(await readFile(file));
  } catch { res.writeHead(404); res.end(); }
});
await new Promise(r => server.listen(0, "127.0.0.1", r));
const origin = "http://127.0.0.1:" + server.address().port;
let browser;
try {
  browser = await chromium.launch(process.env.BROWSER_EXECUTABLE ? {executablePath:process.env.BROWSER_EXECUTABLE} : {});
  for (const width of [320, 390, 768, 1440]) {
    const page = await browser.newPage({viewport:{width,height:900}, reducedMotion:"reduce"});
    const errors = [];
    page.on("pageerror", e => errors.push(e.message));
    for (const route of ["/", "/services/", "/stores/", "/about/", "/contact/"]) {
      await page.goto(origin + route);
      const reject = page.locator("[data-cookie-reject]").first();
      if (await reject.isVisible()) await reject.click();
      const overflow = await page.evaluate(async () => {
        let failures=[];
        for(let y=0;y<document.body.scrollHeight;y+=700){
          scrollTo(0,y); await new Promise(r=>requestAnimationFrame(r));
          if(document.documentElement.scrollWidth>innerWidth+1) failures.push("page");
          for(const e of document.querySelectorAll("h1,h2,h3,p,.button")){
            if(e.closest('[aria-hidden="true"]'))continue;
            const b=e.getBoundingClientRect();
            if(b.width && b.bottom>0 && b.top<innerHeight && (b.right>innerWidth+2||b.left< -2))failures.push(e.textContent.trim());
          }
        }
        return [...new Set(failures)];
      });
      assert.deepEqual(overflow, [], width+" "+route+" overflow");
      // Audit rendered text against its solid surface, excluding decorative artwork.
      const contrast = await page.evaluate(() => {
        const rgb = s => (s.match(/[\d.]+/g)||[]).map(Number);
        const lum = c => c.slice(0,3).map(v=>{v/=255;return v<=.04045?v/12.92:((v+.055)/1.055)**2.4}).reduce((s,v,i)=>s+v*[.2126,.7152,.0722][i],0);
        const failures=[];
        for(const e of document.querySelectorAll("body *")){
          if(![...e.childNodes].some(n=>n.nodeType===3&&n.textContent.trim())||e.closest('[aria-hidden="true"],[hidden],.capability-visual,.demo-store,.deck-card')||e.disabled)continue;
          const r=e.getBoundingClientRect(),s=getComputedStyle(e);
          if(!r.width||!r.height)continue;
          let p=e,bg;
          while(p){const c=rgb(getComputedStyle(p).backgroundColor);if(c.length>=3&&(c.length===3||c[3]===1)){bg=c;break;}p=p.parentElement;}
          if(!bg)continue;
          const fg=rgb(s.color),a=lum(fg),b=lum(bg),ratio=(Math.max(a,b)+.05)/(Math.min(a,b)+.05);
          const size=parseFloat(s.fontSize),large=size>=24||(size>=18.66&&parseInt(s.fontWeight)>=700);
          if(ratio<(large?3:4.5))failures.push({text:e.textContent.trim().slice(0,65),ratio:ratio.toFixed(2)});
        }
        return failures;
      });
      assert.deepEqual(contrast, [], width+" "+route+" text contrast");
      console.log(width, route, "layout and contrast OK");
      if(route==="/"){
        if (process.env.REVIEW_DIR && [390, 1440].includes(width)) {
          await page.locator(".process-visual").screenshot({path:path.join(process.env.REVIEW_DIR, `process-${width}.png`)});
          await page.evaluate(()=>scrollTo(0,0));
          await page.screenshot({path:path.join(process.env.REVIEW_DIR, `products-${width}.png`)});
        }
        const prev=page.getByRole("button",{name:"Previous project stage",exact:true});
        const next=page.getByRole("button",{name:"Next project stage",exact:true});
        assert.equal(await prev.isDisabled(),true);
        for(let i=2;i<=4;i++){
          await next.click();
          assert.equal(await page.getByRole("progressbar").getAttribute("aria-valuenow"),String(i));
          assert.equal(await page.locator(".process-panel-title").textContent(),await page.locator(".process-stage h3").nth(i-1).textContent());
        }
        assert.equal(await next.isDisabled(),true);
        await prev.focus(); await page.keyboard.press("Enter");
        assert.equal(await page.getByRole("progressbar").getAttribute("aria-valuenow"),"3");
        await page.getByRole("button",{name:/View stage 1:/}).click();
        await page.evaluate(()=>scrollTo(0,document.body.scrollHeight));
        assert.equal(await page.getByRole("progressbar").getAttribute("aria-valuenow"),"1");
        await page.evaluate(()=>scrollTo(0,0));
        // A 400ms deadline catches the previous 820ms artificial navigation wait.
        await page.getByRole("navigation",{name:"Primary"}).getByRole("link",{name:"Services",exact:true}).click({noWaitAfter:true});
        await page.waitForURL("**/services/",{timeout:400});
      }
    }
    assert.deepEqual(errors,[], "browser errors");
    await page.close();
  }
  // Controls also work with animation enabled, and remain usable without JavaScript.
  const animated = await browser.newPage({viewport:{width:390,height:844}});
  await animated.goto(origin);
  await animated.locator("[data-cookie-reject]").first().click();
  await animated.locator("[data-process-next]").click();
  await animated.waitForTimeout(500);
  assert.equal(await animated.locator(".process-progress").getAttribute("aria-valuenow"),"2");
  assert.equal(await animated.locator(".page-curtain").count(),0);
  await animated.close();
  const fallback = await browser.newPage({javaScriptEnabled:false});
  await fallback.goto(origin);
  assert.equal(await fallback.locator(".process-stage:visible").count(),4);
  assert.equal(await fallback.locator(".process-navigation").isVisible(),false);
  await fallback.close();
  console.log("Process arrows, keyboard, direct selection, native navigation, and no-JS fallback OK");
} finally {
  await browser?.close();
  server.close();
}
