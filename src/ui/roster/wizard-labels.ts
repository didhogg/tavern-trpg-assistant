// 建卡界面自己的说明文字：后端给的问题编号、定属性方式编号 → 玩家看的话。D&D 的名字（属性、熟练类别、币种…）一律由后端按编号给，这里不查。
export const METHOD_LABELS: Record<string, string> = { standardArray: '标准数组', pointBuy: '购点', manual: '手填' }
/** 后端检查给的问题编号 → 玩家看的话；没登记的原样显示编号。 */
export const problemLabel = (code: string, cap: number | null): string => ({
  'not-integer': '要填整数', 'out-of-range': `范围 0 到 ${cap ?? '上限'}`, 'not-in-array': '这个数已经用掉了', 'not-in-table': '购点表里没有这一档', 'over-budget': '点数超了',
} as Record<string, string>)[code] ?? code
/** 钱 → 一行字：名字由后端给（dnd5e 币种登记），这里只排版。 */
export const currencyText = (c: Record<string, number> | null | undefined, names: Record<string, string>): string => Object.entries(c ?? {}).filter(([, n]) => n > 0).map(([k, n]) => `${n} ${names[k] ?? k}`).join(' ') || '无'
