type Block = Record<string, unknown>
const record = (value: unknown): value is Block => !!value && typeof value === 'object' && !Array.isArray(value)

export function entriesOf(prop: string, item: unknown): unknown {
  if (!record(item)) return null
  if (prop === 'table' || prop === 'embeddedTable') return { ...item, type: 'table' }
  if (prop === 'tableGroup') return item.tables ?? item.entries ?? null
  if (['item', 'baseitem', 'magicvariant'].includes(prop)) {
    return [item._fullEntries ?? item.entries, item._fullAdditionalEntries ?? item.additionalEntries].filter((entries) => Array.isArray(entries) && entries.length)
  }
  if (prop === 'spell') return [item.entries, item.entriesHigherLevel].filter((entries) => Array.isArray(entries) && entries.length)
  return item.entries ?? null
}

const CONTENT_KEYS = ['entries', 'entry', 'items', 'rows', 'row', 'tables', 'images', 'wrapped', 'statblockData']

/** Visit the same nested content shown in the reader, keeping the author's image blocks. */
export function imagesOf(content: unknown): Block[] {
  const images = new Map<string, Block>()
  function visit(value: unknown): void {
    if (Array.isArray(value)) { value.forEach(visit); return }
    if (!record(value)) return
    if (value.type === 'image' && record(value.href)) {
      const key = JSON.stringify([value.href, value.title, value.credit])
      if (!images.has(key)) images.set(key, value)
      return
    }
    for (const key of CONTENT_KEYS) visit(value[key])
  }
  visit(content)
  return [...images.values()]
}
