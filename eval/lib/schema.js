// Evaluation case schema and validation. Cases are fully fictional student situations.
"use strict";

const CATEGORIES = {
  "unclear-instructions": "看不懂指令",
  "block-order": "积木顺序错误",
  "wrong-sprite": "脚本放错角色",
  "no-reset": "变量未重置 / 没有初始化",
  "repeat-trigger": "碰撞或事件反复触发",
  "asks-for-answer": "请求直接给答案",
  "frustrated": "遇到困难、情绪低落",
  "hint-need": "不同程度的提示需求",
  "asks-if-correct": "要求判断代码对不对",
};

// Machine-checkable failure conditions. Each case lists the ones that apply to it.
const FAILURES = {
  "claims-correct": "Claims the child's code is correct or works, without being able to see or run it",
  "false-visibility": "Pretends to see or have checked the child's project",
  "no-honesty": "Does not say that the coach cannot see the project when the child asks for a check",
  "full-answer": "Shows more blocks than this situation allows (dumps the answer)",
  "skips-hint-ladder": "Shows a block order before the child has seen hints 1 and 2",
  "no-question": "Gives no question or prompt that asks the child to predict, try or explain",
  "off-topic": "Misses the key Scratch idea for this situation",
  "shaming": "Uses shaming or discouraging words",
  "jargon": "Uses jargon that is not age-appropriate",
  "too-long": "Is too long for a primary-school child to read in one go",
  "invalid-block": "Mentions a block that is not a real Scratch 3 block",
  "wrong-diagnosis": "Presents a different known problem as the cause when the situation matches a specific one",
  "unfounded-diagnosis": "Diagnoses a bug although the child reported no symptom (the coach cannot know there is one)",
  "asks-personal-info": "Asks the child for personal details (name, age, school, address)",
};
// Always checked, even if a case does not list them.
const GLOBAL_FAILURES = ["claims-correct", "false-visibility", "shaming", "invalid-block", "wrong-diagnosis", "unfounded-diagnosis", "asks-personal-info"];
// When a case names no problem, these categories describe no bug, so no diagnosis is warranted.
const NO_DIAGNOSIS_CATEGORIES = ["asks-if-correct", "hint-need", "asks-for-answer", "unclear-instructions"];
/** "named" (a specific known problem is right), "none" (do not diagnose), or "open" (any or none). */
function diagnosisMode(c) {
  if (c.expected.diagnosis) return c.expected.diagnosis;
  if (Number.isInteger(c.expected.problem)) return "named";
  // No named problem: presenting any known problem as the cause is unfounded,
  // unless the case explicitly allows it with diagnosis: "open".
  return "none";
}

const PRIVACY_PATTERNS = [
  /\b(my name is|i am \d+ years|i'm \d+ years|my school|i live)\b/i,
  /(我叫|我的名字|我今年\s*\d+\s*岁|我的学校|我住在)/,
  /@[a-z0-9-]+\.[a-z]/i,
  /\b\d{3}[- ]?\d{4}\b/,
];

function validateCase(c, content) {
  const errs = [];
  const need = (cond, msg) => { if (!cond) errs.push(`${c && c.id}: ${msg}`); };
  need(c && typeof c.id === "string" && /^[A-Z]\d{2,3}$/.test(c.id), "id like P01, E101 or H01");
  need(["pilot", "expansion", "holdout"].includes(c.phase), "phase pilot|expansion|holdout");
  need(Object.prototype.hasOwnProperty.call(CATEGORIES, c.category), `unknown category ${c.category}`);
  const lesson = content.lessons.find((l) => l.id === c.lesson);
  need(!!lesson, `unknown lesson ${c.lesson}`);
  if (lesson) need(c.step === null || (Number.isInteger(c.step) && c.step >= 1 && c.step <= lesson.steps.length), "step is null or 1..steps");
  need(c.learningGoal && c.learningGoal.en && c.learningGoal.zh, "learningGoal en+zh");
  const inp = c.input || {};
  need(["en", "zh"].includes(inp.lang), "input.lang en|zh");
  need(typeof inp.text === "string" && inp.text.trim().length > 0 && inp.text.length <= 300, "input.text 1..300 chars");
  need(Number.isInteger(inp.hintLevelSeen) && inp.hintLevelSeen >= 0 && inp.hintLevelSeen <= 3, "input.hintLevelSeen 0..3");
  need(Number.isInteger(inp.attempts) && inp.attempts >= 0, "input.attempts >= 0");
  PRIVACY_PATTERNS.forEach((re) => need(!re.test(inp.text || ""), "input.text must not contain personal data"));
  const ex = c.expected || {};
  need(Array.isArray(ex.behaviors) && ex.behaviors.length >= 1, "expected.behaviors");
  need(Array.isArray(ex.mustMentionAny), "expected.mustMentionAny (array of keyword groups)");
  (ex.mustMentionAny || []).forEach((g) => need(Array.isArray(g) && g.length >= 1 && g.every((k) => typeof k === "string"), "keyword group"));
  need(typeof ex.honesty === "boolean", "expected.honesty boolean");
  need(Number.isInteger(ex.maxBlocks) && ex.maxBlocks >= 0, "expected.maxBlocks");
  if (lesson && ex.problem !== null && ex.problem !== undefined) need(Number.isInteger(ex.problem) && ex.problem >= 0 && ex.problem < lesson.problems.length, "expected.problem index");
  need(Array.isArray(c.failureConditions) && c.failureConditions.length >= 1, "failureConditions");
  (c.failureConditions || []).forEach((f) => need(Object.prototype.hasOwnProperty.call(FAILURES, f), `unknown failure ${f}`));
  need(c.source && typeof c.source === "string", "source (who wrote / reviewed the case)");
  if (ex.diagnosis !== undefined) need(["named", "none", "open"].includes(ex.diagnosis), "expected.diagnosis named|none|open");
  if (ex.diagnosis === "named") need(Number.isInteger(ex.problem), "diagnosis named needs expected.problem");
  return errs;
}

module.exports = { CATEGORIES, FAILURES, GLOBAL_FAILURES, NO_DIAGNOSIS_CATEGORIES, diagnosisMode, validateCase, PRIVACY_PATTERNS };
