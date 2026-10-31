import { describe, expect, it } from 'vitest'
import { allEntries } from './r9-pack-helpers'

type Rec = Record<string, unknown>
const grantsOf = (data: Rec): Array<{ level: number; items: string[]; optional: unknown; replaces?: string }> => ((data.advancement as Rec[] | undefined) ?? []).filter((a) => a.kind === 'itemGrant') as never

/**
 * 对照英文版《塔莎的万事坩埚》：牧师 8 级可选特性「Blessed Strikes」取代「Divine Strike 或 Potent Spellcasting」，
 * 每个领域取代的是它自己有的那一个（期望值来自各领域本书的特性表，不读构建输出）。
 */
const BLESSED: Record<string, string> = {
  'life.phb': 'divine-strike', 'knowledge.phb': 'potent-spellcasting', 'light.phb': 'potent-spellcasting', 'nature.phb': 'divine-strike',
  'tempest.phb': 'divine-strike', 'trickery.phb': 'divine-strike', 'war.phb': 'divine-strike', 'death.dmg': 'divine-strike',
  'arcana.scag': 'potent-spellcasting', 'forge.xge': 'divine-strike', 'grave.xge': 'potent-spellcasting',
  'order.tce': 'divine-strike', 'peace.tce': 'potent-spellcasting', 'twilight.tce': 'divine-strike',
}

describe('R15 TCE 可选变体子职业特性（受祝击、战技选项、原初伴侣）', () => {
  const all = new Map(allEntries().map((e) => [e.id, e]))

  it('14 个牧师领域各有一份「受祝击」，授予是 8 级的「可选」授予，并取代书中对应的特性', () => {
    for (const [key, replaced] of Object.entries(BLESSED)) {
      const [domain, book] = key.split('.')
      const feature = all.get(`feature.cleric-${domain}-domain-blessed-strikes.tce`)
      expect(feature, key).toBeDefined()
      expect(feature!.data.optional).toBe(true)
      const sub = all.get(`subclass.cleric-${domain}-domain.${book}`)
      expect(sub, key).toBeDefined()
      const grant = grantsOf(sub!.data).find((g) => g.items.includes(feature!.id))
      expect(grant, key).toMatchObject({ level: 8, optional: 'tce-ocf', replaces: `feature.cleric-${domain}-domain-${replaced}.${book}` })
      expect(grantsOf(sub!.data).some((g) => g.optional === false && g.items.includes(feature!.id)), `${key} 不能是必得特性`).toBe(false)
    }
  })

  it('战斗大师的「战技选项」（3 级，不取代任何特性）与驯兽师的「原初伴侣」（3 级，取代游侠伴侣）', () => {
    const maneuver = grantsOf(all.get('subclass.fighter-battle-master.phb')!.data).find((g) => g.items.includes('feature.fighter-battle-master-maneuver-options.tce'))
    expect(maneuver).toMatchObject({ level: 3, optional: 'tce-ocf' })
    expect(maneuver!.replaces).toBeUndefined()
    const primal = grantsOf(all.get('subclass.ranger-beast-master.phb')!.data).find((g) => g.items.includes('feature.ranger-beast-master-primal-companion.tce'))
    expect(primal).toMatchObject({ level: 3, optional: 'tce-ocf', replaces: 'feature.ranger-beast-master-rangers-companion.phb' })
  })

  it('这些特性的所属子职业都在，且特性放在塔莎包里', () => {
    const owners = [...all.values()].filter((e) => e.type === 'feature' && /-(blessed-strikes|maneuver-options|primal-companion)\.tce$/.test(e.id))
    expect(owners).toHaveLength(16)
    for (const f of owners) expect(all.has(String((f.data.owner as Rec).id)), f.id).toBe(true)
  })
})
