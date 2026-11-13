// P5.5 阶段 C G3：编辑 / 覆盖（各层选的版本，包括房规）按书、按包列出，以及整批改作用范围。
// 以前在界面里（ui/libview/edit-rows.ts）按「一个来源」筛；【我的库】的副本包有两个来源（原来源 + 副本自己的），
// 所以改成后端按「包的全部来源 + 包自己这一份」筛，界面只排版。
import type { ChoiceLevel } from './manage'
import type { ScopedLibrary } from './scoped'
import { isPackChoiceKey } from './versions'
import { refKey, type CampaignLibrary, type EntryRef } from './scopes'
import type { FieldChange } from './house-diff'
import { getSource } from './sources'

export type EditLevel = 'campaign' | ChoiceLevel

export interface EditRow {
  level: EditLevel
  /** 被改的条目（选版本的目标）。 */
  ref: EntryRef
  /** 选的那一份：'base' = 原件，house:… = 房规，pack:… = 某个包里的同编号条目。 */
  altId: string
  kind: 'house' | 'pack' | 'base' | 'other'
  name: string | null
  source: string | null
}

export interface EditFilter {
  /** 条目来源在这些里面的（书：它的来源；包：包头的全部来源）。不给 = 全部。 */
  sources?: string[]
  /** 或者选的是这些备选（包自己这一份，versions.packAltId）。 */
  altIds?: string[]
  /** 只列这几条条目的（单条详情 ⋯ → 管理；驾驶员 2026-11-13 定）。和上面两个一起给时要同时满足。 */
  refs?: EntryRef[]
}

type Deps = Pick<ScopedLibrary, 'storedItem' | 'choose' | 'manage'>

const kindOf = (altId: string): EditRow['kind'] => (altId === 'base' ? 'base' : altId.startsWith('house:') ? 'house' : altId.startsWith('pack:') || altId.startsWith('doc:') ? 'pack' : 'other')

const parseRef = (key: string): EntryRef => {
  const [set, prop, ...hash] = key.split('|')
  return { set, prop, hash: hash.join('|') }
}

/** 各层的逐条选择（整包选用不在这里，见 custom.choosePack）；campaign 给了就连本战役层一起列。 */
export async function listEdits(d: Deps, filter: EditFilter = {}, campaign?: CampaignLibrary | null): Promise<EditRow[]> {
  const raw: Array<{ level: EditLevel; target: string; altId: string }> = [
    ...Object.entries(campaign?.choices ?? {}).filter(([k]) => !isPackChoiceKey(k)).map(([target, altId]) => ({ level: 'campaign' as const, target, altId })),
    ...(await d.manage.allChoices()).map((c) => ({ ...c, level: c.level as EditLevel })),
  ]
  const sources = filter.sources ? new Set(filter.sources.map((s) => s.toLowerCase())) : null
  const alts = new Set(filter.altIds ?? [])
  const only = filter.refs ? new Set(filter.refs.map(refKey)) : null
  const out: EditRow[] = []
  for (const c of raw) {
    if (only && !only.has(c.target)) continue
    const ref = parseRef(c.target)
    const stored = await d.storedItem(ref)
    const source = stored?.source ?? null
    if (sources && !(source && sources.has(source.toLowerCase())) && !alts.has(c.altId)) continue
    const name = (stored?.item as { name?: unknown } | undefined)?.name
    out.push({ level: c.level, ref, altId: c.altId, kind: kindOf(c.altId), name: typeof name === 'string' ? name : null, source })
  }
  return out
}

/** 把这些选择挪到另一层（例如房规从本战役改成全局）。本战役层在战役设置里：返回新的战役选书设置，调用方写回。 */
export async function moveEdits(d: Deps, c: CampaignLibrary, rows: Array<Pick<EditRow, 'level' | 'ref' | 'altId'>>, to: EditLevel): Promise<CampaignLibrary> {
  let cur = c
  for (const r of rows) {
    if (r.level === to) continue
    cur = await d.choose(cur, r.ref, null, r.level)
    cur = await d.choose(cur, r.ref, r.altId, to)
  }
  return cur
}

type Ent = Record<string, unknown>
type Frame = { call: (cmd: never, ...args: never[]) => Promise<unknown> }
type ChangeDeps = Pick<ScopedLibrary, 'detail'> & {
  changes: (codeSet: string, before: Ent | null, after: Ent) => Promise<FieldChange[]>
  frameOf: (codeSet: string) => Promise<Frame>
}

/** 房规原文（可编辑自制里那一条，只写了改动的字段；P5.5 B1）。 */
async function houseRaw(d: ChangeDeps, codeSet: string, prop: string, hash: string): Promise<Ent | null> {
  const f = (await d.frameOf(codeSet)) as unknown as { call: (cmd: string, ...a: unknown[]) => Promise<{ entity?: Ent } & Array<{ docIdLocal: string; isEditable: boolean }>> }
  const doc = ((await f.call('brewDocIndex')) as Array<{ docIdLocal: string; isEditable: boolean }>).find((x) => x.isEditable)
  return doc ? ((await f.call('packEntity', doc.docIdLocal, prop, { hash }))?.entity ?? null) : null
}

/**
 * 一条编辑 / 覆盖「改了什么」（覆盖管理里展开看；驾驶员 2026-11-13 定）：按这一行选的那一份取条目（本战役层临时选它），
 * 和原件比（custom.changes，同保存前「改了哪几项」）。选的是原件就没有改动。条目取不到给 null。
 * 房规只列房规原文里写了的字段（含 _mod 改的）：作者 _copy 合并时本来就不抄页码、图片标记、参考来源这些（作者 _MERGE_REQUIRES_PRESERVE），
 * 中文版还会去掉译者，整条比会把它们误报成「删掉了」。
 */
export async function editChanges(d: ChangeDeps, c: CampaignLibrary, row: Pick<EditRow, 'ref' | 'altId'>): Promise<{ changes: FieldChange[]; item: unknown; base: unknown } | null> {
  const forced = { ...c, choices: { ...c.choices, [refKey(row.ref)]: row.altId } }
  const got = await d.detail(forced, row.ref, { browse: true })
  if (!got || 'hidden' in got) return null
  if (row.altId === 'base' || got.item === got.base) return { changes: [], item: got.item, base: got.base }
  const codeSet = getSource(row.ref.set).codeSet
  let changes = await d.changes(codeSet, got.base as Ent, got.item as Ent)
  if (row.altId.startsWith('house:')) {
    const raw = await houseRaw(d, codeSet, row.ref.prop, row.altId.slice('house:'.length))
    if (raw) {
      const mod = ((raw._copy as { _mod?: Ent } | undefined)?._mod) ?? {}
      const own = new Set([...Object.keys(raw), ...Object.keys(mod)].filter((k) => !k.startsWith('_') && k !== 'source' && k !== 'uniqueId'))
      changes = changes.filter((x) => own.has(x.field))
    }
  }
  return { changes, item: got.item, base: got.base }
}
