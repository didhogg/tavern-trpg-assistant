// 真实资料 → 建卡选择 → 同一份规则复核提交 → 冷读档。
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { E2E_PORT, engines, freshFromBase } from './chain-common.mjs'
import { startStatic } from './static.mjs'

const engine = process.env.ENGINE ?? 'chrome'
const [, browser, options] = engines.find(([name]) => name === engine)
const dist = process.env.P6_TEST_DIST
const timeout = setTimeout(() => process.exit(124), 300_000)
let context, server
try {
  const host = await startStatic({ port: E2E_PORT })
  server = host.server
  context = await browser.launchPersistentContext(freshFromBase(engine, 'p6-extra-options'), options)
  if (dist) await context.route(url => url.href.startsWith(host.url) && (/^\/dist\//.test(url.pathname) || url.pathname.endsWith('/harness.js')), async (route) => {
    const path = new URL(route.request().url()).pathname
    const filename = path.startsWith('/dist/') ? path.slice('/dist/'.length) : 'harness.js'
    await route.fulfill({ body: await readFile(join(dist, filename)), contentType: 'application/javascript' })
  })
  const page = await context.newPage()
  await page.goto(host.url)
  const result = await page.evaluate(async () => {
    const h = await import('/work/e2e-lib/harness.js')
    const owner = 'char:p6-extra-options.png'
    const library = h.defaultCampaignLibrary('dnd5e2014', 'cn')
    await h.campaign.startNewCampaign({ ownerKey: owner, ownerLabel: 'Extra options', ruleId: library.rule, name: 'Extra options' })
    await h.kernelSave.bind(owner, { rule: library.rule, kernelVersion: 1, library, dataVersion: await h.dataVersion(), overrides: [], actors: [], revision: 0, undo: [] })
    const rt = new h.KernelRuntime({ revisions: h.revisions, pluginRoot: new URL('/', location.href), files: h.files, scoped: h.scoped, service: h.service, container: () => document.body, campaignOf: async () => ({ rule: library.rule, library, title: 'Extra options' }) })
    const saves = new h.kernelSave.constructor({ ...h.kernelSave.deps, compactActors: (k, ids) => rt.compact(k, ids), mapRef: k => rt.mapRef(k) })
    const people = new h.KernelPeople({ runtime: rt, saves })
    const find = async (prop, name, source) => {
      const rows = await h.scoped.query(library, prop, { source })
      const hit = rows.find(row => (row.item.ENG_name ?? row.item.name) === name)
      if (!hit) throw new Error(`Missing probe entry ${prop} ${name}|${source}`)
      return hit.ref
    }
    const opts = (...items) => people.buildOptions(owner, { items, blank: true })
    const human = await find('race', 'Human', 'XPHB')
    const fighter = await find('class', 'Fighter', 'XPHB')
    const paladin = await find('class', 'Paladin', 'PHB')
    const cleric = await find('class', 'Cleric', 'PHB')
    const preview = await opts(human, fighter)
    const [origin, fighting] = (preview.items ?? []).map(item => item.extras.find(group => group.kind === 'feat'))
    const delayed = (await opts(paladin)).items?.[0]
    const subclass = (await opts(cleric)).items?.[0]?.extras.find(group => group.kind === 'subclass')
    const out = { status: preview.status, origin: !!origin, fighting: !!fighting, delayed: !delayed?.extras.length && !delayed?.unsupported.some(s => s.includes('可选特性进度写法')), subclass: !!subclass?.candidates.length }
    if (!origin?.candidates.length || !fighting?.candidates.length) return out
    const categories = async (group) => Promise.all(group.candidates.map(async ({ ref }) => (await h.scoped.storedItem(ref))?.item?.category))
    const originPick = origin.candidates.find(c => !c.requirement)?.ref ?? origin.candidates[0].ref
    const stylePick = fighting.candidates[0].ref
    const originOther = origin.candidates.find(c => c.ref.hash !== originPick.hash)?.ref
    const build = (...chosen) => people.build(owner, { name: 'Extra options', items: [human, fighter, ...chosen], blank: true, requireExtras: true }, { category: 'party' })
    out.originCategories = [...new Set(await categories(origin))]
    out.fightingCategories = [...new Set(await categories(fighting))]
    out.fightingTitle = fighting.title
    out.originTitle = origin.title
    out.conditionRetained = fighting.candidates.some(c => c.requirement)
    const variant = (await h.scoped.query(library, 'race', { source: 'PHB' })).find(row => row.item.feats?.some(choice => choice.any))
    const abilityScore = await find('feat', 'Ability Score Improvement', 'XPHB')
    out.levelGated = !(await opts(variant.ref)).items?.[0]?.extras[0]?.candidates.some(c => c.ref.hash === abilityScore.hash)
    out.missing = (await build(originPick)).built.status
    out.wrongGroup = (await build(originPick, originOther)).built.status
    const made = await build(originPick, stylePick)
    out.built = made.built.status
    if (made.built.id) {
      const state = await saves.read(owner)
      await rt.close(owner)
      const restored = await rt.rebuild(owner, state.actors.find(a => a.id === made.built.id))
      out.restored = restored.status
      out.restoredFeats = (restored.data?.items ?? []).filter(item => item.flags?.plutonium?.propDroppable === 'feat').length
    }
    library.exclude.push(`ent:${originPick.set}:${originPick.prop}:${originPick.hash}`)
    const after = (await opts(human, fighter)).items?.[0]?.extras[0]?.candidates ?? []
    out.closed = !after.some(c => c.ref.hash === originPick.hash)
    out.closedSubmission = (await build(originPick, stylePick)).built.status
    await rt.close(owner)
    return out
  })
  console.log(JSON.stringify(result))
  assert.equal(result.status, 'complete')
  assert.equal(result.origin, true, '2024 人类缺起源专长')
  assert.equal(result.fighting, true, '2024 战士缺战斗风格')
  assert.equal(result.delayed, true, '1 级尚未开放的战斗风格误报')
  assert.equal(result.subclass, true, '1 级子职业消失')
  assert.deepEqual(result.originCategories, ['O'])
  assert.deepEqual(result.fightingCategories, ['FS'])
  assert.match(result.fightingTitle, /战斗风格/)
  assert.match(result.originTitle, /起源/)
  assert.equal(result.conditionRetained, true)
  assert.equal(result.levelGated, true)
  assert.equal(result.missing, 'complete', '少选照样能建，空位留空（驾驶员 11-16 定）')
  assert.equal(result.wrongGroup, 'pending')
  assert.equal(result.built, 'complete')
  assert.equal(result.restored, 'complete')
  assert.equal(result.restoredFeats, 2)
  assert.equal(result.closed, true)
  assert.equal(result.closedSubmission, 'pending')
} finally {
  await context?.close()
  server?.close()
  server?.closeAllConnections()
  clearTimeout(timeout)
}
