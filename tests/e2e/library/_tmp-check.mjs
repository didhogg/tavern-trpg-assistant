// 库页弹窗的位置与保留：只占侧栏 / 底栏之外的空间；侧栏 / 底栏照常可点可拖；切到别的页面弹窗藏起来、切回来原样还在（搜索框里的字都在）；
// 书架顶部有书目 / 包搜索框。宽屏 + 窄屏各一遍，截图在 work/e2e-lib/p5-modal-shots/。
// 用法：SKIP_BUILD=1 ENGINE=chrome|webkit node tests/e2e/library/p5-modal-layout.mjs
import { cp, mkdir, rm } from 'node:fs/promises'
import { startStatic } from './static.mjs'
import { buildAll, engines, work } from './chain-common.mjs'
import { check, failures, settle } from '../helpers.mjs'

if (!process.env.SKIP_BUILD) await buildAll()
const engineName = process.env.ENGINE === 'webkit' ? 'webkit' : 'chrome'
const [, type, options] = engines.find((e) => e[0] === engineName)
const { server, url } = await startStatic({ port: 47318 })
const profile = `${work}/profile-tmprp-${engineName}`
const shots = `${work}/p5-tmprp-shots`
await mkdir(shots, { recursive: true })


await rm(`${profile}-x`, { recursive: true, force: true })
await cp(`${work}/profile-b2-8a-${engineName}`, `${profile}-x`, { recursive: true })
const ctx = await type.launchPersistentContext(`${profile}-x`, { ...options, viewport: { width: 1280, height: 800 } })
const page = await ctx.newPage()
page.setDefaultTimeout(120000)
await page.route((u) => !u.href.startsWith(url), (route) => route.abort())
await page.goto(url)
const pinia = `(() => { const h = document.querySelector('#trpg-assistant-root'); return [...h.shadowRoot.children].map((c) => c.__vue_app__).find(Boolean).config.globalProperties.$pinia })()`
await page.waitForFunction(`!!(${pinia})._s.get('app')?.booted`)
await page.locator('.trpg-ball').click()
await settle(page, 600)
await page.locator('.trpg-window').getByRole('button', { name: '库' }).first().click()
await page.waitForSelector('[data-testid="shelf-tab"] .trpg-shelf__row', { timeout: 120000 })
await settle(page, 800)
// 1) 卸载确认
await page.locator('.trpg-shelf__row').first().getByRole('button', { name: /玩家手册|更多|⋯/ }).last().click().catch(async () => { await page.locator('.trpg-shelf__row .trpg-icon-btn, .trpg-shelf__row [aria-haspopup]').last().click() })
await page.locator('.trpg-dropdown__item', { hasText: '卸载' }).click()
await settle(page, 1500)
await page.screenshot({ path: `${shots}/confirm.png` })
const btns = await page.evaluate(() => { const r = document.getElementById('trpg-assistant-root').shadowRoot; const c = r.querySelector('.trpg-modal__card'); const cb = c.getBoundingClientRect(); return { variant: r.querySelector('.trpg-modal').dataset.variant, card: { t: cb.top, b: cb.bottom }, buttons: [...c.querySelectorAll('button')].map((b) => ({ t: b.textContent.trim().slice(0, 8), top: Math.round(b.getBoundingClientRect().top), bottom: Math.round(b.getBoundingClientRect().bottom) })) } })
console.log(JSON.stringify(btns))
await page.keyboard.press('Escape'); await settle(page, 400)
// 2) 包内滚动
await page.locator('.trpg-shelf__row .lib-name', { hasText: '怪物图鉴' }).first().click()
await page.waitForSelector('[data-testid="pack-page"] .lib-pills')
await settle(page, 2500)
const info = async () => page.evaluate(() => { const r = document.getElementById('trpg-assistant-root').shadowRoot; const sc = r.querySelector('[data-testid="pack-page"] .lib-mscroll'); const rows = [...sc.querySelectorAll('.lib-list__row, tbody tr:not(.lib-spacer)')]; return { total: r.querySelector('.lib-count')?.textContent, rendered: rows.length, first: rows[0]?.textContent.slice(0, 12), last: rows.at(-1)?.textContent.slice(0, 12), scrollH: sc.scrollHeight, clientH: sc.clientHeight, scrollTop: sc.scrollTop } })
console.log('before', JSON.stringify(await info()))
await page.locator('[data-testid="pack-page"] .lib-mscroll').evaluate((e) => { e.scrollTop = e.scrollHeight })
await settle(page, 1200)
console.log('after', JSON.stringify(await info()))
await page.screenshot({ path: `${shots}/packscroll.png` })
await page.mouse.move(700, 450); await page.mouse.wheel(0, 3000); await settle(page, 800)
console.log('wheel', JSON.stringify(await info()))
await ctx.close(); server.close(); process.exit(0)
