// 起名出口（src/rules/kernel/naming.ts）：作者编号 → 存档同一个换算 → 本战役看得见的库条目名；不分类型。
import { describe, expect, it } from 'vitest'
import { namerOf } from '../../src/rules/kernel/naming'
import type { KernelRefFlags } from '../../src/core/saves/split'

// 小窗交回的形状原样节选：工具候选带作者编号，技能候选没有
const brewer: KernelRefFlags = { page: 'items.html', source: 'PHB', hash: "brewer's%20supplies_phb", propDroppable: 'item' }
const homebrew: KernelRefFlags = { page: 'items.html', source: 'MyBrew', hash: 'test%20stick_mybrew', propDroppable: 'item' }
const hidden: KernelRefFlags = { page: 'items.html', source: 'PHB', hash: "smith's%20tools_phb", propDroppable: 'item' }
const unknown: KernelRefFlags = { page: 'items.html', source: 'XXX', hash: 'nothing_xxx', propDroppable: 'item' }

const mapper = (f: KernelRefFlags) => {
  if (f.source === 'PHB') return { kind: 'item', set: 'cn-official', prop: 'item', hash: f.hash! }
  if (f.source === 'MyBrew') return { kind: 'item', set: 'cn-brew', prop: 'item', hash: f.hash! }
  return null
}
const asked: string[] = []
const rowsOf = async (prop: string) => {
  asked.push(prop)
  return prop === 'item'
    ? [{ ref: { set: 'cn-official', prop: 'item', hash: "brewer's%20supplies_phb" }, item: { name: '酿酒工具' } },
       { ref: { set: 'cn-brew', prop: 'item', hash: 'test%20stick_mybrew' }, item: { name: '测试木棍' } }]
    : []
}

describe('namerOf', () => {
  it('官方、自制都按作者编号取本战役的库名', async () => {
    const namer = namerOf(mapper, rowsOf)
    expect((await namer(brewer))?.label).toBe('酿酒工具')
    expect((await namer(homebrew))?.ref.set).toBe('cn-brew')
  })
  it('本战役看不见 / 库里没有 → null', async () => {
    const namer = namerOf(mapper, rowsOf)
    expect(await namer(hidden)).toBeNull()
    expect(await namer(unknown)).toBeNull()
  })
  it('同一类条目只查一次', async () => {
    asked.length = 0
    const namer = namerOf(mapper, rowsOf)
    await namer(brewer); await namer(homebrew)
    expect(asked).toEqual(['item'])
  })
})
