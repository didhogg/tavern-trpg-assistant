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
const profile = `${work}/profile-p5ml-${engineName}`
const shots = `${work}/p5-modal-shots-${engineName}`
await rm(shots, { recursive: true, force: true })
await mkdir(shots, { recursive: true })

async function run(label, viewport) {
  await rm(`${profile}-${label}`, { recursive: true, force: true })
  await cp(`${work}/profile-b2-8a-${engineName}`, `${profile}-${label}`, { recursive: true })
  const ctx = await type.launchPersistentContext(`${profile}-${label}`, { ...options, viewport })
  const page = await ctx.newPage()
  page.setDefaultTimeout(120000)
  await page.route((u) => !u.href.startsWith(url), (route) => route.abort())
  await page.goto(url)
  const pinia = `(() => { const h = document.querySelector('#trpg-assistant-root'); return [...h.shadowRoot.children].map((c) => c.__vue_app__).find(Boolean).config.globalProperties.$pinia })()`
  await page.waitForFunction(`!!(${pinia})._s.get('app')?.booted`)
  await page.locator('.trpg-ball').click()
  await settle(page, 600)
  const nav = (name) => page.locator('.trpg-window').getByRole('button', { name }).first()
  await nav('库').click()
  await page.waitForSelector('[data-testid="shelf-tab"] .trpg-shelf__row', { timeout: 120000 })
  await settle(page, 800)
  // 书架顶部搜索框
  const rowsBefore = await page.locator('.trpg-shelf__row').count()
  await page.locator('[data-testid="shelf-search"]').fill('玩家手册')
  await settle(page, 300)
  const rowsAfter = await page.locator('.trpg-shelf__row').count()
  check(`${label}：书架顶部有搜索框，输入后列表变少`, rowsAfter > 0 && rowsAfter < rowsBefore, `${rowsBefore} → ${rowsAfter}`)
  await page.screenshot({ path: `${shots}/${label}-1-shelf-search.png` })
  await page.locator('[data-testid="shelf-search"]').fill('')
  await settle(page, 300)
  // 打开包弹窗，在里面输入搜索
  await page.locator('.trpg-shelf__row .lib-name').first().click()
  await page.waitForSelector('[data-testid="pack-page"]')
  await settle(page, 1200)
  await page.locator('[data-testid="pack-page"] input[type="search"]').fill('法')
  await settle(page, 300)
  const geo = await page.evaluate(() => {
    const root = document.getElementById('trpg-assistant-root').shadowRoot
    const win = root.querySelector('.trpg-window').getBoundingClientRect()
    const side = root.querySelector('.trpg-side')?.getBoundingClientRect()
    const tabs = root.querySelector('.trpg-tabs')?.getBoundingClientRect()
    const modal = root.querySelector('.trpg-modal').getBoundingClientRect()
    return { win: { l: win.left, r: win.right, t: win.top, b: win.bottom }, side: side ? { r: side.right } : null, tabs: tabs ? { t: tabs.top } : null, modal: { l: modal.left, r: modal.right, t: modal.top, b: modal.bottom } }
  })
  await page.screenshot({ path: `${shots}/${label}-2-modal-open.png` })
  if (geo.side) check(`${label}：弹窗不盖侧栏（弹窗左边 ≥ 侧栏右边）`, geo.modal.l >= geo.side.r - 1, JSON.stringify(geo))
  if (geo.tabs) check(`${label}：弹窗不盖底栏（弹窗下边 ≤ 底栏上边）`, geo.modal.b <= geo.tabs.t + 1, JSON.stringify(geo))
  // 弹窗开着时侧栏 / 底栏能点：切到首页，弹窗藏起来
  await nav('首页').click()
  await settle(page, 400)
  const hidden = await page.evaluate(() => getComputedStyle(document.getElementById('trpg-assistant-root').shadowRoot.querySelector('.trpg-modal')).display === 'none')
  check(`${label}：弹窗开着时点侧栏 / 底栏的【首页】能切页，弹窗藏起来`, hidden, '')
  await page.screenshot({ path: `${shots}/${label}-3-other-page.png` })
  await nav('库').click()
  await settle(page, 400)
  const back = await page.evaluate(() => {
    const root = document.getElementById('trpg-assistant-root').shadowRoot
    const m = root.querySelector('.trpg-modal')
    return { shown: getComputedStyle(m).display !== 'none', value: root.querySelector('[data-testid="pack-page"] input[type="search"]')?.value ?? null }
  })
  check(`${label}：切回库页，上次停留的弹窗还在且搜索框里的字没丢`, back.shown && back.value === '法', JSON.stringify(back))
  // 拖动：宽屏从侧栏品牌区拖动窗口（弹窗开着）
  if (geo.side) {
    const before = await page.evaluate(() => document.getElementById('trpg-assistant-root').shadowRoot.querySelector('.trpg-window').getBoundingClientRect().left)
    const b = await page.locator('.trpg-side__brand').boundingBox()
    await page.mouse.move(b.x + 20, b.y + 20); await page.mouse.down(); await page.mouse.move(b.x + 60, b.y + 40, { steps: 5 }); await page.mouse.up()
    await settle(page, 200)
    const after = await page.evaluate(() => document.getElementById('trpg-assistant-root').shadowRoot.querySelector('.trpg-window').getBoundingClientRect().left)
    check(`${label}：弹窗开着也能从侧栏拖动整个插件窗口`, Math.abs(after - before) > 10, `${before} → ${after}`)
  }
  await ctx.close()
}

await run('wide', { width: 1280, height: 800 })
await run('narrow', { width: 400, height: 800 })
server.close()
console.log(failures.length ? `FAIL ${failures.length}` : 'ALL PASS')
process.exit(failures.length ? 1 : 0)
