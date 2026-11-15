// 新建 v5：「从模板加入」和「分步建卡」共用同一套两栏页（左列表 · 右资料卡 · 无边框细线；窄屏 = 列表页 → 点一项 → 资料卡页）。需求：P6-2 R01–R05、R11。
import { listPage, mem, memSec, btn, filt, step, P } from '../lib/parts.mjs'
import { row, card, tabs, tools, pickPage, pickModal, foot } from '../lib/picker.mjs'
import { wizard } from '../lib/wizard.mjs'
import { by } from '../lib/frame.mjs'

const G = '单元 0 · 人物列表（主界面 + 子界面）'
const behind = (tab = 0) => listPage({ tab, body: `${memSec('随行', 1)}${mem({ name: '盖尔', en: 'Gale', cls: '法师', lv: '3 级', race: '人类', hp: [12, 18], temp: 3, ac: 12, pp: 11 })}` })
const W = (cur, o = {}) => () => ({ noFab: true, content: behind(), overlay: wizard(cur, o) })
const KERNEL = '步骤标签来自规则数据 kernel.build（种族 · 背景 · 职业 · 子职业 · 专长 · 可选特性）；每件条目展开哪些选择由内核 buildSteps 列出（生命值 / 熟练与技能 / 属性提升 / 给物品 / 选物品 / 子职业 / 体型），界面不写死'

/** 一个建卡步骤的屏：宽 = 两栏；窄 = 列表页 + 资料卡页（页面跳转） */
const wz = (id, cur, title, goal, notes, o = {}, extra = {}) => ({
  id, group: G, title, flow: '新建 ▸ 分步建卡（R01 · R04）', goal, primary: '[下一步]', patterns: 'Two-Pane Selector（左列表 · 右资料卡）· Wizard（步骤标签）· 窄屏 One-Window Drilldown', laws: 'Hick（每步一类决定）· Tesler（自动的步骤内核做掉，只标「自动」）· Changes in Midstream（关掉 = 存成建卡中）', notes,
  diff: '宽：上面步骤标签，下面左列表 · 右资料卡，底栏动作；窄屏：不再两栏——先是列表页，点一项跳到资料卡页（返回「‹ 列表」），资料卡页底部 [选它并下一步]。',
  board: by(extra.board ?? { '1440': W(cur, o), '390': W(cur, { ...o, view: 'list' }), '390b': W(cur, { ...o, view: 'card' }) }, { '1440': '960 窗口：两栏', '390': '窄屏：列表页', '390b': '窄屏：点一项后跳到的资料卡页', ...(extra.captions ?? {}) }),
})
const one = (cur, o = {}) => ({ '1440': W(cur, o), '390': W(cur, o) })

/* ---------- 从模板加入：同一套两栏页 ---------- */
const GOBLINS = [
  { ch: '地', name: '地精', en: 'Goblin', tags: ['挑战 1/4'], sub: '小型类人生物', src: 'SRD 基础规则' },
  { ch: '地', name: '地精头目', en: 'Goblin Boss', tags: ['挑战 1'], sub: '小型类人生物', src: '怪物图鉴 (2014)' },
  { ch: '大', name: '大地精长官', en: 'Hobgoblin Captain', tags: ['挑战 3'], sub: '中型类人生物', src: '怪物图鉴 (2014)' },
  { ch: '熊', name: '熊地精', en: 'Bugbear', tags: ['挑战 1'], sub: '中型类人生物', src: 'SRD 基础规则' },
  { ch: '盖', name: '盖尔（模板）', en: 'Gale', tags: ['人物'], sub: '我的库', src: '我的库' }]
const GOBLIN_CARD = {
  ch: '地', name: '地精', en: 'Goblin', sub: '小型类人生物（地精类）· 中立邪恶', tags: ['挑战 1/4'], src: 'SRD 基础规则', n: 3,
  stats: [['AC', '15'], ['生命', '7（2d6）'], ['速度', '30 尺']], abs: [['力量', '8 −1'], ['敏捷', '14 +2'], ['体质', '10 +0'], ['智力', '10 +0'], ['感知', '8 −1'], ['魅力', '8 −1']],
  kv: [['护甲', '皮甲、盾牌'], ['技能', '隐匿 +6'], ['感官', '黑暗视觉 60 尺，被动察觉 9'], ['语言', '通用语、地精语'], ['挑战', '1/4（50 经验）']],
  secs: [['灵活逃脱', '地精可以在自己的每个回合用附赠动作进行撤离或躲藏。'], ['动作', '<b>弯刀</b> 近战武器攻击 +4，触及 5 尺，1d6+2 挥砍。<b>短弓</b> 远程攻击 +4，80/320 尺，1d6+2 穿刺。']] }
