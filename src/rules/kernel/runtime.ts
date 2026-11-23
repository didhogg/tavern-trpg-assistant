/* eslint-disable @typescript-eslint/no-explicit-any -- 内核命令结果原样转交 */
// P3 收尾：结算内核接进插件服务入口。一个战役一个结算小窗（世界互不相见），按需打开、复用、关闭。
// 每个人物记住“重建基准”（刚建好或刚重建、还没叠状态的样子），存档时用它把小窗里的人物拆回
// 引用 / 选择 / 状态差别（官方 Advancement#reverse 记选择）。界面只经服务入口用这里，不直接碰小窗。
import type { KernelActorCompact } from '../../core/saves/kernel'
import type { KernelRefMapper } from '../../core/saves/split'
import type { FileProvider } from '../../library/files'
import type { ScopedLibrary } from '../../library/scoped'
import type { LibraryService } from '../../library/service'
import type { LibraryRevisionStore, LibraryView } from '../../library/revision'
import type { CampaignLibrary, EntryRef } from '../../library/scopes'
import type { KernelActor, KernelDataVersion } from '../../schemas/kernel'
import { refKey } from '../../core/saves/split'
import { executed, type KernelSession } from './host'
import { PreparedActors, type OffChoices } from './prepared'
import { openKernel, prepareKernelBrews } from './open'
import { kernelInput } from './input'
import { excludedBrewReason } from './brews'
import type { KernelBrewReport } from './frame/brew-input'
import { hashValue, sha256Hex } from '../../core/hash'
import { KernelCache, kernelBaseKey, kernelFilesVersion, kernelLangOf, wrapKernelSession } from './cache'
import type { LibraryDatabase } from '../../library/db'
import { actorData, compactActor, rebuildActor, refMapperFor, type RebuildInput, type RebuildResult } from './rebuild'
import { kernelEntryOf } from './entry'
import { resolveBuildOptions, traitItemScope, type BuildOptionPlan, type BuildOptionsResult } from './resolve-build-options'
import type { BuildPick } from './frame/commands-level'
import type { SheetEdit } from './frame/commands-sheet'
import { checkAbilities, type AbilityPlan, type AbilityView } from './ability-rules'
import { pairsSource, type PairsOf } from './sidecar'
import { display, type DisplayResult } from './display'
import { namerFor } from './naming'
import { legendaryGroupRefs } from './related-entries'
import { kernelDataSource } from '../../library/sources'
import { checkStarting, startingOptions, type StartingResult, type StartingSelection } from './starting-options'
export type { BuildPick }
/** 玩家的选择按条目排：picks[i] 是第 i 件条目（和 items 同序）上做的选择；内部换成按条目引用的键给小窗。 */
const picksByKey = (items: EntryRef[], picks?: BuildPick[][]): Record<string, BuildPick[]> => Object.fromEntries(items.map((ref, i) => [refKey(ref), picks?.[i] ?? []]))

/** 建卡选项里一件条目的结果：官方进阶的步骤（含候选）+ 作者数据里的额外必选项。 */
export type BuildAbilities = AbilityView
export type { BuildOptionsItem } from './resolve-build-options'

/** Foundry 世界编号只能用字母、数字、短横线、下划线；战役的 ownerKey 形如 char:角色卡.png，按它算一个稳定编号。 */
export function worldIdOf(ownerKey: string): string {
  return `trpg-${sha256Hex(ownerKey).slice(0, 16)}`
}

export interface KernelRuntimeDeps {
  pluginRoot: URL
  files: FileProvider
  scoped: ScopedLibrary
  service: LibraryService
  revisions: LibraryRevisionStore
  /** 小窗挂在哪里（隐藏 iframe 的父元素）。 */
  container: () => HTMLElement
  /** 本战役的规则与选书（从存档的内核段读）。 */
  /** usedActorIds：存档用过的人物编号（core/saves/kernel-roster.ts usedActorIds），开机后登记进小窗。 */
  campaignOf: (ownerKey: string) => Promise<{ rule: string; library: CampaignLibrary; title: string; usedActorIds?: string[] }>
  fetchImpl?: typeof fetch
  timeoutMs?: number
  /** 换算缓存（S3）：本地可丢副本；不给就不缓存。 */
  cache?: { db: LibraryDatabase; dataVersion: (at?: LibraryView) => Promise<KernelDataVersion> }
  /** 这个战役有没有绑定结算内核（S5 进入战役时判断）。 */
  hasKernel?: (ownerKey: string) => Promise<boolean>
}

