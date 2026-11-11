import { describe, expect, it } from 'vitest'
import { BrewPairs, dirOfPath, dirOfUrl, pairBrewFiles, type PairableFile } from '../../../src/library/brew-pairing'
import type { LibraryService } from '../../../src/library/service'

const f = (key: string, dir: string | null, ...sources: string[]): PairableFile => ({ key, dir, sources })

describe('自制包中英配对规则（照中文 fork：同目录 + 来源标识有交集，唯一才配）', () => {
  it('唯一对应就配上；只有一种语言的各自独立', () => {
    const r = pairBrewFiles([f('z1', 'spell', 'A'), f('z2', 'class', 'B')], [f('e1', 'spell', 'A'), f('e3', 'item', 'C')])
    expect(r.pairs).toEqual([{ zh: 'z1', en: 'e1' }])
    expect(r.zhOnly).toEqual(['z2'])
    expect(r.enOnly).toEqual(['e3'])
    expect(r.ambiguous).toEqual({ zh: [], en: [] })
  })

  it('目录不同不配，哪怕来源标识相同', () => {
    const r = pairBrewFiles([f('z1', 'spell', 'A')], [f('e1', 'item', 'A')])
    expect(r.pairs).toEqual([])
    expect(r.zhOnly).toEqual(['z1'])
    expect(r.enOnly).toEqual(['e1'])
  })

  it('同一目录同一来源下有多个文件：歧义，谁也不配，两边都标出来', () => {
    const r = pairBrewFiles([f('z1', 'creature', 'T'), f('z2', 'creature', 'T')], [f('e1', 'creature', 'T'), f('e2', 'creature', 'T')])
    expect(r.pairs).toEqual([])
    expect(r.ambiguous.zh.sort()).toEqual(['z1', 'z2'])
    expect(r.ambiguous.en.sort()).toEqual(['e1', 'e2'])
  })

  it('来源有交集即可（多来源的包）；互相唯一才配', () => {
    expect(pairBrewFiles([f('z1', 'class', 'A', 'B')], [f('e1', 'class', 'B', 'C')]).pairs).toEqual([{ zh: 'z1', en: 'e1' }])
    const r = pairBrewFiles([f('z1', 'class', 'A'), f('z2', 'class', 'A')], [f('e1', 'class', 'A')])
    expect(r.pairs).toEqual([])
    expect(r.ambiguous).toEqual({ zh: ['z1', 'z2'], en: ['e1'] })
  })

  it('没有来源标识的不配；没有目录（本地导入）时不限目录', () => {
    expect(pairBrewFiles([f('z1', 'spell')], [f('e1', 'spell')]).pairs).toEqual([])
    expect(pairBrewFiles([f('z1', null, 'A')], [f('e1', 'item', 'A')]).pairs).toEqual([{ zh: 'z1', en: 'e1' }])
  })

  it('目录取自相对路径与已装包的下载网址', () => {
    expect(dirOfPath('creature/Kobold Press; 万兽图志.json')).toBe('creature')
    expect(dirOfPath('单个文件.json')).toBeNull()
    const set = { mirrors: ['https://homebrew.kiwee.top/', 'https://cdn.jsdelivr.net/gh/x@master/'] }
    expect(dirOfUrl('https://homebrew.kiwee.top/spell/a.json', set)).toBe('spell')
    expect(dirOfUrl('https://cdn.jsdelivr.net/gh/x@master/item/a.json', set)).toBe('item')
    expect(dirOfUrl('https://other.example/spell/a.json', set)).toBeNull()
    expect(dirOfUrl(null, set)).toBeNull()
  })
})

type Doc = { docIdLocal: string; props: Record<string, Array<string | null>>; sources: string[] }
const pack = (id: string, url: string | null, sources: string[], extra: Record<string, unknown> = {}) => ({ head: { docIdLocal: id, url, ...extra }, meta: { sources: sources.map((json) => ({ json })) } })
const ZH = 'https://homebrew.kiwee.top/'
const EN = 'https://raw.githubusercontent.com/TheGiddyLimit/homebrew/master/'

