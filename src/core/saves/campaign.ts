import type { TrpgDatabase } from '../db'
import { TrpgError } from '../errors'
import { uuid as defaultUuid } from '../ids'
import { SCHEMA_VERSIONS } from '../../schemas/common'
import { backupStateSchema, type AutoReason, type SaveSlot, type Workspace, type WorkspaceData } from '../../schemas/campaign'
import type { RuleRegistry } from '../../rules/registry'
import { campaignIdOfSave, campaignViewOf, libraryKey, treeRootId, type CampaignView } from './view'
import { AUTO_SAVE_KEEP, byRecent, cleanName, isDirty, readSave, readWorkspace, snapshotHash, summarize, uniqueName, type SummaryContributor } from './helpers'

export interface CampaignDeps {
  rules: RuleRegistry
  now: () => number
  uuid?: () => string
  summaryContributors?: SummaryContributor[]
}

export interface Owner {
  ownerKey: string
  ownerLabel: string
}

export interface NewCampaignInput extends Owner {
  ruleId: string
  name: string
  note?: string
  /** 开局时就写进当前数据和第一个存档的内容（例如绑好的结算内核段）；不给就是空的。 */
  initialData?: WorkspaceData
}

/** 当前数据与存档的全部业务规则（U2 §3）。界面只经它读写，不直接访问存储。 */
export class CampaignService {
  private readonly uuid: () => string

  constructor(
    private readonly db: TrpgDatabase,
    private readonly deps: CampaignDeps,
  ) {
    this.uuid = deps.uuid ?? defaultUuid
  }

  // ---------- 查询 ----------

  async getWorkspace(ownerKey: string): Promise<Workspace | null> {
    const raw = await this.db.workspaces.get(ownerKey)
    if (!raw) return null
    const ws = readWorkspace(raw)
    if (ws !== raw) await this.db.workspaces.put(ws)
    return ws
  }

  isDirty(ws: Workspace): boolean {
    return isDirty(ws)
  }

  async getSave(id: string): Promise<SaveSlot | null> {
    const raw = await this.db.saves.get(id)
    return raw ? readSave(raw) : null
  }

  /** 手动存档：scope=card 只含当前卡，all 含全部卡；均限定当前规则，最近更新在前。 */
  async listManual(owner: { ownerKey: string; ruleId: string }, scope: 'card' | 'all'): Promise<SaveSlot[]> {
    const rows = await this.db.saves.where('ruleId').equals(owner.ruleId).toArray()
    return rows
      .map(readSave)
      .filter((s) => s.kind === 'manual' && s.deletedAt === undefined && (scope === 'all' || s.ownerKey === owner.ownerKey))
      .sort(byRecent)
  }

  async listAuto(ownerKey: string, ruleId: string): Promise<SaveSlot[]> {
    const rows = await this.db.saves.where('[ownerKey+ruleId]').equals([ownerKey, ruleId]).toArray()
    return rows.map(readSave).filter((s) => s.kind === 'auto').sort(byRecent)
  }

  async listDeleted(ruleId: string): Promise<SaveSlot[]> {
    const rows = await this.db.saves.where('ruleId').equals(ruleId).toArray()
    return rows.map(readSave).filter((s) => s.deletedAt !== undefined).sort((a, b) => (b.deletedAt ?? 0) - (a.deletedAt ?? 0))
  }

  async listOtherRules(ruleId: string): Promise<SaveSlot[]> {
    const rows = await this.db.saves.toArray()
    return rows.map(readSave).filter((s) => s.ruleId !== ruleId && s.kind === 'manual' && s.deletedAt === undefined).sort(byRecent)
  }

  /** 战役视图（只读）：战役名、当前存档、分支树、其他战役、各处数量。规则见 view.ts。 */
  async getCampaignView(ownerKey: string, ruleId: string): Promise<CampaignView> {
    const rows = (await this.db.saves.toArray()).map(readSave)
    const ws = await this.db.workspaces.get(ownerKey)
    return campaignViewOf(rows, { ownerKey, ruleId, currentSaveId: ws && ws.ruleId === ruleId ? ws.currentSaveId : null })
  }

