// 删除 / 卸载前的影响预览（P5 B-08）：删一套官方资料、或删若干自制包之前，列出会连带影响的东西。
// 作者的删除函数只按编号删、不检查依赖（utils-brew-base.js 的 _pDeleteBrews_），插件要自己列。纯读取，不改任何数据。
// 在 core 层：要同时读【库】（自制包、房规、版本选择）和用户数据库（战役、存档里的内核段）。
import type { TrpgDatabase } from './db'
import type { BrewPack, BrewPacks } from '../library/brew-packs'
import { canProvide, requirementsOf } from '../library/brew-health'
import type { HouseRuleLink, ManageStore } from '../library/manage'
import { getSource } from '../library/sources'
import { packAltId, packStableId } from '../library/versions'
import { kernelCampaignSchema, kernelLibrarySchema, type KernelCampaign } from '../schemas/kernel'
import { libraryKey } from './saves/kernel'
import { campaignIdOfSave, treeRootId } from './saves/view'
import { hashValue, stableStringify } from './hash'

export type RemovalTarget =
  | { kind: 'official'; setId: string; /** 中英一起卸载时给完整集合。 */ setIds?: string[]; /** 只删作者书号 / 冒险号；都不给 = 整套。 */ bookIds?: string[]; bookSources?: string[]; adventureIds?: string[] }
  | { kind: 'brew'; setId: string; docIdLocals: string[] }

export interface AffectedSave {
  ownerKey: string
  ownerLabel: string
  /** null = 这个战役当前的工作数据；否则是存档编号。 */
  saveId: string | null
  name: string
  kind: 'current' | 'manual' | 'auto'
  deleted: boolean
  /** 为什么算受影响（用了被删资料的人物引用、选书设置、版本选择…）。 */
  why: string[]
}

export interface RemovalImpact {
  target: RemovalTarget
  /** 这份影响预览的凭据：执行时必须还是同一份计划（P5 T4）。 */
  plan: { id: string; fingerprint: string; checkedAt: number; removeTogether: string[] }
  /** 依赖它的自制包（或：删官方资料后启动不了的自制包）。 */
  /** mustRemove = 缺了被删的数据源会读不出，按作者规则必须一起删（P5 T6 实测：缺一个依赖会让全部自制条目消失）。 */
  packs: Array<{ docIdLocal: string; filename: string | null; why: string; mustRemove: boolean }>
  /** 确认删除时要一起删的自制包本地编号：被选中的 + 因缺依赖必须一起删的（传递闭包，界面里不可取消勾选）。官方整套被删时为空。 */
  removeTogether: string[]
  houseRules: HouseRuleLink[]
  choices: Array<{ level: string; target: string; altId: string }>
  saves: AffectedSave[]
}

export interface ImpactDeps {
  db: Pick<TrpgDatabase, 'workspaces' | 'saves' | 'getMeta'>
  manage: Pick<ManageStore, 'houseRules' | 'allChoices'>
  brewPacks: Pick<BrewPacks, 'list'>
  /** 这套作者程序（cn / en）对应的自制源编号。 */
  brewSetOf: (codeSet: string) => string
  /** 当前已发布库版本；预览凭据要包含它。 */
  revision: string
  /** 官方单书删除时，该书涉及的类别 → 作者编号；只用于精确判断引用。 */
  officialHashes?: (setId: string, bookSources: string[]) => Promise<Map<string, Set<string>>>
  /** 删除后仍在的官方来源（小写）；用于判断自制依赖是否还有官方提供者。 */
  officialSources?: Set<string>
}

const lower = (xs: Iterable<string>): Set<string> => new Set([...xs].map((s) => s.toLowerCase()))

const kernelOf = (data: unknown): KernelCampaign | null => {
  const raw = (data as { kernel?: unknown } | null | undefined)?.kernel
  const r = raw ? kernelCampaignSchema.safeParse(raw) : null
  return r?.success ? r.data : null
}

/** 被删的东西，用来判断"谁用了它"。 */
interface Removed {
  /** 被删的数据集：官方整套 / 自制源。 */
  setId: string
  /** 官方可以一次删多套（中英）；refGone 按集合判断。 */
  setIds: Set<string>
  codeSet: string
  official: boolean
  /** true = 整套官方；false 时按 books/sources/adventures 精确判断。 */
  officialWhole: boolean
  /** 被删来源（小写）与每类的作者编号（官方单书也用它判断 library 选书设置）。 */
  sources: Set<string>
  books: Set<string>
  adventures: Set<string>
  hashes: Map<string, Set<string>>
  altIds: Set<string>
}

