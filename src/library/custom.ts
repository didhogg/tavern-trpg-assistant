// 自定义库（D2-P3 整体设计 §2.3、§2.5、§2.6）：写新条目、房规、文字转条目、新条目模板、导出、导入预览。
// 条目内容全部走作者的可编辑自制（作者格式）；插件只记"房规 → 目标"的链接和范围设置。
// 改完都走同一条路：作者包管理器 → 重新解析 → 同编号挂备选（LibraryService.afterBrewChange）。
import { BrewPacks } from './brew-packs'
import { copyEntryToPack, copyToMine, type CopyDeps } from './custom-copy'
import { flattenOldCopies, migrateMine } from './custom-migrate'
import { importReplaces } from './import-replace'
import { exportBackup, exportScopes, importBackup, importScopes, type BackupDeps, type ScopeConfig } from './custom-backup'
import { listDrafts, saveDraft, type DraftInput } from './custom-drafts'
import { blankEntry, entryTypes, type ConvertMode, type ConverterInfo, type NewEntryDeps } from './custom-new'
import { createPack, deletePack, docIdOf, exportPack, lastPack, listPacks, rememberPack, renamePack, type PackDeps, type PackSource } from './custom-packs'
import { listEdits, moveEdits, type EditFilter, type EditLevel, type EditRow } from './custom-edits'
import { historyKey, moveEntries, persist, remove, undo, type EntryDeps, type SaveOptions } from './custom-entries'
import type { BrewValidation, SchemaIssue } from './brew-validate'
import { formatOfCampaign, formatOfCodeSet, splitRecognized } from './formats'
import { fieldTable } from './field-values'
import { fieldChanges, topLevelChanges } from './house-diff'
import { findCollisions, packAltId, type DocIndex } from './versions'
import type { Counterpart } from './counterpart'
import type { LibraryDatabase } from './db'
import { parsedKey } from './install'
import type { ChoiceLevel, ManageStore } from './manage'
import type { ParsedProp } from './runtime/frame/commands'
import type { LibraryService } from './service'
import type { ScopedLibrary } from './scoped'
import registry from './custom.json'
import { entryUnit, refKey, ruleScopes, type CampaignLibrary, type EntryRef } from './scopes'
import { officialSourceOf, SOURCES, type SourceEntry } from './sources'

interface CustomSource {
  json: string
  full: string
  abbreviation: string
}

/** 插件建在可编辑自制里的来源（登记在 custom.json）：house = 房规，mine = 自己写的新条目。 */
const CUSTOM = registry.sources as Record<'house' | 'mine', CustomSource>

const brewSetOf = (codeSet: string): SourceEntry => {
  const s = SOURCES.find((x) => x.kind === 'brew' && x.codeSet === codeSet)
  if (!s) throw new Error(`作者程序 ${codeSet} 没有登记自制数据集`)
  return s
}


export class CustomLibrary {
  /** counterpartHint：保存条目后顺带查它在另一种语言里对上了谁（只提示，不写任何东西；P5 G-3b）。 */
  constructor(private readonly lib: LibraryService, private readonly scoped: ScopedLibrary, private readonly db: LibraryDatabase, private readonly counterpartHint?: (ref: EntryRef) => Promise<Counterpart>, private readonly busy: (codeSet: string) => boolean = () => false, private readonly settle: (codeSet: string) => Promise<void> = async () => undefined) {}

  private get manage(): ManageStore {
    return this.scoped.manage
  }

  private async frame(codeSet: string) {
    return this.lib.frameOf(codeSet)
  }

  /** JSON 结构校验：按这套资料集登记的数据格式取校验器（formats.ts），传原文错误带行列，传对象只有路径。 */
  validate(codeSet: string, input: string | unknown): Promise<BrewValidation> {
    return formatOfCodeSet(codeSet).validate(input)
  }

