// B-27 复制官方的书：取官方下载下来的原始文件，按 source 挑记录，不取加载器改写过的对象。
// P5.5 B8-3：只从作者加载这一类时实际读的文件里取（小窗 authorDataFiles）；书内 _copy 声明 internalCopies。
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { copyRawSource } from '../../../src/library/copy-source'
import { LibraryDatabase } from '../../../src/library/db'
import { CODE_SETS, getSource } from '../../../src/library/sources'

let db: LibraryDatabase
beforeEach(() => { db = new LibraryDatabase(`test-copy-${Math.random()}`) })
afterEach(async () => { await db.delete() })

const file = (path: string, json: unknown) => ({ source: 'cn-official', path, commit: 'c', text: JSON.stringify(json), gitSha: 's', size: 1, savedAt: 1 })

// 假小窗：作者加载器登记表（类别）、编号规则（这里：name_source 小写）、来源名与版本判断、书正文文件的拼法
const frame = {
  call: async (fn: string, ...a: unknown[]) => {
    if (fn === 'loaders') return [
      { props: ['spell', 'spellFluff'], page: 'spells.html', kind: 'site' }, { props: ['raw_class', 'class'], page: 'classes.html', kind: 'site' }, { props: ['classFeature'], page: 'classes.html', kind: 'site' }, { props: ['deck'], page: 'decks.html', kind: 'site' }, { props: ['monster'], page: 'bestiary.html', kind: 'site' },
      { props: ['book', 'bookData'], page: 'book.html', kind: 'corpus', index: 'books.json' }, { props: ['adventure', 'adventureData'], page: 'adventure.html', kind: 'corpus', index: 'adventures.json' },
    ]
    if (fn === 'rawHashes') return (a[1] as Array<{ name: string; source: string }>).map((r) => `${r.name}_${r.source}`.toLowerCase())
    if (fn === 'sourceNames') return { [(a[0] as string[])[0]]: { full: '测试之书', abv: 'TST' } }
    if (fn === 'editionOf') return { [(a[0] as string[])[0]]: { classic: true, basis: 'date' } }
    if (fn === 'corpusFile') return `data/${a[0]}/${a[0]}-${String(a[1]).toLowerCase()}.json`
    // 作者拼接（P5.5 C1 抄全）：_copy 指向保留来源以外的拼成完整的一条；原件叫「找不到」的拼不成、保持原样
    if (fn === 'flattenCopies') {
      const json = structuredClone(a[0]) as Record<string, Array<Record<string, unknown>>>
      const keep = (a[1] as string[]).map((x) => x.toLowerCase())
      let flattened = 0
      const failed: unknown[] = []
      for (const [k, list] of Object.entries(json)) if (Array.isArray(list)) json[k] = list.map((e) => { const c = e._copy as { name: string; source: string } | undefined; if (!c || keep.includes(c.source.toLowerCase())) return e; if (c.name === '找不到') { failed.push({ prop: k, name: e.name }); return e } flattened++; const { _copy: _c, ...rest } = e; return { ...rest, hp: 136, copiedFrom: c.name } })
      return { json, flattened, failed }
    }
    throw new Error(`假小窗没有 ${fn}`)
  },
}
const lib = { frameOf: async () => frame } as never
// 作者网站实际读的数据文件（照作者：目录读 index 里列的；作者不读 foundry*.json）
const authorFiles = async () => ['data/spells/index.json', 'data/spells/spells-tst.json', 'data/spells/spells-other.json', 'data/spells/fluff-index.json', 'data/spells/fluff-spells-tst.json', 'data/class/index.json', 'data/class/class-x.json', 'data/decks.json', 'data/bestiary/index.json', 'data/bestiary/bestiary-tst.json', 'data/books.json', 'data/adventures.json', 'data/generated/gendata-x.json']
const opts = (extra: Record<string, unknown> = {}) => ({ db, lib, official: getSource('cn-official'), source: 'TST', authorFiles, ...extra })

async function seed() {
  await db.files.bulkPut([
    file('data/spells/spells-tst.json', { spell: [{ name: '甲', source: 'TST' }, { name: '乙', source: 'OTHER' }], _meta: {} }),
    file('data/spells/spells-other.json', { spell: [{ name: '丙', source: 'OTHER' }] }),
    file('data/spells/fluff-spells-tst.json', { spellFluff: [{ name: '甲', source: 'TST', entries: ['x'] }] }),
    file('data/class/class-x.json', { class: [{ name: '职', source: 'TST', classFeatures: ['特性|职||1'] }], classFeature: [{ name: '特性', source: 'TST' }], rubbish: [{ source: 'TST' }] }),
    file('data/bestiary/bestiary-tst.json', { monster: [{ name: '怪', source: 'TST', _copy: { name: '邪教徒', source: 'MM' } }, { name: '自己的', source: 'TST', _copy: { name: '怪', source: 'TST' } }] }),
    file('data/decks.json', { deck: [{ name: '牌组', source: 'TST', cards: [{ uid: '牌|集|TST' }] }] }),
    file('data/books.json', { book: [{ name: '测试之书', id: 'TST', source: 'TST', contents: [] }, { name: '别的书', id: 'OTHER', source: 'OTHER' }] }),
    file('data/book/book-tst.json', { bookData: [{ id: 'TST', data: [{ type: 'section', name: '第一章' }] }] }),
    file('data/adventures.json', { adventure: [{ name: '测试冒险', id: 'TST', source: 'TST' }] }),
    file('data/generated/gendata-x.json', { spell: [{ name: '生成', source: 'TST' }] }),
    // 作者给 Foundry 用的补充文件：顶层也叫 spell / classFeature，作者网站不读
    file('data/spells/foundry.json', { spell: [{ name: '甲', source: 'TST', activities: [] }] }),
    file('data/foundry-optionalfeatures.json', { optionalfeature: [{ name: '祈唤', source: 'TST', activities: [] }] }),
  ])
}

