// 向导联网路径（E2E_NET=1，只在 Chrome 宽屏浅色跑一次：会取书目，GitHub 目录树接口每小时 60 次，别连跑）。
import { check, modalCount, settle } from './helpers.mjs'

export async function wizardBooksSuite(page, label, { width, engine, scheme }) {
  if (width <= 480 || engine !== 'chrome' || scheme !== 'light') return
  // 上一个套件可能已经开了战役；这里从抽屉进向导，只看书目与冒险，最后 ✕ 关掉（不真的开局，免得下载 150 MB）
  const campaignOpen = (await page.getByTestId('banner').count()) > 0
  if (campaignOpen) {
    await page.getByTestId('save-chip').click()
    await page.getByTestId('drawer-new').click()
  } else await page.getByTestId('start-banner').click()
  await page.getByTestId('wizard').waitFor()
  await page.getByTestId('wizard-next').click() // ② 版本（5e 预选）
  await page.getByTestId('wizard-next').click() // ③ 资料
  await page.getByTestId('wizard-shelf').waitFor({ timeout: 60000 })
  await page.locator('[data-testid=wizard-filter] button', { hasText: '全部' }).click()
  const groups = await page.locator('[data-testid=wizard-shelf] .trpg-shelf__group').count()
  check(`[${label}] 联网：书和冒险按作者分组出现在同一个列表（${groups} 组）`, groups >= 3 && (await page.locator('[data-testid=wizard-row][data-kind=adventure]').count()) > 0)
  const on = await page.locator('[data-testid=wizard-row] .trpg-check[data-on="true"]:not([data-dl])').count()
  check(`[${label}] 没下载的默认一本不勾（${on}）`, on === 0)
  const row = page.locator('[data-testid=wizard-row][data-kind=book]').filter({ has: page.locator('.trpg-check:not([data-dl])') }).first()
  const box = row.locator('.trpg-check')
  await row.evaluate((el) => el.closest('details').open = true)
  await box.click()
  await settle(page, 150)
  check(`[${label}] 勾一本书：立刻反映，底部「已选 1 项」`, (await box.getAttribute('data-on')) === 'true' && (await page.getByTestId('wizard-picked').innerText()).includes('已选 1 项'))
  await page.waitForFunction(() => /约 [\d.]+ (KB|MB) 需下载|大小暂时未知|已就绪/.test(document.getElementById('trpg-assistant-root').shadowRoot.querySelector('[data-testid=wizard-picked]')?.textContent ?? ''), null, { timeout: 60000 })
  const picked = await page.getByTestId('wizard-picked').innerText()
  check(`[${label}] 底部写出这一本的下载大小（约 xx KB/MB）`, /约 [\d.]+ (KB|MB) 需下载/.test(picked), picked)
  await page.getByTestId('wizard-next').click()
  await page.getByTestId('wizard-summary').waitFor()
  check(`[${label}] 摘要写「选中 1 本」`, (await page.getByTestId('wizard-summary').innerText()).includes('选中 1 本'), await page.getByTestId('wizard-summary').innerText())
  await page.locator('.trpg-modal__close').click()
  await settle(page)
  check(`[${label}] ✕ 关闭，没有开局`, (await modalCount(page)) === 0)
}
