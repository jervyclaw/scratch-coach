// Browser tests (real Chromium via Playwright), loading index.html from file:// like a double-click.
// Run: node --test tests/browser.test.js   (needs the `playwright` package and a Chromium build)
"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const path = require("node:path");
const fs = require("node:fs");

let chromium;
try { ({ chromium } = require("playwright")); } catch (e) { chromium = null; }

const URL = "file://" + path.resolve(__dirname, "..", "index.html");
const KEY = "scratchCoach.v1";
const SHOTS = process.env.SHOT_DIR || null;

let browser;
test.before(async () => { if (chromium) browser = await chromium.launch(); });
test.after(async () => { if (browser) await browser.close(); });

async function open(t, opts = {}) {
  const context = await browser.newContext({ viewport: opts.viewport || { width: 1000, height: 900 } });
  const page = await context.newPage();
  const errors = [];
  const external = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("console", (m) => { if (m.type() === "error") errors.push(m.text()); });
  page.on("request", (r) => { if (!r.url().startsWith("file://") && !r.url().startsWith("data:")) external.push(r.url()); });
  if (opts.init) await page.addInitScript(opts.init);
  if (opts.clock) await page.clock.install();
  await page.goto(URL + (opts.hash || ""));
  t.after(async () => { await context.close(); });
  return { page, context, errors, external };
}
const shot = async (page, name) => { if (SHOTS) { fs.mkdirSync(SHOTS, { recursive: true }); await page.screenshot({ path: path.join(SHOTS, name + ".png"), fullPage: true }); } };
// Wait until the rendered screen matches the URL (hashchange renders right after the URL changes).
async function go(page, urlRe, h1Re) {
  await page.waitForURL(urlRe);
  if (h1Re) await page.waitForFunction((src) => { const h = document.querySelector("h1"); return h && new RegExp(src).test(h.textContent); }, h1Re.source);
}
const saved = (page) => page.evaluate((k) => JSON.parse(localStorage.getItem(k) || "null"), KEY);

const skip = !chromium ? "playwright not installed" : false;

test("home page renders, no errors, no network requests", { skip }, async (t) => {
  const { page, errors, external } = await open(t);
  await page.waitForSelector("h1");
  assert.equal(await page.locator("h1").innerText(), "Build your own adventure game!");
  assert.equal(await page.locator(".quest-map .map-item").count(), 8);
  assert.equal(await page.locator("#btn-continue").innerText(), "▶ Start Level 1");
  assert.deepEqual(errors, []);
  assert.deepEqual(external, []);
  await shot(page, "01-home-wide");
});

