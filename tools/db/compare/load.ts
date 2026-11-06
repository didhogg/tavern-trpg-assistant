import { createHash } from 'node:crypto'
import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { gunzipSync } from 'node:zlib'
import { strFromU8, unzipSync } from 'fflate'
import { OUT_ROOT } from '../lib/paths'
import { REPOS } from '../source/repos'
import type { NewRec, OldEntry } from './types'

const OLD_DIR = process.env.TRPG_OLD_PACKS ?? '/Users/xxx/tavern-trpg-data/packs/dnd5e2014'
export const MANIFEST_DIR = join(OUT_ROOT, 'source-manifest')

export function loadOld(): { packs: number; entries: OldEntry[]; fingerprint: string } {
  const files = readdirSync(OLD_DIR).filter((f) => f.endsWith('.trpgpack')).sort()
  const entries: OldEntry[] = []
  const hash = createHash('sha256')
  for (const file of files) {
    const bytes = new Uint8Array(readFileSync(join(OLD_DIR, file)))
    hash.update(`${file}:${createHash('sha256').update(bytes).digest('hex')}\n`)
    const zip = unzipSync(bytes)
    for (const name of Object.keys(zip).sort()) {
      if (!name.startsWith('entries/') || !name.endsWith('.json')) continue
      const rows = JSON.parse(strFromU8(zip[name]!)) as Array<{ id: string; type: string; name: string; nameEn?: string; data?: Record<string, unknown> }>
      for (const r of rows) {
        const data = r.data ?? {}
        const src = data.src as { book?: string } | undefined
        const credit = data.credit as { by?: string } | undefined
        entries.push({ pack: file, id: r.id, type: r.type, name: r.name, nameEn: r.nameEn ?? '', book: src?.book ?? '', keys: Object.keys(data).sort(), credit: credit?.by ?? '' })
      }
    }
  }
  return { packs: files.length, entries, fingerprint: hash.digest('hex') }
}

interface ManifestFile { repo: string; path: string; kind: string }
interface Manifest {
  recordIndex: { sha256: string }
  sources: Array<{ id: string; kind: string; name?: string; nameEn?: string; edition?: string }>
  files: ManifestFile[]
  repos: Array<{ id: string; kind: string; lang: string; jsonCount: number }>
}

export function loadManifest(): Manifest {
  return JSON.parse(readFileSync(join(MANIFEST_DIR, 'manifest.json'), 'utf8')) as Manifest
}

/** 记录索引：所有源、所有形状（单条、继承、章节、容器…）都读，不做筛选。 */
export function loadRecords(): NewRec[] {
  const text = gunzipSync(readFileSync(join(MANIFEST_DIR, 'records.jsonl.gz'))).toString('utf8')
  const out: NewRec[] = []
  for (const line of text.split('\n')) {
    if (!line) continue
    const r = JSON.parse(line) as { repo: string; category: string; name: string | null; nameEn: string | null; source: string | null; edition: string; shape: string }
    out.push({ repo: r.repo, category: r.category, name: r.name ?? '', nameEn: r.nameEn ?? '', source: r.source ?? '', edition: r.edition, shape: r.shape })
  }
  return out
}

export type NameIndex = Map<string, Map<string, number>>

/**
 * 嵌套名字索引：所有源的每个内容文件、任意深度里，凡是某个字段的字符串值整体等于"旧条目的英文名"（wanted），就登记。
 * 不事先规定哪些字段算名字——登记内容是 "字段名|所属结构类型|顶层或嵌套"，用数据告诉我们名字出现在哪些字段里。
 * 数组里没有字段名的纯文本行（正文段落）不登记。
 */
export function buildNameIndex(manifest: Manifest, wanted: Set<string>): { official: NameIndex; homebrew: NameIndex; files: Map<string, number> } {
  const official: NameIndex = new Map()
  const homebrew: NameIndex = new Map()
  const files = new Map<string, number>()
  const roots = new Map(REPOS.map((r) => [r.id, r]))
  const add = (idx: NameIndex, s: string, label: string): void => {
    const key = s.trim().toLowerCase()
    const m = idx.get(key) ?? new Map<string, number>()
    m.set(label, (m.get(label) ?? 0) + 1)
    idx.set(key, m)
  }
  for (const f of manifest.files) {
    if (f.kind !== 'content') continue
    const repo = roots.get(f.repo)
    if (!repo) continue
    const idx = repo.kind === 'official' ? official : homebrew
    const data = JSON.parse(readFileSync(join(repo.repoRoot, f.path), 'utf8')) as unknown
    files.set(f.repo, (files.get(f.repo) ?? 0) + 1)
    const walk = (v: unknown, depth: number): void => {
      if (Array.isArray(v)) { for (const x of v) walk(x, depth + 1); return }
      if (!v || typeof v !== 'object') return
      const o = v as Record<string, unknown>
      const type = typeof o.type === 'string' ? o.type : '-'
      for (const [k, s] of Object.entries(o)) if (typeof s === 'string' && s && wanted.has(s.trim().toLowerCase())) add(idx, s, `${k}/${type}/${depth <= 2 ? '顶层' : '嵌套'}`)
      for (const x of Object.values(o)) if (x && typeof x === 'object') walk(x, depth + 1)
    }
    walk(data, 0)
  }
  return { official, homebrew, files }
}
