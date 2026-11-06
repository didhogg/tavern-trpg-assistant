import { z } from 'zod'

/**
 * T3 源清单（trpg-5etools-source-manifest）的读取与自检。
 * 这里没有书单、来源名单或条目名单：源、文件、来源 ID 全部来自清单本身。
 */
export const MANIFEST_KIND = 'trpg-5etools-source-manifest'
export const SUPPORTED_MANIFEST_FORMAT = 1

const count = z.number().int().nonnegative()

const repoSchema = z.looseObject({
  id: z.string().min(1),
  label: z.string(),
  kind: z.enum(['official', 'homebrew', 'prerelease']),
  lang: z.enum(['zh', 'en']),
  role: z.string(),
  repoUrl: z.string(),
  branch: z.string(),
  baseUrl: z.string(),
  fallbackBaseUrl: z.string(),
  revision: z.string().nullable(),
  snapshotHash: z.string(),
  jsonCount: count,
  contentRecords: count,
  metaRecords: count,
})

const sourceSchema = z.looseObject({
  key: z.string().min(1),
  id: z.string().min(1),
  kind: z.enum(['official', 'homebrew', 'prerelease']),
  name: z.string().nullish(),
  nameEn: z.string().nullish(),
  edition: z.enum(['2014', '2024', 'unknown', 'mixed']),
  declared: z.boolean(),
})

const fileSchema = z.looseObject({
  repo: z.string(),
  path: z.string(),
  kind: z.enum(['content', 'index', 'lookup', 'other', 'error']),
  bytes: count,
  sha256: z.string(),
  sourceIds: z.array(z.string()),
  contentRecords: count,
  url: z.string(),
  fallbackUrl: z.string(),
})

const lookupSchema = z.looseObject({ repo: z.string(), path: z.string(), kind: z.string(), sha256: z.string() })

export const manifestSchema = z.looseObject({
  formatVersion: z.number().int(),
  kind: z.literal(MANIFEST_KIND),
  repos: z.array(repoSchema).min(1),
  sources: z.array(sourceSchema),
  files: z.array(fileSchema),
  lookups: z.array(lookupSchema),
  recordIndex: z.looseObject({ file: z.string(), count, sha256: z.string() }),
})

export type SourceManifest = z.infer<typeof manifestSchema>
export type ManifestRepo = SourceManifest['repos'][number]
export type ManifestSource = SourceManifest['sources'][number]
export type ManifestFile = SourceManifest['files'][number]

/**
 * 清单内部的账目是否自洽（不对任何固定数字）：
 * 每个仓库的文件数 = 清单里该仓库的文件条数；记录索引行数 = 各仓库内容记录数之和；
 * 来源键不重复；文件指向的仓库存在；内容文件的来源 ID 都能在来源表里找到。
 * 返回问题列表，空表示自洽。
 */
export function reconcileManifest(m: SourceManifest): string[] {
  const issues: string[] = []
  const repos = new Map(m.repos.map((r) => [r.id, r]))
  if (repos.size !== m.repos.length) issues.push('仓库编号重复')
  const perRepo = new Map<string, number>()
  for (const f of m.files) perRepo.set(f.repo, (perRepo.get(f.repo) ?? 0) + 1)
  for (const f of m.files) if (!repos.has(f.repo)) issues.push(`文件指向不存在的仓库：${f.repo}/${f.path}`)
  for (const r of m.repos) if ((perRepo.get(r.id) ?? 0) !== r.jsonCount) issues.push(`仓库 ${r.id} 声明 ${r.jsonCount} 个 JSON，清单里有 ${perRepo.get(r.id) ?? 0} 条`)
  const records = m.repos.reduce((a, r) => a + r.contentRecords, 0)
  if (m.recordIndex.count !== records) issues.push(`记录索引 ${m.recordIndex.count} 行，各仓库内容记录合计 ${records}`)
  const keys = new Set(m.sources.map((s) => s.key))
  if (keys.size !== m.sources.length) issues.push('来源键重复')
  for (const f of m.files) {
    if (f.kind !== 'content') continue
    const kind = repos.get(f.repo)?.kind
    for (const id of f.sourceIds) if (!keys.has(`${kind}:${id}`)) issues.push(`内容文件 ${f.repo}/${f.path} 的来源 ${id} 不在来源表里`)
  }
  return issues.slice(0, 20)
}

export interface SourceIndex {
  repos: Map<string, ManifestRepo>
  /** 来源键（"official:PHB"）→ 来源 */
  sources: Map<string, ManifestSource>
  /** 来源键 → 含该来源的内容文件（一个来源可在多个文件、多个仓库） */
  filesBySource: Map<string, ManifestFile[]>
  /** 上游自己的索引与查找表（不手写） */
  lookups: SourceManifest['lookups']
}

/** 来源 → 文件：用 files[].sourceIds 建，来源键 = 仓库种类 + 来源 ID，官方与自制走同一条路。 */
export function buildSourceIndex(m: SourceManifest): SourceIndex {
  const repos = new Map(m.repos.map((r) => [r.id, r]))
  const filesBySource = new Map<string, ManifestFile[]>()
  for (const f of m.files) {
    if (f.kind !== 'content') continue
    const kind = repos.get(f.repo)?.kind
    for (const id of f.sourceIds) {
      const key = `${kind}:${id}`
      filesBySource.set(key, [...(filesBySource.get(key) ?? []), f])
    }
  }
  return { repos, sources: new Map(m.sources.map((s) => [s.key, s])), filesBySource, lookups: m.lookups }
}
