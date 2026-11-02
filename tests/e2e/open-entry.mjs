// 打开「库 → 扩展 → 包 → 条目」的共用步骤；条目名按精确文字匹配，避免「地精」命中「大地精」。
import { gotoPage, settle } from './helpers.mjs'

export async function closeModals(page) {
  for (let i = 0; i < 8 && (await page.locator('.trpg-modal').count()); i++) { await page.keyboard.press('Escape'); await settle(page, 220) }
}

export async function openPack(page, pack) {
  await closeModals(page)
  await gotoPage(page, '库')
  await page.getByRole('button', { name: '扩展', exact: true }).click()
  await page.getByTestId('ext-list').waitFor()
  for (const btn of await page.locator('[data-testid=ext-list] h3 button[aria-expanded=false]').all()) await btn.click()
  await page.getByTestId(`ext-${pack}`).locator('.trpg-term').click()
  await page.getByTestId('pack-detail').waitFor()
  await settle(page, 300)
}

export async function openEntry(page, pack, name, kind) {
  await openPack(page, pack)
  await page.getByRole('searchbox', { name: '搜索条目' }).fill(name)
  await settle(page, 350)
  const rows = page.locator('.trpg-vlist__row')
  const count = await rows.count()
  for (let i = 0; i < count; i++) {
    const row = rows.nth(i)
    const term = row.locator('.trpg-term')
    if ((await term.count()) === 0 || (await term.first().innerText()).trim() !== name) continue
    if (kind && !(await row.innerText()).includes(kind)) continue
    await term.first().click()
    await page.getByTestId('entry-detail').waitFor()
    await settle(page, 550)
    return true
  }
  throw new Error(`条目列表里找不到「${name}」${kind ? `（${kind}）` : ''}`)
}
