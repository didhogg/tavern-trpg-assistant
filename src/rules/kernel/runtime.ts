/* eslint-disable @typescript-eslint/no-explicit-any -- 内核命令结果原样转交 */
// P3 收尾：结算内核接进插件服务入口。一个战役一个结算小窗（世界互不相见），按需打开、复用、关闭。
// 每个人物记住“重建基准”（刚建好或刚重建、还没叠状态的样子），存档时用它把小窗里的人物拆回
// 引用 / 选择 / 状态差别（官方 Advancement#reverse 记选择）。界面只经服务入口用这里，不直接碰小窗。
import type { KernelActorCompact } from '../../core/saves/kernel'
import type { KernelRefMapper } from '../../core/saves/split'
import type { FileProvider } from '../../library/files'
import type { ScopedLibrary } from '../../library/scoped'
import type { LibraryRevisionStore, LibraryView } from '../../library/revision'
import type { CampaignLibrary } from '../../library/scopes'
import type { KernelActor } from '../../schemas/kernel'
import type { EntryRef } from '../../library/scopes'
import { refKey } from '../../core/saves/split'
import { libraryData, startKernel, type KernelSession } from './host'
import { kernelInput } from './input'
import { hashValue, sha256Hex } from '../../core/hash'
import { KernelCache, kernelBaseKey, wrapKernelSession } from './cache'
import type { LibraryDatabase } from '../../library/db'
import type { KernelDataVersion } from '../../schemas/kernel'
import { actorData, compactActor, rebuildActor, refMapperFor, type RebuildResult } from './rebuild'
import { kernelEntryOf } from './entry'

/** Foundry 世界编号只能用字母、数字、短横线、下划线；战役的 ownerKey 形如 char:角色卡.png，按它算一个稳定编号。 */
export function worldIdOf(ownerKey: string): string {
  return `trpg-${sha256Hex(ownerKey).slice(0, 16)}`
}

export interface KernelRuntimeDeps {
  pluginRoot: URL
  files: FileProvider
  scoped: ScopedLibrary
  revisions: LibraryRevisionStore
  /** 小窗挂在哪里（隐藏 iframe 的父元素）。 */
  container: () => HTMLElement
  /** 本战役的规则与选书（从存档的内核段读）。 */
  campaignOf: (ownerKey: string) => Promise<{ rule: string; library: CampaignLibrary; title: string }>
  fetchImpl?: typeof fetch
  timeoutMs?: number
  /** 换算缓存（S3）：本地可丢副本；不给就不缓存。 */
  cache?: { db: LibraryDatabase; dataVersion: () => Promise<KernelDataVersion> }
  /** 这个战役有没有绑定结算内核（S5 进入战役时判断）。 */
  hasKernel?: (ownerKey: string) => Promise<boolean>
}

interface Open {
  session: KernelSession
  rule: string
  bases: Map<string, Record<string, unknown>>
  seeds: Map<string, string>
  boot: unknown
  bootMs: number
  view: LibraryView
  cache: KernelCache | null
  cacheBase: string
  dataVersion: () => Promise<KernelDataVersion>
}

export class KernelRuntime {
  private readonly open = new Map<string, Promise<Open>>()

  constructor(private readonly deps: KernelRuntimeDeps) {}

  /** 打开（或复用）本战役的结算小窗。 */
  async session(ownerKey: string): Promise<{ session: KernelSession; boot: unknown; bootMs: number }> {
    const o = await this.get(ownerKey)
    return { session: o.session, boot: o.boot, bootMs: o.bootMs }
  }

