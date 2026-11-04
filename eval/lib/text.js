// Small bilingual text helpers shared by the responder and the rule grader. No dependencies.
"use strict";

const CJK = /[㐀-鿿豈-﫿]/;
const STOP_EN = new Set(("a an the i my me it its is are was be to of in on at and or but so do does did not no " +
  "when then than this that there what why how can cant can't dont don't im i'm it's pls please just like " +
  "with for from up get got have has had keep keeps still now again will would just").split(" "));

function isZh(s) { return CJK.test(s); }

/** Words (English, lightly stemmed) plus CJK character bigrams, for fuzzy matching. */
function terms(s) {
  const out = new Set();
  const lower = String(s).toLowerCase();
  for (const w of lower.match(/[a-z][a-z0-9'-]*/g) || []) {
    if (STOP_EN.has(w) || w.length < 3) continue;
    out.add(w.replace(/(ing|ed|es|s)$/, ""));
  }
  const zh = (lower.match(/[㐀-鿿]+/g) || []).join("|");
  for (let i = 0; i < zh.length - 1; i++) if (zh[i] !== "|" && zh[i + 1] !== "|") out.add(zh.slice(i, i + 2));
  return out;
}

/** Overlap score in [0,1] between two texts (Dice coefficient on terms). */
function similarity(a, b) {
  const A = terms(a), B = terms(b);
  if (!A.size || !B.size) return 0;
  let n = 0;
  for (const t of A) if (B.has(t)) n++;
  return (2 * n) / (A.size + B.size);
}

/** Number of terms two texts share. */
function sharedTerms(a, b) {
  const A = terms(a), B = terms(b);
  let n = 0;
  for (const t of A) if (B.has(t)) n++;
  return n;
}

/** Split into sentences (English and Chinese punctuation). */
function sentences(s) {
  return String(s).split(/(?<=[.!?。！？])\s*|\n+/).map((x) => x.trim()).filter(Boolean);
}

function wordCount(s) {
  const en = (String(s).match(/[A-Za-z0-9'-]+/g) || []).length;
  const zh = (String(s).match(/[㐀-鿿]/g) || []).length;
  return en + Math.ceil(zh / 2); // ~2 Chinese characters per "word" for length limits
}

/** Rough token estimate for budgeting (deliberately on the high side). */
function estimateTokens(s) {
  const str = String(s);
  const cjk = (str.match(/[㐀-鿿豈-﫿]/g) || []).length;
  return Math.ceil((str.length - cjk) / 3.5 + cjk * 1.3);
}

module.exports = { isZh, terms, similarity, sharedTerms, sentences, wordCount, estimateTokens };
