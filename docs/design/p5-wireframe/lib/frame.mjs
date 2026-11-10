// 窗口外壳与页面板。DOM 沿用 src/ui/shell/MainWindow.vue：悬浮窗默认 960×640，窗口内宽 ≥720 宽 / 481–719 中 / ≤480 窄（侧栏变底部标签栏）。
// 样式不再用灰度线框：build 时把插件真实样式（src/ui/styles）内联，:host 换成 .ds-root，配色 = P4 配色 A。
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { esc, icon, pin } from './ui.mjs'

const here = dirname(fileURLToPath(import.meta.url))
const stylesDir = join(here, '../../../../src/ui/styles')
const REAL = ['tokens', 'palette', 'base', 'kit', 'shell', 'pages'].map((f) => readFileSync(join(stylesDir, `${f}.css`), 'utf8')).join('\n').replaceAll(':host', '.ds-root')
export const CSS = `${REAL}\n${readFileSync(join(here, '../p5.css'), 'utf8')}`

export const FRAMES = {
  '1440': { w: 1440, h: 900, win: { w: 960, h: 640, x: 240, y: 130 }, layout: 'wide', label: '视口 1440 · 悬浮窗 960×640 · 宽布局' },
  '900': { w: 900, h: 760, win: { w: 868, h: 640, x: 16, y: 56 }, layout: 'wide', label: '视口 900 · 悬浮窗 868×640 · 宽布局' },
  '390': { w: 390, h: 844, full: true, layout: 'narrow', label: '视口 390 · 全屏 · 窄布局（底部标签栏）' },
  mid: { w: 700, h: 720, win: { w: 600, h: 640, x: 50, y: 56 }, layout: 'mid', label: '悬浮窗 600 宽 · 中布局' },
}
export const DEFAULT_FRAMES = ['1440', '900', '390']
export const HOST_BAR = 36
export const CAMP = { name: '失落矿坑', save: '存档 2' }

const NAV = [{ id: 'home', label: '首页', ic: 'house' }, { id: 'library', label: '库', ic: 'books', bottom: true }, { id: 'settings', label: '设置', ic: 'gear', bottom: true }]

/** 小环（沿用插件 RingIcon 的 DOM：data-part=track / arc）。 */
export function ring(state, size = 30, pct = 0.4) {
  const r = size / 2 - 3
  const c = 2 * Math.PI * r
  const arc = state === 'running' ? `<circle data-part="arc" cx="${size / 2}" cy="${size / 2}" r="${r}" fill="none" stroke-width="3" stroke-linecap="round" stroke-dasharray="${(c * pct).toFixed(1)} ${c.toFixed(1)}" transform="rotate(-90 ${size / 2} ${size / 2})"/>` : ''
  return `<span class="trpg-ring" data-state="${state}" style="width:${size}px;height:${size}px"><svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}"><circle data-part="track" cx="${size / 2}" cy="${size / 2}" r="${r}" fill="none" stroke-width="3"/>${arc}</svg></span>`
}
const libMark = (lib, size) => lib && lib.state !== 'none'
  ? `<span class="trpg-libmark"><span class="trpg-libmark__icon">${ring(lib.state, 30, lib.pct)}${icon('books', 16)}</span>${lib.count ? `<b class="trpg-count">${lib.count}</b>` : ''}</span>`
  : icon('books', size)

function navButton(n, L, s) {
  const cur = s.page === n.id ? ' aria-current="page"' : ''
  const ic = n.id === 'library' ? libMark(s.lib, 20) : icon(n.ic, 20)
  return `<button class="trpg-nav" type="button"${cur} title="${n.label}">${ic}${L === 'wide' ? `<span>${n.label}</span>` : ''}</button>`
}
const tabButton = (n, s) => `<button class="trpg-tab" type="button"${s.page === n.id ? ' aria-current="page"' : ''}>${n.id === 'library' ? libMark(s.lib, 22) : icon(n.ic, 22)}<span>${n.label}</span></button>`

function chips(L, h = {}) {
  const parts = []
  if (h.campaign && L !== 'narrow') parts.push(`<button class="trpg-pill trpg-chip" type="button"><span class="trpg-chip__camp">${esc(h.campaign.name)}</span><span class="trpg-chip__save">/ ${esc(h.campaign.save)}</span>${icon('caret-down', 14)}</button>`)
  if (L === 'narrow') parts.push(`<button class="trpg-icon-btn" type="button" aria-label="助手菜单">${icon('dots-three', 20)}</button>`)
  return `<div class="trpg-head__chips">${parts.join('')}</div>`
}

