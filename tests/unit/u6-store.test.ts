import 'fake-indexeddb/auto'
import { createPinia, setActivePinia } from 'pinia'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { createServices, type Services } from '../../src/core/services'
import { useAppStore } from '../../src/stores/app'
import { useCampaignStore } from '../../src/stores/campaign'
import { usePeopleStore } from '../../src/stores/people'
import { emptyBlock, emptyPerson } from '../../src/ui/people/fromEntry'
import { makeClock, makePack } from '../helpers/fixtures'
import { OWNER } from '../helpers/harness'
import { uuid } from '../../src/core/ids'
import type { Entry } from '../../src/schemas/pack'

let services: Services
const base = { src: { book: 'PHB', page: 1 }, credit: { by: '本项目', license: 'CC-BY-NC-SA-4.0' } }

function fixtures(): Entry[] {
  const monsterData = { ...emptyBlock(), hp: { average: 7, formula: '2d6' }, cr: 0.25, creatureType: { type: 'humanoid', tags: ['goblin'] } }
  return [
    { id: 'monster.goblin.test', type: 'monster', name: '地精', keywords: [], unique: false, summary: '', data: { ...base, ...monsterData } },
    { id: 'npc.fisher.test', type: 'npc', name: '老渔夫', keywords: [], unique: false, summary: '', data: { ...base, statblock: 'monster.goblin.test', adventure: 'T', at: { chapter: '一' }, confidence: 'high' } },
  ]
}

beforeEach(async () => {
  setActivePinia(createPinia())
  services = createServices({ dbName: `u6-store-${uuid()}`, now: makeClock(), appVersion: '1.0.0' })
  await services.packs.installBuiltin(makePack({ id: 'dnd5e2014-srd', name: '核心规则' }, fixtures()))
  const app = useAppStore()
  app.setServices(services)
  const campaign = useCampaignStore()
  await campaign.init(services, OWNER)
  await campaign.startNew({ ruleId: 'dnd5e2014', packIds: [], name: 'U6' })
})
afterEach(async () => {
  services.lock.stop()
  services.db.close()
  await services.db.delete()
})

describe('U6 人物 store', () => {
  it('模板加入怪物与具名 NPC：续号、生命取固定值、来源记录、分类默认值', async () => {
    const people = usePeopleStore()
    const added = await people.addFromEntry({ ref: { packId: 'dnd5e2014-srd', entryId: 'monster.goblin.test' }, count: 3, categoryId: 'enemy' })
    expect(added.map((p) => p.name)).toEqual(['地精', '地精 2', '地精 3'])
    expect(added[0]).toMatchObject({ categoryId: 'enemy', hp: { current: 7 }, sourceRef: { entryId: 'monster.goblin.test' } })
    const npc = await people.addFromEntry({ ref: { packId: 'dnd5e2014-srd', entryId: 'npc.fisher.test' }, count: 1 })
    expect(npc[0]).toMatchObject({ name: '老渔夫', categoryId: 'npc', hp: { current: 7 } })
    expect(people.counts).toMatchObject({ all: 4, enemy: 3, npc: 1 })
  })

  it('create/save/置顶/复制/送到/标签/队伍名/回收站与恢复', async () => {
    const people = usePeopleStore()
    const p = people.create(emptyPerson({ name: '盖尔', categoryId: 'party', now: 1 }))
    const saved = people.save(p.id, { name: '盖尔 改' })
    expect(saved.name).toBe('盖尔 改')
    people.setPinned(p.id, true)
    expect(people.rowOf(p.id)?.pinned).toBe(true)
    const copy = people.duplicate(p.id)
    expect(copy.name).toBe('盖尔 改 2')
    expect(copy.id).not.toBe(p.id)
    people.move([p.id], 'npc')
    expect(people.rowOf(p.id)?.categoryId).toBe('npc')
    const tag = people.createTag('冒险者')
    expect(() => people.createTag('冒险者')).toThrow('已经有这个标签了')
    people.applyTags([p.id, copy.id], { add: [tag.id] })
    expect(people.rowOf(copy.id)?.tags).toContain(tag.id)
    people.applyTags([p.id], { remove: [tag.id] })
    expect(people.rowOf(p.id)?.tags).not.toContain(tag.id)
    people.renameTag(tag.id, '深水')
    expect(people.tags.find((t) => t.id === tag.id)?.name).toBe('深水')
    expect(() => people.renameTag(tag.id, '深水')).not.toThrow()
    const other = people.createTag('商人')
    expect(() => people.renameTag(other.id, '深水')).toThrow('已经有这个标签了')
    people.renameParty('博德小队')
    expect(people.partyName).toBe('博德小队')
    people.trash([p.id])
    expect(people.counts.all).toBe(1)
    people.restore([p.id])
    expect(people.rowOf(p.id)?.categoryId).toBe('npc')
    people.trash([copy.id])
    people.purge([copy.id])
    expect(people.rowOf(copy.id)).toBeUndefined()
    people.deleteTag(tag.id)
    expect(people.rowOf(p.id)?.tags).not.toContain(tag.id)
  })

  it('存入我的库：默认未分组；同名冲突；更新后 libraryRef 指向条目', async () => {
    const people = usePeopleStore()
    const p = people.create(emptyPerson({ name: '精英卫兵', categoryId: 'enemy', now: 1 }))
    const first = await people.saveToLibrary(p.id, { name: '精英卫兵' })
    expect(first).toMatchObject({ version: '1.0.1' })
    expect(people.rowOf(p.id)?.libraryRef?.entryId).toBe(first.entryId)
    const again = await people.saveToLibrary(p.id, { name: '精英卫兵' })
    expect(again.conflict?.entryId).toBe(first.entryId)
    const updated = await people.saveToLibrary(p.id, { name: '精英卫兵', mode: 'update' })
    expect(updated.version).toBe('1.0.2')
  })
})
