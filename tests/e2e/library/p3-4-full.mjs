// P3-4 真实【库】+ 存档 + 结算变更计划：使用 full-chain.mjs 取出的真实 changes，不手写 HP/法术位。
import fs from 'node:fs'
import { mkdir, rm, writeFile } from 'node:fs/promises'
import { build } from 'vite'
import { chromium, webkit } from 'playwright-core'
import { root, startStatic } from './static.mjs'

const work = `${root}work/e2e-lib`
await mkdir(work, { recursive: true })
await build({ configFile: `${root}vite.config.ts`, root, logLevel: 'error' })
await build({ configFile: false, root, logLevel: 'error', build: {
  lib: { entry: `${root}tests/e2e/library/harness.ts`, formats: ['es'], fileName: () => 'harness.js' },
  outDir: work, emptyOutDir: false,
} })
const { server, url } = await startStatic({ port: 47322 })
const engines = [
  ['chrome', chromium, { executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true }],
  ['webkit', webkit, { headless: true }],
]

async function run(page, kernel) {
  return page.evaluate(async kernel => {
    const h = await import('/work/e2e-lib/harness.js')
    const set = await h.offlineAudit('cn-official')
    if (set.set?.status !== 'installed' || set.ok !== set.planFiles) await h.install('cn-official')
    h.service.reset()
    const parsed = await h.service.parsed('cn-official', 'spell')
    const index = parsed.items.findIndex((item, i) => item.name === '火球术' && parsed.sources[i] === 'PHB')
    if (index < 0) throw new Error('没有火球术 PHB')
    const ref = { set: 'cn-official', prop: 'spell', hash: parsed.hashes[index] }
    await h.userDb.workspaces.clear()
    await h.userDb.saves.clear()

    const owner = { ownerKey: 'char:p34full.png', ownerLabel: 'P3-4 全链路' }
    await h.campaign.startNewCampaign({ ...owner, ruleId: 'dnd5e2014', name: 'P3-4 全链路' })
    const library = h.defaultCampaignLibrary('dnd5e2014', 'cn')
    const q = await h.scoped.query(library, 'spell', { source: 'PHB' })
    const dedupeRefs = new Set(q.map(r => `${r.ref.set}|${r.ref.prop}|${r.ref.hash}`))
    const excluded = { ...library, exclude: ['src:phb'] }
    const q2 = await h.scoped.query(excluded, 'spell', { source: 'PHB' })
    await h.scoped.manage.addScope({ id: 'p34', name: 'P3-4 scope' })
    await h.scoped.manage.setAssignment('src:p34-test', { scopes: ['p34'], global: false })
    const scopesExport = await h.custom.exportScopes()
    const scopesRestored = await h.custom.importScopes(scopesExport)
    const navIndexInstalled = await h.hasSourceFile('cn-official', 'data/generated/gendata-nav-adventure-book-index.json')
    const heroState = { actor: null, items: [], effects: [] }
    const monsterState = { actor: { _id: kernel.ids.monster, system: { attributes: { hp: { value: kernel.provenance.fight.before } } } }, items: [], effects: [] }
    const bound = await h.kernelSave.bind(owner.ownerKey, {
      rule: 'dnd5e2014', kernelVersion: 1, library,
      dataVersion: { official: 'old-official', brews: {} },
      overrides: [],
      actors: [
        { id: kernel.ids.hero, name: kernel.names.hero, refs: [{ kind: 'spell', ...ref, label: '火球术' }],
          choices: {}, state: heroState, adjustments: {}, dice: [3, 1, 4] },
        { id: kernel.ids.monster, name: kernel.names.monster, refs: [{ kind: 'spell', ...ref, label: '火球术' }],
          choices: {}, state: monsterState, adjustments: {}, dice: [] },
      ],
      revision: 0, undo: [],
    })
    const allChanges = [...kernel.build.changes, ...kernel.combat.changes, ...kernel.turn.changes, ...kernel.attack.changes, ...kernel.fight.changes]
    const preview = await h.kernelSave.preview(owner.ownerKey, allChanges)
    const applied = await h.kernelSave.apply(owner.ownerKey, allChanges, preview.revision)
    const afterApply = await h.kernelSave.read(owner.ownerKey)
    const heroAfter = afterApply.actors.find(a => a.id === kernel.ids.hero)
    const monsterAfter = afterApply.actors.find(a => a.id === kernel.ids.monster)
    const appliedState = {
      heroHp: heroAfter?.state.actor?.system?.attributes?.hp?.value ?? null,
      heroLevel: (heroAfter?.state.items ?? []).filter(i => i.type === 'class').reduce((n, i) => n + (i.system?.levels ?? 0), 0) || null,
      monsterHp: monsterAfter?.state.actor?.system?.attributes?.hp?.value ?? null,
    }
    // 撤销：回到建卡/战斗前；再重新写入，继续存档/读档。
    const undone = await h.kernelSave.undo(owner.ownerKey, applied.kernel.revision)
    const undoneHero = undone?.kernel.actors.find(a => a.id === kernel.ids.hero)
    const undoneMonster = undone?.kernel.actors.find(a => a.id === kernel.ids.monster)
    const undoRestored = undoneMonster?.state.actor?.system?.attributes?.hp?.value === kernel.provenance.fight.before
      && undoneHero?.state.actor == null
    const reapplied = await h.kernelSave.apply(owner.ownerKey, allChanges, undone?.kernel.revision ?? applied.kernel.revision)
    await h.campaign.saveCurrent(owner.ownerKey)
    // §4 新加：版本/覆盖差异（真实【库】当前版本 + 新建房规覆盖）
    const house = await h.custom.createHouseRule(library, ref, { mod: { entries: { mode: 'appendArr', items: 'P3-4 房规' } } })
    const checkChanged = await h.kernelSave.check(owner.ownerKey)
    const checkBefore = { dataVersionChanged: checkChanged.dataVersionChanged, overridesChanged: checkChanged.overridesChanged,
      missing: checkChanged.missing.length, dataVersionChanges: checkChanged.dataVersionChanges, overrideChanges: checkChanged.overrideChanges }

    // 关书 / 开书
    const closed = { ...house.campaign, exclude: [h.entryUnit(ref)] }
    await h.kernelSave.setLibrary(owner.ownerKey, closed)
    const checkClosed = await h.kernelSave.check(owner.ownerKey)
    const refsSurvive = (await h.kernelSave.read(owner.ownerKey)).actors[0].refs.length === 1
    await h.kernelSave.setLibrary(owner.ownerKey, house.campaign)
    const checkOpen = await h.kernelSave.check(owner.ownerKey)

    // 读档：先保存当前（含房规），再读
    await h.campaign.saveCurrent(owner.ownerKey)
    const currentSaveId = (await h.campaign.getWorkspace(owner.ownerKey)).currentSaveId
    await h.campaign.loadSave(owner, currentSaveId)
    const loaded = await h.kernelSave.read(owner.ownerKey)
    const loadedState = {
      heroHp: loaded.actors.find(a => a.id === kernel.ids.hero)?.state.actor?.system?.attributes?.hp?.value ?? null,
      heroLevel: (loaded.actors.find(a => a.id === kernel.ids.hero)?.state.items ?? []).filter(i => i.type === 'class').reduce((n, i) => n + (i.system?.levels ?? 0), 0) || null,
      monsterHp: loaded.actors.find(a => a.id === kernel.ids.monster)?.state.actor?.system?.attributes?.hp?.value ?? null,
    }
    const checkLoaded = await h.kernelSave.check(owner.ownerKey)

    // 旧修订：用旧 revision 再写，必须冲突且不改状态
    let stale = null
    try { await h.kernelSave.apply(owner.ownerKey, allChanges, preview.revision) } catch (e) { stale = e?.code ?? String(e) }
    const afterStale = await h.kernelSave.read(owner.ownerKey)
    const staleUnchanged = JSON.stringify(afterStale.actors) === JSON.stringify(loaded.actors)

    // 完整备份：真实自制/房规 + 真实存档；清空后恢复
    const backup = await h.exportSaves({ db: h.userDb, now: Date.now, appVersion: '1.0.0', library: h.backupLibrary }, { type: 'backup' })
    const rec = h.readSaveFile(backup.bytes)
    // 模拟"新装恢复"：先删掉刚建的房规自制，再清用户库，然后从备份恢复。
    await h.custom.deleteHouseRule('cn', house.house, house.uniqueId).catch(() => null)
    await h.userDb.saves.clear()
    await h.userDb.workspaces.clear()
    const restored = await h.importSaves({ db: h.userDb, campaign: h.campaign, now: Date.now, hasRule: id => id === 'dnd5e2014',
      library: h.backupLibrary, checkRefs: refs => h.scoped.fetch(h.defaultCampaignLibrary('dnd5e2014', 'cn'), refs) },
    rec, { owner, selectedIds: rec.saves.map(s => s.id), mode: 'merge' })
    const restoredWorkspace = await h.kernelSave.read(owner.ownerKey)

    return {
      bound: bound.rule,
      dedupe: { rows: q.length, unique: dedupeRefs.size, otherCampaignRows: q2.length },
      scopes: { exported: scopesExport.format, restored: scopesRestored },
      navIndexInstalled,
      expected: { heroHp: kernel.provenance.build.hp, heroLevel: kernel.provenance.build.level, monsterHp: kernel.provenance.fight.after },
      changes: allChanges.length,
      previewRows: preview.rows.length,
      appliedRevision: applied.kernel.revision,
      undo: { revision: undone?.kernel.revision ?? null, restored: undoRestored },
      reappliedRevision: reapplied.kernel.revision,
      appliedState,
      checkChanged,
      checkBefore,
      closed: { missing: checkClosed.missing.map(m => ({ reason: m.reason, label: m.ref?.label })), refsSurvive },
      open: checkOpen.missing.length,
      loadedState,
      loadedRevision: loaded.revision,
      checkLoaded: checkLoaded.missing.length,
      stale,
      staleUnchanged,
      backup: { dependencies: rec.manifest.dependencies.length, kernelVersions: rec.manifest.kernelVersions.length, libraryFiles: Object.keys(rec.libraryFiles).length },
      restored: { library: restored.library, missing: restored.missing.length, workspace: !!restoredWorkspace },
    }
  }, kernel)
}

