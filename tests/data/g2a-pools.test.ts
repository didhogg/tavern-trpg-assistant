import { describe, expect, it } from 'vitest'
import { PHB_SKILLS } from './consumer/codes'
import { expandPool, expandSpellPool, expandToken } from './consumer/expand'
import { inventory } from './consumer/inventory'
import { Recorder } from './consumer/findings'
import { lib } from './consumer/load'

/** a17：全部「任选」记号必须能展开；展开成空的、写法不规范的登记。 */
describe('G2a a17 任选展开', () => {
  it('每个记号都能展开，没见过的写法会抛错', () => {
    const l = lib()
    const rec = new Recorder('g2a-pools')
    const inv = inventory(l)
    const empty: string[] = []
    const ambiguous: string[] = []
    const spelling: string[] = []
    const noEntry: string[] = []
    const where = new Map<string, string[]>()
    for (const r of l.rows) for (const k of ['advancement', 'proficiencies', 'languages']) if (k in r.data) for (const t of JSON.stringify(r.data[k]).match(/"((?:skill|tool|lang|weapon|armor|spell):[^"]+)"/g) ?? []) {
      const tok = t.slice(1, -1)
      where.set(tok, [...(where.get(tok) ?? []), r.id])
    }
    // 法术池里的 `class=@选择id`：到条目自己的 advancement 里找那个选择，把它的每个职业都代进去展开，每个都必须有法术
    const expandWithChoices = (tok: string): ReturnType<typeof expandToken> => {
      const ref = /@([a-z0-9-]+)/.exec(tok)?.[1]
      if (!ref || !tok.startsWith('spell:')) return expandToken(l, tok)
      const owners = where.get(tok) ?? []
      const classes = owners.flatMap((id) => (JSON.parse(JSON.stringify(l.need(id).data.advancement ?? [])) as Array<{ choices?: Array<{ id?: string; pool: string[] }> }>).flatMap((a) => a.choices ?? []).filter((c) => c.id === ref).flatMap((c) => c.pool.filter((p) => p.startsWith('class:')).map((p) => p.slice(6))))
      if (!classes.length) return { values: [], ambiguous: `${tok} 找不到选择 ${ref}` }
      const empties = classes.filter((c) => expandSpellPool(l, tok.slice(6), tok, { [ref]: c }).values.length === 0)
      return empties.length ? { values: [] } : { values: ['ok'] }
    }
    for (const tok of Object.keys(inv.tokens)) {
      const e = expandWithChoices(tok)
      if (e.ambiguous) ambiguous.push(...(where.get(tok) ?? [tok]))
      else if (e.values.length === 0) empty.push(...(where.get(tok) ?? [tok]))
      if (e.spelling) spelling.push(...(where.get(tok) ?? [tok]))
      if (e.noEntry) noEntry.push(...(where.get(tok) ?? [tok]))
    }
    rec.stat('a17', 'tokens', Object.keys(inv.tokens).length)
    rec.stat('a17', 'skill*', expandPool(l, ['skill:*']).values.length)
    if (ambiguous.length) rec.find({ id: 'a17-ambiguous', check: 'a17', kind: 'decision', fixSource: 'decision', entries: ambiguous, expected: '规则本身', note: 'lang:other 含义不明，读取器无法展开（吉斯人、穴蜥人、啵灵蛙）；需约定' })
    if (empty.length) rec.find({ id: 'a17-empty', check: 'a17', kind: 'data-defect', fixSource: 'reader-only', entries: empty, expected: '规则本身', note: '展开成空列表的记号' })
    if (noEntry.length) rec.find({ id: 'a17-no-entry', check: 'a17', kind: 'data-defect', fixSource: 'decision', entries: noEntry, expected: 'PHB 语言表（原初语方言）、PHB 第 5 章（载具熟练）', note: '记号指向没有条目的东西：lang:aquan/auran/terran（原初语方言）与 tool:vehicles（载具熟练）；读取器只能给代码，是否补条目待定' })
    rec.find({ id: 'a17-spelling', check: 'a17', kind: 'data-defect', fixSource: 'normalize', entries: spelling, expected: '写法应统一', note: '同一个意思有多种写法（animal-handling 与 animal handling、smiths-tools 与 smith\'s tools、gaming set 与 anyGamingSet 等），读取器靠别名表才认得出' })
    expect(expandPool(l, ['skill:*']).values).toEqual([...PHB_SKILLS])
    expect(expandToken(l, 'weapon:martial').values.length).toBeGreaterThan(20)
    expect(() => expandToken(l, 'skill:nonsense')).toThrow()
    expect(() => expandToken(l, 'weird:x')).toThrow()
    expect(rec.settle()).toEqual([])
  })
})
