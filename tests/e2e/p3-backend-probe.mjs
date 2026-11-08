// P3 收尾：真机验证入口（设置 › 诊断 › P3 全线后端真机验证）在模拟酒馆页里按顺序点一遍：
// ①装中英官方 → ②全线验证 → ③存储空间 → 断网、重开页面 → ②再点一次（断网全线验证）。
// 用插件真实产物（dist/index.js，先 npm run build），证明服务入口能按自己的位置找到作者程序和结算内核文件。
// 装官方每步最多等 10 分钟、其余每步最多 5 分钟；进度文字一变就打印，等不到就报出卡在哪一步。ENGINE=chrome 只跑一种；FRESH=1 清空浏览器资料重装。
import { mkdir, rm, writeFile } from 'node:fs/promises'
import { chromium, webkit } from 'playwright-core'
import { openDiagnostics } from './helpers.mjs'
import { root, startServer } from './server.mjs'

const work = `${root}work/e2e-p3-backend`
await mkdir(work, { recursive: true })
const { server, url } = await startServer()
const engines = [['chrome', chromium, { executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true }], ['webkit', webkit, { headless: true }]]
const LIMIT = { install: 10 * 60_000, other: 5 * 60_000 }
const section = (page) => page.locator('section.probe').filter({ hasText: 'P3 全线后端真机验证' })
// 还没点过按钮时页面上没有结果这一行；先数一下再读，免得 innerText 一直等元素出现（曾因此干等 20 分钟）
const summary = async (page) => {
  const el = section(page).locator('.probe__summary')
  return (await el.count()) ? el.innerText() : ''
}
const press = async (page, name, limit = LIMIT.other) => {
  const before = await summary(page)
  await section(page).getByRole('button', { name }).click()
  const t0 = Date.now()
  let last = ''
  for (;;) {
    const now = await summary(page)
    if (now !== last) { console.log(`  [${Math.round((Date.now() - t0) / 1000)}s] ${now}`); last = now }
    if (now && now !== before && !/进行中|安装 /.test(now)) return now
    if (Date.now() - t0 > limit) throw new Error(`“${name}”等了 ${limit / 60000} 分钟没结果，最后显示：${now}`)
    await page.waitForTimeout(500)
  }
}
/** 诊断页“详情”里的原样数据（每步耗时、重建比对）。 */
// “详情”默认折叠，innerText 读不到折叠内容，用 textContent
const detail = async (page) => {
  const pre = section(page).locator('details pre')
  return (await pre.count()) ? JSON.parse(await pre.textContent()) : null
}
async function open(type, options, profile, online) {
  const ctx = await type.launchPersistentContext(profile, { ...options, viewport: { width: 1440, height: 900 } })
  const page = await ctx.newPage()
  page.setDefaultTimeout(LIMIT.other)
  const errors = []
  page.on('pageerror', (e) => { errors.push(e.message); console.log(`  [页面报错] ${e.message.slice(0, 200)}`) })
  page.on('console', (m) => { if (m.type() === 'error') console.log(`  [控制台] ${m.text().slice(0, 200)}`) })
  const blocked = new Set()
  if (!online) await page.route((u) => !u.href.startsWith(url), (r) => { blocked.add(r.request().url()); return r.abort() })
  await page.goto(url)
  await page.locator('.trpg-ball').click()
  await openDiagnostics(page)
  return { ctx, page, errors, blocked }
}
// 已单列的报错（交接文档）：结算小窗 0×0 尺寸提示、Plutonium 可缺后端 404、界面空类“需玩家输入”、作者导航索引。
const known = (e) => /requires usable window dimensions|api\/plutonium|status of 404|KERNEL_NEEDS_INPUT|gendata-nav-adventure-book-index|Failed to place measured template/.test(e)
const results = []
for (const [name, type, options] of engines) {
  if (process.env.ENGINE && process.env.ENGINE !== name) continue
  const profile = `${work}/profile-${name}`
  if (process.env.FRESH === '1') await rm(profile, { recursive: true, force: true })
  const r = { engine: name }
  let s = await open(type, options, profile, true)
  try {
    r.install = await press(s.page, '①装中英官方', LIMIT.install * 2)
    r.chain = await press(s.page, /②全线验证/)
    r.chainDetail = await detail(s.page)
    r.space = await press(s.page, '③存储空间')
  } finally { r.errors1 = s.errors; await s.ctx.close() }
  s = await open(type, options, profile, false)
  try {
    r.offlineChain = await press(s.page, /②全线验证/)
    r.offlineDetail = await detail(s.page)
  } finally { r.errors2 = s.errors; r.blockedUrls = [...s.blocked]; await s.ctx.close() }
  r.unexplained = [...r.errors1, ...r.errors2].filter((e) => !known(e))
  r.passed = /中英官方都装好/.test(r.install) && /^全线通过/.test(r.chain) && /^全线通过/.test(r.offlineChain) && !r.unexplained.length
  results.push(r)
  console.log(JSON.stringify(r, null, 1))
}
await writeFile(`${work}/p3-backend-probe.json`, JSON.stringify(results, null, 2))
server.close()
if (!results.length || results.some((r) => !r.passed)) process.exitCode = 1
