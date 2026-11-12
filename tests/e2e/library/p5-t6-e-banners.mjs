// P5-5 §12.3：报错改浮动横幅（Chrome，真实中文资料副本）。
// 横幅一律在插件外：酒馆顶部栏下方、和提示条同一层同一样式（驾驶员 2026-11-12）。长原始报错只显示一句人话；【详情】看原文；多条只露一条 + 「还有 N 条」。
// 弹窗里出错：横幅同样在插件外，【详情】弹窗内换页、返回回原处。
// 用法：npm run build 后 node tests/e2e/library/p5-t6-e-banners.mjs
import { cp, mkdtemp, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { startStatic } from './static.mjs'
import { engines, work } from './chain-common.mjs'
setTimeout(() => process.exit(124), 300000)
const profile = await mkdtemp(join(work, 'p5-t6-e-banners-'))
await cp(join(work, 'p5-t6-pack-audit-WST6kp'), profile, { recursive: true, filter: (p) => !p.includes('Singleton') })
const { server, url } = await startStatic({ port: 47342 })
const [, chrome, options] = engines[0]
const ctx = await chrome.launchPersistentContext(profile, { ...options, viewport: { width: 1280, height: 850 } })
const result = { checks: {}, info: {}, pageErrors: [] }
const ok = (k, v, info) => { result.checks[k] = !!v; if (info !== undefined) result.info[k] = info; console.log(`${v ? 'PASS' : 'FAIL'}  ${k}${info !== undefined ? ' — ' + JSON.stringify(info) : ''}`) }
const P = `(() => { const h = document.querySelector('#trpg-assistant-root'); return [...h.shadowRoot.children].map((c) => c.__vue_app__).find(Boolean).config.globalProperties.$pinia })()`
const RAW = '删除《Sample - Giddy; 《乏味巫师指南》.json》没有成功：自制解析失败，没有发布：_getMastery@tauri://localhost/scripts/extensions/third-party/tavern-trpg-assistant/vendor/cn/js/render.js:13025:28 @tauri://localhost/scripts/extensions/third-party/tavern-trpg-assistant/vendor/cn/js/render.js:13673:35 forEach@[native code]'
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
  const shelfTop = () => page.getByTestId('shelf-tab').evaluate((e) => Math.round(e.getBoundingClientRect().top))
  const top0 = await shelfTop()
  await page.evaluate(([P, raw]) => eval(P)._s.get('libnotice').show({ key: 'x1', text: raw, actions: [{ label: '重试', run: () => {} }] }), [P, RAW])
  const banner = page.getByTestId('lib-notice').first()
  await banner.waitFor()
  const text = await banner.innerText()
  ok('长原始报错：横幅只显示一句人话（不带调用位置 / 网址）', text.includes('自制解析失败，没有发布') && !/_getMastery|tauri:|render\.js/.test(text), text.replace(/\n/g, ' '))
  ok('横幅浮在内容上，不把书架往下挤', (await shelfTop()) === top0, { top0, top1: await shelfTop() })
  const where = await banner.evaluate((e) => ({ host: !!e.closest('.trpg-toasts'), inWindow: !!e.closest('.trpg-window'), kind: e.dataset.kind, cls: e.className }))
  ok('横幅在插件外（和提示条同一层、同一样式）', where.host && !where.inWindow && where.kind === 'error' && /trpg-toast/.test(where.cls), where)
  const box = await banner.boundingBox()
  ok('横幅一行放得下（不撑出很高的一块）', box.height < 70, box)
  await page.screenshot({ path: join(profile, 'banner.png') })
  await banner.getByTestId('error-detail-open').click()
  const detail = page.getByTestId('error-detail')
  await detail.waitFor()
  ok('【详情】：原始报错全文可看', (await detail.innerText()).includes('render.js:13025:28'))
  await page.screenshot({ path: join(profile, 'detail.png') })
  await page.getByRole('button', { name: '关闭', exact: true }).click()
  // 多条：只露第一条 + 「还有 N 条」
  await page.evaluate((P) => { const n = eval(P)._s.get('libnotice'); n.show({ key: 'x2', text: '第二条：Error: boom', actions: [] }); n.show({ key: 'x3', text: '第三条提示', actions: [] }) }, P)
  await page.waitForTimeout(300)
  const shown = await page.getByTestId('lib-notice').count()
  const more = await page.getByTestId('banners-more').innerText()
  ok('多条：只露最新一条和「还有 N 条提示」', shown === 1 && /还有 2 条提示/.test(more) && (await page.getByTestId('lib-notice').first().innerText()).includes('第三条'), { shown, more })
  await page.getByTestId('banners-more').click()
  ok('点开看全部', (await page.getByTestId('lib-notice').count()) === 3)
  await page.evaluate((P) => { const n = eval(P)._s.get('libnotice'); for (const k of ['x1', 'x2', 'x3']) n.dismiss(k) }, P)

  // 弹窗里：详情读不出来 → 插件外横幅；【详情】弹窗内换页、返回回原处
  await page.evaluate((P) => { const be = eval(P)._s.get('app').svc().backend; be.library.scoped.detail = async () => { throw new Error('Error: QuotaExceededError at IDBObjectStore.put (dexie.js:1234:5)') } }, P)
  await page.getByRole('button', { name: '全库数据搜索', exact: true }).click()
  await page.getByLabel('搜索全部已开启的书').fill('火球术')
  await page.getByTestId('search-results').locator('button').filter({ hasText: '火球术' }).first().click()
  const inModal = page.locator('.trpg-toasts [data-testid="error-banner"]', { hasText: '这一条没读出来' })
  await inModal.waitFor()
  const mtext = await inModal.innerText()
  ok('弹窗里出错：横幅在插件外，一句人话，页面不显示原始报错', /这一条没读出来/.test(mtext) && !/dexie\.js/.test(await page.locator('.trpg-modal__page:not(.is-under)').innerText()), mtext.replace(/\n/g, ' '))
  const depth0 = await page.evaluate((P) => eval(P)._s.get('modal').depth, P)
  await inModal.getByTestId('error-detail-open').click()
  await page.locator('.trpg-modal__page:not(.is-under) [data-testid="error-detail"]').waitFor()
  const depth1 = await page.evaluate((P) => eval(P)._s.get('modal').depth, P)
  ok('【详情】在弹窗内换页（不叠第二个弹窗）', depth1 === depth0 + 1 && (await page.locator('.trpg-modal').count()) === 1, { depth0, depth1 })
  await page.getByRole('button', { name: /^返回：/ }).click()
  await inModal.waitFor()
  ok('返回：回到出错的那一页', (await page.evaluate((P) => eval(P)._s.get('modal').depth, P)) === depth0)
  await page.screenshot({ path: join(profile, 'modal-banner.png') })
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
