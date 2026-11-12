// P5 T6 B 单元（下载页、悬浮窗、拉取更新、任务前后书架不变）真实数据点击验证（Chrome）。
// 资料：p5-t6-pack-audit-WST6kp 副本（端口须 47342）；外网全部拦掉。
// 「下载中」的造法：先在后端单本卸载一本书（会移除它的文件），再从下载页把它下回来；外网请求挂着不回，任务停在下载中。
// 拉取更新要连上游：这里替换 updates.check 和任务启动，沿用真实 apply 来判定共用文件。
// 用法：SKIP_BUILD=1 node tests/e2e/library/p5-t6-b.mjs
import { cp, mkdir, rm } from 'node:fs/promises'
import { startStatic } from './static.mjs'
import { buildAll, engines, work } from './chain-common.mjs'
import { check, failures, settle } from '../helpers.mjs'

if (!process.env.SKIP_BUILD) await buildAll()
const [, type, options] = engines.find((e) => e[0] === 'chrome')
const { server, url } = await startStatic({ port: 47342 })
const shots = `${work}/p5-t6-shots/b`
await mkdir(shots, { recursive: true })
const P = `(() => { const h = document.querySelector('#trpg-assistant-root'); return [...h.shadowRoot.children].map((c) => c.__vue_app__).find(Boolean).config.globalProperties.$pinia })()`

async function open(label, viewport) {
  const profile = `${work}/profile-p5t6b-${label}`
  await rm(profile, { recursive: true, force: true })
  await cp(`${work}/p5-t6-pack-audit-WST6kp`, profile, { recursive: true, filter: (p) => !p.includes('Singleton') })
  const ctx = await type.launchPersistentContext(profile, { ...options, viewport })
  const page = await ctx.newPage()
  page.setDefaultTimeout(120000)
  const errors = []
  page.on('pageerror', (e) => errors.push(String(e.message ?? e).slice(0, 160)))
  await ctx.route((u) => !u.href.startsWith(url), (r) => r.abort())
  await page.goto(url)
  await page.waitForFunction(`!!(${P})._s.get('app')?.booted`)
  await page.locator('.trpg-ball').click()
  await settle(page, 600)
  await page.locator('.trpg-window').getByRole('button', { name: '库', exact: true }).first().click()
  await page.waitForSelector('[data-testid="shelf-tab"] .trpg-shelf__row')
  await settle(page, 800)
  return { ctx, page, errors }
}
const tab = (page, name) => page.locator('.trpg-seg button', { hasText: name }).first().click()
// 卸载一本官方书（文件保留），返回它的名字；之后从下载页下回来
async function uninstallOne(page) {
  return page.evaluate(async (P) => {
    const ps = eval(P), be = ps._s.get('app').svc().backend, lib = ps._s.get('library')
    const rows = lib.shelf.groups.flatMap((g) => g.books).filter((r) => r.downloaded && r.set === 'cn-official' && r.id && r.source !== 'PHB')
    const r = rows.at(-1)
    await be.removalExecute(await be.removalImpact({ kind: 'official', setId: r.set, bookIds: [r.id], bookSources: [r.source] }))
    await lib.refresh(ps._s.get('app').svc())
    return r.name
  }, P)
}
const geo = (page) => page.evaluate(() => {
  const sr = document.querySelector('#trpg-assistant-root').shadowRoot
  const pop = sr.querySelector('[data-testid="lib-pop"]')
  const win = sr.querySelector('.trpg-window').getBoundingClientRect()
  const nav = sr.querySelector('[data-testid="nav-library"]').getBoundingClientRect()
  const ring = sr.querySelector('[data-testid="lib-ring"]')?.getBoundingClientRect() ?? null
  if (!pop) return { pop: null, win, nav, ring }
  const p = pop.getBoundingClientRect()
  const top = sr.elementFromPoint(p.left + p.width / 2, p.top + Math.min(20, p.height / 2))
  return { pop: { l: p.left, t: p.top, r: p.right, b: p.bottom }, win: { l: win.left, t: win.top, r: win.right, b: win.bottom }, nav: { l: nav.left, t: nav.top, r: nav.right, b: nav.bottom }, ring: ring && { l: ring.left, t: ring.top, r: ring.right, b: ring.bottom }, onTop: !!top && pop.contains(top), vw: innerWidth, vh: innerHeight }
})

