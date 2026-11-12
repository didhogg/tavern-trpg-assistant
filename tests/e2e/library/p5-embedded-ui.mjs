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
const { server, url } = await startStatic({ port: 47342 }) // 与测试库建库时同一端口（浏览器数据库按来源隔离）
const profile = `${work}/profile-p5eb-${engineName}`
await rm(profile, { recursive: true, force: true })
// 旧库 profile-b2-8a 里的官方资料已经读不到（P5 版本化之前建的），改用停点 B 修完后的真实库副本
await cp(`${work}/p5-t6-pack-audit-WST6kp`, profile, { recursive: true, filter: (p) => !p.includes('Singleton') })
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
// 书里的数值块（P5 T6 起照作者 _renderStatblock：带标题的框，内容摊开在书里，进入视野才加载）
const SB = '[data-testid="reader-body"] [data-testid="statblock-block"]'
await page.waitForFunction((sel) => document.getElementById('trpg-assistant-root').shadowRoot.querySelectorAll(sel).length > 20, SB, { timeout: 60000 }).catch(() => {})
await page.locator(SB).first().scrollIntoViewIfNeeded()
await page.waitForFunction((sel) => { const b = document.getElementById('trpg-assistant-root').shadowRoot.querySelector(sel); return b && !b.querySelector('[aria-busy="true"]') && b.textContent.length > 40 }, SB, { timeout: 60000 }).catch(() => {})
await settle(page, 800)
const snap = await page.evaluate((sel) => {
  const all = [...document.getElementById('trpg-assistant-root').shadowRoot.querySelectorAll(sel)]
  const first = all.slice(0, 3).map((b) => ({ head: b.querySelector('.lib-embedded__head')?.textContent.trim().slice(0, 30), linked: !!b.querySelector('.lib-embedded__head .trpg-term'), hasStat: !!b.querySelector('[data-testid="embedded-author"]'), text: b.textContent.length, missing: /库里没有/.test(b.textContent) }))
  return { blocks: all.length, linked: all.filter((b) => b.querySelector('.lib-embedded__head .trpg-term')).length, first }
}, SB)
check('书里的数值块是带标题的框，标题大多可点', snap.blocks > 20 && snap.linked >= snap.blocks * 0.9, JSON.stringify({ blocks: snap.blocks, linked: snap.linked }))
check('滚到的数值块真的摊开了内容（数值行或背景正文），不是只剩一个名字', snap.first.length > 0 && snap.first[0].text > 80 && !snap.first[0].missing, JSON.stringify(snap.first))
await page.screenshot({ path: `${shots}/1-reader.png` })
// 数值块（不是背景）：滚进视野、等加载完，里面要有数值行（防御 / 生命…）
const statBox = page.locator(`${SB}:not([data-fluff="true"])`).first()
await statBox.scrollIntoViewIfNeeded()
await page.waitForFunction((sel) => { const b = document.getElementById('trpg-assistant-root').shadowRoot.querySelector(sel); return b && !b.querySelector('[aria-busy="true"]') && (b.querySelector('[data-testid="embedded-author"]') || /库里没有|没读出来/.test(b.textContent)) }, `${SB}:not([data-fluff="true"])`, { timeout: 60000 }).catch(() => {})
await settle(page, 600)
const stat = await statBox.evaluate((b) => { const t = b.querySelector('[data-testid="embedded-author"]')?.textContent ?? ''; return { head: b.querySelector('.lib-embedded__head')?.textContent.trim().slice(0, 30), abil: ['力量', '敏捷', '体质', '智力', '感知', '魅力'].filter((x) => t.includes(x)).length, hp: /HP|生命值/.test(t), text: t.replace(/\s+/g, ' ').slice(0, 80) } })
await page.screenshot({ path: `${shots}/1b-reader-statblock.png` })
check('书里的「数值块」框摊开了完整数值（作者整条渲染：生命值 + 六项属性）', stat.hp && stat.abil === 6, JSON.stringify(stat))
await page.locator(`${SB} .lib-embedded__head .trpg-term`).first().click()
await page.waitForSelector('.trpg-modal__page:not(.is-under) [data-testid="entry-author"], .trpg-modal__page:not(.is-under) .lib-dbody', { timeout: 30000 })
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
const detail = await page.evaluate(() => { const d = document.getElementById('trpg-assistant-root').shadowRoot.querySelector('.trpg-modal__page:not(.is-under) .lib-dbody'); return { text: d.innerText, hasGroup: !!d.querySelector('[data-testid="entry-author"]'), lair: /巢穴|区域效应/.test(d.innerText) } })
await page.screenshot({ path: `${shots}/2-monster.png` })
check('怪物详情带传奇组正文（巢穴动作等）', detail.hasGroup && detail.lair, detail.text.slice(0, 80))
await page.keyboard.press('Escape'); await page.keyboard.press('Escape'); await page.keyboard.press('Escape')
await settle(page, 400)

// 资料里名字对不上的链接（上游中文数据：BMT 里「神奇蘑菇; 神奇蘑菇效应」，中文表名是「神奇蘑菇效应」）：显示成虚线并带说明，不和普通字混在一起
await page.locator('[data-testid="shelf-search"]').fill('BMT')
await settle(page, 400)
await page.locator('[data-testid="shelf-tab"] .trpg-shelf__row .lib-name').first().click()
await page.waitForSelector('[data-testid="pack-page"] [data-testid="book-row"]', { timeout: 60000 })
await page.locator('[data-testid="pack-page"] [data-testid="book-row"]').first().click()
await page.waitForSelector('[data-testid="reader-toc"]')
await page.locator('[data-testid="reader-toc"]').click()
const chapters = page.getByTestId('reader-toc-list').locator('details')
const n = await chapters.count()
let dead = null
for (let i = 0; i < n && !dead; i++) {
  const chapter = chapters.nth(i)
  if (await chapter.getAttribute('open') === null) await chapter.locator('summary').click()
  await chapter.getByRole('button', { name: '读本章', exact: true }).click()
  await settle(page, 1200)
  dead = await page.evaluate(() => { const d = document.getElementById('trpg-assistant-root').shadowRoot.querySelector('[data-testid="reader-body"] [data-testid="dead-link"]'); return d ? { text: d.textContent, title: d.title } : null })
  if (!dead && i < n - 1 && !(await page.locator('[data-testid="reader-toc-list"]').count())) await page.locator('[data-testid="reader-toc"]').click()
}
if (dead) await page.screenshot({ path: `${shots}/3-dead-link.png` })
check('名字对不上的链接显示成虚线，悬停说明「库里找不到」（不和普通字一样）', !!dead && /库里找不到/.test(dead.title), JSON.stringify(dead))
await ctx.close()
server.close()
console.log(failures.length ? `FAIL ${failures.length}` : 'ALL PASS')
process.exit(failures.length ? 1 : 0)
