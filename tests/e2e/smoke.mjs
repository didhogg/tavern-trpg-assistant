// 端到端测试：在模拟宿主页中跑扩展的真实构建产物，覆盖 Chrome 与 WebKit（TauriTavern 用 WebKit 内核）。
// 不能代替真机验证。
import { chromium, webkit } from 'playwright-core'
import { join } from 'node:path'
import { check, failures } from './helpers.mjs'
import { startServer, root } from './server.mjs'
import { probeSuite } from './suite-probes.mjs'
import { diceSuite } from './suite-dice.mjs'
import { execFileSync } from 'node:child_process'
import { mkdtempSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { savesSuite } from './suite-saves.mjs'
import { librarySuite } from './suite-library.mjs'
import { healthSuite, mineSuite, variantsSuite } from './suite-library2.mjs'
import { shellSuite } from './suite-shell.mjs'
import { wizardSuite } from './suite-wizard.mjs'

const chrome = process.env.CHROME_PATH ?? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
const engines = [
  ['chrome', () => chromium.launch({ executablePath: chrome, headless: true })],
  ['webkit', () => webkit.launch({ headless: true })],
]
const views = [['desktop', 1440, 900], ['narrow', 390, 780]]
const only = process.env.E2E_SUITE
const fixtureDir = mkdtempSync(join(tmpdir(), 'trpg-e2e-'))
execFileSync('npx', ['tsx', join(root, 'tests/e2e/make-fixtures.ts'), fixtureDir], { stdio: 'inherit' })
const fixture = join(fixtureDir, 'variants.trpgpack')
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
        const page = await context.newPage()
        const errors = []
        page.on('pageerror', (e) => errors.push(e.message))
        // 断网测试会故意让下载失败，这类日志不算脚本错误
        page.on('console', (m) => m.type() === 'error' && !/net::ERR_FAILED|安装失败：dnd5e2014-scag/.test(m.text()) && errors.push(m.text()))
        await page.goto(url)
        await page.waitForSelector('#trpg-assistant-root', { state: 'attached' })
        check(`[${label}] 扩展挂载`, true)
        await page.locator('.trpg-ball').click()
        await page.waitForSelector('.trpg-window')
        check(`[${label}] 点击悬浮球打开窗口`, await page.locator('.trpg-window').isVisible())
        const ctx = { width, height, engine, viewLabel, scheme, url, fixture }
        if (!only || only === 'shell') await shellSuite(page, label, ctx)
        if (!only || only === 'dice') await diceSuite(page, label, ctx)
        if (!only || only === 'wizard' || only === 'saves' || only === 'library') await wizardSuite(page, label, ctx)
        if (!only || only === 'saves') await savesSuite(page, label, ctx)
        if (!only || only === 'library') {
          await librarySuite(page, label, ctx)
          await mineSuite(page, label, ctx)
          await healthSuite(page, label, ctx)
          await variantsSuite(page, label, ctx)
        }
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
