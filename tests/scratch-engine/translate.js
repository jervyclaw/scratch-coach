/* Translate the course's block text (the same lines the child sees) into a real Scratch 3
 * project.json, so the scripts can run inside the actual Scratch runtime (scratch-vm).
 *
 * Input lines use the course notation: { cat, en, indent }.
 *   (value)  number/text input or a reporter      [menu]  dropdown field
 *   <cond>   boolean input                        indent  nesting inside C-blocks / hats
 * Lines with cat "note" are skipped. A script starts at a hat block with indent 0.
 */
"use strict";

/* ---------- tokenizer ---------- */
// Splits a block label into words and bracket groups. A "<" or ">" followed/preceded by a space
// is the less-than / greater-than operator, not a bracket.
function tokenize(str) {
  const tokens = [];
  let i = 0;
  const open = { "(": ")", "[": "]", "<": ">" };
  while (i < str.length) {
    const ch = str[i];
    if (ch === " ") { i++; continue; }
    const isGroupStart = open[ch] && !(ch === "<" && str[i + 1] === " ");
    if (isGroupStart) {
      // find matching close, tracking all bracket kinds
      const stack = [open[ch]];
      let j = i + 1;
      while (j < str.length && stack.length) {
        const c = str[j];
        if (c === "<" && str[j + 1] === " ") { j++; continue; } // operator
        if (c === ">" && str[j - 1] === " " ) { j++; continue; } // operator
        if (open[c]) stack.push(open[c]);
        else if (c === stack[stack.length - 1]) stack.pop();
        j++;
      }
      if (stack.length) throw new Error(`Unbalanced brackets in: ${str}`);
      tokens.push({ group: ch, text: str.slice(i + 1, j - 1) });
      i = j;
      continue;
    }
    // word until space or group start (but "?" etc. stay attached to words)
    let j = i;
    while (j < str.length && str[j] !== " " && !(open[str[j]] && j > i && !(str[j] === "<" && str[j + 1] === " "))) j++;
    if (j === i) j = i + 1;
    tokens.push({ word: str.slice(i, j) });
    i = j;
  }
  return tokens;
}

/* ---------- block templates ----------
 * slot kinds: n number, a angle, s text, b boolean, f field (square brackets),
 *             menu:<shadowOpcode>:<FIELD> shadow menu, v variable field, msg broadcast input,
 *             bfield broadcast field, color color input
 */