interface Open {
  session: KernelSession
  rule: string
  /** 每个人的完整基准 / 取下后视图 / 原始选择（prepared.ts）。 */
  bases: PreparedActors
  seeds: Map<string, string>
  boot: unknown
  bootMs: number
  brews: KernelBrewReport
  brewFingerprint: string | undefined
  brewIssue: (ref: EntryRef, altId: string | null, source: string | null) => string | null
  view: LibraryView
  cache: KernelCache | null
  cacheBase: string
  /** 小窗语言码：换算缓存行记在这个语言名下，清理按语言分开。 */ cacheLang: string
  dataVersion: () => Promise<KernelDataVersion>
  /** 显示文字的中英对照：条目 + 同编号的补充记录（sidecar.ts）。 */ pairsOf: PairsOf
}

export class KernelRuntime {
  private readonly open = new Map<string, Promise<Open>>()

  constructor(private readonly deps: KernelRuntimeDeps) {}

  /** 打开（或复用）本战役的结算小窗。 */
  async session(ownerKey: string): Promise<{ session: KernelSession; boot: unknown; bootMs: number; brews: KernelBrewReport }> {
    const o = await this.get(ownerKey)
    return { session: o.session, boot: o.boot, bootMs: o.bootMs, brews: o.brews }
  }

  private get(ownerKey: string): Promise<Open> {
    const existing = this.open.get(ownerKey)
    if (existing) return existing
    const opening = (async () => {
      const campaign = await this.deps.campaignOf(ownerKey)
      const started = performance.now()
      const view = await this.deps.revisions.published()
      const prepared = await prepareKernelBrews(this.deps.service, view, campaign.library.codeSet)
      const input = await kernelInput({ pluginRoot: this.deps.pluginRoot, rule: campaign.rule, codeSet: campaign.library.codeSet, world: { id: worldIdOf(ownerKey), title: campaign.title }, fetchImpl: this.deps.fetchImpl })
      const { session, boot, report, brewFingerprint } = await openKernel({ ...this.deps, view, input, ...prepared, container: this.deps.container() })
      // 先登记存档用过的编号，再做任何建人：装回存档的人是另一路（load），可能还没做完或装不回（驾驶员 2026-11-23：刷新后第一次加人“存档里已经有这个人物”）
      if (campaign.usedActorIds?.length) await session.call('reserveActorIds', campaign.usedActorIds)
      const brewIssue: Open['brewIssue'] = (ref, altId, source) => excludedBrewReason(prepared.brews, report.excluded, ref, altId, source)
      const cache = this.deps.cache ? new KernelCache(this.deps.cache.db) : null
      const cacheBase = input.cacheKey ?? hashValue(input)
      const cacheLang = kernelLangOf(input.language)
      // 换算缓存钥匙按小窗打开时那一版资料算：开着时补装了书，结果仍记旧版本名下（新版本由后台换算或重开后补上）。
      const versionOfView = async (): Promise<KernelDataVersion> => this.deps.cache ? this.deps.cache.dataVersion(view) : { official: '', brews: {} }
      const wrapped = cache ? wrapKernelSession(session, cache, cacheBase, versionOfView, campaign.rule, brewFingerprint, cacheLang) : session
      return { session: wrapped, rule: campaign.rule, bases: new PreparedActors(), seeds: new Map(), boot, brews: report, brewFingerprint, brewIssue, bootMs: Math.round(performance.now() - started), cache, cacheBase, cacheLang, view, dataVersion: versionOfView, pairsOf: pairsSource({ files: this.deps.files, view, codeSet: campaign.library.codeSet }) }
    })()
    this.open.set(ownerKey, opening)
    opening.catch(() => { if (this.open.get(ownerKey) === opening) this.open.delete(ownerKey) })
    return opening
  }