const installed: Record<string, ReturnType<typeof pack>[]> = {
  'cn-brew': [
    pack('zA', `${ZH}spell/Au; 术.json`, ['A']),
    pack('zB', `${ZH}spell/Bu; 术.json`, ['B']),
    pack('zC', `${ZH}spell/Cu; 术.json`, ['C']),
    pack('zD', `${ZH}spell/Du; 术.json`, ['D']),
    pack('zMine', null, ['TRPGMINE'], { isEditable: true }),
  ],
  'en-brew': [pack('eA', `${EN}spell/Au; Spell.json`, ['A']), pack('eB', `${EN}spell/Bu; Spell.json`, ['B']), pack('eC', `${EN}spell/Cu; Spell.json`, ['C']), pack('eMine', null, ['TRPGMINE'], { isEditable: true })],
}
const docs: Record<string, Doc[]> = {
  cn: [
    { docIdLocal: 'zA', sources: ['A'], props: { spell: ['a_a', 'b_a', null] } },
    { docIdLocal: 'zB', sources: ['B'], props: { spell: ['x_b', 'y_b'] } },
    { docIdLocal: 'zC', sources: ['C'], props: { spell: ['p_c'] } },
    { docIdLocal: 'zD', sources: ['D'], props: { spell: ['q_d'] } },
    { docIdLocal: 'zMine', sources: ['TRPGMINE'], props: { spell: ['m_mine', 'm_dup', 'm_noeng'] } },
  ],
  en: [
    { docIdLocal: 'eA', sources: ['A'], props: { spell: ['aa_a', 'bb_a', null] } },
    { docIdLocal: 'eB', sources: ['B'], props: { spell: ['xx_b'] } },
    { docIdLocal: 'eC', sources: ['C'], props: { spell: ['pp_c'] } },
    { docIdLocal: 'eMine', sources: ['TRPGMINE'], props: { spell: ['e_mine', 'tw1', 'tw2'] } },
  ],
}
const named = (item: Record<string, unknown>, source: string) => ({ item, source })
const items: Record<string, { item: Record<string, unknown>; source: string | null }> = {
  'en-brew|spell|aa_a': named({}, 'A'), 'en-brew|spell|bb_a': named({}, 'A'), 'cn-brew|spell|a_a': named({}, 'A'), 'cn-brew|spell|b_a': named({}, 'A'),
  'cn-brew|spell|m_mine': named({ name: '我的术', ENG_name: 'My Spell' }, 'TRPGMINE'),
  'cn-brew|spell|m_dup': named({ name: '重名术', ENG_name: 'Twin' }, 'TRPGMINE'),
  'cn-brew|spell|m_noeng': named({ name: '没英文名' }, 'TRPGMINE'),
  'en-brew|spell|e_mine': named({ name: 'My Spell' }, 'TRPGMINE'),
  'en-brew|spell|tw1': named({ name: 'Twin' }, 'TRPGMINE'),
  'en-brew|spell|tw2': named({ name: 'Twin' }, 'TRPGMINE'),
}
const lib = {
  currentView: async () => ({ id: 'v', kvGet: async () => null }),
  officialInstalled: async () => true,
  brewInstalled: async (id: string) => installed[id],
  frameOf: async (codeSet: string) => ({ call: async (name: string) => { if (name !== 'brewDocIndex') throw new Error(name); return docs[codeSet] } }),
  storedItem: async (set: string, prop: string, hash: string) => items[`${set}|${prop}|${hash}`] ?? null,
  query: async (set: string, prop: string, { source }: { source?: string }) => Object.entries(items).filter(([k, v]) => k.startsWith(`${set}|${prop}|`) && v.source?.toLowerCase() === source?.toLowerCase()).map(([k, v]) => ({ hash: k.split('|')[2], source: v.source, item: v.item })),
  brewCatalog: async (id: string) => ({
    value: id === 'cn-brew'
      ? [{ urlDownload: `${ZH}spell/Au; 术.json`, path: 'spell/Au; 术.json', sources: ['A'] }, { urlDownload: `${ZH}class/Zu; 职.json`, path: 'class/Zu; 职.json', sources: ['Z'] }]
      : [{ urlDownload: `${EN}spell/Au; Spell.json`, path: 'spell/Au; Spell.json', sources: ['A'] }, { urlDownload: `${EN}item/Iu; Item.json`, path: 'item/Iu; Item.json', sources: ['I'] }, { nope: true }],
    errors: id === 'cn-brew' ? [] : ['网络一次失败'],
  }),
} as unknown as LibraryService
const ref = (set: string, hash: string) => ({ set, prop: 'spell', hash })

