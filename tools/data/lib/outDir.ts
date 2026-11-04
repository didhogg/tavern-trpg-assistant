import { resolve, sep } from 'node:path'

/** `--out <目录>` / `--out=<目录>`：试跑构建时所有输出只写到这个目录。 */
export function outArg(argv: string[]): string | undefined {
  const eq = argv.find((a) => a.startsWith('--out='))
  if (eq) return eq.slice(6)
  const i = argv.indexOf('--out')
  return i >= 0 ? argv[i + 1] : undefined
}

const inside = (child: string, parent: string): boolean => child === parent || child.startsWith(parent.endsWith(sep) ? parent : parent + sep)

/** 输出目录必须在助手仓库、数据仓库、参考资料夹之外：试跑绝不允许碰到它们。 */
export function resolveOutDir(raw: string, forbidden: Record<string, string>): string {
  if (!raw) throw new Error('--out 后面要写一个目录')
  const dir = resolve(raw)
  for (const [name, root] of Object.entries(forbidden)) {
    if (inside(dir, resolve(root)) || inside(resolve(root), dir)) throw new Error(`--out 不能放在「${name}」里面或包含它：${dir}`)
  }
  return dir
}
