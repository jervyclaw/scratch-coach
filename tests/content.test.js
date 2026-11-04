// Course content consistency tests. Run: node --test tests/
"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const C = require("../js/content.js");

const LANGS = ["en", "zh"];
const isLoc = (o) => o && LANGS.every((l) => typeof o[l] === "string" && o[l].trim().length > 0);

// Every block line used in the course must match a real Scratch 3 block (English + Chinese pair).
const REAL_BLOCKS = [
  ["events", /^when green flag clicked$/, /^当 绿旗 被点击$/],
  ["events", /^broadcast \(You Win\)$/, /^广播 \(You Win\)$/],
  ["events", /^when I receive \[You Win\]$/, /^当接收到 \[You Win\]$/],
  ["motion", /^go to x: \((-?\d+|Checkpoint X)\) y: \((-?\d+|Checkpoint Y)\)$/, /^移到 x: \((-?\d+|Checkpoint X)\) y: \((-?\d+|Checkpoint Y)\)$/],
  ["motion", /^point in direction \((-?\d+)\)$/, /^面向 \((-?\d+)\) 方向$/],
  ["motion", /^change x by \((-?\d+)\)$/, /^将x坐标增加 \((-?\d+)\)$/],
  ["motion", /^change y by \((-?\d+)\)$/, /^将y坐标增加 \((-?\d+)\)$/],
  ["motion", /^x position$/, /^x 坐标$/],
  ["motion", /^y position$/, /^y 坐标$/],
  ["motion", /^set rotation style \[left-right\]$/, /^将旋转方式设为 \[左右翻转\]$/],
  ["motion", /^glide \(\d+\) secs to x: \(-?\d+\) y: \(-?\d+\)$/, /^在 \(\d+\) 秒内滑行到 x: \(-?\d+\) y: \(-?\d+\)$/],
  ["looks", /^show$/, /^显示$/],
  ["looks", /^hide$/, /^隐藏$/],
  ["looks", /^say \(.+\) for \(\d+\) seconds$/, /^说 \(.+\) \(\d+\) 秒$/],
  ["looks", /^switch costume to \[.*\]$/, /^换成 \[.*\] 造型$/],
  ["looks", /^go to \[front\] layer$/, /^移到最 \[前面\]$/],
  ["sound", /^start sound \(.*\)$/, /^播放声音 \(.*\)$/],
  ["control", /^forever$/, /^重复执行$/],
  ["control", /^if <.*> then$/, /^如果 <.*> 那么$/],
  ["control", /^wait \(0\.2\) seconds$/, /^等待 \(0\.2\) 秒$/],
  ["control", /^wait until <.+>$/, /^等待 <.+>$/],
  ["control", /^stop \[other scripts in sprite\]$/, /^停止 \[该角色的其他脚本\]$/],
  ["control", /^stop \[all\]$/, /^停止 \[全部脚本\]$/],
  ["sensing", /^key \(right arrow\) pressed\?$/, /^按下 \(→\) 键\?$/],
  ["sensing", /^touching \(Lava\)\?$/, /^碰到 \(Lava\)\?$/],
  ["sensing", /^reset timer$/, /^计时器归零$/],
  ["operators", /^\( \) = \( \)$/, /^\( \) = \( \)$/],
  ["variables", /^set \[(Score|Checkpoint X|Checkpoint Y|Lives)\] to \(.+\)$/, /^将 \[(Score|Checkpoint X|Checkpoint Y|Lives)\] 设为 \(.+\)$/],
  ["variables", /^change \[(Score|Lives)\] by \(-?\d+\)$/, /^将 \[(Score|Lives)\] 增加 \(-?\d+\)$/],
];

function allBlockLists() {
  const out = [];
  C.lessons.forEach((l) => {
    out.push({ where: `L${l.id} blocks`, blocks: l.blocks });
    l.steps.forEach((s, i) => s.hints.forEach((h, j) => { if (h.blocks) out.push({ where: `L${l.id} step${i + 1} hint${j + 1}`, blocks: h.blocks }); }));
    if (l.challenge.hint.blocks) out.push({ where: `L${l.id} challenge`, blocks: l.challenge.hint.blocks });
  });
  C.finalScripts.forEach((s) => out.push({ where: `final ${s.sprite}`, blocks: s.blocks }));
  return out;
}
const hint3 = (lessonId, stepNo) => C.lessons[lessonId - 1].steps[stepNo - 1].hints[2].blocks;
const final = (sprite) => C.finalScripts.find((s) => s.sprite === sprite).blocks;
const idx = (blocks, re) => blocks.findIndex((b) => re.test(b.en));

