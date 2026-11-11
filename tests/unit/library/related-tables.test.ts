// 详情「关联 › 表格」（P5 T6 G3）：自己的表、正文链接到的表、引用了它的表；引用只认作者标签解析出的编号。
import { describe, expect, it } from 'vitest'
import { relatedTablesFor } from '../../../src/library/service-tables'

function fakeService(opts: { brewThrows?: boolean } = {}) {
  const store = new Map<string, { fingerprint: string; value: unknown }>()
  let builds = 0
  const view = {
    id: 'v1', officialState: async () => ({ status: 'installed' }), commitOf: async () => 'c1',
    derivedGet: async (k: string) => store.get(k) ?? null,
    derivedPut: async (k: string, fingerprint: string, value: unknown) => { store.set(k, { fingerprint, value }) },
  }
  // 作者对象里的标签 → 小窗 tagRefs 的结果用条目上的 _links 模拟
  const data: Record<string, Record<string, { items: Array<Record<string, unknown>>; hashes: string[]; sources: string[] }>> = {
    'cn-official': {
      spell: { items: [{ name: '火球术', _links: ['table|wild%20magic'] }], hashes: ['fireball_phb'], sources: ['PHB'] },
      table: { items: [{ name: '野魔法', _links: [] }, { name: '卷轴表', _links: ['spell|fireball_phb'] }], hashes: ['wild%20magic', 'scrolls_dmg'], sources: ['PHB', 'DMG'] },
      tableGroup: { items: [], hashes: [], sources: [] },
      embeddedTable: { items: [{ name: '「火球术」第 1 张', _links: ['spell|fireball_phb'] }], hashes: ['fireball_phb~spell~t1'], sources: ['PHB'] },
    },
    'cn-brew': {
      table: { items: [{ name: '自制宝藏表', _links: ['spell|fireball_phb', 'spell|fireball_phb'] }], hashes: ['hoard_x'], sources: ['X'] },
      tableGroup: { items: [], hashes: [], sources: [] }, embeddedTable: { items: [], hashes: [], sources: [] },
    },
  }
  const service = {
    currentView: async () => view,
    parsed: async (set: string, prop: string) => {
      if (opts.brewThrows && set === 'cn-brew') throw new Error('没装')
      const p = data[set]?.[prop]
      if (!p) throw new Error(`没有 ${set} ${prop}`)
      return p
    },
    frameOf: async () => ({
      call: async (cmd: string, ...args: unknown[]) => {
        if (cmd === 'tagRefs') builds++
        if (cmd === 'tagRefs') return (args[0] as Array<{ _links?: string[] }>).map((it) => [...new Set(it._links ?? [])])
        if (cmd === 'extractTables') return { tables: [{ table: { type: 'table' }, parentName: '火球术', path: [] }], skipped: [] }
        throw new Error(cmd)
      },
    }),
  }
  return { service: service as never, builds: () => builds }
}

describe('relatedTables', () => {
  it('自己的表 + 链接到的表 + 引用它的表（跨中文官方 / 自制，去重；自己身上的埋表不重复列）', async () => {
    const f = fakeService()
    const r = await relatedTablesFor(f.service, 'cn-official', 'spell', 'fireball_phb')
    expect(r.own).toHaveLength(1)
    expect(r.links.map((x) => [x.set, x.hash, x.name])).toEqual([['cn-official', 'wild%20magic', '野魔法']])
    expect(r.referencedBy.map((x) => `${x.set}:${x.hash}`)).toEqual(['cn-official:scrolls_dmg', 'cn-brew:hoard_x'])
  })
  it('反向索引按版本只建一次；某一套读不出时其余照常返回', async () => {
    const f = fakeService({ brewThrows: true })
    await relatedTablesFor(f.service, 'cn-official', 'spell', 'fireball_phb')
    const before = f.builds()
    const r = await relatedTablesFor(f.service, 'cn-official', 'spell', 'fireball_phb')
    expect(f.builds()).toBe(before + 1) // 只多了正向那一次，反向索引没有重建
    expect(r.referencedBy.map((x) => x.hash)).toEqual(['scrolls_dmg'])
  })
})
