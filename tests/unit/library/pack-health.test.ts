// 包体检（P5 T6 后2）：已装自制包缺哪些依赖；官方来源对到书号；判断与删除预览同一套。
import { describe, expect, it } from 'vitest'
import { packHealth } from '../../../src/library/pack-health'
import type { BrewPack } from '../../../src/library/brew-packs'

const pack = (id: string, sources: string[], hashes: Record<string, string[]> = {}, dependencies: unknown = null): BrewPack => ({
  docIdLocal: id, filename: `${id}.json`, url: null, origin: 'import', isEditable: false, timeAdded: 0, sources, sourceInfo: [], dependencies, includes: null,
  props: Object.fromEntries(Object.entries(hashes).map(([k, v]) => [k, v.length])), hashes, requires: [], entryCount: 0,
})

function world(packs: BrewPack[], officialSources: string[] | null) {
  const view = {
    officialState: async (id: string) => (id === 'cn-official' ? { status: 'installed', sources: officialSources } : null),
    derivedGet: async () => null, derivedPut: async () => undefined,
    derivedKeys: async () => new Map([['parsed:cn-official:spell', { value: { sources: ['PHB', 'MM'] } }]]),
  }
  return {
    brewPacks: { list: async () => packs } as never,
    directory: { peek: async () => ({ sources: { PHB: {}, MM: {}, XGE: {} }, books: [{ id: 'PHB', source: 'PHB', name: '玩家手册' }, { id: 'XGE', source: 'XGE', name: '姜' }], adventures: [] }) } as never,
    revisions: { published: async () => view } as never,
  }
}

describe('packHealth', () => {
  it('缺自制依赖、缺官方书（对到书号）、依赖齐全分别报告', async () => {
    const packs = [
      pack('psion', ['LLPS'], { class: ['psion_llps'] }, { spell: ['llspell'] }),
      pack('needXge', ['X1'], { spell: ['x_x1'] }, { spell: ['XGE'] }),
      pack('needPhb', ['X2'], { spell: ['y_x2'] }, { spell: ['PHB'] }),
    ]
    const r = await packHealth(world(packs, null), 'cn-brew')
    const by = Object.fromEntries(r.map((h) => [h.docIdLocal, h.missing]))
    expect(by.psion).toEqual([{ source: 'llspell', props: ['spell'], kind: 'brew' }])
    expect(by.needXge).toEqual([{ source: 'XGE', props: ['spell'], kind: 'official', book: { set: 'cn-official', id: 'XGE', name: '姜' } }])
    expect(by.needPhb).toEqual([]) // 「全部已装」也按本机数据展开，PHB 算已装
  })
  it('只看一个包；装上提供者后不再缺', async () => {
    const packs = [pack('psion', ['LLPS'], { class: ['psion_llps'] }, { spell: ['llspell'] }), pack('prov', ['llspell'], { spell: ['a_llspell'] })]
    const r = await packHealth(world(packs, ['PHB']), 'cn-brew', 'psion')
    expect(r).toEqual([{ docIdLocal: 'psion', filename: 'psion.json', missing: [] }])
  })
})
