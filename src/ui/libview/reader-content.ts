import { splitInline, tagLabel } from './inline-text'

type Header = string | { header?: string; index?: number; depth?: number }
export interface ReaderHeading { name: string; index: number; depth: number }
interface ChapterMeta { name?: string; headers?: Header[] }
interface NamedBlock { name?: string; type?: string; entries?: unknown[] }

export const headingText = (title: string): string => splitInline(title).map((part) => part.kind === 'text' ? part.text : tagLabel(part.content, part.tag)).join('').trim()
export const headingKey = (title: string): string => headingText(title).toLowerCase()

function bodyHeaders(block: unknown, depth = 0): Header[] {
  if (Array.isArray(block)) return block.flatMap((child) => bodyHeaders(child, depth))
  if (!block || typeof block !== 'object') return []
  const item = block as NamedBlock
  const own = item.name && ['section', 'entries', 'inset', 'insetReadaloud', 'variant', 'variantInner'].includes(item.type ?? 'entries')
  const children = bodyHeaders(item.entries, own ? depth + 1 : depth)
  return own ? [{ header: item.name, depth }, ...children] : children
}

export function readerChapters(data: unknown[], contents?: ChapterMeta[]) {
  return data.map((entry, i) => {
    const block = entry as NamedBlock | null
    const meta = contents?.[i]
    const counts = new Map<string, number>()
    const fromBody = bodyHeaders(block?.entries)
    const all = fromBody.length ? fromBody : meta?.headers ?? []
    const headings = all.flatMap((header): ReaderHeading[] => {
      const name = typeof header === 'string' ? header : header.header
      if (!name) return []
      const key = headingKey(name)
      const index = counts.get(key) ?? 0
      counts.set(key, index + 1)
      return [{ name, index: typeof header === 'string' ? index : header.index ?? index, depth: typeof header === 'string' ? 0 : header.depth ?? 0 }]
    })
    return { name: block?.name ?? meta?.name ?? `第 ${i + 1} 章`, entry, headings }
  })
}