  /** 单条条目在写入前的结构检查：套上"我的资料"的来源信息，只留这一条自己的错（来源信息等外壳的错不算）。 */
  validateEntry(codeSet: string, prop: string, ent: Record<string, unknown>): Promise<SchemaIssue[]> {
    return formatOfCodeSet(codeSet).validateEntry(prop, ent, CUSTOM.mine)
  }

  /** 一类条目的字段说明表（P5.5 B4，给编辑表单用）：按资料集的数据格式取，说明是格式作者的原文。不认识的类别 null。 */
  fields(codeSet: string, prop: string) {
    return fieldTable(this.lib, codeSet, prop)
  }

  // ---- 编辑器草稿（P5.5 B7，custom-drafts.ts）：只存插件管理记录，不碰条目 ----
  /** 存草稿（同键覆盖）；返回键。 */
  saveDraft(input: DraftInput, key?: string) { return saveDraft(this.manage, input, key) }
  drafts(codeSet?: string) { return listDrafts(this.manage, codeSet) }
  draft(key: string) { return this.manage.draft(key) }
  /** 丢掉草稿（保存条目成功后、或用户选「丢掉」）。 */
  discardDraft(key: string) { return this.manage.putDraft(key, null) }

  // ---- 新建条目（P5.5 B5 / B6，custom-new.ts）：类型、起点、空白、模板、文字转条目全从作者代码读 ----
  private get newDeps(): NewEntryDeps {
    return { frame: (codeSet) => this.frame(codeSet), categories: (setId) => this.lib.categories(setId) }
  }

  /** 能新建的类型（作者认为能单独打开、且结构定义收的），每类有哪几种起点。 */
  entryTypes(codeSet: string) {
    return entryTypes(this.newDeps, codeSet)
  }

  /** 空白条目：只放必填字段的空值（B6）。 */
  blankEntry(codeSet: string, prop: string) {
    return blankEntry(codeSet, prop)
  }

  /** 作者新条目模板（作者有这一类的构建器才有；别的类别 null）。 */
  async template(codeSet: string, prop: string): Promise<Record<string, unknown> | null> {
    return (await this.frame(codeSet)).call('entryTemplate', prop)
  }

  /** 作者有哪些文字转条目（转换器编号、转成哪一类、支持的模式、有没有示例）。 */
  async converters(codeSet: string): Promise<ConverterInfo[]> {
    return (await this.frame(codeSet)).call('converters')
  }

  /** 作者某个转换器的示例文字；按战役规则挑版本。 */
  async converterSample(c: CampaignLibrary, id: string, mode: ConvertMode): Promise<string | null> {
    return (await this.frame(c.codeSet)).call('converterSample', id, mode, ruleScopes(c.rule).style)
  }

  /** 文字转条目（作者转换器）；版本风格按战役规则（2014 → 旧版标签）。只转换，不存。 */
  async convert(c: CampaignLibrary, id: string, mode: ConvertMode, text: string) {
    formatOfCampaign(c)
    return (await this.frame(c.codeSet)).call('convertText', id, mode, text, { source: CUSTOM.mine.json, styleHint: ruleScopes(c.rule).style })
  }

  /**
   * 写一条新条目（或改：带作者的 uniqueId 就是改那一条）。来源默认是插件的"我的资料"。
   * 版本（P5.5 R78）：新写的一条归到 rule 这套规则的默认范围（2014 → 5e，2024 → 5.5e），之后用户可改；不给 rule 就是未归类。
   * 作者结构定义允许条目自带版本的类别（背景、种族、职业等），同时把版本写进条目（B1）。
   * 改名（作者编号 = 名字 + 来源，跟着变）：同一次修改里把可编辑自制中用 _copy 指向它的条目改指新名字；
   * 插件的归类、房规链接、各层选的版本搬到新编号。战役记录和存档里的引用不在这里改（读档检查会列出来）。
   */
  async saveEntry(codeSet: string, prop: string, ent: Record<string, unknown>, opts: SaveOptions = {}) {
    const saved = await persist(this.entryDeps, codeSet, prop, ent, { ...opts, pack: opts.pack ?? await this.defaultPack(codeSet), record: true })
    if (opts.pack) await rememberPack(this.packDeps, codeSet, opts.pack)
    return saved
  }

