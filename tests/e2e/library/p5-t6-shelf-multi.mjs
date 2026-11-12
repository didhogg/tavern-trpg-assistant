// 书架多选（驾驶员 2026-11-12）：「批量勾选」并进【多选】，下栏在卸载左边有【全部启用】【全部禁用】；
// 开关按战役持久保存，刷新后不变回开。Chrome，真实中文资料副本，断网。
// 用法：npm run build 后 node tests/e2e/library/p5-t6-shelf-multi.mjs
import { cp, mkdtemp, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { startStatic } from './static.mjs'
import { engines, work } from './chain-common.mjs'
setTimeout(() => process.exit(124), 300000)
const profile = await mkdtemp(join(work, 'p5-t6-shelf-multi-'))
await cp(join(work, 'p5-t6-pack-audit-WST6kp'), profile, { recursive: true, filter: (p) => !p.includes('Singleton') })
const { server, url } = await startStatic({ port: 47342 })
const [, chrome, options] = engines[0]
const ctx = await chrome.launchPersistentContext(profile, { ...options, viewport: { width: 1280, height: 850 } })
const result = { checks: {}, info: {}, pageErrors: [] }
const ok = (k, v, info) => { result.checks[k] = !!v; if (info !== undefined) result.info[k] = info; console.log(`${v ? 'PASS' : 'FAIL'}  ${k}${info !== undefined ? ' — ' + JSON.stringify(info) : ''}`) }
const P = `(() => { const h = document.querySelector('#trpg-assistant-root'); return [...h.shadowRoot.children].map((c) => c.__vue_app__).find(Boolean).config.globalProperties.$pinia })()`
const switchOf = (page, name) => page.evaluate((n) => [...document.getElementById('trpg-assistant-root').shadowRoot.querySelectorAll('.trpg-shelf__row')].find((r) => r.querySelector('.lib-name')?.firstChild?.textContent.trim() === n)?.querySelector('.trpg-switch')?.getAttribute('aria-checked'), name)
async function openShelf(page) {
  await page.waitForFunction(`!!(${P})._s.get('app')?.booted`)
  await page.locator('.trpg-ball').click()
  await page.getByTestId('nav-library').click()
  await page.waitForSelector('[data-testid="shelf-tab"] .trpg-shelf__row')
}
try {
  await ctx.route((u) => !u.href.startsWith(url), (r) => r.abort())
  const page = await ctx.newPage()
  page.setDefaultTimeout(30000)
  page.on('pageerror', (e) => { if (!result.pageErrors.includes(e.message)) result.pageErrors.push(e.message) })
  await page.goto(url)
  await page.waitForFunction(`!!(${P})._s.get('app')?.booted`)
  await page.evaluate(async (P) => { const pin = eval(P); const c = pin._s.get('campaign'); if (!c.hasCampaign) await pin._s.get('app').svc().backend.starter.startCampaign({ ...c.owner, ruleId: 'dnd5e2014', name: '多选测试', codeSet: 'cn', picks: [] }) }, P)
  await page.reload()
  await openShelf(page)
  ok('书架没有「批量勾选」按钮', (await page.getByTestId('open-bulk').count()) === 0)
  const name = (await page.locator('.trpg-shelf__row .trpg-switch[aria-checked="true"]').first().locator('xpath=ancestor::div[contains(@class,"trpg-shelf__row")]').locator('.lib-name').evaluate((e) => e.firstChild.textContent)).trim()
  result.info.book = name
  await page.getByTestId('shelf-multi-official').click()
  const row = page.locator('.trpg-shelf__row').filter({ has: page.locator('.lib-name', { hasText: name }) }).first()
  await row.locator('.lib-rowpick').click()
  const bar = await page.getByTestId('shelf-selbar').innerText()
  ok('多选下栏：全部启用、全部禁用在卸载左边', /全部启用[\s\S]*全部禁用[\s\S]*卸载选中/.test(bar), bar.replace(/\n/g, ' '))
  await page.screenshot({ path: join(profile, 'selbar.png') })
  await page.getByTestId('shelf-disable-picked').click()
  await page.waitForFunction(([n, P]) => [...document.getElementById('trpg-assistant-root').shadowRoot.querySelectorAll('.trpg-shelf__row')].some((r) => r.querySelector('.lib-name')?.firstChild?.textContent.trim() === n && r.querySelector('.trpg-switch')?.getAttribute('aria-checked') === 'false'), [name, P]).catch(() => {})
  ok('全部禁用：选中的那本开关变关', (await switchOf(page, name)) === 'false')
  await page.reload()
  await openShelf(page)
  ok('刷新后仍是关（本战役持久）', (await switchOf(page, name)) === 'false')
  // 开关悬停：按现在的状态写「本战役启用 / 本战役停用」
  const tipOf = async (n) => { const sw = page.locator('.trpg-shelf__row').filter({ has: page.locator('.lib-name', { hasText: n }) }).first().getByTestId('shelf-switch'); await sw.hover(); const t = page.locator('.trpg-tip__bubble'); await t.waitFor(); const text = (await t.innerText()).trim(); await page.mouse.move(0, 0); return text }
  const offTip = await tipOf(name)
  const onName = (await page.locator('.trpg-shelf__row .trpg-switch[aria-checked="true"]').first().locator('xpath=ancestor::div[contains(@class,"trpg-shelf__row")]').locator('.lib-name').evaluate((e) => e.firstChild.textContent)).trim()
  const onTip = await tipOf(onName)
  ok('开关悬停：关着写「本战役停用」，开着写「本战役启用」', offTip === '本战役停用' && onTip === '本战役启用', { offTip, onTip })
  await page.locator('.trpg-shelf__row').filter({ has: page.locator('.lib-name', { hasText: onName }) }).first().getByTestId('shelf-switch').hover()
  await page.locator('.trpg-tip__bubble').waitFor()
  await page.screenshot({ path: join(profile, 'switch-tip.png') })
  await page.mouse.move(0, 0)
  await page.getByTestId('shelf-multi-official').click()
  await page.locator('.trpg-shelf__row').filter({ has: page.locator('.lib-name', { hasText: name }) }).first().locator('.lib-rowpick').click()
  await page.getByTestId('shelf-enable-picked').click()
  await page.waitForFunction((n) => [...document.getElementById('trpg-assistant-root').shadowRoot.querySelectorAll('.trpg-shelf__row')].some((r) => r.querySelector('.lib-name')?.firstChild?.textContent.trim() === n && r.querySelector('.trpg-switch')?.getAttribute('aria-checked') === 'true'), name).catch(() => {})
  ok('全部启用：再开回来', (await switchOf(page, name)) === 'true')
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
