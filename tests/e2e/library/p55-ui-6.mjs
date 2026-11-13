// P5.5 界面第 6 批（u7-13 / 13b 房规、u7-14 覆盖管理）：书架官方条目 ✎ → 同一个编辑器改成房规（原件标签、改过、English 也能改）→
// 预览兼保存（和原件比改了几项、作用于）→ 详情变成房规；单条 ⋯ → 管理看改了什么、整批改作用于；书架「官方」⋯ → 管理；复原。
// 用法：SKIP_BUILD=1 node tests/e2e/library/p55-ui-6.mjs（截图 work/e2e-lib/p55-ui-shots/6/）
import { check, failures, settle } from '../helpers.mjs'
import { openLibrary, P } from './p55-ui-common.mjs'

const { ctx, page, server, shots, closeAll, realErrors } = await openLibrary('6')
const main = () => page.getByTestId('editor-main')
const side = () => page.getByTestId('editor-side')
const openFireball = async () => {
  await page.getByTestId('shelf-search').fill('玩家手册')
  await settle(page, 600)
  await page.locator('.trpg-shelf__row .lib-name').first().click()
  await page.waitForSelector('[data-testid="pack-page"]')
  await page.locator('[data-testid="pack-page"] input[type="search"]').fill('火球术')
  await page.locator('.lib-list__row', { hasText: '火球术' }).first().click({ timeout: 120000 })
  await page.waitForSelector('.lib-dtools')
  await settle(page, 600)
}
const state = () => page.evaluate(async (P) => {
  const st = eval(P)._s
  const lib = st.get('app').svc().backend.library
  await lib.brewQueue.settled()
  const c = st.get('library').campaignLib
  const ref = { set: 'cn-official', prop: 'spell', hash: (await lib.scoped.query(c, 'spell', { source: 'PHB', mode: 'browse' })).find((r) => r.item.name === '火球术')?.ref.hash }
  const d = await lib.scoped.detail(c, ref, { browse: true })
  const en = await lib.bilingual.englishInCampaign(c, ref)
  return { zh: [d.version.altId.split(':')[0], d.item.level], en: en ? [en.altId.split(':')[0], en.item.level] : null }
}, P)

await openFireball()
await page.getByTestId('entry-edit').click()
await page.waitForSelector('[data-testid="editor"] [data-testid="origin-pane"]')
await settle(page, 1500)
const note = await page.getByTestId('house-note').innerText()
const tabs = await side().locator('.trpg-seg button').allInnerTexts()
const enName = await (async () => { await side().locator('.trpg-seg button', { hasText: 'English' }).click(); await settle(page, 600); return side().locator('[data-field="name"] input').inputValue() })()
check('官方条目 ✎：同一个编辑器，顶上写明房规；右栏多「原件」；English 是英文官方原文', /房规/.test(note) && tabs[0] === '原件' && enName === 'Fireball', JSON.stringify({ note, tabs, enName }))
await side().locator('[data-field="level"] input').fill('4')
await main().locator('[data-field="level"] input').fill('4')
await side().locator('.trpg-seg button', { hasText: '原件' }).click()
await page.waitForSelector('[data-testid="origin-row"]', { timeout: 15000 })
await settle(page, 600)
await page.screenshot({ path: `${shots}/1-house-editor-origin.png` })
const origin = await page.getByTestId('origin-pane').innerText()
const changed = await main().locator('[data-field="level"] .lib-mark').innerText()
check('改了环节：表单标「改过」；原件标签列出原件的值和现在的值 + [← 用回原件的]', changed === '改过' && /环节/.test(origin) && /现在是 4/.test(origin) && /用回原件的/.test(origin), origin.replace(/\n/g, ' | ').slice(0, 200))
await side().locator('.trpg-seg button', { hasText: 'English' }).click()
await settle(page, 400)
await page.screenshot({ path: `${shots}/2-house-editor-english.png` })

