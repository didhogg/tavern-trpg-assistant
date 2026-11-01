import { describe, expect, it } from 'vitest'
import { Recorder } from './consumer/findings'
import { lib } from './consumer/load'
import { arr, rec, refsIn, str, strs } from './consumer/util'

function textOf(v: unknown): string {
  const out: string[] = []
  const walk = (x: unknown): void => {
    if (typeof x === 'string') out.push(x)
    else if (Array.isArray(x)) x.forEach(walk)
    else if (x && typeof x === 'object') Object.values(x).forEach(walk)
  }
  walk(v)
  return out.join(' ')
}
const FREE_CAST = /免费施展|无需消耗法术位|无需.{0,6}材料成分|随意施展/

describe('G2a 种族天生法术（a12）', () => {
  it('授予法术的结构化效果合法；文字写着免费施法的种族特质，法术要能在种族效果里找到；解锁等级要能读出', () => {
    const l = lib()
    const rec2 = new Recorder('g2a-innate')
    const grants: Array<{ owner: string; spells: string[]; mode: string; hasLevel: boolean }> = []
    for (const r of l.rows) for (const e of arr(r.data.effects).map(rec)) if (e.kind === 'spellGrant') grants.push({ owner: r.id, spells: strs(e.spells), mode: str(e.mode), hasLevel: typeof e.level === 'number' || typeof e.unlockLevel === 'number' })
    rec2.stat('a12', 'spellGrants', grants.length)
    expect(grants.filter((g) => g.spells.some((s) => l.get(s)?.type !== 'spell')).map((g) => g.owner)).toEqual([])
    const racial = l.of('feature').filter((f) => ['race', 'subrace'].includes(str(rec(f.data.owner).type)))
    const cand = racial.filter((f) => FREE_CAST.test(textOf(f.data.text)) && refsIn(textOf(f.data.text)).some((i) => i.startsWith('spell.')))
    const notStructured: string[] = []
    const noLevel: string[] = []
    for (const f of cand) {
      const ownerId = str(rec(f.data.owner).id)
      const owner = l.get(ownerId)
      const chain = [ownerId, str(owner?.data.parentRace)].filter(Boolean)
      const granted = new Set(grants.filter((g) => chain.includes(g.owner)).flatMap((g) => g.spells))
      const mentioned = refsIn(textOf(f.data.text)).filter((i) => i.startsWith('spell.'))
      if (!mentioned.every((s) => granted.has(s))) notStructured.push(`${f.id} ${f.name}`)
      // 文字里出现“达到 N 级 / N 级时”的解锁等级，授予法术的结构里要有对应的等级字段
      if (/达到\s*\d+\s*级|\d+\s*级(时|起|后)/.test(textOf(f.data.text)) && !grants.some((g) => chain.includes(g.owner) && g.hasLevel)) noLevel.push(`${f.id} ${f.name}`)
    }
    rec2.stat('a12', 'racialFreeCastFeatures', cand.length)
    if (notStructured.length) rec2.find({ id: 'a12-innate-not-structured', check: 'a12', kind: 'data-defect', fixSource: 'self-structure', entries: notStructured, expected: 'PHB 第 2 章、MPMM、MTF 种族特质（免费施展的法术）', note: '种族特质文字里写着免费施展某法术，但所属种族的效果里没有对应的授予法术（spellGrant），人物模块读不到' })
    if (noLevel.length) rec2.find({ id: 'a12-innate-unlock-level', check: 'a12', kind: 'data-defect', fixSource: 'self-structure', entries: noLevel, expected: 'PHB 第 2 章（提夫林：3 级、5 级获得法术）、MPMM 同类种族', note: '天生法术有解锁等级（如“达到 3 级后”），授予法术的结构里没有等级字段，人物模块无法判断何时可用' })
    expect(rec2.settle()).toEqual([])
  })
})
