// 多选卸载 / 删除（P5-5 §12 B1，驾驶员 2026-11-12 批准）：一次预览、按语言执行。
// - 选中的书 / 冒险 / 自制包先补上另一种语言的那一份（官方按同一书号、自制按已装包配对），中英一起删。
// - 每个目标照旧由 impactOfRemoval 算影响，合并成一份预览；执行前按同一份凭据逐个复核。
// - 作者的自制存储一次修改只能准备一种语言，所以按语言分两步执行：每一步全成或全不成；
//   第一步成功、第二步失败时报 RemovalBatchError，写清哪一步已完成。
import type { RemovalImpact, RemovalTarget } from './removal-impact'
import type { BrewPairs } from '../library/brew-pairing'
import type { LibraryOperations, OperationHandle } from '../library/operations'
import type { LibraryView } from '../library/revision'
import { getSource } from '../library/sources'
import { hashValue, stableStringify } from './hash'

export interface RemovalBatch {
  /** 补上另一种语言后、按数据集合并好的目标。 */
  targets: RemovalTarget[]
  /** 每个目标自己的影响（执行时逐个复核凭据）。 */
  parts: RemovalImpact[]
  plan: { fingerprint: string }
  /** 合并后的影响，给确认弹窗排版（和单个目标的字段一样）。 */
  packs: RemovalImpact['packs']
  removeTogether: string[]
  houseRules: RemovalImpact['houseRules']
  choices: RemovalImpact['choices']
  saves: RemovalImpact['saves']
}

export class RemovalBatchError extends Error {
  constructor(message: string, readonly done: string[], readonly remaining: RemovalTarget[]) {
    super(message)
    this.name = 'RemovalBatchError'
  }
}

type Official = Extract<RemovalTarget, { kind: 'official' }>
type Brew = Extract<RemovalTarget, { kind: 'brew' }>
const uniq = <T>(xs: T[]): T[] => [...new Set(xs)]

/** 同一数据集的目标合成一个（官方：书号 / 来源 / 冒险号并集；自制：包编号并集）。 */
function mergeTargets(targets: RemovalTarget[]): RemovalTarget[] {
  const official = new Map<string, Official>()
  const brew = new Map<string, Brew>()
  for (const t of targets) {
    if (t.kind === 'brew') {
      const cur = brew.get(t.setId)
      brew.set(t.setId, { kind: 'brew', setId: t.setId, docIdLocals: uniq([...(cur?.docIdLocals ?? []), ...t.docIdLocals]) })
      continue
    }
    const cur = official.get(t.setId)
    const bookIds = uniq([...(cur?.bookIds ?? []), ...(t.bookIds ?? [])])
    const bookSources = uniq([...(cur?.bookSources ?? []), ...(t.bookSources ?? [])])
    const adventureIds = uniq([...(cur?.adventureIds ?? []), ...(t.adventureIds ?? [])])
    official.set(t.setId, { kind: 'official', setId: t.setId, ...(bookIds.length ? { bookIds } : {}), ...(bookSources.length ? { bookSources } : {}), ...(adventureIds.length ? { adventureIds } : {}) })
  }
  return [...official.values(), ...brew.values()]
}

/** 补上另一种语言的那一份：官方按同一书号 / 冒险号（只取那边装着的）；自制按已装包配对。 */
export async function withCounterparts(view: LibraryView, brewPairs: Pick<BrewPairs, 'installed'>, targets: RemovalTarget[]): Promise<RemovalTarget[]> {
  const out: RemovalTarget[] = [...targets]
  for (const t of targets) {
    const set = getSource(t.setId)
    if (!set.pair) continue
    if (t.kind === 'official') {
      const state = await view.officialState(set.pair)
      if (state?.status !== 'installed') continue
      // 书号 / 冒险号两种语言大小写不一定一样，不分大小写配；用那边自己的写法
      const has = (list: string[] | null | undefined, id: string): boolean => list == null || list.some((x) => x.toLowerCase() === id.toLowerCase())
      const theirs = (list: string[] | null | undefined, id: string): string => list?.find((x) => x.toLowerCase() === id.toLowerCase()) ?? id
      const bookIds = (t.bookIds ?? []).filter((id) => has(state.books, id)).map((id) => theirs(state.books, id))
      const adventureIds = (t.adventureIds ?? []).filter((id) => has(state.adventures, id)).map((id) => theirs(state.adventures, id))
      // 整套 = 书号、来源、冒险号都没给；只给来源的（没有书号的来源行）按来源配到另一种语言
      if (!t.bookIds?.length && !t.adventureIds?.length && !t.bookSources?.length) { out.push({ kind: 'official', setId: set.pair }); continue }
      const sourceOnly = !t.bookIds?.length && !t.adventureIds?.length
      if (!sourceOnly && !bookIds.length && !adventureIds.length) continue
      const bookSources = sourceOnly ? t.bookSources : bookIds.length ? t.bookSources : undefined
      out.push({ kind: 'official', setId: set.pair, ...(bookIds.length ? { bookIds } : {}), ...(bookSources?.length ? { bookSources } : {}), ...(adventureIds.length ? { adventureIds } : {}) })
      continue
    }
    const zhId = set.lang === 'zh' ? set.id : set.pair
    const pairs = await brewPairs.installed(zhId, view)
    const mine = set.lang === 'zh' ? 'zh' : 'en'
    const other = mine === 'zh' ? 'en' : 'zh'
    const partners = t.docIdLocals.map((id) => pairs.find((p) => p[mine]?.docIdLocal === id)?.[other]?.docIdLocal).filter((x): x is string => !!x)
    if (partners.length) out.push({ kind: 'brew', setId: set.pair, docIdLocals: partners })
  }
  return mergeTargets(out)
}

