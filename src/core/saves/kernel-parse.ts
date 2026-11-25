// 工作副本里结算内核段的结构校验（KernelSaveService 用）。
// 同一版工作副本（按 updatedAt 认，每次写都会变）只校验一次：人物存完整数据后这一段很大，
// 每次重读人物页都要读好几遍，逐遍整段校验在真机上要几百毫秒。
import { TrpgError } from '../errors'
import type { Workspace } from '../../schemas/campaign'
import { kernelCampaignSchema, type KernelCampaign } from '../../schemas/kernel'

export function parseKernel(raw: unknown): KernelCampaign | null {
  if (!raw) return null
  try {
    return kernelCampaignSchema.parse(raw)
  } catch {
    throw new TrpgError('E_BAD_KERNEL', '存档里的结算内核段损坏')
  }
}

export class KernelParseMemo {
  private readonly parsed = new Map<string, { stamp: string; value: KernelCampaign | null }>()
  of(ownerKey: string, ws: Workspace): KernelCampaign | null {
    // 版本 = 工作副本的更新时间 + 结算内核段自己的改动号（每次写人物 +1；读档 / 撤销换整段时更新时间也变）。
    // 工作副本每次从库里读出来都是新对象，不能按对象认
    const raw = ws.data.kernel as { revision?: unknown } | undefined
    const stamp = `${ws.updatedAt ?? ''}|${String(raw?.revision ?? '')}`
    const hit = this.parsed.get(ownerKey)
    if (hit && ws.updatedAt && hit.stamp === stamp) return hit.value
    const value = parseKernel(raw)
    this.parsed.set(ownerKey, { stamp, value })
    return value
  }
}
