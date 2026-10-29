import type { WorkspaceData } from '../../schemas/campaign'
import { entrySchema, type Entry, type InstalledPack, type StoredEntry } from '../../schemas/pack'
import { mergePatch } from './mergePatch'
import { entryKey, HISTORY_MAX, HOUSE, libraryOf, ORIGINAL, withLibrary, type Variant, type VariantSlot } from './types'

export interface IncomingVariant {
  /** 被修改的库中条目。 */
  target: { packId: string; entryId: string }
  variant: Variant
}

/** 扩展包里带 override 的条目 → 修改版（L1 §2.2）。 */
export function incomingVariants(pack: Pick<InstalledPack, 'id' | 'name' | 'version' | 'lineage'>, entries: StoredEntry[]): IncomingVariant[] {
  const out: IncomingVariant[] = []
  for (const stored of entries) {
    const o = stored.override as { target?: { packId?: string; entryId?: string }; mode?: string; note?: string; baseVersion?: string } | undefined
    if (!o?.target?.packId || !o.target.entryId || !o.mode) continue
    if (o.mode !== 'replace' && o.mode !== 'patch' && o.mode !== 'hide') continue
    const { packId: _p, entryId, override: _o, ruleId: _r, ...rest } = stored
    const payload =
      o.mode === 'replace' ? { ...rest, id: o.target.entryId } : o.mode === 'patch' ? { name: rest.name, summary: rest.summary, data: rest.data } : null
    out.push({
      target: { packId: o.target.packId, entryId: o.target.entryId },
      variant: {
        key: `pack:${pack.lineage ?? pack.id}/${entryId}`,
        source: { type: 'pack', packId: pack.id, lineage: pack.lineage ?? pack.id, version: pack.version },
        sourceName: pack.name,
        mode: o.mode,
        payload,
        note: o.note ?? '',
        ...(o.baseVersion ? { baseVersion: o.baseVersion } : {}),
      },
    })
  }
  return out
}

export interface VariantPlanItem {
  entryKey: string
  variant: Variant
  /** 这个条目当前使用的版本（`original` 或修改版 key）。 */
  current: string
  /** 条目正在用其他修改版，或玩家亲自选过：不自动换。 */
  conflict: boolean
  /** 按设置的默认值是否使用。 */
  defaultUse: boolean
}

/** 加入候选前的预览：默认表见 L1 §3.15。 */
export function planVariants(data: WorkspaceData, incoming: IncomingVariant[], policy: 'apply' | 'skip'): VariantPlanItem[] {
  const slots = libraryOf(data).variants
  return incoming.map(({ target, variant }) => {
    const key = entryKey(target.packId, target.entryId)
    const slot = slots[key]
    const current = slot?.active ?? ORIGINAL
    const sameKeyActive = current === variant.key
    const conflict = !sameKeyActive && (current !== ORIGINAL || !!slot?.manual)
    return { entryKey: key, variant, current, conflict, defaultUse: sameKeyActive || (!conflict && policy === 'apply') }
  })
}

function pushHistory(history: string[], key: string): string[] {
  return [...history.filter((k) => k !== key), key].slice(-HISTORY_MAX)
}

function emptySlot(): VariantSlot {
  return { candidates: [], active: ORIGINAL, manual: false, history: [] }
}

/** 把预览中的修改版加入候选；use[variant.key] 为 true 的改用它。已有同 key 的候选内容直接换新，使用状态不变。 */
export function applyVariantPlan(data: WorkspaceData, plan: VariantPlanItem[], use: Record<string, boolean>): WorkspaceData {
  const variants = { ...libraryOf(data).variants }
  for (const item of plan) {
    const slot = variants[item.entryKey] ?? emptySlot()
    const exists = slot.candidates.some((c) => c.key === item.variant.key)
    const candidates = exists ? slot.candidates.map((c) => (c.key === item.variant.key ? item.variant : c)) : [...slot.candidates, item.variant]
    let next: VariantSlot = { ...slot, candidates }
    if (!exists && use[item.variant.key]) next = { ...next, active: item.variant.key, history: pushHistory(next.history, slot.active) }
    variants[item.entryKey] = next
  }
  return withLibrary(data, { variants })
}

/** 切换使用的版本：玩家亲自选择，旧版本进入 history。 */
export function switchVariant(data: WorkspaceData, entryKeyValue: string, key: string): WorkspaceData {
  const variants = { ...libraryOf(data).variants }
  const slot = variants[entryKeyValue]
  if (!slot || slot.active === key) return data
  if (key !== ORIGINAL && !slot.candidates.some((c) => c.key === key)) return data
  variants[entryKeyValue] = { ...slot, active: key, manual: true, history: pushHistory(slot.history, slot.active) }
  return withLibrary(data, { variants })
}

