export interface EntryHp {
  current: number | null
  max: number | null
}

/** 模板卡上有固定生命值（average > 0）才作为当前与上限；特殊规则或原书没给就为空。 */
export function hpFromEntry(block: { hp?: { average?: number; special?: string; formula?: string } }): EntryHp {
  const average = Number(block.hp?.average)
  if (Number.isFinite(average) && average > 0) return { current: average, max: average }
  return { current: null, max: null }
}
