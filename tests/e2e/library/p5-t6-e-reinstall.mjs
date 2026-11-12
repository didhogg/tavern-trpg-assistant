// P5-5 §11.1–11.2：冒险条目并进冒险行；缺数据给【下载 / 重新下载这个包】；找不到目标的链接可点、查提供者、失败横幅（Chrome，真实中文资料副本）。
// 外网全部拦掉：下载会失败，用来看失败横幅。用法：npm run build 后 node tests/e2e/library/p5-t6-e-reinstall.mjs
import { cp, mkdtemp, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { startStatic } from './static.mjs'
import { engines, work } from './chain-common.mjs'
setTimeout(() => process.exit(124), 360000)
const profile = await mkdtemp(join(work, 'p5-t6-e-reinstall-'))
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
  const active = () => page.locator('.trpg-modal__page:not(.is-under)')

  // 11.1：杂项里没有和冒险同名的行；没下正文的冒险在书架上标「正文没下载」
  const shelf = await page.evaluate((P) => {
    const g = eval(P)._s.get('library').shelf.groups
    const advNames = new Set(g.flatMap((x) => x.adventures).map((r) => r.source.toLowerCase()))
    const other = g.find((x) => x.group === 'other')
    return { dupInOther: (other ? [...other.books] : []).filter((r) => advNames.has(r.source.toLowerCase())).map((r) => r.name), advWithData: g.flatMap((x) => x.adventures).filter((r) => r.count > 0 && !r.downloaded).length }
  }, P)
  ok('杂项里没有和冒险同来源的行', shelf.dupInOther.length === 0, shelf)
  for (const d of await page.locator('[data-testid="shelf-tab"] details:not([open]) summary').all()) await d.click().catch(() => {})
  const row = page.locator('.trpg-shelf__row', { hasText: '正文没下载' }).first()
  ok('没下正文、条目已在本地的冒险列在书架上并标「正文没下载」', (await page.locator('.trpg-shelf__row', { hasText: '正文没下载' }).count()) === shelf.advWithData && shelf.advWithData > 0, shelf.advWithData)

  // 11.2 阅读器：点开这个冒险 → 条目列表在 → 点正文 → 不是「错误 + 重试」，而是【下载这本冒险】
  const advName = (await row.locator('.lib-name').innerText()).replace(/（冒险）.*/s, '').trim()
  await row.locator('.lib-name').click()
  await active().getByTestId('book-row').first().waitFor()
  const listRows = await active().locator('.lib-list__row, tbody tr').count()
  ok('冒险包页：正文一行 + 它自带的条目', listRows > 1, { advName, listRows })
  await active().getByTestId('book-row').first().click()
  await active().getByTestId('reinstall').waitFor()
  const block = await active().getByTestId('reinstall').innerText()
  ok('冒险正文没下：显示【下载这本冒险】，没有「读不出来 + 重试」', /下载这本冒险/.test(block) && !/读不出来/.test(block), block.replace(/\n/g, ' | ').slice(0, 160))
  await page.screenshot({ path: join(profile, 'reader-reinstall.png') })
  await active().getByTestId('reinstall-btn').click()
  const banner = page.locator('.trpg-toasts [role="alert"]').first() // 错误横幅在插件外（2026-11-12）
  await banner.waitFor({ timeout: 120000 })
  ok('断网下载失败：横幅说明原因，按钮可再点', /没有成功|取消|网络/.test(await banner.innerText()) && await active().getByTestId('reinstall-btn').isEnabled(), (await banner.innerText()).slice(0, 120))
  await page.screenshot({ path: join(profile, 'reader-reinstall-failed.png') })
  await page.getByRole('button', { name: '关闭', exact: true }).click()

  // 11.2 找不到目标的链接：可以点 → 查提供者（这里是没装的自制来源）→ 失败横幅
  await page.evaluate(async (P) => {
    const st = eval(P)._s, app = st.get('app'), lib = app.svc().backend.library
    const raw = await lib.service.parsed('cn-official', 'spell')
    const fireball = raw.items.find((x) => x.name === '火球术' && x.source === 'PHB')
    const file = { _meta: { sources: [{ json: 'T6EProbe', abbreviation: 'T6EProbe', full: 'T6EProbe', authors: [] }] }, spell: [{ ...fireball, source: 'T6EProbe', name: 'T6E 缺链接验证', entries: ['{@spell 火球术|ThisSourceIsNotInstalled|找不到的测试法术}'] }] }
    await lib.service.brewImport('cn-brew', [{ name: 'T6EProbe.json', text: JSON.stringify(file) }])
    await st.get('library').refresh(app.svc())
  }, P)
  await page.getByRole('button', { name: '全库数据搜索', exact: true }).click()
  await page.getByLabel('搜索全部已开启的书').fill('T6E 缺链接验证')
  await page.getByTestId('search-results').locator('button').filter({ hasText: 'T6E 缺链接验证' }).first().click()
  const dead = active().getByTestId('dead-link').first()
  await dead.waitFor()
  ok('找不到目标的链接仍是虚线、带问号', (await dead.innerText()).includes('?') && (await dead.getAttribute('role')) === 'link')
  await dead.click()
  await active().getByTestId('entry-missing').waitFor()
  const miss = await active().getByTestId('entry-missing').innerText()
  ok('点开：查出它来自没装的自制来源，给【下载这个包】', /ThisSourceIsNotInstalled/i.test(miss) && /下载这个包/.test(miss), miss.replace(/\n/g, ' | ').slice(0, 160))
  await active().getByRole('button', { name: /下载这个包/ }).click()
  const miss2 = page.locator('.trpg-toasts [role="alert"], [data-testid="entry-missing"] .lib-banner--warn').first() // 失败横幅在插件外；查不出提供者是页面里的说明
  await miss2.waitFor({ timeout: 90000 })
  ok('找不到提供者 / 断网：横幅报错', (await miss2.innerText()).length > 0, (await miss2.innerText()).slice(0, 120))
  await page.screenshot({ path: join(profile, 'deadlink-missing.png') })
  const real = result.pageErrors.filter((e) => !/gendata-nav-adventure-book-index|网络错误|Network error|找不到物品(类型|属性)|无法加载 \d+ 个条目的引用|无法从网址/.test(e))
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
