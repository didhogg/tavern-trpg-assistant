// 缺的条目 → 该补哪本书 / 哪个包（P5 T6 后4）。
import { describe, expect, it } from 'vitest'
import { suggestDownloads } from '../../../src/library/missing-refs'
import { sourceFromHash } from '../../../src/library/hash-source'
import type { BrewPack } from '../../../src/library/brew-packs'

const pack = (id: string, sources: string[], hashes: Record<string, string[]> = {}, dependencies: unknown = null): BrewPack => ({
  docIdLocal: id, filename: `${id}.json`, url: null, origin: 'import', isEditable: false, timeAdded: 0, sources, sourceInfo: [], dependencies, includes: null,
  props: Object.fromEntries(Object.entries(hashes).map(([k, v]) => [k, v.length])), hashes, requires: [], entryCount: 0,
})
const world = (packs: BrewPack[]) => ({
  brewPacks: { list: async () => packs } as never,
  directory: { peek: async () => ({ sources: {}, books: [{ id: 'PHB', source: 'PHB', name: '玩家手册' }, { id: 'XGE', source: 'XGE', name: '姜' }], adventures: [{ id: 'LMoP', source: 'LMoP', name: '矿坑' }] }) } as never,
  revisions: { published: async () => ({ officialState: async (id: string) => (id === 'cn-official' ? { status: 'installed', sources: ['PHB'] } : null), derivedGet: async () => null, derivedPut: async () => undefined, derivedKeys: async () => new Map() }) } as never,
})

describe('sourceFromHash', () => {
  const known = new Map([['phb', 'PHB'], ['xge', 'XGE'], ['teb:sv', 'TEB:SV']])
  it('普通、子职（来源在状态段）、埋表（~ 后缀）都能推；推不出是 null', () => {
    expect(sourceFromHash('%e7%81%ab%e7%90%83%e6%9c%af_phb', known)).toBe('PHB')
    expect(sourceFromHash('wizard_phb,state:sub~bladesinger~xge=1', known)).toBe('XGE')
    expect(sourceFromHash('goblin_xge~monster~t1', known)).toBe('XGE')
    expect(sourceFromHash('nothing_zzz', known)).toBeNull()
  })
})

describe('suggestDownloads', () => {
  it('官方：没装的书按书给；书已装但条目没了算补不回来；冒险也按本', async () => {
    const r = await suggestDownloads(world([]), [
      { set: 'cn-official', prop: 'spell', hash: 'a_xge', label: '甲' }, { set: 'cn-official', prop: 'spell', hash: 'b_xge' },
      { set: 'cn-official', prop: 'spell', hash: 'gone_phb' }, { set: 'cn-official', prop: 'monster', hash: 'm_lmop' },
    ])
    expect(r.suggestions.map((x) => [x.set, x.book?.id, x.refs])).toEqual([['cn-official', 'XGE', 2], ['cn-official', 'LMoP', 1]])
    expect(r.unresolved.map((x) => x.hash)).toEqual(['gone_phb'])
  })
  it('自制：条目所在包缺依赖 → 补依赖来源（注明是哪个包）；包完好条目没了 → 补不回来；包没装 → 按编号里的来源找', async () => {
    const packs = [pack('psion', ['LLPS'], { class: ['psion_llps'] }, { spell: ['llspell'] }), pack('ok', ['OK'], { spell: ['x_ok'] })]
    const r = await suggestDownloads(world(packs), [
      { set: 'cn-brew', prop: 'class', hash: 'psion_llps' }, { set: 'cn-brew', prop: 'spell', hash: 'x_ok' }, { set: 'cn-brew', prop: 'spell', hash: 'y_other' },
    ])
    expect(r.suggestions.map((x) => [x.kind, x.sources, x.via])).toEqual([['brew', ['llspell'], 'psion.json'], ['brew', ['other'], null]])
    expect(r.unresolved.map((x) => x.hash)).toEqual(['x_ok'])
  })
})
