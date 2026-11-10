// 库页线框共用的组合件 + 示例数据（2026-11-10 按 R23–R91 重画）。示例文字取自真实的中文官方解析结果（spell / book / adventure），
// 真实界面里这些字符串由作者函数（Parser）生成，线框只表达位置和层级。
import { badge, btn, check, count, empty, gray, icon, iconBtn, infoLine, input, modal, pills, seg, sw, table, term, pin, hint, embed, link, errorLine } from './ui.mjs'

const P = (n) => (n ? pin(n) : '')

// ── 示例数据（真实数据，PHB 2014 中文）。列和可排序性在真实界面里由后端给（library.sorting.columns），这里只示意 ──
export const SPELL_COLS = [{ label: '名称', sort: 'asc', can: 1 }, { label: '环阶', can: 1 }, { label: '时间', can: 1 }, { label: '学派', can: 1 }, { label: '专注', can: 1 }, { label: '范围', can: 1 }, { label: '来源', can: 1 }]
const S = (t) => gray(t)
export const SPELLS = [
  ['酸液飞溅', '戏法', '1 动作', '咒法', '', '60 尺', S('PHB')], ['援助术', '2 环', '1 动作', '防护', '', '30 尺', S('PHB')], ['警报术', '1 环', '1 分钟', '防护', '', '30 尺', S('PHB')],
  ['变身术', '2 环', '1 动作', '变化', '●', '自身', S('PHB')], ['化兽为友', '1 环', '1 动作', '惑控', '', '30 尺', S('PHB')], ['活化死尸', '3 环', '1 分钟', '死灵', '', '10 尺', S('PHB')],
  ['反魔法场', '8 环', '1 动作', '防护', '●', '自身（10 尺球）', S('PHB')], ['秘法眼', '4 环', '1 动作', '预言', '●', '30 尺', S('PHB')], ['侦测魔法', '1 环', '1 动作', '预言', '●', '自身', S('PHB')],
  ['火球术', '3 环', '1 动作', '塑能', '', '150 尺', S('PHB')], ['魔法飞弹', '1 环', '1 动作', '塑能', '', '120 尺', S('PHB')],
]
export const ADVENTURES = [['凡戴尔的失落矿坑', 'LMoP', '1–5 级', '新手包', '2014-07-15', true], ['龙后的宝山', 'HotDQ', '1–7 级', '巨龙的僭政', '2014-08-19', false], ['提亚马特崛起', 'RoT', '8–15 级', '巨龙的僭政', '2014-11-04', false], ['毁灭亲王', 'PotA', '1–15 级', '邪恶元素', '2015-04-07', false]]
export const MARK_MOD = badge('已修改', 'warn')
export const MARK_VAR = (n) => badge(`变体 ${n}`, 'primary')
export const MARK_OFF = badge('已停用')
export const MARK_SAME = badge('同名', 'primary')

export const MIX_COLS = [{ label: '名称', sort: 'asc', can: 1 }, { label: '类别', can: 1 }, { label: '来源', can: 1 }]
export const MIX = [['酸液飞溅', '法术', 'PHB'], ['警觉', '专长', 'PHB'], ['龙裔', '种族', 'PHB'], ['火球术', '法术', 'PHB'], ['吟游诗人', '职业', 'PHB'], ['演员', '专长', 'PHB'], ['野蛮人', '职业', 'PHB'], ['魔法飞弹', '法术', 'PHB']]
export const mixRows = (sel = '火球术', extra = {}) => MIX.map(([n, c, s]) => ({ cells: [n, badge(c), S(s)], sel: n === sel, ...(extra[n] ?? {}) }))
export const PHB_CATS = [['全部', null], ['法术', 361], ['职业', 12], ['子职业', 80], ['种族', 34], ['背景', 20], ['专长', 42], ['物品', 337], ['怪物', 5], ['书', 1], ['表格', 43], ['规则', 13]]
export const catPills = (on = '全部') => pills(PHB_CATS.map(([l, c]) => [l, c, l === on]))

// ── 库页外框 ──
/** 库页顶部：[书架|我的库|下载] + 【全库数据搜索】按钮（R63）。tab 取 shelf | mine | download。 */
export function libTop(tab, { n, nSearch } = {}) {
  const items = [['书架', 'shelf'], ['我的库', 'mine'], ['下载', 'download']].map(([label, id]) => ({ label, on: id === tab }))
  return `<div class="lib-top">${seg(items, { n })}<span class="lib-end">${btn('全库数据搜索', { ic: 'magnifying-glass', n: nSearch })}</span></div>`
}
export const libPage = (inner) => `<div class="lib-page">${inner}</div>`

