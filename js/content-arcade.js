/* Scratch Coach — Arcade projects (Levels 9+). Each one starts a NEW Scratch project and
 * reuses the ideas from the main quest in a new game. Loaded before content.js in the
 * browser; required by content.js in Node. Same notation as content.js.
 */
(function (root) {
  "use strict";

  function build(h) {
    var t = h.t, b = h.b, note = h.note;
    var GF = function (i) { return b("events", "when green flag clicked", "当 绿旗 被点击", i); };
    var FOREVER = function (i) { return b("control", "forever", "重复执行", i); };

    /* ───────────── Level 9: Maze Escape ───────────── */
    var KEY = function (dir, zhArrow, i) { return b("control", "if <key (" + dir + " arrow) pressed?> then", "如果 <按下 (" + zhArrow + ") 键?> 那么", i); };
    var WALL = function (i) { return b("control", "if <touching color (wall color)?> then", "如果 <碰到颜色 (墙的颜色)?> 那么", i); };
    var MOVE = function (axis, n, i) { return b("motion", "change " + axis + " by (" + n + ")", "将" + axis + "坐标增加 (" + n + ")", i); };
    var mazeRunner = [
      GF(),
      b("motion", "go to x: (-210) y: (150)", "移到 x: (-210) y: (150)", 1),
      b("motion", "point in direction (90)", "面向 (90) 方向", 1),
      b("looks", "say (Ready?) for (1) seconds", "说 (准备好了吗？) (1) 秒", 1),
      b("looks", "say (Go!) for (1) seconds", "说 (出发！) (1) 秒", 1),
      b("control", "repeat until <touching (Exit)?>", "重复执行直到 <碰到 (Exit)?>", 1),
      KEY("right", "→", 2), MOVE("x", 3, 3), WALL(3), MOVE("x", -3, 4),
      KEY("left", "←", 2), MOVE("x", -3, 3), WALL(3), MOVE("x", 3, 4),
      KEY("up", "↑", 2), MOVE("y", 3, 3), WALL(3), MOVE("y", -3, 4),
      KEY("down", "↓", 2), MOVE("y", -3, 3), WALL(3), MOVE("y", 3, 4),
      b("looks", "say (I escaped!) for (2) seconds", "说 (我逃出来了！) (2) 秒", 1)
    ];

    var maze = {
      id: 9, icon: "🌀", track: "arcade", requires: [2, 3],
      title: t("Maze Escape", "迷宫逃脱"),
      concept: t("Sequence (order matters), color walls, and “repeat until”", "顺序（先后很重要）、颜色墙壁和“重复执行直到”"),
      goal: t(
        "Build a maze. Runner says “Ready?” and “Go!”, then you steer through the maze without crossing the walls. The loop ends when Runner reaches the Exit.",
        "做一个迷宫。Runner 先说“准备好了吗？”和“出发！”，然后你操控它穿过迷宫，不能穿墙。到达出口 Exit 时，循环结束。"
      ),
      prereqs: t("Level 2 (arrow keys with “forever” and “if”) and Level 3 (“touching”).", "第 2 关（“重复执行”+“如果”控制方向键）和第 3 关（“碰到”）。"),
      setup: {
        project: t("Start a NEW Scratch project. Call it Maze Escape.", "新建一个 Scratch 项目，取名 Maze Escape。"),
        sprites: [
          { name: "Runner", role: t("The player. Small enough to fit the paths.", "玩家角色，要小到能穿过路。") },
          { name: "Exit", role: t("The way out. Do not use the wall color on it.", "出口。不要用墙的颜色。") }
        ],
        variables: [],
        messages: [],
        backdrops: [
          { name: "Maze", role: t("Walls painted in one color. “touching (Lava)?” only senses sprites (Level 3), but “touching color” can sense paint on the backdrop.", "用同一种颜色画的墙。“碰到 (Lava)?”只能检测角色（第 3 关），但“碰到颜色”可以检测背景上画的颜色。") }
        ]
      },
      init: t("Green flag: Runner goes to the start of the path, faces right, and says “Ready?” and “Go!” again.", "绿旗：Runner 回到路的起点、面朝右，并重新说“准备好了吗？”和“出发！”。"),
      blocks: [
        b("looks", "say (Ready?) for (1) seconds", "说 (准备好了吗？) (1) 秒"),
        b("control", "repeat until <touching (Exit)?>", "重复执行直到 <碰到 (Exit)?>"),
        b("sensing", "touching color (wall color)?", "碰到颜色 (墙的颜色)?"),
        b("motion", "change x by (3)", "将x坐标增加 (3)")
      ],
      predict: {
        q: t(
          "Runner's script says “Ready?”, then “Go!”, then starts moving. What happens if you swap the two say blocks, so “say (Go!)” comes first?",
          "Runner 的脚本先说“准备好了吗？”，再说“出发！”，然后开始移动。如果把两个“说”积木交换位置，让“说 (出发！)”在前面，会怎样？"
        ),
        a: t(
          "Runner says “Go!” first and “Ready?” second — which sounds silly! Scratch runs a script from top to bottom, one block after another. That order is called a sequence.",
          "Runner 会先说“出发！”再说“准备好了吗？”——听起来很奇怪！Scratch 从上到下一个接一个地运行积木，这种先后顺序就叫“顺序”。"
        )
      },
      steps: [
        {
          title: t("Draw the maze and make the sprites", "画迷宫，建角色"),
          sprite: "Stage",
          where: t("Stage → Backdrops; then the sprite list", "舞台 → 背景；然后是角色列表"),
          do: [
            t("Paint a backdrop named Maze. Draw thick walls in ONE dark color. Keep the paths wide.", "画一个叫 Maze 的背景。用同一种深色画粗粗的墙，路要宽。"),
            t("Add a small sprite named Runner and put it at the start of the path.", "添加一个小角色，命名为 Runner，放在路的起点。"),
            t("Add a sprite named Exit at the end of the path.", "添加一个叫 Exit 的角色，放在路的终点。")
          ],
          hints: [
            t("Runner must fit through every path. Compare Runner's size with the paths. Are the walls easy to see?", "Runner 必须能穿过每一条路。比一比 Runner 和路的大小。墙看得清楚吗？"),
            t("No blocks yet. Use the paint editor's Rectangle tool with one solid color (no gradient). The Size box under the stage makes Runner smaller.", "这一步不用积木。用绘图编辑器的矩形工具和单一纯色（不要渐变）。舞台下方的“大小”框可以把 Runner 变小。"),
            { en: "Do it in this order:", zh: "按这个顺序做：", list: [
              t("Stage → Backdrops → paint walls with the Rectangle tool, all in the same dark color. Make walls at least 10 pixels thick.", "舞台 → 背景 → 用矩形工具画墙，全部用同一种深色，墙至少 10 像素厚。"),
              t("Name the backdrop Maze.", "把背景命名为 Maze。"),
              t("Add Runner (size about 30–40) and Exit. Drag Runner to the start and Exit to the end.", "添加 Runner（大小约 30–40）和 Exit。把 Runner 拖到起点，Exit 拖到终点。")
            ] }
          ]
        },
        {
          title: t("Countdown, then steer until the Exit", "先倒数，再一直移动到出口"),
          sprite: "Runner",
          where: t("Runner sprite → Code tab", "Runner 角色 → 代码 标签页"),
          do: [
            t("Green flag → go to the start → say “Ready?” for 1 second → say “Go!” for 1 second.", "绿旗 → 移到起点 → 说“准备好了吗？”1 秒 → 说“出发！”1 秒。"),
            t("Then add “repeat until <touching (Exit)?>” with the 4 arrow-key blocks inside (like Level 2, but use 3 instead of 5).", "接着加“重复执行直到 <碰到 (Exit)?>”，里面放 4 个方向键积木（像第 2 关，但把 5 换成 3）。"),
            t("Under the loop (not inside!) add “say (I escaped!) for (2) seconds”.", "在循环下面（不是里面！）加“说 (我逃出来了！) (2) 秒”。")
          ],
          hints: [
            t("Scratch runs blocks from top to bottom. What should Runner do first, second and third? When should the moving stop?", "Scratch 从上到下运行积木。Runner 第一、第二、第三件事分别做什么？移动什么时候结束？"),
            t("Motion: “go to x: y:” and “point in direction (90)”. Looks: “say ( ) for ( ) seconds”. Control: “repeat until < >” — it repeats until the condition is true, then the blocks under it run. Sensing: “touching (Exit)?”.", "“运动”：“移到 x: y:”和“面向 (90) 方向”。“外观”：“说 ( ) ( ) 秒”。“控制”：“重复执行直到 < >”——一直重复，直到条件成立，然后运行它下面的积木。“侦测”：“碰到 (Exit)?”。"),
            { en: "Runner's script (use your own start x and y):", zh: "Runner 的脚本（换成你自己的起点 x 和 y）：", blocks: [
              GF(),
              b("motion", "go to x: (-210) y: (150)", "移到 x: (-210) y: (150)", 1),
              b("motion", "point in direction (90)", "面向 (90) 方向", 1),
              b("looks", "say (Ready?) for (1) seconds", "说 (准备好了吗？) (1) 秒", 1),
              b("looks", "say (Go!) for (1) seconds", "说 (出发！) (1) 秒", 1),
              b("control", "repeat until <touching (Exit)?>", "重复执行直到 <碰到 (Exit)?>", 1),
              KEY("right", "→", 2), MOVE("x", 3, 3),
              note("…left, up and down the same way…", "……左、上、下同样做……", 2),
              b("looks", "say (I escaped!) for (2) seconds", "说 (我逃出来了！) (2) 秒", 1)
            ] }
          ]
        },
        {
          title: t("Walls stop Runner", "墙挡住 Runner"),
          sprite: "Runner",
          where: t("Runner sprite → inside each arrow-key “if”", "Runner 角色 → 每个方向键的“如果”里面"),
          do: [
            t("Inside the right-arrow “if”, under “change x by (3)”, add “if <touching color (wall color)?> then change x by (-3)”.", "在 → 键的“如果”里，“将x坐标增加 (3)”下面，加“如果 <碰到颜色 (墙的颜色)?> 那么 将x坐标增加 (-3)”。"),
            t("Pick the color: click the color circle in the block, then the eyedropper, then click a wall.", "选颜色：点积木里的颜色圆点，再点吸管，然后点一下墙。"),
            t("Do the same for left, up and down. Always undo with the opposite number.", "左、上、下也这样做。每次都用相反的数字退回去。")
          ],
          hints: [
            t("Runner moves 3 steps. If it is now touching a wall, what is the simplest way to fix it?", "Runner 走了 3 步。如果它现在碰到了墙，最简单的补救办法是什么？"),
            t("Control: “if then”. Sensing: “touching color ( )?” — set the color with the eyedropper. Motion: “change x by” / “change y by” with the opposite number.", "“控制”：“如果那么”。“侦测”：“碰到颜色 ( )?”——用吸管选颜色。“运动”：用相反数字的“将x坐标增加”/“将y坐标增加”。"),
            { en: "The right-arrow part becomes this. Then copy the idea for the other 3 arrows:", zh: "→ 键部分变成这样，然后把这个办法用到另外 3 个方向：", blocks: [
              KEY("right", "→", 2), MOVE("x", 3, 3), WALL(3), MOVE("x", -3, 4),
              note("left, up, down: move, then undo with the opposite number", "←、↑、↓：先移动，再用相反的数字退回", 2)
            ] }
          ]
        }
      ],
      check: [
        t("Every green flag: Runner goes to the start and says “Ready?” then “Go!”, in that order.", "每次点绿旗：Runner 回到起点，先说“准备好了吗？”再说“出发！”。"),
        t("Runner cannot pass through any wall, in all 4 directions.", "四个方向，Runner 都不能穿墙。"),
        t("Touching the Exit makes Runner say “I escaped!” and stop moving.", "碰到 Exit 后，Runner 说“我逃出来了！”并停止移动。")
      ],
      problems: [
        { symptom: t("Runner walks through the walls.", "Runner 穿墙了。"),
          fix: t("The color in the block is not exactly the wall color. Click the color circle → eyedropper → click the middle of a wall. Walls must be one solid color.", "积木里的颜色和墙的颜色不完全一样。点颜色圆点 → 吸管 → 点墙的中间。墙必须是单一纯色。") },
        { symptom: t("Runner gets stuck inside a wall.", "Runner 卡在墙里了。"),
          fix: t("Check that each undo uses the same number with the opposite sign (3 and -3). Also make sure the start spot is on the path, not on a wall.", "检查每次退回是否用相同数字、相反符号（3 和 -3）。也要确认起点在路上，不在墙上。") },
        { symptom: t("Runner passes through thin or outlined walls.", "Runner 能穿过很细或带边框的墙。"),
          fix: t("Thin lines and outlines have mixed colors at their edges, so “touching color” misses them. Draw thicker walls (at least 10 pixels) with the outline turned off.", "细线和边框的边缘颜色会混在一起，“碰到颜色”就认不出来。把墙画粗一点（至少 10 像素），并关掉边框。") },
        { symptom: t("I only see “Go!”, never “Ready?”.", "只看到“出发！”，看不到“准备好了吗？”。"),
          fix: t("Use “say ( ) for (1) seconds”, not “say ( )”. Plain “say” is replaced right away by the next one.", "用“说 ( ) (1) 秒”，不要用“说 ( )”。不带秒数的“说”会马上被下一句替换。") },
        { symptom: t("Runner keeps saying “I escaped!” while still walking, and keeps stopping.", "Runner 还在走就一直说“我逃出来了！”，而且走走停停。"),
          fix: t("The say block is inside the loop, so it runs every time round. Drag it out and snap it under the “repeat until” loop.", "“说”积木放在了循环里面，所以每转一圈都会运行。把它拖出来，拼在“重复执行直到”循环的下面。") },
        { symptom: t("“I escaped!” never shows.", "从来不显示“我逃出来了！”。"),
          fix: t("The loop must be “repeat until <touching (Exit)?>”, not “forever”. Put the say block UNDER the loop, not inside it.", "循环必须是“重复执行直到 <碰到 (Exit)?>”，不是“重复执行”。把“说”放在循环下面，不是里面。") },
        { symptom: t("Runner says “Go!” before “Ready?”.", "Runner 先说“出发！”，后说“准备好了吗？”。"),
          fix: t("Blocks run from top to bottom. Dragging a block also drags everything under it, so: pull “say (Go!)” and the blocks under it away, snap “say (Ready?)” back in its place, then snap the rest back under it.", "积木从上到下运行。拖动一个积木时，它下面的积木也会一起被拖走。所以：先把“说 (出发！)”连同下面的积木拉开，把“说 (准备好了吗？)”拼回原位，再把其余的拼回它下面。") },
        { symptom: t("When I play again, Runner starts at the Exit.", "再玩一次时，Runner 从出口出发。"),
          fix: t("“go to x: y:” with the start spot must be right under the green flag block, before the countdown.", "带起点坐标的“移到 x: y:”必须紧跟在绿旗积木下面、倒数之前。") },
        { symptom: t("Runner can't move at all.", "Runner 完全不能动。"),
          fix: t("Is Runner touching the Exit at the start? Then the loop ends at once. Move the Exit away from the start.", "Runner 一开始是不是就碰到 Exit 了？那样循环会立刻结束。把 Exit 移离起点。") }
      ],
      challenge: {
        title: t("Speed-run timer", "速通计时"),
        text: t("Show how many seconds it took to escape.", "显示逃出迷宫用了多少秒。"),
        hint: { en: "Two changes in Runner's script:", zh: "Runner 的脚本里改两处：", blocks: [
          note("1. right after say (Go!):", "1. 紧跟在“说 (出发！)”后面：", 1),
          b("sensing", "reset timer", "计时器归零", 1),
          note("2. after the loop, instead of say (I escaped!):", "2. 在循环后面，代替“说 (我逃出来了！)”：", 1),
          b("looks", "say (join (Time: ) (round (timer))) for (2) seconds", "说 (连接 (用时：) 和 (四舍五入 (计时器))) (2) 秒", 1)
        ] }
      },
      reflect: t("What is different between “forever” and “repeat until”?", "“重复执行”和“重复执行直到”有什么不同？"),
      parentGuide: {
        focus: "两个新概念：“顺序”（积木从上到下依次执行）和“重复执行直到”（条件成立就离开循环，接着运行下面的积木）。颜色碰撞要求墙是单一纯色。",
        ask: ["如果把“说 出发！”放到“说 准备好了吗？”上面，会怎样？", "“重复执行”和“重复执行直到”有什么不同？哪个会自己停下来？", "为什么碰到墙以后要往回走同样的步数？"],
        avoid: "画迷宫很容易花掉整节课。可以约定先画 3–4 面墙，能玩以后再加。"
      },
      reference: [
        { sprite: "Runner", blocks: mazeRunner },
        { sprite: "Exit", blocks: [note("No scripts needed.", "不需要脚本。", 0)] },
        { sprite: "Stage", blocks: [note("Backdrop: Maze — walls in one solid color.", "背景：Maze——墙用同一种纯色。", 0)] }
      ]
    };

    /* ───────────── Level 10: Star Catcher ───────────── */
    var fallTop = b("motion", "go to x: (pick random (-220) to (220)) y: (170)", "移到 x: (在 (-220) 和 (220) 之间取随机数) y: (170)", 2);
    var fallLoop = b("control", "repeat until <<touching (Basket)?> or <(y position) < (-160)>>", "重复执行直到 <<碰到 (Basket)?> 或 <(y 坐标) < (-160)>>", 2);
    var fallStep = b("motion", "change y by (Fall Speed)", "将y坐标增加 (Fall Speed)", 3);
    var caught = b("control", "if <touching (Basket)?> then", "如果 <碰到 (Basket)?> 那么", 2);
    var basket = [
      GF(),
      b("looks", "switch backdrop to [Sky]", "换成 [Sky] 背景", 1),
      b("variables", "set [Score] to (0)", "将 [Score] 设为 (0)", 1),
      b("variables", "set [Lives] to (3)", "将 [Lives] 设为 (3)", 1),
      b("motion", "go to x: (0) y: (-150)", "移到 x: (0) y: (-150)", 1),
      b("control", "repeat until <(Lives) < (1)>", "重复执行直到 <(Lives) < (1)>", 1),
      b("control", "if <key (right arrow) pressed?> then", "如果 <按下 (→) 键?> 那么", 2),
      b("motion", "change x by (6)", "将x坐标增加 (6)", 3),
      b("control", "if <key (left arrow) pressed?> then", "如果 <按下 (←) 键?> 那么", 2),
      b("motion", "change x by (-6)", "将x坐标增加 (-6)", 3),
      b("looks", "switch backdrop to [Game Over]", "换成 [Game Over] 背景", 1),
      b("control", "stop [all]", "停止 [全部脚本]", 1)
    ];
    var star = [
      GF(),
      b("variables", "set [Fall Speed] to (-3)", "将 [Fall Speed] 设为 (-3)", 1),
      FOREVER(1),
      fallTop, fallLoop, fallStep, caught,
      b("variables", "change [Score] by (1)", "将 [Score] 增加 (1)", 3)
    ];
    var rock = [
      GF(),
      b("variables", "set [Fall Speed] to (-4)", "将 [Fall Speed] 设为 (-4)", 1),
      FOREVER(1),
      fallTop, fallLoop, fallStep, caught,
      b("variables", "change [Lives] by (-1)", "将 [Lives] 增加 (-1)", 3)
    ];

    var catcher = {
      id: 10, icon: "⭐", track: "arcade", requires: [4, 9],
      title: t("Star Catcher", "接星星"),
      concept: t("Random numbers, variables for one sprite, and catching falling things", "随机数、只属于一个角色的变量、接住下落的东西"),
      goal: t(
        "Move the Basket to catch falling Stars (+1 point) and dodge Rocks (−1 life). The game ends when Lives reach 0.",
        "左右移动篮子 Basket，接住下落的星星 Star（+1 分），躲开石头 Rock（−1 条命）。生命为 0 时游戏结束。"
      ),
      prereqs: t("Level 4 (making variables) and Level 9 (“repeat until”).", "第 4 关（建立变量）和第 9 关（“重复执行直到”）。"),
      setup: {
        project: t("Start a NEW Scratch project. Call it Star Catcher.", "新建一个 Scratch 项目，取名 Star Catcher。"),
        sprites: [
          { name: "Basket", role: t("The player. Moves left and right at the bottom.", "玩家，在底部左右移动。") },
          { name: "Star", role: t("Falls from the top. Catch it for 1 point.", "从上面落下，接住得 1 分。") },
          { name: "Rock", role: t("A copy of Star that takes 1 life.", "Star 的复制品，碰到会扣 1 条命。") }
        ],
        variables: [
          { name: "Score", scope: "all", role: t("Points. Basket sets it to 0 at the green flag.", "分数。绿旗时由 Basket 设为 0。") },
          { name: "Lives", scope: "all", role: t("Lives left. Basket sets it to 3 at the green flag.", "剩余生命。绿旗时由 Basket 设为 3。") },
          { name: "Fall Speed", scope: "sprite", owner: "Star", role: t("How fast THIS sprite falls (negative = down). Rock gets its own copy.", "“这个”角色下落多快（负数 = 向下）。Rock 有自己的一份。") }
        ],
        messages: [],
        backdrops: [
          { name: "Sky", role: t("The playing backdrop.", "游戏时的背景。") },
          { name: "Game Over", role: t("Shows GAME OVER in big letters. A backdrop stays on screen even after “stop [all]”.", "用大字写着 GAME OVER。即使“停止 [全部脚本]”以后，背景也会留在屏幕上。") }
        ]
      },
      init: t("Green flag: Basket switches to the Sky backdrop, sets Score to 0 and Lives to 3 before its loop. Star and Rock each set their own Fall Speed.", "绿旗：Basket 换成 Sky 背景，并在循环之前把 Score 设为 0、Lives 设为 3。Star 和 Rock 各自设置自己的 Fall Speed。"),
      blocks: [
        b("operators", "pick random (-220) to (220)", "在 (-220) 和 (220) 之间取随机数"),
        b("variables", "set [Fall Speed] to (-3)", "将 [Fall Speed] 设为 (-3)"),
        b("control", "repeat until <(Lives) < (1)>", "重复执行直到 <(Lives) < (1)>"),
        b("motion", "y position", "y 坐标")
      ],
      predict: {
        q: t(
          "Star and Rock each have a variable called Fall Speed, made “For this sprite only”. If Star's Fall Speed changes to -6, does Rock fall faster too?",
          "Star 和 Rock 各有一个叫 Fall Speed 的变量，都是“仅适用于当前角色”。如果 Star 的 Fall Speed 变成 -6，Rock 也会落得更快吗？"
        ),
        a: t(
          "No. Each sprite has its own Fall Speed — like each player having their own pocket. Only Star gets faster. Score and Lives are “For all sprites”: one shared box that everyone uses.",
          "不会。每个角色有自己的 Fall Speed——就像每个人都有自己的口袋，只有 Star 变快。Score 和 Lives 是“适用于所有角色”的：大家共用一个盒子。"
        )
      },
      steps: [
        {
          title: t("Basket and the game loop", "篮子和游戏循环"),
          sprite: "Basket",
          where: t("Basket sprite → Code tab", "Basket 角色 → 代码 标签页"),
          do: [
            t("Add a Basket sprite. Paint two backdrops: Sky, and Game Over (big GAME OVER text). Make variables Score and Lives “For all sprites”.", "添加 Basket 角色。画两个背景：Sky，以及写着大字 GAME OVER 的 Game Over。建立“适用于所有角色”的变量 Score 和 Lives。"),
            t("On Basket: green flag → switch backdrop to Sky → set Score to 0 → set Lives to 3 → go to x: (0) y: (-150).", "在 Basket 上：绿旗 → 换成 Sky 背景 → 将 Score 设为 0 → 将 Lives 设为 3 → 移到 x: (0) y: (-150)。"),
            t("Then “repeat until <(Lives) < (1)>” with right and left arrows inside. Under the loop: switch backdrop to Game Over, then “stop [all]”.", "接着“重复执行直到 <(Lives) < (1)>”，里面放 → 和 ← 键。循环下面：换成 Game Over 背景，然后“停止 [全部脚本]”。")
          ],
          hints: [
            t("The game should keep going while there are lives left. Which loop stops by itself when something becomes true? What must Lives be BEFORE the loop starts?", "还有生命时游戏就要继续。哪种循环在条件成立时会自己停下？循环开始之前，Lives 应该是多少？"),
            t("Looks: “switch backdrop to [ ]”. Variables: “set [ ] to ( )”. Control: “repeat until < >” and “stop [all]”. Operators (green): “( ) < ( )” — “Lives less than 1” is safer than “Lives = 0” if two Rocks hit at once. Sensing: “key ( ) pressed?”.", "“外观”：“换成 [ ] 背景”。“变量”：“将 [ ] 设为 ( )”。“控制”：“重复执行直到 < >”和“停止 [全部脚本]”。“运算”（绿色）：“( ) < ( )”——如果两块石头同时砸中，“Lives 小于 1”比“Lives = 0”更保险。“侦测”：“按下 ( ) 键?”。"),
            { en: "Basket's script:", zh: "Basket 的脚本：", blocks: basket }
          ]
        },
        {
          title: t("A falling Star", "会落下的星星"),
          sprite: "Star",
          where: t("Star sprite → Code tab", "Star 角色 → 代码 标签页"),
          do: [
            t("Add a Star sprite. With Star selected, make a variable Fall Speed and choose “For this sprite only”.", "添加 Star 角色。选中 Star 时建立变量 Fall Speed，选“仅适用于当前角色”。"),
            t("Green flag → set Fall Speed to (-3) → forever: go to a random x at the top, then fall (change y by Fall Speed) until it touches Basket OR its y position is less than -160.", "绿旗 → 将 Fall Speed 设为 (-3) → 重复执行：先移到顶部的随机位置，再下落（y 坐标增加 Fall Speed），直到碰到 Basket 或者 y 坐标小于 -160。"),
            t("Under the fall loop: if it touches Basket, add 1 point. (Use -160, not -180: Scratch keeps part of a sprite on the stage, so it may never reach -180.)", "在下落循环的下面：如果碰到了 Basket，就加 1 分。（用 -160，不要用 -180：Scratch 会让角色留一部分在舞台上，所以它可能永远到不了 -180。）")
          ],
          hints: [
            t("Each fall has 3 parts: start at the top in a random place, fall until something happens, then check WHAT happened. Where should the point be added — during the fall, or after it?", "每次下落分 3 部分：在顶部随机位置出现、一直落到发生某件事、然后检查“发生了什么”。分数应该在下落过程中加，还是下落结束后加？"),
            t("Operators: “pick random ( ) to ( )”, “< > or < >”, “( ) < ( )”. Motion: the round “y position” block — it goes in the LEFT slot of “( ) < ( )”, and -160 in the right slot. Control: “forever”, “repeat until”, “if then”. Variables: Fall Speed.", "“运算”：“在 ( ) 和 ( ) 之间取随机数”“< > 或 < >”“( ) < ( )”。“运动”：圆形的“y 坐标”——它放在“( ) < ( )”的左边空格，-160 放在右边。“控制”：“重复执行”“重复执行直到”“如果那么”。“变量”：Fall Speed。"),
            { en: "Star's script:", zh: "Star 的脚本：", blocks: star }
          ]
        },
        {
          title: t("Rocks to dodge", "要躲开的石头"),
          sprite: "Rock",
          where: t("Sprite list → right-click Star → duplicate → rename Rock", "角色列表 → 右键 Star → 复制 → 改名 Rock"),
          do: [
            t("Right-click Star and choose “duplicate”. Rename the copy Rock and give it a grey rock costume.", "右键 Star，选“复制”。把复制品改名为 Rock，换成灰色石头造型。"),
            t("In Rock's script, change “change [Score] by (1)” to “change [Lives] by (-1)”.", "在 Rock 的脚本里，把“将 [Score] 增加 (1)”改成“将 [Lives] 增加 (-1)”。"),
            t("Rock got its own Fall Speed when you duplicated it. Set it to (-4) so rocks fall a bit faster.", "复制时 Rock 得到了自己的 Fall Speed。把它设为 (-4)，让石头落得快一点。")
          ],
          hints: [
            t("A Rock falls exactly like a Star. What is the ONE thing that is different when it touches the Basket?", "石头和星星下落的方式一模一样。碰到篮子时，唯一不同的是什么？"),
            t("No new blocks. Duplicate, then change one Variables block. Check its menu says Lives, and the number is -1.", "不需要新积木。复制，然后修改一个“变量”积木。检查它的菜单是 Lives，数字是 -1。"),
            { en: "The end of Rock's script:", zh: "Rock 脚本的结尾：", blocks: [
              note("…same as Star, but set [Fall Speed] to (-4)…", "……和 Star 一样，但将 [Fall Speed] 设为 (-4)……", 1),
              caught,
              b("variables", "change [Lives] by (-1)", "将 [Lives] 增加 (-1)", 3)
            ] }
          ]
        }
      ],
      check: [
        t("Each Star caught adds exactly 1 point, then a new Star falls from a random place at the top.", "每接住一颗星星正好加 1 分，然后新的星星从顶部随机位置落下。"),
        t("A missed Star or Rock goes back to the top — it never gets stuck at the bottom.", "没接住的星星或石头会回到顶部——不会卡在底部。"),
        t("Each Rock hit takes exactly 1 life. When Lives reaches 0, the Game Over backdrop appears and everything stops.", "每被石头砸中正好扣 1 条命。Lives 变成 0 时，出现 Game Over 背景，一切停止。"),
        t("After the green flag: Sky backdrop, Score 0, Lives 3, and the game runs again.", "点绿旗后：Sky 背景、Score 为 0、Lives 为 3，游戏重新开始。")
      ],
      problems: [
        { symptom: t("One Star gives many points when it touches the Basket.", "一颗星星碰到篮子，分数一下子涨很多。"),
          fix: t("The fall loop keeps going while the Star sits on the Basket. Make the loop stop on touching too: “repeat until <<touching (Basket)?> or <(y position) < (-160)>>”, and keep the “if <touching (Basket)?>” check UNDER the loop.", "星星停在篮子上时，下落循环还在继续。让循环在碰到时也停下：“重复执行直到 <<碰到 (Basket)?> 或 <(y 坐标) < (-160)>>”，并把“如果 <碰到 (Basket)?>”放在循环下面。") },
        { symptom: t("The Star falls once and then stays at the bottom.", "星星落一次就停在底部。"),
          fix: t("Use (y position) < (-160), not -180. Also put the “go to … y: (170)” block INSIDE the forever loop.", "用 (y 坐标) < (-160)，不要用 -180。还要把“移到 … y: (170)”放进“重复执行”里面。") },
        { symptom: t("The game ends as soon as I click the green flag.", "一点绿旗游戏就结束了。"),
          fix: t("Lives is still 0 from the last game. Put “set [Lives] to (3)” at the top of Basket's script, before the loop.", "Lives 还是上一局剩下的 0。把“将 [Lives] 设为 (3)”放在 Basket 脚本顶部、循环之前。") },
        { symptom: t("The Game Over backdrop is still there when I play again.", "再玩一次时，Game Over 背景还在。"),
          fix: t("Add “switch backdrop to [Sky]” at the top of Basket's green flag script.", "在 Basket 绿旗脚本最上面加“换成 [Sky] 背景”。") },
        { symptom: t("I used “say (Game Over!)” before “stop [all]” and the words vanish.", "我在“停止 [全部脚本]”前用了“说 (游戏结束！)”，字一下就没了。"),
          fix: t("“stop [all]” clears speech bubbles. A backdrop stays, so use the Game Over backdrop instead.", "“停止 [全部脚本]”会清除说话气泡，但背景会留下，所以改用 Game Over 背景。") },
        { symptom: t("Rocks give me points.", "石头也给我加分。"),
          fix: t("After duplicating, change Rock's block to “change [Lives] by (-1)”.", "复制以后，要把 Rock 的积木改成“将 [Lives] 增加 (-1)”。") },
        { symptom: t("When Star speeds up, Rock speeds up too.", "星星变快时，石头也变快了。"),
          fix: t("Fall Speed was made “For all sprites”, so they share it. Deleting a variable also deletes the blocks that use it, so: on Star, make a new “For this sprite only” variable, drop it into both Star blocks, then delete the old one. Finally delete Rock and duplicate Star again.", "Fall Speed 建成了“适用于所有角色”，所以它们共用。删除变量时，用到它的积木也会被删掉，所以：在 Star 上新建一个“仅适用于当前角色”的变量，把它放进 Star 的两个积木里，再删掉旧变量。最后删掉 Rock，重新复制一次 Star。") },
        { symptom: t("Stars always fall in the same place.", "星星总是从同一个地方落下。"),
          fix: t("Put “pick random (-220) to (220)” in the x slot of the “go to” block.", "把“在 (-220) 和 (220) 之间取随机数”放进“移到”的 x 空格。") },
        { symptom: t("The Star flickers along the top and never falls.", "星星在顶部乱闪，一直不往下落。"),
          fix: t("Check the operator: use “(y position) < (-160)” (less than), not “>”. With “>” the loop ends at once.", "检查运算积木：要用“(y 坐标) < (-160)”（小于），不是“>”。用“>”的话循环会立刻结束。") },
        { symptom: t("The Star stays stuck at the top.", "星星卡在顶部不动。"),
          fix: t("Fall Speed must be negative to go down: set it to (-3), not (3).", "Fall Speed 要是负数才会往下落：设为 (-3)，不是 (3)。") },
        { kind: "ui", symptom: t("I can't find the “For this sprite only” option.", "找不到“仅适用于当前角色”这个选项。"),
          fix: t("Click the Star sprite first, then make the variable. When the Stage is selected, Scratch only offers variables for all sprites.", "先点选 Star 角色，再建立变量。选中舞台时，Scratch 只能建立适用于所有角色的变量。") }
      ],
      challenge: {
        title: t("Faster and faster", "越来越快"),
        text: t("Make each caught Star fall a bit faster than the last one. Then check: does the Rock speed up too?", "让每接住一颗星星，下一颗就落得更快一点。然后看看：石头也变快了吗？"),
        hint: { en: "On Star only, inside the “if <touching (Basket)?>”, add:", zh: "只在 Star 上，在“如果 <碰到 (Basket)?>”里面加：", blocks: [
          b("variables", "change [Fall Speed] by (-0.5)", "将 [Fall Speed] 增加 (-0.5)", 3)
        ] }
      },
      reflect: t("What's the difference between “For all sprites” and “For this sprite only”?", "“适用于所有角色”和“仅适用于当前角色”有什么区别？"),
      parentGuide: {
        focus: "变量作用域：Score 和 Lives 是大家共用的；Fall Speed 是每个角色自己的。另一个重点是下落循环要在“碰到篮子”时停下，并在下落结束后再判断是否接住；如果循环不停、又在循环里加分，就会一次加很多分。",
        ask: ["Star 变快时，Rock 会不会变快？为什么？", "下落循环为什么要在碰到篮子时停下？", "如果不先把 Lives 设为 3，会发生什么？"],
        avoid: "不要讲“作用域”这个术语，用“自己的口袋 / 大家共用的盒子”打比方就够了。"
      },
      reference: [
        { sprite: "Basket", blocks: basket },
        { sprite: "Star", blocks: star },
        { sprite: "Rock", blocks: rock }
      ]
    };

    /* ───────────── Level 11: Dodge Arena ───────────── */
    var stageArena = [
      GF(),
      b("looks", "switch backdrop to [Arena]", "换成 [Arena] 背景", 1),
      b("variables", "set [Time Left] to (20)", "将 [Time Left] 设为 (20)", 1),
      b("events", "broadcast (Start)", "广播 (Start)", 1),
      b("control", "repeat until <(Time Left) < (1)>", "重复执行直到 <(Time Left) < (1)>", 1),
      b("control", "wait (1) seconds", "等待 (1) 秒", 2),
      b("variables", "change [Time Left] by (-1)", "将 [Time Left] 增加 (-1)", 2),
      b("looks", "switch backdrop to [You Survived]", "换成 [You Survived] 背景", 1),
      b("control", "stop [all]", "停止 [全部脚本]", 1)
    ];
    var player = [
      b("events", "when I receive [Start]", "当接收到 [Start]", 0),
      b("motion", "go to x: (0) y: (0)", "移到 x: (0) y: (0)", 1),
      b("control", "repeat until <<touching (Enemy)?> or <touching (Enemy2)?>>", "重复执行直到 <<碰到 (Enemy)?> 或 <碰到 (Enemy2)?>>", 1),
      b("control", "if <key (right arrow) pressed?> then", "如果 <按下 (→) 键?> 那么", 2), b("motion", "change x by (4)", "将x坐标增加 (4)", 3),
      b("control", "if <key (left arrow) pressed?> then", "如果 <按下 (←) 键?> 那么", 2), b("motion", "change x by (-4)", "将x坐标增加 (-4)", 3),
      b("control", "if <key (up arrow) pressed?> then", "如果 <按下 (↑) 键?> 那么", 2), b("motion", "change y by (4)", "将y坐标增加 (4)", 3),
      b("control", "if <key (down arrow) pressed?> then", "如果 <按下 (↓) 键?> 那么", 2), b("motion", "change y by (-4)", "将y坐标增加 (-4)", 3),
      b("looks", "switch backdrop to [Caught]", "换成 [Caught] 背景", 1),
      b("control", "stop [all]", "停止 [全部脚本]", 1)
    ];
    var enemy = function (x, y, dir) {
      return [
        b("events", "when I receive [Start]", "当接收到 [Start]", 0),
        b("motion", "go to x: (" + x + ") y: (" + y + ")", "移到 x: (" + x + ") y: (" + y + ")", 1),
        b("motion", "point in direction (" + dir + ")", "面向 (" + dir + ") 方向", 1),
        FOREVER(1),
        b("motion", "move (5) steps", "移动 (5) 步", 2),
        b("motion", "if on edge, bounce", "碰到边缘就反弹", 2)
      ];
    };

    var arena = {
      id: 11, icon: "🛡️", track: "arcade", requires: [6, 10],
      title: t("Dodge Arena", "躲避竞技场"),
      concept: t("Broadcast to start everything at once, a countdown timer, and bouncing enemies", "用广播让大家同时开始、倒计时、会反弹的敌人"),
      goal: t(
        "Survive for 20 seconds while two Enemies bounce around the Arena. The Stage counts down and broadcasts Start so everyone begins together.",
        "在竞技场里坚持 20 秒，两个敌人会到处反弹。舞台负责倒计时，并广播 Start，让大家一起开始。"
      ),
      prereqs: t("Level 6 (broadcast) and Level 10 (“repeat until”, backdrops for game over).", "第 6 关（广播）和第 10 关（“重复执行直到”、用背景显示游戏结束）。"),
      setup: {
        project: t("Start a NEW Scratch project. Call it Dodge Arena.", "新建一个 Scratch 项目，取名 Dodge Arena。"),
        sprites: [
          { name: "Player", role: t("You. Moves with the 4 arrow keys.", "你自己，用 4 个方向键移动。") },
          { name: "Enemy", role: t("Bounces around. Don't touch it!", "到处反弹，别碰到它！") },
          { name: "Enemy2", role: t("A duplicate of Enemy that starts somewhere else.", "Enemy 的复制品，从别的地方出发。") }
        ],
        variables: [
          { name: "Time Left", scope: "all", role: t("Seconds left. The Stage sets it to 20 and counts down.", "剩余秒数。舞台把它设为 20 并倒数。") },
          { name: "Speed", scope: "sprite", owner: "Enemy", role: t("Only for the optional challenge: each Enemy's own speed.", "只用于可选挑战：每个敌人自己的速度。") }
        ],
        messages: [{ name: "Start", role: t("Sent once by the Stage. Player, Enemy and Enemy2 listen.", "由舞台发送一次，Player、Enemy 和 Enemy2 接收。") }],
        backdrops: [
          { name: "Arena", role: t("The playing backdrop.", "游戏时的背景。") },
          { name: "Caught", role: t("Shows CAUGHT! when an Enemy touches you.", "被敌人碰到时显示 CAUGHT!。") },
          { name: "You Survived", role: t("Shows YOU SURVIVED! when time runs out.", "时间到时显示 YOU SURVIVED!。") }
        ]
      },
      init: t("Green flag: the Stage switches to Arena, sets Time Left to 20, then broadcasts Start. Player and Enemies reset when they receive Start.", "绿旗：舞台换成 Arena 背景、把 Time Left 设为 20，然后广播 Start。Player 和敌人收到 Start 时重置。"),
      blocks: [
        b("events", "broadcast (Start)", "广播 (Start)"),
        b("events", "when I receive [Start]", "当接收到 [Start]"),
        b("control", "wait (1) seconds", "等待 (1) 秒"),
        b("motion", "if on edge, bounce", "碰到边缘就反弹")
      ],
      predict: {
        q: t("The Stage broadcasts Start once. Player, Enemy and Enemy2 each have a “when I receive [Start]” script. How many scripts start running?", "舞台广播一次 Start。Player、Enemy 和 Enemy2 各有一段“当接收到 [Start]”脚本。会有几段脚本开始运行？"),
        a: t("Three — one in each sprite. One broadcast reaches every sprite that is listening for that message, at the same time.", "三段——每个角色一段。一次广播会同时传到所有在等这条消息的角色。")
      },
      steps: [
        {
          title: t("The Stage runs the clock", "舞台负责计时"),
          sprite: "Stage",
          where: t("Stage → Code tab (click the Stage first)", "舞台 → 代码 标签页（先点舞台）"),
          do: [
            t("Paint 3 backdrops: Arena, Caught and You Survived. Make a variable Time Left “For all sprites”.", "画 3 个背景：Arena、Caught 和 You Survived。建立“适用于所有角色”的变量 Time Left。"),
            t("On the Stage: green flag → switch backdrop to Arena → set Time Left to 20 → broadcast Start (New message: Start).", "在舞台上：绿旗 → 换成 Arena 背景 → 将 Time Left 设为 20 → 广播 Start（新消息：Start）。"),
            t("Then repeat until Time Left < 1: wait 1 second, change Time Left by -1. After the loop: switch backdrop to You Survived, then stop [all].", "然后重复执行直到 Time Left < 1：等待 1 秒，Time Left 增加 -1。循环之后：换成 You Survived 背景，再“停止 [全部脚本]”。")
          ],
          hints: [
            t("A countdown takes away 1 every second. What should happen BEFORE the countdown starts, and what happens when it reaches 0?", "倒计时每秒减 1。倒计时开始之前要做什么？到 0 的时候又要做什么？"),
            t("Events: “broadcast ( )” → New message. Control: “repeat until < >”, “wait ( ) seconds”, “stop [all]”. Variables: “set” and “change”. Looks: “switch backdrop to [ ]”. Operators: “( ) < ( )”.", "“事件”：“广播 ( )”→ 新消息。“控制”：“重复执行直到 < >”“等待 ( ) 秒”“停止 [全部脚本]”。“变量”：“设为”和“增加”。“外观”：“换成 [ ] 背景”。“运算”：“( ) < ( )”。"),
            { en: "The Stage's script:", zh: "舞台的脚本：", blocks: stageArena }
          ]
        },
        {
          title: t("Player moves until caught", "Player 一直移动直到被抓"),
          sprite: "Player",
          where: t("Player sprite → Code tab", "Player 角色 → 代码 标签页"),
          do: [
            t("Start Player's script with “when I receive [Start]” (not the green flag), then go to x: (0) y: (0).", "Player 的脚本用“当接收到 [Start]”开头（不是绿旗），然后移到 x: (0) y: (0)。"),
            t("Add “repeat until <<touching (Enemy)?> or <touching (Enemy2)?>>” with the 4 arrow keys inside.", "加上“重复执行直到 <<碰到 (Enemy)?> 或 <碰到 (Enemy2)?>>”，里面放 4 个方向键。"),
            t("After the loop: switch backdrop to Caught, then stop [all].", "循环之后：换成 Caught 背景，再“停止 [全部脚本]”。")
          ],
          hints: [
            t("Player should only start moving when the Stage says Start. Which hat block waits for a message? When should moving stop?", "Player 要等舞台说 Start 才开始动。哪个帽子积木会等消息？移动什么时候停？"),
            t("Events: “when I receive [ ]”. Control: “repeat until < >”. Operators: “< > or < >”. Sensing: “touching ( )?” and “key ( ) pressed?”.", "“事件”：“当接收到 [ ]”。“控制”：“重复执行直到 < >”。“运算”：“< > 或 < >”。“侦测”：“碰到 ( )?”和“按下 ( ) 键?”。"),
            { en: "Player's script:", zh: "Player 的脚本：", blocks: player }
          ]
        },
        {
          title: t("Bouncing Enemies", "会反弹的敌人"),
          sprite: "Enemy",
          where: t("Enemy sprite → Code tab; then duplicate it", "Enemy 角色 → 代码 标签页；然后复制它"),
          do: [
            t("On Enemy: when I receive Start → go to x: (-180) y: (120) → point in direction (15) → forever: move 5 steps, if on edge, bounce.", "在 Enemy 上：当接收到 Start → 移到 x: (-180) y: (120) → 面向 (15) 方向 → 重复执行：移动 5 步，碰到边缘就反弹。"),
            t("Duplicate Enemy. The copy is called Enemy2. Change its start to x: (180) y: (-120) and its direction to (-165).", "复制 Enemy，复制品叫 Enemy2。把它的起点改成 x: (180) y: (-120)，方向改成 (-165)。"),
            t("Start both Enemies far from the middle, and do not point them straight at it, so nobody is caught in the first second.", "两个敌人都要从远离中间的地方出发，方向也不要正对中间，免得第一秒就被抓。")
          ],
          hints: [
            t("An Enemy keeps moving and turns around at the walls. What should it do again and again? Where should it start so the game is fair?", "敌人一直移动，碰到墙就掉头。它要一遍遍做什么？从哪里出发才公平？"),
            t("Events: “when I receive [Start]”. Motion: “go to x: y:”, “point in direction”, “move ( ) steps”, “if on edge, bounce”. Control: “forever”.", "“事件”：“当接收到 [Start]”。“运动”：“移到 x: y:”“面向 ( ) 方向”“移动 ( ) 步”“碰到边缘就反弹”。“控制”：“重复执行”。"),
            { en: "Enemy's script (Enemy2: start x: (180) y: (-120), direction (-165)):", zh: "Enemy 的脚本（Enemy2：起点 x: (180) y: (-120)，方向 (-165)）：", blocks: enemy(-180, 120, 15) }
          ]
        }
      ],
      check: [
        t("After the green flag, Time Left goes 20, 19, 18 … one step each second.", "点绿旗后，Time Left 每秒减 1：20、19、18……"),
        t("Player and both Enemies start moving at the same moment (when Start is broadcast).", "Player 和两个敌人在同一时刻开始移动（广播 Start 的时候）。"),
        t("Touching an Enemy shows the Caught backdrop and everything stops.", "碰到敌人会显示 Caught 背景，一切停止。"),
        t("Surviving until 0 shows You Survived. A new green flag starts a fresh game on the Arena backdrop.", "坚持到 0 会显示 You Survived。再点绿旗会在 Arena 背景上重新开始。")
      ],
      problems: [
        { symptom: t("I am caught the moment the game starts.", "游戏一开始我就被抓了。"),
          fix: t("An Enemy starts on top of Player. Move the Enemies' “go to” spots far from x: 0, y: 0.", "有敌人一开始就在 Player 身上。把敌人的“移到”位置改得离 x: 0, y: 0 远一点。") },
        { symptom: t("I get caught after about one second, even if I don't move.", "我不动的话，大约一秒钟就被抓了。"),
          fix: t("The Enemies fly straight at the middle. Point them along the edges instead, for example direction (15) and (-165).", "敌人正对着中间飞过来了。让它们沿着边缘出发，比如方向 (15) 和 (-165)。") },
        { symptom: t("Nothing moves after the green flag.", "点绿旗后什么都不动。"),
          fix: t("Check the message name: “broadcast (Start)” and every “when I receive [Start]” must use exactly the same name.", "检查消息名：“广播 (Start)”和每个“当接收到 [Start]”的名字必须完全一样。") },
        { symptom: t("Time Left jumps to 0 straight away, or goes below 0.", "Time Left 一下子变成 0，或者变成负数。"),
          fix: t("Put “wait (1) seconds” inside the loop, and use “repeat until <(Time Left) < (1)>” instead of “forever”.", "把“等待 (1) 秒”放进循环里，并用“重复执行直到 <(Time Left) < (1)>”代替“重复执行”。") },
        { symptom: t("When I play again, the Caught backdrop is still there.", "再玩一次时，Caught 背景还在。"),
          fix: t("The Stage's green flag script must switch backdrop to Arena first.", "舞台的绿旗脚本必须先换成 Arena 背景。") },
        { symptom: t("Enemy2 doesn't catch me.", "Enemy2 碰到我也没事。"),
          fix: t("Player's loop must check both: “<touching (Enemy)?> or <touching (Enemy2)?>”.", "Player 的循环要同时检查两个：“<碰到 (Enemy)?> 或 <碰到 (Enemy2)?>”。") },
        { symptom: t("Both enemies move on top of each other.", "两个敌人重叠在一起走。"),
          fix: t("After duplicating, change Enemy2's start spot and direction.", "复制以后，要修改 Enemy2 的起点和方向。") }
      ],
      challenge: {
        title: t("Faster enemies", "敌人越来越快"),
        text: t("Make the Enemies speed up when only 10 seconds are left.", "只剩 10 秒时，让敌人变快。"),
        hint: { en: "Give each Enemy a variable Speed “For this sprite only”. Set it to 5 when Start arrives, use “move (Speed) steps”, and inside the forever loop add:", zh: "给每个敌人建立“仅适用于当前角色”的变量 Speed。收到 Start 时设为 5，用“移动 (Speed) 步”，并在“重复执行”里加：", blocks: [
          b("control", "if <(Time Left) < (11)> then", "如果 <(Time Left) < (11)> 那么", 2),
          b("variables", "set [Speed] to (8)", "将 [Speed] 设为 (8)", 3)
        ] }
      },
      reflect: t("Why is it handy that the Stage broadcasts Start instead of every sprite using the green flag?", "为什么让舞台广播 Start，比每个角色都用绿旗更方便？"),
      parentGuide: {
        focus: "广播让多个角色“同时开始”；舞台也可以有脚本；倒计时用“等待 1 秒”加变量。注意两种结局都用“停止 [全部脚本]”。",
        ask: ["一次广播会让几段脚本开始运行？", "如果没有“等待 1 秒”，倒计时会怎样？", "为什么敌人不能从中间出发？"],
        avoid: "广播名字大小写都要一致。出错时请孩子逐字比对，而不是替他改。"
      },
      reference: [
        { sprite: "Stage", blocks: stageArena },
        { sprite: "Player", blocks: player },
        { sprite: "Enemy", blocks: enemy(-180, 120, 15) },
        { sprite: "Enemy2", blocks: enemy(180, -120, -165) }
      ]
    };

    /* ───────────── Level 12: Bug Hunt Lab ───────────── */
    var buggyCat = [
      GF(),
      b("motion", "go to x: (0) y: (-140)", "移到 x: (0) y: (-140)", 1),
      FOREVER(1),
      b("control", "if <key (right arrow) pressed?> then", "如果 <按下 (→) 键?> 那么", 2), b("motion", "change x by (10)", "将x坐标增加 (10)", 3),
      b("control", "if <key (left arrow) pressed?> then", "如果 <按下 (←) 键?> 那么", 2), b("motion", "change x by (10)", "将x坐标增加 (10)", 3)
    ];
    var buggyApple = [
      GF(),
      FOREVER(1),
      b("motion", "go to x: (pick random (-200) to (200)) y: (170)", "移到 x: (在 (-200) 和 (200) 之间取随机数) y: (170)", 2),
      b("variables", "change [Score] by (1)", "将 [Score] 增加 (1)", 2),
      b("control", "repeat until <<touching (Cat)?> or <(y position) < (-160)>>", "重复执行直到 <<碰到 (Cat)?> 或 <(y 坐标) < (-160)>>", 2),
      b("motion", "change y by (-4)", "将y坐标增加 (-4)", 3)
    ];
    var fixedCat = [
      GF(),
      b("variables", "set [Score] to (0)", "将 [Score] 设为 (0)", 1),
      b("motion", "go to x: (0) y: (-140)", "移到 x: (0) y: (-140)", 1),
      FOREVER(1),
      b("control", "if <key (right arrow) pressed?> then", "如果 <按下 (→) 键?> 那么", 2), b("motion", "change x by (10)", "将x坐标增加 (10)", 3),
      b("control", "if <key (left arrow) pressed?> then", "如果 <按下 (←) 键?> 那么", 2), b("motion", "change x by (-10)", "将x坐标增加 (-10)", 3)
    ];
    var fixedApple = [
      GF(),
      FOREVER(1),
      b("motion", "go to x: (pick random (-200) to (200)) y: (170)", "移到 x: (在 (-200) 和 (200) 之间取随机数) y: (170)", 2),
      b("control", "repeat until <<touching (Cat)?> or <(y position) < (-160)>>", "重复执行直到 <<碰到 (Cat)?> 或 <(y 坐标) < (-160)>>", 2),
      b("motion", "change y by (-4)", "将y坐标增加 (-4)", 3),
      b("control", "if <touching (Cat)?> then", "如果 <碰到 (Cat)?> 那么", 2),
      b("variables", "change [Score] by (1)", "将 [Score] 增加 (1)", 3)
    ];

    var bughunt = {
      id: 12, icon: "🔍", track: "arcade", requires: [8, 10],
      title: t("Bug Hunt Lab", "捉虫实验室"),
      concept: t("Debugging: predict, run one script, watch a variable, and fix one bug at a time", "调试：先预测、单独运行一段脚本、观察变量、一次修一个 bug"),
      goal: t(
        "Build a tiny Apple Catch game that has 3 hidden bugs on purpose. Use detective tools to find and fix every bug.",
        "做一个故意藏了 3 个 bug 的“接苹果”小游戏。用侦探工具找到并修好每一个 bug。"
      ),
      prereqs: t("Level 8 (testing) and Level 10 (falling objects with “repeat until”).", "第 8 关（测试）和第 10 关（用“重复执行直到”做下落物体）。"),
      setup: {
        project: t("Start a NEW Scratch project. Call it Bug Hunt.", "新建一个 Scratch 项目，取名 Bug Hunt。"),
        sprites: [
          { name: "Cat", role: t("The catcher at the bottom (the default cat is fine).", "底部的接苹果角色（默认的小猫就行）。") },
          { name: "Apple", role: t("Falls from the top. Catch it for 1 point.", "从顶部落下，接住得 1 分。") }
        ],
        variables: [{ name: "Score", scope: "all", role: t("Points. Watch it with the checkbox next to the variable.", "分数。勾选变量旁的方框就能在舞台上看到它。") }],
        messages: []
      },
      init: t("When fixed: the green flag sets Score to 0 and puts Cat at the bottom. Finding that missing reset is one of the bugs!", "修好后：绿旗会把 Score 设为 0，并把 Cat 放到底部。找到这个缺失的重置，本身就是一个 bug！"),
      blocks: [
        b("variables", "change [Score] by (1)", "将 [Score] 增加 (1)"),
        b("looks", "say (Score)", "说 (Score)"),
        b("control", "repeat until <<touching (Cat)?> or <(y position) < (-160)>>", "重复执行直到 <<碰到 (Cat)?> 或 <(y 坐标) < (-160)>>")
      ],
      predict: {
        q: t("Look at the buggy Apple script before you run it. A new apple appears at the top. Does the Score go up before or after the Cat catches it?", "运行之前先看有 bug 的 Apple 脚本。新苹果出现在顶部时，Score 是在小猫接住之前加，还是之后加？"),
        a: t("Before! “change [Score] by (1)” sits right after “go to … y: (170)”, so every new apple adds a point — caught or not. Reading the blocks in order helps you predict bugs.", "之前！“将 [Score] 增加 (1)”紧跟在“移到 … y: (170)”后面，所以每个新苹果都会加分——不管接没接住。按顺序读积木，能帮你预测 bug。")
      },
      steps: [
        {
          title: t("Build the buggy game exactly as shown", "照样子搭出有 bug 的游戏"),
          sprite: "Apple",
          where: t("Cat and Apple sprites → Code tab", "Cat 和 Apple 角色 → 代码 标签页"),
          do: [
            t("Make the variable Score “For all sprites” and tick its checkbox so it shows on the stage.", "建立“适用于所有角色”的变量 Score，勾选它旁边的方框，让它显示在舞台上。"),
            t("Copy the two buggy scripts from Hint 3 exactly — bugs included. This time the bugs are the puzzle!", "照着提示 3 原样搭出两段有 bug 的脚本——连 bug 一起。这次 bug 就是谜题！"),
            t("Before you click the green flag, predict: what will go wrong?", "点绿旗之前先预测：会出什么问题？")
          ],
          hints: [
            t("This step is different: you copy scripts that are wrong on purpose. Why do you think detectives practise on a puzzle with known clues?", "这一步不一样：你要照着搭故意写错的脚本。你觉得侦探为什么要先在有线索的谜题上练习？"),
            t("You need Motion (“go to”, “change x by”, “change y by”), Control (“forever”, “if”, “repeat until”), Sensing, Operators and Variables blocks.", "需要“运动”（“移到”“将x坐标增加”“将y坐标增加”）、“控制”（“重复执行”“如果”“重复执行直到”）、“侦测”、“运算”和“变量”积木。"),
            { en: "The BUGGY scripts (copy them as they are). First Cat, then Apple:", zh: "有 bug 的脚本（原样照搭）。先是 Cat，然后是 Apple：", blocks: buggyCat.concat([note("— Apple sprite —", "—— Apple 角色 ——", 0)], buggyApple) }
          ]
        },
        {
          title: t("Detective tools: run, watch, say", "侦探工具：运行、观察、说出来"),
          sprite: "Cat",
          where: t("Cat sprite → Code tab", "Cat 角色 → 代码 标签页"),
          do: [
            t("Tool 1: click the green flag and press each arrow key. Which key moves the wrong way? Fix that number.", "工具 1：点绿旗，分别按方向键。哪个键走错方向了？改掉那个数字。"),
            t("Tool 2: watch the Score on the stage. Stop, then click the green flag again. Does Score start at 0? If not, add the missing reset to Cat.", "工具 2：看舞台上的 Score。停止后再点绿旗，Score 从 0 开始吗？如果不是，就给 Cat 加上缺少的重置。"),
            t("Tool 3: drag a “say (Score)” block into a loop to see the number change. Remove it when you are done.", "工具 3：把“说 (Score)”拖进循环里，看数字怎么变。用完记得删掉。")
          ],
          hints: [
            t("Test one thing at a time. Press only the left arrow: what do you expect, and what really happens? What number does Score show right after the green flag?", "一次只测一样。只按 ← 键：你预期会怎样？实际怎样？点绿旗后 Score 一开始是多少？"),
            t("The fixes use Motion (“change x by”, a negative number for left) and Variables (“set [Score] to (0)” at the top of the green flag script). Looks: “say ( )” is a handy detective block.", "修正要用“运动”（“将x坐标增加”，向左用负数）和“变量”（绿旗脚本顶部的“将 [Score] 设为 (0)”）。“外观”里的“说 ( )”是好用的侦探积木。"),
            { en: "Cat after fixing bugs 1 and 2:", zh: "修好 bug 1 和 bug 2 之后的 Cat：", blocks: fixedCat }
          ]
        },
        {
          title: t("The sneaky bug: points without catching", "狡猾的 bug：没接住也加分"),
          sprite: "Apple",
          where: t("Apple sprite → Code tab", "Apple 角色 → 代码 标签页"),
          do: [
            t("Move the Cat far away from the falling apple and watch the Score. Does it still go up?", "把小猫移得远离下落的苹果，观察 Score。它还在涨吗？"),
            t("Move “change [Score] by (1)” out of its spot. Put it inside a new “if <touching (Cat)?> then” UNDER the repeat until loop.", "把“将 [Score] 增加 (1)”从原来的位置拿出来，放进一个新的“如果 <碰到 (Cat)?> 那么”，这个“如果”放在“重复执行直到”的下面。"),
            t("Run all your tests again from a fresh green flag. Remove any detective “say” blocks.", "从全新的绿旗开始，再把所有测试跑一遍。删掉侦探用的“说”积木。")
          ],
          hints: [
            t("When exactly should a point be added? Read the Apple script from top to bottom: where does the point happen now?", "到底什么时候才该加分？从上到下读 Apple 的脚本：现在是在哪里加分的？"),
            t("Control: “if < > then”. Sensing: “touching (Cat)?”. Move the existing Variables block — you do not need a new one.", "“控制”：“如果 < > 那么”。“侦测”：“碰到 (Cat)?”。移动现有的“变量”积木就行，不需要新的。"),
            { en: "The fixed Apple script:", zh: "修好后的 Apple 脚本：", blocks: fixedApple }
          ]
        }
      ],
      check: [
        t("Right arrow moves Cat right, left arrow moves Cat left.", "→ 键让小猫向右，← 键让小猫向左。"),
        t("After every green flag, Score starts at 0.", "每次点绿旗后，Score 都从 0 开始。"),
        t("Score only goes up when the Cat really catches an apple; missed apples add nothing.", "只有小猫真的接住苹果时 Score 才加分；没接住不加分。"),
        t("All detective “say” blocks are removed.", "侦探用的“说”积木都删掉了。")
      ],
      problems: [
        { symptom: t("I fixed one bug and now something else broke.", "我修好一个 bug，结果别的地方坏了。"),
          fix: t("Undo your last change (Ctrl+Z or drag it back), then change only one block and test right away.", "撤销刚才的修改（Ctrl+Z 或拖回去），然后只改一个积木，马上测试。") },
        { symptom: t("The Score goes up even when I don't catch anything.", "我什么都没接住，Score 也在涨。"),
          fix: t("“change [Score] by (1)” runs before the catch check. Move it into “if <touching (Cat)?> then” under the repeat until loop.", "“将 [Score] 增加 (1)”在检查接住之前就运行了。把它移进“重复执行直到”下面的“如果 <碰到 (Cat)?> 那么”。") },
        { symptom: t("The left arrow moves the Cat right.", "按 ← 键小猫却向右走。"),
          fix: t("In the left-arrow “if”, the number must be negative: change x by (-10).", "在 ← 键的“如果”里，数字要是负数：将x坐标增加 (-10)。") },
        { symptom: t("Score keeps last game's points.", "Score 保留着上一局的分数。"),
          fix: t("Add “set [Score] to (0)” at the top of Cat's green flag script.", "在 Cat 绿旗脚本的最上面加“将 [Score] 设为 (0)”。") },
        { kind: "ui", symptom: t("I can't see the Score on the stage.", "舞台上看不到 Score。"),
          fix: t("In the Variables category, tick the checkbox next to Score.", "在“变量”分类里，勾选 Score 旁边的方框。") }
      ],
      challenge: {
        title: t("Plant a bug for a grown-up", "给大人藏一个 bug"),
        text: t("Secretly change ONE block in your fixed game. Ask a grown-up to find it using the detective tools.", "偷偷改掉修好的游戏里的一个积木，请大人用侦探工具把它找出来。"),
        hint: { en: "Good bugs to plant:", zh: "适合藏起来的 bug：", list: [
          t("A wrong sign in a “change x by” block.", "“将x坐标增加”里的正负号写反。"),
          t("A missing reset at the green flag.", "绿旗时少了一个重置。"),
          t("A block in the wrong order.", "一个积木放错了顺序。")
        ] }
      },
      reflect: t("Which detective tool helped you most? Explain one bug you found in your own words.", "哪个侦探工具最有用？用自己的话讲讲你找到的一个 bug。"),
      parentGuide: {
        focus: "调试方法比答案更重要：先预测再运行、一次只改一处、用变量显示和“说”积木看数值。这一关故意给出有 bug 的脚本，修正版在提示 3 里。",
        ask: ["你预测会出什么问题？实际看到了什么？", "你是怎么确定 bug 在哪个角色里的？", "为什么一次只改一个积木？"],
        avoid: "孩子找 bug 时不要直接指出位置，可以问“哪个测试先失败了？”。"
      },
      reference: [
        { sprite: "Cat", blocks: fixedCat },
        { sprite: "Apple", blocks: fixedApple }
      ]
    };

    return { lessons: [maze, catcher, arena, bughunt] };
  }

  root.SCRATCH_COACH_ARCADE = build;
  if (typeof module !== "undefined" && module.exports) { module.exports = build; }
})(typeof window !== "undefined" ? window : globalThis);
