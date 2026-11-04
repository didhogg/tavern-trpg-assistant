// T0：把 artifact「人物详情画板」（docs/reference/人物详情画板.html）的各画板渲染成参考图。
// 用法：npx tsx tests/e2e/shots-artifact.mjs      输出：docs/probes/U5R2_参考图/<画板>-<宽度>.png
import { mkdirSync } from 'node:fs'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'
import { chromium } from 'playwright-core'

const root = process.cwd()
const chrome = process.env.CHROME_PATH ?? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
const html = pathToFileURL(join(root, 'docs/reference/人物详情画板.html')).href
const out = join(root, 'docs/probes/U5R2_参考图')
mkdirSync(out, { recursive: true })
const views = [['角色'], ['敌人'], ['新人物'], ['手机'], ['抽屉与弹窗'], ['骰盘'], ['状态与反馈'], ['对照清单']]
const sizes = [[1440, 900], [1000, 800], [390, 780]]

const browser = await chromium.launch({ executablePath: chrome, headless: true })
for (const [w, h] of sizes) {
  const page = await browser.newPage({ viewport: { width: w, height: h } })
  await page.goto(html, { waitUntil: 'load' })
  await page.evaluate(() => document.fonts?.ready)
  for (const [name] of views) {
    await page.locator('.vt button', { hasText: name }).first().click()
    await page.waitForTimeout(350)
    await page.screenshot({ path: join(out, `${name}-${w}.png`), fullPage: true })
    console.log('已存', `${name}-${w}.png`)
    if (name === '抽屉与弹窗') {
      // 入口画板：每个弹窗点开截一张（视口截图，弹窗是固定定位的遮罩层）
      const tiles = page.locator('.launch button')
      const n = await tiles.count()
      for (let i = 0; i < n; i++) {
        const title = (await tiles.nth(i).locator('b').innerText()).replace(/[\s/·]+/g, '')
        await tiles.nth(i).click()
        await page.waitForTimeout(450)
        await page.screenshot({ path: join(out, `弹窗-${title}-${w}.png`) })
        console.log('已存', `弹窗-${title}-${w}.png`)
        await page.keyboard.press('Escape')
        await page.waitForTimeout(150)
        if (await page.locator('.scrim').count()) await page.locator('.scrim .dh button').first().click().catch(() => page.mouse.click(4, 4))
        await page.waitForTimeout(150)
      }
    }
  }
  await page.close()
}
await browser.close()
