import { describe, expect, it } from 'vitest'
import { KernelSaveService, type KernelRefChecker } from '../../src/core/saves/kernel'
import { defaultCampaignLibrary, entryUnit } from '../../src/library/scopes'
import { kernelCampaignSchema, type KernelChange } from '../../src/schemas/kernel'
import { OWNER, setup } from '../helpers/harness'
import { makeRegistry, withDb } from '../helpers/fixtures'

const NEW = { ...OWNER, ruleId: 'dnd5e2014', name: 'P3-4 完整链路' }
const HERO = { set: 'en-official', prop: 'class', hash: 'cleric-phb' }
const SPELL = { set: 'en-official', prop: 'spell', hash: 'fireball-phb' }
const MONSTER = { set: 'en-official', prop: 'monster', hash: 'goblin-mm' }

function state(hp: number, slot: number): Record<string, unknown> {
  return {
    actor: { _id: 'hero', system: { attributes: { hp: { value: hp } }, spells: { spell1: { value: slot } } } },
    items: [{ _id: 'item-class', name: 'Cleric', type: 'class' }],
    effects: [],
  }
}

function campaign() {
  return kernelCampaignSchema.parse({
    rule: 'dnd5e2014',
    kernelVersion: 1,
    library: defaultCampaignLibrary('dnd5e2014', 'en'),
    dataVersion: { official: '1.0', brews: { 'brew-a': 'hash-a' } },
    actors: [
      { id: 'hero', name: '埃拉娜', refs: [{ kind: 'class', ...HERO, label: '牧师' }, { kind: 'spell', ...SPELL, label: '火球术' }],
        choices: { prepared: ['fireball-phb'] }, state: state(10, 2), adjustments: { name: '埃拉娜' }, dice: [3, 1, 4] },
      { id: 'monster', name: '地精', refs: [{ kind: 'monster', ...MONSTER, label: '地精' }],
        choices: {}, state: { actor: { _id: 'monster', system: { attributes: { hp: { value: 7 } } } }, items: [], effects: [] }, adjustments: {}, dice: [] },
    ],
    revision: 0,
    undo: [],
  })
}

const changes: KernelChange[] = [
  { action: 'update', type: 'Actor', pack: null, parentUuid: 'Actor.monster', data: { system: { attributes: { hp: { value: 2 } } } } },
  { action: 'update', type: 'Actor', pack: null, parentUuid: 'Actor.hero', data: { system: { spells: { spell1: { value: 1 } } } } },
]

describe('P3-4 完整链路（后端）', () => {
  it('建战役 → 绑定 → 打一场 → 预览/写入 → 存档 → 关书报缺 → 开书完整 → 读档 → 撤销', async () => {
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

      const preview = await kernel.preview(OWNER.ownerKey, changes)
      expect(preview.rows).toHaveLength(2)
      expect(preview.rows[0].actorName).toBe('地精')
      const applied = await kernel.apply(OWNER.ownerKey, changes, preview.revision)
      expect(applied.kernel.revision).toBe(1)
      const saved = await service.saveCurrent(OWNER.ownerKey)
      expect(saved.changed).toBe(true)
      const savedKernel = (await service.getSave(save.id))?.snapshot.kernel as { revision: number; actors: Array<{ id: string }> }
      expect(savedKernel.revision).toBe(1)
      expect(savedKernel.actors.map((a) => a.id)).toEqual(['hero', 'monster'])

      closed.add(MONSTER.hash)
      const missing = await kernel.check(OWNER.ownerKey)
      expect(missing.missing).toMatchObject([{ actorId: 'monster', reason: 'not-installed', ref: { label: '地精' } }])
      expect((await kernel.read(OWNER.ownerKey))?.actors[1].refs).toHaveLength(1)

      closed.delete(MONSTER.hash)
      expect((await kernel.check(OWNER.ownerKey)).missing).toEqual([])

      await service.loadSave(OWNER, save.id)
      const loaded = await kernel.read(OWNER.ownerKey)
      expect(loaded?.actors[0]).toMatchObject({ choices: { prepared: ['fireball-phb'] }, adjustments: { name: '埃拉娜' }, dice: [3, 1, 4] })
      expect(loaded?.actors[1].state.actor).toMatchObject({ system: { attributes: { hp: { value: 2 } } } })
      expect((await kernel.check(OWNER.ownerKey)).missing).toEqual([])

      const undo = await kernel.undo(OWNER.ownerKey, loaded!.revision)
      expect(undo?.kernel.revision).toBe(2)
      expect(undo?.kernel.actors[1].state.actor).toMatchObject({ system: { attributes: { hp: { value: 7 } } } })
      expect(undo?.kernel.actors[0].state.actor).toMatchObject({ system: { attributes: { hp: { value: 10 } }, spells: { spell1: { value: 2 } } } })
    })
  })

  it('改范围关书 → 读档报缺；开书 → 读档完整；引用不丢', async () => {
    await withDb(async (db) => {
      const { campaign: service, clock } = await setup(db)
      const { save } = await service.startNewCampaign(NEW)
      const checker: KernelRefChecker = async (refs, library) => refs.map((ref) => ({
        ok: !library.exclude.includes(entryUnit(ref)), ref, reason: 'excluded',
      }))
      const kernel = new KernelSaveService({ db, campaign: service, rules: makeRegistry(), now: clock, checkRefs: checker })
      await kernel.bind(OWNER.ownerKey, campaign())
      await service.saveCurrent(OWNER.ownerKey)
      const closed = defaultCampaignLibrary('dnd5e2014', 'en')
      closed.exclude = [entryUnit(HERO)]
      await kernel.setLibrary(OWNER.ownerKey, closed)
      expect((await kernel.check(OWNER.ownerKey)).missing).toMatchObject([{ actorId: 'hero', reason: 'excluded' }])
      await service.loadSave(OWNER, save.id)
      expect((await kernel.check(OWNER.ownerKey)).missing).toEqual([])
      expect((await kernel.read(OWNER.ownerKey))?.actors[0].refs.map((r) => r.hash)).toEqual([HERO.hash, SPELL.hash])
    })
  })
})
