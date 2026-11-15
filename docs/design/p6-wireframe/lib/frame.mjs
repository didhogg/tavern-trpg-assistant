// P6 线框的窗口外壳：沿用 P5 线框的做法（插件真实样式内联 + 酒馆占位），只多两处：
//  ① 侧栏 / 底部标签栏多一个「人物」入口（插件现在的 NAV 只有 首页 / 库 / 设置，人物入口随 P6 加）；
//  ② 多一个 'full' 画框（视口 1440、插件全屏，演示详情页最宽的双列档）。
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { CSS as P5CSS, FRAMES, HOST_BAR, CAMP, PAGE_CSS } from '../../p5-wireframe/lib/frame.mjs'
import { esc, icon } from '../../p5-wireframe/lib/ui.mjs'

const here = dirname(fileURLToPath(import.meta.url))
export const CSS = `${P5CSS}\n${readFileSync(join(here, '../p6.css'), 'utf8')}\n${readFileSync(join(here, '../palette-v2.css'), 'utf8')}`
export { PAGE_CSS }

FRAMES.full = { w: 1440, h: 900, full: true, layout: 'wide', label: '视口 1440 · 插件全屏 · 宽布局' }
FRAMES['1440'].label = '视口 1440 · 悬浮窗 960×640 · 宽布局'
FRAMES['900'].label = '视口 900 · 悬浮窗 868×640 · 宽布局'
FRAMES['390b'] = { ...FRAMES['390'], label: '窄屏 · 点一项之后跳到的资料卡页' }
FRAMES.mid.label = '悬浮窗 600 宽 · 中布局（侧栏只有图标）'

const NAV = [
  { id: 'home', label: '首页', ic: 'house' },
  { id: 'people', label: '人物', ic: 'users-three' },
  { id: 'library', label: '库', ic: 'books', bottom: true },
  { id: 'settings', label: '设置', ic: 'gear', bottom: true },
]
const navButton = (n, L, s) => `<button class="trpg-nav" type="button"${s.page === n.id ? ' aria-current="page"' : ''} title="${n.label}">${icon(n.ic, 20)}${L === 'wide' ? `<span>${n.label}</span>` : ''}</button>`
const tabButton = (n, s) => `<button class="trpg-tab" type="button"${s.page === n.id ? ' aria-current="page"' : ''}>${icon(n.ic, 22)}<span>${n.label}</span></button>`

function chips(L, s) {
  const parts = []
  if (L !== 'narrow') parts.push(`<button class="trpg-pill trpg-chip" type="button"><span class="trpg-chip__camp">${esc(CAMP.name)}</span><span class="trpg-chip__save">/ ${esc(CAMP.save)}</span>${icon('caret-down', 14)}</button>`)
  if (s.dirty) parts.push(`<button class="trpg-btn trpg-btn--small trpg-btn--primary" type="button">保存存档</button>`)
  if (L === 'narrow') parts.push(`<button class="trpg-icon-btn" type="button" aria-label="助手菜单">${icon('dots-three', 20)}</button>`)
  return `<div class="trpg-head__chips">${parts.join('')}</div>`
}

export function windowHtml(L, s) {
  const top = NAV.filter((n) => !n.bottom)
  const bottom = NAV.filter((n) => n.bottom)
  const side = L === 'narrow' ? '' : `<nav class="trpg-side" aria-label="主导航"><div class="trpg-side__brand"><span class="trpg-brandmark">${icon('dice-five', 18)}</span>${L === 'wide' ? '<span class="trpg-side__name">TRPG 跑团助手</span>' : ''}</div>
    <ul class="trpg-side__list">${top.map((n) => `<li>${navButton(n, L, s)}</li>`).join('')}</ul><ul class="trpg-side__list trpg-side__bottom">${bottom.map((n) => `<li>${navButton(n, L, s)}</li>`).join('')}</ul></nav>`
  const tabs = L === 'narrow' ? `<nav class="trpg-tabs" aria-label="主导航">${NAV.map((n) => tabButton(n, s)).join('')}</nav>` : ''
  const close = L === 'narrow' ? '' : `<button class="trpg-icon-btn" type="button" aria-label="收起助手">${icon('x', 18)}</button>`
  const fab = s.noFab ? '' : `<button class="trpg-dice-btn" type="button" aria-label="掷骰">${icon('dice-five', 28)}</button>`
  return `<div class="trpg-shell">${side}<div class="trpg-main"><header class="trpg-head"><h1 class="trpg-head__title">${s.title ?? '人物'}</h1>${chips(L, s)}${close}</header>
    <div class="trpg-body"><main class="trpg-content lib-flush" data-flush="true">${s.content}</main>${fab}</div>${tabs}</div></div>${s.overlay ?? ''}${s.pop ?? ''}`
}

export function frameHtml(key, screen) {
  const f = FRAMES[key]
  const s = { page: 'people', ...screen.render(f.layout, key) }
  const pos = f.full ? `top:${HOST_BAR}px;left:0;right:0;bottom:0` : `left:${f.win.x}px;top:${f.win.y}px;width:${f.win.w}px;height:${f.win.h}px`
  const win = `<section class="trpg-window" data-layout="${f.layout}" data-fullscreen="${!!f.full}" style="${pos}">${windowHtml(f.layout, s)}</section>`
  const chat = f.full ? '' : `<div class="wf-host__chat">${'<i></i>'.repeat(14)}</div><div class="wf-host__input">酒馆输入框（宿主，不属于插件）</div>`
  const toasts = s.toast ? `<div class="trpg-toasts" style="position:absolute;top:44px">${s.toast}</div>` : ''
  return `<figure style="margin:0"><figcaption class="wf-cap">${screen.captions?.[key] ?? f.label}</figcaption><div class="wf-host" style="width:${f.w}px;height:${f.h}px">${chat}<div class="wf-host__bar">酒馆顶部栏（宿主，不属于插件）</div>${win}${toasts}</div></figure>`
}

/** 每个画框画不同内容：by({ '1440': (L)=>屏, … }, captions, keys) */
export const by = (fns, captions = {}) => () => Object.keys(fns).map((k) => frameHtml(k, { render: (L) => fns[k](L, k), captions })).join('')
export const DEFAULT_FRAMES = ['1440', '900', '390']
