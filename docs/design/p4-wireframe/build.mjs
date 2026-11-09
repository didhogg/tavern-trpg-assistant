// 生成线框：node docs/design/p4-wireframe/build.mjs [--shots]
// 每个屏幕一份定义（screens/*.mjs），自动出三宽度（1440 / 900 / 390，部分加 600 中布局）的 HTML 板；--shots 同时截图。
import { mkdir, rm, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { DEFAULT_FRAMES, PAGE_CSS, frameHtml } from './lib/frame.mjs'
import { esc } from './lib/ui.mjs'
import { screens as home } from './screens/home.mjs'
import { screens as wizard } from './screens/wizard.mjs'
import { screens as drawer } from './screens/drawer.mjs'
import { screens as misc } from './screens/misc.mjs'

const here = dirname(fileURLToPath(import.meta.url))
const out = join(here, 'out')
const shots = join(here, 'shots')
const all = [...home, ...wizard, ...drawer, ...misc]

const facts = (s) => `<dl class="wf-facts"><dt>流程</dt><dd>${esc(s.flow)}</dd><dt>用户目标</dt><dd>${esc(s.goal)}</dd><dt>主动作</dt><dd>${esc(s.primary)}</dd><dt>模式栈</dt><dd>${esc(s.patterns)}</dd><dt>法则核对</dt><dd>${esc(s.laws)}</dd>${s.diff ? `<dt>宽度差异</dt><dd>${esc(s.diff)}</dd>` : ''}</dl>`
const notes = (s) => `<table><thead><tr><th>#</th><th>元素</th><th>行为 / 去向</th><th>状态 · 后端</th></tr></thead><tbody>${s.notes.map(([n, a, b, c]) => `<tr><td>${n}</td><td>${a}</td><td>${b}</td><td>${c}</td></tr>`).join('')}</tbody></table>`

function board(s) {
  const frames = s.board ? s.board() : (s.frames ?? DEFAULT_FRAMES).map((k) => frameHtml(k, s)).join('')
  return `<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><title>${esc(s.title)} · P4 线框</title><link rel="stylesheet" href="../wireframe.css"><style>${PAGE_CSS}</style></head><body><div class="wf-board">
<h1>${esc(s.title)}</h1><p class="wf-meta">${esc(s.group)} · 灰度线框（只表达结构、层级、密度、控件位置；颜色、字体留给 Gate 4）</p>
<div class="wf-row">${frames}</div><div class="wf-notes">${facts(s)}${notes(s)}</div></div></body></html>`
}

function index() {
  const groups = [...new Set(all.map((s) => s.group))]
  const body = groups.map((g) => `<h2>${esc(g)}</h2><div class="grid">${all.filter((s) => s.group === g).map((s) => `<a class="card" href="out/${s.id}.html"><img src="shots/${s.id}.png" alt="" loading="lazy"><b>${esc(s.title)}</b><span>${esc(s.flow)}</span></a>`).join('')}</div>`).join('')
  return `<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><title>P4 灰度线框总览</title><style>body{font-family:'PingFang SC',system-ui,sans-serif;margin:0;background:#fafafa;color:#1a1a1a}main{max-width:1500px;margin:0 auto;padding:28px 32px 60px}h1{margin:0 0 6px}p{color:#555;max-width:900px}h2{margin:30px 0 10px;border-bottom:2px solid #333;padding-bottom:4px}.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(360px,1fr));gap:16px}.card{display:grid;gap:4px;border:1.5px solid #999;border-radius:8px;padding:10px;background:#fff;color:inherit;text-decoration:none}.card img{width:100%;height:190px;object-fit:cover;object-position:left top;border:1px solid #ccc;background:#eee}.card span{color:#666;font-size:12px}</style></head><body><main>
<h1>P4 灰度线框（Gate 3）</h1><p>共 ${all.length} 屏，每屏三种宽度：1440（悬浮窗 960×640）、900（悬浮窗 868×640）、390（全屏，底部标签栏）；外壳和抽屉另加 600 宽的"中"布局。点卡片看大图和标注。类名沿用插件现有界面，可直接复制 HTML 进 Vue 组件；说明见 README.md。</p>${body}</main></body></html>`
}

await rm(out, { recursive: true, force: true })
await mkdir(out, { recursive: true })
for (const s of all) await writeFile(join(out, `${s.id}.html`), board(s))
await writeFile(join(here, 'index.html'), index())
console.log(`生成 ${all.length} 屏 → ${out}`)

if (process.argv.includes('--shots')) {
  const { chromium } = await import('playwright-core')
  await rm(shots, { recursive: true, force: true })
  await mkdir(shots, { recursive: true })
  const browser = await chromium.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true })
  const page = await browser.newPage({ viewport: { width: 2900, height: 1000 }, deviceScaleFactor: 1 })
  for (const s of all) {
    await page.goto(`file://${join(out, `${s.id}.html`)}`)
    await page.screenshot({ path: join(shots, `${s.id}.png`), fullPage: true })
  }
  await browser.close()
  console.log(`截图 ${all.length} 张 → ${shots}`)
}
