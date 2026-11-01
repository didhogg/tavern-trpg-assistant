import { describe, expect, it } from 'vitest'
import { PACK_VERSION } from '../../tools/data/config/bookPolicy'
import { ADDED, ALLOW, ALLOW_REQUIRES, type Allow } from './g2-allow'
import { attribute } from './g2-allow/match'
import { loadG2Before } from './g2-snapshot'
import { loadAllPacks } from './r9-pack-helpers'
import { manifestOf } from './g1-snapshot'

type Rec = Record<string, unknown>
const isObj = (v: unknown): v is Rec => !!v && typeof v === 'object' && !Array.isArray(v)

/** 两个条目的「变化路径」（从条目根算起）：数组按下标、对象按键；新增/删除/改值各算一个路径。 */
export function changedPaths(a: unknown, b: unknown, at = ''): string[] {
  if (JSON.stringify(a) === JSON.stringify(b)) return []
  if (Array.isArray(a) && Array.isArray(b)) {
    const out: string[] = []
    for (let i = 0; i < Math.max(a.length, b.length); i++) out.push(...(i >= a.length || i >= b.length ? [`${at}/${i}`] : changedPaths(a[i], b[i], `${at}/${i}`)))
    return out
  }
  if (isObj(a) && isObj(b)) {
    const out: string[] = []
    for (const k of new Set([...Object.keys(a), ...Object.keys(b)])) {
      if (!(k in a) || !(k in b)) out.push(`${at}/${k}`)
      else out.push(...changedPaths(a[k], b[k], `${at}/${k}`))
    }
    return out
  }
  return [at || '/']
}

describe('changedPaths（变化路径算法）', () => {
  it('改值、新增键、删除键、数组增删各给出精确路径', () => {
    expect(changedPaths({ a: 1, b: { c: [1, 2] } }, { a: 1, b: { c: [1, 2] } })).toEqual([])
    expect(changedPaths({ a: 1 }, { a: 2 })).toEqual(['/a'])
    expect(changedPaths({ a: 1 }, { a: 1, n: 0 })).toEqual(['/n'])
    expect(changedPaths({ a: 1, d: 5 }, { a: 1 })).toEqual(['/d'])
    expect(changedPaths({ l: [1, 2] }, { l: [1, 9, 2] })).toEqual(['/l/1', '/l/2'])
    expect(changedPaths({ e: [{ k: 1 }] }, { e: [{ k: 1, level: 3 }] })).toEqual(['/e/0/level'])
    expect(changedPaths({ a: [1] }, { a: { x: 1 } })).toEqual(['/a'])
  })
})

describe('放行规则归属（attribute）', () => {
  const rule = (name: string, o: Partial<Allow>): Allow => ({ name, station: 0, path: /^\/data\/x$/, expect: 1, reason: 't', ...o })
  it('ids 规则各自都算，不互相抢', () => {
    const a = rule('a', { ids: ['e1'] }), b = rule('b', { ids: ['e1', 'e2'] })
    expect(attribute([a, b], 'e1', 'spell', '/data/x').map((r) => r.name)).toEqual(['a', 'b'])
  })
  it('ids 规则优先于 type 规则；type 规则只在没有 ids 规则管它时算第一条', () => {
    const wide1 = rule('wide1', { type: 'spell' }), wide2 = rule('wide2', { type: 'spell' }), exact = rule('exact', { ids: ['e1'] })
    expect(attribute([wide1, wide2, exact], 'e1', 'spell', '/data/x').map((r) => r.name)).toEqual(['exact'])
    expect(attribute([wide1, wide2, exact], 'e9', 'spell', '/data/x').map((r) => r.name)).toEqual(['wide1'])
  })
  it('路径或类型对不上 = 没有放行', () => {
    expect(attribute([rule('a', { ids: ['e1'] })], 'e1', 'spell', '/data/y')).toEqual([])
    expect(attribute([rule('w', { type: 'item' })], 'e1', 'spell', '/data/x')).toEqual([])
  })
})

