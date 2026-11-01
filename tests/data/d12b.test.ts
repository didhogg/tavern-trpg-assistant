import { describe, expect, it } from 'vitest'
import { lib } from './consumer/load'
import { rec, str } from './consumer/util'

/** D1.2b：新类型与 art/variant 字段的规则检查（不钉死条数）。 */
describe('D1.2b 怪物与 NPC 数据规则', () => {
  it('npc.statblock / variantOf 能解析；art 焦点合法；新包只含 monster/npc', () => {
    const l = lib()
    const byId = new Map(l.rows.map((r) => [r.id, r]))
    for (const r of l.rows) {
      if (r.type === 'monster') {
        const v = str(r.data.variantOf)
        if (v) {
          expect(byId.get(v)?.type, `${r.id} 的 variantOf`).toBe('monster')
          expect((r.data.variantDiff as unknown[] | undefined)?.length ?? 0, `${r.id} 的 variantDiff`).toBeGreaterThan(0)
        }
        const art = rec(r.data.art)
        if (Object.keys(art).length) {
          expect(Boolean(art.portrait || art.token), `${r.id} 的 art`).toBe(true)
          const p = rec(art.portrait)
          if (Object.keys(p).length) {
            const f = rec(p.focus)
            for (const k of ['x', 'y', 'size']) expect(Number(f[k]), `${r.id} 的 focus.${k}`).toBeGreaterThanOrEqual(0)
            expect(Number(f.size), `${r.id} 的 focus.size`).toBeGreaterThan(0)
            expect(Number(f.size), `${r.id} 的 focus.size`).toBeLessThanOrEqual(1)
            expect(['token-match', 'smartcrop'], `${r.id} 的 method`).toContain(str(p.method))
            if (p.method === 'token-match') expect(typeof p.score, `${r.id} 的 score`).toBe('number')
            else expect(p.score, `${r.id} 的 smartcrop score`).toBeUndefined()
          }
        }
      }
      if (r.type === 'npc') {
        expect(byId.get(str(r.data.statblock))?.type, `${r.id} 的 statblock`).toBe('monster')
        expect(['high', 'medium']).toContain(str(r.data.confidence))
      }
    }
    const typesByPack = new Map<string, Set<string>>()
    for (const r of l.rows) {
      const set = typesByPack.get(r.pack) ?? new Set<string>()
      set.add(r.type)
      typesByPack.set(r.pack, set)
    }
    // 核心 11 包允许原有类型；新包（D1.2b）只允许 monster/npc。这里只检查明确带 npc 的包。
    for (const [pack, types] of typesByPack) if (types.has('npc')) for (const t of types) expect(['monster', 'npc'], `${pack} 含 ${t}`).toContain(t)
  })
})