const T = (opcode, template, slots = {}, extra = {}) => ({ opcode, template, slots, ...extra });
const TEMPLATES = [
  // hats
  T("event_whenflagclicked", "when green flag clicked", {}, { hat: true }),
  T("event_whenbroadcastreceived", "when I receive $BROADCAST_OPTION", { BROADCAST_OPTION: "bfield" }, { hat: true }),
  // motion
  T("motion_gotoxy", "go to x: $X y: $Y", { X: "n", Y: "n" }),
  T("motion_glidesecstoxy", "glide $SECS secs to x: $X y: $Y", { SECS: "n", X: "n", Y: "n" }),
  T("motion_pointindirection", "point in direction $DIRECTION", { DIRECTION: "a" }),
  T("motion_changexby", "change x by $DX", { DX: "n" }),
  T("motion_changeyby", "change y by $DY", { DY: "n" }),
  T("motion_setx", "set x to $X", { X: "n" }),
  T("motion_sety", "set y to $Y", { Y: "n" }),
  T("motion_movesteps", "move $STEPS steps", { STEPS: "n" }),
  T("motion_turnright", "turn ↻ $DEGREES degrees", { DEGREES: "n" }),
  T("motion_turnleft", "turn ↺ $DEGREES degrees", { DEGREES: "n" }),
  T("motion_ifonedgebounce", "if on edge, bounce"),
  T("motion_setrotationstyle", "set rotation style $STYLE", { STYLE: "f" }),
  T("motion_xposition", "x position", {}, { reporter: true }),
  T("motion_yposition", "y position", {}, { reporter: true }),
  T("motion_direction", "direction", {}, { reporter: true }),
  // looks
  T("looks_sayforsecs", "say $MESSAGE for $SECS seconds", { MESSAGE: "s", SECS: "n" }),
  T("looks_say", "say $MESSAGE", { MESSAGE: "s" }),
  T("looks_show", "show"),
  T("looks_hide", "hide"),
  T("looks_switchcostumeto", "switch costume to $COSTUME", { COSTUME: "menu:looks_costume:COSTUME" }),
  T("looks_nextcostume", "next costume"),
  T("looks_switchbackdropto", "switch backdrop to $BACKDROP", { BACKDROP: "menu:looks_backdrops:BACKDROP" }),
  T("looks_gotofrontback", "go to $FRONT_BACK layer", { FRONT_BACK: "f" }),
  T("looks_setsizeto", "set size to $SIZE %", { SIZE: "n" }),
  // sound
  T("sound_play", "start sound $SOUND_MENU", { SOUND_MENU: "menu:sound_sounds_menu:SOUND_MENU" }),
  T("sound_playuntildone", "play sound $SOUND_MENU until done", { SOUND_MENU: "menu:sound_sounds_menu:SOUND_MENU" }),
  // control
  T("control_forever", "forever", {}, { substack: true, cap: true }),
  T("control_if", "if $CONDITION then", { CONDITION: "b" }, { substack: true }),
  T("control_wait", "wait $DURATION seconds", { DURATION: "n" }),
  T("control_wait_until", "wait until $CONDITION", { CONDITION: "b" }),
  T("control_repeat", "repeat $TIMES", { TIMES: "n" }, { substack: true }),
  T("control_repeat_until", "repeat until $CONDITION", { CONDITION: "b" }, { substack: true }),
  T("control_stop", "stop $STOP_OPTION", { STOP_OPTION: "f" }),
  // sensing
  T("sensing_keypressed", "key $KEY_OPTION pressed?", { KEY_OPTION: "menu:sensing_keyoptions:KEY_OPTION" }, { boolean: true }),
  T("sensing_touchingobject", "touching $TOUCHINGOBJECTMENU ?", { TOUCHINGOBJECTMENU: "menu:sensing_touchingobjectmenu:TOUCHINGOBJECTMENU" }, { boolean: true }),
  T("sensing_touchingcolor", "touching color $COLOR ?", { COLOR: "color" }, { boolean: true }),
  T("sensing_resettimer", "reset timer"),
  T("sensing_timer", "timer", {}, { reporter: true }),
  // operators
  T("operator_and", "$OPERAND1 and $OPERAND2", { OPERAND1: "b", OPERAND2: "b" }, { boolean: true }),
  T("operator_or", "$OPERAND1 or $OPERAND2", { OPERAND1: "b", OPERAND2: "b" }, { boolean: true }),
  T("operator_not", "not $OPERAND", { OPERAND: "b" }, { boolean: true }),
  T("operator_equals", "$OPERAND1 = $OPERAND2", { OPERAND1: "s", OPERAND2: "s" }, { boolean: true }),
  T("operator_lt", "$OPERAND1 < $OPERAND2", { OPERAND1: "s", OPERAND2: "s" }, { boolean: true }),
  T("operator_gt", "$OPERAND1 > $OPERAND2", { OPERAND1: "s", OPERAND2: "s" }, { boolean: true }),
  T("operator_random", "pick random $FROM to $TO", { FROM: "n", TO: "n" }, { reporter: true }),
  T("operator_join", "join $STRING1 $STRING2", { STRING1: "s", STRING2: "s" }, { reporter: true }),
  T("operator_round", "round $NUM", { NUM: "n" }, { reporter: true }),
  T("operator_add", "$NUM1 + $NUM2", { NUM1: "n", NUM2: "n" }, { reporter: true }),
  T("operator_subtract", "$NUM1 - $NUM2", { NUM1: "n", NUM2: "n" }, { reporter: true }),
  T("operator_multiply", "$NUM1 * $NUM2", { NUM1: "n", NUM2: "n" }, { reporter: true }),
  // variables
  T("data_setvariableto", "set $VARIABLE to $VALUE", { VARIABLE: "v", VALUE: "s" }),
  T("data_changevariableby", "change $VARIABLE by $VALUE", { VARIABLE: "v", VALUE: "n" }),
  T("data_showvariable", "show variable $VARIABLE", { VARIABLE: "v" }),
  T("data_hidevariable", "hide variable $VARIABLE", { VARIABLE: "v" }),
  // events
  T("event_broadcast", "broadcast $BROADCAST_INPUT", { BROADCAST_INPUT: "msg" }),
  T("event_broadcastandwait", "broadcast $BROADCAST_INPUT and wait", { BROADCAST_INPUT: "msg" }),
].map((t) => ({ ...t, ttokens: tokenize(t.template) }));