  /** 一个存档所在战役（存档树）的根存档编号；自动存档 / 已删除的存档不在树里 → null。 */
  async campaignRootOf(saveId: string): Promise<string | null> {
    return treeRootId((await this.db.saves.toArray()).map(readSave), saveId)
  }

  /** 一份存档属于哪个战役（有编号用编号，旧存档按存档树根算；算不出 → null）。 */
  async campaignIdOfSaveId(saveId: string): Promise<string | null> {
    const rows = (await this.db.saves.toArray()).map(readSave)
    const save = rows.find((s) => s.id === saveId)
    return save ? campaignIdOfSave(rows, save) : null
  }

  /**
   * 当前战役的编号（战役级设置挂在它上面）。旧数据没有编号：按当前存档所在的存档树根补上（和旧的设置键一致，不丢设置）；
   * 当前用的是没编号的旧自动存档、算不出时发一个新编号。补上后写回当前数据，之后的存档、分支、自动存档都带它。
   */
  async campaignIdOf(ownerKey: string): Promise<string> {
    return this.db.transaction('rw', [this.db.workspaces, this.db.saves], async () => {
      const ws = await this.requireWorkspace(ownerKey)
      if (ws.campaignId) return ws.campaignId
      const id = (ws.currentSaveId ? await this.campaignIdOfSaveId(ws.currentSaveId) : null) ?? this.uuid()
      await this.db.workspaces.put({ ...ws, campaignId: id })
      return id
    })
  }

  // ---------- 新存档 / 保存 / 分支 ----------

  async startNewCampaign(input: NewCampaignInput): Promise<{ workspace: Workspace; save: SaveSlot }> {
    this.requireRule(input.ruleId)
    const name = cleanName(input.name)
    return this.db.transaction('rw', [this.db.workspaces, this.db.saves, this.db.meta], async () => {
      const existing = await this.getWorkspace(input.ownerKey)
      if (existing) await this.writeAutoSave(existing, '新存档前')
      const data: WorkspaceData = input.initialData ? structuredClone(input.initialData) : {}
      const ws: Workspace = {
        ownerKey: input.ownerKey,
        ownerLabel: input.ownerLabel,
        ruleId: input.ruleId,
        currentSaveId: null,
        data,
        savedHash: '',
        schemaVersion: SCHEMA_VERSIONS.workspace,
        updatedAt: this.deps.now(),
      }
      // 新战役：战役编号 = 根存档编号（和旧数据按树根取编号是同一个约定）
      const rootId = this.uuid()
      ws.campaignId = rootId
      const save = await this.buildSave(ws, { id: rootId, name, note: input.note ?? '', kind: 'manual' })
      ws.currentSaveId = save.id
      ws.savedHash = save.hash
      await this.db.saves.put(save)
      await this.db.workspaces.put(ws)
      await this.bumpSaves()
      return { workspace: ws, save }
    })
  }

  /** 保存到当前存档；没有改动时返回 changed=false 且不写入。 */
  async saveCurrent(ownerKey: string): Promise<{ changed: boolean; workspace: Workspace }> {
    return this.db.transaction('rw', [this.db.workspaces, this.db.saves, this.db.meta], async () => {
      const ws = await this.requireWorkspace(ownerKey)
      if (!isDirty(ws)) return { changed: false, workspace: ws }
      const current = ws.currentSaveId ? await this.getSave(ws.currentSaveId) : null
      const fresh = await this.buildSave(ws, { id: current?.id ?? this.uuid(), name: current?.name ?? '存档', note: current?.note ?? '', kind: 'manual' })
      const save: SaveSlot = current ? { ...current, snapshot: fresh.snapshot, summary: fresh.summary, hash: fresh.hash, updatedAt: fresh.updatedAt } : fresh
      const next: Workspace = { ...ws, currentSaveId: save.id, savedHash: save.hash, updatedAt: save.updatedAt }
      await this.db.saves.put(save)
      await this.db.workspaces.put(next)
      await this.bumpSaves()
      return { changed: true, workspace: next }
    })
  }

