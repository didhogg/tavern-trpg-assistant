import { createHash } from 'node:crypto'
import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises'
import { dirname, join, relative } from 'node:path'

export const REPO_ROOT = process.cwd()
export const TOOLS_DIR = join(REPO_ROOT, 'tools', 'data')

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
  return relative(REPO_ROOT, path).split('\\').join('/')
}
