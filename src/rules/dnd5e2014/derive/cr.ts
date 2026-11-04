/** 数据有 xp 字段取它；否则按挑战等级查库里的经验值表（xpByCr）；表里没有就 undefined（界面不显示该徽章）。 */
export function xpOf(cr: number | undefined, xp?: number, xpByCr?: Record<string, number>): number | undefined {
  if (xp !== undefined) return xp
  return cr === undefined ? undefined : xpByCr?.[String(cr)]
}
