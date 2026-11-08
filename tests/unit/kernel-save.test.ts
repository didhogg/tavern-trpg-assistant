import { describe, expect, it } from 'vitest'
import { KernelSaveService, type KernelRefChecker } from '../../src/core/saves/kernel'
import { defaultCampaignLibrary, entryUnit } from '../../src/library/scopes'
import { kernelCampaignSchema, type KernelActorState, type KernelCampaign, type KernelChange } from '../../src/schemas/kernel'
import { SCHEMA_VERSIONS } from '../../src/schemas/common'
import { RuleRegistry } from '../../src/rules/registry'
import { TrpgError } from '../../src/core/errors'
import { OWNER, setup } from '../helpers/harness'
import { makeRegistry, withDb } from '../helpers/fixtures'

const REF = { set: 'en-official', prop: 'spell', hash: 'fireball' }
const NEW = { ...OWNER, ruleId: 'dnd5e2014', name: 'P3-3 测试' }

function campaign(): KernelCampaign {
  return kernelCampaignSchema.parse({
    rule: 'dnd5e2014',
    kernelVersion: 1,
    library: defaultCampaignLibrary('dnd5e2014', 'en'),
    dataVersion: { official: '1.0', brews: {} },
    actors: [{
      id: 'actor1', name: '测试角色',
      refs: [{ kind: 'spell', ...REF, label: '火球术' }],
      choices: { prepared: ['fireball'] },
      state: { actor: { system: { attributes: { hp: { value: 10 } } } }, items: {}, effects: {} },
      adjustments: { note: '玩家自己的备注' },
      dice: [3, 1],
    }],
    revision: 0,
    undo: [],
  })
}

async function code(promise: Promise<unknown>): Promise<string> {
  try { await promise } catch (error) {
    expect(error).toBeInstanceOf(TrpgError)
    return (error as TrpgError).code
  }
  throw new Error('应当抛出错误')
}

function hp(kernel: KernelCampaign): unknown {
  return (kernel.actors[0].state.actor as { system?: { attributes?: { hp?: { value?: number } } } })?.system?.attributes?.hp?.value
}

