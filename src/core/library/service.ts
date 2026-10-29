import type { TrpgDatabase } from '../db'
import { TrpgError } from '../errors'
import { disablePack, enablePack } from '../packs/enablement'
import type { CampaignService } from '../saves/campaign'
import { loadSettings } from '../backup'
import type { RuleRegistry } from '../../rules/registry'
import type { Workspace } from '../../schemas/campaign'
import type { InstalledPack } from '../../schemas/pack'
import { disableFeatures, enableFeatures, setRuleOption, updateFeatures } from './features'
import { repairIssue, type FixKind, type Issue } from './integrity'
import { pinEntry } from './pins'
import { entryKey, libraryOf, type Variant } from './types'
import {
  applyVariantPlan, fromPack, incomingVariants, planVariants, setSourceUse, switchVariant, withdrawFrom,
  type Reverted, type VariantPlanItem,
} from './variants'

export interface LibraryDeps {
  rules: RuleRegistry
  now: () => number
  campaign: CampaignService
}

export interface EnablePreview {
  pack: InstalledPack
  /** 因依赖一并启用的包。 */
  autoEnabled: InstalledPack[]
  /** 这个包（及依赖）带来的修改版，含默认选择与冲突标记。 */
  variants: VariantPlanItem[]
}

export interface DisablePreview {
  /** 依赖它的、已启用的包（不为空时不能停用）。 */
  dependents: string[]
  /** 停用后会改回的条目。 */
  reverted: Reverted[]
  /** 有功能产生的状态（规则选项取值等），重新启用后恢复。 */
  hasState: boolean
}

/** 启用与停用扩展包、功能、规则选项与修改版（L1 §3.15、§3.16）。写入当前数据，调用方负责刷新界面状态。 */
export class LibraryService {
  constructor(
    private readonly db: TrpgDatabase,
    private readonly deps: LibraryDeps,
  ) {}

  private async workspace(ownerKey: string): Promise<Workspace> {
    const ws = await this.deps.campaign.getWorkspace(ownerKey)
    if (!ws) throw new TrpgError('E_NO_WORKSPACE', '还没有当前战役')
    return ws
  }

  private async installedMap(): Promise<Map<string, InstalledPack>> {
    return new Map((await this.db.packs.toArray()).map((p) => [p.id, p]))
  }

  private async variantsOf(packs: InstalledPack[]) {
    const out = []
    for (const pack of packs) out.push(...incomingVariants(pack, await this.db.entries.where('packId').equals(pack.id).toArray()))
    return out
  }

  private async save(ws: Workspace): Promise<Workspace> {
    const next = { ...ws, updatedAt: this.deps.now() }
    await this.db.workspaces.put(next)
    return next
  }

  /** 启用前的预览：依赖、冲突检查与修改版（含默认选择）。冲突时抛出带原因的错误。 */
  async previewEnable(ownerKey: string, packId: string): Promise<EnablePreview> {
    const ws = await this.workspace(ownerKey)
    const rule = this.rule(ws.ruleId)
    const installed = await this.installedMap()
    const pack = installed.get(packId)
    if (!pack) throw new TrpgError('E_NOT_FOUND', '没有找到这个扩展包，请先在库里安装')
    const { enabledPacks, autoEnabled } = enablePack(ws.enabledPacks, packId, installed, rule)
    this.assertNoConflict(enabledPacks, installed, [packId, ...autoEnabled])
    const newPacks = [packId, ...autoEnabled].map((id) => installed.get(id)!)
    const settings = await loadSettings(this.db)
    const variants = planVariants(ws.data, await this.variantsOf(newPacks), settings.variantDefault)
    return { pack, autoEnabled: autoEnabled.map((id) => installed.get(id)!), variants }
  }