  /** 进入战役（S5）：有绑定才开机；同一时刻只保留这一个战役的小窗。 */
  async enter(ownerKey: string): Promise<void> {
    if (this.deps.hasKernel && !(await this.deps.hasKernel(ownerKey))) {
      await this.closeAllExcept(null)
      return
    }
    await this.closeAllExcept(ownerKey)
    await this.get(ownerKey)
  }

  /** 关掉除 keep 外的所有战役小窗。 */
  async closeAllExcept(keep: string | null): Promise<void> {
    for (const ownerKey of [...this.open.keys()]) {
      if (ownerKey !== keep) await this.close(ownerKey)
    }
  }

  /** 关掉本战役的小窗（切换聊天、读档前）；记住的基准一起丢掉。 */
  async close(ownerKey: string): Promise<void> {
    const opening = this.open.get(ownerKey)
    if (!opening) return
    this.open.delete(ownerKey)
    const o = await opening
    o.session.close()
  }

  /** 把小窗里这个人物现在的样子记为重建基准（直接用小窗命令建的人，例如测试构造的旧存档人物）。 */
  async remember(ownerKey: string, actorId: string): Promise<void> {
    const o = await this.get(ownerKey); const data = await actorData(o.session, actorId)
    if (!data) throw new Error(`结算小窗里没有这个人物：${actorId}`)
    o.bases.set(actorId, data)
  }

  /** 这个人物的重建基准（全是自动值）；没有记过返回 null。 */
  async baseOf(ownerKey: string, actorId: string): Promise<Record<string, unknown> | null> {
    return (await this.get(ownerKey)).bases.view(actorId)
  }

  /**
   * 按存档把小窗里的人物退回去（撤销、预览后取消用）：先删掉小窗里的这个人；
   * actor 为 null 表示存档里已经没有他（撤销"加人"）。有基准时用基准 + 状态差别直接建（不重新取条目），没有才整份重建。
   */
  async restore(ownerKey: string, actorId: string, actor: (KernelActor & { base?: Record<string, unknown> }) | null): Promise<RebuildResult | null> {
    const existing = this.open.get(ownerKey)
    if (!existing) return null
    const o = await existing
    const deleted = await o.session.call('deleteActors', [actorId])
    if (deleted.status !== 'complete') throw new Error(`小窗里删不掉人物 ${actorId}：${deleted.error ?? deleted.status}`)
    if (!actor) { o.bases.delete(actorId); o.seeds.delete(actorId); return null }
    const base = o.bases.base(actorId) ?? actor.base ?? null
    if (!base) return this.rebuild(ownerKey, actor)
    const call = await o.session.call('createActorsFromBase', [{ base, id: actorId, state: actor.state, off: actor.off }])
    const row = (call.result as Array<{ id?: string; data?: Record<string, unknown>; view?: Record<string, unknown>; offChoices?: OffChoices }> | null)?.[0]
    if (call.status !== 'complete' || !row?.id || !row.data) return { status: 'error', error: call.error ?? `退回状态：${call.status}`, detail: call }
    o.bases.set(row.id, base, row.view, row.offChoices, o.bases.isStored(row.id) || !!actor.base)
    return { status: 'complete', id: row.id, data: row.data, base, view: row.view }
  }