test("there are exactly 8 lessons, in the required order", () => {
  assert.equal(C.lessons.length, 8);
  C.lessons.forEach((l, i) => assert.equal(l.id, i + 1));
  const concepts = C.lessons.map((l) => l.concept.en.toLowerCase());
  assert.match(concepts[0], /green flag/);
  assert.match(concepts[1], /loop/);
  assert.match(concepts[1], /coordinates/);
  assert.match(concepts[2], /touching/);
  assert.match(concepts[3], /variable/);
  assert.match(C.lessons[4].goal.en, /checkpoint/i);
  assert.match(concepts[5], /broadcast/);
  assert.match(concepts[6], /sound/);
  assert.match(concepts[7], /saving/);
});

test("every lesson has all required parts in English and Chinese", () => {
  C.lessons.forEach((l) => {
    const w = `Level ${l.id}`;
    ["title", "concept", "goal", "reflect"].forEach((k) => assert.ok(isLoc(l[k]), `${w} ${k}`));
    assert.ok(isLoc(l.predict.q) && isLoc(l.predict.a), `${w} predict`);
    assert.ok(l.steps.length >= 2 && l.steps.length <= 3, `${w} has 2–3 steps`);
    l.steps.forEach((s, i) => {
      assert.ok(isLoc(s.title) && isLoc(s.where), `${w} step ${i + 1} title/where`);
      assert.ok(s.do.length >= 2 && s.do.length <= 3 && s.do.every(isLoc), `${w} step ${i + 1} do-list`);
      assert.equal(s.hints.length, 3, `${w} step ${i + 1} has 3 hints`);
      s.hints.forEach((h) => assert.ok(isLoc(h), `${w} step ${i + 1} hint text`));
      // Progressive: hints 1 and 2 never show blocks; hint 3 always shows a block order or a step list.
      assert.ok(!s.hints[0].blocks && !s.hints[1].blocks, `${w} step ${i + 1}: hints 1–2 have no block order`);
      assert.ok(s.hints[2].blocks || s.hints[2].list, `${w} step ${i + 1}: hint 3 shows order`);
      (s.hints[2].list || []).forEach((it) => assert.ok(isLoc(it)));
    });
    assert.ok(l.check.length >= 1 && l.check.every(isLoc), `${w} run check`);
    assert.ok(l.problems.length >= 2, `${w} has at least 2 common problems`);
    l.problems.forEach((p) => assert.ok(isLoc(p.symptom) && isLoc(p.fix), `${w} problem text`));
    assert.ok(isLoc(l.challenge.title) && isLoc(l.challenge.text) && isLoc(l.challenge.hint), `${w} challenge`);
    assert.ok(C.parentNotes[l.id], `${w} parent note`);
  });
});

test("hint 2 names a Scratch block category for steps that use blocks", () => {
  const catWords = /Events|Motion|Looks|Sound|Control|Sensing|Operators|Variables/;
  C.lessons.forEach((l) => l.steps.forEach((s, i) => {
    if (s.hints[2].blocks) assert.match(s.hints[1].en, catWords, `L${l.id} step ${i + 1}`);
  }));
});

test("no placeholders or TODOs", () => {
  const raw = JSON.stringify(C);
  assert.doesNotMatch(raw, /TODO|FIXME|TBD|lorem|XXX|待补充|待定/i);
});

