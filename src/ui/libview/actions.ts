// 库页上的"动作"：卸载 / 删除（先看影响）、存入我的库。界面只调后端、只拼提示；谁受影响由 backend.removalImpact 算。
import type { RemovalImpact, RemovalTarget } from '../../core/removal-impact'
import type { Services } from '../../core/services'
import type { CatalogRow } from '../../library/scoped'
import { getSource } from '../../library/sources'
import { askConfirm, type ConfirmSection } from '../kit/confirm'
import { reportLibError } from './deps-flow'

type Toast = { success: (m: string) => void; error: (m: string) => void }

const brewPackOf = async (s: Services, row: CatalogRow) => {
  const all = await s.backend.library.brewPacks.list(row.set)
  // 有真实包编号就按编号找（同来源多个包各是各的）；旧行没有编号才按来源
  return row.pack ? all.find((p) => p.docIdLocal === row.pack!.docIdLocal) ?? null : all.find((p) => p.sources.some((x) => x.toLowerCase() === row.source.toLowerCase())) ?? null
}

/** 书架行 → 删除目标：官方书按作者书号 / 来源，冒险按冒险号，自制按这一行自己的包编号；whole = 整套官方（只这一种语言）。 */
export function targetOf(row: CatalogRow, whole = false): RemovalTarget {
  if (getSource(row.set).kind !== 'official') return { kind: 'brew', setId: row.set, docIdLocals: row.pack ? [row.pack.docIdLocal] : [] }
  if (whole) return { kind: 'official', setId: row.set }
  if (row.kind === 'adventure' && row.id) return { kind: 'official', setId: row.set, adventureIds: [row.id] }
  return { kind: 'official', setId: row.set, ...(row.id ? { bookIds: [row.id] } : {}), bookSources: [row.source] }
}

/** 后端的删除计划 → 确认页的分组明细（本次选中 / 必须一起删除 / 受影响但保留 / 引用提醒）。只排版，不判断谁该删。 */
export function impactSections(impact: RemovalImpact, label: string): ConfirmSection[] {
  const must = impact.packs.filter((p) => p.mustRemove)
  const keep = impact.packs.filter((p) => !p.mustRemove)
  const refs = [
    ...(impact.houseRules.length ? [`${impact.houseRules.length} 条房规用到它`] : []),
    ...(impact.choices.length ? [`${impact.choices.length} 处编辑 / 覆盖（按包编号保存，重装后自动套用）`] : []),
    ...impact.saves.map((x) => `战役「${x.ownerLabel}」${x.saveId ? `的存档「${x.name}」` : '的当前数据'}${x.deleted ? '（已删存档）' : ''}：${x.why.join('、')}`),
  ]
  return [
    { title: '本次选中', items: [label], tone: 'info' as const },
    ...(must.length ? [{ title: '会一起删除（它们依赖要删的数据，按作者程序缺了会读不出）', items: must.map((p) => `${p.filename ?? p.docIdLocal}：${p.why}`), tone: 'must' as const }] : []),
    ...(keep.length ? [{ title: '受影响，但保留', items: keep.map((p) => `${p.filename ?? p.docIdLocal}：${p.why}`), tone: 'keep' as const }] : []),
    ...(refs.length ? [{ title: '引用提醒（存档不会被改）', items: refs, tone: 'info' as const }] : []),
  ]
}

/**
 * 删除 / 卸载：后端算影响 → 分组确认 → 把同一份计划交回后端执行（P5 T6 #1、#2）。
 * 预览后资料变了，后端会拒绝；这时重新预览、再问一次，不执行旧计划。
 */
export async function removeTarget(s: Services, target: RemovalTarget, label: string, skipPrompt: boolean, toast: Toast): Promise<boolean> {
  if (target.kind === 'brew' && !target.docIdLocals.length) { toast.error('找不到这个包的安装记录'); return false }
  const official = target.kind === 'official'
  const whole = official && !target.bookIds?.length && !target.bookSources?.length && !target.adventureIds?.length
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const impact = await s.backend.removalImpact(target)
      if (!skipPrompt || impact.packs.some((p) => p.mustRemove) || attempt > 0) {
        const ok = await askConfirm({
          title: whole ? '卸载整套官方资料？' : official ? `卸载《${label}》？` : `删除《${label}》？`,
          message: attempt > 0 ? '刚才的预览之后资料有变化，下面是重新算的影响。' : whole ? '这一种语言的整套官方资料会从书架移除，之后可在下载页重新下载。' : official ? '只移除这一本，其他书照常可读；之后可以单独重新下载。' : '这个包会从本机删除。',
          sections: impactSections(impact, label), confirmLabel: official ? '确认卸载' : '确认删除', danger: true,
        })
        if (!ok) return false
      }
      await s.backend.removalExecute(impact)
      toast.success(official ? `已卸载《${label}》` : `已删除《${label}》`)
      return true
    } catch (e) {
      const m = e instanceof Error ? e.message : String(e)
      if (attempt === 0 && /重新预览/.test(m)) continue
      await reportLibError(s, e, official ? `卸载《${label}》` : `删除《${label}》`, toast, () => void removeTarget(s, target, label, false, toast))
      return false
    }
  }
  return false
}

/** 书架行的删除入口。whole = ⋯ 里「卸载整套官方资料」。 */
export function removeSource(s: Services, row: CatalogRow, skipPrompt: boolean, toast: Toast, whole = false): Promise<boolean> {
  return removeTarget(s, targetOf(row, whole), whole ? `${row.set} 整套` : row.name, skipPrompt, toast)
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
