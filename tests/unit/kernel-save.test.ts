import { describe, expect, it } from 'vitest'
import { KernelSaveService, type KernelRefChecker } from '../../src/core/saves/kernel'
import { defaultCampaignLibrary, entryUnit } from '../../src/library/scopes'
import { kernelCampaignSchema, type KernelCampaign, type KernelChange } from '../../src/schemas/kernel'
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
      state: { actor: { system: { attributes: { hp: { value: 10 } } } }, items: [], effects: [] },
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
      expect(hp({ ...campaign(), actors: [{ ...campaign().actors[0], state: preview.rows[0].before as Record<string, unknown> }] })).toBe(10)

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
})
