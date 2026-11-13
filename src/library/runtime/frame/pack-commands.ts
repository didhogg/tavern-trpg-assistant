// 小窗里：【我的库】的包 = 作者的一个独立自制包（P5.5 B8）。对任意一个包做作者改可编辑包的同一个动作：
// 复制整包 → 换 / 加 / 删那一条 → BrewUtil2.pUpdateBrew 写回（utils-brew-impl-brew.js pPersistEditableBrewEntity 同法）。
// 条目第一次被改时补一个 uniqueId（作者编辑器 CryptUtil.uid 同法），导出时 DataUtil.cleanJson 会去掉它。
/* eslint-disable @typescript-eslint/no-explicit-any -- 作者程序是没有类型的 JS，这里只做转调 */
import { A, hashOf, init } from './author'

const mod = (path: string): Promise<any> => import(/* @vite-ignore */ new URL(`js/${path}`, location.href).href)
const same = (a: unknown, b: string): boolean => String(a ?? '').toLowerCase() === b.toLowerCase()

async function docOf(docIdLocal: string): Promise<any> {
  await init()
  const d = (await A.BrewUtil2.pGetBrew()).find((b: any) => b.head.docIdLocal === docIdLocal)
  if (!d) throw new Error(`作者存储里没有这个包：${docIdLocal}`)
  return A.MiscUtil.copyFast(d)
}

/**
 * 包里的一条（按 uniqueId，没有就按作者编号）连同作者编号；没补过 uniqueId 的补一个（只在返回的副本上，存的时候才写进包，
 * 存时带上 replaceHash 找到原来那条）。
 */
export async function packEntity(docIdLocal: string, prop: string, key: { uniqueId?: string; hash?: string }): Promise<{ entity: any; hash: string | null; hadId: boolean } | null> {
  const doc = await docOf(docIdLocal)
  const list: any[] = doc.body?.[prop] ?? []
  const e = list.find((x) => (key.uniqueId && x?.uniqueId === key.uniqueId) || (key.hash && hashOf(prop, x) === key.hash))
  return e ? { entity: { ...e, uniqueId: e.uniqueId ?? A.CryptUtil.uid() }, hash: hashOf(prop, e), hadId: !!e.uniqueId } : null
}

/**
 * 存一条进包：按 uniqueId 找到就换，找不到再按 replaceHash（作者编号）找没补过 uniqueId 的那条换，都没有就加。
 * 返回形状同 editablePut：改之前的编号、名字、原文（改名搬记录、撤销用）。
 */
export async function packPut(docIdLocal: string, prop: string, ent: any, opts: { replaceHash?: string } = {}): Promise<{ uniqueId: string; hash: string | null; previousHash: string | null; previous: { name: string; source: string } | null; previousEntity: any }> {
  const doc = await docOf(docIdLocal)
  const list: any[] = (doc.body[prop] ??= [])
  let i = ent.uniqueId ? list.findIndex((x) => x?.uniqueId === ent.uniqueId) : -1
  if (i < 0 && opts.replaceHash) i = list.findIndex((x) => !x?.uniqueId && hashOf(prop, x) === opts.replaceHash)
  const before = i >= 0 ? A.MiscUtil.copyFast(list[i]) : null
  const e = { ...ent, uniqueId: ent.uniqueId ?? A.CryptUtil.uid() }
  if (i >= 0) list[i] = e
  else list.push(e)
  await A.BrewUtil2.pUpdateBrew(doc)
  return { uniqueId: e.uniqueId, hash: hashOf(prop, e), previousHash: before ? hashOf(prop, before) : null, previous: before ? { name: String(before.name ?? ''), source: String(before.source ?? '') } : null, previousEntity: before }
}

/** 从包里删条（按 uniqueId）。返回删掉的那几条原文（撤销用）。 */
export async function packRemove(docIdLocal: string, prop: string, uniqueIds: string[]): Promise<any[]> {
  const doc = await docOf(docIdLocal)
  const list: any[] = doc.body?.[prop] ?? []
  const ids = new Set(uniqueIds)
  const removed = list.filter((x) => ids.has(x?.uniqueId)).map((x) => A.MiscUtil.copyFast(x))
  if (!removed.length) return []
  doc.body[prop] = list.filter((x) => !ids.has(x?.uniqueId))
  await A.BrewUtil2.pUpdateBrew(doc)
  return removed
}

/** 包里用 _copy 指向某条的条目改指新名字（同 editableRetargetCopies，只在这一个包里）。返回改了几条。 */
export async function packRetargetCopies(docIdLocal: string, prop: string, from: { name: string; source: string }, to: { name: string; source: string }): Promise<number> {
  const doc = await docOf(docIdLocal)
  let n = 0
  for (const e of doc.body?.[prop] ?? []) {
    const c = e?._copy
    if (c && same(c.name, from.name) && same(c.source, from.source)) { c.name = to.name; c.source = to.source; n++ }
  }
  if (n) await A.BrewUtil2.pUpdateBrew(doc)
  return n
}

/** 改包头里某个来源的显示名 / 缩写（来源编号不变，包的身份不变）。 */
export async function packRenameSource(docIdLocal: string, json: string, patch: { full?: string; abbreviation?: string }): Promise<void> {
  const doc = await docOf(docIdLocal)
  const src = (doc.body?._meta?.sources ?? []).find((s: any) => same(s?.json, json))
  if (!src) throw new Error(`这个包里没有来源 ${json}`)
  Object.assign(src, Object.fromEntries(Object.entries(patch).filter(([, v]) => typeof v === 'string' && v.trim()).map(([k, v]) => [k, (v as string).trim()])))
  doc.body._meta.dateLastModified = Math.round(Date.now() / 1000)
  await A.BrewUtil2.pUpdateBrew(doc)
}

/**
 * 导出一个包（作者格式文件）：照作者编辑器导出（DataUtil.cleanJson 去掉 uniqueId 等运行时字段、PropOrder.getOrdered 排字段），
 * 包头原样（来源、依赖、internalCopies 等），只更新修改时间；edition 给了就用给的（包的版本标签）。
 */
export async function packExport(docIdLocal: string, edition?: 'classic' | 'one'): Promise<{ filename: string; body: any }> {
  const { PropOrder } = await mod('utils-proporder.js')
  const doc = await docOf(docIdLocal)
  const body: any = { _meta: { ...A.MiscUtil.copyFast(doc.body._meta ?? {}), dateLastModified: Math.round(Date.now() / 1000), ...(edition ? { edition } : {}) } }
  for (const [prop, list] of Object.entries(doc.body ?? {})) {
    if (prop.startsWith('_') || !Array.isArray(list)) continue
    body[prop] = (list as any[]).map((e) => PropOrder.getOrdered(A.DataUtil.cleanJson(A.MiscUtil.copyFast(e)), prop))
  }
  const src = doc.body._meta?.sources?.at(-1)
  return { filename: doc.head.filename ?? `${A.DataUtil.getCleanFilename(src?.full ?? src?.json ?? 'pack')}.json`, body }
}
