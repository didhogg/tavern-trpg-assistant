// 单元 1–9 的子界面（每个单元 = 一个主界面 + 它里面每个模块的抽屉 / 弹窗 / 菜单 / 选资料页）。
// 主界面在 detail.mjs；这里只放子界面。凡是标「待核对」的，是按 Tidy5e 的做法或需求推出、还没逐项对过源码，不当定论。
import { detail } from '../lib/sheet.mjs'
import * as O from '../lib/override.mjs'
import * as I from '../lib/items.mjs'
import { btn, icon, mdl, mh, P, step, dots } from '../lib/parts.mjs'
import { row, card as pcard, tabs, tools, pickPage, pickModal, foot } from '../lib/picker.mjs'
import { by } from '../lib/frame.mjs'

const U1 = '单元 1 · 角色表外壳（主界面 + 子界面）'
const U2 = '单元 2 · 行动（主界面 + 子界面）'
const U3 = '单元 3 · 属性（主界面 + 子界面）'
const U4 = '单元 4 · 背包（主界面 + 子界面）'
const U5 = '单元 5 · 法术（主界面 + 子界面）'
const U6 = '单元 6 · 特性（主界面 + 子界面）'
const U7 = '单元 7 · 效果（主界面 + 子界面）'
const U8 = '单元 8 · 背景（主界面 + 子界面）'
const U9 = '单元 9 · 日志（主界面 + 子界面）'
const on = (overlay, o = {}) => () => ({ noFab: true, content: detail(o), overlay })
const pg = (o) => () => ({ noFab: true, content: detail(o) })
const pg0 = () => ({})
const T = (tab, extra = {}) => ({ tab, tabsOnly: true, ...extra })
const mk = (id, group, title, flow, goal, primary, patterns, laws, notes, board, diff) => ({ id, group, title, flow, goal, primary, patterns, laws, notes, board, diff })

const ckb = (on2) => `<i class="sh-ckb" data-on="${!!on2}"></i>`
const lrow = (inner, o = {}) => `<div class="ovd-row"${o.man ? ' data-man="true"' : ''} style="grid-template-columns:24px 20px minmax(0,1fr) auto">${`<span style="color:var(--text3)">${icon('dots-six-vertical', 16)}</span>`}${ckb(o.on)}<div class="ov-itm"><b>${inner}</b>${o.sub ? `<small>${o.sub}</small>` : ''}</div>${o.right ?? ''}</div>`
const modal = (title, body, actions, o = {}) => mdl(o.kind ?? 'confirm', mh(title, { n: o.n }), `<div class="ovd">${o.sub ? `<p class="ovd-sub">${o.sub}</p>` : ''}${body}<div class="ovd-foot">${o.left ?? ''}<span style="flex:1"></span>${actions}</div></div>`)

