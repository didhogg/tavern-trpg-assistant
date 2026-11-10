// 线框用的小片段（返回 HTML 字符串）。DOM 和类名沿用插件真实组件（src/ui/kit、src/ui/styles），lib- 开头的是库页新增。
import { icon } from '../../p4-design-system/icons.mjs'

export { icon }
export const esc = (s) => String(s).replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' })[c])
export const pin = (n) => `<i class="wf-pin">${n}</i>`
const P = (n) => (n ? pin(n) : '')

export const btn = (label, { primary, small, danger, quiet, ic, n, disabled } = {}) =>
  `<button class="trpg-btn${primary ? ' trpg-btn--primary' : ''}${small ? ' trpg-btn--small' : ''}${danger ? ' trpg-btn--danger' : ''}${quiet ? ' trpg-btn--quiet' : ''}"${disabled ? ' disabled' : ''} type="button">${P(n)}${ic ? icon(ic, 16) : ''}${label}</button>`
export const iconBtn = (name, label, n) => `<button class="trpg-icon-btn" type="button" aria-label="${label}">${P(n)}${icon(name, 18)}</button>`
export const badge = (label, tone = '', extra = '') => `<span class="trpg-badge"${tone ? ` data-tone="${tone}"` : ''}${extra}>${label}</span>`
export const gray = (t) => `<span class="lib-src">${t}</span>`
export const link = (label) => `<button class="trpg-link" type="button">${label}</button>`
export const term = (label) => `<button class="trpg-term trpg-link" type="button" style="text-decoration-style:dotted;color:inherit">${label}</button>`
export const embed = (label) => `<button class="lib-embed" type="button">${label}</button>`
export const hint = (text, n) => `<p class="trpg-hint">${P(n)}${text}</p>`
export const sw = (on, label) => `<span class="trpg-switch-wrap"><span class="trpg-switch" data-on="${on}" role="switch" aria-checked="${on}"></span>${label ? `<span>${label}</span>` : ''}</span>`
export const check = (label, on = true, { dl = false } = {}) => `<span class="trpg-check" data-on="${on}"${dl ? ' data-dl="true"' : ''}><span class="trpg-check__box">${on || dl ? icon('check', 12) : ''}</span>${label}</span>`

/** 分段控件。items：字符串或 { label, on, disabled }。 */
export const seg = (items, { n } = {}) =>
  `<span class="trpg-seg" role="group">${P(n)}${items.map((it) => { const o = typeof it === 'string' ? { label: it } : it; return `<button type="button" aria-pressed="${!!o.on}"${o.disabled ? ' disabled' : ''}>${o.label}</button>` }).join('')}</span>`

/** 类别药丸（带条数）。 */
export const pills = (items) => `<div class="lib-pills">${items.map(([label, count, on]) => `<button class="trpg-pill" type="button" data-on="${!!on}">${label}${count != null ? ` <small>${count}</small>` : ''}</button>`).join('')}</div>`

export const input = (value, { placeholder = '', ic, invalid } = {}) =>
  `<div class="trpg-input"${invalid ? ' aria-invalid="true"' : ''}>${ic ? icon(ic, 16) + '&nbsp;' : ''}${value || `<span class="lib-faint">${placeholder}</span>`}</div>`
export const field = (label, control, { hint: h = '', err = '' } = {}) =>
  `<div class="trpg-field"><label class="trpg-field__label">${label}</label>${control}${err ? `<span class="trpg-field__err">${icon('warning', 14)}${err}</span>` : ''}${h ? `<span class="trpg-field__hint">${h}</span>` : ''}</div>`
export const searchBox = (text = '全库搜索…', n) => `<div class="lib-search">${P(n)}${icon('magnifying-glass', 16)}<span>${text}</span></div>`

