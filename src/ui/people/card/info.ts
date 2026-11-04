import type { ArchiveGroupKey, ArchiveItem } from './archive'

/** 资料弹窗的数据：名称、类别、获得方式等**人物自己的信息**；规则正文一律来自库条目（`ref`），这里不写任何规则文字。 */
export interface InfoModel {
  title: string
  titleEn?: string
  rows: Array<{ label: string; value: string; ref?: string }>
  /** 条目编号：有就在弹窗里嵌入条目资料页（正文、页码都来自数据库）。 */
  ref?: string
  /** 用户自己写的备注（自定义效果的说明），不是规则文字。 */
  note?: string
  removable: boolean
}

/** 档案分组在界面上的叫法（界面自己的分类名，不是游戏数据）。 */
export const CATEGORY_NAME: Record<ArchiveGroupKey, string> = { resist: '伤害抗性', immune: '伤害免疫', vulnerable: '伤害易伤', condition: '状态免疫', senses: '感官', languages: '语言', weapons: '武器熟练', armor: '护甲熟练', tools: '工具熟练' }

/** 同步版本（没有库数据时的兜底：只有类别与获得方式）；有库数据请用 archiveRefs.archiveInfoModel。 */
export function infoOfArchive(item: ArchiveItem, removable: boolean): InfoModel {
  return { title: item.label, rows: [{ label: '类别', value: CATEGORY_NAME[item.group] }, { label: '获得方式', value: item.source }], ref: item.ref, removable }
}