/* ---------- 新增的小窗 ---------- */
const colsModal = modal('配置列：行动', [['次数', 1], ['命中 / DC', 1], ['伤害 / 效果', 1], ['距离', 0], ['施放时间', 0]].map(([t, v]) => lrow(t, { on: v })).join(''), `${btn('取消')}${btn('完成', { primary: true })}`, { sub: '勾选要显示的列、拖手柄排顺序。只改这一页的显示，不改人物数据。窄屏自动少显示几列。', left: btn('恢复默认'), n: 1 })
const groupModal = modal('分组设置：背包', [['武器', 1, '按物品类型'], ['装备', 1, '按物品类型'], ['消耗品', 1, '按物品类型'], ['工具', 1, '按物品类型'], ['容器', 1, '按物品类型'], ['杂物', 0, '空组默认不显示'], ['药水柜（自定义）', 1, '自己建的分组']].map(([t, v, s], i) => lrow(t, { on: v, sub: s, right: i === 6 ? btn('重命名', { small: true }) : '' })).join('') + `<div style="padding:12px 0 16px">${btn('新建分组', { small: true, ic: 'plus' })}</div>`, `${btn('取消')}${btn('完成', { primary: true })}`, { sub: '分组 = 物品类型（Tidy5e 的做法）；可以隐藏空组、排顺序、自己加分组再把物品拖进去。', n: 1 })
const castModal = modal('施放：魔法飞弹', `<div class="ovd-grp"><h4>用哪一环的法术位</h4>${[['1 环', '2 / 4 剩', 1, '3 道飞镖'], ['2 环', '1 / 2 剩', 0, '4 道飞镖'], ['3 环', '0 / 0', 0, '没有法术位']].map(([a, b, v, c2], i) => `<div class="ovd-row" style="grid-template-columns:24px minmax(0,1fr) auto"><span><i class="sh-eq" data-on="${!!v}"></i></span><div class="ov-itm"><b>${a}</b><small>${c2}</small></div><span class="sh-2">${b}</span></div>`).join('')}</div>`, `${btn('取消')}${btn('施放（用掉 1 格）', { primary: true })}`, { sub: '升环施放：选更高的环，内核算出多出的效果；确定后扣一格、命中 / 伤害送去骰盘。', n: 1 })
const inp = (t) => `<span class="sh-in" style="height:34px;font-size:var(--fs-md);padding:0 10px">${t}</span>`
const fld = (l, t) => `<div style="display:grid;gap:4px"><small class="sh-2">${l}</small>${inp(t)}</div>`
const effForm = modal('新建效果', `<div class="ovd-grp"><h4>基本</h4><div style="display:grid;gap:10px;padding:12px">${fld('名字', '祝福')}${fld('持续', '10 回合')}</div></div><div class="ovd-grp"><h4>改变数值</h4><div style="display:grid;gap:10px;padding:12px"><div style="display:grid;grid-template-columns:minmax(0,1fr) 84px 72px 32px;gap:8px;align-items:center">${inp('攻击加值')}${inp('加上')}${inp('1d4')}<button class="sh-more" type="button">${icon('trash', 16)}</button></div><div>${btn('加一条', { small: true, ic: 'plus' })}</div></div></div>`, `${btn('取消')}${btn('保存效果', { primary: true })}`, { sub: '字段由「效果」的数据结构生成，不手写；这里只示意分组（基本 · 持续 · 改变数值），具体字段、键的选项待查数据后填。', n: 1 })

