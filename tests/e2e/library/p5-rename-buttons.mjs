// 改名（2026-11-12 驾驶员反馈）：战役 / 存档改名时输入框右边有【✓ 确定】【✕ 取消】；✓ 改成功退出编辑，✕ 不改并退出。Chrome，断网。
// 用法：npm run build 后 node tests/e2e/library/p5-rename-buttons.mjs
import { cp, mkdtemp, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { startStatic } from './static.mjs'
import { engines, work } from './chain-common.mjs'
setTimeout(() => process.exit(124), 240000)
const profile = await mkdtemp(join(work, 'p5-rename-'))
await cp(join(work, 'p5-t6-pack-audit-WST6kp'), profile, { recursive: true, filter: (p) => !p.includes('Singleton') })
const { server, url } = await startStatic({ port: 47342 })
const ctx = await engines[0][1].launchPersistentContext(profile, { ...engines[0][2], viewport: { width: 1280, height: 850 } })
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
  await page.evaluate(async (P) => { const pin = eval(P); const c = pin._s.get('campaign'); await pin._s.get('app').svc().backend.starter.startCampaign({ ...c.owner, ruleId: 'dnd5e2014', name: '改名测试', codeSet: 'cn', picks: [] }) }, P)
  await page.reload()
  await page.waitForFunction(`!!(${P})._s.get('app')?.booted`)
  await page.locator('.trpg-ball').click()
  await page.getByTestId('save-chip').click()
  const card = page.getByTestId('camp-改名测试')
  await card.waitFor()
  await card.locator('summary .trpg-more').first().click()
  await page.locator('.trpg-dropdown__item', { hasText: '改战役名' }).click()
  const input = page.getByLabel('战役名')
  await input.waitFor()
  ok('改战役名：输入框右边有【确定】【取消】', (await page.getByTestId('rename-ok').count()) >= 1 && (await page.getByTestId('rename-cancel').count()) >= 1)
  await page.screenshot({ path: join(profile, 'rename.png') })
  await input.fill('改名测试·新')
  await page.getByTestId('rename-ok').first().click()
  await page.getByTestId('camp-改名测试·新').waitFor({ timeout: 10000 }).catch(() => {})
  ok('点【确定】：改成功并退出编辑', (await page.getByTestId('camp-改名测试·新').count()) === 1 && (await page.getByLabel('战役名').count()) === 0)
  const card2 = page.getByTestId('camp-改名测试·新')
  await card2.locator('summary .trpg-more').first().click()
  await page.locator('.trpg-dropdown__item', { hasText: '改战役名' }).click()
  await page.getByLabel('战役名').fill('不该生效')
  await page.getByTestId('rename-cancel').first().click()
  await page.waitForTimeout(500)
  ok('点【取消】：不改名并退出编辑', (await page.getByTestId('camp-改名测试·新').count()) === 1 && (await page.getByTestId('camp-不该生效').count()) === 0 && (await page.getByLabel('战役名').count()) === 0)
  ok('没有界面自己的页面错误', result.pageErrors.filter((e) => !/gendata-nav-adventure-book-index|网络错误|Network error|无法加载 \d+ 个条目的引用/.test(e)).length === 0, result.pageErrors)
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
