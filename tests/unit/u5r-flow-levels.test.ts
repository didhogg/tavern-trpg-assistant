import { readFileSync } from 'node:fs'
import { strFromU8, unzipSync } from 'fflate'
import { describe, expect, it } from 'vitest'
import { applyFlow, applyLevels, oldSources, planFlow, grantId, type EntrySource } from '../../src/ui/people/card/flowOps'
import { derivePerson, levelDiff } from '../../src/rules/dnd5e2014/derive'
import type { BackgroundData, ClassData, RaceData } from '../../src/rules/dnd5e2014/data/entries/character'
import type { MonsterData } from '../../src/rules/dnd5e2014/data/entries/spell-monster'

const zip = unzipSync(new Uint8Array(readFileSync('packs/dnd5e2014-srd.trpgpack')))
const list = (t: string): Array<{ id: string; name: string; data: unknown }> => JSON.parse(strFromU8(zip[`entries/${t}.json`]!))
const all = new Map([...list('race'), ...list('class'), ...list('background'), ...list('subrace')].map((e) => [e.id, e]))
const src: EntrySource = {
  raceOf: (id) => (id ? (all.get(id)?.data as RaceData | undefined) : undefined),
  classOf: (id) => (id ? (all.get(id)?.data as ClassData | undefined) : undefined),
  backgroundOf: (id) => (id ? (all.get(id)?.data as BackgroundData | undefined) : undefined),
  nameOf: (id) => (id ? all.get(id)?.name ?? id : ''),
}
const blank = (o: object = {}): MonsterData => ({ speed: {}, senses: [], languages: [], ...o }) as unknown as MonsterData
const sel = (b: MonsterData, kind: 'race' | 'class' | 'background', id: string) => planFlow(b, src, { kind, id, assign: true }).write.map((w) => grantId(w.grant))

describe('U5R 种族流程：选用 / 分配 / 更换', () => {
  it('只选用，先不分配：只写 block.race，不写熟练', () => {
    const n = applyFlow(blank(), src, { kind: 'race', id: 'race.dwarf.phb', assign: false })
    expect(n.race).toBe('race.dwarf.phb'); expect(n.proficiencies).toBeUndefined()
  })
  it('分配页全不勾也能应用（只记录选择）', () => {
    const n = applyFlow(blank(), src, { kind: 'race', id: 'race.dwarf.phb', assign: true, selected: [] })
    expect(n.race).toBe('race.dwarf.phb'); expect(n.proficiencies).toBeUndefined()
  })
  it('勾选的写入，带 auto 来源（条目编号）', () => {
    const b = blank()
    const n = applyFlow(b, src, { kind: 'race', id: 'race.dwarf.phb', assign: true, selected: sel(b, 'race', 'race.dwarf.phb') })
    expect(n.proficiencies?.languages?.map((r) => r.id)).toEqual(['common', 'dwarvish'])
    expect(n.proficiencies?.languages?.[0]?.sources).toEqual([{ kind: 'auto', from: 'race:race.dwarf.phb' }])
  })
  it('更换种族：旧来源内容被移除（默认），手动项保留，新来源出现', () => {
    let b = applyFlow(blank(), src, { kind: 'race', id: 'race.dwarf.phb', assign: true, selected: sel(blank(), 'race', 'race.dwarf.phb') })
    b = { ...b, proficiencies: { ...b.proficiencies, languages: [...(b.proficiencies?.languages ?? []), { id: 'orc', sources: [{ kind: 'manual' }] }] } }
    expect(oldSources(b, 'race')).toEqual(['race:race.dwarf.phb'])
    const next = applyFlow(b, src, { kind: 'race', id: 'race.elf.phb', assign: true, selected: sel(b, 'race', 'race.elf.phb') })
    const ids = next.proficiencies?.languages?.map((r) => r.id) ?? []
    expect(ids).toContain('orc'); expect(ids).not.toContain('dwarvish'); expect(ids).toContain('elvish')
    expect(next.race).toBe('race.elf.phb')
  })
  it('更换时取消「移除旧内容」：旧项保留', () => {
    const b = applyFlow(blank(), src, { kind: 'race', id: 'race.dwarf.phb', assign: true, selected: sel(blank(), 'race', 'race.dwarf.phb') })
    const next = applyFlow(b, src, { kind: 'race', id: 'race.elf.phb', assign: true, removeOld: false, selected: [] })
    expect(next.proficiencies?.languages?.map((r) => r.id)).toContain('dwarvish')
  })
  it('只选用时不移除旧来源内容', () => {
    const b = applyFlow(blank(), src, { kind: 'race', id: 'race.dwarf.phb', assign: true, selected: sel(blank(), 'race', 'race.dwarf.phb') })
    const next = applyFlow(b, src, { kind: 'race', id: 'race.elf.phb', assign: false })
    expect(next.race).toBe('race.elf.phb'); expect(next.proficiencies?.languages?.map((r) => r.id)).toContain('dwarvish')
  })
  it('职业：写豁免与补选的技能；等级默认 1，更换保留原等级', () => {
    const picks = { skills: ['arcana', 'history'] }
    const b = blank()
    const plan = planFlow(b, src, { kind: 'class', id: 'class.wizard.phb', assign: true, picks })
    const n = applyFlow(b, src, { kind: 'class', id: 'class.wizard.phb', assign: true, picks, selected: plan.write.map((w) => grantId(w.grant)) })
    expect(n.classes).toEqual([{ class: 'class.wizard.phb', level: 1 }])
    expect(n.proficiencies?.saves?.map((r) => r.ability).sort()).toEqual(['int', 'wis'])
    expect(n.proficiencies?.skills?.map((r) => r.skill)).toEqual(['arcana', 'history'])
    const leveled = { ...n, classes: [{ class: 'class.wizard.phb', level: 5 }] } as MonsterData
    expect(applyFlow(leveled, src, { kind: 'class', id: 'class.bard.phb', assign: false }).classes?.[0]).toMatchObject({ class: 'class.bard.phb', level: 5 })
  })
})

