import type { AlignFile, Dump, Ent, RawInfo } from './data'

/**
 * 中英配对。证据按强弱排四层（每层只拿还没配上的条目）：
 *   A 并排配对（5e-translator 对齐器的规则：同文件、同数组、同下标，数组长度不一致就不配）→ 两条原始记录各算上游哈希 → 接到取数层条目
 *   B 上游英文哈希（URL_TO_ENG_HASH_BUILDER）等于英文条目的上游哈希
 *   C 中文条目自带的 ENG_name + 来源 等于英文条目的 name + 来源
 *   D wiki-dnd-parser 给出的中英名对照（中文名 + 来源 → 英文名）再按 C 的方式找英文条目
 *   E wiki-dnd-parser 自带的《子种族名字替换词典》（母种族+缀名中英对照）找带上游 _baseName/_subraceName 标记的亚种
 *   F 中文仓库自带的术语库（翻译系统数据库导出）：中文名 → 英文名，同来源
 *   G 衍生条目（上游标了父级：_versionBase_hash，种族特性的 raceName）：父级已配对、兄弟条数相同，才按顺序配
 * 配不上的不猜，原样各成一条。
 */
export type How = 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G'
export interface Pair { prop: string; cn: Ent | null; bak: Ent | null; how: How | null }

export interface RawPairing {
  /** 中文原始记录编号 → 英文原始记录编号 */
  byCnId: Map<number, number>
  /** 并排条件不成立的 (文件, 数组)：中英条数不同 */
  unequal: Array<{ file: string; category: string; cn: number; bak: number }>
  /** 只有一边有的 (文件, 数组) */
  oneSided: Array<{ file: string; category: string; lib: 'cn' | 'bak'; n: number }>
  /** 对齐器报的"顶层数组"级错误（嵌套段落内部的错误不算，单独计数） */
  topLevelErrors: string[]
  nestedErrors: number
  rawMap: Map<string, string>
}

export function pairRaw(cn: RawInfo[], bak: RawInfo[], align: Record<string, AlignFile>): RawPairing {
  const gkey = (r: RawInfo): string => `${r.file}\u0001${r.category}`
  const group = (rows: RawInfo[]): Map<string, RawInfo[]> => { const m = new Map<string, RawInfo[]>(); for (const r of rows) m.set(gkey(r), [...(m.get(gkey(r)) ?? []), r]); return m }
  const gc = group(cn), gb = group(bak)
  const byCnId = new Map<number, number>()
  const unequal: RawPairing['unequal'] = []
  const oneSided: RawPairing['oneSided'] = []
  const rawMap = new Map<string, string>()
  for (const [k, cl] of gc) {
    const bl = gb.get(k)
    const [file, category] = k.split('\u0001') as [string, string]
    if (!bl) { oneSided.push({ file, category, lib: 'cn', n: cl.length }); continue }
    if (bl.length !== cl.length) { unequal.push({ file, category, cn: cl.length, bak: bl.length }); continue }
    const bi = new Map(bl.map((r) => [r.idx, r]))
    for (const c of cl) {
      const b = bi.get(c.idx)
      if (!b) continue
      byCnId.set(c.id, b.id)
      if (c.h && b.h) rawMap.set(`${c.category}|${c.h}`, b.h)
    }
  }
  for (const [k, bl] of gb) if (!gc.has(k)) { const [file, category] = k.split('\u0001') as [string, string]; oneSided.push({ file, category, lib: 'bak', n: bl.length }) }
  const topLevelErrors: string[] = []
  let nestedErrors = 0
  for (const [file, a] of Object.entries(align)) for (const e of a.errors ?? []) {
    const path = e.split(': ')[0]!
    if (/^\/[^/[\]]+(\[\d+\])?$/.test(path)) topLevelErrors.push(`${file} ${e}`)
    else nestedErrors += 1
  }
  return { byCnId, unequal, oneSided, topLevelErrors, nestedErrors, rawMap }
}