  /** 新建人物：调用方只交引用与选择；条目由【库】取，种子与建卡在内核里完成。 */
  async buildCharacter(ownerKey: string, plan: { name: string; items: EntryRef[]; equipment?: EntryRef[]; choices?: Record<string, unknown[]>; picks?: BuildPick[][]; blank?: boolean; abilities?: AbilityPlan; starting?: Record<string, StartingSelection>; requireExtras?: boolean }): Promise<{ status: string; id?: string; seed?: string; error?: string; detail?: unknown; noEnglish?: EntryRef[] }> {
    const o = await this.get(ownerKey)
    if (plan.abilities) {
      // 方式的规则（标准数组 / 购点）在这里查；手填的范围由小窗按官方上限查
      const check = checkAbilities(plan.abilities, Object.keys(plan.abilities.base), Infinity)
      if (!check.ok) return { status: 'invalid', error: `属性值不合「${plan.abilities.method}」的规则`, detail: check }
    }
    if (plan.requireExtras) {
      const preview = await this.buildOptions(ownerKey, plan)
      if (preview.status !== 'complete' || !preview.items) return { status: preview.status, error: preview.error, detail: preview.detail }
      if (preview.extraIssue) return { status: 'pending', error: preview.extraIssue }
    }
    let startingExcluded: Record<string, string[]> | undefined
    if (plan.starting) {
      const shown = await this.startingEquipment(ownerKey, { items: plan.items })
      if (shown.status !== 'complete') return { status: shown.status, error: shown.error }
      const checked = checkStarting(shown.sections ?? [], plan.starting)
      if (checked.error) return { status: 'invalid', error: checked.error }
      startingExcluded = checked.excluded
    }
    const rows = await this.entries(ownerKey, [...plan.items, ...(plan.equipment ?? [])])
    if (rows.status !== 'complete') return { status: rows.status, error: rows.error, detail: rows }
    const byKey = new Map(rows.rows.map((row) => [refKey(row.ref), row]))
    const items = plan.items.map((ref) => ({ prop: ref.prop, refKey: refKey(ref), entry: byKey.get(refKey(ref))!.entry }))
    const equipment = (plan.equipment ?? []).map((ref) => ({ prop: ref.prop, refKey: refKey(ref), entry: byKey.get(refKey(ref))!.entry }))
    const result = await o.session.call('buildCharacter', { name: plan.name, items, equipment, choices: plan.choices ?? {}, picks: picksByKey(plan.items, plan.picks), blank: plan.blank, starting: plan.starting, startingExcluded, traitScope: await traitItemScope(this.deps.scoped, await this.library(ownerKey), o.view, rows.rows) })
    if (result.status !== 'complete' || !result.result?.id) return { status: result.status, error: result.error ?? result.result?.step?.error ?? `建卡状态：${result.status}`, detail: result }
    o.seeds.set(result.result.id, result.result.seed)
    const data = await actorData(o.session, result.result.id)
    if (data) o.bases.set(result.result.id, data)
    // 基础值：放在重建基准（全是自动值）之后，作为对属性值的改动存进存档（和手改一样，「回到自动」就回到 初值 + 种族加成）
    if (plan.abilities) {
      const initial = result.result.initial as Record<string, number>
      const edits = Object.entries(plan.abilities.base).filter(([k, v]) => typeof v === 'number' && k in initial)
        .map(([k, v]): SheetEdit => ({ kind: 'set', path: `system.abilities.${k}.value`, value: ((data as any)?.system?.abilities?.[k]?.value ?? initial[k]) + (v as number) - initial[k] }))
      if (edits.length) {
        const done = await o.session.call('edit', result.result.id, edits)
        if (done.status !== 'complete') return { status: done.status, error: done.error ?? `写入基础值状态：${done.status}`, detail: done }
      }
    }
    return { status: 'complete', id: result.result.id, seed: result.result.seed, noEnglish: rows.noEnglish, ...(result.result.missingTraits?.length ? { detail: { missingTraits: result.result.missingTraits } } : {}) }
  }

  /** 起始装备选项（P6）：已选的职业 / 背景写着的起始装备 → 每组选项、类别候选、金币骰式；带 starting（玩家现在的选择）时多给预演（物品、钱）。 */
  async startingEquipment(ownerKey: string, plan: { items: EntryRef[]; starting?: Record<string, StartingSelection> }): Promise<StartingResult> {
    const o = await this.get(ownerKey)
    const rows = await this.entries(ownerKey, plan.items)
    if (rows.status !== 'complete') return { status: rows.status, error: rows.error }
    return startingOptions({ rows: rows.rows, pairs: await o.pairsOf(rows.rows), call: (fn, ...args) => (o.session.call as any)(fn, ...args), scoped: this.deps.scoped, library: await this.library(ownerKey), service: this.deps.service }, plan.starting)
  }

