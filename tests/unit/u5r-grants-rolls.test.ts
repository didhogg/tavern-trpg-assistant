import { readFileSync } from 'node:fs'
import { strFromU8, unzipSync } from 'fflate'
import { describe, expect, it } from 'vitest'
import {
  assignGrants, contestOutcome, grantChoices, grantsOf, levelDiff, meetsDc, passiveValue, poolComplete, poolPlace, poolReturn, poolValue,
  randomDc, removeStale, resolveMode, restorable, rollSources, sourceTag, staleSources, STANDARD_ARRAY, derivePerson,
} from '../../src/rules/dnd5e2014/derive'
import type { Effect } from '../../src/rules/dnd5e2014/data/effects'
import type { BackgroundData, ClassData, RaceData } from '../../src/rules/dnd5e2014/data/entries/character'
import type { PoolState } from '../../src/rules/dnd5e2014/derive'

const zip = unzipSync(new Uint8Array(readFileSync('packs/dnd5e2014-srd.trpgpack')))
function entry<T>(type: string, id: string): { data: T } {
  const list = JSON.parse(strFromU8(zip[`entries/${type}.json`]!)) as Array<{ id: string; data: T }>
  const found = list.find((e) => e.id === id)
  if (!found) throw new Error(`SRD 里没有 ${id}`)
  return found
}
const dwarf = entry<RaceData>('race', 'race.dwarf.phb').data
const wizard = entry<ClassData>('class', 'class.wizard.phb').data
const acolyte = entry<BackgroundData>('background', 'background.acolyte.phb').data

describe('U5R grantsOf / 补选 / 写入 / 移除 / 可恢复（读真实 SRD 条目）', () => {
  it('职业：豁免固定、技能补选（法师任选 2，范围来自数据）', () => {
    const grants = grantsOf('class', wizard)
    expect(grants.filter((g) => g.category === 'saves').map((g) => g.key).sort()).toEqual(['int', 'wis'])
    expect(grants.some((g) => g.category === 'weapons' && g.ref === 'item.dagger.phb')).toBe(true)
    const choice = grantChoices('class', wizard).find((c) => c.category === 'skills')!
    expect(choice.count).toBe(2)
    expect(choice.from).toContain('arcana')
    expect(grantsOf('class', wizard, { skills: ['arcana', 'history'] }).filter((g) => g.category === 'skills').map((g) => g.key)).toEqual(['arcana', 'history'])
  })
  it('种族：语言固定项来自数据；工具补选', () => {
    const grants = grantsOf('race', dwarf)
    expect(grants.filter((g) => g.category === 'languages').map((g) => g.key)).toEqual(['common', 'dwarvish'])
    expect(grantChoices('race', dwarf).some((c) => c.category === 'tools' && c.count === 1)).toBe(true)
  })
  it('背景：固定技能、补选语言', () => {
    expect(grantsOf('background', acolyte).filter((g) => g.category === 'skills').map((g) => g.key).sort()).toEqual(['insight', 'religion'])
    expect(grantChoices('background', acolyte).find((c) => c.category === 'languages')!.count).toBe(2)
  })
  it('写入带 auto 来源，重复写入不产生重复行；什么都不分配也合法', () => {
    const from = sourceTag('class', 'class.wizard.phb')
    const once = assignGrants(undefined, grantsOf('class', wizard), from)
    const twice = assignGrants(once, grantsOf('class', wizard), from)
    expect(twice).toEqual(once)
    expect(once.saves?.every((r) => r.sources.some((s) => s.kind === 'auto' && s.from === from))).toBe(true)
    expect(assignGrants(undefined, [], from)).toEqual({})
  })
  it('更换来源：只移除这个来源的自动项；手动项、别的来源保留；多来源只摘来源', () => {
    const a = sourceTag('race', 'race.dwarf.phb')
    const b = sourceTag('background', 'background.acolyte.phb')
    let prof = assignGrants(undefined, [{ category: 'languages', key: 'common', label: '通用语' }], a)
    prof = assignGrants(prof, [{ category: 'languages', key: 'common', label: '通用语' }, { category: 'skills', key: 'insight', label: '洞悉' }], b)
    prof = { ...prof, skills: [...(prof.skills ?? []), { skill: 'arcana', level: 'proficient', sources: [{ kind: 'manual' }] }] }
    const stale = staleSources(prof, a)
    expect(stale).toEqual([{ category: 'languages', key: 'common', action: 'source' }])
    const after = removeStale(prof, a)
    expect(after.languages).toHaveLength(1)
    expect(after.languages![0]!.sources).toEqual([{ kind: 'auto', from: b }])
    expect(after.skills!.map((r) => r.skill).sort()).toEqual(['arcana', 'insight'])
    const gone = removeStale(after, b)
    expect(gone.languages).toBeUndefined()
    expect(gone.skills!.map((r) => r.skill)).toEqual(['arcana'])
  })
  it('可恢复 = 应分配 − 已有', () => {
    const from = sourceTag('class', 'class.wizard.phb')
    const expected = grantsOf('class', wizard, { skills: ['arcana', 'history'] })
    let prof = assignGrants(undefined, expected, from)
    expect(restorable(prof, expected)).toEqual([])
    prof = { ...prof, skills: prof.skills!.filter((r) => r.skill !== 'history') }
    expect(restorable(prof, expected).map((g) => g.key)).toEqual(['history'])
  })
})

