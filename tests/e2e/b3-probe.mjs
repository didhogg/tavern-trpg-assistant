// B3：真机验证入口（设置 › 诊断 ›【库】真机验证）在模拟酒馆页里按顺序点一遍：装中文官方 → 体检 → 查一本书 → 断网重开再查 → 存储空间。
// 证明插件真实产物（dist/index.js）能按自己的位置找到作者程序（vendor/）。ENGINE=chrome 只跑一种。
import { mkdir, rm, writeFile } from 'node:fs/promises'
import { chromium, webkit } from 'playwright-core'
import { openDiagnostics } from './helpers.mjs'
import { root, startServer } from './server.mjs'

const work = `${root}work/e2e-b3`
await mkdir(work, { recursive: true })
const { server, url } = await startServer()
const engines = [['chrome', chromium, { executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true }], ['webkit', webkit, { headless: true }]]
const section = (page) => page.locator('section.probe').filter({ hasText: '【库】真机验证' })
// 还没点过按钮时页面上没有结果这一行；先数一下再读，免得 innerText 一直等元素出现
const summary = async (page) => {
  const el = section(page).locator('.probe__summary')
  return (await el.count()) ? el.innerText() : ''
}
const press = async (page, name, wait = 900000) => {
  const before = await summary(page)
  await section(page).getByRole('button', { name }).click()
  const t0 = Date.now()
  for (;;) {
    const now = await summary(page)
    if (now && now !== before && !/正在|安装中/.test(now)) return now
    if (Date.now() - t0 > wait) throw new Error(`等不到结果：${now}`)
    await page.waitForTimeout(500)
  }
}
async function open(type, options, profile, online) {
  const ctx = await type.launchPersistentContext(profile, { ...options, viewport: { width: 1440, height: 900 } })
  const page = await ctx.newPage()
  page.setDefaultTimeout(900000)
  const errors = []
  page.on('pageerror', (e) => errors.push(e.message))
  if (!online) await page.route((u) => !u.href.startsWith(url), (r) => r.abort())
  await page.goto(url)
  await page.locator('.trpg-ball').click()
  await openDiagnostics(page)
  return { ctx, page, errors }
}
// 已单列（a 段驾驶员定）：插件启动时骰盘的作者小窗读作者导航索引，【库】还没装时读不到
const known = (e) => e.includes('gendata-nav-adventure-book-index.json')
const results = []
for (const [name, type, options] of engines) {
  if (process.env.ENGINE && process.env.ENGINE !== name) continue
  const profile = `${work}/profile-${name}`
  await rm(profile, { recursive: true, force: true })
  const r = { engine: name }
  let s = await open(type, options, profile, true)
  try {
    r.install = await press(s.page, '①装中文官方')
    r.health = await press(s.page, '②体检')
    r.book = await press(s.page, /③查一本书/)
  } finally { r.errors1 = s.errors; await s.ctx.close() }
  s = await open(type, options, profile, false)
  try {
    r.offlineBook = await press(s.page, /③查一本书/)
    r.space = await press(s.page, '⑤存储空间')
  } finally { r.errors2 = s.errors; await s.ctx.close() }
  r.passed = /安装成功/.test(r.install) && /error 0/.test(r.health) && /火球术详情取到/.test(r.book) && /火球术详情取到/.test(r.offlineBook) && !r.errors1.filter((e) => !known(e)).length && !r.errors2.filter((e) => !known(e)).length
  results.push(r)
  console.log(JSON.stringify(r, null, 1))
}
await writeFile(`${work}/b3-probe.json`, JSON.stringify(results, null, 2))
server.close()
if (!results.length || results.some((r) => !r.passed)) process.exitCode = 1
