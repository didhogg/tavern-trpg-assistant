// 结算内核存档的公共类型（从 kernel.ts 拆出，保持单文件行数上限）。
import type { KernelLibrary } from '../../schemas/kernel'
import type { KernelActor } from '../../schemas/kernel'

/** 引用检查结果：和 P3-1 的 FetchResult 形状一致，但 core 不依赖 library 运行时。 */
export interface KernelRefResult {
  ok: boolean
  ref: { set: string; prop: string; hash: string }
  reason?: string
  /** 条目在，但本战役关着这本书（照常能取，P5 B-34）。 */
  closed?: boolean
  /** 条目所在的来源（书 / 包的来源标识）。 */
  source?: string | null
}

export type KernelRefChecker = (refs: Array<{ set: string; prop: string; hash: string }>, library: KernelLibrary) => Promise<KernelRefResult[]>

/** 只交回人物段，不碰 adjustments/dice/legacy。 */
export type KernelActorCompact = Pick<KernelActor, 'id' | 'name' | 'seed' | 'refs' | 'choices' | 'state'>

