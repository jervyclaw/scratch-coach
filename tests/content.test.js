// Course content consistency tests. Run: npm test
"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const C = require("../js/content.js");
const { translateScripts } = require("./scratch-engine/translate.js");

const LANGS = ["en", "zh"];
const isLoc = (o) => o && LANGS.every((l) => typeof o[l] === "string" && o[l].trim().length > 0);
const lesson = (id) => C.lessons.find((l) => l.id === id);

// Every block list a child or parent can see, with the lesson it belongs to.
function allBlockLists() {
  const out = [];
  C.lessons.forEach((l) => {
    out.push({ lesson: l, where: `L${l.id} blocks`, blocks: l.blocks, catalog: true });
    l.steps.forEach((s, i) => s.hints.forEach((h, j) => { if (h.blocks) out.push({ lesson: l, where: `L${l.id} step${i + 1} hint${j + 1}`, blocks: h.blocks }); }));
    if (l.challenge.hint.blocks) out.push({ lesson: l, where: `L${l.id} challenge`, blocks: l.challenge.hint.blocks });
    (l.reference || []).forEach((r) => out.push({ lesson: l, where: `L${l.id} reference ${r.sprite}`, blocks: r.blocks }));
  });
  C.finalScripts.forEach((s) => out.push({ lesson: lesson(6), where: `final ${s.sprite}`, blocks: s.blocks }));
  return out;
}
const hint3 = (lessonId, stepNo) => lesson(lessonId).steps[stepNo - 1].hints[2].blocks;
const final = (sprite) => C.finalScripts.find((s) => s.sprite === sprite).blocks;
const refOf = (id, sprite) => lesson(id).reference.find((r) => r.sprite === sprite).blocks;
const idx = (blocks, re) => blocks.findIndex((b) => re.test(b.en));
const lessonNames = (l, key) => ((l.setup && l.setup[key]) || []).map((x) => x.name);

test("course structure: 8 main-quest levels, then up to 4 arcade projects, ids in order", () => {
  assert.ok(C.lessons.length >= 8 && C.lessons.length <= 12, "8–12 projects");
  C.lessons.forEach((l, i) => assert.equal(l.id, i + 1));
  const quest = C.lessons.filter((l) => l.track === "quest");
  assert.equal(quest.length, 8);
  assert.deepEqual(quest.map((l) => l.id), [1, 2, 3, 4, 5, 6, 7, 8]);
  C.lessons.filter((l) => l.id > 8).forEach((l) => assert.equal(l.track, "arcade"));
  const concepts = C.lessons.map((l) => l.concept.en.toLowerCase());
  assert.match(concepts[0], /green flag/);
  assert.match(concepts[1], /loop/);
  assert.match(concepts[1], /coordinates/);
  assert.match(concepts[2], /touching/);
  assert.match(concepts[3], /variable/);
  assert.match(lesson(5).goal.en, /checkpoint/i);
  assert.match(concepts[5], /broadcast/);
  assert.match(concepts[6], /sound/);
  assert.match(concepts[7], /saving/);
  // Prerequisites only point backwards.
  C.lessons.forEach((l) => (l.requires || []).forEach((r) => assert.ok(r < l.id, `L${l.id} requires L${r}`)));
});

test("the course covers every required concept", () => {
  const text = C.lessons.map((l) => (l.concept.en + " " + l.goal.en).toLowerCase()).join(" ");
  ["green flag", "sequence", "loop", "if", "coordinates", "touching", "variable", "broadcast", "debug"].forEach((k) =>
    assert.ok(text.includes(k), `concept "${k}" is taught`));
});

