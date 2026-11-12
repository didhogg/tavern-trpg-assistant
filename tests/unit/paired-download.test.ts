// 中英一起下载 / 卸载（驾驶员 2026-11-12）：界面只说「下这一本」，后端按源登记的 pair 配另一种语言；
// 那边没有这本 / 已经装着 → 只下这一种并写明原因；卸载按同一份登记补上另一种语言（书号大小写不同也配得上）。
import { describe, expect, it } from 'vitest'
import { PairedDownloads, type PairedDownloadDeps } from '../../src/core/paired-download'
import { withCounterparts } from '../../src/core/removal-batch'
import type { CatalogPair } from '../../src/library/brew-pairing'

type State = Awaited<ReturnType<PairedDownloadDeps['officialState']>>
const installedState = (o: Partial<NonNullable<State>> = {}): State => ({ id: 'x', commit: 'c', status: 'installed', sources: null, books: null, adventures: [], ...o }) as State

function fake(o: { states?: Record<string, State>; dir?: { books: string[]; adventures: string[] } | null; rows?: CatalogPair[]; installedUrls?: string[]; failUrl?: string } = {}) {
  const started: string[] = []
  const opts: Array<{ set: string; books: unknown; sources: unknown }> = []
  const deps: PairedDownloadDeps = {
    startOfficial: (set, x) => { started.push(`official:${set}`); opts.push({ set, books: x.books, sources: x.sources }); return `t${started.length}` },
    startAdventure: (set, id) => { started.push(`adventure:${set}/${id}`); return `t${started.length}` },
    officialState: async (id) => o.states?.[id] ?? null,
    directoryOf: async () => (o.dir === undefined ? null : o.dir && { books: o.dir.books.map((id) => ({ id })), adventures: o.dir.adventures.map((id) => ({ id })) }),
    brewCatalog: async () => ({ rows: o.rows ?? [] }),
    brewAddUrl: async (set, url) => { if (url === o.failUrl) throw new Error('断网'); started.push(`brew:${set}:${url}`); return { value: [{}] } },
    brewInstallSources: async (set, sources) => { started.push(`brew-sources:${set}:${sources.join(',')}`); return { value: { added: [], notFound: [] }, errors: [], parse: null } as never },
    brewInstalledUrls: async () => new Set(o.installedUrls ?? []),
  }
  return { d: new PairedDownloads(deps), started, opts }
}
const file = (path: string, sources: string[] = []) => ({ path, urlDownload: `https://x/${path}`, sources })

describe('中英一起下载', () => {
  it('官方书：另一种语言书目里有这本 → 两种语言各一个任务，用那边的书号写法', async () => {
    const { d, started, opts } = fake({ dir: { books: ['phb', 'MM'], adventures: [] } })
    const r = await d.official('cn-official', { books: ['PHB'], sources: ['PHB'] })
    expect(started).toEqual(['official:cn-official', 'official:en-official'])
    expect(opts[1]).toEqual({ set: 'en-official', books: ['phb'], sources: ['PHB'] })
    expect(r.tasks.map((t) => t.setId)).toEqual(['cn-official', 'en-official'])
  })
  it('官方书：另一种语言没有这本 / 已经装着 → 只下这一种，写明原因', async () => {
    const a = fake({ dir: { books: ['MM'], adventures: [] } })
    expect((await a.d.official('cn-official', { books: ['XYZ'], sources: ['XYZ'] })).skipped).toEqual([{ setId: 'en-official', reason: '另一种语言的书目里没有这本' }])
    expect(a.started).toEqual(['official:cn-official'])
    const b = fake({ dir: { books: ['PHB'], adventures: [] }, states: { 'en-official': installedState({ books: ['phb'] }) } })
    expect((await b.d.official('cn-official', { books: ['PHB'] })).skipped[0].reason).toBe('另一种语言的已经装着')
  })
  it('官方：整套 → 另一种语言也整套（那边整套装着就不重下）', async () => {
    const a = fake()
    await a.d.official('en-official', { books: null })
    expect(a.started).toEqual(['official:en-official', 'official:cn-official'])
    const b = fake({ states: { 'cn-official': installedState() } })
    expect((await b.d.official('en-official', { books: null })).skipped).toHaveLength(1)
  })
  it('冒险：另一种语言的官方资料装着、书目里有 → 一起下；没装 / 书目里没有 → 只下这一种', async () => {
    const a = fake({ states: { 'en-official': installedState() }, dir: { books: [], adventures: ['LMoP'] } })
    await a.d.adventure('cn-official', 'lmop')
    expect(a.started).toEqual(['adventure:cn-official/lmop', 'adventure:en-official/LMoP'])
    const b = fake()
    expect((await b.d.adventure('cn-official', 'LMoP')).skipped[0].reason).toBe('另一种语言的官方资料还没装')
    const c = fake({ states: { 'en-official': installedState() }, dir: { books: [], adventures: [] } })
    expect((await c.d.adventure('cn-official', 'LMoP')).skipped[0].reason).toBe('另一种语言的冒险书目里没有这本')
  })
  it('自制包：按中英目录配对一起装；英文行点下载也配回中文；那边装过的不重装；一边失败另一边照装', async () => {
    const rows: CatalogPair[] = [{ zh: file('zh/a.json'), en: file('en/a.json'), status: 'paired' }]
    const a = fake({ rows })
    const r = await a.d.brewUrl('cn-brew', 'https://x/zh/a.json')
    expect(a.started).toEqual(['brew:cn-brew:https://x/zh/a.json', 'brew:en-brew:https://x/en/a.json'])
    expect(r).toMatchObject({ added: 2, entries: 2, failed: [] })
    const b = fake({ rows })
    await b.d.brewUrl('en-brew', 'https://x/en/a.json')
    expect(b.started).toEqual(['brew:en-brew:https://x/en/a.json', 'brew:cn-brew:https://x/zh/a.json'])
    const c = fake({ rows, installedUrls: ['https://x/en/a.json'] })
    expect((await c.d.brewUrl('cn-brew', 'https://x/zh/a.json')).skipped[0].reason).toBe('另一种语言的已经装着')
    const e = fake({ rows, failUrl: 'https://x/en/a.json' })
    const re = await e.d.brewUrl('cn-brew', 'https://x/zh/a.json')
    expect(re.added).toBe(1)
    expect(re.failed.map((f) => f.setId)).toEqual(['en-brew'])
  })
  it('自制依赖：按来源补装这一种，再装目录里提供这些来源的文件的另一种语言版本', async () => {
    const rows: CatalogPair[] = [{ zh: file('zh/dep.json', ['DepSrc']), en: file('en/dep.json', ['DepSrc']), status: 'paired' }]
    const a = fake({ rows })
    await a.d.brewSources('cn-brew', ['depsrc'])
    expect(a.started).toEqual(['brew-sources:cn-brew:depsrc', 'brew:en-brew:https://x/en/dep.json'])
  })
})

describe('中英一起卸载', () => {
  it('另一种语言书号大小写不同也一起卸，用那边的写法', async () => {
    const view = { officialState: async (id: string) => (id === 'en-official' ? installedState({ books: ['phb'], adventures: ['lmop'] }) : null) } as never
    const out = await withCounterparts(view, { installed: async () => [] }, [{ kind: 'official', setId: 'cn-official', bookIds: ['PHB'], adventureIds: ['LMoP'] }])
    expect(out).toContainEqual({ kind: 'official', setId: 'en-official', bookIds: ['phb'], adventureIds: ['lmop'] })
  })
})