  private assertNoConflict(enabled: Array<{ id: string }>, installed: Map<string, InstalledPack>, adding: string[]): void {
    const on = new Set(enabled.map((e) => e.id))
    for (const id of adding) {
      const pack = installed.get(id)
      for (const c of pack?.relationships.conflicts ?? []) {
        if (on.has(c.id)) throw new TrpgError('E_PACK_CONFLICT', `『${pack?.name}』与『${installed.get(c.id)?.name ?? c.id}』冲突${c.reason ? `：${c.reason}` : ''}，不能同时启用`)
      }
      for (const other of on) {
        const hit = installed.get(other)?.relationships.conflicts.find((c) => c.id === id)
        if (hit) throw new TrpgError('E_PACK_CONFLICT', `『${installed.get(other)?.name}』与『${pack?.name}』冲突${hit.reason ? `：${hit.reason}` : ''}，不能同时启用`)
      }
    }
  }

  /** 启用：依赖一并启用，复制功能定义，修改版按 use 加入候选（先固定原版）。 */
  async enable(ownerKey: string, packId: string, opts: { use?: Record<string, boolean> } = {}): Promise<{ workspace: Workspace; autoEnabled: string[]; variantsAdded: number }> {
    const preview = await this.previewEnable(ownerKey, packId)
    const ws = await this.workspace(ownerKey)
    const rule = this.rule(ws.ruleId)
    const installed = await this.installedMap()
    const { enabledPacks, autoEnabled } = enablePack(ws.enabledPacks, packId, installed, rule)
    const now = this.deps.now()
    let data = ws.data
    for (const id of [packId, ...autoEnabled]) data = enableFeatures(data, installed.get(id)!, now)
    for (const item of preview.variants) {
      const [targetPack, targetEntry] = [item.entryKey.slice(0, item.entryKey.indexOf('/')), item.entryKey.slice(item.entryKey.indexOf('/') + 1)]
      data = (await pinEntry(this.db, data, targetPack, targetEntry, now)) ?? data
    }
    const use = opts.use ?? Object.fromEntries(preview.variants.map((v) => [v.variant.key, v.defaultUse]))
    data = applyVariantPlan(data, preview.variants, use)
    const workspace = await this.save({ ...ws, enabledPacks, data })
    return { workspace, autoEnabled, variantsAdded: preview.variants.length }
  }

  /** 新战役建立后：已启用的包带来的修改版按默认值加入候选（先固定原版）。 */
  async applyDefaultVariants(ownerKey: string): Promise<Workspace> {
    const ws = await this.workspace(ownerKey)
    const installed = await this.installedMap()
    const settings = await loadSettings(this.db)
    const packs = ws.enabledPacks.map((e) => installed.get(e.id)).filter((p): p is InstalledPack => !!p)
    const plan = planVariants(ws.data, await this.variantsOf(packs), settings.variantDefault)
    if (!plan.length) return ws
    let data = ws.data
    const now = this.deps.now()
    for (const item of plan) {
      const slash = item.entryKey.indexOf('/')
      data = (await pinEntry(this.db, data, item.entryKey.slice(0, slash), item.entryKey.slice(slash + 1), now)) ?? data
    }
    data = applyVariantPlan(data, plan, Object.fromEntries(plan.map((p) => [p.variant.key, p.defaultUse])))
    return this.save({ ...ws, data })
  }

  async previewDisable(ownerKey: string, packId: string): Promise<DisablePreview> {
    const ws = await this.workspace(ownerKey)
    const installed = await this.installedMap()
    const dependents = ws.enabledPacks.filter((e) => installed.get(e.id)?.relationships.requires.some((d) => d.id === packId)).map((e) => e.id)
    const lib = libraryOf(ws.data)
    const hasState = Object.entries(lib.features).some(([key, rec]) => rec.packId === packId && key in lib.featureState)
    return { dependents, reverted: withdrawFrom(ws.data, fromPack(packId)).reverted, hasState }
  }

