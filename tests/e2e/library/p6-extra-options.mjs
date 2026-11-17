// 真实资料 → 建卡选择 → 同一份规则复核提交 → 冷读档。
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { E2E_PORT, engines, freshFromBase } from './chain-common.mjs'
import { startStatic } from './static.mjs'

const engine = process.env.ENGINE ?? 'chrome'
const [, browser, options] = engines.find(([name]) => name === engine)
const dist = process.env.P6_TEST_DIST
const timeout = setTimeout(() => process.exit(124), 480_000)
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
    // 显示的语言：前置条件 = 本战役的作者代码对本战役生效条目的原始条件渲染出的字（中文战役 = 中文作者小窗）
    const authorRender = async (codeSet, raw) => (await (await h.service.frameOf(codeSet)).call('prerequisiteText', [raw]))[0]
    const needs = fighting.candidates.find(c => c.requirement)
    if (needs) {
      const local = (await h.scoped.storedItem(needs.ref))?.item
      out.requirement = { shown: needs.requirement, expected: await authorRender('cn', local?.prerequisite) }
      const withPick = await opts(human, fighter, needs.ref)
      out.reminder = (withPick.items ?? []).flatMap(i => i.unsupported).find(u => u.includes('前置条件请核对')) ?? null
      out.untranslatedNames = (preview.untranslated ?? []).filter(t => /Fighting Style|Origin/.test(t))
      // 房规改了这一条的条件：显示房规的条件（本战役生效的那一份）
      const house = await h.custom.createHouseRule(library, needs.ref, { edited: { ...structuredClone(local), prerequisite: [{ other: '测试房规条件' }] } })
      Object.assign(library, house.campaign)
      // 房规要后台解析进库才生效：照插件后台队列做的两步（core/backend.ts brewQueue：reparseBrew + scoped.reset）
      if ((await h.service.brewDirty('cn-brew')).length) await h.service.reparseBrew('cn-brew')
      h.scoped.reset()
      await rt.close(owner) // 战役小窗固定开窗时的那一版资料：改了房规要重进战役（NEXT 已登记的现象），这里照做
      const afterHouse = (await opts(human, fighter)).items?.flatMap(i => i.extras).flatMap(g => g.candidates).find(c => c.name === needs.name)
      out.houseRequirement = afterHouse?.requirement ?? null
    }
    library.exclude.push(`ent:${originPick.set}:${originPick.prop}:${originPick.hash}`)
    const after = (await opts(human, fighter)).items?.[0]?.extras[0]?.candidates ?? []
    out.closed = !after.some(c => c.ref.hash === originPick.hash)
    out.closedSubmission = (await build(originPick, stylePick)).built.status
    await rt.close(owner)
    // 英文战役：同一套出口，前置条件是英文作者代码渲染的英文
    const libEn = h.defaultCampaignLibrary('dnd5e2014', 'en')
    const ownerEn = 'char:p6-extra-options-en.png'
    await h.campaign.startNewCampaign({ ownerKey: ownerEn, ownerLabel: 'Extra options en', ruleId: libEn.rule, name: 'Extra options en' })
    await h.kernelSave.bind(ownerEn, { rule: libEn.rule, kernelVersion: 1, library: libEn, dataVersion: await h.dataVersion(), overrides: [], actors: [], revision: 0, undo: [] })
    const rtEn = new h.KernelRuntime({ revisions: h.revisions, pluginRoot: new URL('/', location.href), files: h.files, scoped: h.scoped, service: h.service, container: () => document.body, campaignOf: async () => ({ rule: libEn.rule, library: libEn, title: 'Extra options en' }) })
    const savesEn = new h.kernelSave.constructor({ ...h.kernelSave.deps, compactActors: (k, ids) => rtEn.compact(k, ids), mapRef: k => rtEn.mapRef(k) })
    const peopleEn = new h.KernelPeople({ runtime: rtEn, saves: savesEn })
    const findEn = async (prop, name, source) => (await h.scoped.query(libEn, prop, { source })).find(row => (row.item.ENG_name ?? row.item.name) === name)?.ref
    const enPreview = await peopleEn.buildOptions(ownerEn, { items: [await findEn('race', 'Human', 'XPHB'), await findEn('class', 'Fighter', 'XPHB')], blank: true })
    const enNeeds = (enPreview.items ?? []).flatMap(i => i.extras).flatMap(g => g.candidates).find(c => c.requirement)
    if (enNeeds) out.enRequirement = { shown: enNeeds.requirement, expected: await authorRender('en', (await h.scoped.storedItem(enNeeds.ref))?.item?.prerequisite) }
    out.enUntranslated = enPreview.untranslated ?? []
    await rtEn.close(ownerEn)
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
  const CJK = /[㐀-鿿]/
  assert.ok(result.requirement?.expected && result.requirement.shown === result.requirement.expected && CJK.test(result.requirement.shown), `中文战役的前置条件 = 中文作者代码渲染：${JSON.stringify(result.requirement)}`)
  assert.ok(result.reminder?.includes(result.requirement.expected), `请核对提醒用同一句条件：${result.reminder}`)
  assert.deepEqual(result.untranslatedNames, [], '组名没有没翻到的')
  assert.equal(result.houseRequirement, '测试房规条件', '房规改了条件：显示房规的条件')
  assert.ok(result.enRequirement?.expected && result.enRequirement.shown === result.enRequirement.expected && !CJK.test(result.enRequirement.shown), `英文战役的前置条件 = 英文作者代码渲染：${JSON.stringify(result.enRequirement)}`)
  assert.deepEqual(result.enUntranslated, [], '英文战役没有「没翻到」')
} finally {
  await context?.close()
  server?.close()
  server?.closeAllConnections()
  clearTimeout(timeout)
}
