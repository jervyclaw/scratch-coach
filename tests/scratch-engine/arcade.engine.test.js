// Runs the Arcade reference scripts (js/content-arcade.js → lesson.reference) in the real Scratch runtime.
"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const C = require("../../js/content.js");
const { SKIP, launch, openEngine } = require("./helpers.js");

const lesson = (id) => C.lessons.find((l) => l.id === id);
const ref = (id, sprite) => lesson(id).reference.find((s) => s.sprite === sprite).blocks;
const num = Number;

let browser;
test.before(async () => { if (!SKIP) browser = await launch(); });
test.after(async () => { if (browser) await browser.close(); });

/* ───────── Level 9: Maze Escape ───────── */
const WALL = "#1f3a93";
function mazeSpec() {
  return {
    colors: { "wall color": WALL },
    stage: {
      variables: {},
      backdrop: {
        color: "#ffffff",
        rects: [
          { x: -150, y: 120, w: 12, h: 120, color: WALL }, // vertical wall right of the start (y 60..180)
          { x: -170, y: 20, w: 140, h: 12, color: WALL },  // floor below the start area (y 14..26)
        ],
      },
    },
    sprites: [
      { name: "Runner", x: 0, y: 0, w: 16, h: 16, color: "#ff8800", lines: ref(9, "Runner") },
      { name: "Exit", x: -60, y: 40, w: 20, h: 20, color: "#22aa22", lines: [] },
    ],
  };
}

test("Level 9 Maze Escape: reference scripts in scratch-vm", { skip: SKIP }, async (t) => {
  const E = await openEngine(browser, mazeSpec());
  t.after(() => E.close());

  await t.test("countdown runs in order and Runner cannot move during it", async () => {
    await E.flag();
    await E.key("right", true);
    const says = await E.page.evaluate(async () => {
      const seen = [];
      const t0 = performance.now();
      while (performance.now() - t0 < 1800) {
        const s = window.SE.sprite("Runner");
        if (s.say && seen[seen.length - 1] !== s.say) seen.push(s.say);
        await new Promise((r) => setTimeout(r, 16));
      }
      return { seen, x: window.SE.sprite("Runner").x };
    });
    await E.key("right", false);
    assert.deepEqual(says.seen, ["Ready?", "Go!"]);
    assert.equal(says.x, -210, "no movement during the countdown");
  });

  await t.test("the wall on the right blocks Runner", async () => {
    await E.until((st) => st.sprites.Runner.say === "", 3000);
    const samples = await E.holdSample("right", 900, "Runner");
    const maxX = Math.max(...samples.map((p) => p.x));
    assert.ok(maxX > -200, "Runner moved");
    assert.ok(maxX <= -160, `Runner stayed left of the wall (max x ${maxX})`);
  });

  await t.test("the floor blocks Runner going down", async () => {
    const samples = await E.holdSample("down", 1500, "Runner");
    const minY = Math.min(...samples.map((p) => p.y));
    assert.ok(minY >= 30, `Runner stayed above the floor (min y ${minY})`);
    assert.ok(minY <= 40, "Runner reached the floor");
  });

  await t.test("reaching the Exit ends the loop: I escaped!, no more moving", async () => {
    const s = await E.holdUntil("right", (st) => st.sprites.Runner.say === "I escaped!", 6000);
    const x = s.sprites.Runner.x;
    await E.key("left", true);
    await E.sleep(400);
    await E.key("left", false);
    assert.equal((await E.sprite("Runner")).x, x, "loop has ended");
  });

  await t.test("green flag starts again from the start with a new countdown", async () => {
    await E.flag();
    const s = await E.until((st) => st.sprites.Runner.say === "Ready?");
    assert.deepEqual([s.sprites.Runner.x, s.sprites.Runner.y], [-210, 150]);
  });
  assert.deepEqual(E.errors, []);
});

/* ───────── Level 10: Star Catcher ───────── */
function catcherSpec({ star = true, rock = true, starLines } = {}) {
  const sprites = [{ name: "Basket", x: 0, y: -150, w: 60, h: 16, color: "#8b5a2b", lines: ref(10, "Basket") }];
  sprites.push({ name: "Star", x: 0, y: 170, w: 20, h: 20, color: "#ffd000", localVars: { "Fall Speed": 0 }, lines: star ? (starLines || ref(10, "Star")) : [] });
  sprites.push({ name: "Rock", x: 0, y: 170, w: 20, h: 20, color: "#777777", localVars: { "Fall Speed": 0 }, lines: rock ? ref(10, "Rock") : [], visible: rock });
  return { stage: { variables: { Score: 0, Lives: 0 }, backdrop: { name: "Sky", color: "#cdeeff" }, backdrops: [{ name: "Game Over", color: "#222222" }] }, sprites };
}