  /** 用当前数据（含未保存改动）新建一个存档并切换过去；原存档保持上次保存的样子。 */
  async branch(ownerKey: string, name?: string): Promise<{ workspace: Workspace; save: SaveSlot }> {
    return this.db.transaction('rw', [this.db.workspaces, this.db.saves, this.db.meta], async () => {
      const ws = await this.requireWorkspace(ownerKey)
      const origin = ws.currentSaveId ? await this.getSave(ws.currentSaveId) : null
      const taken = await this.manualNames(ws.ownerKey, ws.ruleId)
      const chosen = name !== undefined ? cleanName(name) : uniqueName(`${origin?.name ?? '存档'} 分支`, taken)
      const save = await this.buildSave(ws, { id: this.uuid(), name: chosen, note: '', kind: 'manual', branchedFrom: origin?.id })
      const next: Workspace = { ...ws, currentSaveId: save.id, savedHash: save.hash, updatedAt: save.updatedAt }
      await this.db.saves.put(save)
      await this.db.workspaces.put(next)
      await this.bumpSaves()
      return { workspace: next, save }
    })
  }

  // ---------- 读取 ----------

  /**
   * 读取存档（调用方已处理"保存存档后读取 / 不保存存档"的选择）：
   * 先为当前数据写自动存档；其他卡的存档先复制为本卡的新存档；其他规则须 allowRuleSwitch。
   * precheck 在写自动存档/切换前运行；它抛错（例如玩家取消或读前检查有缺）时当前战役不动。
   */
  async loadSave(owner: Owner, saveId: string, opts: { allowRuleSwitch?: boolean; precheck?: (save: SaveSlot) => Promise<void>; skipAutoSave?: boolean } = {}): Promise<Workspace> {
    const source = await this.getSave(saveId)
    if (!source || source.deletedAt !== undefined) throw new TrpgError('E_NOT_FOUND', '没有找到这个存档')
    this.requireRule(source.ruleId)
    if (opts.precheck) await opts.precheck(source)
    return this.db.transaction('rw', [this.db.workspaces, this.db.saves, this.db.meta], async () => {
      const current = await this.getWorkspace(owner.ownerKey)
      const switching = !!current && current.ruleId !== source.ruleId
      if (switching && !opts.allowRuleSwitch) throw new TrpgError('E_RULE_SWITCH_REQUIRED', '这个存档属于其他规则，需要确认切换规则')
      // 玩家在读取确认页勾了「不自动备份当前存档」才跳过；默认读档前一定先存一份
      if (current && !opts.skipAutoSave) await this.writeAutoSave(current, switching ? '切换规则前' : '读档前')
      let target = source
      if (source.ownerKey !== owner.ownerKey) {
        const taken = await this.manualNames(owner.ownerKey, source.ruleId)
        const now = this.deps.now()
        // 复制到本卡 = 本卡的一棵新存档树 = 新战役；战役设置从原战役那份抄一份当初值
        const id = this.uuid()
        const fromId = campaignIdOfSave((await this.db.saves.toArray()).map(readSave), source)
        target = { ...source, id, campaignId: id, ownerKey: owner.ownerKey, ownerLabel: owner.ownerLabel, name: uniqueName(`${source.name}（来自 ${source.ownerLabel}）`, taken), branchedFrom: undefined, createdAt: now, updatedAt: now }
        await this.db.saves.put(target)
        await this.copyLibrary(fromId, id)
      }
      // 读档：当前数据换成这份存档，所属战役跟着换（旧存档没有编号按存档树根算；算不出的留空，用到时再补）
      const campaignId = target.campaignId ?? campaignIdOfSave((await this.db.saves.toArray()).map(readSave), target) ?? undefined
      const ws: Workspace = {
        ownerKey: owner.ownerKey,
        ownerLabel: owner.ownerLabel,
        ruleId: target.ruleId,
        currentSaveId: target.id,
        ...(campaignId ? { campaignId } : {}),
        data: structuredClone(target.snapshot),
        savedHash: target.hash,
        schemaVersion: SCHEMA_VERSIONS.workspace,
        updatedAt: this.deps.now(),
      }
      await this.db.workspaces.put(ws)
      return ws
    })
  }

