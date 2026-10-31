import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { allEntries } from './r9-pack-helpers'

const replacements = JSON.parse(readFileSync(join(process.cwd(), 'docs/probes/D1.2a_R9_参考替换.json'), 'utf8')) as Array<{ entryId: string; tableId: string }>

function tableRefs(value: unknown, out: string[] = []): string[] {
  if (Array.isArray(value)) { for (const item of value) tableRefs(item, out); return out }
  if (value && typeof value === 'object') {
    const rec = value as Record<string, unknown>
    if (rec.tableRef && typeof rec.tableRef === 'object' && typeof (rec.tableRef as { id?: unknown }).id === 'string') out.push((rec.tableRef as { id: string }).id)
    for (const item of Object.values(rec)) tableRefs(item, out)
  }
  return out
}

describe('R9 正文替换', () => {
  it('参考替换清单 630 项都能在对应条目里找到 tableRef', () => {
    const byId = new Map(allEntries().map((entry) => [entry.id, entry]))
    const missing = replacements.filter((row) => !JSON.stringify(byId.get(row.entryId)?.data ?? {}).includes(`"tableRef":{"id":"${row.tableId}"`))
    expect(missing).toEqual([])
  })

  it('tableRef 目标存在；所有条目（含 R11 新类型、怪物变体、传奇组）的正文里不再有表格块', () => {
    const entries = allEntries()
    const ids = new Set(entries.map((entry) => entry.id))
    const refs = entries.filter((entry) => entry.type !== 'book').flatMap((entry) => tableRefs(entry.data))
    expect(refs.every((id) => ids.has(id))).toBe(true)
    expect(refs).toHaveLength(580)
    const blocks: string[] = []
    const walk = (value: unknown, id: string): void => {
      if (Array.isArray(value)) { for (const item of value) walk(item, id); return }
      if (!value || typeof value !== 'object') return
      const rec = value as Record<string, unknown>
      if (rec.table !== undefined) blocks.push(id)
      for (const item of Object.values(rec)) walk(item, id)
    }
    for (const entry of entries) {
      // 书章节与物品除外：物品的 additionalEntries（R15）里的表格是物品自己的附加正文，原样保留成行内表
      if (entry.type === 'book' || entry.type === 'item') continue
      walk(entry.data.text, entry.id); walk(entry.data.lore, entry.id); walk(entry.data.variants, entry.id); walk(entry.data.legendary, entry.id)
    }
    expect(blocks).toEqual([])
  })
})