describe('U5R poolAssign 放入 / 退回', () => {
  it('放入后该属性有值、池里该数被占用；再点退回；同一个数放到别处会让出', () => {
    let s: PoolState = { pool: STANDARD_ARRAY, placed: {} }
    s = poolPlace(s, 'str', 0)
    expect(poolValue(s, 'str')).toBe(15)
    s = poolPlace(s, 'dex', 0)
    expect(poolValue(s, 'str')).toBeNull()
    expect(poolValue(s, 'dex')).toBe(15)
    s = poolReturn(s, 'dex')
    expect(poolValue(s, 'dex')).toBeNull()
    expect(poolComplete(s)).toBe(false)
  })
})

describe('U5R levelDiff', () => {
  it('升级：生命平均 + 体质、特性与属性提升级、法术位', () => {
    const d = levelDiff(wizard, 3, 5, 2)
    expect(d.direction).toBe('up')
    expect(d.steps.map((s) => s.level)).toEqual([4, 5])
    expect(d.steps[0]!.gainAverage).toBe(Math.floor(wizard.hitDie / 2) + 1 + 2)
    expect(d.asiLevels).toEqual([4])
    expect(d.slots).not.toBeNull()
    expect(d.proficiency).toBe(3)
  })
  it('降级：反向；同级不变', () => {
    const d = levelDiff(wizard, 5, 3, 0)
    expect(d.direction).toBe('down')
    expect(d.asiLevels).toEqual([4])
    expect(levelDiff(wizard, 3, 3, 0).steps).toEqual([])
  })
})

