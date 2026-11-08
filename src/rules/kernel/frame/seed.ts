// P3 性能改进 S2：结算小窗只有这一个随机源；每建/重建一个人物前按人物标识重设种子，
// 让同一人物无论排在哪次导入前后，作者编号（进阶 id 等）都一致。
import { installSeededCrypto } from './random'

const reseed = installSeededCrypto(globalThis)

export function reseedKernel(seed: string): void {
  reseed(seed)
}