describe('G2.5 g2-additive：只改放行名单里写明的地方', () => {
  const before = loadG2Before()
  const packs = loadAllPacks()
  const now = new Map(packs.flatMap((p) => p.entries.map((e) => [e.id, { pack: p.id, entry: e as unknown as Rec }] as const)))
  const added = new Map(ADDED.map((a) => [a.id, a]))

  it('放行名单本身合法：规则名唯一、ids 与 type 二选一、ids 都存在', () => {
    const names = ALLOW.map((a) => a.name)
    expect(names.filter((n, i) => names.indexOf(n) !== i)).toEqual([])
    for (const a of ALLOW) {
      expect(Boolean(a.ids) !== Boolean(a.type), `${a.name}：ids 与 type 必须二选一`).toBe(true)
      expect(a.expect, `${a.name}：expect 必须是正整数`).toBeGreaterThan(0)
      for (const id of a.ids ?? []) expect(now.has(id), `${a.name}：ids 里的 ${id} 不存在`).toBe(true)
      if (a.ids) expect(new Set(a.ids).size, `${a.name}：ids 有重复`).toBe(a.ids.length)
    }
    expect(added.size, 'ADDED 里有重复 id').toBe(ADDED.length)
  })

  it('条目只增不删；新增的必须在 ADDED 里；所在的包不变', () => {
    const missing = Object.keys(before.entries).filter((id) => !now.has(id))
    expect(missing, '不允许删除条目').toEqual([])
    const extra = [...now.keys()].filter((id) => !before.entries[id])
    expect(extra.filter((id) => !added.has(id)), '新增条目没有登记到 ADDED').toEqual([])
    expect([...added.keys()].filter((id) => !now.has(id)), 'ADDED 里登记了但没出现的条目').toEqual([])
    for (const a of ADDED) expect(now.get(a.id)?.pack, `${a.id} 所在的包`).toBe(a.pack)
    for (const [id, old] of Object.entries(before.entries)) expect(now.get(id)!.pack, id).toBe(old.pack)
  })

  it('每个包的名称与 lineage 不变；依赖只增加放行名单里写明的', () => {
    const allowed = new Map<string, Set<string>>()
    for (const r of ALLOW_REQUIRES) allowed.set(r.pack, new Set([...(allowed.get(r.pack) ?? []), r.requires]))
    for (const [id, old] of Object.entries(before.packs)) {
      const m = manifestOf(id)
      expect({ name: m.name, nameEn: m.nameEn, lineage: m.lineage }, id).toEqual({ name: old.name, nameEn: old.nameEn, lineage: old.lineage })
      expect(old.requires.filter((r) => !m.requires.includes(r)), `${id} 不许减少依赖`).toEqual([])
      expect(m.requires.filter((r) => !old.requires.includes(r) && !allowed.get(id)?.has(r)), `${id} 新增了没放行的依赖`).toEqual([])
      if (id !== 'dnd5e2014-srd') expect(m.version, `${id} 版本号`).toBe(PACK_VERSION)
    }
  })

  it('每个变化的路径都被放行规则覆盖；每条规则命中的条目数正好等于 expect', () => {
    const hits = new Map<string, Set<string>>(ALLOW.map((a) => [a.name, new Set<string>()]))
    const unexplained: string[] = []
    for (const [id, old] of Object.entries(before.entries)) {
      const cur = now.get(id)!.entry
      for (const path of changedPaths(old.entry, cur)) {
        // 归属规则见 g2-allow/match.ts：ids 规则各自都算，按 type 的宽规则只在没有 ids 规则管它时才算（且只算第一条）
        const rules = attribute(ALLOW, id, String(cur.type), path)
        if (rules.length) for (const rule of rules) hits.get(rule.name)!.add(id)
        else unexplained.push(`${id} ${path}`)
      }
    }
    expect(unexplained.slice(0, 20), `没有放行的变化共 ${unexplained.length} 处`).toEqual([])
    const wrong = ALLOW.filter((a) => hits.get(a.name)!.size !== a.expect).map((a) => `${a.name}：expect ${a.expect}，实际命中 ${hits.get(a.name)!.size}`)
    expect(wrong).toEqual([])
  }, 180_000)
})
