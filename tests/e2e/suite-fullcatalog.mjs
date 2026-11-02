// G3 批 5：完整 catalog（86 个包）下的向导/扩展列表折叠；只让推荐组默认展开。
import { check, gotoPage, settle } from './helpers.mjs'

export async function fullCatalogSuite(page, label) {
  await gotoPage(page, '首页')
  await page.getByTestId('start-banner').waitFor({ timeout: 30000 })
  await page.getByTestId('start-banner').click()
  await page.getByTestId('wizard').waitFor()
  await page.getByTestId('wizard-next').click()
  await page.getByTestId('wizard-pack-search').waitFor({ timeout: 30000 })
  await settle(page, 300)

  const group = (name) => page.locator(`section[aria-label="${name}"]`)
  const expanded = async (name) => (await group(name).locator('h4 button[aria-expanded]').getAttribute('aria-expanded')) === 'true'
  check(`[${label}] G3 全 catalog：推荐的一档、二档默认展开`, (await expanded('官方扩展 · 一档')) && (await expanded('官方扩展 · 二档')))
  check(`[${label}] G3 全 catalog：三档与冒险组默认收起`, !(await expanded('设定与扩展书 · 三档')) && !(await expanded('冒险 · 怪物与 NPC')))
  check(`[${label}] G3 全 catalog：顶部出现包名搜索框`, await page.getByTestId('wizard-pack-search').isVisible())

  const third = group('设定与扩展书 · 三档')
  await third.locator('h4 button[aria-expanded]').click()
  await settle(page, 200)
  check(`[${label}] G3 全 catalog：展开三档组能看到 25 个包`, (await third.locator('[data-testid^=wizard-pack-]').count()) === 25, `${await third.locator('[data-testid^=wizard-pack-]').count()}`)

  await page.getByTestId('wizard-pack-search').fill('冒险')
  await settle(page, 250)
  const filtered = page.locator('[data-testid^=wizard-pack-]')
  const filteredCount = await filtered.count()
  check(`[${label}] G3 全 catalog：搜索「冒险」过滤掉大部分包`, filteredCount > 0 && filteredCount < 35, `${filteredCount}`)
  check(`[${label}] G3 全 catalog：过滤时所有组自动展开，至少有中文「冒险」匹配`, filteredCount > 0 && (await filtered.filter({ hasText: '冒险' }).count()) >= 1)

  await page.getByTestId('wizard-pack-search').fill('')
  await settle(page, 200)
  await page.locator('.trpg-modal__close').click()
  await settle(page, 250)

  // ExtList 也按组折叠：推荐组展开，冒险组默认收起，展开后 51 个包
  await gotoPage(page, '库')
  await page.getByRole('button', { name: '扩展', exact: true }).click()
  await page.getByTestId('ext-list').waitFor({ timeout: 30000 })
  await page.getByTestId('ext-dnd5e2014-srd').waitFor({ timeout: 30000 })
  const adv = page.locator('section[aria-label="冒险 · 怪物与 NPC"]')
  check(`[${label}] G3 全 catalog：扩展列表的冒险组默认收起`, (await adv.locator('h3 button[aria-expanded]').getAttribute('aria-expanded')) === 'false')
  await adv.locator('h3 button[aria-expanded]').click()
  await settle(page, 200)
  check(`[${label}] G3 全 catalog：展开冒险组有 51 个包`, (await adv.locator('[data-testid^=ext-dnd5e2014]').count()) === 51, `${await adv.locator('[data-testid^=ext-dnd5e2014]').count()}`)
  await page.getByRole('searchbox', { name: '搜索扩展包' }).fill('冒险')
  await settle(page, 250)
  check(`[${label}] G3 全 catalog：扩展列表搜索「冒险」过滤`, (await page.locator('[data-testid^=ext-dnd5e2014]').count()) > 0 && (await page.locator('[data-testid^=ext-dnd5e2014]').count()) < 20)
}