const tplFoot = foot(`<small>${P(5)}本次已加入：地精 ×3 <button class="trpg-link" type="button">撤销</button></small><span class="pk-foot__sp"></span>${btn('编辑后加入')}<span class="sh-2">放进</span>${btn('敌人', { ic: 'caret-down' })}${step(3)}${btn('加入列表', { primary: true, n: 4 })}`)
const tplTop = `${tabs([['全部', 1191], ['怪物', 1191], ['具名 NPC', 0]], 0, 1)}${tools('地精', 11, { n: 2 })}`
const template = (view) => pickModal('模板', '', view === 'card'
  ? pickPage({ view, card: card(GOBLIN_CARD), footHtml: foot(`${btn('编辑后加入')}<span class="pk-foot__sp"></span>${step(3)}${btn('加入列表', { primary: true })}`) })
  : pickPage({ view, top: tplTop, list: GOBLINS.map((r, i) => row({ ...r, sel: i === 0 })).join(''), card: card(GOBLIN_CARD), footHtml: view === 'both' ? tplFoot : undefined }), { view })
const tplBoard = (view) => () => ({ noFab: true, content: behind(2), overlay: template(view) })

export const screens = [
  {
    id: 'p6-4-template', group: G, title: '从模板加入（和分步建卡同一套两栏页）', flow: '新建 ▸ 从模板（库）▸ 加入（P6-2 §5 最常用）',
    goal: '分类标签 + 搜索筛选 + 左列表右资料卡；定数量、放进哪一类，一键加入；窗口不关能连续加', primary: '[加入列表]', patterns: 'Two-Pane Selector（左列表 · 右资料卡）· Streamlined Repetition · 窄屏 One-Window Drilldown', laws: 'Hick（分类 3 项）· Doherty（加完就地累计反馈）· Fitts · Jakob（和建卡同一套）',
    diff: '宽：左列表 · 右资料卡 · 底栏动作；窄屏：不再两栏，先列表页，点一项跳到资料卡页（底部 [加入列表]，返回「‹ 列表」）。',
    notes: [[1, '分类标签', '全部 / 怪物 / 具名 NPC（带数量）；标签由登记表给，不写死', 'R01 · R03'], [2, '搜索 · 筛选 · 排序 · 共 N 条 · 清除', '搜索框 + [筛选] + 排序；来源（官方 / 下载 / 我的库）、书、挑战等级都在 [筛选] 里', 'R01–R04 · G16 · G17'], [3, '右侧资料卡', '**就是库里的同一张资料卡**（头像 · 名字 · 数据条 · 属性 · 技能 · 特性 · 动作），不另画简化卡', 'R03'], [4, '底栏', '[编辑后加入]（先改这份副本）· 放进哪一类（默认当前分类）· 数量 · [加入列表]；生命「平均 / 各自掷骰」后端待查', 'R01 · R04 · R11 · G15'], [5, '本次已加入', '窗口不关；[撤销] 撤这一次加入', 'R08 · R25']],
    board: by({ '1440': tplBoard('both'), '390': tplBoard('list'), '390b': tplBoard('card') }, { '1440': '960 窗口：两栏', '390': '窄屏：列表页', '390b': '窄屏：点一项后跳到的资料卡页' }),
  },
  wz('p6-5a-name', 'name', '分步建卡 ① 名字（只有这一项必填）', '先起名，马上能开始', [[1, '步骤标签', `${KERNEL}；做完打 ✓；能点回任意一步；不需要的步骤是灰色虚线圆`, 'R04 · G04 · morii-vtt'], [2, '名字 / 头像链接 / 放进', '只有名字必填；头像可填图片链接也可直接上传（点任一入口打开「人物头像」，p6-13d），显示成方框；放进 = 当前分类', 'R08'], [3, '底栏', '[跳过此步] · 「关掉窗口 = 存成建卡中」· [上一步][下一步]', 'G28（建卡中能否存，后端待查）'], [4, '头像', '方框预览 + [填图片链接] [上传图片]，不填也行', 'G34（上传存哪，待查）']], { nTabs: 1, nHead: 2, nFoot: 3, nAvatar: 4 }, { board: one('name', { nTabs: 1, nHead: 2, nFoot: 3, nAvatar: 4 }) }),
  wz('p6-5b-race', 'race', '分步建卡 ② 种族', '选种族，并做它要求的选择', [[1, '列表', '左边是种族列表（名字 · 体型 · 速度 · 属性提升 · 来源），带搜索 / 筛选', 'R03'], [2, '资料卡', '右边就是库里的种族资料卡；下面是它要你做的选择', ''], [3, '它带来的选择', '内核 buildSteps 列出：体型（自动）、属性提升（选两项 +1）、技能（选 2）、语言（选 1）……「自动」的灰底不用管；没选完写「还差 N」', 'G04']], { nCard: 2, nCh: 3 }),
  wz('p6-5c-bg', 'bg', '分步建卡 ③ 背景', '选背景：技能、语言', [[1, '背景', '技能自动给；语言选 2；起始物品放到「装备」步一起看（金币也是物品）', 'R18']]),
  wz('p6-5d-class', 'class', '分步建卡 ④ 职业（建 1 级）', '选职业并完成 1 级的选择', [[1, '职业', '生命骰 · 主属性；右边资料卡 + 1 级要做的选择', ''], [2, '1 级的选择', '生命值、豁免熟练自动；技能选 2（背景已给的灰掉不能再选）；戏法选 3；牧师 1 级要选子职业 → 下一步', 'G04'], [3, '更高等级', '建卡只建 1 级；更高等级在人物页「等级管理」里一级一级升（先预览）', 'R19']], { nPick: 1, nCh: 2 }),
  wz('p6-5e-sub', 'sub', '分步建卡 ⑤ 子职业', '1 级就有子职业的职业才出现', [[1, '子职业', '领域法术、额外熟练、1 级特性全由内核自动加上，只要选领域', 'G04']]),
  wz('p6-5f-feat', 'feat', '分步建卡 ⑥ 专长 · ⑦ 可选特性（不需要 / 需要）', '不需要的步骤一眼看出来，直接跳过', [[1, '不需要时', '内核没列出这一步：步骤标签是灰色虚线圆，页面写「这一步不用做」+ [去下一步]', 'G04'], [2, '需要时', '例：人类（变体）1 级给 1 个专长 → 两栏页，专长列表带「前置条件」', '']], { nNone: 1 },
    { board: { '1440': W('feat', { nNone: 1 }), '900': W('feat', { need: true }), '390b': W('feat', { need: true, view: 'card' }) }, captions: { '1440': '960：不需要（半精灵牧师）', '900': '868：需要（人类变体给 1 个专长）', '390b': '窄屏：专长资料卡页' } }),
  wz('p6-5g-ab', 'ab', '分步建卡 ⑧ 属性值', '定 6 个基础值，看清种族加了多少', [[1, '方式', '标准数组 / 购点 / 掷骰 / 手填', 'morii-vtt'], [2, '待放的数', '标准数组 15 14 13 12 10 8；放过的划掉', ''], [3, '待查后端', '内核建卡计划没看到「基础属性值」这一项；能不能存、走哪条接口要查（候选缺口）', '候选缺口']], { nWay: 1, nPool: 2, nGap: 3 }, { board: one('ab', { nWay: 1, nPool: 2, nGap: 3 }) }),
  wz('p6-5h-eq', 'eq', '分步建卡 ⑨ 装备', '起始装备二选一，背景物品直接给', [[1, '起始装备', '每组单选（甲 / 乙 / 丙）；「任意一件简易武器」= 从库里选', ''], [2, '待查后端', '起始装备选项是否由职业条目数据直接给、内核 equipment 能否接这些选择', '候选缺口']], { nRad: 1, nGap: 2 }, { board: one('eq', { nRad: 1, nGap: 2 }) }),
  wz('p6-5i-done', 'done', '分步建卡 ⑩ 检查后创建', '看一眼全貌，空着的知道去哪补', [[1, '待填清单', '跳过的步骤和没选完的选择都列在这里，[去填] 跳回那一步；不填也能创建', 'R04'], [2, '[创建伊娃]', '创建后直接打开人物页；创建算一条改动记录，可撤销', 'R25']], { nTodo: 1, nGo: 2 }, { board: one('done', { nTodo: 1, nGo: 2 }) }),
  {
    id: 'p6-5j-building', group: G, title: '关掉建卡窗口之后：列表里的「建卡中」人物', flow: '中途离开（Changes in Midstream）', goal: '中途关掉不丢，回来接着建', primary: '[继续建卡]',
    patterns: 'Changes in Midstream', laws: 'Zeigarnik（没做完的事显眼地挂着）',
    notes: [[1, '建卡中', '不弹「要丢掉吗」；列表行带「建卡中 4 / 10」标签和 [继续建卡]，点开回到上次那一步', 'G28（后端待查）']],
    board: by({ '1440': () => ({ content: listPage({ body: `${memSec('随行', 1)}${mem({ name: '盖尔', en: 'Gale', cls: '法师', lv: '3 级', race: '人类', hp: [12, 18], temp: 3, ac: 12, pp: 11 })}${memSec('留守', 1)}${mem({ name: '伊娃', building: '4 / 10', n: 1 })}` }) }) }, { '1440': '960 窗口' }),
  },
]
