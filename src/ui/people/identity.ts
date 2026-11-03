import { PEOPLE_CATEGORY_LABELS, type Person } from '../../schemas/people'
import type { RowLabels } from './rows'

/** 身份行的一小段：职业与等级加粗，其余（种族、子职业、分类名）是次要文字。 */
export interface IdentitySegment {
  text: string
  strong: boolean
}

/**
 * 卡片第二行「法师 3 级 ・ 人类」：一眼读出职业、等级、种族。
 * - 多职业依次列出「战士 3 级 ・ 法师 2 级 ・ 人类」；有子职业时接在种族后面。
 * - 从模板加入的人（没有职业）这一行不写（驾驶员 2026-11-03：不要「来源名 ・ 挑战 X」）。
 * - 「全部」分类里末尾补分类名，其它分类不补。
 * 什么都没有就返回空数组，界面整行不显示。
 */
export function personIdentity(person: Person, labels: RowLabels = {}, includeCategory = false): IdentitySegment[] {
  const block = person.block
  const out: IdentitySegment[] = []
  const classes = block.classes ?? []
  const name = (id: string): string => labels.classes?.[id] ?? id
  for (const c of classes) out.push({ text: `${name(c.class)} ${c.level} 级`, strong: true })
  if (classes.length) {
    if (block.race) out.push({ text: labels.races?.[block.race] ?? block.race, strong: false })
    for (const c of classes) if (c.subclass) out.push({ text: name(c.subclass), strong: false })
  }
  if (includeCategory) out.push({ text: PEOPLE_CATEGORY_LABELS[person.categoryId], strong: false })
  return out
}
