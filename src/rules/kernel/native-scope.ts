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
import type { NativeLabel, NativePresentation } from './native-presentation'

// 作者有时为浏览器额外生成「本相」等资料卡。原作者同时保留 _rawName，
// 让展示用途的原型卡可与真正进入建卡候选的记录区分开。
type LabelEntry = { name?: string; ENG_name?: string; _rawName?: string; classSource?: string }
const displayIdentity = (item: LabelEntry): string => `${!!item._rawName}|${item.classSource ?? ''}`

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

/** 用已发布资料和中英配对取显示名。作者实例自己判断有哪些候选。 */
export async function nativePresentation(deps: { scoped: ScopedLibrary; service: LibraryService }, c: CampaignLibrary, view: LibraryView): Promise<NativePresentation> {
  const official = officialSourceOf(c.codeSet)
  const chinese = officialSourceOf('cn')
  const hasChinese = await deps.service.officialInstalled(chinese.codeSet, view)
  const pairs: EnglishPairs['pairs'] = hasChinese ? (await deps.scoped.englishPairs(chinese.codeSet, view)).pairs : {}
  const choices = ['race', 'background', 'class', 'subclass', 'feat', 'optionalfeature', 'spell', 'item']
  const names = new Map<string, Set<string>>()
  const labels = await Promise.all([...choices, 'classFeature', 'subclassFeature', 'language'].map(async (prop) => {
    const visible = await deps.scoped.query(c, prop, { view })
    const cnNames = new Map<string, Array<{ label: NativeLabel; identity: string }>>()
    if (official.lang !== 'zh' && hasChinese) {
      for (const row of await deps.scoped.query({ ...c, codeSet: chinese.codeSet }, prop, { view, mode: 'browse' })) {
        const paired = row.ref.set === chinese.id && pairs[prop]?.[row.ref.hash]
        const item = row.item as LabelEntry | null
        if (!paired || !item?.name) continue
        const matches = cnNames.get(paired.enHash) ?? []
        matches.push({ label: { name: item.name, ref: row.ref }, identity: displayIdentity(item) })
        cnNames.set(paired.enHash, matches)
      }
    }
    const list: Array<[string, NativeLabel]> = []
    for (const row of visible) {
      const nativeHash = official.lang === 'zh' && row.ref.set === official.id ? pairs[prop]?.[row.ref.hash]?.enHash : row.ref.hash
      const item = row.item as LabelEntry | null
      if (!nativeHash || !item?.name) continue
      const matches = row.ref.set === official.id ? cnNames.get(nativeHash) : undefined
      const sameKind = matches?.filter((candidate) => candidate.identity === displayIdentity(item))
      const counterpart = sameKind?.length === 1 ? sameKind[0].label : undefined
      const label = counterpart ?? { name: item.name, ref: row.ref, ...(row.pack ? { selection: { docIdLocal: row.pack.docIdLocal } } : {}) }
      if (choices.includes(prop)) list.push([nativeHash, label])
      const en = official.lang === 'zh' ? item.ENG_name : item.name
      if (en) {
        const key = en.trim().toLowerCase()
        const values = names.get(key) ?? new Set<string>()
        values.add(label.name)
        names.set(key, values)
      }
    }
    return [prop, Object.fromEntries(list)] as const
  }))
  return {
    labels: Object.fromEntries(labels),
    terms: Object.fromEntries([...names].flatMap(([key, values]) => values.size === 1 ? [[key, [...values][0]]] : [])),
  }
}
