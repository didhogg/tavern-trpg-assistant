// P5 T6 A 单元（书架、删除确认、包身份）真实数据点击验证（Chrome）。
// 资料：停点 B 修后真实库 p5-t6-pack-audit-WST6kp 的副本（端口须为 47342，浏览器数据库按来源隔离）。
// 用法：SKIP_BUILD=1 node tests/e2e/library/p5-t6-a.mjs
import { cp, mkdir, rm } from 'node:fs/promises'
import { startStatic } from './static.mjs'
import { buildAll, engines, work } from './chain-common.mjs'
import { check, failures, settle } from '../helpers.mjs'

if (!process.env.SKIP_BUILD) await buildAll()
const [, type, options] = engines.find((e) => e[0] === 'chrome')
const { server, url } = await startStatic({ port: 47342 })
const shots = `${work}/p5-t6-shots/a`
await mkdir(shots, { recursive: true })
const pinia = `(() => { const h = document.querySelector('#trpg-assistant-root'); return [...h.shadowRoot.children].map((c) => c.__vue_app__).find(Boolean).config.globalProperties.$pinia })()`

async function open(label, viewport) {
  const profile = `${work}/profile-p5t6a-${label}`
  await rm(profile, { recursive: true, force: true })
  await cp(`${work}/p5-t6-pack-audit-WST6kp`, profile, { recursive: true, filter: (p) => !p.includes('Singleton') })
  const ctx = await type.launchPersistentContext(profile, { ...options, viewport })
  const page = await ctx.newPage()
  page.setDefaultTimeout(120000)
  const errors = []
  page.on('pageerror', (e) => errors.push(String(e.message ?? e).slice(0, 200)))
  await page.route((u) => !u.href.startsWith(url), (route) => route.abort())
  await page.goto(url)
  await page.waitForFunction(`!!(${pinia})._s.get('app')?.booted`)
  await page.locator('.trpg-ball').click()
  await settle(page, 600)
  await page.locator('.trpg-window').getByRole('button', { name: '库', exact: true }).first().click()
  await page.waitForSelector('[data-testid="shelf-tab"] .trpg-shelf__row')
  await settle(page, 800)
  return { ctx, page, errors }
}

// 长清单确认框：后端预览换成 60 行，按钮必须在弹窗里可见；取消不执行
async function longConfirm(label, viewport) {
  const { ctx, page } = await open(label, viewport)
  await page.evaluate((P) => {
    const be = eval(P)._s.get('app').svc().backend
    window.__exec = 0
    // 卸载走多目标接口（P5-5 §12）：同样造 60 行长名单
    be.removalImpactMany = async (targets) => ({ targets, parts: [], plan: { fingerprint: 'f' }, removeTogether: [], houseRules: [], choices: [], saves: [],
      packs: Array.from({ length: 60 }, (_, i) => ({ docIdLocal: `p${i}`, filename: `一个名字很长很长的自制包第 ${i + 1} 号（用来撑长清单）.json`, why: '依赖它提供的法术', mustRemove: i < 30 })) })
    be.removalSizes = async (targets) => ({ each: targets.map(() => 1000), total: 1000 })
    be.removalExecuteMany = async () => { window.__exec++; return { done: ['cn'], reclaim: null } }
  }, pinia)
  const row = page.locator('[data-testid="shelf-tab"] .trpg-shelf__row').first()
  await row.locator('.trpg-more').click()
  await page.locator('.trpg-dropdown__item', { hasText: '卸载这本书' }).click()
  await page.waitForSelector('[data-testid="confirm-page"]')
  await settle(page, 500)
  const geo = await page.evaluate(() => {
    const root = document.querySelector('#trpg-assistant-root').shadowRoot
    const card = root.querySelector('.trpg-modal[data-variant="confirm"] .trpg-modal__card, .trpg-modal .trpg-modal__card')
    const btns = [...root.querySelectorAll('.trpg-confirm__actions .trpg-btn')].map((b) => b.getBoundingClientRect())
    const sc = root.querySelector('[data-testid="confirm-details"]')
    const c = card.getBoundingClientRect()
    return { card: { t: c.top, b: c.bottom }, btns: btns.map((b) => ({ t: b.top, b: b.bottom })), scroll: sc.scrollHeight > sc.clientHeight, vh: innerHeight }
  })
  await page.screenshot({ path: `${shots}/${label}-long-confirm.png` })
  check(`${label}：60 行清单时两个按钮都在弹窗里看得见`, geo.btns.length === 2 && geo.btns.every((b) => b.t >= geo.card.t && b.b <= geo.card.b + 1 && b.b <= geo.vh), JSON.stringify(geo))
  check(`${label}：明细区可以自己滚动`, geo.scroll, '')
  await page.locator('.trpg-confirm__actions .trpg-btn', { hasText: '取消' }).click()
  await settle(page, 400)
  check(`${label}：点取消一次也不执行`, (await page.evaluate(() => window.__exec)) === 0, '')
  await ctx.close()
}

