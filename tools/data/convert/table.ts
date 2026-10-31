import type { Entry } from '../../../src/schemas/pack'
import type { PlannedEntry } from './plan'
import type { ConvertContext } from './context'
import type { TableSeed } from './tables'
import { creditFor, keywordsOf } from './common'
import { convertBlocks } from './blocks'
import { renderInline, type InlineContext } from '../markup/inline'
import { plainText, summaryOf } from '../summary/summary'

function refsOf(cells: string[]): string[] {
  const out = new Set<string>()
  for (const cell of cells) for (const match of cell.matchAll(/\{\{ref:([^|}]+)/g)) out.add(match[1])
  return [...out]
}

export function convertTable(entry: PlannedEntry, ctx: ConvertContext, inline: InlineContext): Entry {
  const seed = entry.raw.__seed as TableSeed
  const text = convertBlocks(entry.raw.entries, inline)
  const rows = seed.rows.map((row) => {
    const cells = row.cells.map((cell) => renderInline(cell, inline))
    const then = row.then ? ctx.tableByName.get(row.then.table) : undefined
    return {
      min: row.min,
      max: row.max,
      cells,
      refs: refsOf(cells),
      ...(then ? { then: { table: then, ...(row.then?.times ? { times: row.then.times } : {}) } } : {}),
      ...(row.qty ? { qty: row.qty } : {}),
    }
  })
  const data: Record<string, unknown> = {
    src: { book: entry.source, page: entry.page },
    credit: creditFor(entry, ctx.bookMachine.get(entry.source) ?? false),
    text,
    kind: seed.group?.id.startsWith('loot') ? 'loot' : 'roll',
    dice: seed.dice,
    cols: seed.cols.map((c) => renderInline(c, inline)),
    rows,
    ...(seed.group ? { group: seed.group } : {}),
    ...(seed.caption ? { caption: renderInline(seed.caption, inline) } : {}),
  }
  return { id: entry.id, type: 'table', name: entry.name, nameEn: entry.nameEn, keywords: keywordsOf(entry), unique: false, summary: summaryOf('table', entry.name, data, plainText(text)), data }
}
