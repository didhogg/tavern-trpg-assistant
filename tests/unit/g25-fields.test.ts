import { describe, expect, it } from 'vitest'
import { effectSchema } from '../../src/rules/dnd5e2014/data/effects'
import { requiresSchema } from '../../src/rules/dnd5e2014/data/requires'
import { evaluateFormula, strictFormulaSchema, unknownVariables } from '../../src/rules/dnd5e2014/data/formula'
import { checkJoins } from '../../src/rules/dnd5e2014/data/joins'
import { structuralRefs } from '../../src/rules/dnd5e2014/data/refs'
import { startingItemSchema } from '../../src/rules/dnd5e2014/data/starting'
import {
  conditionalDamageSchema, consumedSchema, consumesSchema, dialectCodesSchema, priceSchema, rechargeRollSchema, restoreSchema, summonSchema, toolChooseSchema, trackerSchema, upcastSchema,
} from '../../src/rules/dnd5e2014/data/g25'
import { featureDataSchema, raceDataSchema } from '../../src/rules/dnd5e2014/data/entries/character'
import { spellDataSchema } from '../../src/rules/dnd5e2014/data/entries/spell-monster'
import { validateG25 } from '../../tools/data/validate/g25'
import type { ConvertedPack } from '../../tools/data/convert'

/** 所有条目必备的公共字段（来源页与署名）。 */
const COMMON = { src: { book: 'PHB', page: 1 }, credit: { by: '不全书', license: 'GPL-3.0' } }
const ok = (schema: { safeParse: (v: unknown) => { success: boolean } }, v: unknown): boolean => schema.safeParse(v).success

describe('G2.5 新字段：资源与休息（A）', () => {
  it('consumes：池必须是条目 id，数量是正整数', () => {
    expect(ok(consumesSchema, { pool: 'feature.bard-bardic-inspiration.phb', amount: 1 })).toBe(true)
    expect(ok(consumesSchema, { pool: 'feature.x.phb' })).toBe(true)
    expect(ok(consumesSchema, { pool: 'feature.x.phb', amount: 0 })).toBe(false)
    expect(ok(consumesSchema, { pool: 'feature.x.phb', amount: 1, extra: 1 })).toBe(false)
  })
  it('restores：on=event 必须有 event；amount 可以是 all、整数或公式；保留池 spellSlots', () => {
    expect(ok(restoreSchema, { pool: 'feature.bard-bardic-inspiration.phb', on: 'short', amount: 'all' })).toBe(true)
    expect(ok(restoreSchema, { on: 'event', event: '掷狂野魔法浪涌表', amount: 1 })).toBe(true)
    expect(ok(restoreSchema, { on: 'event', amount: 1 })).toBe(false)
    expect(ok(restoreSchema, { on: 'short', event: 'x', amount: 1 })).toBe(false)
    expect(ok(restoreSchema, { pool: 'spellSlots', on: 'short', amount: 'floor(class.wizard.level / 2)', limit: '环阶合计不超过法师等级的一半' })).toBe(true)
    expect(ok(restoreSchema, { on: 'long', amount: 'foo + 1' })).toBe(false)
    expect(ok(restoreSchema, { on: 'weekly', amount: 1 })).toBe(false)
  })
  it('tracker：四种 kind 各有必填项', () => {
    expect(ok(trackerSchema, { kind: 'escalate', start: 10, step: 5, reset: 'shortOrLong' })).toBe(true)
    expect(ok(trackerSchema, { kind: 'perTarget', reset: 'long' })).toBe(true)
    expect(ok(trackerSchema, { kind: 'choice', reset: 'shortOrLong' })).toBe(true)
    expect(ok(trackerSchema, { kind: 'cooldown', cooldown: { unit: 'day', amount: 7 } })).toBe(true)
    expect(ok(trackerSchema, { kind: 'cooldown', cooldown: { unit: 'longRest', amount: '1d4' } })).toBe(true)
    expect(ok(trackerSchema, { kind: 'escalate', start: 10, reset: 'long' })).toBe(false)
    expect(ok(trackerSchema, { kind: 'cooldown', reset: 'long', cooldown: { unit: 'day', amount: 7 } })).toBe(false)
    expect(ok(trackerSchema, { kind: 'sometimes', reset: 'long' })).toBe(false)
  })
  it('特性条目认 consumes / restores / tracker，旧数据（没有这些）照样合法', () => {
    const base = { ...COMMON, name: '测试', text: [] }
    expect(ok(featureDataSchema, base)).toBe(true)
    expect(ok(featureDataSchema, { ...base, consumes: { pool: 'feature.a.phb' }, restores: [{ on: 'long', amount: 'all' }], tracker: { kind: 'choice', reset: 'long' } })).toBe(true)
    expect(ok(featureDataSchema, { ...base, restores: [] })).toBe(false)
  })
})

