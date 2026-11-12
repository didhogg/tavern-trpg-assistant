// 书架【拉取更新】（P5 T6 B3）：检查时书架照常显示，顶部出一条「正在检查更新…」；有更新的行标【有更新】，
// 可以单本更新或【全部更新】。能不能只更新一本由后端判断：后端发现牵连共用文件时，
// 弹窗列出这次会连带更新的书和大小，确认后按整批更新。需要升级插件只提示、不给更新。
import type { Services } from '../../core/services'
import { OfficialUpdateBatchRequired, OfficialUpdateCurrent, type OfficialUpdateCheck } from '../../library/official-update'
import type { CatalogRow } from '../../library/scoped'
import { SOURCES, officialSourceOf } from '../../library/sources'
import { useDownloadsStore } from '../../stores/downloads'
import { useLibNoticeStore } from '../../stores/libnotice'
import { useUpdatesStore } from '../../stores/updates'
import { askConfirm } from '../kit/confirm'
import { formatBytes } from '../format'
import { reportLibError } from './deps-flow'

type Toast = { success: (m: string) => void; error: (m: string) => void; info: (m: string) => void }
const CHECKING = 'update:checking'

/** 拉取更新：只检查，不下载。结果放进 updates 仓库，书架据此标【有更新】。 */
export async function pullUpdates(s: Services, codeSet: string, toast: Toast): Promise<boolean> {
  const lib = s.backend.library
  const store = useUpdatesStore()
  const notices = useLibNoticeStore()
  if (store.checking) return false
  store.checking = true
  notices.show({ key: CHECKING, text: '正在检查更新…（书架照常可用）', actions: [] })
  try {
    const view = await lib.currentView()
    const sets = [...new Set([officialSourceOf(codeSet).id, officialSourceOf('en').id])]
    const states = await Promise.all(sets.map((id) => view.officialState(id)))
    const official = await Promise.all(sets.filter((_, i) => states[i]?.status === 'installed').map((id) => lib.updates.check(id)))
    const brewSet = SOURCES.find((x) => x.kind === 'brew' && x.codeSet === codeSet)?.id
    const brew = brewSet ? (await lib.service.brewCheckUpdates(brewSet)).value.filter((b) => b.hasUpdate).map((b) => ({ ...b, setId: brewSet })) : []
    store.set(official, brew)
    notices.dismiss(CHECKING)
    notices.dismiss('update:available')
    const upgrade = official.find((o) => o.status === 'needs-plugin-upgrade')
    if (upgrade) notices.show({ key: 'update:plugin', text: `官方资料有新版，但上游作者程序是 ${upgrade.programVersion.upstream ?? '新版本'}，插件里是 ${upgrade.programVersion.plugin}：要先升级插件才能更新官方资料。`, actions: [] })
    if (!store.available.length && !brew.length) { if (!upgrade) toast.info('都是最新的'); return false }
    notices.show({ key: 'update:available', text: `有 ${store.count} 项资料可以更新；有更新的书 / 包在书架上标了【有更新】。`, actions: [{ label: '全部更新', run: () => void updateAll(s, toast) }] })
    return true
  } catch (e) {
    notices.dismiss(CHECKING)
    await reportLibError(s, e, '检查更新', toast, () => void pullUpdates(s, codeSet, toast))
    return false
  } finally { store.checking = false }
}

const changedOf = (c: OfficialUpdateCheck) => (c.objects ?? []).filter((o) => o.added || o.changed || o.removed || o.shared)

