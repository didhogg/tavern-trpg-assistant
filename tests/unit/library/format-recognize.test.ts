import { describe, expect, it } from 'vitest'
import { formatOfCodeSet, recognizeText, splitRecognized } from '../../../src/library/formats'
import { authorImportOk, brewImport } from '../../../src/library/service-brew'
import { CODE_SETS, SOURCES } from '../../../src/library/sources'

// P5.5 A3：导入前先认格式。只看作者结构定义规定的外壳（_meta.sources），内容对不对交给校验器。
const codeSet = Object.keys(CODE_SETS).find((cs) => CODE_SETS[cs].format === '5etools')!
const f = formatOfCodeSet(codeSet)
const brew = JSON.stringify({ _meta: { sources: [{ json: 'X' }] }, spell: [] })
const foundryItem = JSON.stringify({ name: '火球术', type: 'spell', system: {}, _stats: { systemId: 'dnd5e', systemVersion: '6.1.0' } })
const foundryArray = JSON.stringify([{ name: 'a', _stats: { systemId: 'CoC7' } }])

describe('认文件格式（recognizeText）', () => {
  it('5etools 自制：收', () => {
    expect(recognizeText(f, brew)).toEqual({ ok: true })
  })
  it('Foundry 导出的数据：拒收，并说出是哪个规则系统', () => {
    const one = recognizeText(f, foundryItem)
    expect(one.ok).toBe(false)
    if (!one.ok) expect(one.reason).toContain('Foundry VTT（规则系统 dnd5e）')
    const arr = recognizeText(f, foundryArray)
    if (!arr.ok) expect(arr.reason).toContain('CoC7')
    expect(arr.ok).toBe(false)
  })
  it('别的 JSON（缺 _meta.sources）：拒收，说明要什么', () => {
    const r = recognizeText(f, JSON.stringify({ hello: 1 }))
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.reason).toContain('_meta.sources')
    expect(recognizeText(f, JSON.stringify({ _meta: {} })).ok).toBe(false)
  })
  it('不是合法 JSON：放行，交给作者列进「不是 JSON」（不改原来的行为）', () => {
    expect(recognizeText(f, '{ bad')).toEqual({ ok: true })
  })
  it('一批文件分成收 / 拒收', () => {
    const r = splitRecognized(f, [{ name: 'a.json', text: brew }, { name: 'b.json', text: foundryItem }])
    expect(r.accepted.map((x) => x.name)).toEqual(['a.json'])
    expect(r.rejected.map((x) => x.name)).toEqual(['b.json'])
  })
})

describe('brewImport：一个都认不出时报错，什么都不改', () => {
  it('不开修改操作、不交给作者', async () => {
    const set = SOURCES.find((s) => s.kind === 'brew' && s.codeSet === codeSet)!
    let begun = 0
    const ctx = { operations: { begin: async () => { begun++; throw new Error('不该开操作') } } }
    await expect(brewImport(ctx as never, set.id, [{ name: 'b.json', text: foundryItem }])).rejects.toThrow('没有可以导入的文件')
    expect(begun).toBe(0)
  })
})

describe('导入成没成按作者的结果（authorImportOk）', () => {
  it('加进了包：成，即使小窗收到作者容忍的错误（断网取不到来源索引）', () => {
    expect(authorImportOk({ value: { added: [{}] }, errors: ['Uncaught Error: 请求 JSON 时发生网络错误'] })).toBe(true)
  })
  it('一个没加、也没有错：成（同一个文件再导一次，作者不重复加）', () => {
    expect(authorImportOk({ value: { added: [] }, errors: [] })).toBe(true)
  })
  it('一个没加、还有错：没成（作者出错时整批不加）', () => {
    expect(authorImportOk({ value: { added: [] }, errors: ['x'] })).toBe(false)
  })
})