  private get(ownerKey: string): Promise<Open> {
    const existing = this.open.get(ownerKey)
    if (existing) return existing
    const opening = (async () => {
      const campaign = await this.deps.campaignOf(ownerKey)
      const started = performance.now()
      const view = await this.deps.revisions.published()
      const session = await startKernel({
        pluginRoot: this.deps.pluginRoot, container: this.deps.container(), data: libraryData(this.deps.files, view),
        fetchImpl: this.deps.fetchImpl, timeoutMs: this.deps.timeoutMs ?? 180_000,
      })
      const input = await kernelInput({ pluginRoot: this.deps.pluginRoot, rule: campaign.rule, world: { id: worldIdOf(ownerKey), title: campaign.title }, fetchImpl: this.deps.fetchImpl })
      const boot = await session.boot(input)
      const cache = this.deps.cache ? new KernelCache(this.deps.cache.db) : null
      const cacheBase = input.cacheKey ?? hashValue(input)
      const wrapped = cache ? wrapKernelSession(session, cache, cacheBase, this.deps.cache!.dataVersion, campaign.rule) : session
      return { session: wrapped, rule: campaign.rule, bases: new Map(), seeds: new Map(), boot, bootMs: Math.round(performance.now() - started), cache, cacheBase, view, dataVersion: this.deps.cache?.dataVersion ?? (async () => ({ official: '', brews: {} })) }
    })()
    this.open.set(ownerKey, opening)
    opening.catch(() => this.open.delete(ownerKey))
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

  /** 把小窗里这个人物现在的样子记为重建基准（新建卡刚建好时调用）。 */
  async remember(ownerKey: string, actorId: string): Promise<void> {
    const o = await this.get(ownerKey)
    const data = await actorData(o.session, actorId)
    if (!data) throw new Error(`结算小窗里没有这个人物：${actorId}`)
    o.bases.set(actorId, data)
  }

  /** 新建人物：调用方只交引用与选择；条目由【库】取，种子与建卡在内核里完成。 */
  async buildCharacter(ownerKey: string, plan: { name: string; items: EntryRef[]; equipment?: EntryRef[]; choices?: Record<string, unknown[]> }): Promise<{ status: string; id?: string; seed?: string; error?: string; detail?: unknown; noEnglish?: EntryRef[] }> {
    const o = await this.get(ownerKey)
    const rows = await this.entries(ownerKey, [...plan.items, ...(plan.equipment ?? [])])
    if (rows.status !== 'complete') return { status: rows.status, error: rows.error, detail: rows }
    const byKey = new Map(rows.rows.map((row) => [refKey(row.ref), row]))
    const items = plan.items.map((ref) => ({ prop: ref.prop, refKey: refKey(ref), entry: byKey.get(refKey(ref))!.entry }))
    const equipment = (plan.equipment ?? []).map((ref) => ({ prop: ref.prop, refKey: refKey(ref), entry: byKey.get(refKey(ref))!.entry }))
    const result = await o.session.call('buildCharacter', { name: plan.name, items, equipment, choices: plan.choices ?? {} })
    if (result.status !== 'complete' || !result.result?.id) return { status: result.status, error: result.error ?? `建卡状态：${result.status}`, detail: result }
    o.seeds.set(result.result.id, result.result.seed)
    const data = await actorData(o.session, result.result.id)
    if (data) o.bases.set(result.result.id, data)
    return { status: 'complete', id: result.result.id, seed: result.result.seed, noEnglish: rows.noEnglish }
  }

  /** 给已有人物加条目；调用方只交引用。 */
  async addToActor(ownerKey: string, actorId: string, refs: EntryRef[]): Promise<{ status: string; result?: any; error?: string; detail?: unknown; noEnglish?: EntryRef[] }> {
    const o = await this.get(ownerKey)
    const rows = await this.entries(ownerKey, refs)
    if (rows.status !== 'complete') return { status: rows.status, error: rows.error, detail: rows }
    const result = await o.session.call('addToActor', actorId, rows.rows.map((row) => ({ prop: row.ref.prop, refKey: refKey(row.ref), entry: row.entry })))
    if (result.status !== 'complete') return { status: result.status, error: result.error ?? `加条目状态：${result.status}`, detail: result }
    const base = o.bases.get(actorId)
    if (base && Array.isArray(result.result?.added) && Array.isArray((base as any).items)) {
      const current = await actorData(o.session, actorId)
      const byId = new Map(((current?.items ?? []) as any[]).map((item: any) => [item._id, item]))
      for (const item of result.result.added) {
        const actual = byId.get(item._id) ?? item
        const index = (base as any).items.findIndex((row: any) => row._id === actual._id)
        if (index >= 0) (base as any).items[index] = actual
        else (base as any).items.push(actual)
      }
    }
    return { status: 'complete', result: result.result, noEnglish: rows.noEnglish }
  }

  /** T5：批量建怪物/NPC/载具/物件；单个也走这里。换算结果由会话缓存读写。 */
  async createActors(ownerKey: string, refs: EntryRef[]): Promise<{ status: string; actors?: any[]; error?: string; detail?: unknown; noEnglish?: EntryRef[] }> {
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
    return { status: 'complete', actors: result.result, noEnglish: rows.noEnglish }
  }

  /** 引用 → 【库】条目（中文战役交英文对照），给建卡/加条目/批量建共用。 */
  private async entries(ownerKey: string, refs: EntryRef[]): Promise<{ status: 'complete'; rows: Array<{ ref: EntryRef; entry: unknown }>; noEnglish: EntryRef[] } | { status: 'missing' | 'error'; error: string; rows: []; noEnglish: [] }> {
    const lib = await this.library(ownerKey)
    const existing = this.open.get(ownerKey)
    const view = existing ? (await existing).view : await this.deps.revisions.published()
    const fetched = await this.deps.scoped.fetch(lib, refs, view)
    const rows = []
    const noEnglish: EntryRef[] = []
    for (let i = 0; i < refs.length; i++) {
      const got = fetched[i]
      if (!got.ok) return { status: 'missing', error: `取不到 ${refs[i].hash}：${got.reason}`, rows: [], noEnglish: [] }
      const k = await kernelEntryOf(this.deps.scoped, lib.codeSet, got.ref as EntryRef, got.item, got.version.altId, view)
      if (k.noEnglish) noEnglish.push(refs[i])
      rows.push({ ref: refs[i], entry: k.entry })
    }
    return { status: 'complete', rows, noEnglish }
  }

  /** 按存档里的引用 / 选择 / 状态把一个人物重建进小窗（内部走批量入口）。 */
  async rebuild(ownerKey: string, actor: KernelActor, library?: CampaignLibrary): Promise<RebuildResult> {
    return (await this.rebuildMany(ownerKey, [actor], library))[0]
  }

  /**
   * 读档：人物重建基准全部命中时，一次 createDocuments 批量建（保留编号），再叠状态差别；
   * 某个没命中，只给这个人物重新换算（S2 保证编号一致）并把基准存回缓存。
   */
  async rebuildMany(ownerKey: string, actors: KernelActor[], library?: CampaignLibrary): Promise<RebuildResult[]> {
    const o = await this.get(ownerKey)
    const lib = library ?? await this.library(ownerKey)
    const version = o.cache ? await o.dataVersion() : null
    const results: RebuildResult[] = new Array(actors.length)
    const hits: Array<{ index: number; base: Record<string, unknown> }> = []
    const misses: number[] = []
    if (o.cache && version) {
      for (let i = 0; i < actors.length; i++) {
        const key = await kernelBaseKey({ base: o.cacheBase, dataVersion: version, actor: actors[i] })
        const base = await o.cache.get(key) as Record<string, unknown> | null
        if (base) hits.push({ index: i, base }); else misses.push(i)
      }
    } else {
      for (let i = 0; i < actors.length; i++) misses.push(i)
    }
    if (hits.length) {
      const call = await o.session.call('createActorsFromBase', hits.map((h) => ({ base: h.base, state: actors[h.index].state })))
      const list = (call.result ?? []) as Array<{ id?: string; data?: Record<string, unknown>; base?: Record<string, unknown> }>
      if (call.status !== 'complete' || list.length !== hits.length) {
        for (const h of hits) results[h.index] = { status: 'error', error: call.error ?? `批量重建状态：${call.status}`, detail: call }
      } else {
        hits.forEach((h, j) => {
          const row = list[j]
          if (!row?.id || !row.data) { results[h.index] = { status: 'error', error: '批量重建没有交回人物数据' }; return }
          results[h.index] = { status: 'complete', id: row.id, data: row.data, base: row.base ?? h.base }
          o.bases.set(row.id, row.base ?? h.base)
        })
      }
    }
    for (const index of misses) {
      const actor = actors[index]
      const result = await rebuildActor({ lib: this.deps.scoped, session: o.session, library: lib, actor, view: o.view })
      results[index] = result
      if (result.status === 'complete') {
        if (!result.id || !result.base) throw new Error(`重建 ${actor.name} 没有交回人物编号或重建基准`)
        o.bases.set(result.id, result.base)
        o.seeds.set(result.id, result.seed ?? actor.seed ?? actor.name)
        if (o.cache && version) {
          const key = await kernelBaseKey({ base: o.cacheBase, dataVersion: version, actor })
          await o.cache.put(key, result.base, { rule: o.rule, base: o.cacheBase, official: version.official })
        }
      }
    }
    return results
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
      const base = o.bases.get(id)
      if (!base) throw new Error(`人物 ${id} 没有重建基准：先建卡后记住，或从存档重建`)
      const current = await actorData(o.session, id)
      if (!current) throw new Error(`结算小窗里没有这个人物：${id}`)
      const captured = await o.session.call('captureChoices', id)
      if (captured.status !== 'complete') throw new Error(`记下 ${id} 的成长选择失败：${captured.error ?? captured.status}`)
      const name = typeof current.name === 'string' ? current.name : id
      const compact = await compactActor({ lib: this.deps.scoped, library, actor: { id, name }, seed: o.seeds.get(id) ?? name, current, base, choices: captured.result ?? {} })
      if (o.cache) {
        const version = await o.dataVersion()
        const key = await kernelBaseKey({ base: o.cacheBase, dataVersion: version, actor: compact })
        await o.cache.put(key, base, { rule: o.rule, base: o.cacheBase, official: version.official })
      }
      out.push(compact)
    }
    return out
  }
}
