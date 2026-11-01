import { describe, expect, it } from 'vitest'
import { applyFixes, type Fix, type Rule } from '../../tools/data/fix/engine'
import type { ConvertedPack } from '../../tools/data/convert'

const entry = (id: string, data: Record<string, unknown>) => ({ id, type: 'item', name: id, data })
const packs = (): ConvertedPack[] => [{
  manifest: { id: 'p1' } as never,
  features: [],
  entries: [entry('item.a.phb', { value: 1, list: [1, 2, 3], obj: { x: 1 } }), entry('item.b.phb', { value: 2 })] as never,
}]
const run = (rows: Fix[], rules: Rule[] = [], p = packs()) => { const r = applyFixes(p, rules, [{ file: 't.ts', rows }]); return { p, r } }
const data = (p: ConvertedPack[], id: string) => (p[0].entries.find((e) => e.id === id) as unknown as { data: Record<string, unknown> }).data

describe('T4 修正引擎：逐条修正表', () => {
  it('set / 新增字段（before 写 undefined）/ delete / insert 各自生效', () => {
    const { p, r } = run([
      { id: 'item.a.phb', path: '/data/value', op: 'set', before: 1, after: 0.2, basis: 'x' },
      { id: 'item.a.phb', path: '/data/obj/y', op: 'set', before: undefined, after: 5, basis: 'x' },
      { id: 'item.a.phb', path: '/data/obj/x', op: 'delete', before: 1, basis: 'x' },
      { id: 'item.a.phb', path: '/data/list/1', op: 'insert', after: 9, basis: 'x' },
    ])
    expect(data(p, 'item.a.phb')).toEqual({ value: 0.2, list: [1, 9, 2, 3], obj: { y: 5 } })
    expect(r.rows).toHaveLength(4)
  })
  it('before 不符、找不到条目、越界、重复行、缺 basis：全部收集后一次失败，并指出第几行', () => {
    const rows: Fix[] = [
      { id: 'item.a.phb', path: '/data/value', op: 'set', before: 99, after: 0, basis: 'x' },
      { id: 'item.nope.phb', path: '/data/value', op: 'set', before: 1, after: 0, basis: 'x' },
      { id: 'item.a.phb', path: '/data/list/7', op: 'insert', after: 0, basis: 'x' },
      { id: 'item.b.phb', path: '/data/value', op: 'set', before: 2, after: 3, basis: 'x' },
      { id: 'item.b.phb', path: '/data/value', op: 'set', before: 3, after: 4, basis: 'x' },
      { id: 'item.b.phb', path: '/data/zzz', op: 'set', before: undefined, after: 1, basis: ' ' },
    ]
    expect(() => run(rows)).toThrow(/修正失败 5 处[\s\S]*第 1 行[\s\S]*现状与 before 不符[\s\S]*第 2 行[\s\S]*匹配到 0 个[\s\S]*第 3 行[\s\S]*越界[\s\S]*第 5 行[\s\S]*出现两次[\s\S]*第 6 行[\s\S]*缺 basis/)
  })
  it('add：新增条目进指定的包；id 已存在或包不存在都失败', () => {
    const e = entry('item.new.phb', { value: 5 }) as never
    const { p } = run([{ op: 'add', pack: 'p1', entry: e, basis: 'x' }])
    expect(p[0].entries.map((x) => x.id)).toContain('item.new.phb')
    expect(() => run([{ op: 'add', pack: 'p1', entry: entry('item.a.phb', {}) as never, basis: 'x' }])).toThrow('已存在')
    expect(() => run([{ op: 'add', pack: 'zz', entry: e, basis: 'x' }])).toThrow('没有包 zz')
  })
})

describe('T4 修正引擎：修正规则', () => {
  const bump: Rule = { name: 'bump', expectCount: 2, apply: (ps) => ps.flatMap((pk) => pk.entries).map((e) => { const d = e.data as { value: number }; d.value += 1; return e.id }) }
  it('命中数等于 expectCount 才通过；不等就失败', () => {
    const { p, r } = run([], [bump])
    expect(data(p, 'item.b.phb').value).toBe(3)
    expect(r.rules).toEqual([{ name: 'bump', expect: 2, changed: 2 }])
    expect(() => run([], [{ ...bump, expectCount: 3 }])).toThrow('命中 2 个条目，预期 3')
  })
  it('规则先于逐条表执行；规则重名报错', () => {
    const { p } = run([{ id: 'item.b.phb', path: '/data/value', op: 'set', before: 3, after: 10, basis: 'x' }], [bump])
    expect(data(p, 'item.b.phb').value).toBe(10)
    expect(() => run([], [bump, bump])).toThrow('重名')
  })
})
