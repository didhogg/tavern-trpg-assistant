// 删除 / 卸载前的影响预览（P5 B-08）：删一套官方资料、或删若干自制包之前，列出会连带影响的东西。
// 作者的删除函数只按编号删、不检查依赖（utils-brew-base.js 的 _pDeleteBrews_），插件要自己列。纯读取，不改任何数据。
// 在 core 层：要同时读【库】（自制包、房规、版本选择）和用户数据库（战役、存档里的内核段）。
import type { TrpgDatabase } from './db'
import type { BrewPack, BrewPacks } from '../library/brew-packs'
import type { HouseRuleLink, ManageStore } from '../library/manage'
import { getSource } from '../library/sources'
import { kernelCampaignSchema, type KernelCampaign } from '../schemas/kernel'

export type RemovalTarget =
  | { kind: 'official'; setId: string }
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
  /** 依赖它的自制包（或：删官方资料后启动不了的自制包）。 */
  packs: Array<{ docIdLocal: string; filename: string | null; why: string }>
  houseRules: HouseRuleLink[]
  choices: Array<{ level: string; target: string; altId: string }>
  saves: AffectedSave[]
}

export interface ImpactDeps {
  db: Pick<TrpgDatabase, 'workspaces' | 'saves'>
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
  codeSet: string
  official: boolean
  /** 自制：被删包里的来源（小写）与每类的作者编号。 */
  sources: Set<string>
  hashes: Map<string, Set<string>>
  altIds: Set<string>
}

function removedOf(target: RemovalTarget, packs: BrewPack[]): Removed {
  const set = getSource(target.setId)
  const gone = target.kind === 'brew' ? packs.filter((p) => target.docIdLocals.includes(p.docIdLocal)) : []
  const hashes = new Map<string, Set<string>>()
  for (const p of gone) for (const [prop, hs] of Object.entries(p.hashes)) hashes.set(prop, new Set([...(hashes.get(prop) ?? []), ...hs]))
  return { setId: set.id, codeSet: set.codeSet, official: target.kind === 'official', sources: lower(gone.flatMap((p) => p.sources)), hashes, altIds: new Set(gone.map((p) => `doc:${p.docIdLocal}`)) }
}

const refGone = (r: Removed, ref: { set: string; prop: string; hash: string }): boolean =>
  ref.set === r.setId && (r.official || !!r.hashes.get(ref.prop)?.has(ref.hash))

/** 一份内核段（战役当前数据或存档）里哪些东西用了被删资料。 */
function whyKernel(k: KernelCampaign, r: Removed): string[] {
  const why: string[] = []
  if (r.official && k.library.codeSet === r.codeSet) why.push('这个战役用的是这套资料')
  const refs = k.actors.flatMap((a) => a.refs).filter((ref) => refGone(r, ref)).length
  if (refs) why.push(`${refs} 处人物引用`)
  if (k.library.include.concat(k.library.exclude).some((u) => r.sources.has(u.replace(/^src:/, '')))) why.push('选书设置里有它的来源')
  if (Object.entries(k.library.choices).some(([key, alt]) => r.altIds.has(alt) || refGone(r, refOfKey(key)))) why.push('选了它的版本')
  if (k.overrides.some((o) => refGone(r, o.target) || refGone(r, o.house))) why.push('有房规覆盖')
  return why
}

const refOfKey = (key: string): { set: string; prop: string; hash: string } => {
  const [set = '', prop = '', ...rest] = key.split('|')
  return { set, prop, hash: rest.join('|') }
}

export async function impactOfRemoval(deps: ImpactDeps, target: RemovalTarget): Promise<RemovalImpact> {
  const set = getSource(target.setId)
  const brewSetId = target.kind === 'brew' ? target.setId : deps.brewSetOf(set.codeSet)
  const packs = await deps.brewPacks.list(brewSetId).catch(() => [] as BrewPack[])
  const removed = removedOf(target, packs)

  // 自制包
  const impacted: RemovalImpact['packs'] = []
  if (target.kind === 'official') {
    for (const p of packs) impacted.push({ docIdLocal: p.docIdLocal, filename: p.filename, why: '自制内容要靠这套官方资料才能运行，重新下载之前用不了' })
  } else {
    for (const p of packs) {
      if (target.docIdLocals.includes(p.docIdLocal)) continue
      const needs = lower(Object.values((p.dependencies ?? {}) as Record<string, string[]>).flat())
      const hit = [...removed.sources].find((s) => needs.has(s))
      if (hit) impacted.push({ docIdLocal: p.docIdLocal, filename: p.filename, why: `依赖被删包里的来源 ${hit}` })
    }
  }

  // 房规、版本选择
  const houseRules = (await deps.manage.houseRules()).filter((l) => refGone(removed, l.house) || refGone(removed, l.target))
  const choices = (await deps.manage.allChoices()).filter((c) => removed.altIds.has(c.altId) || refGone(removed, refOfKey(c.target)))

  // 战役与存档
  const saves: AffectedSave[] = []
  for (const ws of await deps.db.workspaces.toArray()) {
    const k = kernelOf(ws.data)
    const why = k ? whyKernel(k, removed) : []
    if (why.length) saves.push({ ownerKey: ws.ownerKey, ownerLabel: ws.ownerLabel, saveId: null, name: '当前数据', kind: 'current', deleted: false, why })
  }
  for (const s of await deps.db.saves.toArray()) {
    const k = kernelOf(s.snapshot)
    const why = k ? whyKernel(k, removed) : []
    if (why.length) saves.push({ ownerKey: s.ownerKey, ownerLabel: s.ownerLabel, saveId: s.id, name: s.name, kind: s.kind, deleted: s.deletedAt !== undefined, why })
  }
  return { target, packs: impacted, houseRules, choices, saves }
}
