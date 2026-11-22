// P6 第 2 段：本战役的资料范围 → 作者屏蔽名单（只给建卡专用小窗用，frame/commands-native.ts）。
// 不另写范围规则：直接用现有的战役范围判断（scoped.query 交回的 visible，和全局搜索、建卡选东西同一份结果）。
// 本战役看不到的每一条（关掉的书、关掉的条目、不在本战役规则范围里的）→ 作者名单的一行；
// 中文战役换成作者看到的英文对照编号（englishPairs，和建卡交作者英文对照同一份配对）。
// 类别不写清单：按这套官方资料实际有的全部类别逐类查。
import type { ScopedLibrary } from '../../library/scoped'
import type { EnglishPairs, LibraryService } from '../../library/service'
import type { LibraryView } from '../../library/revision'
import type { CampaignLibrary, EntryRef } from '../../library/scopes'
import { officialSourceOf } from '../../library/sources'
import type { ExcludeRow } from './frame/commands-native'
import type { NativePickLabels } from './frame/native-builder-ui'

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

/** 只传库中已开启的条目的显示名。真正候选、过滤和选择结果仍由正在运行的作者控件决定。 */
export async function nativePickLabels(deps: { scoped: ScopedLibrary; service: LibraryService }, c: CampaignLibrary, view: LibraryView): Promise<NativePickLabels> {
  const official = officialSourceOf(c.codeSet)
  const chinese = officialSourceOf('cn')
  const hasChinese = await deps.service.officialInstalled(chinese.codeSet, view)
  const pairs: EnglishPairs['pairs'] = hasChinese ? (await deps.scoped.englishPairs(chinese.codeSet, view)).pairs : {}
  const labels = await Promise.all(['race', 'background', 'class', 'subclass'].map(async (prop) => {
    const visible = await deps.scoped.query(c, prop, { view })
    const cnNames = new Map<string, string>()
    if (official.lang !== 'zh' && hasChinese) {
      // 中文名只作显示。是否可选仍由当前资料集的 visible 行和小窗的作者筛选共同决定。
      for (const row of await deps.scoped.query({ ...c, codeSet: chinese.codeSet }, prop, { view, mode: 'browse' })) {
        const paired = pairs[prop]?.[row.ref.hash]
        const name = (row.item as { name?: string } | null)?.name
        if (paired && name) cnNames.set(paired.enHash, name)
      }
    }
    const list: Array<[string, string]> = []
    for (const row of visible) {
      const nativeHash = official.lang === 'zh' && row.ref.set === official.id ? pairs[prop]?.[row.ref.hash]?.enHash : row.ref.hash
      const name = (row.item as { name?: string } | null)?.name
      if (nativeHash && name) list.push([nativeHash, row.ref.set === official.id ? cnNames.get(nativeHash) ?? name : name])
    }
    return [prop, Object.fromEntries(list)] as const
  }))
  return Object.fromEntries(labels)
}