const verdict = o => ({
  applied: o.changes > 0 && o.previewRows === o.changes && o.appliedRevision === 1 && o.reappliedRevision === 3
    && o.appliedState.heroHp === o.expected.heroHp && o.appliedState.heroLevel === o.expected.heroLevel && o.appliedState.monsterHp === o.expected.monsterHp,
  undo: o.undo?.revision === 2 && o.undo?.restored,
  dedupe: o.dedupe.rows > 0 && o.dedupe.unique === o.dedupe.rows && o.dedupe.otherCampaignRows === 0,
  scopes: o.scopes.exported === 'trpg-library-scopes' && o.scopes.restored.scopes > 0 && o.scopes.restored.assignments > 0,
  changed: o.checkBefore.dataVersionChanged && o.checkBefore.overridesChanged,
  closed: o.closed.missing.length >= 1 && o.closed.missing.every(m => m.reason === 'excluded') && o.closed.refsSurvive,
  open: o.open === 0,
  loaded: o.loadedState.monsterHp === o.expected.monsterHp && o.loadedState.heroHp === o.expected.heroHp && o.loadedState.heroLevel === o.expected.heroLevel && o.checkLoaded === 0,
  stale: o.stale === 'E_REVISION_CONFLICT' && o.staleUnchanged,
  backup: o.backup.libraryFiles >= 3 && o.restored.library?.brews > 0 && o.restored.library?.houseRules > 0 && o.restored.workspace && o.restored.missing === 0,
})

