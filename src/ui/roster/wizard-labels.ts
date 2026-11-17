// 建卡界面自己的说明文字：后端给的问题编号、定属性方式编号 → 玩家看的话。D&D 的名字（属性、熟练类别、币种…）一律由后端按编号给，这里不查。
export const METHOD_LABELS: Record<string, string> = { standardArray: '标准数组', pointBuy: '购点', manual: '手填' }
/** 后端检查给的问题编号 → 玩家看的话；没登记的原样显示编号。 */
export const problemLabel = (code: string, cap: number | null): string => ({
  'not-integer': '要填整数', 'out-of-range': `范围 0 到 ${cap ?? '上限'}`, 'not-in-array': '这个数已经用掉了', 'not-in-table': '购点表里没有这一档', 'over-budget': '点数超了',
} as Record<string, string>)[code] ?? code
/** 起始装备「任选一件某类」的类别码（作者数据里的 equipmentType）→ 玩家看的话；没登记的原样显示编码，不猜。 */
export const EQUIPMENT_TYPE_LABELS: Record<string, string> = {
  weapon: '武器', weaponSimple: '简易武器', weaponSimpleMelee: '简易近战武器', weaponSimpleRanged: '简易远程武器',
  weaponMartial: '军用武器', weaponMartialMelee: '军用近战武器', weaponMartialRanged: '军用远程武器', weaponMelee: '近战武器', weaponRanged: '远程武器',
  instrumentMusical: '乐器', armorLight: '轻甲', armorMedium: '中甲', armorHeavy: '重甲',
  focusSpellcastingArcane: '奥术法器', focusSpellcastingDruidic: '德鲁伊法器', focusSpellcastingHoly: '圣徽', setGaming: '游戏套装', toolArtisan: '工匠工具',
}
export const equipmentTypeLabel = (code: string): string => EQUIPMENT_TYPE_LABELS[code] ?? code
/** 钱 → 一行字：名字由后端给（dnd5e 币种登记），这里只排版。 */
export const currencyText = (c: Record<string, number> | null | undefined, names: Record<string, string>): string => Object.entries(c ?? {}).filter(([, n]) => n > 0).map(([k, n]) => `${n} ${names[k] ?? k}`).join(' ') || '无'
