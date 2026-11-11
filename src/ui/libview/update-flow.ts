// 书架【拉取更新】：用户点了才去取更新信息（官方：比较上游提交，作者程序版本不一致就提示升级插件；自制：比较包里的修改日期）。有更新才问要不要更新。
import type { Services } from '../../core/services'
import { SOURCES, officialSourceOf } from '../../library/sources'
import { askConfirm } from '../kit/confirm'
import { reportLibError } from './deps-flow'

type Toast = { success: (m: string) => void; error: (m: string) => void; info: (m: string) => void }

export async function pullUpdates(s: Services, codeSet: string, toast: Toast): Promise<boolean> {
  const lib = s.backend.library
  try {
    const official = await Promise.all([...new Set([officialSourceOf(codeSet).id, officialSourceOf('en').id])].map((id) => lib.updates.check(id)))
    const brewSet = SOURCES.find((x) => x.kind === 'brew' && x.codeSet === codeSet)?.id
    const brew = brewSet ? (await lib.service.brewCheckUpdates(brewSet)).value.filter((b) => b.hasUpdate) : []
    const available = official.filter((o) => o.status === 'available')
    if (official.some((o) => o.status === 'needs-plugin-upgrade')) toast.error('官方资料有新版，但需要先升级插件才能用')
    if (!available.length && !brew.length) {
      if (!official.some((o) => o.status === 'needs-plugin-upgrade')) toast.info('都是最新的')
      return false
    }
    const lines = [...available.map((o) => `官方资料（${o.setId}）：${o.changed ? `${o.changed.changed + o.changed.added} 个文件要更新` : '有新版'}`), ...brew.map((b) => `自制包：${b.filename ?? b.url}`)]
    if (!(await askConfirm({ title: '有可以更新的资料', message: '现在更新吗？', details: lines, confirmLabel: '更新' }))) return false
    for (const o of available) await lib.updates.apply(o.setId)
    if (brewSet && brew.length) await lib.service.brewPull(brewSet, brew.map((b) => b.docIdLocal))
    toast.success(`已开始更新（${available.length} 套官方资料，${brew.length} 个自制包）`)
    return true
  } catch (e) {
    await reportLibError(s, e, '拉取更新', toast, () => void pullUpdates(s, codeSet, toast))
    return false
  }
}