/* ---------- 选资料两栏页（加物品 / 加法术 / 加特性）：和建卡、模板共用 picker ---------- */
const PK = {
  item: { title: '加物品', ph: '搜 物品', tabs: [['物品', 128], ['我的库', 3]], rows: [{ ch: '匕', name: '匕首', sub: '简易近战 · 1 磅', src: '5e 2014' }, { ch: '剑', name: '长剑', sub: '军用近战 · 3 磅', src: '5e 2014' }, { ch: '药', name: '治疗药水', sub: '消耗品 · 1 磅', src: '5e 2014' }, { ch: '金', name: '金币 (gp)', sub: '钱币 · 0.02 磅', src: '5e 2014' }], card: { ch: '药', name: '治疗药水', sub: '消耗品 · 稀有度 普通', tags: ['消耗品'], src: '5e 2014', stats: [['重量', '1 磅'], ['价格', '50 gp']], secs: [['说明', '喝下后恢复 2d4+2 点生命。']] }, add: '加入背包' },
  spell: { title: '加法术', ph: '搜 法术', tabs: [['法术', 520], ['我的库', 0]], rows: [{ ch: '火', name: '火球术', sub: '3 环 · 塑能', src: '5e 2014' }, { ch: '魔', name: '魔法飞弹', sub: '1 环 · 塑能', src: '5e 2014' }, { ch: '隐', name: '隐形术', sub: '2 环 · 幻术', src: '5e 2014' }], card: { ch: '火', name: '火球术', sub: '3 环 · 塑能', tags: ['法师'], src: '5e 2014', stats: [['施放', '动作'], ['距离', '150 尺'], ['持续', '立即']], secs: [['说明', '一团火焰在射程内爆开，20 尺半径内敏捷豁免，失败受 8d6 火焰伤害。']] }, add: '加入法术书' },
  feat: { title: '加特性', ph: '搜 特性', tabs: [['特性', 340], ['专长', 52]], rows: [{ ch: '警', name: '警觉', sub: '专长', src: '5e 2014' }, { ch: '幸', name: '幸运', sub: '专长', src: '5e 2014' }, { ch: '奥', name: '奥术恢复', sub: '法师 1 级', src: '5e 2014' }], card: { ch: '警', name: '警觉', sub: '专长', tags: ['专长'], src: '5e 2014', secs: [['说明', '先攻 +5；不会被偷袭。']] }, add: '加入特性' },
}
const pickOverlay = (k, view = 'both') => {
  const p = PK[k]
  const list = p.rows.map((r, i) => row({ ...r, sel: i === (k === 'item' ? 2 : 0) })).join('')
  const cardH = pcard({ ...p.card, n: 0 })
  const fh = foot(`${btn('取消')}<span class="pk-foot__sp"></span>${k === 'item' ? step(1) : ''}${btn(p.add, { primary: true })}`)
  return pickModal(p.title, '', view === 'card' ? pickPage({ view, card: cardH, footHtml: fh }) : pickPage({ view, top: `${tabs(p.tabs)}${tools(p.ph, p.rows.length)}`, list, card: cardH, footHtml: view === 'both' ? fh : undefined }), { view, n: 1 })
}
const pickFrames = (k, tab) => by({
  '1440': on(pickOverlay(k), T(tab)), '390': on(pickOverlay(k, 'list'), T(tab)), '390b': on(pickOverlay(k, 'card'), T(tab)),
}, { '1440': '960：两栏（左列表 · 右资料卡）', '390': '窄屏：列表页', '390b': '窄屏：点一项后的资料卡页（‹ 列表 返回）' })
const PKN = (what, src) => [[1, '选资料页', `和建卡、套用模板是同一个两栏页：搜索 + 来源标签，左列表右资料卡，窄屏变页面跳转；资料来自库（作者加载器），不手写条目；${what}`, src]]

