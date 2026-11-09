// 窗口外壳与页面板。按插件真实规则：窗口默认 960×640（视口 − 32），≤480 视口全屏；窗口内宽 ≥720 宽 / 481–719 中 / ≤480 窄。
import { esc, pin, ring } from './ui.mjs'

export const FRAMES = {
  '1440': { w: 1440, h: 900, win: { w: 960, h: 640, x: 240, y: 130 }, layout: 'wide', label: '视口 1440 · 悬浮窗 960×640 · 宽布局' },
  '900': { w: 900, h: 760, win: { w: 868, h: 640, x: 16, y: 40 }, layout: 'wide', label: '视口 900 · 悬浮窗 868×640 · 宽布局' },
  '390': { w: 390, h: 844, full: true, layout: 'narrow', label: '视口 390 · 全屏 · 窄布局（底部标签栏）' },
  mid: { w: 700, h: 720, win: { w: 600, h: 640, x: 50, y: 40 }, layout: 'mid', label: '悬浮窗被拖到 600 宽 · 中布局（只做外壳演示）' },
}
export const DEFAULT_FRAMES = ['1440', '900', '390']
export const HOST_BAR = 36 // 酒馆自己的顶部栏高度（线框占位；真实高度待真机核对）

const NAV = [
  { id: 'home', label: '首页', glyph: '⌂' },
  { id: 'library', label: '库', glyph: '▤', bottom: true },
  { id: 'settings', label: '设置', glyph: '⚙', bottom: true },
]

/** 库标签上的小环 + 紧挨着的数字；没有任务也没有失败时返回 null（只显示普通图标）。 */
function libMark(n, lib) {
  if (n.id !== 'library' || !lib || lib.state === 'none') return null
  return `<span class="trpg-libmark" data-hover="${lib.hover ? 'true' : 'false'}"><span style="position:relative;display:inline-grid;place-items:center;width:30px;height:30px">${ring(lib.state, { size: 30, pct: lib.pct, glyph: false })}<span style="position:absolute;inset:0;display:grid;place-items:center;font-size:14px">${n.glyph}</span></span>${lib.count ? `<b class="trpg-count">${lib.count}</b>` : ''}</span>`
}

function navButton(n, L, page, libRing, n_) {
  const showLabel = L === 'wide'
  const icon = libMark(n, libRing) ?? `<span style="font-size:18px;width:30px;text-align:center">${n.glyph}</span>`
  const cur = page === n.id ? ' aria-current="page"' : ''
  return `<button class="trpg-nav" type="button"${cur} title="${n.label}">${n_ ?? ''}${icon}${showLabel ? `<span>${n.label}</span>` : ''}</button>`
}

function tabButton(n, page, libRing) {
  const icon = libMark(n, libRing) ?? `<span style="font-size:20px;height:30px;display:grid;place-items:center">${n.glyph}</span>`
  return `<button class="trpg-tab" type="button"${page === n.id ? ' aria-current="page"' : ''}>${icon}<span>${n.label}</span></button>`
}

/** 页头右侧：存档芯片 / 保存 / 只读 / 窄屏 ⋯ 菜单。 */
function chips(L, h = {}) {
  const camp = h.campaign
  const parts = []
  if (camp) {
    if (L !== 'narrow') parts.push(`<button class="trpg-pill trpg-chip" type="button">${h.pins?.chip ? pin(h.pins.chip) : ''}<span class="trpg-chip__camp">${esc(camp.name)}</span> <span class="trpg-chip__save">/ ${esc(camp.save)}</span> ▾</button>`)
    if (h.dirty && !h.readonly) parts.push(`<button class="trpg-btn trpg-btn--small trpg-btn--primary" type="button">${h.pins?.save ? pin(h.pins.save) : ''}保存</button>`)
  }
  if (h.readonly) parts.push(`<button class="trpg-badge" data-tone="warn" type="button">${h.pins?.ro ? pin(h.pins.ro) : ''}只读</button>`)
  if (L === 'narrow') parts.push(`<button class="trpg-icon-btn" type="button" aria-label="助手菜单">⋯</button>`)
  return `<div class="trpg-head__chips">${parts.join('')}</div>`
}

