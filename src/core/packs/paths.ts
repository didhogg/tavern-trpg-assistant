import { TrpgError } from '../errors'

export const MAX_UNZIPPED_BYTES = 256 * 1024 * 1024
export const MAX_FILE_COUNT = 20_000
const PATH_CHARS = /^[a-z0-9/._-]+$/
const FORBIDDEN_EXT = /\.(?:js|mjs|html?|svg)$/i

const FORMAT2_ROOTS = new Set(['trpg-manifest.json', 'entries', 'features', 'adventure', 'blobs'])
const FORMAT1_ROOTS = new Set(['trpg-manifest.json', 'entries', 'assets'])

function rootOf(path: string): string {
  return path.includes('/') ? path.slice(0, path.indexOf('/')) : path
}

/** L1 §2.2 的路径、体积、文件数与顶层目录限制。 */
export function assertPackPaths(names: string[], files: Record<string, Uint8Array>, formatVersion: number): void {
  let total = 0
  for (const name of names) {
    total += files[name].length
    if (name.startsWith('/') || name.includes('\\') || name.split('/').includes('..')) {
      throw new TrpgError('E_BAD_CONTENT', '文件内容损坏：包含不合法的路径')
    }
    if (!PATH_CHARS.test(name)) throw new TrpgError('E_BAD_CONTENT', '文件内容损坏：包含不合法的路径')
    if (FORBIDDEN_EXT.test(name)) throw new TrpgError('E_FORBIDDEN_FILE', `不能安装：包里含有不允许的文件「${name}」`)
    const roots = formatVersion <= 1 ? FORMAT1_ROOTS : FORMAT2_ROOTS
    const root = rootOf(name)
    if (!roots.has(root)) throw new TrpgError('E_FORBIDDEN_FILE', `不能安装：包里含有不允许的文件「${name}」`)
  }
  if (names.length > MAX_FILE_COUNT) throw new TrpgError('E_TOO_LARGE', '文件过大或文件数过多，无法导入')
  if (total > MAX_UNZIPPED_BYTES) throw new TrpgError('E_TOO_LARGE', '文件过大或文件数过多，无法导入')
}