describe('G2.5 新字段：状态与效果（B）', () => {
  it('against / autoCrit：autoCrit 只能与 against 同用，against 只允许攻击', () => {
    expect(ok(effectSchema, { kind: 'advantage', on: 'attack', against: true, scope: '近战攻击' })).toBe(true)
    expect(ok(effectSchema, { kind: 'advantage', on: 'attack', against: true, autoCrit: { within: 5 } })).toBe(true)
    expect(ok(effectSchema, { kind: 'advantage', on: 'attack', autoCrit: { within: 5 } })).toBe(false)
    expect(ok(effectSchema, { kind: 'advantage', on: 'save', against: true })).toBe(false)
    expect(ok(effectSchema, { kind: 'advantage', on: 'check' })).toBe(true)
  })
  it('critRange / critDice', () => {
    expect(ok(effectSchema, { kind: 'critRange', min: 19, scope: 'weapon' })).toBe(true)
    expect(ok(effectSchema, { kind: 'critRange', min: 1, scope: 'weapon' })).toBe(false)
    expect(ok(effectSchema, { kind: 'critDice', count: 1, scope: 'melee' })).toBe(true)
    expect(ok(effectSchema, { kind: 'critDice', count: 0, scope: 'melee' })).toBe(false)
    expect(ok(effectSchema, { kind: 'critDice', count: 1, scope: 'unarmed' })).toBe(false)
  })
  it('when：status / armor / shield 只认定死的取值', () => {
    expect(ok(requiresSchema, { all: [{ status: 'rage' }] })).toBe(true)
    expect(ok(requiresSchema, { all: [{ armor: 'none' }, { shield: 'none' }] })).toBe(true)
    expect(ok(requiresSchema, { all: [{ status: 'drunk' }] })).toBe(false)
    expect(ok(effectSchema, { kind: 'ac', mode: 'base', formula: '10 + dex.mod + con.mod', when: { all: [{ armor: 'none' }] } })).toBe(true)
  })
  it('spellGrant.level：1–20 的整数', () => {
    expect(ok(effectSchema, { kind: 'spellGrant', spells: ['spell.a.phb'], mode: 'innate', level: 3, uses: { max: 1, recharge: 'long' } })).toBe(true)
    expect(ok(effectSchema, { kind: 'spellGrant', spells: ['spell.a.phb'], mode: 'innate', level: 0 })).toBe(false)
    expect(ok(effectSchema, { kind: 'spellGrant', spells: ['spell.a.phb'], mode: 'innate', level: 21 })).toBe(false)
  })
  it('种族 abilityBonus.replace', () => {
    expect(ok(raceDataSchema, { ...COMMON, name: '变体人类', abilityBonus: { choose: { count: 2, amount: 1, from: ['str', 'dex'] }, replace: true } })).toBe(true)
    expect(ok(raceDataSchema, { ...COMMON, name: 'x', abilityBonus: { replace: true } })).toBe(false)
  })
})

