import { describe, expect, it } from 'vitest'
import { applyBorrowedDurations, corroborated, durationsOfRecord, type BorrowEntry } from '../../tools/data/convert/borrow2024'

type Rec = Record<string, unknown>
const rec = (name: string, kind: string, activities: Rec[] = [], effects: Rec[] = [], source = 'XDMG'): Rec => ({ ENG_name: name, source, _foundryKind: kind, activities, effects })
const act = (units: string, value: unknown, extra: Rec = {}): Rec => ({ duration: { units, value, ...extra } })
const entry = (id: string, type: string, nameEn: string, data: Rec = {}): BorrowEntry => ({ id, type, name: nameEn, nameEn, data })
const run = (entries: BorrowEntry[], records: Rec[]) => applyBorrowedDurations([{ manifest: { id: 'p' }, entries }], records)

describe('2024 → 2014 借时长（D4）', () => {
  it('读记录：活动、特效（秒）、永续；瞬间不算；公式记为"不可用"', () => {
    expect(durationsOfRecord(rec('a', 'item', [act('分钟', '10')])).found).toEqual([{ type: 'timed', amount: 10, unit: 'minute', concentration: false }])
    expect(durationsOfRecord(rec('a', 'item', [], [{ duration: { seconds: 3600 } }])).found[0]).toMatchObject({ amount: 1, unit: 'hour' })
    expect(durationsOfRecord(rec('a', 'item', [], [{ duration: { value: 600, units: '秒' } }])).found[0]).toMatchObject({ amount: 10, unit: 'minute' })
    expect(durationsOfRecord(rec('a', 'item', [act('永续', null)])).found[0]).toMatchObject({ type: 'permanent' })
    expect(durationsOfRecord(rec('a', 'item', [act('inst', null)]))).toMatchObject({ found: [], unusable: false })
    expect(durationsOfRecord(rec('a', 'item', [act('小时', '(floor(@classes.druid.levels / 2))')]))).toMatchObject({ found: [], unusable: true })
  })

  it('借给没有时长的同名条目，并标来源；已有的不改', () => {
    const e1 = entry('item.a.dmg', 'item', 'Cloak A'); const e2 = entry('item.b.dmg', 'item', 'Cloak B', { duration: { type: 'timed', amount: 5, unit: 'minute', concentration: false } })
    const r = run([e1, e2], [rec('Cloak A', 'item', [act('小时', '1')]), rec('Cloak B', 'item', [act('小时', '9')])])
    expect(e1.data.duration).toEqual({ type: 'timed', amount: 1, unit: 'hour', concentration: false })
    expect(e1.data.extra).toEqual({ durationFrom: 'XDMG' })
    expect(e2.data.duration).toEqual({ type: 'timed', amount: 5, unit: 'minute', concentration: false })
    expect(e2.data.extra).toBeUndefined()
    expect(r).toMatchObject({ alreadyHad: 1, borrowed: [{ id: 'item.a.dmg' }] })
  })

  it('保留条目原有的 extra 字段；重复运行不再改动', () => {
    const e = entry('item.a.dmg', 'item', 'Cloak A', { extra: { foo: 1 } })
    const records = [rec('Cloak A', 'item', [act('分钟', '1')])]
    run([e], records)
    expect(e.data.extra).toEqual({ foo: 1, durationFrom: 'XDMG' })
    const again = run([e], records)
    expect(again.borrowed).toEqual([]); expect(again.alreadyHad).toBe(1)
  })

  it('24 小时与 1 天是同一个时长，不算矛盾；真正不同的值（8 小时 / 24 小时）不借并列出', () => {
    const same = entry('item.s.dmg', 'item', 'Same'); const diff = entry('item.d.dmg', 'item', 'Diff')
    const r = run([same, diff], [rec('Same', 'item', [act('小时', '24'), act('天', '1')]), rec('Diff', 'item', [act('小时', '24'), act('小时', '8')])])
    expect(same.data.duration).toMatchObject({ amount: 24, unit: 'hour' })
    expect(diff.data.duration).toBeUndefined()
    expect(r.skipped).toEqual([expect.objectContaining({ id: 'item.d.dmg', reason: 'conflict' })])
  })

  it('公式、单位不认识的不借，并写出来源原值', () => {
    const e = entry('feature.w.phb', 'feature', 'Wild Shape')
    const r = run([e], [rec('Wild Shape', 'classFeature', [act('小时', '(floor(@classes.druid.levels / 2))')])])
    expect(e.data.duration).toBeUndefined()
    expect(r.skipped[0]).toMatchObject({ reason: 'unusable' }); expect(r.skipped[0]!.detail).toContain('@classes.druid.levels')
  })

  it('类型必须对得上：物品不借职业特性的时长；特性可以借 2024 专长；同名多条不一致不借', () => {
    const item = entry('item.x.dmg', 'item', 'Protection'); const feat = entry('feature.protection.phb', 'feature', 'Protection')
    const r = run([item, feat], [rec('Protection', 'feat', [act('回合', '1')], [], 'XPHB')])
    expect(item.data.duration).toBeUndefined()
    expect(feat.data.duration).toMatchObject({ unit: 'round' })
    expect(r.borrowed).toHaveLength(1)
    const amb = entry('feature.y.phb', 'feature', 'Dup')
    const r2 = run([amb], [rec('Dup', 'classFeature', [act('分钟', '1')]), rec('Dup', 'optionalfeature', [act('分钟', '10')])])
    expect(r2.skipped[0]).toMatchObject({ reason: 'ambiguous' })
  })

  it('两版规则不同：2014 正文写了别的时长（1 分钟 vs 借来的 10 分钟）就不借，写明两边的值', () => {
    const e = entry('feature.sacred.phb', 'feature', 'Sacred Weapon', { text: [{ p: '持续 1 分钟。' }] })
    const ok = entry('feature.ok.phb', 'feature', 'Rage Like', { text: [{ p: '直到你的下个回合开始。' }] })
    const r = run([e, ok], [rec('Sacred Weapon', 'subclassFeature', [act('分钟', '10')], [], 'XPHB'), rec('Rage Like', 'classFeature', [act('回合', '1')], [], 'XPHB')])
    expect(e.data.duration).toBeUndefined()
    expect(r.skipped).toEqual([expect.objectContaining({ id: 'feature.sacred.phb', reason: 'differs', detail: expect.stringContaining('1分钟') })])
    expect(ok.data.duration).toMatchObject({ amount: 1, unit: 'round' }) // 正文没有任何时长数字：照借
  })

  it('正文印证：找得到同样的数字与单位（24 小时 = 1 天互通）', () => {
    const e = entry('item.a.dmg', 'item', 'A', { text: [{ p: '持续时间 10 分钟，或直到你解除。' }] })
    expect(corroborated(e, { type: 'timed', amount: 10, unit: 'minute', concentration: false })).toBe(true)
    expect(corroborated(e, { type: 'timed', amount: 1, unit: 'hour', concentration: false })).toBe(false)
    const d = entry('item.b.dmg', 'item', 'B', { text: [{ p: '效果持续 24 小时。' }] })
    expect(corroborated(d, { type: 'timed', amount: 1, unit: 'day', concentration: false })).toBe(true)
  })
})
