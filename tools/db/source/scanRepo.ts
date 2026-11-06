import { createHash } from 'node:crypto'
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs'
import { basename, extname, join, relative } from 'node:path'
import type { FileEntry, FileKind, JsonScan, MetaSource, RecordRow, RepoConfig, RepoScan } from './types'
import { scanJson, stableCounts } from './scanJson'

const sha256 = (bytes: Uint8Array): string => createHash('sha256').update(bytes).digest('hex')
const isObj = (v: unknown): v is Record<string, unknown> => !!v && typeof v === 'object' && !Array.isArray(v)

interface WalkFile { abs: string; rel: string; repoRel: string; ext: string; bytes: number }
function walk(root: string, repoRoot: string): WalkFile[] {
  const out: WalkFile[] = []
  const visit = (dir: string): void => {
    for (const name of readdirSync(dir).sort()) {
      if (name === '.git') continue
      const abs = join(dir, name)
      const st = statSync(abs)
      if (st.isDirectory()) { visit(abs); continue }
      const ext = extname(name).toLowerCase() || '(none)'
      out.push({ abs, rel: relative(root, abs).split('\\').join('/'), repoRel: relative(repoRoot, abs).split('\\').join('/'), ext, bytes: st.size })
    }
  }
  visit(root)
  return out
}

function kindOf(rel: string): FileKind {
  if (basename(rel) === 'edgeone.json') return 'other'
  if (basename(rel) === 'index.json' || basename(rel) === 'fluff-index.json') return 'index'
  if (basename(rel).startsWith('changelog')) return 'other'
  if (rel.includes('/_generated/')) return 'index'
  if (rel.startsWith('_generated/')) return 'index'
  if (rel.includes('/generated/') || rel.startsWith('generated/')) return 'lookup'
  if (basename(rel) === 'package.json' || basename(rel) === 'package-lock.json') return 'other'
  if (basename(rel).startsWith('_')) return 'other'
  return 'content'
}

/** 上游自带的目录文件（books.json / adventures.json）里声明的来源 ID；不写书单。 */
function declaredFromIndex(root: string): Set<string> {
  const out = new Set<string>()
  for (const file of ['books.json', 'adventures.json']) {
    const p = join(root, file)
    if (!existsSync(p)) continue
    try {
      const top = JSON.parse(readFileSync(p, 'utf8')) as Record<string, unknown>
      for (const key of ['book', 'adventure']) {
        const list = top[key]
        if (!Array.isArray(list)) continue
        for (const item of list) if (isObj(item) && typeof item.source === 'string') out.add(item.source)
      }
    } catch { /* 文件级错误由正常扫描记录 */ }
  }
  return out
}

export type FileRecordSink = (repo: RepoConfig, file: FileEntry, rows: RecordRow[], scan: JsonScan) => void

/** 扫一个源目录。只读；不复制文件，不按书/条目写名单。 */
export function scanRepo(config: RepoConfig, onRecords?: FileRecordSink): RepoScan {
  const all = walk(config.root, config.repoRoot)
  const files: FileEntry[] = []
  const otherByExt: Record<string, number> = {}
  const declared = declaredFromIndex(config.root)
  const metaSources: MetaSource[] = []
  const indexSources: Record<string, string> = {}
  const indexMissing: Array<{ id: string; path: string }> = []
  let contentRecords = 0
  let metaRecords = 0
  let bytesJson = 0
  let contentFileCount = 0
  const sourceIds = new Set<string>()
  const hash = createHash('sha256')

  for (const f of all) {
    if (f.ext !== '.json') { otherByExt[f.ext] = (otherByExt[f.ext] ?? 0) + 1; continue }
    let kind = kindOf(f.rel)
    const bytes = readFileSync(f.abs)
    const digest = sha256(bytes)
    bytesJson += f.bytes
    hash.update(`${f.repoRel}\u0000${f.bytes}\u0000${digest}\n`)
    let top: unknown
    try { top = JSON.parse(bytes.toString('utf8')) } catch (e) {
      files.push({ repo: config.id, lang: config.lang, path: f.repoRel, kind: 'error', bytes: f.bytes, sha256: digest, contentRecords: 0, metaRecords: 0, sourceIds: [], categories: {}, editionCounts: {}, error: String((e as Error).message) })
      continue
    }
    if (kind === 'other') {
      files.push({ repo: config.id, lang: config.lang, path: f.repoRel, kind, bytes: f.bytes, sha256: digest, contentRecords: 0, metaRecords: 0, sourceIds: [], categories: {}, editionCounts: {} })
      continue
    }
    if (kind === 'content' && Array.isArray(top)) kind = 'other'
    if (kind === 'content') contentFileCount += 1
    const scan = kind === 'content' ? scanJson(top, config.lang) : { topKeys: [], fileEdition: null, metaSources: [], records: [], contentRecords: 0, metaRecords: 0, categories: {}, sourceIds: [], missingSourceRecords: 0, missingNameRecords: 0 }
    for (const s of scan.metaSources) { metaSources.push(s); declared.add(s.id) }
    if (kind === 'content') {
      for (const id of scan.sourceIds) sourceIds.add(id)
      contentRecords += scan.contentRecords
      metaRecords += scan.metaRecords
      onRecords?.(config, { repo: config.id, lang: config.lang, path: f.repoRel, kind, bytes: f.bytes, sha256: digest, contentRecords: scan.contentRecords, metaRecords: scan.metaRecords, sourceIds: scan.sourceIds, categories: Object.fromEntries(Object.entries(scan.categories).map(([k, v]) => [k, v.content])), editionCounts: stableCounts(scan.records) }, scan.records, scan)
    } else if (f.rel.endsWith('_generated/index-sources.json')) {
      if (isObj(top)) {
        for (const [id, p] of Object.entries(top)) {
          if (typeof p !== 'string') continue
          indexSources[id] = p
          declared.add(id)
          if (!existsSync(join(config.root, p))) indexMissing.push({ id, path: p })
        }
      }
    }
    files.push({
      repo: config.id, lang: config.lang, path: f.repoRel, kind, bytes: f.bytes, sha256: digest,
      contentRecords: kind === 'content' ? scan.contentRecords : 0,
      metaRecords: kind === 'content' ? scan.metaRecords : 0,
      sourceIds: kind === 'content' ? scan.sourceIds : [],
      categories: kind === 'content' ? Object.fromEntries(Object.entries(scan.categories).map(([k, v]) => [k, v.content])) : {},
      editionCounts: kind === 'content' ? stableCounts(scan.records) : {},
    })
  }

  return {
    config, files, fileCount: all.length, jsonCount: files.length, contentFileCount, bytesJson,
    otherByExt: Object.fromEntries(Object.entries(otherByExt).sort(([a], [b]) => a.localeCompare(b))),
    contentRecords, metaRecords, sourceIds, declaredSourceIds: declared, metaSources,
    indexSources, indexMissing, snapshotHash: hash.digest('hex'),
  }
}
