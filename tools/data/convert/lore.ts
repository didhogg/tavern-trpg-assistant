import type { Entry } from '../../../src/schemas/pack'
import type { TextBlock } from '../../../src/schemas/text'
import { convertVariants } from './variants'
import type { InlineContext } from '../markup/inline'
import { creditFor, keywordsOf, pageOf, str } from './common'
import { convertBlocks } from './blocks'
import type { PlannedEntry } from './plan'
import type { ConvertContext } from './context'

function isObj(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === 'object' && !Array.isArray(value)
}

function sameName(raw: Record<string, unknown>, entry: PlannedEntry): boolean {
  const name = str(raw.name)
  const en = str(raw.ENG_name)
  return !name && !en ? true : name === entry.name || en === entry.nameEn || en === entry.name || name === entry.nameEn
}

/** 只去掉与目标同名的最外层 section/entries；嵌套小标题保留。 */
function unwrapLore(value: unknown, entry: PlannedEntry): unknown {
  if (Array.isArray(value) && value.length) {
    const first = value[0]
    if (isObj(first) && (first.type === 'section' || first.type === 'entries') && sameName(first, entry)) {
      const inner = Array.isArray(first.entries) ? first.entries : first.entries === undefined ? [] : [first.entries]
      return [...inner, ...value.slice(1)]
    }
    return value
  }
  if (isObj(value) && (value.type === 'section' || value.type === 'entries') && sameName(value, entry)) return value.entries
  return value
}

export function loreBlocks(entry: PlannedEntry, value: unknown, inline: InlineContext): TextBlock[] {
  return convertBlocks(unwrapLore(value, entry), inline, { preserveSection: true, tableGroup: true, scalarCells: true })
}

export function loreForEntry(entry: PlannedEntry, inline: InlineContext): TextBlock[] | undefined {
  const value = entry.raw._lore
  if (value === undefined) return undefined
  const blocks = loreBlocks(entry, value, inline)
  return blocks.length ? blocks : undefined
}

/** 描述补丁条目：目标条目在 SRD，正文放进来源书对应的包。 */
export function convertLore(entry: PlannedEntry, ctx: ConvertContext, inline: InlineContext): Entry {
  const target = str(entry.raw._target)
  const variants = convertVariants(entry.raw._variants, inline)
  const data: Record<string, unknown> = {
    target,
    ...(entry.raw._lore !== undefined ? { lore: loreBlocks(entry, entry.raw._lore, inline) } : {}),
    ...(variants.length ? { variants } : {}),
    src: pageOf(entry),
    credit: creditFor(entry, ctx.bookMachine.get(entry.source) ?? false),
  }
  return {
    id: entry.id,
    type: 'lore',
    name: entry.name,
    nameEn: entry.nameEn,
    keywords: keywordsOf(entry),
    unique: false,
    summary: '描述文字',
    data,
  }
}