  // ---------- 删除 / 恢复 / 改名 ----------

  async deleteSave(saveId: string): Promise<SaveSlot> {
    const save = await this.getSave(saveId)
    if (!save) throw new TrpgError('E_NOT_FOUND', '没有找到这个存档')
    if (save.kind === 'auto') throw new TrpgError('E_AUTO_NOT_DELETABLE', '自动存档会自动滚动保留，不能单独删除')
    const ws = await this.db.workspaces.get(save.ownerKey)
    if (ws?.currentSaveId === save.id) throw new TrpgError('E_SAVE_IN_USE', '正在使用的存档不能删除，请先读取或新建其他存档')
    const deleted = { ...save, deletedAt: this.deps.now() }
    await this.db.saves.put(deleted)
    return deleted
  }

  async restoreSave(saveId: string): Promise<SaveSlot> {
    const save = await this.getSave(saveId)
    if (!save || save.deletedAt === undefined) throw new TrpgError('E_NOT_FOUND', '没有找到这个已删除的存档')
    const { deletedAt: _d, ...rest } = save
    const taken = await this.manualNames(save.ownerKey, save.ruleId)
    const restored: SaveSlot = { ...rest, name: uniqueName(save.name, taken, (n) => `（恢复 ${n}）`) }
    await this.db.saves.put(restored)
    return restored
  }

  /** 彻底删除（只允许处理已在"最近删除"中的存档）。 */
  async purgeSaves(ids: string[]): Promise<number> {
    let count = 0
    for (const id of ids) {
      const save = await this.getSave(id)
      if (save?.deletedAt === undefined) continue
      await this.db.saves.delete(id)
      count++
    }
    return count
  }

  async renameSave(saveId: string, name: string): Promise<SaveSlot> {
    return this.patchManual(saveId, { name: cleanName(name) })
  }

  async setNote(saveId: string, note: string): Promise<SaveSlot> {
    return this.patchManual(saveId, { note: note.slice(0, 200) })
  }

