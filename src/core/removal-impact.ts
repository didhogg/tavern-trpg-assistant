// 删除 / 卸载前的影响预览（P5 B-08）：删一套官方资料、或删若干自制包之前，列出会连带影响的东西。
// 作者的删除函数只按编号删、不检查依赖（utils-brew-base.js 的 _pDeleteBrews_），插件要自己列。纯读取，不改任何数据。
// 在 core 层：要同时读【库】（自制包、房规、版本选择）和用户数据库（战役、存档里的内核段）。
import type { TrpgDatabase } from './db'
import type { BrewPack, BrewPacks } from '../library/brew-packs'
import type { HouseRuleLink, ManageStore } from '../library/manage'
import { getSource } from '../library/sources'
import { packAltId, packStableId } from '../library/versions'
import { kernelCampaignSchema, kernelLibrarySchema, type KernelCampaign } from '../schemas/kernel'
import { libraryKey } from './saves/kernel'
import { treeRootId } from './saves/view'
import { hashValue } from './hash'

export type RemovalTarget =
  | { kind: 'official'; setId: string; /** 中英一起卸载时给完整集合。 */ setIds?: string[] }
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
  /** 自制：被删包里的来源（小写）与每类的作者编号。 */
  sources: Set<string>
  hashes: Map<string, Set<string>>
  altIds: Set<string>
}

function removedOf(target: RemovalTarget, packs: BrewPack[], goneIds?: Set<string>): Removed {
  const set = getSource(target.setId)
  const gone = target.kind === 'brew' ? packs.filter((p) => (goneIds ?? new Set(target.docIdLocals)).has(p.docIdLocal)) : []
  const hashes = new Map<string, Set<string>>()
  for (const p of gone) for (const [prop, hs] of Object.entries(p.hashes)) hashes.set(prop, new Set([...(hashes.get(prop) ?? []), ...hs]))
  const setIds = new Set(target.kind === 'official' ? (target.setIds ?? [target.setId]) : [target.setId])
  return { setId: set.id, setIds, codeSet: set.codeSet, official: target.kind === 'official', sources: lower(gone.flatMap((p) => p.sources)), hashes, altIds: new Set(gone.flatMap((p) => [`doc:${p.docIdLocal}`, packAltId(packStableId(p), p.docIdLocal)])) }
}

const refGone = (r: Removed, ref: { set: string; prop: string; hash: string }): boolean =>
  r.official ? r.setIds.has(ref.set) : ref.set === r.setId && !!r.hashes.get(ref.prop)?.has(ref.hash)

/** 一份内核段（战役当前数据或存档）里哪些东西用了被删资料。 */
function whyKernel(k: KernelCampaign, library: KernelCampaign['library'], r: Removed): string[] {
  const why: string[] = []
  if (r.official && [...r.setIds].some((id) => getSource(id).codeSet === library.codeSet)) why.push('这个战役用的是这套资料')
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

  // 自制包。删自制包：依赖被删来源的包也算，并且一路往下找（A 依赖被删的，B 依赖 A …），这些必须一起删
  const impacted: RemovalImpact['packs'] = []
  const removeTogether: string[] = []
  let removed: Removed
  if (target.kind === 'official') {
    removed = removedOf(target, packs)
    for (const p of packs) impacted.push({ docIdLocal: p.docIdLocal, filename: p.filename, why: '自制内容要靠这套官方资料才能运行，重新下载之前用不了', mustRemove: false })
  } else {
    const gone = new Set(target.docIdLocals)
    const lostSources = new Set<string>()
    for (const p of packs) if (gone.has(p.docIdLocal)) for (const src of p.sources) lostSources.add(src.toLowerCase())
    for (let grew = true; grew;) {
      grew = false
      for (const p of packs) {
        if (gone.has(p.docIdLocal)) continue
        const needs = lower(Object.values((p.dependencies ?? {}) as Record<string, string[]>).flat())
        const hit = [...lostSources].find((s) => needs.has(s))
        if (!hit) continue
        gone.add(p.docIdLocal)
        for (const s of p.sources) lostSources.add(s.toLowerCase())
        impacted.push({ docIdLocal: p.docIdLocal, filename: p.filename, why: `依赖被删包里的来源 ${hit}，缺了它就不能用，必须一起删`, mustRemove: true })
        grew = true
      }
    }
    // 先求最终删除集合，再用完整集合重建 Removed；后面的房规 / 存档扫描不能再用最初的目标
    removeTogether.push(...gone)
    removed = removedOf(target, packs, gone)
  }

  // 房规、版本选择
  const houseRules = (await deps.manage.houseRules()).filter((l) => refGone(removed, l.house) || refGone(removed, l.target))
  const choices = (await deps.manage.allChoices()).filter((c) => removed.altIds.has(c.altId) || refGone(removed, refOfKey(c.target)))

  // 战役与存档。选书设置以战役级那份（meta）为准，没有才用快照里的副本（B-20）
  const all = await deps.db.saves.toArray()
  const libraryOf = async (rootId: string | null, k: KernelCampaign): Promise<KernelCampaign['library']> => {
    const stored = rootId ? await deps.db.getMeta<unknown>(libraryKey(rootId)) : undefined
    const parsed = stored ? kernelLibrarySchema.safeParse(stored) : null
    return parsed?.success ? parsed.data : k.library
  }
  const saves: AffectedSave[] = []
  for (const ws of await deps.db.workspaces.toArray()) {
    const k = kernelOf(ws.data)
    const why = k ? whyKernel(k, await libraryOf(ws.currentSaveId ? treeRootId(all, ws.currentSaveId) : null, k), removed) : []
    if (why.length) saves.push({ ownerKey: ws.ownerKey, ownerLabel: ws.ownerLabel, saveId: null, name: '当前数据', kind: 'current', deleted: false, why })
  }
  for (const s of all) {
    const k = kernelOf(s.snapshot)
    const why = k ? whyKernel(k, await libraryOf(treeRootId(all, s.id), k), removed) : []
    if (why.length) saves.push({ ownerKey: s.ownerKey, ownerLabel: s.ownerLabel, saveId: s.id, name: s.name, kind: s.kind, deleted: s.deletedAt !== undefined, why })
  }
  const checkedAt = Date.now()
  const fingerprint = hashValue(JSON.stringify({ target, removeTogether: [...removeTogether].sort(), packs: packs.filter((p) => removeTogether.includes(p.docIdLocal)).map((p) => [p.docIdLocal, p.sources, p.dependencies]) }))
  return { target, plan: { id: fingerprint.slice(0, 16), fingerprint, checkedAt, removeTogether }, packs: impacted, removeTogether, houseRules, choices, saves }
}
