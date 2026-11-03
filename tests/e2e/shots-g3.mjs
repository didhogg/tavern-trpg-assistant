// G3 批 6 截图：表页、参考表、整页弹窗模式；头像不进入资料页（§12.7）。
import { mkdirSync } from 'node:fs'
import { join } from 'node:path'
import { chromium } from 'playwright-core'
import { root, startServer } from './server.mjs'
import { captureModal } from './fullpage.mjs'
import { closeModals, openEntry } from './open-entry.mjs'
import { clearToasts } from './helpers.mjs'

const chrome = process.env.CHROME_PATH ?? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
const out = join(root, 'docs/probes/G3_截图')
mkdirSync(out, { recursive: true })
const sizes = [['390', 390, 6000], ['900', 900, 6000], ['1440', 1440, 6000]]
const wait = (page, ms = 250) => page.waitForTimeout(ms)

async function installTablePack(page) {
  await page.getByRole('button', { name: '扩展', exact: true }).click()
  await page.getByTestId('ext-list').waitFor()
  // 截图需要 PHB 的身高/体重参考表。
  for (const [name, id] of [['玩家手册（2014）', 'dnd5e2014-phb']]) {
    await page.getByRole('searchbox', { name: '搜索扩展包' }).fill(name)
    await wait(page, 250)
    const pack = page.getByTestId(`ext-${id}`)
    if (await pack.getByRole('button', { name: /安装/ }).count()) {
      await pack.getByRole('button', { name: /安装/ }).click()
      await page.getByText(`已安装「${name}」`).waitFor({ timeout: 60000 })
      await wait(page, 350)
    }
  }
  await page.getByRole('searchbox', { name: '搜索扩展包' }).fill('')
  await clearToasts(page)

}
const { server, url } = await startServer()
const browser = await chromium.launch({ executablePath: chrome, headless: true })
const problems = []
try {
  for (const scheme of ['light', 'dark']) {
    for (const [tag, width, height] of sizes) {
      if (process.env.SHOT_TAG && process.env.SHOT_TAG !== tag) continue
      if (process.env.SHOT_SCHEME && process.env.SHOT_SCHEME !== scheme) continue
      const page = await (await browser.newContext({ viewport: { width, height }, colorScheme: scheme })).newPage()
      page.on('pageerror', (e) => problems.push(`${tag}/${scheme} 页面错误：${e.message}`))
      try {
        await page.goto(url)
        await page.locator('.trpg-ball').click()
        await page.locator('.trpg-window nav').getByRole('button', { name: '库', exact: true }).click()
        await page.getByTestId('library').waitFor()
        await installTablePack(page)
        const shot = async (name) => captureModal(page, join(out, `${name}-${tag}-${scheme}.png`))

        await openEntry(page, 'dnd5e2014-srd', '人类', '种族')
        await shot('01-人类-参考表本行')
        await page.getByTestId('ref-rows').getByRole('button', { name: '看完整表' }).first().click()
        await page.getByTestId('table-page').waitFor()
        await wait(page, 300)
        await shot('02-人类-完整身高量表')
        await closeModals(page)

        await openEntry(page, 'dnd5e2014-srd', '侍僧·特点', '随机表')
        await page.getByTestId('table-roll-header').click()
        await page.locator('.trpg-tablepage__table tr.is-hit').waitFor({ timeout: 5000 })
        await wait(page, 300)
        await shot('03-侍僧特点-掷表高亮')
      } catch (error) {
        problems.push(`${tag}/${scheme}：${error instanceof Error ? error.stack ?? error.message : error}`)
        await closeModals(page).catch(() => undefined)
      }
      await page.context().close()
    }
  }
} finally {
  await browser.close()
  server.close()
}
console.log(problems.length ? `有问题：\n${problems.join('\n')}` : `截图已保存到 ${out}`)
if (problems.length) process.exitCode = 1
