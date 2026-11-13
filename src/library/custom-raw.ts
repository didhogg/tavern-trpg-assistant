// P5.5 收尾 C2（根因 B）：要改、要写之前读「现在的原文」，不读后台解析的结果。
// 存完是立刻发布、后台停手 5 秒才解析（§14，驾驶员批准）：只看的地方晚几秒标「更新中」没关系，
// 但拿来改 / 写的内容必须是新的——否则会拿旧内容盖掉刚存的。这里是唯一的读法：
//   官方条目 → 解析结果（官方不会被编辑）；自己的包 / 房规 → 作者存储里的原文；
//   房规生效的样子 → 战役 / 规则 / 全局层的选择（插件记录，存完就是新的）+ 房规原文，用作者单条合并当场拼（mergeOne）。
import { stableStringify } from '../core/hash'
import type { EditFilter, EditRow } from './custom-edits'
import type { FieldChange } from './house-diff'
import type { LibraryService } from './service'
import type { ScopedLibrary } from './scoped'
import type { CampaignLibrary, EntryRef } from './scopes'
import { getSource } from './sources'
import { levelRank } from './versions'

type Ent = Record<string, unknown>
type Frame = { call: (cmd: string, ...a: unknown[]) => Promise<unknown> }
export type RawDeps = { lib: Pick<LibraryService, 'frameOf' | 'storedItem'> }

/** 一条现在的原文。自制的给所在的包（可编辑自制 = 房规）和作者 uniqueId。找不到给 null。 */
export async function rawEntry(d: RawDeps, ref: EntryRef): Promise<{ entity: Ent; docIdLocal: string | null; uniqueId: string | null } | null> {
  const set = getSource(ref.set)
  if (set.kind === 'official') {
    const s = await d.lib.storedItem(ref.set, ref.prop, ref.hash)
    return s ? { entity: s.item as Ent, docIdLocal: null, uniqueId: null } : null
  }
  const f = (await d.lib.frameOf(set.codeSet)) as unknown as Frame
  const docs = ((await f.call('brewDocIndex')) as Array<{ docIdLocal: string; isEditable: boolean }>) ?? []
  // 可编辑自制（房规）先找，再找各个包
  for (const doc of [...docs].sort((a, b) => Number(b.isEditable) - Number(a.isEditable))) {
    const got = (await f.call('packEntity', doc.docIdLocal, ref.prop, { hash: ref.hash })) as { entity: Ent; hadId: boolean } | null
    if (got) return { entity: got.entity, docIdLocal: doc.docIdLocal, uniqueId: got.hadId ? String(got.entity.uniqueId) : null }
  }
  return null
}

export interface HouseNow {
  /** 这个战役里这一条现在用的是哪一份：'base' = 原件，house:… = 房规，别的 = 别的版本。 */
  altId: string
  /** 现在生效的是房规时：那条房规、在哪一层。 */
  house: EntryRef | null
  level: string | null
  /** 房规原文（作者 _copy 只记改动的那一条）。 */
  raw: Ent | null
  /** 现在生效的样子（房规：当场拼；别的版本：读解析结果）。 */
  item: Ent
  /** 原件。 */
  base: Ent
  /**
   * 编辑器从这一份开始改（C3）：生效的样子 + 作者合并不抄的字段（页码、图片标记……，房规原文没写的）从原件补回。
   * 这些字段作者合并本来就不抄（DataUtil.generic._MERGE_REQUIRES_PRESERVE），补回来只是让编辑器不把它们当成「改过」；
   * 存的时候和原件一样就不写，生效的结果不变。
   */
  start: Ent
  /** 房规和原件比改了什么：只看房规原文里写了的字段（含 _mod 改的），原件是什么 → 现在是什么。不是房规为空。 */
  changes: FieldChange[]
}

/** 房规原文自己写了哪些字段（作者 _copy 只记改动；_mod 改的也算）。 */
const ownFields = (raw: Ent): string[] => {
  const mod = ((raw._copy as { _mod?: Ent } | undefined)?._mod) ?? {}
  return [...new Set([...Object.keys(raw), ...Object.keys(mod)])].filter((k) => !k.startsWith('_') && k !== 'source' && k !== 'uniqueId')
}

