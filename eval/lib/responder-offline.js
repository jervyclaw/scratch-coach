/* Offline, rule-based coach responder (no AI, no network).
 * It models what the app itself can show a child in a situation: the next hint on the hint
 * ladder, the matching "Something's wrong" entry, a test prompt from the run check, and an
 * honest statement that the coach cannot see the Scratch project. All wording comes from the
 * course content in js/content.js, so evaluating this responder evaluates the course text.
 */
"use strict";
const { similarity, sharedTerms } = require("./text.js");

const INTENTS = [
  ["asks-if-correct", /(is (it|this|my|the) .{0,25}(right|correct|ok|okay|good|done|working)|(done|did it|do it) right|check my|look at my|tell me (it'?s|its|my .{0,25}) (right|correct|works?)|(code|script|game) works\b|it works now right|对不对|对吗|对了吗|正确吗|帮我(看看|检查)|是不是对的|做对了吗|做好了吗|改好了吧)/i],
  ["asks-for-answer", /(just (tell|give|show)|give me (the )?(whole|full|complete|all)|the (whole|full|complete) (code|script|answer)|do (it|the .{0,20}) for me|(write|make|build) (it|the .{0,20}|my .{0,20}) for me|(code|script) for me|tell me exactly|which blocks (do i|to) use|直接(告诉|给|把)|给我(答案|完整|全部)|完整(的)?(代码|答案|脚本)|帮我(做|写)|替我)/i],
  ["frustrated", /(give up|\bi hate|hate this|too hard|so hard|\bstupid\b|can'?t do (it|this)|\bboring\b|\bi quit\b|\bcrying\b|\bugh+\b|i'?m slow|\bim slow\b|not good at|feel dumb|want to quit|太难|放弃|讨厌|做不出来|好烦|烦死|不想(做|学)|哭)/i],
  ["unclear-instructions", /(don'?t (get|understand)|what (does|is|do) .{0,30}(mean|means)|^\s*what('?s| is| are) |what'?s a |how do i (make|draw|add|find|paint|pick)|confus|no idea what|看不懂|不懂|什么意思|什么叫|不明白|是什么|在哪里)/i],
];

const MISCONCEPTIONS = [["noWhenTouching", /(when (it )?touch(ing|es)? |“when touching|当碰到)/i]];

function classify(text) {
  for (const [name, re] of INTENTS) if (re.test(text)) return name;
  return "hint";
}

const SAY = {
  en: {
    honesty: "I can't see your Scratch project, so I can't check your code for you.",
    honestyShort: "I can't see your project, but this sounds like a common problem:",
    testIntro: "You can test it yourself — click the green flag and check:",
    tryAgain: "Change it, click the green flag, and test again. What happens now?",
    tryHint: "Try it in Scratch. What happened?",
    tryUi: "Try that. Did it help?",
    detective: (where) => [
      "Let's be bug detectives:",
      "1. Is the script on the sprite that should do the action?" + (where ? ` In this step that is ${where}.` : ""),
      "2. Read the script from top to bottom. Is every block in the right order, and inside the right loop?",
      "3. Click the script on its own and watch. What does the sprite do?",
      "Which of these did you check first?",
    ],
    stepTest: (title) => `Click the green flag and test what you built in this step (“${title}”). Does it do what the step says?`,
    noWhenTouching: "Scratch has no “when touching” block. Use “if <touching ( )?> then” inside a “forever” loop instead.",
    noAnswer: "I won't give you the whole answer — you can build this! Here is your next hint:",
    hint3Note: "This is the block order for this step only.",
    empathy: "It's OK to feel stuck. Bugs are normal — every game maker gets them.",
    empathyGeneral: "It's OK to feel that way. Making games takes practice, and you are practising right now.",
    hint3Intro: "You have already tried the first hints, so here is the block order for this step only:",
    breakIdea: "If you are tired, save your project and take a short break. Then try just one small step.",
    worksQ: "Which part already works?",
    unclear: "Let's do one small piece at a time.",
    first: "Try this part:",
    where: "Where:",
    allHints: "You have seen all the hints. Open “Something's wrong”, or ask a grown-up to look with you.",
    hintLabel: ["Hint 1", "Hint 2", "Hint 3"],
  },
  zh: {
    honesty: "我看不到你的 Scratch 项目，没法替你检查代码。",
    honestyShort: "我看不到你的项目，不过这听起来像一个常见问题：",
    testIntro: "你可以自己测试——点绿旗，看看：",
    tryAgain: "改好以后点绿旗再测试一次。现在会怎样？",
    tryHint: "在 Scratch 里试试看。发生了什么？",
    tryUi: "试试看。有用吗？",
    detective: (where) => [
      "我们来当捉虫侦探：",
      "1. 脚本放在负责这个动作的角色上了吗？" + (where ? `这一步是 ${where}。` : ""),
      "2. 从上到下读一遍脚本。每个积木的顺序对吗？是不是放在了正确的循环里面？",
      "3. 单独点击这段脚本，看看角色会做什么？",
      "你先检查哪一条？",
    ],
    stepTest: (title) => `点绿旗，测试你在这一步做的东西（“${title}”）。它做到这一步要求的事了吗？`,
    noWhenTouching: "Scratch 里没有“当碰到……”这样的积木。要在“重复执行”里用“如果 <碰到 ( )?> 那么”。",
    noAnswer: "我不会直接给你完整答案——你自己能做出来！这是下一个提示：",
    hint3Note: "这只是这一步的积木顺序。",
    empathy: "卡住的时候有点难受，这很正常。每个游戏设计师都会遇到 bug。",
    empathyGeneral: "有这种感觉很正常。做游戏需要练习，你现在就在练习。",
    hint3Intro: "你已经试过前面的提示了，这是这一步（只是这一步）的积木顺序：",
    breakIdea: "如果累了，先保存项目、休息一下，再只试一个小步骤。",
    worksQ: "哪一部分已经能用了？",
    unclear: "我们一次只做一小块。",
    first: "先做这一部分：",
    where: "位置：",
    allHints: "提示你都看过了。打开“遇到问题”，或者请大人和你一起看看。",
    hintLabel: ["提示 1", "提示 2", "提示 3"],
  },
};

function renderBlocks(blocks, lang) {
  return blocks.map((b) => (b.cat === "note" ? `  ${"  ".repeat(b.indent)}(${b[lang]})` : `▸ ${"  ".repeat(b.indent)}${b[lang]}`)).join("\n");
}
function renderHint(h, level, lang) {
  const S = SAY[lang];
  let out = `${S.hintLabel[level - 1]}: ${h[lang]}`;
  if (h.blocks) out += "\n" + renderBlocks(h.blocks, lang) + "\n" + S.hint3Note;
  if (h.list) out += "\n" + h.list.map((it, i) => `${i + 1}. ${it[lang]}`).join("\n");
  return out;
}

function bestProblem(lesson, text) {
  // A match needs at least two shared words (or Chinese character pairs); one shared word like "game" is not evidence.
  const scored = lesson.problems.map((p, i) => ({ index: i, score: Math.max(sharedTerms(text, p.symptom.en) >= 2 ? similarity(text, p.symptom.en) : 0, sharedTerms(text, p.symptom.zh) >= 2 ? similarity(text, p.symptom.zh) : 0) }))
    .sort((a, b) => b.score - a.score);
  const best = scored[0] || { index: null, score: 0 };
  const second = scored[1] ? scored[1].score : 0;
  // Only trust a match that clearly beats the runner-up; a wrong diagnosis is worse than none.
  return { index: best.index, score: best.score, margin: best.score - second };
}

// The child describes something going wrong (not just asking for a hint).
const BUG_REPORT = /(doesn'?t|does not|won'?t|isn'?t|not working|never|keeps?|again and again|over and over|stuck|disappear|vanish|flash|shakes?|can'?t find|i put|i made|starts at|goes (up|down)|不(动|会|加|见|对)|没(有|反应)|一直|消失|找不到|卡住|我把|不是|还是|还在|好几)/i;

/** Returns { text, lang, meta } for one evaluation case. */
function respond(c, content, opts = {}) {
  const threshold = opts.problemThreshold || 0.25;
  const lang = c.input.lang;
  const S = SAY[lang];
  const lesson = content.lessons.find((l) => l.id === c.lesson);
  const step = c.step ? lesson.steps[c.step - 1] : null;
  const intent = classify(c.input.text);
  const seen = c.input.hintLevelSeen;
  const nextLevel = Math.min(seen + 1, 3);
  const prob = bestProblem(lesson, c.input.text);
  const isBugReport = BUG_REPORT.test(c.input.text);
  // A frustrated child needs a strong match before we guess at a bug.
  const hasProblem = prob.score >= (intent === "frustrated" ? Math.max(threshold, 0.3) : threshold) && prob.margin >= 0.05;
  const parts = [];
  let hintShown = 0;

  const addHint = () => {
    if (!step) return;
    if (seen >= 3) { parts.push(S.allHints); return; }
    parts.push(renderHint(step.hints[nextLevel - 1], nextLevel, lang));
    hintShown = nextLevel;
  };
  const addProblem = (prefix) => {
    const p = lesson.problems[prob.index];
    parts.push(`${prefix} “${p.symptom[lang]}”`);
    parts.push(p.fix[lang]);
  };
  const followUp = () => (lesson.problems[prob.index].kind === "ui" ? S.tryUi : S.tryAgain);
  const addChecks = (n) => {
    // Mid-project, test only what this step built; at the last step, use the level's run checks.
    if (step && c.step < lesson.steps.length) { parts.push(S.stepTest(step.title[lang])); return; }
    parts.push(S.testIntro);
    lesson.check.slice(0, n).forEach((ch) => parts.push(`• ${ch[lang]}`));
  };
  const misconception = MISCONCEPTIONS.find(([, re]) => re.test(c.input.text));
  if (misconception) {
    // Correct the idea, then continue with the hint ladder instead of guessing a bug.
    parts.push(S[misconception[0]]);
    addHint();
    parts.push(S.tryHint);
    return { text: parts.join("\n"), lang, meta: { intent: "misconception", hintShown, problem: null, problemScore: Math.round(prob.score * 100) / 100 } };
  }

  switch (intent) {
    case "asks-if-correct":
      parts.push(S.honesty);
      addChecks(2);
      parts.push(S.worksQ);
      break;
    case "asks-for-answer":
      parts.push(seen >= 2 ? S.hint3Intro : S.noAnswer);
      addHint();
      parts.push(S.tryHint);
      break;
    case "frustrated":
      parts.push(isBugReport || hasProblem ? S.empathy : S.empathyGeneral);
      if (hasProblem) { addProblem(S.honestyShort); parts.push(followUp()); }
      else { parts.push(S.breakIdea); addHint(); parts.push(S.worksQ); }
      break;
    case "unclear-instructions": {
      // Define any Scratch word the child asked about, using the course word list.
      const low = " " + c.input.text.toLowerCase() + " ";
      (content.glossary || []).filter((g) => g.match.some((m) => low.includes(m))).slice(0, 2).forEach((g) => parts.push(g.def[lang]));
      parts.push(S.unclear);
      if (step) {
        // Explain the part of the step the child is asking about.
        let best = 0, bestScore = -1;
        step.do.forEach((d, i) => { const sc = Math.max(similarity(c.input.text, d.en), similarity(c.input.text, d.zh)); if (sc > bestScore) { best = i; bestScore = sc; } });
        parts.push(`${S.first} ${step.do[best][lang]}`);
        parts.push(`${S.where} ${step.where[lang]}`);
        if (seen < 1) { parts.push(renderHint(step.hints[0], 1, lang)); hintShown = 1; }
        else addHint();
      }
      parts.push(S.tryHint);
      break;
    }
    default:
      if (hasProblem) { addProblem(S.honestyShort); parts.push(followUp()); }
      else if (isBugReport) {
        // No known problem fits: be honest and teach a debugging routine instead of guessing.
        parts.push(S.honesty);
        const det = S.detective(step && step.sprite && step.sprite !== "Stage" ? step.sprite : "");
        det.slice(0, -1).forEach((x) => parts.push(x));
        addHint(); // the next hint names the blocks this step needs
        parts.push(det[det.length - 1]);
      } else { addHint(); parts.push(S.tryHint); }
  }
  return { text: parts.join("\n"), lang, meta: { intent, hintShown, problem: hasProblem ? prob.index : null, problemScore: Math.round(prob.score * 100) / 100 } };
}

module.exports = { respond, classify, bestProblem, renderBlocks, SAY };
