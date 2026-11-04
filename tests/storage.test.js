// Storage robustness tests. Run: node --test tests/
"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const S = require("../js/storage.js");

function memStorage(init) {
  const m = new Map(Object.entries(init || {}));
  return {
    map: m,
    getItem: (k) => (m.has(k) ? m.get(k) : null),
    setItem: (k, v) => { m.set(k, String(v)); },
    removeItem: (k) => { m.delete(k); },
  };
}

test("fresh start uses defaults and status ok", () => {
  const st = S.createStore(memStorage());
  assert.equal(st.getStatus(), "ok");
  assert.equal(st.get().lang, "en");
  assert.equal(st.get().sessionMinutes, 20);
  assert.deepEqual(st.get().current, { lesson: 1, screen: 0 });
});

test("progress is saved and restored", () => {
  const mem = memStorage();
  const a = S.createStore(mem);
  a.setPosition(3, 2);
  a.markTried(3, 0);
  a.setHintLevel(3, 1, 2);
  a.setCheck(3, 1, true);
  a.setFeeling(3, "hard");
  a.setLang("zh");
  a.completeLesson(2);
  const b = S.createStore(mem);
  assert.equal(b.getStatus(), "ok");
  assert.deepEqual(b.get().current, { lesson: 3, screen: 2 });
  assert.deepEqual(b.getLesson(3).tried, [0]);
  assert.equal(b.getLesson(3).hints[1], 2);
  assert.deepEqual(b.getLesson(3).checks, [1]);
  assert.equal(b.getLesson(3).feeling, "hard");
  assert.equal(b.getLesson(2).done, true);
  assert.equal(b.get().lang, "zh");
});

test("hint level only goes up and is capped at 3", () => {
  const st = S.createStore(memStorage());
  st.setHintLevel(1, 0, 2);
  st.setHintLevel(1, 0, 1);
  assert.equal(st.getLesson(1).hints[0], 2);
  st.setHintLevel(1, 0, 9);
  assert.equal(st.getLesson(1).hints[0], 3);
});

test("tried removes skipped; skip does not override tried", () => {
  const st = S.createStore(memStorage());
  st.markSkipped(1, 0);
  assert.deepEqual(st.getLesson(1).skipped, [0]);
  st.markTried(1, 0);
  assert.deepEqual(st.getLesson(1).skipped, []);
  st.markSkipped(1, 0);
  assert.deepEqual(st.getLesson(1).skipped, []);
});

test("storage that is null or throws on access → unavailable, still works in memory", () => {
  const st1 = S.createStore(null);
  assert.equal(st1.getStatus(), "unavailable");
  st1.markTried(1, 0);
  assert.deepEqual(st1.getLesson(1).tried, [0]);

  const throwing = { getItem() { throw new Error("SecurityError"); }, setItem() { throw new Error("SecurityError"); }, removeItem() { throw new Error("SecurityError"); } };
  const st2 = S.createStore(throwing);
  assert.equal(st2.getStatus(), "unavailable");
  st2.setHintLevel(2, 1, 1);
  assert.equal(st2.getLesson(2).hints[1], 1);
  assert.equal(st2.clearAll(), true);
});

test("write failure (quota exceeded) → writeFailed, recovers when writes work again", () => {
  const mem = memStorage();
  const st = S.createStore(mem);
  let fail = true;
  const orig = mem.setItem;
  mem.setItem = (k, v) => { if (fail) { const e = new Error("QuotaExceededError"); e.name = "QuotaExceededError"; throw e; } orig(k, v); };
  st.markTried(1, 0);
  assert.equal(st.getStatus(), "writeFailed");
  fail = false;
  st.markTried(1, 1);
  assert.equal(st.getStatus(), "ok");
  assert.match(mem.getItem(S.KEY), /"tried":\[0,1\]/);
});

test("damaged JSON → corrupt status, defaults, raw value backed up", () => {
  const mem = memStorage({ [S.KEY]: "{not json" });
  const st = S.createStore(mem);
  assert.equal(st.getStatus(), "corrupt");
  assert.deepEqual(st.get().current, { lesson: 1, screen: 0 });
  assert.equal(mem.getItem(S.BACKUP_KEY), "{not json");
  st.acknowledge();
  assert.equal(st.getStatus(), "ok");
});

test("wrong shapes are corrupt; partially wrong fields are repaired", () => {
  ["null", "[]", "42", '"text"'].forEach((raw) => {
    const st = S.createStore(memStorage({ [S.KEY]: raw }));
    assert.equal(st.getStatus(), "corrupt", raw);
  });
  const partial = JSON.stringify({
    lang: "fr", sessionMinutes: 999, current: { lesson: 99, screen: -1 },
    lessons: { 2: { tried: [0, "x", 0, 1], hints: { 0: 7, 1: 2 }, done: "yes", feeling: "meh" }, 42: {} },
  });
  const st = S.createStore(memStorage({ [S.KEY]: partial }));
  assert.equal(st.getStatus(), "ok");
  assert.equal(st.get().lang, "en");
  assert.equal(st.get().sessionMinutes, 20);
  assert.deepEqual(st.get().current, { lesson: 1, screen: 0 });
  assert.deepEqual(st.getLesson(2).tried, [0, 1]);
  assert.deepEqual(st.getLesson(2).hints, { 1: 2 });
  assert.equal(st.getLesson(2).done, false);
  assert.equal(st.getLesson(2).feeling, null);
  assert.equal(st.get().lessons[42], undefined);
});

test("resetLesson clears only that level", () => {
  const st = S.createStore(memStorage());
  st.markTried(1, 0);
  st.markTried(2, 0);
  st.setPosition(2, 3);
  st.resetLesson(2);
  assert.deepEqual(st.getLesson(2).tried, []);
  assert.deepEqual(st.getLesson(1).tried, [0]);
  assert.equal(st.get().current.screen, 0);
});

test("clearAll removes saved keys", () => {
  const mem = memStorage({ [S.BACKUP_KEY]: "old" });
  const st = S.createStore(mem);
  st.markTried(1, 0);
  assert.ok(mem.getItem(S.KEY));
  st.clearAll();
  assert.equal(mem.getItem(S.KEY), null);
  assert.equal(mem.getItem(S.BACKUP_KEY), null);
  assert.deepEqual(st.getLesson(1).tried, []);
});
