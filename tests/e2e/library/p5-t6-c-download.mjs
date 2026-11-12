// P5 T6 C 段：下载页「官方资料与冒险」合并成一栏 + 分组全选框规则（[ ] 全选这组、[−] 取消这组）真实数据点击验证（Chrome）。
// 资料：p5-t6-pack-audit-WST6kp 副本（端口须 47342）；外网全部拦掉。用法：SKIP_BUILD=1 node tests/e2e/library/p5-t6-c-download.mjs
import { cp, mkdir, rm } from 'node:fs/promises'
import { startStatic } from './static.mjs'
import { buildAll, engines, work } from './chain-common.mjs'
import { check, failures, settle } from '../helpers.mjs'

if (!process.env.SKIP_BUILD) await buildAll()
const [, type, options] = engines.find((e) => e[0] === 'chrome')
const { server, url } = await startStatic({ port: 47342 })
const shots = `${work}/p5-t6-shots/c`
await mkdir(shots, { recursive: true })
const profile = `${work}/profile-p5t6-c-dl`
await rm(profile, { recursive: true, force: true })
await cp(`${work}/p5-t6-pack-audit-WST6kp`, profile, { recursive: true, filter: (p) => !p.includes('Singleton') })
const ctx = await type.launchPersistentContext(profile, { ...options, viewport: { width: 1280, height: 800 } })
const page = await ctx.newPage()
page.setDefaultTimeout(120000)
const errors = []
page.on('pageerror', (e) => errors.push(String(e.message ?? e).slice(0, 160)))
await ctx.route((u) => !u.href.startsWith(url), (r) => r.abort())
await page.goto(url)
const P = `(() => { const h = document.querySelector('#trpg-assistant-root'); return [...h.shadowRoot.children].map((c) => c.__vue_app__).find(Boolean).config.globalProperties.$pinia })()`
await page.waitForFunction(`!!(${P})._s.get('app')?.booted`)
await page.locator('.trpg-ball').click()
await settle(page, 600)
await page.locator('.trpg-window').getByRole('button', { name: '库', exact: true }).first().click()
await page.waitForSelector('[data-testid="shelf-tab"] .trpg-shelf__row')
await page.locator('.trpg-seg button', { hasText: '下载' }).first().click()
await page.waitForSelector('[data-testid="official-card"]')
await settle(page, 800)
const card = page.locator('[data-testid="official-card"]')

check('下载页只有两栏：「官方资料与冒险」和「自制包」，没有单独的冒险栏', (await card.locator('.lib-title').innerText()).includes('官方资料与冒险') && (await page.locator('[data-testid="adventure-list"]').count()) === 0, '')
// 不再分「全部 / 书 / 冒险」标签（驾驶员 2026-11-12）：冒险按作者分组，和书在同一组里
check('没有类型标签', (await page.locator('[data-testid^="kind-"]').count()) === 0, '')
const mixed = await page.evaluate((P) => {
  const g = eval(P)._s.get('library').shelf.groups.filter((x) => x.adventures.some((r) => r.set === 'cn-official'))
  return g.map((x) => ({ name: x.name, books: x.books.filter((r) => r.set === 'cn-official').length, adv: x.adventures.filter((r) => r.set === 'cn-official').length }))
}, P)
const grpWithBoth = mixed.find((x) => x.books > 0 && x.adv > 0)
await card.locator('.lib-dlgrp__btn', { hasText: grpWithBoth.name }).first().click()
await settle(page, 300)
const kinds = await card.locator('.lib-dlgrp', { has: page.locator('.lib-dlgrp__btn', { hasText: grpWithBoth.name }) }).first().locator('[data-testid="row-kind"]').allInnerTexts()
check('冒险作为作者分组里的一个包，和书在同一组', kinds.includes('书') && kinds.includes('冒险'), JSON.stringify({ group: grpWithBoth.name, kinds: [...new Set(kinds)], n: kinds.length }))
await card.locator('.lib-dlgrp__btn', { hasText: grpWithBoth.name }).first().click()
await page.screenshot({ path: `${shots}/merged.png` })