await longConfirm('wide', { width: 1280, height: 800 })
await longConfirm('narrow', { width: 390, height: 640 })

// 真实流程：中英名搜索、单本卸载、按真实包编号打开自制包
{
  const { ctx, page, errors } = await open('real', { width: 1280, height: 800 })
  const rows = page.locator('[data-testid="shelf-tab"] .trpg-shelf__row')
  const before = await rows.count()
  await page.locator('[data-testid="shelf-search"]').fill("Player's Handbook")
  await settle(page, 300)
  const hits = await rows.allInnerTexts()
  check('书架用英文名能搜到中文书', hits.some((t) => t.includes('玩家手册')), hits.slice(0, 3).join(' | '))
  await page.locator('[data-testid="shelf-search"]').fill('')
  await settle(page, 300)
  const boundBefore = await page.evaluate((P) => eval(P)._s.get('library').bound, pinia)
  // 选最后一本官方书（不碰玩家手册），走真实卸载
  const pick = await page.evaluate((P) => {
    const lib = eval(P)._s.get('library')
    const all = lib.shelf.groups.flatMap((g) => g.books).filter((r) => r.downloaded && r.set.endsWith('official') && r.id && r.source !== 'PHB')
    const r = all.at(-1)
    return r ? { name: r.name, source: r.source } : null
  }, pinia)
  if (pick && !process.env.SKIP_UNINSTALL) {
    const row = rows.filter({ hasText: pick.name }).first()
    await row.locator('.trpg-more').click()
    await page.locator('.trpg-dropdown__item', { hasText: '卸载这本书' }).click()
    await page.waitForSelector('[data-testid="confirm-page"]')
    await page.screenshot({ path: `${shots}/real-uninstall-confirm.png` })
    await page.locator('.trpg-confirm__actions .trpg-btn--danger').click()
    await page.waitForFunction(([P, n]) => !eval(P)._s.get('library').shelf.groups.flatMap((g) => g.books).some((r) => r.name === n && r.downloaded), [pinia, pick.name], { timeout: 120000 }).catch(() => null)
    await settle(page, 800)
    const after = await rows.count()
    const still = await page.evaluate(([P, n]) => eval(P)._s.get('library').shelf.groups.flatMap((g) => g.books).some((r) => r.name === n && r.downloaded), [pinia, pick.name])
    await page.screenshot({ path: `${shots}/real-after-uninstall.png` })
    check(`单本卸载《${pick.name}》：这本不在书架了，其余还在`, !still && after === before - 1, `${before} → ${after}`)
    check('卸载后战役状态没变（不会变成「没有战役」）', (await page.evaluate((P) => eval(P)._s.get('library').bound, pinia)) === boundBefore, '')
    check('卸载后没有书架错误横幅', !(await page.locator('[data-testid="lib-notice"]', { hasText: '书架这次没读出来' }).count()), '')
  } else if (!process.env.SKIP_UNINSTALL) check('有可卸载的官方书', false, '')
  // 自制包按真实包编号打开（这个库里的自制包都是导入的，在【我的库】）
  await page.locator('.lib-tabs, [role="tablist"]').getByRole('button', { name: '我的库' }).first().click().catch(async () => page.getByRole('button', { name: '我的库' }).first().click())
  await page.waitForSelector('[data-testid="mylib-open"]')
  const mine = page.locator('[data-testid="mylib-open"]', { hasText: '超大长弓' })
  if (await mine.count()) {
    await mine.first().click()
    await page.waitForSelector('[data-testid="pack-page"] .lib-count')
    await page.waitForFunction(() => !/正在读取/.test(document.querySelector('#trpg-assistant-root').shadowRoot.querySelector('[data-testid="pack-page"] .lib-count').textContent), null, { timeout: 120000 })
    const count = await page.locator('[data-testid="pack-page"] .lib-count').innerText()
    await page.screenshot({ path: `${shots}/real-brew-pack.png` })
    check('我的库按真实包编号打开「超大长弓」只列这个包自己的条目', /共 1 条/.test(count), count)
  } else check('我的库里有超大长弓包', false, '')
  // 作者程序自己的报错单列计数（已知导航索引 404、测试拦外网导致的网络错误、作者物品类型 / 属性提示），不算界面错误，也不藏起来
  const author = /gendata-nav-adventure-book-index|网络错误|Network error|找不到物品(类型|属性)/
  const real = errors.filter((e) => !author.test(e))
  console.log('作者 / 网络类页面错误（单列）：', errors.length - real.length, [...new Set(errors.filter((e) => author.test(e)).map((e) => e.slice(0, 40)))].slice(0, 6).join(' | '))
  check('没有界面自己的页面错误', real.length === 0, real.join(' | '))
  await ctx.close()
}
server.close()
console.log(failures.length ? `FAIL ${failures.length}` : 'ALL PASS')
process.exit(failures.length ? 1 : 0)
