import { reactive, shallowRef } from 'vue'
import type { DownloadEstimate } from '../../library/download-estimate'
import { DEFAULT_PREFETCH_CODE_SETS } from '../../library/prefetch'
import type { WizardOptions } from '../../core/start-campaign'

/** P4 向导的资料语言固定中文（中英切换留到 P5 的数据条目页）；和启动后台预取用同一个，预取的书目才对得上。 */
export const WIZARD_CODE_SET = DEFAULT_PREFETCH_CODE_SETS[0]

export interface AdventurePick { set: string; id: string; name: string }

/** 开局向导的选择；模块级状态，打开向导时重置。 */
export interface WizardState {
  step: 1 | 2 | 3 | 4
  ruleId: string
  name: string
  note: string
  nameEdited: boolean
  /** 用户改过的范围；null = 用规则的默认范围。 */
  scopes: string[] | null
  /** 用户明确勾选 / 取消的书（来源编号单元）。 */
  include: string[]
  exclude: string[]
  /** 书目行的本地勾选覆盖（来源 → 是否看得到），范围变化重取后清空。 */
  seen: Record<string, boolean>
  adventures: AdventurePick[]
  /** 书目 / 冒险目录正在读取。 */
  loading: boolean
  /** 读取超过 1 秒才显示"正在读取中…"。 */
  showLoading: boolean
  /** 下载大小还在联网计算。 */
  estimating: boolean
  /** 这次打开向导已经联网算过一次大小（算不出来就是离线 / 取不到，显示"大小暂时未知"）。 */
  netTried: boolean
}

const fresh = (): WizardState => ({ step: 1, ruleId: '', name: '', note: '', nameEdited: false, scopes: null, include: [], exclude: [], seen: {}, adventures: [], loading: false, showLoading: false, estimating: false, netTried: false })

export const wizard = reactive<WizardState>(fresh())
/** 向导每一步要的东西（后端给）；shallow：整份换，不深度监听。 */
export const wizardOptions = shallowRef<WizardOptions | null>(null)
export const wizardEstimate = shallowRef<DownloadEstimate | null>(null)

export function resetWizard(): void {
  Object.assign(wizard, fresh())
  wizardOptions.value = null
  wizardEstimate.value = null
}

const MB = 1024 * 1024
export function formatSize(bytes: number): string {
  return bytes >= MB ? `${bytes >= 10 * MB ? Math.round(bytes / MB) : (bytes / MB).toFixed(1).replace(/\.0$/, '')} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`
}

export type SizeText = { kind: 'ready' | 'size' | 'computing' | 'unknown'; text: string }

/** 下载大小怎么写（向导②的说明和④的摘要共用）：已装好 / 约 xx MB / 正在计算 / 暂时未知。part: data = 官方资料，adv = 所选冒险。 */
export function sizeOf(part: 'data' | 'adv'): SizeText {
  const e = wizardEstimate.value
  const waiting: SizeText = wizard.netTried && !wizard.estimating ? { kind: 'unknown', text: '大小暂时未知' } : { kind: 'computing', text: '正在计算下载文件大小…' }
  if (!e) return { kind: 'computing', text: '正在计算下载文件大小…' }
  if (part === 'data') {
    if (e.data.sets.length && e.data.sets.every((x) => x.installed)) return { kind: 'ready', text: '已就绪' }
    return e.data.bytes === null ? waiting : { kind: 'size', text: `约 ${formatSize(e.data.bytes)} 需下载` }
  }
  if (!wizard.adventures.length) return { kind: 'ready', text: '未选择' }
  if (e.adventures.items.length && e.adventures.items.every((x) => x.downloaded)) return { kind: 'ready', text: '已就绪' }
  return e.adventures.bytes === null ? waiting : { kind: 'size', text: `约 ${formatSize(e.adventures.bytes)} 需下载` }
}
