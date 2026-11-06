// 测试用入口：在模拟宿主页里直接调用插件的【库】后端（不经界面）。
import { LibraryDatabase } from '../../../src/library/db'
import { FileProvider } from '../../../src/library/files'
import { libraryHandlers } from '../../../src/library/runtime/handlers'
import { startAuthorFrame, type AuthorFrame } from '../../../src/library/runtime/host'
import { getSource } from '../../../src/library/sources'

const db = new LibraryDatabase()
const files = new FileProvider({ db })
const frames: AuthorFrame[] = []

export async function startFrames(codeSets: string[], { allowNetwork }: { allowNetwork: boolean }) {
  const pluginRoot = new URL('/', location.href)
  const out = []
  for (const codeSet of codeSets) {
    const t = performance.now()
    const f = await startAuthorFrame({ codeSet, pluginRoot, container: document.body, handlers: libraryHandlers({ codeSet, db, files, allowNetwork: () => allowNetwork }) })
    frames.push(f)
    out.push({ ...f.ready, ms: Math.round(performance.now() - t) })
  }
  return out
}

export function failures() {
  return frames.map((f) => ({ codeSet: f.codeSet, failures: [...f.failures] }))
}

/** 第 1 层（镜像）的局部检查：本地每个文件的指纹 = 锁定版本云端清单里的指纹。 */
export async function mirrorCheck() {
  const out: Record<string, { files: number; bytes: number; mismatched: string[]; notInList: string[] }> = {}
  for (const rec of await db.files.toArray()) {
    const list = await files.fileList(getSource(rec.source))
    const s = (out[rec.source] ??= { files: 0, bytes: 0, mismatched: [], notInList: [] })
    s.files++
    s.bytes += rec.size
    const expected = list[rec.path]
    if (!expected) s.notInList.push(rec.path)
    else if (expected.sha !== rec.gitSha || expected.size !== rec.size) s.mismatched.push(rec.path)
  }
  return out
}

export async function kvDump() {
  return (await db.kv.toArray()).map((r) => ({ scope: r.scope, key: r.key }))
}