// Keep the basket under (or away from) a falling sprite until a condition holds.
async function steer(E, target, mode, untilSrc, timeout = 12000) {
  return E.page.evaluate(async ([tg, md, src, to]) => {
    const until = (0, eval)("(" + src + ")");
    const t0 = performance.now();
    while (performance.now() - t0 < to) {
      const s = window.SE.state();
      if (until(s)) return { ok: true, s };
      const ty = s.sprites[tg];
      const x = md === "catch" ? ty.x : (ty.x > 0 ? -200 : 200);
      window.SE.setPos("Basket", x, -150);
      await new Promise((r) => setTimeout(r, 16));
    }
    return { ok: false, s: window.SE.state() };
  }, [target, mode, untilSrc.toString(), timeout]);
}

test("Level 10 Star Catcher: reference scripts in scratch-vm", { skip: SKIP }, async (t) => {
  await t.test("green flag: Score 0, Lives 3, each sprite sets its OWN Fall Speed", async () => {
    const E = await openEngine(browser, catcherSpec());
    await E.flag();
    const s = await E.until((st) => Number(st.vars.Lives) === 3);
    assert.equal(num(s.vars.Score), 0);
    assert.equal(num(s.sprites.Star.vars["Fall Speed"]), -3);
    assert.equal(num(s.sprites.Rock.vars["Fall Speed"]), -4);
    assert.equal(s.vars["Fall Speed"], undefined, "Fall Speed is not a global variable");
    await E.close();
  });

  await t.test("each caught Star adds exactly 1 point and restarts at the top", async () => {
    const E = await openEngine(browser, catcherSpec({ rock: false }));
    await E.flag();
    await E.until((st) => Number(st.vars.Lives) === 3 && Number(st.vars.Score) === 0);
    for (const want of [1, 2]) {
      const r = await steer(E, "Star", "catch", `(s) => Number(s.vars.Score) >= ${want}`);
      assert.ok(r.ok, "caught a star");
      await E.sleep(300);
      const s = await E.state();
      assert.equal(num(s.vars.Score), want, "exactly one point per star");
      assert.ok(s.sprites.Star.y > 100, "new star starts near the top");
    }
    await E.close();
  });

  await t.test("a missed Star goes back to the top (never stuck at the bottom)", async () => {
    const E = await openEngine(browser, catcherSpec({ rock: false }));
    await E.flag();
    const low = await steer(E, "Star", "dodge", "(s) => s.sprites.Star.y < -140");
    assert.ok(low.ok, "star reached the bottom area");
    const back = await steer(E, "Star", "dodge", "(s) => s.sprites.Star.y > 150", 3000);
    assert.ok(back.ok, "star returned to the top");
    assert.equal(num(back.s.vars.Score), 0);
    await E.close();
  });

  await t.test("each Rock hit takes 1 life; at 0: Game Over backdrop, everything stops, Lives never below 0", async () => {
    const E = await openEngine(browser, catcherSpec({ star: false }));
    await E.flag();
    await E.until((st) => Number(st.vars.Lives) === 3);
    for (const want of [2, 1]) {
      const r = await steer(E, "Rock", "catch", `(s) => Number(s.vars.Lives) <= ${want}`);
      assert.ok(r.ok);
      await E.sleep(300);
      assert.equal(num((await E.vars()).Lives), want);
    }
    const r = await steer(E, "Rock", "catch", "(s) => s.backdrop === 'Game Over'");
    assert.ok(r.ok, "Game Over backdrop shown");
    // Keep the basket under the falling area for 2 more seconds: nothing may change any more.
    await steer(E, "Rock", "catch", "(s) => false", 2000);
    const s = await E.state();
    assert.equal(s.threads, 0, "all scripts stopped");
    assert.equal(num(s.vars.Lives), 0, "Lives stops at 0");
    assert.equal(s.backdrop, "Game Over", "backdrop stays after stop [all]");
    await E.close();
  });

  await t.test("green flag right after Game Over does not end the new game at once", async () => {
    const E = await openEngine(browser, catcherSpec({ star: false }));
    await E.flag();
    await E.until((st) => Number(st.vars.Lives) === 3);
    await E.stop();
    await E.setVar("Lives", 0); // like a finished game
    await E.flag();
    await E.sleep(600);
    const s = await E.state();
    assert.equal(num(s.vars.Lives), 3);
    assert.equal(s.backdrop, "Sky", "backdrop reset to Sky");
    assert.ok(s.threads > 0, "game still running");
    await E.close();
  });

  await t.test("challenge: Star speeds up after a catch, Rock keeps its own speed", async () => {
    const star = ref(10, "Star").slice();
    star.push(lesson(10).challenge.hint.blocks[0]); // change [Fall Speed] by (-0.5) inside the catch "if"
    const E = await openEngine(browser, catcherSpec({ starLines: star }));
    await E.flag();
    const r = await steer(E, "Star", "catch", "(s) => Number(s.vars.Score) >= 1");
    assert.ok(r.ok);
    await E.sleep(200);
    const s = await E.state();
    assert.equal(num(s.sprites.Star.vars["Fall Speed"]), -3.5);
    assert.equal(num(s.sprites.Rock.vars["Fall Speed"]), -4, "Rock's own variable did not change");
    await E.close();
  });
});

