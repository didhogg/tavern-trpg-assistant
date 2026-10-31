import { describe, expect, it } from 'vitest'
import { DAMAGE_LABELS } from '../../src/rules/dnd5e2014/data/enums'
import { allEntries } from './r9-pack-helpers'

type Rec = Record<string, unknown>
const entries = allEntries()
const byId = new Map(entries.map((e) => [e.id, e]))
const dataText = (id: string): string => JSON.stringify(byId.get(id)!.data)
const enOf = (id: string): Rec => (byId.get(id) as unknown as { i18n: { en: Rec } }).i18n.en

describe('R14 规则 8：abilityDc / abilityAttackMod', () => {
  it('输出里没有 abilityDc、abilityAttackMod 字样；中文 15 句 DC + 12 句攻击加值；英文各同数', () => {
    const all = JSON.stringify(entries.map((e) => e.data))
    expect(all.includes('abilityDc') || all.includes('abilityAttackMod')).toBe(false)
    expect((all.match(/豁免DC = 8 \+ 你的熟练加值/g) ?? []).length).toBe(15)
    expect((all.match(/攻击加值 = 你的熟练加值/g) ?? []).length).toBe(12)
    const en = JSON.stringify(entries.map((e) => (e as unknown as { i18n?: unknown }).i18n ?? {}))
    expect((en.match(/save DC = 8 \+ your proficiency bonus/g) ?? []).length).toBe(15)
    expect((en.match(/attack modifier = your proficiency bonus/g) ?? []).length).toBe(12)
  })
  it('样本：战技「力量或敏捷」；法术攻击加值；气', () => {
    expect(dataText('feature.fighter-battle-master-combat-superiority.phb')).toContain('战技豁免DC = 8 + 你的熟练加值 + 你的力量或敏捷调整值')
    expect(dataText('feature.fighter-eldritch-knight-spellcasting.phb')).toContain('法术攻击加值 = 你的熟练加值 + 你的智力调整值')
    expect(dataText('feature.monk-ki.phb')).not.toContain('Ki Ki')
    expect(JSON.stringify(enOf('feature.fighter-battle-master-combat-superiority.phb'))).toContain('Maneuver save DC = 8 + your proficiency bonus + your Strength or Dexterity modifier')
  })
})

describe('R14 规则 7：summary 保留名称、去掉复述类型', () => {
  it('除 book 与占位外，每条 summary 以名称开头；没有复述类型的一段；没有空段', () => {
    const REPEAT = /｜(子职业|种族|亚种族|背景|专长|状态|疾病|规则)(｜|$)/
    const bad: string[] = []
    for (const e of entries) {
      if (e.type === 'book' || e.type === 'lore') continue
      if (!e.summary.startsWith(e.name)) bad.push(`${e.id} 不以名称开头`)
      if (REPEAT.test(e.summary)) bad.push(`${e.id} 复述类型`)
      if (e.summary.includes('｜｜')) bad.push(`${e.id} 空段`)
    }
    expect(bad.slice(0, 10)).toEqual([])
  })
  it('样本', () => {
    expect(byId.get('race.aasimar.dmg')!.summary).toBe('阿斯莫｜速度30尺')
    expect(byId.get('condition.blinded.phb')!.summary.startsWith('目盲｜目盲的生物')).toBe(true)
    expect(byId.get('spell.hostility.bmt')?.summary ?? '敌意术｜3环').toContain('3环')
    expect(entries.find((e) => e.name === '普通星象对应')!.summary).toBe('普通星象对应｜12 项')
  })
})

describe('R14 规则 10：伤害类型统一为寒冷、暗蚀', () => {
  it('界面标签与摘要', () => {
    expect(DAMAGE_LABELS.cold).toBe('寒冷')
    expect(DAMAGE_LABELS.necrotic).toBe('暗蚀')
    expect(byId.get('item.antimatter-rifle-of-thrones-command.bmt')!.summary).toContain('暗蚀')
  })
  it('正文：伤害类型列表与「冷冻伤害」「死灵伤害」「黯蚀」已改；名称不动', () => {
    expect(byId.get('feat.elemental-adept.phb')!.summary).toContain('强酸、寒冷、火焰、闪电、雷鸣')
    expect(dataText('feat.elemental-adept.phb')).toContain('强酸、寒冷、火焰、闪电、雷鸣')
    const all = entries.map((e) => `${e.summary} ${JSON.stringify(e.data)}`).join('\n')
    expect(/冷冻伤害|死灵伤害|黯蚀|冷冻抗性|死灵抗性/.test(all)).toBe(false)
    expect(entries.some((e) => e.name.includes('冷冻射线'))).toBe(true)
    expect(entries.some((e) => e.name.includes('死灵法师') || e.summary.includes('死灵学'))).toBe(true)
  })
})

describe('R14 规则 10 的副作用修正：暗蚀伤害不再被误判成力场', () => {
  const damageTypes = (id: string): string[] => {
    const out: string[] = []
    const walk = (v: unknown): void => {
      if (Array.isArray(v)) { v.forEach(walk); return }
      if (v && typeof v === 'object') { const r = v as Rec; if (typeof r.dice === 'string' && typeof r.type === 'string') out.push(r.type); Object.values(r).forEach(walk) }
    }
    walk(byId.get(id)!.data)
    return [...new Set(out)]
  }
  it('规则书上伤害类型明确的样本（独立于转换器）', () => {
    expect(damageTypes('spell.chill-touch.phb')).toContain('necrotic')
    expect(damageTypes('spell.blight.phb')).toContain('necrotic')
    expect(damageTypes('monster.wraith.mm')).toContain('necrotic')
    expect(damageTypes('monster.wight.mm')).toContain('necrotic')
    expect(damageTypes('spell.magic-missile.phb')).toEqual(['force'])
    expect(damageTypes('spell.eldritch-blast.phb')).toEqual(['force'])
  })
})
