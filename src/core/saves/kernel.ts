// P3-3b：在 M1 存档上增加结算内核段。人物只存引用/选择/状态差别；战斗在战役层只存一份；
// 变更计划先预览，确认后按修订号写入，可撤销；读档检查缺什么，不删数据。
import type { TrpgDatabase } from '../db'
import { TrpgError } from '../errors'
import type { CampaignService } from './campaign'
import type { RuleRegistry } from '../../rules/registry'
import type { SaveSlot, Workspace } from '../../schemas/campaign'
import {
  kernelCombatSchema, kernelCampaignSchema, kernelLibrarySchema,
  type KernelActor, type KernelCampaign, type KernelChange, type KernelDataVersion, type KernelLibrary, type KernelOverride,
} from '../../schemas/kernel'
import {
  actorIdOf, applyActorChanges, applyCombatChange, isCombatChange, type KernelRefMapper,
} from './split'
import { clone, isObject } from './state'

/** 引用检查结果：和 P3-1 的 FetchResult 形状一致，但 core 不依赖 library 运行时。 */
export interface KernelRefResult {
  ok: boolean
  ref: { set: string; prop: string; hash: string }
  reason?: string
}

export type KernelRefChecker = (refs: Array<{ set: string; prop: string; hash: string }>, library: KernelLibrary) => Promise<KernelRefResult[]>

/** 只交回人物段，不碰 adjustments/dice/legacy。 */
export type KernelActorCompact = Pick<KernelActor, 'id' | 'name' | 'refs' | 'choices' | 'state'>

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
  /** 作者编号 → 本战役【库】条目；不给出就用 unknown 占位（读档时会报缺）。 */
  mapRef?: KernelRefMapper
  /** 把当前小窗里的完整人物重新拆成引用/选择/状态差别；给了就用它，没给就按改动叠。 */
  compactActors?: (ids: string[]) => Promise<KernelActorCompact[]>
  /** 撤销上限由设置决定；不给出时用默认值。 */
  undoLimit?: () => number | Promise<number>
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

const DEFAULT_UNDO_LIMIT = 50

export class KernelSaveService {
  constructor(private readonly deps: KernelSaveDeps) {}

  private refMapper(): KernelRefMapper {
    return this.deps.mapRef ?? ((flags) => flags.propDroppable && flags.source && flags.hash
      ? { kind: flags.propDroppable, set: 'unknown', prop: flags.propDroppable, hash: flags.hash, label: flags.label }
      : null)
  }

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

  private unboundCheck(): KernelCheck {
    return { bound: false, rule: null, ruleMissing: false, missing: [], checked: 0, dataVersion: null, dataVersionChanged: false,
      dataVersionChanges: { official: null, brews: [] }, overridesChanged: false, overrideChanges: [] }
  }

  /** 读当前战役的前检查：规则装没装、引用还在不在、版本/覆盖哪里变了；只报告，不改存档。 */
  async check(ownerKey: string): Promise<KernelCheck> {
    const ws = await this.workspace(ownerKey)
    const kernel = this.parse(ws.data.kernel)
    if (!kernel) return this.unboundCheck()
    const library = kernelLibrarySchema.parse(ws.data.library ?? kernel.library)
    return this.checkKernel(kernel, library)
  }

  /** 读档前检查存档槽：只看要读的那份存档，不动当前战役。 */
  async checkSave(saveId: string): Promise<KernelCheck> {
    const save = await this.deps.campaign.getSave(saveId)
    if (!save || save.deletedAt !== undefined) throw new TrpgError('E_NOT_FOUND', '没有找到这个存档')
    const snapshot = save.snapshot as Record<string, unknown>
    const kernel = this.parse(snapshot.kernel)
    if (!kernel) return this.unboundCheck()
    const library = kernelLibrarySchema.parse(snapshot.library ?? kernel.library)
    return this.checkKernel(kernel, library)
  }

