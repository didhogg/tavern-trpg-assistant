// e2e-base.mjs 的类型声明（单元测试是 TypeScript，需要它才能直接引用 .mjs）。
import type { CloneOptions } from './profile-clone.mjs'
export const E2E_PORT: number
export function baseDir(engine: string, workDir?: string): string
export function freshFromBase(engine: string, label: string, options?: CloneOptions): string
