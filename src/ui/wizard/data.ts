import { chooseSource } from '../../library/scopes'
import type { ShelfGroup } from '../../library/shelf'
import type { CatalogRow } from '../../library/scoped'
import type { LibraryChoice } from '../../core/start-campaign'
import type { Services } from '../../core/services'
import { WIZARD_CODE_SET, wizard, wizardEstimate, wizardOptions } from './state'

let loadSeq = 0
let estimateSeq = 0

/** 核心组（作者分组表里的 core）：新战役默认只勾这一组里「在所选范围内」的书。 */
const CORE_GROUP = 'core'

/** 这一行现在勾没勾：已下载的恒勾（灰勾，不能点掉）→ 用户点过的 → 默认（核心组里在范围内的书）。 */
export function isPicked(group: ShelfGroup, row: CatalogRow): boolean {
  if (row.downloaded) return true
  return wizard.picked[row.source] ?? (group.group === CORE_GROUP && row.inScope)
}

/**
 * 当前向导的选书设置：把「勾没勾」和后端算出的「本来看不看得到」（row.view.visible，不带加入 / 排除；已下载的默认都开）比一比，
 * 不一样的才记成明确的加入 / 排除（chooseSource）：没勾 = 排除，勾了不用记。范围只在用户改过时才带。
 */
export function libraryChoice(): LibraryChoice {
  let lists = { include: [] as string[], exclude: [] as string[] }
  for (const g of wizardOptions.value?.shelf ?? []) {
    for (const row of g.books) if (isPicked(g, row) !== row.view.visible) lists = chooseSource(lists, row.source, !row.view.visible)
  }
  return { ...(wizard.scopes ? { scopes: wizard.scopes } : {}), ...lists }
}

/** 向导每一步要的：范围清单、各语言资料、书目与冒险、阻断原因。范围变了才需要重取，勾书不用。 */
export async function loadWizardOptions(s: Services): Promise<void> {
  if (!wizard.ruleId) return
  const mine = ++loadSeq
  wizard.loading = true
  wizard.showLoading = false
  const timer = setTimeout(() => { if (mine === loadSeq) wizard.showLoading = true }, 1000)
  try {
    // 不带加入 / 排除：row.view.visible 是后端的默认（已下载的都开），row.inScope 是「只按范围」的默认，勾选差异在开局时才算（libraryChoice）
    const options = await s.backend.starter.wizardOptions(wizard.ruleId, WIZARD_CODE_SET, wizard.scopes ? { scopes: wizard.scopes } : {})
    if (mine !== loadSeq) return
    wizardOptions.value = options
  } finally {
    clearTimeout(timer)
    if (mine === loadSeq) { wizard.loading = false; wizard.showLoading = false }
  }
  await refreshEstimate(s)
}

/** 总下载大小：先只看缓存（毫秒级）；没算出来再联网取一次文件清单。联网失败写在 errors 里，界面显示"大小暂时未知"。 */
export async function refreshEstimate(s: Services): Promise<void> {
  const mine = ++estimateSeq
  const input = { codeSet: WIZARD_CODE_SET, adventures: wizard.adventures.map((a) => ({ set: a.set, id: a.id })) }
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

/** 勾选 / 取消一本书（已下载的不能点，界面已禁用）：只记在向导里，开局时才变成加入 / 排除。 */
export function toggleBook(source: string, on: boolean): void {
  wizard.picked = { ...wizard.picked, [source]: on }
}

export function setScopes(s: Services, scopes: string[]): void {
  wizard.scopes = scopes
  void loadWizardOptions(s)
}
