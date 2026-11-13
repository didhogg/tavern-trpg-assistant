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

// 字段（上方标签）。mark：'≠' 不用翻译的项两边不一样 / '改过' 房规和原件不一样
export const fld = (t, ctl, { req, mark, n, en } = {}) => `<div class="lib-tfield"${mark ? ' data-diff="true"' : ''}><label${en ? ' data-en="true"' : ''}>${P(n)}<span class="lib-lname">${t}${req ? '<small>*</small>' : ''}${icon('info', 13)}</span>${mark ? `<span class="lib-mark">${mark}</span>` : ''}</label>${ctl}</div>`
const sec = (t) => `<div class="lib-fsec">${t}</div>`
const T = {
  zh: { name: '名字', basic: '基本', level: '环节', school: '学派', cast: '施法', time: '施法时间', cond: '条件（可不填）', addTime: '添加施法时间', range: '范围', comp: '成分', effect: '效果', text: '说明', more: '更多选项（子学派、伤害类型、豁免检定、职业……共 31 项）', bar: ['段落', '列表', '表格', '骰子', '引用条目'] },
  en: { name: 'Name', basic: 'Basics', level: 'Level', school: 'School', cast: 'Casting', time: 'Casting Time', cond: 'Condition (optional)', addTime: 'Add casting time', range: 'Range', comp: 'Components', effect: 'Effect', text: 'Text', more: 'More (subschools, damage, saves, classes … 31)', bar: ['Paragraph', 'List', 'Table', 'Dice', 'Link'] },
}
const V = {
  zh: { name: '火焰鹦鹉', level: '1 环', school: '塑能', unit: '动作', rtype: '点', runit: '尺', text: '<p>一团燃烧的羽毛从你指尖飞出，命中射程内一个你能看见的生物……</p><p>失败受到 <span class="lib-tag">3d6</span> 火焰伤害。</p>' },
  en: { name: 'Fire Parrot', level: 'Level 2', school: 'Evocation', unit: 'Action', rtype: 'Point', runit: 'feet', text: '<p>A burning feather darts from your fingertip toward a creature you can see within range…</p><p>On a failed save, it takes <span class="lib-tag">3d6</span> fire damage.</p>' },
}

/**
 * 一种语言的法术表单（只写这一种语言自己的内容；中文条目的英文名 ENG_name 由系统按英文那一条自动写，不在表单里）。
 * o.diff：标出两边不一样的不用翻译的项；o.house：房规（标「改过」）；o.empty：这一边还没有这一条（空表单）；o.v：覆盖示例值。
 */
export function spellForm(L, o = {}) {
  const { lang = 'zh', diff = false, house = false, empty = false, n = {} } = o
  const t = T[lang]
  const v = { ...V[lang], range: house ? '100' : '150', ...(lang === 'zh' && house ? { level: '4 环' } : {}), ...(o.v ?? {}) }
  const e = (x) => (empty ? '' : x)
  const s = (x, w) => sel(empty ? '—' : x, w)
  return `<div class="lib-tform">
${fld(t.name, input(e(v.name), { placeholder: empty ? t.name : '' }), { req: true, n: n.name })}
${sec(t.basic)}<div class="lib-row2">${fld(t.level, s(v.level), { req: true, n: n.select, mark: diff ? '≠' : house ? '改过' : '' })}${fld(t.school, s(v.school), { req: true })}</div>
${sec(t.cast)}${fld(t.time, `<div class="lib-rep"><div class="lib-rep__row">${num(e('1'))}${s(v.unit)}${input('', { placeholder: t.cond })}${iconBtn('x', '删掉这一种')}</div><div>${btn(t.addTime, { small: true, quiet: true, ic: 'plus' })}</div></div>`, { req: true, n: n.rep })}
${fld(t.range, `<div class="lib-inline">${s(v.rtype, 110)}${num(e(v.range))}${s(v.runit, 90)}</div>`, { req: true, mark: house ? '改过' : '' })}
${fld(t.comp, `<div class="lib-checks lib-mono">${ck('v', !empty)}${ck('s', !empty)}${ck('m', false)}</div>`, { n: n.check })}
${sec(t.effect)}${fld(t.text, `<div class="lib-rte"><div class="lib-rte__bar">${t.bar.map((b, i) => `<button>${i === 3 ? icon('dice-five', 12) + ' ' : ''}${b}</button>`).join('')}</div><div class="lib-rte__body">${empty ? `<p class="lib-faint">${lang === 'zh' ? '（还没写）' : '(empty)'}</p>` : v.text}</div></div>`, { req: true, n: n.rte })}
<div class="lib-more">${P(n.more)}${icon('caret-right', 14)}${t.more}</div></div>`
}

/** 宽屏：左右两栏。left = 左栏标题（主编辑语言）；right = { tabs, on, body }；两栏一起滚。 */
export const split = (leftTitle, leftBody, right, n = {}) => `<div class="lib-split"><section class="lib-pane"><div class="lib-pane__head">${P(n.left)}<b>${leftTitle}</b>${n.leftNote ? `<span class="lib-faint">${n.leftNote}</span>` : ''}</div><div class="lib-pane__body">${leftBody}</div></section><section class="lib-pane lib-pane--side"><div class="lib-pane__head">${P(n.tabs)}${segTabs(right.tabs, right.on)}${right.note ? `<span class="lib-end lib-faint">${right.note}</span>` : ''}</div><div class="lib-pane__body">${right.body}</div></section></div>`
export const segTabs = (tabs, on) => `<span class="trpg-seg" role="group">${tabs.map((t) => `<button type="button" aria-pressed="${t === on}">${t}</button>`).join('')}</span>`
/** 窄屏：上半栏（另一语言 / JSON / 预览，可收起、可拖高度）+ 下半栏主语言表单。 */
export const vsplit = (top, bottomTitle, bottomBody, n = {}) => `<div class="lib-vsplit">${top.open ? `<section class="lib-pane lib-pane--side lib-pane--top"><div class="lib-pane__head">${P(n.tabs)}${segTabs(top.tabs, top.on)}<span class="lib-end">${btn('收起', { small: true, quiet: true, ic: 'caret-down' })}</span></div><div class="lib-pane__body">${top.body}</div></section><div class="lib-grip">${P(n.grip)}<i></i></div>` : `<div class="lib-pane__head lib-pane--side" style="border-bottom:var(--border) solid var(--line)">${P(n.tabs)}${segTabs(top.tabs, null)}<span class="lib-end">${btn('展开', { small: true, quiet: true, ic: 'caret-down' })}</span></div>`}<section class="lib-pane"><div class="lib-pane__head"><b>${bottomTitle}</b></div><div class="lib-pane__body">${bottomBody}</div></section></div>`

export { badge, btn, icon, iconBtn, input, mbody }
