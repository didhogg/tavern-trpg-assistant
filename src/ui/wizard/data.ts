import type { ShelfGroup } from '../../library/shelf'
import type { CatalogRow } from '../../library/scoped'
import { getSource } from '../../library/sources'
import type { OfficialPick } from '../../core/start-campaign'
import type { Services } from '../../core/services'
import { ruleBadge } from '../libview/registry'
import { pickedOf, WIZARD_CODE_SET, wizard, wizardEstimate, wizardOptions, type PickRow } from './state'

let loadSeq = 0
let estimateSeq = 0

/** 一行的身份（和下载页同一种写法：没有书号的来源行用来源认）。 */
export const rowKey = (r: CatalogRow): string => `${r.set}:${r.kind}:${r.id ?? `src:${r.source}`}`
const official = (r: CatalogRow): boolean => getSource(r.set).kind === 'official'

/** ③的一组：作者分组里的官方书和冒险放在一起（冒险是它所属分组里的一个包），按规则标签和搜索筛。 */
export function rowsOf(g: ShelfGroup): CatalogRow[] {
  const q = wizard.q.trim().toLowerCase()
  return [...g.books, ...g.adventures].filter((r) => official(r)
    && (wizard.filter === 'all' || (wizard.filter === 'none' ? ruleBadge(r) === null : ruleBadge(r) === wizard.filter))
    && (!q || `${r.name} ${r.altName ?? ''} ${r.abv}`.toLowerCase().includes(q)))
}

/** 这个数据集已经有官方资料（装过至少一部分），或这次勾了它的书：冒险正文要先有官方资料才能读。 */
function officialReady(set: string): boolean {
  return !!wizardOptions.value?.data.some((d) => d.setId === set && d.installed) || pickedOf('book').some((p) => p.set === set)
}

export const isPicked = (r: CatalogRow): boolean => r.downloaded || !!wizard.picked[rowKey(r)]
/** 能不能勾：已下载的恒为灰勾；冒险要先有同一套官方资料（已装或这次勾了书）。 */
export const canPick = (r: CatalogRow): boolean => !r.downloaded && (r.kind === 'book' || (r.id !== null && officialReady(r.set)))
export const ADVENTURE_NEEDS_BOOK = '冒险正文要先有官方资料：先勾一本书'

function put(r: CatalogRow, on: boolean, next: Record<string, PickRow>): void {
  const key = rowKey(r)
  if (on) next[key] = { key, set: r.set, kind: r.kind === 'adventure' ? 'adventure' : 'book', id: r.id, source: r.source, name: r.name }
  else delete next[key]
}

/** 取消书以后，没有官方资料可依靠的冒险一起取消（不能留一个下不了的冒险）。 */
function dropOrphanAdventures(): void {
  const keep = { ...wizard.picked }
  for (const p of Object.values(keep)) if (p.kind === 'adventure' && !wizardOptions.value?.data.some((d) => d.setId === p.set && d.installed) && !Object.values(keep).some((b) => b.kind === 'book' && b.set === p.set)) delete keep[p.key]
  wizard.picked = keep
}

export function togglePick(s: Services, r: CatalogRow, on: boolean): void {
  if (!canPick(r)) return
  const next = { ...wizard.picked }
  put(r, on, next)
  wizard.picked = next
  if (!on) dropOrphanAdventures()
  void refreshEstimate(s)
}

/** 分组框：[ ] 全选这一组能勾的（书先勾，冒险才勾得上），[−] 取消这一组全部。 */
export function toggleGroup(s: Services, rows: CatalogRow[], on: boolean): void {
  const next = { ...wizard.picked }
  for (const r of rows.filter((x) => !x.downloaded && x.kind !== 'adventure')) put(r, on, next)
  wizard.picked = next
  const after = { ...wizard.picked }
  for (const r of rows.filter((x) => x.kind === 'adventure')) if (!on || canPick(r)) put(r, on, after)
  wizard.picked = after
  if (!on) dropOrphanAdventures()
  void refreshEstimate(s)
}

/** 开局 / 估算要的勾选：书给后端去配每个数据集，冒险按本。 */
export function picksInput(): { picks: OfficialPick[]; adventures: Array<{ set: string; id: string }> } {
  return {
    picks: pickedOf('book').map((p) => ({ set: p.set, book: p.id, source: p.source })),
    adventures: pickedOf('adventure').flatMap((p) => (p.id ? [{ set: p.set, id: p.id }] : [])),
  }
}

/** 向导每一步要的：各语言资料、书目与冒险、阻断原因、这个版本能不能建战役。 */
export async function loadWizardOptions(s: Services): Promise<void> {
  if (!wizard.ruleId) return
  const mine = ++loadSeq
  wizard.loading = true
  wizard.showLoading = false
  const timer = setTimeout(() => { if (mine === loadSeq) wizard.showLoading = true }, 1000)
  try {
    const options = await s.backend.starter.wizardOptions(wizard.ruleId, WIZARD_CODE_SET)
    if (mine !== loadSeq) return
    wizardOptions.value = options
  } finally {
    clearTimeout(timer)
    if (mine === loadSeq) { wizard.loading = false; wizard.showLoading = false }
  }
  await refreshEstimate(s)
}

/** ②选版本：清空③的勾选，标签默认筛到这个版本，重新读这个版本的书架。 */
export function chooseVersion(s: Services, ruleId: string, versionLabel: string): void {
  if (wizard.ruleId === ruleId && wizardOptions.value) return
  wizard.ruleId = ruleId
  wizard.picked = {}
  wizard.filter = versionLabel
  wizard.q = ''
  void loadWizardOptions(s).catch((error: unknown) => console.error('[trpg-assistant] 读取向导选项失败', error))
}

/** 下载大小：先只看缓存（毫秒级）；没算出来再联网取一次文件清单。联网失败写在 errors 里，界面显示"大小暂时未知"。 */
export async function refreshEstimate(s: Services): Promise<void> {
  const mine = ++estimateSeq
  const input = { codeSet: WIZARD_CODE_SET, ...picksInput() }
  if (!input.picks.length && !input.adventures.length) { wizardEstimate.value = null; return }
  const cached = await s.backend.starter.estimateDownload(input, { network: false })
  if (mine !== estimateSeq) return
  wizardEstimate.value = cached
  if (!cached.computing || wizard.netTried) return
  wizard.netTried = true
  wizard.estimating = true
  try {
    const full = await s.backend.starter.estimateDownload(input, { network: true })
    if (mine === estimateSeq) wizardEstimate.value = full
  } finally {
    wizard.estimating = false
  }
}
