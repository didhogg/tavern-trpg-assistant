// P6 建卡缺项的后端链路：真实作者条目 → 选项 → 建卡 → 原生进阶存档 → 关小窗后冷读档。
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { startStatic } from './static.mjs'
import { buildAll, E2E_PORT, engines, freshFromBase } from './chain-common.mjs'

const engine = process.env.ENGINE ?? 'chrome'
const [, browser, options] = engines.find(([name]) => name === engine)
const dist = process.env.P6_TEST_DIST
const timeout = setTimeout(() => process.exit(124), 5 * 60_000)
let context
let server
try {
  if (!dist) await buildAll()
  const host = await startStatic({ port: E2E_PORT })
  server = host.server
  context = await browser.launchPersistentContext(freshFromBase(engine, 'p6-build-traits'), options)
  if (dist) await context.route(url => url.href.startsWith(host.url) && (/^\/dist\//.test(url.pathname) || url.pathname.endsWith('/harness.js')), async (route) => {
    const path = new URL(route.request().url()).pathname
    const name = path.startsWith('/dist/') ? path.slice('/dist/'.length) : 'harness.js'
    await route.fulfill({ body: await readFile(join(dist, name)), contentType: 'application/javascript' })
  })
  const page = await context.newPage()
  await page.goto(host.url)
  const results = await page.evaluate(async () => {
    const h = await import('/work/e2e-lib/harness.js')
    const owner = 'char:p6buildtraits.png'
    const library = h.defaultCampaignLibrary('dnd5e2014', 'en')
    await h.campaign.startNewCampaign({ ownerKey: owner, ownerLabel: 'P6 traits', ruleId: 'dnd5e2014', name: 'P6 traits' })
    await h.kernelSave.bind(owner, { rule: 'dnd5e2014', kernelVersion: 1, library, dataVersion: await h.dataVersion(), overrides: [], actors: [], revision: 0, undo: [] })
    const mk = () => {
      const rt = new h.KernelRuntime({ revisions: h.revisions, pluginRoot: new URL('/', location.href), files: h.files, scoped: h.scoped, service: h.service, container: () => document.body,
        campaignOf: async () => ({ rule: 'dnd5e2014', library, title: 'Traits' }) })
      const saves = new h.kernelSave.constructor({ ...h.kernelSave.deps, compactActors: (k, ids) => rt.compact(k, ids), mapRef: (k) => rt.mapRef(k) })
      return { rt, saves, people: new h.KernelPeople({ runtime: rt, saves }) }
    }
    const find = async (prop, name, source) => {
      const rows = await h.scoped.query(library, prop, { source, expand: true, mode: 'browse' })
      const found = rows.find((r) => r.item?.name === name && r.item?.source === source && !r.item?._isCopy)
      if (!found) throw Error('样本没读到 ' + name)
      return found.ref
    }
    const active = mk()
    const traits = async (rt, id) => {
      const { session } = await rt.session(owner)
      const data = await h.actorData(session, id)
      const list = (k) => [...(data.system.traits[k]?.value ?? [])].sort()
      const proficient = (values) => Object.entries(values ?? {}).filter(([, v]) => v.value > 0).map(([k]) => k).sort()
      return { tools: proficient(data.system.tools), skills: proficient(data.system.skills), dr: list('dr'), di: list('di'), ci: list('ci'), armor: list('armorProf'), weapon: list('weaponProf') }
    }
    const inspect = async (ref) => {
      const r = await active.people.buildOptions(owner, { items: [ref], blank: true })
      if (r.status !== 'complete') throw Error(r.error ?? r.status)
      return r.items[0]
    }
    const create = async (rt, ref, name, step, chosen) => {
      const picks = step && chosen !== undefined ? [[{ id: step.id, level: step.level, value: { chosen } }]] : undefined
      const res = await rt.people.build(owner, { items: Array.isArray(ref) ? ref : [ref], name, picks, blank: true }, { category: 'party' })
      const id = res.built.id
      return id ? { id, values: await traits(rt.rt, id) } : { reason: res.built.error, detail: res.built.detail }
    }
    const has = (row, key) => row.steps.find((s) => s.options?.slots?.some((slot) => slot.options.some((o) => o.value === key)))
    const dwarf = await find('race', 'Dwarf', 'PHB')
    const dwarfOptions = await inspect(dwarf)
    const d = has(dwarfOptions, 'tool:art:brewer')
    const dragon = await find('race', 'Dragonborn', 'PHB')
    const dragonOptions = await inspect(dragon)
    const dr = has(dragonOptions, 'dr:fire')
    const out = { dwarfOptions, dragonOptions, sameDwarfStep: d?.id === has(await inspect(dwarf), 'tool:art:brewer')?.id }
    if (!d || !dr) return out
    out.dwarf = await create(active, dwarf, '选酿酒', d, ['tool:art:brewer'])
    out.changed = await create(active, dwarf, '改石匠', d, ['tool:art:mason'])
    out.blank = await create(active, dwarf, '未选工具')
    out.dragon = await create(active, dragon, '选火', dr, ['dr:fire'])
    out.invalid = await create(active, dragon, '重复多选', dr, ['dr:fire', 'dr:cold'])
    out.dragonBlank = await create(active, dragon, '未选抗性')
    out.as = await create(active, await find('race', 'Aasimar', 'MPMM'), '固定抗性')
    out.armored = await create(active, await find('feat', 'Heavily Armored', 'XPHB'), '重甲专长')
    out.immune = await create(active, await find('feat', 'Boon of Poison Mastery', 'FRHoF'), '伤害和状态免疫')
    out.barbarian = await create(active, await find('class', 'Barbarian', 'PHB'), '主职业熟练')
    const fighter = await find('class', 'Fighter', 'PHB')
    out.fighter = await create(active, fighter, '主职业战士')
    out.secondary = await create(active, [await find('class', 'Wizard', 'PHB'), fighter], '兼职战士')
    const artisan = await find('background', 'Artisan', 'XPHB')
    const artisanTools = has(await inspect(artisan), 'tool:art:brewer')
    out.artisan = artisanTools ? await create(active, artisan, '任选工匠工具', artisanTools, ['tool:art:brewer']) : null
    const skilled = await find('feat', 'Skilled', 'XPHB')
    out.skilledOptions = await inspect(skilled)
    const skilledMixed = has(out.skilledOptions, 'tool:art:brewer')
    out.skilled = skilledMixed ? await create(active, skilled, '混选技能和工具', skilledMixed, ['tool:art:brewer', 'skills:ste', 'skills:ins']) : null
    out.filtered = await inspect(await find('race', 'Hobgoblin', 'VGM'))
    const stored = JSON.parse(JSON.stringify(await active.saves.read(owner)))
    out.recorded = stored.actors.map((a) => [a.name, Object.values(a.choices).flat().filter((row) => row.id?.startsWith('P6Tr'))])
    // 旧人物只有原导入结果。构造同样的存档，冷读时仍按原来记录重建。
    const rawDwarf = (await h.service.storedItem(dwarf.set, dwarf.prop, dwarf.hash)).item
    const { session } = await active.rt.session(owner)
    const oldConverted = await session.call('importForBuild', dwarf.prop, rawDwarf)
    const old = await session.call('buildCharacter', { name: '旧存档矮人', items: [{ data: oldConverted.result }], blank: true })
    await active.rt.remember(owner, old.result.id)
    const [oldActor] = JSON.parse(JSON.stringify(await active.rt.compact(owner, [old.result.id])))
    out.oldBefore = await traits(active.rt, oldActor.id)
    await active.rt.close(owner)
    const cold = mk()
    out.statuses = await cold.people.load(owner)
    out.restored = {}
    for (const key of ['dwarf', 'changed', 'blank', 'dragon', 'dragonBlank', 'as', 'armored', 'immune', 'barbarian', 'fighter', 'secondary', 'artisan', 'skilled']) {
      const restored = out.statuses[stored.actors.findIndex((a) => a.id === out[key]?.id)]
      if (restored?.status === 'complete') out.restored[key] = await traits(cold.rt, restored.id)
    }
    const oldRestored = await cold.rt.rebuild(owner, oldActor)
    if (oldRestored.status === 'complete') out.oldAfter = await traits(cold.rt, oldActor.id)
    const next = await create(cold, dwarf, '读档后新建')
    out.keptActorIds = !!next.id && next.id !== oldActor.id && !stored.actors.some((a) => a.id === next.id)
    await cold.rt.close(owner)
    return out
  })
  if (!results.dwarf || !results.dragon) console.log(JSON.stringify(results, null, 2))
  else console.log(JSON.stringify({ recorded: results.recorded, statuses: results.statuses.map(({ status, error }) => ({ status, error })), restored: results.restored, filtered: results.filtered.unsupported, invalid: results.invalid?.reason, ...(!results.skilled ? { skilledOptions: results.skilledOptions } : {}) }, null, 2))
  assert.equal(results.sameDwarfStep, true)
  assert.ok(results.dwarf?.id && results.dragon?.id)
  assert.deepEqual(results.dwarf.values.tools, ['brewer'])
  assert.deepEqual(results.changed.values.tools, ['mason'])
  assert.deepEqual(results.blank.values.tools, [])
  assert.deepEqual(results.dwarf.values.dr, ['poison'])
  assert.deepEqual(results.dragon.values.dr, ['fire'])
  assert.deepEqual(results.dragonBlank.values.dr, [])
  assert.deepEqual(results.as.values.dr, ['necrotic', 'radiant'])
  assert.ok(results.armored.values.armor.includes('hvy'))
  assert.deepEqual(results.immune.values.di, ['poison'])
  assert.deepEqual(results.immune.values.ci, ['poisoned'])
  assert.ok(results.barbarian.values.armor.includes('lgt'))
  assert.ok(results.fighter.values.armor.includes('hvy'))
  assert.ok(results.secondary.values.armor.includes('med'))
  assert.ok(!results.secondary.values.armor.includes('hvy'))
  assert.deepEqual(results.artisan.values.tools, ['brewer'])
  assert.deepEqual(results.skilled.values.tools, ['brewer'])
  assert.deepEqual(results.skilled.values.skills, ['ins', 'ste'])
  assert.ok(results.filtered.unsupported.length)
  assert.ok(results.invalid.reason)
  assert.ok(results.statuses.every((r) => r.status === 'complete'))
  assert.ok(results.keptActorIds)
  assert.deepEqual(results.oldBefore.tools, [])
  assert.deepEqual(results.oldBefore.dr, [])
  assert.deepEqual(results.oldAfter, results.oldBefore)
  for (const [key, value] of Object.entries(results.restored)) assert.deepEqual(value, results[key].values, key)
  assert.ok(results.recorded.every(([, row]) => row.length))
  console.log('PASS ' + engine)
} finally {
  clearTimeout(timeout)
  await context?.close()
  server?.close()
}
