import { describe, expect, it } from 'vitest'
import { allEntries } from './r9-pack-helpers'

type Rec = Record<string, unknown>
const joinOf = (e: { data: Rec } | undefined): Rec | undefined => ((e?.data.joins as Rec[] | undefined) ?? [])[0]

/**
 * 对照英文版《塔莎的万事坩埚》：牧师 8 级可选职业特性「Blessed Strikes」取代「Divine Strike 或 Potent Spellcasting」，
 * 每个领域取代的是它自己有的那一个（期望值来自各领域本书的特性表，不读构建输出）。
 * G1：这些特性自己用 joins 登记「加入某子职业某一级、可选、取代 X」；子职业里不写任何指向它们的授予。
 */
const BLESSED: Record<string, string> = {
  'life.phb': 'divine-strike', 'knowledge.phb': 'potent-spellcasting', 'light.phb': 'potent-spellcasting', 'nature.phb': 'divine-strike',
  'tempest.phb': 'divine-strike', 'trickery.phb': 'divine-strike', 'war.phb': 'divine-strike', 'death.dmg': 'divine-strike',
  'arcana.scag': 'potent-spellcasting', 'forge.xge': 'divine-strike', 'grave.xge': 'potent-spellcasting',
  'order.tce': 'divine-strike', 'peace.tce': 'potent-spellcasting', 'twilight.tce': 'divine-strike',
}

describe('R15 / G1 TCE 可选变体子职业特性（受祝击、战技选项、原初伴侣）', () => {
  const all = new Map(allEntries().map((e) => [e.id, e]))

  it('14 个牧师领域各有一份「受祝击」：自己登记加入该领域 8 级、可选、取代书中对应的特性', () => {
    for (const [key, replaced] of Object.entries(BLESSED)) {
      const [domain, book] = key.split('.')
      const feature = all.get(`feature.cleric-${domain}-domain-blessed-strikes.tce`)
      expect(feature, key).toBeDefined()
      expect(feature!.data.optional).toBe(true)
      expect(joinOf(feature), key).toEqual({ to: `subclass.cleric-${domain}-domain.${book}`, level: 8, as: 'optional', replaces: `feature.cleric-${domain}-domain-${replaced}.${book}` })
      const sub = all.get(`subclass.cleric-${domain}-domain.${book}`)!
      const mentioned = JSON.stringify(sub.data.advancement)
      expect(mentioned, `${key} 的升级授予里不写受祝击`).not.toContain('blessed-strikes')
    }
  })

  it('战斗大师的「战技选项」（3 级，不取代任何特性）与驯兽师的「原初伴侣」（3 级，取代游侠伴侣）', () => {
    expect(joinOf(all.get('feature.fighter-battle-master-maneuver-options.tce'))).toEqual({ to: 'subclass.fighter-battle-master.phb', level: 3, as: 'optional' })
    expect(joinOf(all.get('feature.ranger-beast-master-primal-companion.tce'))).toEqual({ to: 'subclass.ranger-beast-master.phb', level: 3, as: 'optional', replaces: 'feature.ranger-beast-master-rangers-companion.phb' })
  })

  it('这些特性的所属子职业都在，且特性放在塔莎包里', () => {
    const owners = [...all.values()].filter((e) => e.type === 'feature' && /-(blessed-strikes|maneuver-options|primal-companion)\.tce$/.test(e.id))
    expect(owners).toHaveLength(16)
    for (const f of owners) expect(all.has(String((f.data.owner as Rec).id)), f.id).toBe(true)
  })
})
