// P5.5 阶段 C G3：编辑 / 覆盖（各层选的版本，包括房规）按书、按包列出，以及整批改作用范围。
// 以前在界面里（ui/libview/edit-rows.ts）按「一个来源」筛；【我的库】的副本包有两个来源（原来源 + 副本自己的），
// 所以改成后端按「包的全部来源 + 包自己这一份」筛，界面只排版。
import type { ChoiceLevel } from './manage'
import type { ScopedLibrary } from './scoped'
import { isPackChoiceKey } from './versions'
import type { CampaignLibrary, EntryRef } from './scopes'

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
  const out: EditRow[] = []
  for (const c of raw) {
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
