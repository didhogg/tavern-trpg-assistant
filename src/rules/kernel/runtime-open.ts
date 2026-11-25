// 结算小窗打开后的那一份状态（runtime.ts 的 Open）和把小窗里的人物拆回存档格式（compact）。从 runtime.ts 拆出来（单文件 ≤400 行）。
import type { KernelActorCompact } from '../../core/saves/kernel'
import type { LibraryView } from '../../library/revision'
import type { ScopedLibrary } from '../../library/scoped'
import type { CampaignLibrary, EntryRef } from '../../library/scopes'
import { kernelActorSchema, type KernelDataVersion } from '../../schemas/kernel'
import type { KernelBrewReport } from './frame/brew-input'
import { executed, type KernelSession } from './host'
import type { PreparedActors } from './prepared'
import { kernelBaseKey, kernelFilesVersion, type KernelCache } from './cache'
import { actorData, compactActor } from './rebuild'
import type { PairsOf } from './sidecar'

export interface KernelOpen {
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

/** 把小窗里的人物拆回存档要的引用 / 选择 / 状态差别（内核存档写入前调用）。 */
export async function compactActors(o: KernelOpen, scoped: ScopedLibrary, library: CampaignLibrary, ids: string[]): Promise<KernelActorCompact[]> {
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
    const compact = await compactActor({ lib: scoped, library, actor: { id, name }, seed: o.seeds.get(id) ?? name, current, base, choices: o.bases.protect(id, captured.result ?? {}), stored })
    if (o.cache && !stored) {
      const version = await o.dataVersion()
      const key = await kernelBaseKey({ base: o.cacheBase, brewFingerprint: o.brewFingerprint, dataVersion: version, actor: compact })
      await o.cache.put(key, full, { rule: o.rule, base: o.cacheBase, official: kernelFilesVersion(version), lang: o.cacheLang })
    }
    // 有取下安排（P6 取下 / 装回，驾驶员 11-25 定修法 A）：完整数据存「没取下的完整基准」，差别相对取下后的视图算，
    // 读档 = 基准 → 作者按安排取下 → 叠差别（people.ts withBase 保留 off / state）；基准不动，下次照样相对同一个视图算
    if (stored && o.bases.hasOff(id)) { out.push({ ...compact, doc: structuredClone(full) }); continue }
    // P6-R：没有取下 = 完整数据就是现在的样子（读档 / 撤销按它建回），差别为空；小窗里按「完整数据建回的人」记
    out.push({ ...compact, state: kernelActorSchema.shape.state.parse(undefined), doc: current })
    o.bases.set(id, structuredClone(current), null, {}, true)
  }
  return out
}