  /** 保存确认页「这次改了哪几项」（G1）：两边经作者 cleanEntity 后逐个顶层字段比；before 为 null（新建）时没有对比。 */
  async changes(codeSet: string, before: Record<string, unknown> | null, after: Record<string, unknown>) {
    if (!before) return []
    const f = await this.frame(codeSet)
    const [was, now] = await Promise.all([f.call('cleanEntity', before), f.call('cleanEntity', after)])
    return fieldChanges(was as Record<string, unknown>, now as Record<string, unknown>)
  }

  /** 存条目时默认选哪个包（G2）：上次用的；没有就是「我的资料」。 */
  async suggestedPack(codeSet: string): Promise<string> {
    return (await lastPack(this.packDeps, codeSet)) ?? this.defaultPack(codeSet)
  }

  /** 编辑 / 覆盖列表（G3）：按书（sources）或按包（packEdits）筛；给战役就连本战役层一起列。 */
  edits(filter: EditFilter = {}, c?: CampaignLibrary | null): Promise<EditRow[]> {
    return listEdits(this.scoped, filter, c)
  }

  /** 【我的库】某个包相关的编辑 / 覆盖：条目来源在包头里的，或选的是这个包自己这一份的。 */
  async packEdits(codeSet: string, id: string, c?: CampaignLibrary | null): Promise<EditRow[]> {
    const pack = (await this.packs(codeSet)).find((p) => p.id === id)
    if (!pack) throw new Error(`【我的库】里没有这个包：${id}`)
    return listEdits(this.scoped, { sources: pack.sources, altIds: [packAltId(pack.id, pack.docIdLocal)] }, c)
  }

  /** 整批改作用范围（Q14）：本战役 / 规则 / 全局。返回新的战役选书设置（本战役层的要调用方写回）。 */
  moveEdits(c: CampaignLibrary, rows: Array<Pick<EditRow, 'level' | 'ref' | 'altId'>>, to: EditLevel) {
    return moveEdits(this.scoped, c, rows, to)
  }

  /** P5.5 B8-6：第一次用到【我的库】时做一次迁移（custom-migrate.ts），做过就跳过。 */
  async ensureMigrated(codeSet: string) {
    const r = await migrateMine({ db: this.db, lib: this.lib, manage: this.manage, houseSource: CUSTOM.house.json }, codeSet)
    await flattenOldCopies({ lib: this.lib, manage: this.manage }, codeSet)
    return r
  }

  /** 不指定包时存进「我的资料」这个包（P5.5 B8-6；以前在可编辑自制里，迁移后是独立的包）；没有就建一个。 */
  private async defaultPack(codeSet: string): Promise<string> {
    const mine = (await this.packs(codeSet)).find((p) => p.own.json.toLowerCase() === CUSTOM.mine.json.toLowerCase())
    if (mine) return mine.id
    return (await createPack(this.packDeps, codeSet, CUSTOM.mine)).id
  }

  private get entryDeps(): EntryDeps {
    return { lib: this.lib, manage: this.manage, mineSource: CUSTOM.mine, validateEntry: (cs, p, e) => this.validateEntry(cs, p, e) }
  }

  /**
   * 这一条在另一种语言里对上了谁（P5 G-3b，只提示，不改任何一边）。P5.5 U2 起保存只写原文、解析在后台，
   * 所以不在保存时返回：等后台解析完（brewQueue.settled / 「更新中」消失）再查。
   */
  async counterpartHintFor(ref: EntryRef) {
    return this.counterpartHint ? this.counterpartHint(ref) : null
  }

