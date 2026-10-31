import type { TextBlock } from '../../../src/schemas/text'
import { convertBlocks, type BlockOptions } from './blocks'
import { renderInline, type InlineContext } from '../markup/inline'

type Raw = Record<string, unknown>
const str = (value: unknown): string => typeof value === 'string' ? value : ''

function textOf(block: TextBlock): string {
  if ('p' in block) return block.p
  if ('h' in block) return [block.h, ...block.body.map(textOf)].join(' ')
  if ('list' in block) return block.list.join('；')
  if ('quote' in block) return block.quote
  if ('table' in block) return block.table.rows.map((row) => row.join(' ')).join('；')
  if ('tableRef' in block) return block.tableRef.label
  return block.read.map(textOf).join('')
}

function extra(input: Raw, ctx: InlineContext, options: BlockOptions): TextBlock[] | undefined {
  const type = str(input.type)
  const name = str(input.name)
  if (type === 'bookRefList') {
    const items = Array.isArray(input.items) ? input.items : []
    return [{ list: items.map((item) => {
      const row = item && typeof item === 'object' ? item as Raw : {}
      const tag = str(row.tag), name = str(row.name), en = str(row.nameEn), source = str(row.source), display = name
      const sourcePart = source || ''
      const attempts = [`{@${tag} ${name}|${sourcePart}|${display}}`, ...(en ? [`{@${tag} ${en}|${sourcePart}|${display}}`] : [])]
      if (tag === 'race') { const m = /^(.*?) \((.*)\)$/.exec(en); if (m) attempts.push(`{@subrace ${m[2]} ${m[1]}|${sourcePart}|${display}}`) }
      if (tag === 'deity') attempts.unshift(`{@deity ${name}||${sourcePart}|${display}}`)
      for (const text of attempts) { const rendered = renderInline(text, ctx); if (rendered.includes('{{ref:')) return rendered }
      return display
    }) }]
  }
  if (type === 'statblock' || type === 'table' || type === 'tableGroup') return []
  if (type === 'image' || type === 'internal' || type === 'gallery' || type === 'square' || type === 'none' || type === 'hr') return []
  if (type === 'quote') {
    const body = convertBlocks(input.entries, ctx, options).map(textOf).join('\n')
    const by = str(input.by)
    const from = str(input.from)
    const attribution = by && from ? `${renderInline(by, ctx)}，${renderInline(from, ctx)}` : by ? renderInline(by, ctx) : from ? renderInline(from, ctx) : ''
    return [{ quote: body, ...(attribution ? { by: attribution } : {}) }]
  }
  if (type === 'abilityGeneric') {
    const entry = input.entry
    if (typeof entry === 'string') return [{ p: renderInline(entry, ctx) }]
    return convertBlocks(entry, ctx, options)
  }
  if ((type === 'section' || type === 'entries' || type === 'inset') && name) {
    const anchor = typeof input.id === 'string' ? `${ctx.book.toLowerCase()}-${input.id}` : undefined
    return [{ h: renderInline(name, ctx), body: convertBlocks(input.entries, ctx, options), ...(anchor ? { anchor } : {}) }]
  }
  return undefined
}

declare module './blocks' {
  interface BlockOptions {
    extra?: (input: Raw, ctx: InlineContext, options: BlockOptions) => TextBlock[] | undefined
  }
}

export const bookBlockOptions: BlockOptions = { preserveSection: true, tableGroup: false, scalarCells: true, extra }
