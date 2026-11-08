// P3 性能改进 S2：结算小窗只有这一个随机源；每建/重建一个人物前按人物标识重设种子，
// 让同一人物无论排在哪次导入前后，作者编号（进阶 id 等）都一致。
import { freshSeed as nativeSeed, installSeededCrypto } from './random'

const reseed = installSeededCrypto(globalThis)

export function freshSeed(): string {
  return nativeSeed()
}

export function reseedKernel(seed: string): void {
  reseed(seed)
}

/** 同一条目的确定种子：类别 + 来源 + 名字 + 内容。作者导入器初始化之后再设，避免初始化消耗随机数。 */
export function entrySeed(prop: string, entry: unknown): string {
  const e = entry as { name?: unknown; source?: unknown } | null
  return `entry:${prop}:${String(e?.source ?? '')}:${String(e?.name ?? '')}:${textHash(JSON.stringify(entry))}`
}

function textHash(text: string): string {
  let h = 2166136261
  for (let i = 0; i < text.length; i++) h = Math.imul(h ^ text.charCodeAt(i), 16777619)
  return (h >>> 0).toString(16)
}
