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
import { chooseSource } from '../../library/scopes'

/** 引用检查结果：和 P3-1 的 FetchResult 形状一致，但 core 不依赖 library 运行时。 */
export interface KernelRefResult {
  ok: boolean
  ref: { set: string; prop: string; hash: string }
  reason?: string
  /** 条目在，但本战役关着这本书（照常能取，P5 B-34）。 */
  closed?: boolean
  /** 条目所在的来源（书 / 包的来源标识）。 */
  source?: string | null
}

export type KernelRefChecker = (refs: Array<{ set: string; prop: string; hash: string }>, library: KernelLibrary) => Promise<KernelRefResult[]>

/** 只交回人物段，不碰 adjustments/dice/legacy。 */
export type KernelActorCompact = Pick<KernelActor, 'id' | 'name' | 'seed' | 'refs' | 'choices' | 'state'>

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
  /** 作者编号 → 本战役【库】条目（按战役的选书）；不给出时遇到要对照的改动直接报错。 */
  mapRef?: (ownerKey: string) => KernelRefMapper | Promise<KernelRefMapper>
  /** 把本战役结算小窗里的完整人物重新拆成引用/选择/状态差别；给了就用它，没给就按改动叠。 */
  compactActors?: (ownerKey: string, ids: string[]) => Promise<KernelActorCompact[]>
  /** 撤销上限由设置决定；不给出时用默认值。 */
  undoLimit?: () => number | Promise<number>
}

export interface KernelMissing {
  actorId: string
  actorName: string
  ref: { set: string; prop: string; hash: string; label?: string }
  reason: string
}

/** 读档检查给界面的三张清单（P5 B-34）。 */
export interface KernelLoadPlan {
  /** 数据集没装 → 建议下载（默认勾选）。set = 源登记表编号，official 用 tasks.startOfficial；自制数据集没装时没有可下的来源，界面只提示。 */
  download: Array<{ set: string; kind: 'official' | 'brew'; refs: number; labels: string[] }>
  /** 数据集装着、但条目已经没有了（上游删了 / 改了编号）：下载补不回来，只提示。 */
  gone: Array<{ set: string; prop: string; hash: string; label?: string }>
  /** 书 / 包在，但本战役关着（默认不勾；勾了 = 本战役开启它，用 openSources）。 */
  closed: Array<{ set: string; source: string; refs: number; labels: string[] }>
  /** 资料版本或房规 / 修改版跟存档保存时不一样：一行提示，不改存档，详情默认显示新版。 */
  versionChanged: boolean
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
  plan: KernelLoadPlan
}

export interface KernelPreviewRow {
  actorId: string | null
  actorName: string | null
  change: KernelChange
  before: unknown
  after: unknown
}

const DEFAULT_UNDO_LIMIT = 50
const libraryKey = (rootId: string): string => `campaignLibrary:${rootId}`

export class KernelSaveService {
  constructor(private readonly deps: KernelSaveDeps) {}

  private async refMapper(ownerKey: string): Promise<KernelRefMapper> {
    if (!this.deps.mapRef) {
      return () => { throw new TrpgError('E_NO_REF_MAPPER', '没有提供作者编号到【库】条目的对照') }
    }
    return this.deps.mapRef(ownerKey)
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
    const rootId = ws.currentSaveId ? await this.deps.campaign.campaignRootOf(ws.currentSaveId) : null
    if (rootId) await this.deps.db.setMeta(libraryKey(rootId), parsed.library)
    return parsed
  }

  /**
   * 本战役的选书设置（B-20）：战役级，同一棵存档树的所有存档、分支共用，读档、回档都不碰它。
   * 存在 meta 表（`campaignLibrary:<树根存档编号>`）；第一次读不到时用工作副本里的那份当初值。
   * 存档快照里的 library 只是保存时同步的一份副本（导出、换设备导入时当初值），读档时不读回。
   */
  async libraryOf(ownerKey: string): Promise<KernelLibrary> {
    const ws = await this.workspace(ownerKey)
    const kernel = this.parse(ws.data.kernel)
    if (!kernel) throw new TrpgError('E_NO_KERNEL', '这个战役还没有绑定结算内核')
    const rootId = ws.currentSaveId ? await this.deps.campaign.campaignRootOf(ws.currentSaveId) : null
    return this.libraryAt(rootId, ws.data.library ?? kernel.library)
  }

