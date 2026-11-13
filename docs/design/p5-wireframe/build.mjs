// 生成 P5 库页线框：node docs/design/p5-wireframe/build.mjs [--shots]
// 每屏一份定义（screens/*.mjs）→ out/<屏>.html（三宽度并排 + 标注表）、index.html 总览；--shots 同时截图（需要本机 Chrome）。
import { mkdir, rm, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { CSS, DEFAULT_FRAMES, PAGE_CSS, frameHtml } from './lib/frame.mjs'
import { esc } from './lib/ui.mjs'
import { screens as u1 } from './screens/u1.mjs'
import { screens as u2 } from './screens/u2.mjs'
import { screens as u3 } from './screens/u3.mjs'
import { screens as u4 } from './screens/u4.mjs'
import { screens as u5 } from './screens/u5.mjs'
import { screens as u6 } from './screens/u6.mjs'
import { screens as u7a } from './screens/u7a.mjs'
import { screens as u7b } from './screens/u7b.mjs'
import { screens as u8 } from './screens/u8.mjs'
import { screens as u0 } from './screens/u0.mjs'
import { screens as u9a } from './screens/u9a.mjs'
import { screens as u9b } from './screens/u9b.mjs'
import { screens as u9c } from './screens/u9c.mjs'

const here = dirname(fileURLToPath(import.meta.url))
const out = join(here, 'out')
const shots = join(here, 'shots')
const all = [...u0, ...u1, ...u2, ...u3, ...u4, ...u5, ...u6, ...u7a, ...u7b, ...u8, ...u9a, ...u9b, ...u9c]

const facts = (s) => `<dl class="wf-facts"><dt>流程</dt><dd>${esc(s.flow)}</dd><dt>用户目标</dt><dd>${esc(s.goal)}</dd><dt>主动作</dt><dd>${esc(s.primary)}</dd><dt>模式栈</dt><dd>${esc(s.patterns)}</dd><dt>法则核对</dt><dd>${esc(s.laws)}</dd>${s.diff ? `<dt>宽度差异</dt><dd>${bold(esc(s.diff))}</dd>` : ''}</dl>`
const bold = (t) => String(t).replace(/\*\*(.+?)\*\*/g, '<b>$1</b>')
const notes = (s) => `<table><thead><tr><th>#</th><th>元素</th><th>行为 / 去向</th><th>状态 · 后端入口</th></tr></thead><tbody>${s.notes.map(([n, a, b, c]) => `<tr><td>${n}</td><td>${bold(a)}</td><td>${bold(b)}</td><td>${bold(c)}</td></tr>`).join('')}</tbody></table>`

function board(s) {
  const frames = s.board ? s.board() : (s.frames ?? DEFAULT_FRAMES).map((k) => frameHtml(k, s)).join('')
  return `<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><title>${esc(s.title)} · P5 线框</title><style>${PAGE_CSS}${CSS}</style></head><body><div class="wf-board ds-root" style="background:transparent">
<h1>${esc(s.title)}</h1><p class="wf-meta">${esc(s.group)} · 配色 A（P4 定稿）· 样式 = 插件真实样式 · 内容只表达结构、层级、控件位置；条目里的文字是真实数据示例，真实显示由作者函数生成</p>
<div class="wf-row">${frames}</div><div class="wf-notes">${facts(s)}${notes(s)}</div></div></body></html>`
}

function index() {
  const groups = [...new Set(all.map((s) => s.group))]
  const body = groups.map((g) => `<h2>${esc(g)}</h2><div class="grid">${all.filter((s) => s.group === g).map((s) => `<a class="card" href="out/${s.id}.html"><img src="shots/${s.id}.png" alt="" loading="lazy"><b>${esc(s.title)}</b><span>${esc(s.flow)}</span></a>`).join('')}</div>`).join('')
  return `<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><title>P5 库页线框总览</title><style>body{font-family:'PingFang SC',system-ui,sans-serif;margin:0;background:#f4f1ea;color:#3e332e}main{max-width:1500px;margin:0 auto;padding:28px 32px 60px}h1{margin:0 0 6px}p{color:#6b5a4e;max-width:900px}h2{margin:30px 0 10px;border-bottom:2px solid #b43118;padding-bottom:4px}.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(360px,1fr));gap:16px}.card{display:grid;gap:4px;border:1px solid #d9cfbf;border-radius:8px;padding:10px;background:#fff;color:inherit;text-decoration:none}.card img{width:100%;height:190px;object-fit:cover;object-position:left top;border:1px solid #e7ddca;background:#eee}.card span{color:#6b5a4e;font-size:12px}</style></head><body><main>
<h1>P5 库页线框（Gate 2，2026-11-10 按 R23–R91 与 P5-1 后端改动重画）</h1><p>共 ${all.length} 屏，每屏三种宽度：1440（悬浮窗 960×640）、900（悬浮窗 868×640）、390（全屏，底部标签栏）。包 / 书 / 搜索是浮在整个插件窗口上的居中模态弹窗，窄屏是底部抽屉。配色 = P4 配色 A，样式 = 插件真实样式，类名沿用 trpg-*，库页新增的以 lib- 开头（见 p5.css）。点卡片看大图和标注；说明见 README.md。</p>${body}</main></body></html>`
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
