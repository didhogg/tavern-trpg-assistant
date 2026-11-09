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

async function boot(profile, { online }) {
  const ctx = await type.launchPersistentContext(profile, { ...options, viewport: { width: 1280, height: 800 } })
  const page = await ctx.newPage()
  page.setDefaultTimeout(120000)
  const external = []
  const pageErrors = []
  page.on('pageerror', (e) => pageErrors.push(String(e.message ?? e).slice(0, 160)))
  page.on('request', (r) => { if (!r.url().startsWith(url)) external.push(r.url()) })
  if (!online) await page.route((u) => !u.href.startsWith(url), (route) => route.abort())
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
    ms, shelfError: o.shelfError, groups: o.shelf.map((g) => [g.group, g.name, g.books.length, g.adventures.length]),
    books: rows.filter((r) => r.kind === 'book').length, adventures: rows.filter((r) => r.kind === 'adventure').length,
    noShelf: rows.filter((r) => !r.shelf).length, anyDownloaded: rows.some((r) => r.downloaded),
    phb: rows.find((r) => r.kind === 'book' && r.source === 'PHB') ? { group: rows.find((r) => r.kind === 'book' && r.source === 'PHB').shelf.group, name: rows.find((r) => r.kind === 'book' && r.source === 'PHB').name, visible: rows.find((r) => r.kind === 'book' && r.source === 'PHB').view.visible } : null,
    lmop: (() => { const r = rows.find((x) => x.kind === 'adventure' && x.id === 'LMoP'); return r ? { name: r.name, level: r.shelf.level, storyline: r.shelf.storyline } : null })(),
    data: o.data.map((d) => [d.setId, d.installed]),
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
    check(`${cs}：没有错误`, r.shelfError === null, r.shelfError)
    check(`${cs}：有书有冒险（数量来自作者书目，不写死）`, r.books > 0 && r.adventures > 0, { books: r.books, adventures: r.adventures })
    check(`${cs}：每行都带作者书目字段`, r.noShelf === 0, r.noShelf)
    check(`${cs}：官方数据没装、没有一行标已下载`, r.sets === 0 && !r.anyDownloaded && r.data.every(([, i]) => !i), { sets: r.sets, data: r.data })
    check(`${cs}：只取了几个小文件（< 3MB）`, r.files.reduce((n, f) => n + f[2], 0) < 3_000_000 && r.files.length <= 12, r.files)
    check(`${cs}：玩家手册在核心组；失落矿坑有等级和故事线`, r.phb?.group === 'core' && r.lmop?.level && r.lmop.storyline, { phb: r.phb, lmop: r.lmop })
  }
  const order = report.cn.groups.map((g) => g[0])
  check('分组顺序是作者分组表顺序（核心在前）', order[0] === 'core' && order.indexOf('supplement') < order.indexOf('homebrew') || !order.includes('homebrew'), order)
  // 2) 同一页再取：走缓存
  const again = await wizard(s.page, 'cn')
  report.timings['cn-cached'] = again.ms
  check('第二次走缓存，不再联网', again.ms < report.timings['cn-first'] && again.books === report.cn.books, { first: report.timings['cn-first'], again: again.ms })
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
  check('空库断网：返回原因而不是卡住或抛出', typeof none.shelfError === 'string' && none.shelfError.includes('官方书目') && none.groups.length === 0 && none.ms < 60000, { err: none.shelfError, ms: none.ms })
  await s.ctx.close()
} finally {
  server.close()
}
report.passed = report.checks.every((c) => c.ok)
await writeFile(join(work, `book-shelf-${ENGINE}.json`), JSON.stringify(report, null, 1))
console.log(JSON.stringify({ engine: ENGINE, passed: report.passed, failed: report.checks.filter((c) => !c.ok).map((c) => c.name), timings: report.timings, groups: report.cn?.groups }, null, 1))
process.exit(report.passed ? 0 : 1)
