// 线框用的小片段（返回 HTML 字符串）。类名沿用插件现有界面；新增的见 README。
export const pin = (n) => `<i class="wf-pin">${n}</i>`
export const esc = (s) => String(s).replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' })[c])

export const btn = (label, { primary = false, disabled = false, small = false, danger = false, n = null } = {}) =>
  `<button class="trpg-btn${primary ? ' trpg-btn--primary' : ''}${small ? ' trpg-btn--small' : ''}${danger ? ' trpg-btn--danger' : ''}"${disabled ? ' disabled' : ''} type="button">${n ? pin(n) : ''}${label}</button>`
export const badge = (label, tone = '') => `<span class="trpg-badge"${tone ? ` data-tone="${tone}"` : ''}>${label}</span>`
export const check = (label, on = true) => `<span class="trpg-check" data-on="${on}">${label}</span>`

/**
 * 资料安装进度环（同一个小组件：侧栏库标签里 30px，向导里 56px）。
 * state：none（不显示）| running（按进度填充）| spin（当前阶段没有总数，转圈）| warn（失败 / 中断，中间 !）| done（闭合打勾）
 * 环 = 3 段 × 任务数；每段留缺口，已完成的段填满。
 */
export function ring(state, { size = 30, pct = 0.4, glyph: showGlyph = true } = {}) {
  if (state === 'none') return ''
  const r = size / 2 - 3
  const c = 2 * Math.PI * r
  const track = `<circle cx="${size / 2}" cy="${size / 2}" r="${r}" fill="none" stroke="#8f8f8f" stroke-width="3"/>`
  let arc = ''
  let glyph = ''
  if (state === 'running' && pct > 0) arc = `<circle cx="${size / 2}" cy="${size / 2}" r="${r}" fill="none" stroke="#1a1a1a" stroke-width="3" stroke-linecap="round" stroke-dasharray="${c * pct} ${c}" transform="rotate(-90 ${size / 2} ${size / 2})"/>`
  if (state === 'spin') arc = `<circle cx="${size / 2}" cy="${size / 2}" r="${r}" fill="none" stroke="#1a1a1a" stroke-width="3" stroke-linecap="round" stroke-dasharray="${c * 0.22} ${c * 0.1}"/>`
  if (state === 'warn') { arc = `<circle cx="${size / 2}" cy="${size / 2}" r="${r}" fill="none" stroke="#1a1a1a" stroke-width="3.5" stroke-dasharray="4 3"/>`; glyph = '!' }
  if (state === 'done') { arc = `<circle cx="${size / 2}" cy="${size / 2}" r="${r}" fill="none" stroke="#1a1a1a" stroke-width="3"/>`; glyph = '✓' }
  const badge = !showGlyph && glyph ? `<span class="trpg-ring__badge">${glyph}</span>` : ''
  return `<span class="trpg-ring" data-state="${state}" style="width:${size}px;height:${size}px"><svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" aria-hidden="true">${track}${arc}</svg>${showGlyph && glyph ? `<span class="trpg-ring__glyph" style="font-size:${Math.round(size / 2.6)}px">${glyph}</span>` : ''}${badge}</span>`
}

/** 抽屉 / 弹窗标题栏。back 给了就显示"‹ 返回：xxx"（抽屉内换页）。 */
export const modalHead = (title, back = null) =>
  `<header class="trpg-modal__head">${back ? `<button class="trpg-modal__back" type="button">‹ ${back}</button>` : ''}<h2 class="trpg-modal__title">${title}</h2><button class="trpg-icon-btn" type="button" aria-label="关闭">✕</button></header>`

export const modal = (variant, head, body) =>
  `<div class="trpg-modal" data-variant="${variant}"><section class="trpg-modal__card" role="dialog" aria-modal="true"><i class="trpg-sheet-grip"></i>${head}<div class="trpg-modal__pages"><div class="trpg-modal__page">${body}</div></div></section></div>`

export const toast = (text, { kind = 'info', hint = '点击关闭' } = {}) =>
  `<div class="trpg-toast" data-kind="${kind}" role="status">${kind === 'error' ? '⚠ ' : kind === 'ok' ? '✓ ' : ''}<span>${text}</span><small>${hint}</small></div>`

export const field = (label, control, { hint = '', err = '' } = {}) =>
  `<div class="trpg-field"><label class="trpg-field__label">${label}</label>${control}${err ? `<span class="trpg-field__err">⚠ ${err}</span>` : ''}${hint ? `<span class="trpg-field__hint">${hint}</span>` : ''}</div>`
export const input = (value, { invalid = false, placeholder = '' } = {}) =>
  `<div class="trpg-input"${invalid ? ' aria-invalid="true"' : ''}>${value || `<span style="color:#9a9a9a">${placeholder}</span>`}</div>`

/** 读取中：简约圆圈 + 文字（超过 1 秒才显示）。 */
export const loading = (text = '正在读取中…') => `<div class="trpg-loading" role="status"><span class="trpg-spinner" aria-hidden="true"></span><span>${text}</span></div>`
/** 浅灰说明文字（次级文字色，不是进度、不是错误）。 */
export const hint = (text, n = null) => `<p class="trpg-hint">${n ? pin(n) : ''}${text}</p>`