describe('U5R rollSources 与判定', () => {
  const person = {
    hp: { current: null, temp: 0, deathSaves: { success: 0, fail: 0 } },
    block: { abilities: { str: 10, dex: 14, con: 12, int: 16, wis: 12, cha: 10 }, proficiencies: { saves: [{ ability: 'int', sources: [] }], skills: [{ skill: 'arcana', level: 'proficient', sources: [] }] } },
  } as never
  const derived = derivePerson(person, { classes: [{ id: 'c', entry: wizard, level: 3 }], equipmentEffects: [] })
  const bless: Effect[] = [
    { kind: 'rollBonus', on: 'save', dice: '1d4', label: '祝福术' },
    { kind: 'rollBonus', on: 'attack', dice: '1d4', label: '祝福术' },
  ]
  const wrap = (effects: Effect[], source = '效果') => effects.map((effect) => ({ source, effect }))
  it('技能检定：来自 parts；结构化 rollBonus 按 on 过滤；不预制任何法术名', () => {
    const none = rollSources({ kind: 'check', ability: 'int', skill: 'arcana', derived, effects: [] })
    expect(none.rows.every((r) => r.auto)).toBe(true)
    expect(none.rows.reduce((n, r) => n + (r.amount ?? 0), 0)).toBe(derived.skills.arcana.value)
    expect(none.rows.some((r) => r.dice)).toBe(false)
    const saveRows = rollSources({ kind: 'save', ability: 'int', derived, effects: wrap(bless, '祝福术') })
    expect(saveRows.rows.filter((r) => r.dice === '1d4')).toHaveLength(1)
    const checkRows = rollSources({ kind: 'check', ability: 'int', skill: 'arcana', derived, effects: wrap(bless, '祝福术') })
    expect(checkRows.rows.some((r) => r.dice)).toBe(false)
  })
  it('consumedOnUse 与 scope 过滤', () => {
    const g: Effect = { kind: 'rollBonus', on: 'check', dice: '1d4', consumedOnUse: true, scope: 'wis' }
    expect(rollSources({ kind: 'check', ability: 'wis', skill: 'insight', derived, effects: wrap([g], '神导术') }).rows.find((r) => r.dice)?.consumedOnUse).toBe(true)
    expect(rollSources({ kind: 'check', ability: 'int', skill: 'arcana', derived, effects: wrap([g], '神导术') }).rows.some((r) => r.dice)).toBe(false)
  })
  it('优势劣势：各有至少一个就抵消，不论数量（p173）', () => {
    expect(resolveMode(3, 1)).toBe('normal')
    expect(resolveMode(1, 4)).toBe('normal')
    expect(resolveMode(2, 0)).toBe('advantage')
    expect(resolveMode(0, 2)).toBe('disadvantage')
    const adv: Effect = { kind: 'advantage', on: 'check' }
    const dis: Effect = { kind: 'disadvantage', on: 'check' }
    const r = rollSources({ kind: 'check', ability: 'int', skill: 'arcana', derived, effects: [...wrap([adv, adv], '甲'), ...wrap([dis], '乙')] })
    expect(r.adv).toHaveLength(2)
    expect(r.dis).toHaveLength(1)
    expect(r.mode).toBe('normal')
  })
  it('针对它的优势（against）不算自己的掷法', () => {
    const against: Effect = { kind: 'advantage', on: 'attack', against: true }
    expect(rollSources({ kind: 'check', ability: 'int', derived, effects: wrap([against]) }).adv).toEqual([])
  })
  it('缺数据给出原因而不是 0', () => {
    const empty = derivePerson({ hp: { current: null, temp: 0, deathSaves: { success: 0, fail: 0 } }, block: {} } as never, { classes: [], equipmentEffects: [] })
    expect(rollSources({ kind: 'save', ability: 'dex', derived: empty, effects: [] }).failure).toBeTruthy()
  })
  it('DC：总值 ≥ DC 通过，不看天然 20 / 1；对抗平局局面不变；被动 ±5', () => {
    expect(meetsDc(15, 15)).toBe(true)
    expect(meetsDc(14, 15)).toBe(false)
    expect(contestOutcome(12, 12)).toBe('tie')
    expect(contestOutcome(13, 12)).toBe('a')
    expect(passiveValue(3, 'normal')).toBe(13)
    expect(passiveValue(3, 'advantage')).toBe(18)
    expect(passiveValue(3, 'disadvantage')).toBe(8)
  })
  it('随机 DC：整数 1–25，两端都取得到', () => {
    expect(randomDc(() => 0)).toBe(1)
    expect(randomDc(() => 0.999999)).toBe(25)
    for (let i = 0; i < 500; i++) { const n = randomDc(); expect(Number.isInteger(n) && n >= 1 && n <= 25).toBe(true) }
  })
})

describe('U5R 力竭与自动失败提示', () => {
  const levels = [
    { level: 1, effects: [{ kind: 'disadvantage', on: 'check' }] },
    { level: 2, effects: [{ kind: 'speed', mode: 'walk', multiplier: 0.5 }] },
    { level: 3, effects: [{ kind: 'disadvantage', on: 'attack' }, { kind: 'disadvantage', on: 'save' }] },
  ] as never
  const person = { hp: { current: null, temp: 0, deathSaves: { success: 0, fail: 0 } }, block: { abilities: { str: 10, dex: 14, con: 12, int: 16, wis: 12, cha: 10 } } } as never
  const d = derivePerson(person, { classes: [], equipmentEffects: [] })
  it('力竭累计：1 级检定劣势；3 级起豁免也劣势；2 级的速度不进掷法', async () => {
    const { effectSourcesOf } = await import('../../src/rules/dnd5e2014/derive')
    const e1 = effectSourcesOf([], 1, levels)
    expect(rollSources({ kind: 'check', ability: 'str', derived: d, effects: e1 }).dis).toEqual(['力竭 1 级'])
    expect(rollSources({ kind: 'save', ability: 'str', derived: d, effects: e1 }).dis).toEqual([])
    const e3 = effectSourcesOf([], 3, levels)
    expect(rollSources({ kind: 'save', ability: 'str', derived: d, effects: e3 }).dis).toEqual(['力竭 3 级'])
  })
  it('自动失败只做提示行，不进掷法也不拦截', () => {
    const fx: Effect = { kind: 'note', text: '不能行动或说话；力量与敏捷豁免自动失败' }
    const r = rollSources({ kind: 'save', ability: 'str', derived: d, effects: [{ source: '麻痹', effect: fx }] })
    expect(r.notes).toEqual(['麻痹：不能行动或说话；力量与敏捷豁免自动失败'])
    expect(r.mode).toBe('normal')
    expect(rollSources({ kind: 'check', ability: 'str', derived: d, effects: [{ source: '麻痹', effect: fx }] }).notes).toEqual([])
  })
})
