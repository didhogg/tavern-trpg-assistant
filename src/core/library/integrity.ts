import type { TrpgDatabase } from '../db'
import { uuid } from '../ids'
import { instanceSchema, type WorkspaceData } from '../../schemas/campaign'
import { toEntry, pinEntry } from './pins'
import { entryKey, libraryOf, ORIGINAL } from './types'
import { resolveVariant, switchVariant } from './variants'

export type IssueKind = 'pack-missing' | 'pack-unpinned' | 'asset-missing' | 'bad-item' | 'duplicate-id' | 'variant-broken'
export type FixKind = 'install' | 'text-only' | 'pin' | 'pick-image' | 'remove-image' | 'trash' | 'new-id' | 'use-original'

export interface Issue {
  /** 稳定的问题编号：同一个问题每次检查得到同一个值。 */
  id: string
  kind: IssueKind
  /** 出问题的对象名（界面上是可点的下划线名称）。 */
  subject: string
  detail: string
  fixes: FixKind[]
  path: Array<string | number>
  packId?: string
  entryId?: string
  hash?: string
}

type Path = Array<string | number>

/** 遍历当前数据（跳过固定副本、功能定义与修改版内部，它们是冻结的副本）。 */
function walk(value: unknown, path: Path, visit: (obj: Record<string, unknown>, path: Path) => void): void {
  if (Array.isArray(value)) value.forEach((v, i) => walk(v, [...path, i], visit))
  else if (value && typeof value === 'object') {
    const obj = value as Record<string, unknown>
    visit(obj, path)
    for (const [k, v] of Object.entries(obj)) {
      if (path.length === 0 && (k === 'pins' || k === 'features' || k === 'variants' || k === 'featureState' || k === 'trash')) continue
      walk(v, [...path, k], visit)
    }
  }
}

const idOf = (...parts: Array<string | number>): string => parts.join('|')

/** 存档体检（L1 §3.13，M3 范围）：引用、图片、副本结构、id 重复、修改版。 */
export async function checkIntegrity(db: TrpgDatabase, data: WorkspaceData): Promise<Issue[]> {
  const issues: Issue[] = []
  const lib = libraryOf(data)
  const refs: Array<{ obj: Record<string, unknown>; path: Path }> = []
  const assets: Array<{ hash: string; path: Path }> = []
  walk(data, [], (obj, path) => {
    if (obj.$ref === 'pack') refs.push({ obj, path })
    if (typeof obj.$asset === 'string') assets.push({ hash: obj.$asset, path })
  })
  for (const { obj, path } of refs) {
    const packId = String(obj.packId)
    const entryId = String(obj.entryId)
    const name = typeof obj.name === 'string' ? obj.name : entryId
    if (lib.pins[entryKey(packId, entryId)]) continue
    const installed = await db.entries.get([packId, entryId])
    if (installed) issues.push({ id: idOf('pack-unpinned', path.join('.')), kind: 'pack-unpinned', subject: name, detail: `「${name}」还没有固定，库里有，可以固定`, fixes: ['pin'], path, packId, entryId })
    else issues.push({ id: idOf('pack-missing', path.join('.')), kind: 'pack-missing', subject: name, detail: `「${name}」缺失：库里没有它所在的扩展包`, fixes: ['install', 'text-only'], path, packId, entryId })
  }
  for (const { hash, path } of assets) {
    if (await db.blobs.get(hash)) continue
    const owner = path.slice(0, -1).join('.')
    issues.push({ id: idOf('asset-missing', hash, path.join('.')), kind: 'asset-missing', subject: owner || '图片', detail: '图片缺失', fixes: ['pick-image', 'remove-image'], path, hash })
  }
  const seen = new Set<string>()
  data.instances.forEach((raw, index) => {
    const parsed = instanceSchema.safeParse(raw)
    const label = typeof (raw as { name?: unknown })?.name === 'string' ? (raw as { name: string }).name : `第 ${index + 1} 项`
    if (!parsed.success) {
      issues.push({ id: idOf('bad-item', index), kind: 'bad-item', subject: label, detail: `「${label}」的内容不符合数据定义，不参与游戏，保存时原样保留`, fixes: ['trash'], path: ['instances', index] })
      return
    }
    if (seen.has(parsed.data.id)) issues.push({ id: idOf('duplicate-id', index), kind: 'duplicate-id', subject: label, detail: `「${label}」与前面的项编号重复`, fixes: ['new-id'], path: ['instances', index] })
    seen.add(parsed.data.id)
  })
  for (const [key, slot] of Object.entries(lib.variants)) {
    if (slot.active === ORIGINAL) continue
    const original = lib.pins[key]?.entry ?? null
    const slash = key.indexOf('/')
    const stored = original ? null : await db.entries.get([key.slice(0, slash), key.slice(slash + 1)])
    if (!resolveVariant(original ?? (stored ? toEntry(stored) : null), slot).broken) continue
    const name = slot.candidates.find((c) => c.key === slot.active)?.sourceName ?? '修改版'
    issues.push({ id: idOf('variant-broken', key), kind: 'variant-broken', subject: key.slice(slash + 1), detail: `「${name}」的修改无法显示：原版缺失`, fixes: ['install', 'use-original'], path: ['variants', key], packId: key.slice(0, slash), entryId: key.slice(slash + 1) })
  }
  return issues
}

function setAt<T>(root: T, path: Path, update: (current: unknown) => unknown, remove = false): T {
  if (path.length === 0) return update(root) as T
  const [head, ...rest] = path
  const copy: Record<string | number, unknown> | unknown[] = Array.isArray(root) ? [...root] : { ...(root as Record<string, unknown>) }
  const key = head as keyof typeof copy
  if (rest.length === 0 && remove) {
    if (Array.isArray(copy)) copy.splice(Number(head), 1)
    else delete (copy as Record<string, unknown>)[head as string]
  } else (copy as Record<string | number, unknown>)[head] = setAt((copy as Record<string | number, unknown>)[key as string], rest, update, remove)
  return copy as T
}

/** 修复一个问题（调用方先写自动存档）。install / pick-image 需要界面配合，不在这里处理。 */
export async function repairIssue(db: TrpgDatabase, data: WorkspaceData, issue: Issue, fix: FixKind, now: number): Promise<WorkspaceData> {
  switch (fix) {
    case 'pin':
      return (await pinEntry(db, data, issue.packId!, issue.entryId!, now)) ?? data
    case 'text-only':
      return setAt(data, issue.path, (current) => (current as { name?: string }).name ?? issue.subject)
    case 'remove-image':
      return setAt(data, issue.path, () => undefined, true)
    case 'new-id':
      return setAt(data, [...issue.path, 'id'], () => uuid())
    case 'trash': {
      const item = (data.instances as unknown[])[issue.path[1] as number]
      const withoutItem = setAt(data, issue.path, () => undefined, true)
      const trash = [...(((data as Record<string, unknown>).trash as unknown[]) ?? []), { kind: 'instance', item, at: now }]
      return { ...withoutItem, trash }
    }
    case 'use-original':
      return switchVariant(data, issue.path[1] as string, ORIGINAL)
    default:
      return data
  }
}