/** 整批更新一套官方资料：先弹窗说明会连带更新哪些书、多大，确认后开任务。 */
async function updateWholeSet(s: Services, check: OfficialUpdateCheck, reason: string | null, toast: Toast): Promise<void> {
  const objs = changedOf(check)
  const ok = await askConfirm({
    title: '这次要整批更新',
    message: `${reason ? `${reason}。` : ''}这一套官方资料会一起更新下面这些书 / 冒险，共要下载约 ${formatBytes(check.changed?.bytes ?? 0)}。更新期间书架照常可用，失败会保留旧版本。`,
    sections: [{ title: '会一起更新', items: objs.length ? objs.map((o) => `${o.name || o.id}${o.shared ? '（共用文件）' : ''}`) : ['共用文件（不属于某一本书）'], tone: 'info' }],
    confirmLabel: '整批更新',
  })
  if (!ok) return
  try {
    const { task } = await s.backend.library.updates.apply(check.setId)
    const label = objs.length ? `更新《${objs[0].name || objs[0].id}》${objs.length > 1 ? `等 ${objs.length} 项` : ''}` : '更新共用资料'
    useDownloadsStore().rememberTask(task, label, () => void updateWholeSet(s, check, null, toast))
    toast.success('已开始更新，进度见【库】标志')
  } catch (e) {
    if (e instanceof OfficialUpdateCurrent) { useUpdatesStore().published(check.setId, check.latest); toast.info(e.message) }
    else await reportLibError(s, e, '更新官方资料', toast)
  }
}

/** 书架行上的【更新】：先请后端只更新这一本；后端说不能单独更新时，改为确认后整批更新。 */
export async function updateRow(s: Services, row: CatalogRow, toast: Toast): Promise<void> {
  const store = useUpdatesStore()
  const dl = useDownloadsStore()
  const brew = store.brewOf(row.pack?.docIdLocal)
  if (brew) {
    const label = `更新《${row.name}》`
    await dl.trackBrew(s.backend.library.tasks, brew.setId, `update:${brew.docIdLocal}`, label, async (report, signal) => {
      report('下载新版并整理资料', null)
      try { await s.backend.library.service.brewPull(brew.setId, [brew.docIdLocal], signal) } catch (e) {
        if ((e as { name?: unknown })?.name === 'BrewDependencyError') { await reportLibError(s, e, label, toast, () => void updateRow(s, row, toast)); return { reported: (e as Error).message } }
        return e instanceof Error ? e.message : String(e)
      }
      signal.throwIfAborted()
      store.done(brew.setId, brew.docIdLocal)
      toast.success(`《${row.name}》已更新`)
      return null
    }, () => void updateRow(s, row, toast))
    return
  }
  const hit = store.officialOf(row.set, row.kind, row.id, row.source)
  if (!hit) return
  try {
    const { task } = await s.backend.library.updates.apply(row.set, row.kind === 'adventure' ? { adventureIds: [row.id ?? row.source] } : { bookIds: [row.id ?? row.source] })
    dl.rememberTask(task, `更新《${row.name}》`, () => void updateRow(s, row, toast))
    toast.success(`已开始更新《${row.name}》，进度见【库】标志`)
  } catch (e) {
    if (e instanceof OfficialUpdateCurrent) { store.published(hit.check.setId, hit.check.latest, e.selection); toast.info(e.message) }
    else if (e instanceof OfficialUpdateBatchRequired) await updateWholeSet(s, hit.check, e.message, toast)
    else await reportLibError(s, e, `更新《${row.name}》`, toast)
  }
}

/** 顶部横幅【全部更新】：每套官方资料整批更新 + 每个有新版的自制包。 */
export async function updateAll(s: Services, toast: Toast): Promise<void> {
  const store = useUpdatesStore()
  useLibNoticeStore().dismiss('update:available')
  for (const check of [...store.available]) await updateWholeSet(s, check, null, toast)
  for (const b of [...store.brew]) {
    const label = `更新《${(b.filename ?? b.docIdLocal).replace(/\.json$/, '')}》`
    await useDownloadsStore().trackBrew(s.backend.library.tasks, b.setId, `update:${b.docIdLocal}`, label, async (_report, signal) => {
      try { await s.backend.library.service.brewPull(b.setId, [b.docIdLocal], signal); signal.throwIfAborted(); store.done(b.setId, b.docIdLocal); return null } catch (e) {
        if ((e as { name?: unknown })?.name === 'BrewDependencyError') { await reportLibError(s, e, label, toast); return { reported: (e as Error).message } }
        return e instanceof Error ? e.message : String(e)
      }
    })
  }
}
