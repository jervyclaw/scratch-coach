/* Scratch Coach · Block Quest — course content (8 levels).
 * Plain data, no network. Loaded as a classic <script> so index.html works from file://.
 * Block text follows real Scratch 3 block labels (English + Simplified Chinese editor).
 * Notation: (value)  [menu or variable]  <condition>.
 */
(function (root) {
  "use strict";

  function t(en, zh) { return { en: en, zh: zh }; }
  function b(cat, en, zh, indent) { return { cat: cat, en: en, zh: zh, indent: indent || 0 }; }
  function note(en, zh, indent) { return { cat: "note", en: en, zh: zh, indent: indent || 0 }; }

  // The start position is used in Level 1, 3 and 5. Keep it in one place.
  var START_X = -200;
  var START_Y = -130;

  // Re-used blocks
  var GF = function (i) { return b("events", "when green flag clicked", "当 绿旗 被点击", i); };
  var GO_START = function (i) { return b("motion", "go to x: (" + START_X + ") y: (" + START_Y + ")", "移到 x: (" + START_X + ") y: (" + START_Y + ")", i); };
  var POINT90 = function (i) { return b("motion", "point in direction (90)", "面向 (90) 方向", i); };
  var FOREVER = function (i) { return b("control", "forever", "重复执行", i); };
  var WAIT_SHORT = function (i) { return b("control", "wait (0.2) seconds", "等待 (0.2) 秒", i); };
  var WAIT_HERO = function (i) { return b("control", "wait until <touching (Hero)?>", "等待 <碰到 (Hero)?>", i); };

  var CATEGORIES = {
    events:    t("Events", "事件"),
    motion:    t("Motion", "运动"),
    looks:     t("Looks", "外观"),
    sound:     t("Sound", "声音"),
    control:   t("Control", "控制"),
    sensing:   t("Sensing", "侦测"),
    operators: t("Operators", "运算"),
    variables: t("Variables", "变量"),
    note:      t("Note", "说明")
  };

  // Names that must match exactly across all levels.
  var NAMES = {
    sprites: ["Hero", "Lava", "Coin", "Checkpoint", "Goal", "Win Banner"],
    variables: ["Score", "Checkpoint X", "Checkpoint Y", "Lives"],
    messages: ["You Win"],
    backdrops: ["Level 1"]
  };

  var lessons = [
    /* ───────────── Level 1 ───────────── */
    {
      id: 1,
      icon: "🏝️",
      title: t("Spawn Island", "出生岛"),
      concept: t("Events: the green flag starts your game", "事件：绿旗让游戏开始"),
      goal: t(
        "Make a Hero, paint your level, and make the green flag send the Hero to the start.",
        "创建主角，画出关卡背景，让绿旗把主角送回起点。"
      ),
      blocks: [GF(), GO_START(), POINT90()],
      predict: {
        q: t(
          "You drag Hero to the top corner. Then you click the green flag. Where will Hero be?",
          "你把 Hero 拖到右上角，然后点击绿旗。Hero 会在哪里？"
        ),
        a: t(
          "Back at the start (x: -200, y: -130). The green flag runs the script, and “go to x: y:” moves Hero home. Putting things back at the start is called a reset.",
          "回到起点（x: -200, y: -130）。点击绿旗会运行脚本，“移到 x: y:” 把 Hero 送回家。游戏开始时把东西放回原位，叫做“重置”。"
        )
      },
      steps: [
        {
          title: t("Pick your Hero", "选择你的主角"),
          sprite: null,
          where: t("Sprite list (under the stage)", "角色列表（舞台下方）"),
          do: [
            t("Keep the cat, or click “Choose a Sprite” and pick any character you like.", "可以保留小猫，也可以点“选择一个角色”，挑一个你喜欢的角色。"),
            t("Rename it to Hero. Type Hero in the “Sprite” name box.", "把它改名为 Hero：在“角色”名字框里输入 Hero。"),
            t("Delete any extra sprites you do not need.", "删掉用不到的其他角色。")
          ],
          hints: [
            t("Look under the stage. Find the box that shows your sprite's name (like Sprite1).", "看看舞台下方，找到写着角色名字（比如“角色1”）的那个框。"),
            t("This step uses no blocks. It uses the sprite info area: the name box next to “Sprite”.", "这一步不需要积木，用的是角色信息区：“角色”旁边的名字框。"),
            { en: "Do it in this order:", zh: "按这个顺序做：", list: [
              t("Click your sprite in the sprite list.", "在角色列表里点击你的角色。"),
              t("Click the name box next to “Sprite”.", "点击“角色”旁边的名字框。"),
              t("Type Hero and press Enter.", "输入 Hero，然后按回车。")
            ] }
          ]
        },
        {
          title: t("Paint your level", "画出关卡背景"),
          sprite: "Stage",
          where: t("Stage → Backdrops tab", "舞台 → 背景 标签页"),
          do: [
            t("Click the Stage (bottom right), then the Backdrops tab.", "点击右下角的舞台，再点“背景”标签页。"),
            t("Paint a light background with a path. Draw a start pad in the bottom-left corner.", "画一个浅色背景和一条路，在左下角画一个起点平台。"),
            t("Name the backdrop Level 1.", "把这个背景命名为 Level 1。")
          ],
          hints: [
            t("Where does Hero start? Look at the bottom-left corner of the stage. That is a good start spot.", "Hero 从哪里出发？看看舞台左下角，那里很适合做起点。"),
            t("Use the paint tools: Rectangle and Fill. Light colors make sprites easy to see.", "用绘图工具：矩形和填充。浅颜色能让角色更显眼。"),
            { en: "Do it in this order:", zh: "按这个顺序做：", list: [
              t("Click Stage → Backdrops tab.", "点击 舞台 → 背景。"),
              t("Pick a light color and fill the whole backdrop.", "选一个浅色，把整个背景填满。"),
              t("Draw a path with the Rectangle tool, and a start pad at the bottom left.", "用矩形工具画一条路，在左下角画起点平台。"),
              t("Type Level 1 in the backdrop name box.", "在背景名字框里输入 Level 1。")
            ] }
          ]
        },
        {
          title: t("Green flag = start!", "绿旗 = 开始！"),
          sprite: "Hero",
          where: t("Hero sprite → Code tab", "Hero 角色 → 代码 标签页"),
          do: [
            t("Click Hero. Drag “when green flag clicked” into the code area.", "点击 Hero，把“当绿旗被点击”拖到代码区。"),
            t("Snap “go to x: (-200) y: (-130)” under it, then “point in direction (90)”.", "在下面拼上“移到 x: (-200) y: (-130)”，再拼上“面向 (90) 方向”。"),
            t("Drag Hero away. Click the green flag. Does Hero jump home?", "把 Hero 拖走，点击绿旗。Hero 跳回起点了吗？")
          ],
          hints: [
            t("Drag Hero somewhere else and click the green flag. Nothing happens yet. What block means “when the game starts”?", "把 Hero 拖到别处再点绿旗——现在什么都没发生。哪个积木表示“游戏开始的时候”？"),
            t("Look in Events (yellow) for the block with a green flag. Look in Motion (blue) for “go to x: y:”.", "在“事件”（黄色）里找带绿旗的积木，在“运动”（蓝色）里找“移到 x: y:”。"),
            { en: "Put these blocks on Hero, top to bottom:", zh: "把这些积木放在 Hero 上，从上到下：", blocks: [GF(), GO_START(1), POINT90(1)] }
          ]
        }
      ],
      check: [
        t("I dragged Hero away, clicked the green flag, and Hero jumped back to the start.", "我把 Hero 拖走，点击绿旗后，Hero 跳回了起点。"),
        t("My sprite is named Hero.", "我的角色名字是 Hero。"),
        t("My backdrop has a start pad under Hero.", "我的背景上，Hero 脚下有起点平台。")
      ],
      problems: [
        { symptom: t("Nothing happens when I click the green flag.", "点击绿旗什么也没发生。"),
          fix: t("Click Hero in the sprite list. Is the script there? Make sure “go to” is snapped under the green flag block with no gap.", "在角色列表里点击 Hero，看看脚本在不在。确认“移到”紧紧拼在绿旗积木下面，中间没有缝隙。") },
        { symptom: t("Hero goes to the wrong place.", "Hero 跑到了错误的位置。"),
          fix: t("Check the numbers: x is -200 and y is -130. Both have a minus sign. Minus x means left. Minus y means down.", "检查数字：x 是 -200，y 是 -130，都有负号。x 为负表示靠左，y 为负表示靠下。") },
        { symptom: t("I can't find the Motion blocks.", "我找不到“运动”积木。"),
          fix: t("You probably clicked the Stage. The Stage can't move, so it has no Motion blocks. Click Hero.", "你大概选中了舞台。舞台不能移动，所以没有运动积木。请点击 Hero。") }
      ],
      challenge: {
        title: t("Hero says hello", "主角打招呼"),
        text: t("When the game starts, make Hero say “Let's go!” for 2 seconds.", "游戏开始时，让 Hero 说“出发！”2 秒。"),
        hint: { en: "Add this at the bottom of Hero's green flag script:", zh: "把它加到 Hero 绿旗脚本的最下面：", blocks: [b("looks", "say (Let's go!) for (2) seconds", "说 (出发！) (2) 秒", 1)] }
      },
      reflect: t("What does the green flag do in your game? Tell a grown-up.", "在你的游戏里，绿旗是做什么的？讲给大人听。")
    },

    /* ───────────── Level 2 ───────────── */
    {
      id: 2,
      icon: "🏃",
      title: t("Arrow Run", "方向键冲刺"),
      concept: t("Loops and coordinates (x and y)", "循环和坐标（x 和 y）"),
      goal: t(
        "Make Hero move with the arrow keys. Learn what x and y mean.",
        "用方向键控制 Hero 移动，弄懂 x 和 y 是什么意思。"
      ),
      blocks: [
        FOREVER(),
        b("control", "if <> then", "如果 <> 那么"),
        b("sensing", "key (right arrow) pressed?", "按下 (→) 键?"),
        b("motion", "change x by (5)", "将x坐标增加 (5)"),
        b("motion", "change y by (5)", "将y坐标增加 (5)")
      ],
      predict: {
        q: t("What will “change x by (-5)” do to Hero?", "“将x坐标增加 (-5)”会让 Hero 怎样？"),
        a: t(
          "Hero moves a little to the LEFT. A bigger x is more to the right, so taking away 5 moves left. For y: bigger is up, smaller is down.",
          "Hero 会向左移动一点。x 越大越靠右，所以减去 5 就向左走。y 也一样：越大越靠上，越小越靠下。"
        )
      },
      steps: [
        {
          title: t("Find x and y", "找到 x 和 y"),
          sprite: null,
          where: t("Sprite info area (x and y boxes)", "角色信息区（x 和 y 框）"),
          do: [
            t("Drag Hero to the right side of the stage. Watch the x box.", "把 Hero 拖到舞台右边，观察 x 框里的数字。"),
            t("Drag Hero to the top. Watch the y box.", "把 Hero 拖到舞台上方，观察 y 框里的数字。"),
            t("Find the middle of the stage. What are x and y there?", "找到舞台中间。那里的 x 和 y 是多少？")
          ],
          hints: [
            t("Look under the stage at the boxes named x and y. Move Hero and see which number changes.", "看舞台下方叫 x 和 y 的两个框。移动 Hero，看看哪个数字在变。"),
            t("No blocks yet. Left and right change x. Up and down change y.", "这一步还不用积木。左右移动改变 x，上下移动改变 y。"),
            { en: "Try these spots:", zh: "试试这些位置：", list: [
              t("Middle of the stage: x is 0, y is 0.", "舞台中间：x = 0，y = 0。"),
              t("Right edge: x is about 240. Left edge: about -240.", "右边缘：x 大约是 240；左边缘：大约是 -240。"),
              t("Top edge: y is about 180. Bottom edge: about -180.", "上边缘：y 大约是 180；下边缘：大约是 -180。")
            ] }
          ]
        },
        {
          title: t("Move right and left", "向右和向左"),
          sprite: "Hero",
          where: t("Hero sprite → green flag script", "Hero 角色 → 绿旗脚本"),
          do: [
            t("Add a “forever” loop at the bottom of Hero's green flag script.", "在 Hero 绿旗脚本最下面加一个“重复执行”。"),
            t("Inside it, add “if <key (right arrow) pressed?> then change x by (5)”.", "在里面加“如果 <按下 (→) 键?> 那么 将x坐标增加 (5)”。"),
            t("Add a second “if” for the left arrow with change x by (-5). Click the green flag and test.", "再加一个“如果”，用于 ← 键，将x坐标增加 (-5)。点绿旗测试。")
          ],
          hints: [
            t("When you hold a key, the game must check again and again: “Is the key pressed?” Which block repeats again and again?", "按住按键时，游戏要一遍又一遍地检查“这个键按下了吗？”哪个积木能不停地重复？"),
            t("Control (orange): “forever” and “if then”. Sensing (light blue): “key (space) pressed?” — change the menu to right arrow. Motion: “change x by”.", "“控制”（橙色）：“重复执行”和“如果那么”。“侦测”（浅蓝）：“按下 (空格) 键?”——把下拉菜单改成 →。“运动”：“将x坐标增加”。"),
            { en: "Add the loop under your Level 1 blocks on Hero:", zh: "把循环加在 Hero 原来的第 1 关积木下面：", blocks: [
              GF(), GO_START(1), POINT90(1),
              FOREVER(1),
              b("control", "if <key (right arrow) pressed?> then", "如果 <按下 (→) 键?> 那么", 2),
              b("motion", "change x by (5)", "将x坐标增加 (5)", 3),
              b("control", "if <key (left arrow) pressed?> then", "如果 <按下 (←) 键?> 那么", 2),
              b("motion", "change x by (-5)", "将x坐标增加 (-5)", 3)
            ] }
          ]
        },
        {
          title: t("Move up and down", "向上和向下"),
          sprite: "Hero",
          where: t("Hero sprite → inside the forever loop", "Hero 角色 → “重复执行”里面"),
          do: [
            t("Add two more “if” blocks inside the same forever loop.", "在同一个“重复执行”里再加两个“如果”。"),
            t("Up arrow: change y by (5). Down arrow: change y by (-5).", "↑ 键：将y坐标增加 (5)；↓ 键：将y坐标增加 (-5)。"),
            t("Test all four arrows. Then click the green flag again. Is Hero back at the start?", "测试四个方向键，再点一次绿旗。Hero 回到起点了吗？")
          ],
          hints: [
            t("Right and left change x. Which letter changes for up and down?", "左右改变的是 x。上下改变的是哪个字母？"),
            t("Right-click an “if” block and choose Duplicate. Change the key menu and use Motion → “change y by”.", "右键点击一个“如果”积木，选“复制”。改掉按键菜单，并换成“运动”里的“将y坐标增加”。"),
            { en: "Add these inside the forever loop, under the left-arrow block:", zh: "把这些放进“重复执行”，在 ← 键那段下面：", blocks: [
              note("…forever loop with right and left…", "……含左右移动的重复执行……", 1),
              b("control", "if <key (up arrow) pressed?> then", "如果 <按下 (↑) 键?> 那么", 2),
              b("motion", "change y by (5)", "将y坐标增加 (5)", 3),
              b("control", "if <key (down arrow) pressed?> then", "如果 <按下 (↓) 键?> 那么", 2),
              b("motion", "change y by (-5)", "将y坐标增加 (-5)", 3)
            ] }
          ]
        }
      ],
      check: [
        t("All four arrow keys move Hero the right way.", "四个方向键都能让 Hero 朝正确方向移动。"),
        t("When I let go of the keys, Hero stops.", "松开按键后，Hero 会停下。"),
        t("The green flag still sends Hero back to the start.", "点击绿旗，Hero 仍然会回到起点。")
      ],
      problems: [
        { symptom: t("Hero moves only one tiny step, then stops working.", "Hero 只动了一小步，然后就不动了。"),
          fix: t("The “if” blocks must be INSIDE the “forever” loop. Without forever, the check happens only once.", "“如果”积木必须放在“重复执行”里面。没有重复执行，检查只会发生一次。") },
        { symptom: t("Hero keeps moving by itself.", "Hero 自己一直在动。"),
          fix: t("A “change x by” block is inside forever but not inside an “if”. Move it into the right “if” block.", "有一个“将x坐标增加”在重复执行里，但没放进“如果”里。把它移进对应的“如果”积木。") },
        { symptom: t("Pressing up makes Hero go down.", "按 ↑ 键 Hero 却往下走。"),
          fix: t("Swap the numbers: up is change y by (5), down is change y by (-5).", "把数字换过来：↑ 用 将y坐标增加 (5)，↓ 用 将y坐标增加 (-5)。") },
        { symptom: t("Hero is too fast or too slow.", "Hero 太快或太慢。"),
          fix: t("Change all four numbers together, for example 3 for slow or 8 for fast. Keep the minus signs.", "四个数字一起改，比如慢一点用 3，快一点用 8，负号保留。") }
      ],
      challenge: {
        title: t("Face the way you walk", "朝着行走方向"),
        text: t("Make Hero face left when moving left, and right when moving right.", "让 Hero 向左走时面朝左，向右走时面朝右。"),
        hint: { en: "Put a “point in direction” block inside each if. Add the rotation style block at the top of the green flag script so Hero does not turn upside down:", zh: "在每个“如果”里放一个“面向方向”积木。在绿旗脚本顶部加上旋转方式积木，防止 Hero 倒过来：", blocks: [
          b("motion", "set rotation style [left-right]", "将旋转方式设为 [左右翻转]", 1),
          b("motion", "point in direction (-90)", "面向 (-90) 方向", 3),
          b("motion", "point in direction (90)", "面向 (90) 方向", 3)
        ] }
      },
      reflect: t("Why do we need the “forever” loop here?", "这里为什么需要“重复执行”？")
    },

    /* ───────────── Level 3 ───────────── */
    {
      id: 3,
      icon: "🌋",
      title: t("Lava Trap", "岩浆陷阱"),
      concept: t("Conditions (if) and collision detection (touching)", "条件判断（如果）和碰撞检测（碰到）"),
      goal: t(
        "Make a Lava sprite. If Hero touches it, Hero goes back to the start.",
        "做一个岩浆角色 Lava。Hero 碰到它，就回到起点。"
      ),
      blocks: [
        b("control", "if <> then", "如果 <> 那么"),
        b("sensing", "touching (Lava)?", "碰到 (Lava)?"),
        GO_START()
      ],
      predict: {
        q: t("Hero walks into the lava. Where does Hero go?", "Hero 走进岩浆，会去哪里？"),
        a: t(
          "Back to the start. The forever loop keeps asking “Am I touching Lava?”. When the answer is yes, the blocks inside the “if” run.",
          "回到起点。重复执行一直在问“我碰到 Lava 了吗？”，答案是“是”的时候，“如果”里面的积木就会运行。"
        )
      },
      steps: [
        {
          title: t("Make the Lava", "做出岩浆"),
          sprite: "Lava",
          where: t("New sprite → Paint", "新角色 → 绘制"),
          do: [
            t("Hover on “Choose a Sprite” and click the paintbrush (Paint).", "把鼠标移到“选择一个角色”上，点画笔图标（绘制）。"),
            t("Draw a red or orange shape. Name the sprite Lava.", "画一个红色或橙色的形状，把角色命名为 Lava。"),
            t("Drag Lava to a place on the path, far away from the start pad.", "把 Lava 拖到路上，离起点平台远一点。")
          ],
          hints: [
            t("Lava must be its own sprite, not part of the backdrop. Why? Hero can only check “touching” for sprites.", "岩浆必须是一个独立角色，不能画在背景里。为什么？因为 Hero 只能检测“碰到”某个角色。"),
            t("Use the Paint option in the sprite menu and the Rectangle tool. Then type Lava in the name box.", "用角色菜单里的“绘制”和矩形工具，然后在名字框输入 Lava。"),
            { en: "Do it in this order:", zh: "按这个顺序做：", list: [
              t("Choose a Sprite → Paint (paintbrush).", "选择一个角色 → 绘制（画笔）。"),
              t("Rectangle tool → pick red → draw.", "矩形工具 → 选红色 → 画出来。"),
              t("Name it Lava. Drag it onto the path, away from the start.", "命名为 Lava，拖到路上，远离起点。")
            ] }
          ]
        },
        {
          title: t("Touch lava → back to start", "碰到岩浆 → 回到起点"),
          sprite: "Hero",
          where: t("Hero sprite → inside the forever loop", "Hero 角色 → “重复执行”里面"),
          do: [
            t("Click Hero (not Lava!).", "点击 Hero（不是 Lava！）。"),
            t("Inside the forever loop, add “if <touching (Lava)?> then”.", "在“重复执行”里加“如果 <碰到 (Lava)?> 那么”。"),
            t("Inside that if, put “go to x: (-200) y: (-130)” — the same start numbers as Level 1.", "在这个“如果”里放“移到 x: (-200) y: (-130)”——和第 1 关一样的起点数字。")
          ],
          hints: [
            t("Hero needs to keep asking “Am I touching lava?”. Where in Hero's script does something happen again and again?", "Hero 需要一直问“我碰到岩浆了吗？”。Hero 脚本里哪个地方会一遍遍重复？"),
            t("Control: “if then”. Sensing: “touching (mouse-pointer)?” — pick Lava in the menu. Motion: “go to x: y:”.", "“控制”：“如果那么”。“侦测”：“碰到 (鼠标指针)?”——在菜单里选 Lava。“运动”：“移到 x: y:”。"),
            { en: "Add this inside Hero's forever loop, under the arrow-key blocks:", zh: "把这段放进 Hero 的“重复执行”，在方向键积木下面：", blocks: [
              note("…forever loop with the 4 arrow keys…", "……含 4 个方向键的重复执行……", 1),
              b("control", "if <touching (Lava)?> then", "如果 <碰到 (Lava)?> 那么", 2),
              GO_START(3)
            ] }
          ]
        },
        {
          title: t("Test the trap and add more lava", "测试陷阱，加更多岩浆"),
          sprite: "Lava",
          where: t("Lava sprite → Costumes tab", "Lava 角色 → 造型 标签页"),
          do: [
            t("Click the green flag and walk into the lava on purpose.", "点绿旗，故意走进岩浆。"),
            t("Want more lava? Click Lava → Costumes and draw more shapes in the SAME costume.", "想要更多岩浆？点 Lava → 造型，在同一个造型里多画几块。"),
            t("Leave a safe path so the level can still be finished.", "留一条安全的路，让关卡还能通过。")
          ],
          hints: [
            t("Hero only checks the sprite named Lava. Where should extra lava go so Hero can feel it?", "Hero 只检测名叫 Lava 的角色。额外的岩浆放在哪里，Hero 才能感觉到？"),
            t("No new blocks. Use the Costumes tab of the Lava sprite and the paint tools.", "不需要新积木。用 Lava 角色的“造型”标签页和绘图工具。"),
            { en: "Do it in this order:", zh: "按这个顺序做：", list: [
              t("Click Lava → Costumes tab.", "点击 Lava → 造型。"),
              t("Draw more red shapes in the same costume.", "在同一个造型里再画几块红色形状。"),
              t("Click the green flag. Check there is still a safe path to the other side.", "点绿旗，确认还有一条能走到另一边的安全路线。")
            ] }
          ]
        }
      ],
      check: [
        t("Touching the lava sends Hero back to the start.", "碰到岩浆，Hero 会回到起点。"),
        t("There is a safe path where Hero does not touch lava.", "有一条 Hero 不会碰到岩浆的安全路线。"),
        t("The green flag still sends Hero to the start.", "点击绿旗，Hero 仍然会回到起点。")
      ],
      problems: [
        { symptom: t("“Lava” is not in the touching menu.", "“碰到”的菜单里没有 Lava。"),
          fix: t("Check the sprite is named exactly Lava. Also make sure you are editing Hero — the menu lists the OTHER sprites.", "检查角色名字是否正好是 Lava。还要确认你正在编辑 Hero——菜单里列出的是“其他”角色。") },
        { symptom: t("Hero goes back to the start again and again without moving.", "Hero 一直在起点被送回，动不了。"),
          fix: t("The lava is touching the start pad. Drag Lava away from the start, or erase the lava near it.", "岩浆碰到了起点平台。把 Lava 拖离起点，或擦掉起点附近的岩浆。") },
        { symptom: t("The Lava moves instead of Hero.", "动的是 Lava，不是 Hero。"),
          fix: t("You put the script on Lava. Drag the script onto Hero in the sprite list to copy it, then delete it from Lava.", "你把脚本放在了 Lava 上。把脚本拖到角色列表里的 Hero 上复制过去，再从 Lava 删除。") },
        { symptom: t("My second piece of lava does not hurt.", "第二块岩浆碰到了也没反应。"),
          fix: t("You probably duplicated the sprite (Lava2). Hero only checks Lava. Draw all lava in the Lava costume, or delete Lava2.", "你大概复制出了角色 Lava2，而 Hero 只检测 Lava。把所有岩浆都画进 Lava 的造型里，或删掉 Lava2。") },
        { symptom: t("I painted lava on the backdrop and it does nothing.", "我把岩浆画在背景上，没有任何效果。"),
          fix: t("“touching (Lava)?” only works with a sprite. Make lava as a sprite named Lava.", "“碰到 (Lava)?”只对角色有效。请把岩浆做成名叫 Lava 的角色。") }
      ],
      challenge: {
        title: t("Moving lava", "会动的岩浆"),
        text: t("Make the Lava slide back and forth. Keep the start pad safe!", "让 Lava 来回滑动。记得让起点保持安全！"),
        hint: { en: "Put this on the Lava sprite. Change the numbers to two spots on your path:", zh: "把它放在 Lava 角色上，把数字改成你路上的两个位置：", blocks: [
          GF(),
          FOREVER(1),
          b("motion", "glide (2) secs to x: (0) y: (50)", "在 (2) 秒内滑行到 x: (0) y: (50)", 2),
          b("motion", "glide (2) secs to x: (0) y: (-50)", "在 (2) 秒内滑行到 x: (0) y: (-50)", 2)
        ] }
      },
      reflect: t("Explain “if … then” in your own words.", "用你自己的话解释“如果……那么”。")
    },

    /* ───────────── Level 4 ───────────── */
    {
      id: 4,
      icon: "🪙",
      title: t("Coin Collector", "金币收集"),
      concept: t("Variables: a box that remembers a number", "变量：一个能记住数字的盒子"),
      goal: t(
        "Add coins. Each coin gives 1 point, only once. The Score starts at 0 every game.",
        "加入金币。每个金币加 1 分，而且只能收集一次。每局开始时分数为 0。"
      ),
      blocks: [
        b("variables", "set [Score] to (0)", "将 [Score] 设为 (0)"),
        b("variables", "change [Score] by (1)", "将 [Score] 增加 (1)"),
        b("looks", "show", "显示"),
        b("looks", "hide", "隐藏"),
        WAIT_HERO()
      ],
      predict: {
        q: t("Hero stands still on top of a coin. How many points does Hero get? Why?", "Hero 站在一个金币上不动，能得几分？为什么？"),
        a: t(
          "Just 1. “wait until” waits once. Then the coin adds 1, hides, and its script ends. Nothing is left to add more points.",
          "只有 1 分。“等待……”只等一次；之后金币加 1 分、隐藏，脚本就结束了，没有积木再继续加分。"
        )
      },
      steps: [
        {
          title: t("Make the Score variable", "创建 Score 变量"),
          sprite: "Hero",
          where: t("Variables category, then Hero's green flag script", "“变量”分类，然后是 Hero 的绿旗脚本"),
          do: [
            t("Click Variables → “Make a Variable”. Name it Score. Choose “For all sprites”. Click OK.", "点“变量”→“建立一个变量”，命名为 Score，选“适用于所有角色”，点确定。"),
            t("On Hero, add “set [Score] to (0)” in the green flag script, BEFORE the forever loop.", "在 Hero 的绿旗脚本里，“重复执行”之前，加上“将 [Score] 设为 (0)”。"),
            t("Click the green flag. The Score on the stage should show 0.", "点绿旗，舞台上的 Score 应该显示 0。")
          ],
          hints: [
            t("Every new game should start with 0 points. Which script runs once when a new game starts?", "每一局新游戏都应从 0 分开始。哪个脚本会在新游戏开始时运行一次？"),
            t("Variables (dark orange): “Make a Variable” button, then the “set [ ] to ( )” block. Pick Score in its menu.", "“变量”（深橙色）：先点“建立一个变量”按钮，再用“将 [ ] 设为 ( )”积木，在菜单里选 Score。"),
            { en: "Hero's green flag script should start like this:", zh: "Hero 的绿旗脚本开头应该是这样：", blocks: [
              GF(), GO_START(1), POINT90(1),
              b("variables", "set [Score] to (0)", "将 [Score] 设为 (0)", 1),
              note("…your forever loop stays here…", "……你的“重复执行”留在这里……", 1)
            ] }
          ]
        },
        {
          title: t("Make one Coin", "做一个金币"),
          sprite: "Coin",
          where: t("New sprite named Coin → Code tab", "新角色 Coin → 代码 标签页"),
          do: [
            t("Add a coin sprite (paint a yellow circle, or pick one). Name it Coin. Drag it onto the path.", "添加一个金币角色（画一个黄色圆，或从库里挑一个），命名为 Coin，拖到路上。"),
            t("On Coin: green flag → show → go to its spot → wait 0.2 seconds → wait until touching Hero → change Score by 1 → hide.", "在 Coin 上：绿旗 → 显示 → 移到它的位置 → 等待 0.2 秒 → 等待碰到 Hero → Score 增加 1 → 隐藏。"),
            t("The short wait lets Hero get back to the start first, so no coin is grabbed by accident when the game begins.", "这短短的等待让 Hero 先回到起点，这样游戏刚开始时不会意外吃到金币。")
          ],
          hints: [
            t("A coin should: come back when the game starts, wait for Hero, add 1 point, then vanish. Which of these makes it count only once?", "金币要做到：游戏开始时出现、等 Hero 来、加 1 分、然后消失。哪一步保证它只算一次？"),
            t("Events: green flag. Looks: “show” and “hide”. Control: “wait” and “wait until”. Sensing: “touching (Hero)?”. Variables: “change [Score] by (1)”.", "“事件”：绿旗。“外观”：“显示”“隐藏”。“控制”：“等待”和“等待……”。“侦测”：“碰到 (Hero)?”。“变量”：“将 [Score] 增加 (1)”。"),
            { en: "Put this on Coin. Tip: drag Coin to its spot first — the “go to x: y:” block in the Motion list then shows the Coin's position.", zh: "把这段放在 Coin 上。小技巧：先把 Coin 拖到想要的位置，这时“运动”列表里的“移到 x: y:”积木会自动显示它的坐标。", blocks: [
              GF(),
              b("looks", "show", "显示", 1),
              b("motion", "go to x: (0) y: (0)", "移到 x: (0) y: (0)", 1),
              note("use your Coin's own numbers", "换成你的金币自己的坐标", 2),
              WAIT_SHORT(1),
              WAIT_HERO(1),
              b("variables", "change [Score] by (1)", "将 [Score] 增加 (1)", 1),
              b("looks", "hide", "隐藏", 1)
            ] }
          ]
        },
        {
          title: t("Make more coins", "做更多金币"),
          sprite: "Coin",
          where: t("Sprite list → right-click Coin → duplicate", "角色列表 → 右键 Coin → 复制"),
          do: [
            t("Right-click Coin in the sprite list and choose “duplicate”. Do it again to get 3 coins.", "在角色列表里右键点击 Coin，选“复制”。再做一次，一共 3 个金币。"),
            t("Drag each new coin to a new spot.", "把每个新金币拖到新的位置。"),
            t("Open each coin's script and change its “go to x: y:” numbers to its new spot.", "打开每个金币的脚本，把“移到 x: y:”的数字改成它的新位置。")
          ],
          hints: [
            t("A duplicate copies the script too — including the numbers. Where will a copied coin go when the game starts?", "复制时脚本也会一起复制——包括里面的数字。游戏开始时，复制出来的金币会跑到哪？"),
            t("No new blocks. Change the numbers in each coin's Motion block “go to x: y:”.", "不需要新积木。修改每个金币里“运动”积木“移到 x: y:”的数字。"),
            { en: "For each copy (Coin2, Coin3):", zh: "对每个复制品（Coin2、Coin3）：", list: [
              t("Click the coin in the sprite list.", "在角色列表里点击这个金币。"),
              t("Drag it on the stage to its new spot.", "在舞台上把它拖到新位置。"),
              t("Type its x and y (from the sprite info area) into its “go to x: y:” block.", "把角色信息区里显示的 x、y 填进它的“移到 x: y:”积木。")
            ] }
          ]
        }
      ],
      check: [
        t("Each coin gives exactly 1 point.", "每个金币正好加 1 分。"),
        t("Standing where a coin was does not add more points.", "站在金币原来的位置上，不会继续加分。"),
        t("After the green flag: Score is 0 and all coins come back in their own places.", "点绿旗后：分数为 0，所有金币都回到各自的位置。")
      ],
      problems: [
        { symptom: t("The score goes up super fast.", "分数涨得飞快。"),
          fix: t("You probably used “forever” + “if touching”. Use “wait until <touching (Hero)?>”, then change Score by 1, then hide — with no forever.", "你可能用了“重复执行”+“如果碰到”。请改用“等待 <碰到 (Hero)?>”，然后 Score 增加 1，再隐藏——不要重复执行。") },
        { symptom: t("Coins are gone when I play again.", "再玩一次时，金币都不见了。"),
          fix: t("Add “show” at the top of each coin's green flag script. A hidden coin stays hidden until something shows it.", "在每个金币绿旗脚本的最上面加“显示”。隐藏的金币会一直隐藏，直到有积木让它显示。") },
        { symptom: t("All my coins jump to the same spot.", "所有金币都跳到同一个位置。"),
          fix: t("Duplicates copied the same “go to” numbers. Change the numbers in each coin's script.", "复制品沿用了同样的“移到”数字。逐个修改每个金币脚本里的数字。") },
        { symptom: t("The score does not go back to 0.", "分数不会回到 0。"),
          fix: t("Put “set [Score] to (0)” in Hero's green flag script, before the forever loop.", "在 Hero 的绿旗脚本里、“重复执行”之前，放“将 [Score] 设为 (0)”。") },
        { symptom: t("The score does not change at all.", "分数一点都没变。"),
          fix: t("Check the menu in “change [ ] by (1)”. It must say Score, not “my variable”.", "检查“将 [ ] 增加 (1)”的菜单，必须是 Score，而不是“我的变量”。") }
      ],
      challenge: {
        title: t("Super gem", "超级宝石"),
        text: t("Make one special gem that is worth 5 points.", "做一个特别的宝石，值 5 分。"),
        hint: { en: "Duplicate a coin, give it a gem costume, and change its number:", zh: "复制一个金币，换成宝石造型，然后修改数字：", blocks: [b("variables", "change [Score] by (5)", "将 [Score] 增加 (5)", 1)] }
      },
      reflect: t("What is a variable? How does your game use one?", "什么是变量？你的游戏是怎么用它的？")
    },

    /* ───────────── Level 5 ───────────── */
    {
      id: 5,
      icon: "🚩",
      title: t("Checkpoint Flag", "检查点旗帜"),
      concept: t("Variables that remember a place", "用变量记住一个位置"),
      goal: t(
        "Add a checkpoint. After Hero touches it, lava sends Hero to the checkpoint, not the start.",
        "加入检查点。Hero 碰到检查点后，再碰岩浆就回到检查点，而不是起点。"
      ),
      blocks: [
        b("variables", "set [Checkpoint X] to (-200)", "将 [Checkpoint X] 设为 (-200)"),
        b("motion", "go to x: (Checkpoint X) y: (Checkpoint Y)", "移到 x: (Checkpoint X) y: (Checkpoint Y)"),
        b("motion", "x position", "x 坐标"),
        b("motion", "y position", "y 坐标")
      ],
      predict: {
        q: t("Hero touches the checkpoint, then touches lava. Where does Hero go? And after you click the green flag?", "Hero 碰到检查点，然后碰到岩浆，会去哪里？点击绿旗之后呢？"),
        a: t(
          "First, to the checkpoint — the variables now remember its spot. After the green flag, the variables are set back to the start, so lava sends Hero to the start again.",
          "先回到检查点——变量现在记住了它的位置。点绿旗后，变量又被设回起点，所以碰到岩浆会再次回到起点。"
        )
      },
      steps: [
        {
          title: t("Two variables for the respawn spot", "用两个变量记住复活点"),
          sprite: "Hero",
          where: t("Variables category, then Hero's green flag script", "“变量”分类，然后是 Hero 的绿旗脚本"),
          do: [
            t("Make two variables “For all sprites”: Checkpoint X and Checkpoint Y.", "建立两个“适用于所有角色”的变量：Checkpoint X 和 Checkpoint Y。"),
            t("On Hero, before the forever loop, set Checkpoint X to (-200) and Checkpoint Y to (-130).", "在 Hero 的“重复执行”之前，将 Checkpoint X 设为 (-200)，Checkpoint Y 设为 (-130)。"),
            t("These are the same numbers as the start. So every new game respawns at the start.", "这和起点的数字一样，所以每局新游戏的复活点都是起点。")
          ],
          hints: [
            t("A new game should forget the old checkpoint. What does Hero do with Score when the green flag is clicked? Do the same here.", "新游戏应该忘掉旧的检查点。点绿旗时 Hero 是怎样处理 Score 的？这里也一样做。"),
            t("Variables: “Make a Variable” twice, then two “set [ ] to ( )” blocks.", "“变量”：点两次“建立一个变量”，再用两个“将 [ ] 设为 ( )”积木。"),
            { en: "Hero's green flag script should now start like this:", zh: "Hero 的绿旗脚本现在开头应该是这样：", blocks: [
              GF(), GO_START(1), POINT90(1),
              b("variables", "set [Score] to (0)", "将 [Score] 设为 (0)", 1),
              b("variables", "set [Checkpoint X] to (" + START_X + ")", "将 [Checkpoint X] 设为 (" + START_X + ")", 1),
              b("variables", "set [Checkpoint Y] to (" + START_Y + ")", "将 [Checkpoint Y] 设为 (" + START_Y + ")", 1),
              note("…your forever loop stays here…", "……你的“重复执行”留在这里……", 1)
            ] }
          ]
        },
        {
          title: t("Lava sends you to the checkpoint", "岩浆把你送回检查点"),
          sprite: "Hero",
          where: t("Hero sprite → the “touching Lava” if", "Hero 角色 → “碰到 Lava”的如果"),
          do: [
            t("Find the “if <touching (Lava)?>” block in Hero's forever loop.", "在 Hero 的“重复执行”里找到“如果 <碰到 (Lava)?>”。"),
            t("Drag the round Checkpoint X block into the x slot of “go to”. Put Checkpoint Y into the y slot.", "把圆形的 Checkpoint X 积木拖进“移到”的 x 空格，把 Checkpoint Y 放进 y 空格。"),
            t("Test: lava still sends Hero to the start (we have no checkpoint flag yet).", "测试：碰到岩浆仍然回到起点（因为还没有检查点旗帜）。")
          ],
          hints: [
            t("The “go to” inside the lava “if” still has fixed numbers. What could hold a number that changes?", "岩浆“如果”里的“移到”还是固定数字。什么东西可以装一个会变化的数字？"),
            t("Variables: the round orange reporter blocks named Checkpoint X and Checkpoint Y. Drop them into the white number slots.", "“变量”：名叫 Checkpoint X 和 Checkpoint Y 的圆形橙色积木，把它们放进白色的数字空格里。"),
            { en: "The lava part of Hero's loop becomes:", zh: "Hero 循环里的岩浆部分变成：", blocks: [
              b("control", "if <touching (Lava)?> then", "如果 <碰到 (Lava)?> 那么", 2),
              b("motion", "go to x: (Checkpoint X) y: (Checkpoint Y)", "移到 x: (Checkpoint X) y: (Checkpoint Y)", 3)
            ] }
          ]
        },
        {
          title: t("Make the Checkpoint flag", "做出检查点旗帜"),
          sprite: "Checkpoint",
          where: t("New sprite named Checkpoint → Code tab", "新角色 Checkpoint → 代码 标签页"),
          do: [
            t("Add a flag sprite and name it Checkpoint. Put it on safe ground, halfway along the path.", "添加一个旗帜角色，命名为 Checkpoint，放在路中间的安全地面上（不要碰到岩浆）。"),
            t("On Checkpoint: green flag → wait 0.2 seconds → wait until touching Hero.", "在 Checkpoint 上：绿旗 → 等待 0.2 秒 → 等待碰到 Hero。"),
            t("Then set Checkpoint X to (x position) and Checkpoint Y to (y position), and say “Checkpoint!”.", "然后将 Checkpoint X 设为 (x 坐标)，Checkpoint Y 设为 (y 坐标)，再说“检查点！”。")
          ],
          hints: [
            t("When Hero touches the flag, the game should remember WHERE the flag is. Which sprite knows the flag's position?", "Hero 碰到旗帜时，游戏要记住旗帜在“哪里”。哪个角色知道旗帜的位置？"),
            t("Control: “wait”, “wait until”. Sensing: “touching (Hero)?”. Variables: “set”. Motion (at the bottom of the list): the round “x position” and “y position” blocks.", "“控制”：“等待”“等待……”。“侦测”：“碰到 (Hero)?”。“变量”：“设为”。“运动”（列表最下面）：圆形的“x 坐标”和“y 坐标”。"),
            { en: "Put this on the Checkpoint sprite (so x position means the flag's x):", zh: "把它放在 Checkpoint 角色上（这样“x 坐标”就是旗帜的 x）：", blocks: [
              GF(),
              WAIT_SHORT(1),
              WAIT_HERO(1),
              b("variables", "set [Checkpoint X] to (x position)", "将 [Checkpoint X] 设为 (x 坐标)", 1),
              b("variables", "set [Checkpoint Y] to (y position)", "将 [Checkpoint Y] 设为 (y 坐标)", 1),
              b("looks", "say (Checkpoint!) for (1) seconds", "说 (检查点！) (1) 秒", 1)
            ] }
          ]
        }
      ],
      check: [
        t("Before the checkpoint: lava sends Hero to the start.", "碰到检查点之前：岩浆把 Hero 送回起点。"),
        t("After touching the checkpoint: lava sends Hero to the checkpoint.", "碰到检查点之后：岩浆把 Hero 送回检查点。"),
        t("After the green flag: lava sends Hero to the start again.", "点绿旗后：岩浆又会把 Hero 送回起点。")
      ],
      problems: [
        { symptom: t("After the green flag, Hero still respawns at the checkpoint.", "点了绿旗，Hero 还是在检查点复活。"),
          fix: t("Hero's green flag script must set Checkpoint X to (-200) and Checkpoint Y to (-130) before the forever loop.", "Hero 的绿旗脚本必须在“重复执行”之前，把 Checkpoint X 设为 (-200)、Checkpoint Y 设为 (-130)。") },
        { symptom: t("Hero always goes to the start, even after the checkpoint.", "碰过检查点后，Hero 还是总回到起点。"),
          fix: t("The lava “go to” still has numbers. Put the Checkpoint X and Checkpoint Y blocks in it. Also check the flag script is on the Checkpoint sprite.", "岩浆里的“移到”还是数字，请换成 Checkpoint X 和 Checkpoint Y 积木。也检查旗帜脚本是否放在 Checkpoint 角色上。") },
        { symptom: t("Hero respawns in the middle of the stage (x 0, y 0).", "Hero 在舞台中间（x 0, y 0）复活。"),
          fix: t("The variables were never set, so they are 0. Add the two “set” blocks to Hero's green flag script.", "变量从没被设置过，所以是 0。在 Hero 的绿旗脚本里加上那两个“设为”积木。") },
        { symptom: t("Hero respawns where Hero was standing, not at the flag.", "Hero 在自己刚才站的地方复活，而不是旗帜那里。"),
          fix: t("The “x position” block was used in Hero's script, so it means Hero's position. Move the flag script to the Checkpoint sprite.", "“x 坐标”积木被用在了 Hero 的脚本里，所以表示 Hero 的位置。把旗帜脚本移到 Checkpoint 角色上。") },
        { symptom: t("Hero dies again and again after respawning.", "Hero 复活后一次又一次地“死掉”。"),
          fix: t("The checkpoint is touching lava. Move the flag to safe ground.", "检查点碰到了岩浆。把旗帜移到安全的地面上。") }
      ],
      challenge: {
        title: t("Flag turns on", "点亮旗帜"),
        text: t("Give Checkpoint a second costume. Switch to it when Hero touches the flag, and switch back when the game starts.", "给 Checkpoint 做第二个造型。Hero 碰到时换成它，游戏开始时换回来。"),
        hint: { en: "Name the costumes off and on. Then add these to the Checkpoint script:", zh: "把两个造型命名为 off 和 on，然后在 Checkpoint 脚本里加入：", blocks: [
          GF(),
          b("looks", "switch costume to [off]", "换成 [off] 造型", 1),
          note("…after wait until touching Hero:", "……在“等待碰到 Hero”之后：", 1),
          b("looks", "switch costume to [on]", "换成 [on] 造型", 1)
        ] }
      },
      reflect: t("Why must the green flag set the checkpoint back to the start?", "为什么点绿旗时必须把检查点设回起点？")
    },

    /* ───────────── Level 6 ───────────── */
    {
      id: 6,
      icon: "🏆",
      title: t("Victory Portal", "胜利传送门"),
      concept: t("Broadcast: one sprite sends a message, others listen", "广播：一个角色发消息，其他角色接收"),
      goal: t(
        "Add a Goal. When Hero reaches it, broadcast “You Win”: a banner appears and Hero stops.",
        "加入终点 Goal。Hero 到达时广播“You Win”：显示胜利横幅，Hero 停下。"
      ),
      blocks: [
        b("events", "broadcast (You Win)", "广播 (You Win)"),
        b("events", "when I receive [You Win]", "当接收到 [You Win]"),
        b("looks", "go to [front] layer", "移到最 [前面]"),
        b("control", "stop [other scripts in sprite]", "停止 [该角色的其他脚本]")
      ],
      predict: {
        q: t("Hero touches the Goal, walks away, and touches it again. How many times is “You Win” sent?", "Hero 碰到终点，走开，再碰一次。“You Win”会被发送几次？"),
        a: t(
          "Only once. The Goal uses “wait until”, so its script broadcasts one time and then ends. A new green flag starts a new game.",
          "只发送一次。终点用的是“等待……”，脚本广播一次后就结束了。点新的绿旗才会开始新一局。"
        )
      },
      steps: [
        {
          title: t("Make the Goal", "做出终点"),
          sprite: "Goal",
          where: t("New sprite named Goal → Code tab", "新角色 Goal → 代码 标签页"),
          do: [
            t("Add a door, portal or trophy sprite. Name it Goal. Put it at the end of the path.", "添加一个门、传送门或奖杯角色，命名为 Goal，放在路的终点。"),
            t("On Goal: green flag → wait 0.2 seconds → wait until touching Hero → broadcast.", "在 Goal 上：绿旗 → 等待 0.2 秒 → 等待碰到 Hero → 广播。"),
            t("In the broadcast menu choose “New message” and type You Win.", "在广播的菜单里选“新消息”，输入 You Win。")
          ],
          hints: [
            t("This is like a coin, but instead of adding points it tells everyone “we won”. How did the coin wait for Hero?", "这和金币很像，只是它不加分，而是告诉大家“我们赢了”。金币是怎么等 Hero 的？"),
            t("Control: “wait”, “wait until”. Sensing: “touching (Hero)?”. Events (yellow): “broadcast ( )” → New message.", "“控制”：“等待”“等待……”。“侦测”：“碰到 (Hero)?”。“事件”（黄色）：“广播 ( )”→ 新消息。"),
            { en: "Put this on the Goal sprite:", zh: "把这段放在 Goal 角色上：", blocks: [
              GF(),
              WAIT_SHORT(1),
              WAIT_HERO(1),
              b("events", "broadcast (You Win)", "广播 (You Win)", 1)
            ] }
          ]
        },
        {
          title: t("Make the Win Banner", "做出胜利横幅"),
          sprite: "Win Banner",
          where: t("New sprite named Win Banner → Code tab", "新角色 Win Banner → 代码 标签页"),
          do: [
            t("Paint a new sprite with big text: YOU WIN! Name it Win Banner.", "绘制一个新角色，写上大字 YOU WIN!，命名为 Win Banner。"),
            t("On Win Banner: when green flag clicked → hide.", "在 Win Banner 上：当绿旗被点击 → 隐藏。"),
            t("Also on Win Banner: when I receive [You Win] → go to front layer → show.", "也在 Win Banner 上：当接收到 [You Win] → 移到最前面 → 显示。")
          ],
          hints: [
            t("The banner should be invisible while playing and appear when the message arrives. So it needs two scripts. What starts each one?", "横幅玩的时候要看不见，收到消息时才出现。所以它需要两段脚本。每段由什么启动？"),
            t("Events: “when green flag clicked” and “when I receive [ ]”. Looks: “hide”, “show”, “go to [front] layer”.", "“事件”：“当绿旗被点击”和“当接收到 [ ]”。“外观”：“隐藏”“显示”“移到最 [前面]”。"),
            { en: "Two scripts on Win Banner:", zh: "Win Banner 上的两段脚本：", blocks: [
              GF(),
              b("looks", "hide", "隐藏", 1),
              note("— second script —", "—— 第二段脚本 ——", 0),
              b("events", "when I receive [You Win]", "当接收到 [You Win]", 0),
              b("looks", "go to [front] layer", "移到最 [前面]", 1),
              b("looks", "show", "显示", 1)
            ] }
          ]
        },
        {
          title: t("Hero stops and cheers", "Hero 停下欢呼"),
          sprite: "Hero",
          where: t("Hero sprite → a new script", "Hero 角色 → 新的一段脚本"),
          do: [
            t("On Hero, add a new script: “when I receive [You Win]”.", "在 Hero 上新建一段脚本：“当接收到 [You Win]”。"),
            t("Under it: “stop [other scripts in sprite]” (this stops the arrow-key loop), then “say (I did it!) for (2) seconds”.", "下面拼“停止 [该角色的其他脚本]”（它会停止方向键循环），再拼“说 (我做到了！) (2) 秒”。"),
            t("Play the whole level. Then click the green flag and play again.", "完整玩一遍关卡，然后点绿旗再玩一次。")
          ],
          hints: [
            t("After winning, Hero's forever loop is still running, so Hero can still walk into lava. What could stop that loop?", "赢了以后，Hero 的重复执行还在运行，所以还能走进岩浆。用什么能让这个循环停下？"),
            t("Events: “when I receive [You Win]”. Control: “stop [all]” — change the menu to “other scripts in sprite”. Looks: “say for seconds”.", "“事件”：“当接收到 [You Win]”。“控制”：“停止 [全部脚本]”——把菜单改成“该角色的其他脚本”。“外观”：“说……秒”。"),
            { en: "New script on Hero:", zh: "Hero 上的新脚本：", blocks: [
              b("events", "when I receive [You Win]", "当接收到 [You Win]", 0),
              b("control", "stop [other scripts in sprite]", "停止 [该角色的其他脚本]", 1),
              b("looks", "say (I did it!) for (2) seconds", "说 (我做到了！) (2) 秒", 1)
            ] }
          ]
        }
      ],
      check: [
        t("Touching the Goal shows YOU WIN! one time.", "碰到终点，YOU WIN! 出现一次。"),
        t("After winning, the arrow keys do not move Hero.", "赢了以后，方向键不能再移动 Hero。"),
        t("After the green flag: the banner is hidden, Hero can move, and the Goal works again.", "点绿旗后：横幅隐藏、Hero 能移动、终点再次有效。")
      ],
      problems: [
        { symptom: t("Nothing happens at the Goal.", "到了终点什么也没发生。"),
          fix: t("Check the message name is exactly You Win in both “broadcast” and “when I receive”. Check the Goal script is on the Goal sprite.", "检查“广播”和“当接收到”里的消息名是否都是 You Win。也检查终点脚本是否在 Goal 角色上。") },
        { symptom: t("The banner is visible when the game starts.", "游戏一开始横幅就在。"),
          fix: t("Add “when green flag clicked → hide” on the Win Banner.", "在 Win Banner 上加“当绿旗被点击 → 隐藏”。") },
        { symptom: t("“You Win” happens again and again.", "“You Win”一次又一次地出现。"),
          fix: t("The Goal uses “forever” + “if”. Use “wait until <touching (Hero)?>” and one broadcast, with no forever.", "终点用了“重复执行”+“如果”。请改用“等待 <碰到 (Hero)?>”加一次广播，不要重复执行。") },
        { symptom: t("Hero can still move after winning.", "赢了以后 Hero 还能动。"),
          fix: t("Put “stop [other scripts in sprite]” under “when I receive [You Win]” on Hero — not on another sprite.", "把“停止 [该角色的其他脚本]”放在 Hero 的“当接收到 [You Win]”下面——不是放在别的角色上。") },
        { symptom: t("The banner is hidden behind other sprites.", "横幅被其他角色挡住了。"),
          fix: t("Add “go to [front] layer” before “show” on the Win Banner.", "在 Win Banner 的“显示”前加“移到最 [前面]”。") }
      ],
      challenge: {
        title: t("Collect them all", "全部收集才能赢"),
        text: t("Make the Goal work only when Hero has all the coins.", "让终点只有在 Hero 收集齐所有金币时才生效。"),
        hint: { en: "Change the Goal's wait until block. Use your total coin points instead of 3:", zh: "修改 Goal 的“等待……”积木。把 3 换成所有金币加起来的总分：", blocks: [
          b("control", "wait until <<touching (Hero)?> and <(Score) = (3)>>", "等待 <<碰到 (Hero)?> 与 <(Score) = (3)>>", 1)
        ] }
      },
      reflect: t("What is a broadcast? Which sprites listened to “You Win” in your game?", "什么是广播？在你的游戏里，哪些角色在接收“You Win”？")
    },

    /* ───────────── Level 7 ───────────── */
    {
      id: 7,
      icon: "🎨",
      title: t("Make It Yours", "打造你的风格"),
      concept: t("Sounds, looks, and your own game rule", "音效、外观和你自己的游戏规则"),
      goal: t(
        "Add sounds, change the looks, and invent one new rule. Change one thing, then test.",
        "加入音效、改变外观，再发明一条新规则。每次只改一样，然后测试。"
      ),
      blocks: [
        b("sound", "start sound ( )", "播放声音 ( )"),
        b("looks", "switch costume to [ ]", "换成 [ ] 造型"),
        b("variables", "change [Lives] by (-1)", "将 [Lives] 增加 (-1)"),
        b("operators", "( ) = ( )", "( ) = ( )")
      ],
      predict: {
        q: t("If you put “play sound until done” inside Hero's forever loop, what happens to moving?", "如果把“播放声音……等待播完”放进 Hero 的重复执行，移动会怎样？"),
        a: t(
          "Hero freezes until the sound ends, because the loop waits. “start sound” plays the sound and keeps going, so Hero can still move.",
          "Hero 会卡住，直到声音播完，因为循环在等待。“播放声音”会边播放边继续执行，所以 Hero 还能移动。"
        )
      },
      steps: [
        {
          title: t("Add sounds", "加入音效"),
          sprite: "Coin",
          where: t("Coin (and Hero) → Sounds tab, then Code", "Coin（和 Hero）→ 声音 标签页，再到代码"),
          do: [
            t("Click Coin → Sounds tab → choose a short sound (like Pop or Collect).", "点 Coin → 声音 标签页 → 选一个短音效（比如 Pop 或 Collect）。"),
            t("In Coin's script, put “start sound” right after “change [Score] by (1)”.", "在 Coin 的脚本里，把“播放声音”放在“将 [Score] 增加 (1)”的后面。"),
            t("Do the same for every coin copy. Try a sound for lava or winning on Hero too.", "每个复制出来的金币都这样做。也可以给 Hero 的岩浆或胜利加个音效。")
          ],
          hints: [
            t("Each sprite only has its own sounds. Which sprite's Sounds tab should the coin sound go in?", "每个角色只有自己的声音。金币的音效应该加在哪个角色的声音标签页里？"),
            t("Sound (pink): “start sound ( )”. Avoid “play sound until done” inside Hero's forever loop.", "“声音”（粉色）：“播放声音 ( )”。不要在 Hero 的重复执行里用“播放声音……等待播完”。"),
            { en: "Coin's script with a sound:", zh: "加了音效的 Coin 脚本：", blocks: [
              note("…green flag, show, go to, wait, wait until…", "……绿旗、显示、移到、等待、等待碰到……", 1),
              b("variables", "change [Score] by (1)", "将 [Score] 增加 (1)", 1),
              b("sound", "start sound (Pop)", "播放声音 (Pop)", 1),
              b("looks", "hide", "隐藏", 1)
            ] }
          ]
        },
        {
          title: t("Change the looks", "改变外观"),
          sprite: "Hero",
          where: t("Any sprite → Costumes tab; Stage → Backdrops", "任意角色 → 造型；舞台 → 背景"),
          do: [
            t("Paint or edit costumes for Hero, Coin, Goal or Lava. Change colors, add a hat, make it yours!", "绘制或修改 Hero、Coin、Goal 或 Lava 的造型。换颜色、加帽子，做出你的风格！"),
            t("If Hero has more than one costume, make the green flag pick the starting one.", "如果 Hero 有好几个造型，就让绿旗选好开始时的造型。"),
            t("Keep the Lava easy to see, so players know it is dangerous.", "让岩浆保持显眼，玩家才知道它危险。")
          ],
          hints: [
            t("Anything that can change during the game must be reset when the game starts. Does a costume count?", "游戏中会改变的东西，开局时都要重置。造型算不算？"),
            t("Costumes tab for drawing. Looks (purple): “switch costume to [ ]” for the green flag script.", "在“造型”标签页画画。“外观”（紫色）：在绿旗脚本里用“换成 [ ] 造型”。"),
            { en: "Add to Hero's green flag script (pick your costume name):", zh: "加到 Hero 的绿旗脚本里（选你的造型名）：", blocks: [
              GF(),
              b("looks", "switch costume to [costume1]", "换成 [costume1] 造型", 1),
              note("…the rest of Hero's start blocks…", "……Hero 其余的开局积木……", 1)
            ] }
          ]
        },
        {
          title: t("Invent your own rule", "发明你的规则"),
          sprite: "Hero",
          where: t("Usually Hero (it depends on your idea)", "通常是 Hero（取决于你的点子）"),
          do: [
            t("Pick ONE idea: 3 lives, a timer, or your own idea (speed pad, moving coin…).", "选一个点子：3 条命、计时器，或你自己的点子（加速板、会动的金币……）。"),
            t("Say it like a rule: “When ___ happens, ___.” Which sprite should hold the script?", "把它说成一条规则：“当……发生时，就……”。脚本应该放在哪个角色上？"),
            t("Build it, then test it 3 times. Make sure the green flag resets your new rule too.", "做出来后测试 3 次。确认绿旗也会重置你的新规则。")
          ],
          hints: [
            t("Lives idea: what should happen each time Hero touches lava? And what happens when no lives are left?", "生命值点子：Hero 每次碰到岩浆要发生什么？没有生命时又会怎样？"),
            t("Variables: make a variable Lives, then “set” and “change”. Control: “if then”, “stop [all]”. Operators (green): “( ) = ( )”.", "“变量”：建立变量 Lives，用“设为”和“增加”。“控制”：“如果那么”“停止 [全部脚本]”。“运算”（绿色）：“( ) = ( )”。"),
            { en: "The 3-lives idea on Hero (add set Lives to the green flag script; change the lava if):", zh: "Hero 上的 3 条命点子（在绿旗脚本里设定 Lives；修改岩浆的“如果”）：", blocks: [
              b("variables", "set [Lives] to (3)", "将 [Lives] 设为 (3)", 1),
              note("…inside the forever loop:", "……在“重复执行”里：", 1),
              b("control", "if <touching (Lava)?> then", "如果 <碰到 (Lava)?> 那么", 2),
              b("motion", "go to x: (Checkpoint X) y: (Checkpoint Y)", "移到 x: (Checkpoint X) y: (Checkpoint Y)", 3),
              b("variables", "change [Lives] by (-1)", "将 [Lives] 增加 (-1)", 3),
              b("control", "if <(Lives) = (0)> then", "如果 <(Lives) = (0)> 那么", 3),
              b("looks", "say (Game Over) for (2) seconds", "说 (游戏结束) (2) 秒", 4),
              b("control", "stop [all]", "停止 [全部脚本]", 4)
            ] }
          ]
        }
      ],
      check: [
        t("My new sound or look works.", "我新加的音效或外观能正常工作。"),
        t("My new rule works when I test it 3 times.", "我的新规则测试 3 次都能正常工作。"),
        t("The green flag still resets everything, including my new rule (like Lives back to 3).", "绿旗仍然能重置一切，包括我的新规则（比如 Lives 回到 3）。")
      ],
      problems: [
        { symptom: t("Hero freezes when a sound plays.", "播放声音时 Hero 卡住了。"),
          fix: t("Use “start sound” instead of “play sound until done” inside the forever loop.", "在重复执行里用“播放声音”，不要用“播放声音……等待播完”。") },
        { symptom: t("I can't find my sound in the menu.", "菜单里找不到我的声音。"),
          fix: t("The menu only shows sounds of the sprite you are editing. Add the sound in THAT sprite's Sounds tab.", "菜单只显示当前角色的声音。请在“这个”角色的声音标签页里添加。") },
        { symptom: t("My new rule broke the old game.", "新规则把原来的游戏弄坏了。"),
          fix: t("Pull the new blocks away from the script so they are loose, and test again. Add them back one block at a time.", "把新积木从脚本上拖开放着，再测试一次。然后一块一块地加回去。") },
        { symptom: t("Lives go below 0, or do not start at 3.", "生命值变成负数，或开局不是 3。"),
          fix: t("Put “set [Lives] to (3)” in Hero's green flag script. Put the “if <(Lives) = (0)>” check inside the lava “if”.", "把“将 [Lives] 设为 (3)”放进 Hero 的绿旗脚本，把“如果 <(Lives) = (0)>”放进岩浆的“如果”里面。") }
      ],
      challenge: {
        title: t("Speed run timer", "速通计时"),
        text: t("Show how many seconds it took to win.", "显示通关用了多少秒。"),
        hint: { en: "Add “reset timer” to Hero's green flag script. In Hero's “when I receive [You Win]” script, use this say block:", zh: "在 Hero 的绿旗脚本里加“计时器归零”。在 Hero 的“当接收到 [You Win]”脚本里用这个“说”积木：", blocks: [
          b("sensing", "reset timer", "计时器归零", 1),
          b("looks", "say (join (Time: ) (round (timer))) for (2) seconds", "说 (连接 (用时：) 和 (四舍五入 (计时器))) (2) 秒", 1)
        ] }
      },
      reflect: t("What is your favorite thing you added? Which block made it work?", "你最喜欢自己加的哪个东西？是哪个积木让它工作的？")
    },

    /* ───────────── Level 8 ───────────── */
    {
      id: 8,
      icon: "🛠️",
      title: t("Tester & Save Point", "测试员与存档点"),
      concept: t("Testing, debugging, and saving your work", "测试、调试和保存作品"),
      goal: t(
        "Test the whole game like a tester, fix bugs, explain one idea you learned, and save a .sb3 file.",
        "像测试员一样测试整个游戏，修复问题，讲解一个学过的概念，并保存 .sb3 文件。"
      ),
      blocks: [GF(), b("events", "when I receive [You Win]", "当接收到 [You Win]"), WAIT_HERO()],
      predict: {
        q: t("You find a bug: the coins don't come back when you play again. Which sprite and which block do you check first?", "你发现一个问题：再玩一次时金币没回来。你先检查哪个角色、哪个积木？"),
        a: t(
          "The Coin sprite, at the top of its green flag script: is there a “show” block? Bugs live in a sprite's script — start with the sprite that acts wrong.",
          "检查 Coin 角色绿旗脚本的最上面：有没有“显示”积木？问题藏在角色的脚本里——先从表现不对的那个角色查起。"
        )
      },
      steps: [
        {
          title: t("Tester mode", "测试员模式"),
          sprite: null,
          where: t("Play your game on the stage", "在舞台上玩你的游戏"),
          do: [
            t("Click the green flag and play like a tester. Try to break things on purpose!", "点绿旗，像测试员一样玩。故意试试能不能把游戏弄坏！"),
            t("Use the test list in Hint 3. Fix one bug at a time.", "用提示 3 里的测试清单。一次只修一个问题。"),
            t("Tip: click one script to run it alone. It glows yellow while running.", "小技巧：单独点击一段脚本就能只运行它，运行时它会发出黄光。")
          ],
          hints: [
            t("Start with a brand new game: click the green flag. Is EVERYTHING back where it began?", "从全新的一局开始：点绿旗。所有东西都回到开始的样子了吗？"),
            t("Most bugs hide in green flag scripts (resets) and in names that don't match (Hero, Lava, Score, You Win).", "大多数问题藏在绿旗脚本（重置）里，以及名字不一致的地方（Hero、Lava、Score、You Win）。"),
            { en: "Test list — check each one:", zh: "测试清单——逐项检查：", list: [
              t("Green flag: Hero at the start, Score 0, all coins visible, banner hidden.", "点绿旗：Hero 在起点，分数 0，金币都在，横幅隐藏。"),
              t("Lava before the checkpoint → back to the start.", "碰检查点之前碰岩浆 → 回到起点。"),
              t("Checkpoint, then lava → back to the checkpoint.", "先碰检查点再碰岩浆 → 回到检查点。"),
              t("Each coin adds 1 point only once.", "每个金币只加 1 分，且只加一次。"),
              t("Goal → YOU WIN! once, and Hero stops.", "到终点 → YOU WIN! 出现一次，Hero 停下。"),
              t("Green flag again → everything resets.", "再点绿旗 → 一切重置。")
            ] }
          ]
        },
        {
          title: t("Explain one idea", "讲解一个概念"),
          sprite: null,
          where: t("Talk with a grown-up", "和大人聊一聊"),
          do: [
            t("Pick one idea: loop, if (condition), variable, or broadcast.", "选一个概念：循环、如果（条件）、变量或广播。"),
            t("Show the grown-up where it is in your game.", "给大人看它在你游戏里的哪个地方。"),
            t("Explain it with this sentence: “In my game, ___ uses ___ to ___.”", "用这句话讲：“在我的游戏里，___ 用 ___ 来 ___。”")
          ],
          hints: [
            t("Look at Hero's script. Which block repeats? Which block asks a question?", "看看 Hero 的脚本。哪个积木在重复？哪个积木在提问？"),
            t("Loop = Control “forever”. If = Control “if then”. Variable = Variables “Score”. Broadcast = Events “broadcast”.", "循环 = “控制”里的“重复执行”。如果 = “控制”里的“如果那么”。变量 = “变量”里的 Score。广播 = “事件”里的“广播”。"),
            { en: "Example sentences:", zh: "例句：", list: [
              t("In my game, Hero uses a forever loop to check the arrow keys again and again.", "在我的游戏里，Hero 用“重复执行”一遍遍检查方向键。"),
              t("In my game, Hero uses “if touching Lava” to go back when it gets hurt.", "在我的游戏里，Hero 用“如果碰到 Lava”在受伤时回去。"),
              t("In my game, the coins use the Score variable to remember points.", "在我的游戏里，金币用 Score 变量记住分数。"),
              t("In my game, the Goal uses a broadcast to tell the banner to show.", "在我的游戏里，终点用广播通知横幅显示出来。")
            ] }
          ]
        },
        {
          title: t("Save your .sb3 file", "保存 .sb3 文件"),
          sprite: null,
          where: t("Scratch menu: File", "Scratch 菜单：文件"),
          do: [
            t("In Scratch, click File → “Save to your computer”.", "在 Scratch 里点 文件 →“保存到你的电脑”。"),
            t("Find the .sb3 file (usually in Downloads). Give it a game name, like block-quest.sb3 — not your real name.", "找到 .sb3 文件（通常在“下载”文件夹）。给它起一个游戏名，比如 block-quest.sb3——不要用真名。"),
            t("Check it: File → “Load from your computer”, open the file, and click the green flag.", "检查一下：文件 →“从电脑中上传”，打开这个文件，点绿旗。")
          ],
          hints: [
            t("Look at the top menu bar of Scratch. Which menu is about files?", "看看 Scratch 顶部的菜单栏。哪个菜单是关于文件的？"),
            t("No blocks. Use the File menu. Online Scratch downloads the file; the desktop app asks where to save it.", "不需要积木，用“文件”菜单。在线版会下载文件；桌面版会问你保存在哪里。"),
            { en: "Do it in this order:", zh: "按这个顺序做：", list: [
              t("File → Save to your computer.", "文件 → 保存到你的电脑。"),
              t("Open your Downloads folder (or the folder you chose). Rename the file if you like.", "打开“下载”文件夹（或你选的文件夹），可以给文件改名。"),
              t("File → Load from your computer → pick the file → click the green flag to test it.", "文件 → 从电脑中上传 → 选择文件 → 点绿旗测试。")
            ] }
          ]
        }
      ],
      check: [
        t("I played the whole game from the green flag, and every test in the list worked.", "我从绿旗开始完整玩了一遍，测试清单每一项都通过。"),
        t("I explained one idea to a grown-up.", "我给大人讲解了一个概念。"),
        t("I saved my .sb3 file and opened it again.", "我保存了 .sb3 文件，并重新打开过。")
      ],
      problems: [
        { symptom: t("I can't find my saved file.", "找不到保存的文件。"),
          fix: t("Look in the Downloads folder. Newer copies may be called “Scratch Project (1).sb3”. The newest file is the last one saved.", "看看“下载”文件夹。新的副本可能叫“Scratch Project (1).sb3”，最后保存的那个才是最新的。") },
        { symptom: t("I found a bug but don't know where it is.", "发现了问题，但不知道在哪里。"),
          fix: t("Check one sprite at a time. Read its scripts from top to bottom, and click each script to run it alone. Check the names match.", "一次检查一个角色。从上到下读它的脚本，单独点击每段脚本运行，并检查名字是否一致。") },
        { symptom: t("The file opens, but it's an old version.", "文件能打开，但是旧版本。"),
          fix: t("Save again after your last change. Then open the newest file.", "在最后一次修改后再保存一次，然后打开最新的文件。") }
      ],
      challenge: {
        title: t("Bug hunt swap", "互换找虫"),
        text: t("Ask a grown-up to secretly change ONE number in your project (like the start x). Find it and fix it!", "请大人偷偷改掉你项目里的一个数字（比如起点的 x），你来找出来并修好！"),
        hint: { en: "Use your test list. The first test that fails tells you which sprite to look at.", zh: "用你的测试清单。第一个没通过的测试，会告诉你该看哪个角色。", list: [
          t("Wrong start? Check Hero's “go to” and the Checkpoint X / Y set blocks.", "起点不对？检查 Hero 的“移到”和设定 Checkpoint X / Y 的积木。"),
          t("Wrong score? Check each coin's “change [Score] by” block.", "分数不对？检查每个金币的“将 [Score] 增加”积木。")
        ] }
      },
      reflect: t("What are you proud of in your game? What would you build next?", "你的游戏里最让你自豪的是什么？下一次想做什么？")
    }
  ];

  // Final reference scripts for parents (what a finished Level 1–6 game looks like).
  var finalScripts = [
    { sprite: "Hero", blocks: [
      GF(), GO_START(1), POINT90(1),
      b("variables", "set [Score] to (0)", "将 [Score] 设为 (0)", 1),
      b("variables", "set [Checkpoint X] to (" + START_X + ")", "将 [Checkpoint X] 设为 (" + START_X + ")", 1),
      b("variables", "set [Checkpoint Y] to (" + START_Y + ")", "将 [Checkpoint Y] 设为 (" + START_Y + ")", 1),
      FOREVER(1),
      b("control", "if <key (right arrow) pressed?> then", "如果 <按下 (→) 键?> 那么", 2),
      b("motion", "change x by (5)", "将x坐标增加 (5)", 3),
      b("control", "if <key (left arrow) pressed?> then", "如果 <按下 (←) 键?> 那么", 2),
      b("motion", "change x by (-5)", "将x坐标增加 (-5)", 3),
      b("control", "if <key (up arrow) pressed?> then", "如果 <按下 (↑) 键?> 那么", 2),
      b("motion", "change y by (5)", "将y坐标增加 (5)", 3),
      b("control", "if <key (down arrow) pressed?> then", "如果 <按下 (↓) 键?> 那么", 2),
      b("motion", "change y by (-5)", "将y坐标增加 (-5)", 3),
      b("control", "if <touching (Lava)?> then", "如果 <碰到 (Lava)?> 那么", 2),
      b("motion", "go to x: (Checkpoint X) y: (Checkpoint Y)", "移到 x: (Checkpoint X) y: (Checkpoint Y)", 3),
      note("— second script —", "—— 第二段脚本 ——", 0),
      b("events", "when I receive [You Win]", "当接收到 [You Win]", 0),
      b("control", "stop [other scripts in sprite]", "停止 [该角色的其他脚本]", 1),
      b("looks", "say (I did it!) for (2) seconds", "说 (我做到了！) (2) 秒", 1)
    ] },
    { sprite: "Stage", blocks: [
      note("No scripts needed. Backdrop: Level 1.", "不需要脚本。背景：Level 1。", 0)
    ] },
    { sprite: "Lava", blocks: [
      note("No scripts needed (optional moving-lava challenge).", "不需要脚本（可选挑战：会动的岩浆）。", 0)
    ] },
    { sprite: "Coin", blocks: [
      GF(),
      b("looks", "show", "显示", 1),
      b("motion", "go to x: (0) y: (0)", "移到 x: (0) y: (0)", 1),
      note("each coin has its own numbers", "每个金币用自己的坐标", 2),
      WAIT_SHORT(1),
      WAIT_HERO(1),
      b("variables", "change [Score] by (1)", "将 [Score] 增加 (1)", 1),
      b("looks", "hide", "隐藏", 1)
    ] },
    { sprite: "Checkpoint", blocks: [
      GF(),
      WAIT_SHORT(1),
      WAIT_HERO(1),
      b("variables", "set [Checkpoint X] to (x position)", "将 [Checkpoint X] 设为 (x 坐标)", 1),
      b("variables", "set [Checkpoint Y] to (y position)", "将 [Checkpoint Y] 设为 (y 坐标)", 1),
      b("looks", "say (Checkpoint!) for (1) seconds", "说 (检查点！) (1) 秒", 1)
    ] },
    { sprite: "Goal", blocks: [
      GF(),
      WAIT_SHORT(1),
      WAIT_HERO(1),
      b("events", "broadcast (You Win)", "广播 (You Win)", 1)
    ] },
    { sprite: "Win Banner", blocks: [
      GF(),
      b("looks", "hide", "隐藏", 1),
      note("— second script —", "—— 第二段脚本 ——", 0),
      b("events", "when I receive [You Win]", "当接收到 [You Win]", 0),
      b("looks", "go to [front] layer", "移到最 [前面]", 1),
      b("looks", "show", "显示", 1)
    ] }
  ];

  // Short Chinese notes for parents per level (what to look for while accompanying).
  var parentNotes = {
    1: "观察孩子能否说出“点绿旗会让脚本开始运行”，以及能否在角色信息区找到 x、y。",
    2: "重点是“重复执行”里放“如果”。可以问：“为什么松开按键 Hero 会停？”",
    3: "确认岩浆是一个独立角色（不是画在背景上），并且检测脚本放在 Hero 上。",
    4: "关注“只能收集一次”：金币用“等待……”而不是“重复执行”；分数在绿旗时归零。",
    5: "关注“检查点复位”：绿旗时把 Checkpoint X/Y 设回起点；“x 坐标”要在 Checkpoint 角色里使用。",
    6: "关注“胜利只触发一次”：终点用“等待……”加一次广播；横幅开局隐藏；Hero 收到消息后停止其他脚本。",
    7: "鼓励孩子自己做决定，只要求“改一样、测一次”，并检查新规则也被绿旗重置。",
    8: "请孩子用一句话讲解一个概念；陪他把 .sb3 文件保存到电脑并重新打开验证。"
  };

  var content = {
    START_X: START_X,
    START_Y: START_Y,
    CATEGORIES: CATEGORIES,
    NAMES: NAMES,
    lessons: lessons,
    finalScripts: finalScripts,
    parentNotes: parentNotes
  };

  root.SCRATCH_COACH_CONTENT = content;
  if (typeof module !== "undefined" && module.exports) { module.exports = content; }
})(typeof window !== "undefined" ? window : globalThis);
