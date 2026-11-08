// P3 收尾：结算内核接进插件服务入口。一个战役一个结算小窗（世界互不相见），按需打开、复用、关闭。
// 每个人物记住“重建基准”（刚建好或刚重建、还没叠状态的样子），存档时用它把小窗里的人物拆回
// 引用 / 选择 / 状态差别（官方 Advancement#reverse 记选择）。界面只经服务入口用这里，不直接碰小窗。
import type { KernelActorCompact } from '../../core/saves/kernel'
import type { KernelRefMapper } from '../../core/saves/split'
import type { FileProvider } from '../../library/files'
import type { ScopedLibrary } from '../../library/scoped'
import type { CampaignLibrary } from '../../library/scopes'
import type { KernelActor } from '../../schemas/kernel'
import { libraryData, startKernel, type KernelSession } from './host'
import { kernelInput } from './input'
import { hashValue, sha256Hex } from '../../core/hash'
import { KernelCache, wrapKernelSession } from './cache'
import type { LibraryDatabase } from '../../library/db'
import type { KernelDataVersion } from '../../schemas/kernel'
import { actorData, compactActor, rebuildActor, refMapperFor, type RebuildResult } from './rebuild'

/** Foundry 世界编号只能用字母、数字、短横线、下划线；战役的 ownerKey 形如 char:角色卡.png，按它算一个稳定编号。 */
export function worldIdOf(ownerKey: string): string {
  return `trpg-${sha256Hex(ownerKey).slice(0, 16)}`
}

export interface KernelRuntimeDeps {
  pluginRoot: URL
  files: FileProvider
  scoped: ScopedLibrary
  /** 小窗挂在哪里（隐藏 iframe 的父元素）。 */
  container: () => HTMLElement
  /** 本战役的规则与选书（从存档的内核段读）。 */
  campaignOf: (ownerKey: string) => Promise<{ rule: string; library: CampaignLibrary; title: string }>
  fetchImpl?: typeof fetch
  timeoutMs?: number
  /** 换算缓存（S3）：本地可丢副本；不给就不缓存。 */
  cache?: { db: LibraryDatabase; dataVersion: () => Promise<KernelDataVersion> }
}

interface Open {
  session: KernelSession
  rule: string
  bases: Map<string, Record<string, unknown>>
  boot: unknown
  bootMs: number
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
      const session = await startKernel({
        pluginRoot: this.deps.pluginRoot, container: this.deps.container(), data: libraryData(this.deps.files),
        fetchImpl: this.deps.fetchImpl, timeoutMs: this.deps.timeoutMs ?? 180_000,
      })
      const input = await kernelInput({ pluginRoot: this.deps.pluginRoot, rule: campaign.rule, world: { id: worldIdOf(ownerKey), title: campaign.title }, fetchImpl: this.deps.fetchImpl })
      const boot = await session.boot(input)
      const wrapped = this.deps.cache
        ? wrapKernelSession(session, new KernelCache(this.deps.cache.db), input.cacheKey ?? hashValue(input), this.deps.cache.dataVersion)
        : session
      return { session: wrapped, rule: campaign.rule, bases: new Map(), boot, bootMs: Math.round(performance.now() - started) }
    })()
    this.open.set(ownerKey, opening)
    opening.catch(() => this.open.delete(ownerKey))
    return opening
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

  /** 按存档里的引用 / 选择 / 状态把人物重建进小窗，并记住它的重建基准。 */
  async rebuild(ownerKey: string, actor: KernelActor, library?: CampaignLibrary): Promise<RebuildResult> {
    const o = await this.get(ownerKey)
    const result = await rebuildActor({ lib: this.deps.scoped, session: o.session, library: library ?? await this.library(ownerKey), actor })
    if (result.status === 'complete') {
      if (!result.id || !result.base) throw new Error(`重建 ${actor.name} 没有交回人物编号或重建基准`)
      o.bases.set(result.id, result.base)
    }
    return result
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
      out.push(await compactActor({ lib: this.deps.scoped, library, actor: { id, name }, current, base, choices: captured.result ?? {} }))
    }
    return out
  }
}
