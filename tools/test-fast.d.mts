// test-fast.mjs 的类型声明（单元测试是 TypeScript，需要它才能直接引用 .mjs）。
export function lintTargets(files: string[], exists?: (path: string) => boolean): string[]
export function parseArgs(argv: string[]): { since: string | null }
export function changedFiles(since: string | null): string[]
export function main(argv?: string[]): number
