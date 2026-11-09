// 端到端测试：在模拟宿主页中跑扩展的真实构建产物，覆盖 Chrome 与 WebKit（TauriTavern 用 WebKit 内核）。
// 不能代替真机验证。
import { chromium, webkit } from 'playwright-core'
import { join } from 'node:path'
import { check, failures } from './helpers.mjs'
import { startServer, root } from './server.mjs'
import { probeSuite } from './suite-probes.mjs'
import { diceSuite } from './suite-dice.mjs'
import { savesSuite } from './suite-saves.mjs'
import { shellSuite } from './suite-shell.mjs'
import { wizardSuite } from './suite-wizard.mjs'
import { wizardBooksSuite } from './suite-wizard-books.mjs'

const chrome = process.env.CHROME_PATH ?? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
const engines = [
  ['chrome', () => chromium.launch({ executablePath: chrome, headless: true })],
  ['webkit', () => webkit.launch({ headless: true })],
]
const views = [['desktop', 1440, 900], ['narrow', 390, 780]]
const only = process.env.E2E_SUITE
const { server, url } = await startServer()

try {
  for (const [engine, launch] of engines) {
    if (process.env.E2E_ENGINE && process.env.E2E_ENGINE !== engine) continue
    const browser = await launch()
    for (const [viewLabel, width, height] of views) {
      if (process.env.E2E_VIEW && process.env.E2E_VIEW !== viewLabel) continue
      for (const scheme of ['light', 'dark']) {
        if (process.env.E2E_SCHEME && process.env.E2E_SCHEME !== scheme) continue
        const label = `${engine}/${viewLabel}/${scheme}`
        const context = await browser.newContext({ viewport: { width, height }, colorScheme: scheme })
        // 默认断开所有外网：向导里的书目 / 下载走联网，测试里不能真去 GitHub（有限流）也不能下 150 MB；联网路径单独用 E2E_NET=1 跑一次
        if (!process.env.E2E_NET) await context.route((u) => !['127.0.0.1', 'localhost'].includes(u.hostname), (r) => r.abort())
        const page = await context.newPage()
        const errors = []
        page.on('pageerror', (e) => errors.push(e.message))
        if (process.env.E2E_DEBUG404) page.on('response', (r) => r.status() === 404 && console.log('404', r.url()))
        page.on('console', (m) => m.type() === 'error' && errors.push(m.text()))
        await page.goto(url)
        await page.waitForSelector('#trpg-assistant-root', { state: 'attached' })
        check(`[${label}] 扩展挂载`, true)
        await page.locator('.trpg-ball').click()
        await page.waitForSelector('.trpg-window')
        check(`[${label}] 点击悬浮球打开窗口`, await page.locator('.trpg-window').isVisible())
        const ctx = { width, height, engine, viewLabel, scheme, url }
        if (!only || only === 'shell') await shellSuite(page, label, ctx)
        if (!only || only === 'dice') await diceSuite(page, label, ctx)
        if (!only || only === 'wizard' || only === 'saves') await wizardSuite(page, label, ctx)
        if (process.env.E2E_NET && (!only || only === 'books')) await wizardBooksSuite(page, label, ctx)
        if (!only || only === 'saves') await savesSuite(page, label, ctx)
        if (scheme === 'light' && (!only || only === 'probes')) await probeSuite(page, label, ctx)
        await page.screenshot({ path: join(root, `docs/reviews/M3-${engine}-${viewLabel}-${scheme}.png`) })
        // 已知现象（驾驶员 2026-11-07 定单列）：模拟酒馆没装【库】，作者小窗里的作者导航程序读不到这个作者数据文件；
        // 骰子不受影响。只放行这一个文件，其余报错一律算失败。
        // 另一类已知现象：测试默认断外网（见上），开局后的后台下载会失败，浏览器和【库】会报这些；结算内核启动时会探一个没有的 plutonium 接口（404）和隐藏小窗尺寸提示
        const offline = (e) => /net::ERR_FAILED|Failed to fetch|Load failed|\[trpg-library\] 小窗要求处理失败|后台下载有问题|Foundry Virtual Tabletop requires usable window|status of 404/.test(e)
        const known = (e) => /文件不存在：data\/generated\/gendata-nav-adventure-book-index\.json/.test(e) || (!process.env.E2E_NET && offline(e))
        const known404 = errors.filter(known)
        if (known404.length) console.log(`NOTE  [${label}] 未装【库】时作者导航读不到 gendata-nav-adventure-book-index.json（${known404.length} 条，单列）`)
        check(`[${label}] 页面无脚本错误`, errors.filter((e) => !known(e)).length === 0, errors.filter((e) => !known(e)).join(' | '))
        await context.close()
      }
    }
    await browser.close()
  }
} finally {
  server.close()
}
if (failures.length) {
  console.error(`\n${failures.length} 项失败`)
  process.exit(1)
}
