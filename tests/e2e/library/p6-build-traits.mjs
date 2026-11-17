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
    const mk = (cache = false) => {
      const rt = new h.KernelRuntime({ revisions: h.revisions, pluginRoot: new URL('/', location.href), files: h.files, scoped: h.scoped, service: h.service, container: () => document.body,
        ...(cache ? { cache: { db: h.libraryDb, dataVersion: h.dataVersion } } : {}),
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
    const active = mk(true)
    const traits = async (rt, id) => {
      const { session } = await rt.session(owner)
      const data = await h.actorData(session, id)
      const list = (k) => [...(data.system.traits[k]?.value ?? [])].sort()
      const proficient = (values) => Object.entries(values ?? {}).filter(([, v]) => v.value > 0).map(([k]) => k).sort()
      return { tools: proficient(data.system.tools), skills: proficient(data.system.skills), dr: list('dr'), di: list('di'), ci: list('ci'), armor: list('armorProf'), weapon: list('weaponProf'), languages: list('languages'), expert: Object.entries(data.system.skills).filter(([, v]) => v.value === 2).map(([key]) => key) }
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
    const hobgoblin = await find('race', 'Hobgoblin', 'VGM')
    out.filtered = await inspect(hobgoblin)
    out.filteredWeapons = out.filtered.steps.find(step => step.options?.trait === 'weapon')
    const offWeapon = out.filteredWeapons?.options?.slots.flatMap(slot => slot.options).find(option => option.value === 'weapon:mar:longsword')
    if (offWeapon) {
      const ref = await find('item', 'Longsword', 'PHB')
      const exclude = library.exclude
      library.exclude = [...exclude, h.entryUnit(ref)]
      const limited = await inspect(hobgoblin)
      out.filteredExclusion = { gone: !has(limited, offWeapon.value), stillHasWeapons: limited.steps.some(step => step.options?.trait === 'weapon') }
      library.exclude = exclude
    }
    const customBg = await find('background', 'Custom Background', 'PHB')
    const customRow = await inspect(customBg)
    const custom = customRow.steps.find(step => step.options?.plans?.length)
    out.customPlans = custom?.options.plans
    if (custom) {
      const alt = custom.options.plans.at(-1)
      const other = await active.people.buildOptions(owner, { items: [customBg], picks: [[{ id: alt.id, level: custom.level, value: { chosen: [] } }]], blank: true })
      const otherStep = other.items?.[0].steps.find(step => step.id === alt.id)
      out.customAlt = otherStep?.options.slots.map(slot => slot.count)
      const selected = otherStep?.options.slots[0]?.options[0]?.value
      if (selected) out.custom = await create(active, customBg, '自定义工具方案', otherStep, [selected])
    }
    const monk = await find('class', 'Monk', 'XPHB')
    const monkSteps = await inspect(monk)
    out.monkToolPlans = monkSteps.steps.find(step => step.options?.plans?.length)?.options.plans
    out.monk = await create(active, monk, '武僧整组获武器熟练')
    const expert = await find('feat', 'Skill Expert', 'XPHB')
    const ordinary = await find('background', 'Acolyte', 'PHB')
    const withExpert = await active.people.buildOptions(owner, { items: [ordinary, expert], blank: true })
    const expertStep = withExpert.items?.[1]?.steps.find(step => step.title === 'Expertise')
    out.expertOptions = expertStep?.options?.slots.flatMap(slot => slot.options.map(option => option.value)) ?? []
    if (out.expertOptions.includes('skills:ins')) {
      const b = await active.people.build(owner, { items: [ordinary, expert], name: '专精', picks: [[], [{ id: expertStep.id, level: expertStep.level, value: { chosen: ['skills:ins'] } }]], blank: true }, { category: 'party' })
      if (b.built.id) out.expert = { id: b.built.id, values: await traits(active.rt, b.built.id) }
    }
    const ownSkill = has(await inspect(expert), 'skills:acr')
    if (ownSkill) {
      const picks = [{ id: ownSkill.id, level: ownSkill.level, value: { chosen: ['skills:acr'] } }]
      const withOwn = await active.people.buildOptions(owner, { items: [expert], picks: [picks], blank: true })
      const ownExpert = has({ steps: withOwn.items?.[0]?.steps.filter(step => step.title === 'Expertise') ?? [] }, 'skills:acr')
      if (ownExpert) {
        picks.push({ id: ownExpert.id, level: ownExpert.level, value: { chosen: ['skills:acr'] } })
        const self = await active.people.build(owner, { items: [expert], name: '专长自己的技能专精', picks: [picks], blank: true }, { category: 'party' })
        out.selfExpert = self.built.id ? { id: self.built.id, values: await traits(active.rt, self.built.id) } : self.built
      }
    }
    const criminalOptions = await inspect(await find('background', 'Criminal', 'PHB'))
    out.partialToolChoice = has(criminalOptions, 'tool:game:dice')?.options.slots[0].count ?? 0
    const lang = (row) => row.steps.filter((step) => step.options?.trait === 'languages')
    const acolyte = await find('background', 'Acolyte', 'PHB')
    const feylost = await find('background', 'Feylost', 'WBtW')
    const haunted = await find('background', 'Haunted One', 'VRGR')
    const languageRows = []
    for (const ref of [acolyte, feylost, haunted]) languageRows.push(await inspect(ref))
    out.languageRows = languageRows.map((row) => ({ unsupported: row.unsupported, steps: lang(row) }))
    const [aStep, fStep] = languageRows.map((row) => lang(row)[0])
    const dwarfLanguage = aStep.options.slots[0].options.find(o => o.value.endsWith(':dwarvish')).value
    const elvish = aStep.options.slots[0].options.find(o => o.value.endsWith(':elvish')).value
    if (aStep.options.slots[0].count === 2) {
      out.acolyte = await create(active, acolyte, '侍僧两门语言', aStep, [dwarfLanguage, elvish])
      out.acolyteBlank = await create(active, acolyte, '侍僧留空一门', aStep, [elvish])
      out.acolyteInvalid = await create(active, acolyte, '侍僧选错范围', aStep, [dwarfLanguage, 'languages:standard:__missing__'])
    }
    if (fStep.options.slots.length === 2) {
      out.feylost = await create(active, feylost, '迷失妖精两门语言', fStep, [dwarfLanguage, elvish])
      out.feylostDuplicate = await create(active, feylost, '迷失妖精重复选择', fStep, [elvish, elvish])
      out.feylostInvalid = await create(active, feylost, '两个都只符合宽选', fStep, [dwarfLanguage, 'languages:standard:orc'])
    }
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
    const rawAcolyte = (await h.service.storedItem(acolyte.set, acolyte.prop, acolyte.hash)).item
    const oldAcolyte = await session.call('importForBuild', acolyte.prop, rawAcolyte)
    const oldCard = await session.call('buildCharacter', { name: '旧存档侍僧', items: [{ data: oldAcolyte.result }] })
    await active.rt.remember(owner, oldCard.result.id)
    const [oldLanguageActor] = JSON.parse(JSON.stringify(await active.rt.compact(owner, [oldCard.result.id])))
    out.oldLanguageBefore = await traits(active.rt, oldLanguageActor.id)

    const sideId = 'TRPGSidecarProbe'
    const withAuthored = { ...rawAcolyte, foundryAdvancement: [{ _id: sideId, type: 'Trait', level: 0, name: 'Authored Fire Resistance', configuration: { grants: ['dr:fire'], choices: [] }, value: {} }] }
    const importedAuthored = await session.call('importForBuild', acolyte.prop, withAuthored)
    const cachedAuthored = await session.call('importForBuild', acolyte.prop, withAuthored)
    const authoredRow = { prop: acolyte.prop, entry: withAuthored, data: cachedAuthored.result, refKey: 'authored-probe' }
    const authored = await session.call('buildOptions', { items: [authoredRow], blank: true })
    out.sidecar = {
      sameCached: JSON.stringify(importedAuthored.result) === JSON.stringify(cachedAuthored.result),
      original: authored.result.items[0].steps.some((s) => s.id === sideId),
      count: lang(authored.result.items[0])[0].options.slots[0].count,
    }
    const competing = {
      ...withAuthored, foundryAdvancement: [{ ...withAuthored.foundryAdvancement[0], name: 'Authored Language Choice', configuration: { grants: [], choices: [{ count: 1, pool: [dwarfLanguage, elvish] }] } }],
    }
    const conflict = (await session.call('buildOptions', { items: [{ prop: acolyte.prop, entry: competing, refKey: 'authored-conflict' }], blank: true })).result.items[0]
    out.sidecarConflict = { original: lang(conflict).some(s => s.id === sideId), warned: conflict.unsupported.some(msg => msg?.$t === 'plugin' && msg.text.includes('与资料附带的进阶重叠')) } // 直接读小窗原始结果：提示是标了来路的插件说明句
    await active.rt.close(owner)
    const cold = mk()
    out.statuses = await cold.people.load(owner)
    out.restored = {}
    for (const key of ['dwarf', 'changed', 'blank', 'dragon', 'dragonBlank', 'as', 'armored', 'immune', 'barbarian', 'fighter', 'secondary', 'artisan', 'skilled', 'acolyte', 'acolyteBlank', 'feylost', 'custom', 'expert', 'selfExpert', 'monk']) {
      const restored = out.statuses[stored.actors.findIndex((a) => a.id === out[key]?.id)]
      if (restored?.status === 'complete') out.restored[key] = await traits(cold.rt, restored.id)
    }
    const oldRestored = await cold.rt.rebuild(owner, oldActor)
    if (oldRestored.status === 'complete') out.oldAfter = await traits(cold.rt, oldActor.id)
    const oldLanguageRestored = await cold.rt.rebuild(owner, oldLanguageActor)
    if (oldLanguageRestored.status === 'complete') out.oldLanguageAfter = await traits(cold.rt, oldLanguageActor.id)
    const next = await create(cold, dwarf, '读档后新建')
    out.keptActorIds = !!next.id && next.id !== oldActor.id && !stored.actors.some((a) => a.id === next.id)
    await cold.rt.close(owner)
    const warm = mk(true)
    const warmStatuses = await warm.people.load(owner)
    const warmAcolyte = warmStatuses[stored.actors.findIndex((a) => a.id === out.acolyte?.id)]
    if (warmAcolyte?.status === 'complete') out.warmAcolyte = await traits(warm.rt, warmAcolyte.id)
    await warm.rt.close(owner)
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
  assert.deepEqual(results.filteredExclusion, { gone: true, stillHasWeapons: true })
  assert.ok(results.filteredWeapons?.options?.slots.some(slot => slot.count === 2 && slot.options.length >= 2))
  assert.equal(results.customPlans?.length, 3)
  assert.deepEqual(results.customAlt, [1])
  assert.equal(results.custom?.values.tools.length, 1)
  assert.equal(results.monkToolPlans?.length, 2)
  assert.ok(results.monk?.values.weapon.some(key => key.includes('scimitar')), JSON.stringify(results.monk))
  assert.deepEqual(results.restored.monk, results.monk.values)
  assert.ok(results.expertOptions.includes('skills:ins') && !results.expertOptions.includes('skills:acr'))
  assert.ok(results.selfExpert?.values?.expert.includes('acr'), JSON.stringify(results.selfExpert ?? {}))
  assert.deepEqual(results.restored.selfExpert, results.selfExpert.values)
  assert.deepEqual(results.expert?.values.expert, ['ins'])
  assert.ok(results.invalid.reason)
  assert.ok(results.statuses.every((r) => r.status === 'complete'))
  assert.ok(results.keptActorIds)
  assert.deepEqual(results.oldBefore.tools, [])
  assert.deepEqual(results.oldBefore.dr, [])
  assert.deepEqual(results.oldAfter, results.oldBefore)
  const [[a], [f], [h]] = results.languageRows.map(row => row.steps)
  assert.deepEqual(results.languageRows.map(row => row.steps.length), [1, 1, 1])
  assert.deepEqual(a.options.slots.map(slot => slot.count), [2])
  // The author's broad picker also offers exotic languages with DM permission.
  assert.ok(a.options.slots[0].options.some(o => o.value.endsWith(':infernal')))
  assert.match(a.hint, /DM's permission/)
  assert.deepEqual(f.options.slots.map(slot => slot.count).sort(), [1, 1])
  assert.deepEqual(f.options.slots.find(slot => slot.options.length === 4)?.options.map(o => o.value.split(':').at(-1)).sort(), ['elvish', 'gnomish', 'goblin', 'sylvan'])
  assert.deepEqual(h.options.slots.map(slot => slot.count).sort(), [1, 1])
  assert.deepEqual(h.options.slots.find(slot => slot.options.length === 8)?.options.map(o => o.value.split(':').at(-1)).sort(), ['abyssal', 'celestial', 'deep', 'draconic', 'infernal', 'primordial', 'sylvan', 'undercommon'])
  assert.ok(results.languageRows.every(row => !row.unsupported.includes('Languages')))
  assert.deepEqual(results.acolyte.values.languages, ['dwarvish', 'elvish'])
  assert.deepEqual(results.acolyteBlank.values.languages, ['elvish'])
  assert.deepEqual(results.feylost.values.languages, ['dwarvish', 'elvish'])
  assert.ok(results.acolyteInvalid.reason && results.feylostDuplicate.reason && results.feylostInvalid.reason)
  assert.equal(results.oldLanguageBefore.languages.length, 1)
  assert.deepEqual(results.oldLanguageAfter, results.oldLanguageBefore)
  assert.deepEqual(results.warmAcolyte, results.acolyte.values)
  assert.deepEqual(results.sidecar, { sameCached: true, original: true, count: 2 })
  assert.deepEqual(results.sidecarConflict, { original: true, warned: true })
  assert.equal(results.partialToolChoice, 1)
  for (const [key, value] of Object.entries(results.restored)) assert.deepEqual(value, results[key].values, key)
  assert.ok(results.recorded.every(([, row]) => row.length))
  console.log('PASS ' + engine)
} finally {
  await context?.close()
  server?.close()
  server?.closeAllConnections()
  clearTimeout(timeout)
}