  /** 停用：功能 enabled 改为否（定义与状态保留），修改版按「撤下」处理。 */
  async disable(ownerKey: string, packId: string): Promise<{ workspace: Workspace; reverted: Reverted[] }> {
    const ws = await this.workspace(ownerKey)
    const rule = this.rule(ws.ruleId)
    const enabledPacks = disablePack(ws.enabledPacks, packId, await this.installedMap(), rule)
    const { data, reverted } = withdrawFrom(disableFeatures(ws.data, packId), fromPack(packId))
    return { workspace: await this.save({ ...ws, enabledPacks, data }), reverted }
  }

  async setRuleOption(ownerKey: string, key: string, value: boolean): Promise<Workspace> {
    const ws = await this.workspace(ownerKey)
    return this.save({ ...ws, data: setRuleOption(ws.data, key, value) })
  }

  /** 更新功能定义与修改版内容（L1 §3.15「扩展包更新」、§3.16）；调用方先写自动存档。 */
  async updateFeatures(ownerKey: string, packId: string): Promise<{ workspace: Workspace; kept: Array<{ key: string; reason: string }> }> {
    const ws = await this.workspace(ownerKey)
    const pack = (await this.installedMap()).get(packId)
    if (!pack) throw new TrpgError('E_NOT_FOUND', '没有找到这个扩展包')
    const now = this.deps.now()
    const updated = updateFeatures(ws.data, pack, now)
    const incoming = await this.variantsOf([pack])
    // 同一 key 换新内容；新增的按默认加入；不再包含的按「撤下」
    const present = new Set(incoming.map((i) => i.variant.key))
    const withdrawn = withdrawFrom(updated.data, (v) => fromPack(packId)(v) && !present.has(v.key))
    const settings = await loadSettings(this.db)
    const plan = planVariants(withdrawn.data, incoming, settings.variantDefault)
    let data = withdrawn.data
    for (const item of plan) {
      const slash = item.entryKey.indexOf('/')
      data = (await pinEntry(this.db, data, item.entryKey.slice(0, slash), item.entryKey.slice(slash + 1), now)) ?? data
    }
    data = applyVariantPlan(data, plan, Object.fromEntries(plan.map((p) => [p.variant.key, p.defaultUse])))
    return { workspace: await this.save({ ...ws, data }), kept: updated.kept }
  }

  async switchVariant(ownerKey: string, entryKeyValue: string, variantKey: string): Promise<Workspace> {
    const ws = await this.workspace(ownerKey)
    return this.save({ ...ws, data: switchVariant(ws.data, entryKeyValue, variantKey) })
  }

  /** 某个来源的修改版「全部使用 / 全部不用」。 */
  async setSourceUse(ownerKey: string, match: (v: Variant) => boolean, use: boolean): Promise<{ workspace: Workspace; changed: Reverted[] }> {
    const ws = await this.workspace(ownerKey)
    const { data, changed } = setSourceUse(ws.data, match, use)
    return { workspace: await this.save({ ...ws, data }), changed }
  }

  /** 体检修复：先写自动存档（原因「改动模组前」），再修；修复后由调用方重新检查。 */
  async repair(ownerKey: string, issue: Issue, fix: FixKind, arg?: string): Promise<Workspace> {
    const ws = await this.workspace(ownerKey)
    await this.deps.campaign.writeAutoSave(ws, '改动模组前')
    const data = await repairIssue(this.db, ws.data, issue, fix, this.deps.now(), arg)
    return this.save({ ...ws, data })
  }

  /** 更新功能定义前先写自动存档。 */
  async updateFeaturesSafely(ownerKey: string, packId: string): Promise<{ workspace: Workspace; kept: Array<{ key: string; reason: string }> }> {
    await this.deps.campaign.writeAutoSave(await this.workspace(ownerKey), '改动模组前')
    return this.updateFeatures(ownerKey, packId)
  }

  entryKeyOf = entryKey

  private rule(ruleId: string) {
    const rule = this.deps.rules.get(ruleId)
    if (!rule) throw new TrpgError('E_RULE_MISMATCH', '这个存档的规则没有安装')
    return rule
  }
}
