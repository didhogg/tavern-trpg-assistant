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
  await page.getByTestId('wizard-next').click()
  await page.getByTestId('wizard-shelf').waitFor({ timeout: 60000 })
  const groups = await page.locator('[data-testid=wizard-shelf] .trpg-shelf__group').count()
  check(`[${label}] 联网：书架按作者分组出现（${groups} 组），核心组默认展开`, groups >= 3 && (await page.locator('[data-testid=wizard-shelf] .trpg-shelf__group').first().getAttribute('open')) !== null)
  const row = page.locator('[data-testid=wizard-shelf] .trpg-shelf__row').first()
  const box = row.locator('.trpg-check')
  const before = await box.getAttribute('data-on')
  await box.click()
  await settle(page, 150)
  check(`[${label}] 勾选一本书：立刻反映（不重新读取），再点回去还原`, (await box.getAttribute('data-on')) !== before)
  await box.click()
  check(`[${label}] 再点一次回到原来的勾选`, (await box.getAttribute('data-on')) === before)
  await page.waitForFunction(() => /总下载约|已经在【库】里装好/.test(document.getElementById('trpg-assistant-root').shadowRoot.querySelector('[data-testid=wizard-size-hint]')?.textContent ?? ''), null, { timeout: 60000 })
  const hint = await page.getByTestId('wizard-size-hint').innerText()
  check(`[${label}] 说明里写出总下载大小（约 xx MB）`, /总下载约 \d+(\.\d)? MB/.test(hint) || hint.includes('已经在【库】里装好'), hint)
  await page.getByTestId('wizard-next').click()
  await page.getByTestId('wizard-adventures').waitFor({ timeout: 60000 })
  const adv = page.locator('[data-testid=wizard-adventures] .trpg-shelf__row').first()
  check(`[${label}] 冒险按作者分组列出，每行有名称 + 等级 · 故事线，默认一个不选`, (await adv.locator('small').innerText()).includes('等级') && (await page.locator('[data-testid=wizard-adventures] .trpg-check[data-on="true"]').count()) === 0)
  await adv.locator('.trpg-check').click()
  await page.getByTestId('wizard-next').click()
  await page.getByTestId('wizard-summary').waitFor()
  await page.waitForFunction(() => /冒险（约/.test(document.getElementById('trpg-assistant-root').shadowRoot.querySelector('[data-testid=wizard-summary]')?.textContent ?? ''), null, { timeout: 60000 })
  check(`[${label}] 选了冒险：摘要写「冒险（约 xx KB/MB 需下载）」`, /冒险（约 [\d.]+ (KB|MB) 需下载）/.test(await page.getByTestId('wizard-summary').innerText()), await page.getByTestId('wizard-summary').innerText())
  await page.locator('.trpg-modal__close').click()
  await settle(page)
  check(`[${label}] ✕ 关闭，没有开局`, (await modalCount(page)) === 0)
}
