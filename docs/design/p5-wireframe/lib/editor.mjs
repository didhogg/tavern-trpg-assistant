// P5.5 编辑器线框共用的零件（u7c 起点 / 预览、u7d 双语编辑器 / 房规 / 覆盖管理）。
// 字段、控件种类、中文名、下拉中文选项来自后端字段表（custom.fields：shape + label + labels）；这里的值是示例。
import { badge, btn, icon, iconBtn, input, libPage, libTop, mbody, pin } from './parts.mjs'

export const P = (n) => (n ? pin(n) : '')
export const bg = () => ({ page: 'library', flush: true, content: libPage(`${libTop('mine')}<div class="lib-scroll"></div>`) })
export const head = (back, title) => `<header class="trpg-modal__head"><button class="trpg-modal__back" type="button">${icon('caret-left', 16)}<span>${back}</span></button><h2 class="trpg-modal__title">${title}</h2>${iconBtn('x', '关闭')}</header>`
export const sel = (t, w) => `<button type="button" class="trpg-select-trigger"${w ? ` style="width:${w}px;flex:none"` : ''}><span>${t}</span>${icon('caret-down', 14)}</button>`
export const ck = (t, on) => `<span class="trpg-check" data-on="${on}"><span class="trpg-check__box">${on ? icon('check', 12) : ''}</span>${t}</span>`
export const num = (v) => input(v).replace('class="trpg-input"', 'class="trpg-input lib-num"')
/** 字段名。en：作者没有中文名、显示英文原名；other：旁边的 (En) 小标（另一语言有值时才有）；mark：与另一语言 / 原件不一样时的小标。 */
export const lab = (t, { req, en, n, other, mark, pop } = {}) => `<label${en ? ' data-en="true"' : ''}>${P(n)}<span class="lib-lname">${t}${req ? '<small>*</small>' : ''}${icon('info', 13)}</span>${other ? `<span class="lib-other"${pop ? ' data-on="true"' : ''}>${other}</span>` : ''}${mark ? `<span class="lib-mark">${mark}</span>` : ''}</label>`
export const bar = (inner) => `<div class="lib-ebar">${inner}</div>`

// 作者渲染的法术块（示意；真实由作者渲染器画）
export const spellRender = (name = '火焰鹦鹉', sub = '1 环 塑能', range = '150 尺') => `<div class="lib-dbody" style="padding:0"><h3 style="margin:0">${name}</h3><p class="lib-muted" style="margin:2px 0 8px">${sub}</p><p style="margin:0"><b>施法时间</b> 1 动作<br><b>射程</b> ${range}<br><b>成分</b> 言语、姿势<br><b>持续时间</b> 立即</p><p>一团燃烧的羽毛从你指尖飞出，命中射程内一个你能看见的生物……</p><p>被命中的生物进行一次敏捷豁免，失败受到 <span class="lib-tag">3d6</span> 火焰伤害。</p></div>`

// 代码编辑框（CodeMirror 6 基础件，§8.1）
const cmLine = (no, code, err = false) => `<div class="lib-cm__line"${err ? ' data-err="true"' : ''}><i>${err ? '●' : ''}</i><small>${no}</small><span>${code}</span></div>`
export const cm = ({ pop = false, err = true, short = false } = {}) => `<div class="lib-cm">${[
  cmLine(1, '{'),
  cmLine(2, '  <b>"name"</b>: "火焰鹦鹉",'),
  cmLine(3, `  <b>"level"</b>: ${err ? '<u>12</u>' : '1'},`, err),
  cmLine(4, '  <b>"school"</b>: "V",'),
  cmLine(5, '  <b>"time"</b>: [{ <b>"number"</b>: 1, <b>"unit"</b>: "action" }],'),
  cmLine(6, err ? '  <b>"ra</b>' : '  <b>"range"</b>: { <b>"type"</b>: "point", … },'),
  ...(short ? [] : [cmLine(7, '  <b>"entries"</b>: ['), cmLine(8, '    "一团燃烧的羽毛从你指尖飞出……"'), cmLine(9, '  ]')]),
  cmLine(short ? 7 : 10, '}'),
].join('')}${pop ? '<div class="lib-cm__pop"><div data-on="true"><span>range</span><span class="lib-faint">范围</span></div><div><span>races</span><span class="lib-faint">种族</span></div><div><span>reprintedAs</span><span class="lib-faint"></span></div></div>' : ''}</div>`

/**
 * 法术表单。o.lang = 'zh' | 'en'（编辑哪一边）；o.other = 另一语言有这一条（字段旁出 (En)/(中) 小标）；
 * o.house = 改官方条目（字段旁标「改过」）；o.pop = 打开浮窗的字段名；o.empty = 另一边还没有这一条（空表单）。
 */