  /** 删自己的条目（pack：在【我的库】哪个包里）；每条记一步撤销（撤销 = 用原来的 uniqueId 加回去）。 */
  async deleteEntries(codeSet: string, prop: string, uniqueIds: string[], { pack }: { pack?: string | null } = {}) {
    const r = await remove(this.entryDeps, codeSet, prop, uniqueIds, { record: true, pack: pack ?? await this.defaultPack(codeSet) })
    return { removed: r.value.length, pending: true as const }
  }

  /**
   * P5.5 U3：原文改过、后台还没重新解析完的包（包的身份；房规所在的可编辑自制记作 'editable'），以及后台是否在等 / 在跑。
   * 界面据此标「更新中」；刚存的这一条的原文用 packEntry 取。
   */
  async pending(codeSet: string): Promise<{ packs: string[]; busy: boolean }> {
    const set = SOURCES.find((x) => x.kind === 'brew' && x.codeSet === codeSet)
    const dirty = set ? await this.lib.brewDirty(set.id) : []
    const packs = await this.packs(codeSet)
    const editable = ((await (await this.frame(codeSet)).call('brewDocIndex')) ?? []).find((x) => x.isEditable)?.docIdLocal
    const ids = dirty.map((id) => (id === editable ? 'editable' : packs.find((p) => p.docIdLocal === id)?.id ?? id))
    return { packs: ids, busy: this.busy(codeSet) }
  }

  /** 这一条还能撤销几步（最多 HISTORY_LIMIT）。 */
  async undoSteps(codeSet: string, prop: string, uniqueId: string): Promise<number> {
    return (await this.manage.history(historyKey(codeSet, prop, uniqueId))).length
  }

  /** 撤销这一条最近一步（custom-entries.ts undo）。官方条目的「复原」不走这里（scoped.choose 选回原件）。 */
  undo(codeSet: string, prop: string, uniqueId: string) {
    return undo(this.entryDeps, codeSet, prop, uniqueId)
  }

  // ---- 【我的库】的包（P5.5 B8：一个包 = 作者的一个独立自制包；custom-packs.ts）----
  private get packDeps(): PackDeps {
    return { lib: this.lib, manage: this.manage, packsOf: (id, view) => new BrewPacks(this.lib).list(id, view) }
  }
  /** 建一个空包；rule 给包打版本标签。 */
  async createPack(codeSet: string, src: PackSource, opts: { rule?: string } = {}) { await this.ensureMigrated(codeSet); return createPack(this.packDeps, codeSet, src, opts) }
  /** 【我的库】里的包：身份、自己的来源、每类几条、版本标签。 */
  async packs(codeSet: string) { await this.ensureMigrated(codeSet); return listPacks(this.packDeps, codeSet) }
  /** 改包的显示名 / 缩写（身份不变）。 */
  renamePack(codeSet: string, id: string, patch: { full?: string; abbreviation?: string }) { return renamePack(this.packDeps, codeSet, id, patch) }
  /** 按包导出（作者格式文件）。 */
  exportPack(codeSet: string, id: string) { return exportPack(this.packDeps, codeSet, id) }
  /** 删包（先看卸载影响页）。 */
  deletePack(codeSet: string, id: string) { return deletePack(this.packDeps, codeSet, id) }
  /** 包里的一条（编辑器打开用）：按 uniqueId 或作者编号；hadId=false 时保存要带 replaceHash。 */
  async packEntry(codeSet: string, pack: string, prop: string, key: { uniqueId?: string; hash?: string }) {
    const f = await this.frame(codeSet)
    return f.call('packEntity', await docIdOf(f, pack), prop, key)
  }
  /**
   * 整包选用（P5.5 B8-4）：这个包（例如玩家手册的副本 2）里和别处撞编号的条目，在这一层都用这一份；on=false 取消。
   * 单条的选择仍然优先。本战役层返回新的战役选书设置（调用方写回），别的层直接存。
   */
  async choosePack(c: CampaignLibrary, id: string, { on = true, level = 'campaign' }: { on?: boolean; level?: 'campaign' | ChoiceLevel } = {}) {
    const pack = (await this.packs(c.codeSet)).find((p) => p.id === id)
    if (!pack) throw new Error(`【我的库】里没有这个包：${id}`)
    return this.scoped.choosePack(c, pack.sources, on ? packAltId(pack.id, pack.docIdLocal) : null, level)
  }
  /** 条目换包（编号会变：先用 backend.entryChangeImpact 看影响）。撤销两步。 */
  moveEntries(codeSet: string, prop: string, uniqueIds: string[], fromPack: string, toPack: string) { return moveEntries(this.entryDeps, codeSet, prop, uniqueIds, fromPack, toPack) }

