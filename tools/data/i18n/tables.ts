import type { Entry } from '../../../src/schemas/pack'

type Rec = Record<string, unknown>

/** 表的结构签名：来源书、骰子、列数、行数、每行的点数区间与单元格数、所属条目；不含名称、骰子种类（中文那一遍按中文名改过 kind）。 */
export function tableSignature(entry: Entry, withParent = true): string {
  const data = entry.data as Rec
  const rows = Array.isArray(data.rows) ? data.rows as Rec[] : []
  const parent = (data.parent as Rec | undefined)?.id ?? null
  const book = (data.src as Rec | undefined)?.book ?? null
  const cols = Array.isArray(data.cols) ? data.cols.length : 0
  return JSON.stringify([book, data.dice ?? null, cols, rows.length, rows.map((row) => [row.min ?? null, row.max ?? null, Array.isArray(row.cells) ? row.cells.length : 0]), withParent ? parent : null])
}

const WINDOW = 12

/**
 * 随机表的 id 来自名字，英文与中文不同；两边的表都按「规划」顺序排列，顺序是并行的，
 * 所以用签名做顺序匹配：遇到不同时，在窗口内向前找对得上的一边，跳过多出来的表。
 * 返回 英文 id → 中文 id。
 */
export function alignTables(cnAll: Entry[], enAll: Entry[]): Map<string, string> {
  const map = new Map<string, string>()
  // 第一步：两边 id 相同（来自 gendata 的编号、旧 id）且签名相同的，直接配对（所属条目在英文那一遍里偶尔找不到，这一步不比较它）
  const enById = new Map(enAll.map((entry) => [entry.id, entry]))
  for (const entry of cnAll) { const other = enById.get(entry.id); if (other && tableSignature(other, false) === tableSignature(entry, false)) map.set(other.id, entry.id) }
  // 第二步：剩下的按「规划」顺序做签名匹配
  const taken = new Set(map.values())
  const cn = cnAll.filter((entry) => !taken.has(entry.id))
  const en = enAll.filter((entry) => !map.has(entry.id))
  const a = cn.map((entry) => tableSignature(entry))
  const b = en.map((entry) => tableSignature(entry))
  let i = 0, j = 0
  while (i < cn.length && j < en.length) {
    if (a[i] === b[j]) { map.set(en[j].id, cn[i].id); i++; j++; continue }
    let skipEn = 0, skipCn = 0
    for (let k = 1; k <= WINDOW; k++) {
      if (!skipEn && j + k < en.length && a[i] === b[j + k]) skipEn = k
      if (!skipCn && i + k < cn.length && a[i + k] === b[j]) skipCn = k
      if (skipEn || skipCn) break
    }
    if (skipEn || skipCn) { if (skipEn && (!skipCn || skipEn <= skipCn)) j += skipEn; else i += skipCn; continue }
    i++; j++
  }
  return map
}
