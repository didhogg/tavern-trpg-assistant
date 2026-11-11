// 一套资料「实际已装了哪些来源」（P5 T6 后1）：官方状态里 sources = null 表示「全部」，
// 这时不能拿作者书目里有书号的来源代替（会漏掉只有来源、没有书号的，如 Generic、基础包），要按本机解析出来的数据统计。
// 书架的来源条数、单本卸载、删除预览、包体检共用这一处。
import { countSources, parsedKey } from './install'
import type { LibraryView } from './revision'

/** 这一套里每个来源有多少条（本机解析结果统计，按版本缓存在 sources:<set>）。 */
export async function sourceCountsAll(view: LibraryView, setId: string): Promise<Record<string, number>> {
  const fp = String((await view.derivedGet(`audit:${setId}`))?.savedAt ?? '')
  const saved = await view.derivedGet(`sources:${setId}`)
  if (saved && saved.fingerprint === fp) return { ...(saved.value as Record<string, number>) }
  const prefix = parsedKey(setId, '')
  const map = await view.derivedKeys(prefix)
  const counts = countSources([...map.entries()].map(([key, rec]) => ({ key, value: rec.value })), prefix)
  await view.derivedPut(`sources:${setId}`, fp, counts)
  return counts
}

/** 官方一套实际已装的来源：状态里列了就用列的；「全部」就用本机数据里出现的全部来源。没装返回 []。 */
export async function installedOfficialSources(view: LibraryView, setId: string): Promise<string[]> {
  const state = await view.officialState(setId)
  if (!state || state.status !== 'installed') return []
  if (state.sources) return state.sources
  return Object.keys(await sourceCountsAll(view, setId))
}