  /**
   * 建卡选项（P6）：已选的条目（按顺序放进空白人物，带玩家已做的选择 picks）→ 每件条目现在要玩家选的事（官方进阶算候选）
   * + 作者数据里的额外必选项（子职业 / 专长 / 可选特性，带候选）。预览用的人物不进存档。
   */
  async buildOptions(ownerKey: string, plan: BuildOptionPlan): Promise<BuildOptionsResult> {
    const o = await this.get(ownerKey)
    const rows = await this.entries(ownerKey, plan.items)
    if (rows.status !== 'complete') return { status: rows.status, error: rows.error }
    return resolveBuildOptions({ ...o, scoped: this.deps.scoped, service: this.deps.service, library: await this.library(ownerKey) }, plan, rows.rows, picksByKey(plan.items, plan.picks))
  }

  /** 给已有人物加条目；调用方只交引用。 */
  async addToActor(ownerKey: string, actorId: string, refs: EntryRef[]): Promise<{ status: string; result?: any; error?: string; detail?: unknown; noEnglish?: EntryRef[] }> {
    const o = await this.get(ownerKey)
    const rows = await this.entries(ownerKey, refs)
    if (rows.status !== 'complete') return { status: rows.status, error: rows.error, detail: rows }
    const result = await o.session.call('addToActor', actorId, rows.rows.map((row) => ({ prop: row.ref.prop, refKey: refKey(row.ref), entry: row.entry })))
    if (!executed(result.status)) return { status: result.status, error: result.error ?? `加条目状态：${result.status}`, detail: result }
    // B′ 人物的完整基准是存档里固定那份：新条目算后来的改动（整份存进状态），不进基准
    if (o.bases.has(actorId) && !o.bases.isStored(actorId) && Array.isArray(result.result?.added)) {
      const current = await actorData(o.session, actorId)
      const byId = new Map(((current?.items ?? []) as any[]).map((item: any) => [item._id, item]))
      o.bases.addItems(actorId, result.result.added.map((item: any) => byId.get(item._id) ?? item))
    }
    return { status: 'complete', result: result.result, noEnglish: rows.noEnglish }
  }

  /** T5：批量建怪物/NPC/载具/物件；单个也走这里。换算结果由会话缓存读写。 */
  async createActors(ownerKey: string, refs: EntryRef[]): Promise<{ status: string; actors?: any[]; names?: Array<string | null>; error?: string; detail?: unknown; noEnglish?: EntryRef[] }> {
    const o = await this.get(ownerKey)
    const rows = await this.entries(ownerKey, refs)
    if (rows.status !== 'complete') return { status: rows.status, error: rows.error, detail: rows }
    const prepared = []
    for (const row of rows.rows) {
      const imported = await o.session.call('importForBuild', row.ref.prop, row.entry)
      if (imported.status !== 'complete' || !imported.result) return { status: imported.status, error: imported.error ?? `换算状态：${imported.status}`, detail: imported }
      prepared.push({ prop: row.ref.prop, entry: row.entry, data: imported.result })
    }
    const result = await o.session.call('createActorsBatch', prepared)
    if (result.status !== 'complete') return { status: result.status, error: result.error ?? `批量建状态：${result.status}`, detail: result }
    // 刚建好的样子就是重建基准（之后写进存档时按它拆差别）
    for (const row of result.result as Array<{ id: string; data: Record<string, unknown> }>) o.bases.set(row.id, row.data)
    return { status: 'complete', actors: result.result, names: rows.rows.map((r) => r.name), noEnglish: rows.noEnglish }
  }