function removedOf(target: RemovalTarget, packs: BrewPack[], goneIds?: Set<string>, officialHashes?: Map<string, Set<string>>): Removed {
  const set = getSource(target.setId)
  const gone = target.kind === 'brew' ? packs.filter((p) => (goneIds ?? new Set(target.docIdLocals)).has(p.docIdLocal)) : []
  const hashes = new Map<string, Set<string>>()
  for (const p of gone) for (const [prop, hs] of Object.entries(p.hashes)) hashes.set(prop, new Set([...(hashes.get(prop) ?? []), ...hs]))
  const setIds = new Set(target.kind === 'official' ? (target.setIds ?? [target.setId]) : [target.setId])
  const officialWhole = target.kind === 'official' && !(target.bookIds?.length || target.bookSources?.length || target.adventureIds?.length)
  const books = new Set(target.kind === 'official' ? target.bookIds ?? [] : [])
  const adventures = new Set(target.kind === 'official' ? target.adventureIds ?? [] : [])
  const sources = target.kind === 'official' ? lower(target.bookSources ?? target.bookIds ?? []) : lower(gone.flatMap((p) => p.sources))
  if (officialHashes) for (const [prop, hs] of officialHashes) hashes.set(prop, new Set([...(hashes.get(prop) ?? []), ...hs]))
  return { setId: set.id, setIds, codeSet: set.codeSet, official: target.kind === 'official', officialWhole, sources, books, adventures, hashes, altIds: new Set(gone.flatMap((p) => [`doc:${p.docIdLocal}`, packAltId(packStableId(p), p.docIdLocal)])) }
}

const refGone = (r: Removed, ref: { set: string; prop: string; hash: string }): boolean => {
  if (!r.official) return ref.set === r.setId && !!r.hashes.get(ref.prop)?.has(ref.hash)
  if (r.officialWhole) return r.setIds.has(ref.set)
  if (!r.setIds.has(ref.set)) return false
  if (ref.prop === 'adventure') return r.adventures.has(ref.hash)
  return !!r.hashes.get(ref.prop)?.has(ref.hash)
}

/** 一份内核段（战役当前数据或存档）里哪些东西用了被删资料。 */
function whyKernel(k: KernelCampaign, library: KernelCampaign['library'], r: Removed): string[] {
  const why: string[] = []
  if (r.official && r.officialWhole && [...r.setIds].some((id) => getSource(id).codeSet === library.codeSet)) why.push('这个战役用的是这套资料')
  const refs = k.actors.flatMap((a) => a.refs).filter((ref) => refGone(r, ref)).length
  if (refs) why.push(`${refs} 处人物引用`)
  if (library.include.concat(library.exclude).some((u) => r.sources.has(u.replace(/^src:/, '')))) why.push('选书设置里有它的来源')
  if (Object.entries(library.choices).some(([key, alt]) => r.altIds.has(alt) || refGone(r, refOfKey(key)))) why.push('选了它的版本')
  if (k.overrides.some((o) => refGone(r, o.target) || refGone(r, o.house))) why.push('有房规覆盖')
  return why
}

const refOfKey = (key: string): { set: string; prop: string; hash: string } => {
  const [set = '', prop = '', ...rest] = key.split('|')
  return { set, prop, hash: rest.join('|') }
}