  /**
   * 房规：在可编辑自制里写一条，用作者 _copy 指向原件、只写改动。三种给法：
   *   edited：改完的整条（P5.5 B1，编辑器用）——后端和原件逐个顶层字段比，只存改过的，删掉的写 null；改了名字就用新名字；
   *   mod：作者的 _mod 写法（JSON 高级入口）；entity：整条覆盖（不再跟原件走）。
   * 原件不动；房规挂在原件下当备选。activate：在本战役立即生效（默认），返回改好的战役选书设置。
   */
  async createHouseRule(c: CampaignLibrary, target: EntryRef, edit: { mod?: Record<string, unknown>; entity?: Record<string, unknown>; edited?: Record<string, unknown> }, { activate = true }: { activate?: boolean } = {}) {
    formatOfCampaign(c)
    let stored = await this.lib.storedItem(target.set, target.prop, target.hash)
    // 目标是刚存、后台还没解析完的自制条目（P5.5 U2）：等后台解析完再查一次
    if (!stored && SOURCES.find((x) => x.id === target.set)?.kind === 'brew' && typeof this.lib.brewDirty === 'function' && (await this.lib.brewDirty(target.set)).length) {
      await this.settle(c.codeSet)
      stored = await this.lib.storedItem(target.set, target.prop, target.hash)
    }
    if (!stored) throw new Error(`找不到要改的条目：${refKey(target)}`)
    const base = stored.item as { name?: string; source?: string }
    if (!base.name || !base.source) throw new Error(`原件没有名字或来源，作者的 _copy 指不到它：${refKey(target)}`)
    const baseSource = base.source
    // 房规来源里同名的只能有一条（作者编号 = 名字 + 来源）；同名不同书的加书名缩写区分
    const taken = new Set<string>()
    for (const l of await this.manage.houseRules()) {
      const it = (await this.lib.storedItem(l.house.set, l.house.prop, l.house.hash))?.item as { name?: string } | undefined
      if (l.house.prop === target.prop && it?.name) taken.add(it.name)
    }
    let changes: Record<string, unknown> = {}
    if (edit.edited) {
      const f0 = await this.frame(c.codeSet)
      const [was, now] = await Promise.all([f0.call('cleanEntity', base), f0.call('cleanEntity', edit.edited)])
      changes = topLevelChanges(was as Record<string, unknown>, now as Record<string, unknown>)
      if (!Object.keys(changes).length) throw new Error('和原件一样，没有改动，不用存房规')
    }
    const { name: renamedTo, ...fieldChanges } = changes
    const want = typeof renamedTo === 'string' && renamedTo ? renamedTo : base.name
    const name = taken.has(want) ? `${want}（${base.source}）` : want
    const ent = edit.entity
      ? { ...edit.entity, name, source: CUSTOM.house.json }
      : { ...fieldChanges, name, source: CUSTOM.house.json, _copy: { name: base.name, source: baseSource, ...(edit.mod ? { _mod: edit.mod } : {}) } }
    const result = await this.lib.writeAuthor(c.codeSet, 'custom-houserule', async (view) => {
      const f = await this.lib.frameOf(c.codeSet, view)
      await f.call('editableEnsureSource', CUSTOM.house)
      if (!edit.entity) await f.call('editableAddDependencies', { [target.prop]: [baseSource] })
      const put = await f.call('editablePut', target.prop, ent)
      const editable = ((await f.call('brewDocIndex')) ?? []).find((x) => x.isEditable)?.docIdLocal
      return { value: put, touched: editable ? [editable] : [] }
    })
    const saved = result.value
    if (!saved.hash) throw new Error('作者算不出房规条目的编号')
    const house: EntryRef = { set: brewSetOf(c.codeSet).id, prop: target.prop, hash: saved.hash }
    await this.manage.setAssignment(entryUnit(house), { scopes: [...ruleScopes(c.rule).defaultScopes], global: false })
    await this.manage.linkHouseRule({ house, target })
    await this.manage.pushHistory(historyKey(c.codeSet, target.prop, saved.uniqueId), { at: Date.now(), prop: target.prop, before: null, link: { house, target } })
    const altId = `house:${saved.hash}`
    return { house, altId, uniqueId: saved.uniqueId, changed: Object.keys(changes), pending: true as const, campaign: activate ? await this.scoped.choose(c, target, altId) : c }
  }

