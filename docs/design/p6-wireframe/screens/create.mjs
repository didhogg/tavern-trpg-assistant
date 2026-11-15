// 新建 v4：从模板加入（选资料表 + 资料片）· 分步建卡每一步一屏（morii-vtt 的左侧步骤清单；步骤与选项由内核给）。需求：P6-2 R01–R05、R11。
import { listPage, mem, memSec, btn, searchBox, filt, sec, it, tr, c, tbl, wzModal, step, P } from '../lib/parts.mjs'
import { wizard } from '../lib/wizard.mjs'
import { by } from '../lib/frame.mjs'

const G = '新建 · 分步建卡（每一步）'
const behind = (tab = 0) => listPage({ tab, body: `${memSec('随行', 1)}${mem({ name: '盖尔', en: 'Gale', cls: '法师', lv: '3 级', race: '人类', hp: [12, 18], temp: 3, ac: 12, pp: 11 })}` })
const W = (cur, o = {}) => () => ({ noFab: true, content: behind(), overlay: wizard(cur, o) })
const KERNEL = '步骤清单来自规则数据 kernel.build（种族 · 背景 · 职业 · 子职业 · 专长 · 可选特性）；每件条目展开哪些选择由内核 buildSteps 列出（生命值 / 熟练与技能 / 属性提升 / 给物品 / 选物品 / 子职业 / 体型），界面不写死'
const wz = (id, cur, title, goal, notes, o = {}, extra = {}) => ({
  id, group: G, title, flow: '新建 ▸ 分步建卡（R01 · R04）', goal, primary: '[下一步]', patterns: 'Wizard（morii-vtt：左侧步骤清单，可点回任意一步）+ 选资料表 + 资料片', laws: 'Hick（每步一类决定）· Tesler（自动的步骤内核做掉，只标「自动」）· Changes in Midstream（关掉 = 存成建卡中）', notes,
  diff: '960 窗口：左步骤清单 · 中选资料表 · 右资料片与选择；窄屏：步骤清单变成顶部一排圆点（只显示当前这步的名字），资料片排到表下面，弹窗从底部铺满。',
  board: by({ '1440': W(cur, o), '390': W(cur, {}), ...(extra.board ?? {}) }, { '1440': '960 窗口', '390': '窄屏', ...(extra.captions ?? {}) }),
})

const template = (L) => wzModal('从模板加入', `<div class="wz" data-norail="true"><div class="wz-main">
<div class="sh-tools">${P(1)}${filt(['全部', '官方', '下载', '我的库'], 0)}${btn('类别：怪物', { small: true, ic: 'caret-down' })}${btn('挑战 0–2', { small: true, ic: 'caret-down' })}${searchBox('地精')}</div>
<div class="wz-body"><div class="wz-pick">${tbl('minmax(0,1fr) 70px 46px 46px 54px', `${sec('怪物', 4, ['挑战', 'AC', '生命', '来源'], { n: 2 })}${[['地精', '小型类人', '1/4', 15, 7, 'MM'], ['地精首领', '小型类人', '1', 17, 21, 'MM'], ['大地精', '中型类人', '1/2', 18, 11, 'MM'], ['盖尔（模板）', '我的库 · 人物', '—', 12, 18, '我的库']].map((r, i) => tr([it(r[0][0], r[0], r[1]), c(r[2]), c(r[3]), c(r[4]), c(r[5])], i === 0 ? ' aria-selected="true"' : '')).join('')}`)}</div>
<aside class="wz-card">${P(3)}<header><b>地精</b><small>Goblin · 小型类人（地精类）· 中立邪恶</small></header><dl><dt>AC</dt><dd>15（皮甲、盾牌）</dd><dt>生命</dt><dd>7（2d6）</dd><dt>速度</dt><dd>30 尺</dd><dt>技能</dt><dd>隐匿 +6</dd></dl><p>（下面接库里同一个资料卡：属性、特性、动作……）</p></aside></div>
<div class="wz-foot">${P(4)}<span class="sh-2">数量</span>${step(3)}<span class="sh-2">生命</span>${btn('平均', { small: true, ic: 'caret-down' })}<span class="wz-foot__sp"></span>${btn('编辑后加入')}${btn('加入 地精 ×3', { primary: true })}</div>
<div class="sh-info" style="padding:6px var(--sp-4);border-top:1px solid var(--line)">${P(5)}本次已加入：地精 ×3　<button class="trpg-link" type="button">撤销</button>　放进：敌人（当前分类）</div></div></div>`)

