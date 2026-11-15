// 选资料两栏页（从模板加入 / 分步建卡共用）：左 = 列表，右 = 资料卡（就是库里的那张资料卡）；无边框、细线分隔。
// 窄屏不再两栏：view = 'list'（列表页）→ 点一项 → view = 'card'（资料卡页，带「‹ 列表」返回和底部动作）。
import { icon, btn, searchBox, P, wzModal, mh, mdl } from './parts.mjs'

export const pill = (t) => `<span class="pk-pill">${t}</span>`
export const row = ({ ch, name, en, sub, tags = [], src, sel }) => `<div class="pk-row"${sel ? ' aria-selected="true"' : ''}><span class="pk-av">${ch ?? name[0]}</span><span class="pk-main"><b>${name}${en ? `<small>${en}</small>` : ''}</b><span>${tags.map(pill).join('')}${sub ?? ''}</span></span><span class="pk-src">${src ?? ''}</span></div>`
export const tabs = (items, on = 0, n) => `<div class="pk-tabs" role="tablist">${P(n)}${items.map(([t, k], i) => `<button class="pk-tab" role="tab" type="button" aria-selected="${i === on}">${t}${k != null ? `<small>${k}</small>` : ''}</button>`).join('')}</div>`
export const tools = (q, count, { n, nCount } = {}) => `<div class="pk-tools">${searchBox(q, n)}${btn('筛选', { small: true })}${btn('排序：名称', { small: true, ic: 'caret-down' })}<span class="pk-count">${P(nCount)}共 ${count} 条<button type="button">清除</button></span></div>`
/** 资料卡：头（方形头像 · 名字 · 副标题 · 标签 · 来源）+ 数据条 + 键值 + 说明；extra 放「它要你做的选择」等 */
export const card = ({ ch, name, en, sub, tags = [], src, stats = [], abs, kv = [], secs = [], extra = '', n }) => `<aside class="pk-card">${P(n)}
<div class="pk-card__h"><span class="pk-av">${ch ?? name[0]}</span><div><h3>${name}${en ? `<small>${en}</small>` : ''}</h3><p>${sub}</p><span style="display:flex;gap:6px">${tags.map(pill).join('')}</span></div><span class="pk-src">${src ?? ''}</span></div>
${stats.length ? `<div class="pk-stats">${stats.map(([k, v]) => `<div><small>${k}</small><b>${v}</b></div>`).join('')}</div>` : ''}
${abs ? `<div class="pk-abs">${abs.map(([k, v]) => `<div>${k}<b>${v}</b></div>`).join('')}</div>` : ''}
${kv.length ? `<dl class="pk-kv">${kv.map(([k, v]) => `<dt>${k}</dt><dd>${v}</dd>`).join('')}</dl>` : ''}
${secs.map(([h, t]) => `<div class="pk-sec">${h}</div><p class="pk-p">${t}</p>`).join('')}${extra}</aside>`
export const foot = (inner) => `<div class="pk-foot">${inner}</div>`
/** view: both（宽，两栏）/ list（窄·列表页）/ card（窄·资料卡页）。one = 只有一栏的页（名字 / 属性值 / 装备 / 检查） */
export function pickPage({ view = 'both', top, list, card: cardHtml, body, footHtml }) {
  const main = body ? `<div class="pk-body" data-one="true"><div>${body}</div></div>`
    : view === 'both' ? `<div class="pk-body"><div class="pk-list">${list}</div><div>${cardHtml}</div></div>`
      : view === 'list' ? `<div class="pk-body"><div class="pk-list">${list}</div></div>` : `<div class="pk-body"><div>${cardHtml}</div></div>`
  return `<div class="pk" data-view="${body ? 'both' : view}">${view === 'card' && !body ? '' : `<div class="pk-top">${top}</div>`}${main}${footHtml ?? ''}</div>`
}
export const pickModal = (title, sub, page, { view, n } = {}) => `<div class="wz-modal">${mdl('sheet', mh(title, { n, back: view === 'card' ? '列表' : undefined }), page)}</div>`