  /** 删房规：作者删条 + 去掉链接；选过它的地方自动回到原件（生效版本会标"选过的备选不在了"）。 */
  async deleteHouseRule(codeSet: string, house: EntryRef, uniqueId: string) {
    const link = (await this.manage.houseRules()).find((l) => refKey(l.house) === refKey(house))
    await remove(this.entryDeps, codeSet, house.prop, [uniqueId], { record: true, ...(link ? { link } : {}) })
    await this.manage.unlinkHouseRule(house)
    return { pending: true as const }
  }

  /**
   * 存入【我的库】= 复制成我的（P5.5 B8-3，驾驶员 2026-11-13 定）：一本书 / 一个包整个复制进【我的库】成为一个新的可改的包，
   * 同一本可以复制多份；一条复制进你选的包（pack 必给）。做法见 custom-copy.ts。结构问题只提示不拦截。
   */
  async saveToMine(codeSet: string, target: { kind: 'source'; source: string } | { kind: 'entry'; ref: EntryRef } | { kind: 'pack'; docIdLocal: string }, opts: { pack?: string; rule?: string } = {}) {
    await this.ensureMigrated(codeSet)
    const deps: CopyDeps = { ...this.packDeps, db: this.db, lib: this.lib, exportBrew: (cs, id) => this.exportBrew(cs, id), entries: this.entryDeps }
    if (target.kind === 'entry') {
      if (!opts.pack) throw new Error('选一个【我的库】里的包，把这一条存进去')
      const saved = await copyEntryToPack(deps, codeSet, target.ref, opts.pack, opts.rule ? { rule: opts.rule } : {})
      await rememberPack(this.packDeps, codeSet, opts.pack)
      this.scoped.reset()
      return { kind: 'entry' as const, pack: opts.pack, ...saved }
    }
    const made = await copyToMine(deps, codeSet, target)
    this.scoped.reset()
    return { kind: 'pack' as const, ...made }
  }

  /** 导出一个包：作者格式原样（文件名 + 内容）。 */
  async exportBrew(codeSet: string, docIdLocal: string) {
    try { return await (await this.frame(codeSet)).call('brewExport', docIdLocal) }
    catch {
      // 官方资料没装时作者窗口开不起来：直接读作者存储原文，包仍是作者格式（M5）
      const view = await this.lib.currentView()
      const raw = (await view.kvGet(codeSet, 'HOMEBREW_2_STORAGE')) as Array<{ head?: Record<string, unknown>; body?: unknown }> | null
      const hit = (raw ?? []).find((d) => String(d.head?.docIdLocal ?? '') === docIdLocal)
      return hit ? { filename: (hit.head?.filename as string | undefined) ?? `${docIdLocal}.json`, body: hit.body } : null
    }
  }