describe('G2.5 新字段：法术（C）', () => {
  const spell = { ...COMMON, name: '火球术', level: 3, school: 'evocation', castTime: [{ n: 1, unit: 'action' }], range: { type: 'point' }, components: { v: true, s: true }, duration: [{ type: 'instant' }] }
  it('upcast：已定义的 kind 合法，新 kind 与缺必填项被拒', () => {
    const list = [
      { kind: 'damage', dice: '1d6', type: 'fire', step: 1 }, { kind: 'heal', dice: '1d8' }, { kind: 'targets', add: 1 },
      { kind: 'area', add: 5, unit: 'ft' }, { kind: 'duration', table: [{ slot: 5, value: '8 小时' }, { slot: 7, value: '24 小时' }] },
      { kind: 'note', text: '只留文字', auto: false },
    ]
    expect(ok(upcastSchema, list)).toBe(true)
    expect(ok(upcastSchema, [{ kind: 'summon', add: 1 }])).toBe(false)
    expect(ok(upcastSchema, [{ kind: 'note', text: 'x', auto: true }])).toBe(false)
    expect(ok(upcastSchema, [{ kind: 'damage', dice: '1d6' }])).toBe(false)
    expect(ok(upcastSchema, [])).toBe(false)
    expect(ok(spellDataSchema, spell)).toBe(true)
    expect(ok(spellDataSchema, { ...spell, upcast: list })).toBe(true)
  })
  it('材料成分 consumed：true｜false｜"optional"', () => {
    for (const v of [true, false, 'optional']) expect(ok(consumedSchema, v)).toBe(true)
    expect(ok(consumedSchema, 'maybe')).toBe(false)
    expect(ok(spellDataSchema, { ...spell, components: { v: true, s: true, m: { text: '一颗钻石', cost: 50000, consumed: 'optional' } } })).toBe(true)
  })
  it('spellLists：目标是职业、spells 必须是已存在的法术、只能由特性登记；joins 的 as 仍只认三个值', () => {
    const entries = new Map<string, { type: string; data: Record<string, unknown> }>([
      ['class.ranger.phb', { type: 'class', data: {} }], ['spell.aid.phb', { type: 'spell', data: {} }], ['item.rope.phb', { type: 'item', data: {} }],
    ])
    const lookup = (id: string) => entries.get(id)
    const anchor = (spellLists: unknown[], type = 'feature') => checkJoins({ id: 'feature.ranger-additional-spells.tce', type, data: { spellLists } }, lookup)
    expect(anchor([{ to: 'class.ranger.phb', spells: ['spell.aid.phb'] }])).toEqual([])
    expect(anchor([{ to: 'class.ranger.phb', spells: ['spell.nope.phb'] }]).join()).toContain('不存在')
    expect(anchor([{ to: 'class.ranger.phb', spells: ['item.rope.phb'] }]).join()).toContain('不是法术')
    expect(anchor([{ to: 'class.ranger.phb' }]).join()).toContain('spells')
    expect(anchor([{ to: 'item.rope.phb', spells: ['spell.aid.phb'] }]).join()).toContain('职业')
    expect(anchor([{ to: 'class.ranger.phb', spells: ['spell.aid.phb'] }], 'spell').join()).toContain('特性')
    expect(checkJoins({ id: 'feature.x.tce', type: 'feature', data: { joins: [{ to: 'class.ranger.phb', level: 0, as: 'spell', spells: ['spell.aid.phb'] }] } }, lookup).join()).toContain('as 不合法')
    expect(ok(featureDataSchema, { ...COMMON, name: '锚点', spellLists: [{ to: 'class.ranger.phb', spells: ['spell.aid.phb'] }] })).toBe(true)
    expect(ok(featureDataSchema, { ...COMMON, name: '锚点', spellLists: [{ to: 'class.ranger.phb', spells: [] }] })).toBe(false)
  })
})