// ── 宽屏：下载页、按书下载、悬浮窗 ──
if (!process.env.SKIP_WIDE) {
  const { ctx, page, errors } = await open('wide', { width: 1280, height: 800 })
  const name = await uninstallOne(page)
  const boundBefore = await page.evaluate((P) => eval(P)._s.get('library').bound, P)
  await tab(page, '下载')
  await page.waitForSelector('[data-testid="official-card"]')
  // 分组默认折叠；搜索后自动展开
  const collapsed = await page.locator('[data-testid="official-card"] .trpg-row').count()
  await page.locator('[data-testid="official-card"] input[type="search"]').fill(name.slice(0, 4))
  await settle(page, 300)
  const found = await page.locator('[data-testid="official-card"] .trpg-row', { hasText: name }).count()
  check('官方资料按作者分类折叠；搜索时自动展开有结果的组', collapsed === 0 && found >= 1, `折叠时 ${collapsed} 行，搜到 ${found} 行`)
  await page.screenshot({ path: `${shots}/wide-download-search.png` })
  // 多选：勾上一本，换搜索词后仍算已选
  await page.locator('[data-testid="official-card-multi"]').click()
  await page.locator('[data-testid="official-card"] .trpg-row', { hasText: name }).first().locator('.trpg-check').click()
  await page.locator('[data-testid="official-card"] input[type="search"]').fill('完全对不上的词')
  await settle(page, 300)
  const bar = await page.locator('[data-testid="official-card-selbar"]').innerText()
  check('多选和搜索互不影响：搜别的词，已选仍是 1 本', /已选 1 本/.test(bar), bar.replace(/\n/g, ' '))
  await page.waitForFunction(() => !/正在计算大小/.test(document.querySelector('#trpg-assistant-root').shadowRoot.querySelector('[data-testid="official-card-selbar"]')?.textContent ?? ''), null, { timeout: 30000 }).catch(() => null)
  const bar2 = await page.locator('[data-testid="official-card-selbar"]').innerText()
  check('选中后显示要下载多少（或如实写算不出）', /要下载|算不出/.test(bar2), bar2.replace(/\n/g, ' '))
  await page.screenshot({ path: `${shots}/wide-multiselect.png` })
  // 卸载会移除这本书的文件，外网又是断开的：让外网请求一直挂着（模拟慢网），才看得到「下载中」并在中途取消
  await ctx.route((u) => !u.href.startsWith(url), () => {})
  await page.locator('[data-testid="official-card-download-selected"]').click()
  await page.locator('[data-testid="official-card"] input[type="search"]').fill(name.slice(0, 4))
  // 下载中：行上有进度；悬浮窗能看见、在最上层、移进去不消失
  await page.waitForFunction(() => document.querySelector('#trpg-assistant-root').shadowRoot.querySelector('[data-testid="lib-ring"]'), null, { timeout: 30000 })
  const rowText = await page.locator('[data-testid="official-card"] .trpg-row', { hasText: name }).first().innerText()
  check('按书下载：这一行显示下载中', /下载中/.test(rowText), rowText.replace(/\n/g, ' '))
  await page.getByTestId('nav-library').hover()
  await page.waitForSelector('[data-testid="lib-pop"]')
  await settle(page, 300)
  const g = await geo(page)
  check('悬浮窗看得见：在最上层，没被插件窗口裁掉或盖住', !!g.pop && g.onTop && g.pop.l >= 0 && g.pop.r <= g.vw && g.pop.t >= 0 && g.pop.b <= g.vh, JSON.stringify(g))
  const pb = await page.getByTestId('lib-pop').boundingBox()
  await page.mouse.move(pb.x + pb.width / 2, pb.y + 12, { steps: 8 })
  await settle(page, 600)
  check('鼠标从图标移进悬浮窗：不消失', (await page.getByTestId('lib-pop').count()) === 1, '')
  const popText = await page.getByTestId('lib-pop').innerText()
  check('悬浮窗按书显示任务，只有取消按钮', popText.includes(name) && !/暂停|继续/.test(popText) && (await page.getByTestId('lib-pop').getByRole('button', { name: /取消下载/ }).count()) === 1, popText.replace(/\n/g, ' | '))
  await page.screenshot({ path: `${shots}/wide-popover-running.png` })
  // 任务进行中：书架不清空、战役状态不变
  const during = await page.evaluate((P) => { const lib = eval(P)._s.get('library'); return { rows: lib.shelf?.groups.flatMap((g) => g.books).filter((r) => r.downloaded).length ?? 0, bound: lib.bound, error: lib.error } }, P)
  check('下载进行中：书架还在、战役状态不变、没有书架错误', during.rows > 0 && during.bound === boundBefore && !during.error, JSON.stringify(during))
  await page.getByTestId('lib-pop').getByRole('button', { name: /取消下载/ }).click()
  await page.getByText(/已取消「.*」未完成的下载/).first().waitFor()
  check('取消直接生效，横幅提示，没有弹窗', await page.getByTestId('confirm-page').count() === 0, '')
  await page.screenshot({ path: `${shots}/wide-cancelled.png` })
  await settle(page, 1500)
  const after = await page.evaluate((P) => ({ ring: eval(P)._s.get('downloads').ring, count: eval(P)._s.get('downloads').count, bound: eval(P)._s.get('library').bound, items: eval(P)._s.get('downloads').items.map((i) => [i.key, i.status]), tasks: eval(P)._s.get('app').svc().backend.library.tasks.list().map((t) => [t.id.slice(0, 12), t.kind, t.status]) }), P)
  check('取消后：这一项消失、图标外环消失、战役状态不变', after.count === 0 && after.ring !== 'running' && after.ring !== 'spin' && after.bound === boundBefore, JSON.stringify(after))
  const real = errors.filter((e) => !/gendata-nav-adventure-book-index|网络错误|Network error|找不到物品(类型|属性)|无法加载 \d+ 个条目的引用/.test(e))
  check('宽屏流程没有界面自己的页面错误（作者 / 网络类单列）', real.length === 0, real.join(' | '))
  await ctx.close()
}