// ── 包 / 书 / 搜索 弹窗（宽：居中浮在整个插件窗口上；窄：底部抽屉）──
/** 包弹窗头：‹ 上一页标题 │ 书名 [版本] │ 开关 ━● │ ⋯ │ ✕。on=null 不显示开关。 */
export const packHead = ({ back = '书架', title, ver, on = true, more = true, n = {} } = {}) =>
  `<header class="trpg-modal__head">${back ? `<button class="trpg-modal__back" type="button">${P(n.back)}${icon('caret-left', 16)}<span>${back}</span></button>` : ''}<h2 class="trpg-modal__title">${P(n.title)}${title}${ver ? badge(ver) : ''}</h2>${on === null ? '' : `<span class="lib-headsw">${P(n.sw)}${sw(on)}</span>`}${more ? iconBtn('dots-three', '更多', n.more) : ''}${iconBtn('x', '关闭', n.close)}</header>`
/** 条目详情页弹窗头：‹ 上一页 │ 标题 │ ✕（工具行见 entryTools）。 */
export const entryHead = ({ back, title, n = {} } = {}) =>
  `<header class="trpg-modal__head">${back ? `<button class="trpg-modal__back" type="button">${P(n.back)}${icon('caret-left', 16)}<span>${back}</span></button>` : ''}<h2 class="trpg-modal__title">${P(n.title)}${title}</h2>${iconBtn('x', '关闭', n.close)}</header>`
/** 详情的工具行：En|中文（只是同一来源的语言切换）· 本战役启用开关（只在详情壳上，R38）· 已修改 + 复原 · ✎ · ⋯。 */
export function entryTools({ langOn = 1, langOff = null, on = true, mod = false, n = {} } = {}) {
  const items = ['En', '中文'].map((label, i) => ({ label, on: i === langOn, disabled: i === langOff }))
  return `<div class="lib-dtools">${seg(items, { n: n.lang })}<span class="trpg-switch-wrap">${P(n.sw)}${sw(on)}<span>本战役启用</span></span>${mod ? `${badge('已修改 / 覆盖', 'warn')}${btn('复原', { small: true, ic: 'arrow-counter-clockwise', n: n.restore })}` : ''}<span class="lib-end">${iconBtn('pencil-simple', '编辑（P5.5 才开放，现在点不了）', n.edit, { disabled: true })}${iconBtn('dots-three', '更多：存入我的库…', n.more)}</span></div>`
}
export const sheet = (head, body) => modal('sheet', head, body)
export const mbody = (inner) => `<div class="lib-mbody">${inner}</div>`
/** 列表页（弹窗里）：搜索 + 药丸（始终显示）+ 表格 + 计数。 */
export const mlist = ({ q = '', cats = '全部', cols, rows, total, ph = '搜索这本书里的条目', note = '' }) =>
  mbody(`<div class="lib-filter" style="padding-top:var(--sp-3)">${input(q, { placeholder: ph, ic: 'magnifying-glass' })}</div>${catPills(cats)}${note}${table(cols, rows)}${count(total)}`)
/** 详情页（弹窗里）：工具行 + 可滚动正文。 */
export const mdetail = (tools, body) => mbody(`${tools}<div class="lib-mscroll"><div class="lib-dbody" style="padding-bottom:var(--sp-5)">${body}</div></div>`)

/** 示例正文：火球术（法术块 U9a 的样子，只做壳的示意）。 */
export function spellBody({ n = {} } = {}) {
  return `<div class="lib-srcline">${P(n.src)}玩家手册（2014）· 第 241 页 · PHB</div>
<div class="lib-sumline"><span><b>3 环</b> 塑能</span><span>施法时间 <b>1 动作</b></span><span>范围 <b>150 尺</b></span><span>成分 <b>V、S、M</b>（一小球蝙蝠粪及硫磺）</span><span>持续时间 <b>立即</b></span></div>
<div class="lib-sumline"><span>可学职业：${term('术士')}、${term('法师')}</span></div>
<p>明亮的闪光从你的指间飞驰向施法距离内你指定的一点，并随着一声低吼迸成一片烈焰。目标点周围半径 20 尺球状区域内的每个生物必须进行一次敏捷豁免。豁免失败者将受到 ${term('8d6')} 点火焰伤害，豁免成功则伤害减半。</p>
<p>迸发的火焰将绕过拐角扩散。并点燃区域内所有未被着装或携带的可燃物件。</p>
<h3>升环施法</h3><p>使用四环或更高法术位施展该法术时，你使用的法术位每比三环高一环，其伤害就增加 ${term('1d6')}。</p>`
}