// 分组全选框：先卸载两本书让某组有能勾的行
const grpName = await page.evaluate(async (P) => {
  const ps = eval(P), be = ps._s.get('app').svc().backend, lib = ps._s.get('library')
  const g = lib.shelf.groups.find((x) => x.books.filter((r) => r.downloaded && r.set === 'cn-official' && r.id).length >= 2)
  for (const r of g.books.filter((r) => r.downloaded && r.set === 'cn-official' && r.id).slice(-2)) await be.removalExecute(await be.removalImpact({ kind: 'official', setId: r.set, bookIds: [r.id], bookSources: [r.source] }))
  await lib.refresh(ps._s.get('app').svc())
  return g.name
}, P)
await settle(page, 800)
await page.locator('[data-testid="official-card-multi"]').click()
const grp = card.locator('.lib-dlgrp', { has: page.locator('.lib-dlgrp__btn', { hasText: grpName }) }).first()
const box = grp.locator('[data-testid="group-check"]')
const state = async () => ({ aria: await box.getAttribute('aria-checked'), mark: (await box.innerText()).trim() })
const s0 = await state()
await box.click(); await settle(page, 300)
const s1 = await state()
const bar1 = await page.locator('[data-testid="official-card-selbar"]').innerText()
await page.screenshot({ path: `${shots}/group-check-on.png` })
await box.click(); await settle(page, 300)
const s2 = await state()
const bar2 = await page.locator('[data-testid="official-card-selbar"]').innerText()
check('分组全选框：[ ] 点一下 → 这一组能选的全选，框里变成「−」', s0.aria === 'false' && s0.mark === '' && s1.mark === '−' && /已选 2 本书/.test(bar1), JSON.stringify({ s0, s1, bar1: bar1.replace(/\n/g, ' ') }))
check('分组全选框：[−] 再点一下 → 这一组全部取消，框变回空', s2.aria === 'false' && s2.mark === '' && /已选 0 项/.test(bar2), JSON.stringify({ s2, bar2: bar2.replace(/\n/g, ' ') }))
// 只勾一部分时也显示「−」，再点取消这一组
if (!(await grp.locator('.trpg-row').count())) await grp.locator('.lib-dlgrp__btn').click() // 分组默认折叠，要点行得先展开
await grp.locator('.trpg-row .trpg-check:not([data-disabled="true"])').first().click()
await settle(page, 300)
const sPart = await state()
check('只勾了一部分：框也显示「−」', sPart.mark === '−', JSON.stringify(sPart))
await box.click(); await settle(page, 300)

// 【下载全部…】弹窗：列出还没装的书和冒险数量；点取消什么都不下
await page.locator('[data-testid="download-all-open"]').click()
await page.waitForSelector('[data-testid="download-all"]')
const dlg = await page.locator('[data-testid="download-all"]').innerText()
await page.screenshot({ path: `${shots}/download-all.png` })
check('【下载全部…】弹窗：勾选全部书 / 全部冒险，写出各还有几本没装', /全部官方书/.test(dlg) && /全部冒险/.test(dlg) && /还有 \d+ 本没装/.test(dlg), dlg.replace(/\n/g, ' | ').slice(0, 200))
const tasksBefore = await page.evaluate((P) => eval(P)._s.get('app').svc().backend.library.tasks.list().length, P)
await page.locator('[data-testid="download-all"] .trpg-btn', { hasText: '取消' }).click()
await settle(page, 400)
check('【下载全部…】点取消：一个任务都没开', (await page.evaluate((P) => eval(P)._s.get('app').svc().backend.library.tasks.list().length, P)) === tasksBefore, '')

// 自制栏（平铺列表）：多选时顶上一行「本页全部」，右侧同样的全选框
// 断网时自制目录是空的：放两行本地包进目录（只为看列表结构）
await page.evaluate((P) => { const cat = eval(P)._s.get('brewcatalog'); const f = (n) => ({ urlDownload: `https://fixtures.example.test/${n}.json`, path: `x/${n}.json`, name: `测试作者; ${n}.json`, sources: [] }); cat.rows = [{ zh: f('甲'), en: null, status: 'zh-only' }, { zh: f('乙'), en: null, status: 'zh-only' }] }, P)
await settle(page, 300)
const brew = page.locator('[data-testid="brew-list"]')
{
  await page.locator('[data-testid="brew-list-multi"]').click()
  check('自制栏多选：顶上有「本页全部」和同样的全选框', (await brew.locator('.lib-dlgrp__sum', { hasText: '本页全部' }).locator('[data-testid="group-check"]').count()) === 1, '')
}
const real = errors.filter((e) => !/gendata-nav-adventure-book-index|网络错误|Network error|找不到物品(类型|属性)|无法加载 \d+ 个条目的引用/.test(e))
check('没有界面自己的页面错误', real.length === 0, real.join(' | '))
await ctx.close(); server.close()
console.log(failures.length ? `FAIL ${failures.length}` : 'ALL PASS')
process.exit(failures.length ? 1 : 0)