test("task navigation: next, tried, skip, back, stepper, finish, level up", { skip }, async (t) => {
  const { page, errors } = await open(t);
  await page.click("#btn-continue");
  await go(page, /#\/lesson\/1\/0$/, /Spawn Island/);
  await page.click("#btn-next");
  await go(page, /#\/lesson\/1\/1$/, /Pick your Hero/);
  assert.equal(await page.locator("h1").innerText(), "Pick your Hero");
  // Focus moves to the new heading for keyboard/screen-reader users.
  assert.equal(await page.evaluate(() => document.activeElement.tagName), "H1");
  await page.click("#btn-tried");
  await go(page, /#\/lesson\/1\/2$/, /Paint your level/);
  await page.click("#btn-skip");
  await go(page, /#\/lesson\/1\/3$/, /Green flag/);
  await page.click("#btn-back");
  await go(page, /#\/lesson\/1\/2$/, /Paint your level/);
  assert.match(await page.locator(".status-line.skip").innerText(), /skipped/);
  // Stepper shows tried / skipped states and lets you jump.
  assert.match(await page.locator("#stepper-1").getAttribute("class"), /is-tried/);
  assert.match(await page.locator("#stepper-2").getAttribute("class"), /is-skipped/);
  await page.click("#stepper-4");
  await go(page, /#\/lesson\/1\/4$/, /Test it/);
  assert.match(await page.locator("h1").innerText(), /Test it/);
  await page.click("#btn-next");
  await go(page, /#\/lesson\/1\/5$/, /Bonus/);
  await page.click("#btn-finish");
  await go(page, /#\/levelup\/1$/, /complete/);
  assert.equal(await page.locator("h1").innerText(), "Level 1 complete!");
  await page.click("#btn-next-level");
  await go(page, /#\/lesson\/2\/0$/, /Arrow Run/);
  const s = await saved(page);
  assert.equal(s.lessons["1"].done, true);
  assert.deepEqual(s.lessons["1"].tried, [0]);
  assert.deepEqual(s.lessons["1"].skipped, [1]);
  assert.deepEqual(errors, []);
});

test("hints open one level at a time and stay open after reload", { skip }, async (t) => {
  const { page } = await open(t, { hash: "#/lesson/3/2" });
  assert.equal(await page.locator(".hint").count(), 0);
  assert.match(await page.locator("#btn-hint").innerText(), /\(1\/3\)/);
  await page.click("#btn-hint");
  assert.equal(await page.locator(".hint").count(), 1);
  assert.match(await page.locator("#hint-1 h3").innerText(), /Hint 1 · Look closely/);
  assert.equal(await page.locator("#hint-1 .blk").count(), 0, "hint 1 shows no blocks");
  // Focus stays on the hint button so the child can press again.
  assert.equal(await page.evaluate(() => document.activeElement.id), "btn-hint");
  await page.click("#btn-hint");
  assert.equal(await page.locator(".hint").count(), 2);
  assert.match(await page.locator("#hint-2").innerText(), /Sensing/);
  assert.equal(await page.locator("#hint-2 .blk").count(), 0, "hint 2 shows no blocks");
  await page.click("#btn-hint");
  assert.equal(await page.locator(".hint").count(), 3);
  assert.ok(await page.locator("#hint-3 .blk").count() >= 2, "hint 3 shows the block order");
  assert.match(await page.locator("#hint-3").innerText(), /touching \(Lava\)\?/);
  assert.match(await page.locator("#btn-hint").innerText(), /All 3 hints/);
  await page.click("#btn-hint"); // no fourth hint
  assert.equal(await page.locator(".hint").count(), 3);
  await page.reload();
  assert.equal(await page.locator(".hint").count(), 3);
  // Hints are per step: the next step starts with none.
  await page.goto(URL + "#/lesson/3/3");
  assert.equal(await page.locator(".hint").count(), 0);
});

test("'Something's wrong' shows the level's common problems", { skip }, async (t) => {
  const { page } = await open(t, { hash: "#/lesson/4/2" });
  assert.equal(await page.locator("#problems").count(), 0);
  await page.click("#btn-trouble");
  assert.equal(await page.locator("#btn-trouble").getAttribute("aria-expanded"), "true");
  assert.ok(await page.locator(".problem").count() >= 2);
  await page.locator(".problem summary").first().click();
  assert.match(await page.locator(".problem").first().innerText(), /forever/);
  await page.click("#btn-trouble");
  assert.equal(await page.locator("#problems").count(), 0);
});

test("progress is restored after reload and 'Continue' resumes", { skip }, async (t) => {
  const { page } = await open(t, { hash: "#/lesson/5/4" });
  await page.check("#check-0");
  await page.check("#check-2");
  assert.match(await page.locator("#check-count").innerText(), /2 of 3/);
  await page.goto(URL + "#/");
  await page.reload();
  assert.equal(await page.locator("#btn-continue").innerText(), "▶ Continue: Level 5 · Checkpoint Flag");
  await page.click("#btn-continue");
  await go(page, /#\/lesson\/5\/4$/, /Test it/);
  assert.equal(await page.isChecked("#check-0"), true);
  assert.equal(await page.isChecked("#check-1"), false);
  assert.equal(await page.isChecked("#check-2"), true);
  assert.match(await page.locator(".lesson-head .chip").innerText(), /Level 5 of 8/);
});

test("language switch changes the child UI and is remembered", { skip }, async (t) => {
  const { page } = await open(t, { hash: "#/lesson/2/2" });
  assert.equal(await page.locator("h1").innerText(), "Move right and left");
  await page.click("#btn-lang");
  assert.equal(await page.locator("h1").innerText(), "向右和向左");
  assert.equal(await page.evaluate(() => document.documentElement.lang), "zh-CN");
  assert.match(await page.locator("#btn-tried").innerText(), /我试过了/);
  await page.click("#btn-hint");
  await page.click("#btn-hint");
  await page.click("#btn-hint");
  // Block names show both languages.
  const blk = await page.locator("#hint-3 .blk.cat-motion", { hasText: "change x" }).first().innerText();
  assert.match(blk, /将x坐标增加/);
  assert.match(blk, /change x by/);
  await page.reload();
  assert.equal(await page.locator("h1").innerText(), "向右和向左");
  // Parent page is always Chinese, regardless of the child language.
  await page.click("#btn-lang");
  await page.goto(URL + "#/parent");
  assert.equal(await page.locator("h1").innerText(), "家长页");
  assert.equal(await page.evaluate(() => document.documentElement.lang), "zh-CN");
});

test("parent page: clear needs confirmation (cancel, Escape, confirm)", { skip }, async (t) => {
  const { page } = await open(t, { hash: "#/lesson/1/1" });
  await page.click("#btn-tried");
  assert.ok(await saved(page));
  await page.goto(URL + "#/parent");
  assert.match(await page.locator("#p-progress").innerText(), /1 \/ 3/);
  // Cancel
  await page.click("#p-clear");
  assert.equal(await page.locator(".modal[role=dialog]").count(), 1);
  assert.equal(await page.evaluate(() => document.activeElement.id), "modal-cancel", "safe button focused first");
  await page.click("#modal-cancel");
  assert.equal(await page.locator(".modal").count(), 0);
  assert.ok(await saved(page), "data kept after cancel");
  assert.match(await page.locator("#p-msg").innerText(), /已取消/);
  // Escape
  await page.click("#p-clear");
  await page.keyboard.press("Escape");
  assert.equal(await page.locator(".modal").count(), 0);
  assert.ok(await saved(page), "data kept after Escape");
  // Confirm
  await page.click("#p-clear");
  await page.click("#modal-confirm");
  assert.equal(await saved(page), null, "localStorage key removed");
  assert.match(await page.locator("#p-msg").innerText(), /已清除/);
  assert.match(await page.locator("#p-progress").innerText(), /0 \/ 8/);
});

test("redo level asks first and only then resets that level", { skip }, async (t) => {
  const { page } = await open(t, { hash: "#/lesson/2/1" });
  await page.click("#btn-tried");
  await page.goto(URL + "#/lesson/2/5");
  await page.click("#btn-redo");
  await page.click("#modal-cancel");
  assert.deepEqual((await saved(page)).lessons["2"].tried, [0]);
  await page.click("#btn-redo");
  await page.click("#modal-confirm");
  await go(page, /#\/lesson\/2\/0$/, /Arrow Run/);
  assert.deepEqual((await saved(page)).lessons["2"].tried, []);
});

test("parent settings: language and session length are saved", { skip }, async (t) => {
  const { page } = await open(t, { hash: "#/parent" });
  await page.check("#p-lang-zh");
  await page.check("#p-min-15");
  assert.match(await page.locator("#p-msg").innerText(), /15 分钟/);
  const s = await saved(page);
  assert.equal(s.lang, "zh");
  assert.equal(s.sessionMinutes, 15);
  await page.goto(URL + "#/");
  assert.equal(await page.locator("h1").innerText(), "做一个你自己的闯关游戏！");
});

test("break reminder appears after the suggested time and can be dismissed", { skip }, async (t) => {
  const { page } = await open(t, { clock: true, init: `localStorage.setItem("${KEY}", JSON.stringify({version:1, lang:"en", sessionMinutes:15}))` });
  assert.equal(await page.locator("#banner-break").count(), 0);
  await page.clock.fastForward("16:00");
  await page.waitForSelector("#banner-break");
  assert.match(await page.locator("#banner-break").innerText(), /15 minutes/);
  assert.match(await page.locator("#timer-chip").innerText(), /16 min/);
  await page.click("#btn-dismiss-break");
  assert.equal(await page.locator("#banner-break").count(), 0);
});

test("localStorage that throws: warning shown, app still fully usable", { skip }, async (t) => {
  const init = `Object.defineProperty(window, "localStorage", { configurable: true, get() { throw new DOMException("blocked", "SecurityError"); } });`;
  const { page, errors } = await open(t, { init });
  await page.waitForSelector("#banner-storage");
  assert.match(await page.locator("#banner-storage").innerText(), /not saving progress/);
  await page.click("#btn-continue");
  await page.click("#btn-next");
  await page.click("#btn-hint");
  assert.equal(await page.locator(".hint").count(), 1);
  await page.goto(URL + "#/parent");
  assert.match(await page.locator("#p-privacy").innerText(), /无法保存/);
  await page.click("#p-clear");
  await page.click("#modal-confirm");
  assert.match(await page.locator("#p-msg").innerText(), /已清除/);
  assert.deepEqual(errors, []);
});

test("setItem failing (storage full): warning shown, no crash", { skip }, async (t) => {
  const init = `(() => { const orig = Storage.prototype.setItem; Storage.prototype.setItem = function (k, v) { if (k === "${KEY}") throw new DOMException("full", "QuotaExceededError"); return orig.call(this, k, v); }; })();`;
  const { page, errors } = await open(t, { init, hash: "#/lesson/1/1" });
  await page.waitForSelector("#banner-storage");
  assert.match(await page.locator("#banner-storage").innerText(), /could not be saved/);
  await page.click("#btn-hint");
  assert.equal(await page.locator(".hint").count(), 1);
  assert.deepEqual(errors, []);
});

test("damaged saved data: no blank page, warning, can dismiss and continue", { skip }, async (t) => {
  const { page, errors } = await open(t, { init: `if (!sessionStorage.getItem("seeded")) { localStorage.setItem("${KEY}", "{broken!!"); sessionStorage.setItem("seeded", "1"); }` });
  await page.waitForSelector("#banner-storage");
  assert.match(await page.locator("#banner-storage").innerText(), /damaged/);
  assert.equal(await page.locator("h1").innerText(), "Build your own adventure game!");
  await page.click("#btn-ack-storage");
  assert.equal(await page.locator("#banner-storage").count(), 0);
  await page.click("#map-level-4");
  await go(page, /#\/lesson\/4\/0$/, /Coin Collector/);
  assert.match(await page.locator("h1").innerText(), /Coin Collector/);
  const s = await saved(page);
  assert.equal(s.current.lesson, 4, "new valid data written over the damaged value");
  assert.deepEqual(errors, []);
});

test("every screen of all 8 levels renders without errors", { skip }, async (t) => {
  const { page, errors } = await open(t);
  const counts = await page.evaluate(() => window.SCRATCH_COACH_CONTENT.lessons.map((l) => l.steps.length + 3));
  assert.equal(counts.length, 8);
  for (let i = 0; i < counts.length; i++) {
    for (let s = 0; s < counts[i]; s++) {
      await page.goto(URL + `#/lesson/${i + 1}/${s}`);
      const h1 = await page.locator("h1").innerText();
      assert.ok(h1.trim().length > 0, `L${i + 1} screen ${s}`);
      if (await page.locator("#btn-hint").count()) {
        for (let k = 0; k < 3; k++) await page.click("#btn-hint");
        assert.equal(await page.locator(".hint").count(), 3, `L${i + 1} screen ${s} hints`);
      }
    }
    await page.goto(URL + `#/levelup/${i + 1}`);
  }
  assert.match(await page.locator("h1").innerText(), /all 8 levels/);
  // Unknown routes fall back to the map instead of a blank page.
  await page.goto(URL + "#/nope");
  assert.equal(await page.locator(".quest-map .map-item").count(), 8);
  assert.deepEqual(errors, []);
});

test("keyboard: skip link, Tab to a button, Enter activates, visible focus", { skip }, async (t) => {
  const { page } = await open(t);
  await page.keyboard.press("Tab");
  assert.equal(await page.evaluate(() => document.activeElement.className), "skip-link");
  // Tab until the Start button is focused.
  let found = false;
  for (let i = 0; i < 12; i++) {
    await page.keyboard.press("Tab");
    if (await page.evaluate(() => document.activeElement.id === "btn-continue")) { found = true; break; }
  }
  assert.ok(found, "Start button reachable by Tab");
  const outline = await page.evaluate(() => getComputedStyle(document.activeElement).outlineStyle + " " + getComputedStyle(document.activeElement).outlineWidth);
  assert.match(outline, /solid 4px/);
  await page.keyboard.press("Enter");
  await go(page, /#\/lesson\/1\/0$/, /Spawn Island/);
  // Space activates the hint button on a step.
  await page.goto(URL + "#/lesson/1/3");
  await page.focus("#btn-hint");
  await page.keyboard.press("Space");
  assert.equal(await page.locator(".hint").count(), 1);
  // Dialog keeps focus inside (Tab wraps between its two buttons).
  await page.goto(URL + "#/parent");
  await page.focus("#p-clear");
  await page.keyboard.press("Enter");
  await page.keyboard.press("Tab");
  assert.equal(await page.evaluate(() => document.activeElement.id), "modal-confirm");
  await page.keyboard.press("Tab");
  assert.equal(await page.evaluate(() => document.activeElement.id), "modal-cancel");
  await page.keyboard.press("Enter");
  assert.equal(await page.locator(".modal").count(), 0);
});

for (const width of [320, 360, 420]) {
  test(`narrow window ${width}px: no horizontal scrolling, big buttons`, { skip }, async (t) => {
    const { page } = await open(t, { viewport: { width, height: 800 } });
    const routes = ["#/", "#/lesson/2/2", "#/lesson/7/3", "#/lesson/5/4", "#/lesson/6/5", "#/parent"];
    for (const r of routes) {
      await page.goto(URL + r);
      if (await page.locator("#btn-hint").count()) { for (let k = 0; k < 3; k++) await page.click("#btn-hint"); await page.click("#btn-trouble"); }
      if (r === "#/parent") await page.click("#p-scripts summary");
      const over = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      assert.ok(over <= 0, `${r} overflows by ${over}px at ${width}px`);
      const small = await page.evaluate(() => [...document.querySelectorAll(".btn")].filter((b) => b.offsetParent && b.getBoundingClientRect().height < 44).map((b) => b.id || b.textContent));
      assert.deepEqual(small, [], `${r} buttons shorter than 44px`);
      if (width === 360) await shot(page, `narrow-360${r.replace(/[#/]+/g, "-")}`);
    }
  });
}
