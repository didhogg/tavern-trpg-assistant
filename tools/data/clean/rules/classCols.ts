import { isObj } from '../walk'
import type { Rule } from '../types'

/** 规则 6：职业表列名里的序数词（`·1st`…`·9th`）改成「N环」。 */
export const classColsRule: Rule = {
  id: 'R6-class-cols',
  title: '职业表列名中英混用',
  zhOnly: true,
  apply(entry, { record }) {
    if (entry.type !== 'class' || !isObj(entry.data.table) || !Array.isArray(entry.data.table.cols)) return 0
    const cols = entry.data.table.cols as unknown[]
    let changes = 0
    cols.forEach((col, i) => {
      if (typeof col !== 'string') return
      const next = col.replace(/·(\d)(?:st|nd|rd|th)$/, '·$1环')
      if (next !== col) { record(`table.cols.${i}`, col, next); cols[i] = next; changes++ }
    })
    return changes
  },
}
