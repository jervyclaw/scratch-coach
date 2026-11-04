// Runs the Block Quest reference scripts (js/content.js → finalScripts) in the real Scratch runtime.
// Run: npm run test:scratch   (after: npm --prefix tests/scratch-engine install)
"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const C = require("../../js/content.js");
const { SKIP, launch, openEngine, withGoto, without } = require("./helpers.js");

const ref = (sprite) => C.finalScripts.find((s) => s.sprite === sprite).blocks;
const START = { x: C.START_X, y: C.START_Y };

// Test level layout (the child would drag sprites; here we place them):
// Hero starts bottom-left; a column of coins/checkpoint/goal above it; a tall Lava bar to the right.
function blockQuestSpec(over = {}) {
  const coinLines = over.coinLines || ref("Coin");
  const goalLines = over.goalLines || ref("Goal");
  return {
    stage: { backdrop: { color: "#ffffff" }, variables: { Score: 0, "Checkpoint X": 0, "Checkpoint Y": 0, Lives: 0 } },
    messages: ["You Win"],
    sprites: [
      { name: "Hero", x: 0, y: 0, w: 20, h: 20, color: "#2050ff", lines: over.heroLines || ref("Hero") },
      { name: "Lava", x: -120, y: 0, w: 20, h: 360, color: "#ff2020", lines: ref("Lava") },
      { name: "Coin", x: 0, y: 0, w: 16, h: 16, color: "#ffd000", lines: withGoto(coinLines, -200, -60) },
      { name: "Coin2", x: 0, y: 0, w: 16, h: 16, color: "#ffd000", lines: withGoto(coinLines, -200, 0) },
      { name: "Coin3", x: 0, y: 0, w: 16, h: 16, color: "#ffd000", lines: withGoto(coinLines, -165, -100) },
      { name: "Checkpoint", x: -200, y: 80, w: 16, h: 30, color: "#20c040", lines: ref("Checkpoint") },
      { name: "Goal", x: -200, y: 150, w: 30, h: 20, color: "#9040ff", lines: goalLines },
      { name: "Win Banner", x: 60, y: 0, w: 160, h: 60, color: "#ffee88", lines: ref("Win Banner") },
    ],
  };
}

let browser;
test.before(async () => { if (!SKIP) browser = await launch(); });
test.after(async () => { if (browser) await browser.close(); });

test("Block Quest: full playthrough of the reference game in scratch-vm", { skip: SKIP }, async (t) => {
  const E = await openEngine(browser, blockQuestSpec());
  t.after(() => E.close());

  await t.test("green flag resets position, Score, checkpoint, coins and banner", async () => {
    await E.flag();
    const s = await E.until((st) => st.sprites.Hero.x === -200 && st.sprites.Hero.y === -130 && !st.sprites["Win Banner"].visible);
    assert.equal(Number(s.vars.Score), 0);
    assert.equal(Number(s.vars["Checkpoint X"]), -200);
    assert.equal(Number(s.vars["Checkpoint Y"]), -130);
    for (const c of ["Coin", "Coin2", "Coin3"]) assert.equal(s.sprites[c].visible, true, c + " visible");
    assert.deepEqual([s.sprites.Coin.x, s.sprites.Coin.y], [-200, -60]);
  });

  await t.test("lava before the checkpoint sends Hero back to the start", async () => {
    const samples = await E.holdSample("right", 900, "Hero");
    const resets = samples.filter((p, i) => i > 0 && p.x < samples[i - 1].x - 20).length;
    assert.ok(resets >= 1, "Hero was reset at least once");
    assert.ok(Math.max(...samples.map((p) => p.x)) < -120, "Hero never passed the lava");
    assert.ok(samples.every((p) => p.y === START.y), "respawn y is the start y");
    await E.release();
    await E.sleep(100);
    const h = await E.sprite("Hero");
    // Walk back to the start column for the next steps.
    await E.holdUntil("left", (st) => st.sprites.Hero.x <= -200);
    assert.ok(h.x <= -140);
  });

  await t.test("a coin gives exactly one point, even when Hero stays on it", async () => {
    await E.holdUntil("up", (st) => st.sprites.Hero.y >= -60);
    await E.sleep(800); // stand still on the coin's spot
    const s = await E.state();
    assert.equal(Number(s.vars.Score), 1);
    assert.equal(s.sprites.Coin.visible, false);
  });

  await t.test("checkpoint records its own position", async () => {
    const s = await E.holdUntil("up", (st) => st.sprites.Hero.y >= 80);
    await E.sleep(300);
    const v = await E.vars();
    assert.equal(Number(v["Checkpoint X"]), -200);
    assert.equal(Number(v["Checkpoint Y"]), 80);
    assert.equal(Number(v.Score), 2, "Coin2 collected on the way, Coin3 is off the path");
    assert.ok(s);
  });

  await t.test("lava after the checkpoint sends Hero to the checkpoint", async () => {
    const samples = await E.holdSample("right", 700, "Hero");
    assert.ok(samples.some((p, i) => i > 0 && p.x < samples[i - 1].x - 20), "reset happened");
    await E.release();
    await E.sleep(60);
    const h = await E.sprite("Hero");
    assert.equal(h.y, 80);
    assert.ok(h.x >= -200 && h.x < -140);
    await E.holdUntil("left", (st) => st.sprites.Hero.x <= -200);
  });

  await t.test("goal broadcasts You Win once; banner shows; Hero stops", async () => {
    await E.holdUntil("up", (st) => st.broadcasts.includes("You Win"));
    await E.sleep(500);
    let s = await E.state();
    assert.equal(s.sprites["Win Banner"].visible, true);
    assert.equal(s.sprites.Hero.say, "I did it!");
    const before = s.sprites.Hero;
    await E.key("down", true);
    await E.sleep(400);
    await E.key("down", false);
    s = await E.state();
    assert.equal(s.sprites.Hero.y, before.y, "Hero cannot move after winning");
    assert.equal(s.broadcasts.filter((b) => b === "You Win").length, 1, "You Win sent exactly once");
  });

  await t.test("green flag after winning resets everything, including the checkpoint", async () => {
    await E.flag();
    const s = await E.until((st) => st.sprites.Hero.x === -200 && st.sprites.Hero.y === -130);
    assert.equal(Number(s.vars.Score), 0);
    assert.equal(Number(s.vars["Checkpoint Y"]), -130);
    assert.equal(s.sprites["Win Banner"].visible, false);
    assert.equal(s.sprites.Coin.visible, true);
    await E.holdUntil("right", (st) => st.sprites.Hero.x > -190);
    await E.sleep(50);
    const samples = await E.holdSample("right", 700, "Hero");
    assert.ok(samples.every((p) => p.y === -130), "respawn is the start again, not the old checkpoint");
  });
  assert.deepEqual(E.errors, []);
});