describe('copyRawSource', () => {
  it('整本：各类别里这个来源的原始记录（含 fluff、牌组原样不被改写），不碰别的来源、生成目录、不认识的字段', async () => {
    await seed()
    const r = await copyRawSource(opts())
    expect(r.counts).toEqual({ spell: 1, spellFluff: 1, class: 1, classFeature: 1, deck: 1, monster: 2, book: 1, adventure: 1 })
    expect((r.json.spell as unknown[])).toEqual([{ name: '甲', source: 'TST' }])
    expect((r.json.deck as Array<{ cards: unknown }>)[0].cards).toEqual([{ uid: '牌|集|TST' }]) // 原文，没被展开
    expect(r.json.rubbish).toBeUndefined()
    expect(r.json.optionalfeature).toBeUndefined() // Foundry 补充文件没混进来
  })

  it('书的正文带上；冒险正文没下载的写明原因，不阻止复制', async () => {
    await seed()
    const r = await copyRawSource(opts())
    expect(r.json.bookData).toEqual([{ id: 'TST', data: [{ type: 'section', name: '第一章' }] }])
    expect(r.corpora).toEqual([{ prop: 'book', id: 'TST' }])
    expect(r.skipped).toEqual([{ what: 'adventure TST', reason: '正文还没下载' }])
  })

  it('_meta：来源全名 / 缩写取作者，版本风格按作者判断，版本号写这份官方数据的版本', async () => {
    await seed()
    const meta = (await copyRawSource(opts())).json._meta as { sources: Array<Record<string, unknown>>; edition?: string }
    expect(meta.sources[0]).toMatchObject({ json: 'TST', abbreviation: 'TST', full: '测试之书', version: CODE_SETS.cn.version })
    expect(meta.edition).toBe('classic')
  })

  it('只存一条：按作者编号挑；不带书', async () => {
    await seed()
    const r = await copyRawSource(opts({ entry: { prop: 'spell', hash: '甲_tst' } }))
    expect(r.counts).toEqual({ spell: 1 })
    expect(r.json.book).toBeUndefined()
    expect(r.corpora).toEqual([])
  })

  it('已有本地副本：新内容并进去，同编号的换成新的，别的保留', async () => {
    await seed()
    const base = { _meta: {}, spell: [{ name: '甲', source: 'TST', old: true }, { name: '旧的', source: 'TST' }] }
    const r = await copyRawSource(opts({ entry: { prop: 'spell', hash: '甲_tst' }, base }))
    expect(r.json.spell).toEqual([{ name: '甲', source: 'TST' }, { name: '旧的', source: 'TST' }])
  })

  it('抄全（C1）：_copy 指向别的书的拼成完整的一条，不再声明依赖；拼不成的保持原写法、仍声明依赖', async () => {
    await seed()
    const full = await copyRawSource(opts())
    expect((full.json.monster as Array<Record<string, unknown>>)[0]).toEqual({ name: '怪', source: 'TST', hp: 136, copiedFrom: '邪教徒' })
    expect(full.flattened).toBe(1)
    expect((full.json._meta as { dependencies?: unknown }).dependencies).toBeUndefined()
    await db.files.put(file('data/bestiary/bestiary-tst.json', { monster: [{ name: '怪', source: 'TST', _copy: { name: '找不到', source: 'VGM' } }] }))
    const r = await copyRawSource(opts())
    expect(r.flattenFailed).toEqual([{ prop: 'monster', name: '怪' }])
    expect((r.json._meta as { dependencies?: unknown }).dependencies).toEqual({ monster: ['VGM'] })
  })
  it('抄全：只复制一条时连指向本书的 _copy 也拼全（它要进别的包）', async () => {
    await seed()
    const r = await copyRawSource(opts({ entry: { prop: 'monster', hash: '自己的_tst' } }))
    expect((r.json.monster as Array<Record<string, unknown>>)[0]).toMatchObject({ name: '自己的', copiedFrom: '怪' })
    expect((r.json.monster as Array<Record<string, unknown>>)[0]._copy).toBeUndefined()
  })

  it('_copy 本书另一条的：照作者规矩在 _meta.internalCopies 声明这一类', async () => {
    await seed()
    const meta = (await copyRawSource(opts())).json._meta as { internalCopies?: string[] }
    expect(meta.internalCopies).toEqual(['monster'])
  })
})
