// P6 第 2 段：本战役的资料范围 → 作者屏蔽名单（只给建卡专用小窗用，frame/commands-native.ts）。
// 不另写范围规则：直接用现有的战役范围判断（scoped.query 交回的 visible，和全局搜索、建卡选东西同一份结果）。
// 本战役看不到的每一条（关掉的书、关掉的条目、不在本战役规则范围里的）→ 作者名单的一行；
// 中文战役换成作者看到的英文对照编号（englishPairs，和建卡交作者英文对照同一份配对）。
// 类别不写清单：按这套官方资料实际有的全部类别逐类查。
import type { ScopedLibrary } from '../../library/scoped'
import type { LibraryService } from '../../library/service'
import type { LibraryView } from '../../library/revision'
import type { CampaignLibrary, EntryRef } from '../../library/scopes'
import { officialSourceOf } from '../../library/sources'
import type { ExcludeRow } from './frame/commands-native'

export interface CampaignExcludes {
  rows: ExcludeRow[]
  /** 看不到、但找不到作者那边英文对照编号的条目（拦不住，交给报告，不猜）。 */
  unpaired: EntryRef[]
}

export async function campaignExcludes(deps: { scoped: ScopedLibrary; service: LibraryService }, c: CampaignLibrary, view: LibraryView): Promise<CampaignExcludes> {
  const official = officialSourceOf(c.codeSet)
  const pairs = official.lang === 'zh' ? (await deps.scoped.englishPairs(c.codeSet, view)).pairs : null
  const props = Object.keys(await deps.service.categories(official.id, view))
  const rows: ExcludeRow[] = []
  const unpaired: EntryRef[] = []
  for (const prop of props) {
    for (const row of await deps.scoped.query(c, prop, { mode: 'browse', view })) {
      if (row.visible) continue
      const paired = pairs && row.ref.set === official.id ? pairs[prop]?.[row.ref.hash] : null
      const hash = pairs && row.ref.set === official.id ? paired?.enHash : row.ref.hash
      const source = paired?.enSource ?? row.source
      if (!hash || !source) { unpaired.push(row.ref); continue }
      rows.push({ displayName: hash, hash, category: prop, source })
    }
  }
  return { rows, unpaired }
}
