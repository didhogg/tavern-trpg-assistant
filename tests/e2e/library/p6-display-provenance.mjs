// 真实作者资料 → 建卡显示出口：身份、规则代码、语言键、标题及冷读档。
import assert from 'node:assert/strict'
import { readFile, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { E2E_PORT, engines, freshFromBase, work } from './chain-common.mjs'
import { startStatic } from './static.mjs'

const engine = process.env.ENGINE ?? 'chrome'
const [, browser, launch] = engines.find(([name]) => name === engine)
const dist = process.env.P6_TEST_DIST
const timeout = setTimeout(() => process.exit(124), 300_000)
let context, server
try {
  const host = await startStatic({ port: E2E_PORT })
  server = host.server
  context = await browser.launchPersistentContext(freshFromBase(engine, 'p6-display-provenance'), launch)
  if (dist) await context.route(u => u.href.startsWith(host.url) && (/^\/dist\//.test(u.pathname) || u.pathname.endsWith('/harness.js')), async route => {
    const path = new URL(route.request().url()).pathname
    await route.fulfill({ body: await readFile(join(dist, path.startsWith('/dist/') ? path.slice(6) : 'harness.js')), contentType: 'application/javascript' })
  })
  const page = await context.newPage()
  await page.goto(host.url)
  const language = process.env.TEST_LANGUAGE ?? 'cn'
  const result = await page.evaluate(async language => {
    const h = await import('/work/e2e-lib/harness.js')
    const library = h.defaultCampaignLibrary('dnd5e2014', language)
    const owner = 'char:p6-display-provenance.png'
    await h.campaign.startNewCampaign({ ownerKey: owner, ownerLabel: '显示来源', ruleId: library.rule, name: '显示来源' })
    await h.kernelSave.bind(owner, { rule: library.rule, kernelVersion: 1, library, dataVersion: await h.dataVersion(), overrides: [], actors: [], revision: 0, undo: [] })
    const rt = new h.KernelRuntime({ revisions: h.revisions, pluginRoot: new URL('/', location.href), files: h.files, scoped: h.scoped, service: h.service, container: () => document.body, campaignOf: async () => ({ rule: library.rule, library, title: '显示来源' }) })
    const saves = new h.kernelSave.constructor({ ...h.kernelSave.deps, compactActors: (k, ids) => rt.compact(k, ids), mapRef: k => rt.mapRef(k) })
    const people = new h.KernelPeople({ runtime: rt, saves })
    const pools = {}
    const out = { samples: [] }
    let master
    for (const [prop, name, source] of [
      ['feat', 'Weapon Master', 'PHB'], ['background', 'Criminal', 'PHB'],
      ['background', 'Guild Merchant', 'PHB'], ['feat', 'Tavern Brawler', 'XPHB'],
      ['class', 'Bard', 'PHB'], ['class', 'Monk', 'PHB'], ['class', 'Bard', 'XPHB'],
      ['race', 'Half-Elf', 'PHB'], ['feat', 'Resilient', 'PHB'], ['feat', 'Skilled', 'PHB'],
      ['feat', 'Boon of Skill', 'XPHB'],
    ]) {
      pools[prop] ??= await h.scoped.query(library, prop)
      const row = pools[prop].find(r => r.item.source === source && ((r.item.ENG_name ?? r.item.name) === name || (name === 'Guild Merchant' && /Guild Merchant|公会商人/.test(r.item.name))))
      if (!row) throw Error('未读到样本 ' + name)
      const shown = await people.buildOptions(owner, { items: [row.ref], blank: true })
      if (shown.status !== 'complete') throw Error(shown.error ?? shown.status)
      if (name === 'Weapon Master') master = { row, shown }
      out.samples.push({ name, source, unsupported: shown.items[0].unsupported, steps: shown.items[0].steps, untranslated: shown.untranslated ?? [], issues: shown.displayIssues ?? [] })
    }
    const weapon = master.shown.items[0].steps.find(step => step.options?.trait === 'weapon')
    const chosen = weapon.options.slots.flatMap(slot => slot.options.slice(0, slot.count).map(option => option.value))
    const made = await people.build(owner, { name: '按作者编号选武器', items: [master.row.ref], picks: [[{ id: weapon.id, level: weapon.level, value: { chosen } }]], blank: true }, { category: 'party' })
    out.created = made.built.status
    const actor = await h.actorData((await rt.session(owner)).session, made.built.id)
    out.before = actor.system.traits.weaponProf
    const state = await saves.read(owner)
    await rt.close(owner)
    const rebuilt = await rt.rebuild(owner, state.actors.find(a => a.id === made.built.id))
    out.restored = rebuilt.status
    const restored = await h.actorData((await rt.session(owner)).session, made.built.id)
    out.after = restored.system.traits.weaponProf
    await rt.close(owner)
    return out
  }, language)
  await writeFile(`${work}/p6-display-provenance-${engine}-${language}.json`, JSON.stringify(result, null, 2))
  const [master, criminal, guild, tavern, bard, monk, prepared] = result.samples
  const weapon = master.steps.find(step => step.options?.trait === 'weapon')
  const choices = weapon.options.slots.flatMap(slot => slot.options)
  assert.ok(choices.length > 1)
  assert.ok(choices.every(option => option.value.startsWith('weapon:')), '改动了结算编号')
  assert.equal(master.untranslated.length, 0)
  if (language === 'cn') {
    assert.ok(choices.every(option => /[㐀-鿿]/.test(option.label)), '武器名仍漏过中文出口')
    assert.ok(criminal.unsupported.some(text => text.includes('整副三龙牌')))
    assert.ok(guild.unsupported.some(text => text.includes('任意一个工匠工具')))
    assert.ok(tavern.unsupported.some(text => text.includes('临时武器')))
    assert.ok(bard.steps.some(step => /激励骰/.test(step.title)))
    assert.ok(monk.steps.some(step => step.title === '武艺骰'))
    assert.ok(prepared.issues.some(issue => issue.text === 'Max Prepared Spells' && issue.reason === 'language-key-missing' && issue.key.startsWith('TRPGAssistant.UpstreamText.')))
    assert.ok(prepared.issues.every(issue => issue.path && issue.reason))
    for (const sample of result.samples.slice(7)) {
      assert.deepEqual(sample.untranslated, [], sample.name + ' 把作者配置编号误当成品文字')
      assert.ok(sample.steps.flatMap(s => s.options?.slots?.flatMap(slot => slot.options) ?? []).every(option => /[㐀-鿿]/.test(option.label)))
    }
  } else {
    assert.ok(choices.some(option => option.label === 'Longsword'))
    assert.ok(bard.steps.some(step => step.title === 'Bardic Inspiration Die'))
    assert.ok(result.samples.every(sample => sample.untranslated.length === 0))
  }
  assert.equal(result.created, 'complete')
  assert.equal(result.restored, 'complete')
  assert.deepEqual(result.after, result.before)
  console.log(JSON.stringify({ engine, language, candidates: choices.length, samples: result.samples.map(s => ({ name: s.name, untranslated: s.untranslated })), restored: result.restored }))
} finally {
  clearTimeout(timeout)
  await context?.close()
  server?.close()
}