const nameKey = (name: unknown, source: unknown): string => `${String(name ?? '')}|${String(source ?? '')}`.toLowerCase()

export interface PropPairing {
  pairs: Pair[]
  stats: { total: number; byHow: Record<string, number>; cnOnly: number; bakOnly: number; disagree: number }
}

export interface Ext { sub: Map<string, [string, string]>; terms: Map<string, Set<string>> }

export function pairProp(prop: string, cnEnts: Ent[], bakEnts: Ent[], rawMap: Map<string, string>, wiki: Map<string, string>, ext: Ext): PropPairing {
  const bakByHash = new Map<string, Ent[]>()
  const bakByName = new Map<string, Ent[]>()
  for (const b of bakEnts) {
    if (b.key.h) bakByHash.set(b.key.h, [...(bakByHash.get(b.key.h) ?? []), b])
    const nk = nameKey(b.value.name, b.key.s)
    bakByName.set(nk, [...(bakByName.get(nk) ?? []), b])
  }
  const bakBySub = new Map<string, Ent[]>()
  for (const b of bakEnts) if (b.value._baseName !== undefined) { const k = `${b.value._baseName}|${b.value._subraceName}|${b.key.s}`; bakBySub.set(k, [...(bakBySub.get(k) ?? []), b]) }
  const used = new Set<Ent>()
  const chosen = new Map<Ent, { bak: Ent; how: How }>()
  const first = (l: Ent[] | undefined): Ent | undefined => l?.find((x) => !used.has(x))
  const tiers: Array<{ how: How; find: (c: Ent) => Ent | undefined }> = [
    { how: 'A', find: (c) => { const hb = c.key.h ? rawMap.get(`${prop}|${c.key.h}`) : undefined; return hb ? first(bakByHash.get(hb)) : undefined } },
    { how: 'B', find: (c) => (c.key.e ? first(bakByHash.get(c.key.e)) : undefined) },
    { how: 'C', find: (c) => (typeof c.value.ENG_name === 'string' ? first(bakByName.get(nameKey(c.value.ENG_name, c.key.s))) : undefined) },
    { how: 'D', find: (c) => { const en = wiki.get(nameKey(c.value.name, c.key.s)); return en ? first(bakByName.get(nameKey(en, c.key.s))) : undefined } },
    { how: 'E', find: (c) => { const d = ext.sub.get(`${c.value._baseName}|${c.value._subraceName}|${c.key.s}`); return d ? first(bakBySub.get(`${d[0]}|${d[1]}|${c.key.s}`)) : undefined } },
    { how: 'F', find: (c) => { for (const en of ext.terms.get(String(c.value.name)) ?? []) { const b = first(bakByName.get(nameKey(en, c.key.s))); if (b) return b } return undefined } },
  ]
  for (const t of tiers) for (const c of cnEnts) {
    if (chosen.has(c)) continue
    const b = t.find(c)
    if (b) { chosen.set(c, { bak: b, how: t.how }); used.add(b) }
  }
  // 一致性：被选中的配对，其它层给出的候选里是否包含同一条英文条目
  let disagree = 0
  for (const [c, { bak, how }] of chosen) {
    const alts: Ent[][] = []
    const hb = c.key.h ? rawMap.get(`${prop}|${c.key.h}`) : undefined
    if (how !== 'A' && hb) alts.push(bakByHash.get(hb) ?? [])
    if (how !== 'B' && c.key.e) alts.push(bakByHash.get(c.key.e) ?? [])
    if (how !== 'C' && typeof c.value.ENG_name === 'string') alts.push(bakByName.get(nameKey(c.value.ENG_name, c.key.s)) ?? [])
    if (alts.some((l) => l.length && !l.includes(bak))) disagree += 1
  }
  const pairs: Pair[] = []
  const byHow: Record<string, number> = {}
  for (const c of cnEnts) {
    const ch = chosen.get(c)
    pairs.push({ prop, cn: c, bak: ch?.bak ?? null, how: ch?.how ?? null })
    if (ch) byHow[ch.how] = (byHow[ch.how] ?? 0) + 1
  }
  for (const b of bakEnts) if (!used.has(b)) pairs.push({ prop, cn: null, bak: b, how: null })
  return { pairs, stats: { total: pairs.length, byHow, cnOnly: pairs.filter((p) => p.cn && !p.bak).length, bakOnly: pairs.filter((p) => !p.cn && p.bak).length, disagree } }
}

