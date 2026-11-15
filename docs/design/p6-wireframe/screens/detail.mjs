// 人物详情 v4：每个分页一屏。结构照 Tidy5e 角色表（CharacterSheetQuadroneRuntime 的分页：Sheet / Character / Inventory / Spellbook / Features / Effects / Biography / Journal）。
// 需求：P6-2 R14–R25、R33。生命 = 原地三个框（驾驶员 2026-11-15）。
import { detail } from '../lib/sheet.mjs'
import { hpDrawer, lvDrawer, abDrawer, cbDrawer, skDrawer, trDrawer } from '../lib/override.mjs'
import { avatarModal } from '../lib/avatar.mjs'
import { btn, icon, mdl, mh, seg, P } from '../lib/parts.mjs'
import { by } from '../lib/frame.mjs'

const G = '详情（人物）· 每个分页'
const pg = (o) => () => ({ noFab: true, content: detail(o) })
const tabScreen = (id, tab, title, goal, primary, laws, notes, pins = {}) => ({
  id, group: G, title, flow: '游戏中查看 / 点检定', goal, primary, patterns: 'Tidy5e 分页：工具行（搜索 + 筛选）+ 彩色分组表', laws, notes,
  diff: '全屏：页头 + 分页同屏；960 窗口和窄屏：已往下滚到分页（分页条吸在顶上），页头滚出去，底部固定条一直在。',
  board: by({ full: pg({ tab, ...pins }), '1440': pg({ tab, tabsOnly: true }), '390': pg({ tab, tabsOnly: true }) },
    { full: '全屏 1440：整页', '1440': '960 窗口：已滚到分页', '390': '窄屏：已滚到分页' }),
})

