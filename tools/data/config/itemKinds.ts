/**
 * 物品标准类型（`itemKind`）：由 5etools 原始类型代码与独立标记机械得出（G2.5 P2）。
 * 依据：DMG 第 7 章魔法物品九类、PHB 第 5 章装备、5etools `items-base.json` 的 itemType 表、5e API 装备类别、Foundry dnd5e 的物品类型。
 * 新书出现没见过的代码时：原样保留为 itemKind（不丢），数据测试会列出来，再在这里补一行。
 */
export const KIND_BY_CODE: Record<string, string> = {
  M: 'meleeWeapon', R: 'rangedWeapon', A: 'ammunition', AF: 'ammunition',
  LA: 'armor', MA: 'armor', HA: 'armor', S: 'shield',
  P: 'potion', SC: 'scroll', RG: 'ring', RD: 'rod', WD: 'wand',
  G: 'adventuringGear', SCF: 'spellcastingFocus', FD: 'foodDrink', EXP: 'explosive',
  AT: 'artisanTool', INS: 'instrument', GS: 'gamingSet', T: 'tool',
  MNT: 'mount', TAH: 'tackAndHarness', VEH: 'vehicle', SHP: 'vehicle', AIR: 'vehicle', SPC: 'vehicle',
  TG: 'tradeGood', TB: 'tradeGood', $G: 'gem', $A: 'artObject', $C: 'coinage', $: 'treasure',
  OTH: 'other',
}

/** 去掉类型代码的 `|来源` 后缀（`SC|DMG` → `SC`）。以前精确匹配对不上，139 件物品掉进"奇物"。 */
export function typeCode(value: unknown): string {
  return typeof value === 'string' ? value.split('|')[0] : ''
}

type Raw = Record<string, unknown>

/** 标准类型：独立标记优先（毒药、法杖、刺青），再看类型代码，再看基础物品，最后看奇物标记。 */
export function itemKindOf(raw: Raw, base: Raw | undefined): string {
  if (raw.poison === true) return 'poison'
  if (raw.staff === true) return 'staff'
  if (raw.tattoo === true) return 'tattoo'
  const own = typeCode(raw.type)
  if (own && own !== 'GV') return KIND_BY_CODE[own] ?? own
  const b = base ?? {}
  const baseCode = typeCode(b.type)
  if (baseCode && baseCode !== 'GV') return KIND_BY_CODE[baseCode] ?? baseCode
  if (raw.weaponCategory || b.weaponCategory) return /R/.test(baseCode) ? 'rangedWeapon' : 'meleeWeapon'
  if (raw.wondrous === true) return 'wondrousItem'
  if (raw.bonusAc !== undefined || raw.ac !== undefined || b.armor) return 'armor'
  return 'other'
}

/** 5etools 的消耗品标记 `miscTags: ['CNS']`（弹药不带这个标记，按 5etools 不算消耗品）。 */
export function isConsumable(raw: Raw): boolean {
  return Array.isArray(raw.miscTags) && raw.miscTags.includes('CNS')
}

const FOCUS: Record<string, 'arcane' | 'druid' | 'holy'> = { arcane: 'arcane', druid: 'druid', holy: 'holy' }
export function focusTypeOf(raw: Raw): 'arcane' | 'druid' | 'holy' | undefined {
  return typeof raw.scfType === 'string' ? FOCUS[raw.scfType] : undefined
}