describe('U5R 等级管理写入', () => {
  const wizard = src.classOf('class.wizard.phb')!
  const person = (o: object = {}) => ({ block: blank({ classes: [{ class: 'class.wizard.phb', level: 3 }], abilities: { str: 8, dex: 14, con: 14, int: 16, wis: 12, cha: 10 } }), hp: { current: 20, temp: 0, deathSaves: { success: 0, fail: 0 } }, ...o }) as never
  it('升级：等级、掷骰记录、属性提升（相同 +2、不同各 +1）、超 20 不加', () => {
    const r = applyLevels(person(), wizard, { to: 4, rolls: { 4: 6 }, asi: { 4: ['int', 'int'] }, finals: { int: 19 } })
    expect(r.block.classes?.[0]?.level).toBe(4); expect(r.hpRolls).toEqual({ '4': 6 })
    expect((r.block as unknown as { abilityGrowth?: object }).abilityGrowth).toBeUndefined()
    expect(r.skipped).toEqual([{ level: 4, ability: 'int' }])
    const ok = applyLevels(person(), wizard, { to: 4, asi: { 4: ['int', 'wis'] }, finals: { int: 16, wis: 12 } })
    expect((ok.block as unknown as { abilityGrowth: object }).abilityGrowth).toEqual({ int: 1, wis: 1 }); expect(ok.asiLog).toEqual({ '4': ['int', 'wis'] })
  })
  it('降级：移除记录的掷骰与属性提升（可取消）；当前生命压到新上限；生命骰已用压到总数', () => {
    const up = applyLevels(person(), wizard, { to: 5, rolls: { 4: 6, 5: 3 }, asi: { 4: ['int', 'wis'] }, finals: { int: 16, wis: 12 } })
    const p = person({ block: up.block, hpRolls: up.hpRolls, asiLog: up.asiLog, hitDiceUsed: { '6': 4 } })
    const down = applyLevels(p, wizard, { to: 3, newMax: 10 })
    expect(down.block.classes?.[0]?.level).toBe(3); expect(down.hpRolls).toBeUndefined(); expect(down.asiLog).toBeUndefined()
    expect((down.block as unknown as { abilityGrowth?: object }).abilityGrowth).toBeUndefined()
    expect(down.hitDiceUsed).toEqual({ '6': 3 }); expect(down.hpCurrent).toBe(10)
    const keep = applyLevels(p, wizard, { to: 3, removeOnDown: false })
    expect((keep.block as unknown as { abilityGrowth: object }).abilityGrowth).toEqual({ int: 1, wis: 1 })
  })
  it('生命：写入的掷骰进入派生函数（取记录值）', () => {
    const r = applyLevels(person(), wizard, { to: 4, rolls: { 4: 6 } })
    const ctx = { classes: [{ id: 'c', entry: wizard, level: 4 }], equipmentEffects: [] }
    const avg = derivePerson({ ...person(), block: r.block } as never, ctx).hp.value!
    const rolled = derivePerson({ ...person(), block: r.block, hpRolls: r.hpRolls } as never, ctx).hp.value!
    expect(rolled - avg).toBe(6 - 4)
    expect(levelDiff(wizard, 3, 4, 2).steps[0]?.level).toBe(4)
  })
})
