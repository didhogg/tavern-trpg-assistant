import { chooseSource } from '../../library/scopes'
import type { LibraryChoice } from '../../core/start-campaign'
import type { Services } from '../../core/services'
import { WIZARD_CODE_SET, wizard, wizardEstimate, wizardOptions } from './state'

let loadSeq = 0
let estimateSeq = 0

/** 当前向导的选书设置（只带用户明确改过的）。 */
export function libraryChoice(): LibraryChoice {
  return { ...(wizard.scopes ? { scopes: wizard.scopes } : {}), include: wizard.include, exclude: wizard.exclude }
}

/** 向导每一步要的：范围清单、各语言资料、书目与冒险、阻断原因。范围变了才需要重取，勾书不用。 */
export async function loadWizardOptions(s: Services): Promise<void> {
  if (!wizard.ruleId) return
  const mine = ++loadSeq
  wizard.loading = true
  wizard.showLoading = false
  const timer = setTimeout(() => { if (mine === loadSeq) wizard.showLoading = true }, 1000)
  try {
    const options = await s.backend.starter.wizardOptions(wizard.ruleId, WIZARD_CODE_SET, libraryChoice())
    if (mine !== loadSeq) return
    wizardOptions.value = options
    wizard.seen = {}
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

/** 勾选 / 取消一本书：只改选书设置（加入 / 排除），本地立刻反映，不重取。 */
export function toggleBook(source: string, visible: boolean): void {
  const next = chooseSource({ include: wizard.include, exclude: wizard.exclude }, source, visible)
  wizard.include = next.include
  wizard.exclude = next.exclude
  wizard.seen = { ...wizard.seen, [source]: visible }
}

export function setScopes(s: Services, scopes: string[]): void {
  wizard.scopes = scopes
  void loadWizardOptions(s)
}
