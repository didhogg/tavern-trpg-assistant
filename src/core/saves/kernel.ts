// P3-3：在 M1 存档上增加结算内核段。只存引用、选择、状态与版本；读档检查缺什么，不删数据；
// 变更计划先预览，确认后按修订号写入，可撤销。
import type { TrpgDatabase } from '../db'
import { TrpgError } from '../errors'
import type { CampaignService } from './campaign'
import type { RuleRegistry } from '../../rules/registry'
import type { SaveSlot, Workspace } from '../../schemas/campaign'
import {
  kernelActorSchema, kernelCampaignSchema, kernelLibrarySchema,
  type KernelActor, type KernelCampaign, type KernelChange, type KernelDataVersion, type KernelLibrary, type KernelOverride,
} from '../../schemas/kernel'

/** 引用检查结果：和 P3-1 的 FetchResult 形状一致，但 core 不依赖 library 运行时。 */
export interface KernelRefResult {
  ok: boolean
  ref: { set: string; prop: string; hash: string }
  reason?: string
}

export type KernelRefChecker = (refs: Array<{ set: string; prop: string; hash: string }>, library: KernelLibrary) => Promise<KernelRefResult[]>

export interface KernelSaveDeps {
  db: TrpgDatabase
  campaign: CampaignService
  rules: RuleRegistry
  now: () => number
  checkRefs: KernelRefChecker
  /** 当前装的数据版本；给了就报告版本是否变了。可异步读【库】。 */
  currentVersion?: () => KernelDataVersion | Promise<KernelDataVersion>
  /** 当前实际生效的房规覆盖；给了就报告覆盖是否变了。 */
  currentOverrides?: () => Promise<KernelOverride[]>
}

export interface KernelMissing {
  actorId: string
  actorName: string
  ref: { set: string; prop: string; hash: string; label?: string }
  reason: string
}

export interface KernelCheck {
  bound: boolean
  rule: string | null
  ruleMissing: boolean
  missing: KernelMissing[]
  checked: number
  dataVersion: KernelDataVersion | null
  dataVersionChanged: boolean
  dataVersionChanges: {
    official: { before: string; after: string } | null
    brews: Array<{ id: string; before: string | null; after: string | null; change: 'added' | 'removed' | 'changed' }>
  }
  overridesChanged: boolean
  overrideChanges: Array<{
    target: KernelOverride['target']
    change: 'added' | 'removed' | 'changed'
    before: string | null
    after: string | null
  }>
}

export interface KernelPreviewRow {
  actorId: string | null
  actorName: string | null
  change: KernelChange
  before: unknown
  after: unknown
}

const UNDO_LIMIT = 50

const isObject = (value: unknown): value is Record<string, unknown> => !!value && typeof value === 'object' && !Array.isArray(value)

function clone<T>(value: T): T {
  return structuredClone(value)
}

function merge(base: unknown, patch: unknown): unknown {
  if (!isObject(patch)) return clone(patch)
  const out: Record<string, unknown> = isObject(base) ? { ...base } : {}
  for (const [key, value] of Object.entries(patch)) out[key] = isObject(value) && isObject(out[key]) ? merge(out[key], value) : clone(value)
  return out
}

function actorIdOf(change: KernelChange): string | null {
  if (change.parentUuid?.startsWith('Actor.')) return change.parentUuid.slice('Actor.'.length)
  if (change.type === 'Actor' && isObject(change.data)) {
    const id = change.data._id
    return typeof id === 'string' ? id : null
  }
  return null
}

function applyToCollection(list: unknown[], change: KernelChange): unknown[] {
  const data = change.data
  const id = isObject(data) && typeof data._id === 'string' ? data._id : null
  if (change.action === 'delete') {
    const ids = Array.isArray(data) ? data.filter((item): item is string => typeof item === 'string')
      : id ? [id] : []
    return list.filter((item) => !isObject(item) || !ids.includes(String(item._id)))
  }
  if (change.action === 'create') return [...list, clone(data)]
  if (!id) return list
  const index = list.findIndex((item) => isObject(item) && item._id === id)
  if (index < 0) return [...list, clone(data)]
  const next = [...list]
  next[index] = merge(next[index], data)
  return next
}

