import { describe, expect, it } from 'vitest'
import { applyMods } from '../../tools/data/extract/load'

describe('5etools _mod 解析', () => {
  it('prependArr 支持单个对象和数组，setProp 整体替换', () => {
    const base = { name: 'x', entries: [{ p: 'base' }], title: '旧' }
    const out = applyMods(base, {
      entries: { mode: 'prependArr', items: [{ p: 'first' }, { p: 'second' }] },
      title: { mode: 'setProp', value: '新' },
    })
    expect(out.entries).toEqual([{ p: 'first' }, { p: 'second' }, { p: 'base' }])
    expect(out.title).toBe('新')
  })

  it('removeArr 支持字符串和数组 names，删不到时保持原样', () => {
    const base = { traits: [{ name: '连接' }, { name: '其他' }] }
    expect(applyMods(base, { traits: { mode: 'removeArr', names: '连接' } }).traits).toEqual([{ name: '其他' }])
    expect(applyMods(base, { traits: { mode: 'removeArr', names: ['不存在'] } }).traits).toEqual(base.traits)
  })

  it('操作数组按顺序执行，未知模式登记并保留原值', () => {
    const unsupported: Array<{ name: string; source: string; mode: string; key: string }> = []
    const out = applyMods({ text: '旧', list: ['a'] }, {
      text: [
        { mode: 'replaceTxt', replace: '旧', with: '新' },
        { mode: 'unknownMode', value: '不应写入' },
      ],
      list: [{ mode: 'appendArr', items: 'b' }, { mode: 'appendArr', items: ['c'] }],
    }, unsupported)
    expect(out.text).toBe('新')
    expect(out.list).toEqual(['a', 'b', 'c'])
    expect(unsupported).toContainEqual(expect.objectContaining({ mode: 'unknownMode', key: 'text' }))
  })
})
