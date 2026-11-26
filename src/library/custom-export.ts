// 书架导出沿用作者的包文件和条目格式，和「复制成我的」共用官方取数。
import { authorFiles, type CopyDeps } from './custom-copy'
import { copyRawSource } from './copy-source'
import { rawEntry } from './custom-raw'
import type { LibraryView } from './revision'
import type { ScopedLibrary } from './scoped'
import type { CampaignLibrary, EntryRef, EntrySelection } from './scopes'
import { getSource } from './sources'

export type LibraryExportTarget =
  | { kind: 'pack'; set: string; source: string; docIdLocal?: string }
  | { kind: 'entry'; campaign: CampaignLibrary; ref: EntryRef; selection?: EntrySelection }

type ExportDeps = Pick<CopyDeps, 'db' | 'lib'> & { scoped: Pick<ScopedLibrary, 'detail'> }
type ExportFile = { body: unknown; incomplete: boolean }

export async function exportBrew(d: Pick<ExportDeps, 'lib'>, codeSet: string, docIdLocal: string, viewArg?: LibraryView) {
  const view = viewArg ?? await d.lib.currentView()
  try { return await (await d.lib.frameOf(codeSet, view)).call('brewExport', docIdLocal) }
  catch {
    // 官方没装时，从作者的存储直接取同一个包。
    const raw = (await view.kvGet(codeSet, 'HOMEBREW_2_STORAGE')) as Array<{ head?: { docIdLocal?: string; filename?: string }; body?: unknown }> | null
    const hit = raw?.find((doc) => doc.head?.docIdLocal === docIdLocal)
    if (!hit) return null
    return { filename: hit.head?.filename ?? `${docIdLocal}.json`, body: hit.body }
  }
}

export async function exportSelection(d: ExportDeps, target: LibraryExportTarget): Promise<ExportFile> {
  const view = await d.lib.currentView()
  if (target.kind === 'pack' && target.docIdLocal) {
    const file = await exportBrew(d, getSource(target.set).codeSet, target.docIdLocal, view)
    if (!file?.body) throw new Error('找不到这个包，请从书架重新打开')
    return { body: file.body, incomplete: false }
  }

  const detail = target.kind === 'entry'
    ? await d.scoped.detail(target.campaign, target.ref, { browse: true, view, selection: target.selection })
    : null
  if (target.kind === 'entry' && (!detail || 'hidden' in detail)) throw new Error('找不到这个条目，请重新打开')
  const visible = detail && !('hidden' in detail) ? detail : null
  const house = !visible?.docIdLocal && target.kind === 'entry' && !target.selection
    ? visible?.alternatives.find((alt) => alt.kind === 'houserule' && alt.altId === visible.version.altId)?.ref
    : undefined
  const ref = house ?? visible?.ref
  const set = getSource(ref?.set ?? (target.kind === 'entry' ? target.ref.set : target.set))
  const item = visible?.item as Record<string, unknown> | undefined

  if (ref && (visible?.docIdLocal || set.kind === 'brew')) {
    // 精确的包编号优先。只有房规或确实没有撞编号的自制条目才按作者编号找包。
    const doc = visible?.docIdLocal ?? (await rawEntry(d, ref, view))?.docIdLocal
    if (!doc) throw new Error('找不到这个条目的原始包，请从包里重新打开')
    const frame = await d.lib.frameOf(set.codeSet, view)
    return { body: await frame.call('packExportEntry', doc, ref.prop, ref.hash, item), incomplete: false }
  }

  const source = target.kind === 'pack' ? target.source : visible?.source
  if (!source || set.kind !== 'official') throw new Error('找不到要导出的官方来源')
  if ((await view.officialState(set.id))?.status !== 'installed') throw new Error('这套资料还未安装')
  const result = await copyRawSource({
    db: d.db, lib: d.lib, official: set, source, view,
    ...(ref ? { entry: { prop: ref.prop, hash: ref.hash, resolved: item } } : {}),
    authorFiles: () => authorFiles(d, set.codeSet, view),
  })
  if (!Object.values(result.counts).some((count) => count > 0)) throw new Error('本机没有这份资料的可导出内容')
  return { body: result.json, incomplete: !!result.skipped.length }
}