// [完成] → 预览兼保存：中文、English 各和原件比改了几项；作用于
await page.getByTestId('editor-done').click()
await page.waitForSelector('[data-testid="save-level"]')
await settle(page, 1500)
await page.screenshot({ path: `${shots}/3-house-save.png` })
const title = await page.getByTestId('save-diff-title').innerText()
const lvl = await page.getByTestId('save-level').innerText()
check('房规预览页：中文、English 各列和原件比改了几项；中英两条都作用于（没开战役：默认当前规则）', /中文：和原件比改了 1 项/.test(title) && /English：和原件比改了 1 项/.test(title) && /中英两条都作用于/.test(lvl) && /当前规则/.test(lvl), JSON.stringify({ title, lvl }))
await page.getByTestId('save-go').click()
await page.locator('.trpg-toast', { hasText: '已保存房规' }).waitFor()
await settle(page, 1500)
const s1 = await state()
await page.screenshot({ path: `${shots}/4-detail-after.png` })
check('保存房规：中文、英文都变成房规，环节 4', s1.zh[0] === 'house' && s1.zh[1] === 4 && s1.en?.[0] === 'house' && s1.en[1] === 4, JSON.stringify(s1))

// 单条 ⋯ → 管理：每一层用的是哪一份，看改了什么，挪到全局
await page.locator('.lib-dtools .trpg-more').click()
await page.locator('.trpg-dropdown__item', { hasText: '管理：覆盖与作用范围' }).click()
await page.waitForSelector('[data-testid="override-row"]')
await page.getByTestId('override-open').first().click()
await page.waitForSelector('[data-testid="override-diff"] .lib-diff', { timeout: 30000 })
await settle(page, 500)
await page.screenshot({ path: `${shots}/5-entry-overrides.png` })
const ov = await page.getByTestId('entry-overrides').innerText()
check('单条管理：列出房规、「生效中」，展开看改了什么（环节 3 → 4）', /房规/.test(ov) && /生效中/.test(ov) && /环节/.test(ov) && /3 → 4/.test(ov), ov.replace(/\n/g, ' | ').slice(0, 300))
await page.locator('[data-testid="overrides"] > .lib-filter .trpg-check').first().click()
await page.getByTestId('overrides-apply').click()
await page.locator('.trpg-toast', { hasText: '作用于全局' }).waitFor()
await settle(page, 800)
const ov2 = await page.getByTestId('entry-overrides').innerText()
check('单条管理列中英两条；全选 → 选中的作用于「全局」→ 应用（两条一起挪）', (ov2.match(/作用于全局/g) ?? []).length === 2 && /Fireball/.test(ov2), ov2.replace(/\n/g, ' | ').slice(0, 300))
await closeAll(); await settle(page, 400)

// 书架「官方」⋯ → 管理：停用和覆盖 → 房规（覆盖）里有这一条 → 复原
await page.getByTestId('shelf-search').fill('')
await page.locator('[data-testid="shelf-tab"] .trpg-more').first().click()
await page.locator('.trpg-dropdown__item', { hasText: '管理：停用和覆盖' }).click()
await page.waitForSelector('[data-testid="manage-page"]')
await page.locator('[data-testid="manage-page"] .trpg-seg button', { hasText: '房规（覆盖）' }).click()
await page.waitForSelector('[data-testid="override-row"]')
await settle(page, 500)
await page.screenshot({ path: `${shots}/6-shelf-overrides.png` })
const shelfRows = await page.getByTestId('override-row').count()
check('书架管理：整个书架的房规（覆盖）按书分组列出', shelfRows >= 1)
while (await page.getByTestId('override-restore').count()) { await page.getByTestId('override-restore').first().click(); await settle(page, 1200) }
const s2 = await state()
check('复原：回到原件（中文、英文环节 3）', s2.zh[0] !== 'house' && s2.zh[1] === 3 && s2.en?.[0] !== 'house' && s2.en?.[1] === 3, JSON.stringify(s2))
await closeAll(); await settle(page, 300)

// 窄屏的房规编辑器
await page.setViewportSize({ width: 390, height: 800 })
await settle(page, 600)
await openFireball()
await page.getByTestId('entry-edit').click()
await page.waitForSelector('[data-testid="editor"] [data-testid="origin-pane"]')
await settle(page, 1200)
await page.screenshot({ path: `${shots}/7-house-narrow.png` })

check('页面没有未处理的错误（断网预期的除外）', realErrors().length === 0, realErrors().slice(0, 2).join(' | '))
await ctx.close()
server.close()
console.log(failures.length ? `FAIL ${failures.length}` : 'ALL PASS')
process.exit(failures.length ? 1 : 0)
