import { reactive, shallowRef } from 'vue'
import type { DownloadEstimate } from '../../library/download-estimate'
import { DEFAULT_PREFETCH_CODE_SETS } from '../../library/prefetch'
import type { WizardOptions } from '../../core/start-campaign'

/** P4 向导的资料语言固定中文（中英切换留到 P5 的数据条目页）；和启动后台预取用同一个，预取的书目才对得上。 */
export const WIZARD_CODE_SET = DEFAULT_PREFETCH_CODE_SETS[0]

/** 勾选的一行（书架 CatalogRow 的身份）：书和冒险放在同一个列表里（P5-5 §13）。 */
export interface PickRow { key: string; set: string; kind: 'book' | 'adventure'; id: string | null; source: string; name: string }

/** 开局向导的选择；模块级状态，打开向导时重置。 */
export interface WizardState {
  step: 1 | 2 | 3 | 4
  /** ① 选的体系（规则登记表的 family）。 */
  family: string
  /** ② 选的版本（规则登记表的 id）。 */
  ruleId: string
  name: string
  note: string
  nameEdited: boolean
  /** ③ 规则标签筛选：all / 5e / 5.5e / none（未归类）；选了版本就默认筛到这个版本。 */
  filter: string
  q: string
  /** ③ 勾选的书 / 冒险（没下载的；已下载的恒为灰勾，不记在这里）。 */
  picked: Record<string, PickRow>
  /** 书目 / 冒险目录正在读取。 */
  loading: boolean
  /** 读取超过 1 秒才显示"正在读取中…"。 */
  showLoading: boolean
  /** 下载大小还在联网计算。 */
  estimating: boolean
  /** 这次打开向导已经联网算过一次大小（算不出来就是离线 / 取不到，显示"大小暂时未知"）。 */
  netTried: boolean
}

const fresh = (): WizardState => ({ step: 1, family: '', ruleId: '', name: '', note: '', nameEdited: false, filter: 'all', q: '', picked: {}, loading: false, showLoading: false, estimating: false, netTried: false })

export const wizard = reactive<WizardState>(fresh())
/** 向导每一步要的东西（后端给）；shallow：整份换，不深度监听。 */
export const wizardOptions = shallowRef<WizardOptions | null>(null)
export const wizardEstimate = shallowRef<DownloadEstimate | null>(null)

export function resetWizard(): void {
  Object.assign(wizard, fresh())
  wizardOptions.value = null
  wizardEstimate.value = null
}

export const pickedOf = (kind: PickRow['kind']): PickRow[] => Object.values(wizard.picked).filter((p) => p.kind === kind)

const MB = 1024 * 1024
export function formatSize(bytes: number): string {
  return bytes >= MB ? `${bytes >= 10 * MB ? Math.round(bytes / MB) : (bytes / MB).toFixed(1).replace(/\.0$/, '')} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`
}

export type SizeText = { kind: 'none' | 'ready' | 'size' | 'computing' | 'unknown'; text: string }

/** 下载大小怎么写（③的底栏和④的摘要共用）：未选择 / 已就绪 / 约 xx MB / 正在计算 / 暂时未知。part: data = 官方书，adv = 冒险。 */
export function sizeOf(part: 'data' | 'adv'): SizeText {
  if (!pickedOf(part === 'data' ? 'book' : 'adventure').length) return { kind: 'none', text: '未选择' }
  const e = wizardEstimate.value
  const waiting: SizeText = wizard.netTried && !wizard.estimating ? { kind: 'unknown', text: '大小暂时未知' } : { kind: 'computing', text: '正在计算下载文件大小…' }
  if (!e) return { kind: 'computing', text: '正在计算下载文件大小…' }
  if (part === 'data') {
    if (e.data.sets.length && e.data.sets.every((x) => x.installed)) return { kind: 'ready', text: '已就绪' }
    return e.data.bytes === null ? waiting : { kind: 'size', text: `约 ${formatSize(e.data.bytes)} 需下载` }
  }
  if (e.adventures.items.length && e.adventures.items.every((x) => x.downloaded)) return { kind: 'ready', text: '已就绪' }
  return e.adventures.bytes === null ? waiting : { kind: 'size', text: `约 ${formatSize(e.adventures.bytes)} 需下载` }
}

/** 书 + 冒险合起来的大小（③底栏）：两边都算出来才写数字。 */
export function totalSize(): SizeText {
  const parts = [sizeOf('data'), sizeOf('adv')].filter((p) => p.kind !== 'none')
  if (!parts.length) return { kind: 'none', text: '不下载新资料' }
  if (parts.some((p) => p.kind === 'computing')) return { kind: 'computing', text: '正在计算下载文件大小…' }
  if (parts.some((p) => p.kind === 'unknown')) return { kind: 'unknown', text: '大小暂时未知' }
  const e = wizardEstimate.value
  const bytes = (pickedOf('book').length ? e?.data.bytes ?? 0 : 0) + (pickedOf('adventure').length ? e?.adventures.bytes ?? 0 : 0)
  return bytes ? { kind: 'size', text: `约 ${formatSize(bytes)} 需下载` } : { kind: 'ready', text: '已就绪' }
}
