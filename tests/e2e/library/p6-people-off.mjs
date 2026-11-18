// P6 人物「取下 / 装回」与操作判定（真实结算小窗；Chrome，ENGINE=webkit 换 WebKit；上限 8 分钟）。
// 第 1 步：未支持检测只看官方实际应用的改动 —— 停用的作者效果不拖垮无关操作；物品里的效果经正式入口停用、保存、冷读回、撤销；
//         真不支持的写法（midi-qol）照旧报出来，但操作照常写入；dnd5e 自己接管的写法（items.hidden）不误报。
// 来自探路（docs/handoff/P6_自动项目取下装回_探路与统一入口预览.md）当时的反例，这里要求正向通过。
import { writeFile } from 'node:fs/promises'
import { startStatic } from './static.mjs'
import { buildAll, E2E_PORT, engines, freshFromBase, work } from './chain-common.mjs'
import { offScenarios } from './p6-people-off-steps.mjs'

const LIMIT = 8 * 60_000
const killer = setTimeout(() => { console.error('超时 8 分钟'); process.exit(2) }, LIMIT)
await buildAll()
const [, type, options] = engines[process.env.ENGINE === 'webkit' ? 1 : 0]
const engine = process.env.ENGINE ?? 'chrome'
const { server, url } = await startStatic({ port: E2E_PORT })
const ctx = await type.launchPersistentContext(freshFromBase(engine, 'p6-people-off'), { ...options, viewport: { width: 1280, height: 800 } })
const page = await ctx.newPage()
page.setDefaultTimeout(LIMIT)
const errors = []
page.on('pageerror', (e) => errors.push(e.stack ?? String(e)))
page.on('console', (m) => { if (m.type() === 'error') errors.push(`console: ${m.text()}`) })
try {
  await page.goto(url)
  await page.evaluate(async () => {
    const h = await import('/work/e2e-lib/harness.js')
    for (const id of ['cn-official', 'en-official']) {
      const audit = await h.offlineAudit(id)
      if (audit.set?.status !== 'installed' || audit.ok !== audit.planFiles) await h.install(id)
    }
    await h.userDb.workspaces.clear(); await h.userDb.saves.clear()
    const library = h.defaultCampaignLibrary('dnd5e2014', 'en')
    const owner = 'char:p6-people-off.png'
    await h.campaign.startNewCampaign({ ownerKey: owner, ownerLabel: 'P6 取下', ruleId: library.rule, name: 'P6 取下' })
    await h.kernelSave.bind(owner, { rule: library.rule, kernelVersion: 1, library, dataVersion: await h.dataVersion(), overrides: [], actors: [], revision: 0, undo: [] })
    // 和 backend.ts 同样的接线；带换算缓存（读档命中缓存的路径也要测）
    globalThis.offEnv = () => {
      const rt = new h.KernelRuntime({ revisions: h.revisions, pluginRoot: new URL('/', location.href), files: h.files, scoped: h.scoped, service: h.service, container: () => document.body,
        cache: { db: h.libraryDb, dataVersion: h.dataVersion }, campaignOf: async () => ({ rule: library.rule, library, title: 'P6 取下' }) })
      const saves = new h.kernelSave.constructor({ ...h.kernelSave.deps, compactActors: (k, ids) => rt.compact(k, ids), mapRef: (k) => rt.mapRef(k) })
      return { h, owner, library, rt, saves, people: new h.KernelPeople({ runtime: rt, saves }) }
    }
    globalThis.offFind = async (prop, name, source = 'PHB') => {
      const rows = await h.scoped.query(library, prop, { source, expand: true, mode: 'browse' })
      const row = rows.find((r) => r.item.name === name && r.item.source === source && !r.item._isCopy)
      if (!row) throw Error(`缺测试条目 ${prop} ${name}`)
      return row.ref
    }
  })
  const r = await offScenarios(page)
  const known = (e) => e.includes('gendata-nav-adventure-book-index.json') || e.includes('requires usable window dimensions') || e.includes('status of 404') || e.includes('api/plutonium')
    || e.includes('KERNEL_NEEDS_INPUT') || /homebrew|unearthed-arcana/.test(e)
  const unexplained = errors.filter((e) => !known(e))
  const ok = Object.values(r.checks).every(Boolean) && unexplained.length === 0
  await writeFile(`${work}/p6-people-off-${engine}.json`, JSON.stringify({ engine, ok, ...r, errors, unexplained }, null, 2))
  console.log(JSON.stringify({ ok, checks: r.checks, unexplained: unexplained.slice(0, 5) }, null, 1))
  process.exitCode = ok ? 0 : 1
} finally { clearTimeout(killer); await ctx.close(); server.close() }