  /** 引用 → 【库】条目（中文战役交英文对照，zh 带同一编号的中文条目给 locale.ts 换显示文字），建卡/加条目/批量建共用。 */
  private async entries(ownerKey: string, refs: EntryRef[]): Promise<{ status: 'complete'; rows: Array<{ ref: EntryRef; entry: unknown; zh: unknown | null; name: string | null }>; noEnglish: EntryRef[] } | { status: 'missing' | 'error'; error: string; rows: []; noEnglish: [] }> {
    const lib = await this.library(ownerKey)
    const existing = this.open.get(ownerKey)
    const opened = existing ? await existing : null
    const view = opened?.view ?? await this.deps.revisions.published()
    const fetched = await this.deps.scoped.fetch(lib, refs, view)
    const rows = []
    const noEnglish: EntryRef[] = []
    for (let i = 0; i < refs.length; i++) {
      const got = fetched[i]
      if (!got.ok) return { status: 'missing', error: `取不到 ${refs[i].hash}：${got.reason}`, rows: [], noEnglish: [] }
      const issue = opened?.brewIssue(got.ref, got.version.altId, got.source)
      if (issue) return { status: 'error', error: issue, rows: [], noEnglish: [] }
      const k = await kernelEntryOf(this.deps.scoped, lib.codeSet, got.ref as EntryRef, got.item, got.version.altId, view)
      if (k.noEnglish) noEnglish.push(refs[i])
      // 显示名取库条目自己的名字（中文战役是中文）；交给结算小窗的是英文对照，建出来的人默认叫英文名
      const shown = (got.item as { name?: unknown } | null)?.name
      rows.push({ ref: refs[i], entry: k.entry, zh: k.entry === got.item ? null : got.item, name: typeof shown === 'string' && shown.trim() ? shown : null })
    }
    return { status: 'complete', rows, noEnglish }
  }

  /** 按存档里的引用 / 选择 / 状态把一个人物重建进小窗（内部走批量入口）。 */
  async rebuild(ownerKey: string, actor: RebuildInput, library?: CampaignLibrary): Promise<RebuildResult> {
    return (await this.rebuildMany(ownerKey, [actor], library))[0]
  }

  /**
   * 读档：人物重建基准全部命中时，一次 createDocuments 批量建（保留编号），再叠状态差别；
   * 某个没命中，只给这个人物重新换算（S2 保证编号一致）并把基准存回缓存。
   */
  async rebuildMany(ownerKey: string, actors: RebuildInput[], library?: CampaignLibrary): Promise<RebuildResult[]> {
    const o = await this.get(ownerKey)
    const lib = library ?? await this.library(ownerKey)
    const version = o.cache ? await o.dataVersion() : null
    const results: RebuildResult[] = new Array(actors.length)
    const hits: Array<{ index: number; base: Record<string, unknown> }> = []
    const misses: number[] = []
    for (let i = 0; i < actors.length; i++) {
      // B′ 人物（存档里有完整数据）直接建回；其余先查换算缓存，没中按引用重建
      const stored = actors[i].base
      if (stored) { hits.push({ index: i, base: stored }); continue }
      if (!o.cache || !version) { misses.push(i); continue }
      const base = await o.cache.get(await kernelBaseKey({ base: o.cacheBase, brewFingerprint: o.brewFingerprint, dataVersion: version, actor: actors[i] })) as Record<string, unknown> | null
      if (base) hits.push({ index: i, base }); else misses.push(i)
    }
    if (hits.length) {
      const call = await o.session.call('createActorsFromBase', hits.map((h) => ({ base: h.base, ...(actors[h.index].id ? { id: actors[h.index].id } : {}), state: actors[h.index].state, off: actors[h.index].off })))
      const list = (call.result ?? []) as Array<{ id?: string; data?: Record<string, unknown>; base?: Record<string, unknown>; view?: Record<string, unknown>; offChoices?: OffChoices }>
      if (call.status !== 'complete' || list.length !== hits.length) {
        for (const h of hits) results[h.index] = { status: 'error', error: call.error ?? `批量重建状态：${call.status}`, detail: call }
      } else {
        hits.forEach((h, j) => {
          const row = list[j]
          if (!row?.id || !row.data) { results[h.index] = { status: 'error', error: '批量重建没有交回人物数据' }; return }
          results[h.index] = { status: 'complete', id: row.id, data: row.data, base: row.base ?? h.base, view: row.view }
          o.bases.set(row.id, row.base ?? h.base, row.view, row.offChoices, !!actors[h.index].base)
        })
      }
    }
    for (const index of misses) {
      const actor = actors[index]
      const result = await rebuildActor({ lib: this.deps.scoped, session: o.session, library: lib, actor, view: o.view, brewIssue: o.brewIssue })
      results[index] = result
      if (result.status === 'complete') {
        if (!result.id || !result.base) throw new Error(`重建 ${actor.name} 没有交回人物编号或重建基准`)
        o.bases.set(result.id, result.base, result.view, result.offChoices)
        o.seeds.set(result.id, result.seed ?? actor.seed ?? actor.name)
        if (o.cache && version) {
          const key = await kernelBaseKey({ base: o.cacheBase, brewFingerprint: o.brewFingerprint, dataVersion: version, actor })
          await o.cache.put(key, result.base, { rule: o.rule, base: o.cacheBase, official: kernelFilesVersion(version), lang: o.cacheLang })
        }
      }
    }
    return results
  }

