// 战役和后台换算用同一版本、同一语言的作者包。只改交给结算小窗的临时副本。
import type { BrewPack } from '../../library/brew-packs'
import { requirementsOf } from '../../library/brew-health'
import type { FlattenResult } from '../../library/runtime/frame/copy-flatten-commands'
import type { LibraryView } from '../../library/revision'
import { BREW_STORAGE_KEY } from '../../library/brew-storage'
import { SOURCES, kernelDataSource } from '../../library/sources'
import type { EntryRef } from '../../library/scopes'
import { packAltId, packStableId } from '../../library/versions'

export interface KernelBrewDoc {
  head: { docIdLocal: string; filename?: string | null }
  body: Record<string, unknown>
}

export interface PreparedBrew {
  doc: KernelBrewDoc
  pack: BrewPack
  flattened: number
  failures: FlattenResult['failed']
}

export interface ExcludedBrew {
  docIdLocal: string
  filename: string | null
  sources: string[]
  reason: string
}

export async function libraryBrews(
  view: LibraryView,
  codeSet: string,
  open: () => Promise<{
    packs: BrewPack[]
    flatten: (body: KernelBrewDoc['body'], sources: string[], includedSources: string[]) => Promise<FlattenResult>
  }>,
): Promise<PreparedBrew[]> {
  const raw = await view.kvGet(codeSet, BREW_STORAGE_KEY) as KernelBrewDoc[] | null
  if (!Array.isArray(raw) || !raw.length) return []
  const { packs, flatten } = await open()
  const byId = new Map(packs.map((pack) => [pack.docIdLocal, pack]))
  const includedSources = [...new Set(packs.flatMap((pack) => requirementsOf(pack).filter((req) => req.kind === 'include').map((req) => req.source)))]
  const out: PreparedBrew[] = []
  for (const doc of raw) {
    const pack = byId.get(doc?.head?.docIdLocal)
    if (!pack) continue // 作者管理器本身就不载入没有来源的文档
    if (codeSet === kernelDataSource().codeSet) {
      out.push({ doc, pack, flattened: 0, failures: [] })
      continue
    }
    const result = await flatten(doc.body, pack.sources, includedSources)
    out.push({ doc: { ...doc, body: result.json }, pack, flattened: result.flattened, failures: result.failed })
  }
  return out
}

/** 按实际选中的包定位；原件按库的撞编号顺序查，避免同来源误伤另一个包。 */
export function excludedBrewReason(
  brews: PreparedBrew[], excluded: ExcludedBrew[], ref: EntryRef, altId: string | null, source: string | null,
): string | null {
  if (!excluded.length) return null
  const findVersion = (pack: BrewPack) => (altId?.startsWith('pack:') || altId?.startsWith('doc:')) &&
    (packAltId(packStableId(pack), pack.docIdLocal) === altId || `doc:${pack.docIdLocal}` === altId)
  const packs = brews.map(({ pack }) => pack)
  const original = SOURCES.some((set) => set.id === ref.set && set.kind === 'brew') && (altId === null || altId === 'base')
  const candidates = packs.filter((pack) => (pack.hashes[ref.prop] ?? []).includes(ref.hash))
  const provider = packs.find(findVersion) ?? (original
    ? candidates[0]
      ?? packs.find((pack) => source && pack.sources.some((id) => id.toLowerCase() === source.toLowerCase())
        && !packs.some((other) => other !== pack && other.sources.some((id) => id.toLowerCase() === source.toLowerCase())))
    : undefined)
  const blocked = excluded.find(({ docIdLocal }) => docIdLocal === provider?.docIdLocal)
  return blocked ? `自制包「${blocked.filename ?? blocked.sources.join('、')}」无法用于结算：${blocked.reason}` : null
}
