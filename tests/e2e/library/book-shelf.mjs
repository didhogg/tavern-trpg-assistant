// BE-7 书架：空库联网，不装官方数据就能列出各本书和冒险（作者书目文件 + 作者分组表）；
// 第二次走缓存、断网也能列；全新空库断网时给出明确原因而不是卡住。Chrome / WebKit 用 ENGINE=webkit 切换。
import { rm, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { startStatic } from './static.mjs'
import { buildAll, engines, work } from './chain-common.mjs'

await buildAll()
const ENGINE = process.env.ENGINE === 'webkit' ? 'webkit' : 'chrome'
const [, type, options] = engines[ENGINE === 'webkit' ? 1 : 0]
const { server, url } = await startStatic({ port: 47338 })
const report = { engine: ENGINE, checks: [], timings: {} }
const check = (name, ok, detail) => { report.checks.push({ name, ok: !!ok, detail }); if (!ok) console.log('FAIL', name, JSON.stringify(detail)) }

async function boot(profile, { online, block = [], gone = [], prefetch = false }) {
  const ctx = await type.launchPersistentContext(profile, { ...options, viewport: { width: 1280, height: 800 } })
  const page = await ctx.newPage()
  if (prefetch) await page.addInitScript(() => { window.__TRPG_PREFETCH__ = true })
  page.setDefaultTimeout(120000)
  const external = []
  const pageErrors = []
  page.on('pageerror', (e) => pageErrors.push(String(e.message ?? e).slice(0, 160)))
  page.on('request', (r) => { if (!r.url().startsWith(url)) external.push(r.url()) })
  if (!online) await page.route((u) => !u.href.startsWith(url), (route) => route.abort())
  if (gone.length) await page.route((u) => gone.some((g) => u.href.endsWith(g)), (route) => route.fulfill({ status: 404, body: '' }))
  if (online && block.length) await page.route((u) => !u.href.startsWith(url) && block.some((b) => u.href.endsWith(b)), (route) => route.abort())
  await page.goto(url)
  await page.waitForFunction(() => { const h = document.querySelector('#trpg-assistant-root'); const app = [...(h?.shadowRoot?.children ?? [])].map((c) => c.__vue_app__).find(Boolean); return app?.config.globalProperties.$pinia._s.get('app')?.booted })
  return { ctx, page, external, pageErrors }
}
const wizard = (page, codeSet) => page.evaluate(async (cs) => {
  const host = document.querySelector('#trpg-assistant-root')
  const app = [...(host.shadowRoot.children)].map((c) => c.__vue_app__).find(Boolean)
  const backend = app.config.globalProperties.$pinia._s.get('app').svc().backend
  const t = performance.now()
  const o = await backend.starter.wizardOptions('dnd5e2014', cs)
  const ms = Math.round(performance.now() - t)
  const lib = backend.library.db
  const rows = o.shelf.flatMap((g) => [...g.books, ...g.adventures])
  return {
    ms, shelfError: o.shelfError, adventureError: o.adventureError, blockingError: o.blockingError, catalogUnavailable: o.catalogUnavailable, groups: o.shelf.map((g) => [g.group, g.name, g.books.length, g.adventures.length]),
    books: rows.filter((r) => r.kind === 'book').length, adventures: rows.filter((r) => r.kind === 'adventure').length,
    noShelf: rows.filter((r) => !r.shelf).length, anyDownloaded: rows.some((r) => r.downloaded),
    phb: rows.find((r) => r.kind === 'book' && r.source === 'PHB') ? { group: rows.find((r) => r.kind === 'book' && r.source === 'PHB').shelf.group, name: rows.find((r) => r.kind === 'book' && r.source === 'PHB').name, visible: rows.find((r) => r.kind === 'book' && r.source === 'PHB').view.visible } : null,
    lmop: (() => { const r = rows.find((x) => x.kind === 'adventure' && x.id === 'LMoP'); return r ? { name: r.name, level: r.shelf.level, storyline: r.shelf.storyline } : null })(),
    data: o.data.map((d) => [d.setId, d.installed]),
    dataFull: o.data.map((d) => ({ setId: d.setId, status: d.status, recordStatus: d.recordStatus, bytes: d.downloadBytes })),
    files: (await lib.files.toArray()).map((f) => [f.source, f.path, f.size]),
    sets: await lib.sets.count(),
  }
}, codeSet)

const profile = join(work, `profile-book-shelf-${ENGINE}`)
await rm(profile, { recursive: true, force: true })
try {
  // 1) 空库联网
  let s = await boot(profile, { online: true })
  for (const cs of ['cn', 'en']) {
    const r = await wizard(s.page, cs)
    report.timings[`${cs}-first`] = r.ms
    report[cs] = r
    check(`${cs}：没有错误，也不挡下一步（核心 SRD 资料包都在）`, r.shelfError === null && r.blockingError === null && r.catalogUnavailable === false, { e: r.shelfError, b: r.blockingError })
    check(`${cs}：有书有冒险（数量来自作者书目，不写死）`, r.books > 0 && r.adventures > 0, { books: r.books, adventures: r.adventures })
    check(`${cs}：每行都带作者书目字段`, r.noShelf === 0, r.noShelf)
    check(`${cs}：官方数据没装、没有一行标已下载`, r.sets === 0 && !r.anyDownloaded && r.data.every(([, i]) => !i), { sets: r.sets, data: r.data })
    check(`${cs}：只取了几个小文件（< 3MB）`, r.files.reduce((n, f) => n + f[2], 0) < 3_000_000 && r.files.length <= 12, r.files)
    check(`${cs}：玩家手册在核心组；失落矿坑有等级和故事线`, r.phb?.group === 'core' && r.lmop?.level && r.lmop.storyline, { phb: r.phb, lmop: r.lmop })
  }
  // BE-8：没装时状态是 none，下载大小来自书目步骤顺带缓存的文件清单
  const cnData = report.cn.dataFull.find((d) => d.setId === 'cn-official')
  check('BE-8 没装：状态 none，下载大小有数（几十 MB 量级）', cnData.status === 'none' && cnData.bytes > 10_000_000 && cnData.bytes < 500_000_000, cnData)
  // 模拟“刷新页面后装了一半”：库里记着 downloading、没有任务在跑
  const half = await s.page.evaluate(async () => {
    const host = document.querySelector('#trpg-assistant-root')
    const app = [...(host.shadowRoot.children)].map((c) => c.__vue_app__).find(Boolean)
    const backend = app.config.globalProperties.$pinia._s.get('app').svc().backend
    await backend.library.db.sets.put({ id: 'cn-official', commit: 'x', status: 'downloading', plan: { files: 0, bytes: 0 }, updatedAt: Date.now() })
    const mid = (await backend.starter.dataStatus()).find((d) => d.setId === 'cn-official')
    await backend.library.db.sets.delete('cn-official')
    const after = (await backend.starter.dataStatus()).find((d) => d.setId === 'cn-official')
    return { mid: { status: mid.status, installed: mid.installed, recordStatus: mid.recordStatus }, after: after.status }
  })
  check('BE-8 装了一半（库里记着 downloading、没有任务）：状态 incomplete；清掉记录后回到 none', half.mid.status === 'incomplete' && !half.mid.installed && half.after === 'none', half)
  const order = report.cn.groups.map((g) => g[0])
  check('分组顺序是作者分组表顺序（核心在前）', order[0] === 'core' && order.indexOf('supplement') < order.indexOf('homebrew') || !order.includes('homebrew'), order)
  // 2) 同一页再取：走缓存
  const again = await wizard(s.page, 'cn')
  report.timings['cn-cached'] = again.ms
  check('第二次走缓存，不再联网', again.ms < report.timings['cn-first'] && again.books === report.cn.books, { first: report.timings['cn-first'], again: again.ms })
  // B2 下载大小预估：同一份计划（作者预载规则）；先只看缓存，再联网补英文清单
  const est = await s.page.evaluate(async () => {
    const host = document.querySelector('#trpg-assistant-root')
    const app = [...(host.shadowRoot.children)].map((c) => c.__vue_app__).find(Boolean)
    const backend = app.config.globalProperties.$pinia._s.get('app').svc().backend
    const pick = [{ set: 'cn-official', id: 'LMoP' }]
    const dataStatus = (await backend.starter.dataStatus()).find((d) => d.setId === 'cn-official')
    const t = performance.now()
    const cachedOnly = await backend.starter.estimateDownload({ codeSet: 'cn', adventures: pick }, { network: false })
    const cachedMs = Math.round(performance.now() - t)
    const t2 = performance.now()
    const full = await backend.starter.estimateDownload({ codeSet: 'cn', adventures: pick })
    const fullMs = Math.round(performance.now() - t2)
    const none = await backend.starter.estimateDownload({ codeSet: 'cn' })
    return { cn: dataStatus.downloadBytes, cachedOnly, full, none, cachedMs, fullMs }
  })
  report.estimate = { cn: est.cn, cachedMs: est.cachedMs, fullMs: est.fullMs, full: { data: est.full.data.bytes, adv: est.full.adventures.bytes, total: est.full.totalBytes } }
  check('B2 估算：中文资料字节数 = 已有的 dataStatus.downloadBytes（同一份计划）', est.full.data.sets[0].bytes === est.cn && est.cn > 10_000_000, { cn: est.cn, set: est.full.data.sets[0] })
  check('B2 估算：中英书目都列过（清单已缓存）时，只看缓存也能算出，结果和联网时一样', JSON.stringify(est.cachedOnly.data) === JSON.stringify(est.full.data) && est.cachedOnly.computing === false, { cached: est.cachedOnly.data.bytes, full: est.full.data.bytes })
  check('B2 估算：英文资料有数，总数 = 资料 + 冒险；失落矿坑只有几百 KB', est.full.data.sets[1].bytes > 10_000_000 && est.full.computing === false && est.full.adventures.bytes > 50_000 && est.full.adventures.bytes < 3_000_000 && est.full.totalBytes === est.full.data.bytes + est.full.adventures.bytes, { total: est.full.totalBytes, adv: est.full.adventures })
  check('B2 估算：不选冒险时冒险为 0；资料不随书的勾选变化', est.none.adventures.bytes === 0 && est.none.data.bytes === est.full.data.bytes, { none: est.none.adventures, data: est.none.data.bytes })
  await s.ctx.close()
  // 3) 同一个库，断网重开：照样列出
  s = await boot(profile, { online: false })
  const off = await wizard(s.page, 'cn')
  report.timings['cn-offline'] = off.ms
  check('断网重开：同一个库仍能列出，没有联网请求', off.shelfError === null && off.books === report.cn.books && s.external.length === 0, { err: off.shelfError, ext: s.external.slice(0, 3) })
  check('书目文件已在本地后，启动时没有“文件不存在”报错', !s.pageErrors.some((m) => m.includes('文件不存在')), s.pageErrors)
  await s.ctx.close()
  // 4) 全新空库 + 断网：明确原因，不卡住
  const fresh = join(work, `profile-book-shelf-fresh-${ENGINE}`)
  await rm(fresh, { recursive: true, force: true })
  s = await boot(fresh, { online: false })
  const none = await wizard(s.page, 'cn')
  report.timings['fresh-offline'] = none.ms
  check('空库断网：返回原因而不是卡住或抛出；核心资料包随插件自带，所以仍不挡下一步', typeof none.shelfError === 'string' && none.shelfError.includes('官方书目') && none.blockingError === null && none.groups.length === 0 && none.ms < 60000, { err: none.shelfError, block: none.blockingError, ms: none.ms })
  await s.ctx.close()
  // B3：冒险目录取不到 → 只记冒险的错误，书目照常；书目取不到 → 记书目的错误（向导据此挡[下一步]），冒险照常
  for (const [name, blockEnd, want] of [['adv', 'data/adventures.json', 'adventures'], ['books', 'data/books.json', 'books']]) {
    const prof = join(work, `profile-book-shelf-${name}-${ENGINE}`)
    await rm(prof, { recursive: true, force: true })
    s = await boot(prof, { online: true, block: [blockEnd] })
    if (want === 'adventures') {
      const blank = await s.page.evaluate(async () => {
        const host = document.querySelector('#trpg-assistant-root')
        const app = [...(host.shadowRoot.children)].map((c) => c.__vue_app__).find(Boolean)
        const e = await app.config.globalProperties.$pinia._s.get('app').svc().backend.starter.estimateDownload({ codeSet: 'cn', adventures: [{ set: 'cn-official', id: 'LMoP' }] }, { network: false })
        return { total: e.totalBytes, computing: e.computing, data: e.data.sets.map((x) => x.bytes), adv: e.adventures.bytes }
      })
      check('B2 估算：全新空库不联网时是"正在计算"（没有数、不发起联网请求）', blank.total === null && blank.computing === true && blank.data.every((x) => x === null) && s.external.length === 0, { blank, ext: s.external.length })
    }
    const r = await wizard(s.page, 'cn')
    if (want === 'adventures') check('B3 冒险目录取不到：书目照常、只有冒险错误、不挡下一步', r.shelfError === null && typeof r.adventureError === 'string' && r.blockingError === null && r.catalogUnavailable === true && r.books > 0 && r.adventures === 0, { shelfError: r.shelfError, adv: r.adventureError, block: r.blockingError, books: r.books, advN: r.adventures })
    else check('B3 书目取不到：有原因、不挡下一步（界面统一提示去库里添加）；冒险目录照常', typeof r.shelfError === 'string' && r.shelfError.includes('官方书目') && r.blockingError === null && r.catalogUnavailable === true && r.adventureError === null && r.adventures > 0, { shelfError: r.shelfError, adv: r.adventureError, block: r.blockingError, advN: r.adventures })
    await s.ctx.close()
  }
  // 唯一的阻断点：随插件自带的核心 SRD 资料包缺了（模拟用户删了一个）→ 向导给原因、开局被后端拒绝；其余照常
  {
    const prof = join(work, `profile-book-shelf-core-${ENGINE}`)
    await rm(prof, { recursive: true, force: true })
    s = await boot(prof, { online: true, gone: ['/vendor/foundry/packs/dnd5e.classes.json'] })
    const r = await wizard(s.page, 'cn')
    const start = await s.page.evaluate(async () => {
      const host = document.querySelector('#trpg-assistant-root')
      const app = [...(host.shadowRoot.children)].map((c) => c.__vue_app__).find(Boolean)
      const backend = app.config.globalProperties.$pinia._s.get('app').svc().backend
      try { await backend.starter.startCampaign({ ownerKey: 'char:核心包测试.png', ownerLabel: '核心包测试', ruleId: 'dnd5e2014', name: '不该建成', codeSet: 'cn' }); return { ok: true } }
      catch (e) { return { ok: false, code: e.code, message: e.message } }
    })
    check('核心 SRD 资料包缺一个：向导给出原因（写明缺哪个）且是唯一的阻断', typeof r.blockingError === 'string' && r.blockingError.includes('dnd5e.classes.json') && r.books > 0, { block: r.blockingError, books: r.books })
    check('核心 SRD 资料包缺一个：开局被后端拒绝（E_CORE_MISSING），不建战役', start.ok === false && start.code === 'E_CORE_MISSING', start)
    await s.ctx.close()
  }
  // P 首次启动后台预取：不打开向导，几秒内书目和两份文件清单就缓存好；之后断网，向导和下载大小估算立刻可用；再次启动缓存都在就不再联网
  {
    const prof = join(work, `profile-book-shelf-prefetch-${ENGINE}`)
    await rm(prof, { recursive: true, force: true })
    s = await boot(prof, { online: true, prefetch: true })
    const state = () => s.page.evaluate(async () => {
      const host = document.querySelector('#trpg-assistant-root')
      const app = [...(host.shadowRoot.children)].map((c) => c.__vue_app__).find(Boolean)
      const backend = app.config.globalProperties.$pinia._s.get('app').svc().backend
      return { dir: !!(await backend.library.directory.peek('cn')), lists: (await backend.starter.dataStatus()).map((d) => d.downloadBytes !== null) }
    })
    const t0 = Date.now()
    let st = await state()
    while (!(st.dir && st.lists.every(Boolean)) && Date.now() - t0 < 40000) { await new Promise((r) => setTimeout(r, 500)); st = await state() }
    report.timings.prefetchReadyMs = Date.now() - t0
    check('P 首次启动后台预取：没打开向导，书目和中英文件清单已缓存好', st.dir && st.lists.length >= 2 && st.lists.every(Boolean), { st, ms: report.timings.prefetchReadyMs })
    await s.page.route((u) => !u.href.startsWith(url), (route) => route.abort()) // 之后断网
    const offline = await wizard(s.page, 'cn')
    const offEst = await s.page.evaluate(async () => {
      const host = document.querySelector('#trpg-assistant-root')
      const app = [...(host.shadowRoot.children)].map((c) => c.__vue_app__).find(Boolean)
      const e = await app.config.globalProperties.$pinia._s.get('app').svc().backend.starter.estimateDownload({ codeSet: 'cn' }, { network: false })
      return { total: e.totalBytes, computing: e.computing }
    })
    check('P 预取后断网：第一次点开始新冒险，书架照常、不等待、没有错误', offline.shelfError === null && offline.books > 0 && offline.ms < 1500, { err: offline.shelfError, books: offline.books, ms: offline.ms })
    check('P 预取后断网：下载大小立刻算出（不是"正在计算"）', offEst.total > 10_000_000 && offEst.computing === false, offEst)
    await s.ctx.close()
    s = await boot(prof, { online: true, prefetch: true })
    await new Promise((r) => setTimeout(r, 7000))
    check('P 再次启动：缓存都在，预取不联网（7 秒内 0 个联网请求）', s.external.length === 0, { ext: s.external.slice(0, 3) })
    await s.ctx.close()
  }
} finally {
  server.close()
}
report.passed = report.checks.every((c) => c.ok)
await writeFile(join(work, `book-shelf-${ENGINE}.json`), JSON.stringify(report, null, 1))
console.log(JSON.stringify({ engine: ENGINE, passed: report.passed, failed: report.checks.filter((c) => !c.ok).map((c) => c.name), timings: report.timings, groups: report.cn?.groups }, null, 1))
process.exit(report.passed ? 0 : 1)
