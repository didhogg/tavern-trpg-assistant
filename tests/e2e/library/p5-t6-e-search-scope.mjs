// P5-5 §11.3：全库搜索的「书目范围」和书架 / 我的库同一份登记（作者分组 + 自制内容 + 我的库），分组全选框（Chrome，真实中文资料副本）。
// 用法：npm run build 后 node tests/e2e/library/p5-t6-e-search-scope.mjs
import { cp, mkdtemp, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { startStatic } from './static.mjs'
import { engines, work } from './chain-common.mjs'
setTimeout(() => process.exit(124), 300000)
const profile = await mkdtemp(join(work, 'p5-t6-e-search-scope-'))
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
  page.setDefaultTimeout(30000)
  page.on('pageerror', (e) => { if (!result.pageErrors.includes(e.message)) result.pageErrors.push(e.message) })
  await page.goto(url)
  await page.waitForFunction(`!!(${P})._s.get('app')?.booted`)
  await page.locator('.trpg-ball').click()
  await page.locator('.trpg-window').getByRole('button', { name: '库', exact: true }).first().click()
  await page.waitForSelector('[data-testid="shelf-tab"] .trpg-shelf__row')
  const expect = await page.evaluate((P) => {
    const lib = eval(P)._s.get('library'), mine = new Set(lib.minePacks.map((p) => p.docIdLocal))
    const rows = lib.shelf.groups.flatMap((g) => [...g.books, ...g.adventures].map((r) => ({ g: g.name, r })))
    const on = rows.filter(({ r }) => r.view.visible && (r.downloaded || (r.kind === 'adventure' && r.count > 0)))
    return { groups: [...new Set(on.filter(({ r }) => !(r.pack && mine.has(r.pack.docIdLocal))).map(({ g }) => g))], mineOn: on.filter(({ r }) => r.pack && mine.has(r.pack.docIdLocal)).length, brewOn: on.filter(({ r }) => r.set.endsWith('brew') && !(r.pack && mine.has(r.pack.docIdLocal))).length }
  }, P)
  await page.getByRole('button', { name: '全库数据搜索', exact: true }).click()
  const books = page.locator('[data-testid="search-books"]')
  await books.locator('summary').click()
  const names = await books.locator('[data-testid="search-scope-group"]').allInnerTexts()
  const shown = names.map((t) => t.replace(/[−\n]/g, '').trim())
  ok('分组和书架开着的分组一致（含自制内容），我的库另成一组', JSON.stringify(shown) === JSON.stringify([...expect.groups, ...(expect.mineOn ? ['我的库'] : [])]), { shown, expect })
  ok('「自制内容」组：有开着的下载来的自制包才出现；我的库有开着的包', shown.includes('自制内容') === expect.brewOn > 0 && expect.mineOn > 0, expect)
  // 「我的库」组：[−] 点一下 → 这一组全部取消
  const mineBox = books.locator('[data-testid="search-scope-group"]', { hasText: '我的库' }).locator('[data-testid="group-check"]')
  const before = (await books.locator('summary small').innerText()).trim()
  await mineBox.click()
  const after = (await books.locator('summary small').innerText()).trim()
  ok('「我的库」组框点一下：这一组全部取消，已勾选数至少减少该组行数（和它同来源的书一起，例如存入我的库的玩家手册副本）', (await mineBox.innerText()).trim() === '' && Number(after.match(/已勾选 (\d+)/)[1]) <= Number(before.match(/已勾选 (\d+)/)[1]) - expect.mineOn, { before, after })
  await mineBox.click()
  ok('再点一下：这一组全选回来', (await books.locator('summary small').innerText()).trim() === before)
  await page.screenshot({ path: join(profile, 'search-scope.png') })
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
