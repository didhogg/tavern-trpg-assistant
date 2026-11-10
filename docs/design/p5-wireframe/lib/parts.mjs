// 库页线框共用的组合件 + 示例数据。示例文字取自真实的中文官方解析结果（dump_cn：spell / book / adventure），
// 真实界面里这些字符串由作者函数（Parser）生成，线框只表达位置和层级。
import { badge, btn, count, icon, iconBtn, pills, seg, searchBox, table, term, pin, hint, embed, link, errorLine, infoLine } from './ui.mjs'

// ── 示例数据（真实数据，PHB 2014 中文） ──
export const SPELL_COLS = [{ label: '名称', sort: 'asc' }, '环阶', '时间', '学派', '专注', '范围', '来源']
export const SPELLS = [
  ['酸液飞溅', '戏法', '1 动作', '咒法', '', '60 尺', 'PHB'], ['援助术', '2 环', '1 动作', '防护', '', '30 尺', 'PHB'], ['警报术', '1 环', '1 分钟', '防护', '', '30 尺', 'PHB'],
  ['变身术', '2 环', '1 动作', '变化', '●', '自身', 'PHB'], ['化兽为友', '1 环', '1 动作', '惑控', '', '30 尺', 'PHB'], ['活化死尸', '3 环', '1 分钟', '死灵', '', '10 尺', 'PHB'],
  ['反魔法场', '8 环', '1 动作', '防护', '●', '自身（10 尺球）', 'PHB'], ['秘法眼', '4 环', '1 动作', '预言', '●', '30 尺', 'PHB'], ['侦测魔法', '1 环', '1 动作', '预言', '●', '自身', 'PHB'],
  ['火球术', '3 环', '1 动作', '塑能', '', '150 尺', 'PHB'], ['魔法飞弹', '1 环', '1 动作', '塑能', '', '120 尺', 'PHB'],
]
export const spellRows = (selName, extra = {}) => SPELLS.map((c) => ({ cells: c.map((v, i) => (i === 0 ? v : v)), sel: c[0] === selName, ...(extra[c[0]] ?? {}) }))
export const MARK_ALT = (n) => badge(`备选 ${n}`, 'primary')
export const MARK_OVR = badge('房规', 'warn')

export const GROUPS = [
  ['核心', [['玩家手册（2014）', 'PHB', '2014', true, '2014-08-19'], ['怪物手册（2014）', 'MM', '2014', true, '2014-09-30'], ['城主指南（2014）', 'DMG', '2014', false, '2014-12-09']]],
  ['设定', [['剑湾冒险者指南', 'SCAG', '2014', true, '2015-11-03']]],
]
export const ADVENTURES = [['凡戴尔的失落矿坑', 'LMoP', '1–5 级', '新手包', '2014-07-15', true], ['龙后的宝山', 'HotDQ', '1–7 级', '巨龙的僭政', '2014-08-19', false], ['提亚马特崛起', 'RoT', '8–15 级', '巨龙的僭政', '2014-11-04', false], ['毁灭亲王', 'PotA', '1–15 级', '邪恶元素', '2015-04-07', false]]
export const PHB_CATS = [['全部', null], ['法术', 361], ['职业', 12], ['子职业', 80], ['种族', 34], ['背景', 20], ['专长', 42], ['物品', 337], ['怪物', 5], ['表格', 43], ['规则', 13]]

// ── 库页外框 ──
/** 库页顶部：[书架|我的库|下载] + 全库搜索。tab 取 shelf | mine | download。 */
export function libTop(tab, { n, nSearch } = {}) {
  const items = [['书架', 'shelf'], ['我的库', 'mine'], ['下载', 'download']].map(([label, id]) => ({ label, on: id === tab }))
  return `<div class="lib-top">${seg(items, { n })}${searchBox('全库搜索…', nSearch)}</div>`
}
export const libPage = (inner) => `<div class="lib-page">${inner}</div>`

/** 条目详情壳（U1b）：← 上一条 │ 标题 [版本] │ En|中文 │ ✎ │ ✕。 */
export function detailHead({ title, sub = '', back = false, lang = ['En', '中文'], langOn = 1, langOff = null, edit = true, n = {} } = {}) {
  const items = lang.map((label, i) => ({ label, on: i === langOn, disabled: i === langOff }))
  return `<div class="lib-dhead">${back ? iconBtn('caret-left', '上一个条目', n.back) : ''}<div class="lib-dhead__title">${title}${sub ? `<small>${sub}</small>` : ''}</div>${seg(items, { n: n.lang })}${edit ? iconBtn('pencil-simple', '编辑', n.edit) : ''}${iconBtn('x', '关闭', n.close)}</div>`
}

/** 示例正文：火球术（法术块 U9a 的样子，只做壳的示意）。 */
export function spellBody({ ovr = false, alt = 0, n = {} } = {}) {
  return `${ovr ? infoLine('已被房规覆盖（生效处：本战役）', `${btn('解除', { small: true })}${btn('固定用原件', { small: true })}`, 'lib-banner--info') : ''}
<div class="lib-sumline"><span><b>3 环</b> 塑能</span><span>施法时间 <b>1 动作</b></span><span>范围 <b>150 尺</b></span><span>成分 <b>V、S、M</b>（一小球蝙蝠粪及硫磺）</span><span>持续时间 <b>立即</b></span></div>
<div class="lib-sumline"><span>可学职业：${term('术士')}、${term('法师')}</span></div>
<p>明亮的闪光从你的指间飞驰向施法距离内你指定的一点，并随着一声低吼迸成一片烈焰。目标点周围半径 20 尺球状区域内的每个生物必须进行一次敏捷豁免。豁免失败者将受到 ${term('8d6')} 点火焰伤害，豁免成功则伤害减半。</p>
<p>迸发的火焰将绕过拐角扩散。并点燃区域内所有未被着装或携带的可燃物件。</p>
<h3>升环施法</h3><p>使用四环或更高法术位施展该法术时，你使用的法术位每比三环高一环，其伤害就增加 ${term('1d6')}。</p>
${alt ? `<div class="lib-alt"><div class="lib-alt__row"><b>${n.alt ? pin(n.alt) : ''}此条有 ${alt} 个版本</b><span class="lib-end">${btn('选用其他版本', { small: true })}</span></div></div>` : ''}
<div class="lib-source">来源：玩家手册（2014）第 241 页 · PHB</div>`
}

export const splitView = (left, right, { cols = '' } = {}) => `<div class="lib-split"${cols ? ` data-cols="${cols}"` : ''}><div class="lib-listcol">${left}</div>${right ? `<div class="lib-detailcol">${right}</div>` : ''}</div>`
export { badge, btn, count, icon, iconBtn, pills, seg, table, term, pin, hint, embed, link, errorLine, infoLine }