const MENU_ALIASES = {
  sensing_touchingobjectmenu: { "mouse-pointer": "_mouse_", edge: "_edge_" },
  looks_gotofrontback: {},
};

/* ---------- translator ---------- */
class Translator {
  constructor(opts) {
    this.blocks = null;
    this.n = 0;
    this.opts = opts; // { globalVars:{name:id}, localVars:{name:id}, messages:{name:id}, colors:{name:hex} }
  }
  id(prefix) { this.n += 1; return `${prefix}_${this.n}`; }
  varId(name) {
    if (this.opts.localVars && this.opts.localVars[name]) return this.opts.localVars[name];
    if (this.opts.globalVars[name]) return this.opts.globalVars[name];
    return null;
  }

  /** Match a token list against templates. Returns {tpl, bind} or null. */
  match(tokens, kinds) {
    for (const tpl of TEMPLATES) {
      if (kinds && !kinds(tpl)) continue;
      const tt = tpl.ttokens;
      if (tt.length !== tokens.length) continue;
      const bind = {};
      let ok = true;
      for (let i = 0; i < tt.length && ok; i++) {
        const a = tt[i], b = tokens[i];
        if (a.word && a.word.startsWith("$")) {
          if (!b.group) ok = false; else bind[a.word.slice(1)] = b;
        } else if (a.word) {
          if (!b.word || b.word !== a.word) ok = false;
        } else ok = false;
      }
      if (ok) return { tpl, bind };
    }
    return null;
  }

  /** Build a block from label text. Returns block id. */
  build(text, parent, topLevel) {
    const tokens = tokenize(text.trim());
    const m = this.match(tokens);
    if (!m) throw new Error(`No Scratch block matches: "${text}"`);
    return this.make(m, parent, topLevel);
  }

  make({ tpl, bind }, parent, topLevel) {
    const id = this.id(tpl.opcode.split("_")[0]);
    const block = { opcode: tpl.opcode, next: null, parent: parent || null, inputs: {}, fields: {}, shadow: false, topLevel: !!topLevel };
    if (topLevel) { block.x = 0; block.y = 0; }
    this.blocks[id] = block;
    for (const [name, kind] of Object.entries(tpl.slots)) {
      const g = bind[name];
      this.fillSlot(block, id, name, kind, g);
    }
    if (tpl.opcode === "control_stop") {
      const opt = block.fields.STOP_OPTION[0];
      block.mutation = { tagName: "mutation", children: [], hasnext: opt === "other scripts in sprite" ? "true" : "false" };
    }
    return id;
  }