/** 把一条内核变更计划应用到一个人的状态上；返回新状态，不改原对象。 */
export function applyKernelChange(state: Record<string, unknown>, change: KernelChange): Record<string, unknown> {
  const next = clone(state)
  if (change.type === 'Actor') {
    if (change.action === 'delete') next.actor = null
    else next.actor = merge(next.actor, change.data)
    return next
  }
  if (change.type === 'Item') {
    next.items = applyToCollection(Array.isArray(next.items) ? next.items : [], change)
    return next
  }
  if (change.type === 'ActiveEffect') {
    next.effects = applyToCollection(Array.isArray(next.effects) ? next.effects : [], change)
    return next
  }
  if (change.type === 'Combat') {
    next.combat = change.action === 'delete' ? null : merge(next.combat, change.data)
    return next
  }
  next.other = applyToCollection(Array.isArray(next.other) ? next.other : [], change)
  return next
}

export class KernelSaveService {
  constructor(private readonly deps: KernelSaveDeps) {}

  private async workspace(ownerKey: string): Promise<Workspace> {
    const ws = await this.deps.campaign.getWorkspace(ownerKey)
    if (!ws) throw new TrpgError('E_NO_WORKSPACE', '还没有当前战役')
    return ws
  }

  private parse(raw: unknown): KernelCampaign | null {
    if (!raw) return null
    try {
      return kernelCampaignSchema.parse(raw)
    } catch {
      throw new TrpgError('E_BAD_KERNEL', '存档里的结算内核段损坏')
    }
  }

  async read(ownerKey: string): Promise<KernelCampaign | null> {
    const ws = await this.workspace(ownerKey)
    return this.parse(ws.data.kernel)
  }

  /** 绑定战役规则与结算内核；规则必须和当前战役一致。 */
  async bind(ownerKey: string, campaign: KernelCampaign): Promise<KernelCampaign> {
    const ws = await this.workspace(ownerKey)
    const parsed = this.parse(campaign) ?? kernelCampaignSchema.parse(campaign)
    if (parsed.rule !== ws.ruleId) throw new TrpgError('E_RULE_MISMATCH', `结算内核规则 ${parsed.rule} 与战役规则 ${ws.ruleId} 不一致`)
    await this.deps.campaign.updateData(ownerKey, (data) => ({ ...data, kernel: parsed, library: parsed.library }))
    return parsed
  }

  /** 改本战役的选书设置（关书/开书）；人物引用和状态不动。 */
  async setLibrary(ownerKey: string, library: KernelLibrary): Promise<KernelCampaign> {
    const current = await this.read(ownerKey)
    if (!current) throw new TrpgError('E_NO_KERNEL', '这个战役还没有绑定结算内核')
    const next = { ...current, library: kernelLibrarySchema.parse(library) }
    await this.deps.campaign.updateData(ownerKey, (data) => ({ ...data, library: next.library, kernel: next }))
    return next
  }