/** 唯一的「房规改了什么」算法：覆盖列表、编辑器、预览、存房规看到的都是这一份（C3）。 */
export function houseChanges(base: Ent, raw: Ent, item: Ent): FieldChange[] {
  return ownFields(raw)
    .filter((k) => stableStringify(base[k] ?? null) !== stableStringify(item[k] ?? null))
    .map((field) => ({ field, before: base[field], after: field in item ? item[field] : null }))
    .sort((a, b) => a.field.localeCompare(b.field))
}

/** 编辑器的起始内容：生效的样子 + 房规原文没写、作者合并没抄的字段从原件补回。 */
function startOf(base: Ent, raw: Ent, item: Ent): Ent {
  const written = new Set(ownFields(raw))
  const out: Ent = { ...item }
  for (const [k, v] of Object.entries(base)) if (!(k in out) && !written.has(k)) out[k] = v
  return out
}
/** 一条房规对着它改的那一条：原件、原文、当场拼出的生效样子、编辑器起始内容、改了什么（houseNow 和覆盖列表共用这一处）。房规不在了给 null。 */
export async function houseVersion(d: RawDeps, target: EntryRef, house: EntryRef): Promise<Pick<HouseNow, 'raw' | 'item' | 'base' | 'start' | 'changes'> | null> {
  const f = (await d.lib.frameOf(getSource(target.set).codeSet)) as unknown as Frame
  const [orig, got] = await Promise.all([rawEntry(d, target), rawEntry(d, house)])
  if (!orig || !got) return null
  const base = (await f.call('cleanEntity', orig.entity)) as Ent
  const raw = got.entity
  const item = (await f.call('mergeOne', target.prop, raw)) as Ent
  return { raw, item, base, start: startOf(base, raw, item), changes: houseChanges(base, raw, item) }
}

export type HouseNowDeps = RawDeps & {
  edits: (filter: EditFilter, c?: CampaignLibrary | null) => Promise<EditRow[]>
  detail: ScopedLibrary['detail']
  houseSet: (codeSet: string) => string
}

/** 层的先后（versions.levelRank，和 chooseVersion 同一个顺序）；别的规则的层不算。 */
const rank = (c: CampaignLibrary, level: string): number => levelRank(c.rule, level)

export async function houseNow(d: HouseNowDeps, c: CampaignLibrary, target: EntryRef): Promise<HouseNow> {
  const codeSet = getSource(target.set).codeSet
  const f = (await d.lib.frameOf(codeSet)) as unknown as Frame
  const orig = await rawEntry(d, target)
  if (!orig) throw new Error('找不到这一条')
  const base = (await f.call('cleanEntity', orig.entity)) as Ent
  const rows = (await d.edits({ refs: [target] }, c)).filter((r) => r.ref.set === target.set && r.ref.hash === target.hash && rank(c, r.level) >= 0)
  const top = rows.sort((a, b) => rank(c, a.level) - rank(c, b.level))[0]
  const plainOf = (altId: string, level: string | null, item: Ent): HouseNow => ({ altId, house: null, level, raw: null, item, base, start: item, changes: [] })
  if (!top || top.altId === 'base') return plainOf('base', top?.level ?? null, base)
  if (top.altId.startsWith('house:')) {
    const house = { set: d.houseSet(codeSet), prop: target.prop, hash: top.altId.slice('house:'.length) }
    const v = await houseVersion(d, target, house)
    // 房规被删了：回到原件（和 chooseVersion 选过的备选不在了一样）
    return v ? { altId: top.altId, house, level: top.level, ...v } : plainOf('base', null, base)
  }
  // 别的版本（包里同编号的那一份）：只读，照解析结果
  const det = await d.detail(c, target, { browse: true })
  return plainOf(top.altId, top.level, (det && !('hidden' in det) ? det.item : base) as Ent)
}
