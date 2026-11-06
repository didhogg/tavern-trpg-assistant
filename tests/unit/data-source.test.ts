import { describe, expect, it, vi } from 'vitest'
import { buildSourceIndex, manifestSchema, reconcileManifest, resolveDataSource, type SourceManifest } from '../../src/core/source'
import { settingsSchema } from '../../src/schemas/campaign'

/** 一份小而自洽的清单：2 个官方仓库（中文 + 英文）、1 个自制仓库；数量全部由数据算出，不写死。 */
function makeManifest(): Record<string, unknown> {
  const repo = (id: string, kind: string, lang: string, jsonCount: number, contentRecords: number): Record<string, unknown> => ({
    id, label: id, kind, lang, role: 'primary', repoUrl: `https://example.test/${id}`, branch: 'main',
    baseUrl: `https://raw.example.test/${id}/`, fallbackBaseUrl: `https://cdn.example.test/${id}/`, revision: null, snapshotHash: 'abc', jsonCount, contentRecords, metaRecords: 0,
  })
  const file = (r: string, path: string, sourceIds: string[], contentRecords: number, kind = 'content'): Record<string, unknown> => ({
    repo: r, path, kind, bytes: 10, sha256: 'x', sourceIds, contentRecords, url: `https://raw.example.test/${r}/${path}`, fallbackUrl: `https://cdn.example.test/${r}/${path}`,
  })
  const source = (kind: string, id: string): Record<string, unknown> => ({ key: `${kind}:${id}`, id, kind, name: id, nameEn: id, edition: '2014', declared: true })
  return {
    formatVersion: 1,
    kind: 'trpg-5etools-source-manifest',
    repos: [repo('official-cn', 'official', 'zh', 2, 7), repo('official-en', 'official', 'en', 1, 3), repo('homebrew-en', 'homebrew', 'en', 1, 2)],
    sources: [source('official', 'PHB'), source('official', 'MM'), source('homebrew', 'Fey')],
    files: [
      file('official-cn', 'data/spells/spells-phb.json', ['PHB'], 4),
      file('official-cn', 'data/bestiary/bestiary-mm.json', ['MM'], 3),
      file('official-en', 'data/spells/spells-phb.json', ['PHB'], 3),
      file('homebrew-en', 'class/Fey.json', ['Fey'], 2),
    ],
    lookups: [{ repo: 'official-cn', path: 'data/spells/index.json', kind: 'index', sha256: 'y' }],
    recordIndex: { file: 'records.jsonl.gz', count: 12, sha256: 'z' },
  }
}

const json = (body: unknown, init: ResponseInit = {}): Response => new Response(JSON.stringify(body), { status: 200, ...init })
const asFetch = (fn: (url: string) => Promise<Response>): typeof fetch => fn as unknown as typeof fetch
const upstream = { dataSource: 'upstream' as const, sourceManifestUrl: 'https://m.test/manifest.json', sourceManifestFallbackUrl: '' }