  /** 读档前检查：规则装没装、引用还在不在、版本/覆盖哪里变了；结果只报告，不改存档。 */
  async check(ownerKey: string): Promise<KernelCheck> {
    const ws = await this.workspace(ownerKey)
    const kernel = this.parse(ws.data.kernel)
    if (!kernel) {
      return { bound: false, rule: null, ruleMissing: false, missing: [], checked: 0, dataVersion: null, dataVersionChanged: false,
        dataVersionChanges: { official: null, brews: [] }, overridesChanged: false, overrideChanges: [] }
    }
    const ruleMissing = !this.deps.rules.get(kernel.rule)
    const library = kernelLibrarySchema.parse(ws.data.library ?? kernel.library)
    const rows: Array<{ actorId: string; actorName: string; ref: KernelActor['refs'][number] }> = []
    for (const actor of kernel.actors) for (const ref of actor.refs) rows.push({ actorId: actor.id, actorName: actor.name, ref })
    const results = rows.length ? await this.deps.checkRefs(rows.map((r) => r.ref), library) : []
    const missing: KernelMissing[] = []
    results.forEach((result, index) => {
      if (result.ok) return
      const row = rows[index]
      missing.push({ ...row, ref: { ...row.ref, label: row.ref.label }, reason: result.reason ?? 'missing' })
    })

    const current = this.deps.currentVersion ? await this.deps.currentVersion() : undefined
    const dataVersionChanges = {
      official: current && current.official !== kernel.dataVersion.official
        ? { before: kernel.dataVersion.official, after: current.official } : null,
      brews: [] as KernelCheck['dataVersionChanges']['brews'],
    }
    if (current) {
      const ids = new Set([...Object.keys(kernel.dataVersion.brews), ...Object.keys(current.brews)])
      for (const id of [...ids].sort()) {
        const before = kernel.dataVersion.brews[id] ?? null
        const after = current.brews[id] ?? null
        if (before === after) continue
        dataVersionChanges.brews.push({ id, before, after, change: before === null ? 'added' : after === null ? 'removed' : 'changed' })
      }
    }

    const currentOverrides = this.deps.currentOverrides ? await this.deps.currentOverrides() : undefined
    const overrideChanges: KernelCheck['overrideChanges'] = []
    if (currentOverrides) {
      const key = (ref: KernelOverride['target']): string => `${ref.set}|${ref.prop}|${ref.hash}`
      const before = new Map(kernel.overrides.map((item) => [key(item.target), item]))
      const after = new Map(currentOverrides.map((item) => [key(item.target), item]))
      for (const target of new Set([...before.keys(), ...after.keys()])) {
        const old = before.get(target)
        const next = after.get(target)
        if (!old && next) overrideChanges.push({ target: next.target, change: 'added', before: null, after: next.digest })
        else if (old && !next) overrideChanges.push({ target: old.target, change: 'removed', before: old.digest, after: null })
        else if (old && next && (old.digest !== next.digest || key(old.house) !== key(next.house))) {
          overrideChanges.push({ target: next.target, change: 'changed', before: old.digest, after: next.digest })
        }
      }
    }

    return {
      bound: true, rule: kernel.rule, ruleMissing, missing, checked: rows.length,
      dataVersion: kernel.dataVersion,
      dataVersionChanged: !!current && (dataVersionChanges.official !== null || dataVersionChanges.brews.length > 0),
      dataVersionChanges,
      overridesChanged: overrideChanges.length > 0,
      overrideChanges,
    }
  }

  /** 恢复原样：保留存档里记录的版本与覆盖，只交回现状，不写数据。 */
  async keepSaved(ownerKey: string): Promise<KernelCampaign> {
    const kernel = await this.read(ownerKey)
    if (!kernel) throw new TrpgError('E_NO_KERNEL', '这个战役还没有绑定结算内核')
    return kernel
  }

  /** 采用现在的：把当前数据版本/覆盖写进战役，再走 M1 branch 存成新分支；旧存档不变。 */
  async adoptCurrent(ownerKey: string, current: { dataVersion?: KernelDataVersion; overrides?: KernelOverride[] } = {}): Promise<{ kernel: KernelCampaign; save: SaveSlot }> {
    const kernel = await this.read(ownerKey)
    if (!kernel) throw new TrpgError('E_NO_KERNEL', '这个战役还没有绑定结算内核')
    const dataVersion = current.dataVersion ?? (this.deps.currentVersion ? await this.deps.currentVersion() : kernel.dataVersion)
    const overrides = current.overrides ?? (this.deps.currentOverrides ? await this.deps.currentOverrides() : kernel.overrides)
    const next: KernelCampaign = { ...kernel, dataVersion, overrides, revision: kernel.revision + 1 }
    await this.deps.campaign.updateData(ownerKey, (data) => ({ ...data, kernel: next }))
    const { save } = await this.deps.campaign.branch(ownerKey, '采用现在的')
    return { kernel: next, save }
  }