test("Block Quest: starting a new game while standing on a coin or the goal", { skip: SKIP }, async (t) => {
  // With the course's short wait, nothing should be collected or won by accident.
  for (const target of [{ name: "Coin", x: -200, y: -60 }, { name: "Goal", x: -200, y: 150 }]) {
    await t.test(`Hero left on ${target.name} → green flag → nothing triggers`, async () => {
      const E = await openEngine(browser, blockQuestSpec());
      await E.flag();
      await E.sleep(400);
      await E.stop();
      await E.setPos("Hero", target.x, target.y);
      await E.flag();
      await E.sleep(800);
      const s = await E.state();
      assert.equal(Number(s.vars.Score), 0, "no point at start");
      assert.equal(s.broadcasts.filter((b) => b === "You Win").length, 0, "no win at start");
      await E.close();
    });
  }
});

test("Block Quest: what happens WITHOUT the short wait (experiment, recorded not asserted)", { skip: SKIP }, async (t) => {
  const noWait = (lines) => without(lines, /^wait \(0\.2\) seconds$/);
  const results = [];
  for (let run = 0; run < 3; run++) {
    const E = await openEngine(browser, blockQuestSpec({ coinLines: noWait(ref("Coin")), goalLines: noWait(ref("Goal")) }));
    await E.flag();
    await E.sleep(300);
    await E.stop();
    await E.setPos("Hero", -200, 150); // on the goal
    await E.flag();
    await E.sleep(600);
    const s = await E.state();
    results.push({ win: s.broadcasts.includes("You Win"), score: Number(s.vars.Score) });
    await E.close();
  }
  t.diagnostic("without wait: " + JSON.stringify(results));
});

test("Level 7 lives rule: one life per lava touch, Game Over at 0", { skip: SKIP }, async (t) => {
  // Build Hero from the reference script, swapping in the Level 7 lives version of the lava "if".
  const lives = C.lessons[6].steps[2].hints[2].blocks.filter((b) => b.cat !== "note");
  const hero = ref("Hero").slice();
  const setLives = lives.find((b) => /^set \[Lives\]/.test(b.en));
  const ifLava = hero.findIndex((b) => b.en === "if <touching (Lava)?> then");
  const livesIf = lives.slice(lives.findIndex((b) => b.en === "if <touching (Lava)?> then"));
  hero.splice(ifLava, 2, ...livesIf);
  hero.splice(hero.findIndex((b) => b.en === "forever"), 0, setLives);
  const E = await openEngine(browser, blockQuestSpec({ heroLines: hero }));
  t.after(() => E.close());
  await E.flag();
  let s = await E.until((st) => Number(st.vars.Lives) === 3 && st.sprites.Hero.x === -200);
  for (const expected of [2, 1]) {
    // Walk into the lava; stop pressing as soon as a life is lost.
    s = await E.holdUntil("right", new Function("st", `return Number(st.vars.Lives) <= ${expected}`), 6000);
    await E.sleep(300);
    s = await E.state();
    assert.equal(Number(s.vars.Lives), expected, "exactly one life lost per touch");
    assert.ok(s.sprites.Hero.x < -140, "Hero was sent back");
  }
  await E.holdUntil("right", (st) => Number(st.vars.Lives) === 0);
  s = await E.until((st) => st.sprites.Hero.say === "Game Over");
  s = await E.until((st) => st.threads === 0, 6000);
  assert.equal(Number(s.vars.Lives), 0, "Lives never goes below 0");
});