export function spellForm(L, o = {}) {
  const { lang = 'zh', other = false, house = false, pop = null, empty = false, n = {} } = o
  const zh = lang === 'zh'
  const tag = other ? (zh ? 'En' : '中') : null
  const fx = (k, extra = {}) => ({ other: tag, pop: pop === k, ...extra })
  const v = (zhVal, enVal) => (empty ? '' : zh ? zhVal : enVal)
  const popHtml = (k, val) => (pop === k ? `<div class="lib-pop">${P(n.pop)}<div class="lib-pop__head">${zh ? '英文版现在是' : '中文版现在是'}</div><div class="lib-pop__val">${val}</div><div class="lib-pop__acts">${btn('复制', { small: true, ic: 'copy' })}${btn('填进这一项', { small: true, primary: true })}</div></div>` : '')
  return `<div class="lib-form"><div class="lib-fgrid">
${lab(zh ? '中文名' : 'Name', fx('name', { req: true, n: n.label }))}<div class="lib-popwrap">${input(v('火焰鹦鹉', 'Fire Parrot'), { placeholder: empty ? (zh ? '中文名' : 'Name') : '' })}${popHtml('name', zh ? 'Fire Parrot' : '火焰鹦鹉')}</div>
${zh ? `${lab('英文名', fx('eng'))}${input(empty ? '' : 'Fire Parrot')}` : ''}
${lab(zh ? '环节' : 'Level', fx('level', { req: true, n: n.select, mark: other && !empty ? '≠' : house ? '改过' : '' }))}<div class="lib-inline">${sel(empty ? '—' : zh ? (house ? '4 环' : '1 环') : 'Level 2', 120)}<span class="lib-muted">${zh ? '学派' : 'School'}<small style="color:var(--danger-text)">*</small></span>${sel(empty ? '—' : zh ? '塑能' : 'Evocation', 120)}</div>
${lab(zh ? '施法时间' : 'Casting Time', fx('time', { req: true, n: n.rep }))}<div class="lib-rep"><div class="lib-rep__row">${num(empty ? '' : '1')}${sel(empty ? '—' : zh ? '动作' : 'Action')}${input('', { placeholder: zh ? '条件（可不填）' : 'Condition (optional)' })}${iconBtn('x', '删掉这一种')}</div><div>${btn(zh ? '添加施法时间' : 'Add casting time', { small: true, quiet: true, ic: 'plus' })}</div></div>
${lab(zh ? '范围' : 'Range', fx('range', { req: true, mark: house ? '改过' : '' }))}<div class="lib-inline">${sel(empty ? '—' : zh ? '点' : 'Point', 110)}${num(empty ? '' : house ? '100' : '150')}${sel(empty ? '—' : zh ? '尺' : 'feet', 90)}</div>
${lab(zh ? '成分' : 'Components', fx('comp', { n: n.check }))}<div class="lib-checks"><span data-en="true" class="lib-checks lib-mono">${ck('v', !empty)}${ck('s', !empty)}${ck('m', false)}</span></div>
${lab(zh ? '说明' : 'Text', fx('entries', { req: true, n: n.rte }))}<div class="lib-rte"><div class="lib-rte__bar"><button>${zh ? '段落' : 'Paragraph'}</button><button>${zh ? '列表' : 'List'}</button><button>${zh ? '表格' : 'Table'}</button><button>${icon('dice-five', 12)} ${zh ? '骰子' : 'Dice'}</button><button>${zh ? '引用条目' : 'Link'}</button></div><div class="lib-rte__body">${empty ? `<p class="lib-faint">${zh ? '（还没写）' : '(empty)'}</p>` : zh ? '<p>一团燃烧的羽毛从你指尖飞出，命中射程内一个你能看见的生物……</p><p>失败受到 <span class="lib-tag">3d6</span> 火焰伤害。</p>' : '<p>A burning feather darts from your fingertip toward a creature you can see within range…</p><p>On a failed save, it takes <span class="lib-tag">3d6</span> fire damage.</p>'}</div></div>
</div><div class="lib-more">${P(n.more)}${icon('caret-right', 14)}${zh ? '更多选项（子学派、伤害类型、豁免检定、职业……共 31 项）' : 'More (subschools, damage, saves, classes … 31)'}<span class="lib-end">${L === 'narrow' ? '' : input('', { placeholder: zh ? '搜选项' : 'Search', ic: 'magnifying-glass' })}</span></div></div>`
}

export { badge, btn, icon, iconBtn, input, mbody }