  /** 预览变更计划：每行交回改前/改后的状态；不写任何数据。 */
  async preview(ownerKey: string, changes: KernelChange[]): Promise<{ revision: number; rows: KernelPreviewRow[] }> {
    const kernel = await this.read(ownerKey)
    if (!kernel) throw new TrpgError('E_NO_KERNEL', '这个战役还没有绑定结算内核')
    const rows = changes.map((change) => {
      const actorId = actorIdOf(change)
      const actor = kernel.actors.find((item) => item.id === actorId) ?? null
      const before = actor ? clone(actor.state) : null
      const after = actor ? applyKernelChange(actor.state, change) : null
      return { actorId, actorName: actor?.name ?? null, change, before, after }
    })
    return { revision: kernel.revision, rows }
  }

  /** 确认写入：先比对修订号；写成功后修订号 +1，并记一条撤销记录。 */
  async apply(ownerKey: string, changes: KernelChange[], expectedRevision: number): Promise<{ workspace: Workspace; kernel: KernelCampaign }> {
    return this.deps.db.transaction('rw', this.deps.db.workspaces, async () => {
      const ws = await this.deps.db.workspaces.get(ownerKey)
      if (!ws) throw new TrpgError('E_NO_WORKSPACE', '还没有当前战役')
      const kernel = this.parse(ws.data.kernel)
      if (!kernel) throw new TrpgError('E_NO_KERNEL', '这个战役还没有绑定结算内核')
      if (kernel.revision !== expectedRevision) throw new TrpgError('E_REVISION_CONFLICT', '存档已被其他窗口修改，请重新预览')
      const affected = new Set<string>()
      const before: Record<string, unknown> = {}
      const nextActors = kernel.actors.map((actor) => ({ ...actor, state: clone(actor.state) }))
      for (const change of changes) {
        const actorId = actorIdOf(change)
        if (!actorId) continue
        const actor = nextActors.find((item) => item.id === actorId)
        if (!actor) continue
        if (!affected.has(actorId)) {
          affected.add(actorId)
          before[actorId] = clone(actor.state)
        }
        actor.state = applyKernelChange(actor.state, change)
      }
      const next: KernelCampaign = {
        ...kernel,
        actors: nextActors,
        revision: kernel.revision + 1,
        undo: [...kernel.undo, { at: this.deps.now(), revision: kernel.revision, actorIds: [...affected], before }].slice(-UNDO_LIMIT),
      }
      const workspace: Workspace = { ...ws, data: { ...ws.data, kernel: next }, updatedAt: this.deps.now() }
      await this.deps.db.workspaces.put(workspace)
      return { workspace, kernel: next }
    })
  }

  /** 撤销最近一次写入：同样比对修订号，反向恢复受影响人物的状态。 */
  async undo(ownerKey: string, expectedRevision: number): Promise<{ workspace: Workspace; kernel: KernelCampaign } | null> {
    return this.deps.db.transaction('rw', this.deps.db.workspaces, async () => {
      const ws = await this.deps.db.workspaces.get(ownerKey)
      if (!ws) throw new TrpgError('E_NO_WORKSPACE', '还没有当前战役')
      const kernel = this.parse(ws.data.kernel)
      if (!kernel) throw new TrpgError('E_NO_KERNEL', '这个战役还没有绑定结算内核')
      if (kernel.revision !== expectedRevision) throw new TrpgError('E_REVISION_CONFLICT', '存档已被其他窗口修改，请重新读取')
      const last = kernel.undo.at(-1)
      if (!last) return null
      const nextActors = kernel.actors.map((actor) => last.actorIds.includes(actor.id)
        ? { ...actor, state: clone((last.before[actor.id] ?? actor.state) as Record<string, unknown>) }
        : { ...actor, state: clone(actor.state) })
      const next: KernelCampaign = { ...kernel, actors: nextActors, revision: kernel.revision + 1, undo: kernel.undo.slice(0, -1) }
      const workspace: Workspace = { ...ws, data: { ...ws.data, kernel: next }, updatedAt: this.deps.now() }
      await this.deps.db.workspaces.put(workspace)
      return { workspace, kernel: next }
    })
  }
}

export { kernelActorSchema }
