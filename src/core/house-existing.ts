// P5.5 收尾 C3（根因 C）：再改一条官方条目时，它现在生效的是不是已有的房规（中文 / 英文各自）、在哪一层、用在哪些地方。
// 原来这段在界面里（house-existing.ts，抄了层的先后），搬回后端：哪条生效按 custom.houseNow（插件的选择，刚存的也是新的），
// 用在哪里按删除 / 改编号同一套影响检查（impactOfEntries）。界面只把层、战役名显示出来。
import type { CustomLibrary } from '../library/custom'
import type { CampaignLibrary, EntryRef } from '../library/scopes'
import type { RemovalImpact } from './removal-impact'

export type HouseUse = { kind: 'level'; level: string } | { kind: 'campaign'; name: string }
export interface HouseExisting {
  /** 中文 / 英文各自现在生效的那条房规（没有就不给）。 */
  zh?: EntryRef
  en?: EntryRef
  /** 生效的那条房规在哪一层（另一种语言还没有房规、要新建时放到同一层）。 */
  level: string
  /** 用到这条房规的地方：全局 / 某个规则（插件的选择）、某个战役（战役记录和存档）。 */
  usedAt: HouseUse[]
}
type Deps = {
  houseNow: CustomLibrary['houseNow']
  impact: (setId: string, refs: Array<{ prop: string; hash: string }>) => Promise<Pick<RemovalImpact, 'choices' | 'saves'>>
}

export async function houseExisting(d: Deps, c: CampaignLibrary, refs: { zh?: EntryRef; en?: EntryRef }): Promise<HouseExisting | null> {
  const [zh, en] = await Promise.all([refs.zh ? d.houseNow(c, refs.zh) : null, refs.en ? d.houseNow(c, refs.en) : null])
  const found = zh?.house ? zh : en?.house ? en : null
  if (!found?.house || !found.level) return null
  const r = await d.impact(found.house.set, [{ prop: found.house.prop, hash: found.house.hash }])
  const levels = [...new Set(r.choices.map((x) => x.level))].map((level): HouseUse => ({ kind: 'level', level }))
  const camps = [...new Set(r.saves.map((x) => x.ownerLabel))].map((name): HouseUse => ({ kind: 'campaign', name }))
  return { ...(zh?.house ? { zh: zh.house } : {}), ...(en?.house ? { en: en.house } : {}), level: found.level, usedAt: [...levels, ...camps] }
}