/** G 层：衍生条目按"父级已配对 + 兄弟条数相同"才按顺序配（和 wiki-dnd-parser 的 _versionImplIdx 同一思路，父级用上游自己的标记）。 */
function pairDerived(pairing: Map<string, PropPairing>): number {
  const partner = new Map<Ent, Ent>()
  for (const p of pairing.values()) for (const x of p.pairs) if (x.cn && x.bak) partner.set(x.cn, x.bak)
  const race = pairing.get('race')?.pairs ?? []
  const parentKey = (e: Ent): string | null => {
    const v = e.value
    if (typeof v._versionBase_hash === 'string') {
      if (e.lib === 'bak') return `v|${v._versionBase_hash}`
      const par = (pairing.get(e.prop)?.pairs ?? []).find((x) => x.cn?.key.h === v._versionBase_hash)?.cn
      const pb = par && partner.get(par)
      return pb && pb.key.h ? `v|${pb.key.h}` : null
    }
    if (typeof v.raceName === 'string' && typeof v.raceSource === 'string') {
      if (e.lib === 'bak') return `r|${v.raceName}|${v.raceSource}`
      const par = race.find((x) => x.cn && x.cn.value.name === v.raceName && x.cn.key.s === v.raceSource && x.bak)?.cn
      const pb = par && partner.get(par)
      return pb ? `r|${pb.value.name}|${v.raceSource}` : null
    }
    return null
  }
  let n = 0
  for (const [prop, pp] of pairing) {
    const cnL = pp.pairs.filter((x) => x.cn && !x.bak), bkL = pp.pairs.filter((x) => !x.cn && x.bak)
    const g = new Map<string, { c: Pair[]; b: Pair[] }>()
    for (const x of cnL) { const k = parentKey(x.cn!); if (k) { const e = g.get(k) ?? { c: [], b: [] }; e.c.push(x); g.set(k, e) } }
    for (const x of bkL) { const k = parentKey(x.bak!); if (k && g.has(k)) g.get(k)!.b.push(x) }
    const drop = new Set<Pair>()
    for (const { c, b } of g.values()) {
      if (!c.length || c.length !== b.length) continue
      c.forEach((x, i) => { x.bak = b[i]!.bak; x.how = 'G'; drop.add(b[i]!); n += 1 })
    }
    if (drop.size) { pp.pairs = pp.pairs.filter((x) => !drop.has(x)); pp.stats = recount(pp) }
    void prop
  }
  return n
}

function recount(pp: PropPairing): PropPairing['stats'] {
  const byHow: Record<string, number> = {}
  for (const x of pp.pairs) if (x.how && x.cn && x.bak) byHow[x.how] = (byHow[x.how] ?? 0) + 1
  return { total: pp.pairs.length, byHow, cnOnly: pp.pairs.filter((p) => p.cn && !p.bak).length, bakOnly: pp.pairs.filter((p) => !p.cn && p.bak).length, disagree: pp.stats.disagree }
}

export function pairAll(cn: Dump, bak: Dump, rawMap: Map<string, string>, wiki: Map<string, string>, ext: Ext): Map<string, PropPairing> {
  const out = new Map<string, PropPairing>()
  for (const prop of new Set([...cn.props, ...bak.props])) out.set(prop, pairProp(prop, cn.byProp.get(prop) ?? [], bak.byProp.get(prop) ?? [], rawMap, wiki, ext))
  pairDerived(out)
  return out
}