  /** 某个存档所在战役的选书设置（读档检查用）；不在树里的存档（自动存档）用它自己快照里的副本。 */
  async libraryOfSave(save: SaveSlot): Promise<KernelLibrary> {
    const snapshot = save.snapshot as Record<string, unknown>
    const kernel = this.parse(snapshot.kernel)
    if (!kernel) throw new TrpgError('E_NO_KERNEL', '这个存档没有绑定结算内核')
    return this.libraryAt(await this.deps.campaign.campaignRootOf(save.id), snapshot.library ?? kernel.library)
  }

  private async libraryAt(rootId: string | null, fallback: unknown): Promise<KernelLibrary> {
    if (!rootId) return kernelLibrarySchema.parse(fallback)
    const stored = await this.deps.db.getMeta<unknown>(libraryKey(rootId))
    if (stored) return kernelLibrarySchema.parse(stored)
    const seed = kernelLibrarySchema.parse(fallback)
    await this.deps.db.setMeta(libraryKey(rootId), seed)
    return seed
  }

  /** 改本战役的选书设置（关书/开书）：只写战役级的那一份，不动存档快照、不让工作副本变成"未保存"；人物引用和状态不动。 */
  async setLibrary(ownerKey: string, library: KernelLibrary): Promise<KernelCampaign> {
    const ws = await this.workspace(ownerKey)
    const current = this.parse(ws.data.kernel)
    if (!current) throw new TrpgError('E_NO_KERNEL', '这个战役还没有绑定结算内核')
    const parsed = kernelLibrarySchema.parse(library)
    const rootId = ws.currentSaveId ? await this.deps.campaign.campaignRootOf(ws.currentSaveId) : null
    if (!rootId) throw new TrpgError('E_NO_WORKSPACE', '还没有存档，先保存一次再改选书设置')
    await this.deps.db.setMeta(libraryKey(rootId), parsed)
    return { ...current, library: parsed }
  }

  private unboundCheck(): KernelCheck {
    return { bound: false, rule: null, ruleMissing: false, missing: [], checked: 0, dataVersion: null, dataVersionChanged: false,
      dataVersionChanges: { official: null, brews: [] }, overridesChanged: false, overrideChanges: [], plan: { download: [], gone: [], closed: [], versionChanged: false } }
  }

  /** 读当前战役的前检查：规则装没装、引用还在不在、版本/覆盖哪里变了；只报告，不改存档。 */
  async check(ownerKey: string): Promise<KernelCheck> {
    const ws = await this.workspace(ownerKey)
    const kernel = this.parse(ws.data.kernel)
    if (!kernel) return this.unboundCheck()
    return this.checkKernel(kernel, await this.libraryOf(ownerKey))
  }

  /** 读档前检查存档槽：只看要读的那份存档，不动当前战役。 */
  async checkSave(saveId: string): Promise<KernelCheck> {
    const save = await this.deps.campaign.getSave(saveId)
    if (!save || save.deletedAt !== undefined) throw new TrpgError('E_NOT_FOUND', '没有找到这个存档')
    const snapshot = save.snapshot as Record<string, unknown>
    const kernel = this.parse(snapshot.kernel)
    if (!kernel) return this.unboundCheck()
    return this.checkKernel(kernel, await this.libraryOfSave(save))
  }

