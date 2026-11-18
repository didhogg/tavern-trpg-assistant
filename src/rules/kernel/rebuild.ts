// P3-3b 第 ③ 步：把存档人物（引用 + 选择 + 状态差别）重建小窗里的完整人物；
// 以及把当前完整人物 + 重建基准拆回存档要的三样东西。
// 只做接线；导入/建卡/叠状态全部走结算小窗里的作者入口（frame/commands-level.ts）。
import { kernelEntryOf } from './entry'
import type { KernelActorCompact } from '../../core/saves/kernel'
import { refKey, splitActor, type KernelRefMapper } from '../../core/saves/split'
import type { EntryRef, CampaignLibrary } from '../../library/scopes'
import type { ScopedLibrary } from '../../library/scoped'
import { officialSourceOf } from '../../library/sources'
import type { KernelActor, KernelRef } from '../../schemas/kernel'
/** 重建的人物：带编号 = 读档沿用存档编号；不带 = 新人物（复制品）由小窗起新编号。 */
export type RebuildInput = Omit<KernelActor, 'id'> & { id?: string }
import type { KernelSession } from './host'
import { ruleKernel } from './adapters'

/** Plutonium 的 propDroppable 与【库】类别名的登记表；加一种 = 加一行。 */
const FLAG_PROP: Record<string, string> = {
  creature: 'monster',
}


export interface RebuildMissing {
  ref: KernelRef
  reason: string
}

export interface RebuildResult {
  status: 'complete' | 'missing' | 'pending' | 'error'
  id?: string
  data?: Record<string, unknown>
  /** 没叠状态差别的重建基准（同一批编号；完整，取下之前）。 */
  base?: Record<string, unknown>
  /** 按取下安排处理后、叠状态前的视图；没有取下时不给（= base）。 */
  view?: Record<string, unknown>
  /** 取下时作者 reverse 记下的原始选择（prepared.ts protect 用）。 */
  offChoices?: Record<string, Array<{ id: string; type: string; level: number; data: unknown }>>
  missing?: RebuildMissing[]
  seed?: string
  /** 交的是中文条目的引用（房规 / 备选生效，或没有英文对照），出处标“无英文对照”。 */
  noEnglish?: KernelRef[]
  error?: string
  /** 失败时的原始命令结果，供排查。 */
  detail?: unknown
}

/**
 * 作者编号（Plutonium flags 的 类别 + 编号）→ 本战役【库】条目。
 * 先查这一套自制包（所有类别一视同仁，见 EntryLinks.customRefs），查不到再按官方来源对（中文战役走中英对照）。
 */
export async function refMapperFor(lib: ScopedLibrary, library: CampaignLibrary): Promise<KernelRefMapper> {
  const custom = await lib.links.customRefs(library.codeSet)
  const propOf = (flags: { propDroppable?: string }) => flags.propDroppable ? FLAG_PROP[flags.propDroppable] ?? flags.propDroppable : null
  const official = await officialMapperFor(lib, library)
  return (flags) => {
    const prop = propOf(flags)
    const mine = prop && flags.hash ? custom.get(`${prop}|${flags.hash}`) : undefined
    return mine ? { kind: flags.propDroppable!, ...mine } : official(flags)
  }
}

async function officialMapperFor(lib: ScopedLibrary, library: CampaignLibrary): Promise<KernelRefMapper> {
  const source = officialSourceOf(library.codeSet)
  if (source.lang !== 'zh') {
    return (flags) => {
      const prop = flags.propDroppable ? FLAG_PROP[flags.propDroppable] ?? flags.propDroppable : null
      return prop && flags.source && flags.hash
        ? { kind: flags.propDroppable!, set: source.id, prop, hash: flags.hash }
        : null
    }
  }
  const pairs = await lib.englishPairs(library.codeSet).catch(() => null)
  const reverse = new Map<string, string>()
  if (pairs) {
    for (const [prop, rows] of Object.entries(pairs.pairs)) {
      for (const [cnHash, hit] of Object.entries(rows)) reverse.set(`${prop}|${hit.enHash}`, cnHash)
    }
  }
  return (flags) => {
    const prop = flags.propDroppable ? FLAG_PROP[flags.propDroppable] ?? flags.propDroppable : null
    if (!prop || !flags.source || !flags.hash) return null
    const hash = reverse.get(`${prop}|${flags.hash}`)
    if (!hash) return null
    return { kind: flags.propDroppable!, set: source.id, prop, hash }
  }
}

/** 取小窗里某个角色的完整源数据。 */
export async function actorData(session: KernelSession, id: string): Promise<Record<string, unknown> | null> {
  const actors = await session.call('preparedActors')
  return actors.find((a) => a.source._id === id)?.source ?? null
}

/** 取小窗里某个角色准备后的数值（角色卡实际显示的 system）。 */
export async function actorPrepared(session: KernelSession, id: string): Promise<Record<string, unknown> | null> {
  const actors = await session.call('preparedActors')
  return actors.find((a) => a.source._id === id)?.system ?? null
}