export function windowHtml(L, s) {
  const top = NAV.filter((n) => !n.bottom)
  const bottom = NAV.filter((n) => n.bottom)
  const title = s.title ?? (s.page === 'settings' ? '设置' : s.page === 'library' ? '库' : '首页')
  const side = L === 'narrow' ? '' : `<nav class="trpg-side" aria-label="主导航"><div class="trpg-side__brand"><span class="trpg-brandmark">${icon('dice-five', 18)}</span>${L === 'wide' ? '<span class="trpg-side__name">TRPG 跑团助手</span>' : ''}</div>
    <ul class="trpg-side__list">${top.map((n) => `<li>${navButton(n, L, s)}</li>`).join('')}</ul><ul class="trpg-side__list trpg-side__bottom">${bottom.map((n) => `<li>${navButton(n, L, s)}</li>`).join('')}</ul></nav>`
  const tabs = L === 'narrow' ? `<nav class="trpg-tabs" aria-label="主导航">${NAV.map((n) => tabButton(n, s)).join('')}</nav>` : ''
  const close = L === 'narrow' ? '' : `<button class="trpg-icon-btn" type="button" aria-label="收起助手">${icon('x', 18)}</button>`
  return `<div class="trpg-shell">${side}<div class="trpg-main"><header class="trpg-head"><h1 class="trpg-head__title">${title}</h1>${chips(L, s.header ?? { campaign: CAMP })}${close}</header>
    <div class="trpg-body"><main class="trpg-content${s.flush ? ' lib-flush' : ''}" ${s.flush ? 'data-flush="true"' : ''}>${s.content}</main><button class="trpg-dice-btn" type="button" aria-label="掷骰">${icon('dice-five', 28)}</button></div>${tabs}</div></div>${s.overlay ?? ''}${s.pop ?? ''}`
}

export function frameHtml(key, screen) {
  const f = FRAMES[key]
  const s = screen.render(f.layout)
  const pos = f.full ? `top:${HOST_BAR}px;left:0;right:0;bottom:0` : `left:${f.win.x}px;top:${f.win.y}px;width:${f.win.w}px;height:${f.win.h}px`
  const win = `<section class="trpg-window" data-layout="${f.layout}" data-fullscreen="${!!f.full}" style="${pos}">${windowHtml(f.layout, s)}</section>`
  const chat = f.full ? '' : `<div class="wf-host__chat">${'<i></i>'.repeat(14)}</div><div class="wf-host__input">酒馆输入框（宿主，不属于插件）</div>`
  const toasts = s.toast ? `<div class="trpg-toasts" style="position:absolute;top:44px">${s.toast}</div>` : ''
  return `<figure style="margin:0"><figcaption class="wf-cap">${f.label}</figcaption><div class="wf-host" style="width:${f.w}px;height:${f.h}px">${chat}<div class="wf-host__bar">酒馆顶部栏（宿主，不属于插件）</div>${win}${toasts}</div></figure>`
}

export const PAGE_CSS = `
body { margin: 0; background: #f4f1ea; font-family: 'PingFang SC', system-ui, sans-serif; color: #3e332e; }
.wf-board { padding: 28px 32px 40px; min-width: 1100px; } .wf-board h1 { margin: 0 0 4px; font-size: 24px; } .wf-board .wf-meta { margin: 0 0 18px; color: #6b5a4e; }
.wf-row { display: flex; gap: 28px; align-items: flex-start; flex-wrap: wrap; } .wf-cap { font-size: 12px; color: #6b5a4e; margin-bottom: 6px; font-weight: 600; }
.wf-notes { margin-top: 22px; display: grid; gap: 16px; max-width: 1500px; }
.wf-notes table { border-collapse: collapse; width: 100%; font-size: 13px; background: #fff; } .wf-notes th, .wf-notes td { border: 1px solid #d9cfbf; padding: 6px 10px; text-align: left; vertical-align: top; } .wf-notes th { background: #efe7d8; }
.wf-facts { display: grid; grid-template-columns: 110px 1fr; gap: 4px 12px; font-size: 13px; max-width: 1500px; } .wf-facts dt { font-weight: 700; } .wf-facts dd { margin: 0; }
`
export { pin }
