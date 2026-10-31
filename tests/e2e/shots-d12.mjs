// D1.2a R15：每种条目类型 2 条 + 带随机表术语的条目 3 条，900px 宽、深浅色各一张。用法：node tests/e2e/shots-d12.mjs
import { mkdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { chromium } from 'playwright-core'
import { root, startServer } from './server.mjs'

const chrome = process.env.CHROME_PATH ?? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
const out = join(root, 'docs/probes/D1.2_截图')
mkdirSync(out, { recursive: true })
const all = JSON.parse(readFileSync(join(out, '清单.json'), 'utf8'))
const only = process.env.ONLY
const list = only ? all.filter((item) => item.id === only) : all
const { server, url } = await startServer()
const browser = await chromium.launch({ executablePath: chrome, headless: true })
const wait = (page, ms = 400) => page.waitForTimeout(ms)
const problems = []
// 一层层关掉条目详情、包详情，回到扩展列表
const closeModals = async (page) => {
  for (const id of ['entry-detail', 'pack-detail']) {
    if (await page.getByTestId(id).isVisible()) { await page.keyboard.press('Escape'); await page.getByTestId(id).waitFor({ state: 'hidden', timeout: 5000 }) }
  }
}

try {
  for (const scheme of ['light', 'dark']) {
    const page = await (await browser.newContext({ viewport: { width: 900, height: 1000 }, colorScheme: scheme })).newPage()
    await page.goto(url)
    await page.locator('.trpg-ball').click()
    await page.getByTestId('start-banner').waitFor({ timeout: 30000 })
    await page.getByTestId('start-banner').click()
    await page.getByTestId('wizard').waitFor()
    await wait(page, 600)
    await page.getByTestId('wizard-next').click()
    await page.getByTestId('wizard-pack-dnd5e2014-phb').waitFor({ timeout: 30000 })
    await page.waitForFunction(() => {
      const r = document.getElementById('trpg-assistant-root').shadowRoot
      const metas = [...r.querySelectorAll('.trpg-wizard .trpg-row__meta')].map((e) => e.textContent)
      return metas.length >= 10 && !metas.some((t) => t.includes('未安装')) && !r.querySelector('.trpg-progress')
    }, null, { timeout: 120000 })
    await page.getByTestId('wizard-next').click()
    await wait(page, 600)
    await page.getByTestId('wizard-next').click()
    await page.getByTestId('banner-title').waitFor({ timeout: 60000 })
    await page.locator('.trpg-window nav').getByRole('button', { name: '库', exact: true }).click()
    await page.getByTestId('save-tab').waitFor()
    await page.getByRole('button', { name: '扩展', exact: true }).click()
    for (const [n, item] of list.entries()) {
      try {
        await page.getByTestId(`ext-${item.pack}`).locator('.trpg-term').click()
        await page.getByTestId('pack-detail').waitFor()
        await page.getByRole('searchbox', { name: '搜索条目' }).fill(item.name)
        await wait(page, 350)
        const rows = page.locator('.trpg-vlist__row .trpg-term')
        let hit = -1
        // 列表是虚拟滚动，只渲染可见的行：一屏屏往下翻找
        for (let pageNo = 0; pageNo < 20 && hit < 0; pageNo++) {
          const count = await rows.count()
          for (let i = 0; i < count; i++) if ((await rows.nth(i).innerText()).trim() === item.name) { hit = i; break }
          if (hit >= 0) break
          const moved = await page.locator('.trpg-vlist').evaluate((el) => { const before = el.scrollTop; el.scrollTop += el.clientHeight - 40; return el.scrollTop !== before })
          if (!moved) break
          await wait(page, 200)
        }
        if (hit < 0) { problems.push(`${item.id} 在列表里找不到「${item.name}」`); await page.keyboard.press('Escape'); continue }
        await rows.nth(hit).click()
        await page.getByTestId('entry-detail').waitFor()
        await wait(page, 500)
        await page.screenshot({ path: join(out, `${String(n + 1).padStart(2, '0')}-${item.type.replace(':', '-')}-${item.id}-${scheme}.png`) })
        await closeModals(page)
      } catch (error) {
        problems.push(`${item.id}：${error instanceof Error ? error.message.split('\n')[0] : error}`)
        await closeModals(page).catch(() => undefined)
      }
    }
    await page.context().close()
  }
} finally {
  await browser.close()
  server.close()
}
console.log(problems.length ? `有问题：\n${problems.join('\n')}` : '全部截图完成')
