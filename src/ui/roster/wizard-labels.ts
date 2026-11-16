// 建卡界面的小标签登记表：官方进阶给的是编号（str、skills），这里只换成玩家看的字；没登记的原样显示，不猜。
export const ABILITY_LABELS: Record<string, string> = { str: '力量', dex: '敏捷', con: '体质', int: '智力', wis: '感知', cha: '魅力' }
export const TRAIT_LABELS: Record<string, string> = { skills: '技能', languages: '语言', tool: '工具', saves: '豁免', armor: '护甲', weapon: '武器', di: '伤害免疫', dr: '伤害抗性', dv: '伤害易伤', ci: '状态免疫' }
export const abilityLabel = (key: string): string => ABILITY_LABELS[key] ?? key
export const traitLabel = (trait: unknown, fallback: string | null): string => (typeof trait === 'string' && TRAIT_LABELS[trait]) || fallback || '选择'
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
/** 币种编码 → 名字（只做显示；币值换算由后端做）。 */
export const CURRENCY_LABELS: Record<string, string> = { pp: '铂', gp: '金', ep: '银金', sp: '银', cp: '铜' }
export const currencyText = (c: Record<string, number> | null | undefined): string => Object.entries(c ?? {}).filter(([, n]) => n > 0).map(([k, n]) => `${n} ${CURRENCY_LABELS[k] ?? k}`).join(' ') || '无'
