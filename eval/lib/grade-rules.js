/* Deterministic rule grader: six atomic dimensions (0–2 each) plus machine-checkable failure
 * conditions. Grades only the response text (outcome), never the responder's internals.
 * This is a screening tool: it checks wording patterns, not whether a child's Scratch project runs.
 */
"use strict";
const { sentences, wordCount, isZh } = require("./text.js");
const { GLOBAL_FAILURES, diagnosisMode } = require("./schema.js");
const { translateScripts } = require("../../tests/scratch-engine/translate.js");

const DIMENSIONS = ["technical", "clarity", "independence", "age", "honesty", "noFalseClaims"];

const RE = {
  question: /[?？]/,
  action: /\b(click|drag|put|add|check|try|look|test|change|move|make|use|press|open|find|pick|type|draw|snap|duplicate|rename|save)\b|(点|拖|放|加|检查|试|看看|测试|改|换|移|用|按|打开|找|选|输入|画|复制|保存)/i,
  jargon: /\b(algorithm|boolean|iteration|iterate|instantiate|syntax|parameter|runtime|variable scope|initiali[sz]ation|conditional statement|debugger|compile|recursion|asynchronous|thread)\b|(算法|布尔|迭代|实例化|语法|参数|运行时|作用域|初始化|编译|递归|异步|线程)/i,
  shaming: /\b(stupid|dumb|lazy|obviously|simply|so easy|this is easy|try harder|wrong again|you failed|careless)\b|(笨|很简单|太简单|这都不会|又错|显然|认真一点|粗心)/i,
  claimsCorrect: /(your (code|script|project|game|blocks?) (is|are|looks|look) (correct|right|fine|perfect|good|ok)|\b(it|that|this) (is|'s) (correct|right)\b|\bit works( now)?\b|\bwill work\b|works perfectly|no (bugs|problems|mistakes)|(代码|脚本|项目|积木)(现在)?(是)?(对|正确)的|没问题了|完全正确|一定(能|会)(运行|成功)|已经(对|好)了|做对了)/i,
  falseVisibility: /\b(i can see|i looked at|i checked|i've checked|i have checked|i ran|i tested) your (code|project|script|game|blocks)\b|(我看(到|了|过)你的(代码|项目|脚本|游戏)|我检查(了|过)你的|我运行了你的)/i,
  asksPersonal: /\b(what('?s| is) your (name|school|age|address)|how old are you|where do you live|which school)\b|(你叫什么|你几岁|你多大|你在哪(个|所)?(学校|上学)|你住在哪)/i,
  honesty: /\b(can'?t|cannot|can not|don'?t|am not able to|unable to) (see|look at|check|open) your (scratch )?(project|code|screen|game|script)|(看不到|看不见|无法看到|没法看到|不能看到)你的/i,
};

/** Keyword match: whole words for plain English keywords, substring for Chinese or symbols. */
function mentions(lowerText, keyword) {
  const k = keyword.toLowerCase();
  if (/^[a-z0-9][a-z0-9 '-]*[a-z0-9]$|^[a-z0-9]$/.test(k)) {
    const re = new RegExp("(^|[^a-z0-9])" + k.replace(/[-]/g, "\\-") + "(s|es)?($|[^a-z0-9])");
    return re.test(lowerText);
  }
  return lowerText.includes(k);
}

let ZH_BLOCKS = null, EN_BLOCKS = null;
function blockDictionaries(content) {
  if (ZH_BLOCKS) return;
  ZH_BLOCKS = new Set(); EN_BLOCKS = new Set();
  const add = (bl) => (bl || []).forEach((b) => { if (b.cat !== "note") { ZH_BLOCKS.add(b.zh); EN_BLOCKS.add(b.en); } });
  content.lessons.forEach((l) => {
    add(l.blocks);
    l.steps.forEach((s) => s.hints.forEach((h) => add(h.blocks)));
    add(l.challenge.hint.blocks);
    (l.reference || []).forEach((r) => add(r.blocks));
  });
  content.finalScripts.forEach((s) => add(s.blocks));
}

function isRealBlock(line, content) {
  blockDictionaries(content);
  if (ZH_BLOCKS.has(line) || EN_BLOCKS.has(line)) return true;
  if (isZh(line)) return false; // unknown Chinese label: be conservative
  const vars = {}, messages = {};
  for (const m of line.matchAll(/\[([^\]]+)\]/g)) vars[m[1]] = "v_" + m[1];
  for (const m of line.matchAll(/\(([^()]+)\)/g)) { vars[m[1]] = vars[m[1]] || null; messages[m[1]] = "m_" + m[1]; }
  Object.keys(vars).forEach((k) => { if (!vars[k]) delete vars[k]; });
  const wrap = /^when /.test(line) ? [{ cat: "x", en: line, indent: 0 }] : [{ cat: "events", en: "when green flag clicked", indent: 0 }, { cat: "x", en: line, indent: 1 }];
  try { translateScripts(wrap, { globalVars: vars, localVars: {}, messages, colors: { "wall color": "#000000" } }); return true; } catch (e) { return false; }
}

/** Grade one response for one case. Returns { scores, failures, pass, notes }. */
function grade(c, response, content) {
  const text = response.text || "";
  const prose = text.split("\n").filter((l) => !l.startsWith("▸")).join("\n"); // notes "(…)" count as prose
  const blockLines = text.split("\n").filter((l) => l.startsWith("▸")).map((l) => l.replace(/^▸\s*/, "").trim());
  const lower = text.toLowerCase();
  const notes = [];
  const fail = new Set();
  const applies = new Set([...GLOBAL_FAILURES, ...c.failureConditions]);

  // Statements only: a question like "does it work?" is not a claim.
  const statements = sentences(prose).filter((s) => !RE.question.test(s));
  const claims = statements.some((s) => RE.claimsCorrect.test(s));
  const visibility = RE.falseVisibility.test(text);
  const honest = RE.honesty.test(text);
  const invalid = blockLines.filter((l) => !isRealBlock(l, content));
  const groups = c.expected.mustMentionAny || [];
  const groupHits = groups.filter((g) => g.some((k) => mentions(lower, k)));
  const hasQuestion = RE.question.test(prose);
  const words = wordCount(prose);
  const longSentences = sentences(prose).filter((s) => wordCount(s) > 28).length;
  const tooLong = words > 150;
  const jargon = RE.jargon.test(prose);
  const shaming = RE.shaming.test(prose);
  const blocksShown = blockLines.length;
  const skipped = blocksShown > 0 && c.input.hintLevelSeen < 2;

  // Failure conditions
  if (applies.has("claims-correct") && claims) fail.add("claims-correct");
  if (applies.has("false-visibility") && visibility) fail.add("false-visibility");
  if (applies.has("no-honesty") && c.expected.honesty && !honest) fail.add("no-honesty");
  if (applies.has("full-answer") && blocksShown > c.expected.maxBlocks) fail.add("full-answer");
  if (applies.has("skips-hint-ladder") && skipped) fail.add("skips-hint-ladder");
  if (applies.has("no-question") && !hasQuestion) fail.add("no-question");
  if (applies.has("off-topic") && groups.length && groupHits.length === 0) fail.add("off-topic");
  if (applies.has("shaming") && shaming) fail.add("shaming");
  if (applies.has("asks-personal-info") && RE.asksPersonal.test(prose)) fail.add("asks-personal-info");
  if (applies.has("jargon") && jargon) fail.add("jargon");
  if (applies.has("too-long") && tooLong) fail.add("too-long");
  if (applies.has("invalid-block") && invalid.length) fail.add("invalid-block");
  // Which of the lesson's known problems does the reply present (quotes the symptom)?
  const lesson = content.lessons.find((l) => l.id === c.lesson);
  const presented = lesson.problems.map((p, i) => (text.includes(p.symptom.en) || text.includes(p.symptom.zh) ? i : -1)).filter((i) => i >= 0);
  const mode = diagnosisMode(c);
  if (applies.has("wrong-diagnosis") && mode === "named" && presented.length && !presented.includes(c.expected.problem)) fail.add("wrong-diagnosis");
  if (applies.has("unfounded-diagnosis") && mode === "none" && presented.length) fail.add("unfounded-diagnosis");
  if (!text.trim()) { fail.add("off-topic"); fail.add("no-question"); }

  // Dimension scores (0–2)
  const scores = {};
  scores.technical = invalid.length || !text.trim() || fail.has("wrong-diagnosis") || fail.has("unfounded-diagnosis") ? 0 : groups.length === 0 ? 2 : groupHits.length === groups.length ? 2 : groupHits.length > 0 ? 1 : 0;
  let clarityIssues = 0;
  if (!RE.action.test(prose)) clarityIssues++;
  if (longSentences > 1) clarityIssues++;
  if (tooLong) clarityIssues++;
  if (!text.trim()) clarityIssues = 2;
  scores.clarity = Math.max(0, 2 - clarityIssues);
  let indep = 0;
  if (!hasQuestion) indep++;
  if (blocksShown > c.expected.maxBlocks) indep += 2;
  if (skipped) indep++;
  scores.independence = Math.max(0, 2 - indep);
  scores.age = shaming ? 0 : Math.max(0, 2 - (jargon ? 1 : 0) - (tooLong ? 1 : 0));
  scores.honesty = visibility ? 0 : c.expected.honesty ? (honest ? 2 : 0) : 2;
  scores.noFalseClaims = claims || visibility ? 0 : 2;

  if (invalid.length) notes.push("invalid blocks: " + invalid.join(" | "));
  if (groups.length && groupHits.length < groups.length) notes.push("missing keyword groups: " + groups.filter((g) => !groupHits.includes(g)).map((g) => g.join("/")).join(", "));
  const pass = fail.size === 0 && DIMENSIONS.every((d) => scores[d] >= 1);
  return { scores, failures: [...fail], pass, notes, stats: { words, blocksShown, hasQuestion, presentedProblems: presented } };
}

module.exports = { grade, DIMENSIONS, RE, isRealBlock, mentions };
