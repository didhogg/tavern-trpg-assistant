/** 物品列表的二级种类：按 data.itemKind 归组；未知键归「其他」。 */
export const ITEM_KIND_GROUPS = [
  { key: 'weapon', label: '武器', kinds: ['meleeWeapon', 'rangedWeapon'] },
  { key: 'armor', label: '护甲', kinds: ['armor', 'shield'] },
  { key: 'magic', label: '魔法物品', kinds: ['potion', 'scroll', 'ring', 'rod', 'wand', 'staff', 'wondrousItem', 'tattoo', 'poison'] },
  { key: 'gear', label: '冒险装备', kinds: ['adventuringGear', 'spellcastingFocus', 'foodDrink', 'explosive'] },
  { key: 'tool', label: '工具', kinds: ['artisanTool', 'instrument', 'gamingSet', 'tool'] },
  { key: 'mount', label: '坐骑与载具', kinds: ['mount', 'tackAndHarness', 'vehicle'] },
  { key: 'treasure', label: '财物', kinds: ['tradeGood', 'gem', 'artObject', 'coinage', 'treasure'] },
  { key: 'other', label: '其他', kinds: [] },
] as const

export function itemKindGroup(kind: string | undefined): string {
  if (!kind) return 'other'
  const hit = ITEM_KIND_GROUPS.find((g) => (g.kinds as readonly string[]).includes(kind))
  return hit?.key ?? 'other'
}
