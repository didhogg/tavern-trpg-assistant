import { TrpgError } from '../errors'
import type { Entry, PackManifest } from '../../schemas/pack'

interface RefObject {
  $ref?: unknown
  $asset?: unknown
  packId?: unknown
  entryId?: unknown
  id?: unknown
  lineage?: unknown
}

export function collectAssetHashes(value: unknown, out: Set<string> = new Set()): Set<string> {
  if (Array.isArray(value)) {
    for (const item of value) collectAssetHashes(item, out)
  } else if (value && typeof value === 'object') {
    const obj = value as RefObject
    if (typeof obj.$asset === 'string') out.add(obj.$asset)
    for (const item of Object.values(obj)) collectAssetHashes(item, out)
  }
  return out
}

function refsIn(value: unknown, out: RefObject[] = []): RefObject[] {
  if (Array.isArray(value)) {
    for (const item of value) refsIn(item, out)
  } else if (value && typeof value === 'object') {
    const obj = value as RefObject
    if (typeof obj.$ref === 'string') out.push(obj)
    for (const item of Object.values(obj)) refsIn(item, out)
  }
  return out
}

function bad(detail: string): TrpgError {
  return new TrpgError('E_BAD_CONTENT', `文件内容损坏：${detail}`)
}

export interface RefCheckInput {
  manifest: PackManifest
  entries: Entry[]
  adventure: Record<string, unknown>
  fallback: unknown[]
  blobHashes: Set<string>
}

/** 检查包内引用、图片引用、修改版的依赖声明（L1 §2.2 识别与限制）。 */
export function assertPackRefs(input: RefCheckInput): { softRefs: number } {
  const { manifest, entries, adventure, fallback, blobHashes } = input
  const localIds = new Set(entries.map((e) => e.id))
  const adventureItems: Array<{ id?: unknown; data?: { origin?: { lineage?: unknown; itemId?: unknown } } }> = []
  for (const value of Object.values(adventure)) {
    if (Array.isArray(value)) for (const item of value) if (item && typeof item === 'object') adventureItems.push(item as never)
  }
  for (const item of adventureItems) if (typeof item.id === 'string') localIds.add(item.id)
  const fallbackIds = new Set<string>()
  const fallbackLineage = new Set<string>()
  for (const item of fallback) {
    if (!item || typeof item !== 'object') continue
    const rec = item as { id?: unknown; data?: { origin?: { lineage?: unknown; itemId?: unknown } } }
    if (typeof rec.id === 'string') fallbackIds.add(rec.id)
    if (typeof rec.data?.origin?.lineage === 'string' && typeof rec.data.origin.itemId === 'string') fallbackLineage.add(`${rec.data.origin.lineage}\u0000${rec.data.origin.itemId}`)
  }
  const required = new Set(manifest.relationships.requires.map((r) => r.id))
  let softRefs = 0

  const seenTargets = new Set<string>()
  for (const entry of entries) {
    const override = (entry as { override?: { target?: { packId?: unknown; entryId?: unknown } } }).override
    if (override) {
      const target = override.target
      if (!target || typeof target.packId !== 'string' || typeof target.entryId !== 'string') throw bad(`「${entry.name}」的修改目标不合法`)
      if (!required.has(target.packId)) throw bad(`「${entry.name}」修改的条目所在的包未声明为依赖`)
      const key = `${target.packId}\u0000${target.entryId}`
      if (seenTargets.has(key)) throw bad(`「${entry.name}」修改的条目被修改了两次`)
      seenTargets.add(key)
    }
  }

  const values: unknown[] = [entries.map((e) => e.data), adventure, fallback]
  for (const ref of refsIn(values)) {
    const kind = ref.$ref
    if (kind === 'item' || kind === 'local') {
      if (typeof ref.id !== 'string' || !localIds.has(ref.id)) throw bad(`「${String(ref.id ?? '')}」引用了不存在的内容`)
    } else if (kind === 'ext') {
      const id = typeof ref.id === 'string' ? ref.id : ''
      const lineage = typeof ref.lineage === 'string' ? ref.lineage : ''
      if (!fallbackIds.has(id) && !fallbackLineage.has(`${lineage}\u0000${id}`)) throw bad(`「${id}」引用了不存在的内容`)
    } else if (kind === 'pack') {
      if (typeof ref.packId !== 'string' || !(ref.packId === manifest.id || required.has(ref.packId))) throw bad(`「${String(ref.entryId ?? '')}」引用了不存在的包`)
    } else throw bad(`未知的引用类型「${String(kind)}」`)
    softRefs++
  }
  for (const hash of collectAssetHashes(values)) {
    if (!blobHashes.has(hash)) throw bad(`缺少图片「${hash.slice(0, 12)}」`)
  }
  return { softRefs }
}
