// 起始装备的「类别 → 哪些物品」登记表（建卡装备步骤）。
// 来源：Plutonium 的 EQUIPMENT_TYPE_EXPANDERS（vendor/foundry/modules/plutonium/js/Bundle.js 里 _EquipmentTypeExpander_* 十八个类和 _EquipmentTypeExpanderBase 的 _isXxx 判断）。
// 那些类藏在 Plutonium 的模块里，小窗调不到（已验证），所以照它们的结构 1:1 登记：每个类别 = 一串判断名；每个判断 = 物品类型缩写或某个字段的值。
// 类型缩写取作者 Parser.ITM_TYP_ABV__*，物品类型的拆解用作者 DataUtil.itemType.unpackUid，「算不算起始装备」用作者 Renderer.item.isMundane，都在小窗里现调。
// 单元测试 tests/unit/equipment-rules.test.ts 每次读 Plutonium 原文核对这张表，作者改了这里不改就报错。

/** 判断：abv = 物品类型缩写（Parser.ITM_TYP_ABV__ 后面的名字，任一即可）；field = 物品字段等于某个值。 */
export type EquipmentPredicate = { abv: string[] } | { field: [string, string] }
export const EQUIPMENT_PREDICATES: Record<string, EquipmentPredicate> = {
  isWeapon: { abv: ['MELEE_WEAPON', 'RANGED_WEAPON'] },
  isMeleeWeapon: { abv: ['MELEE_WEAPON'] },
  isRangedWeapon: { abv: ['RANGED_WEAPON'] },
  isSimpleWeapon: { field: ['weaponCategory', 'simple'] },
  isMartialWeapon: { field: ['weaponCategory', 'martial'] },
  isInstrumentMusical: { abv: ['INSTRUMENT'] },
  isArmorLight: { abv: ['LIGHT_ARMOR'] },
  isArmorMedium: { abv: ['MEDIUM_ARMOR'] },
  isArmorHeavy: { abv: ['HEAVY_ARMOR'] },
  isFocusSpellcasting: { abv: ['SPELLCASTING_FOCUS'] },
  isFocusSpellcastingArcane: { field: ['scfType', 'arcane'] },
  isFocusSpellcastingDruidic: { field: ['scfType', 'druid'] },
  isFocusSpellcastingHoly: { field: ['scfType', 'holy'] },
  isSetGaming: { abv: ['GAMING_SET'] },
  isToolArtisan: { abv: ['ARTISAN_TOOL'] },
}

/** 作者数据里的 equipmentType 类别码 → 全部判断都满足才算候选。 */
export const EQUIPMENT_EXPANDERS: Record<string, string[]> = {
  weapon: ['isWeapon'],
  weaponSimple: ['isWeapon', 'isSimpleWeapon'],
  weaponSimpleMelee: ['isMeleeWeapon', 'isSimpleWeapon'],
  weaponSimpleRanged: ['isRangedWeapon', 'isSimpleWeapon'],
  weaponMartial: ['isWeapon', 'isMartialWeapon'],
  weaponMartialMelee: ['isMeleeWeapon', 'isMartialWeapon'],
  weaponMartialRanged: ['isRangedWeapon', 'isMartialWeapon'],
  weaponMelee: ['isMeleeWeapon'],
  weaponRanged: ['isRangedWeapon'],
  instrumentMusical: ['isInstrumentMusical'],
  armorLight: ['isArmorLight'],
  armorMedium: ['isArmorMedium'],
  armorHeavy: ['isArmorHeavy'],
  focusSpellcastingArcane: ['isFocusSpellcasting', 'isFocusSpellcastingArcane'],
  focusSpellcastingDruidic: ['isFocusSpellcasting', 'isFocusSpellcastingDruidic'],
  focusSpellcastingHoly: ['isFocusSpellcasting', 'isFocusSpellcastingHoly'],
  setGaming: ['isSetGaming'],
  toolArtisan: ['isToolArtisan'],
}