// ── 书架（U2）：官方 / 自制分开；搜索放在列表下方；核心 SRD 行；⋯ 里有管理 / 存入我的库 / 卸载 ──
const row = ({ name, badgeText, meta, on, off, action, n, menu, openMenu, note, locked, upd }) =>
  `<div class="trpg-shelf__row" data-off="${!!off}"><span class="lib-name">${P(n)}${name}</span>${badgeText ? badge(badgeText) : ''}${note ? `<span class="lib-rowmeta">${note}</span>` : ''}<span class="lib-rowmeta">${meta ?? ''}</span>${upd ? btn('更新', { small: true, n: upd }) : ''}${action ?? (locked ? `<span class="trpg-switch-wrap" title="核心规则不可关闭">${icon('lock', 14)}${sw(true)}</span>` : sw(on))}<span style="position:relative">${iconBtn('dots-three', '更多', menu)}${openMenu ? `<div class="trpg-dropdown" style="position:absolute;z-index:40;right:0;top:100%;width:200px"><div class="trpg-dropdown__item">管理</div><div class="trpg-dropdown__item">存入我的库</div><div class="trpg-dropdown__item trpg-dropdown__item--danger">卸载…</div></div>` : ''}</span></div>`
const group = (title, cnt, rows, { open = true } = {}) =>
  `<details class="trpg-shelf__group"${open ? ' open' : ''}><summary class="trpg-shelf__sum"><span class="trpg-shelf__chev-closed">${icon('caret-right', 16)}</span><span class="trpg-shelf__chev-open">${icon('caret-down', 16)}</span>${title}<small>${cnt}</small></summary>${rows}</details>`

/** 书架正文。nocampaign：无战役时全部显示关。upd：行上出现 [更新]（拉取更新之后）。 */
export function shelfBody({ nocampaign = false, pins = {}, upd = false, bulk = true, fold = false } = {}) {
  const on = (v) => (nocampaign ? false : v)
  return `<div class="lib-scroll"><div class="trpg-shelf lib-shelf" data-nocampaign="${nocampaign}" style="min-height:0;overflow:visible">
${nocampaign ? `<div style="padding:var(--sp-2) 0">${infoLine('先创建战役，开关才能用；所有书先显示为关。', btn('去首页', { small: true }), 'lib-banner--info')}</div>` : ''}<div class="lib-sec">${P(pins.off)}官方${bulk ? `<span class="lib-end">${btn('批量勾选…', { small: true, n: pins.bulk })}<span style="position:relative">${iconBtn('dots-three', '更多', pins.more)}${pins.moreOpen ? dropdown([['拉取更新'], ['刷新书目']], 160) : ''}</span></span>` : ''}</div>
${group('核心', '4 项', row({ name: '核心规则（随插件自带）', badgeText: 'SRD', meta: '不可关闭', locked: !nocampaign, on: false, off: nocampaign, n: pins.core }) + row({ name: '玩家手册（2014）', badgeText: '2014', meta: '2014-08-19', on: on(true), off: nocampaign, n: pins.row, menu: pins.menu, openMenu: pins.openMenu }) + row({ name: '怪物手册（2014）', badgeText: '2014', meta: '2014-09-30', on: on(true), off: nocampaign, upd: upd ? pins.upd : 0 }) + row({ name: '城主指南（2014）', badgeText: '2014', meta: '2014-12-09', on: false, off: true }))}
${group('设定', '1 本 · 2 冒险', row({ name: '剑湾冒险者指南', badgeText: '2014', meta: '2015-11-03', on: on(true), off: nocampaign }) + row({ name: '凡戴尔的失落矿坑（冒险）', meta: '1–5 级', on: on(true), off: nocampaign, n: pins.adv }) + row({ name: '龙后的宝山（冒险）', meta: '1–7 级', action: btn('下载', { small: true, n: pins.dl }) }), { open: !fold })}
${group('其他', '1 本', row({ name: '（识别不了分类的书）', badgeText: '其他', meta: '', on: on(true), off: nocampaign, n: pins.other }), { open: !fold })}
<div class="lib-sec">${P(pins.brewsec)}自制</div>
${group('Homebrew', '自制 · 2 个包', row({ name: '突袭夸巴斯（DMDave）', badgeText: '自制', meta: '', on: on(true), off: nocampaign, upd: upd ? pins.brewupd : 0 }) + row({ name: '某自制包（含 3 个来源）', badgeText: '自制', meta: '全开 / 全关', on: on(true), off: nocampaign, n: pins.brew }))}
<div class="lib-sbar">${P(pins.search)}${input('', { placeholder: '搜索书名或包名（跨分类文字匹配）', ic: 'magnifying-glass' })}</div>
</div></div>`
}
export const shelfPage = (o = {}) => libPage(`${libTop('shelf', { nSearch: o.pins?.gs })}${shelfBody(o)}`)

/** 三宽度各画不同内容时用：返回 board() 需要的函数。 */
export const dropdown = (items, w = 200) => `<div class="trpg-dropdown" style="position:absolute;z-index:40;right:0;top:100%;width:${w}px">${items.map(([t, danger]) => `<div class="trpg-dropdown__item${danger ? ' trpg-dropdown__item--danger' : ''}">${t}</div>`).join('')}</div>`
export { badge, btn, check, count, empty, gray, icon, iconBtn, infoLine, input, modal, pills, seg, sw, table, term, pin, hint, embed, link, errorLine }