export const empty = (text, actions = '') => `<div class="trpg-empty"><span>${text}</span>${actions ? `<span style="display:flex;gap:8px;flex-wrap:wrap">${actions}</span>` : ''}</div>`
export const loading = (text = '正在读取中…') => `<div class="trpg-loading" role="status"><span class="trpg-spinner" aria-hidden="true"></span><span>${text}</span></div>`
export const errorLine = (text, actions = '') => `<div class="lib-banner lib-banner--err">${icon('warning', 16)}<span>${text}</span>${actions ? `<span class="lib-end">${actions}</span>` : ''}</div>`
export const infoLine = (text, actions = '', cls = '') => `<div class="lib-banner ${cls}">${icon('info', 16)}<span>${text}</span>${actions ? `<span class="lib-end">${actions}</span>` : ''}</div>`
export const progress = (text, pct = 0.4) => `<span class="trpg-ring" data-state="running"><svg width="22" height="22" viewBox="0 0 22 22"><circle data-part="track" cx="11" cy="11" r="8" fill="none" stroke-width="3"/><circle data-part="arc" cx="11" cy="11" r="8" fill="none" stroke-width="3" stroke-linecap="round" stroke-dasharray="${(2 * Math.PI * 8 * pct).toFixed(1)} 60" transform="rotate(-90 11 11)"/></svg></span><span>${text}</span>`

/**
 * 表格列表（U1a）。cols：[{ label, sort: 'asc'|'desc' }]；rows：{ cells: [html…], sel, dim, marks }。
 * 窄屏：外层横滚，首列固定（CSS sticky）。
 */
export const table = (cols, rows, { height } = {}) =>
  `<div class="lib-tablewrap"${height ? ` style="max-height:${height}px"` : ''}><table class="lib-table"><thead><tr>${cols.map((c) => { const o = typeof c === 'string' ? { label: c } : c; return `<th${o.sort ? ` data-sort="${o.sort}"` : ''}>${o.label}${o.sort ? icon(o.sort === 'asc' ? 'sort-ascending' : 'sort-descending', 14) : o.can ? `<span class="lib-sortable">${icon('sort-ascending', 14)}</span>` : ''}</th>` }).join('')}</tr></thead><tbody>${rows.map((r) => `<tr${r.sel ? ' data-sel="true"' : ''}${r.dim ? ' data-dim="true"' : ''}>${r.cells.map((c, i) => `<td>${c}${i === 0 && r.marks ? `<span class="lib-marks">${r.marks}</span>` : ''}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`
export const skelRows = (cols, n = 5) => `<div class="lib-tablewrap"><table class="lib-table lib-skel"><thead><tr>${cols.map((c) => `<th>${c}</th>`).join('')}</tr></thead><tbody>${Array.from({ length: n }, () => `<tr>${cols.map(() => '<td><i></i></td>').join('')}</tr>`).join('')}</tbody></table></div>`
export const count = (text, extra = '') => `<div class="lib-count">${text}${extra}</div>`

/** 弹层。variant：dialog | drawer | confirm。head 可带 back。 */
export const modalHead = (title, { back, n } = {}) =>
  `<header class="trpg-modal__head">${back ? `<button class="trpg-modal__back" type="button">${icon('caret-left', 16)}<span>${back}</span></button>` : ''}<h2 class="trpg-modal__title">${P(n)}${title}</h2><button class="trpg-icon-btn" type="button" aria-label="关闭">${icon('x', 18)}</button></header>`
export const modal = (variant, head, body) =>
  `<div class="trpg-modal-root"><div class="trpg-modal"${variant === 'dialog' ? '' : ` data-variant="${variant}"`}><section class="trpg-modal__card" role="dialog" aria-modal="true"><i class="trpg-sheet-grip"></i>${head}<div class="trpg-modal__pages"><div class="trpg-modal__page">${body}</div></div></section></div></div>`

/** 影响页（共用）：删除 / 卸载前显示谁依赖它。 */
export const impact = (what, lines, { confirm = '确认', n } = {}) =>
  modal('confirm', modalHead(`${what}`, { n }), `<div class="trpg-confirm"><p>下面这些东西会受到影响：</p><ul class="trpg-confirm__details">${lines.map((l) => `<li>${l}</li>`).join('')}</ul><label class="trpg-check" data-on="false" style="color:var(--text2)"><span class="trpg-check__box"></span>以后不再提示（可在 设置 → 库 里改回来）</label><div class="trpg-confirm__actions">${btn('取消')}${btn(confirm, { danger: true })}</div></div>`)

export const toast = (text, { kind = 'info', hint: h = '点击关闭' } = {}) =>
  `<div class="trpg-toast" data-kind="${kind}" role="status">${kind === 'error' ? icon('warning', 16) : kind === 'success' ? icon('check-circle', 16) : ''}<span class="trpg-toast__text">${text}</span><small>${h}</small></div>`

/** 状态板里的一块。 */
export const stateCard = (title, body, n) => `<section class="wf-state"><h4>${P(n)}${title}</h4><div>${body}</div></section>`