test("every block is a real Scratch 3 block with matching Chinese name", () => {
  allBlockLists().forEach(({ where, blocks }) => {
    blocks.forEach((b) => {
      if (b.cat === "note") return;
      assert.ok(C.CATEGORIES[b.cat], `${where}: unknown category ${b.cat}`);
      // Normalise arrow-key variants for matching.
      const en = b.en.replace(/key \((left|up|down) arrow\)/, "key (right arrow)").replace(/^if <key/, "key").replace(/> then$/, "");
      const zh = b.zh.replace(/按下 \((←|↑|↓)\) 键/, "按下 (→) 键").replace(/^如果 <按下/, "按下").replace(/> 那么$/, "");
      const isIf = /^if </.test(b.en);
      const match = REAL_BLOCKS.find(([cat, reEn, reZh]) => {
        if (isIf && /^key/.test(en)) return cat === "sensing" && reEn.test(en) && reZh.test(zh);
        return cat === b.cat && reEn.test(b.en) && reZh.test(b.zh);
      }) || (b.cat === "looks" && /^say \(join/.test(b.en)) || (b.cat === "sensing" && /^key \(/.test(b.en) && /^按下 \(/.test(b.zh));
      assert.ok(match, `${where}: not a known Scratch 3 block: "${b.en}" / "${b.zh}"`);
    });
  });
});

test("sprite, variable and message names are consistent everywhere", () => {
  const text = allBlockLists().flatMap((x) => x.blocks).filter((b) => b.cat !== "note");
  text.forEach((b) => {
    for (const m of b.en.matchAll(/touching \(([^)]+)\)\?/g)) assert.ok(C.NAMES.sprites.includes(m[1]), `touching unknown sprite ${m[1]}`);
    for (const m of b.en.matchAll(/^(?:set|change) \[([^\]]+)\]/g)) assert.ok(C.NAMES.variables.includes(m[1]), `unknown variable ${m[1]}`);
    for (const m of b.en.matchAll(/(?:broadcast \(|when I receive \[)([^)\]]+)/g)) assert.ok(C.NAMES.messages.includes(m[1]), `unknown message ${m[1]}`);
  });
  // Every sprite used in steps is a known sprite (or the Stage).
  C.lessons.forEach((l) => l.steps.forEach((s) => {
    if (s.sprite) assert.ok(s.sprite === "Stage" || C.NAMES.sprites.includes(s.sprite), `L${l.id} unknown sprite ${s.sprite}`);
  }));
  // Every broadcast has at least one receiver in the final game.
  const finalText = C.finalScripts.flatMap((s) => s.blocks.map((b) => b.en));
  assert.ok(finalText.includes("broadcast (You Win)"));
  assert.ok(finalText.filter((t) => t === "when I receive [You Win]").length >= 2);
});

test("start position is identical in Level 1, Level 3, Level 5 and the final Hero script", () => {
  const start = `go to x: (${C.START_X}) y: (${C.START_Y})`;
  assert.ok(hint3(1, 3).some((b) => b.en === start), "Level 1 green flag");
  assert.ok(hint3(3, 2).some((b) => b.en === start), "Level 3 lava reset");
  assert.ok(hint3(5, 1).some((b) => b.en === `set [Checkpoint X] to (${C.START_X})`), "Level 5 checkpoint X reset");
  assert.ok(hint3(5, 1).some((b) => b.en === `set [Checkpoint Y] to (${C.START_Y})`), "Level 5 checkpoint Y reset");
  const hero = final("Hero");
  assert.equal(hero[1].en, start);
  // Text instructions use the same numbers.
  assert.match(C.lessons[0].steps[2].do[1].en, new RegExp(`\\(${C.START_X}\\).*\\(${C.START_Y}\\)`));
  assert.match(C.lessons[2].steps[1].do[2].en, new RegExp(`\\(${C.START_X}\\).*\\(${C.START_Y}\\)`));
  assert.match(C.lessons[4].steps[0].do[1].en, new RegExp(`\\(${C.START_X}\\).*\\(${C.START_Y}\\)`));
});

test("green flag resets: Score and checkpoint are set before the forever loop on Hero", () => {
  const hero = final("Hero");
  const forever = idx(hero, /^forever$/);
  assert.ok(forever > 0);
  ["set \\[Score\\] to \\(0\\)", "set \\[Checkpoint X\\]", "set \\[Checkpoint Y\\]"].forEach((p) => {
    const i = idx(hero, new RegExp("^" + p));
    assert.ok(i > 0 && i < forever, `${p} must be in the green flag script before forever`);
    assert.equal(hero[i].indent, 1);
  });
  assert.equal(hero[0].en, "when green flag clicked");
  // Level 4 and 5 hints teach the same placement.
  const l4 = hint3(4, 1);
  assert.ok(idx(l4, /^set \[Score\] to \(0\)$/) > idx(l4, /^when green flag clicked$/));
});

test("lava sends Hero to the checkpoint variables (Level 5 and final)", () => {
  [hint3(5, 2), final("Hero")].forEach((blocks) => {
    const i = idx(blocks, /^if <touching \(Lava\)\?> then$/);
    assert.ok(i >= 0);
    assert.equal(blocks[i + 1].en, "go to x: (Checkpoint X) y: (Checkpoint Y)");
    assert.ok(blocks[i + 1].indent > blocks[i].indent);
  });
  // Level 7 lives idea keeps using the checkpoint variables.
  const lives = hint3(7, 3);
  const li = idx(lives, /^if <touching \(Lava\)\?> then$/);
  assert.equal(lives[li + 1].en, "go to x: (Checkpoint X) y: (Checkpoint Y)");
  const zero = idx(lives, /^if <\(Lives\) = \(0\)> then$/);
  assert.ok(zero > li && lives[zero].indent > lives[li].indent, "Lives check is inside the lava if");
});

function assertWaitOnce(blocks, label) {
  assert.equal(blocks[0].en, "when green flag clicked", `${label}: starts with green flag`);
  assert.equal(idx(blocks, /^forever$/), -1, `${label}: no forever loop (would repeat)`);
  const w = idx(blocks, /^wait \(0\.2\) seconds$/);
  const wu = idx(blocks, /^wait until <touching \(Hero\)\?>$/);
  assert.ok(w > 0 && wu > w, `${label}: short wait before wait until`);
  return wu;
}

test("coins count only once and come back on the green flag", () => {
  [hint3(4, 2), final("Coin")].forEach((blocks, n) => {
    const label = n ? "final Coin" : "Level 4 Coin";
    const wu = assertWaitOnce(blocks, label);
    const show = idx(blocks, /^show$/);
    const change = idx(blocks, /^change \[Score\] by \(1\)$/);
    const hide = idx(blocks, /^hide$/);
    assert.ok(show > 0 && show < wu, `${label}: show before waiting`);
    assert.ok(change > wu && hide > change, `${label}: add point then hide`);
    assert.ok(idx(blocks, /^go to x:/) < wu, `${label}: go to own spot before waiting`);
  });
  // Level 7 sound is added between change Score and hide.
  const l7 = hint3(7, 1);
  assert.ok(idx(l7, /^start sound/) > idx(l7, /^change \[Score\]/) && idx(l7, /^hide$/) > idx(l7, /^start sound/));
});

test("checkpoint records its own position once per game", () => {
  [hint3(5, 3), final("Checkpoint")].forEach((blocks) => {
    const wu = assertWaitOnce(blocks, "Checkpoint");
    assert.ok(idx(blocks, /^set \[Checkpoint X\] to \(x position\)$/) > wu);
    assert.ok(idx(blocks, /^set \[Checkpoint Y\] to \(y position\)$/) > wu);
  });
  assert.equal(C.lessons[4].steps[2].sprite, "Checkpoint", "x position is used on the Checkpoint sprite");
});

test("victory triggers once, banner resets, Hero stops", () => {
  [hint3(6, 1), final("Goal")].forEach((blocks) => {
    const wu = assertWaitOnce(blocks, "Goal");
    assert.ok(idx(blocks, /^broadcast \(You Win\)$/) > wu);
    assert.equal(blocks.filter((b) => /^broadcast/.test(b.en)).length, 1);
  });
  const banner = final("Win Banner");
  assert.equal(banner[0].en, "when green flag clicked");
  assert.equal(banner[1].en, "hide");
  const recv = idx(banner, /^when I receive \[You Win\]$/);
  assert.ok(recv > 1 && idx(banner, /^show$/) > recv && idx(banner, /^go to \[front\] layer$/) > recv);
  const hero = final("Hero");
  const hr = idx(hero, /^when I receive \[You Win\]$/);
  assert.equal(hero[hr + 1].en, "stop [other scripts in sprite]");
  // The Level 6 challenge keeps "wait until" (no forever) when adding the Score condition.
  assert.match(C.lessons[5].challenge.hint.blocks[0].en, /^wait until <<touching \(Hero\)\?> and <\(Score\) = \(\d+\)>>$/);
});

test("arrow keys: right/up are positive, left/down are negative", () => {
  const hero = final("Hero");
  const pairs = { right: "change x by (5)", left: "change x by (-5)", up: "change y by (5)", down: "change y by (-5)" };
  Object.keys(pairs).forEach((k) => {
    const i = idx(hero, new RegExp(`^if <key \\(${k} arrow\\) pressed\\?> then$`));
    assert.ok(i > 0, k);
    assert.equal(hero[i + 1].en, pairs[k]);
    assert.ok(hero[i].indent === 2 && hero[i + 1].indent === 3, `${k} is inside forever`);
  });
});

test("final reference covers every sprite that has scripts", () => {
  const sprites = C.finalScripts.map((s) => s.sprite);
  ["Hero", "Coin", "Checkpoint", "Goal", "Win Banner"].forEach((s) => assert.ok(sprites.includes(s), s));
});
