// 库页上的"动作"：卸载 / 删除（先看影响）、存入我的库。界面只调后端、只拼提示；谁受影响由 backend.removalImpact 算。
import type { RemovalTarget } from '../../core/removal-impact'
import type { Services } from '../../core/services'
import type { CatalogRow } from '../../library/scoped'
import { getSource, officialSourceOf } from '../../library/sources'
import { askConfirm } from '../kit/confirm'

type Toast = { success: (m: string) => void; error: (m: string) => void }

const brewPackOf = async (s: Services, row: CatalogRow) => (await s.backend.library.brewPacks.list(row.set)).find((p) => p.sources.some((x) => x.toLowerCase() === row.source.toLowerCase())) ?? null

/** 卸载官方资料（整套，中英一起）或删除一个自制包；删之前列影响，因缺依赖必须一起删的包也列出（不可取消）。 */
export async function removeSource(s: Services, row: CatalogRow, skipPrompt: boolean, toast: Toast): Promise<boolean> {
  const official = getSource(row.set).kind === 'official'
  const pack = official ? null : await brewPackOf(s, row)
  if (!official && !pack) { toast.error('找不到这个包的安装记录'); return false }
  const target: RemovalTarget = official ? { kind: 'official', setId: row.set } : { kind: 'brew', setId: row.set, docIdLocals: [pack!.docIdLocal] }
  try {
    const impact = await s.backend.removalImpact(target)
    const lines = [
      ...impact.packs.map((p) => `${p.mustRemove ? '必须一起删除：' : '依赖它：'}${p.filename ?? p.docIdLocal}（${p.why}）`),
      ...(impact.houseRules.length ? [`${impact.houseRules.length} 条房规`] : []),
      ...(impact.choices.length ? [`${impact.choices.length} 处编辑 / 覆盖（按包编号保存，重装后自动套用）`] : []),
      ...(impact.saves.length ? [`${new Set(impact.saves.map((x) => x.ownerLabel)).size} 个战役的 ${impact.saves.length} 份存档 / 当前数据用到它`] : []),
    ]
    if (!skipPrompt || impact.packs.some((p) => p.mustRemove)) {
      const ok = await askConfirm({ title: official ? '卸载官方资料？' : `删除《${row.name}》？`, message: official ? '整套官方资料（中英文）会从本机删除，释放空间，之后可在下载页重新下载。已下载的自制包会保留，但要重装官方资料后才能读。' : '这个包会从本机删除。', details: lines.length ? lines : undefined, confirmLabel: official ? '确认卸载' : '确认删除', danger: true })
      if (!ok) return false
    }
    if (official) {
      for (const id of new Set([row.set, officialSourceOf('en').id])) await s.backend.library.uninstallOfficial(id)
    } else {
      await s.backend.library.service.brewDelete(row.set, impact.removeTogether.length ? impact.removeTogether : [pack!.docIdLocal])
    }
    toast.success(official ? '已卸载官方资料' : '已删除')
    return true
  } catch (e) {
    console.error('[trpg-assistant] 卸载 / 删除失败', e)
    toast.error(e instanceof Error ? e.message : '没有成功，原有内容没有改动')
    return false
  }
}

/** 存入我的库：本地原样副本，不跟着源更新，也不受卸载影响。 */
export async function saveToMine(s: Services, row: CatalogRow, toast: Toast): Promise<boolean> {
  const ok = await askConfirm({ title: `把《${row.name}》存入我的库？`, message: '会存一份本地原样副本到「我的库」。之后源仓库更新、或者卸载这本书，都不会影响这份副本。', confirmLabel: '存入' })
  if (!ok) return false
  try {
    const codeSet = getSource(row.set).codeSet
    if (getSource(row.set).kind === 'official') await s.backend.library.custom.saveToMine(codeSet, { kind: 'source', source: row.source })
    else {
      const pack = await brewPackOf(s, row)
      if (!pack) { toast.error('找不到这个包的安装记录'); return false }
      await s.backend.library.custom.saveToMine(codeSet, { kind: 'pack', docIdLocal: pack.docIdLocal })
    }
    toast.success('已存入我的库')
    return true
  } catch (e) {
    console.error('[trpg-assistant] 存入我的库失败', e)
    toast.error(e instanceof Error ? e.message : '存入没有成功')
    return false
  }
}
