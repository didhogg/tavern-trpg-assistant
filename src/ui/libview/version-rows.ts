// 单条【版本管理】的行：这一条的全部版本（原件之外的房规、别的包里的同编号版本），每个版本在哪一层被选用。
// 数据全部来自后端现成的接口：scoped.detail（全部版本）+ custom.edits（哪些版本在哪一层被选用）；这里只把两份对起来排版，不算规则。
import type { Services } from '../../core/services'
import type { EditRow } from '../../library/custom-edits'
import type { CampaignLibrary, EntryRef } from '../../library/scopes'
import { getSource } from '../../library/sources'
import { nameOf } from './pack-data'

/** 没有任何一层选用这个版本。 */
export const NO_LEVEL = 'none'

export type VersionRow = Omit<EditRow, 'level'> & {
  /** 层：campaign / rule:… / global；NO_LEVEL = 没被选用。 */
  level: string
  /** 版本叫什么：房规 1、房规 2……；别的包的版本用包的文件名。 */
  label: string
  /** 房规版本才有：删它要用的（后端 deleteHouseRule 的参数）。 */
  house?: { ref: EntryRef; uniqueId: string; codeSet: string }
}

export interface VersionGroup { ref: EntryRef; name: string; rows: VersionRow[] }

/** 一条条目（中文、英文各一条）的全部版本，按条目分组。 */
export async function versionGroups(s: Services, c: CampaignLibrary, refs: EntryRef[], chosen: EditRow[]): Promise<VersionGroup[]> {
  const scoped = s.backend.library.scoped
  const out: VersionGroup[] = []
  for (const ref of refs) {
    const d = await scoped.detail(c, ref, { browse: true })
    const detail = d && !('hidden' in d) ? d : null
    const mine = chosen.filter((r) => r.ref.set === ref.set && r.ref.prop === ref.prop && r.ref.hash === ref.hash)
    const rows: VersionRow[] = []
    let houseNo = 0
    for (const a of detail?.alternatives ?? []) {
      const isHouse = a.kind === 'houserule'
      if (isHouse) houseNo += 1
      const label = isHouse ? `房规 ${houseNo}` : a.filename ?? '自制包'
      const uniqueId = (a.item as { uniqueId?: unknown } | null)?.uniqueId
      const house = isHouse && a.ref && typeof uniqueId === 'string' ? { ref: a.ref, uniqueId, codeSet: getSource(a.ref.set).codeSet } : undefined
      const base = { ref, altId: a.altId, kind: isHouse ? 'house' as const : 'pack' as const, name: nameOf(a.item), source: (a.item as { source?: string } | null)?.source ?? null, label, ...(house ? { house } : {}) }
      const where = mine.filter((r) => r.altId === a.altId || (a.legacyIds ?? []).includes(r.altId))
      if (!where.length) rows.push({ ...base, level: NO_LEVEL, active: false })
      else for (const r of where) rows.push({ ...base, level: r.level, active: r.active, ...(r.inactive ? { inactive: r.inactive } : {}) })
    }
    // 选过、但这一版已经不在了（比如包卸载了）：照后端给的列出来，还能改回「不使用」
    const known = new Set(rows.map((r) => `${r.altId}|${r.level}`))
    for (const r of mine) if (!known.has(`${r.altId}|${r.level}`) && r.kind !== 'base') rows.push({ ...r, label: r.kind === 'house' ? '房规（已删除）' : '别的版本（已不在）' })
    out.push({ ref, name: detail ? nameOf(detail.base ?? detail.item) : mine[0]?.name ?? ref.hash, rows })
  }
  return out
}