export const screens = [
  {
    id: 'p6-4-template', group: G, title: '从模板加入（加怪要快）', flow: '新建 ▸ 从模板（库）▸ 加入（P6-2 §5 最常用）',
    goal: '筛选 → 看资料 → 定数量 → 加入，窗口不关能连续加', primary: '[加入 地精 ×3]', patterns: '选资料表 + 资料片（和建卡同一个外壳，没有左栏）· Streamlined Repetition', laws: 'Hick（来源 4 项）· Doherty（加完就地累计反馈）· Fitts',
    notes: [[1, '来源 · 类别 · 挑战 · 搜索', '来源 = 官方 / 下载 / 我的库（人物模板也在这里）；筛选项由登记表给，不写死', 'R01 · R03'], [2, '选资料表', '列由这一类条目的字段给（怪物：挑战 / AC / 生命 / 来源）', 'R03'], [3, '资料片', '和库里同一个资料卡', 'R03'], [4, '数量 · 生命 · 编辑后加入 · 加入', '「编辑后加入」= 先改这份副本再加入；生命「平均 / 各自掷骰」后端待查', 'R01 · R11'], [5, '本次已加入', '窗口不关；[撤销] 撤这一次加入；放进当前分类', 'R08 · R25']],
    board: by({ '1440': () => ({ noFab: true, content: behind(2), overlay: template() }), '390': () => ({ noFab: true, content: behind(2), overlay: template() }) }, { '1440': '960 窗口', '390': '窄屏（底部铺满）' }),
  },
  wz('p6-5a-name', 'name', '分步建卡 ① 名字（只有这一项必填）', '先起名，马上能开始', [[1, '左侧步骤清单', `${KERNEL}；做完打 ✓ 并写选了什么；能点回任意一步`, 'R04 · G04 · morii-vtt'], [2, '名字 / 头像链接 / 放进', '只有名字必填；头像只存图片链接；放进 = 当前分类', 'R08'], [3, '底栏', '[跳过此步] · 「关掉窗口 = 存成建卡中」· [上一步][下一步]', 'G28（建卡中能否存，后端待查）']], { nRail: 1, nHead: 2, nFoot: 3 }),
  wz('p6-5b-race', 'race', '分步建卡 ② 种族', '选种族，并做它要求的选择', [[1, '选资料表', '种族列表：体型 / 速度 / 属性 / 来源（列由数据给）', 'R03'], [2, '资料片', '选中的种族资料', ''], [3, '它带来的选择', '内核 buildSteps 列出：体型（自动）、属性提升（选两项 +1）、技能（选 2）、语言（选 1）……「自动」的灰底不用管；没选完写「还差 N」', 'G04']], { nPick: 1, nCard: 2, nCh: 3 }),
  wz('p6-5c-bg', 'bg', '分步建卡 ③ 背景', '选背景：技能、语言', [[1, '背景表与资料片', '技能自动给；语言选 2；起始物品放到「装备」步一起看（金币也是物品）', 'R18']]),
  wz('p6-5d-class', 'class', '分步建卡 ④ 职业（建 1 级）', '选职业并完成 1 级的选择', [[1, '职业表', '生命骰 / 主属性 / 豁免 / 来源', ''], [2, '1 级的选择', '生命值、豁免熟练自动；技能选 2（背景已给的灰掉不能再选）；戏法选 3；牧师 1 级要选子职业 → 下一步', 'G04'], [3, '更高等级', '建卡只建 1 级；更高等级在人物页「等级管理」一级一级升（先预览）', 'R19']], { nPick: 1, nCh: 2, nHead: 3 }),
  wz('p6-5e-sub', 'sub', '分步建卡 ⑤ 子职业', '1 级就有子职业的职业才出现', [[1, '子职业表 + 资料片', '领域法术、额外熟练、1 级特性全由内核自动加上，只要选领域', 'G04']]),
  wz('p6-5f-feat', 'feat', '分步建卡 ⑥ 专长 · ⑦ 可选特性（不需要时）', '不需要的步骤一眼看出来，直接跳过', [[1, '不需要时', '内核没列出这一步：左栏灰色虚线圆、写「这个人物不需要」，右边一句话 + [去下一步]', 'G04'], [2, '需要时', '例：人类（变体）1 级给 1 个专长 → 专长表带「前置条件」列', '']], { nNone: 1 },
    { board: { '900': W('feat', { need: true }) }, captions: { '1440': '960：不需要（半精灵牧师）', '900': '868：需要（人类变体给 1 个专长）' } }),
  wz('p6-5g-ab', 'ab', '分步建卡 ⑧ 属性值', '定 6 个基础值，看清种族加了多少', [[1, '方式', '标准数组 / 购点 / 掷骰 / 手填（morii-vtt 有标准数组和掷骰）', 'morii-vtt'], [2, '待放的数', '标准数组 15 14 13 12 10 8；放过的划掉', ''], [3, '待查后端', '内核建卡计划没看到「基础属性值」这一项；能不能存、走哪条接口要查（候选缺口）', '候选缺口']], { nWay: 1, nPool: 2, nGap: 3 }),
  wz('p6-5h-eq', 'eq', '分步建卡 ⑨ 装备', '起始装备二选一，背景物品直接给', [[1, '起始装备', '每组单选（甲 / 乙 / 丙）；「任意一件简易武器」= 从库里选', ''], [2, '待查后端', '起始装备选项是否由职业条目数据直接给、内核 equipment 能否接这些选择', '候选缺口']], { nRad: 1, nGap: 2 }),
  wz('p6-5i-done', 'done', '分步建卡 ⑩ 检查后创建', '看一眼全貌，空着的知道去哪补', [[1, '待填清单', '跳过的步骤和没选完的选择都列在这里，[去填] 跳回那一步；不填也能创建', 'R04'], [2, '[创建伊娃]', '创建后直接打开人物页；创建算一条改动记录，可撤销', 'R25']], { nTodo: 1, nGo: 2 }),
  {
    id: 'p6-5j-building', group: G, title: '关掉建卡窗口之后：列表里的「建卡中」人物', flow: '中途离开（Changes in Midstream）', goal: '中途关掉不丢，回来接着建', primary: '[继续建卡]',
    patterns: 'Changes in Midstream', laws: 'Zeigarnik（没做完的事显眼地挂着）',
    notes: [[1, '建卡中', '不弹「要丢掉吗」；列表行带「建卡中 4 / 10」标签和 [继续建卡]，点开回到上次那一步', 'G28（后端待查）']],
    board: by({ '1440': () => ({ content: listPage({ body: `${memSec('随行', 1)}${mem({ name: '盖尔', en: 'Gale', cls: '法师', lv: '3 级', race: '人类', hp: [12, 18], temp: 3, ac: 12, pp: 11 })}${memSec('留守', 1)}${mem({ name: '伊娃', building: '4 / 10', n: 1 })}` }) }) }, { '1440': '960 窗口' }),
  },
]