/** 合并各目标的影响：同一个包取「必须一起删」优先；存档按战役 / 存档合并原因。 */
export function mergeImpacts(targets: RemovalTarget[], parts: RemovalImpact[]): RemovalBatch {
  const packs = new Map<string, RemovalImpact['packs'][number]>()
  for (const p of parts.flatMap((x) => x.packs)) {
    const cur = packs.get(p.docIdLocal)
    if (!cur || (p.mustRemove && !cur.mustRemove)) packs.set(p.docIdLocal, p)
  }
  // 自己就在删除名单里的包不再列成「受影响」
  const chosen = new Set(targets.flatMap((t) => (t.kind === 'brew' ? t.docIdLocals : [])))
  for (const id of chosen) packs.delete(id)
  const byJson = <T>(xs: T[]): T[] => [...new Map(xs.map((x) => [stableStringify(x), x])).values()]
  const saves = new Map<string, RemovalImpact['saves'][number]>()
  for (const s of parts.flatMap((x) => x.saves)) {
    const key = `${s.ownerKey}|${s.saveId ?? ''}`
    const cur = saves.get(key)
    saves.set(key, cur ? { ...cur, why: uniq([...cur.why, ...s.why]) } : s)
  }
  const fingerprint = hashValue(stableStringify(parts.map((p) => p.plan.fingerprint)))
  return {
    targets, parts, plan: { fingerprint },
    packs: [...packs.values()], removeTogether: uniq(parts.flatMap((p) => p.removeTogether)),
    houseRules: byJson(parts.flatMap((p) => p.houseRules)), choices: byJson(parts.flatMap((p) => p.choices)), saves: [...saves.values()],
  }
}

export interface BatchDeps {
  impactAt: (view: LibraryView, target: RemovalTarget, checkedRevision?: string) => Promise<RemovalImpact>
  operations: LibraryOperations
  brewSetOf: (codeSet: string) => string
  /** 一种语言的一次修改：官方若干套的书 / 冒险 + 自制若干包，一起发布。 */
  removeParts: (parts: { official: Array<Omit<Official, 'kind' | 'setIds'>>; brews: Array<{ setId: string; ids: string[] }> }, handle: OperationHandle) => Promise<unknown>
}

/** 按语言分步执行；每步先在锁内按固定版本重算，凭据不一致就停（资料或引用变了，要重新预览）。 */
export async function executeBatch(deps: BatchDeps, batch: RemovalBatch): Promise<{ done: string[] }> {
  const codeSets = uniq(batch.targets.map((t) => getSource(t.setId).codeSet))
  const done: string[] = []
  let checkedRevision: string | undefined
  let lastPublished: string | undefined
  for (const codeSet of codeSets) {
    const group = batch.targets.filter((t) => getSource(t.setId).codeSet === codeSet)
    const handle = await deps.operations.begin({ kind: 'remove-batch', set: group.map((t) => t.setId).join(','), codeSet })
    try {
      if (lastPublished && handle.base.id !== lastPublished) throw new Error('资料已经变化，请重新预览删除影响')
      checkedRevision ??= handle.base.id
      const official: Array<Omit<Official, 'kind' | 'setIds'>> = []
      const brewIds = new Map<string, string[]>()
      for (const t of group) {
        const before = batch.parts[batch.targets.indexOf(t)]
        // 后续语言仍重读实际影响，用首次版本号比较凭据，允许同一批前一步自己的发布。
        const fresh = await deps.impactAt(handle.base, t, checkedRevision)
        if (fresh.plan.fingerprint !== before.plan.fingerprint) throw new Error('资料或引用已经变化，请重新预览删除影响')
        const brewSet = t.kind === 'brew' ? t.setId : deps.brewSetOf(codeSet)
        brewIds.set(brewSet, uniq([...(brewIds.get(brewSet) ?? []), ...(t.kind === 'brew' ? t.docIdLocals : []), ...fresh.removeTogether]))
        if (t.kind === 'official') official.push({ setId: t.setId, bookIds: t.bookIds, bookSources: t.bookSources, adventureIds: t.adventureIds })
      }
      await deps.removeParts({ official, brews: [...brewIds].map(([setId, ids]) => ({ setId, ids })) }, handle)
      lastPublished = handle.target.id
      done.push(codeSet)
    } catch (e) {
      await deps.operations.abort(handle, e)
      const reason = e instanceof Error ? e.message : String(e)
      if (!done.length) throw e
      const remaining = batch.targets.filter((t) => !done.includes(getSource(t.setId).codeSet))
      throw new RemovalBatchError(`${done.map(langName).join('、')}部分已卸载，${langName(codeSet)}部分没有成功：${reason}`, done, remaining)
    }
  }
  return { done }
}

const langName = (codeSet: string): string => (codeSet === 'cn' ? '中文' : codeSet === 'en' ? '英文' : codeSet)
