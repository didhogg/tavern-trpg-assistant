// P3-3b 第 ③ 步：把存档人物（引用 + 选择 + 状态差别）重建小窗里的完整人物；
// 以及把当前完整人物 + 重建基准拆回存档要的三样东西。
// 只做接线；导入/建卡/叠状态全部走结算小窗里的作者入口（frame/commands-level.ts）。
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
  error?: string
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
    const hash = reverse.get(`${prop}|${flags.hash}`) ?? flags.hash
    return { kind: flags.propDroppable!, set: source.id, prop, hash }
  }
}

/** 取小窗里某个角色的完整源数据。 */
export async function actorData(session: KernelSession, id: string): Promise<Record<string, unknown> | null> {
  const actors = await session.call('preparedActors') as Array<{ source: Record<string, unknown> }>
  return actors.find((a) => a.source._id === id)?.source ?? null
}

/** 引用 → 【库】取条目（中文战役取英文对照）→ 小窗导入/建卡/叠状态。 */
export async function rebuildActor(opts: {
  lib: ScopedLibrary
  session: KernelSession
  library: CampaignLibrary
  actor: KernelActor
}): Promise<RebuildResult> {
  const refs = opts.actor.refs
  if (!refs.length) return { status: 'error', error: '这个人物没有引用，无法重建' }
  const fetched = await opts.lib.fetch(opts.library, refs.map((ref) => ({ set: ref.set, prop: ref.prop, hash: ref.hash })))
  const missing: RebuildMissing[] = []
  const entries: Array<{ ref: KernelRef; entry: unknown }> = []
  const zh = officialSourceOf(opts.library.codeSet).lang === 'zh'
  for (let i = 0; i < refs.length; i++) {
    const ref = refs[i]
    const result = fetched[i]
    if (!result.ok) { missing.push({ ref, reason: result.reason }); continue }
    let entry: unknown = result.item
    if (zh) {
      const english = await opts.lib.englishOf(result.ref as EntryRef)
      if (english?.status !== 'found') { missing.push({ ref, reason: english?.status ?? 'english-missing' }); continue }
      entry = english.item
    }
    entries.push({ ref, entry })
  }
  if (missing.length) return { status: 'missing', missing }
  if (entries.some((e) => e.ref.prop === 'monster' || e.ref.kind === 'creature')) {
    return { status: 'error', error: '怪物的重建还没接（P3-3b 只做了人物）' }
  }
  const items = entries.filter((e) => BUILD_ITEM_PROPS.has(e.ref.prop))
    .map((e) => ({ prop: e.ref.prop, entry: e.entry, refKey: refKey(e.ref) }))
  const equipment = entries.filter((e) => !BUILD_ITEM_PROPS.has(e.ref.prop))
    .map((e) => ({ prop: e.ref.prop, entry: e.entry, refKey: refKey(e.ref) }))
  const result = await opts.session.call('rebuildCharacter', {
    name: opts.actor.name,
    items,
    equipment,
    choices: opts.actor.choices as Record<string, unknown[] | undefined>,
    state: opts.actor.state,
  })
  if (result.status === 'pending') return { status: 'pending', error: '重建需要玩家选择' }
  const payload = result.result as { id?: string; data?: Record<string, unknown>; base?: Record<string, unknown> } | null
  if (result.status !== 'complete' || !payload?.data) return { status: 'error', error: result.error ?? '重建没有交出人物' }
  return { status: 'complete', id: payload.id, data: payload.data, base: payload.base }
}

/** 当前完整人物 + 重建基准 → 存档要的引用/选择/状态差别。 */
export async function compactActor(opts: {
  lib: ScopedLibrary
  library: CampaignLibrary
  actor: Pick<KernelActor, 'id' | 'name'>
  current: Record<string, unknown>
  base: Record<string, unknown>
}): Promise<KernelActorCompact> {
  const mapper = await refMapperFor(opts.lib, opts.library)
  const split = splitActor(
    { id: opts.actor.id, name: opts.actor.name, data: opts.current },
    { id: opts.actor.id, name: opts.actor.name, data: opts.base },
    mapper,
  )
  return { id: opts.actor.id, name: opts.actor.name, ...split }
}
