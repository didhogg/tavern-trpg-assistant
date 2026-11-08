// P3 性能改进 S0：按用户操作测速（Chrome / WebKit）。
// 刷新后第一次看资料 / 搜索要真的重开页面（同一 profile、同一端口，库里已装好的数据仍在）。
// 只测不改；结果写 work/e2e-lib/perf-user-{engine}.json。
import { join } from 'node:path'
import { writeFile } from 'node:fs/promises'
import { startStatic } from './static.mjs'
import { buildAll, engines, kernelInputFor, work } from './chain-common.mjs'

await buildAll()
const input = await kernelInputFor('perf-user', 'perf-user')
const PORT = 47337
const [, type, options] = engines[process.env.ENGINE === 'webkit' ? 1 : 0]
const { server, url } = await startStatic({ port: PORT })
const profile = join(work, `profile-p3-1-${process.env.ENGINE ?? 'chrome'}`)
const ctx = await type.launchPersistentContext(profile, { ...options, viewport: { width: 1280, height: 800 } })
const errors = []
const rows = []
const startedAt = new Date().toISOString()

function pageWatch(page) {
  page.setDefaultTimeout(600_000)
  page.on('pageerror', (e) => errors.push(e.stack ?? String(e)))
  page.on('console', (m) => {
    if (m.type() === 'error') errors.push(`console: ${m.text()}`)
    if (m.text().startsWith('[progress]')) console.log(m.text())
  })
}

const push = (name, ms, status = 'ok', extra = {}) => {
  const r = { name, ms: Math.round(ms), status, ...extra }
  rows.push(r)
  console.log(`${String(r.ms).padStart(7)}ms  ${name}  [${status}]${extra.note ? `  ${extra.note}` : ''}`)
  return r
}

async function freshPage() {
  const page = await ctx.newPage()
  pageWatch(page)
  await page.goto(url)
  return page
}

