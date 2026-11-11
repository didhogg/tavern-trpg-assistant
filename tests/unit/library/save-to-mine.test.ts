// B-27 存入我的库：官方的书 / 条目用作者办法存成作者格式文件再走作者导入；下载来的自制包原文原样再导入；重复存并进去不冲掉。
// 作者函数本身（cleanJson、导入）的行为在 tests/e2e/library/p5-1-backend.mjs 里用真数据测。
import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('../../../src/library/brew-validate', () => ({ validateBrewJson: async () => ({ ok: true, issues: [] }) }))
let copyCalls: Array<Record<string, unknown>> = []
let copyAnswer: () => unknown = () => ({})
vi.mock('../../../src/library/copy-source', () => ({ copyRawSource: async (o: Record<string, unknown>) => { copyCalls.push(o); return copyAnswer() } }))

import { CustomLibrary } from '../../../src/library/custom'

interface Imported { setId: string; files: Array<{ name: string; text: string }> }
let imported: Imported[]
let calls: Array<{ fn: string; args: unknown[] }>
let docs: Array<Record<string, unknown>>

function make(answers: Record<string, (...args: unknown[]) => unknown>) {
  const frame = { call: async (fn: string, ...args: unknown[]) => { calls.push({ fn, args }); const a = answers[fn]; if (!a) throw new Error(`假小窗没有 ${fn}`); return a(...args) } }
  const lib = {
    currentView: async () => ({ id: 'v', filePaths: async () => [], fileGet: async () => null }),
    frameOf: async () => frame,
    brewInstalled: async () => docs.map((d) => ({ head: d, meta: {} })),
    brewImport: async (setId: string, files: Imported['files']) => { imported.push({ setId, files }); return { value: { added: [{ head: {} }], notJson: [] }, errors: [], parse: { ok: true } } },
    storedItem: async (_set: string, _prop: string, hash: string) => (hash === 'fireball_phb' ? { item: { name: '火球术', source: 'PHB' }, source: 'PHB' } : null),
  }
  const scoped = { reset: () => {} }
  return new CustomLibrary(lib as never, scoped as never, {} as never)
}

beforeEach(() => { imported = []; calls = []; docs = []; copyCalls = []; copyAnswer = () => ({ json: {}, counts: {}, corpora: [], skipped: [] }) })

describe('saveToMine', () => {
  it('官方的书：作者办法复制 → 作者导入；文件叫来源名；没有本地副本时不带 base', async () => {
    copyAnswer = () => ({ json: { _meta: { sources: [{ json: 'PHB' }] }, spell: [{ name: '火球术', source: 'PHB' }] }, counts: { spell: 1 }, corpora: [], skipped: [] })
    const c = make({ brewDocIndex: () => [] })
    const r = await c.saveToMine('cn', { kind: 'source', source: 'PHB' })
    expect(copyCalls).toHaveLength(1)
    expect(copyCalls[0]).toMatchObject({ source: 'PHB' })
    expect(copyCalls[0].base).toBeUndefined()
    expect(copyCalls[0].entry).toBeUndefined()
    expect(imported).toHaveLength(1)
    expect(imported[0]).toMatchObject({ setId: 'cn-brew', files: [{ name: 'PHB.json' }] })
    expect(JSON.parse(imported[0].files[0].text).spell).toEqual([{ name: '火球术', source: 'PHB' }])
    expect(r.counts).toEqual({ spell: 1 })
  })

  it('这个来源已有本地副本：把它的内容当 base 并进去，沿用原文件名（不冲掉以前存的）', async () => {
    docs = [{ docIdLocal: 'd1', filename: 'PHB.json', isEditable: false, url: null }]
    copyAnswer = () => ({ json: { spell: [{ name: '旧' }, { name: '新' }] }, counts: { spell: 1 }, corpora: [], skipped: [] })
    const c = make({
      brewDocIndex: () => [{ docIdLocal: 'd1', filename: 'PHB.json', isEditable: false, url: null, sources: ['phb'] }],
      brewExport: () => ({ filename: 'PHB.json', body: { _meta: {}, spell: [{ name: '旧' }] } }),
    })
    await c.saveToMine('cn', { kind: 'entry', ref: { set: 'cn-official', prop: 'spell', hash: 'fireball_phb' } })
    expect(copyCalls[0]).toMatchObject({ source: 'PHB', entry: { prop: 'spell', hash: 'fireball_phb' }, base: { spell: [{ name: '旧' }] } })
    expect(imported[0].files[0].name).toBe('PHB.json')
    expect(JSON.parse(imported[0].files[0].text).spell).toEqual([{ name: '旧' }, { name: '新' }])
  })

  it('什么都没复制到（没下载 / 来源不对）：明说，不导入空文件', async () => {
    const c = make({ brewDocIndex: () => [] })
    await expect(c.saveToMine('cn', { kind: 'source', source: 'XYZ' })).rejects.toThrow('没有来源 XYZ')
    expect(imported).toEqual([])
  })

  it('下载来的自制包：作者格式原文原样再导入一份；自己写的 / 本地导入的不用存（本来就在我的库）', async () => {
    docs = [{ docIdLocal: 'dl', filename: 'a.json', isEditable: false, url: 'https://x/a.json' }, { docIdLocal: 'im', filename: 'b.json', isEditable: false, url: null }, { docIdLocal: 'ed', isEditable: true }]
    const c = make({ brewExport: (id) => ({ filename: `${id}.json`, body: { _meta: { sources: [] }, spell: [{ name: 'x' }] } }) })
    await c.saveToMine('cn', { kind: 'pack', docIdLocal: 'dl' })
    expect(imported[0].files[0]).toEqual({ name: 'dl.json', text: JSON.stringify({ _meta: { sources: [] }, spell: [{ name: 'x' }] }) })
    await expect(c.saveToMine('cn', { kind: 'pack', docIdLocal: 'im' })).rejects.toThrow('本来就在【我的库】')
    await expect(c.saveToMine('cn', { kind: 'pack', docIdLocal: 'ed' })).rejects.toThrow('本来就在【我的库】')
    await expect(c.saveToMine('cn', { kind: 'pack', docIdLocal: 'nope' })).rejects.toThrow('找不到这个包')
  })

  it('找不到的条目：明说原因，不导入', async () => {
    const c = make({})
    await expect(c.saveToMine('cn', { kind: 'entry', ref: { set: 'cn-official', prop: 'spell', hash: 'unknown' } })).rejects.toThrow('找不到这一条')
  })
})