  private async checkKernel(kernel: KernelCampaign, library: KernelLibrary): Promise<KernelCheck> {
    const ruleMissing = !this.deps.rules.get(kernel.rule)
    const rows: Array<{ actorId: string; actorName: string; ref: KernelActor['refs'][number] }> = []
    for (const actor of kernel.actors) for (const ref of actor.refs) rows.push({ actorId: actor.id, actorName: actor.name, ref })
    const results = rows.length ? await this.deps.checkRefs(rows.map((r) => r.ref), library) : []
    const missing: KernelMissing[] = []
    const plan: KernelLoadPlan = { download: [], gone: [], closed: [], versionChanged: false }
    results.forEach((result, index) => {
      const row = rows[index]
      const label = row.ref.label
      if (result.ok) {
        if (!result.closed) return
        const source = result.source ?? ''
        const hit = plan.closed.find((c) => c.set === row.ref.set && c.source === source)
        if (hit) { hit.refs++; if (label && hit.labels.length < 5) hit.labels.push(label) } else plan.closed.push({ set: row.ref.set, source, refs: 1, labels: label ? [label] : [] })
        return
      }
      missing.push({ ...row, ref: { ...row.ref, label }, reason: result.reason ?? 'missing' })
      if (result.reason === 'not-found') { plan.gone.push({ set: row.ref.set, prop: row.ref.prop, hash: row.ref.hash, label }); return }
      const hit = plan.download.find((d) => d.set === row.ref.set)
      if (hit) { hit.refs++; if (label && hit.labels.length < 5) hit.labels.push(label) } else plan.download.push({ set: row.ref.set, kind: row.ref.set.endsWith('-brew') ? 'brew' : 'official', refs: 1, labels: label ? [label] : [] })
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

    plan.versionChanged = !!current && (dataVersionChanges.official !== null || dataVersionChanges.brews.length > 0 || overrideChanges.length > 0)
    return {
      bound: true, rule: kernel.rule, ruleMissing, missing, checked: rows.length, plan,
      dataVersion: kernel.dataVersion,
      dataVersionChanged: !!current && (dataVersionChanges.official !== null || dataVersionChanges.brews.length > 0),
      dataVersionChanges,
      overridesChanged: overrideChanges.length > 0,
      overrideChanges,
    }
  }

  /** 把本战役关着的书 / 包开启（读档提示里用户勾了才调）：只写战役设置，不动存档。 */
  async openSources(ownerKey: string, sources: string[]): Promise<KernelLibrary> {
    let library = await this.libraryOf(ownerKey)
    for (const source of sources) library = { ...library, ...chooseSource(library, source, true) }
    await this.setLibrary(ownerKey, library)
    return library
  }

  /** 保存：事务外现取版本记号与覆盖，再走 M1 的短事务保存；版本没变时不会凭空产生“已保存”。 */
  async save(ownerKey: string): Promise<{ changed: boolean; workspace: Workspace }> {
    const kernel = await this.read(ownerKey)
    if (kernel) {
      const dataVersion = this.deps.currentVersion ? await this.deps.currentVersion() : kernel.dataVersion
      const overrides = this.deps.currentOverrides ? await this.deps.currentOverrides() : kernel.overrides
      const library = await this.libraryOf(ownerKey)
      if (JSON.stringify(dataVersion) !== JSON.stringify(kernel.dataVersion) || JSON.stringify(overrides) !== JSON.stringify(kernel.overrides) || JSON.stringify(library) !== JSON.stringify(kernel.library)) {
        // 存档里的 library 只是副本（导出 / 换设备导入时当初值），保存时同步一次
        const next: KernelCampaign = { ...kernel, dataVersion, overrides, library }
        await this.deps.campaign.updateData(ownerKey, (data) => ({ ...data, kernel: next, library }))
      }
    }
    return this.deps.campaign.saveCurrent(ownerKey)
  }

  /** 预览变更计划：每行交回改前/改后的精简段；不写任何数据。 */
  async preview(ownerKey: string, changes: KernelChange[]): Promise<{ revision: number; rows: KernelPreviewRow[] }> {
    const kernel = await this.read(ownerKey)
    if (!kernel) throw new TrpgError('E_NO_KERNEL', '这个战役还没有绑定结算内核')
    const mapper = await this.refMapper(ownerKey)
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
    const compact = this.deps.compactActors && ids.length ? await this.deps.compactActors(ownerKey, ids) : []
    // 事务里不能等别的异步（Dexie 会提前提交），对照表先在事务外取好
    const mapper = await this.refMapper(ownerKey)
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
        if (this.deps.compactActors && !nextCompact) throw new TrpgError('E_NO_COMPACTOR', `没有拿到人物 ${actorId} 的重建结果`)
        if (nextCompact) {
          const old = nextActors[index]
          nextActors[index] = {
            ...old, ...clone(nextCompact),
            adjustments: old.adjustments, dice: old.dice, legacy: old.legacy, legacyState: old.legacyState,
          }
        } else {
          nextActors[index] = applyActorChanges(nextActors[index], [change], mapper)
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