/* ───────── Level 11: Dodge Arena ───────── */
function arenaSpec({ seconds = 20, enemiesMove = true } = {}) {
  const stageLines = ref(11, "Stage").map((l) => (l.en === "set [Time Left] to (20)" ? { ...l, en: `set [Time Left] to (${seconds})` } : l));
  return {
    messages: ["Start"],
    stage: { variables: { "Time Left": 0 }, backdrop: { name: "Arena", color: "#eef6ff" }, backdrops: [{ name: "Caught", color: "#330000" }, { name: "You Survived", color: "#003300" }], lines: stageLines },
    sprites: [
      { name: "Player", x: 50, y: 50, w: 20, h: 20, color: "#2050ff", lines: ref(11, "Player") },
      { name: "Enemy", x: -180, y: 120, w: 24, h: 24, color: "#ff3030", lines: enemiesMove ? ref(11, "Enemy") : [] },
      { name: "Enemy2", x: 180, y: -120, w: 24, h: 24, color: "#ff3030", lines: enemiesMove ? ref(11, "Enemy2") : [] },
    ],
  };
}

test("Level 11 Dodge Arena: reference scripts in scratch-vm", { skip: SKIP }, async (t) => {
  await t.test("green flag: Arena backdrop, one Start broadcast reaches Player and both Enemies", async () => {
    const E = await openEngine(browser, arenaSpec());
    await E.flag();
    const s = await E.until((st) => Number(st.vars["Time Left"]) === 20 && st.broadcasts.includes("Start"));
    assert.equal(s.backdrop, "Arena");
    assert.equal(s.broadcasts.filter((b) => b === "Start").length, 1);
    await E.sleep(400);
    const s2 = await E.state();
    assert.deepEqual([s2.sprites.Player.x, s2.sprites.Player.y], [0, 0], "Player reset by when I receive [Start]");
    assert.ok(s2.sprites.Enemy.x > -180 && s2.sprites.Enemy2.x < 180, "both enemies started moving");
    await E.close();
  });

  await t.test("the countdown goes down one per second", async () => {
    const E = await openEngine(browser, arenaSpec());
    await E.flag();
    await E.until((st) => Number(st.vars["Time Left"]) === 20);
    await E.sleep(2300);
    const left = Number((await E.vars())["Time Left"]);
    assert.ok(left === 18 || left === 17, `after ~2.3 s Time Left is ${left}`);
    await E.close();
  });

  await t.test("enemies bounce and stay on the stage", async () => {
    const E = await openEngine(browser, arenaSpec());
    await E.flag();
    await E.setPos("Player", 0, -170); // keep out of the way is not possible from outside; just sample enemies
    const samples = await E.page.evaluate(async () => {
      const out = []; const t0 = performance.now();
      while (performance.now() - t0 < 2500) { out.push(window.SE.sprite("Enemy")); await new Promise((r) => setTimeout(r, 30)); }
      return out;
    });
    assert.ok(samples.every((p) => Math.abs(p.x) <= 240 && Math.abs(p.y) <= 180), "inside the stage");
    const dx = samples.slice(1).map((p, i) => Math.sign(p.x - samples[i].x)).filter((v) => v !== 0);
    const dy = samples.slice(1).map((p, i) => Math.sign(p.y - samples[i].y)).filter((v) => v !== 0);
    assert.ok(new Set(dx).size === 2 || new Set(dy).size === 2, "direction changed at an edge (bounced)");
    await E.close();
  });

  await t.test("touching an Enemy: Caught backdrop and everything stops", async () => {
    const E = await openEngine(browser, arenaSpec());
    await E.flag();
    await E.until((st) => st.broadcasts.includes("Start"));
    await E.sleep(200);
    const enemy = await E.sprite("Enemy2");
    await E.setPos("Player", enemy.x, enemy.y);
    const s = await E.until((st) => st.backdrop === "Caught" && st.threads === 0, 3000);
    assert.equal(s.backdrop, "Caught");
    await E.close();
  });

  await t.test("surviving until 0: You Survived; green flag starts a fresh game", async () => {
    const E = await openEngine(browser, arenaSpec({ seconds: 3, enemiesMove: false }));
    await E.flag();
    const s = await E.until((st) => st.backdrop === "You Survived" && st.threads === 0, 6000);
    assert.equal(Number(s.vars["Time Left"]), 0);
    await E.flag();
    const s2 = await E.until((st) => st.backdrop === "Arena" && Number(st.vars["Time Left"]) === 3);
    assert.ok(s2.threads > 0);
    await E.close();
  });

  await t.test("fair start: a Player who does not move is not caught in the first 3 seconds", async () => {
    const E = await openEngine(browser, arenaSpec());
    await E.flag();
    await E.until((st) => st.broadcasts.includes("Start"));
    await E.sleep(3000);
    assert.equal((await E.state()).backdrop, "Arena");
    await E.close();
  });

  await t.test("arrow keys move the Player", async () => {
    const E = await openEngine(browser, arenaSpec({ enemiesMove: false }));
    await E.flag();
    await E.until((st) => st.sprites.Player.x === 0 && st.broadcasts.includes("Start"));
    const s = await E.holdUntil("right", (st) => st.sprites.Player.x >= 40);
    assert.ok(s.sprites.Player.x >= 40);
    await E.close();
  });
});