  /** 唯一显示出口（display.ts）用在本战役的小窗结果上；refs = 文字出自哪些条目。entries = 交给小窗定位用的英文条目，show 按同一顺序取本战役语言版。 */
  async displayFor(ownerKey: string, refs: EntryRef[]): Promise<{ entries: unknown[]; show: <T>(value: T) => Promise<DisplayResult<T>> }> {
    const [o, library] = await Promise.all([this.get(ownerKey), this.library(ownerKey)])
    const base = refs.length ? await this.entries(ownerKey, refs).then((got) => got.status === 'complete' ? got.rows : []) : []
    const groups = await legendaryGroupRefs(this.deps.service, library.codeSet, o.view, base)
    const rows = [...base, ...(groups.length ? await this.entries(ownerKey, groups).then((got) => got.status === 'complete' ? got.rows : []) : [])]
    const ctx = { translate: library.codeSet !== kernelDataSource().codeSet, pairs: await o.pairsOf(rows), entries: rows, namer: await namerFor(this.deps.scoped, library), author: this.deps.service.texts.reader(library.codeSet) }
    return { entries: rows.map((r) => r.entry), show: (value) => display(value, ctx) }
  }
  /** 本战役现在的选书（每次现读，关书/开书后立刻生效）。 */
  private async library(ownerKey: string): Promise<CampaignLibrary> {
    return (await this.deps.campaignOf(ownerKey)).library
  }
  /** 作者编号（Plutonium 标记）→ 本战役【库】条目。 */
  async mapRef(ownerKey: string): Promise<KernelRefMapper> {
    return refMapperFor(this.deps.scoped, await this.library(ownerKey))
  }

  /** 把小窗里的人物拆回存档要的引用 / 选择 / 状态差别（内核存档写入前调用）。 */
  async compact(ownerKey: string, ids: string[]): Promise<KernelActorCompact[]> {
    const o = await this.get(ownerKey)
    const library = await this.library(ownerKey)
    const out: KernelActorCompact[] = []
    for (const id of ids) {
      const base = o.bases.view(id)
      const full = o.bases.base(id)
      if (!base || !full) throw new Error(`人物 ${id} 没有重建基准：先建卡后记住，或从存档重建`)
      const current = await actorData(o.session, id)
      if (!current) throw new Error(`结算小窗里没有这个人物：${id}`)
      const stored = o.bases.isStored(id) // B′ 人物读档按完整数据建回，不需要成长选择
      const captured = stored ? { status: 'complete', result: {} } : await o.session.call('captureChoices', id)
      if (!executed(captured.status)) throw new Error(`记下 ${id} 的成长选择失败：${captured.error ?? captured.status}`)
      const name = typeof current.name === 'string' ? current.name : id
      // 差别相对取下后的视图算；取下时动过的成长用原始选择（不让「当前没应用」写成「原来没选」）
      const compact = await compactActor({ lib: this.deps.scoped, library, actor: { id, name }, seed: o.seeds.get(id) ?? name, current, base, choices: o.bases.protect(id, captured.result ?? {}), stored })
      if (o.cache && !stored) {
        const version = await o.dataVersion()
        const key = await kernelBaseKey({ base: o.cacheBase, brewFingerprint: o.brewFingerprint, dataVersion: version, actor: compact })
        await o.cache.put(key, full, { rule: o.rule, base: o.cacheBase, official: kernelFilesVersion(version), lang: o.cacheLang })
      }
      out.push(compact)
    }
    return out
  }
}