describe('G2.5 新字段：物品与装备（D）与背景（E）', () => {
  it('价格最多一位小数', () => {
    for (const v of [0, 0.1, 0.2, 2.5, 50]) expect(ok(priceSchema, v)).toBe(true)
    for (const v of [0.25, -1, 0.05]) expect(ok(priceSchema, v)).toBe(false)
  })
  it('起始装备项可带 id；toolChoose 只认三个记号', () => {
    expect(ok(startingItemSchema, { item: '羽毛笔', id: 'item.ink-pen.phb', qty: 1 })).toBe(true)
    expect(ok(startingItemSchema, { item: '羽毛笔', id: 'Item Pen' })).toBe(false)
    expect(ok(toolChooseSchema, { count: 3, from: ['tool:anyMusicalInstrument'] })).toBe(true)
    expect(ok(toolChooseSchema, { count: 1, from: ['tool:anyArtisansTool', 'tool:anyMusicalInstrument'] })).toBe(true)
    expect(ok(toolChooseSchema, { count: 1, from: ['tool:anything'] })).toBe(false)
  })
  it('起始装备 id 与背景借用进入结构引用（构建时检查存在与依赖方向）', () => {
    const refs = structuralRefs({
      characteristicsFrom: 'background.soldier.phb',
      equipment: [{ fixed: [{ item: '羽毛笔', id: 'item.ink-pen.phb', qty: 1 }, { item: '描述性物品', qty: 1 }], choice: [[{ item: '短剑', id: 'item.shortsword.phb', qty: 1 }]] }],
      consumes: { pool: 'feature.bard-bardic-inspiration.phb' },
      restores: [{ pool: 'spellSlots', on: 'long', amount: 'all' }, { pool: 'feature.p.phb', on: 'short', amount: 1 }],
      summon: { by: 'class', classId: 'class.ranger.phb', hp: '5 + class.ranger.level' },
      spellLists: [{ to: 'class.ranger.phb', spells: ['spell.aid.phb'] }],
    })
    const got = refs.map((r) => `${r.field}=${r.id}`).sort()
    expect(got).toEqual([
      'characteristicsFrom=background.soldier.phb', 'consumes.pool=feature.bard-bardic-inspiration.phb', 'equipment[].id=item.ink-pen.phb', 'equipment[].id=item.shortsword.phb',
      'restores[].pool=feature.p.phb', 'spellLists[].spells[]=spell.aid.phb', 'spellLists[].to=class.ranger.phb', 'summon.classId=class.ranger.phb',
    ].sort())
  })
  it('语言方言代码', () => {
    expect(ok(dialectCodesSchema, [{ code: 'aquan', name: '水族语' }, { code: 'auran', name: '气族语' }])).toBe(true)
    expect(ok(dialectCodesSchema, [{ code: 'Aquan', name: '水族语' }])).toBe(false)
  })
})

describe('G2.5 新字段：怪物与世界（F）与公式', () => {
  it('带条件的抗性：damage 必须是伤害代码，when 必填，except 取值固定', () => {
    expect(ok(conditionalDamageSchema, [{ damage: ['bludgeoning', 'piercing', 'slashing'], except: 'magical', when: '来自非魔法攻击' }])).toBe(true)
    expect(ok(conditionalDamageSchema, [{ damage: ['bludgeoning'], when: '来自非魔法攻击' }])).toBe(true)
    expect(ok(conditionalDamageSchema, [{ damage: ['bludgeoning'], except: 'magical' }])).toBe(false)
    expect(ok(conditionalDamageSchema, [{ damage: ['sword'], when: 'x' }])).toBe(false)
    expect(ok(conditionalDamageSchema, [{ damage: ['fire'], except: 'blessed', when: 'x' }])).toBe(false)
  })
  it('rechargeRoll：1–6 且 min ≤ max', () => {
    expect(ok(rechargeRollSchema, { min: 5, max: 6 })).toBe(true)
    expect(ok(rechargeRollSchema, { min: 6, max: 6 })).toBe(true)
    expect(ok(rechargeRollSchema, { min: 6, max: 5 })).toBe(false)
    expect(ok(rechargeRollSchema, { min: 0, max: 6 })).toBe(false)
  })
  it('summon：by=spell 要 baseLevel，by=class 要 classId，公式只用认识的变量', () => {
    expect(ok(summonSchema, { by: 'spell', baseLevel: 3, ac: '11 + spell.level', hp: '40 + 10 * (spell.level - 3)', attackBonus: 'spell.attack', damageBonus: 'spell.level' })).toBe(true)
    expect(ok(summonSchema, { by: 'class', classId: 'class.ranger.phb', hp: '4 + 5 * class.ranger.level' })).toBe(true)
    expect(ok(summonSchema, { by: 'spell', ac: '11' })).toBe(false)
    expect(ok(summonSchema, { by: 'class', hp: '10' })).toBe(false)
    expect(ok(summonSchema, { by: 'spell', baseLevel: 3, classId: 'class.ranger.phb', hp: '10' })).toBe(false)
    expect(ok(summonSchema, { by: 'spell', baseLevel: 3 })).toBe(false)
    expect(ok(summonSchema, { by: 'spell', baseLevel: 3, hp: '10 + int.score' })).toBe(false)
  })
  it('公式变量：spell.level 与 spell.attack 可求值；严格公式拒绝不认识的变量', () => {
    expect(evaluateFormula('11 + spell.level', { spellLevel: 5 })).toBe(16)
    expect(evaluateFormula('spell.attack + prof', { spellAttack: 7, prof: 3 })).toBe(10)
    expect(() => evaluateFormula('spell.level')).toThrow('没有值')
    expect(unknownVariables('2 * class.wizard.level + int.mod + scale.rage.damage + cr')).toEqual([])
    expect(unknownVariables('int.score + level')).toEqual(['int.score'])
    expect(ok(strictFormulaSchema, 'floor(level / 2)')).toBe(true)
    expect(ok(strictFormulaSchema, 'foo')).toBe(false)
  })
})

