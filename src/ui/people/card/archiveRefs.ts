/**
 * 档案项（抗性、免疫、状态免疫、感官、语言、武器、护甲、工具）→ 库里对应的条目（T1）。
 * 点开药丸看到的就是库的资料片，不再有手写的说明与页码：找到条目就嵌入它；找不到就只显示名称、类别、获得方式，
 * 并（有的话）给一个「规则」入口跳到库里讲这一类的速查条目。判断全靠条目自己的字段（英文名、`data.code`、`category`），没有名称对照表。
 */
import type { ArchiveGroupKey, ArchiveItem } from './archive'
import type { CardData, CardEntry } from './cardData'
import { CATEGORY_NAME, type InfoModel } from './info'

const fold = (s: string): string => s.toLowerCase().replace(/[^a-z0-9]/g, '')

/** 每一类在库里由哪条速查规则讲（按英文名找；没安装对应的书就没有这个入口）。这是「指路」，不是内容。 */
export const HELP_NAME_EN: Record<ArchiveGroupKey, string> = {
  resist: 'Damage and Healing', immune: 'Damage and Healing', vulnerable: 'Damage and Healing', condition: 'Conditions',
  senses: 'Vision and Light', languages: 'Languages', weapons: 'Weapons', armor: 'Armor and Shields', tools: 'Tools',
}

const ruleEntries = (pool: CardEntry[]): CardEntry[] => pool.filter((e) => e.entry.type === 'rule')

/** 速查入口：库里讲这一类的 quickref 规则。 */
export function archiveHelpOf(group: ArchiveGroupKey, pool: CardEntry[]): CardEntry | undefined {
  const want = HELP_NAME_EN[group].toLowerCase()
  return ruleEntries(pool).find((e) => e.entry.data.category === 'quickref' && (e.entry.nameEn ?? '').toLowerCase() === want)
}

/** 档案项对应的库条目编号；没有就是 undefined。key = ArchiveItem.id 去掉「分组:」前缀。items 只有「工具」找不到时才用到。 */
export function archiveRefOf(item: ArchiveItem, pool: CardEntry[], items: CardEntry[] = []): string | undefined {
  const key = item.id.slice(item.group.length + 1)
  switch (item.group) {
    case 'condition': return pool.find((e) => e.entry.type === 'condition' && (e.entry.nameEn ?? '').toLowerCase() === key.toLowerCase())?.entry.id
    case 'languages': {
      const langs = pool.filter((e) => e.entry.type === 'language')
      return key.startsWith('text:') ? langs.find((e) => e.entry.name === key.slice(5))?.entry.id : langs.find((e) => e.entry.data.code === key)?.entry.id
    }
    case 'senses': {
      const text = key.toLowerCase()
      return ruleEntries(pool).find((e) => e.entry.data.category === 'sense' && (text.startsWith((e.entry.nameEn ?? '\0').toLowerCase()) || key.startsWith(e.entry.name)))?.entry.id
    }
    case 'weapons': return item.ref
    case 'armor': return ruleEntries(pool).find((e) => e.entry.data.category === 'itemType' && (e.entry.nameEn ?? '').toLowerCase().startsWith(key.toLowerCase()))?.entry.id
    case 'tools': return item.ref ?? items.find((e) => fold(e.entry.nameEn ?? '') === fold(key))?.entry.id
    default: return undefined
  }
}

/** 打开档案项资料弹窗用的模型：类别、获得方式 ＋（有条目就嵌入条目；没有就给速查入口）。 */
export async function archiveInfoModel(item: ArchiveItem, removable: boolean, data: CardData): Promise<InfoModel> {
  const pool = [...data.entries.values()]
  const items = item.group === 'tools' && !item.ref ? await data.entriesOfType('item') : []
  const ref = archiveRefOf(item, pool, items)
  // 嵌入库条目时，条目自己会写类型 / 类别，这里只留人物自己的信息（获得方式）；没有条目时才补一行类别
  const rows: InfoModel['rows'] = ref ? [{ label: '获得方式', value: item.source }] : [{ label: '类别', value: CATEGORY_NAME[item.group] }, { label: '获得方式', value: item.source }]
  const help = ref ? undefined : archiveHelpOf(item.group, pool)
  if (help) rows.push({ label: '规则', value: help.entry.name, ref: help.entry.id })
  return { title: item.label, rows, ...(ref ? { ref } : {}), removable }
}
