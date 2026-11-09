import { afterEach, describe, expect, it } from 'vitest'
import { EMBEDDED_PROP, EmbeddedTables, buildEmbedded, tableDigest, tableName } from '../../../src/library/embedded-tables'
import { LibraryDatabase } from '../../../src/library/db'
import { parsedKey } from '../../../src/library/install'
import type { AuthorFrame } from '../../../src/library/runtime/host'
import type { ExtractedTable } from '../../../src/library/runtime/frame/table-extract-commands'
import { commitOf, getSource } from '../../../src/library/sources'

const table = (rows: string[][], extra: Record<string, unknown> = {}) => ({ type: 'table', colLabels: ['d6', '结果'], rows, ...extra })
const ex = (parentHash: string, parentName: string, t: Record<string, unknown>, path: Array<{ name?: string }> = [], parentSource: string | null = 'PHB'): ExtractedTable =>
  ({ parentHash, parentName, parentSource, table: t, path, sectionIndex: 1 })

describe('埋在条目里的表格：起名', () => {
  it('作者给的名字 / 表自带标题优先（标签去掉）', () => {
    expect(tableName(ex('h', '背景甲', table([['1', 'a']], { name: '随身物品' })), 1)).toBe('随身物品')
    expect(tableName(ex('h', '背景甲', table([['1', 'a']], { caption: '特色 {@dice d8}' })), 1)).toBe('特色 d8')
  })
  it('无名表：所属条目 · 最近的小标题（跳过与条目同名的）· 第 n 张', () => {
    const t = ex('h', '犯罪', table([['1', 'a']]), [{ name: '犯罪' }, { name: '特色' }])
    expect(tableName(t, 2)).toBe('「犯罪」 · 特色 · 第 2 张')
    expect(tableName(ex('h', '犯罪', table([['1', 'a']]), [{ name: '犯罪' }]), 1)).toBe('「犯罪」 · 第 1 张')
  })
})

describe('埋在条目里的表格：整理', () => {
  it('每个条目的表按顺序编号 条目编号~t序号；母条目、章节路径带上；表的原字段保留', () => {
    const out = buildEmbedded([{ prop: 'background', tables: [ex('crim_phb', '犯罪', table([['1', 'a']], { name: 'T1' }), [{ name: '特色' }]), ex('crim_phb', '犯罪', table([['1', 'b']]))] }], new Set())
    expect(out.hashes).toEqual(['crim_phb~background~t1', 'crim_phb~background~t2'])
    expect(out.items[0]).toMatchObject({ type: 'table', name: 'T1', source: 'PHB', rows: [['1', 'a']], parent: { prop: 'background', hash: 'crim_phb', name: '犯罪' }, sectionPath: ['特色'] })
    expect(out.items[1].name).toBe('「犯罪」 · 第 1 张')
  })

  it('去重：同一来源里内容相同的只留第一张（变体上重复的表）；内容不同的都留', () => {
    const same = table([['1', 'x']])
    const out = buildEmbedded([{ prop: 'item', tables: [ex('base_dmg', '基础', same), ex('var1_dmg', '变体1', same), ex('var2_dmg', '变体2', table([['1', 'y']]))] }], new Set())
    expect(out.hashes).toEqual(['base_dmg~item~t1', 'var2_dmg~item~t1'])
  })
  it('作者 table 类别里已经有的表不再收', () => {
    const known = new Set([tableDigest(table([['1', 'x']]))])
    expect(buildEmbedded([{ prop: 'item', tables: [ex('a', 'A', table([['1', 'x']])), ex('b', 'B', table([['1', 'z']]))] }], known).hashes).toEqual(['b~item~t1'])
  })
  it('内容摘要不看名字和页码，只看列名与行', () => {
    expect(tableDigest(table([['1', 'x']], { name: 'a', page: 3 }))).toBe(tableDigest(table([['1', 'x']], { name: 'b', page: 9 })))
    expect(tableDigest(table([['1', 'x']]))).not.toBe(tableDigest(table([['1', 'y']])))
  })
})

let db: LibraryDatabase
afterEach(async () => { await db?.delete() })

describe('EmbeddedTables：存库与现建', () => {
  it('旧安装：没存过就问小窗逐个类别提表，存库，并把条数补记进解析报告；再读走缓存', async () => {
    db = new LibraryDatabase(`test-emb-${Math.random()}`)
    const source = getSource('cn-official')
    await db.derived.put({ key: 'audit:cn-official', fingerprint: commitOf(source), value: { parse: { props: { background: { count: 2 }, table: { count: 1 }, spell: { count: 0 } } } }, savedAt: 1 })
    await db.derived.put({ key: parsedKey('cn-official', 'table'), fingerprint: 'x', value: { items: [table([['1', 'known']])], hashes: ['t_x'], sources: ['X'] }, savedAt: 0 })
    const asked: string[] = []
    const frame = { call: async (fn: string, prop: string) => { asked.push(`${fn}:${prop}`); return { tables: [ex('crim_phb', '犯罪', table([['1', 'a']])), ex('x_phb', 'X', table([['1', 'known']]))], skipped: [] } } } as unknown as AuthorFrame
    const store = new EmbeddedTables(db, async () => frame)
    const first = await store.ensure('cn-official')
    expect(asked).toEqual(['extractTables:background']) // table 自己、条数为 0 的类别不扫
    expect(first.hashes).toEqual(['crim_phb~background~t1']) // 作者 table 里已有的那张不收
    const audit = (await db.derived.get('audit:cn-official'))!.value as { parse: { props: Record<string, { count: number }> } }
    expect(audit.parse.props[EMBEDDED_PROP].count).toBe(1)
    asked.length = 0
    expect((await new EmbeddedTables(db, async () => frame).ensure('cn-official')).hashes).toEqual(['crim_phb~background~t1'])
    expect(asked).toEqual([])
  })

  it('只有官方数据集有；没装就说没装', async () => {
    db = new LibraryDatabase(`test-emb2-${Math.random()}`)
    const store = new EmbeddedTables(db, async () => ({}) as AuthorFrame)
    await expect(store.build('cn-brew')).rejects.toThrow(/不是官方数据集/)
    await expect(store.build('cn-official')).rejects.toThrow(/还没安装/)
  })
})