function fallbackActive(slot: VariantSlot, removed: Set<string>): string {
  const alive = new Set([ORIGINAL, ...slot.candidates.filter((c) => !removed.has(c.key)).map((c) => c.key)])
  for (let i = slot.history.length - 1; i >= 0; i--) if (alive.has(slot.history[i])) return slot.history[i]
  return ORIGINAL
}

export interface Reverted {
  entryKey: string
  from: string
  to: string
}

/** 撤下一个来源的修改版（停用扩展包、新版不再包含时）：正在使用的回到 history 里最近仍存在的版本。 */
export function withdrawFrom(data: WorkspaceData, match: (v: Variant) => boolean, opts: { dropCandidates?: boolean } = {}): { data: WorkspaceData; reverted: Reverted[] } {
  const drop = opts.dropCandidates ?? true
  const variants: Record<string, VariantSlot> = {}
  const reverted: Reverted[] = []
  for (const [key, slot] of Object.entries(libraryOf(data).variants)) {
    const removed = new Set(slot.candidates.filter(match).map((c) => c.key))
    if (!removed.size) {
      variants[key] = slot
      continue
    }
    let active = slot.active
    if (removed.has(active)) {
      active = fallbackActive(slot, removed)
      reverted.push({ entryKey: key, from: slot.active, to: active })
    }
    const candidates = drop ? slot.candidates.filter((c) => !removed.has(c.key)) : slot.candidates
    const history = slot.history.filter((k) => k !== active)
    if (!candidates.length && active === ORIGINAL) continue
    variants[key] = { ...slot, candidates, active, history }
  }
  return { data: withLibrary(data, { variants }), reverted }
}

export const fromPack = (packId: string) => (v: Variant) => v.source.type === 'pack' && v.source.packId === packId

/** 某个来源的修改版全部改用 / 全部不用（修改版管理页）。 */
export function setSourceUse(data: WorkspaceData, match: (v: Variant) => boolean, use: boolean): { data: WorkspaceData; changed: Reverted[] } {
  if (!use) {
    const { data: next, reverted } = withdrawFrom(data, match, { dropCandidates: false })
    return { data: next, changed: reverted }
  }
  let next = data
  const changed: Reverted[] = []
  for (const [key, slot] of Object.entries(libraryOf(data).variants)) {
    const target = slot.candidates.find(match)
    if (target && slot.active !== target.key) {
      changed.push({ entryKey: key, from: slot.active, to: target.key })
      next = switchVariant(next, key, target.key)
    }
  }
  return { data: next, changed }
}

export interface Resolved {
  entry: Entry | null
  active: string
  /** 当前使用「隐藏」版本：搜索与新建列表中不出现，已有引用照常。 */
  hidden: boolean
  /** 另有几个可选版本（含原版时不重复计）。 */
  others: number
  /** 修改版无法套用（原版缺失、结果不合法）：本次使用原版。 */
  broken: boolean
}

/** 取条目当前使用的内容（L1 §3.1、§3.15）。original 为 null 表示原版找不到。 */
export function resolveVariant(original: Entry | null, slot: VariantSlot | undefined): Resolved {
  if (!slot || slot.active === ORIGINAL) return { entry: original, active: ORIGINAL, hidden: false, others: slot?.candidates.length ?? 0, broken: false }
  const variant = slot.candidates.find((c) => c.key === slot.active)
  const others = slot.candidates.length
  if (!variant) return { entry: original, active: ORIGINAL, hidden: false, others, broken: true }
  if (variant.mode === 'hide') return { entry: original, active: variant.key, hidden: !!original, others, broken: !original }
  let candidate: unknown
  if (variant.mode === 'replace') candidate = variant.payload
  else if (original) {
    // patch：data 按 JSON Merge Patch 合并到原版；有 summary 时替换简介，名称保持原版
    const p = variant.payload as { summary?: string; data?: unknown }
    candidate = { ...original, ...(p.summary ? { summary: p.summary } : {}), data: mergePatch(original.data, p.data ?? {}) }
  }
  else return { entry: null, active: ORIGINAL, hidden: false, others, broken: true }
  const parsed = entrySchema.safeParse(candidate)
  if (!parsed.success) return { entry: original, active: ORIGINAL, hidden: false, others, broken: true }
  return { entry: parsed.data, active: variant.key, hidden: false, others, broken: false }
}

export { HOUSE }