// ── 拉取更新：替换检查 / 更新的返回，只测界面流程 ──
{
  const { ctx, page } = await open('update', { width: 1280, height: 800 })
  const target = await page.evaluate((P) => {
    const ps = eval(P), be = ps._s.get('app').svc().backend, lib = ps._s.get('library')
    const rows = lib.shelf.groups.flatMap((g) => g.books).filter((r) => r.downloaded && r.set === 'cn-official' && r.id)
    const a = rows[0], b = rows[1]
    window.__applied = []
    be.library.updates.check = async (setId) => setId === 'cn-official'
      ? { setId, status: 'available', current: 'c1', latest: 'c2', programVersion: { plugin: 'x', upstream: 'x' }, shared: true, changed: { changed: 3, added: 0, removed: 0, bytes: 1048576 }, objects: [{ kind: 'book', id: a.id, source: a.source, name: a.name, added: 0, changed: 2, removed: 0, bytes: 1, shared: true }, { kind: 'book', id: b.id, source: b.source, name: b.name, added: 0, changed: 1, removed: 0, bytes: 1, shared: true }] }
      : { setId, status: 'up-to-date', current: 'c', latest: 'c', programVersion: { plugin: 'x', upstream: 'x' } }
    be.library.service.brewCheckUpdates = async () => ({ value: [], errors: [] })
    const apply = be.library.updates.apply.bind(be.library.updates)
    be.library.tasks.startOfficial = () => 'fake-task'
    be.library.updates.apply = (setId, opts = {}) => {
      window.__applied.push(opts)
      return apply(setId, opts)
    }
    return { a: a.name, b: b.name }
  }, P)
  await page.locator('[data-testid="shelf-tab"] .trpg-more').first().click()
  await page.locator('.trpg-dropdown__item', { hasText: '拉取更新' }).click()
  await page.waitForSelector('[data-testid="row-update"]')
  const n = await page.locator('[data-testid="row-update"]').count()
  const notice = await page.locator('[data-testid="lib-notice"]', { hasText: '可以更新' }).innerText()
  check('拉取更新：有更新的两本书行上出现【有更新 · 更新】，顶部横幅带【全部更新】', n === 2 && /全部更新/.test(notice), `${n} 行；${notice.replace(/\n/g, ' ')}`)
  await page.screenshot({ path: `${shots}/update-marks.png` })
  await page.locator('[data-testid="shelf-tab"] .trpg-shelf__row', { hasText: target.a }).first().locator('[data-testid="row-update"]').click()
  await page.waitForSelector('[data-testid="confirm-page"]')
  const conf = await page.locator('[data-testid="confirm-page"]').innerText()
  await page.screenshot({ path: `${shots}/update-batch-confirm.png` })
  check('共用文件变化：弹窗说明原因并列出会一起更新的书', /共用文件/.test(conf) && conf.includes(target.b) && conf.includes(target.a), conf.replace(/\n/g, ' | ').slice(0, 300))
  await page.locator('.trpg-confirm__actions .trpg-btn--primary').click()
  await settle(page, 600)
  const applied = await page.evaluate(() => window.__applied)
  check('确认后：先试单本、再按整批更新（不带书号）', applied.length === 2 && applied[0].bookIds?.length === 1 && !applied[1].bookIds, JSON.stringify(applied))
  await ctx.close()
}