/** 引用 → 【库】取条目（中文战役取英文对照）→ 小窗导入/建卡/叠状态。 */
export async function rebuildActor(opts: {
  lib: ScopedLibrary
  session: KernelSession
  library: CampaignLibrary
  actor: RebuildInput
  brewIssue?: (ref: EntryRef, altId: string | null, source: string | null) => string | null
  view?: import('../../library/revision').LibraryView
}): Promise<RebuildResult> {
  const refs = opts.actor.refs
  if (!refs.length) return { status: 'error', error: '这个人物没有引用，无法重建' }
  const fetched = await opts.lib.fetch(opts.library, refs.map((ref) => ({ set: ref.set, prop: ref.prop, hash: ref.hash })), opts.view)
  const missing: RebuildMissing[] = []
  const entries: Array<{ ref: KernelRef; entry: unknown }> = []
  const noEnglish: KernelRef[] = []
  for (let i = 0; i < refs.length; i++) {
    const ref = refs[i]
    const result = fetched[i]
    if (!result.ok) { missing.push({ ref, reason: result.reason }); continue }
    const issue = opts.brewIssue?.(result.ref, result.version.altId, result.source)
    if (issue) { missing.push({ ref, reason: issue }); continue }
    const k = await kernelEntryOf(opts.lib, opts.library.codeSet, result.ref as EntryRef, result.item, result.version.altId, opts.view)
    if (k.noEnglish) noEnglish.push(ref)
    entries.push({ ref, entry: k.entry })
  }
  if (missing.length) return { status: 'missing', missing }
  const monsters = entries.filter((e) => e.ref.prop === 'monster' || e.ref.kind === 'creature')
  if (monsters.length) {
    if (entries.length !== 1) return { status: 'error', error: '怪物人物同时带其他顶层条目，无法判断怎么重建' }
    const result = await opts.session.call('rebuildMonster', { entry: monsters[0].entry, name: opts.actor.name, state: opts.actor.state })
    if (result.status === 'pending') return { status: 'pending', error: '重建怪物需要玩家选择' }
    const payload = result.result as { id?: string; seed?: string; data?: Record<string, unknown>; base?: Record<string, unknown> } | null
    if (result.status !== 'complete' || !payload?.data) return { status: 'error', error: result.error ?? `重建状态：${result.status}`, detail: result }
    return { status: 'complete', id: payload.id, data: payload.data, base: payload.base, seed: payload.seed, noEnglish }
  }
  // 建卡时走成长步骤的类别 = 规则数据 kernel.build；其余作为装备直接放进人物。
  const buildProps = new Set(ruleKernel(opts.library.rule)?.build ?? [])
  const items = entries.filter((e) => buildProps.has(e.ref.prop))
    .map((e) => ({ prop: e.ref.prop, entry: e.entry, refKey: refKey(e.ref) }))
  const equipment = entries.filter((e) => !buildProps.has(e.ref.prop))
    .map((e) => ({ prop: e.ref.prop, entry: e.entry, refKey: refKey(e.ref) }))
  const result = await opts.session.call('rebuildCharacter', {
    id: opts.actor.id,
    name: opts.actor.name,
    seed: opts.actor.seed || opts.actor.name,
    items,
    equipment,
    choices: opts.actor.choices as Record<string, unknown[] | undefined>,
    state: opts.actor.state,
    off: opts.actor.off,
  })
  if (result.status === 'pending') return { status: 'pending', error: '重建需要玩家选择' }
  const payload = result.result as { id?: string; seed?: string; data?: Record<string, unknown>; base?: Record<string, unknown>; view?: Record<string, unknown>; offChoices?: RebuildResult['offChoices'] } | null
  if (result.status !== 'complete' || !payload?.data) return { status: 'error', error: result.error ?? `重建状态：${result.status}`, detail: result }
  return { status: 'complete', id: payload.id, data: payload.data, base: payload.base, view: payload.view, offChoices: payload.offChoices, noEnglish }
}

/** 当前完整人物 + 重建基准 + 官方 reverse 选择 → 存档要的引用/选择/状态差别。 */
export async function compactActor(opts: {
  lib: ScopedLibrary
  library: CampaignLibrary
  actor: Pick<KernelActor, 'id' | 'name'>
  seed?: string
  current: Record<string, unknown>
  base: Record<string, unknown>
  choices: Record<string, unknown>
}): Promise<KernelActorCompact> {
  const mapper = await refMapperFor(opts.lib, opts.library)
  const split = splitActor(
    { id: opts.actor.id, name: opts.actor.name, data: opts.current },
    { id: opts.actor.id, name: opts.actor.name, data: opts.base },
    mapper,
    opts.choices,
  )
  for (const ref of split.refs) {
    const stored = await opts.lib.storedItem(ref)
    const name = (stored?.item as { name?: string } | null)?.name
    if (name) ref.label = name
  }
  // captureChoices 按 Plutonium flags 记；存档里按【库】引用键存。
  const items = Array.isArray(opts.current.items) ? opts.current.items as Array<Record<string, unknown>> : []
  const byFlags = new Map<string, string>()
  for (const ref of split.refs) {
    const item = items.find((row) => row._id === ref.itemId)
    const flags = item && typeof item.flags === 'object' && item.flags
      ? (item.flags as Record<string, unknown>).plutonium as Record<string, unknown> | undefined : undefined
    if (flags?.propDroppable && flags.source && flags.hash) {
      byFlags.set(`${flags.propDroppable}|${flags.source}|${flags.hash}`, refKey(ref))
    }
  }
  const choices: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(split.choices)) {
    const mapped = byFlags.get(key)
    if (!mapped) throw new Error(`选择记录没有对应的引用：${key}`)
    choices[mapped] = value
  }
  return { id: opts.actor.id, name: opts.actor.name, seed: opts.seed ?? opts.actor.name, ...split, choices }
}
