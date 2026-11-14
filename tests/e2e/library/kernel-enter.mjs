// P3 性能改进 S5：进入战役时开结算内核的后端行为。
// 有绑定 → 自动开好；切换归属 → 旧小窗关、新小窗开；未绑定 / 无战役 / 只看资料或搜索 → 不开。
// 开好后第一次结算计时；所有判断都数真正的结算小窗 iframe，不数资料作者小窗。
import { join } from 'node:path'
import { writeFile } from 'node:fs/promises'
import { startStatic } from './static.mjs'
import { buildAll, engines, work } from './chain-common.mjs'

await buildAll()
const PORT = 47337
const [, type, options] = engines[process.env.ENGINE === 'webkit' ? 1 : 0]
const { server, url } = await startStatic({ port: PORT })
const ctx = await type.launchPersistentContext(join(work, `profile-p3-1-${process.env.ENGINE ?? 'chrome'}`), { ...options, viewport: { width: 1280, height: 800 } })
const page = await ctx.newPage()
page.setDefaultTimeout(900000)
const errors = []
page.on('pageerror', (e) => errors.push(e.stack ?? String(e)))
page.on('console', (m) => { if (m.type() === 'error') errors.push(`console: ${m.text()}`) })

try {
  await page.goto(url)
  const r = await page.evaluate(async () => {
    const h = await import('/work/e2e-lib/harness.js')
    const library = h.defaultCampaignLibrary('dnd5e2014', 'cn')
    const { plan, monster } = await h.pickChainEntries(library)
    const kernelFrames = () => [...document.querySelectorAll('iframe')].filter((f) => (f.getAttribute('src') ?? '').includes('/vendor/foundry/frame.html')).length
    const rt = new h.KernelRuntime({ revisions: h.revisions,
      pluginRoot: new URL('/', location.href), files: h.files, scoped: h.scoped, container: () => document.body,
      campaignOf: async (ownerKey) => ({ rule: 'dnd5e2014', library, title: ownerKey }),
      hasKernel: async (ownerKey) => ownerKey !== 'none',
    })
    const t = async (fn) => { const t0 = performance.now(); const v = await fn(); return { ms: Math.round(performance.now() - t0), v } }
    const enterA = await t(() => rt.enter('A'))
    const afterA = kernelFrames()
    const session = (await rt.session('A')).session
    let firstSettlementMs = null
    let firstSettlementStatus
    try {
      const row = (key) => ({ prop: plan[key].ref.prop, refKey: `${plan[key].ref.set}|${plan[key].ref.prop}|${plan[key].ref.hash}`, entry: plan[key].entry })
      const built = await session.call('buildCharacter', { name: 'S5 英雄', items: ['race', 'background', 'class'].map(row), equipment: ['weapon', 'spell'].map(row) })
      const heroId = built.result.id
      const hero = await h.actorData(session, heroId)
      const weapon = hero.items.find((i) => i.type === 'weapon')
      await session.call('importMonsterActor', monster.entry)
      const atk = await t(() => session.call('attack', heroId, weapon._id, [20, 4, 4, 4, 4, 4, 4, 4]))
      firstSettlementMs = atk.ms
      firstSettlementStatus = atk.v.status
    } catch (e) {
      firstSettlementStatus = e instanceof Error ? e.message : String(e)
    }
    const enterB = await t(() => rt.enter('B'))
    const afterB = kernelFrames()
    const beforeNoBound = kernelFrames()
    await rt.enter('none')
    const afterNoBound = kernelFrames()
    // 只看资料 / 搜索：不碰结算小窗。
    const detail = await h.scoped.detail(library, plan.race.ref)
    const search = await h.scoped.search(library, '火球')
    const afterLook = kernelFrames()
    await rt.closeAllExcept(null)
    return {
      enterAMs: enterA.ms, afterA, enterBMs: enterB.ms, afterB, beforeNoBound, afterNoBound,
      detailOk: !!detail && !('hidden' in detail), searchCount: search.length, afterLook,
      firstSettlementMs, firstSettlementStatus,
    }
  })
  const known = (e) => e.includes('gendata-nav-adventure-book-index.json') || e.includes('requires usable window dimensions') || e.includes('Failed to load resource: the server responded with a status of 404')
  const payload = { engine: process.env.ENGINE ?? 'chrome', port: PORT, ...r, errors, unexplained: errors.filter((e) => !known(e)) }
  await writeFile(`${work}/kernel-enter-${payload.engine}.json`, JSON.stringify(payload, null, 2))
  const ok = r.afterA === 1 && r.afterB === 1 && r.afterNoBound === 0 && r.afterLook === 0 && r.detailOk && r.searchCount > 0 && r.firstSettlementStatus === 'complete' && !payload.unexplained.length
  console.log(JSON.stringify({ ok, ...r, unexplained: payload.unexplained.length }, null, 1))
  process.exitCode = ok ? 0 : 1
} finally { await ctx.close(); server.close() }