describe('数据源指针（T4）', () => {
  it('清单里的试玩稿（prerelease）类型仓库与来源能被读取并建索引', () => {
    const raw = makeManifest()
    const ua = { id: 'prerelease-ua', label: 'ua', kind: 'prerelease', lang: 'en', role: 'primary', repoUrl: 'https://example.test/ua', branch: 'master', baseUrl: 'https://raw.example.test/ua/', fallbackBaseUrl: 'https://cdn.example.test/ua/', revision: null, snapshotHash: 'abc', jsonCount: 1, contentRecords: 5, metaRecords: 0 }
    ;(raw.repos as unknown[]).push(ua)
    ;(raw.sources as unknown[]).push({ key: 'prerelease:UA2020Feats', id: 'UA2020Feats', kind: 'prerelease', name: 'UA2020Feats', nameEn: 'UA2020Feats', edition: '2014', declared: true, listedBy: ['data'] })
    ;(raw.files as unknown[]).push({ repo: 'prerelease-ua', path: 'feat/UA2020Feats.json', kind: 'content', bytes: 10, sha256: 'x', sourceIds: ['UA2020Feats'], contentRecords: 5, url: 'u', fallbackUrl: 'f' })
    raw.recordIndex = { file: 'records.jsonl.gz', count: 17, sha256: 'z' }
    const m = manifestSchema.parse(raw)
    expect(reconcileManifest(m)).toEqual([])
    expect(buildSourceIndex(m).filesBySource.get('prerelease:UA2020Feats')?.length).toBe(1)
  })

  it('旧库模式：不联网，也不碰任何清单', async () => {
    const fetchFn = vi.fn()
    const active = await resolveDataSource({ dataSource: 'legacy', sourceManifestUrl: 'https://m.test/x', sourceManifestFallbackUrl: '' }, { fetchFn: fetchFn as unknown as typeof fetch })
    expect(active).toEqual({ mode: 'legacy' })
    expect(fetchFn).not.toHaveBeenCalled()
  })

  it('设置：新增三项都有默认值，旧设置照常读出（不需要迁移）', () => {
    expect(settingsSchema.parse({})).toMatchObject({ dataSource: 'legacy', sourceManifestUrl: '', sourceManifestFallbackUrl: '' })
    const old = settingsSchema.parse({ reminderDays: 3, catalogUrl: 'https://old.test/catalog.json', variantDefault: 'skip' })
    expect(old).toMatchObject({ reminderDays: 3, catalogUrl: 'https://old.test/catalog.json', variantDefault: 'skip', dataSource: 'legacy' })
  })

  it('上游模式：读到清单，来源→文件索引由清单自己建出，官方与自制走同一条路', async () => {
    const manifest = makeManifest()
    const active = await resolveDataSource(upstream, { fetchFn: asFetch(async () => json(manifest)) })
    if (active.mode !== 'upstream') throw new Error('应当是上游模式')
    expect(active.from).toBe('primary')
    expect(active.index.sources.size).toBe((manifest.sources as unknown[]).length)
    expect(active.index.filesBySource.get('official:PHB')?.map((f) => f.repo).sort()).toEqual(['official-cn', 'official-en'])
    expect(active.index.filesBySource.get('homebrew:Fey')).toHaveLength(1)
    expect(active.index.lookups).toHaveLength((manifest.lookups as unknown[]).length)
  })

  it('主地址失败时读备用地址', async () => {
    const seen: string[] = []
    const fetchFn = asFetch(async (url) => { seen.push(url); return url.includes('primary') ? new Response('', { status: 503 }) : json(makeManifest()) })
    const active = await resolveDataSource({ dataSource: 'upstream', sourceManifestUrl: 'https://m.test/primary.json', sourceManifestFallbackUrl: 'https://m.test/backup.json' }, { fetchFn })
    expect(seen).toEqual(['https://m.test/primary.json', 'https://m.test/backup.json'])
    expect(active.mode).toBe('upstream')
    if (active.mode === 'upstream') expect(active.from).toBe('fallback')
  })

  it('读不到、没配置、格式不对、账目对不上：都退回旧库并带提示，不抛错', async () => {
    const quiet = vi.spyOn(console, 'error').mockImplementation(() => undefined)
    try {
      const notConfigured = await resolveDataSource({ dataSource: 'upstream', sourceManifestUrl: '', sourceManifestFallbackUrl: '' })
      expect(notConfigured).toMatchObject({ mode: 'legacy', notice: { code: 'E_SOURCE_NOT_CONFIGURED' } })

      const down = await resolveDataSource(upstream, { fetchFn: asFetch(async () => { throw new TypeError('Failed to fetch') }) })
      expect(down).toMatchObject({ mode: 'legacy', notice: { code: 'E_SOURCE_UNAVAILABLE' } })

      const notJson = await resolveDataSource(upstream, { fetchFn: asFetch(async () => new Response('not json')) })
      expect(notJson).toMatchObject({ mode: 'legacy', notice: { code: 'E_SOURCE_MANIFEST_BAD' } })

      const wrongKind = await resolveDataSource(upstream, { fetchFn: asFetch(async () => json({ kind: 'something-else' })) })
      expect(wrongKind).toMatchObject({ mode: 'legacy', notice: { code: 'E_SOURCE_MANIFEST_BAD' } })

      const newer = await resolveDataSource(upstream, { fetchFn: asFetch(async () => json({ ...makeManifest(), formatVersion: 99 })) })
      expect(newer).toMatchObject({ mode: 'legacy', notice: { code: 'E_NEWER_FORMAT' } })

      const missing = await resolveDataSource(upstream, { fetchFn: asFetch(async () => json({ formatVersion: 1, kind: 'trpg-5etools-source-manifest' })) })
      expect(missing).toMatchObject({ mode: 'legacy', notice: { code: 'E_SOURCE_MANIFEST_BAD' } })

      const broken = makeManifest()
      broken.recordIndex = { file: 'records.jsonl.gz', count: 999, sha256: 'z' }
      const mismatch = await resolveDataSource(upstream, { fetchFn: asFetch(async () => json(broken)) })
      expect(mismatch).toMatchObject({ mode: 'legacy', notice: { code: 'E_SOURCE_MANIFEST_BAD' } })
    } finally {
      quiet.mockRestore()
    }
  })

  it('等待超时也退回旧库', async () => {
    const quiet = vi.spyOn(console, 'error').mockImplementation(() => undefined)
    try {
      const hang = asFetch(((_url: string, init?: RequestInit) => new Promise((_, reject) => init?.signal?.addEventListener('abort', () => reject(Object.assign(new Error('aborted'), { name: 'AbortError' }))))) as unknown as (url: string) => Promise<Response>)
      const active = await resolveDataSource(upstream, { fetchFn: hang, timeoutMs: 20 })
      expect(active).toMatchObject({ mode: 'legacy', notice: { code: 'E_SOURCE_UNAVAILABLE' } })
    } finally {
      quiet.mockRestore()
    }
  })
})

