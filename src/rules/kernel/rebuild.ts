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
import type { KernelSession } from './host'

/** Plutonium 的 propDroppable 与【库】类别名的登记表；加一种 = 加一行。 */
const FLAG_PROP: Record<string, string> = {
  creature: 'monster',
}

/** 建卡时走 forNewItem 的顶层条目（会展开成长）；其余作为装备直接放进人物。 */
const BUILD_ITEM_PROPS = new Set(['race', 'background', 'class', 'subclass', 'feat', 'optionalfeature'])

export interface RebuildMissing {
  ref: KernelRef
  reason: string
}

export interface RebuildResult {
  status: 'complete' | 'missing' | 'pending' | 'error'
  id?: string
  data?: Record<string, unknown>
  /** 没叠状态差别的重建基准（同一批编号）。 */
  base?: Record<string, unknown>
  missing?: RebuildMissing[]
  seed?: string
  /** 交的是中文条目的引用（房规 / 备选生效，或没有英文对照），出处标“无英文对照”。 */
  noEnglish?: KernelRef[]
  error?: string
  /** 失败时的原始命令结果，供排查。 */
  detail?: unknown
}

/** 作者编号（Plutonium flags）→ 本战役【库】条目。 */
export async function refMapperFor(lib: ScopedLibrary, library: CampaignLibrary): Promise<KernelRefMapper> {
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
  actor: KernelActor
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
  const items = entries.filter((e) => BUILD_ITEM_PROPS.has(e.ref.prop))
    .map((e) => ({ prop: e.ref.prop, entry: e.entry, refKey: refKey(e.ref) }))
  const equipment = entries.filter((e) => !BUILD_ITEM_PROPS.has(e.ref.prop))
    .map((e) => ({ prop: e.ref.prop, entry: e.entry, refKey: refKey(e.ref) }))
  const result = await opts.session.call('rebuildCharacter', {
    name: opts.actor.name,
    seed: opts.actor.seed || opts.actor.name,
    items,
    equipment,
    choices: opts.actor.choices as Record<string, unknown[] | undefined>,
    state: opts.actor.state,
  })
  if (result.status === 'pending') return { status: 'pending', error: '重建需要玩家选择' }
  const payload = result.result as { id?: string; seed?: string; data?: Record<string, unknown>; base?: Record<string, unknown> } | null
  if (result.status !== 'complete' || !payload?.data) return { status: 'error', error: result.error ?? `重建状态：${result.status}`, detail: result }
  return { status: 'complete', id: payload.id, data: payload.data, base: payload.base, noEnglish }
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
