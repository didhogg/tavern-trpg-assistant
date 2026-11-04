import 'fake-indexeddb/auto'
import { createPinia, setActivePinia } from 'pinia'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { createServices, type Services } from '../../src/core/services'
import { useAppStore } from '../../src/stores/app'
import { useCampaignStore } from '../../src/stores/campaign'
import { usePeopleStore } from '../../src/stores/people'
import { emptyPerson } from '../../src/ui/people/fromEntry'
import { OWNER } from '../helpers/harness'
import { makeClock, makePack } from '../helpers/fixtures'
import { uuid } from '../../src/core/ids'
import { DRAFT_WRITE_KEYS, LIVE_WRITE_KEYS } from '../../src/schemas/peopleWrites'

let services: Services

beforeEach(async () => {
  setActivePinia(createPinia())
  services = createServices({ dbName: `u5-write-${uuid()}`, now: makeClock(), appVersion: '1.0.0' })
  await services.packs.installBuiltin(makePack({ id: 'dnd5e2014-srd', name: '核心规则' }, []))
  const app = useAppStore()
  app.setServices(services)
  const campaign = useCampaignStore()
  await campaign.init(services, OWNER)
  await campaign.startNew({ ruleId: 'dnd5e2014', packIds: [], name: 'U5' })
})

afterEach(async () => {
  services.lock.stop()
  services.db.close()
  await services.db.delete()
})

const clone = <T>(value: T): T => structuredClone(value)
const changedKeys = (before: Record<string, unknown>, after: Record<string, unknown>): string[] => Object.keys(after).filter((key) => JSON.stringify(before[key]) !== JSON.stringify(after[key]))

describe('U5 §7.3 改 A 不动 B', () => {
  it('当场状态只写登记字段；设定类、分类、标签、置顶与来源不动', () => {
    const people = usePeopleStore()
    const p = people.create({ ...emptyPerson({ name: '盖尔', categoryId: 'party', now: 1 }), tags: ['tag-a'], pinned: true, giveAi: 'full', sourceRef: { packId: 'pack', version: '1.0.0', entryId: 'entry' } })
    const before = clone(people.rowOf(p.id)!)
    let touched = false
    for (let i = 0; i < 120; i++) {
      const patch = i % 6 === 0
        ? { hp: { current: i, temp: i % 4, deathSaves: { success: i % 4, fail: (i + 1) % 4 } } }
        : i % 6 === 1 ? { inspiration: i % 2 === 0 }
        : i % 6 === 2 ? { exhaustion: i % 7 }
        : i % 6 === 3 ? { hitDiceUsed: { '6': i % 3 } }
        : i % 6 === 4 ? { slotsUsed: { '1': i % 5, pact: i % 2 } }
        : { effects: [{ id: `fx-${i}`, category: 'other' as const, name: `效果${i}`, concentration: false, addedAt: 0 }] }
      people.setLive(p.id, patch)
      const after = people.rowOf(p.id)!
      const changed = changedKeys(before as unknown as Record<string, unknown>, after as unknown as Record<string, unknown>)
      expect(changed.every((key) => (LIVE_WRITE_KEYS as readonly string[]).includes(key))).toBe(true)
      expect(after.touchedAt).toBe(before.touchedAt)
      touched = true
    }
    expect(touched).toBe(true)
  })

  it('设定类只写登记字段与 touchedAt；当场状态、分类、标签、置顶不动', () => {
    const people = usePeopleStore()
    const p = people.create({ ...emptyPerson({ name: '盖尔', categoryId: 'party', now: 1 }), tags: ['tag-a'], pinned: true, hp: { current: 3, temp: 2, deathSaves: { success: 1, fail: 0 } }, effects: [{ id: 'fx-1', category: 'spell', name: '祝福', concentration: false, addedAt: 0 }] })
    const before = clone(people.rowOf(p.id)!)
    for (let i = 0; i < 120; i++) {
      const block = clone(before.block)
      block.alignment = ['L G', 'N', 'C E', 'U'][i % 4]
      block.race = `race.${i}.test`
      block.speed = { walk: 25 + (i % 10) }
      const patch = i % 5 === 0 ? { name: `盖尔 ${i}` } : i % 5 === 1 ? { nameEn: `Gale ${i}` } : i % 5 === 2 ? { block } : i % 5 === 3 ? { avatar: `https://example.test/${i}.png` } : { avatarSource: { asset: { $asset: `${i}`.padStart(64, '0') }, crop: { x: 0, y: 0.1, w: 0.8, h: 0.8 } } }
      people.saveDraft(p.id, patch)
      const after = people.rowOf(p.id)!
      const changed = changedKeys(before as unknown as Record<string, unknown>, after as unknown as Record<string, unknown>)
      expect(changed.every((key) => key === 'touchedAt' || (DRAFT_WRITE_KEYS as readonly string[]).includes(key))).toBe(true)
      expect(after.hp).toEqual(before.hp)
      expect(after.effects).toEqual(before.effects)
      expect(after.categoryId).toBe(before.categoryId)
      expect(after.tags).toEqual(before.tags)
      expect(after.pinned).toBe(before.pinned)
    }
  })

  it('未登记字段拒绝写入；头像自动截取只写 avatar 与 avatarSource', () => {
    const people = usePeopleStore()
    const p = people.create(emptyPerson({ name: '盖尔', categoryId: 'party', now: 1 }))
    expect(() => people.setLive(p.id, { name: '坏' } as never)).toThrow('不能写 name')
    expect(() => people.saveDraft(p.id, { hp: { current: 1 } } as never)).toThrow('不能写 hp')
    const before = clone(people.rowOf(p.id)!)
    const next = people.autoAssignAvatar(p.id, { avatar: { $asset: 'a'.repeat(64) }, avatarSource: { asset: { $asset: 'b'.repeat(64) }, crop: { x: 0.1, y: 0.1, w: 0.8, h: 0.8 } } })
    expect(next.avatar).toEqual({ $asset: 'a'.repeat(64) })
    expect(next.avatarSource?.crop).toEqual({ x: 0.1, y: 0.1, w: 0.8, h: 0.8 })
    expect(next.block).toEqual(before.block)
    expect(next.hp).toEqual(before.hp)
  })
})
