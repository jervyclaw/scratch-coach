// Shared helpers for running course scripts in the real Scratch 3 runtime.
"use strict";
const path = require("node:path");
const fs = require("node:fs");
const { buildProject } = require("./translate.js");

const HARNESS = "file://" + path.join(__dirname, "harness.html");
const INSTALLED = fs.existsSync(path.join(__dirname, "node_modules", "scratch-vm", "dist", "web", "scratch-vm.js"));
let chromium = null;
try { ({ chromium } = require("playwright")); } catch (e) { chromium = null; }

const SKIP = !INSTALLED ? "engine not installed: run `npm --prefix tests/scratch-engine install`" : !chromium ? "playwright not installed" : false;

async function launch() {
  return chromium.launch({ args: ["--use-gl=swiftshader", "--enable-webgl", "--ignore-gpu-blocklist"] });
}

/** Open the harness and load a project built from a spec. Returns an engine handle. */
async function openEngine(browser, spec) {
  const page = await browser.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto(HARNESS);
  const { project, assets } = buildProject(spec);
  await page.evaluate(([p, a]) => window.SE.load(p, a), [project, assets]);
  const E = {
    page, errors,
    flag: () => page.evaluate(() => window.SE.greenFlag()),
    stop: () => page.evaluate(() => window.SE.stopAll()),
    key: (k, down) => page.evaluate(([k2, d]) => window.SE.key(k2, d), [k, down]),
    release: () => page.evaluate(() => window.SE.releaseAll()),
    setPos: (n, x, y) => page.evaluate(([a, b, c]) => window.SE.setPos(a, b, c), [n, x, y]),
    setVar: (n, v) => page.evaluate(([a, b]) => window.SE.setVar(a, b), [n, v]),
    state: () => page.evaluate(() => window.SE.state()),
    sprite: (n) => page.evaluate((x) => window.SE.sprite(x), n),
    vars: () => page.evaluate(() => window.SE.globals()),
    sleep: (ms) => page.waitForTimeout(ms),
    /** Wait until fn(state) is true. fn is serialized, so it must be self-contained. */
    until: async (fn, timeout = 4000) => {
      await page.waitForFunction((src) => (0, eval)("(" + src + ")")(window.SE.state()), fn.toString(), { timeout, polling: 16 });
      return page.evaluate(() => window.SE.state());
    },
    /** Hold a key until fn(state) is true, then release it. */
    holdUntil: async (k, fn, timeout = 4000) => {
      await E.key(k, true);
      try { return await E.until(fn, timeout); } finally { await E.key(k, false); }
    },
    /** Hold a key for ms milliseconds while sampling a sprite; returns the samples. */
    holdSample: async (k, ms, name) => {
      await E.key(k, true);
      const samples = await page.evaluate(async ([n, dur]) => {
        const out = [];
        const t0 = performance.now();
        while (performance.now() - t0 < dur) { out.push(window.SE.sprite(n)); await new Promise((r) => setTimeout(r, 16)); }
        return out;
      }, [name, ms]);
      await E.key(k, false);
      return samples;
    },
    close: () => page.close(),
  };
  return E;
}

/** Copy lines, replacing a placeholder "go to x: (0) y: (0)" with real coordinates. */
function withGoto(lines, x, y) {
  return lines.map((l) => (l.en === "go to x: (0) y: (0)" ? { ...l, en: `go to x: (${x}) y: (${y})` } : l));
}
/** Copy lines, dropping lines whose English text matches re (used for "what if" experiments). */
function without(lines, re) { return lines.filter((l) => !re.test(l.en)); }

module.exports = { SKIP, launch, openEngine, withGoto, without };
