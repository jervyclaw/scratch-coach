/* Scratch Coach — local progress storage.
 * Everything stays in this browser's localStorage. If storage is missing, blocked,
 * full or the saved data is damaged, the app keeps working in memory and reports a status.
 */
(function (root) {
  "use strict";

  var KEY = "scratchCoach.v1";
  var BACKUP_KEY = "scratchCoach.v1.damaged-backup";
  var LANGS = ["en", "zh"];
  var MINUTES = [0, 15, 20, 25, 30];
  var FEELINGS = ["easy", "ok", "hard"];
  var LESSON_COUNT = 8;

  function defaults() {
    return {
      version: 1,
      lang: "en",
      sessionMinutes: 20,
      current: { lesson: 1, screen: 0 },
      lessons: {},
      updatedAt: null
    };
  }

  function emptyLesson() {
    return { screen: 0, tried: [], skipped: [], hints: {}, checks: [], done: false, challengeDone: false, feeling: null };
  }

  function isObj(v) { return v !== null && typeof v === "object" && !Array.isArray(v); }
  function isInt(v, min, max) { return typeof v === "number" && Math.floor(v) === v && v >= min && v <= max; }
  function intList(v, max) {
    if (!Array.isArray(v)) return [];
    var out = [];
    v.forEach(function (n) { if (isInt(n, 0, max) && out.indexOf(n) === -1) out.push(n); });
    return out.sort(function (a, b) { return a - b; });
  }

  function sanitizeLesson(raw) {
    var l = emptyLesson();
    if (!isObj(raw)) return l;
    if (isInt(raw.screen, 0, 50)) l.screen = raw.screen;
    l.tried = intList(raw.tried, 10);
    l.skipped = intList(raw.skipped, 10);
    l.checks = intList(raw.checks, 20);
    if (isObj(raw.hints)) {
      Object.keys(raw.hints).forEach(function (k) {
        var step = Number(k);
        if (isInt(step, 0, 10) && isInt(raw.hints[k], 0, 3)) l.hints[step] = raw.hints[k];
      });
    }
    l.done = raw.done === true;
    l.challengeDone = raw.challengeDone === true;
    l.feeling = FEELINGS.indexOf(raw.feeling) !== -1 ? raw.feeling : null;
    return l;
  }

  /** Returns a clean state object, or null if the input is not usable at all. */
  function sanitize(raw) {
    if (!isObj(raw)) return null;
    var d = defaults();
    if (LANGS.indexOf(raw.lang) !== -1) d.lang = raw.lang;
    if (MINUTES.indexOf(raw.sessionMinutes) !== -1) d.sessionMinutes = raw.sessionMinutes;
    if (isObj(raw.current)) {
      if (isInt(raw.current.lesson, 1, LESSON_COUNT)) d.current.lesson = raw.current.lesson;
      if (isInt(raw.current.screen, 0, 50)) d.current.screen = raw.current.screen;
    }
    if (isObj(raw.lessons)) {
      Object.keys(raw.lessons).forEach(function (k) {
        var id = Number(k);
        if (isInt(id, 1, LESSON_COUNT)) d.lessons[id] = sanitizeLesson(raw.lessons[k]);
      });
    }
    if (typeof raw.updatedAt === "string") d.updatedAt = raw.updatedAt;
    return d;
  }

  /**
   * createStore(storageLike)
   * storageLike: an object with getItem/setItem/removeItem (window.localStorage), or null.
   * status: "ok" | "unavailable" | "corrupt" | "writeFailed"
   */
  function createStore(storageLike, now) {
    now = now || function () { return new Date().toISOString(); };
    var backend = storageLike || null;
    var status = "ok";
    var data = defaults();

    // 1) Can we use storage at all?
    if (backend) {
      try {
        var probe = "__scratchCoach_probe__";
        backend.setItem(probe, "1");
        backend.removeItem(probe);
      } catch (e) {
        backend = null;
      }
    }
    if (!backend) status = "unavailable";

    // 2) Read and validate saved data.
    if (backend) {
      var raw = null;
      try { raw = backend.getItem(KEY); } catch (e) { raw = null; status = "unavailable"; backend = null; }
      if (raw !== null && raw !== undefined && backend) {
        var parsed = null;
        try { parsed = JSON.parse(raw); } catch (e) { parsed = undefined; }
        var clean = parsed === undefined ? null : sanitize(parsed);
        if (clean) {
          data = clean;
        } else {
          status = "corrupt";
          data = defaults();
          try { backend.setItem(BACKUP_KEY, String(raw).slice(0, 100000)); } catch (e) { /* ignore */ }
        }
      }
    }

    function save() {
      data.updatedAt = now();
      if (!backend) return false;
      try {
        backend.setItem(KEY, JSON.stringify(data));
        if (status === "writeFailed") status = "ok";
        return true;
      } catch (e) {
        status = "writeFailed";
        return false;
      }
    }

    function lesson(id) {
      if (!data.lessons[id]) data.lessons[id] = emptyLesson();
      return data.lessons[id];
    }

    function addTo(list, n) { if (list.indexOf(n) === -1) { list.push(n); list.sort(function (a, b) { return a - b; }); } }
    function removeFrom(list, n) { var i = list.indexOf(n); if (i !== -1) list.splice(i, 1); }

    return {
      KEY: KEY,
      getStatus: function () { return status; },
      /** After the user has seen a "corrupt" warning, treat state as normal again. */
      acknowledge: function () { if (status === "corrupt") status = backend ? "ok" : "unavailable"; },
      get: function () { return data; },
      getLesson: function (id) { return data.lessons[id] ? data.lessons[id] : emptyLesson(); },
      setLang: function (lang) { if (LANGS.indexOf(lang) !== -1) { data.lang = lang; save(); } },
      setSessionMinutes: function (m) { if (MINUTES.indexOf(m) !== -1) { data.sessionMinutes = m; save(); } },
      setPosition: function (lessonId, screen) {
        if (!isInt(lessonId, 1, LESSON_COUNT) || !isInt(screen, 0, 50)) return;
        data.current = { lesson: lessonId, screen: screen };
        lesson(lessonId).screen = screen;
        save();
      },
      markTried: function (id, step) { var l = lesson(id); addTo(l.tried, step); removeFrom(l.skipped, step); save(); },
      markSkipped: function (id, step) { var l = lesson(id); if (l.tried.indexOf(step) === -1) addTo(l.skipped, step); save(); },
      setHintLevel: function (id, step, level) {
        var l = lesson(id);
        var lv = Math.max(0, Math.min(3, level));
        if ((l.hints[step] || 0) < lv) l.hints[step] = lv;
        save();
      },
      setCheck: function (id, idx, on) { var l = lesson(id); if (on) addTo(l.checks, idx); else removeFrom(l.checks, idx); save(); },
      setChallengeDone: function (id, on) { lesson(id).challengeDone = !!on; save(); },
      setFeeling: function (id, f) { lesson(id).feeling = FEELINGS.indexOf(f) !== -1 ? f : null; save(); },
      completeLesson: function (id) { lesson(id).done = true; save(); },
      resetLesson: function (id) {
        data.lessons[id] = emptyLesson();
        if (data.current.lesson === id) data.current.screen = 0;
        save();
      },
      clearAll: function () {
        var keepLang = data.lang;
        var keepMinutes = data.sessionMinutes;
        data = defaults();
        var ok = true;
        if (backend) {
          try { backend.removeItem(KEY); backend.removeItem(BACKUP_KEY); } catch (e) { ok = false; }
        }
        // Settings chosen by the parent are kept only in memory for this visit; nothing is written.
        data.lang = keepLang;
        data.sessionMinutes = keepMinutes;
        if (status === "corrupt") status = backend ? "ok" : "unavailable";
        return ok;
      },
      save: save
    };
  }

  var api = { createStore: createStore, sanitize: sanitize, defaults: defaults, KEY: KEY, BACKUP_KEY: BACKUP_KEY };
  root.ScratchCoachStorage = api;
  if (typeof module !== "undefined" && module.exports) { module.exports = api; }
})(typeof window !== "undefined" ? window : globalThis);
