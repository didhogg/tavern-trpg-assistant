// 生成 P6 人物线框：node docs/design/p6-wireframe/build.mjs [--shots] [--only=p6-6]
// 做法同 P5 线框：每屏一份定义（screens/*.mjs）→ out/<屏>.html（多宽度并排 + 标注表）、index.html 总览；--shots 截图（需要本机 Chrome）。
import { mkdir, rm, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { CSS, DEFAULT_FRAMES, PAGE_CSS, frameHtml } from './lib/frame.mjs'
import { esc } from '../p5-wireframe/lib/ui.mjs'
import { screens as list } from './screens/list.mjs'
import { screens as create } from './screens/create.mjs'
import { screens as det } from './screens/detail.mjs'
import { screens as flows } from './screens/flows.mjs'

const here = dirname(fileURLToPath(import.meta.url))
const out = join(here, 'out')
const shots = join(here, 'shots')
const all = [...list, ...create, ...det, ...flows]

const bold = (t) => String(t).replace(/\*\*(.+?)\*\*/g, '<b>$1</b>')
const facts = (s) => `<dl class="wf-facts"><dt>流程</dt><dd>${esc(s.flow)}</dd><dt>用户目标</dt><dd>${esc(s.goal)}</dd><dt>主动作</dt><dd>${esc(s.primary)}</dd><dt>模式栈</dt><dd>${esc(s.patterns)}</dd><dt>法则核对</dt><dd>${esc(s.laws)}</dd>${s.diff ? `<dt>三宽度差异</dt><dd>${esc(s.diff)}</dd>` : ''}</dl>`
// 第 5 列「详细接口」按驾驶员 2026-11-15 的要求先留空：查完后端（P6-1）再填
const notes = (s) => `<table class="wf-cols5"><thead><tr><th>#</th><th>元素</th><th>行为 / 去向</th><th>需求 · 依赖缺口（P6-1 / P6-2）</th><th>详细接口（留空，查后端后填）</th></tr></thead><tbody>${s.notes.map(([n, a, b, c]) => `<tr><td>${n}</td><td>${bold(a)}</td><td>${bold(b)}</td><td>${bold(c ?? '')}</td><td></td></tr>`).join('')}</tbody></table>`

function board(s) {
  const frames = s.board ? s.board() : (s.frames ?? DEFAULT_FRAMES).map((k) => frameHtml(k, s)).join('')
  return `<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><title>${esc(s.title)} · P6 线框</title><style>${PAGE_CSS}${CSS}</style></head><body><div class="wf-board ds-root" style="background:#f4f1ea">
<h1>${esc(s.title)}</h1><p class="wf-meta">${esc(s.group)} · 配色 A（P4）· 样式 = 插件真实样式 + P6-4 设计系统 · 内容只表达结构、层级、控件位置；名字取自 U6 视觉规格示例，数值是占位示例，真实显示由内核给</p>
<div class="wf-row">${frames}</div><div class="wf-notes">${facts(s)}${notes(s)}</div></div></body></html>`
}

function index() {
  const groups = [...new Set(all.map((s) => s.group))]
  const body = groups.map((g) => `<h2>${esc(g)}</h2><div class="grid">${all.filter((s) => s.group === g).map((s) => `<a class="card" href="out/${s.id}.html"><img src="shots/${s.id}.png" alt="" loading="lazy"><span>${esc(s.title)}</span></a>`).join('')}</div>`).join('')
  return `<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><title>P6 人物线框总览</title><style>body{font-family:'PingFang SC',system-ui,sans-serif;margin:0;background:#f4f1ea;color:#3e332e}main{padding:24px 32px}.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(360px,1fr));gap:16px}.card{display:grid;gap:6px;color:inherit;text-decoration:none;border:1px solid #d9cfbf;border-radius:10px;background:#fff;padding:8px}.card img{width:100%;border-radius:6px;border:1px solid #eee}</style></head><body><main>
<h1>P6 人物线框（2026-11-15）</h1><p>共 ${all.length} 屏。外壳按窗口宽分档（≥720 宽 / 481–720 中 / ≤480 窄）；人物区按“面板宽”再分档：面板 ≥720 列表 + 详情并排，否则整页下钻。依据：P6-3（v2 + 已定决定优先）、P6-4 设计系统。「详细接口」一栏先留空。</p>${body}</main></body></html>`
}

await rm(out, { recursive: true, force: true })
await mkdir(out, { recursive: true })
for (const s of all) await writeFile(join(out, `${s.id}.html`), board(s))
await writeFile(join(here, 'index.html'), index())
console.log(`生成 ${all.length} 屏 → ${out}`)

if (process.argv.includes('--shots')) {
  const { chromium } = await import('playwright-core')
  const only = process.argv.find((a) => a.startsWith('--only='))?.slice(7)
  if (!only) await rm(shots, { recursive: true, force: true })
  await mkdir(shots, { recursive: true })
  const browser = await chromium.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true })
  const page = await browser.newPage({ viewport: { width: 2900, height: 1000 }, deviceScaleFactor: 1 })
  for (const s of all.filter((x) => !only || x.id.startsWith(only))) {
    await page.goto(`file://${join(out, `${s.id}.html`)}`)
    await page.screenshot({ path: join(shots, `${s.id}.png`), fullPage: true })
  }
  await browser.close()
  console.log(`截图 → ${shots}`)
}
