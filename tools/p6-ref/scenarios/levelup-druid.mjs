// 场景：德鲁伊 1 级升到 2 级，到门槛选子职业（月亮结社）。驾驶员 11-25 指出的主问题就在这条路上。
// 起点：我们插件里空白人物 → 从库里加德鲁伊（PHB）1 级，作者问答按默认答完。
import { answerImport } from '../../../tests/e2e/library/ask-helper.mjs'

export const title = '德鲁伊 1 级 → 2 级（到门槛选月亮结社）'

const dlg = (page) => page.getByTestId('origins-dialog')
async function openOrigins(page, settle) {
  if (!await dlg(page).isVisible()) { await page.getByTestId('ps-origins-edit').click(); await dlg(page).waitFor(); await settle(400) }
}
async function pickRow(page, settle, query, row) {
  await page.getByTestId('ip-search').waitFor(); await page.getByTestId('ip-search').fill(query); await settle(500)
  await page.getByTestId('ip-row').filter({ hasText: row }).first().click(); await settle(500)
}

export async function start({ page, pinia, settle }) {
  await page.getByRole('button', { name: '新建' }).click(); await settle(250)
  await page.getByRole('menuitem', { name: '直接新建（空白人物卡）' }).click()
  await page.getByTestId('ps-head').waitFor(); await settle(800)
  await openOrigins(page, settle); await dlg(page).getByTestId('ps-build-add-class').click()
  await pickRow(page, settle, '德鲁伊', /^德鲁伊\s*PHB/)
  await page.getByTestId('ip-add').click()
  await page.getByTestId('prep-level-1').click(); await page.getByTestId('prep-level-next').click()
  await page.getByTestId('import-ask').waitFor()
  await answerImport(page, {})
  await settle(1500)
  if (await dlg(page).isVisible()) { await page.locator('.trpg-modal__close').click(); await settle(400) }
  return page.evaluate((P) => eval(P)._s.get('person').id, pinia)
}

export async function ours({ page, settle, shot }) {
  await openOrigins(page, settle); await shot('ours', '打开「职业与出身」')
  await dlg(page).getByTestId('ps-build-level').first().click(); await settle(300)
  await shot('ours', '点德鲁伊的等级下拉')
  await page.getByRole('option', { name: '2 级', exact: true }).click(); await settle(1200)
  if (await page.getByTestId('ip-title').isVisible().catch(() => false)) {
    await shot('ours', '选 2 级 → 出现选子职业页')
    await pickRow(page, settle, '月', /月/); await shot('ours', '选中月亮结社')
    await page.getByTestId('ip-add').click()
  }
  await page.getByTestId('import-ask').waitFor()
  await answerImport(page, { onStep: async (n, t) => shot('ours', `作者的题 ${n}：${t}`), onReady: () => shot('ours', '确认前清单') })
  await settle(1500); await shot('ours', '确认后')
}

/** 参考小窗里最上面那个窗口的标题和能点的按钮（给探路记录用）。 */
const topWindow = (refEval) => refEval((win) => {
  const apps = [...win.document.querySelectorAll('.app, .application, dialog[open]')].filter((e) => e.offsetParent !== null)
  const top = apps.sort((a, b) => (Number(getComputedStyle(b).zIndex) || 0) - (Number(getComputedStyle(a).zIndex) || 0))[0]
  if (!top) return { title: '（没有窗口）', buttons: [] }
  const title = (top.querySelector('.window-title, header h1, .window-header h4') ?? top).textContent.trim().replace(/\s+/g, ' ').slice(0, 80)
  const buttons = [...top.querySelectorAll('button, .btn, a.button')].filter((b) => b.offsetParent !== null).map((b) => (b.textContent || b.title || b.getAttribute('aria-label') || '').trim().replace(/\s+/g, ' ')).filter(Boolean).slice(0, 25)
  return { title, buttons }
})

export async function ref({ page, settle, shot, ref, refEval }) {
  const after = async (what, wait = 3000) => { await settle(wait); const w = await topWindow(refEval); await shot('ref', `${what} → 窗口「${w.title}」按钮：${w.buttons.join(' / ')}`) }
  await settle(1500); await shot('ref', 'Tidy5e 角色卡')
  await ref().locator('[data-plut-btn-level-up]').first().click(); await after('点作者金色「升级」按钮', 2500)
  await ref().getByRole('button', { name: /Level 1\s*→\s*Level 2/ }).first().click(); await after('点「1 级 → 2 级」', 4000)
  await btn(ref, 'Yes').click(); await after('「要选子职业吗？」点 Yes', 4000)
  await ref().locator('text=Circle of the Moon').first().click(); await after('点「Circle of the Moon」（月亮结社）', 1500)
  await btn(ref, 'Confirm').click(); await after('点 Confirm', 5000)
  // 之后作者的每个窗口都按默认答（和我们这边 answerImport 一样照默认）：记下窗口和按钮，再点确认类按钮；没有作者窗口了就结束
  for (let i = 0; i < 15; i++) {
    const w = await topWindow(refEval)
    const pick = ['OK', 'Confirm', 'Import', 'Next', 'Finish', 'Done', 'Save'].find((t) => w.buttons.includes(t))
    if (!pick || /Tidy|新人物|Character/.test(w.title)) break
    await btn(ref, pick).click(); await after(`「${w.title}」按默认点 ${pick}`, 4000)
  }
}

/** 作者按钮多带图标：按按钮文字找（去掉首尾空白后全等）。 */
const btn = (ref, text) => ref().locator('button').filter({ hasText: new RegExp(`^\\s*${text}\\s*$`) }).first()