describe('P3-3 存档内核段', () => {
  it('绑定规则、保存、关书报缺、开书恢复、读档不丢引用与状态', async () => {
    await withDb(async (db) => {
      const { campaign: service, clock } = await setup(db)
      const { save } = await service.startNewCampaign(NEW)
      const closed = new Set<string>()
      const checker: KernelRefChecker = async (refs, library) => refs.map((ref) => {
        if (closed.has(ref.hash)) return { ok: false, ref, reason: 'not-installed' }
        if (library.exclude.includes(entryUnit(ref))) return { ok: false, ref, reason: 'excluded' }
        return { ok: true, ref }
      })
      const kernel = new KernelSaveService({ db, campaign: service, rules: makeRegistry(), now: clock, checkRefs: checker })
      await kernel.bind(OWNER.ownerKey, campaign())
      await service.saveCurrent(OWNER.ownerKey)
      expect((await service.getSave(save.id))?.snapshot.kernel).toMatchObject({ rule: 'dnd5e2014', revision: 0 })

      expect((await kernel.check(OWNER.ownerKey)).missing).toEqual([])
      const closedLibrary = defaultCampaignLibrary('dnd5e2014', 'en')
      closedLibrary.exclude = [entryUnit(REF)]
      await kernel.setLibrary(OWNER.ownerKey, closedLibrary)
      const missing = await kernel.check(OWNER.ownerKey)
      expect(missing.missing).toMatchObject([{ actorId: 'actor1', actorName: '测试角色', reason: 'excluded', ref: { label: '火球术' } }])
      expect((await kernel.read(OWNER.ownerKey))?.actors[0].refs[0].hash).toBe('fireball')

      await kernel.setLibrary(OWNER.ownerKey, defaultCampaignLibrary('dnd5e2014', 'en'))
      expect((await kernel.check(OWNER.ownerKey)).missing).toEqual([])

      closed.add('fireball')
      expect((await kernel.check(OWNER.ownerKey)).missing[0]).toMatchObject({ reason: 'not-installed' })
      closed.delete('fireball')
      expect((await kernel.check(OWNER.ownerKey)).missing).toEqual([])

      await service.loadSave(OWNER, save.id)
      expect((await kernel.check(OWNER.ownerKey)).missing).toEqual([])
      const loaded = await kernel.read(OWNER.ownerKey)
      expect(loaded?.actors[0]).toMatchObject({ id: 'actor1', choices: { prepared: ['fireball'] }, adjustments: { note: '玩家自己的备注' }, dice: [3, 1] })
      expect(hp(loaded!)).toBe(10)
    })
  })

  it('规则绑定校验、规则缺失报告、修订号冲突与撤销', async () => {
    await withDb(async (db) => {
      const { campaign: service, clock } = await setup(db)
      await service.startNewCampaign(NEW)
      const checker: KernelRefChecker = async (refs) => refs.map((ref) => ({ ok: true, ref }))
      const kernel = new KernelSaveService({ db, campaign: service, rules: makeRegistry(), now: clock, checkRefs: checker })
      await kernel.bind(OWNER.ownerKey, campaign())
      expect(await code(kernel.bind(OWNER.ownerKey, { ...campaign(), rule: 'coc7' }))).toBe('E_RULE_MISMATCH')

      const emptyRules = new KernelSaveService({ db, campaign: service, rules: new RuleRegistry(), now: clock, checkRefs: checker })
      expect((await emptyRules.check(OWNER.ownerKey)).ruleMissing).toBe(true)

      const change: KernelChange = { action: 'update', type: 'Actor', pack: null, parentUuid: 'Actor.actor1',
        data: { system: { attributes: { hp: { value: 5 } } } } }
      const preview = await kernel.preview(OWNER.ownerKey, [change])
      expect(preview.rows[0]).toMatchObject({ actorId: 'actor1', actorName: '测试角色' })
      expect(hp({ ...campaign(), actors: [{ ...campaign().actors[0], state: preview.rows[0].before as KernelActorState }] })).toBe(10)

      const applied = await kernel.apply(OWNER.ownerKey, [change], preview.revision)
      expect(applied.kernel.revision).toBe(1)
      expect(hp(applied.kernel)).toBe(5)
      expect(await code(kernel.apply(OWNER.ownerKey, [change], preview.revision))).toBe('E_REVISION_CONFLICT')

      const undone = await kernel.undo(OWNER.ownerKey, applied.kernel.revision)
      expect(undone?.kernel.revision).toBe(2)
      expect(hp(undone!.kernel)).toBe(10)
      expect(await kernel.undo(OWNER.ownerKey, undone!.kernel.revision)).toBeNull()
    })
  })

  it('数据版本变了会报告，但引用和状态不动', async () => {
    await withDb(async (db) => {
      const { campaign: service, clock } = await setup(db)
      await service.startNewCampaign(NEW)
      const checker: KernelRefChecker = async (refs) => refs.map((ref) => ({ ok: true, ref }))
      const kernel = new KernelSaveService({ db, campaign: service, rules: makeRegistry(), now: clock, checkRefs: checker,
        currentVersion: () => ({ official: '2.0', brews: {} }) })
      await kernel.bind(OWNER.ownerKey, campaign())
      const check = await kernel.check(OWNER.ownerKey)
      expect(check.dataVersionChanged).toBe(true)
      expect(check.dataVersion).toEqual({ official: '1.0', brews: {} })
      expect((await kernel.read(OWNER.ownerKey))?.actors[0].refs).toHaveLength(1)
    })
  })

  it('版本/覆盖差异逐项列出；保留原样不写；采用现在的走 branch', async () => {
    await withDb(async (db) => {
      const { campaign: service, clock } = await setup(db)
      const { save } = await service.startNewCampaign(NEW)
      const checker: KernelRefChecker = async (refs) => refs.map((ref) => ({ ok: true, ref }))
      const base = campaign()
      const override = {
        target: { kind: 'entry', ...REF },
        house: { kind: 'houserule', set: 'cn-brew', prop: 'spell', hash: 'house-1' },
        digest: 'digest-1',
      }
      const bound = { ...base, overrides: [override], dataVersion: { official: '1.0', brews: { 'brew-a': 'a1' } } }
      const kernel = new KernelSaveService({ db, campaign: service, rules: makeRegistry(), now: clock, checkRefs: checker })
      await kernel.bind(OWNER.ownerKey, bound)
      await service.saveCurrent(OWNER.ownerKey)
      const changed = new KernelSaveService({ db, campaign: service, rules: makeRegistry(), now: clock, checkRefs: checker,
        currentVersion: () => ({ official: '2.0', brews: { 'brew-a': 'a2', 'brew-b': 'b1' } }),
        currentOverrides: async () => [{ ...override, digest: 'digest-2' }] })
      const check = await changed.check(OWNER.ownerKey)
      expect(check.dataVersionChanged).toBe(true)
      expect(check.dataVersionChanges.official).toEqual({ before: '1.0', after: '2.0' })
      expect(check.dataVersionChanges.brews).toEqual([
        { id: 'brew-a', before: 'a1', after: 'a2', change: 'changed' },
        { id: 'brew-b', before: null, after: 'b1', change: 'added' },
      ])
      expect(check.overridesChanged).toBe(true)
      expect(check.overrideChanges).toMatchObject([{ change: 'changed', before: 'digest-1', after: 'digest-2' }])
      const kept = await changed.keepSaved(OWNER.ownerKey)
      expect(kept.overrides[0].digest).toBe('digest-1')
      const adopted = await changed.adoptCurrent(OWNER.ownerKey)
      expect(adopted.kernel.revision).toBe(1)
      expect(adopted.kernel.dataVersion.official).toBe('2.0')
      expect(adopted.kernel.overrides[0].digest).toBe('digest-2')
      expect(adopted.save.branchedFrom).toBe(save.id)
      expect(adopted.save.snapshot.kernel).toMatchObject({ dataVersion: { official: '2.0' } })
    })
  })

  it('存档结构太新 / 规则没装：不覆盖当前战役，原文件保留', async () => {
    await withDb(async (db) => {
      const { campaign: service } = await setup(db)
      const { save } = await service.startNewCampaign(NEW)
      const before = await service.getWorkspace(OWNER.ownerKey)
      await db.saves.put({ ...save, schemaVersion: SCHEMA_VERSIONS.save + 1 })
      expect(await code(service.loadSave(OWNER, save.id))).toBe('E_NEWER_DATA')
      expect(await db.saves.get(save.id)).toBeTruthy()
      expect((await service.getWorkspace(OWNER.ownerKey))?.currentSaveId).toBe(before?.currentSaveId)

      const other = { ...save, id: 'save-coc7', ruleId: 'coc7' }
      await db.saves.put(other)
      expect(await code(service.loadSave(OWNER, 'save-coc7'))).toBe('E_RULE_MISSING')
      expect(await db.saves.get('save-coc7')).toBeTruthy()
      expect((await service.getWorkspace(OWNER.ownerKey))?.currentSaveId).toBe(before?.currentSaveId)
    })
  })

  it('保存前现取版本记号与覆盖', async () => {
    await withDb(async (db) => {
      const { campaign: service, clock } = await setup(db)
      const { save } = await service.startNewCampaign(NEW)
      const checker: KernelRefChecker = async (refs) => refs.map((ref) => ({ ok: true, ref }))
      const kernel = new KernelSaveService({
        db, campaign: service, rules: makeRegistry(), now: clock, checkRefs: checker,
        currentVersion: () => ({ official: '2.0', brews: { 'brew-b': 'b2' } }),
        currentOverrides: async () => [{ target: { kind: 'entry', ...REF }, house: { kind: 'houserule', set: 'cn-brew', prop: 'spell', hash: 'h2' }, digest: 'd2' }],
      })
      await kernel.bind(OWNER.ownerKey, campaign())
      await service.saveCurrent(OWNER.ownerKey)
      expect(((await service.getSave(save.id))?.snapshot.kernel as KernelCampaign).dataVersion.official).toBe('1.0')
      const result = await kernel.save(OWNER.ownerKey)
      expect(result.changed).toBe(true)
      const saved = (await service.getSave(save.id))?.snapshot.kernel as KernelCampaign
      expect(saved.dataVersion).toEqual({ official: '2.0', brews: { 'brew-b': 'b2' } })
      expect(saved.overrides).toMatchObject([{ digest: 'd2' }])
    })
  })

  it('读档前检查存档槽：只看存档，不动当前战役；precheck 抛错不自动存档/切换', async () => {
    await withDb(async (db) => {
      const { campaign: service, clock } = await setup(db)
      const { save } = await service.startNewCampaign(NEW)
      const checker: KernelRefChecker = async (refs, library) => refs.map((ref) => {
        if (library.exclude.includes(entryUnit(ref))) return { ok: false, ref, reason: 'excluded' }
        return { ok: true, ref }
      })
      const kernel = new KernelSaveService({ db, campaign: service, rules: makeRegistry(), now: clock, checkRefs: checker })
      await kernel.bind(OWNER.ownerKey, campaign())
      await kernel.save(OWNER.ownerKey)

      const closed = defaultCampaignLibrary('dnd5e2014', 'en')
      closed.exclude = [entryUnit(REF)]
      await kernel.setLibrary(OWNER.ownerKey, closed)
      expect((await kernel.check(OWNER.ownerKey)).missing.length).toBeGreaterThan(0)
      expect((await kernel.checkSave(save.id)).missing).toEqual([])

      const raw = await db.saves.get(save.id)
      if (!raw) throw new Error('存档不见了')
      await db.saves.put({ ...raw, snapshot: { ...raw.snapshot, library: closed } })
      expect((await kernel.checkSave(save.id)).missing.length).toBeGreaterThan(0)

      const before = await service.getWorkspace(OWNER.ownerKey)
      const count = await db.saves.count()
      await expect(service.loadSave(OWNER, save.id, { precheck: async () => { throw new TrpgError('E_NOT_FOUND', '玩家取消') } })).rejects.toBeInstanceOf(TrpgError)
      expect(await db.saves.count()).toBe(count)
      expect((await service.getWorkspace(OWNER.ownerKey))?.savedHash).toBe(before?.savedHash)
    })
  })

  it('撤销上限由设置决定，不写死', async () => {
    await withDb(async (db) => {
      const { campaign: service, clock } = await setup(db)
      await service.startNewCampaign(NEW)
      const checker: KernelRefChecker = async (refs) => refs.map((ref) => ({ ok: true, ref }))
      const kernel = new KernelSaveService({ db, campaign: service, rules: makeRegistry(), now: clock, checkRefs: checker, undoLimit: () => 2 })
      await kernel.bind(OWNER.ownerKey, campaign())
      const change: KernelChange = { action: 'update', type: 'Actor', pack: null, parentUuid: 'Actor.actor1',
        data: { system: { attributes: { hp: { value: 5 } } } } }
      let revision = 0
      for (let i = 0; i < 3; i++) revision = (await kernel.apply(OWNER.ownerKey, [change], revision)).kernel.revision
      expect((await kernel.read(OWNER.ownerKey))?.undo).toHaveLength(2)
      expect(revision).toBe(3)
    })
  })

  it('写入时按战役拿结算小窗拆好的人物（compactActors / mapRef 收到 ownerKey）', async () => {
    await withDb(async (db) => {
      const { campaign: service, clock } = await setup(db)
      await service.startNewCampaign(NEW)
      const checker: KernelRefChecker = async (refs) => refs.map((ref) => ({ ok: true, ref }))
      const asked: Array<[string, string[]]> = []
      const mapped: string[] = []
      const kernel = new KernelSaveService({ db, campaign: service, rules: makeRegistry(), now: clock, checkRefs: checker,
        mapRef: (ownerKey) => { mapped.push(ownerKey); return () => null },
        compactActors: async (ownerKey, ids) => {
          asked.push([ownerKey, ids])
          return ids.map((id) => ({ id, name: '测试角色', refs: [{ kind: 'spell', ...REF, label: '火球术' }], choices: {},
            state: { actor: { system: { attributes: { hp: { value: 4 } } } }, items: {}, effects: {}, itemAdded: [], itemRemoved: [], effectAdded: [], effectRemoved: [] } }))
        } })
      await kernel.bind(OWNER.ownerKey, campaign())
      const change: KernelChange = { action: 'update', type: 'Actor', pack: null, parentUuid: 'Actor.actor1',
        data: { system: { attributes: { hp: { value: 4 } } } } }
      const written = await kernel.apply(OWNER.ownerKey, [change], 0)
      expect(asked).toEqual([[OWNER.ownerKey, ['actor1']]])
      expect(mapped).toEqual([OWNER.ownerKey])
      expect(hp(written.kernel)).toBe(4)
      expect(written.kernel.actors[0].adjustments).toEqual({ note: '玩家自己的备注' })
    })
  })
})

describe('结算内核世界编号', () => {
  it('ownerKey 带冒号和点也能变成 Foundry 认的编号，同一个战役每次一样', async () => {
    const { worldIdOf } = await import('../../src/rules/kernel/runtime')
    const id = worldIdOf('char:龙金劫.png')
    expect(id).toMatch(/^[A-Za-z0-9_-]+$/)
    expect(worldIdOf('char:龙金劫.png')).toBe(id)
    expect(worldIdOf('group:7')).not.toBe(id)
  })
})
