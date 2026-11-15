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
    diff: '全屏：页头生命区在左，右边身份 + 等级块 + 事实表 + 战斗块 + 属性块；侧栏 252 宽。窄屏（≤900）：头像在左、右边只列名字和必要信息，下面生命 → 等级 → 事实表 → 战斗 → 属性（3×2）一块一块竖着排；侧栏折叠，✎ 位置不变。',
    notes: [
      [1, '应用条', '‹ 人物 · 名字 · [队伍▾][随行▾] · 上一位 / 下一位 · 撤销 ▾ · ⋯。**不是 Tidy5e 的，是你的需求**', 'R08 R09 R25'],
      [2, '生命区', '**当前生命大号文字，点它就地输入**（−7 / +5 / =12）；「+3 临时」点一下开 Max / Temp；「/ 18」最大生命是结算值，右上 ✎ 进来源条目抽屉。下面是**三个文字按钮：生命骰 3/3 · 力竭 2 级 · 死亡豁免**，各开一个抽屉（改数量或掷骰），不原地改、不画骷髅小图标（Tidy5e 的做法被你否决）；0 血时「死亡豁免」按钮变红框强调', 'T:parts/ActorHealthBar · CharacterSheet hd-row（点开 = HitDiceConfig）· R17 · 驾驶员 11-15'],
      [3, '名字行 / 必要信息 / 事实表', '头像右边：名字 ★ 英文名 ✎、「法师 3　人类　中立善良」、短休 / 长休（先预览）。✎ 进「身份」抽屉：名字 / 英文名 / 阵营是**直接填写**；种族、背景、体型与类型、速度、感官是**规则结算**的，各点进自己的来源条目抽屉。下面一张事实表：种族 · 背景 · 体型 · 类型 · 速度 · 感官 · 法术（普通文字，没有「·」拼接）', 'T:CharacterSheet 名字行 · CharacterSubtitle.svelte · R14 R19'],
      [4, '等级块', '三格：**等级 · 熟练加值 · 灵感**（文字按钮，不是孤零零的星）；下面一行经验条「经验 900 / 2,700」+ [等级管理 ▾]（升降级先预览）；右上 ✎ 进「等级与熟练」抽屉（经验直接填；等级 = 职业等级相加，熟练加值看来源条目）', 'T:level-block / InspirationBadge / LevelUpDropdown · R19'],
      [5, '战斗块', 'AC · 先攻（带骰子，点 = 掷）· 专注豁免（有施法才显示）；横向方块，标签在上，顶边古铜金；右上 ✎ 进来源条目抽屉（AC 由哪几条加起来）', 'T:ac-container / initiative / concentration · 你说：与属性块两种样式'],
      [6, '属性块', '六个竖卡：调整值大（点 = 属性检定）· 属性值小 · 下面一行豁免（● 熟练）；右上 ✎ 进属性来源条目抽屉（基础值 + 种族 + 专长 + 手动）', 'T:AbilityScore.svelte · R15'],
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
    [[1, '操作栏', '搜索 + [已装备][可使用] + 筛选 / 排序 / 展开 / 配置 + [加物品]（从库选）', 'T:InventoryActionBar → ItemsActionBar'], [2, '负重行', '负重条 + 数值；卡头右上 ✎ 改负重上限', 'T:CharacterEncumbranceRow · R22'], [3, '分组与行', '武器 · 装备 · 消耗品 · **工具** · 容器（按物品类型，可加自定义分组）；容器可展开、里面缩进；**钱币就是物品，没有钱币栏**。**每行按物品类型出不同的状态标签（已装备 / 魔法·稀有度 / 需调谐 / 隐匿劣势 / 未鉴定…）和一个专用按钮**（装备·卸下 / 穿上·脱下 / 调谐 / 使用… / 施放… / 检定 / 选为弹药 / 折叠）；充能物品的「5/7 ✎」点一下改次数。全套对照见 u4-kinds', 'T:features/sections/Inventory.ts · EquipButton / AttuneButton · R18 · 驾驶员 11-15'], [4, '脚注', '调谐 0 / 3', 'T:ActorInventoryFooter']],
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
      [1, '生命块', '当前生命是**大号文字**，点它就地变成输入框（金色描边）；「/ 18」是**自动值**，普通文字，不在这里改（要改点右上角小铅笔 ✎）；「+3 临时」点一下改临时生命；生命骰 · 力竭 · 死亡豁免是下面三个文字按钮（点开各是一个抽屉，见 u1-dice）', 'R17 · R22 · 流程 C'],
      [2, '原地改', '输入 −7 / +5 / =12 都认；下面一行实时预览「生命 12 → 5 / 18」；Enter 生效（临时生命先扣，由内核算）、Esc 还原；输入法组字时不提交', 'R23 · G08'],
      [3, '设定草稿', '改名字、背景文字这类设定 → 进草稿，底栏变「● 有未保存的编辑」+ [保存修改]；游戏中的小操作（血、法术位、状态、数量）和来源条目抽屉的 [保存] 都**不**走草稿，立即写进当前战役', 'R24'],
    ],
    board: by({
      '1440': pg({ hpEdit: true, nHp: 1, nPenHp: 2 }),
      '900': pg({ tab: 'bio', tabsOnly: true, draft: true, nSave: 3 }),
      '390': pg({ hpEdit: true }),
      mid: pg({ dying: true, nDeath: 1 }),
    }, { '1440': '960：正在原地改当前生命（输入 −7）', '900': '868：有设定草稿（标签行右端 [保存修改]）', '390': '窄屏：原地改生命', mid: '600：0 血 → 「死亡豁免」按钮变红框、显示「成功 1 · 失败 0」（点开 = 死亡豁免抽屉）' }),
  },
  {
    id: 'p6-13b-override', group: G, title: '子界面 · 来源条目抽屉（一个结算模块一个）：最大生命 · 属性值 · AC / 先攻 / 专注 · 等级与熟练', flow: '流程 A / B / E（P6-5，11-15 第二次修正）',
    goal: '外面全是只读的普通文字；点模块角上的 ✎ 进这个模块自己的小抽屉，看这个数是哪几条加起来的，可以删条目、手动加条目、把删掉的自动条目重新分配回来', primary: '[保存]', patterns: 'Small modal per module（宽 480，高度跟内容走）· 来源条目列表 · Preview',
    laws: 'Tesler（来源写在每一条上）· Safe Exploration（删掉的自动条目收进「已移除」，随时重新分配）· Hick（一个抽屉只管一个模块）· Jakob（D&D Beyond / Foundry 的「来源加成」列表）',
    diff: '宽：居中小窗；窄屏：底部铺满。高度跟内容走，内容多了在窗口里滚。**取消了「自动 | 手动」二选一**：那个开关没有意义（驾驶员 11-15）。',
    notes: [
      [1, '三类抽屉的分法', '① **直接填写**：本来就该玩家自己写的（名字、英文名、阵营、性别、信仰、经验）——普通表单。② **来源条目**：内核结算出来的（最大生命、属性值、AC、豁免 / 技能熟练、速度、种族给的东西……）——本屏。③ **状态 / 掷骰**：生命骰、力竭、死亡豁免——见 u1-dice', 'R22 · 驾驶员 11-15'],
      [2, '结果条 + 条目', '顶上一条结算结果（「最大生命 19 = 6 + 4 + 5 + 3 + 1」）；下面一条一条：名字 · 数值 · **来源标签**（职业 / 种族 / 背景 / 专长 / 装备 / 手动）· ×。手动加的条目标签带金边、名字带金线，还多一个 ✎ 可改', 'R22 · G14'],
      [3, '删 / 加 / 重新分配', '× 删掉任何一条（自动来的删掉后收进「已移除的自动条目」，每条一个 [重新分配]）；[＋ 添加条目] 手动加一条（来源写「手动」）；底部 [全部重新分配] 把本抽屉里移除过的自动条目全放回。**没有「覆盖成固定数」**', '流程 B · 候选 G32 G33'],
      [4, '属性抽屉', '六个属性各一行（最终值 + 基础来源）；点一行展开它的条目（基础值是建卡填的，不是自动算的 · 种族 · 专长 · 手动）', '流程 E · 候选 G33'],
      [5, '等级与熟练', '经验直接填写；等级 = 职业等级相加（升降级走 [等级管理]，不在这里直接改数）；熟练加值看来源条目', 'R19 · R22'],
      [6, '底部', '[全部重新分配] · [取消] · [保存]（立刻生效，一条改动记录，可撤销；不走「保存修改」草稿）', 'R24 · R25'],
    ],
    board: by({ '1440': () => ({ noFab: true, content: detail({ man: ['hpmax'] }), overlay: hpDrawer({ nTitle: 1, nRow: 2, nApply: 3 }) }), '900': () => ({ noFab: true, content: detail({ man: ['int'] }), overlay: abDrawer({ nRow: 4 }) }), '390': () => ({ noFab: true, content: detail({}), overlay: cbDrawer({}) }), mid: () => ({ noFab: true, content: detail({}), overlay: lvDrawer({ nRow: 5 }) }) },
      { '1440': '960：最大生命（含一条手动 +1，已移除一条专长）', '900': '868：属性值（智力展开，含一条手动 +2）', '390': '窄屏：AC / 先攻 / 专注', mid: '600：等级与熟练（经验直接填写）' }),
  },
  {
    id: 'p6-13e-skill-trait', group: U(3, '属性'), title: '子界面 · 技能熟练抽屉 · 特质抽屉（外面只读，进抽屉才改）', flow: '流程 A / H（P6-5）',
    goal: '技能的熟练项、特质里的语言 / 抗性 / 熟练：平时在外面显示着不改；要改点 ✎ 进抽屉，看来源、删、加、重新分配', primary: '[保存]', patterns: 'Small modal per module · 来源条目 · Chips with source',
    laws: 'Miller（来源标签分块）· Safe Exploration（删掉的自动项收进「已移除」可重新分配）· Jakob',
    notes: [
      [1, '外面', '属性页的技能表、特质块全是普通文字（熟练点、加值、药丸），不带编辑控件；表头 / 块头一个 ✎', 'R22'],
      [2, '技能熟练抽屉', '**不再是 18 行 [无|半|熟|专]**：只列「有熟练的」条目——技能名 · 属性 · 级别（熟练 / 专精）· 来源标签（职业 / 背景 / 手动）· ×；没写的技能就是「无」。[添加熟练条目] 选技能 + 级别（半 / 熟 / 专）；删掉的自动条目在「已移除」里 [重新分配]', 'R15 · R22 · 驾驶员 11-15'],
      [3, '特质抽屉', '语言 / 感官 / 抗性 / 免疫 / 武器熟练 / 护甲熟练：药丸 + 来源小字（种族 / 背景 / 职业 / 手动）；× 删除、[＋ 加…] 添加；**删掉自动来的项 = 收进「已移除」，药丸变虚线带 ↺，随时重新分配**；手动添加的删掉就没了（可撤销）', 'R22'],
      [4, '建卡填好之后', '建卡每一步选的东西（种族给的语言、背景给的技能…）自动出现在对应抽屉里，来源写「种族」「背景」…；之后删 / 加 / 改都在这里', 'R04 · R22'],
    ],
    board: by({ '1440': () => ({ noFab: true, content: detail({ tab: 'attr', tabsOnly: true }), overlay: skDrawer({ nRow: 1 }) }), '900': () => ({ noFab: true, content: detail({ tab: 'attr', tabsOnly: true }), overlay: trDrawer({}) }), '390': () => ({ noFab: true, content: detail({ tab: 'attr', tabsOnly: true }), overlay: skDrawer({}) }) },
      { '1440': '960：技能熟练抽屉（察觉手动加为专精，运动已移除可重新分配）', '900': '868：特质抽屉（手动添加 + 已移除可重新分配）', '390': '窄屏：技能熟练抽屉' }),
  },
  {
    id: 'p6-13c-override-state', group: G, title: '子界面 · 含手动条目的数：只有一条金线（没有悬浮提示）', flow: '流程 B（P6-5）',
    goal: '一眼看出哪些数里有手动加的条目；想看 / 想去掉，点 ✎ 进那个模块的抽屉', primary: '—', patterns: 'Inline marker（无悬停、无点击）', laws: 'von Restorff（只有含手动条目的数有金线）',
    notes: [
      [1, '金线', '来源条目里**含手动条目**的结算值（最大生命、AC、智力…）数字下面一条金色细线；**没有悬浮窗、没有点击气泡**；其余结算值都是普通文字', 'R22 · 驾驶员 11-15'],
      [2, '怎么看 / 怎么改回', '点该模块的 ✎ → 抽屉里删掉那条手动条目（×）→ [保存]；被你移除的自动条目在「已移除」里 [重新分配]', 'R22 · R25'],
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