test("every lesson has all required parts in English and Chinese", () => {
  C.lessons.forEach((l) => {
    const w = `Level ${l.id}`;
    ["title", "concept", "goal", "reflect", "prereqs", "init"].forEach((k) => assert.ok(isLoc(l[k]), `${w} ${k}`));
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
      // Hint 1 asks the child to look or think (a question), it does not instruct blocks.
      assert.match(s.hints[0].en, /\?/, `${w} step ${i + 1}: hint 1 contains a question`);
    });
    assert.ok(l.check.length >= 1 && l.check.every(isLoc), `${w} run check`);
    assert.ok(l.problems.length >= 2, `${w} has at least 2 common problems`);
    l.problems.forEach((p) => assert.ok(isLoc(p.symptom) && isLoc(p.fix), `${w} problem text`));
    assert.ok(isLoc(l.challenge.title) && isLoc(l.challenge.text) && isLoc(l.challenge.hint), `${w} challenge`);
    // Setup card: where to build, sprites, variable scope; parent guidance.
    assert.ok(l.setup && isLoc(l.setup.project), `${w} setup.project`);
    assert.ok(Array.isArray(l.setup.sprites) && l.setup.sprites.length >= 1, `${w} setup.sprites`);
    l.setup.sprites.forEach((sp) => assert.ok(sp.name && isLoc(sp.role), `${w} sprite ${sp.name}`));
    (l.setup.variables || []).forEach((v) => {
      assert.ok(["all", "sprite"].includes(v.scope), `${w} variable ${v.name} scope`);
      assert.ok(isLoc(v.role), `${w} variable ${v.name} role`);
      if (v.scope === "sprite") assert.ok(v.owner, `${w} local variable ${v.name} names its sprite`);
    });
    const g = l.parentGuide;
    assert.ok(g && g.focus && Array.isArray(g.ask) && g.ask.length >= 2 && g.avoid, `${w} parentGuide`);
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

// Turn catalog entries with empty slots into something the translator can parse.
function fillBlanks(en) {
  return en.replace(/<>/g, "<touching (edge)?>").replace(/\( \)/g, "(1)").replace(/\[ \]/g, "[costume1]");
}
const STUB_OPTS = (l) => {
  const vars = {};
  (C.NAMES.variables.concat(...C.lessons.map((x) => lessonNames(x, "variables")))).forEach((n, i) => { vars[n] = "v" + i; });
  const messages = {};
  C.NAMES.messages.concat(...C.lessons.map((x) => lessonNames(x, "messages"))).forEach((n, i) => { messages[n] = "m" + i; });
  return { globalVars: vars, localVars: {}, messages, colors: { "wall color": "#1f3a93" } };
};

test("every block line translates to a real Scratch 3 opcode (same translator as the engine tests)", () => {
  allBlockLists().forEach(({ lesson: l, where, blocks }) => {
    blocks.forEach((b) => {
      if (b.cat === "note") return;
      assert.ok(C.CATEGORIES[b.cat], `${where}: unknown category ${b.cat}`);
      const en = fillBlanks(b.en);
      let lines;
      if (/^when /.test(en)) lines = [{ cat: b.cat, en, indent: 0 }];
      else if (/(\?|^\( \)|=)/.test(b.en) && !/^(if|wait until|repeat until)/.test(b.en) && /^(key|touching|\()/.test(b.en)) lines = [{ cat: "events", en: "when green flag clicked", indent: 0 }, { cat: "control", en: `wait until <${en}>`, indent: 1 }];
      else if (["x position", "y position", "timer"].includes(en) || /^pick random/.test(en)) lines = [{ cat: "events", en: "when green flag clicked", indent: 0 }, { cat: "looks", en: `say (${en})`, indent: 1 }];
      else lines = [{ cat: "events", en: "when green flag clicked", indent: 0 }, { cat: b.cat, en, indent: 1 }];
      assert.doesNotThrow(() => translateScripts(lines, STUB_OPTS(l)), `${where}: "${b.en}" is not a Scratch 3 block`);
    });
  });
});

// Each English keyword must appear with the Scratch 3 Simplified Chinese label.
const ZH_PAIRS = [
  [/^when green flag clicked$/, /^当 绿旗 被点击$/], [/^go to x:/, /^移到 x:/], [/^point in direction/, /^面向 /],
  [/^change x by/, /^将x坐标增加/], [/^change y by/, /^将y坐标增加/], [/^glide/, /^在 .* 秒内滑行到/],
  [/^set rotation style/, /^将旋转方式设为/], [/^show$/, /^显示$/], [/^hide$/, /^隐藏$/], [/^say \(.*\) for/, /^说 .* 秒$/],
  [/^switch costume to/, /造型$/], [/^switch backdrop to/, /背景$/], [/^go to \[front\] layer$/, /^移到最 \[前面\]$/],
  [/^start sound/, /^播放声音/], [/^forever$/, /^重复执行$/], [/^if <.*> then$/, /^如果 <.*> 那么$/],
  [/^wait \(/, /^等待 \(/], [/^wait until/, /^等待 </], [/^repeat until/, /^重复执行直到 </], [/^stop \[all\]$/, /^停止 \[全部脚本\]$/],
  [/^stop \[other scripts in sprite\]$/, /^停止 \[该角色的其他脚本\]$/], [/^reset timer$/, /^计时器归零$/],
  [/^set \[/, /^将 \[.*\] 设为/], [/^change \[/, /^将 \[.*\] 增加/], [/^broadcast/, /^广播/], [/^when I receive/, /^当接收到/],
  [/key \(right arrow\)/, /按下 \(→\) 键/], [/key \(left arrow\)/, /按下 \(←\) 键/], [/key \(up arrow\)/, /按下 \(↑\) 键/], [/key \(down arrow\)/, /按下 \(↓\) 键/],
  [/touching \(/, /碰到 \(/], [/touching color/, /碰到颜色/], [/pick random/, /取随机数/], [/x position/, /x 坐标/], [/y position/, /y 坐标/],
  [/> and </, /> 与 </], [/> or </, /> 或 </], [/\bjoin\b/, /连接/], [/\bround\b/, /四舍五入/], [/\(timer\)/, /\(计时器\)/],
];
test("Chinese block labels match the English block (Scratch 3 zh-cn wording)", () => {
  allBlockLists().forEach(({ where, blocks }) => blocks.forEach((b) => {
    if (b.cat === "note") return;
    ZH_PAIRS.forEach(([en, zh]) => {
      if (en.test(b.en)) assert.match(b.zh, zh, `${where}: "${b.en}" ↔ "${b.zh}"`);
    });
    // Numbers and names in slots match between languages.
    const nums = (s) => (s.match(/\(-?\d+(\.\d+)?\)/g) || []).join(",");
    assert.equal(nums(b.zh), nums(b.en), `${where}: numbers differ in "${b.en}" / "${b.zh}"`);
  }));
});

test("sprite, variable, message and backdrop names match each lesson's setup card", () => {
  allBlockLists().forEach(({ lesson: l, where, blocks, catalog }) => {
    const sprites = lessonNames(l, "sprites").concat(["edge", "mouse-pointer"]);
    const vars = lessonNames(l, "variables");
    const msgs = lessonNames(l, "messages");
    const bds = lessonNames(l, "backdrops");
    blocks.filter((b) => b.cat !== "note").forEach((b) => {
      for (const m of b.en.matchAll(/touching \(([^)]+)\)\?/g)) assert.ok(sprites.includes(m[1]), `${where}: touching unknown sprite ${m[1]}`);
      for (const m of b.en.matchAll(/^(?:set|change) \[([^\]]+)\]/g)) assert.ok(vars.includes(m[1]), `${where}: variable ${m[1]} not in setup`);
      for (const m of b.en.matchAll(/(?:broadcast \(|when I receive \[)([^)\]]+)/g)) assert.ok(msgs.includes(m[1]), `${where}: message ${m[1]} not in setup`);
      for (const m of b.en.matchAll(/switch backdrop to \[([^\]]+)\]/g)) assert.ok(bds.includes(m[1]), `${where}: backdrop ${m[1]} not in setup`);
    });
    if (catalog) return;
  });
  C.lessons.forEach((l) => l.steps.forEach((s) => {
    if (s.sprite) assert.ok(s.sprite === "Stage" || lessonNames(l, "sprites").includes(s.sprite), `L${l.id} step sprite ${s.sprite} not in setup`);
  }));
  // Every broadcast in the main game has receivers.
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

/* ───────── Arcade projects ───────── */
test("Level 9 Maze: countdown in order, loop ends at the Exit, every wall check undoes its own move", () => {
  const r = refOf(9, "Runner");
  const ready = idx(r, /^say \(Ready\?\)/), go = idx(r, /^say \(Go!\)/), loop = idx(r, /^repeat until <touching \(Exit\)\?>$/), done = idx(r, /^say \(I escaped!\)/);
  assert.ok(ready > 0 && go > ready && loop > go && done > loop, "sequence: Ready → Go → loop → escaped");
  assert.equal(r[done].indent, r[loop].indent, "I escaped! is under the loop, not inside it");
  assert.equal(idx(r, /^forever$/), -1, "uses repeat until, not forever");
  ["right", "left", "up", "down"].forEach((dir) => {
    const k = idx(r, new RegExp(`^if <key \\(${dir} arrow\\) pressed\\?> then$`));
    const move = r[k + 1].en.match(/^change ([xy]) by \((-?\d+)\)$/);
    assert.equal(r[k + 2].en, "if <touching color (wall color)?> then", `${dir}: wall check follows the move`);
    const undo = r[k + 3].en.match(/^change ([xy]) by \((-?\d+)\)$/);
    assert.equal(undo[1], move[1], `${dir}: undo on the same axis`);
    assert.equal(Number(undo[2]), -Number(move[2]), `${dir}: undo with the opposite number`);
    assert.ok(r[k + 3].indent > r[k + 2].indent && r[k + 2].indent > r[k].indent);
  });
  // The hint for step 2 shows the same order as the reference.
  const h = hint3(9, 2);
  assert.ok(idx(h, /^say \(Ready\?\)/) < idx(h, /^say \(Go!\)/));
});

test("Level 10 Star Catcher: init before the loop, one point per fall, safe bottom check, own Fall Speed", () => {
  const basket = refOf(10, "Basket");
  const loop = idx(basket, /^repeat until <\(Lives\) < \(1\)>$/);
  ["^switch backdrop to \\[Sky\\]$", "^set \\[Score\\] to \\(0\\)$", "^set \\[Lives\\] to \\(3\\)$"].forEach((p) => {
    const i = idx(basket, new RegExp(p));
    assert.ok(i > 0 && i < loop, `${p} before the loop`);
  });
  const over = idx(basket, /^switch backdrop to \[Game Over\]$/), stop = idx(basket, /^stop \[all\]$/);
  assert.ok(over > loop && stop > over && basket[over].indent === basket[loop].indent, "Game Over after the loop, then stop all");
  assert.equal(idx(basket, /^say/), -1, "no speech bubble right before stop [all] (it would be cleared)");
  for (const sprite of ["Star", "Rock"]) {
    const s = refOf(10, sprite);
    const fall = idx(s, /^repeat until <<touching \(Basket\)\?> or <\(y position\) < \((-?\d+)\)>>$/);
    assert.ok(fall > 0, `${sprite} fall loop`);
    const bottom = Number(s[fall].en.match(/< \((-?\d+)\)>>$/)[1]);
    assert.ok(bottom >= -165, `${sprite}: bottom check ${bottom} is reachable (sprites cannot fully leave the stage)`);
    const ifc = idx(s, /^if <touching \(Basket\)\?> then$/);
    assert.ok(ifc > fall && s[ifc].indent === s[fall].indent, `${sprite}: the catch check runs once, after the fall`);
    assert.ok(idx(s, /^go to x: \(pick random/) < fall, `${sprite}: random start at the top, inside forever`);
    assert.match(s[0].en, /^when green flag clicked$/);
    assert.match(s[1].en, /^set \[Fall Speed\] to/);
  }
  assert.equal(refOf(10, "Star")[idx(refOf(10, "Star"), /^if <touching/) + 1].en, "change [Score] by (1)");
  assert.equal(refOf(10, "Rock")[idx(refOf(10, "Rock"), /^if <touching/) + 1].en, "change [Lives] by (-1)");
  const fs = lesson(10).setup.variables.find((v) => v.name === "Fall Speed");
  assert.equal(fs.scope, "sprite");
  assert.equal(lesson(10).setup.variables.find((v) => v.name === "Score").scope, "all");
});

test("every arcade project has reference scripts for parents", () => {
  C.lessons.filter((l) => l.track === "arcade").forEach((l) => {
    assert.ok(Array.isArray(l.reference) && l.reference.length >= 1, `L${l.id} reference`);
    l.reference.forEach((r) => assert.ok(r.sprite === "Stage" || lessonNames(l, "sprites").includes(r.sprite), `L${l.id} reference sprite ${r.sprite}`));
  });
});

test("Level 11 Dodge Arena: Stage resets then broadcasts Start; everyone else starts on Start", () => {
  const st = refOf(11, "Stage");
  const setT = idx(st, /^set \[Time Left\] to \(20\)$/), bc = idx(st, /^broadcast \(Start\)$/), loop = idx(st, /^repeat until <\(Time Left\) < \(1\)>$/);
  assert.ok(idx(st, /^switch backdrop to \[Arena\]$/) < setT && setT < bc && bc < loop, "reset → broadcast → countdown");
  assert.ok(st[loop + 1].en === "wait (1) seconds" && st[loop + 1].indent > st[loop].indent, "wait inside the countdown loop");
  for (const sp of ["Player", "Enemy", "Enemy2"]) assert.equal(refOf(11, sp)[0].en, "when I receive [Start]", `${sp} starts on Start`);
  const pl = refOf(11, "Player");
  assert.ok(idx(pl, /^repeat until <<touching \(Enemy\)\?> or <touching \(Enemy2\)\?>>$/) > 0, "Player checks both enemies");
  assert.ok(idx(pl, /^switch backdrop to \[Caught\]$/) < idx(pl, /^stop \[all\]$/));
  const dir = (sp) => Number(refOf(11, sp).find((b) => /^point in direction/.test(b.en)).en.match(/\((-?\d+)\)/)[1]);
  assert.notEqual(dir("Enemy"), dir("Enemy2"), "Enemy2 has its own direction");
});

test("Level 12 Bug Hunt: the buggy scripts contain exactly the three planted bugs; the reference fixes them", () => {
  const all = hint3(12, 1);
  const cut = all.findIndex((b) => b.cat === "note");
  const cat = all.slice(0, cut), apple = all.slice(cut + 1);
  const leftIf = idx(cat, /^if <key \(left arrow\) pressed\?> then$/);
  assert.equal(cat[leftIf + 1].en, "change x by (10)", "bug 1: left arrow moves right");
  assert.equal(idx(cat, /^set \[Score\]/), -1, "bug 2: no Score reset");
  assert.ok(idx(apple, /^change \[Score\] by \(1\)$/) < idx(apple, /^repeat until/), "bug 3: point before the fall");
  const fc = refOf(12, "Cat"), fa = refOf(12, "Apple");
  assert.equal(fc[idx(fc, /^if <key \(left arrow\)/) + 1].en, "change x by (-10)");
  assert.ok(idx(fc, /^set \[Score\] to \(0\)$/) > 0 && idx(fc, /^set \[Score\] to \(0\)$/) < idx(fc, /^forever$/));
  const loop = idx(fa, /^repeat until/), ifc = idx(fa, /^if <touching \(Cat\)\?> then$/);
  assert.ok(ifc > loop && fa[ifc].indent === fa[loop].indent && fa[ifc + 1].en === "change [Score] by (1)");
});

test("glossary: every entry has both languages and match words", () => {
  assert.ok(Array.isArray(C.glossary) && C.glossary.length >= 10);
  C.glossary.forEach((g) => { assert.ok(isLoc(g.term) && isLoc(g.def)); assert.ok(g.match.length >= 1); });
});
