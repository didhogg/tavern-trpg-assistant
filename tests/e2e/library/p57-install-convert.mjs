// 装书后换算的测量（性能支线，2026-11-14）：走真实插件后端（和界面同一个入口：中英一起下载），改前改后同一个脚本。
// ① 空库装《玩家手册》→ 等下载和换算全部结束；② 记下旧书条目当前的换算结果；
// ③ 补装《怪物图鉴》：每个任务发布 / 结束时间、全部安静下来的时间、页面最长卡多久、这一轮新写了几条换算；
// ④ 旧书条目在新资料版本下的换算结果和 ② 逐条比（方案 B 要的数据）。
// 用法：node tests/e2e/library/p57-install-convert.mjs [标签]（ENGINE=webkit 换 WebKit；结果 work/e2e-lib/p57-<标签>-<引擎>.json）
// 要联网下载作者数据；用自己的空白测试档案（端口 47339），不碰别的测试档案。
import { rm, writeFile } from 'node:fs/promises'
import { startStatic } from './static.mjs'
import { buildAll, differences, engines, knownError, work } from './chain-common.mjs'

if (!process.env.SKIP_BUILD) await buildAll()
const label = process.argv[2] ?? 'run'
const engine = process.env.ENGINE === 'webkit' ? 'webkit' : 'chrome'
const [, type, options] = engines[engine === 'webkit' ? 1 : 0]
const { server, url } = await startStatic({ port: 47339 })
const profile = `${work}/profile-p57-${engine}`
await rm(profile, { recursive: true, force: true })
const ctx = await type.launchPersistentContext(profile, { ...options, viewport: { width: 1280, height: 800 } })
const page = await ctx.newPage()
page.setDefaultTimeout(900_000)
const errors = []
page.on('pageerror', (e) => errors.push(String(e.stack ?? e).slice(0, 300)))
const checks = []
const check = (name, ok, detail = '') => { checks.push({ name, ok: !!ok, detail }); console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? ` — ${detail}` : ''}`) }

try {
  await page.goto(url)
  await page.waitForFunction(() => { const h = document.querySelector('#trpg-assistant-root'); const app = [...(h?.shadowRoot?.children ?? [])].map((c) => c.__vue_app__).find(Boolean); return app?.config.globalProperties.$pinia._s.get('app')?.booted })
  await page.evaluate(async () => {
    const host = document.querySelector('#trpg-assistant-root')
    const app = [...host.shadowRoot.children].map((c) => c.__vue_app__).find(Boolean)
    const lib = app.config.globalProperties.$pinia._s.get('app').svc().backend.library
    const h = await import('/work/e2e-lib/harness.js')
    // 页面响应：每 50 毫秒打一次点，两次之间隔得越久 = 页面被占住越久
    const gap = { max: 0, last: performance.now(), log: [], t0: 0 }
    // 卡住超过 300 毫秒的每一次：记下当时各下载任务在哪个阶段、后台换算在跑什么（找卡顿出在哪一步）
    setInterval(() => {
      const now = performance.now()
      const d = now - gap.last
      gap.max = Math.max(gap.max, d)
      if (d > 300) {
        const q = lib.precomputeQueue.state?.() ?? null
        gap.log.push({ at: Math.round(gap.last - gap.t0), ms: Math.round(d), tasks: lib.tasks.list().filter((t) => t.status === 'running').map((t) => `${t.kind}:${t.set}:${t.progress?.stage}`), convert: q?.running ? `${q.running.codeSet}:${q.running.mode}` : null })
      }
      gap.last = now
    }, 50)
    const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

    /** 发起中英一起下载，跟到全部安静（下载任务、换算任务、后台队列都结束）。 */
    async function phase(books, onInstalled = null) {
      const t0 = performance.now()
      gap.max = 0
      gap.log = []
      gap.t0 = t0
      const before = new Set(lib.tasks.list().map((t) => t.id))
      const started = await lib.downloads.official('cn-official', { books })
      const seen = new Map()
      const at = () => Math.round(performance.now() - t0)
      let quietSince = null
      const queueRuns = []
      let lastSeen = lib.precomputeQueue.last
      let installedHook = null
      for (;;) {
        if (lib.precomputeQueue.last !== lastSeen) { lastSeen = lib.precomputeQueue.last; queueRuns.push({ at: at(), report: lastSeen }) }
        for (const t of lib.tasks.list().filter((x) => !before.has(x.id))) {
          const row = seen.get(t.id) ?? { id: t.id, kind: t.kind, set: t.set, published: null, ended: null, status: null }
          if (t.revision && row.published === null) row.published = at()
          if (t.status !== 'running' && row.ended === null) { row.ended = at(); row.status = t.status; row.convert = t.convert ?? null; row.convertError = t.convertError ?? null }
          seen.set(t.id, row)
        }
        const busy = lib.tasks.list().some((t) => t.status === 'running')
        // 下载任务刚全部结束：旧版本 3 秒后才回收，后台换算也要安静 5 秒才开始——在这个窗口里跑一次给定的检查
        if (!busy && onInstalled && !installedHook) installedHook = await onInstalled()
        const queueBusy = !!(lib.precomputeQueue.running || lib.precomputeQueue.waiting)
        if (!busy && !queueBusy) { quietSince ??= at(); if (at() - quietSince > 6000) break } else quietSince = null
        await sleep(250)
      }
      const reports = [...seen.values()].flatMap((r) => Array.isArray(r.convert) ? r.convert : r.convert ? [r.convert] : [])
      const queueReports = queueRuns.map((r) => ({ at: r.at, ...(r.report ?? {}) }))
      const written = await h.libraryDb.derived.where('key').startsWith('kc:').filter((r) => r.savedAt >= Date.now() - (performance.now() - t0)).count()
      return {
        started, installedHook, settledMs: quietSince, maxGapMs: Math.round(gap.max), gaps: gap.log, tasks: [...seen.values()].map(({ convert, ...r }) => r),
        convertReports: reports.map((x) => ({ codeSet: x.codeSet, mode: x.mode, total: x.total, converted: x.converted, cached: x.cached, failed: x.failed?.length ?? 0, ms: x.ms, complete: x.complete })),
        queueRuns: queueReports.map((x) => ({ at: x.at, codeSet: x?.codeSet, mode: x?.mode, total: x?.total, converted: x?.converted, cached: x?.cached, failed: x?.failed?.length ?? 0, ms: x?.ms, complete: x?.complete, cancelled: x?.cancelled, error: x?.error })),
        cacheRowsWritten: written,
      }
    }

    /** 旧书条目当前的换算结果：条目内容摘要 → 结果（钥匙按当前资料版本和结算内核指纹算，和正式路径同一个函数）。 */
    async function snapshot(codeSet) {
      const pre = lib.precompute
      const view = await lib.revisions.published()
      const fingerprint = (await pre.input(codeSet)).cacheKey ?? ''
      const usable = await pre.importableProps(async () => { throw new Error('测量不开结算内核') }, codeSet, view, fingerprint)
      const rows = await pre.candidates(usable, codeSet, view, [], undefined, undefined, 'full')
      const version = await lib.dataVersion()
      const cache = new h.KernelCache(h.libraryDb)
      const out = {}
      for (const row of rows) {
        const key = await h.kernelImportKey({ base: fingerprint, dataVersion: version, kind: row.prop === 'monster' ? 'monster' : 'build', prop: row.prop, entry: row.entry })
        out[JSON.stringify([row.prop, row.entry])] = { prop: row.prop, name: row.name, data: await cache.get(key) }
      }
      return out
    }

    /** 第 5 步：装完第一本后打开一个战役小窗（固定在当时的资料版本），留着等补装后用。 */
    async function openCampaign() {
      const library = h.defaultCampaignLibrary('dnd5e2014', 'cn')
      const view = await h.revisions.published()
      const pick = (await h.scoped.query(library, 'monster', { view })).find((r) => typeof r.item?.name === 'string')
      const rt = new h.KernelRuntime({ revisions: h.revisions, pluginRoot: new URL('/', location.href), files: h.files, scoped: h.scoped, container: () => document.body,
        cache: { db: h.libraryDb, dataVersion: h.dataVersion }, campaignOf: async () => ({ rule: 'dnd5e2014', library, title: 'p57' }) })
      await rt.session('p57-owner')
      window.__camp = { rt, pick, view, library }
      return { picked: pick ? `${pick.ref.prop}:${pick.item.name}` : null }
    }

    /** 第 5 步：补装完，用还开着的旧小窗加那只怪；结果要记在小窗自己那一版名下，新版那一格不能被占。 */
    async function staleUse() {
      const { rt, pick, view, library } = window.__camp
      if (!pick) return { skipped: '库里没有怪物' }
      const o = await rt.get('p57-owner')
      const entry = (await h.kernelEntryOf(h.scoped, library.codeSet, pick.ref, pick.item, pick.version.altId, view)).entry
      const keyAt = async (v) => h.kernelImportKey({ base: o.cacheBase, dataVersion: v, kind: 'monster', prop: 'monster', entry })
      const oldKey = await keyAt(await h.dataVersion(view))
      const newKey = await keyAt(await h.dataVersion())
      const cache = new h.KernelCache(h.libraryDb)
      await h.libraryDb.derived.bulkDelete([`kc:${newKey}`, `kc-failed:${newKey}`, `kc:${oldKey}`, `kc-failed:${oldKey}`])
      const made = await rt.createActors('p57-owner', [pick.ref])
      const out = { status: made.status, sameKey: oldKey === newKey, oldRow: await cache.state(oldKey), newRow: await cache.state(newKey) }
      await rt.close('p57-owner')
      return out
    }

    window.__p57 = { phase, snapshot, lib, openCampaign, staleUse }
  })

  const p1 = await page.evaluate(() => window.__p57.phase(['PHB']))
  console.log('① 装《玩家手册》', JSON.stringify({ settledMs: p1.settledMs, maxGapMs: p1.maxGapMs, tasks: p1.tasks }))
  const old = await page.evaluate(() => window.__p57.snapshot('cn'))
  const camp = await page.evaluate(() => window.__p57.openCampaign())
  const p2 = await page.evaluate(() => window.__p57.phase(['MM'], window.__p57.staleUse))
  console.log('③ 补装《怪物图鉴》', JSON.stringify({ settledMs: p2.settledMs, maxGapMs: p2.maxGapMs, tasks: p2.tasks }))
  const now = await page.evaluate(() => window.__p57.snapshot('cn'))
  const stale = p2.installedHook ?? {}
  console.log('⑤ 战役开着时补装，再用旧小窗加怪', JSON.stringify({ ...camp, ...stale }))

  // ④ 旧书条目：新版本下的结果和补装前逐条比
  const compare = { same: 0, changed: 0, missingBefore: 0, missingAfter: 0, samples: [] }
  for (const [k, a] of Object.entries(old)) {
    const b = now[k]
    if (!b) continue
    if (a.data === null) { compare.missingBefore++; continue }
    if (b.data === null) { compare.missingAfter++; continue }
    const d = differences(a.data, b.data)
    if (!d.length) compare.same++
    else { compare.changed++; if (compare.samples.length < 20) compare.samples.push({ prop: a.prop, name: a.name, diffs: d.slice(0, 5) }) }
  }
  const result = { label, engine, p1, p2, compare, stale: { ...camp, ...stale }, errors: errors.filter((e) => !knownError(e)) }
  await writeFile(`${work}/p57-${label}-${engine}.json`, JSON.stringify(result, null, 2))
  check('① 装《玩家手册》结束', p1.tasks.every((t) => t.status === 'done' || t.status === 'partial'), JSON.stringify(p1.tasks.map((t) => [t.kind, t.set, t.status])))
  check('③ 补装《怪物图鉴》结束', p2.tasks.every((t) => t.status === 'done' || t.status === 'partial'), JSON.stringify(p2.tasks.map((t) => [t.kind, t.set, t.status])))
  console.log('④ 旧书条目逐条比', JSON.stringify({ same: compare.same, changed: compare.changed, missingBefore: compare.missingBefore, missingAfter: compare.missingAfter }))
  check('⑤ 旧小窗换的结果记在它自己那一版名下，新版那一格没被占', stale.status === 'complete' && !stale.sameKey && stale.oldRow === 'done' && stale.newRow === 'missing', JSON.stringify(stale))
  check('页面没有未处理的错误', result.errors.length === 0, result.errors.slice(0, 2).join(' | '))
} finally {
  await ctx.close()
  server.close()
}
const bad = checks.filter((c) => !c.ok).length
console.log(bad ? `FAIL ${bad}` : 'ALL PASS')
process.exit(bad ? 1 : 0)