try {
  // ---- 第一页：装库 / 准备真实条目 / 结算内核操作 / 存档 / 读档规模 ----
  const first = await freshPage()
  const prepared = await first.evaluate(async (input) => {
    const h = await import('/work/e2e-lib/harness.js')
    for (const id of ['cn-official', 'en-official']) {
      const audit = await h.offlineAudit(id)
      if (audit.set?.status !== 'installed' || audit.ok !== audit.planFiles) await h.install(id)
    }
    h.service.reset()
    for (const u of ['src:phb', 'src:mm', 'src:dmg']) await h.scoped.setAssignment(u, null)
    const library = h.defaultCampaignLibrary('dnd5e2014', 'cn')
    const { plan: heroPlan, monster } = await h.pickChainEntries(library)
    const take = async (prop, book, filter, skip = 0) => {
      const p = await h.service.parsed('cn-official', prop)
      let n = 0
      for (let i = 0; i < p.items.length; i++) {
        const item = p.items[i]
        if (p.sources[i] !== book || !filter(item)) continue
        const ref = { set: 'cn-official', prop, hash: p.hashes[i] }
        const d = await h.scoped.detail(library, ref)
        if (!d || 'hidden' in d || d.english?.status !== 'found') continue
        if (n++ < skip) continue
        return { prop, label: item.name, ref, entry: d.english.item }
      }
      return null
    }
    const magic0 = await take('item', 'DMG', (it) => !!it.rarity && it.rarity !== 'none')
    const magic1 = await take('item', 'DMG', (it) => !!it.rarity && it.rarity !== 'none', 1)
    const monster1 = await take('monster', 'MM', () => true, 1)
    const t0 = performance.now()
    const { session, status } = await h.startKernelSession(input)
    const bootMs = Math.round(performance.now() - t0)
    globalThis.__h = h
    globalThis.__library = library
    globalThis.__k = session
    return {
      bootMs,
      boot: { system: status.system, rules: status.rules, api: status.plutoniumApi },
      heroPlan: { race: heroPlan.race, background: heroPlan.background, class: heroPlan.class, weapon: heroPlan.weapon, spell: heroPlan.spell },
      monster: { ref: monster.ref, label: monster.label, entry: monster.entry },
      monster1: monster1 && { ref: monster1.ref, label: monster1.label, entry: monster1.entry },
      magic0: magic0 && { ref: magic0.ref, label: magic0.label, entry: magic0.entry },
      magic1: magic1 && { ref: magic1.ref, label: magic1.label, entry: magic1.entry },
    }
  }, input)
  push('结算内核开机', prepared.bootMs, prepared.boot.api === 'object' ? 'ok' : 'error')

  const ops = await first.evaluate(async (plan) => {
    const h = globalThis.__h
    const k = globalThis.__k
    const out = []
    const measure = async (name, fn) => {
      const t0 = performance.now()
      const status = await fn()
      const ms = Math.round(performance.now() - t0)
      out.push({ name, ms, status })
      console.log(`${String(ms).padStart(7)}ms  ${name}  [${status}]`)
      return status
    }
    const call = (fn, ...args) => k.call(fn, ...args).then((r) => ({ status: r.status, result: r.result, error: r.error }))
    const imp = {}
    await measure('导入 建卡三件（种族/背景/职业）', async () => {
      imp.race = (await call('importForBuild', 'race', plan.heroPlan.race.entry)).result
      imp.background = (await call('importForBuild', 'background', plan.heroPlan.background.entry)).result
      imp.class = (await call('importForBuild', 'class', plan.heroPlan.class.entry)).result
      return 'complete'
    })
    await measure('导入 武器（第一件）', async () => (imp.weapon0 = (await call('importForBuild', 'item', plan.heroPlan.weapon.entry)).result) && 'complete')
    await measure('导入 武器（第二件）', async () => (imp.weapon1 = (await call('importForBuild', 'item', plan.heroPlan.weapon.entry)).result) && 'complete')
    await measure('导入 法术（第一件）', async () => (imp.spell0 = (await call('importForBuild', 'spell', plan.heroPlan.spell.entry)).result) && 'complete')
    await measure('导入 法术（第二件）', async () => (imp.spell1 = (await call('importForBuild', 'spell', plan.heroPlan.spell.entry)).result) && 'complete')
    if (plan.magic0) await measure('导入 魔法物品（第一件）', async () => (imp.magic0 = (await call('importForBuild', 'item', plan.magic0.entry)).result) && 'complete')
    if (plan.magic1) await measure('导入 魔法物品（第二件）', async () => (imp.magic1 = (await call('importForBuild', 'item', plan.magic1.entry)).result) && 'complete')
    const monster0 = await measure('导入 怪物（第一只）', async () => {
      imp.monster0 = (await call('importMonsterActor', plan.monster.entry)).result
      return imp.monster0 ? 'complete' : 'error'
    })
    if (!monster0) throw new Error('first monster import failed')
    if (plan.monster1) await measure('导入 怪物（第二只）', async () => (imp.monster1 = (await call('importMonsterActor', plan.monster1.entry)).result) && 'complete')
    await measure('建英雄', async () => {
      const rows = [
        { prop: 'race', refKey: 'race', entry: plan.heroPlan.race.entry, data: imp.race },
        { prop: 'background', refKey: 'background', entry: plan.heroPlan.background.entry, data: imp.background },
        { prop: 'class', refKey: 'class', entry: plan.heroPlan.class.entry, data: imp.class },
      ]
      const eq = [
        { prop: 'item', refKey: 'weapon', entry: plan.heroPlan.weapon.entry, data: imp.weapon0 },
        { prop: 'spell', refKey: 'spell', entry: plan.heroPlan.spell.entry, data: imp.spell0 },
        ...(imp.magic0 ? [{ prop: 'item', refKey: 'magic', entry: plan.magic0.entry, data: imp.magic0 }] : []),
      ]
      const r = await call('buildCharacter', { name: '测速英雄', items: rows, equipment: eq })
      globalThis.__heroId = r.result?.id
      globalThis.__heroSeed = r.result?.seed
      return r.status
    })
    const heroId = globalThis.__heroId
    const hero = await h.actorData(k, heroId)
    const weapon = hero.items.find((i) => i.type === 'weapon')
    const spell = hero.items.find((i) => i.type === 'spell')
    const base = hero
    const monsterId = imp.monster0.id
    await measure('攻击', async () => (await call('attack', heroId, weapon._id, [20, 4, 4, 4, 4, 4, 4, 4])).status)
    await measure('伤害落到怪物', async () => (await call('damage', monsterId, [{ value: 5, type: 'slashing' }], [], {})).status)
    if (spell) {
      const activityId = Object.keys(spell.system.activities ?? {})[0]
      await measure('施法', async () => (await call('cast', heroId, spell._id, activityId, [10, 4, 4, 4, 4, 4, 4, 4, 4, 4], { create: { measuredTemplate: false } })).status)
    }
    await measure('短休', async () => (await call('rest', heroId, 'short', [4, 4, 4, 4])).status)
    await measure('长休', async () => (await call('rest', heroId, 'long', [])).status)
    await measure('开战（先攻）', async () => (await call('combatStart', [heroId, monsterId], [10, 10])).status)
    await measure('下一回合', async () => (await call('combatNext', [])).status)
    const current = await h.actorData(k, heroId)
    return { out, heroId, monsterId, base, current }
  }, prepared)
  for (const r of ops.out) push(r.name, r.ms, r.status)

  const saved = await first.evaluate(async ([heroId, base, current]) => {
    const h = globalThis.__h
    const k = globalThis.__k
    const library = globalThis.__library
    const captured = await k.call('captureChoices', heroId)
    const compact = await h.compactActor({ lib: h.scoped, library, actor: { id: heroId, name: current.name }, seed: globalThis.__heroSeed, current, base, choices: captured.result ?? {} })
    await h.userDb.workspaces.clear()
    await h.userDb.saves.clear()
    const owner = { ownerKey: 'char:perf-user.png', ownerLabel: 'perf-user' }
    await h.campaign.startNewCampaign({ ...owner, ruleId: 'dnd5e2014', name: 'perf-user' })
    await h.kernelSave.bind(owner.ownerKey, {
      rule: 'dnd5e2014', kernelVersion: 1, library,
      dataVersion: { official: 'perf', brews: {} }, overrides: [],
      actors: [compact], revision: 0, undo: [],
    })
    const t0 = performance.now()
    await h.kernelSave.save(owner.ownerKey)
    return { saveMs: Math.round(performance.now() - t0) }
  }, [ops.heroId, ops.base, ops.current])
  push('存档', saved.saveMs)

  // 读档“建人物”的目标基线：把算好的完整人物一次批量建（S4 缓存命中后走这条）。
  const foundryFrames = first.frames().filter((f) => f.url().includes('/vendor/foundry/frame.html'))
  const frame = foundryFrames.at(-1)
  const direct = await frame.evaluate(async ([data, n]) => {
    const make = (count) => Array.from({ length: count }, (_, i) => {
      const d = structuredClone(data)
      delete d._id
      d.name = `Load ${i}`
      return d
    })
    const out = {}
    for (const count of [5, n]) {
      const batch = make(count)
      const t = performance.now()
      await globalThis.CONFIG.Actor.documentClass.createDocuments(batch)
      out[count] = Math.round(performance.now() - t)
    }
    return out
  }, [ops.current, 50])
  for (const n of [5, 50]) push(`读档建人物 ${n} 人（直接批量建，缓存目标基线）`, direct[n])
  await first.close()

  // ---- 干净小窗：当前“按引用重建 1 人”基线（两个全新小窗，保证编号顺序和建卡时一致） ----
  const cleanPage = await freshPage()
  const rebuild = await cleanPage.evaluate(async ([input, plan]) => {
    const h = await import('/work/e2e-lib/harness.js')
    h.service.reset()
    const library = h.defaultCampaignLibrary('dnd5e2014', 'cn')
    const call = (k, fn, ...args) => k.call(fn, ...args).then((r) => ({ status: r.status, result: r.result, error: r.error }))
    const k1 = (await h.startKernelSession(input)).session
    const imp = {}
    for (const key of ['race', 'background', 'class', 'weapon', 'spell']) {
      imp[key] = (await call(k1, 'importForBuild', plan.heroPlan[key].ref.prop, plan.heroPlan[key].entry)).result
    }
    const built = await call(k1, 'buildCharacter', { name: '重建基线英雄', items: [
      { prop: 'race', refKey: 'race', entry: plan.heroPlan.race.entry, data: imp.race },
      { prop: 'background', refKey: 'background', entry: plan.heroPlan.background.entry, data: imp.background },
      { prop: 'class', refKey: 'class', entry: plan.heroPlan.class.entry, data: imp.class },
    ], equipment: [
      { prop: 'item', refKey: 'weapon', entry: plan.heroPlan.weapon.entry, data: imp.weapon },
      { prop: 'spell', refKey: 'spell', entry: plan.heroPlan.spell.entry, data: imp.spell },
    ] })
    const id = built.result?.id
    const current = await h.actorData(k1, id)
    const captured = await k1.call('captureChoices', id)
    const compact = await h.compactActor({ lib: h.scoped, library, actor: { id, name: current.name }, seed: built.result?.seed, current, base: current, choices: captured.result ?? {} })
    k1.close()
    const k2 = (await h.startKernelSession(input)).session
    const t = performance.now()
    const r = await h.rebuildActor({ lib: h.scoped, session: k2, library, actor: compact })
    return { ms: Math.round(performance.now() - t), status: r.status, error: r.error, missing: r.missing }
  }, [input, prepared])
  push('按引用重建 1 人（当前读档路径）', rebuild.ms, rebuild.status)
  await cleanPage.close()

  // ---- 第二页：刷新后第一次看资料 / 再看一条（真的重开页面，同一 profile / 端口） ----
  const detailPage = await freshPage()
  const detail = await detailPage.evaluate(async (plan) => {
    const h = await import('/work/e2e-lib/harness.js')
    const library = h.defaultCampaignLibrary('dnd5e2014', 'cn')
    const run = async (ref) => {
      const t = performance.now()
      const d = await h.scoped.detail(library, ref)
      return { ms: Math.round(performance.now() - t), ok: !!d && !('hidden' in d) && !!d.english }
    }
    return { first: await run(plan.race.ref), second: await run(plan.class.ref) }
  }, prepared.heroPlan)
  push('刷新后第一次看资料', detail.first.ms, detail.first.ok ? 'ok' : 'missing')
  push('再看一条资料', detail.second.ms, detail.second.ok ? 'ok' : 'missing')
  await detailPage.close()

  // ---- 第三页：刷新后第一次搜索 ----
  const searchPage = await freshPage()
  const search = await searchPage.evaluate(async () => {
    const h = await import('/work/e2e-lib/harness.js')
    const library = h.defaultCampaignLibrary('dnd5e2014', 'cn')
    const t = performance.now()
    const hits = await h.scoped.search(library, '火球')
    return { ms: Math.round(performance.now() - t), count: hits.length }
  })
  push('刷新后第一次搜索', search.ms, 'ok', { note: `${search.count} 条` })
  await searchPage.close()

  const known = (e) => e.includes('gendata-nav-adventure-book-index.json')
    || e.includes('/vendor/foundry/api/plutonium')
    || e.includes('status of 404')
    || e.includes('requires usable window dimensions')
    || e.includes('KERNEL_NEEDS_INPUT')
    || e.includes('Failed to place measured template')
  const payload = {
    engine: process.env.ENGINE ?? 'chrome', startedAt, port: PORT, rows,
    errors, unexplained: errors.filter((e) => !known(e)),
    notes: ['S0 基线只测不改；读档 5/50 是把同一个真实人物的完整数据一次批量建，作为 S4 缓存命中后的目标基线；按引用重建 1 人是当前读档路径'],
  }
  await writeFile(`${work}/perf-user-${payload.engine}.json`, JSON.stringify(payload, null, 2))
  console.log(`\n结果：${work}/perf-user-${payload.engine}.json  unexplained=${payload.unexplained.length}`)
  process.exitCode = payload.unexplained.length ? 1 : 0
} finally {
  await ctx.close()
  server.close()
}