export function windowHtml(L, s) {
  const page = s.page ?? 'home'
  const title = s.title ?? (page === 'settings' ? '设置' : page === 'library' ? '库' : '首页')
  const top = NAV.filter((n) => !n.bottom)
  const bottom = NAV.filter((n) => n.bottom)
  const side = L === 'narrow' ? '' : `<nav class="trpg-side" aria-label="主导航">
      <div class="trpg-side__brand"><span style="font-size:20px">⚄</span>${L === 'wide' ? '<span>TRPG 跑团助手</span>' : ''}</div>
      <ul class="trpg-side__list">${top.map((n) => `<li>${navButton(n, L, page, s.lib)}</li>`).join('')}</ul>
      <ul class="trpg-side__list trpg-side__bottom">${bottom.map((n) => `<li>${navButton(n, L, page, s.lib, n.id === 'library' && s.pins?.lib ? pin(s.pins.lib) : '')}</li>`).join('')}</ul>
    </nav>`
  const tabs = L === 'narrow' ? `<nav class="trpg-tabs" aria-label="主导航">${NAV.map((n) => tabButton(n, page, s.lib)).join('')}</nav>` : ''
  const close = L === 'narrow' ? '' : `<button class="trpg-icon-btn" type="button" aria-label="收起助手">✕</button>`
  return `<div class="trpg-shell"${s.overlay ? ' aria-hidden="true"' : ''}>${side}
    <div class="trpg-main">
      <header class="trpg-head"><h1 class="trpg-head__title">${title}</h1>${chips(L, s.header)}${close}</header>
      <div class="trpg-body"><main class="trpg-content"${s.flush ? ' data-flush="true"' : ''}>${s.content}</main>${s.pointer ?? ''}<button class="trpg-dice-btn" type="button" aria-label="掷骰">${s.pins?.dice ? `<i class="wf-pin wf-pin--abs" style="left:-6px;top:-6px">${s.pins.dice}</i>` : ''}⚄</button></div>
      ${tabs}
    </div></div>${s.pop ?? ''}${s.overlay ?? ''}`
}

export function frameHtml(key, screen) {
  const f = FRAMES[key]
  const s = screen.render(f.layout)
  const win = f.full
    ? `<section class="trpg-window" data-layout="${f.layout}" data-fullscreen="true" style="top:${HOST_BAR}px">${windowHtml(f.layout, s)}</section>`
    : `<section class="trpg-window" data-layout="${f.layout}" data-fullscreen="false" style="left:${f.win.x}px;top:${f.win.y}px;width:${f.win.w}px;height:${f.win.h}px">${windowHtml(f.layout, s)}</section>`
  const chat = '<div class="wf-host__chat">' + '<i></i>'.repeat(14) + '</div><div class="wf-host__input">酒馆输入框（宿主，不属于插件）</div>'
  const bar = `<div class="wf-host__bar"><span>☰</span><span>酒馆顶部栏（宿主，不属于插件）</span></div>`
  // 提示条属于宿主层：在酒馆顶部栏下方、插件窗口之上，窗口收起时也看得到
  const toasts = s.toast ? `<div class="trpg-toasts" aria-live="polite">${s.toast}</div>` : ''
  return `<figure class="wf-frame" style="margin:0"><figcaption class="wf-cap">${f.label}</figcaption><div class="wf-host" style="width:${f.w}px;height:${f.h}px">${f.full ? '' : chat}${bar}${win}${toasts}</div></figure>`
}

export const PAGE_CSS = `
.wf-board { padding: 28px 32px 40px; background: #fafafa; min-width: 1100px; }
.wf-board h1 { margin: 0 0 4px; font-size: 24px; } .wf-board .wf-meta { margin: 0 0 18px; color: #555; }
.wf-row { display: flex; gap: 28px; align-items: flex-start; flex-wrap: wrap; }
.wf-cap { font-size: 12px; color: #444; margin-bottom: 6px; font-weight: 600; }
.wf-notes { margin-top: 22px; display: grid; gap: 16px; max-width: 1500px; }
.wf-notes table { border-collapse: collapse; width: 100%; font-size: 13px; background: #fff; }
.wf-notes th, .wf-notes td { border: 1px solid #bbb; padding: 6px 10px; text-align: left; vertical-align: top; }
.wf-notes th { background: #e9e9e9; }
.wf-facts { display: grid; grid-template-columns: 110px 1fr; gap: 4px 12px; font-size: 13px; max-width: 1500px; }
.wf-facts dt { font-weight: 700; } .wf-facts dd { margin: 0; }
`
