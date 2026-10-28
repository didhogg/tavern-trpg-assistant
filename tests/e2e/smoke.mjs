// 端到端测试：在模拟宿主页中跑扩展的真实构建产物，覆盖 Chrome 与 WebKit（TauriTavern 用 WebKit 内核）。
// 不能代替真机验证。
import { chromium, webkit } from 'playwright-core'
import { join } from 'node:path'
import { check, failures } from './helpers.mjs'
import { startServer, root } from './server.mjs'
import { probeSuite } from './suite-probes.mjs'
import { diceSuite } from './suite-dice.mjs'
import { shellSuite } from './suite-shell.mjs'

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
    const browser = await launch()
    for (const [viewLabel, width, height] of views) {
      for (const scheme of ['light', 'dark']) {
        const label = `${engine}/${viewLabel}/${scheme}`
        const context = await browser.newContext({ viewport: { width, height }, colorScheme: scheme })
        const page = await context.newPage()
        const errors = []
        page.on('pageerror', (e) => errors.push(e.message))
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
        if (scheme === 'light' && (!only || only === 'probes')) await probeSuite(page, label, ctx)
        await page.screenshot({ path: join(root, `docs/reviews/M3-${engine}-${viewLabel}-${scheme}.png`) })
        check(`[${label}] 页面无脚本错误`, errors.length === 0, errors.join(' | '))
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
