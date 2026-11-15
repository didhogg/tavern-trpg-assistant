// 人物详情 v4：每个分页一屏。结构照 Tidy5e 角色表（CharacterSheetQuadroneRuntime 的分页：Sheet / Character / Inventory / Spellbook / Features / Effects / Biography / Journal）。
// 需求：P6-2 R14–R25、R33。生命 = 原地三个框（驾驶员 2026-11-15）。
import { detail } from '../lib/sheet.mjs'
import { hpDrawer, lvDrawer, abDrawer, cbDrawer, skDrawer, trDrawer } from '../lib/override.mjs'
import { avatarModal } from '../lib/avatar.mjs'
import { btn, icon, mdl, mh, seg, P } from '../lib/parts.mjs'
import { by } from '../lib/frame.mjs'

const U = (n, t) => `单元 ${n} · ${t}（主界面 + 子界面）`
const G = U(1, '角色表外壳')
const pg = (o) => () => ({ noFab: true, content: detail(o) })
const tabScreen = (id, group, tab, title, goal, primary, laws, notes, pins = {}) => ({
  id, group, title, flow: '游戏中查看 / 点检定', goal, primary, patterns: 'Tidy5e 分页：工具行（搜索 + 筛选）+ 彩色分组表', laws, notes,
  diff: '全屏：页头 + 分页同屏；960 窗口和窄屏：已往下滚到分页（分页条吸在顶上），页头滚出去，底部固定条一直在。',
  board: by({ full: pg({ tab, ...pins }), '1440': pg({ tab, tabsOnly: true }), '390': pg({ tab, tabsOnly: true }) },
    { full: '全屏 1440：整页', '1440': '960 窗口：已滚到分页', '390': '窄屏：已滚到分页' }),
})