export const screens = [
  {
    id: 'p6-6-detail', group: G, title: '详情 · 行动（第一个分页）+ 整页结构', flow: '战斗中扣血 · 点检定 · 施法（R14 R15 R17）',
    goal: '进来一眼看全：生命、AC、六属性和豁免、状态、法术位；下面「行动」表点一下就掷', primary: '生命「当前」框；行动表里带框的数字（送去骰盘）',
    patterns: 'Tidy5e 角色表：深色横幅页头 + 分页 + 分组表；行动页左侧技能栏（Sheet 页的 Skills 侧栏）',
    laws: 'von Restorff（生命块最大最突出）· Jakob（Tidy5e / D&D 角色表惯例）· Miller（页头 = 生命 / 身份 / 数值三块）· Fitts（底部固定条）· Tesler（所有加值由内核给）',
    diff: '全屏：页头左生命块、右身份 + 经验 + 一排六属性 · AC 先攻速度熟练；行动页左技能栏、右行动表。960：同结构，属性格变窄。390：页头竖排（身份 → 生命块 → 属性 3×2），行动页去掉技能栏（技能在「数值」页）。',
    notes: [
      [1, '顶栏', '‹ 人物 · 名字 · 上一位 / 下一位 · **撤销按钮写明撤销什么**（▾ = 改动记录 p6-14）· ⋯（存入我的库 / 复制 / 移到… / 删除）', 'R25 · R07 · R09'],
      [2, '生命块', '**当前生命是大号文字**，点它就地变成输入框（−7 / +5 / =12 都认，预览「12 → 5 / 18」，Enter 生效、Esc 还原，流程 C）；「/ 18」最大生命是**自动值**，普通文字；「+3 临时」点一下改；右上角 ✎ = 小铅笔页面（改最大生命、生命骰）；下面死亡豁免（[掷]）、生命骰（[掷一颗]）、力竭、灵感，每行 标题 · 控件 · 右边按钮', 'R17 · R22 · R15 · P6-5'],
      [3, '身份 · 分类 · 经验', '名字 ★ 英文名；法师 3 级 子职业 / 种族 / 背景 / 阵营 / 体型——**等级也是自动值，普通文字**，旁边小铅笔 ✎ 改等级与升级所需经验（小铅笔页面·等级页）；[队伍 ▾] 换分类、[随行 ▾]；右边经验条 + [等级管理]（升降级先预览）', 'R08 · R09 · R19 · R22'],
      [4, '六属性 · AC 先攻 速度 熟练', '**这些全是自动值，普通文字**：属性格 = 调整值（点 = 属性检定）· 属性值 · 豁免值；右边 AC / 先攻 / 速度 / 熟练；各自右上角小铅笔 ✎ → 小铅笔页面（属性页 / 战斗页）覆盖、可回到自动；被手改的数带金线（p6-13c）', 'R15 · R22 · 流程 A / B'],
      [5, '被动与施法', '被动察觉 / 洞悉 / 调查、法术豁免 DC、法术攻击，都由内核算', 'R14 · R28'],
      [6, '状态与法术位', '状态胶囊 × 移除、[＋ 状态] 跳到「效果」页；法术位圆点点一下用一格 / 还一格', 'R17 · R20'],
      [7, '分页', '行动 · 数值 · 背包 · 法术 · 特性 · 效果 · 背景 · 笔记（Tidy5e 的分页顺序）；分页条吸顶', 'Tidy5e'],
      [8, '行动表', '搜索 + [全部 动作 附赠 反应 其他] 筛选；按动作类型分组；列 = 次数 · 命中/DC · 伤害/效果，**带框的数字点一下就送去骰盘**；点名字就地展开说明（火焰箭那行）', 'R15 · R16'],
      [9, '底部固定条', '生命 / AC 小条 · 「已存进当前战役」· [短休][长休]（先预览，p6-15）；有设定草稿才多出 [保存修改]', 'R17 · R24'],
    ],
    board: by({
      full: pg({ nUndo: 1, nHp: 2, nName: 3, nAc: 4, nPass: 5, nFx: 6, nTabs: 7, nFilt: 8, nRest: 9 }),
      '1440': pg({}),
      '390': pg({}),
    }, { full: '全屏 1440', '1440': '960 窗口（第一屏）', '390': '窄屏（第一屏）' }),
  },
  tabScreen('p6-7-stats', 'stats', '详情 · 数值（技能 · 豁免 · 工具 · 特质）', '查任何一个技能 / 豁免的加值并直接掷', '带框的加值（点 = 掷骰）',
    'Jakob（Tidy5e Character 页：技能卡 + 豁免卡 + 工具卡 + 特质）· Miller（三栏三类）',
    [[1, '技能表', '熟练点（空 / 实心 / 专精双圈 / 半熟练半圆）· 属性缩写 · 技能名 · 加值（点 = 检定）· 被动值；技能名单由数据给', 'R15 · R22'], [2, '豁免 · 工具', '同样的列；工具检定也能点', 'R15'], [3, '特质', '感官 / 语言 / 伤害抗性 / 伤害免疫 / 状态免疫 / 武器熟练 / 护甲熟练（dnd5e 人物的 traits 字段）；每行 ✎ 手改', 'R22']],
    { nSk: 1, nTrait: 3 }),
  tabScreen('p6-8-bag', 'bag', '详情 · 背包（钱币也是物品，背包是容器）', '数量随手加减、装备开关、用药水', '数量 [−][n][＋]',
    'Jakob（Tidy5e Inventory：负重条 + 武器 / 装备 / 消耗品 / 容器分组）· Fitts（步进按钮）· Tesler（负重、重量由内核算）',
    [[1, '负重', '负重条 + 力量 + 体型（内核算）', 'R28'], [2, '工具行', '搜索 + [全部 已装备 可使用] + [加物品]（从库选，加之前先预览）', 'R17 · R24'], [3, '容器', '**背包是容器类物品**：点 ▾ 展开，里面的物品缩进；**钱币就是物品**（金币 (gp)、银币 (sp) 从库里加，或自制一个货币物品），没有单独的钱币栏', 'R18'], [4, '每行', '次数 · 数量步进 · 重量 · 装备开关 · ⋯（用一次 / 移进容器 / 自制修改 / 删除）', 'R17 · R06']],
    { nEnc: 1, nAdd: 2, nBox: 3 }),
  tabScreen('p6-9-spell', 'spell', '详情 · 法术（按环分组，组条上就是法术位）', '施法、看法术位、准备法术', '法术位圆点 · 带框的命中 / 伤害',
    'Jakob（Tidy5e Spellbook：按环分组，组条带法术位）· Tesler（DC / 攻击由内核给）',
    [[1, '施法信息', '施法属性 · 法术攻击 · 豁免 DC · 已准备 6 / 7', 'R14'], [2, '1 环组条', '组条上就是这一环的法术位圆点（点一下用一格）', 'R17'], [3, '每行', '准备圆点（戏法没有）· 名字和学派 / 专注 / 仪式 · 施放 · 距离 · 命中/DC · 效果（点 = 掷）· ⋯', 'R15 · R17']],
    { nCast: 1, nLv: 2 }),
  tabScreen('p6-10-feat', 'feat', '详情 · 特性（职业 · 主动能力 · 职业特性 · 种族与背景）', '看有什么能力、还剩几次', '次数圆点',
    'Jakob（Tidy5e Features：主动 / 被动分组）· Miller',
    [[1, '职业', '职业 · 等级 · 生命骰；⋯ 里有 [等级管理]', 'R19'], [2, '主动能力', '次数圆点 + 恢复方式（短休 / 长休）', 'R17'], [3, '资料不可用', '这本书没开或卸载了：名字照常显示，下面红字「资料不可用」，人物其余照常', 'R33']],
    { nCls: 1, nGone: 3 }),
  tabScreen('p6-11-effect', 'effect', '详情 · 效果（状态开关 + 效果表）', '开关状态、看正在生效的效果、自定义效果', '状态按钮（点一下开 / 关）',
    'Jakob（Tidy5e Effects：状态格 + 效果表）· Hick（状态一排按钮，不再弹窗）· Doherty（点了立刻生效）',
    [[1, '状态', '一排状态按钮（名单由库给），点一下开 / 关，立刻生效、可撤销；力竭带等级步进；内核认识的状态自动影响数值和掷骰，不认识的只提醒', 'R17 · R20'], [2, '效果表', '生效中 / 物品与特性带来的 / 停用；列 = 来源 · 持续 · 开关', 'R20'], [3, '＋ 新建效果', '打开自制数据里**已有的效果表单**；保存进这个人物，要存进库是另一个动作', 'R21 · R06']],
    { nCond: 1, nNew: 3 }),
  {
    id: 'p6-12-bio-note', group: G, title: '详情 · 背景 · 笔记', flow: '写设定 · 记笔记', goal: '人物设定一页看完；笔记按条记', primary: '各块的 ✎',
    patterns: 'Tidy5e Biography（特征字段 + 文本块）/ Journal（多条笔记）；gg-sheet-export 的阅读排版', laws: 'Miller（字段格 + 文本块分开）',
    notes: [[1, '特征字段', '阵营 / 种族 / 背景 / 性别 / 年龄 / 身高 / 体重 / 眼睛 / 头发 / 皮肤 / 信仰（dnd5e 人物 details 字段）', '人物数据'], [2, '文本块', '性格特点 / 理想 / 羁绊 / 缺点 / 外貌 / 传记 + 给 AI 的说明；空的写「还没写，点 ✎ 填写」', 'R14'], [3, '笔记', '左边笔记列表（标题 + 日期），右边正文；[＋] 新笔记', 'Tidy5e Journal']],
    board: by({ full: pg({ tab: 'bio', nFields: 1 }), '1440': pg({ tab: 'note', tabsOnly: true, nNotes: 3 }), '390': pg({ tab: 'bio', tabsOnly: true }) },
      { full: '全屏：背景', '1440': '960 窗口：笔记', '390': '窄屏：背景' }),
  },
  {
    id: 'p6-13-hp-undo', group: G, title: '生命原地改 · 设定草稿', flow: '流程 C（P6-5）· F7 / F5（R17 R23 R24）',
    goal: '战斗中改血最快；设定改动不会白改', primary: '点生命大数字（原地变输入）', patterns: 'In-place editing · Preview · Multilevel Undo',
    laws: 'Postel（−7 / +5 / =12 / 全角 都认）· Doherty（实时预览）· Safe Exploration · von Restorff（生命数字最大）',
    diff: '1440：正在原地改当前生命；900：有设定草稿（[保存修改]）；390：窄屏原地改。',
    notes: [
      [1, '生命块', '当前生命是**大号文字**，点它就地变成输入框（金色描边）；「/ 18」是**自动值**，普通文字，不在这里改（要改点右上角小铅笔 ✎）；「+3 临时」点一下改临时生命；下面死亡豁免 / 生命骰 / 力竭 / 灵感每行：标题 · 控件 · 右边的掷骰按钮，对齐', 'R17 · R22 · 流程 C'],
      [2, '原地改', '输入 −7 / +5 / =12 都认；下面一行实时预览「生命 12 → 5 / 18」；Enter 生效（临时生命先扣，由内核算）、Esc 还原；输入法组字时不提交', 'R23 · G08'],
      [3, '设定草稿', '改名字、背景文字这类设定 → 进草稿，底栏变「● 有未保存的编辑」+ [保存修改]；游戏中的小操作（血、法术位、状态、数量）和手改数值的 [应用] 都**不**走草稿，立即写进当前战役', 'R24'],
    ],
    board: by({
      '1440': pg({ hpEdit: true, nHp: 1, nPenHp: 2 }),
      '900': pg({ tab: 'bio', tabsOnly: true, draft: true, nSave: 3 }),
      '390': pg({ hpEdit: true }),
    }, { '1440': '960：正在原地改当前生命（输入 −7）', '900': '868：有设定草稿', '390': '窄屏：原地改生命' }),
  },
  {
    id: 'p6-13b-override', group: G, title: '手改小抽屉（一个自动模块一个）：生命 · 属性 · 战斗 · 等级', flow: '流程 A / B / E（P6-5）',
    goal: '外面全是只读的普通文字；点模块角上的 ✎ 进这个模块自己的小抽屉，看自动值、手改、回到自动', primary: '[应用]', patterns: 'Small modal per module（宽 480，高度跟内容走）· [自动 | 手动] 二选一 · Preview',
    laws: 'Tesler（自动值与来源一直写在项目名下面）· Safe Exploration（选「自动」就回去、可撤销）· Hick（一个抽屉只管一个模块）· Postel',
    diff: '宽：居中小窗；窄屏：底部铺满。高度跟内容走，内容多了在窗口里滚。',
    notes: [
      [1, '一个模块一个抽屉', '生命块 ✎ → 生命抽屉；六属性那排 ✎ → 属性抽屉；AC 先攻速度熟练那排 ✎ → 战斗数值抽屉；身份行等级旁 ✎ → 等级抽屉；技能表 / 特质块各自的 ✎ → p6-13e', 'R22'],
      [2, '一行一项', '项目名（下面小字写**自动值与来源**，「来源 ▾」看明细）· [自动 | 手动]：选「自动」= 回到自动值，选「手动」才出现可填的框；手改过的项名字带金线', 'R22 · G14 · Cloudscape / Infor / D&D Beyond 的共同点'],
      [3, '属性抽屉', '每个属性一行（最终值）；点「展开」看 初始值（设定）· 加成 · 最终值 · 调整值 · 豁免，各项同样 [自动 | 手动]', '流程 E · 候选 G33'],
      [4, '底部', '[全部用自动]（本抽屉）· [取消] · [应用]（立刻生效，一条改动记录，可撤销；不用再点"保存修改"）；角色表上的数字马上跟着变', 'R24 · R25 · Obsidian 的教训'],
    ],
    board: by({ '1440': () => ({ noFab: true, content: detail({}), overlay: hpDrawer({ nTitle: 1, nRow: 2, nApply: 3 }) }), '900': () => ({ noFab: true, content: detail({}), overlay: abDrawer({ nRow: 4 }) }), '390': () => ({ noFab: true, content: detail({}), overlay: cbDrawer({}) }), mid: () => ({ noFab: true, content: detail({}), overlay: lvDrawer({}) }) },
      { '1440': '960：生命抽屉（最大生命已手改 18 → 20）', '900': '868：属性抽屉（智力展开，最终值已手改）', '390': '窄屏：战斗数值抽屉（AC 已手改）', mid: '600：等级抽屉' }),
  },
  {
    id: 'p6-13e-skill-trait', group: G, title: '技能抽屉 · 特质抽屉（外面只读，进抽屉才改）', flow: '流程 A / H（P6-5）',
    goal: '技能的熟练项、特质里的语言 / 抗性 / 熟练：平时在外面显示着不改；要改点 ✎ 进抽屉', primary: '[应用]', patterns: 'Small modal per module · Segmented（无 / 半 / 熟 / 专）· Chips with source',
    laws: 'Miller（来源标签分块）· Safe Exploration（删掉的自动项收进「已删除」可恢复）· Jakob',
    notes: [
      [1, '外面', '「数值」页的技能表、特质块全是普通文字（熟练点、加值、药丸），不带编辑控件；表头 / 块头一个 ✎', 'R22'],
      [2, '技能抽屉', '一行一个技能：名字 · 属性 · 来源写在下面（「自动 熟练 · 背景·学者」/「手动改为 专（自动 无）」）· 熟练级别 [无 | 半 | 熟 | 专] · ↺ 回到自动；改过的行名字带金线；窗口内滚动', 'R15 · R22'],
      [3, '特质抽屉', '语言 / 感官 / 抗性 / 免疫 / 武器熟练 / 护甲熟练：药丸 + 来源小字（种族 / 背景 / 职业 / 手动添加）；× 删除、[＋ 加…] 添加；**删掉自动来的项 = 收进「已删除」，药丸变虚线带 ↺，随时恢复**；手动添加的删掉就没了（可撤销）', 'R22 · 建卡带来的内容可改'],
      [4, '建卡填好之后', '建卡每一步选的东西（种族给的语言、背景给的技能…）自动出现在对应抽屉里，来源写「种族」「背景」…；之后删 / 加 / 改都在这里', 'R04 · R22'],
    ],
    board: by({ '1440': () => ({ noFab: true, content: detail({ tab: 'stats', tabsOnly: true }), overlay: skDrawer({ nRow: 1 }) }), '900': () => ({ noFab: true, content: detail({ tab: 'stats', tabsOnly: true }), overlay: trDrawer({}) }), '390': () => ({ noFab: true, content: detail({ tab: 'stats', tabsOnly: true }), overlay: skDrawer({}) }) },
      { '1440': '960：技能抽屉（察觉手改为专精、运动手改为无）', '900': '868：特质抽屉（手动添加 + 已删除可恢复）', '390': '窄屏：技能抽屉' }),
  },
  {
    id: 'p6-13c-override-state', group: G, title: '已手改的数：只有一条金线（没有悬浮提示）', flow: '流程 B（P6-5）',
    goal: '一眼看出哪些数被手改过；想看 / 想改回，点 ✎ 进那个模块的抽屉', primary: '—', patterns: 'Inline marker（无悬停、无点击）', laws: 'von Restorff（只有手改过的数有金线）',
    notes: [
      [1, '金线', '被手改的自动值（最大生命、AC、智力…）数字下面一条金色细线；**没有悬浮窗、没有点击气泡**；其余自动值都是普通文字', 'R22 · 驾驶员 11-15'],
      [2, '怎么看 / 怎么改回', '点该模块的 ✎ → 抽屉里那一项选「自动」→ [应用]；抽屉里每项都写着自动值，改回去会变成什么一目了然', 'R22 · R25'],
    ],
    board: by({ full: pg({ man: ['hpmax', 'ac', 'int'] }), '1440': pg({ man: ['hpmax', 'ac', 'int'] }), '390': pg({ man: ['hpmax', 'ac', 'int'] }) }, { full: '全屏：金线（最大生命、AC、智力）', '1440': '960：金线', '390': '窄屏：金线' }),
  },
  {
    id: 'p6-13d-avatar', group: G, title: '人物头像：填链接 · 直接上传', flow: '流程 G（P6-5）· 点头像换头像',
    goal: '换头像：贴图片链接，或直接上传一张图', primary: '[使用这张]', patterns: 'Segmented（链接 / 上传）· Drop zone · Preview',
    laws: 'Hick（两种方式并排，一次一个）· Postel（链接、拖拽、选文件都认）· Doherty（选好立刻预览）',
    notes: [
      [1, '入口', '点角色表页头的头像方框（右下角有小图标），或建卡「名字」步里的 [填图片链接] / [上传图片]，都打开同一个「人物头像」窗口', 'R14'],
      [2, '图片链接', '贴一个图片网址，右边方框预览（居中裁切成方的）；加载不出来在这一行下面写原因，输入保留', 'Postel'],
      [3, '上传图片', '拖图片到虚线框，或 [选择文件…]；选好后立刻预览、显示文件名与大小；**上传后存在哪、有没有大小限制要查后端（候选 G34）**', '候选 G34'],
      [4, '底部', '[移除头像]（回到默认人像）· [取消] · [使用这张]；[使用这张] 算一条改动记录，可撤销', 'R25'],
    ],
    board: by({ '1440': () => ({ noFab: true, content: detail({ nAv: 1 }), overlay: avatarModal(0, { nTabs: 2, nUrl: 3, nUse: 4, url: 'https://example.com/gale.png' }) }), '900': () => ({ noFab: true, content: detail({}), overlay: avatarModal(1, { nDrop: 3, file: true }) }), '390': () => ({ noFab: true, content: detail({}), overlay: avatarModal(1, {}) }) },
      { '1440': '960：图片链接（已填，右边预览）', '900': '868：上传图片（已选好文件）', '390': '窄屏：上传图片（还没选）' }),
  },
  {
    id: 'p6-14-history', group: G, title: '改动记录 · 撤销到这里', flow: '点错了找回（R25）', goal: '找到那一条，看清会撤销什么，再退回', primary: '[撤销到这里]（先预览）',
    patterns: 'Command History · Multilevel Undo · Preview', laws: 'Doherty（先预览）· Hick（每行一个动作）',
    notes: [[1, '记录表', '谁 · 改了什么 · 旧 → 新 · 时间；可筛「只看盖尔 / 全部」；随存档保存', 'R25 · G22'], [2, '撤销到这里', '会连带撤销之后的改动 → 先出预览「会撤销 4 条」；能不能只撤一个人要查后端', 'R24 · 候选 G27']],
    board: by({
      '1440': () => ({ noFab: true, content: detail({}), overlay: mdl('sheet', mh('改动记录', { n: 1 }), `<div style="padding:var(--sp-4) var(--sp-5)"><div style="display:flex;gap:8px;margin-bottom:8px">${seg([{ label: '只看盖尔', on: true }, { label: '全部人物' }])}</div><div class="sh-tbl" style="--cols:70px minmax(0,1fr) 110px 54px 96px;margin:0"><div class="sh-sec"><b>谁</b><span style="text-align:left">改了什么</span><span>旧 → 新</span><span>时间</span><span></span></div>${[['盖尔', '生命', '18 → 12', '刚才'], ['盖尔', '1 环法术位', '3/4 → 2/4', '2 分钟'], ['盖尔', '加状态：中毒', '', '5 分钟'], ['盖尔', 'AC 手改', '自动 12 → 14', '9 分钟'], ['盖尔', '长休', '', '昨天']].map(([w, a, b, t], i) => `<div class="sh-tr"><span style="text-align:left">${w}</span><span style="text-align:left">${a}</span><span>${b}</span><span class="sh-2">${t}</span><span>${btn(i === 3 ? '回到自动' : '撤销到这里', { small: true, n: i === 1 ? 2 : 0 })}</span></div>`).join('')}</div>`) }),
      '390': () => ({ noFab: true, content: detail({}), overlay: mdl('confirm', mh('撤销到这里'), `<div class="trpg-confirm"><p class="trpg-confirm__message">退回到「盖尔 1 环法术位 3/4 → 2/4」之前？之后的改动会一起退回：</p><ul class="trpg-confirm__details"><li>盖尔 生命 18 → 12</li><li>盖尔 1 环法术位</li></ul><div class="trpg-confirm__actions">${btn('取消')}${btn('撤销 2 条', { primary: true })}</div></div>`) }),
    }, { '1440': '改动记录', '390': '撤销到这里：先预览' }),
  },
]