const results = []
for (const [name, type, options] of engines) {
  if (process.env.ENGINE && process.env.ENGINE !== name) continue
  const kernel = JSON.parse(fs.readFileSync(`${root}work/p3-2-a/p3-4-kernel-${name}.json`, 'utf8')).first
  const profile = `${work}/profile-p3-1-${name}`
  if (process.env.KEEP === '0') await rm(profile, { recursive: true, force: true })
  const ctx = await type.launchPersistentContext(profile, options)
  const page = await ctx.newPage()
  page.setDefaultTimeout(3600000)
  const errors = []
  page.on('pageerror', e => errors.push(e.stack.split('\n').slice(0, 2).join(' | ')))
  const r = { engine: name }
  try {
    await page.goto(url)
    r.out = await run(page, kernel)
    r.verdict = verdict(r.out)
    r.passed = Object.values(r.verdict).every(Boolean)
  } catch (e) { r.fatal = e.stack; r.passed = false } finally { r.errors = errors; await ctx.close() }
  results.push(r)
  await writeFile(`${work}/p3-4-full-${name}.json`, JSON.stringify(r, null, 2))
  console.log(name, r.passed ? 'PASS' : 'FAIL', JSON.stringify({ verdict: r.verdict, out: r.out, errors: r.errors.slice(0, 3), fatal: r.fatal?.slice(0, 500) }))
}
server.close()
process.exit(results.every(r => r.passed) ? 0 : 1)