  fillSlot(block, id, name, kind, g) {
    const text = g.text;
    if (kind === "f") { block.fields[name] = [text, null]; return; }
    if (kind === "v") {
      const vid = this.varId(text);
      if (!vid) throw new Error(`Unknown variable [${text}]`);
      block.fields[name] = [text, vid];
      return;
    }
    if (kind === "bfield") {
      block.fields[name] = [text, this.msgId(text)];
      return;
    }
    if (kind === "msg") {
      block.inputs[name] = [1, [11, text, this.msgId(text)]];
      return;
    }
    if (kind === "color") {
      const hex = (this.opts.colors && this.opts.colors[text]) || (/^#[0-9a-f]{6}$/i.test(text) ? text : null);
      if (!hex) throw new Error(`Unknown color (${text})`);
      block.inputs[name] = [1, [9, hex]];
      return;
    }
    if (kind.startsWith("menu:")) {
      const [, shadowOp, field] = kind.split(":");
      const alias = (MENU_ALIASES[shadowOp] || {})[text];
      const sid = this.id("menu");
      this.blocks[sid] = { opcode: shadowOp, next: null, parent: id, inputs: {}, fields: { [field]: [alias || text, null] }, shadow: true, topLevel: false };
      block.inputs[name] = [1, sid];
      return;
    }
    if (kind === "b") {
      if (g.group !== "<") throw new Error(`Expected <condition> for ${name}, got ${g.group}${text}`);
      const bid = this.buildExpr(text, id, true);
      block.inputs[name] = [2, bid];
      return;
    }
    // n / a / s : literal or reporter
    const prim = kind === "n" ? 4 : kind === "a" ? 8 : 10;
    const vid = this.varId(text);
    if (vid) { block.inputs[name] = [3, [12, text, vid], [prim, "0"]]; return; }
    const inner = tokenize(text);
    const m = inner.length ? this.match(inner, (t) => t.reporter) : null;
    if (m) {
      const rid = this.make(m, id, false);
      block.inputs[name] = [3, rid, [prim, prim === 10 ? "" : "0"]];
      return;
    }
    block.inputs[name] = [1, [prim, text]];
  }

  buildExpr(text, parent) {
    const tokens = tokenize(text);
    const m = this.match(tokens, (t) => t.boolean);
    if (!m) throw new Error(`No boolean block matches: <${text}>`);
    return this.make(m, parent, false);
  }

  msgId(name) {
    if (!this.opts.messages[name]) throw new Error(`Unknown broadcast message (${name})`);
    return this.opts.messages[name];
  }
}

/** Parse course lines into a tree of scripts using indentation. */
function toTrees(lines) {
  const items = lines.filter((l) => l.cat !== "note");
  const scripts = [];
  let i = 0;
  function parseLevel(level) {
    const nodes = [];
    while (i < items.length && items[i].indent >= level) {
      if (items[i].indent > level) throw new Error(`Bad indent at "${items[i].en}"`);
      const node = { line: items[i], children: [] };
      i++;
      if (i < items.length && items[i].indent > level) node.children = parseLevel(level + 1);
      nodes.push(node);
    }
    return nodes;
  }
  while (i < items.length) {
    if (items[i].indent !== 0) throw new Error(`Script must start with a hat at indent 0: "${items[i].en}"`);
    const hat = { line: items[i], children: [] };
    i++;
    hat.children = parseLevel(1);
    scripts.push(hat);
  }
  return scripts;
}

/** Translate one sprite's course lines into a blocks map. */
function translateScripts(lines, opts) {
  const tr = new Translator(opts);
  tr.blocks = {};
  const scripts = toTrees(lines);
  const chain = (nodes, parentId, isSubstackOf) => {
    let prev = null, first = null;
    for (const node of nodes) {
      const id = tr.build(node.line.en, prev || parentId, false);
      if (!first) first = id;
      if (prev) tr.blocks[prev].next = id;
      if (node.children.length) {
        const sub = chain(node.children, id, true);
        tr.blocks[id].inputs.SUBSTACK = [2, sub];
      }
      prev = id;
    }
    return first;
  };
  scripts.forEach((s, k) => {
    const hatId = tr.build(s.line.en, null, true);
    tr.blocks[hatId].y = k * 400;
    const first = chain(s.children, hatId, false);
    if (first) tr.blocks[hatId].next = first;
  });
  return tr.blocks;
}

/* ---------- project assembly ---------- */
function hexId(seed) {
  let h = 0;
  const out = [];
  for (let k = 0; k < 4; k++) {
    for (const c of seed + k) h = (Math.imul(h, 31) + c.charCodeAt(0)) >>> 0;
    out.push(h.toString(16).padStart(8, "0"));
  }
  return out.join("").slice(0, 32);
}
function rectSvg(w, h, color) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}"><rect width="${w}" height="${h}" fill="${color}"/></svg>`;
}

