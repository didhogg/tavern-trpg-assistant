/** 只供数据/内部读取使用、不出现在库列表、分类、搜索与类型统计里的条目类型。 */
export const HIDDEN_ENTRY_TYPES = ['lore'] as const
export type HiddenEntryType = (typeof HIDDEN_ENTRY_TYPES)[number]

export function isHiddenType(type: string): boolean {
  return (HIDDEN_ENTRY_TYPES as readonly string[]).includes(type)
}
