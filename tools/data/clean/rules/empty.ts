import { isObj, looksLikeBlocks } from '../walk'
import type { Rule } from '../types'

const isBlank = (value: unknown): boolean => typeof value === 'string' && value.trim() === ''

function cleanBlocks(blocks: Array<Record<string, unknown>>, path: string, record: (path: string, before: string, after: string) => void): number {
  let changes = 0
  for (let i = blocks.length - 1; i >= 0; i--) {
    const block = blocks[i]
    if (isBlank(block.p)) { record(`${path}.${i}`, JSON.stringify(block), '（删除）'); blocks.splice(i, 1); changes++; continue }
    if (Array.isArray(block.list)) {
      const before = block.list.length
      const kept = block.list.filter((item) => !isBlank(item))
      if (kept.length !== before) { changes += before - kept.length; record(`${path}.${i}.list`, `${before} 项`, `${kept.length} 项`); block.list = kept }
      if (!kept.length) { blocks.splice(i, 1); continue }
    }
    if (Array.isArray(block.body)) changes += cleanBlocks(block.body as Array<Record<string, unknown>>, `${path}.${i}.body`, record)
    if (Array.isArray(block.read)) changes += cleanBlocks(block.read as Array<Record<string, unknown>>, `${path}.${i}.read`, record)
    if (isObj(block.table) && Array.isArray(block.table.rows)) {
      for (const row of block.table.rows) {
        if (!Array.isArray(row)) continue
        row.forEach((cell, c) => { if (cell === '') { row[c] = '—'; changes++ } })
      }
      if (changes) record(`${path}.${i}.table`, '空单元格', '—')
    }
  }
  return changes
}

function walk(value: unknown, path: string, record: (path: string, before: string, after: string) => void): number {
  if (Array.isArray(value)) {
    if (looksLikeBlocks(value)) return cleanBlocks(value, path, record)
    return value.reduce<number>((n, item, i) => n + walk(item, `${path}.${i}`, record), 0)
  }
  if (isObj(value)) return Object.entries(value).reduce<number>((n, [key, item]) => n + walk(item, path ? `${path}.${key}` : key, record), 0)
  return 0
}

/** 规则 5：空段落、空列表项删除；文字表格里的空单元格补「—」。 */
export const emptyRule: Rule = {
  id: 'R5-empty',
  title: '空段落、空列表项、空表格单元格',
  zhOnly: false,
  apply(entry, { record }) {
    return walk(entry.data, '', record)
  },
}
