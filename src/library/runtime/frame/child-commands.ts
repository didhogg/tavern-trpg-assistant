// 小窗里：从属条目（子职、职业特性、子种族……，§16.10 2c）。认法按作者规矩，不写类型名单：
// - 从属条目用「主类别名 + Name / ShortName」和「主类别名 + Source」指向主条目（子职 className / classSource，
//   子职特性 subclassShortName / subclassSource，子种族 raceName / raceSource）；
// - 作者有这一类的引用拼法（DataUtil.<某类>.packUid<类别>：职业特性、子职特性）时，主条目自己还有一张「类别名 + s」引用表
//   （职业 classFeatures、子职 subclassFeatures），作者渲染器按这张表把特性排进职业页。保存 / 删除从属条目时在同一个包里同步这张表。
/* eslint-disable @typescript-eslint/no-explicit-any -- 作者程序是没有类型的 JS，这里只做转调 */
import { A, hashOf, init } from './author'
import { docOf } from './pack-commands'

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)
const lower = (x: unknown) => String(x ?? '').toLowerCase()

/** 主条目的名字（从属条目用 ShortName 指的，按作者惯例取 shortName，没有就用 name）。 */
const nameFor = (parent: any, key: string) => (key.endsWith('ShortName') ? parent.shortName ?? parent.name : parent.name)

/** 从属条目指向 parentProp 的那两个字段（名字、来源）；不指向它 null。 */
function refKeys(child: any, parentProp: string): { name: string; source: string } | null {
  const name = [`${parentProp}ShortName`, `${parentProp}Name`].find((k) => child?.[k] !== undefined)
  return name && child?.[`${parentProp}Source`] !== undefined ? { name, source: `${parentProp}Source` } : null
}

const belongs = (child: any, parentProp: string, parent: any): boolean => {
  const k = refKeys(child, parentProp)
  return !!k && lower(child[k.name]) === lower(nameFor(parent, k.name)) && lower(child[k.source]) === lower(parent.source)
}

/** 包里属于这一条（parent，parentProp 类）的从属条目，按类别。 */
export async function packChildren(docIdLocal: string, parentProp: string, parent: any, childProps: string[]): Promise<Record<string, Array<{ name: string; hash: string | null; uniqueId: string | null; level: number | null }>>> {
  const doc = await docOf(docIdLocal)
  const out: Record<string, Array<{ name: string; hash: string | null; uniqueId: string | null; level: number | null }>> = {}
  for (const p of childProps) {
    out[p] = ((doc.body?.[p] ?? []) as any[]).filter((c) => belongs(c, parentProp, parent))
      .map((c) => ({ name: String(c.name ?? ''), hash: hashOf(p, c), uniqueId: c.uniqueId ?? null, level: typeof c.level === 'number' ? c.level : null }))
      .sort((a, b) => (a.level ?? 0) - (b.level ?? 0) || a.name.localeCompare(b.name))
  }
  return out
}

/** 作者这一类的引用拼法（packUid<类别>，在哪个 DataUtil 类上都行）；没有 null。 */
function uidFn(prop: string): ((e: any) => string) | null {
  const name = `packUid${cap(prop)}`
  const owner = Object.values(A.DataUtil as Record<string, any>).find((c) => typeof c?.[name] === 'function')
  return owner ? (e: any) => owner[name](e, { isMaintainCase: true }) : null
}

/**
 * 保存 / 删除一条从属条目后同步主条目的引用表（同一个包里）。before = 改之前的（新加的 null），after = 现在的（删掉的 null）。
 * 返回改了哪一条主条目的哪张表；不用同步 null。
 */
export async function linkParent(docIdLocal: string, prop: string, before: any, after: any): Promise<{ parentProp: string; field: string } | null> {
  await init()
  const uid = uidFn(prop)
  const now = after ?? before
  if (!uid || !now) return null
  const doc = await docOf(docIdLocal)
  const field = `${prop}s`
  // 包里能找到的主条目（子职特性同时指向职业和子职）：取最近一层——别的候选主条目本身指向它的，它是更上一层，不选
  const found = Object.keys(doc.body ?? {}).filter((q) => refKeys(now, q))
    .map((q) => ({ q, ent: ((doc.body[q] ?? []) as any[]).find((p) => belongs(now, q, p)) })).filter((x) => x.ent)
  const nearest = found.find((x) => !found.some((y) => y !== x && refKeys(y.ent, x.q)))
  if (nearest) {
    const parentProp = nearest.q, parent = nearest.ent
    const id = (x: unknown) => lower(typeof x === 'string' ? x : (x as any)?.[prop])
    const old = before ? lower(uid(before)) : null
    const list = ((parent[field] ?? []) as unknown[]).filter((x) => id(x) !== old)
    if (after && !list.some((x) => id(x) === lower(uid(after)))) list.push(uid(after))
    parent[field] = list
    await A.BrewUtil2.pUpdateBrew(doc)
    return { parentProp, field }
  }
  return null
}
