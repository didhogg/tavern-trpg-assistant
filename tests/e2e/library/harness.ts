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

// ---- B2-3 ----
import { installOfficial, parsedKey } from '../../../src/library/install'
import { precachePlan } from '../../../src/library/plan'

function openLocalFrame(codeSet: string) {
  return startAuthorFrame({ codeSet, pluginRoot: new URL('/', location.href), container: document.body, handlers: libraryHandlers({ codeSet, db, files, allowNetwork: () => false }) })
}

export async function install(sourceId: string) {
  const source = getSource(sourceId)
  return installOfficial({ source, db, files, openFrame: () => openLocalFrame(source.codeSet), onProgress: (p) => console.log(`[progress] ${sourceId} ${p.stage} ${p.done}/${p.total} ${p.item ?? ''}`) })
}

/** 按书开关：关掉一本书后，作者的 isExcluded 对这本书的条目返回 true；别的书不受影响。 */
export async function toggleBook(codeSet: string, sourceId: string, bookSource: string, excluded: boolean) {
  const rec = await db.derived.get(parsedKey(sourceId, 'spell'))
  const { items, hashes } = rec!.value as { items: Array<{ source: string }>; hashes: string[] }
  const i = items.findIndex((it) => it.source === bookSource)
  const j = items.findIndex((it) => it.source !== bookSource)
  const f = await openLocalFrame(codeSet)
  try {
    if (excluded !== undefined) await f.call('setSourceExcluded', bookSource, excluded)
    return {
      inBook: await f.call('isExcluded', hashes[i], 'spell', bookSource),
      otherBook: await f.call('isExcluded', hashes[j], 'spell', items[j].source),
    }
  } finally {
    f.close()
  }
}

export async function bookState(codeSet: string, sourceId: string, bookSource: string) {
  const rec = await db.derived.get(parsedKey(sourceId, 'spell'))
  const { items, hashes } = rec!.value as { items: Array<{ source: string }>; hashes: string[] }
  const i = items.findIndex((it) => it.source === bookSource)
  const f = await openLocalFrame(codeSet)
  try {
    return await f.call('isExcluded', hashes[i], 'spell', bookSource)
  } finally {
    f.close()
  }
}

/** 断网后复查：第 1 层镜像仍然完整，解析结果都在库里。 */
export async function offlineAudit(sourceId: string) {
  const source = getSource(sourceId)
  const list = await files.fileList(source)
  const plan = precachePlan(list)
  let ok = 0
  const bad: string[] = []
  for (const path of plan.files) {
    const rec = await db.files.get([sourceId, path])
    if (rec && rec.gitSha === list[path].sha) ok++
    else bad.push(path)
  }
  const parsedKeys = (await db.derived.where('key').startsWith(`parsed:${sourceId}:`).primaryKeys()).length
  return { planFiles: plan.files.length, ok, bad: bad.slice(0, 10), parsedKeys, set: await db.sets.get(sourceId) }
}

/** 诊断用：经传话通道叫最近打开的某个小窗做一件事。 */
export async function callFrame(codeSet: string, fn: string, ...args: unknown[]) {
  const f = [...frames].reverse().find((x) => x.codeSet === codeSet)
  if (!f) throw new Error(`没有打开的小窗：${codeSet}`)
  return (f.call as (fn: string, ...a: unknown[]) => Promise<unknown>)(fn, ...args)
}
