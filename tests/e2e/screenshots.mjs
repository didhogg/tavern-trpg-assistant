// 截图：关键界面 × 三种宽度 × 浅深色，保存到 docs/probes/M3_截图/。用法：npm run shots
import { mkdirSync } from 'node:fs'
import { join } from 'node:path'
import { chromium } from 'playwright-core'
import { root, startServer } from './server.mjs'
import { callStore } from './store.mjs'

const chrome = process.env.CHROME_PATH ?? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
const out = join(root, 'docs/probes/M3_截图')
mkdirSync(out, { recursive: true })
const { server, url } = await startServer()
const browser = await chromium.launch({ executablePath: chrome, headless: true })
const sizes = [['390', 390, 780], ['900', 900, 700], ['1440', 1440, 900]]
const goPage = (page, name) => page.locator('.trpg-window nav').getByRole('button', { name, exact: true }).click()
const wait = (page, ms = 500) => page.waitForTimeout(ms)

try {
  for (const scheme of ['light', 'dark']) {
    for (const [tag, width, height] of sizes) {
      const page = await (await browser.newContext({ viewport: { width, height }, colorScheme: scheme })).newPage()
      const shot = (name) => page.screenshot({ path: join(out, `${name}-${tag}-${scheme}.png`) })
      await page.goto(url)
      await page.locator('.trpg-ball').click()
      await page.getByTestId('start-banner').waitFor({ timeout: 30000 })
      await shot('01-首页-没有战役')
      await page.getByTestId('start-banner').click()
      await page.getByTestId('wizard').waitFor()
      await wait(page)
      await shot('02-向导-1规则')
      await page.getByTestId('wizard-next').click()
      await page.getByTestId('wizard-pack-dnd5e2014-phb').waitFor({ timeout: 30000 })
      await page.waitForFunction(() => {
        const r = document.getElementById('trpg-assistant-root').shadowRoot
        const metas = [...r.querySelectorAll('.trpg-wizard .trpg-row__meta')].map((e) => e.textContent)
        return metas.length >= 10 && !metas.some((t) => t.includes('未安装')) && !r.querySelector('.trpg-progress')
      }, null, { timeout: 90000 })
      await shot('03-向导-2资料')
      await page.getByTestId('wizard-next').click()
      await wait(page, 300)
      await shot('04-向导-4命名')
      await page.getByTestId('wizard-next').click()
      await page.getByTestId('banner-title').waitFor({ timeout: 30000 })
      await wait(page, 800)
      await shot('05-首页-战役概览')
      await callStore(page, 'campaign', (s) => { s.updateData((d) => ({ ...d, instances: [...d.instances, { id: 'x', type: 'monster', name: '怪', data: {} }] })) })
      await page.getByTestId('banner-title').click()
      await page.getByTestId('save-drawer').waitFor()
      await wait(page, 400)
      await shot('06-存档抽屉')
      await page.locator('.trpg-modal__close').click()
      await goPage(page, '库')
      await page.getByTestId('save-tab').waitFor()
      await wait(page, 800)
      await shot('07-库-本存档')
      await page.getByRole('button', { name: '扩展', exact: true }).click()
      await page.getByTestId('ext-dnd5e2014-phb').waitFor()
      await wait(page, 400)
      await shot('08-库-扩展')
      await page.getByTestId('ext-dnd5e2014-phb').locator('.trpg-term').click()
      await page.getByTestId('pack-detail').waitFor()
      await page.locator('.trpg-vlist__row').first().waitFor()
      await wait(page, 400)
      await shot('09-包详情弹窗')
      await page.locator('.trpg-vlist__row .trpg-term').first().click()
      await page.getByTestId('entry-detail').waitFor()
      await wait(page, 500)
      await shot('10-条目详情')
      await page.locator('.trpg-modal__close').click()
      await page.getByRole('button', { name: '我的', exact: true }).click()
      await wait(page, 300)
      await shot('11-库-我的')
      await page.getByRole('button', { name: '掷骰', exact: true }).click()
      await page.locator('.trpg-dice').getByRole('button', { name: 'd20', exact: true }).click()
      await wait(page, 400)
      await shot('12-骰盘悬浮窗')
      await page.getByRole('button', { name: '关闭掷骰' }).click()
      await goPage(page, '设置')
      await wait(page, 300)
      await shot('13-设置')
      await page.context().close()
    }
  }
} finally {
  await browser.close()
  server.close()
}
console.log(`截图已保存到 ${out}`)