describe('G2.5 构建期不变量（validateG25）', () => {
  const pack = (entries: Array<{ id: string; type: string; data: Record<string, unknown> }>): ConvertedPack[] => [{ manifest: {} as never, features: [], entries: entries.map((e) => ({ ...e, name: e.id })) as never }]
  const pool = { id: 'feature.pool.phb', type: 'feature', data: { uses: { max: 3, recharge: 'long' } } }
  it('合规的 consumes / restores 通过', () => {
    expect(validateG25(pack([pool, { id: 'feature.user.phb', type: 'feature', data: { consumes: { pool: pool.id } } }, { id: 'feature.p2.phb', type: 'feature', data: { uses: { max: 1, recharge: 'long' }, restores: [{ on: 'short', amount: 1 }] } }]), [])).toEqual([])
  })
  it('池不存在、池没有 uses、与自己的 uses 并存、与行动级 consumption 重复，都报错', () => {
    const bad = (data: Record<string, unknown>, extra: Array<{ id: string; type: string; data: Record<string, unknown> }> = [pool]) => validateG25(pack([...extra, { id: 'feature.user.phb', type: 'feature', data }]), []).join('；')
    expect(bad({ consumes: { pool: 'feature.nope.phb' } })).toContain('不存在')
    expect(bad({ consumes: { pool: 'feature.noUses.phb' } }, [{ id: 'feature.noUses.phb', type: 'feature', data: {} }])).toContain('没有 uses')
    expect(bad({ consumes: { pool: pool.id }, uses: { max: 1, recharge: 'long' } })).toContain('不能再有自己的 uses')
    expect(bad({ consumes: { pool: pool.id }, activities: [{ consumption: { targets: [{ type: 'uses', value: 1, target: pool.id }] } }] })).toContain('重复')
    expect(bad({ restores: [{ on: 'long', amount: 'all' }] })).toContain('必须有 uses')
    expect(bad({ restores: [{ pool: 'spellSlots', on: 'long', amount: 'all' }] })).toBe('')
  })
  it('只有特性能带 consumes/restores/tracker；characteristicsFrom 要指向背景；replace 只在亚种；起始装备 id 要是物品', () => {
    const run = (e: { id: string; type: string; data: Record<string, unknown> }) => validateG25(pack([e, { id: 'background.a.phb', type: 'background', data: {} }, { id: 'spell.a.phb', type: 'spell', data: {} }]), []).join('；')
    expect(run({ id: 'spell.x.phb', type: 'spell', data: { tracker: { kind: 'choice', reset: 'long' } } })).toContain('只能写在特性上')
    expect(run({ id: 'background.b.scag', type: 'background', data: { characteristicsFrom: 'background.a.phb' } })).toBe('')
    expect(run({ id: 'background.b.scag', type: 'background', data: { characteristicsFrom: 'spell.a.phb' } })).toContain('必须是 background')
    expect(run({ id: 'race.x.phb', type: 'race', data: { abilityBonus: { replace: true } } })).toContain('只能出现在亚种')
    expect(run({ id: 'background.b.scag', type: 'background', data: { equipment: [{ fixed: [{ item: '法术书', id: 'spell.a.phb', qty: 1 }] }] } })).toContain('必须是 item')
  })
  it('lang:other 报错；只有 pending 清单里的例外（构建当前的三个种族）', () => {
    const msg = validateG25(pack([{ id: 'race.gith.mtf', type: 'race', data: { languages: ['lang:common', 'lang:other'] } }, { id: 'race.elf.phb', type: 'race', data: { languages: ['lang:other'] } }]), ['race.gith.mtf', 'race.old.mtf']).join('；')
    expect(msg).not.toContain('race.gith.mtf：带 lang:other')
    expect(msg).toContain('race.elf.phb：带 lang:other')
    expect(msg).toContain('race.old.mtf：已不再带 lang:other')
  })
})
