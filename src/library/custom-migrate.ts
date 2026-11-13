// P5.5 B8-6 迁移（第一次用到【我的库】时做一次，做完记标记）：
// ① 可编辑自制里除了房规以外的来源（「我的资料」、阶段 B 建的包）各搬成一个独立的作者自制包：同一次修改里作者导入新包 +
//    从可编辑自制里删掉。条目保留 uniqueId 和作者编号，撤销记录、归类、房规的 _copy 都接得上；撤销记录、草稿补上「在哪个包」。
// ② 以前「存入我的库」的旧副本（本地导入、包头来源全是官方来源）：补 _meta.internalCopies，去掉和作者给 Foundry 用的补充文件里
//    一模一样的记录（作者网站不读的官方数据文件；在全新小窗里让作者读一遍，记下读了哪些，custom-copy.ts authorFiles）。
import { authorFiles, type CopyDeps } from './custom-copy'
import type { EditStep, ManageStore } from './manage'
import type { LibraryService } from './service'
import { officialSourceOf } from './sources'
import { packStableId } from './versions'

export interface MigrateDeps {
  db: CopyDeps['db']
  lib: CopyDeps['lib'] & Pick<LibraryService, 'mutateAuthor'>
  manage: ManageStore
  /** 房规的来源编号（留在可编辑自制里）。 */
  houseSource: string
}

const FLAG = (codeSet: string): string => `p55-b8-migrated:${codeSet}`
const low = (v: unknown): string => String(v ?? '').toLowerCase()

export interface MigrateReport {
  /** 搬成独立包的来源 → 包的身份、搬了几条。 */
  moved: Array<{ source: string; pack: string; entries: number }>
  /** 修过的旧副本：包的身份、去掉几条补充记录、补的 internalCopies。 */
  fixed: Array<{ pack: string; removed: number; internalCopies: string[] }>
}

/** 做过就返回 null；没做过就做一次。 */
export async function migrateMine(d: MigrateDeps, codeSet: string): Promise<MigrateReport | null> {
  if (await d.manage.meta(FLAG(codeSet))) return null
  const report: MigrateReport = { moved: [], fixed: [] }
  const f = await d.lib.frameOf(codeSet)
  // ① 要搬的：可编辑自制里房规以外的来源
  const editable = (await f.call('editableDoc')).body ?? {}
  const sources = ((editable._meta?.sources ?? []) as Array<{ json: string }>).filter((s) => low(s.json) !== low(d.houseSource))
  // ② 要修的旧副本：本地导入、包头来源全是官方来源；补充记录 = 作者网站不读的官方数据文件里、来源对得上的那些
  const docs = (await f.call('brewDocIndex')).filter((x) => !x.isEditable && !x.url && x.sources.length)
  const old: typeof docs = []
  for (const doc of docs) if ((await f.call('officialSourcesOf', doc.sources)).length === doc.sources.length) old.push(doc)
  const overlay: string[] = []
  if (old.length) {
    const view = await d.lib.currentView()
    const official = officialSourceOf(codeSet)
    const read = new Set(await authorFiles(d, codeSet))
    const wanted = new Set(old.flatMap((x) => x.sources.map(low)))
    for (const path of await view.filePaths(official)) {
      if (!path.startsWith('data/') || !path.endsWith('.json') || read.has(path) || /^data\/(generated|book|adventure)\//.test(path)) continue
      const text = (await view.fileGet(official, path))?.text
      if (text == null) continue
      try {
        for (const v of Object.values(JSON.parse(text) as Record<string, unknown>)) if (Array.isArray(v)) for (const e of v) if (wanted.has(low((e as { source?: unknown })?.source))) overlay.push(JSON.stringify(e))
      } catch { /* 不是 JSON 的文件不是数据，跳过 */ }
    }
  }
  // 一次修改里做完（先修旧副本再搬，作者只解析一次、不会因为旧副本的老问题报错）
  const packOf = new Map<string, string>()
  if (sources.length || old.length) {
    const r = await d.lib.mutateAuthor(codeSet, 'p55-migrate', async (v) => {
      const f2 = await d.lib.frameOf(codeSet, v)
      const fixed = []
      for (const doc of old) fixed.push({ pack: packStableId({ sources: doc.sources }) ?? doc.docIdLocal, ...(await f2.call('packFixOldCopy', doc.docIdLocal, overlay)) })
      const moved = []
      for (const s of sources) {
        const taken = await f2.call('editableTake', s.json)
        const add = await f2.call('brewAddFiles', [{ name: `${s.json}.json`, text: JSON.stringify(taken.body) }])
        if (!add.value.added.length) throw new Error(`作者没有收下迁移出来的包 ${s.json}：${add.errors.join('；')}`)
        moved.push({ source: s.json, uniqueIds: taken.uniqueIds, entries: Object.entries(taken.body).filter(([k, x]) => !k.startsWith('_') && Array.isArray(x)).reduce((n, [, x]) => n + (x as unknown[]).length, 0) })
      }
      return { fixed, moved }
    })
    report.fixed.push(...r.value.fixed)
    for (const m of r.value.moved) {
      const pack = packStableId({ sources: [m.source] })!
      for (const id of m.uniqueIds) packOf.set(id, pack)
      report.moved.push({ source: m.source, pack, entries: m.entries })
    }
  }
  // 撤销记录、草稿补上「在哪个包」（只补以前没有包的）
  if (packOf.size) {
    for (const [key, steps] of await d.manage.allHistory()) {
      const pack = packOf.get(key.split('|').slice(2).join('|'))
      if (pack && steps.some((s) => !s.pack)) await d.manage.setHistory(key, steps.map((s): EditStep => (s.pack ? s : { ...s, pack })))
    }
    for (const [key, draft] of await d.manage.drafts()) {
      if (draft.target.kind === 'mine' && !draft.target.pack && packOf.has(draft.target.uniqueId)) await d.manage.putDraft(key, { ...draft, target: { ...draft.target, pack: packOf.get(draft.target.uniqueId)! } })
    }
  }
  await d.manage.setMeta(FLAG(codeSet), { at: Date.now(), ...report })
  return report
}
