// 书里内嵌的怪物块（statblock）要显示成可点的术语名并能跳转；怪物详情要带上传奇组正文（巢穴动作 / 区域效应…）。
// 以前内嵌块只显示重复的名字、不能跳：块是响应式代理，传给小窗时克隆失败，错误只写了控制台。
// 用法：SKIP_BUILD=1 ENGINE=chrome|webkit node tests/e2e/library/p5-embedded-ui.mjs
import { cp, mkdir, rm } from 'node:fs/promises'
import { startStatic } from './static.mjs'
import { buildAll, engines, work } from './chain-common.mjs'
import { check, failures, settle } from '../helpers.mjs'

if (!process.env.SKIP_BUILD) await buildAll()
const engineName = process.env.ENGINE === 'webkit' ? 'webkit' : 'chrome'
const [, type, options] = engines.find((e) => e[0] === engineName)
const { server, url } = await startStatic({ port: 47318 })
const profile = `${work}/profile-p5eb-${engineName}`
await rm(profile, { recursive: true, force: true })
await cp(`${work}/profile-b2-8a-${engineName}`, profile, { recursive: true })
const shots = `${work}/p5-embedded-shots-${engineName}`
await rm(shots, { recursive: true, force: true })
await mkdir(shots, { recursive: true })
const ctx = await type.launchPersistentContext(profile, { ...options, viewport: { width: 1280, height: 800 } })
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

// 书：怪物图鉴的「简介」章里每只怪物有几个内嵌块
await page.locator('.trpg-shelf__row .lib-name', { hasText: '怪物图鉴' }).first().click()
await page.waitForSelector('[data-testid="pack-page"] .lib-pills')
await settle(page, 1500)
await page.locator('.lib-pills .trpg-pill', { hasText: /^书/ }).first().click()
await page.locator('[data-testid="book-row"]').first().click()
await page.waitForSelector('[data-testid="reader-page"] [data-testid="reader-toc"]')
await page.waitForFunction(() => document.getElementById('trpg-assistant-root').shadowRoot.querySelectorAll('[data-testid="reader-body"] .lib-statblock .trpg-term').length > 20, null, { timeout: 60000 }).catch(() => {})
const snap = await page.evaluate(() => { const b = document.getElementById('trpg-assistant-root').shadowRoot.querySelector('[data-testid="reader-body"]'); return { statblocks: b.querySelectorAll('.lib-statblock').length, linked: b.querySelectorAll('.lib-statblock .trpg-term').length } })
check('书里的内嵌怪物块显示成可点的术语名（不是重复的纯文字）', snap.statblocks > 50 && snap.linked >= snap.statblocks * 0.9, JSON.stringify(snap))
await page.screenshot({ path: `${shots}/1-reader.png` })
await page.locator('[data-testid="reader-body"] .lib-statblock .trpg-term').first().click()
await page.waitForSelector('.trpg-modal__page:not(.is-under) [data-testid="entry-statblock"], .trpg-modal__page:not(.is-under) .lib-dbody', { timeout: 30000 })
await settle(page, 800)
check('点内嵌块跳到那一条的详情页', (await page.locator('.trpg-modal__page:not(.is-under) .lib-srcline').count()) === 1, '')
await page.keyboard.press('Escape'); await page.keyboard.press('Escape'); await page.keyboard.press('Escape')
await settle(page, 400)

// 怪物详情：传奇组正文
await page.locator('.trpg-shelf__row .lib-name', { hasText: '怪物图鉴' }).first().click()
await page.waitForSelector('[data-testid="pack-page"] .lib-pills')
await settle(page, 1500)
const withGroup = await page.evaluate(async (P) => {
  const ps = eval(P); const be = ps._s.get('app').svc().backend; const lvs = ps._s.get('library')
  const rows = await be.library.scoped.query(lvs.campaignLib, 'monster', { source: 'MM' })
  const hit = rows.find((r) => r.item.legendaryGroup)
  return hit ? hit.item.name : null
}, pinia)
check('找到一只带传奇组的怪物', !!withGroup, String(withGroup))
await page.locator('[data-testid="pack-page"] input[type="search"]').fill(withGroup)
await settle(page, 600)
await page.locator('[data-testid="pack-page"] tbody tr, [data-testid="pack-page"] .lib-list__row').first().click()
await page.waitForSelector('.trpg-modal__page:not(.is-under) .lib-dbody', { timeout: 30000 })
await settle(page, 2500)
const detail = await page.evaluate(() => { const d = document.getElementById('trpg-assistant-root').shadowRoot.querySelector('.trpg-modal__page:not(.is-under) .lib-dbody'); return { text: d.innerText, hasGroup: /传奇组：/.test(d.innerText), lair: /巢穴/.test(d.innerText) } })
await page.screenshot({ path: `${shots}/2-monster.png` })
check('怪物详情带传奇组正文（巢穴动作等）', detail.hasGroup && detail.lair, detail.text.slice(0, 80))
await ctx.close()
server.close()
console.log(failures.length ? `FAIL ${failures.length}` : 'ALL PASS')
process.exit(failures.length ? 1 : 0)
