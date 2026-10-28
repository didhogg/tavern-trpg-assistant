import { createHash } from 'node:crypto'
import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises'
import { dirname, join, relative } from 'node:path'

export const REPO_ROOT = process.cwd()
export const TOOLS_DIR = join(REPO_ROOT, 'tools', 'data')

export async function readJson<T = unknown>(path: string): Promise<T> {
  return JSON.parse(await readFile(path, 'utf8')) as T
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
