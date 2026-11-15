// P6 B1：存档人物名单（加人 / 彻底删除 / 个人调整）可撤销、撤销交回受影响的人、改动记录逐字段。
import { describe, expect, it } from 'vitest'
import { KernelSaveService } from '../../src/core/saves/kernel'
import { defaultCampaignLibrary } from '../../src/library/scopes'
import { kernelCampaignSchema, type KernelCampaign } from '../../src/schemas/kernel'
import { TrpgError } from '../../src/core/errors'
import { OWNER, setup } from '../helpers/harness'
import { makeRegistry, withDb } from '../helpers/fixtures'

const NEW = { ...OWNER, ruleId: 'dnd5e2014', name: 'P6 名单测试' }
const actor = (id: string, hp: number) => ({
  id, name: `人物${id}`, seed: id, refs: [{ kind: 'race', set: 'en-official', prop: 'race', hash: 'human' }], choices: {},
  state: { actor: { system: { attributes: { hp: { value: hp } } } }, items: {}, effects: {}, itemAdded: [], itemRemoved: [], effectAdded: [], effectRemoved: [] },
})
const campaign = (): KernelCampaign => kernelCampaignSchema.parse({
  rule: 'dnd5e2014', kernelVersion: 1, library: defaultCampaignLibrary('dnd5e2014', 'en'),
  actors: [{ ...actor('a1', 10), adjustments: { category: 'party' } }], revision: 0, undo: [],
})

async function service(db: Parameters<Parameters<typeof withDb>[0]>[0]) {
  const { campaign: c, clock } = await setup(db)
  await c.startNewCampaign(NEW)
  const s = new KernelSaveService({ db, campaign: c, rules: makeRegistry(), now: clock, checkRefs: async (refs) => refs.map((ref) => ({ ok: true, ref })) })
  await s.bind(OWNER.ownerKey, campaign())
  return s
}

describe('P6 B1 人物名单与撤销', () => {
  it('加人可撤销：撤销后存档没有他，restored 交回 null', async () => {
    await withDb(async (db) => {
      const s = await service(db)
      const { kernel } = await s.addActors(OWNER.ownerKey, [actor('a2', 7)], 0, { category: 'enemy' })
      expect(kernel.actors.map((a) => a.id)).toEqual(['a1', 'a2'])
      expect(kernel.actors[1].adjustments).toEqual({ category: 'enemy' })
      const undone = await s.undo(OWNER.ownerKey, kernel.revision)
      expect(undone?.kernel.actors.map((a) => a.id)).toEqual(['a1'])
      expect(undone?.restored).toEqual([{ id: 'a2', actor: null }])
    })
  })

  it('同编号不能重复加', async () => {
    await withDb(async (db) => {
      const s = await service(db)
      const err = await s.addActors(OWNER.ownerKey, [actor('a1', 1)], 0).catch((e) => e)
      expect(err).toBeInstanceOf(TrpgError)
      expect((err as TrpgError).code).toBe('E_ACTOR_EXISTS')
    })
  })

  it('彻底删除可撤销：撤销后放回，restored 交回整个人', async () => {
    await withDb(async (db) => {
      const s = await service(db)
      const { kernel } = await s.purgeActors(OWNER.ownerKey, ['a1'], 0)
      expect(kernel.actors).toEqual([])
      const undone = await s.undo(OWNER.ownerKey, kernel.revision)
      expect(undone?.kernel.actors[0]).toMatchObject({ id: 'a1', adjustments: { category: 'party' } })
      expect(undone?.restored[0].actor?.id).toBe('a1')
    })
  })

  it('个人调整：改、删键、撤销；旧修订号拒绝', async () => {
    await withDb(async (db) => {
      const s = await service(db)
      const { kernel } = await s.setAdjustments(OWNER.ownerKey, ['a1'], { pinned: true, trashed: true, category: null }, 0)
      expect(kernel.actors[0].adjustments).toEqual({ pinned: true, trashed: true })
      expect((await s.setAdjustments(OWNER.ownerKey, ['a1'], { pinned: false }, 0).catch((e) => e)).code).toBe('E_REVISION_CONFLICT')
      const undone = await s.undo(OWNER.ownerKey, kernel.revision)
      expect(undone?.kernel.actors[0].adjustments).toEqual({ category: 'party' })
    })
  })

  it('改动记录：新的在前，加人 / 改调整逐字段写旧 → 新', async () => {
    await withDb(async (db) => {
      const s = await service(db)
      const r1 = await s.addActors(OWNER.ownerKey, [actor('a2', 7)], 0)
      await s.setAdjustments(OWNER.ownerKey, ['a1'], { pinned: true }, r1.kernel.revision)
      const rows = await s.history(OWNER.ownerKey)
      expect(rows.map((r) => r.revision)).toEqual([1, 0])
      expect(rows[0].actors[0]).toMatchObject({ id: 'a1', kind: 'changed', fields: [{ path: 'adjustments.pinned', from: undefined, to: true }] })
      expect(rows[1].actors[0]).toMatchObject({ id: 'a2', kind: 'added' })
    })
  })
})
