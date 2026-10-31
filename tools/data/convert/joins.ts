import type { ConvertContext } from './context'

type Raw = Record<string, unknown>
const str = (value: unknown): string => (typeof value === 'string' ? value : '')

/** 一个包里的条目「加入」别的条目（见 docs/包格式说明.md）：登记在自己身上，被加入的一方不写任何东西。 */
export interface Join { to: string; level: number; as: 'optional' | 'option'; replaces?: string }

/** 别的书给子职业加的选项（如剑湾给图腾武者加麋鹿、猛虎）：来源与子职业来源不同、又不是可选职业特性变体。 */
export const isForeignOption = (raw: Raw): boolean => str(raw.subclassSource) !== '' && str(raw.source) !== str(raw.subclassSource) && raw.isClassFeatureVariant !== true

/**
 * 特性的 joins：
 * - 可选职业特性变体（塔莎的 29 条、受祝击等 16 份）→ 加入所属职业 / 子职业的某一级，作为「可选」，并写明取代哪个特性；
 * - 别的书给子职业加的选项（剑湾图腾）→ 加入该子职业同等级的选择池。
 * 原文写「替代 / 取代 X 特性」，X 在所属职业 / 子职业自己的特性里按名字找。
 */
export function joinsOf(raw: Raw, ownerType: string, entryId: string, ownerId: string, ctx: ConvertContext): Join[] | undefined {
  if (!ownerId || (ownerType !== 'class' && ownerType !== 'subclass')) return undefined
  const level = Number(raw.level ?? 0)
  if (raw.isClassFeatureVariant === true) {
    const match = /(?:替代|取代)([^，。；、}]+?)特性/.exec(JSON.stringify(raw.entries ?? ''))
    const replaces = match ? (ctx.featuresByOwner.get(ownerId) ?? []).find((x) => x.name === match[1] && x.id !== entryId)?.id : undefined
    return [{ to: ownerId, level, as: 'optional', ...(replaces ? { replaces } : {}) }]
  }
  if (ownerType === 'subclass' && isForeignOption(raw)) return [{ to: ownerId, level, as: 'option' }]
  return undefined
}
