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
