import { createHash } from 'node:crypto'
import { mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { gzipSync } from 'node:zlib'
import { OUT_ROOT } from '../lib/paths'
import { stableStringify } from '../../../src/core/hash'
import { REPOS, ensureClonedRepos, repoRevision } from './repos'
import { scanRepo } from './scanRepo'
import { loadCatalog, editionFromDate, editionFromHomebrew, pairCoverage } from './catalog'
import type { Lang, MetaSource, RecordRow, RepoScan, SourceEntry, SourceKind, Validation } from './types'

const OUT = join(OUT_ROOT, 'source-manifest')
const sha = (b: Uint8Array): string => createHash('sha256').update(b).digest('hex')

interface LangAgg { records: number; files: Set<string>; categories: Map<string, number> }
interface Agg {
  id: string
  kind: SourceKind
  names: Partial<Record<Lang, string>>
  abbreviation: string | null
  published: string | null
  edition: string
  declared: boolean
  license: string | null
  url: string | null
  version: string | null
  authors: Set<string>
  convertedBy: Set<string>
  langs: Partial<Record<Lang, LangAgg>>
  editions: Set<string>
}

const aggKey = (kind: SourceKind, id: string): string => `${kind}:${id}`

function makeAgg(kind: SourceKind, id: string, declared = false): Agg {
  return {
    id, kind, names: {}, abbreviation: null, published: null, edition: 'unknown',
    declared, license: null, url: null, version: null, authors: new Set(), convertedBy: new Set(),
    langs: {}, editions: new Set(),
  }
}

function langAgg(a: Agg, lang: Lang): LangAgg {
  const x = a.langs[lang] ?? (a.langs[lang] = { records: 0, files: new Set(), categories: new Map() })
  return x
}

function mainSync(): { scans: RepoScan[]; aggs: Map<string, Agg>; rows: string[]; stats: Stats } {
  ensureClonedRepos()
  const aggs = new Map<string, Agg>()
  const rows: string[] = []
  const stats: Stats = {
    namedRecords: 0,
    sourceNamedRecords: 0,
    shapeCounts: {},
    missingSource: { count: 0, byCategory: {}, examples: [] },
    missingName: { count: 0, byCategory: {}, examples: [] },
    duplicates: new Map(),
    metaFields: new Map(),
    metaConflicts: [],
  }
  const scans: RepoScan[] = []

  const agg = (kind: SourceKind, id: string): Agg => {
    const key = aggKey(kind, id)
    let a = aggs.get(key)
    if (!a) { a = makeAgg(kind, id); aggs.set(key, a) }
    return a
  }
  const mergeMeta = (repoId: string, lang: Lang, meta: MetaSource, fileEdition: string | null): void => {
    const a = agg('homebrew', meta.id)
    a.declared = true
    if (meta.full) a.names[lang] = a.names[lang] ?? meta.full
    a.abbreviation = a.abbreviation ?? meta.abbreviation ?? null
    a.url = a.url ?? meta.url ?? null
    a.version = a.version ?? meta.version ?? null
    a.license = a.license ?? meta.license ?? null
    a.published = a.published ?? meta.dateReleased ?? null
    for (const x of meta.authors ?? []) a.authors.add(x)
    for (const x of meta.convertedBy ?? []) a.convertedBy.add(x)
    if (fileEdition) a.editions.add(fileEdition)
    for (const [field, value] of [['full', meta.full], ['abbreviation', meta.abbreviation], ['url', meta.url], ['version', meta.version], ['dateReleased', meta.dateReleased], ['license', meta.license]] as const) {
      if (!value) continue
      const key = `${repoId}|${meta.id}|${lang}|${field}`
      const seen = stats.metaFields.get(key) ?? { id: meta.id, field, values: new Set<string>(), files: new Set<string>() }
      seen.values.add(value)
      seen.files.add(`${lang}`)
      stats.metaFields.set(key, seen)
    }
  }
  const addRow = (repo: { id: string; kind: SourceKind; lang: Lang }, file: string, row: RecordRow): void => {
    if (row.source) {
      const a = agg(repo.kind, row.source)
      const la = langAgg(a, repo.lang)
      la.records += 1
      la.files.add(file)
      la.categories.set(row.category, (la.categories.get(row.category) ?? 0) + 1)
      if (row.edition !== 'unknown') a.editions.add(row.edition)
    }
    stats.shapeCounts[row.shape] = (stats.shapeCounts[row.shape] ?? 0) + 1
    if (row.shape === 'named' || row.shape === 'copy') stats.namedRecords += 1
    if (row.shape === 'named' && row.source) stats.sourceNamedRecords += 1
    if (row.shape === 'named' && !row.source) {
      stats.missingSource.count += 1
      stats.missingSource.byCategory[row.category] = (stats.missingSource.byCategory[row.category] ?? 0) + 1
      if (stats.missingSource.examples.length < 20) stats.missingSource.examples.push(`${repo.id} ${file} ${row.category}#${row.index} ${row.name ?? ''}`)
    }
    if (row.shape === 'unnamed' && row.source) {
      stats.missingName.count += 1
      stats.missingName.byCategory[row.category] = (stats.missingName.byCategory[row.category] ?? 0) + 1
      if (stats.missingName.examples.length < 20) stats.missingName.examples.push(`${repo.id} ${file} ${row.category}#${row.index}`)
    }
    if (row.name && row.source) {
      const k = `${repo.id}|${row.category}|${row.source}|${row.name}`
      const d = stats.duplicates.get(k) ?? { count: 0, locations: [] as string[] }
      d.count += 1
      if (d.locations.length < 5) d.locations.push(`${file}#${row.index}`)
      stats.duplicates.set(k, d)
    }
    rows.push(JSON.stringify({ repo: repo.id, path: file, category: row.category, index: row.index, name: row.name, nameEn: row.nameEn, source: row.source, edition: row.edition, shape: row.shape }))
  }

  for (const config of REPOS) {
    const scan = scanRepo(config, (repo, file, recordRows, jsonScan) => {
      for (const meta of jsonScan.metaSources) mergeMeta(repo.id, repo.lang, meta, jsonScan.fileEdition)
      for (const row of recordRows) addRow(repo, file.path, row)
      for (const id of jsonScan.sourceIds) {
        const a = agg(repo.kind, id)
        a.declared = a.declared || jsonScan.metaSources.some((m) => m.id === id)
      }
    })
    scans.push(scan)
    for (const id of scan.declaredSourceIds) agg(config.kind, id).declared = true
    for (const id of scan.sourceIds) agg(config.kind, id)
    if (config.kind === 'official') {
      const catalog = loadCatalog(config.root, config.lang)
      for (const item of catalog.values()) {
        const a = agg('official', item.source)
        a.declared = true
        if (config.lang === 'zh') a.names.zh = a.names.zh ?? item.name ?? undefined
        else a.names.en = a.names.en ?? item.name ?? undefined
        if (item.nameEn) a.names.en = a.names.en ?? item.nameEn ?? undefined
        a.published = a.published ?? item.published ?? null
      }
    }
    // 自制索引：来源 ID → 文件；来源可能没有记录，但仍要登记。
    for (const [id, path] of Object.entries(scan.indexSources)) {
      const a = agg(config.kind, id)
      a.declared = true
      const la = langAgg(a, config.lang)
      la.files.add(path)
    }
  }

  for (const item of stats.metaFields.values()) if (item.values.size > 1) stats.metaConflicts.push({ id: item.id, field: item.field, values: [...item.values].sort(), files: [...item.files].sort() })
  return { scans, aggs, rows, stats }
}

interface Stats {
  namedRecords: number
  sourceNamedRecords: number
  shapeCounts: Record<string, number>
  missingSource: { count: number; byCategory: Record<string, number>; examples: string[] }
  missingName: { count: number; byCategory: Record<string, number>; examples: string[] }
  duplicates: Map<string, { count: number; locations: string[] }>
  metaFields: Map<string, { id: string; field: string; values: Set<string>; files: Set<string> }>
  metaConflicts: Array<{ id: string; field: string; values: string[]; files: string[] }>
}

function finalizeSources(aggs: Map<string, Agg>, scans: RepoScan[]): SourceEntry[] {
  const declared = new Set<string>()
  for (const s of scans) for (const id of s.declaredSourceIds) declared.add(`${s.config.kind}:${id}`)
  const out: SourceEntry[] = []
  for (const a of [...aggs.values()].sort((x, y) => aggKey(x.kind, x.id).localeCompare(aggKey(y.kind, y.id)))) {
    const editions = [...a.editions].filter((x) => x === '2014' || x === '2024')
    if (a.kind === 'official') {
      const byDate = editionFromDate(a.published)
      a.edition = byDate !== 'unknown' ? byDate : editions.length === 1 ? editions[0]! : editions.length > 1 ? 'mixed' : 'unknown'
    } else {
      const byMeta = [...new Set([...a.editions].map((x) => editionFromHomebrew(x)))].filter((x) => x !== 'unknown')
      a.edition = byMeta.length === 1 ? byMeta[0]! : byMeta.length > 1 ? 'mixed' : 'unknown'
    }
    a.declared = declared.has(aggKey(a.kind, a.id)) || a.declared
    out.push({
      key: aggKey(a.kind, a.id), id: a.id, kind: a.kind, name: a.names.zh ?? a.names.en ?? a.id, nameEn: a.names.en ?? null,
      abbreviation: a.abbreviation, published: a.published, edition: a.edition, declared: a.declared,
      license: a.license, url: a.url, version: a.version, authors: [...a.authors].sort(), convertedBy: [...a.convertedBy].sort(),
      languages: Object.fromEntries((['zh', 'en'] as Lang[]).filter((l) => a.langs[l]).map((l) => {
        const la = a.langs[l]!
        return [l, { records: la.records, contentRecords: la.records, files: la.files.size, categories: Object.fromEntries([...la.categories].sort(([x], [y]) => x.localeCompare(y))) }]
      })),
    })
  }
  for (const x of out) if (!x.nameEn && x.languages.en) x.nameEn = x.name
  return out
}

async function readRemoteIndex(url: string): Promise<Set<string> | null> {
  try {
    const r = await fetch(url, { signal: AbortSignal.timeout(15_000), cache: 'no-store' })
    if (!r.ok) return null
    const j = await r.json() as unknown
    if (!j || typeof j !== 'object' || Array.isArray(j)) return null
    return new Set(Object.keys(j))
  } catch { return null }
}

function compareIndex(url: string, local: Set<string>, remote: Set<string> | null): Validation['remoteIndexes']['homebrewEn'] {
  if (!remote) return null
  return {
    url, remote: remote.size, local: local.size,
    remoteOnly: [...remote].filter((x) => !local.has(x)).sort(),
    localOnly: [...local].filter((x) => !remote.has(x)).sort(),
  }
}

async function probe(url: string, repo: string): Promise<Validation['fetchProbes'][number]> {
  const t = Date.now()
  try {
    const r = await fetch(url, { signal: AbortSignal.timeout(15_000), cache: 'no-store' })
    const b = await r.arrayBuffer()
    return { repo, url, ok: r.ok, status: r.status, bytes: b.byteLength, contentType: r.headers.get('content-type'), ms: Date.now() - t, error: null }
  } catch (e) {
    return { repo, url, ok: false, status: null, bytes: null, contentType: null, ms: Date.now() - t, error: String((e as Error).message).slice(0, 200) }
  }
}

async function main(): Promise<void> {
  const { scans, aggs, rows, stats } = mainSync()
  const sources = finalizeSources(aggs, scans)
  const manifestDir = OUT
  mkdirSync(manifestDir, { recursive: true })

  const repoKind = new Map(scans.map((s) => [s.config.id, s.config.kind]))
  const sourceEdition = new Map(sources.map((s) => [s.key, s.edition]))
  const finalRows = rows.map((line) => {
    const r = JSON.parse(line) as { repo: string; source: string | null; edition: string }
    const kind = repoKind.get(r.repo)
    if (r.edition === 'classic') r.edition = '2014'
    else if (r.edition === 'one') r.edition = '2024'
    if (r.edition === 'unknown' && r.source && kind) {
      const e = sourceEdition.get(`${kind}:${r.source}`)
      if (e === '2014' || e === '2024' || e === 'mixed') r.edition = e
    }
    return JSON.stringify({ ...r, kind: kind ?? null })
  })
  const recordsBuf = gzipSync(Buffer.from(finalRows.join('\n') + (finalRows.length ? '\n' : ''), 'utf8'), { level: 9 })
  const recordsPath = join(manifestDir, 'records.jsonl.gz')
  writeFileSync(recordsPath, recordsBuf)
  const recordsHash = sha(recordsBuf)

  const files = scans.flatMap((s) => s.files.map((f) => {
    const cfg = s.config
    return { ...f, url: cfg.baseUrl + f.path, fallbackUrl: cfg.fallbackBaseUrl + f.path }
  })).sort((a, b) => `${a.repo}/${a.path}`.localeCompare(`${b.repo}/${b.path}`))
  const repoRows = scans.map((s) => ({
    id: s.config.id, label: s.config.label, kind: s.config.kind, lang: s.config.lang, role: s.config.role,
    repoUrl: s.config.repoUrl, branch: s.config.branch, baseUrl: s.config.baseUrl, fallbackBaseUrl: s.config.fallbackBaseUrl,
    revision: repoRevision(s.config), snapshotHash: s.snapshotHash,
    fileCount: s.fileCount, jsonCount: s.jsonCount, contentFileCount: s.contentFileCount, bytesJson: s.bytesJson,
    contentRecords: s.contentRecords, metaRecords: s.metaRecords, sourceIds: s.sourceIds.size, declaredSourceIds: s.declaredSourceIds.size,
    otherByExt: s.otherByExt,
  }))
  const lookups = files.filter((f) => f.kind === 'lookup' || f.kind === 'index').map((f) => ({ repo: f.repo, path: f.path, kind: f.kind, bytes: f.bytes, sha256: f.sha256 }))

  const byKind = (kind: SourceKind): Record<string, number> => {
    const x: Record<string, number> = { '2014': 0, '2024': 0, unknown: 0, mixed: 0 }
    for (const s of sources) if (s.kind === kind) x[s.edition] = (x[s.edition] ?? 0) + 1
    return x
  }
  const homebrewEn = scans.find((s) => s.config.id === 'homebrew-en')!
  const homebrewZh = scans.find((s) => s.config.id === 'homebrew-zh')!
  const cn = scans.find((s) => s.config.id === 'official-cn')!
  const bak = scans.find((s) => s.config.id === 'official-en-bak')!
  const en = scans.find((s) => s.config.id === 'official-en-src')!
  const translations = {
    officialCnEn: pairCoverage('official-cn', cn.declaredSourceIds, 'official-en-bak', bak.declaredSourceIds),
    officialEnSrcBak: pairCoverage('official-en-src', en.declaredSourceIds, 'official-en-bak', bak.declaredSourceIds),
    homebrewEnZh: pairCoverage('homebrew-en', homebrewEn.declaredSourceIds, 'homebrew-zh', homebrewZh.declaredSourceIds),
  }
  const indexedFiles = (s: RepoScan): Set<string> => new Set(Object.values(s.indexSources))
  const indexMismatches = {
    en: {
      ids: Object.keys(homebrewEn.indexSources).length,
      files: indexedFiles(homebrewEn).size,
      missing: homebrewEn.indexMissing,
      extraFiles: homebrewEn.files.filter((f) => f.kind === 'content' && !indexedFiles(homebrewEn).has(f.path)).length,
    },
    zh: {
      ids: Object.keys(homebrewZh.indexSources).length,
      files: indexedFiles(homebrewZh).size,
      missing: homebrewZh.indexMissing,
      extraFiles: homebrewZh.files.filter((f) => f.kind === 'content' && !indexedFiles(homebrewZh).has(f.path)).length,
    },
  }
  const probes: Validation['fetchProbes'] = []
  for (const s of scans) {
    probes.push(await probe(s.config.baseUrl + s.config.probePath, `${s.config.id}:primary`))
    probes.push(await probe(s.config.fallbackBaseUrl + s.config.probePath, `${s.config.id}:fallback`))
  }

  const manifest = {
    formatVersion: 1,
    kind: 'trpg-5etools-source-manifest',
    sources,
    repos: repoRows,
    files,
    lookups,
    translations,
    editions: { official: byKind('official'), homebrew: byKind('homebrew') },
    recordIndex: { file: 'records.jsonl.gz', count: rows.length, bytes: recordsBuf.byteLength, sha256: recordsHash },
  }
  const manifestHash = sha(Buffer.from(stableStringify(manifest), 'utf8'))
  const validation: Validation = {
    fileErrors: files.filter((f) => f.kind === 'error').map((f) => ({ repo: f.repo, path: f.path, error: f.error ?? '' })),
    totals: {
      repos: scans.length,
      files: scans.reduce((a, s) => a + s.fileCount, 0),
      jsonFiles: scans.reduce((a, s) => a + s.jsonCount, 0),
      contentFiles: scans.reduce((a, s) => a + s.contentFileCount, 0),
      bytesJson: scans.reduce((a, s) => a + s.bytesJson, 0),
      contentRecords: scans.reduce((a, s) => a + s.contentRecords, 0),
      namedRecords: stats.namedRecords,
      sourceNamedRecords: stats.sourceNamedRecords,
      metaRecords: scans.reduce((a, s) => a + s.metaRecords, 0),
      sourceIds: sources.length,
    },
    byRepo: Object.fromEntries(scans.map((s) => [s.config.id, {
      files: s.fileCount, jsonFiles: s.jsonCount, contentFiles: s.contentFileCount, bytesJson: s.bytesJson,
      contentRecords: s.contentRecords, metaRecords: s.metaRecords, sourceIds: s.sourceIds.size, otherByExt: s.otherByExt,
    }])),
    shapeCounts: stats.shapeCounts,
    missingSource: stats.missingSource,
    missingName: stats.missingName,
    unresolvedSourceRefs: {
      count: sources.filter((s) => !s.declared).length,
      ids: sources.filter((s) => !s.declared).map((s) => s.key).sort(),
      examples: sources.filter((s) => !s.declared).slice(0, 30).map((s) => `${s.key} (${s.languages.zh?.records ?? 0} zh / ${s.languages.en?.records ?? 0} en)`),
    },
    duplicateRecords: {
      total: [...stats.duplicates.values()].reduce((a, d) => a + d.count - 1, 0),
      groups: [...stats.duplicates].filter(([, d]) => d.count > 1).sort((a, b) => b[1].count - a[1].count).map(([key, d]) => ({ key, count: d.count, locations: d.locations })),
    },
    sourceMetadataConflicts: stats.metaConflicts,
    indexMismatches,
    editions: {
      official: byKind('official'), homebrew: byKind('homebrew'),
      unknown: sources.filter((s) => s.edition === 'unknown').map((s) => s.key).sort(),
      mixed: sources.filter((s) => s.edition === 'mixed').map((s) => s.key).sort(),
    },
    translations,
    remoteIndexes: {
      homebrewEn: compareIndex(homebrewEn.config.baseUrl + homebrewEn.config.probePath, new Set(Object.keys(homebrewEn.indexSources)), await readRemoteIndex(homebrewEn.config.baseUrl + homebrewEn.config.probePath)),
      homebrewZh: compareIndex(homebrewZh.config.baseUrl + homebrewZh.config.probePath, new Set(Object.keys(homebrewZh.indexSources)), await readRemoteIndex(homebrewZh.config.baseUrl + homebrewZh.config.probePath)),
    },
    fetchProbes: probes,
    manifestHash,
    recordsHash,
  }
  writeFileSync(join(manifestDir, 'manifest.json'), `${stableStringify(manifest)}\n`)
  writeFileSync(join(manifestDir, 'validation.json'), `${stableStringify(validation)}\n`)
  const { writeHumanReport } = await import('./report')
  writeFileSync(join(manifestDir, 'validation.md'), writeHumanReport(manifest, validation))
  console.log(`源清单 ${manifestDir}/manifest.json`)
  console.log(`JSON 文件 ${validation.totals.jsonFiles} 条记录 ${validation.totals.contentRecords} 来源 ${sources.length}`)
  console.log(`自制中文覆盖 ${translations.homebrewEnZh.paired}/${translations.homebrewEnZh.primaryIds}；未翻译 ${translations.homebrewEnZh.onlyPrimary.length}`)
  console.log(`清单哈希 ${manifestHash.slice(0, 16)}；记录索引 ${rows.length} 行`)
  if (validation.fileErrors.length || validation.indexMismatches.en.missing.length || validation.indexMismatches.zh.missing.length) process.exitCode = 1
}

await main()
