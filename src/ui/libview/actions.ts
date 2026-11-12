// 库页上的"动作"：卸载 / 删除（先看影响）、存入我的库。界面只调后端、只拼提示；谁受影响由 backend.removalImpact 算。
import type { RemovalTarget } from '../../core/removal-impact'
import type { RemovalBatch } from '../../core/removal-batch'
import type { Services } from '../../core/services'
import type { CatalogRow } from '../../library/scoped'
import { getSource } from '../../library/sources'
import { askConfirm, type ConfirmSection } from '../kit/confirm'
import { reportLibError } from './deps-flow'
import { formatBytes } from '../format'

type Toast = { success: (m: string) => void; error: (m: string) => void }

const brewPackOf = async (s: Services, row: CatalogRow) => {
  const all = await s.backend.library.brewPacks.list(row.set)
  // 有真实包编号就按编号找（同来源多个包各是各的）；旧行没有编号才按来源
  return row.pack ? all.find((p) => p.docIdLocal === row.pack!.docIdLocal) ?? null : all.find((p) => p.sources.some((x) => x.toLowerCase() === row.source.toLowerCase())) ?? null
}

/** 书架行 → 删除目标：官方书按作者书号 / 来源，冒险按冒险号，自制按这一行自己的包编号（另一种语言那份由后端补上）。 */
export function targetOf(row: CatalogRow): RemovalTarget {
  if (getSource(row.set).kind !== 'official') return { kind: 'brew', setId: row.set, docIdLocals: row.pack ? [row.pack.docIdLocal] : [] }
  if (row.kind === 'adventure' && row.id) return { kind: 'official', setId: row.set, adventureIds: [row.id] }
  return { kind: 'official', setId: row.set, ...(row.id ? { bookIds: [row.id] } : {}), bookSources: [row.source] }
}

/** 后端的删除计划 → 确认页的分组明细（本次选中 / 必须一起删除 / 受影响但保留 / 引用提醒）。只排版，不判断谁该删。 */
export function impactSections(impact: Pick<RemovalBatch, 'packs' | 'houseRules' | 'choices' | 'saves'>, label: string | string[]): ConfirmSection[] {
  const must = impact.packs.filter((p) => p.mustRemove)
  const keep = impact.packs.filter((p) => !p.mustRemove)
  const refs = [
    ...(impact.houseRules.length ? [`${impact.houseRules.length} 条房规用到它`] : []),
    ...(impact.choices.length ? [`${impact.choices.length} 处编辑 / 覆盖（按包编号保存，重装后自动套用）`] : []),
    ...impact.saves.map((x) => `战役「${x.ownerLabel}」${x.saveId ? `的存档「${x.name}」` : '的当前数据'}${x.deleted ? '（已删存档）' : ''}：${x.why.join('、')}`),
  ]
  return [
    { title: '本次选中', items: Array.isArray(label) ? label : [label], tone: 'info' as const },
    ...(must.length ? [{ title: '会一起删除（它们依赖要删的数据，按作者程序缺了会读不出）', items: must.map((p) => `${p.filename ?? p.docIdLocal}：${p.why}`), tone: 'must' as const }] : []),
    ...(keep.length ? [{ title: '受影响，但保留', items: keep.map((p) => `${p.filename ?? p.docIdLocal}：${p.why}`), tone: 'keep' as const }] : []),
    ...(refs.length ? [{ title: '引用提醒（存档不会被改）', items: refs, tone: 'info' as const }] : []),
  ]
}

/** 另一种语言的那份也在名单里：几项（只用来写提示）。 */
const extraLang = (batch: RemovalBatch, chosen: RemovalTarget[]): number => {
  const sets = new Set(chosen.map((t) => t.setId))
  return batch.targets.filter((t) => !sets.has(t.setId)).reduce((n, t) => n + (t.kind === 'brew' ? t.docIdLocals.length : (t.bookIds?.length ?? 0) + (t.adventureIds?.length ?? 0) || 1), 0)
}

/**
 * 删除 / 卸载（一项或多选）：后端补上另一种语言那份、算影响和占用 → 一个确认弹窗 → 按同一份计划执行（P5-5 §12）。
 * 预览后资料变了，后端会拒绝；这时重新预览、再问一次，不执行旧计划。完成后后端自动回收空间。
 */
export async function removeTargets(s: Services, targets: RemovalTarget[], labels: string[], skipPrompt: boolean, toast: Toast): Promise<boolean> {
  if (targets.some((t) => t.kind === 'brew' && !t.docIdLocals.length)) { toast.error('找不到这个包的安装记录'); return false }
  if (!targets.length) return false
  const official = targets.every((t) => t.kind === 'official')
  const verb = official ? '卸载' : '删除'
  const what = labels.length === 1 ? `《${labels[0]}》` : `选中的 ${labels.length} 项`
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const [batch, size] = await Promise.all([s.backend.removalImpactMany(targets), s.backend.removalSizes(targets).catch(() => null)])
      const extra = extraLang(batch, targets)
      if (!skipPrompt || batch.packs.some((p) => p.mustRemove) || attempt > 0 || labels.length > 1) {
        const ok = await askConfirm({
          title: `${verb}${what}？`,
          message: [
            attempt > 0 ? '刚才的预览之后资料有变化，下面是重新算的影响。' : '',
            extra ? `另一种语言的同一份（${extra} 项）也会一起${verb}。` : '',
            size?.total != null ? `共占用约 ${formatBytes(size.total)}，${verb}后会腾出来。` : '占用大小暂时算不出。',
            official ? '之后可以在【下载】页重新下载。' : '',
          ].filter(Boolean).join(''),
          sections: impactSections(batch, labels), confirmLabel: `确认${verb}`, danger: true,
        })
        if (!ok) return false
      }
      const r = await s.backend.removalExecuteMany(batch)
      toast.success(`已${verb}${what}${r.reclaim ? `，腾出约 ${formatBytes(r.reclaim.bytes)}` : ''}`)
      return true
    } catch (e) {
      const m = e instanceof Error ? e.message : String(e)
      if (attempt === 0 && /重新预览/.test(m)) continue
      const remaining = (e as { remaining?: RemovalTarget[] }).remaining
      await reportLibError(s, e, `${verb}${what}`, toast, () => void removeTargets(s, remaining?.length ? remaining : targets, labels, false, toast))
      return false
    }
  }
  return false
}

/** 一项的删除 / 卸载（我的库、缺依赖横幅等入口）。 */
export function removeTarget(s: Services, target: RemovalTarget, label: string, skipPrompt: boolean, toast: Toast): Promise<boolean> {
  return removeTargets(s, [target], [label], skipPrompt, toast)
}

/** 书架行的删除入口：这一本 / 这个包，另一种语言那份一起。 */
export function removeSource(s: Services, row: CatalogRow, skipPrompt: boolean, toast: Toast): Promise<boolean> {
  return removeTargets(s, [targetOf(row)], [row.name], skipPrompt, toast)
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