  /** 把自动存档另存为手动存档（自动存档本身继续按规则滚动）。 */
  async saveAutoAsManual(autoId: string): Promise<SaveSlot> {
    const auto = await this.getSave(autoId)
    if (!auto || auto.kind !== 'auto') throw new TrpgError('E_NOT_FOUND', '没有找到这个自动存档')
    const taken = await this.manualNames(auto.ownerKey, auto.ruleId)
    const now = this.deps.now()
    const date = new Date(auto.createdAt)
    const stamp = `${date.getMonth() + 1}月${date.getDate()}日 ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
    // 另存出来的手动存档是一棵新存档树 = 新战役；战役设置从自动存档所属战役抄一份当初值，看到的开关不变
    const id = this.uuid()
    const manual: SaveSlot = { ...auto, id, campaignId: id, kind: 'manual', autoReason: undefined, name: uniqueName(`自动存档 · ${stamp}`, taken), createdAt: now, updatedAt: now }
    await this.db.saves.put(manual)
    await this.copyLibrary(auto.campaignId ?? null, id)
    return manual
  }

  // ---------- 当前数据 ----------

  async putWorkspace(ws: Workspace): Promise<void> {
    await this.db.workspaces.put({ ...ws, updatedAt: this.deps.now() })
  }

  async updateData(ownerKey: string, updater: (data: WorkspaceData) => WorkspaceData): Promise<Workspace> {
    const ws = await this.requireWorkspace(ownerKey)
    const next: Workspace = { ...ws, data: updater(ws.data), updatedAt: this.deps.now() }
    await this.db.workspaces.put(next)
    return next
  }

  // ---------- 内部 ----------

  /** 导入、恢复备份等流程复用：写自动存档并按"每卡每规则保留 3 个"滚动。 */
  async writeAutoSave(ws: Workspace, reason: AutoReason): Promise<SaveSlot> {
    const save = await this.buildSave(ws, { id: this.uuid(), name: `自动存档 · ${reason}`, note: '', kind: 'auto', autoReason: reason })
    await this.db.saves.put(save)
    const autos = await this.listAuto(ws.ownerKey, ws.ruleId)
    for (const old of autos.slice(AUTO_SAVE_KEEP)) await this.db.saves.delete(old.id)
    return save
  }

  async pruneAutoSaves(ownerKey: string, ruleId: string): Promise<void> {
    const autos = await this.listAuto(ownerKey, ruleId)
    for (const old of autos.slice(AUTO_SAVE_KEEP)) await this.db.saves.delete(old.id)
  }

  async buildSave(ws: Workspace, f: { id: string; name: string; note: string; kind: 'manual' | 'auto'; autoReason?: AutoReason; branchedFrom?: string }): Promise<SaveSlot> {
    const now = this.deps.now()
    return {
      id: f.id,
      ownerKey: ws.ownerKey,
      ownerLabel: ws.ownerLabel,
      ruleId: ws.ruleId,
      name: f.name,
      note: f.note,
      kind: f.kind,
      ...(f.autoReason ? { autoReason: f.autoReason } : {}),
      ...(f.branchedFrom ? { branchedFrom: f.branchedFrom } : {}),
      ...(ws.campaignId ? { campaignId: ws.campaignId } : {}),
      createdAt: now,
      updatedAt: now,
      summary: summarize(ws.data, this.deps.summaryContributors ?? []),
      snapshot: structuredClone(ws.data),
      hash: snapshotHash(ws.data),
      schemaVersion: SCHEMA_VERSIONS.save,
    }
  }

  async manualNames(ownerKey: string, ruleId: string): Promise<Set<string>> {
    const rows = await this.db.saves.where('[ownerKey+ruleId]').equals([ownerKey, ruleId]).toArray()
    return new Set(rows.filter((s) => s.kind === 'manual' && s.deletedAt === undefined).map((s) => s.name))
  }

  /** 新战役从别的战役抄一份战役级选书设置当初值（原战役没有就不抄，用到时按存档里的副本）。 */
  private async copyLibrary(fromCampaignId: string | null, toCampaignId: string): Promise<void> {
    if (!fromCampaignId) return
    const stored = await this.db.getMeta<unknown>(libraryKey(fromCampaignId))
    if (stored !== undefined) await this.db.setMeta(libraryKey(toCampaignId), structuredClone(stored))
  }

  private async bumpSaves(): Promise<void> {
    const state = backupStateSchema.parse((await this.db.getMeta('backup')) ?? {})
    await this.db.setMeta('backup', { ...state, savesSinceExport: state.savesSinceExport + 1 })
  }

  private async patchManual(saveId: string, patch: Partial<Pick<SaveSlot, 'name' | 'note'>>): Promise<SaveSlot> {
    const save = await this.getSave(saveId)
    if (!save || save.deletedAt !== undefined) throw new TrpgError('E_NOT_FOUND', '没有找到这个存档')
    if (save.kind === 'auto') throw new TrpgError('E_AUTO_NOT_DELETABLE', '自动存档不能改名或加备注')
    const next = { ...save, ...patch }
    await this.db.saves.put(next)
    return next
  }

  private async requireWorkspace(ownerKey: string): Promise<Workspace> {
    const ws = await this.getWorkspace(ownerKey)
    if (!ws) throw new TrpgError('E_NO_WORKSPACE', '还没有当前战役')
    return ws
  }

  private requireRule(ruleId: string) {
    const rule = this.deps.rules.get(ruleId)
    if (!rule) throw new TrpgError('E_RULE_MISSING', `需要先安装规则『${ruleId}』`)
    return rule
  }

}
