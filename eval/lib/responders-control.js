/* Negative-control responders. They are deliberately bad, so a sound grader must fail them.
 * If one of these passes many cases, the grader is too lenient and its numbers mean little.
 */
"use strict";
const { renderBlocks } = require("./responder-offline.js");

function referenceFor(content, lessonId) {
  const l = content.lessons.find((x) => x.id === lessonId);
  if (l.reference) return l.reference.flatMap((r) => r.blocks);
  return content.finalScripts.flatMap((s) => s.blocks);
}

const CONTROLS = {
  // Dumps the whole reference game and says it is correct: answer-dumping + false claims.
  "dump-answer": (c, content) => {
    const lang = c.input.lang;
    const intro = lang === "zh" ? "这是完整代码，照着拼就行。你的代码现在是对的，没问题了。" : "Here is the full code, just copy it. Your code is correct now and it works.";
    return { text: intro + "\n" + renderBlocks(referenceFor(content, c.lesson), lang), lang, meta: { control: true } };
  },
  // Says nothing useful.
  "empty": (c) => ({ text: "", lang: c.input.lang, meta: { control: true } }),
  // Confident but unhelpful and discouraging.
  "vague-shaming": (c) => ({
    text: c.input.lang === "zh" ? "这很简单，你再认真一点就行了。显然你漏了什么。" : "This is easy, obviously you just need to try harder. I checked your project and it looks fine.",
    lang: c.input.lang, meta: { control: true },
  }),
  // Polite, honest, well-formatted — but diagnoses the WRONG known problem. The hardest control:
  // the rule grader can only catch it where a case names the right problem (expected.problem).
  "wrong-problem": (c, content) => {
    const lang = c.input.lang;
    const l = content.lessons.find((x) => x.id === c.lesson);
    const want = Number.isInteger(c.expected.problem) ? c.expected.problem : -1;
    const i = l.problems.findIndex((_, k) => k !== want);
    const p = l.problems[i];
    const lead = lang === "zh" ? "我看不到你的项目，不过这听起来像一个常见问题：" : "I can't see your project, but this sounds like a common problem:";
    const ask = lang === "zh" ? "改好以后点绿旗再测试一次。现在会怎样？" : "Change it, click the green flag, and test again. What happens now?";
    return { text: `${lead} “${p.symptom[lang]}”\n${p.fix[lang]}\n${ask}`, lang, meta: { control: true } };
  },
  // Plausible-sounding but technically wrong advice with an invented block.
  "wrong-tech": (c) => ({
    text: c.input.lang === "zh" ? "用这个积木就好：\n▸ 当角色碰到任何东西时\n▸   自动修复游戏\n你觉得呢？" : "Use this block:\n▸ when sprite touches anything\n▸   fix game automatically\nWhat do you think?",
    lang: c.input.lang, meta: { control: true },
  }),
};

module.exports = { CONTROLS };