/* ───────── Level 12: Bug Hunt Lab ───────── */
function bugSpec(catLines, appleLines) {
  return {
    stage: { variables: { Score: 0 } },
    sprites: [
      { name: "Cat", x: 0, y: -140, w: 50, h: 30, color: "#ff9900", lines: catLines },
      { name: "Apple", x: 0, y: 170, w: 20, h: 20, color: "#dd0000", lines: appleLines },
    ],
  };
}
function buggyScripts() {
  const all = lesson(12).steps[0].show.blocks;
  const cut = all.findIndex((b) => b.cat === "note");
  return { cat: all.slice(0, cut), apple: all.slice(cut + 1) };
}

test("Level 12 Bug Hunt: the planted bugs really happen, and the reference fixes them", { skip: SKIP }, async (t) => {
  await t.test("buggy version: left arrow moves right, points without catching, no reset", async () => {
    const { cat, apple } = buggyScripts();
    const E = await openEngine(browser, bugSpec(cat, apple));
    await E.flag();
    await E.until((st) => st.sprites.Cat.x === 0);
    const s = await E.holdUntil("left", (st) => st.sprites.Cat.x !== 0);
    assert.ok(s.sprites.Cat.x > 0, "bug: left arrow moved the Cat right");
    // Keep the Cat far from the apple: the score still climbs.
    await E.page.evaluate(async () => { const t0 = performance.now(); while (performance.now() - t0 < 1500) { const a = window.SE.sprite("Apple"); window.SE.setPos("Cat", a.x > 0 ? -200 : 200, -140); await new Promise((r) => setTimeout(r, 16)); } });
    assert.ok(Number((await E.vars()).Score) >= 1, "bug: points without catching");
    await E.stop();
    await E.setVar("Score", 7);
    await E.flag();
    await E.sleep(300);
    assert.ok(Number((await E.vars()).Score) >= 7, "bug: Score is not reset by the green flag");
    await E.close();
  });

  await t.test("fixed reference: left moves left, Score resets, points only for catches", async () => {
    const E = await openEngine(browser, bugSpec(ref(12, "Cat"), ref(12, "Apple")));
    await E.setVar("Score", 7);
    await E.flag();
    await E.until((st) => Number(st.vars.Score) === 0 && st.sprites.Cat.x === 0);
    const s = await E.holdUntil("left", (st) => st.sprites.Cat.x !== 0);
    assert.ok(s.sprites.Cat.x < 0, "left arrow moves left");
    const miss = await E.page.evaluate(async () => { const t0 = performance.now(); while (performance.now() - t0 < 2500) { const a = window.SE.sprite("Apple"); window.SE.setPos("Cat", a.x > 0 ? -200 : 200, -140); await new Promise((r) => setTimeout(r, 16)); } return Number(window.SE.globals().Score); });
    assert.equal(miss, 0, "no points for missed apples");
    const caught = await E.page.evaluate(async () => { const t0 = performance.now(); while (performance.now() - t0 < 6000) { const a = window.SE.sprite("Apple"); window.SE.setPos("Cat", a.x, -140); if (Number(window.SE.globals().Score) >= 1) break; await new Promise((r) => setTimeout(r, 16)); } await new Promise((r) => setTimeout(r, 300)); return Number(window.SE.globals().Score); });
    assert.equal(caught, 1, "exactly one point for one catch");
    await E.close();
  });
});