export async function impactOfRemoval(deps: ImpactDeps, target: RemovalTarget): Promise<RemovalImpact> {
  const brewSetIds = target.kind === 'brew'
    ? [target.setId]
    : [...new Set((target.setIds ?? [target.setId]).map((id) => deps.brewSetOf(getSource(id).codeSet)))]
  // 清单读不到 = 检查失败，不能当成“没有包”放行（P5 H6）
  const packs = (await Promise.all(brewSetIds.map((id) => deps.brewPacks.list(id)))).flat()
  if (target.kind === 'brew') {
    const missing = target.docIdLocals.find((id) => !packs.some((p) => p.docIdLocal === id))
    if (missing) throw new Error(`这个自制包已经不存在：${missing}`)
  }

  // 依赖：先用作者实际声明（dependencies / includes / otherSources / _copy）核对删除前后。
  // 只有“删除前有提供者、删除后没有提供者”的必需数据才算本次新增缺失；已有缺依赖不算到这次删除。
  const officialHashes = target.kind === 'official'
    ? await deps.officialHashes?.(target.setId, target.bookSources ?? target.bookIds ?? [])
    : undefined
  let removed = removedOf(target, packs, undefined, officialHashes)
  const impacted: RemovalImpact['packs'] = []
  const removeTogether: string[] = []
  const officialWhole = target.kind === 'official' && removed.officialWhole
  if (target.kind === 'official' && officialWhole) {
    for (const p of packs) impacted.push({ docIdLocal: p.docIdLocal, filename: p.filename, why: '自制内容要靠这套官方资料才能运行，重新下载之前用不了', mustRemove: false })
    removed = removedOf(target, packs)
  } else {
    const gone = new Set<string>(target.kind === 'brew' ? target.docIdLocals : [])
    const requirements = requirementsOf
    const sourceOf = (p: BrewPack): string[] => p.sources.map((s) => s.toLowerCase())
    const officialBefore = new Set([...(deps.officialSources ?? []), ...(target.kind === 'official' ? removed.sources : [])])
    const officialAfter = new Set(deps.officialSources ?? [])
    if (target.kind === 'official') for (const s of removed.sources) officialAfter.delete(s)
    const attached = new Set<string>()
    let changed = true
    while (changed) {
      changed = false
      const remaining = packs.filter((p) => !gone.has(p.docIdLocal))
      for (const p of remaining) {
        if (attached.has(p.docIdLocal)) continue
        const lost = requirements(p).find((req) => {
          const src = req.source.toLowerCase()
          if (!removed.sources.has(src)) return false
          if (!canProvide(req, officialBefore, packs)) return false // 删除前就缺：不是这次造成的
          return !canProvide(req, officialAfter, remaining.filter((x) => x.docIdLocal !== p.docIdLocal))
        })
        if (!lost) continue
        attached.add(p.docIdLocal)
        const why = `依赖 ${lost.source} 的 ${lost.prop}${lost.hash ? ` / ${lost.hash}` : ''}，删除后没有可用提供者`
        gone.add(p.docIdLocal)
        for (const src of sourceOf(p)) removed.sources.add(src)
        impacted.push({ docIdLocal: p.docIdLocal, filename: p.filename, why: `${why}，缺了会读不出，必须一起删`, mustRemove: true })
        changed = true
      }
    }
    // 仍有提供者的受影响包只提示，不进入必删集合。
    for (const p of packs) {
      if (gone.has(p.docIdLocal) || attached.has(p.docIdLocal)) continue
      const hit = requirements(p).find((req) => removed.sources.has(req.source.toLowerCase()))
      if (hit) impacted.push({ docIdLocal: p.docIdLocal, filename: p.filename, why: `依赖的 ${hit.prop} / ${hit.source} 仍可从其他提供者取得，保留但受影响`, mustRemove: false })
    }
    for (const id of gone) if (!removeTogether.includes(id)) removeTogether.push(id)
    if (target.kind === 'brew') removeTogether.unshift(...target.docIdLocals.filter((id) => !removeTogether.includes(id)))
    // 最终集合可能还包含因官方单书删除而必须一起删的自制包；把它们的条目也纳入引用扫描。
    if (gone.size && target.kind === 'official') {
      const extra = removedOf({ kind: 'brew', setId: deps.brewSetOf(removed.codeSet), docIdLocals: [...gone] }, packs, gone)
      for (const src of extra.sources) removed.sources.add(src)
      for (const [prop, hs] of extra.hashes) for (const h of hs) (removed.hashes.get(prop) ?? removed.hashes.set(prop, new Set()).get(prop)!).add(h)
      for (const alt of extra.altIds) removed.altIds.add(alt)
    } else if (target.kind === 'brew') {
      removed = removedOf(target, packs, gone)
    }
  }

  // 房规、版本选择
  const houseRules = (await deps.manage.houseRules()).filter((l) => refGone(removed, l.house) || refGone(removed, l.target))
  const choices = (await deps.manage.allChoices()).filter((c) => removed.altIds.has(c.altId) || refGone(removed, refOfKey(c.target)))

  // 战役与存档。选书设置以战役级那份（meta）为准，没有才用快照里的副本（B-20）
  const all = await deps.db.saves.toArray()
  const libraryOf = async (campaignId: string | null, k: KernelCampaign): Promise<KernelCampaign['library']> => {
    const stored = campaignId ? await deps.db.getMeta<unknown>(libraryKey(campaignId)) : undefined
    const parsed = stored ? kernelLibrarySchema.safeParse(stored) : null
    return parsed?.success ? parsed.data : k.library
  }
  const saves: AffectedSave[] = []
  for (const ws of await deps.db.workspaces.toArray()) {
    const k = kernelOf(ws.data)
    const why = k ? whyKernel(k, await libraryOf(ws.campaignId ?? (ws.currentSaveId ? treeRootId(all, ws.currentSaveId) : null), k), removed) : []
    if (why.length) saves.push({ ownerKey: ws.ownerKey, ownerLabel: ws.ownerLabel, saveId: null, name: '当前数据', kind: 'current', deleted: false, why })
  }
  for (const s of all) {
    const k = kernelOf(s.snapshot)
    const why = k ? whyKernel(k, await libraryOf(campaignIdOfSave(all, s), k), removed) : []
    if (why.length) saves.push({ ownerKey: s.ownerKey, ownerLabel: s.ownerLabel, saveId: s.id, name: s.name, kind: s.kind, deleted: s.deletedAt !== undefined, why })
  }
  const checkedAt = Date.now()
  const fingerprint = hashValue(stableStringify({ revision: deps.revision, target, removeTogether: [...removeTogether].sort(), packs: packs.map((p) => [p.docIdLocal, p.sources, p.dependencies]), houseRules, choices, saves }))
  return { target, plan: { id: fingerprint.slice(0, 16), fingerprint, checkedAt, removeTogether }, packs: impacted, removeTogether, houseRules, choices, saves }
}
