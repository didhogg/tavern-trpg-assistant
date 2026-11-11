// 表格查询：让作者自己的提取器从官方条目、自制条目、书/冒险正文的对象里提表。
import { getSource } from './sources'
import { parsedKey } from './install'
import type { LibraryService } from './service'
import type { LibraryView } from './revision'
import { ensureReadable } from './service-read'
import type { ExtractedTable } from './runtime/frame/table-extract-commands'

export async function tablesFor(
  service: LibraryService,
  sourceId: string,
  prop: string,
  hash?: string,
  viewArg?: LibraryView,
): Promise<{ tables: ExtractedTable[]; skipped: Array<{ name: string; error: string }> }> {
  const view = viewArg ?? await service.currentView()
  await ensureReadable(view, sourceId)
  const source = getSource(sourceId)
  let items: unknown[] | undefined
  let fallback: string | null = null
  if (hash && (prop === 'book' || prop === 'adventure')) {
    const rec = await view.derivedGet(parsedKey(sourceId, prop, hash))
    if (!rec) throw new Error(`${sourceId} 没有这条正文：${prop} ${hash}`)
    const value = rec.value as Record<string, unknown>
    const flatten = (v: unknown): unknown[] => Array.isArray(v) ? v : (v && typeof v === 'object' && Array.isArray((v as { data?: unknown }).data) ? (v as { data: unknown[] }).data : [])
    fallback = (value.bookData as { source?: string } | undefined)?.source ?? (value.adventureData as { source?: string } | undefined)?.source ?? null
    items = Object.values(value).flatMap(flatten)
  } else if (hash) {
    const parsed = await service.parsed(sourceId, prop, view)
    const i = parsed.hashes.indexOf(hash)
    if (i < 0) throw new Error(`${sourceId} 没有这个条目：${prop} ${hash}`)
    items = [parsed.items[i]]
  } else if (source.kind === 'brew') {
    items = (await service.parsed(sourceId, prop, view)).items.filter((it) => !!it)
  }
  const frame = await service.frameOf(source.codeSet, view)
  return frame.call('extractTables', prop, items, fallback)
}
