// 条目英文对照：从 service.ts 拆出，保持单文件职责与行数上限。
import { fluffOf } from './cache'
import type { LibraryService } from './service'
import type { English } from './service-types'
import { getSource, type SourceEntry } from './sources'
import type { LibraryView } from './revision'

async function bothInstalled(a: SourceEntry, b: SourceEntry, view: LibraryView): Promise<boolean> {
  const [x, y] = await Promise.all([view.officialState(a.id), view.officialState(b.id)])
  return x?.status === 'installed' && y?.status === 'installed'
}

export async function englishOf(
  service: LibraryService,
  s: SourceEntry,
  prop: string,
  hash: string,
  { fluff = true, view: viewArg }: { fluff?: boolean; view?: LibraryView } = {},
): Promise<English | null> {
  const view = viewArg ?? await service.currentView()
  if (!s.pair) return null
  const pair = getSource(s.pair)
  if (!(await bothInstalled(s, pair, view))) return { status: 'not-installed' }
  const hit = (await service.englishPairs(s.id, view)).pairs[prop]?.[hash]
  if (!hit) return { status: 'not-paired' }
  const stored = await service.storedItem(pair.id, prop, hit.enHash, view)
  if (!stored) return { status: 'not-found', hash: hit.enHash }
  const f = fluff ? await fluffOf(service['opts'].db, pair.id, prop, hit.enHash, view) : null
  return { status: 'found', hash: hit.enHash, via: hit.via, item: stored.item, fluff: f?.fluff ?? null }
}
