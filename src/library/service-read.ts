// 当前版本的读取闸门：逻辑卸载 / 按书删除后，新版本按自己的已装集合读；旧版本仍按旧状态读。
import { getSource } from './sources'
import type { LibraryView } from './revision'

export async function ensureReadable(view: LibraryView, sourceId: string): Promise<void> {
  const source = getSource(sourceId)
  if (source.kind !== 'official') return
  const state = await view.officialState(source.id)
  if (state && state.status !== 'installed') throw new Error(`${source.id} 已经卸载；旧版本仍可读，要读请重新下载`)
}

export async function installedSource(view: LibraryView, sourceId: string, source: string | null): Promise<boolean> {
  if (!source || getSource(sourceId).kind !== 'official') return true
  const state = await view.officialState(sourceId)
  if (!state) return true
  if (state.status !== 'installed') return false
  if (!state.sources) return true
  return state.sources.some((s) => s.toLowerCase() === source.toLowerCase())
}
