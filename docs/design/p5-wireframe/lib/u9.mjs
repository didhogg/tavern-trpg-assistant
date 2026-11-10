// U9 各类型详情共用的小片段。字段只取自 P5-0 §4.3 / §4.5 / §13.6.9 写好的数据形状；条目里的具体数值是示例（SRD 常见内容或占位），真实值由作者函数生成。
import { badge, btn, entryHead, entryTools, gray, icon, infoLine, mbody, mdetail, pin, shelfPage, sheet, term } from './parts.mjs'
import { embed } from './ui.mjs'

export const P = (n) => (n ? pin(n) : '')
/** 骰子标签：点了进骰盘；bad = 骰式读不懂，当普通文字（虚线框，不能点）。 */
export const dice = (t, { bad = false, n } = {}) => (bad ? `<span class="lib-dice lib-dice--plain">${P(n)}${t}</span>` : `<button class="lib-dice" type="button">${P(n)}${icon('dice-five', 12)}${t}</button>`)
/** 数值块行：一行一项，缺字段显示「未知」。 */
export const stat = (rows) => `<div class="lib-stat">${rows.map(([k, v, n]) => `<div><span>${P(n)}${k}</span><span style="color:var(--text)">${v ?? '<span class="lib-faint">未知</span>'}</span></div>`).join('')}</div>`
export const abil = (a) => `<div class="lib-abil">${a.map(([k, v, m]) => `<div><small>${k}</small><b>${v}</b> (${m})</div>`).join('')}</div>`
export const sum = (items, n) => `<div class="lib-sumline">${P(n)}${items.map(([k, v]) => `<span>${k} <b>${v}</b></span>`).join('')}</div>`
export const src = (t, n) => `<div class="lib-srcline">${P(n)}${t}</div>`
export const imgLink = (t = '点开看图（点了才拉取）') => `<button class="lib-embed" type="button">${icon('image', 14)}${t}</button>`
export const tblLink = (t) => `<button class="lib-embed" type="button">${icon('table', 14)}${t}</button>`
export const block = (title, inner) => `<div class="lib-block"><b>${title}</b>${inner}</div>`
export const sel = (text, w = 200) => `<div class="trpg-input" style="width:${w}px;justify-content:space-between">${text}${icon('caret-down', 14)}</div>`

/** 条目详情页放进弹窗（书架在后面压暗）。back：‹ 后面的上一页名。 */
export const detail = ({ back = '玩家手册', title, tools = {}, body }) => ({ page: 'library', flush: true, content: shelfPage({ fold: true }), overlay: sheet(entryHead({ back, title }), mdetail(entryTools(tools), body)) })
/** 弹窗里不带工具行的整页（阅读器等）。 */
export const bare = ({ back = '玩家手册', title, inner }) => ({ page: 'library', flush: true, content: shelfPage({ fold: true }), overlay: sheet(entryHead({ back, title }), mbody(inner)) })
export { badge, btn, gray, icon, infoLine, term, embed, pin }