export const screens = [
  {
    id: 'p6-6-detail', group: G, title: '主界面 · 角色表外壳整页 · 行动（逐栏对照 Tidy5e CharacterSheet.svelte）', flow: '战斗中扣血 · 点检定 · 施法（R14 R15 R17）',
    goal: '进来一眼看全：生命、AC / 先攻、六属性与豁免、等级与熟练、速度与感官；下面按分页进各块', primary: '点生命大数字（就地改）；行动表里的命中 / 伤害（点一下掷）',
    patterns: 'Tidy5e 角色表：页头（名字行 / 副标题 / 等级块 / 战斗块 + 属性块 / 生命区）+ 标签行 + 可折叠侧栏 + 分页',
    laws: 'Jakob（和 Tidy5e / Foundry 用户的习惯一致）· Miller（页头 5 块）· von Restorff（生命最大）· Fitts（✎ 固定在每块右上角，点击区 ≥44）· Tesler（所有数值由内核算）',
    diff: '全屏：页头生命区在左，右边身份 + 等级块 + 战斗块 + 属性块；侧栏 252 宽。窄屏：页头竖排，属性 3×2，侧栏折叠，✎ 位置不变。',
    notes: [
      [1, '应用条', '‹ 人物 · 名字 · [队伍▾][随行▾] · 上一位 / 下一位 · 撤销 ▾ · ⋯。**不是 Tidy5e 的，是你的需求**', 'R08 R09 R25'],
      [2, '生命区', '**当前生命大号文字，点它就地输入**（−7 / +5 / =12）；「+3 临时」点一下开 Max / Temp；下面一行：生命骰 3/3 d6 · 力竭 · 死亡豁免（骷髅；0 血时展开成浮层，见 p6-13）。「/ 18」最大生命是自动值，右上 ✎ 改', 'T:parts/ActorHealthBar · CharacterSheet hp-row / hd-row / exhaustion / death-saves · R17'],
      [3, '名字行 / 副标题 / 经验', '名字 ★ 英文名 + **短休 / 长休**（先预览）；副标题 = 速度 · 感官 · 体型 · 类型 · 种族 · 阵营 · 职业 + 法术 DC；经验条', 'T:CharacterSheet 名字行 · CharacterSubtitle.svelte · R17 R19'],
      [4, '等级块', '灵感 ◇ · 等级 · **熟练加值** · [等级管理 ▾]（升降级先预览）；右上 ✎', 'T:level-block / InspirationBadge / LevelUpDropdown · R19'],
      [5, '战斗块', 'AC · 先攻（带骰子，点 = 掷）· 专注豁免（有施法才显示）；横向方块，标签在上，顶边古铜金；右上 ✎', 'T:ac-container / initiative / concentration · 你说：与属性块两种样式'],
      [6, '属性块', '六个竖卡：调整值大（点 = 属性检定）· 属性值小 · 下面一行豁免（● 熟练）；右上 ✎', 'T:AbilityScore.svelte · R15'],
      [7, '标签行 + 侧栏开关', '◂ 折叠 / 展开左侧栏；标签：行动 · 属性 · 背包 · 法术 · 特性 · 效果 · 背景 · 日志；有设定草稿时右端出现 [保存修改]', 'T:tabs-row / sidebar-toggle'],
      [8, '左侧栏', '[技能 | 收藏] 标签；技能卡（熟练点 · 属性 · 名称 · 加值 · 被动）+ 工具熟练卡（锤子卡头）；每张卡标题右端 ✎', 'T:CharacterSidebar / SkillsCard / ToolsCard'],
      [9, '行动表', '搜索 + [A 动作][BA 附赠][R 反应] + 筛选 / 排序 / 展开折叠 / 配置列；分组表（动作 · 附赠 · 反应 · 其他），列 次数 · 命中/DC · 伤害/效果；脚注 [按行动类型 ▾] 切换分组方式', 'T:ItemsActionBar · CharacterSheetTab（列名取自截图，列可配置）'],
    ],
    board: by({
      full: pg({ nUndo: 1, nHp: 2, nName: 3, nPenLv: 4, nPenCb: 5, nAb: 6, nTabs: 7, nSide: 8, nFilt: 9 }),
      '1440': pg({}),
      '390': pg({}),
    }, { full: '全屏 1440', '1440': '960 窗口（第一屏）', '390': '窄屏（第一屏）' }),
  },
  tabScreen('p6-6b-action', U(2, '行动'), 'action', '主界面 · 行动（T:CharacterSheetTab：操作栏 + 按动作类型分组的表）', '战斗里找到能做的事并点掷', '命中 / 伤害（点一下掷）',
    'Jakob · Fitts · Hick',
    [[1, '操作栏', '搜索 + [A 动作][BA 附赠][R 反应] + 筛选 / 排序 / 展开 / 配置列', 'T:ItemsActionBar'], [2, '分组表', '动作 · 附赠 · 反应 · 其他；列 次数 · 命中/DC · 伤害/效果（列名取自截图，可配置）', 'T:CharacterSheetTab'], [3, '脚注', '[按行动类型 ▾] 切换分组方式', 'T:footer']],
    { nSec: 1, nFilt: 2 }),
  tabScreen('p6-7-stats', U(3, '属性'), 'attr', '主界面 · 属性（T:CharacterAttributesTab 两列：技能卡 + 工具熟练卡 ｜ 豁免卡 + 特质卡）', '查技能、豁免、工具熟练、特质；点加值直接掷', '带加值的数（点 = 掷骰）',
    'Jakob（Tidy5e 两列）· Miller（四张卡四类）· Proximity（卡头 + 右上 ✎ 统一）',
    [[1, '技能卡', '熟练点（空 / 半 / 实心 / 专精）· 属性缩写 · 名称 · 加值（点 = 掷）· 被动；侧栏打开时和侧栏的技能卡重复，这是 Tidy5e 的做法', 'T:SkillsCard / SkillsCardHeader · R15 · R22'], [2, '工具熟练卡', '锤子图标卡头，**工具熟练**（不是工具物品；工具物品在背包「工具」分组）；与技能卡同样式、紧接其下', 'T:ToolsCard'], [3, '豁免卡', '六项豁免（熟练点 + 加值）+ 专注；脚注写职业豁免', 'T:SavingThrowsCard（ClassSaves / concentration）'], [4, '特质卡', '职业 · 种族 · 背景 · 速度 · 感官 · 语言 · 伤害抗性 / 免疫 · 状态免疫 · 护甲 / 武器熟练 · 特殊特质', 'T:CharacterTraits / CharacterTraitPills']],
    { nSk: 1, nPenTr: 3, nTrait: 4 }),
  tabScreen('p6-8-bag', U(4, '背包'), 'bag', '主界面 · 背包（T:ActorInventoryTab：操作栏 + 负重 + 按物品类型分组 + 脚注）', '数量随手加减、装备开关、用药水', '数量 [−][n][＋]',
    'Jakob · Fitts（步进按钮）· Tesler（负重由内核算）',
    [[1, '操作栏', '搜索 + [已装备][可使用] + 筛选 / 排序 / 展开 / 配置 + [加物品]（从库选）', 'T:InventoryActionBar → ItemsActionBar'], [2, '负重行', '负重条 + 数值；卡头右上 ✎ 改负重上限', 'T:CharacterEncumbranceRow · R22'], [3, '分组', '武器 · 装备 · 消耗品 · **工具** · 容器 · 杂物（按物品类型，可加自定义分组）；容器可展开、里面缩进；**钱币就是物品，没有钱币栏**', 'T:features/sections/Inventory.ts · R18'], [4, '脚注', '调谐 0 / 3', 'T:ActorInventoryFooter']],
    { nAdd: 1, nPenEnc: 2, nTool: 3, nBox: 4 }),
  tabScreen('p6-9-spell', U(5, '法术'), 'spell', '主界面 · 法术（T:ActorSpellbookTab：操作栏 + 按环分组，组头带法术位 + 脚注施法摘要）', '施法、看法术位、准备法术', '法术位圆点 · 带框的命中 / 效果',
    'Jakob（法术位就在这一环的组头上）· Tesler',
    [[1, '组头法术位', '「1 环 ●●○○ 2/4 ✎」：点圆点用一格 / 还一格；✎ 改法术位', 'T:SpellSlotManagementQuadrone / SpellSlotTracker · R17'], [2, '每行', '准备圆点（戏法没有）· 名字与学派 · 施放 · 距离 · 命中/DC · 效果（点 = 掷）· ⋯', 'T:SpellTable · R15'], [3, '施法摘要卡', '属性 · 豁免 DC · 攻击 · 已准备 · 专注；卡头右上 ✎；脚注 [加法术]', 'T:SpellcastingClassSummaryCard / ActorSpellbookFooter']],
    { nSlotPen: 1, nLv: 2, nPenSp: 3, nCast: 4 }),
  tabScreen('p6-10-feat', U(6, '特性'), 'feat', '主界面 · 特性（T:CharacterFeaturesTab：操作栏 + 按来源分组的特性表）', '看有什么能力、还剩几次', '次数圆点',
    'Jakob · Miller',
    [[1, '分组', '按来源：职业 · 种族 · 背景（专长）；每组一张表，列 次数 · 恢复', 'T:FeatureTables / CharacterSheetSections（按来源分组；具体类别名未逐项核对）'], [2, '资料不可用', '这本书没开或卸载了：名字照常显示，下面红字「资料不可用」，人物其余照常', 'R33']],
    { nCls: 1, nGone: 2 }),
  tabScreen('p6-11-effect', U(7, '效果'), 'effect', '主界面 · 效果（T:ActorEffectsTab：状态开关 + 效果表）', '开关状态、看正在生效的效果、自定义效果', '状态按钮（点一下开 / 关）',
    'Jakob · Hick · Doherty',
    [[1, '状态', '一排状态开关（含力竭步进），点一下开 / 关，立刻生效、可撤销；内核认识的状态自动影响数值和掷骰，不认识的只提醒', 'T:ActorConditionsQuadrone · R17 R20'], [2, '效果表', '生效中 / 被动 / 停用；列 来源 · 持续 · 开关；[＋ 新建效果] 用自制数据里已有的效果表单', 'T:EffectsTables（分组名未逐项核对）· R21']],
    { nCond: 1, nNew: 2 }),
  {
    id: 'p6-12-bio', group: U(8, '背景'), title: '主界面 · 背景（T:CharacterBiographyTab）', flow: '写设定', goal: '人物设定一页看完', primary: '各块的 ✎',
    patterns: 'Tidy5e Biography：外貌 + 传记文本卡 ｜ 性格 + 特征 + 备注', laws: 'Miller（文本卡与字段分开）· Jakob',
    notes: [[1, '特征', '只有 性别、信仰（驾驶员 11-15 去掉年龄 / 眼睛 / 皮肤 / 头发）', 'T:CharacterBiographyTab · 驾驶员'], [2, '文本卡', '外貌 · 传记 · 性格特点 · 理想 · 羁绊 · 缺点；没内容的收成「＋ 添加」', 'T:trait ideal bond flaw appearance biography'], [3, '备注', '玩家自己的备忘（原「给 AI 的说明」，已改名）', '驾驶员需求']],
    board: by({ full: pg({ tab: 'bio', nFields: 1 }), '1440': pg({ tab: 'bio', tabsOnly: true }), '390': pg({ tab: 'bio', tabsOnly: true }) }, { full: '全屏', '1440': '960 窗口', '390': '窄屏' }),
  },
  {
    id: 'p6-12b-note', group: U(9, '日志'), title: '主界面 · 日志（T:ActorJournalTab）', flow: '记日志', goal: '按页记跑团日志', primary: '[新页]',
    patterns: '页列表 + 正文', laws: 'Jakob · Miller',
    notes: [[1, '页列表', '左边页列表 + [新页]', 'T:ActorJournalTab'], [2, '正文', '右边正文，上一页 / 下一页', 'T:ActorJournalTab']],
    board: by({ full: pg({ tab: 'note', nNotes: 1 }), '1440': pg({ tab: 'note', tabsOnly: true }), '390': pg({ tab: 'note', tabsOnly: true }) }, { full: '全屏', '1440': '960 窗口', '390': '窄屏' }),
  },
  {
    id: 'p6-13-hp-undo', group: G, title: '子界面 · 生命原地改 · 设定草稿', flow: '流程 C（P6-5）· F7 / F5（R17 R23 R24）',
    goal: '战斗中改血最快；设定改动不会白改', primary: '点生命大数字（原地变输入）', patterns: 'In-place editing · Preview · Multilevel Undo',
    laws: 'Postel（−7 / +5 / =12 / 全角 都认）· Doherty（实时预览）· Safe Exploration · von Restorff（生命数字最大）',
    diff: '1440：正在原地改当前生命；900：有设定草稿（[保存修改]）；390：窄屏原地改。',
    notes: [
      [1, '生命块', '当前生命是**大号文字**，点它就地变成输入框（金色描边）；「/ 18」是**自动值**，普通文字，不在这里改（要改点右上角小铅笔 ✎）；「+3 临时」点一下改临时生命；0 血时展开死亡豁免（成功 / 失败圆点 + [掷]）；生命骰 · 力竭 · 死亡豁免按钮在下面一行', 'R17 · R22 · 流程 C'],
      [2, '原地改', '输入 −7 / +5 / =12 都认；下面一行实时预览「生命 12 → 5 / 18」；Enter 生效（临时生命先扣，由内核算）、Esc 还原；输入法组字时不提交', 'R23 · G08'],
      [3, '设定草稿', '改名字、背景文字这类设定 → 进草稿，底栏变「● 有未保存的编辑」+ [保存修改]；游戏中的小操作（血、法术位、状态、数量）和手改数值的 [应用] 都**不**走草稿，立即写进当前战役', 'R24'],
    ],
    board: by({
      '1440': pg({ hpEdit: true, nHp: 1, nPenHp: 2 }),
      '900': pg({ tab: 'bio', tabsOnly: true, draft: true, nSave: 3 }),
      '390': pg({ hpEdit: true }),
      mid: pg({ dying: true, nDeath: 1 }),
    }, { '1440': '960：正在原地改当前生命（输入 −7）', '900': '868：有设定草稿（标签行右端 [保存修改]）', '390': '窄屏：原地改生命', mid: '600：0 血 → 死亡豁免展开（Tidy5e DeathSavesOverlay）' }),
  },
  {
    id: 'p6-13b-override', group: G, title: '子界面 · 手改小抽屉（一个自动模块一个）：生命 · 属性 · 战斗 · 等级', flow: '流程 A / B / E（P6-5）',
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
    id: 'p6-13e-skill-trait', group: U(3, '属性'), title: '子界面 · 技能抽屉 · 特质抽屉（外面只读，进抽屉才改）', flow: '流程 A / H（P6-5）',
    goal: '技能的熟练项、特质里的语言 / 抗性 / 熟练：平时在外面显示着不改；要改点 ✎ 进抽屉', primary: '[应用]', patterns: 'Small modal per module · Segmented（无 / 半 / 熟 / 专）· Chips with source',
    laws: 'Miller（来源标签分块）· Safe Exploration（删掉的自动项收进「已删除」可恢复）· Jakob',
    notes: [
      [1, '外面', '「数值」页的技能表、特质块全是普通文字（熟练点、加值、药丸），不带编辑控件；表头 / 块头一个 ✎', 'R22'],
      [2, '技能抽屉', '一行一个技能：名字 · 属性 · 来源写在下面（「自动 熟练 · 背景·学者」/「手动改为 专（自动 无）」）· 熟练级别 [无 | 半 | 熟 | 专] · ↺ 回到自动；改过的行名字带金线；窗口内滚动', 'R15 · R22'],
      [3, '特质抽屉', '语言 / 感官 / 抗性 / 免疫 / 武器熟练 / 护甲熟练：药丸 + 来源小字（种族 / 背景 / 职业 / 手动添加）；× 删除、[＋ 加…] 添加；**删掉自动来的项 = 收进「已删除」，药丸变虚线带 ↺，随时恢复**；手动添加的删掉就没了（可撤销）', 'R22 · 建卡带来的内容可改'],
      [4, '建卡填好之后', '建卡每一步选的东西（种族给的语言、背景给的技能…）自动出现在对应抽屉里，来源写「种族」「背景」…；之后删 / 加 / 改都在这里', 'R04 · R22'],
    ],
    board: by({ '1440': () => ({ noFab: true, content: detail({ tab: 'attr', tabsOnly: true }), overlay: skDrawer({ nRow: 1 }) }), '900': () => ({ noFab: true, content: detail({ tab: 'attr', tabsOnly: true }), overlay: trDrawer({}) }), '390': () => ({ noFab: true, content: detail({ tab: 'attr', tabsOnly: true }), overlay: skDrawer({}) }) },
      { '1440': '960：技能抽屉（察觉手改为专精、运动手改为无）', '900': '868：特质抽屉（手动添加 + 已删除可恢复）', '390': '窄屏：技能抽屉' }),
  },
  {
    id: 'p6-13c-override-state', group: G, title: '子界面 · 已手改的数：只有一条金线（没有悬浮提示）', flow: '流程 B（P6-5）',
    goal: '一眼看出哪些数被手改过；想看 / 想改回，点 ✎ 进那个模块的抽屉', primary: '—', patterns: 'Inline marker（无悬停、无点击）', laws: 'von Restorff（只有手改过的数有金线）',
    notes: [
      [1, '金线', '被手改的自动值（最大生命、AC、智力…）数字下面一条金色细线；**没有悬浮窗、没有点击气泡**；其余自动值都是普通文字', 'R22 · 驾驶员 11-15'],
      [2, '怎么看 / 怎么改回', '点该模块的 ✎ → 抽屉里那一项选「自动」→ [应用]；抽屉里每项都写着自动值，改回去会变成什么一目了然', 'R22 · R25'],
    ],
    board: by({ full: pg({ man: ['hpmax', 'ac', 'int'] }), '1440': pg({ man: ['hpmax', 'ac', 'int'] }), '390': pg({ man: ['hpmax', 'ac', 'int'] }) }, { full: '全屏：金线（最大生命、AC、智力）', '1440': '960：金线', '390': '窄屏：金线' }),
  },
  {
    id: 'p6-13d-avatar', group: G, title: '子界面 · 人物头像：填链接 · 直接上传', flow: '流程 G（P6-5）· 点头像换头像',
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
    id: 'p6-14-history', group: G, title: '子界面 · 改动记录 · 撤销到这里', flow: '点错了找回（R25）', goal: '找到那一条，看清会撤销什么，再退回', primary: '[撤销到这里]（先预览）',
    patterns: 'Command History · Multilevel Undo · Preview', laws: 'Doherty（先预览）· Hick（每行一个动作）',
    notes: [[1, '记录表', '谁 · 改了什么 · 旧 → 新 · 时间；可筛「只看盖尔 / 全部」；随存档保存', 'R25 · G22'], [2, '撤销到这里', '会连带撤销之后的改动 → 先出预览「会撤销 4 条」；能不能只撤一个人要查后端', 'R24 · 候选 G27']],
    board: by({
      '1440': () => ({ noFab: true, content: detail({}), overlay: mdl('sheet', mh('改动记录', { n: 1 }), `<div style="padding:var(--sp-4) var(--sp-5)"><div style="display:flex;gap:8px;margin-bottom:8px">${seg([{ label: '只看盖尔', on: true }, { label: '全部人物' }])}</div><div class="sh-tbl" style="--cols:70px minmax(0,1fr) 110px 54px 96px;margin:0"><div class="sh-sec"><b>谁</b><span style="text-align:left">改了什么</span><span>旧 → 新</span><span>时间</span><span></span></div>${[['盖尔', '生命', '18 → 12', '刚才'], ['盖尔', '1 环法术位', '3/4 → 2/4', '2 分钟'], ['盖尔', '加状态：中毒', '', '5 分钟'], ['盖尔', 'AC 手改', '自动 12 → 14', '9 分钟'], ['盖尔', '长休', '', '昨天']].map(([w, a, b, t], i) => `<div class="sh-tr"><span style="text-align:left">${w}</span><span style="text-align:left">${a}</span><span>${b}</span><span class="sh-2">${t}</span><span>${btn(i === 3 ? '回到自动' : '撤销到这里', { small: true, n: i === 1 ? 2 : 0 })}</span></div>`).join('')}</div>`) }),
      '390': () => ({ noFab: true, content: detail({}), overlay: mdl('confirm', mh('撤销到这里'), `<div class="trpg-confirm"><p class="trpg-confirm__message">退回到「盖尔 1 环法术位 3/4 → 2/4」之前？之后的改动会一起退回：</p><ul class="trpg-confirm__details"><li>盖尔 生命 18 → 12</li><li>盖尔 1 环法术位</li></ul><div class="trpg-confirm__actions">${btn('取消')}${btn('撤销 2 条', { primary: true })}</div></div>`) }),
    }, { '1440': '改动记录', '390': '撤销到这里：先预览' }),
  },
]
