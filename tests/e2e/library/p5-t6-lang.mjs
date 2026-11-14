// P5 T6：中 / En 切换在详情弹窗标题栏上，官方条目和自制条目都有；另一种语言没有时那一侧灰掉并说明原因。
// 资料：p5-t6-pack-audit-WST6kp 副本（端口须 47342）。用法：SKIP_BUILD=1 node tests/e2e/library/p5-t6-lang.mjs
import { cp, mkdir, rm } from 'node:fs/promises'
import { startStatic } from './static.mjs'
import { buildAll, engines, work } from './chain-common.mjs'
import { check, failures, settle } from '../helpers.mjs'

setTimeout(() => process.exit(124), 300000).unref()
if (!process.env.SKIP_BUILD) await buildAll()
const [, type, options] = engines.find((e) => e[0] === 'chrome')
const { server, url } = await startStatic({ port: 47342 })
const shots = `${work}/p5-t6-shots/lang`
await mkdir(shots, { recursive: true })
const profile = `${work}/profile-p5t6-lang`
await rm(profile, { recursive: true, force: true })
await cp(`${work}/p5-t6-pack-audit-WST6kp`, profile, { recursive: true, filter: (p) => !p.includes('Singleton') })
const ctx = await type.launchPersistentContext(profile, { ...options, viewport: { width: 1280, height: 800 } })
const page = await ctx.newPage()
page.setDefaultTimeout(120000)
const consoleErr = []
page.on('console', (m) => { if (m.type() === 'error' || /trpg-assistant/.test(m.text())) consoleErr.push(m.text().slice(0, 200)) })
page.on('pageerror', (e) => consoleErr.push('PAGEERR ' + String(e.message).slice(0, 200)))
await ctx.route((u) => !u.href.startsWith(url), (r) => r.abort())
await page.goto(url)
const P = `(() => { const h = document.querySelector('#trpg-assistant-root'); return [...h.shadowRoot.children].map((c) => c.__vue_app__).find(Boolean).config.globalProperties.$pinia })()`
await page.waitForFunction(`!!(${P})._s.get('app')?.booted`)
await page.locator('.trpg-ball').click()
await settle(page, 600)
await page.locator('.trpg-window').getByRole('button', { name: '库', exact: true }).first().click()
await page.waitForSelector('[data-testid="shelf-tab"] .trpg-shelf__row')
const tab = (name) => page.locator('.trpg-seg button', { hasText: name }).first().click()

async function openFirstEntry(label) {
  await page.waitForSelector('[data-testid="pack-page"] [data-off]')
  await page.locator('[data-testid="pack-page"] [data-off]').first().click()
  await page.waitForSelector('.trpg-modal__head [data-testid="entry-lang"]')
  // 等条目读完、另一种语言查完（标题栏按钮不再写「正在找」）
  await page.waitForFunction(() => { const t = [...document.querySelector('#trpg-assistant-root').shadowRoot.querySelectorAll('[data-testid="entry-lang"] button')].map((b) => b.title).join(''); return t && !/正在找/.test(t) }, null, { timeout: 90000 })
  await settle(page, 500)
  const r = await page.evaluate(() => {
    const sr = document.querySelector('#trpg-assistant-root').shadowRoot
    const btns = [...sr.querySelectorAll('.trpg-modal__head [data-testid="entry-lang"] button')].map((b) => ({ t: b.textContent.trim(), on: b.getAttribute('aria-pressed'), dis: b.disabled, title: b.title }))
    const oldInTools = !!sr.querySelector('.lib-dtools [aria-label="语言"]')
    return { btns, oldInTools }
  })
  r.store = await page.evaluate((P) => {
    const ps = eval(P)
    const { entryRef, selection } = ps._s.get('modal').top.props
    return { ref: JSON.parse(JSON.stringify(entryRef)), stored: ps._s.get('entrylang').get(entryRef, selection) }
  }, P)
  console.log(label, JSON.stringify(r.store))
  await page.screenshot({ path: `${shots}/${label}.png` })
  return r
}
// 官方条目：书架第一本书 → 第一条
await page.locator('[data-testid="shelf-tab"] .trpg-shelf__row .lib-name').first().click()
const off = await openFirstEntry('official-entry')
check('官方条目：标题栏有 En / 中文 两个按钮，当前中文高亮', off.btns.length === 2 && off.btns.find((b) => b.t === '中文')?.on === 'true', JSON.stringify(off.btns))
check('官方条目：工具行里不再有旧的语言切换', !off.oldInTools, '')
check('官方条目：En 不可用时说明具体原因（与后端一致）；可用时可点', off.btns.find((b) => b.t === 'En')?.dis ? !!off.store.stored?.reason && off.btns.find((b) => b.t === 'En')?.title === off.store.stored.reason : true, JSON.stringify(off.btns))
await page.keyboard.press('Escape'); await settle(page, 300); await page.keyboard.press('Escape'); await settle(page, 300)
// 自制条目：我的库 → 超大长弓
await tab('我的库')
await page.locator('[data-testid="mylib-open"]', { hasText: '超大长弓' }).first().click()
const brew = await openFirstEntry('brew-entry')
check('自制条目：标题栏同样有 En / 中文，没有另一种语言时那一侧灰掉并说明原因', brew.btns.length === 2 && (!brew.btns.find((b) => b.t === 'En')?.dis || !!brew.btns.find((b) => b.t === 'En')?.title), JSON.stringify(brew.btns))
check('自制条目：另一种语言资料没装时如实说「还没装」，不再说「出错了」', brew.btns.find((b) => b.t === 'En')?.title === '另一种语言的资料还没装', JSON.stringify(brew.btns))
await page.keyboard.press('Escape'); await settle(page, 300); await page.keyboard.press('Escape'); await settle(page, 300)
// 书（阅读器）：书架里找一本带「书」行的官方书 → 点「书」→ 阅读器标题栏有切换
await tab('书架')
await page.locator('[data-testid="shelf-tab"] .trpg-shelf__row .lib-name', { hasText: '玩家手册' }).first().click()
await page.waitForSelector('[data-testid="pack-page"] [data-testid="book-row"]', { timeout: 60000 })
await page.locator('[data-testid="pack-page"] [data-testid="book-row"]').first().click()
await page.waitForSelector('.trpg-modal__head [data-testid="reader-lang"]')
await page.waitForFunction(() => { const t = [...document.querySelector('#trpg-assistant-root').shadowRoot.querySelectorAll('[data-testid="reader-lang"] button')].map((b) => b.title).join(''); return t && !/正在找/.test(t) }, null, { timeout: 60000 })
const rb = await page.evaluate(() => [...document.querySelector('#trpg-assistant-root').shadowRoot.querySelectorAll('[data-testid="reader-lang"] button')].map((b) => ({ t: b.textContent.trim(), on: b.getAttribute('aria-pressed'), dis: b.disabled, title: b.title })))
await page.screenshot({ path: `${shots}/reader.png` })
check('书（阅读器）：标题栏也有 En / 中文，中文高亮；英文没装时 En 灰掉并说明', rb.length === 2 && rb.find((b) => b.t === '中文')?.on === 'true' && (!rb.find((b) => b.t === 'En')?.dis || !!rb.find((b) => b.t === 'En')?.title), JSON.stringify(rb))
await ctx.close(); server.close()
console.log(failures.length ? `FAIL ${failures.length}` : 'ALL PASS')
process.exit(failures.length ? 1 : 0)
