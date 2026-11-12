// 勾选检查（P5-5 §13.1）：冒险正文要先有同一套官方资料。规则只在这里一份，向导、下载页、开局都用它，界面不自己判断。
// 依据：下载冒险时 tasks.startAdventure 也是这条（那套官方资料没装就报「还没安装，先装官方数据」），这里只是提前告诉界面。
import type { LibraryView } from './revision'
import { SOURCES } from './sources'

export const ADVENTURE_NEEDS_OFFICIAL = '冒险正文要先有同一套官方资料：先下载或勾选至少一本官方书'

export interface SelectionInput {
  /** 这次勾的官方书 / 来源（每行带数据集）。下载页不传：它的书和冒险同时开下载，这次勾的书不算（驾驶员 2026-11-12 定 A）。 */
  picks?: Array<{ set: string }>
  /** 这次勾的冒险。 */
  adventures?: Array<{ set: string; id: string }>
  /** 旧入口「整套装」会装好的数据集：当成已勾。 */
  wholeSets?: string[]
}

export interface SelectionCheck {
  /** 每套官方资料：能不能勾 / 下冒险，不能时的原因。 */
  sets: Record<string, { adventures: boolean; reason: string | null }>
  /** 勾了但下不了的冒险（界面据此取消勾选；开局据此拒绝）。 */
  drop: Array<{ set: string; id: string }>
}

export async function checkSelection(view: LibraryView, input: SelectionInput = {}): Promise<SelectionCheck> {
  const picked = new Set([...(input.picks ?? []).map((p) => p.set), ...(input.wholeSets ?? [])])
  const sets: SelectionCheck['sets'] = {}
  for (const s of SOURCES.filter((x) => x.kind === 'official')) {
    const ok = (await view.officialState(s.id))?.status === 'installed' || picked.has(s.id)
    sets[s.id] = { adventures: ok, reason: ok ? null : ADVENTURE_NEEDS_OFFICIAL }
  }
  return { sets, drop: (input.adventures ?? []).filter((a) => !sets[a.set]?.adventures) }
}
