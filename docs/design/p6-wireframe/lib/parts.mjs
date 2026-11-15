// P6 线框 v4 通用零件 + 列表（照 Tidy5e 队伍表：工具行 + 彩色分组条带列名 + 成员行）。
// 名字与数值都是占位示例；真实显示来自内核（界面只显示，不在前端算）。
import { btn, iconBtn, icon, pin, searchBox, esc, badge, seg } from '../../p5-wireframe/lib/ui.mjs'
import { ICONS } from '../../p5-wireframe/lib/icons.mjs'
import { modal as mdl, modalHead as mh } from '../../p5-wireframe/lib/ui.mjs'
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

// 新增图标（Phosphor Regular，MIT）：拖动手柄、来源链接。进插件时补进 src/ui/kit/icons.ts
const here = dirname(fileURLToPath(import.meta.url))
for (const n of ['dots-six-vertical', 'link-simple']) ICONS[n] = readFileSync(join(here, `../sources/phosphor-${n}.svg`), 'utf8').match(/<svg[^>]*>(.*)<\/svg>/s)[1]

export { icon, esc, btn, iconBtn, badge, seg, searchBox, mdl, mh }
export const P = (n) => (n ? pin(n) : '')
export const more = (n) => `<button class="sh-more" type="button" aria-label="更多">${P(n)}${icon('dots-three', 18)}</button>`
export const dots = (n, on, kind) => `<span class="sh-dots"${kind ? ` data-kind="${kind}"` : ''}>${Array.from({ length: n }, (_, i) => `<i data-on="${i < on}"></i>`).join('')}</span>`
export const bar = (cur, max, temp = 0, { dk } = {}) => {
  const f = Math.min(100, (cur / max) * 100)
  const t = temp ? Math.min(100 - f, (temp / max) * 100) : 0
  return `<span class="sh-bar${dk ? ' sh-bar--dk' : ''}" role="meter" aria-valuenow="${cur}" aria-valuemax="${max}"><i style="width:${f}%"${cur / max < 0.34 ? ' data-low="true"' : ''}></i>${t ? `<u style="width:${t}%"></u>` : ''}</span>`
}
export const step = (n) => `<span class="sh-step"><button type="button" aria-label="减一">${icon('minus', 12)}</button><b>${n}</b><button type="button" aria-label="加一">${icon('plus', 12)}</button></span>`
export const filt = (items, on = 0, n) => `<span class="sh-filt" role="group">${P(n)}${items.map((t, i) => `<button type="button" aria-pressed="${i === on}">${t}</button>`).join('')}</span>`
export const roll = (t) => `<button class="sh-roll" type="button" title="点一下送去骰盘">${t}</button>`
/** 分组条：标题 + 计数 + 列名（列宽跟表的 --cols 一样）+ 可选 [＋] */
export const sec = (title, count, cols = [], { add, extra = '', n } = {}) => `<div class="sh-sec"><b>${P(n)}${title}${count != null ? ` <small>${count}</small>` : ''}${extra}</b>${cols.map((c) => `<span>${c}</span>`).join('')}${add ? `<button class="sh-add" type="button" aria-label="${add}">${icon('plus', 16)}</button>` : ''}</div>`
export const it = (ch, name, sub, { warn } = {}) => `<span class="sh-it"><i>${ch}</i><div><b>${name}</b>${sub ? `<small${warn ? ' class="sh-warn"' : ''}>${sub}</small>` : ''}</div></span>`
export const tr = (cells, attrs = '') => `<div class="sh-tr"${attrs}>${cells.join('')}</div>`
export const c = (t) => `<span>${t}</span>`
/** 表：cols = 各列宽；narrow = 窄屏下的列宽，hide = 窄屏隐藏第几列（从 1 数，空格分隔）——照 Tidy5e 窄屏只留关键列 */
export const tbl = (cols, body, cls = '', { narrow, hide } = {}) => `<div class="sh-tbl ${cls}" style="--cols:${cols}${narrow ? `;--cols-n:${narrow}` : ''}"${hide ? ` data-hide="${hide}"` : ''}>${body}</div>`

