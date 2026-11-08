// P3-3b 完整链路（Chrome / WebKit）：
// 真实【库】条目 → 结算小窗建卡 → 打一场 → 拆成引用/选择/状态差别 → 存
// → 关书（全局归类改掉）→ 读前检查报缺、当前战役不动 → 开书 → 读档 → 重建人物逐项比 0 差别。
// 不手填引用/HP/法术位，不写死条目数量；人物全部用【库】真实条目建。
import { mkdir, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
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

const vendor = join(root, 'vendor/foundry')
const readJson = async path => JSON.parse(await (await import('node:fs/promises')).readFile(join(vendor, path), 'utf8'))
const manifest = await readJson('manifest.json')
const system = await readJson('systems/dnd5e/system.json')
const modules = [await readJson('modules/lib-wrapper/module.json'), await readJson('modules/plutonium/module.json')]
const kernelInput = {
  system, modules, release: manifest.release,
  world: { id: 'p3-3b-full', title: 'P3-3b full' },
  userId: 'kernelGM00000000', worldTime: 0, language: 'en.core',
  settings: { 'dnd5e.rulesVersion': 'legacy', 'dnd5e.firstRun': false },
  documents: { actors: [] },
}

function differences(a, b, path = '', out = []) {
  if (out.length > 40) return out
  if (a === b) return out
  const ta = a === null ? 'null' : Array.isArray(a) ? 'array' : typeof a
  const tb = b === null ? 'null' : Array.isArray(b) ? 'array' : typeof b
  if (ta !== tb) { out.push({ path, expected: a, actual: b }); return out }
  if (ta === 'object') {
    for (const key of new Set([...Object.keys(a), ...Object.keys(b)])) differences(a[key], b[key], path ? `${path}.${key}` : key, out)
    return out
  }
  if (ta === 'array') {
    if (a.length !== b.length) { out.push({ path: `${path}.length`, expected: a.length, actual: b.length }); return out }
    for (let i = 0; i < a.length; i++) differences(a[i], b[i], `${path}[${i}]`, out)
    return out
  }
  out.push({ path, expected: a, actual: b })
  return out
}

function kernelFrame(page) {
  return page.frames().filter(f => f.url().includes('/vendor/foundry/frame.html')).at(-1)
}

const engines = [
  ['chrome', chromium, { executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true }],
  ['webkit', webkit, { headless: true }],
]

const results = []
for (const [name, type, options] of engines) {
  if (process.env.ENGINE && process.env.ENGINE !== name) continue
  const { server, url } = await startStatic({ port: 47336 })
  const profile = join(work, `profile-p3-1-${name}`)
  const ctx = await type.launchPersistentContext(profile, { ...options, viewport: { width: 1280, height: 800 } })
  const page = await ctx.newPage()
  page.setDefaultTimeout(3_600_000)
  const errors = []
  page.on('pageerror', e => errors.push(e.stack ?? String(e)))
  page.on('console', m => { if (m.type() === 'error') errors.push(`console: ${m.text()}`) })
  const r = { engine: name }
  try {
    await page.goto(url)
    const prepared = await page.evaluate(async ([kernelInput, heroClass]) => {
      const h = await import('/work/e2e-lib/harness.js')
      for (const id of ['cn-official', 'en-official']) {
        const audit = await h.offlineAudit(id)
        if (audit.set?.status !== 'installed' || audit.ok !== audit.planFiles) await h.install(id)
      }
      h.service.reset()
      await h.scoped.setAssignment('src:phb', null)
      await h.scoped.setAssignment('src:mm', null)
      const library = h.defaultCampaignLibrary('dnd5e2014', 'cn')
      const take = async (prop, filter) => {
        const p = await h.service.parsed('cn-official', prop)
        for (let i = 0; i < p.items.length; i++) {
          const item = p.items[i]
          if (p.sources[i] !== 'PHB' || !filter(item)) continue
          const ref = { set: 'cn-official', prop, hash: p.hashes[i] }
          const d = await h.scoped.detail(library, ref)
          if (!d || d.hidden || !d.english || d.english.status !== 'found') continue
          return { ref, label: item.name, entry: d.english.item }
        }
        throw new Error(`no PHB entry with English pair for ${prop}`)
      }
      const plan = {
        race: await take('race', it => !!it.size && !String(it.name).includes('(')),
        background: await take('background', it => !!it.skillProficiencies || !!it.entries),
        class: await take('class', heroClass === 'cleric' ? it => it.name === '牧师' : it => !!it.hd),
        weapon: await take('item', it => it.weaponCategory === 'martial' || it.type === 'M'),
        spell: await take('spell', it => it.level === 0),
      }
      const monster = await (async () => {
        const p = await h.service.parsed('cn-official', 'monster')
        let fallback = null
        for (let i = 0; i < p.items.length; i++) {
          const item = p.items[i]
          if (p.sources[i] !== 'MM' || !item.name) continue
          const ref = { set: 'cn-official', prop: 'monster', hash: p.hashes[i] }
          const d = await h.scoped.detail(library, ref)
          if (!d || d.hidden || !d.english || d.english.status !== 'found') continue
          const row = { ref, label: item.name, entry: d.english.item }
          if (item.name === 'Goblin') return row
          fallback ??= row
        }
        if (!fallback) throw new Error('no MM monster with English pair')
        return fallback
      })()
      const { session, status } = await h.startKernelSession(kernelInput)
      globalThis.__k = session
      globalThis.__h = h
      return {
        plan: Object.fromEntries(Object.entries(plan).map(([k, v]) => [k, { ref: v.ref, label: v.label, entry: v.entry }])),
        monster,
        boot: { system: status.system, rules: status.rules, api: status.plutoniumApi },
      }
    }, [kernelInput, process.env.HERO_CLASS ?? ''])
    r.plan = Object.fromEntries(Object.entries(prepared.plan).map(([k, v]) => [k, { ref: v.ref, label: v.label }]))
    r.planMonster = { ref: prepared.monster.ref, label: prepared.monster.label }
    r.boot = prepared.boot

    // 在结算小窗里导入英文对照条目，拿 dnd5e 物品数据；再走正式 buildCharacter。
    const imported = await kernelFrame(page).evaluate(async plan => {
      const g = globalThis
      const api = g.game.modules.get('plutonium')?.api
      const out = {}
      for (const [key, row] of Object.entries(plan)) {
        const prop = row.ref.prop
        const importer = await api.importer.pGetImporter({ prop })
        const opts = new api.importer.ImportOpts({ isTemp: true })
        const summary = prop === 'class' && importer.pImportEntryClass
          ? await importer.pImportEntryClass(row.entry, opts)
          : await importer.pImportEntry(row.entry, opts)
        const doc = summary?.imported?.[0]?.document ?? null
        if (!doc) throw new Error(`import failed for ${key}`)
        out[key] = doc.toObject ? doc.toObject() : doc
      }
      return out
    }, prepared.plan)

    const built = await page.evaluate(async imported => {
      const k = globalThis.__k
      return k.call('buildCharacter', 'P3-3b 全链路', ['race', 'background', 'class'].map(key => imported[key]), ['weapon', 'spell'].map(key => imported[key]))
    }, imported)
    r.build = { status: built.status, id: built.result?.id, level: built.result?.level, items: built.result?.items, error: built.error }
    if (built.status !== 'complete') throw new Error(`build failed: ${JSON.stringify(built).slice(0, 500)}`)
    const heroId = built.result.id

    r.base = await page.evaluate(async id => globalThis.__h.actorData(globalThis.__k, id), heroId)
    r.basePrepared = await page.evaluate(async id => globalThis.__h.actorPrepared(globalThis.__k, id), heroId)
    r.play = await page.evaluate(async id => {
      const k = globalThis.__k
      const a = await globalThis.__h.actorData(k, id)
      const weapon = a.items.find(i => i.type === 'weapon')
      const attack = await k.call('attack', id, weapon._id, [20, 4, 4, 4, 4, 4, 4, 4])
      const total = attack.result?.damage?.[0]?.total ?? null
      if (!total) throw new Error('attack produced no damage')
      const damage = await k.call('damage', id, [{ value: total, type: weapon.system?.damage?.base?.types?.[0] ?? 'slashing' }], [], {})
      const equip = await k.call('equip', id, weapon._id, false)
      return { attack: attack.status, damage: damage.status, equip: equip.status, total }
    }, heroId)
    r.current = await page.evaluate(async id => globalThis.__h.actorData(globalThis.__k, id), heroId)
    r.currentPrepared = await page.evaluate(async id => globalThis.__h.actorPrepared(globalThis.__k, id), heroId)

    // 真实【库】怪物：导入 → 英雄攻击 → 伤害落到怪物。
    const monster = await page.evaluate(async entry => {
      const k = globalThis.__k
      const result = await k.call('importMonsterActor', entry)
      const data = await globalThis.__h.actorData(k, result.result?.id)
      return { status: result.status, id: result.result?.id, data, summary: result.result }
    }, prepared.monster.entry)
    if (monster.status !== 'complete' || !monster.id) throw new Error(`monster import failed: ${JSON.stringify(monster).slice(0, 600)}`)
    r.monsterBase = monster.data
    r.monsterBasePrepared = await page.evaluate(async id => globalThis.__h.actorPrepared(globalThis.__k, id), monster.id)
    r.playMonster = await page.evaluate(async ([heroId, monsterId]) => {
      const k = globalThis.__k
      const a = await globalThis.__h.actorData(k, heroId)
      const weapon = a.items.find(i => i.type === 'weapon')
      const attack = await k.call('attack', heroId, weapon._id, [20, 4, 4, 4, 4, 4, 4, 4])
      const total = attack.result?.damage?.[0]?.total ?? null
      if (!total) throw new Error('attack produced no damage')
      const damage = await k.call('damage', monsterId, [{ value: total, type: weapon.system?.damage?.base?.types?.[0] ?? 'slashing' }], [], {})
      return { attack: attack.status, damage: damage.status, total }
    }, [heroId, monster.id])
    r.monsterCurrent = await page.evaluate(async id => globalThis.__h.actorData(globalThis.__k, id), monster.id)
    r.monsterCurrentPrepared = await page.evaluate(async id => globalThis.__h.actorPrepared(globalThis.__k, id), monster.id)

    // 拆分 + 绑定 + 保存（正式代码）。
    const saved = await page.evaluate(async ([heroId, base, current, monsterId, monsterBase, monsterCurrent]) => {
      const h = globalThis.__h
      const library = h.defaultCampaignLibrary('dnd5e2014', 'cn')
      const actor = { id: heroId, name: base.name }
      const captured = await globalThis.__k.call('captureChoices', heroId)
      const choices = captured.result ?? {}
      const compact = await h.compactActor({ lib: h.scoped, library, actor, current, base, choices })
      const capturedMonster = await globalThis.__k.call('captureChoices', monsterId)
      const compactMonster = await h.compactActor({
        lib: h.scoped, library, actor: { id: monsterId, name: monsterBase.name },
        current: monsterCurrent, base: monsterBase, choices: capturedMonster.result ?? {},
      })
      await h.userDb.workspaces.clear()
      await h.userDb.saves.clear()
      const owner = { ownerKey: 'char:p33b-full.png', ownerLabel: 'P3-3b 全链路' }
      const { save } = await h.campaign.startNewCampaign({ ...owner, ruleId: 'dnd5e2014', name: 'P3-3b 全链路' })
      const bound = await h.kernelSave.bind(owner.ownerKey, {
        rule: 'dnd5e2014', kernelVersion: 1, library,
        dataVersion: { official: 'old-version', brews: {} }, overrides: [],
        actors: [{ ...compact, adjustments: { note: '玩家备注' }, dice: [3, 1, 4] }, compactMonster],
        revision: 0, undo: [],
      })
      const savedResult = await h.kernelSave.save(owner.ownerKey)
      const slot = await h.campaign.getSave(save.id)
      const fullKernel = JSON.parse(JSON.stringify(bound))
      fullKernel.actors[0].state = { actor: current, items: current.items, effects: current.effects }
      fullKernel.actors[1].state = { actor: monsterCurrent, items: monsterCurrent.items, effects: monsterCurrent.effects }
      return {
        owner, saveId: save.id, compact, compactMonster, boundRevision: bound.revision, changed: savedResult.changed,
        capture: { status: captured.status, error: captured.error, keys: Object.keys(choices) },
        kernelBytes: JSON.stringify(slot.snapshot.kernel).length,
        oldKernelBytes: JSON.stringify(fullKernel).length,
        compactStateBytes: JSON.stringify(compact.state).length + JSON.stringify(compactMonster.state).length,
        fullActorBytes: JSON.stringify({ actor: current, items: current.items, effects: current.effects }).length
          + JSON.stringify({ actor: monsterCurrent, items: monsterCurrent.items, effects: monsterCurrent.effects }).length,
        savedVersion: slot.snapshot.kernel.dataVersion,
      }
    }, [heroId, r.base, r.current, monster.id, r.monsterBase, r.monsterCurrent])
    r.save = {
      saveId: saved.saveId, changed: saved.changed, boundRevision: saved.boundRevision,
      capture: saved.capture,
      kernelBytes: saved.kernelBytes, oldKernelBytes: saved.oldKernelBytes,
      compactStateBytes: saved.compactStateBytes, fullActorBytes: saved.fullActorBytes,
      savedVersion: saved.savedVersion,
      refs: saved.compact.refs.length + saved.compactMonster.refs.length,
      refHashes: [...saved.compact.refs.map(x => x.hash), ...saved.compactMonster.refs.map(x => x.hash)],
      monsterRefs: saved.compactMonster.refs.length,
      monsterRefHashes: saved.compactMonster.refs.map(x => x.hash),
      choices: Object.keys(saved.compact.choices).length,
    }

    // 关书：改全局归类（PHB 不再属于 2014）；读前检查报缺；当前战役不动。
    r.closed = await page.evaluate(async owner => {
      const h = globalThis.__h
      const before = await h.campaign.getWorkspace(owner.ownerKey)
      await h.scoped.setAssignment('src:phb', { scopes: ['p33b-off'], global: false })
      await h.scoped.setAssignment('src:mm', { scopes: ['p33b-off'], global: false })
      const check = await h.kernelSave.checkSave((await h.campaign.getWorkspace(owner.ownerKey)).currentSaveId)
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
        await h.campaign.loadSave(owner, after.currentSaveId, { precheck: async save => {
          const c = await h.kernelSave.checkSave(save.id)
          if (c.missing.length) throw new Error('missing')
        } })
      } catch (e) { blocked = String(e?.message ?? e) }
      return {
        missing: check.missing.map(m => ({ actor: m.actorName, label: m.ref.label, reason: m.reason })),
        checked: check.checked,
        revisionBefore: before.data.kernel.revision,
        revisionAfter: after.data.kernel.revision,
        refsSurvive,
        rebuilds,
        blocked,
      }
    }, saved.owner)

    // 开书：归类恢复；读前检查 0 缺；读档（带 precheck）→ 切换。
    r.open = await page.evaluate(async owner => {
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
      return { missing: check.missing.length, loadedSaveId: loaded.currentSaveId, loadedRevision: kernel.revision, actorRefs: kernel.actors[0].refs.length }
    }, saved.owner)

    // 读档后开新小窗，按引用/选择/状态重建；和存档前逐项比。
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
      const library = kernel.library
      return h.rebuildActor({ lib: h.scoped, session: globalThis.__k, library, actor: kernel.actors[0] })
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
    r.rebuiltPrepared = await page.evaluate(async id => globalThis.__h.actorPrepared(globalThis.__k, id), rebuilt.id)
    r.rebuiltMonsterPrepared = await page.evaluate(async id => globalThis.__h.actorPrepared(globalThis.__k, id), rebuiltMonster.id)
    r.baseDiffs = differences(r.base, rebuilt.base)
    r.patchedDiffs = differences(r.current, rebuilt.data)
    r.monsterBaseDiffs = differences(r.monsterBase, rebuiltMonster.base)
    r.monsterPatchedDiffs = differences(r.monsterCurrent, rebuiltMonster.data)
    r.preparedDiffs = differences(r.currentPrepared, r.rebuiltPrepared)
    r.monsterPreparedDiffs = differences(r.monsterCurrentPrepared, r.rebuiltMonsterPrepared)
    const known = (e) => e.includes('gendata-nav-adventure-book-index.json')
      || e.includes('/vendor/foundry/api/plutonium')
      || e.includes('status of 404')
      || e.includes('requires usable window dimensions')
      || e.includes('KERNEL_NEEDS_INPUT')
      || e.includes('Failed to place measured template')
    r.errors = errors
    r.unexplained = errors.filter((e) => !known(e))
    r.passed = r.build.status === 'complete'
      && r.save.kernelBytes < r.save.oldKernelBytes
      && r.save.compactStateBytes < r.save.fullActorBytes
      && r.closed.missing.length > 0
      && r.closed.missing.length === r.save.refs
      && r.closed.missing.every(m => m.reason === 'out-of-scope' || m.reason === 'excluded' || m.reason === 'not-found' || m.reason === 'not-installed')
      && r.closed.revisionBefore === r.closed.revisionAfter
      && r.closed.refsSurvive === r.save.refs
      && r.closed.rebuilds.every(x => x.status === 'missing' && x.missing > 0)
      && r.closed.blocked !== null
      && r.open.missing === 0
      && r.open.loadedSaveId === r.save.saveId
      && r.rebuild.status === 'complete' && r.rebuildMonster.status === 'complete'
      && r.baseDiffs.length === 0 && r.patchedDiffs.length === 0
      && r.monsterBaseDiffs.length === 0 && r.monsterPatchedDiffs.length === 0
      && r.preparedDiffs.length === 0 && r.monsterPreparedDiffs.length === 0
      && r.unexplained.length === 0
  } catch (e) { r.fatal = e.stack ?? String(e); r.passed = false; r.errors = errors } finally {
    results.push(r)
    await writeFile(`${work}/p3-3b-full-${name}.json`, JSON.stringify(r, null, 2))
    console.log(name, r.passed ? 'PASS' : 'FAIL', JSON.stringify({
      build: r.build, save: r.save, closed: r.closed && { missing: r.closed.missing.length, for: r.closed.missing.slice(0, 2), rev: [r.closed.revisionBefore, r.closed.revisionAfter], refs: r.closed.refsSurvive, blocked: r.closed.blocked },
      open: r.open, rebuild: r.rebuild, rebuildMonster: r.rebuildMonster,
      diffs: [r.baseDiffs?.length, r.patchedDiffs?.length, r.monsterBaseDiffs?.length, r.monsterPatchedDiffs?.length, r.preparedDiffs?.length, r.monsterPreparedDiffs?.length],
      playMonster: r.playMonster, monsterHp: [r.monsterBase?.system?.attributes?.hp?.value, r.monsterCurrent?.system?.attributes?.hp?.value],
      fatal: r.fatal?.slice(0, 500), errors: r.errors?.slice(0, 3),
    }))
    await ctx.close()
    server.close()
  }
}
process.exit(results.every(r => r.passed) ? 0 : 1)
