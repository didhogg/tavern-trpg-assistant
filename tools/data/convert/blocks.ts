import type { TextBlock } from '../../../src/schemas/text'
import { renderInline, type InlineContext } from '../markup/inline'

type Raw = Record<string, unknown>

function isObj(value: unknown): value is Raw {
  return !!value && typeof value === 'object' && !Array.isArray(value)
}

function str(value: unknown): string {
  return typeof value === 'string' ? value : ''
}

function listText(item: unknown, ctx: InlineContext): string {
  if (typeof item === 'string') return renderInline(item, ctx)
  if (!isObj(item)) return ''
  const name = str(item.name)
  const entry = item.entry ?? item.entries
  const body = typeof entry === 'string' ? renderInline(entry, ctx) : convertBlocks(entry, ctx).map(textOf).join('')
  const rendered = renderInline(name, ctx)
  const joined = body ? `${/[:：]$/.test(rendered) ? '' : '：'}${body}` : ''
  return rendered ? `${rendered}${joined}` : body
}

function textOf(block: TextBlock): string {
  if ('p' in block) return block.p
  if ('h' in block) return block.h
  if ('list' in block) return block.list.join('；')
  if ('quote' in block) return block.quote
  if ('table' in block) return block.table.rows.map((r) => r.join(' ')).join('；')
  return 'tableRef' in block ? block.tableRef.label : block.read.map(textOf).join('')
}

function refText(obj: Raw, ctx: InlineContext): string {
  const type = str(obj.type)
  const map: Record<string, [string, string]> = {
    refOptionalfeature: ['optfeature', 'optionalfeature'],
    refClassFeature: ['classFeature', 'classFeature'],
    refSubclassFeature: ['subclassFeature', 'subclassFeature'],
    refSpell: ['spell', 'spell'],
    refCreature: ['creature', 'creature'],
    refItem: ['item', 'item'],
    refCondition: ['condition', 'condition'],
    refBackground: ['background', 'background'],
    refRace: ['race', 'race'],
    refFeat: ['feat', 'feat'],
    refAction: ['action', 'action'],
    refVariantrule: ['variantrule', 'variantrule'],
  }
  const entry = map[type]
  if (!entry) return str(obj.name)
  const value = str(obj[entry[1]]) || str(obj.name)
  return renderInline(`{@${entry[0]} ${value}}`, ctx)
}

export interface BlockOptions {
  /** lore 需要保留嵌套 section 的标题；普通条目正文保持旧行为。 */
  preserveSection?: boolean
  /** lore 的 tableGroup 展开成多张独立表格。 */
  tableGroup?: boolean
  /** lore 表格里的数字/布尔单元格按文字输出。 */
  scalarCells?: boolean
}

/** 5etools 正文 → D1 §4.4 的块结构。未知块保留为段落，不丢正文。 */
export function convertBlocks(input: unknown, ctx: InlineContext, options: BlockOptions = {}): TextBlock[] {
  if (typeof input === 'string') return [{ p: renderInline(input, ctx) }]
  if (Array.isArray(input)) {
    const out: TextBlock[] = []
    for (const item of input) {
      if (typeof item === 'string') out.push({ p: renderInline(item, ctx) })
      else out.push(...convertBlocks(item, ctx, options))
    }
    return out
  }
  if (!isObj(input)) return []; const hooked = options.extra?.(input, ctx, options); if (hooked) return hooked; // type
  const type = str(input.type)
  const entries = input.entries
  if (type === 'entries') {
    const body = convertBlocks(entries, ctx, options)
    const name = str(input.name)
    return name ? [{ h: renderInline(name, ctx), body }] : body
  }
  if (type === 'section') {
    const body = convertBlocks(entries, ctx, options)
    const name = str(input.name)
    return options.preserveSection && name ? [{ h: renderInline(name, ctx), body }] : body
  }
  if (type === 'tableGroup' && options.tableGroup) {
    const tables = Array.isArray(input.tables) ? input.tables : []
    return tables.flatMap((table) => convertBlocks(table, ctx, options))
  }
  if (type === 'list') {
    const items = Array.isArray(input.items) ? input.items : []
    return [{ list: items.map((item) => listText(item, ctx)).filter(Boolean) }]
  }
  if (type === 'table') {
    const cols = Array.isArray(input.colLabels) ? input.colLabels.map((c) => renderInline(str(c), ctx)) : []
    const rows = Array.isArray(input.rows) ? input.rows.map((row) => (Array.isArray(row) ? row.map((cell) => renderInline(options.scalarCells && (typeof cell === 'number' || typeof cell === 'boolean') ? String(cell) : str(cell), ctx)) : [])) : []
    const caption = str(input.caption)
    return [{ table: { ...(caption ? { caption: renderInline(caption, ctx) } : {}), cols, rows } }]
  }
  if (type === 'quote') {
    return [{ quote: convertBlocks(entries, ctx, options).map(textOf).join('\n'), ...(str(input.by) ? { by: renderInline(str(input.by), ctx) } : {}) }]
  }
  if (type === 'insetReadaloud') return [{ read: convertBlocks(entries, ctx, options) }]
  if (type === 'inset' || type === 'options') return convertBlocks(entries, ctx, options)
  if (type === 'item' || type === 'itemSub') {
    const name = str(input.name)
    const entry = input.entry
    const body = typeof entry === 'string' ? renderInline(entry, ctx) : convertBlocks(entry, ctx, options).map(textOf).join('')
    return [{ p: name ? `${renderInline(name, ctx)}${body ? ` ${body}` : ''}` : body }]
  }
  if (type.startsWith('ref')) return [{ p: refText(input, ctx) }]
  if (type === 'attack' || type === 'attackMod' || type === 'abilityDc' || type === 'abilityAttackMod' || type === 'bonus' || type === 'bonusSpeed' || type === 'dice') {
    return [{ p: Object.values(input).filter((v) => typeof v === 'string').join(' ') }]
  }
  if (type === 'inline' || type === 'inlineBlock') return [{ p: renderInline(str(input.entry) || str(input.name), ctx) }]
  if (type === 'tableRef') return [{ tableRef: { id: str(input.id), label: str(input.label) } }]; if (type === 'hr' || type === 'image' || type === 'gallery') return []
  if (entries !== undefined) return convertBlocks(entries, ctx, options)
  if (str(input.name)) return [{ h: renderInline(str(input.name), ctx), body: [] }]
  return []
}