/* ---------- 屏幕 ---------- */
export const screens = [
  mk('u1-id', U1, '外壳子界面 · 身份 · 种族 · 背景（直接填写 + 来源条目）', '页头名字行 ✎（R14 R19 R22）', '改名字、阵营；看种族和背景到底给了什么', '[保存]', 'Hub drawer → 子抽屉 · 来源条目', 'Hick（一个抽屉一类事）· Tesler',
    [[1, '身份抽屉（入口）', '上半「直接填写」：名字 · 英文名 · 阵营——普通表单，没有 [自动|手动]。下半「由规则结算」：种族 · 背景 · 体型与类型 · 速度 · 感官，每行一个 › 点进去是它自己的抽屉（一次只开一个，返回回到身份抽屉）', '驾驶员 11-15 · T:config 窗口'],
      [2, '种族抽屉', '顶上结果「种族 人类（来源：建卡第 ② 步）」+ [更换种族…]（打开选资料页，换完重新分配）；下面「种族给的内容」一条一条：体型 · 速度 · 属性加成 · 语言 · 感官…，每条写明是种族给的；× 删、[＋ 添加条目] 手动补（来源「手动」）；删掉的在「已移除」里 [重新分配]', 'R04 R22 · 具体条目取决于种族数据，待核对'],
      [3, '背景抽屉', '同种族：技能熟练 · 工具熟练 · 语言 · 起始专长（2024 规则）…，来源「背景·学者」', 'R04 R22 · 待核对']],
    by({ '1440': on(O.idDrawer({ nRow: 1, nLink: 1 }), pg0()), '900': on(O.speciesDrawer({ nRow: 2 }), pg0()), '390': on(O.bgDrawer({ nRow: 3 }), pg0()) }, { '1440': '960：身份（上半直接填写，下半点进去）', '900': '868：种族来源条目', '390': '窄屏：背景来源条目' })),
  mk('u1-id2', U1, '外壳子界面 · 体型与生物类型 · 速度 · 感官（来源条目）', '身份抽屉 › 进去（R22）', '看速度 / 感官 / 体型是哪来的，加删条目', '[保存]', '来源条目', 'Tesler · Safe Exploration',
    [[1, '体型与生物类型', '体型和类型一般种族给；变形、法术或主持人裁定时手动加一条（来源「效果·变巨术」「手动」），原来的随时重新分配', 'R22 · Tidy5e creatureType / size 配置'], [2, '速度', '步行 / 其他速度各一组：基础 + 效果加值，每条有来源；飞行等其他速度用 [添加速度]', 'T:movement 配置 · R22'], [3, '感官', '黑暗视觉、盲视等：距离 + 来源；× 删、[＋ 添加感官]；已移除可重新分配', 'T:senses 配置 · R22']],
    by({ '1440': on(O.bodyDrawer({ nRow: 1 }), pg0()), '900': on(O.speedDrawer({ nRow: 2 }), pg0()), '390': on(O.sensesDrawer({ nRow: 3 }), pg0()) }, { '1440': '960：体型与类型', '900': '868：速度', '390': '窄屏：感官' })),
  mk('u1-dice', U1, '外壳子界面 · 生命骰 · 力竭 · 死亡豁免（改数量 / 掷骰的抽屉）', '页头生命区三个文字按钮（R17）', '花生命骰、记力竭、处理濒死', '[掷] / [完成]', 'Small modal · 掷骰面板', 'Doherty（掷完立刻给结果）· Fitts（骰子按钮够大）· Postel',
    [[1, '入口', '生命区下面三个**文字按钮**：生命骰 3/3 · 力竭 2 级 · 死亡豁免（0 血时变红框并显示「成功 1 · 失败 0」）。**点开都是抽屉，不在页头原地改，不画骷髅 / 小图标**（驾驶员 11-15）', 'R17 · T:HitDiceConfig / ExhaustionToggle / DeathSavesOverlay（Tidy5e 用小图标，已否决）'],
      [2, '生命骰抽屉', '剩余 3/3（− ＋ 改数量）· 一种面数一行（多职业有多行）· [掷 d6]：结果「掷出 4 + 体质 1 = 5　生命 12 → 17 / 18」带 [撤销这次][确认恢复] · 或「不掷，直接记录」填花几颗、恢复多少', 'R17 R23 · 总数 = 职业等级，在 [等级管理] 里变'],
      [3, '力竭抽屉', '等级 − ＋ 改，或点下面 0–6 级的任一行直接设；每级写明惩罚；6 级 = 死亡。**用哪套规则（2024：d20 检定 −2×级；2014：六档）取决于库，待核对**', 'T:ActorExhaustionBar · 规则版本待核对'],
      [4, '死亡豁免抽屉', '状态行「濒死」；成功 / 失败各三个**带数字的圆点**，点哪个就设成几；[掷死亡豁免]（天然 1 = 2 次失败，天然 20 = 回 1 点生命）；其他：受到伤害失败 +1 · 被重击 +2 · 稳定伤势 · 重置', 'T:DeathSavesOverlay 规则 · R17']],
    by({ '1440': on(O.hdDrawer({ nRow: 2, nRoll: 3 })), '900': on(O.exhDrawer({ nRow: 4 })), '390': on(O.deathDrawer({ nRoll: 5 })), mid: pg({ dying: true, nDeath: 1 }) }, { '1440': '960：生命骰（刚掷了一颗）', '900': '868：力竭', '390': '窄屏：死亡豁免（刚掷了一次）', mid: '600：0 血时页头的「死亡豁免」按钮' })),
  mk('u1-top-side', U1, '外壳子界面 · 应用条 ⋯ 菜单 · 侧栏「收藏」', '存库 · 复制 · 删除；常用条目置顶', '应用条的更多操作；侧栏第二个标签「收藏」', '⋯ ▸ 存入我的库', 'Overflow menu · Tabs', 'Miller · Hick',
    [[1, '⋯ 菜单', '存入我的库…（先预览）· 复制一份 · 移到 ▸ NPC / 敌人 · 删除（先确认、可撤销）', 'R05 R07 R25'], [2, '侧栏收藏', '行里 ⋯ ▸ 置顶到收藏 的条目显示在这里；点一下 = 掷 / 用；✎ 整理收藏', 'T:CharacterSidebar favorites（收藏内容待核对）']],
    by({ '1440': pg({ topMenu: true }), full: pg({ fav: true }), '390': pg({ topMenu: true, tabsOnly: true }) }, { '1440': '960：应用条 ⋯ 展开', full: '全屏：侧栏「收藏」（窗口较窄时侧栏自动折叠）', '390': '窄屏：⋯ 菜单' })),

  mk('u2-menus', U2, '行动 · 子界面 · 筛选 / 排序菜单 · 行 ⋯ 菜单 · 行内展开', '找一项 · 看说明 · 对一行做事', '把行动表缩小到想要的，或对一行操作', '行 ⋯', 'Dropdown menus · List Inlay', 'Hick · Fitts',
    [[1, '筛选菜单', '勾选项 + 图钉（常用的置顶到操作栏）；选项由数据给', 'T:ItemsActionBar filter'], [2, '排序菜单', '名称 / 手动顺序 / 类别', 'T:ItemsActionBar sort'], [3, '行 ⋯ 菜单', '编辑条目 · 置顶到收藏 · 复制 · 删除（编辑 / 删除走和库同一套新建编辑删除撤销）', 'T:ItemRow menu · 不另开入口'], [4, '行内展开', '点行展开说明与标签药丸，再点收起', 'T:expand']],
    by({ '1440': pg(T('action', { menu: 'filter' })), '900': pg(T('action', { menu: 'sort' })), '390': pg(T('action', { rowMenu: true })) }, { '1440': '960：筛选菜单', '900': '868：排序菜单', '390': '窄屏：行 ⋯ 菜单' })),
  mk('u2-cols', U2, '行动 · 子界面 · 配置列', '改这一页显示哪些列', '勾列、排序', '[完成]', 'Modal · Reorder list', 'Hick · Postel',
    [[1, '配置列窗口', '列清单（次数 / 命中 / 伤害 / 距离 / 施放时间）勾选 + 拖动排序；[恢复默认]。只改显示，不改数据', 'T:ColumnsDialog（列的具体清单待核对）']],
    by({ '1440': on(colsModal, T('action')), '390': on(colsModal, T('action')) }, { '1440': '960', '390': '窄屏：底部抽屉' })),

  mk('u3-drawers', U3, '属性 · 子界面 · 豁免熟练抽屉 · 工具熟练抽屉（技能 / 特质抽屉见 p6-13e）', '改豁免与工具熟练', '平时只读，进抽屉才改', '[保存]', 'Small modal per module', 'Safe Exploration',
    [[1, '豁免抽屉', '豁免熟练条目：职业给的两项 + 手动补的（来源标签）；× 删、[添加豁免熟练]、已移除可重新分配；各项豁免的额外加值也是条目', 'T:SavingThrowsCard config'], [2, '工具熟练抽屉', '工具熟练条目（书法家工具 · 来源背景；盗贼工具 · 手动）；工具物品在背包「工具」', 'T:ToolsCard config · R22']],
    by({ '1440': on(O.saveDrawer({ nRow: 1 }), T('attr')), '900': on(O.toolDrawer({ nRow: 2 }), T('attr')), '390': on(O.saveDrawer({}), T('attr')) }, { '1440': '960：豁免', '900': '868：工具熟练', '390': '窄屏：豁免' })),

  mk('u4-menus', U4, '背包 · 子界面 · 行 ⋯ 菜单 · 行内展开 · 筛选 / 排序', '装备 / 调谐 / 移进容器 / 删除', '对一个物品操作', '装备开关', 'Dropdown menus', 'Fitts · Hick',
    [[1, '行 ⋯ 菜单', '卸下 · 调谐 · 移进容器… · 编辑条目 · 置顶 · 复制 · 删除', 'T:InventoryRow menu'], [2, '行内展开', '展开说明、药丸标签', 'T:expand'], [3, '筛选 / 排序', '同行动页', 'T:ItemsActionBar']],
    by({ '1440': pg(T('bag', { rowMenu: true })), '900': pg(T('bag', { expand: true })), '390': pg(T('bag', { menu: 'filter' })) }, { '1440': '960：行 ⋯ 菜单（武器的菜单；每种物品的菜单项不同）', '900': '868：行内展开', '390': '窄屏：筛选' })),
  mk('u4-kinds', U4, '背包 · 子界面 · 物品类型对照：每种物品的状态标签与专用按钮', '各种物品在行上长什么样、能点什么', '武器、护甲、魔法物品、充能物品、消耗品、工具、容器各有自己的标签和按钮', '各类型的专用按钮', 'Per-type row controls · Status tags', 'Jakob（Tidy5e / D&D Beyond 的行按钮）· Fitts · Miller',
    [[1, '分类原则', '按物品**类型**决定行上出什么；所有物品共有的（数量、重量、稀有度、鉴定、调谐）都在；类型专有的才出专用按钮', 'dnd5e 6.1 物品数据 · Tidy5e EquipButton / AttuneButton / 次数列'], [2, '状态标签', '小字药丸放在名字下面：已装备（深色）· 魔法 / 稀有度（金边）· 需调谐 / 未鉴定 / 隐匿劣势 / 力量不够（红边）· 其余灰色', 'R18'], [3, '专用按钮', '一行最多一个：装备 / 卸下 · 穿上 / 脱下 · 调谐 · 使用… · 施放… · 检定 · 选为弹药 · 折叠；点开是弹窗，不在行里原地做大改动', 'R18'], [4, '字段来源', '右列是 dnd5e 6.1 的字段名；具体选项（武器属性、装备类型…）由库的数据给，不手写。**表里的标签与按钮清单待你核对**', '待核对']],
    () => I.kindsTable()),
  mk('u4-dialogs', U4, '背包 · 子界面 · 使用消耗品弹窗 · 充能次数抽屉 · 武器字段 · 装备字段', '用药水、改次数、改武器字段', '[使用…] 弹窗掷骰并扣数量；充能物品改已用次数；武器 / 装备编辑必要字段', '[确认使用] / [保存]', 'Modal · Small drawer · 表单', 'Postel · Doherty · Safe Exploration',
    [[1, '使用消耗品弹窗', '[使用…] 打开：对谁使用 · 效果骰 [掷骰] · 结果预览（「生命 12 → 18 / 18，只恢复 6」）· 数量 2 → 1；可勾「用完自动删除」；[确认使用] 才扣数量、改生命，一条改动记录', 'dnd5e consumable.uses / autoDestroy'],
      [2, '充能次数抽屉', '已用 − ＋（状态，直接改）· [重置为满] · 最大次数（来源条目）· 恢复时机与恢复量（黎明 / 长休 / 短休；公式）', 'uses.spent / max / recovery'],
      [3, '武器字段', '基本（名字 · 类型 · 基础武器）· 伤害（骰 · 类型 · 双手伤害 · 魔法加值）· 射程 · 武器属性药丸（多选）· 精通 · 弹药类型 · 熟练按职业自动判断。**改的是这个人物手上的一件，库里原条目不变，可恢复**', 'weapon.* · 库编辑口径（可覆盖、官方可复原）'],
      [4, '装备字段', '装备类型 · AC 基础值 · 魔法加值 · 敏捷加值上限 · 力量需求 · 隐匿劣势 · 调谐', 'equipment.armor.* · strength · properties'],
      [5, '工具 / 容器', '工具：默认属性、额外加值；容器：容量（数量 / 重量 / 体积）、里面的东西是否算负重（见源码字段，待核对）', 'tool.* · container.capacity']],
    by({ '1440': on(I.useDialog({ nTitle: 1, nRoll: 2, nOk: 3 }), T('bag')), '900': on(I.chargeDrawer({ nRow: 4 }), T('bag')), '390': on(I.weaponForm({ nRow: 5 }), T('bag')), mid: on(I.armorForm({}), T('bag')) }, { '1440': '960：使用治疗药水（刚掷了骰）', '900': '868：充能物品 · 编辑次数', '390': '窄屏：编辑武器', mid: '600：编辑装备' })),
  mk('u4-pick', U4, '背包 · 子界面 · 加物品（选资料页）', '从库里加物品', '选一条、设数量、加入', '[加入背包]', 'Two-pane picker', 'Jakob（同建卡）· Hick',
    [...PKN('钱币也是物品，在这里搜金币加；自制物品走库的「新建」，不在这里另开。', 'R18 · 不另开入口'), [2, '数量', '底栏步进器，默认 1', 'R18']], pickFrames('item', 'bag')),
  mk('u4-enc', U4, '背包 · 子界面 · 负重 / 调谐抽屉 · 分组设置', '改上限 · 整理分组', '看负重 / 调谐上限的来源条目；隐藏 / 排序 / 自建分组', '[保存] / [完成]', 'Modal', 'Tesler · Safe Exploration',
    [[1, '负重抽屉', '负重上限、调谐上限各一组来源条目（力量 × 15 · 手动加值）', 'T:Encumbrance config · R22'], [2, '分组设置', '勾选显示、拖动排序、新建 / 重命名自定义分组', 'T:SectionSelector（待核对）']],
    by({ '1440': on(O.encDrawer({ nRow: 1 }), T('bag')), '900': on(groupModal, T('bag')), '390': on(groupModal, T('bag')) }, { '1440': '960：负重与调谐', '900': '868：分组设置', '390': '窄屏：分组设置' })),

  mk('u5-menus', U5, '法术 · 子界面 · 行 ⋯ 菜单 · 行内展开 · 筛选', '准备 / 取消准备 / 看说明', '对一条法术操作', '准备圆点', 'Dropdown menus', 'Hick · Fitts',
    [[1, '行 ⋯ 菜单', '取消准备 · 编辑条目 · 置顶 · 删除', 'T:SpellRow menu'], [2, '行内展开', '距离、成分、说明、药丸', 'T:expand']],
    by({ '1440': pg(T('spell', { rowMenu: true })), '900': pg(T('spell', { expand: true })), '390': pg(T('spell', { menu: 'filter' })) }, { '1440': '960：行 ⋯ 菜单', '900': '868：行内展开', '390': '窄屏：筛选' })),
  mk('u5-pick', U5, '法术 · 子界面 · 加法术（选资料页）', '把法术加进法术书', '搜、选、加入', '[加入法术书]', 'Two-pane picker', 'Jakob',
    PKN('能不能加、算已准备还是已知由内核判断。', 'R15'), pickFrames('spell', 'spell')),
  mk('u5-slots', U5, '法术 · 子界面 · 法术位抽屉 · 施法摘要抽屉 · 施放选环位', '改上限 · 施放时选环', '每环上限、施法属性 / DC / 攻击；施放时选用哪一环', '[施放]', 'Modal', 'Tesler · Safe Exploration',
    [[1, '法术位抽屉', '每环上限的来源条目（职业等级表 + 手动）；已用格子在法术页点圆点（状态，直接改）', 'R17 R22'], [2, '施法摘要抽屉', '施法属性、DC、攻击、可准备数，各自的来源条目', 'T:SpellcastingClassSummaryCard'], [3, '施放选环位', '升环施放：选环、看多出的效果，确定扣一格', 'dnd5e 施放对话框（待核对）']],
    by({ '1440': on(O.slotDrawer({ nRow: 1 }), T('spell')), '900': on(O.spDrawer({ nRow: 2 }), T('spell')), '390': on(castModal, T('spell')) }, { '1440': '960：法术位', '900': '868：施法摘要', '390': '窄屏：施放选环位' })),

  mk('u6-menus', U6, '特性 · 子界面 · 行 ⋯ 菜单 · 行内展开 · 次数抽屉', '看说明 · 改次数', '对一个特性操作', '次数圆点', 'Dropdown · Small modal', 'Hick',
    [[1, '行 ⋯ 菜单', '编辑条目 · 置顶 · 删除', 'T:FeatureRow menu'], [2, '行内展开', '说明与药丸', 'T:expand'], [3, '次数抽屉', '已用（直接改的状态）· 最大次数（来源条目）· 恢复方式（下拉）', 'R22']],
    by({ '1440': pg(T('feat', { rowMenu: true })), '900': pg(T('feat', { expand: true })), '390': on(O.usesDrawer({ nRow: 3 }), T('feat')) }, { '1440': '960：行 ⋯', '900': '868：展开', '390': '窄屏：次数抽屉' })),
  mk('u6-pick', U6, '特性 · 子界面 · 加特性 / 专长（选资料页）', '加一条特性或专长', '搜、选、加入', '[加入特性]', 'Two-pane picker', 'Jakob',
    PKN('特性来自库；建卡里选的专长自动出现，这里只用于手动补加。', 'R04'), pickFrames('feat', 'feat')),

  mk('u7-menus', U7, '效果 · 子界面 · 行 ⋯ 菜单 · 行内展开', '开关效果 · 看说明', '对一个效果操作', '开关', 'Dropdown', 'Hick',
    [[1, '行 ⋯ 菜单', '编辑效果… · 停用 · 删除', 'T:EffectRow menu'], [2, '行内展开', '效果说明、来源', 'T:expand']],
    by({ '1440': pg(T('effect', { rowMenu: true })), '390': pg(T('effect', { expand: true })) }, { '1440': '960：行 ⋯', '390': '窄屏：展开' })),
  mk('u7-form', U7, '效果 · 子界面 · 效果表单', '新建 / 编辑一个效果', '填名字、持续、改哪些数值', '[保存效果]', 'Form modal', 'Postel',
    [[1, '效果表单', '基本 · 持续 · 改变数值；字段由数据结构生成，不手写（此处只示意分组）', 'R21（具体字段待查数据）']],
    by({ '1440': on(effForm, T('effect')), '390': on(effForm, T('effect')) }, { '1440': '960', '390': '窄屏：底部抽屉' })),

  mk('u8-edit', U8, '背景 · 子界面 · 原地编辑文本 · 特征抽屉', '写设定', '改外貌 / 传记 / 性格…', '卡里的 ✎', 'In-place edit', 'Safe Exploration',
    [[1, '原地编辑', '点卡上 ✎，卡内文本变输入区；[取消][保存]（算设定草稿）', 'R24'], [2, '特征抽屉', '只有 性别、信仰 两项', '驾驶员 11-15']],
    by({ '1440': pg(T('bio', { bioEdit: true })), '900': on(O.feaDrawer({ nRow: 2 }), T('bio')), '390': pg(T('bio', { bioEdit: true })) }, { '1440': '960：外貌在编辑', '900': '868：特征抽屉', '390': '窄屏：编辑' })),
  mk('u9-states', U9, '日志 · 子界面 · 新页 · 页菜单 · 正文编辑', '记一页日志', '新建、重命名、删除、写正文', '[新页]', 'List + editor', 'Doherty',
    [[1, '新页', '列表顶部多一行输入名字', 'T:ActorJournalTab'], [2, '页 ⋯ 菜单', '重命名 · 删除（先确认）', '待核对'], [3, '正文编辑', '同背景的原地编辑', '同单元 8']],
    by({ '1440': pg(T('note', { jNew: true })), '900': pg(T('note', { jMenu: true })), '390': pg(T('note', { jEdit: true })) }, { '1440': '960：新页', '900': '868：页菜单', '390': '窄屏：编辑正文' })),
]