  /** 完整备份：自制（作者格式原样）+ 范围设置 + 房规链接；官方数据不进备份（custom-backup.ts）。 */
  exportBackup(): Promise<Record<string, string>> { return exportBackup(this.backupDeps) }
  /** 完整备份恢复：先按作者包管理器导入自制，再恢复范围设置与房规链接。 */
  importBackup(files: Record<string, string>) { return importBackup(this.backupDeps, files) }
  /** 范围设置单独一个文件（可带可不带）：自建范围 + 归类。只给 units 就只导这些。 */
  exportScopes(units?: string[]): Promise<ScopeConfig> { return exportScopes(this.backupDeps, units) }
  /** 导入范围设置：自建范围补进来，归类按文件覆盖。 */
  importScopes(cfg: ScopeConfig) { return importScopes(this.backupDeps, cfg) }

  private get backupDeps(): BackupDeps {
    return { lib: this.lib, manage: this.manage, reset: () => this.scoped.reset() }
  }

  /**
   * 导入预览：在隔离的作者存储里（复制一份现有的）让作者把文件装上，看会新增多少条、有多少条和已有的同编号（会挂成备选）、
   * 作者报了什么错。真实存储不动；确认后再调 LibraryService.brewImport。
   */
  async previewImport(codeSet: string, files: Array<{ name: string; text: string }>) {
    const set = brewSetOf(codeSet)
    const format = formatOfCodeSet(codeSet)
    // 先认格式（P5.5 A3）：不是这种格式的不交给作者试装，单独列出原因
    const { accepted, rejected } = splitRecognized(format, files)
    files = accepted
    // P5.5 B8-7：作者按来源编号组合认包，身份相同的已有包会被整个替换，先列出来（import-replace.ts）
    const replaces = importReplaces(await (await this.frame(codeSet)).call('brewDocIndex'), files)
    const scope = `${codeSet}:preview:${Date.now()}`
    const view = await this.lib.currentView()
    const merged = new Map<string, unknown>()
    for (const s of [...(await view.kvScopes(codeSet))].reverse()) for (const row of await this.db.kv.where('scope').equals(s).toArray()) { if (row.deleted) merged.delete(row.key); else merged.set(row.key, row.value) }
    await this.db.kv.bulkPut([...merged].map(([key, value]) => ({ scope, key, value })))
    const f = await this.lib.openFrameIn(codeSet, scope, view)
    try {
      const before = new Set((await f.call('brewDocIndex')).map((d) => d.docIdLocal))
      const added = await f.call('brewAddFiles', files)
      const docs: DocIndex[] = await f.call('brewDocIndex')
      const official = officialSourceOf(codeSet)
      const officialHashes: Record<string, Set<string>> = {}
      for (const prop of new Set(docs.flatMap((d) => Object.keys(d.props)))) {
        const rec = await view.derivedGet(parsedKey(official.id, prop))
        if (rec) officialHashes[prop] = new Set((rec.value as ParsedProp).hashes.filter((h): h is string => !!h))
      }
      const fresh = docs.filter((d) => !before.has(d.docIdLocal))
      const freshIds = new Set(fresh.map((d) => d.docIdLocal))
      const collisions = findCollisions(officialHashes, docs).filter((c) => c.others.some((id) => freshIds.has(id)))
      return {
        set: set.id,
        files: fresh.map((d) => ({ filename: d.filename, entries: Object.values(d.props).reduce((n, hs) => n + hs.filter(Boolean).length, 0) })),
        newEntries: fresh.reduce((n, d) => n + Object.values(d.props).reduce((m, hs) => m + hs.filter(Boolean).length, 0), 0) - collisions.length,
        alternatives: collisions.map((c) => ({ prop: c.prop, hash: c.hash, base: c.base.kind === 'official' ? 'official' : c.base.docIdLocal })),
        notJson: added.value.notJson,
        rejected,
        replaces,
        authorErrors: added.errors,
        structure: await Promise.all(files.map(async (file) => ({ name: file.name, ...(await format.validate(file.text)) }))),
      }
    } finally {
      f.close()
      await this.db.kv.where('scope').anyOf(scope, `${scope}:local`).delete()
    }
  }
}
