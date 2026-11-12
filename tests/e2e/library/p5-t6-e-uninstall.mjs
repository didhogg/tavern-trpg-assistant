// P5-5 §12：卸载改造（Chrome，真实中文资料副本）。⋯ 菜单没有「卸载整套官方资料」；书架多选卸载：分组框、已选几项与约多大、
// 一个确认弹窗（另一种语言一起、占用大小）、卸完书架上没有、另一种语言的同一本也没了、空间真的腾出来（本机文件变少）。
// 用法：npm run build 后 node tests/e2e/library/p5-t6-e-uninstall.mjs
import { cp, mkdtemp, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { startStatic } from './static.mjs'
import { engines, work } from './chain-common.mjs'
setTimeout(() => process.exit(124), 480000)
const profile = await mkdtemp(join(work, 'p5-t6-e-uninstall-'))
await cp(join(work, 'p5-t6-pack-audit-WST6kp'), profile, { recursive: true, filter: (p) => !p.includes('Singleton') })
const { server, url } = await startStatic({ port: 47342 })
const [, chrome, options] = engines[0]
const ctx = await chrome.launchPersistentContext(profile, { ...options, viewport: { width: 1280, height: 850 } })
const result = { checks: {}, info: {}, pageErrors: [] }
const ok = (k, v, info) => { result.checks[k] = !!v; if (info !== undefined) result.info[k] = info; console.log(`${v ? 'PASS' : 'FAIL'}  ${k}${info !== undefined ? ' — ' + JSON.stringify(info) : ''}`) }
const P = `(() => { const h = document.querySelector('#trpg-assistant-root'); return [...h.shadowRoot.children].map((c) => c.__vue_app__).find(Boolean).config.globalProperties.$pinia })()`
try {
  await ctx.route((u) => !u.href.startsWith(url), (r) => r.abort())
  const page = await ctx.newPage()
  page.setDefaultTimeout(60000)
  page.on('pageerror', (e) => { if (!result.pageErrors.includes(e.message)) result.pageErrors.push(e.message) })
  await page.goto(url)
  await page.waitForFunction(`!!(${P})._s.get('app')?.booted`)
  await page.locator('.trpg-ball').click()
  await page.locator('.trpg-window').getByRole('button', { name: '库', exact: true }).first().click()
  await page.waitForSelector('[data-testid="shelf-tab"] .trpg-shelf__row')
  const state = () => page.evaluate(async (P) => {
    const L = eval(P)._s.get('app').svc().backend.library, view = await L.currentView(), db = L.db
    const s = async (id) => { const st = await view.officialState(id); return st ? { status: st.status, books: st.books } : null }
    return { cn: await s('cn-official'), en: await s('en-official'), files: (await db.files.count()) + (await db.fileContents.count()) }
  }, P)
  const before = await state()
  result.info.before = { cn: before.cn?.books?.length ?? before.cn?.status, en: before.en?.books?.length ?? before.en?.status, files: before.files }

  // ⋯ 菜单：只有「卸载这本书…」，没有「卸载整套官方资料…」
  const firstRow = page.locator('[data-testid="shelf-tab"] .trpg-shelf__row').first()
  await firstRow.getByRole('button', { name: /更多|⋯/ }).first().click().catch(async () => { await firstRow.locator('.trpg-more, [aria-haspopup]').first().click() })
  const menu = await page.locator('[role="menu"]').last().innerText()
  ok('⋯ 菜单没有「卸载整套官方资料」', !/卸载整套/.test(menu) && /卸载这本/.test(menu), menu.replace(/\n/g, ' | '))
  await page.keyboard.press('Escape')

  // 多选：分组框 [ ] 全选这一组 → 已选数 = 这一组显示的行数；再点 [−] 取消。卸载时逐行勾两本书（避开核心组，后面要读火球术）
  const grp = await page.evaluate((P) => {
    const lib = eval(P)._s.get('library')
    const shown = (x) => [...x.books, ...x.adventures].filter((r) => r.downloaded || (r.kind === 'adventure' && r.count > 0))
    const g = lib.shelf.groups.find((x) => x.group !== 'core' && shown(x).filter((r) => r.set === 'cn-official' && r.kind === 'book' && r.id).length >= 2)
    return { name: g.name, rows: shown(g).length, books: shown(g).filter((r) => r.set === 'cn-official' && r.kind === 'book' && r.id).slice(0, 2).map((r) => ({ id: r.id, name: r.name })) }
  }, P)
  result.info.group = grp
  await page.getByTestId('shelf-multi-official').click()
  const group = page.locator('[data-testid="shelf-tab"] .trpg-shelf__group', { has: page.locator('summary', { hasText: grp.name }) }).first()
  const box = group.locator('[data-testid="group-check"]')
  const bar = page.getByTestId('shelf-selbar')
  await box.click()
  const allText = await bar.innerText()
  await box.click()
  const noneText = await bar.innerText()
  ok('分组框：[ ] 全选这一组、[−] 再点取消', allText.includes(`已选 ${grp.rows} 项`) && noneText.includes('已选 0 项'), { allText: allText.replace(/\n/g, ' '), noneText: noneText.replace(/\n/g, ' ') })
  for (const b of grp.books) await group.locator('.trpg-shelf__row', { has: page.locator('.lib-name', { hasText: b.name }) }).first().locator('.trpg-check').click()
  await page.waitForFunction(() => /约 [\d.]+ ?(KB|MB|B)/.test(document.getElementById('trpg-assistant-root').shadowRoot.querySelector('[data-testid="shelf-selbar"]')?.textContent ?? ''), null, { timeout: 60000 })
  const barText = await bar.innerText()
  ok('勾两本：底部写已选 2 项、约多大', /已选 2 项/.test(barText) && /约 [\d.]+/.test(barText), barText.replace(/\n/g, ' '))
  await page.screenshot({ path: join(profile, 'shelf-multi.png') })
  await page.getByTestId('shelf-remove-picked').click()
  const dlg = page.locator('.trpg-confirm').last()
  await dlg.waitFor()
  const dlgText = await dlg.innerText()
  const enHas = grp.books.filter((b) => before.en?.status === 'installed' && (before.en.books == null || before.en.books.includes(b.id))).length
  ok('确认弹窗：一个弹窗列出选中的书、占用大小' + (enHas ? '、另一种语言一起' : ''), grp.books.every((b) => dlgText.includes(b.name)) && /占用约/.test(dlgText) && (!enHas || /另一种语言/.test(dlgText)), dlgText.replace(/\n/g, ' | ').slice(0, 300))
  await page.screenshot({ path: join(profile, 'confirm.png') })
  await dlg.getByRole('button', { name: '确认卸载' }).click()
  await page.locator('.trpg-toast', { hasText: '已卸载' }).first().waitFor({ timeout: 120000 })
  const toastText = await page.locator('.trpg-toast', { hasText: '已卸载' }).first().innerText()
  ok('卸完提示：已卸载，并写腾出多少', /腾出约/.test(toastText), toastText)
  const after = await state()
  result.info.after = { cn: after.cn?.books?.length, en: after.en?.books?.length ?? after.en?.status, files: after.files }
  ok('中文这几本从已装集合里移除', grp.books.every((b) => !after.cn.books.includes(b.id)), '')
  ok('英文的同一本也移除（英文装着时）', !enHas || grp.books.every((b) => !(after.en.books ?? []).includes(b.id)), { enHas })
  ok('空间真的腾出来：本机文件记录变少', after.files < before.files, { before: before.files, after: after.files })
  await page.waitForTimeout(1500)
  const shelfNames = await page.locator('[data-testid="shelf-tab"] .trpg-shelf__row .lib-name').allInnerTexts()
  ok('书架上不再有这几本，多选已退出', grp.books.every((b) => !shelfNames.some((n) => n.startsWith(b.name))) && (await page.getByTestId('shelf-selbar').count()) === 0, '')
  // 卸完后其他书照常能打开
  await page.getByRole('button', { name: '全库数据搜索', exact: true }).click()
  await page.getByLabel('搜索全部已开启的书').fill('火球术')
  await page.getByTestId('search-results').locator('button').filter({ hasText: '火球术' }).first().click()
  await page.locator('.trpg-modal__page:not(.is-under) [data-testid="entry-author"]').waitFor()
  ok('卸完后别的书照常能读', true)
  const real = result.pageErrors.filter((e) => !/gendata-nav-adventure-book-index|网络错误|Network error|无法加载 \d+ 个条目的引用/.test(e))
  ok('没有界面自己的页面错误', real.length === 0, real)
} catch (e) {
  result.error = String(e?.stack ?? e)
  console.log('ERROR', result.error)
} finally {
  await writeFile(join(profile, 'result.json'), JSON.stringify(result, null, 1))
  console.log(profile)
  const fails = Object.values(result.checks).filter((v) => !v).length + (result.error ? 1 : 0)
  console.log(fails ? `FAIL ${fails}` : 'ALL PASS')
  await ctx.close(); server.close()
  process.exit(fails ? 1 : 0)
}
