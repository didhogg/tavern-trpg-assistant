import type { Entry } from '../../../src/schemas/pack'
import type { PlannedEntry } from './plan'
import type { ConvertContext } from './context'
import type { InlineContext } from '../markup/inline'
import { creditFor, keywordsOf } from './common'
import { convertBlocks } from './blocks'
import { renderInline } from '../markup/inline'
import { plainText, summaryOf } from '../summary/summary'
import type { R9Row } from './r9Types'
import type { TableColumn } from '../../../src/rules/dnd5e2014/data/tableValues'

export interface R9Seed {
  dice?: string
  cols: string[]
  rows: R9Row[]
  group?: { id: string; name: string }
  caption?: string
  aliases?: string[]
  parentKey?: string
  parentKeys?: string[]
}

export interface R9Meta {
  kind: string
  modifier?: { prompt: string }
  footnotes?: string[]
  parent?: { id: string }
  chapter?: { book: string; name: string }
  purpose?: string
  columns?: TableColumn[]
}

function refsOf(cells: string[]): string[] {
  const out = new Set<string>()
  for (const cell of cells) for (const match of cell.matchAll(/\{\{ref:([^|}]+)/g)) out.add(match[1])
  return [...out]
}

function thenOf(cells: string[]): string | undefined {
  for (const cell of cells) { const match = /\{@table ([^}|]+)/.exec(cell); if (match) return match[1] }
  return undefined
}

export function convertTableR9(entry: PlannedEntry, ctx: ConvertContext, inline: InlineContext): Entry {
  const seed = entry.raw.__seed as R9Seed
  const meta = entry.raw.__r9 as R9Meta
  const text = convertBlocks(entry.raw.entries, inline)
  const rows = seed.rows.map((row) => {
    const cells = row.cells.map((cell) => renderInline(cell, inline))
    const thenName = thenOf(row.cells)
    const then = (thenName ? ctx.tableByName.get(thenName) : undefined) ?? row.then
    return {
      ...(meta.kind === 'ref' ? {} : { min: row.min, max: row.max }),
      cells,
      refs: refsOf(cells),
      ...(then ? { then: { table: then } } : {}),
      ...(row.indent ? { indent: true } : {}),
      ...(row.values ? { values: row.values } : {}),
    }
  })
  const data: Record<string, unknown> = {
    src: { book: entry.source, page: entry.page },
    credit: creditFor(entry, ctx.bookMachine.get(entry.source) ?? false),
    text,
    kind: meta.kind,
    ...(seed.dice && meta.kind !== 'ref' ? { dice: seed.dice } : {}),
    ...(meta.modifier ? { modifier: meta.modifier } : {}),
    cols: seed.cols.map((c) => renderInline(c, inline)),
    rows,
    ...(seed.group ? { group: seed.group } : {}),
    ...(seed.caption ? { caption: renderInline(seed.caption, inline) } : {}),
    ...(meta.footnotes ? { footnotes: meta.footnotes.map((x) => renderInline(x, inline)) } : {}),
    ...(meta.parent ? { parent: meta.parent } : {}),
    ...(meta.chapter ? { chapter: meta.chapter } : {}),
    ...(meta.purpose ? { purpose: meta.purpose } : {}),
    ...(meta.columns ? { columns: meta.columns } : {}),
  }
  return { id: entry.id, type: 'table', name: entry.name, nameEn: entry.nameEn, keywords: keywordsOf(entry), unique: false, summary: summaryOf('table', entry.name, data, plainText(text)), data }
}
