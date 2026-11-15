// 人物详情 v4：每个分页一屏。结构照 Tidy5e 角色表（CharacterSheetQuadroneRuntime 的分页：Sheet / Character / Inventory / Spellbook / Features / Effects / Biography / Journal）。
// 需求：P6-2 R14–R25、R33。生命 = 原地三个框（驾驶员 2026-11-15）。
import { detail } from '../lib/sheet.mjs'
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
      [2, '生命块（原地三个框）', '**当前 / 上限 / 临时 三个框就在原地**，直接点进去改：当前框里输 −7 / +5 / 12 都认，下面实时预览「12 → 5 / 18」，Enter 生效、Esc 还原；改完一条改动记录。✎ = 上限明细与手改。下面：死亡豁免（[掷]）、生命骰（[掷一颗]）、力竭、灵感', 'R17 · R23 · R15 · 驾驶员 2026-11-15'],
      [3, '身份 · 分类 · 经验', '名字 ★ 英文名；职业等级 子职业 / 种族 / 背景 / 阵营 / 体型（字段由人物数据给）；[队伍 ▾] 换分类、[随行 ▾]；右边经验条 + [等级管理]，够经验时变金色「可以升级」', 'R08 · R09 · R19'],
      [4, '六属性 · AC 先攻 速度 熟练', '点 AC 小格 = 读数弹窗（来源明细 + 手改 + 回自动，p6-13）；属性格：大字调整值（点 = 属性检定）、小框属性值、● 熟练 + 豁免值（点 = 豁免）', 'R15 · R22'],
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
    id: 'p6-13-hp-undo', group: G, title: '生命原地改 · 设定草稿 · AC 手改（读数弹窗）', flow: '扣血 · 改设定 · 手改覆盖（R17 R22 R23 R24）',
    goal: '改血最快；设定改动不会白改；任何自动值都能手改也能回自动', primary: '生命「当前」框 / [保存修改] / [回到自动]',
    patterns: 'In-place editing · Preview · Override with reset', laws: 'Postel（−7 / +5 / =12 / 全角 都认）· Doherty（实时预览）· Safe Exploration',
    notes: [
      [1, '生命原地改', '直接点「当前」框输 −7：框变白、金边，下面预览「生命 12 → 5 / 18」；Enter 生效（临时生命先扣，由内核算）；Esc 还原；输入法组字时不提交', 'R17 · R23'],
      [2, '设定草稿', '改名字、背景文字这类设定 → 进草稿，底栏变「● 有未保存的编辑」+ [保存修改]；游戏中的小操作（血、法术位、状态、数量）不进草稿，立即写进当前战役', 'R24'],
      [3, '读数弹窗（AC）', '来源明细（内核给）+ 手改框 + [回到自动]；被手改的数字下面有金色细线', 'R22'],
    ],
    board: by({
      '1440': pg({ hpEdit: true, nHp: 1 }),
      '900': pg({ tab: 'bio', tabsOnly: true, draft: true, nSave: 2 }),
      '390': pg({ hpEdit: true }),
      mid: () => ({ noFab: true, content: detail({ acOvr: true }), overlay: mdl('dialog', mh('AC 怎么来的', { n: 3 }), `<div class="sh-tbl" style="--cols:minmax(0,1fr) 60px;margin:0"><div class="sh-sec"><b>自动算</b><span>12</span></div><div class="sh-tr"><span style="text-align:left">基础</span><span>10</span></div><div class="sh-tr"><span style="text-align:left">敏捷调整值</span><span>+2</span></div><div class="sh-tr"><span style="text-align:left">护甲：无</span><span>—</span></div></div>
<div class="trpg-field" style="margin-top:12px"><label class="trpg-field__label">手改成</label><div class="trpg-input">14</div><p class="trpg-hint">手改后不再跟着装备变；随时可以回到自动。</p></div><div class="trpg-confirm__actions">${btn('回到自动')}${btn('用 14', { primary: true })}</div>`) }),
    }, { '1440': '960：正在改生命（当前框里输 −7）', '900': '868：有设定草稿', '390': '窄屏：改生命', mid: '600：AC 读数弹窗（手改 / 回到自动）' }),
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