/* ---------- 列表 ---------- */
const CATS = [['队伍', 4], ['NPC', 9], ['敌人', 2], ['全部', 15]]
const cats = (sel, n) => `<span class="trpg-seg" role="group">${P(n)}${CATS.map(([t, k], i) => `<button type="button" aria-pressed="${i === sel}">${t}<small>${k}</small></button>`).join('')}</span>`
export const MEMCOLS = ['生命', 'AC', '被动察觉', '']
export const memSec = (title, count, { check, drag, n } = {}) => `<div class="sh-sec sh-sec--mem"${check ? ' data-check=""' : ''}${drag ? ' data-drag=""' : ''}>${check || drag ? '<span></span>' : ''}<b style="grid-column:span 2">${P(n)}${title} <small>${count}</small></b><span>生命</span><span>AC</span><span class="sh-pp">被动察觉</span><span></span></div>`

/** 成员行：头像 · 名字 + 职业等级 / 种族 + 标签 · 生命条 · AC 盾 · 被动察觉 · ⋯ */
export function mem(o) {
  const { name, en, cls, lv, race, tags = [], hp, temp = 0, ac, pp, check, drag, building, warn, enemy, n, nHp, nMore } = o
  const chk = check != null ? `<span class="trpg-check" data-on="${!!check}"><span class="trpg-check__box">${check ? icon('check', 12) : ''}</span></span>` : ''
  const handle = drag ? `<span class="sh-handle">${icon('dots-six-vertical', 18)}</span>` : ''
  const tagHtml = [...(building ? [`<span class="sh-tag" data-tone="build">建卡中 ${building}</span>`] : []), ...(warn ? [`<span class="sh-tag" data-tone="warn">${warn}</span>`] : []), ...tags.map((t) => `<span class="sh-tag">${t}</span>`)].join('')
  const who = `<span class="sh-who"><b>${P(n)}${name}${en ? `<small>${en}</small>` : ''}</b><span>${cls ?? ''}${lv ? ` ${lv}` : ''}${race ? `<em>${race}</em>` : ''}</span>${tagHtml ? `<span class="sh-tags">${tagHtml}</span>` : ''}</span>`
  const hpc = building ? `<span class="sh-hpc">${btn('继续建卡', { small: true })}</span>` : `<span class="sh-hpc">${P(nHp)}<b>${hp[0]}<i> / ${hp[1]}${temp ? ` +${temp}` : ''}</i></b>${bar(hp[0], hp[1], temp)}</span>`
  return `<div class="sh-mem"${check != null ? ` data-check="${!!check}"` : ''}${drag ? ` data-drag="${drag}"` : ''}>${chk}${handle}<span class="sh-face">${icon(enemy ? 'skull' : 'user', 22)}</span>${who}${hpc}${building ? '<span></span>' : `<span class="sh-ac">${ac}</span>`}<span class="sh-cell sh-pp">${building ? '' : pp ?? '—'}</span>${more(nMore)}</div>`
}

/** 列表页：顶行 = 分类分段 · 搜索 · [排序] [选择] [＋ 新建]；下面 = 分组表。点一行 = 进整页详情。 */
export function listPage({ tab = 0, body, selbar, foot, search = '搜名字、职业、标签（全部分类一起搜）', sort = '手动', newMenu = '', pins = {} }) {
  const top = selbar ?? `<div class="sh-ltop">${cats(tab, pins.cats)}${searchBox(search, pins.search)}<span class="sh-ltop__end">${btn(`排序：${sort}`, { small: true, ic: 'caret-down', n: pins.sort })}${btn('选择', { small: true, n: pins.sel })}${btn('新建', { primary: true, ic: 'plus', n: pins.add })}${newMenu}</span></div>`
  return `<div class="sh-root">${top}<div class="sh-scroll">${body}</div>${foot ?? ''}</div>`
}

/* ---------- 弹窗外壳：建卡向导 / 选资料都用（左栏可有可无） ---------- */
export const wzModal = (title, inner, { variant = 'sheet', n } = {}) => `<div class="wz-modal">${mdl(variant, mh(title, { n }), inner)}</div>`
