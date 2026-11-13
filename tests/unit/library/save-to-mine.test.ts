// P5.5 B8-3 复制成我的（取代 P5 B-27「同来源再存就并进旧副本」）：整本 / 整包复制成一个新包，包头多登记一行复制件自己的来源，
// 同一本可以复制多份；复制件再复制换掉旧的那一行；版本标签照原来的；单条存进选的包、换成包的来源。
// 作者函数本身（导入、认包）的行为在 e2e p55-c-b8.mjs 里用真数据测。
import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('../../../src/library/brew-validate', () => ({ validateBrewJson: async () => ({ ok: true, issues: [] }), loadBrewFields: async () => ({ props: {} }) }))
let copyAnswer: (o: Record<string, unknown>) => unknown = () => ({})
vi.mock('../../../src/library/copy-source', () => ({ copyRawSource: async (o: Record<string, unknown>) => copyAnswer(o) }))

import { copyToMine, type CopyDeps } from '../../../src/library/custom-copy'
import { sourceUnit, type Assignment } from '../../../src/library/scopes'

let imported: Array<{ name: string; text: string }>
let taken: Set<string>
let assigns: Map<string, Assignment>

function deps(edition: boolean | null = true): CopyDeps {
  const frame = { call: async (fn: string, ...a: unknown[]) => {
    if (fn === 'sourceTaken') return taken.has(String(a[0]))
    if (fn === 'editionOf') return { [String((a[0] as string[])[0])]: { classic: edition } }
    if (fn === 'packExport') return { filename: 'x.json', body: { _meta: { sources: [{ json: 'PHB', full: '玩家手册' }, { json: 'PHB_COPY1', full: '玩家手册（副本 1）' }] }, spell: [{ name: '火球术', source: 'PHB' }] } }
    throw new Error(`假小窗没有 ${fn}`)
  } }
  const lib = {
    frameOf: async () => frame,
    currentView: async () => ({}),
    brewImport: async (_s: string, files: Array<{ name: string; text: string }>) => { imported.push(...files); for (const f of files) for (const s of JSON.parse(f.text)._meta.sources) taken.add(s.json); return { ok: true, errors: [], parse: {} } },
  }
  const packsOf = async () => [{ docIdLocal: 'mine1', origin: 'import', sources: ['PHB', 'PHB_COPY1'], sourceInfo: [{ json: 'PHB' }, { json: 'PHB_COPY1' }] }]
  return { lib: lib as never, manage: { assignments: async () => new Map(assigns), setAssignment: async (u: string, a: Assignment | null) => { if (a) assigns.set(u, a); else assigns.delete(u) } } as never, packsOf: packsOf as never, db: {} as never, exportBrew: async () => ({ filename: 'dl.json', body: { _meta: { sources: [{ json: 'KIB', full: 'Kib 合集' }] }, feat: [{ name: 'x', source: 'KIB' }] } }), entries: {} as never }
}

beforeEach(() => { imported = []; taken = new Set(['PHB']); assigns = new Map(); copyAnswer = () => ({ json: { _meta: { sources: [{ json: 'PHB', full: '玩家手册', abbreviation: 'PHB' }] }, spell: [{ name: '火球术', source: 'PHB' }] }, counts: { spell: 1 }, corpora: [], skipped: [] }) })

describe('复制成我的（整本 / 整包）', () => {
  it('官方的书：包头 = 原来源 + 复制件自己的一行；条目编号不改；同一本复制两份是两个包', async () => {
    const a = await copyToMine(deps(), 'cn', { kind: 'source', source: 'PHB' })
    const b = await copyToMine(deps(), 'cn', { kind: 'source', source: 'PHB' })
    expect(a).toMatchObject({ id: 'phb :: phb_copy1', json: 'PHB_COPY1', full: '玩家手册（副本 1）', counts: { spell: 1 } })
    expect(b.id).toBe('phb :: phb_copy2')
    const body = JSON.parse(imported[0].text)
    expect(body._meta.sources.map((s: { json: string }) => s.json)).toEqual(['PHB', 'PHB_COPY1'])
    expect(body.spell).toEqual([{ name: '火球术', source: 'PHB' }])
  })
  it('版本标签：原来源有归类就照抄；没有就按作者的版本判断（判断不了不打）', async () => {
    assigns.set(sourceUnit('PHB'), { scopes: ['mine'], global: false })
    await copyToMine(deps(), 'cn', { kind: 'source', source: 'PHB' })
    expect(assigns.get(sourceUnit('PHB_COPY1'))?.scopes).toEqual(['mine'])
    assigns.clear()
    await copyToMine(deps(true), 'cn', { kind: 'source', source: 'PHB' })
    expect(assigns.get(sourceUnit('PHB_COPY2'))?.scopes.length).toBeGreaterThan(0)
    assigns.clear()
    await copyToMine(deps(null), 'cn', { kind: 'source', source: 'PHB' })
    expect(assigns.has(sourceUnit('PHB_COPY3'))).toBe(false)
  })
  it('复制件再复制：旧的那一行（没有条目用）换成新的，不叠加', async () => {
    taken.add('PHB_COPY1') // 原来那份还在
    const r = await copyToMine(deps(), 'cn', { kind: 'pack', docIdLocal: 'mine1' })
    expect(JSON.parse(imported[0].text)._meta.sources.map((s: { json: string }) => s.json)).toEqual(['PHB', 'PHB_COPY2'])
    expect(r.json).toBe('PHB_COPY2')
  })
  it('下载来的包：原文复制一份，加自己的一行', async () => {
    const r = await copyToMine(deps(), 'cn', { kind: 'pack', docIdLocal: 'dl' })
    expect(JSON.parse(imported[0].text)._meta.sources.map((s: { json: string }) => s.json)).toEqual(['KIB', 'KIB_COPY1'])
    expect(r.counts).toEqual({ feat: 1 })
  })
  it('什么都没复制到：明说，不导入空文件', async () => {
    copyAnswer = () => ({ json: {}, counts: {}, corpora: [], skipped: [] })
    await expect(copyToMine(deps(), 'cn', { kind: 'source', source: 'XYZ' })).rejects.toThrow('没有来源 XYZ')
    expect(imported).toEqual([])
  })
})
