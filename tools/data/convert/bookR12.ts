import type { Entry } from '../../../src/schemas/pack'
import type { PlannedEntry } from './plan'
import type { ConvertContext } from './context'
import type { InlineContext } from '../markup/inline'
import { creditFor, keywordsOf, str } from './common'
import { convertBlocks } from './blocks'
import { bookBlockOptions } from './blocksBook'
import type { R12OutlineItem } from './r12Types'

export function convertBook(entry: PlannedEntry, ctx: ConvertContext, inline: InlineContext): Entry {
  const raw = entry.raw
  const chapter = raw._chapter as Record<string, unknown>
  const outline = raw._outline as R12OutlineItem[]
  const data: Record<string, unknown> = {
    src: { book: entry.source, page: entry.page },
    credit: creditFor(entry, ctx.bookMachine.get(entry.source) ?? false),
    text: convertBlocks(chapter.entries, inline, bookBlockOptions),
    book: entry.source,
    order: Number(raw._order ?? 0),
    ...(raw._ordinal ? { ordinal: raw._ordinal } : {}),
    anchor: str(raw._anchor),
    outline,
  }
  return { id: entry.id, type: 'book', name: entry.name, nameEn: entry.nameEn, keywords: keywordsOf(entry), unique: false, summary: str(raw._summary), data }
}