describe('已装自制包的中英配对与条目对应（同一下标）', () => {
  const pairs = new BrewPairs(lib)

  it('下载页目录合并：配上一行，其余各自一行，某一边取不到的错误原样交回', async () => {
    const { rows, errors } = await pairs.catalog()
    expect(rows.map((r) => [r.status, r.zh?.path ?? null, r.en?.path ?? null])).toEqual([
      ['paired', 'spell/Au; 术.json', 'spell/Au; Spell.json'],
      ['zh-only', 'class/Zu; 职.json', null],
      ['en-only', null, 'item/Iu; Item.json'],
    ])
    expect(errors).toEqual({ zh: [], en: ['网络一次失败'] })
  })

  it('已装的包两两配对，自己写的（可编辑）包不参与', async () => {
    const r = await pairs.installed()
    expect(r.filter((x) => x.status === 'paired').map((x) => [x.zh?.docIdLocal, x.en?.docIdLocal])).toEqual([['zA', 'eA'], ['zB', 'eB'], ['zC', 'eC']])
    expect(r.filter((x) => x.status === 'zh-only').map((x) => x.zh?.docIdLocal)).toEqual(['zD'])
    expect(r.some((x) => x.zh?.docIdLocal === 'zMine')).toBe(false)
  })

  it('中文 → 英文、英文 → 中文：按同一下标取，另一边库里要真有', async () => {
    expect(await pairs.entry(ref('cn-brew', 'b_a'))).toEqual({ refs: [ref('en-brew', 'bb_a')], reason: null })
    expect(await pairs.entry(ref('en-brew', 'aa_a'))).toEqual({ refs: [ref('cn-brew', 'a_a')], reason: null })
  })

  it('没有对应都带原因：数组长度不同、没配对的包、另一边没存、不在任何包里', async () => {
    expect(await pairs.entry(ref('cn-brew', 'x_b'))).toEqual({ refs: [], reason: 'structure-differs' })
    expect(await pairs.entry(ref('cn-brew', 'q_d'))).toEqual({ refs: [], reason: 'pack-unpaired' })
    expect(await pairs.entry(ref('cn-brew', 'p_c'))).toEqual({ refs: [], reason: 'no-counterpart' })
    expect(await pairs.entry(ref('cn-brew', 'nope'))).toEqual({ refs: [], reason: 'not-found' })
  })
  it('按位置对不上的（自己写的条目）改按"英文名 + 来源"找：中文 → 英文、英文 → 中文', async () => {
    expect(await pairs.entry(ref('cn-brew', 'm_mine'))).toEqual({ refs: [ref('en-brew', 'e_mine')], reason: null })
    expect(await pairs.entry(ref('en-brew', 'e_mine'))).toEqual({ refs: [ref('cn-brew', 'm_mine')], reason: null })
  })

  it('重名就都列出来（界面当有歧义）；中文没写英文名就说明原因；另一边什么都没装就是没有对应', async () => {
    const dup = await pairs.entry(ref('cn-brew', 'm_dup'))
    expect(dup.refs.map((r) => r.hash).sort()).toEqual(['tw1', 'tw2'])
    expect(await pairs.entry(ref('cn-brew', 'm_noeng'))).toEqual({ refs: [], reason: 'no-english-name' })
  })

  it('不写任何东西：只读库', async () => {
    const before = JSON.stringify(items)
    await pairs.entry(ref('cn-brew', 'm_mine'))
    expect(JSON.stringify(items)).toBe(before)
  })
})