/**
 * spec = {
 *   stage: { width?, backdrop: { color, rects:[{x,y,w,h,color}] }, variables: {name: initial} },
 *   messages: [names], colors: {name: hex},
 *   sprites: [{ name, x, y, w, h, color, visible?, costumes?:[{name,w,h,color}], localVars?:{name:initial}, lines:[course lines] }]
 * }
 * Returns { project, assets: {assetId: svgString} }
 */
function buildProject(spec) {
  const assets = {};
  const addAsset = (svg, seed) => { const id = hexId(seed + svg); assets[id] = svg; return id; };
  const costume = (name, svg, w, h, seed) => {
    const assetId = addAsset(svg, seed);
    return { assetId, name, md5ext: assetId + ".svg", dataFormat: "svg", rotationCenterX: w / 2, rotationCenterY: h / 2 };
  };

  const globalVars = {}, stageVariables = {};
  Object.entries(spec.stage.variables || {}).forEach(([name, val]) => {
    const id = hexId("var" + name).slice(0, 20);
    globalVars[name] = id;
    stageVariables[id] = [name, val];
  });
  const messages = {}, broadcasts = {};
  (spec.messages || []).forEach((name) => { const id = "msg_" + hexId(name).slice(0, 12); messages[name] = id; broadcasts[id] = name; });

  const bd = spec.stage.backdrop || { color: "#ffffff", rects: [] };
  const bgSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="480" height="360" viewBox="0 0 480 360"><rect width="480" height="360" fill="${bd.color}"/>` +
    (bd.rects || []).map((r) => `<rect x="${r.x + 240 - r.w / 2}" y="${180 - r.y - r.h / 2}" width="${r.w}" height="${r.h}" fill="${r.color}"/>`).join("") + "</svg>";

  const extraBackdrops = (spec.stage.backdrops || []).map((b) =>
    costume(b.name, `<svg xmlns="http://www.w3.org/2000/svg" width="480" height="360" viewBox="0 0 480 360"><rect width="480" height="360" fill="${b.color}"/></svg>`, 480, 360, "bd" + b.name));
  const stage = {
    isStage: true, name: "Stage", variables: stageVariables, lists: {}, broadcasts, blocks: {}, comments: {},
    currentCostume: 0, costumes: [costume(bd.name || "backdrop1", bgSvg, 480, 360, "bg"), ...extraBackdrops], sounds: [], volume: 100,
    layerOrder: 0, tempo: 60, videoTransparency: 50, videoState: "on", textToSpeechLanguage: null,
  };
  if (spec.stage.lines) stage.blocks = translateScripts(spec.stage.lines, { globalVars, localVars: {}, messages, colors: spec.colors });

  const targets = [stage];
  spec.sprites.forEach((sp, k) => {
    const localVars = {}, variables = {};
    Object.entries(sp.localVars || {}).forEach(([name, val]) => {
      const id = hexId(sp.name + "local" + name).slice(0, 20);
      localVars[name] = id;
      variables[id] = [name, val];
    });
    const costumes = (sp.costumes || [{ name: "costume1", w: sp.w, h: sp.h, color: sp.color }])
      .map((c) => costume(c.name, rectSvg(c.w, c.h, c.color), c.w, c.h, sp.name + c.name));
    targets.push({
      isStage: false, name: sp.name, variables, lists: {}, broadcasts: {}, comments: {},
      blocks: translateScripts(sp.lines || [], { globalVars, localVars, messages, colors: spec.colors }),
      currentCostume: 0, costumes, sounds: [], volume: 100, layerOrder: k + 1,
      visible: sp.visible !== false, x: sp.x, y: sp.y, size: 100, direction: 90, draggable: false, rotationStyle: "all around",
    });
  });
  return { project: { targets, monitors: [], extensions: [], meta: { semver: "3.0.0", vm: "0.2.0", agent: "scratch-coach-tests" } }, assets };
}

module.exports = { tokenize, translateScripts, buildProject, toTrees, TEMPLATES };