// ── 窄屏：底栏图标外环不出栏框，悬浮窗在图标上方、在屏幕内 ──
{
  const { ctx, page } = await open('narrow', { width: 390, height: 700 })
  await uninstallOne(page)
  await tab(page, '下载')
  await page.waitForSelector('[data-testid="official-card"]')
  await page.locator('[data-testid="official-card"] [data-testid="book-download"]').first().click({ trial: true }).catch(() => null)
  // 搜到刚卸载的书并下载
  const name = await page.evaluate((P) => eval(P)._s.get('library').shelf.groups.flatMap((g) => g.books).find((r) => !r.downloaded && r.set === 'cn-official' && r.id)?.name, P)
  await page.locator('[data-testid="official-card"] input[type="search"]').fill(name.slice(0, 4))
  await ctx.route((u) => !u.href.startsWith(url), () => {})
  await page.locator('[data-testid="official-card"] .trpg-row', { hasText: name }).first().locator('[data-testid="book-download"]').click()
  await page.waitForFunction(() => document.querySelector('#trpg-assistant-root').shadowRoot.querySelector('[data-testid="lib-ring"]'), null, { timeout: 30000 })
  await settle(page, 500)
  await page.getByTestId('nav-library').click()
  await page.waitForSelector('[data-testid="library-view"]').catch(() => null)
  // 触屏点按打开悬浮窗：用 pointerType=touch 的点击
  await page.getByTestId('nav-library').dispatchEvent('click', { pointerType: 'touch' }).catch(() => null)
  await page.getByTestId('nav-library').hover()
  await settle(page, 600)
  const g = await geo(page)
  await page.screenshot({ path: `${shots}/narrow-ring-popover.png` })
  check('窄屏：图标外环在底栏按钮范围内', !!g.ring && g.ring.l >= g.nav.l - 1 && g.ring.r <= g.nav.r + 1 && g.ring.t >= g.nav.t - 1 && g.ring.b <= g.nav.b + 1, JSON.stringify({ ring: g.ring, nav: g.nav }))
  if (g.pop) check('窄屏：悬浮窗在屏幕内、在最上层', g.pop.l >= 0 && g.pop.r <= g.vw && g.pop.t >= 0 && g.onTop, JSON.stringify(g.pop))
  await ctx.close()
}
server.close()
console.log(failures.length ? `FAIL ${failures.length}` : 'ALL PASS')
process.exit(failures.length ? 1 : 0)
