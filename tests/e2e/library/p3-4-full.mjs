// P3-4 / P3-3b 完整链路（Chrome / WebKit）：P3-1 范围/去重/导出 + 真实【库】建人物 + 存档只存引用
// → 关书报缺（当前战役不动）→ 开书 0 缺 → 读档 → 重建 0 差别 → 预览/写入/撤销/再写 → 旧修订 → 完整备份恢复。
// 不手填引用/HP/法术位，不写死条目数量。
import { rm, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { startStatic } from './static.mjs'
import { buildAll, choiceSteps, differences, engines, fightMonster, kernelInputFor, knownError, work } from './chain-common.mjs'

await buildAll()
const kernelInput = await kernelInputFor('p3-4-full', 'P3-4 full')

const results = []
for (const [name, type, options] of engines) {
  if (process.env.ENGINE && process.env.ENGINE !== name) continue
  const { server, url } = await startStatic({ port: 47337 })
  const profile = join(work, `profile-p3-1-${name}`)
  if (process.env.KEEP === '0') await rm(profile, { recursive: true, force: true })
  const ctx = await type.launchPersistentContext(profile, { ...options, viewport: { width: 1280, height: 800 } })
  const page = await ctx.newPage()
  // 每一步最多等 15 分钟（首次装库最慢）；卡住就报出卡在哪一步，不让整轮挂一小时。
  page.setDefaultTimeout(900_000)
  const errors = []
  page.on('pageerror', e => errors.push(e.stack ?? String(e)))
  page.on('console', m => { if (m.type() === 'error') errors.push(`console: ${m.text()}`) })
  const r = { engine: name }
  try {
    await page.goto(url)

    // ---- 准备：装库、P3-1 检查、真实条目、开小窗 ----
    const prepared = await page.evaluate(async kernelInput => {
      const h = await import('/work/e2e-lib/harness.js')
      const out = {}
      for (const id of ['cn-official', 'en-official']) {
        const audit = await h.offlineAudit(id)
        if (audit.set?.status !== 'installed' || audit.ok !== audit.planFiles) await h.install(id)
      }
      h.service.reset()
      await h.scoped.setAssignment('src:phb', null)
      await h.scoped.setAssignment('src:mm', null)
      // 清掉上次留下的自制/房规（包括备份恢复后变成非 editable 的），让本轮编号稳定。
      const brews = await h.service.brewInstalled('cn-brew')
      if (brews.length) await h.service.brewDelete('cn-brew', brews.map(b => String(b.head.docIdLocal ?? '')))
      for (const link of await h.scoped.manage.houseRules()) await h.scoped.manage.unlinkHouseRule(link.house)
      h.scoped.reset()

      const parsed = await h.service.parsed('cn-official', 'spell')
      const index = parsed.items.findIndex((item, i) => item.name === '火球术' && parsed.sources[i] === 'PHB')
      if (index < 0) throw new Error('没有火球术 PHB')
      const fireball = { set: 'cn-official', prop: 'spell', hash: parsed.hashes[index] }
      await h.userDb.workspaces.clear()
      await h.userDb.saves.clear()
      const library = h.defaultCampaignLibrary('dnd5e2014', 'cn')
      const q = await h.scoped.query(library, 'spell', { source: 'PHB' })
      const unique = new Set(q.map(row => `${row.ref.set}|${row.ref.prop}|${row.ref.hash}`))
      const excluded = { ...library, exclude: ['src:phb'] }
      const q2 = await h.scoped.query(excluded, 'spell', { source: 'PHB' })
      await h.scoped.manage.addScope({ id: 'p34', name: 'P3-4 scope' })
      await h.scoped.manage.setAssignment('src:p34-test', { scopes: ['p34'], global: false })
      const scopesExport = await h.custom.exportScopes()
      const scopesRestored = await h.custom.importScopes(scopesExport)
      out.dedupe = { rows: q.length, unique: unique.size, otherCampaignRows: q2.length }
      out.scopes = { exported: scopesExport.format, restored: scopesRestored }
      out.fireball = fireball

      const { plan, monster } = await h.pickChainEntries(library)
      const { session, status } = await h.startKernelSession(kernelInput)
      globalThis.__k = session
      globalThis.__h = h
      out.boot = { system: status.system, rules: status.rules, api: status.plutoniumApi }
      out.plan = Object.fromEntries(Object.entries(plan).map(([k, v]) => [k, { ref: v.ref, label: v.label }]))
      out.planMonster = { ref: monster.ref, label: monster.label }
      return { out, plan, monster, fireball }
    }, kernelInput)
    r.prepared = prepared.out
    r.dedupe = prepared.out.dedupe
    r.scopes = prepared.out.scopes

    // ---- 导入英文对照，正式建卡 ----
    const imported = await page.evaluate(async plan => {
      const out = {}
      for (const [key, row] of Object.entries(plan)) {
        const imported = await globalThis.__k.call('importForBuild', row.ref.prop, row.entry)
        if (imported.status !== 'complete' || !imported.result) throw new Error(`import failed for ${key}: ${imported.error ?? imported.status}`)
        out[key] = imported.result
      }
      return out
    }, prepared.plan)
    const built = await page.evaluate(async imported => {
      const k = globalThis.__k
      return k.call('buildCharacter', 'P3-4 新角色', ['race', 'background', 'class'].map(key => imported[key]), ['weapon', 'spell'].map(key => imported[key]))
    }, imported)
    if (built.status !== 'complete') throw new Error(`build failed: ${JSON.stringify(built).slice(0, 500)}`)
    r.build = { status: built.status, id: built.result.id, level: built.result.level, items: built.result.items }

    const heroId = built.result.id
    r.base = await page.evaluate(async id => globalThis.__h.actorData(globalThis.__k, id), heroId)
    r.choiceSteps = choiceSteps(r.base)
    r.play = await page.evaluate(async id => {
      const k = globalThis.__k
      const a = await globalThis.__h.actorData(k, id)
      const weapon = a.items.find(i => i.type === 'weapon')
      const attack = await k.call('attack', id, weapon._id, [20, 4, 4, 4, 4, 4, 4, 4])
      const total = attack.result?.damage?.[0]?.total ?? null
      if (!total) throw new Error('attack produced no damage')
      const damage = await k.call('damage', id, [{ value: total, type: weapon.system?.damage?.base?.types?.[0] ?? 'slashing' }], [], {})
      const equip = await k.call('equip', id, weapon._id, false)
      return { attack: attack.status, damage: damage.status, equip: equip.status, total, weaponId: weapon._id }
    }, heroId)
    r.current = await page.evaluate(async id => globalThis.__h.actorData(globalThis.__k, id), heroId)
    r.basePrepared = await page.evaluate(async id => globalThis.__h.actorPrepared(globalThis.__k, id), heroId)
    r.currentPrepared = await page.evaluate(async id => globalThis.__h.actorPrepared(globalThis.__k, id), heroId)

    // ---- 真实【库】怪物：导入 → 英雄攻击 → 伤害落到怪物 ----
    const monster = await fightMonster(page, prepared.monster.entry, heroId)
    r.monsterBase = monster.base
    r.monsterBasePrepared = monster.basePrepared
    r.playMonster = monster.play
    r.monsterCurrent = monster.current
    r.monsterCurrentPrepared = monster.currentPrepared

    // ---- 拆分/绑定/保存（正式 KernelSaveService） ----
    const saved = await page.evaluate(async ([heroId, base, current, fireball, monsterId, monsterBase, monsterCurrent]) => {
      const h = globalThis.__h
      const library = h.defaultCampaignLibrary('dnd5e2014', 'cn')
      const captured = await globalThis.__k.call('captureChoices', heroId)
      const choices = captured.result ?? {}
      const compact = await h.compactActor({ lib: h.scoped, library, actor: { id: heroId, name: base.name }, current, base, choices })
      const capturedMonster = await globalThis.__k.call('captureChoices', monsterId)
      const compactMonster = await h.compactActor({
        lib: h.scoped, library, actor: { id: monsterId, name: monsterBase.name },
        current: monsterCurrent, base: monsterBase, choices: capturedMonster.result ?? {},
      })
      const owner = { ownerKey: 'char:p34full.png', ownerLabel: 'P3-4 全链路' }
      const { save } = await h.campaign.startNewCampaign({ ...owner, ruleId: 'dnd5e2014', name: 'P3-4 全链路' })
      const bound = await h.kernelSave.bind(owner.ownerKey, {
        rule: 'dnd5e2014', kernelVersion: 1, library,
        dataVersion: { official: 'old-official', brews: {} }, overrides: [],
        actors: [{ ...compact, adjustments: { note: '玩家备注' }, dice: [3, 1, 4] }, compactMonster],
        revision: 0, undo: [],
      })
      const house = await h.custom.createHouseRule(library, fireball, { mod: { entries: { mode: 'appendArr', items: 'P3-4 房规' } } })
      const checkBefore = await h.kernelSave.check(owner.ownerKey)
      const savedResult = await h.kernelSave.save(owner.ownerKey)
      const slot = await h.campaign.getSave(save.id)
      const fullKernel = JSON.parse(JSON.stringify(bound))
      fullKernel.actors[0].state = { actor: current, items: current.items, effects: current.effects }
      fullKernel.actors[1].state = { actor: monsterCurrent, items: monsterCurrent.items, effects: monsterCurrent.effects }
      return {
        owner, saveId: save.id, compact, compactMonster, house, changed: savedResult.changed,
        checkBefore: { dataVersionChanged: checkBefore.dataVersionChanged, overridesChanged: checkBefore.overridesChanged,
          missing: checkBefore.missing.length, dataVersionChanges: checkBefore.dataVersionChanges, overrideChanges: checkBefore.overrideChanges },
        kernelBytes: JSON.stringify(slot.snapshot.kernel).length,
        oldKernelBytes: JSON.stringify(fullKernel).length,
        compactStateBytes: JSON.stringify(compact.state).length + JSON.stringify(compactMonster.state).length,
        fullActorBytes: JSON.stringify({ actor: current, items: current.items, effects: current.effects }).length
          + JSON.stringify({ actor: monsterCurrent, items: monsterCurrent.items, effects: monsterCurrent.effects }).length,
      }
    }, [heroId, r.base, r.current, prepared.fireball, monster.id, r.monsterBase, r.monsterCurrent])
    r.save = {
      saveId: saved.saveId, changed: saved.changed,
      refs: saved.compact.refs.length + saved.compactMonster.refs.length,
      refHashes: [...saved.compact.refs.map(x => x.hash), ...saved.compactMonster.refs.map(x => x.hash)],
      monsterRefs: saved.compactMonster.refs.length,
      choices: Object.keys(saved.compact.choices).length,
      kernelBytes: saved.kernelBytes, oldKernelBytes: saved.oldKernelBytes,
      compactStateBytes: saved.compactStateBytes, fullActorBytes: saved.fullActorBytes,
    }
    r.checkBefore = saved.checkBefore

    // ---- 关书：全局归类改掉；检查报缺；当前战役不动；loadSave 被 precheck 拦住 ----
    r.closed = await page.evaluate(async owner => {
      const h = globalThis.__h
      const before = await h.campaign.getWorkspace(owner.ownerKey)
      await h.scoped.setAssignment('src:phb', { scopes: ['p34-off'], global: false })
      await h.scoped.setAssignment('src:mm', { scopes: ['p34-off'], global: false })
      const check = await h.kernelSave.checkSave(before.currentSaveId)
      const after = await h.campaign.getWorkspace(owner.ownerKey)
      const refsSurvive = (await h.kernelSave.read(owner.ownerKey)).actors.reduce((n, actor) => n + actor.refs.length, 0)
      const closedLibrary = { ...h.defaultCampaignLibrary('dnd5e2014', 'cn'), exclude: ['src:phb', 'src:mm'] }
      const stored = await h.kernelSave.read(owner.ownerKey)
      const rebuilds = []
      for (const actor of stored.actors) {
        const rebuilt = await h.rebuildActor({ lib: h.scoped, session: globalThis.__k, library: closedLibrary, actor })
        rebuilds.push({ status: rebuilt.status, missing: rebuilt.missing?.length ?? 0 })
      }
      let blocked = null
      try {
        await h.campaign.loadSave(owner, before.currentSaveId, { precheck: async save => {
          const c = await h.kernelSave.checkSave(save.id)
          if (c.missing.length) throw new Error('missing')
        } })
      } catch (e) { blocked = String(e?.message ?? e) }
      return {
        missing: check.missing.map(m => ({ actor: m.actorName, label: m.ref.label, reason: m.reason })),
        checked: check.checked, refsSurvive,
        rebuilds,
        revisionBefore: before.data.kernel.revision, revisionAfter: after.data.kernel.revision, blocked,
      }
    }, saved.owner)

    // ---- 开书：0 缺；读档（带 precheck） ----
    const openResult = await page.evaluate(async owner => {
      const h = globalThis.__h
      await h.scoped.setAssignment('src:phb', null)
      await h.scoped.setAssignment('src:mm', null)
      const saveId = (await h.campaign.getWorkspace(owner.ownerKey)).currentSaveId
      const check = await h.kernelSave.checkSave(saveId)
      const loaded = await h.campaign.loadSave(owner, saveId, { precheck: async save => {
        const c = await h.kernelSave.checkSave(save.id)
        if (c.missing.length) throw new Error('missing')
      } })
      const kernel = await h.kernelSave.read(owner.ownerKey)
      return { missing: check.missing.length, loadedSaveId: loaded.currentSaveId, loadedRevision: kernel.revision, loadedRefs: kernel.actors.reduce((n, actor) => n + actor.refs.length, 0) }
    }, saved.owner)
    r.open = openResult.missing
    r.openDetail = openResult
    r.checkLoaded = openResult.missing

    // ---- 读档后开新小窗，按引用/选择/状态重建 ----
    await page.evaluate(() => globalThis.__k.close())
    const boot2 = await page.evaluate(async kernelInput => {
      const h = globalThis.__h
      const { session, status } = await h.startKernelSession(kernelInput)
      globalThis.__k = session
      return status
    }, kernelInput)
    r.reboot = { system: boot2.system, rules: boot2.rules, api: boot2.plutoniumApi }
    const rebuilt = await page.evaluate(async owner => {
      const h = globalThis.__h
      const kernel = await h.kernelSave.read(owner.ownerKey)
      return h.rebuildActor({ lib: h.scoped, session: globalThis.__k, library: kernel.library, actor: kernel.actors[0] })
    }, saved.owner)
    r.rebuild = { status: rebuilt.status, id: rebuilt.id, missing: rebuilt.missing, error: rebuilt.error, detail: rebuilt.detail }
    if (rebuilt.status !== 'complete') throw new Error(`rebuild failed: ${JSON.stringify(rebuilt).slice(0, 500)}`)
    const rebuiltMonster = await page.evaluate(async owner => {
      const h = globalThis.__h
      const kernel = await h.kernelSave.read(owner.ownerKey)
      return h.rebuildActor({ lib: h.scoped, session: globalThis.__k, library: kernel.library, actor: kernel.actors[1] })
    }, saved.owner)
    r.rebuildMonster = { status: rebuiltMonster.status, id: rebuiltMonster.id, missing: rebuiltMonster.missing, error: rebuiltMonster.error, detail: rebuiltMonster.detail }
    if (rebuiltMonster.status !== 'complete') throw new Error(`monster rebuild failed: ${JSON.stringify(rebuiltMonster).slice(0, 500)}`)
    r.baseDiffs = differences(r.base, rebuilt.base)
    r.patchedDiffs = differences(r.current, rebuilt.data)
    r.monsterBaseDiffs = differences(r.monsterBase, rebuiltMonster.base)
    r.monsterPatchedDiffs = differences(r.monsterCurrent, rebuiltMonster.data)
    r.rebuiltPrepared = await page.evaluate(async id => globalThis.__h.actorPrepared(globalThis.__k, id), rebuilt.id)
    r.rebuiltMonsterPrepared = await page.evaluate(async id => globalThis.__h.actorPrepared(globalThis.__k, id), rebuiltMonster.id)
    r.preparedDiffs = differences(r.currentPrepared, r.rebuiltPrepared)
    r.monsterPreparedDiffs = differences(r.monsterCurrentPrepared, r.rebuiltMonsterPrepared)
    const levelOf = data => (data.items ?? []).filter(i => i.type === 'class').reduce((n, i) => n + (i.system?.levels ?? 0), 0) || data.system?.details?.level || 1
    r.expected = {
      heroHp: r.current.system.attributes.hp.value,
      heroLevel: levelOf(r.current),
      monsterHp: r.monsterCurrent.system.attributes.hp.value,
    }
    r.loadedState = {
      heroHp: r.rebuiltPrepared.attributes.hp.value,
      heroLevel: levelOf(rebuilt.data),
      monsterHp: r.rebuiltMonsterPrepared.attributes.hp.value,
    }

    // ---- 预览/写入/撤销/再写：用重建人物的真实装备改动 ----
    const change = await page.evaluate(async id => {
      const k = globalThis.__k
      const a = await globalThis.__h.actorData(k, id)
      const weapon = a.items.find(i => i.type === 'weapon')
      const result = await k.call('equip', id, weapon._id, true)
      return result.changes
    }, rebuilt.id)
    const writeFlow = await page.evaluate(async ([changes, owner]) => {
      const h = globalThis.__h
      const preview = await h.kernelSave.preview(owner.ownerKey, changes)
      const applied = await h.kernelSave.apply(owner.ownerKey, changes, preview.revision)
      const undone = await h.kernelSave.undo(owner.ownerKey, applied.kernel.revision)
      const reapplied = await h.kernelSave.apply(owner.ownerKey, changes, undone?.kernel.revision ?? applied.kernel.revision)
      return { previewRows: preview.rows.length, appliedRevision: applied.kernel.revision, undoRevision: undone?.kernel.revision, undoRestored: !!undone, reappliedRevision: reapplied.kernel.revision }
    }, [change, saved.owner])
    r.changes = change.length
    r.previewRows = writeFlow.previewRows
    r.appliedRevision = writeFlow.appliedRevision
    r.undo = { revision: writeFlow.undoRevision, restored: writeFlow.undoRestored }
    r.reappliedRevision = writeFlow.reappliedRevision
    r.appliedState = await page.evaluate(async ([heroId, monsterId]) => {
      const h = globalThis.__h
      const k = globalThis.__k
      const hero = await h.actorData(k, heroId)
      const mon = await h.actorData(k, monsterId)
      const level = data => (data.items ?? []).filter(i => i.type === 'class').reduce((n, i) => n + (i.system?.levels ?? 0), 0) || data.system?.details?.level || 1
      return { heroHp: hero.system.attributes.hp.value, heroLevel: level(hero), monsterHp: mon.system.attributes.hp.value }
    }, [rebuilt.id, rebuiltMonster.id])

    // ---- 旧修订：用 0 再写，必须冲突且状态不变 ----
    const stale = await page.evaluate(async ([changes, owner]) => {
      const h = globalThis.__h
      const before = await h.kernelSave.read(owner.ownerKey)
      let code = null
      try { await h.kernelSave.apply(owner.ownerKey, changes, 0) } catch (e) { code = e?.code ?? String(e) }
      const after = await h.kernelSave.read(owner.ownerKey)
      return { code, unchanged: JSON.stringify(before.actors) === JSON.stringify(after.actors) }
    }, [change, saved.owner])
    r.stale = stale.code
    r.staleUnchanged = stale.unchanged

    // ---- 完整备份：真实自制/房规 + 真实存档；清空后恢复 ----
    const backup = await page.evaluate(async ([owner, house]) => {
      const h = globalThis.__h
      const before = await h.service.storedItem(house.house.set, house.house.prop, house.house.hash)
      const bytes = await h.exportSaves({ db: h.userDb, now: Date.now, appVersion: '1.0.0', library: h.backupLibrary }, { type: 'backup' })
      const rec = h.readSaveFile(bytes.bytes)
      await h.custom.deleteHouseRule('cn', house.house, house.uniqueId).catch(() => null)
      await h.userDb.saves.clear()
      await h.userDb.workspaces.clear()
      const restored = await h.importSaves({ db: h.userDb, campaign: h.campaign, now: Date.now, hasRule: id => id === 'dnd5e2014',
        library: h.backupLibrary, checkRefs: refs => h.scoped.fetch(h.defaultCampaignLibrary('dnd5e2014', 'cn'), refs) },
      rec, { owner, selectedIds: rec.saves.map(s => s.id), mode: 'merge' })
      const workspace = await h.kernelSave.read(owner.ownerKey)
      const after = await h.service.storedItem(house.house.set, house.house.prop, house.house.hash)
      const parsed = await h.service.parsed('cn-brew', house.house.prop).catch(() => null)
      return { dependencies: rec.manifest.dependencies.length, kernelVersions: rec.manifest.kernelVersions.length,
        libraryFiles: Object.keys(rec.libraryFiles).length, library: restored.library, missing: restored.missing.length,
        missingRefs: restored.missing.map(m => ({ set: m.ref.set, prop: m.ref.prop, hash: m.ref.hash, reason: m.reason })),
        houseBefore: !!before, houseAfter: !!after, houseHash: house.house.hash,
        parsedHasHouse: parsed ? parsed.hashes.includes(house.house.hash) : null,
        parsedSample: parsed ? parsed.hashes.filter(h => String(h).includes('trpghouse')).slice(0, 5) : null,
        workspace: !!workspace }
    }, [saved.owner, saved.house])
    r.backup = { dependencies: backup.dependencies, kernelVersions: backup.kernelVersions, libraryFiles: backup.libraryFiles }
    r.restored = { library: backup.library, missing: backup.missing, workspace: backup.workspace }
    r.backupDebug = { missingRefs: backup.missingRefs, houseBefore: backup.houseBefore, houseAfter: backup.houseAfter, houseHash: backup.houseHash, parsedHasHouse: backup.parsedHasHouse, parsedSample: backup.parsedSample }

    r.errors = errors
    r.unexplained = errors.filter((e) => !knownError(e))
    r.passed = r.build.status === 'complete'
      && r.choiceSteps.every(x => x.chosen.length > 0)
      && r.save.kernelBytes < r.save.oldKernelBytes
      && r.save.compactStateBytes < r.save.fullActorBytes
      && r.checkBefore.dataVersionChanged && r.checkBefore.overridesChanged
      && r.closed.missing.length > 0 && r.closed.missing.length === r.save.refs
      && r.closed.refsSurvive === r.save.refs
      && r.closed.rebuilds.every(x => x.status === 'missing' && x.missing > 0)
      && r.closed.revisionBefore === r.closed.revisionAfter && r.closed.blocked !== null
      && r.open === 0 && r.openDetail.loadedSaveId === r.save.saveId && r.openDetail.loadedRefs === r.save.refs
      && r.rebuild.status === 'complete' && r.rebuildMonster.status === 'complete'
      && r.baseDiffs.length === 0 && r.patchedDiffs.length === 0
      && r.monsterBaseDiffs.length === 0 && r.monsterPatchedDiffs.length === 0
      && r.preparedDiffs.length === 0 && r.monsterPreparedDiffs.length === 0
      && r.appliedState.heroHp === r.expected.heroHp && r.appliedState.heroLevel === r.expected.heroLevel
      && r.appliedState.monsterHp === r.expected.monsterHp
      && r.loadedState.heroHp === r.expected.heroHp && r.loadedState.heroLevel === r.expected.heroLevel
      && r.loadedState.monsterHp === r.expected.monsterHp
      && r.appliedRevision === 1 && r.undo.restored && r.reappliedRevision === 3
      && r.stale === 'E_REVISION_CONFLICT' && r.staleUnchanged
      && r.backup.libraryFiles >= 3 && (r.restored.library?.brews ?? 0) > 0 && (r.restored.library?.houseRules ?? 0) > 0 && r.restored.workspace && r.restored.missing === 0
      && r.unexplained.length === 0
  } catch (e) {
    r.fatal = e.stack ?? String(e)
    r.passed = false
    r.errors = errors
  } finally {
    results.push(r)
    const payload = { engine: name, out: r, passed: r.passed, errors: r.errors ?? [], unexplained: r.unexplained ?? [] }
    await writeFile(`${work}/p3-4-full-${name}.json`, JSON.stringify(payload, null, 2))
    console.log(name, r.passed ? 'PASS' : 'FAIL', JSON.stringify({
      build: r.build, save: r.save, closed: r.closed && { missing: r.closed.missing.length, for: r.closed.missing.slice(0, 2), rev: [r.closed.revisionBefore, r.closed.revisionAfter], refs: r.closed.refsSurvive, blocked: r.closed.blocked },
      open: r.open, rebuild: r.rebuild, rebuildMonster: r.rebuildMonster,
      diffs: [r.baseDiffs?.length, r.patchedDiffs?.length, r.monsterBaseDiffs?.length, r.monsterPatchedDiffs?.length, r.preparedDiffs?.length, r.monsterPreparedDiffs?.length],
      hp: { expected: r.expected, applied: r.appliedState, loaded: r.loadedState },
      monsterHp: [r.monsterBase?.system?.attributes?.hp?.value, r.monsterCurrent?.system?.attributes?.hp?.value],
      write: [r.appliedRevision, r.undo?.revision, r.reappliedRevision], stale: r.stale,
      backup: r.backup && { files: r.backup.libraryFiles, brews: r.restored?.library?.brews, houseRules: r.restored?.library?.houseRules, missing: r.restored?.missing, debug: r.backupDebug },
      fatal: r.fatal?.slice(0, 500), unexplained: r.unexplained,
    }))
    await ctx.close()
    server.close()
  }
}
process.exit(results.every(r => r.passed) ? 0 : 1)
