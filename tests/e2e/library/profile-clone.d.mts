// profile-clone.mjs 的类型声明（单元测试是 TypeScript，需要它才能直接引用 .mjs）。
export interface CloneOptions {
  /** 副本只能放在这个目录下（默认 work/e2e-lib）；登记也放在它的 .clones/ 里。 */
  workDir?: string
  /** 不登记、不自动删（默认读 KEEP_PROFILE 环境变量）。 */
  keep?: boolean
  /** 克隆函数（默认 cp -cR）；测试用来模拟"不支持克隆"。 */
  clone?: (from: string, to: string) => void
}
export function freshProfile(from: string, to: string, options?: CloneOptions): string
export function cleanupOwn(): void
export function sweepStale(options?: { workDir?: string; remove?: (path: string) => void }): { removed: string[]; busy: string[] }
