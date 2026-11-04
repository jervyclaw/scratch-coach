/* Scratch Coach · Block Quest — UI.
 * Vanilla JS, no network, no external assets. Hash routes:
 *   #/                 home + quest map
 *   #/lesson/N/S       level N, screen S (0 = intro, steps…, test, finish)
 *   #/levelup/N        level complete
 *   #/parent           parent page (Chinese)
 */
(function () {
  "use strict";

  var C = window.SCRATCH_COACH_CONTENT;
  var S = window.ScratchCoachStorage;

  var localStore = null;
  try { localStore = window.localStorage; } catch (e) { localStore = null; }
  var store = S.createStore(localStore);

  var ui = {
    routeKey: null,
    problemsOpen: false,
    predictOpen: false,
    challengeHintOpen: false,
    sessionStart: Date.now(),
    breakDismissed: false,
    parentMsg: ""
  };

  /* ───────────── UI strings ───────────── */
  var UI = {
    en: {
      brand: "Block Quest", brandSub: "Scratch Coach",
      langToggle: "中文", langToggleAria: "切换到中文 (Switch to Chinese)",
      parents: "家长 Parents", skip: "Skip to content",
      minutes: function (n) { return "⏱ " + n + " min"; },
      timerAria: function (n) { return "You have been learning for " + n + " minutes"; },
      homeTitle: "Build your own adventure game!",
      homeSub: "Make a cartoon level in Scratch: run, dodge lava, grab coins, and reach the goal.",
      startBtn: "▶ Start Level 1",
      continueBtn: function (n, title) { return "▶ Continue: Level " + n + " · " + title; },
      allDone: "You finished every level! Pick any level to play again.",
      howTitle: "How it works",
      how: ["Open Scratch next to this window.", "Do one small step at a time.", "Tap “I tried it!” — or ask for a hint."],
      openScratch: "Open Scratch online ↗",
      glossaryTitle: "📖 Scratch words",
      buildTitle: "🧱 Build these scripts",
      desktopNote: "No internet? The Scratch desktop app works offline.",
      cantSee: "This coach can't see your Scratch project. You test your own game — like a real game maker!",
      mapTitle: "Quest map",
      levelsDone: function (d, n) { return "⭐ " + d + " of " + n + " levels done"; },
      level: function (n) { return "Level " + n; },
      status: { done: "Done ⭐", progress: "In progress", fresh: "New" },
      back: "← Back", map: "← Map", next: "Next →",
      levelOf: function (n, total) { return "Level " + n + " of " + total; },
      screenIntro: "Start", screenStep: function (n) { return "Step " + n; }, screenCheck: "Test", screenFinish: "Finish",
      screenNav: "Level screens",
      bigIdea: "Big idea", mission: "Your mission", blocksTitle: "Blocks you will use",
      predictTitle: "🔮 Predict first",
      predictTip: "Think of your answer and say it out loud. Then check it in Scratch.",
      showAnswer: "Show the answer", hideAnswer: "Hide the answer",
      letsBuild: "Let's build! →",
      stepOf: function (i, n) { return "Step " + i + " of " + n; },
      where: "📍 Where:",
      tried: "✅ I tried it!", triedAgain: "✅ Tried it — next",
      triedMark: "✔ You marked this step as tried.",
      skippedMark: "You skipped this step. Come back any time.",
      hintBtn: function (n) { return "💡 Give me a hint (" + n + "/3)"; },
      hintAll: "💡 All 3 hints shown",
      hintNames: ["Hint 1 · Look closely", "Hint 2 · Which blocks", "Hint 3 · Block order"],
      noMoreHints: "That's every hint! Try “Something's wrong”, or ask a grown-up to look with you.",
      hintOpened: function (n) { return "Hint " + n + " opened"; },
      trouble: "🛠 Something's wrong",
      troubleTitle: "Common problems",
      troubleTip: "Find the one that looks like your problem.",
      stillStuck: "Still stuck? Ask a grown-up to look with you. Bugs are normal — every game maker has them!",
      skipStep: "Skip this step ⤼",
      checkTitle: "Test it! 🧪",
      checkIntro: "Click the green flag in Scratch. Test each thing and tick what works.",
      checkNote: "You are the tester — this coach can't see your project.",
      checkCount: function (a, b) { return a + " of " + b + " ticked"; },
      checkOk: "It's OK if something doesn't work yet. Use “Something's wrong”, or come back later.",
      finishTitle: "Bonus & think back",
      challengeTitle: "⭐ Optional challenge",
      challengeHint: "Show a challenge hint", challengeHintHide: "Hide the hint",
      challengeDone: "I did the challenge!",
      reflectTitle: "💬 Think and talk", reflectTip: "Tell a grown-up your answer.",
      feelTitle: "How did this level feel?",
      feel: { easy: "😀 Easy", ok: "🙂 OK", hard: "😅 Tricky" },
      finishBtn: function (n) { return "⭐ Finish Level " + n; },
      redo: "↺ Redo this level",
      redoTitle: "Redo this level?",
      redoBody: "Your ticks and hints for this level will be cleared. Your Scratch project is not changed.",
      redoYes: "Yes, redo", cancel: "Cancel",
      levelupTitle: function (n) { return "Level " + n + " complete!"; },
      levelupBody: "Great building! Save your Scratch project now: File → Save to your computer.",
      nextLevel: function (n) { return "Go to Level " + n + " →"; },
      backMap: "Back to the map",
      allDoneTitle: function (n) { return "You finished all " + n + " levels!"; },
      questDoneTitle: "You finished the Block Quest game!",
      questDoneBody: "Your whole adventure game works. Next up: the Arcade projects — new mini games that use the same ideas in new ways.",
      trackTitle: { quest: "🗺️ Main quest: build Block Quest (one game, level by level)", arcade: "🕹️ Arcade: new mini games" },
      trackNote: { quest: "Levels 1–8 all add to the same Scratch project.", arcade: "Each arcade level starts a NEW Scratch project. Do the main quest first." },
      prereqTitle: "Before you start",
      setupTitle: "Project setup",
      setupProject: "Where to build",
      setupSprites: "Sprites",
      setupVars: "Variables",
      setupMsgs: "Broadcast messages",
      setupBackdrops: "Backdrops",
      scopeAll: "For all sprites",
      scopeSprite: "For this sprite only",
      scopeOn: function (s) { return "on " + s; },
      initTitle: "🟢 Green flag resets",
      parentDetails: "给家长 · For grown-ups",
      allDoneBody: "You built a whole game in Scratch: moving, lava, coins, a checkpoint, a goal, and your own ideas. Amazing!",
      breakMsg: function (n) { return "You've been building for " + n + " minutes. Great time to save your Scratch project and take a little break!"; },
      ok: "OK",
      storageUnavailable: "Heads up: this browser is not saving progress (storage is off or blocked). Every level still works, but your ticks may be lost when you close the page.",
      storageWriteFailed: "Heads up: the latest progress could not be saved (storage may be full or blocked).",
      storageCorrupt: "Your saved progress was damaged, so it was reset. Sorry! Pick any level to keep going.",
      footer: "For learning with Scratch. Not affiliated with Scratch or the MIT Media Lab. Works offline. No accounts, no tracking.",
      notFound: "Page not found. Going back to the map."
    },
    zh: {
      brand: "积木大冒险", brandSub: "Scratch 小教练",
      langToggle: "English", langToggleAria: "Switch to English（切换到英文）",
      parents: "家长 Parents", skip: "跳到主要内容",
      minutes: function (n) { return "⏱ " + n + " 分钟"; },
      timerAria: function (n) { return "你已经学习了 " + n + " 分钟"; },
      homeTitle: "做一个你自己的闯关游戏！",
      homeSub: "在 Scratch 里做一个卡通关卡：奔跑、躲岩浆、捡金币、冲向终点。",
      startBtn: "▶ 开始第 1 关",
      continueBtn: function (n, title) { return "▶ 继续学习：第 " + n + " 关 · " + title; },
      allDone: "你完成了所有关卡！可以挑任意一关再玩一次。",
      howTitle: "怎么用",
      how: ["把 Scratch 打开，放在这个窗口旁边。", "一次只做一个小步骤。", "做完点“我试过了！”——或者要一个提示。"],
      openScratch: "打开在线 Scratch ↗",
      glossaryTitle: "📖 Scratch 词语",
      buildTitle: "🧱 搭出这些脚本",
      desktopNote: "没有网络？Scratch 桌面版可以离线使用。",
      cantSee: "小教练看不到你的 Scratch 项目。你要自己测试游戏——就像真正的游戏设计师！",
      mapTitle: "冒险地图",
      levelsDone: function (d, n) { return "⭐ 已完成 " + d + " / " + n + " 关"; },
      level: function (n) { return "第 " + n + " 关"; },
      status: { done: "完成 ⭐", progress: "进行中", fresh: "未开始" },
      back: "← 返回", map: "← 地图", next: "下一步 →",
      levelOf: function (n, total) { return "第 " + n + " 关 / 共 " + total + " 关"; },
      screenIntro: "开始", screenStep: function (n) { return "步骤 " + n; }, screenCheck: "测试", screenFinish: "完成",
      screenNav: "本关页面",
      bigIdea: "核心概念", mission: "你的任务", blocksTitle: "会用到的积木",
      predictTitle: "🔮 先预测一下",
      predictTip: "先想好答案并说出来，然后在 Scratch 里验证。",
      showAnswer: "看答案", hideAnswer: "收起答案",
      letsBuild: "开始搭建！→",
      stepOf: function (i, n) { return "步骤 " + i + " / " + n; },
      where: "📍 位置：",
      tried: "✅ 我试过了！", triedAgain: "✅ 试过了——下一步",
      triedMark: "✔ 你已把这一步标记为“试过了”。",
      skippedMark: "你跳过了这一步，随时可以回来。",
      hintBtn: function (n) { return "💡 给我一点提示（" + n + "/3）"; },
      hintAll: "💡 3 个提示都看过了",
      hintNames: ["提示 1 · 仔细观察", "提示 2 · 用哪些积木", "提示 3 · 积木顺序"],
      noMoreHints: "提示都给完啦！试试“遇到问题”，或请大人和你一起看看。",
      hintOpened: function (n) { return "已打开提示 " + n; },
      trouble: "🛠 遇到问题",
      troubleTitle: "常见问题",
      troubleTip: "找一找和你的情况最像的那一条。",
      stillStuck: "还是卡住了？请大人和你一起看看。出 bug 很正常——每个游戏设计师都会遇到！",
      skipStep: "跳过这一步 ⤼",
      checkTitle: "测试一下！🧪",
      checkIntro: "在 Scratch 里点绿旗，逐项测试，能正常工作的就打勾。",
      checkNote: "你就是测试员——小教练看不到你的项目。",
      checkCount: function (a, b) { return "已勾选 " + a + " / " + b; },
      checkOk: "还有地方不正常也没关系。可以用“遇到问题”，或者以后再回来。",
      finishTitle: "加分挑战和回顾",
      challengeTitle: "⭐ 可选挑战",
      challengeHint: "看挑战提示", challengeHintHide: "收起提示",
      challengeDone: "我完成了挑战！",
      reflectTitle: "💬 想一想，说一说", reflectTip: "把你的答案讲给大人听。",
      feelTitle: "这一关感觉怎么样？",
      feel: { easy: "😀 简单", ok: "🙂 还行", hard: "😅 有点难" },
      finishBtn: function (n) { return "⭐ 完成第 " + n + " 关"; },
      redo: "↺ 重做这一关",
      redoTitle: "要重做这一关吗？",
      redoBody: "这一关的勾选和提示记录会被清除。你的 Scratch 项目不会改变。",
      redoYes: "确定重做", cancel: "取消",
      levelupTitle: function (n) { return "第 " + n + " 关完成！"; },
      levelupBody: "做得真棒！现在保存你的 Scratch 项目：文件 → 保存到你的电脑。",
      nextLevel: function (n) { return "去第 " + n + " 关 →"; },
      backMap: "回到地图",
      allDoneTitle: function (n) { return n + " 关全部完成！"; },
      questDoneTitle: "“积木大冒险”游戏完成了！",
      questDoneBody: "你的整个闯关游戏都能玩了。接下来是“街机”项目——用同样的概念做全新的小游戏。",
      trackTitle: { quest: "🗺️ 主线任务：做出“积木大冒险”（一个游戏，一关一关做）", arcade: "🕹️ 街机：全新的小游戏" },
      trackNote: { quest: "第 1–8 关都在同一个 Scratch 项目里继续做。", arcade: "每个街机关卡都要新建一个 Scratch 项目。建议先完成主线。" },
      prereqTitle: "开始之前",
      setupTitle: "项目准备",
      setupProject: "在哪里做",
      setupSprites: "角色",
      setupVars: "变量",
      setupMsgs: "广播消息",
      setupBackdrops: "背景",
      scopeAll: "适用于所有角色",
      scopeSprite: "仅适用于当前角色",
      scopeOn: function (s) { return "属于 " + s; },
      initTitle: "🟢 绿旗时要重置",
      parentDetails: "给家长 · For grown-ups",
      allDoneBody: "你在 Scratch 里做出了一个完整的游戏：移动、岩浆、金币、检查点、终点，还有你自己的点子。太厉害了！",
      breakMsg: function (n) { return "你已经搭建了 " + n + " 分钟。现在很适合保存 Scratch 项目，休息一下！"; },
      ok: "好的",
      storageUnavailable: "提示：这个浏览器现在无法保存进度（存储被关闭或阻止）。所有关卡都能用，但关掉页面后勾选记录可能会丢失。",
      storageWriteFailed: "提示：最新进度没能保存（存储空间可能已满或被阻止）。",
      storageCorrupt: "保存的进度损坏了，已重新开始。抱歉！可以选任意一关继续。",
      footer: "用于配合 Scratch 学习。与 Scratch 及 MIT 媒体实验室无关联。可离线使用。无账号、无追踪。",
      notFound: "页面不存在，回到地图。"
    }
  };

  /* ───────────── helpers ───────────── */
  function lang() { return store.get().lang; }
  function u(key) { return UI[lang()][key]; }
  function L(obj, forced) { return obj[forced || lang()]; }
  function otherLang(l) { return l === "en" ? "zh" : "en"; }
  function htmlLang(l) { return l === "zh" ? "zh-CN" : "en"; }
  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function $(sel) { return document.querySelector(sel); }
  function getLesson(id) {
    for (var i = 0; i < C.lessons.length; i++) if (C.lessons[i].id === id) return C.lessons[i];
    return null;
  }
  function screensFor(lesson) {
    var s = [{ type: "intro" }];
    lesson.steps.forEach(function (_, i) { s.push({ type: "step", step: i }); });
    s.push({ type: "check" }, { type: "finish" });
    return s;
  }
  function minutesElapsed() { return Math.floor((Date.now() - ui.sessionStart) / 60000); }
  function announce(msg) {
    var live = $("#live");
    if (!live) return;
    live.textContent = "";
    window.setTimeout(function () { live.textContent = msg; }, 30);
  }
  function lessonStatus(id) {
    var rec = store.getLesson(id);
    if (rec.done) return "done";
    if (rec.tried.length || rec.skipped.length || rec.checks.length || rec.screen > 0 || Object.keys(rec.hints).length) return "progress";
    return "fresh";
  }
  function doneCount() {
    return C.lessons.filter(function (l) { return store.getLesson(l.id).done; }).length;
  }
  function continueTarget() {
    var cur = store.get().current;
    var curLesson = getLesson(cur.lesson) || C.lessons[0];
    var max = screensFor(curLesson).length - 1;
    if (!store.getLesson(curLesson.id).done) return { lesson: curLesson.id, screen: Math.min(cur.screen, max) };
    for (var i = 0; i < C.lessons.length; i++) {
      var l = C.lessons[(curLesson.id + i) % C.lessons.length];
      if (!store.getLesson(l.id).done) return { lesson: l.id, screen: Math.min(store.getLesson(l.id).screen, screensFor(l).length - 1) };
    }
    return null;
  }

  /* ───────────── routing ───────────── */
  function parseRoute() {
    var h = (window.location.hash || "").replace(/^#/, "");
    if (h === "" || h === "/") return { name: "home" };
    if (h === "/parent") return { name: "parent" };
    var m = h.match(/^\/lesson\/(\d+)(?:\/(\d+))?$/);
    if (m) {
      var lesson = getLesson(Number(m[1]));
      if (!lesson) return { name: "home", notFound: true };
      var screen = m[2] === undefined ? store.getLesson(lesson.id).screen : Number(m[2]);
      var max = screensFor(lesson).length - 1;
      return { name: "lesson", lesson: lesson.id, screen: Math.max(0, Math.min(max, screen)) };
    }
    var lv = h.match(/^\/levelup\/(\d+)$/);
    if (lv && getLesson(Number(lv[1]))) return { name: "levelup", lesson: Number(lv[1]) };
    return { name: "home", notFound: true };
  }
  function go(hash) {
    if (window.location.hash === hash) render(true);
    else window.location.hash = hash;
  }
  function lessonHash(id, screen) { return "#/lesson/" + id + "/" + screen; }

  /* ───────────── mascot (inline SVG, our own drawing) ───────────── */
  function mascot(size) {
    return '<svg class="mascot" width="' + size + '" height="' + size + '" viewBox="0 0 64 64" aria-hidden="true" focusable="false">' +
      '<rect x="29" y="2" width="6" height="10" rx="2" fill="#2b3a67"/><circle cx="32" cy="4" r="4" fill="#ffcc33" stroke="#2b3a67" stroke-width="2"/>' +
      '<rect x="8" y="12" width="48" height="36" rx="10" fill="#4cc3ff" stroke="#2b3a67" stroke-width="3"/>' +
      '<rect x="15" y="20" width="34" height="18" rx="6" fill="#ffffff" stroke="#2b3a67" stroke-width="2"/>' +
      '<circle cx="25" cy="29" r="4" fill="#2b3a67"/><circle cx="39" cy="29" r="4" fill="#2b3a67"/>' +
      '<circle cx="26.5" cy="27.5" r="1.3" fill="#fff"/><circle cx="40.5" cy="27.5" r="1.3" fill="#fff"/>' +
      '<path d="M26 41 Q32 46 38 41" stroke="#2b3a67" stroke-width="3" fill="none" stroke-linecap="round"/>' +
      '<rect x="16" y="50" width="12" height="10" rx="3" fill="#ff8a3d" stroke="#2b3a67" stroke-width="2.5"/>' +
      '<rect x="36" y="50" width="12" height="10" rx="3" fill="#ff8a3d" stroke="#2b3a67" stroke-width="2.5"/>' +
      '</svg>';
  }

  /* ───────────── block rendering ───────────── */
  function renderBlocks(blocks, forced) {
    var l = forced || lang();
    var o = otherLang(l);
    return '<div class="blocks" role="list">' + blocks.map(function (bl) {
      var indent = Math.min(bl.indent || 0, 5);
      if (bl.cat === "note") {
        return '<div role="listitem" class="blk blk-note" style="--indent:' + indent + '"><span class="blk-main" lang="' + htmlLang(l) + '">' + esc(bl[l]) + "</span></div>";
      }
      var cat = C.CATEGORIES[bl.cat];
      return '<div role="listitem" class="blk cat-' + esc(bl.cat) + '" style="--indent:' + indent + '">' +
        '<span class="blk-cat">' + esc(cat[l]) + "</span>" +
        '<span class="blk-main" lang="' + htmlLang(l) + '">' + esc(bl[l]) + "</span>" +
        '<span class="blk-alt" lang="' + htmlLang(o) + '">' + esc(bl[o]) + "</span>" +
        "</div>";
    }).join("") + "</div>";
  }
  function renderList(items, forced) {
    return '<ol class="hint-list">' + items.map(function (it) { return "<li>" + esc(L(it, forced)) + "</li>"; }).join("") + "</ol>";
  }

  /* ───────────── header / banners / footer ───────────── */
  function renderHeader(route) {
    var n = minutesElapsed();
    var isParent = route.name === "parent";
    return '<a class="skip-link" href="#main" data-action="skip">' + esc(isParent ? "跳到主要内容" : u("skip")) + "</a>" +
      '<header class="topbar">' +
      '<a class="brand" href="#/">' + mascot(40) + '<span class="brand-text"><span class="brand-name">' + esc(u("brand")) + '</span><span class="brand-sub">' + esc(u("brandSub")) + "</span></span></a>" +
      '<div class="top-actions">' +
      '<span class="chip timer-chip" id="timer-chip" role="img" aria-label="' + esc(u("timerAria")(n)) + '">' + esc(u("minutes")(n)) + "</span>" +
      '<button type="button" class="btn btn-small" id="btn-lang" data-action="toggle-lang" lang="' + htmlLang(otherLang(lang())) + '" aria-label="' + esc(u("langToggleAria")) + '">🌐 ' + esc(u("langToggle")) + "</button>" +
      (isParent
        ? '<a class="btn btn-small" id="btn-parent" href="#/">' + esc(lang() === "zh" ? "孩子页面" : "Kid view") + "</a>"
        : '<a class="btn btn-small" id="btn-parent" href="#/parent" lang="zh-CN">' + esc(u("parents")) + "</a>") +
      "</div></header>";
  }

  function renderBanners(route) {
    var out = "";
    var st = store.getStatus();
    var zhPage = route && route.name === "parent";
    var text = function (key) { return zhPage ? UI.zh[key] : u(key); };
    if (st === "unavailable") out += '<div class="banner banner-warn" role="status" id="banner-storage">⚠️ ' + esc(text("storageUnavailable")) + "</div>";
    if (st === "writeFailed") out += '<div class="banner banner-warn" role="status" id="banner-storage">⚠️ ' + esc(text("storageWriteFailed")) + "</div>";
    if (st === "corrupt") {
      out += '<div class="banner banner-warn" role="alert" id="banner-storage">⚠️ ' + esc(text("storageCorrupt")) +
        ' <button type="button" class="btn btn-small" data-action="ack-storage" id="btn-ack-storage">' + esc(text("ok")) + "</button></div>";
    }
    var mins = store.get().sessionMinutes;
    if (mins > 0 && !ui.breakDismissed && minutesElapsed() >= mins) {
      out += '<div class="banner banner-break" role="status" id="banner-break">🧃 ' + esc(text("breakMsg")(mins)) +
        ' <button type="button" class="btn btn-small" data-action="dismiss-break" id="btn-dismiss-break">' + esc(text("ok")) + "</button></div>";
    }
    return out;
  }

  /* ───────────── home ───────────── */
  function renderHome(route) {
    var target = continueTarget();
    var anyProgress = C.lessons.some(function (l) { return lessonStatus(l.id) !== "fresh"; });
    var cta;
    if (!target) {
      cta = '<p class="all-done">' + esc(u("allDone")) + "</p>";
    } else if (!anyProgress) {
      cta = '<a class="btn btn-primary btn-big" id="btn-continue" href="' + lessonHash(1, 0) + '">' + esc(u("startBtn")) + "</a>";
    } else {
      var tl = getLesson(target.lesson);
      cta = '<a class="btn btn-primary btn-big" id="btn-continue" href="' + lessonHash(target.lesson, target.screen) + '">' + esc(u("continueBtn")(tl.id, L(tl.title))) + "</a>";
    }
    function mapItem(l) {
      var st = lessonStatus(l.id);
      return '<li class="map-item map-' + st + '">' +
        '<a class="map-card" id="map-level-' + l.id + '" href="' + lessonHash(l.id, store.getLesson(l.id).screen) + '">' +
        '<span class="map-icon" aria-hidden="true">' + l.icon + "</span>" +
        '<span class="map-body"><span class="map-level">' + esc(u("level")(l.id)) + '</span><span class="map-title">' + esc(L(l.title)) + '</span><span class="map-concept">' + esc(L(l.concept)) + "</span></span>" +
        '<span class="badge badge-' + st + '">' + esc(u("status")[st]) + "</span>" +
        "</a></li>";
    }
    var tracks = [];
    C.lessons.forEach(function (l) { var tr = l.track || "quest"; if (tracks.indexOf(tr) === -1) tracks.push(tr); });
    var map = tracks.map(function (tr) {
      var items = C.lessons.filter(function (l) { return (l.track || "quest") === tr; });
      return '<section class="track" aria-labelledby="track-' + tr + '"><h3 id="track-' + tr + '" class="track-title">' + esc(u("trackTitle")[tr]) + "</h3>" +
        '<p class="muted">' + esc(u("trackNote")[tr]) + "</p>" +
        '<ol class="quest-map">' + items.map(mapItem).join("") + "</ol></section>";
    }).join("");
    return (route.notFound ? '<p class="banner banner-warn" role="status">' + esc(u("notFound")) + "</p>" : "") +
      '<section class="card hero-card">' +
      '<div class="hero-row">' + mascot(84) + '<div><h1 tabindex="-1" data-autofocus>' + esc(u("homeTitle")) + "</h1><p>" + esc(u("homeSub")) + "</p></div></div>" +
      cta +
      "</section>" +
      '<section class="card"><h2>' + esc(u("howTitle")) + "</h2>" +
      '<ol class="how-list">' + u("how").map(function (s) { return "<li>" + esc(s) + "</li>"; }).join("") + "</ol>" +
      '<p><a class="btn btn-secondary" href="https://scratch.mit.edu/projects/editor/" target="_blank" rel="noopener noreferrer">' + esc(u("openScratch")) + "</a></p>" +
      '<p class="muted">' + esc(u("desktopNote")) + "</p>" +
      '<p class="note-box">🔍 ' + esc(u("cantSee")) + "</p>" +
      (C.glossary ? '<details class="glossary" id="glossary"><summary>' + esc(u("glossaryTitle")) + '</summary><dl class="glossary-dl">' +
        C.glossary.map(function (g) { return "<dt>" + esc(L(g.term)) + ' <span class="muted" lang="' + htmlLang(otherLang(lang())) + '">' + esc(g.term[otherLang(lang())]) + "</span></dt><dd>" + esc(L(g.def)) + "</dd>"; }).join("") +
        "</dl></details>" : "") + "</section>" +
      '<section class="card"><div class="map-head"><h2>' + esc(u("mapTitle")) + '</h2><span class="chip">' + esc(u("levelsDone")(doneCount(), C.lessons.length)) + "</span></div>" +
      map + "</section>";
  }

  /* ───────────── lesson ───────────── */
  function screenLabel(sc) {
    if (sc.type === "intro") return u("screenIntro");
    if (sc.type === "step") return u("screenStep")(sc.step + 1);
    if (sc.type === "check") return u("screenCheck");
    return u("screenFinish");
  }

  function renderStepper(lesson, current) {
    var rec = store.getLesson(lesson.id);
    return '<nav class="stepper" aria-label="' + esc(u("screenNav")) + '"><ol>' + screensFor(lesson).map(function (sc, i) {
      var cls = "stepper-dot";
      if (i === current) cls += " is-current";
      if (sc.type === "step" && rec.tried.indexOf(sc.step) !== -1) cls += " is-tried";
      if (sc.type === "step" && rec.skipped.indexOf(sc.step) !== -1) cls += " is-skipped";
      return '<li><a class="' + cls + '" id="stepper-' + i + '" href="' + lessonHash(lesson.id, i) + '"' + (i === current ? ' aria-current="step"' : "") + ">" + esc(screenLabel(sc)) + "</a></li>";
    }).join("") + "</ol></nav>";
  }

  function renderProblems(lesson) {
    if (!ui.problemsOpen) return "";
    return '<section class="problems" id="problems" aria-labelledby="problems-title">' +
      '<h2 id="problems-title" tabindex="-1">' + esc(u("troubleTitle")) + "</h2><p class=\"muted\">" + esc(u("troubleTip")) + "</p>" +
      lesson.problems.map(function (p, i) {
        return '<details class="problem" id="problem-' + i + '"><summary>' + esc(L(p.symptom)) + "</summary><p>" + esc(L(p.fix)) + "</p></details>";
      }).join("") +
      '<p class="note-box">' + esc(u("stillStuck")) + "</p></section>";
  }

  function troubleButton() {
    return '<button type="button" class="btn btn-trouble" id="btn-trouble" data-action="toggle-problems" aria-expanded="' + (ui.problemsOpen ? "true" : "false") + '" aria-controls="problems">' + esc(u("trouble")) + "</button>";
  }

  function renderIntro(lesson) {
    return '<p class="eyebrow">' + esc(u("bigIdea")) + "</p>" +
      '<h1 tabindex="-1" data-autofocus><span aria-hidden="true">' + lesson.icon + "</span> " + esc(u("level")(lesson.id)) + ": " + esc(L(lesson.title)) + "</h1>" +
      '<p class="concept">🧠 ' + esc(L(lesson.concept)) + "</p>" +
      '<div class="goal-box"><h2>' + esc(u("mission")) + "</h2><p>" + esc(L(lesson.goal)) + "</p></div>" +
      renderPrereqAndSetup(lesson) +
      "<h2>" + esc(u("blocksTitle")) + "</h2>" + renderBlocks(lesson.blocks.map(function (b) { return { cat: b.cat, en: b.en, zh: b.zh, indent: 0 }; })) +
      '<div class="predict"><h2>' + esc(u("predictTitle")) + '</h2><p class="predict-q">' + esc(L(lesson.predict.q)) + "</p>" +
      '<p class="muted">' + esc(u("predictTip")) + "</p>" +
      '<button type="button" class="btn btn-secondary" id="btn-predict" data-action="toggle-predict" aria-expanded="' + (ui.predictOpen ? "true" : "false") + '" aria-controls="predict-answer">' + esc(ui.predictOpen ? u("hideAnswer") : u("showAnswer")) + "</button>" +
      '<div id="predict-answer" class="predict-a"' + (ui.predictOpen ? "" : " hidden") + "><p>" + esc(L(lesson.predict.a)) + "</p></div></div>" +
      '<div class="actions"><button type="button" class="btn btn-primary btn-big" id="btn-next" data-action="next">' + esc(u("letsBuild")) + "</button></div>" +
      renderParentGuide(lesson);
  }

  function renderPrereqAndSetup(lesson) {
    var out = "";
    if (lesson.prereqs) {
      out += '<div class="prereq-box"><h2>' + esc(u("prereqTitle")) + "</h2><p>" + esc(L(lesson.prereqs)) + "</p>";
      if (lesson.requires && lesson.requires.length) {
        out += '<p class="muted">' + lesson.requires.map(function (id) {
          var r = getLesson(id);
          return r ? '<a href="' + lessonHash(id, 0) + '">' + esc(u("level")(id) + " · " + L(r.title)) + "</a>" : "";
        }).join(" · ") + "</p>";
      }
      out += "</div>";
    }
    var su = lesson.setup;
    if (su) {
      out += '<div class="setup-box"><h2>' + esc(u("setupTitle")) + "</h2><dl class=\"setup-dl\">" +
        "<dt>" + esc(u("setupProject")) + "</dt><dd>" + esc(L(su.project)) + "</dd>";
      if (su.sprites && su.sprites.length) {
        out += "<dt>" + esc(u("setupSprites")) + '</dt><dd><ul class="setup-list">' + su.sprites.map(function (sp) {
          return '<li><strong class="name-chip">' + esc(sp.name) + "</strong> " + esc(L(sp.role)) + "</li>";
        }).join("") + "</ul></dd>";
      }
      if (su.variables && su.variables.length) {
        out += "<dt>" + esc(u("setupVars")) + '</dt><dd><ul class="setup-list">' + su.variables.map(function (v) {
          var scope = v.scope === "sprite" ? u("scopeSprite") + (v.owner ? " · " + u("scopeOn")(v.owner) : "") : u("scopeAll");
          return '<li><strong class="name-chip var-chip">' + esc(v.name) + '</strong> <span class="scope scope-' + esc(v.scope) + '">' + esc(scope) + "</span> " + esc(L(v.role)) + "</li>";
        }).join("") + "</ul></dd>";
      }
      if (su.messages && su.messages.length) {
        out += "<dt>" + esc(u("setupMsgs")) + '</dt><dd><ul class="setup-list">' + su.messages.map(function (m) {
          return '<li><strong class="name-chip msg-chip">' + esc(m.name) + "</strong> " + esc(L(m.role)) + "</li>";
        }).join("") + "</ul></dd>";
      }
      if (su.backdrops && su.backdrops.length) {
        out += "<dt>" + esc(u("setupBackdrops")) + '</dt><dd><ul class="setup-list">' + su.backdrops.map(function (bd) {
          return '<li><strong class="name-chip">' + esc(bd.name) + "</strong> " + esc(L(bd.role)) + "</li>";
        }).join("") + "</ul></dd>";
      }
      out += "</dl>";
      if (lesson.init) out += '<p class="init-line"><strong>' + esc(u("initTitle")) + ":</strong> " + esc(L(lesson.init)) + "</p>";
      out += "</div>";
    }
    return out;
  }

  function renderParentGuide(lesson) {
    var g = lesson.parentGuide;
    if (!g) return "";
    return '<details class="parent-guide" id="parent-guide" lang="zh-CN"><summary>' + esc(u("parentDetails")) + "</summary>" +
      "<p><strong>本关重点：</strong>" + esc(g.focus) + "</p>" +
      "<p><strong>可以问孩子：</strong></p><ul>" + g.ask.map(function (q) { return "<li>" + esc(q) + "</li>"; }).join("") + "</ul>" +
      "<p><strong>注意：</strong>" + esc(g.avoid) + "</p></details>";
  }

  function renderHint(h, level) {
    var body = "<p>" + esc(L(h)) + "</p>";
    if (h.blocks) body += renderBlocks(h.blocks);
    if (h.list) body += renderList(h.list);
    return '<div class="hint hint-' + (level + 1) + '" id="hint-' + (level + 1) + '"><h3 tabindex="-1">' + esc(u("hintNames")[level]) + "</h3>" + body + "</div>";
  }

  function renderStep(lesson, stepIdx) {
    var step = lesson.steps[stepIdx];
    var rec = store.getLesson(lesson.id);
    var level = rec.hints[stepIdx] || 0;
    var tried = rec.tried.indexOf(stepIdx) !== -1;
    var skipped = rec.skipped.indexOf(stepIdx) !== -1;
    var hints = "";
    for (var i = 0; i < level; i++) hints += renderHint(step.hints[i], i);
    if (level >= 3) hints += '<p class="note-box">' + esc(u("noMoreHints")) + "</p>";
    return '<p class="eyebrow">' + esc(u("stepOf")(stepIdx + 1, lesson.steps.length)) + "</p>" +
      '<h1 tabindex="-1" data-autofocus>' + esc(L(step.title)) + "</h1>" +
      '<p class="where">' + esc(u("where")) + " <strong>" + esc(L(step.where)) + "</strong></p>" +
      '<ol class="do-list">' + step.do.map(function (d) { return "<li>" + esc(L(d)) + "</li>"; }).join("") + "</ol>" +
      (step.show ? '<div class="build-box" id="build-box"><h2>' + esc(u("buildTitle")) + "</h2><p>" + esc(L(step.show)) + "</p>" + renderBlocks(step.show.blocks) + "</div>" : "") +
      (tried ? '<p class="status-line ok">' + esc(u("triedMark")) + "</p>" : "") +
      (skipped ? '<p class="status-line skip">' + esc(u("skippedMark")) + "</p>" : "") +
      '<div class="actions">' +
      '<button type="button" class="btn btn-primary btn-big" id="btn-tried" data-action="tried">' + esc(tried ? u("triedAgain") : u("tried")) + "</button>" +
      '<button type="button" class="btn btn-hint" id="btn-hint" data-action="hint" aria-controls="hints">' + esc(level >= 3 ? u("hintAll") : u("hintBtn")(level + 1)) + "</button>" +
      troubleButton() +
      "</div>" +
      '<section class="hints" id="hints" aria-label="' + esc(lang() === "zh" ? "提示" : "Hints") + '">' + hints + "</section>" +
      renderProblems(lesson);
  }

  function renderCheck(lesson) {
    var rec = store.getLesson(lesson.id);
    var items = lesson.check.map(function (c, i) {
      var on = rec.checks.indexOf(i) !== -1;
      return '<li><label class="check-item" for="check-' + i + '"><input type="checkbox" id="check-' + i + '" data-action="check" data-idx="' + i + '"' + (on ? " checked" : "") + "><span>" + esc(L(c)) + "</span></label></li>";
    }).join("");
    return '<h1 tabindex="-1" data-autofocus>' + esc(u("checkTitle")) + "</h1>" +
      "<p>" + esc(u("checkIntro")) + "</p>" +
      '<p class="note-box">🔍 ' + esc(u("checkNote")) + "</p>" +
      '<ul class="checklist">' + items + "</ul>" +
      '<p class="muted" id="check-count" aria-live="polite">' + esc(u("checkCount")(rec.checks.length, lesson.check.length)) + "</p>" +
      (rec.checks.length < lesson.check.length ? '<p class="muted">' + esc(u("checkOk")) + "</p>" : "") +
      '<div class="actions"><button type="button" class="btn btn-primary btn-big" id="btn-next" data-action="next">' + esc(u("next")) + "</button>" + troubleButton() + "</div>" +
      renderProblems(lesson);
  }

  function renderFinish(lesson) {
    var rec = store.getLesson(lesson.id);
    var ch = lesson.challenge;
    var chHint = "<p>" + esc(L(ch.hint)) + "</p>" + (ch.hint.blocks ? renderBlocks(ch.hint.blocks) : "") + (ch.hint.list ? renderList(ch.hint.list) : "");
    var feelings = ["easy", "ok", "hard"].map(function (f) {
      return '<button type="button" class="btn btn-feel" id="feel-' + f + '" data-action="feeling" data-feeling="' + f + '" aria-pressed="' + (rec.feeling === f ? "true" : "false") + '">' + esc(u("feel")[f]) + "</button>";
    }).join("");
    return '<h1 tabindex="-1" data-autofocus>' + esc(u("finishTitle")) + "</h1>" +
      '<section class="challenge"><h2>' + esc(u("challengeTitle")) + ": " + esc(L(ch.title)) + "</h2><p>" + esc(L(ch.text)) + "</p>" +
      '<button type="button" class="btn btn-secondary" id="btn-challenge-hint" data-action="toggle-challenge-hint" aria-expanded="' + (ui.challengeHintOpen ? "true" : "false") + '" aria-controls="challenge-hint">' + esc(ui.challengeHintOpen ? u("challengeHintHide") : u("challengeHint")) + "</button>" +
      '<div id="challenge-hint" class="hint hint-3"' + (ui.challengeHintOpen ? "" : " hidden") + ">" + chHint + "</div>" +
      '<label class="check-item" for="challenge-done"><input type="checkbox" id="challenge-done" data-action="challenge-done"' + (rec.challengeDone ? " checked" : "") + "><span>" + esc(u("challengeDone")) + "</span></label>" +
      "</section>" +
      '<section class="reflect"><h2>' + esc(u("reflectTitle")) + '</h2><p class="predict-q">' + esc(L(lesson.reflect)) + '</p><p class="muted">' + esc(u("reflectTip")) + "</p>" +
      '<h3 id="feel-title">' + esc(u("feelTitle")) + '</h3><div class="feel-row" role="group" aria-labelledby="feel-title">' + feelings + "</div></section>" +
      '<div class="actions"><button type="button" class="btn btn-primary btn-big" id="btn-finish" data-action="finish">' + esc(u("finishBtn")(lesson.id)) + "</button>" +
      '<button type="button" class="btn btn-secondary" id="btn-redo" data-action="redo">' + esc(u("redo")) + "</button></div>";
  }

  function renderLesson(route) {
    var lesson = getLesson(route.lesson);
    var screens = screensFor(lesson);
    var sc = screens[route.screen];
    var body;
    if (sc.type === "intro") body = renderIntro(lesson);
    else if (sc.type === "step") body = renderStep(lesson, sc.step);
    else if (sc.type === "check") body = renderCheck(lesson);
    else body = renderFinish(lesson);

    var prevHref = route.screen > 0 ? lessonHash(lesson.id, route.screen - 1) : "#/";
    var nav = '<div class="bottom-nav"><a class="btn btn-secondary" id="btn-back" href="' + prevHref + '">' + esc(route.screen > 0 ? u("back") : u("map")) + "</a>";
    if (sc.type === "step") nav += '<button type="button" class="btn btn-ghost" id="btn-skip" data-action="skip-step">' + esc(u("skipStep")) + "</button>";
    nav += "</div>";

    return '<div class="lesson-head"><a class="btn btn-ghost btn-small" id="btn-map" href="#/">' + esc(u("map")) + '</a><span class="chip">' + esc(u("levelOf")(lesson.id, C.lessons.length)) + " · " + esc(L(lesson.title)) + "</span></div>" +
      renderStepper(lesson, route.screen) +
      '<section class="card lesson-card screen-' + sc.type + '">' + body + "</section>" + nav;
  }

  function renderLevelUp(route) {
    var lesson = getLesson(route.lesson);
    var isLast = lesson.id === C.lessons.length;
    var nextLesson = getLesson(lesson.id + 1);
    var endsTrack = !isLast && nextLesson && (nextLesson.track || "quest") !== (lesson.track || "quest");
    var nextBtn = isLast ? "" : '<a class="btn btn-primary btn-big" id="btn-next-level" href="' + lessonHash(lesson.id + 1, store.getLesson(lesson.id + 1).screen) + '">' + esc(u("nextLevel")(lesson.id + 1)) + "</a>";
    return '<section class="card levelup-card">' +
      '<div class="stars" aria-hidden="true">⭐ 🌟 ⭐</div>' + mascot(96) +
      '<h1 tabindex="-1" data-autofocus>' + esc(isLast ? u("allDoneTitle")(C.lessons.length) : endsTrack ? u("questDoneTitle") : u("levelupTitle")(lesson.id)) + "</h1>" +
      "<p>" + esc(isLast ? u("allDoneBody") : endsTrack ? u("questDoneBody") : u("levelupBody")) + "</p>" +
      (endsTrack ? "<p>" + esc(u("levelupBody")) + "</p>" : "") +
      (isLast ? "<p>" + esc(u("levelupBody")) + "</p>" : "") +
      '<div class="actions">' + nextBtn + '<a class="btn btn-secondary" id="btn-back-map" href="#/">' + esc(u("backMap")) + "</a></div></section>";
  }

  /* ───────────── parent page (always Chinese) ───────────── */
  function renderParent() {
    var d = store.get();
    var st = store.getStatus();
    var feelZh = { easy: "简单", ok: "还行", hard: "有点难" };
    var progress = C.lessons.map(function (l) {
      var r = store.getLesson(l.id);
      var s = lessonStatus(l.id);
      var maxHint = 0;
      Object.keys(r.hints).forEach(function (k) { maxHint = Math.max(maxHint, r.hints[k]); });
      return '<li class="p-card"><h3>' + l.icon + " 第 " + l.id + " 关 · " + esc(l.title.zh) + ' <span class="badge badge-' + s + '">' + esc(UI.zh.status[s]) + "</span></h3>" +
        '<dl class="p-dl">' +
        "<dt>标记“试过了”的步骤</dt><dd>" + r.tried.length + " / " + l.steps.length + (r.skipped.length ? "（跳过 " + r.skipped.length + " 步）" : "") + "</dd>" +
        "<dt>看到的最高提示级别</dt><dd>" + (maxHint ? "提示 " + maxHint : "未看提示") + "</dd>" +
        "<dt>测试自查勾选</dt><dd>" + r.checks.length + " / " + l.check.length + "</dd>" +
        "<dt>可选挑战</dt><dd>" + (r.challengeDone ? "孩子标记已完成" : "—") + "</dd>" +
        "<dt>孩子的感受</dt><dd>" + (r.feeling ? feelZh[r.feeling] : "—") + "</dd>" +
        "</dl></li>";
    }).join("");

    var langRadios = [["en", "English（默认，推荐练习简单英语）"], ["zh", "简体中文"]].map(function (o) {
      return '<label class="radio"><input type="radio" name="p-lang" id="p-lang-' + o[0] + '" data-action="p-lang" value="' + o[0] + '"' + (d.lang === o[0] ? " checked" : "") + "> " + esc(o[1]) + "</label>";
    }).join("");
    var minuteRadios = [[15, "15 分钟"], [20, "20 分钟（默认）"], [25, "25 分钟"], [30, "30 分钟"], [0, "不提醒"]].map(function (o) {
      return '<label class="radio"><input type="radio" name="p-min" id="p-min-' + o[0] + '" data-action="p-min" value="' + o[0] + '"' + (d.sessionMinutes === o[0] ? " checked" : "") + "> " + esc(o[1]) + "</label>";
    }).join("");

    var storageLine = st === "unavailable" ? "当前浏览器<strong>无法保存</strong>记录（存储被关闭或阻止），关闭页面后记录会丢失。"
      : st === "writeFailed" ? "最近一次保存<strong>失败</strong>（存储可能已满或被阻止）。"
      : "记录保存在本浏览器的 localStorage 中" + (d.updatedAt ? "，最近更新：" + esc(new Date(d.updatedAt).toLocaleString("zh-CN")) : "") + "。";

    var overview = C.lessons.map(function (l) {
      var g = l.parentGuide;
      return "<li><strong>第 " + l.id + " 关 " + esc(l.title.zh) + "</strong>：" + esc(l.concept.zh) +
        (l.prereqs ? '<br><span class="muted">前置知识：' + esc(l.prereqs.zh) + "</span>" : "") +
        '<br><span class="muted">陪伴要点：' + esc(g ? g.focus : C.parentNotes[l.id]) + "</span>" +
        (g ? '<br><span class="muted">可以问：' + esc(g.ask.join(" / ")) + "</span>" : "") + "</li>";
    }).join("");

    var scripts = C.finalScripts.map(function (s) {
      return "<h4>角色：" + esc(s.sprite) + "</h4>" + renderBlocks(s.blocks, "zh");
    }).join("");
    var arcadeScripts = C.lessons.filter(function (l) { return l.reference; }).map(function (l) {
      return '<details class="ref-scripts" id="p-scripts-' + l.id + '"><summary>第 ' + l.id + " 关 · " + esc(l.title.zh) + " 参考脚本</summary>" +
        l.reference.map(function (s) { return "<h4>角色：" + esc(s.sprite) + "</h4>" + renderBlocks(s.blocks, "zh"); }).join("") + "</details>";
    }).join("");

    return '<div lang="zh-CN">' +
      '<section class="card"><h1 tabindex="-1" data-autofocus>家长页</h1>' +
      "<p>“Scratch 小教练 · 积木大冒险”是放在 Scratch 编辑器旁边使用的<strong>离线教学助手</strong>。孩子在官方 Scratch（网页版或桌面版）里自己搭积木，在这里看任务、逐级获取提示、记录自查。主线第 1–8 关连起来做成一个完整可玩的 2D 卡通闯关游戏；之后的“街机”关卡各自新建一个小游戏，用同样的概念解决新问题。</p>" +
      '<div class="note-box"><strong>请注意：</strong>本应用<strong>看不到</strong>孩子的 Scratch 项目，也<strong>不会</strong>自动检查代码对不对。“我试过了”、测试勾选和挑战标记都是孩子自己点的，只反映他的自我感受，<strong>不等于</strong>客观的能力评估。最可靠的检查方式是让孩子演示一遍游戏，并讲讲某个积木为什么这么放。</div>' +
      '<p><a class="btn btn-secondary" href="#/" id="p-back">← 回到孩子页面</a></p></section>' +

      '<section class="card" id="p-guide"><h2>第一次陪孩子使用：五分钟指南</h2><ol class="guide-list">' +
      "<li><strong>第 0–1 分钟 · 摆好窗口：</strong>左边打开 Scratch（在线 scratch.mit.edu 或桌面版），右边打开本页面，把窗口拉窄放在旁边。</li>" +
      "<li><strong>第 1–2 分钟 · 说清规则：</strong>“游戏是你自己做的，小教练只给任务和提示；它看不到你的作品，测试要靠你自己。”</li>" +
      "<li><strong>第 2–3 分钟 · 看地图：</strong>点“开始第 1 关”，一起读任务和“先预测一下”的问题，让孩子先说出猜想，再点“看答案”。</li>" +
      "<li><strong>第 3–4 分钟 · 做第一步：</strong>让孩子自己操作鼠标，您只提问不动手。卡住时先点“给我一点提示”，提示 1 → 2 → 3 逐级打开。</li>" +
      "<li><strong>第 4–5 分钟 · 定好节奏：</strong>告诉孩子做完一步就点“我试过了”；约定本次学习时长（默认 20 分钟），结束前记得在 Scratch 里“文件 → 保存到你的电脑”。</li>" +
      "</ol></section>" +

      '<section class="card"><h2>如何陪伴</h2><ul class="tips">' +
      "<li><strong>多问少教：</strong>用“你觉得会发生什么？”“哪个角色负责这件事？”代替直接告诉答案。</li>" +
      "<li><strong>先预测再运行：</strong>每关开头的预测问题，让孩子先说出来，再到 Scratch 验证。猜错也是收获。</li>" +
      "<li><strong>提示按顺序开：</strong>提示 1 引导观察，提示 2 提示积木分类，提示 3 才给本步骤的积木顺序，不会一次给完整答案。</li>" +
      "<li><strong>卡住时：</strong>点“遇到问题”看常见原因；仍不行就一起“一次只查一个角色”。</li>" +
      "<li><strong>允许跳过和重做：</strong>没有惩罚，也没有排行榜。孩子累了就停下，下次点“继续学习”。</li>" +
      "<li><strong>鼓励讲解：</strong>第 8 关要求孩子讲解一个概念，这是检验理解的好机会。</li>" +
      "</ul></section>" +

      '<section class="card" id="p-progress"><h2>孩子自行标记的进度</h2>' +
      "<p>已完成 <strong>" + doneCount() + " / " + C.lessons.length + "</strong> 关（孩子自己点“完成”）。以下数据仅为自查记录，不代表能力评估。</p>" +
      '<ul class="p-list">' + progress + "</ul></section>" +

      '<section class="card" id="p-settings"><h2>设置</h2>' +
      '<fieldset><legend>孩子界面语言</legend>' + langRadios + '<p class="muted">孩子页面右上角也可以随时切换。积木名称始终同时显示中英文。家长页始终为中文。</p></fieldset>' +
      '<fieldset><legend>建议每次学习时长</legend>' + minuteRadios + '<p class="muted">到时间后只会温和地提醒“保存作品、休息一下”，不会锁定或惩罚。计时从打开页面开始，刷新页面会重新计时。</p></fieldset>' +
      '<p class="status-msg" id="p-msg" role="status">' + esc(ui.parentMsg) + "</p></section>" +

      '<section class="card" id="p-privacy"><h2>隐私与本地记录</h2><ul class="tips">' +
      "<li>本应用<strong>不联网</strong>：不加载远程字体、CDN、图片或分析工具，没有账号、登录或上传功能。（只有您点击“打开在线 Scratch”链接时，浏览器才会访问 Scratch 官网。）</li>" +
      "<li><strong>不收集</strong>孩子的姓名、生日、学校、照片或声音；没有摄像头、麦克风、公开分享或实时 AI 功能。</li>" +
      "<li>保存的只有：界面语言、建议时长、每关的步骤标记、提示级别、勾选和感受。</li>" +
      "<li>" + storageLine + "</li>" +
      "<li><strong>同一台电脑、同一个浏览器的其他使用者可能看到这些记录。</strong>如需清除，请使用下方按钮，或在浏览器设置中清除本站数据。</li>" +
      "</ul>" +
      '<button type="button" class="btn btn-danger" id="p-clear" data-action="clear-all">🗑 清除本地记录</button></section>' +

      '<section class="card"><h2>课程概览（家长版）</h2><ol class="overview">' + overview + "</ol></section>" +

      '<section class="card"><h2>完整脚本参考（家长用）</h2><p>这是主线完成第 1–6 关后游戏的参考脚本，以及每个街机关卡的参考脚本，方便您在孩子卡住时对照。建议不要直接给孩子看完整答案，先引导他使用逐级提示。</p>' +
      '<details class="ref-scripts" id="p-scripts"><summary>主线（第 1–6 关）参考脚本</summary>' + scripts + "</details>" + arcadeScripts + "</section>" +

      '<section class="card"><h2>常见故障</h2><ul class="tips">' +
      "<li><strong>页面顶部提示“无法保存进度”：</strong>浏览器可能处于无痕/隐私模式，或禁用了网站数据。课程仍可正常使用，但关闭页面后记录会丢失。</li>" +
      "<li><strong>提示“保存的进度损坏”：</strong>记录已自动重置，不影响使用。孩子可以在地图上直接选关。</li>" +
      "<li><strong>在线 Scratch 打不开：</strong>需要网络；没有网络时请安装并使用 Scratch 桌面版，本应用本身可完全离线使用。</li>" +
      "<li><strong>找不到 .sb3 文件：</strong>在线版通常下载到“下载”文件夹；桌面版会询问保存位置。</li>" +
      "</ul></section>" +
      "</div>";
  }

  /* ───────────── confirm dialog ───────────── */
  function confirmDialog(opts) {
    return new Promise(function (resolve) {
      var root = $("#modal-root");
      var opener = document.activeElement;
      root.innerHTML = '<div class="modal-backdrop"><div class="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title" aria-describedby="modal-body"' + (opts.lang ? ' lang="' + opts.lang + '"' : "") + ">" +
        '<h2 id="modal-title">' + esc(opts.title) + '</h2><p id="modal-body">' + esc(opts.body) + "</p>" +
        '<div class="actions"><button type="button" class="btn btn-secondary" id="modal-cancel">' + esc(opts.cancel) + "</button>" +
        '<button type="button" class="btn ' + (opts.danger ? "btn-danger" : "btn-primary") + '" id="modal-confirm">' + esc(opts.confirm) + "</button></div></div></div>";
      var cancel = $("#modal-cancel");
      var confirmBtn = $("#modal-confirm");
      function close(result) {
        document.removeEventListener("keydown", onKey, true);
        root.innerHTML = "";
        resolve(result);
        if (opener && document.body.contains(opener)) opener.focus();
      }
      function onKey(e) {
        if (e.key === "Escape") { e.preventDefault(); close(false); }
        else if (e.key === "Tab") {
          var first = cancel, last = confirmBtn;
          if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
          else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
          else if (document.activeElement !== first && document.activeElement !== last) { e.preventDefault(); first.focus(); }
        }
      }
      document.addEventListener("keydown", onKey, true);
      cancel.addEventListener("click", function () { close(false); });
      confirmBtn.addEventListener("click", function () { close(true); });
      root.querySelector(".modal-backdrop").addEventListener("click", function (e) { if (e.target === e.currentTarget) close(false); });
      cancel.focus();
    });
  }

  /* ───────────── render ───────────── */
  var currentRoute = null;
  var hasRendered = false;

  function render(forceFocus) {
    var route = parseRoute();
    var key = JSON.stringify(route);
    var routeChanged = key !== ui.routeKey;
    if (routeChanged) {
      ui.routeKey = key;
      ui.problemsOpen = false;
      ui.predictOpen = false;
      ui.challengeHintOpen = false;
      if (route.name !== "parent") ui.parentMsg = "";
    }
    currentRoute = route;

    // Keep keyboard focus on the same control after re-rendering the same screen.
    var activeId = !routeChanged && document.activeElement && document.activeElement.id ? document.activeElement.id : null;

    var firstRender = !hasRendered;
    hasRendered = true;
    if (route.name === "lesson") store.setPosition(route.lesson, route.screen);

    document.documentElement.lang = route.name === "parent" ? "zh-CN" : htmlLang(lang());
    var title = route.name === "parent" ? "家长页 · Scratch 小教练" : u("brand") + " · " + u("brandSub");
    if (route.name === "lesson") title = u("level")(route.lesson) + " · " + L(getLesson(route.lesson).title) + " · " + u("brandSub");
    document.title = title;

    $("#header").innerHTML = renderHeader(route);
    $("#banners").innerHTML = renderBanners(route);
    var main;
    if (route.name === "lesson") main = renderLesson(route);
    else if (route.name === "levelup") main = renderLevelUp(route);
    else if (route.name === "parent") main = renderParent();
    else main = renderHome(route);
    $("#main").innerHTML = main;
    $("#footer").innerHTML = "<p>" + esc(route.name === "parent" ? UI.zh.footer : u("footer")) + "</p>";

    if (activeId && document.getElementById(activeId)) {
      document.getElementById(activeId).focus();
    } else if ((routeChanged && !firstRender) || forceFocus) {
      // On the very first page load focus stays at the top, so Tab reaches the skip link first.
      var target = document.querySelector("[data-autofocus]");
      if (target) target.focus({ preventScroll: false });
      window.scrollTo(0, 0);
    }
  }

  function refreshTimer() {
    var chip = $("#timer-chip");
    var n = minutesElapsed();
    if (chip) {
      chip.textContent = u("minutes")(n);
      chip.setAttribute("aria-label", u("timerAria")(n));
    }
    var banners = $("#banners");
    if (banners) {
      var html = renderBanners(currentRoute);
      if (banners.innerHTML !== html) banners.innerHTML = html;
    }
  }

  /* ───────────── actions ───────────── */
  function lessonCtx() {
    if (!currentRoute || currentRoute.name !== "lesson") return null;
    var lesson = getLesson(currentRoute.lesson);
    var screens = screensFor(lesson);
    return { lesson: lesson, screens: screens, screen: currentRoute.screen, sc: screens[currentRoute.screen] };
  }

  function nextScreen(ctx) {
    if (ctx.screen < ctx.screens.length - 1) go(lessonHash(ctx.lesson.id, ctx.screen + 1));
  }

  var actions = {
    "skip": function (el, e) { e.preventDefault(); var m = $("#main"); m.focus(); },
    "toggle-lang": function () {
      store.setLang(otherLang(lang()));
      render();
      announce(lang() === "zh" ? "已切换到中文" : "Switched to English");
    },
    "ack-storage": function () { store.acknowledge(); render(); },
    "dismiss-break": function () { ui.breakDismissed = true; refreshTimer(); var m = $("#main"); if (m) m.focus(); },
    "next": function () { var c = lessonCtx(); if (c) nextScreen(c); },
    "tried": function () {
      var c = lessonCtx(); if (!c || c.sc.type !== "step") return;
      store.markTried(c.lesson.id, c.sc.step);
      nextScreen(c);
    },
    "skip-step": function () {
      var c = lessonCtx(); if (!c || c.sc.type !== "step") return;
      store.markSkipped(c.lesson.id, c.sc.step);
      nextScreen(c);
    },
    "hint": function () {
      var c = lessonCtx(); if (!c || c.sc.type !== "step") return;
      var level = store.getLesson(c.lesson.id).hints[c.sc.step] || 0;
      if (level >= 3) { announce(u("noMoreHints")); return; }
      store.setHintLevel(c.lesson.id, c.sc.step, level + 1);
      render();
      announce(u("hintOpened")(level + 1));
    },
    "toggle-problems": function () {
      ui.problemsOpen = !ui.problemsOpen;
      render();
      if (ui.problemsOpen) { var h = $("#problems-title"); if (h) h.focus(); }
    },
    "toggle-predict": function () { ui.predictOpen = !ui.predictOpen; render(); },
    "toggle-challenge-hint": function () { ui.challengeHintOpen = !ui.challengeHintOpen; render(); },
    "feeling": function (el) {
      var c = lessonCtx(); if (!c) return;
      var f = el.getAttribute("data-feeling");
      store.setFeeling(c.lesson.id, store.getLesson(c.lesson.id).feeling === f ? null : f);
      render();
    },
    "finish": function () {
      var c = lessonCtx(); if (!c) return;
      store.completeLesson(c.lesson.id);
      if (c.lesson.id < C.lessons.length) store.setPosition(c.lesson.id + 1, store.getLesson(c.lesson.id + 1).screen);
      go("#/levelup/" + c.lesson.id);
    },
    "redo": function () {
      var c = lessonCtx(); if (!c) return;
      confirmDialog({ title: u("redoTitle"), body: u("redoBody"), confirm: u("redoYes"), cancel: u("cancel"), lang: htmlLang(lang()) }).then(function (yes) {
        if (!yes) return;
        store.resetLesson(c.lesson.id);
        go(lessonHash(c.lesson.id, 0));
      });
    },
    "clear-all": function () {
      confirmDialog({
        title: "确定清除所有本地记录吗？",
        body: "这会删除本浏览器里保存的全部关卡进度、提示和勾选记录，无法恢复。孩子在 Scratch 里做的作品不会受影响。",
        confirm: "确认清除", cancel: "取消", danger: true, lang: "zh-CN"
      }).then(function (yes) {
        if (!yes) { ui.parentMsg = "已取消，记录没有改变。"; render(); return; }
        var ok = store.clearAll();
        ui.parentMsg = ok ? "本地记录已清除。" : "清除时出错：浏览器存储不可用，部分记录可能仍然存在。";
        render();
        var msg = $("#p-msg");
        if (msg) { msg.setAttribute("tabindex", "-1"); msg.focus(); }
      });
    }
  };

  var changeActions = {
    "check": function (el) {
      var c = lessonCtx(); if (!c) return;
      store.setCheck(c.lesson.id, Number(el.getAttribute("data-idx")), el.checked);
      render();
    },
    "challenge-done": function (el) {
      var c = lessonCtx(); if (!c) return;
      store.setChallengeDone(c.lesson.id, el.checked);
      render();
    },
    "p-lang": function (el) {
      store.setLang(el.value);
      ui.parentMsg = store.getStatus() === "ok" ? "已保存：孩子界面语言为" + (el.value === "zh" ? "简体中文" : "English") + "。" : "已切换，但当前浏览器无法保存此设置。";
      render();
    },
    "p-min": function (el) {
      store.setSessionMinutes(Number(el.value));
      ui.breakDismissed = false;
      ui.parentMsg = store.getStatus() === "ok" ? "已保存：建议时长为" + (Number(el.value) ? el.value + " 分钟" : "不提醒") + "。" : "已切换，但当前浏览器无法保存此设置。";
      render();
    }
  };

  document.addEventListener("click", function (e) {
    var el = e.target.closest("[data-action]");
    if (!el) return;
    var name = el.getAttribute("data-action");
    if (actions[name]) {
      if (el.tagName === "A" || el.tagName === "BUTTON") e.preventDefault();
      actions[name](el, e);
    }
  });
  document.addEventListener("change", function (e) {
    var el = e.target.closest("[data-action]");
    if (!el) return;
    var name = el.getAttribute("data-action");
    if (changeActions[name]) changeActions[name](el, e);
  });
  window.addEventListener("hashchange", function () {
    if (window.location.hash === "#main") return;
    render();
  });

  // Start
  try {
    render();
  } catch (err) {
    // Last-resort fallback: never leave a blank page.
    var m = document.getElementById("main");
    if (m) m.innerHTML = '<section class="card"><h1>Something went wrong / 出了点问题</h1><p>Please reload the page. 请刷新页面。如果仍然出错，可以在家长页清除本地记录。</p></section>';
    if (window.console) console.error(err);
  }
  window.setInterval(refreshTimer, 20000);

  // Exposed for tests only (read-only helpers).
  window.__scratchCoach = { store: store, render: render };
})();
