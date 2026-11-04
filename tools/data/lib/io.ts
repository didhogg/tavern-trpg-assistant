import { createHash } from 'node:crypto'
import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises'
import { dirname, join, relative } from 'node:path'

export const REPO_ROOT = process.cwd()
export const TOOLS_DIR = join(REPO_ROOT, 'tools', 'data')

/** 参考资料放在仓库外（只读，绝不写入）；换位置用环境变量 TRPG_REFERENCE。 */
export const REFERENCE_ROOT = process.env.TRPG_REFERENCE ?? '/Users/xxx/DND- reference（DO NO DELETE！）'
export const REF_5ETOOLS = join(REFERENCE_ROOT, '5etools-cn-main')
export const REF_DND_DATA = join(REFERENCE_ROOT, 'dnd-data-main')
export const REF_FOUNDRY_SYSTEM = join(REFERENCE_ROOT, 'dnd5e-6.1.x')
/** 联网生成的缓存（Foundry 开源数据）放在仓库外、也不放进参考资料文件夹。 */
export const CACHE_ROOT = process.env.TRPG_CACHE ?? join(process.env.HOME ?? '', '.cache', 'tavern-trpg')
/** 输入快照里的文件名沿用旧写法（reference/…（数据库）），换了存放位置也不会让快照误报。 */
const SNAPSHOT_KEYS: Array<[string, string]> = [[REF_5ETOOLS, 'reference/5etools-cn-main（数据库）'], [REF_DND_DATA, 'reference/dnd-data-main（数据库）']]

/** R13：英文原版没有 ENG_name，中文流水线却以它为准；英文那一遍读入时，凡有 name 又没有 ENG_name 的对象，补上 ENG_name = name。 */
export function addEnglishNames<T>(value: T): T {
  if (Array.isArray(value)) { for (const item of value) addEnglishNames(item); return value }
  if (!value || typeof value !== 'object') return value
  const rec = value as Record<string, unknown>
  if (typeof rec.name === 'string' && !('ENG_name' in rec)) rec.ENG_name = rec.name
  for (const child of Object.values(rec)) addEnglishNames(child)
  return value
}

export async function readJson<T = unknown>(path: string): Promise<T> {
  const parsed = JSON.parse(await readFile(path, 'utf8')) as T
  return process.env.TRPG_DATA_LANG === 'en' && path.includes('/data-bak/') ? addEnglishNames(parsed) : parsed
}

export async function readBytes(path: string): Promise<Uint8Array> {
  return new Uint8Array(await readFile(path))
}

export function sha256(bytes: Uint8Array): string {
  return createHash('sha256').update(bytes).digest('hex')
}

export async function sha256File(path: string): Promise<string> {
  return sha256(await readBytes(path))
}

export async function writeText(path: string, text: string): Promise<void> {
  await mkdir(dirname(path), { recursive: true })
  await writeFile(path, text, 'utf8')
}

export async function writeBytes(path: string, bytes: Uint8Array): Promise<void> {
  await mkdir(dirname(path), { recursive: true })
  await writeFile(path, bytes)
}

export async function listFiles(dir: string, filter: (name: string) => boolean): Promise<string[]> {
  const names = await readdir(dir)
  return names.filter(filter).sort().map((name) => join(dir, name))
}

export function rel(path: string): string {
  for (const [root, key] of SNAPSHOT_KEYS) if (path === root || path.startsWith(`${root}/`)) return `${key}${path.slice(root.length)}`
  return relative(REPO_ROOT, path).split('\\').join('/')
}