  private async checkKernel(kernel: KernelCampaign, library: KernelLibrary): Promise<KernelCheck> {
    const ruleMissing = !this.deps.rules.get(kernel.rule)
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

  /** 保存：事务外现取版本记号与覆盖，再走 M1 的短事务保存；版本没变时不会凭空产生“已保存”。 */
  async save(ownerKey: string): Promise<{ changed: boolean; workspace: Workspace }> {
    const kernel = await this.read(ownerKey)
    if (kernel) {
      const dataVersion = this.deps.currentVersion ? await this.deps.currentVersion() : kernel.dataVersion
      const overrides = this.deps.currentOverrides ? await this.deps.currentOverrides() : kernel.overrides
      if (JSON.stringify(dataVersion) !== JSON.stringify(kernel.dataVersion) || JSON.stringify(overrides) !== JSON.stringify(kernel.overrides)) {
        const next: KernelCampaign = { ...kernel, dataVersion, overrides }
        await this.deps.campaign.updateData(ownerKey, (data) => ({ ...data, kernel: next }))
      }
    }
    return this.deps.campaign.saveCurrent(ownerKey)
  }

  /** 预览变更计划：每行交回改前/改后的精简段；不写任何数据。 */
  async preview(ownerKey: string, changes: KernelChange[]): Promise<{ revision: number; rows: KernelPreviewRow[] }> {
    const kernel = await this.read(ownerKey)
    if (!kernel) throw new TrpgError('E_NO_KERNEL', '这个战役还没有绑定结算内核')
    const mapper = this.refMapper()
    const rows = changes.map((change) => {
      const actorId = actorIdOf(change)
      const actor = kernel.actors.find((item) => item.id === actorId) ?? null
      const before = isCombatChange(change) ? clone(kernel.combat) : actor ? clone(actor.state) : null
      const after = isCombatChange(change)
        ? applyCombatChange(kernel.combat, change)
        : actor ? applyActorChanges(actor, [change], mapper).state : null
      return { actorId, actorName: actor?.name ?? null, change, before, after }
    })
    return { revision: kernel.revision, rows }
  }

  /** 确认写入：先在事务外取当前人物的精简段，再短事务比对修订号、写、记撤销。 */
  async apply(ownerKey: string, changes: KernelChange[], expectedRevision: number): Promise<{ workspace: Workspace; kernel: KernelCampaign }> {
    const kernelBefore = await this.read(ownerKey)
    if (!kernelBefore) throw new TrpgError('E_NO_KERNEL', '这个战役还没有绑定结算内核')
    const ids = [...new Set(changes.map(actorIdOf).filter((id): id is string => !!id))]
    const compact = this.deps.compactActors && ids.length ? await this.deps.compactActors(ids) : []
    const compactById = new Map(compact.map((actor) => [actor.id, actor]))
    const limit = this.deps.undoLimit ? await this.deps.undoLimit() : DEFAULT_UNDO_LIMIT
    return this.deps.db.transaction('rw', this.deps.db.workspaces, async () => {
      const ws = await this.deps.db.workspaces.get(ownerKey)
      if (!ws) throw new TrpgError('E_NO_WORKSPACE', '还没有当前战役')
      const kernel = this.parse(ws.data.kernel)
      if (!kernel) throw new TrpgError('E_NO_KERNEL', '这个战役还没有绑定结算内核')
      if (kernel.revision !== expectedRevision) throw new TrpgError('E_REVISION_CONFLICT', '存档已被其他窗口修改，请重新预览')
      const before: Record<string, unknown> = {}
      const nextActors = kernel.actors.map((actor) => clone(actor))
      let combat = clone(kernel.combat)
      let combatTouched = false
      for (const change of changes) {
        if (isCombatChange(change)) { combat = applyCombatChange(combat, change); combatTouched = true; continue }
        const actorId = actorIdOf(change)
        if (!actorId) continue
        const index = nextActors.findIndex((actor) => actor.id === actorId)
        if (index < 0) continue
        if (!(actorId in before)) before[actorId] = clone(nextActors[index])
        const nextCompact = compactById.get(actorId)
        if (nextCompact) {
          const old = nextActors[index]
          nextActors[index] = {
            ...old, ...clone(nextCompact),
            adjustments: old.adjustments, dice: old.dice, legacy: old.legacy, legacyState: old.legacyState,
          }
        } else {
          nextActors[index] = applyActorChanges(nextActors[index], [change], this.refMapper())
        }
      }
      const next: KernelCampaign = {
        ...kernel,
        actors: nextActors,
        combat,
        revision: kernel.revision + 1,
        undo: [...kernel.undo, {
          at: this.deps.now(), revision: kernel.revision, actorIds: Object.keys(before), before,
          ...(combatTouched ? { combatBefore: clone(kernel.combat) as unknown as Record<string, unknown> } : {}),
        }].slice(-limit),
      }
      const workspace: Workspace = { ...ws, data: { ...ws.data, kernel: next }, updatedAt: this.deps.now() }
      await this.deps.db.workspaces.put(workspace)
      return { workspace, kernel: next }
    })
  }

  /** 撤销最近一次写入：同样比对修订号，恢复受影响人物与战役战斗。 */
  async undo(ownerKey: string, expectedRevision: number): Promise<{ workspace: Workspace; kernel: KernelCampaign } | null> {
    return this.deps.db.transaction('rw', this.deps.db.workspaces, async () => {
      const ws = await this.deps.db.workspaces.get(ownerKey)
      if (!ws) throw new TrpgError('E_NO_WORKSPACE', '还没有当前战役')
      const kernel = this.parse(ws.data.kernel)
      if (!kernel) throw new TrpgError('E_NO_KERNEL', '这个战役还没有绑定结算内核')
      if (kernel.revision !== expectedRevision) throw new TrpgError('E_REVISION_CONFLICT', '存档已被其他窗口修改，请重新读取')
      const last = kernel.undo.at(-1)
      if (!last) return null
      const nextActors = kernel.actors.map((actor) => {
        if (!last.actorIds.includes(actor.id)) return clone(actor)
        const saved = last.before[actor.id]
        if (isObject(saved) && 'refs' in saved && 'state' in saved) return clone(saved) as unknown as KernelActor
        return { ...clone(actor), state: (saved as KernelActor['state']) ?? actor.state }
      })
      const combat = last.combatBefore ? kernelCombatSchema.parse(last.combatBefore) : kernel.combat
      const next: KernelCampaign = { ...kernel, actors: nextActors, combat, revision: kernel.revision + 1, undo: kernel.undo.slice(0, -1) }
      const workspace: Workspace = { ...ws, data: { ...ws.data, kernel: next }, updatedAt: this.deps.now() }
      await this.deps.db.workspaces.put(workspace)
      return { workspace, kernel: next }
    })
  }
}