describe('源清单自检', () => {
  const parse = (raw: Record<string, unknown>): SourceManifest => manifestSchema.parse(raw)

  it('自洽的清单没有问题', () => {
    expect(reconcileManifest(parse(makeManifest()))).toEqual([])
  })

  it('能发现：仓库文件数对不上、文件指向不存在的仓库、来源表缺来源、来源键重复', () => {
    const noFile = makeManifest()
    noFile.files = (noFile.files as unknown[]).slice(1)
    expect(reconcileManifest(parse(noFile)).join('|')).toContain('声明')

    const stray = makeManifest()
    stray.files = [...(stray.files as unknown[]), { repo: 'nowhere', path: 'a.json', kind: 'content', bytes: 1, sha256: 'x', sourceIds: [], contentRecords: 0, url: 'u', fallbackUrl: 'u' }]
    expect(reconcileManifest(parse(stray)).join('|')).toContain('不存在的仓库')

    const lostSource = makeManifest()
    lostSource.sources = (lostSource.sources as unknown[]).slice(1)
    expect(reconcileManifest(parse(lostSource)).join('|')).toContain('不在来源表里')

    const dup = makeManifest()
    dup.sources = [...(dup.sources as unknown[]), (dup.sources as unknown[])[0]]
    expect(reconcileManifest(parse(dup)).join('|')).toContain('来源键重复')
  })

  it('索引只收内容文件；同一来源在多个仓库时都能查到', () => {
    const index = buildSourceIndex(parse(makeManifest()))
    for (const files of index.filesBySource.values()) for (const f of files) expect(f.kind).toBe('content')
    expect(index.repos.get('official-cn')?.lang).toBe('zh')
  })
})
