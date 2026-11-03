import { describe, expect, it } from 'vitest'
import { loadAllPacks } from './r11-pack-helpers'

/** D1.2b：新类型与 art/variant 字段的规则检查（不钉死条数；只看全部包）。 */
describe('D1.2b 怪物与 NPC 数据规则', () => {
  it('npc.statblock / variantOf 能解析；art 焦点合法；带 npc 的包只含 monster/npc', () => {
    const packs = loadAllPacks(true)
    const rows = packs.flatMap((p) => p.entries.map((e) => ({ e, pack: p.id })))
    const byId = new Map(rows.map((r) => [r.e.id, r.e]))
    for (const { e, pack } of rows) {
      const data = e.data as Record<string, unknown>
      if (e.type === 'monster') {
        const v = data.variantOf
        if (typeof v === 'string') {
          expect(byId.get(v)?.type, `${e.id} 的 variantOf`).toBe('monster')
          expect((data.variantDiff as unknown[] | undefined)?.length ?? 0, `${e.id} 的 variantDiff`).toBeGreaterThan(0)
        }
        const art = (data.art ?? {}) as Record<string, unknown>
        if (Object.keys(art).length) {
          expect(Boolean(art.portrait || art.token), `${e.id} 的 art`).toBe(true)
          const p = (art.portrait ?? {}) as Record<string, unknown>
          if (Object.keys(p).length) {
            const f = (p.focus ?? {}) as Record<string, unknown>
            for (const k of ['x', 'y', 'size']) expect(Number(f[k]), `${e.id} 的 focus.${k}`).toBeGreaterThanOrEqual(0)
            expect(Number(f.size), `${e.id} 的 focus.size`).toBeGreaterThan(0)
            expect(Number(f.size), `${e.id} 的 focus.size`).toBeLessThanOrEqual(1)
            expect(['token-match', 'smartcrop'], `${e.id} 的 method`).toContain(p.method)
            if (p.method === 'token-match') expect(typeof p.score, `${e.id} 的 score`).toBe('number')
            else expect(p.score, `${e.id} 的 smartcrop score`).toBeUndefined()
          }
        }
      }
      if (e.type === 'npc') {
        expect(byId.get(String(data.statblock))?.type, `${e.id} 的 statblock`).toBe('monster')
        expect(['high', 'medium']).toContain(data.confidence)
      }
      if (pack.startsWith('dnd5e2014-') && pack !== 'dnd5e2014-srd' && packs.find((p) => p.id === pack)?.entries.some((x) => x.type === 'npc')) {
        for (const t of new Set(packs.find((p) => p.id === pack)!.entries.map((x) => x.type))) expect(['monster', 'npc'], `${pack} 含 ${t}`).toContain(t)
      }
    }
  })
})

import { readFileSync } from 'node:fs'
import { unzipSync, strFromU8 } from 'fflate'
import { packPath } from './r11-pack-helpers'

describe('D1.2b 结构引用依赖', () => {
  it('每个包的 variantOf / npc.statblock 目标包都在传递依赖里', () => {
    const packs = loadAllPacks(true)
    const packOf = new Map<string, string>()
    for (const p of packs) for (const e of p.entries) packOf.set(e.id, p.id)
    const req = new Map<string, string[]>()
    for (const p of packs) {
      const files = unzipSync(new Uint8Array(readFileSync(packPath(p.id))))
      const mf = JSON.parse(strFromU8(files['trpg-manifest.json'])) as { pack: { relationships?: { requires?: Array<{ id: string }> } } }
      req.set(p.id, (mf.pack.relationships?.requires ?? []).map((r) => r.id))
    }
    const allowed = (id: string): Set<string> => {
      const out = new Set([id, 'dnd5e2014-srd'])
      const visit = (x: string): void => { for (const d of req.get(x) ?? []) if (!out.has(d)) { out.add(d); visit(d) } }
      visit(id)
      return out
    }
    for (const p of packs) {
      const deps = allowed(p.id)
      for (const e of p.entries) {
        for (const field of ['variantOf', 'statblock'] as const) {
          const target = (e.data as Record<string, unknown>)[field]
          if (typeof target !== 'string') continue
          const targetPack = packOf.get(target)
          expect(targetPack, `${e.id}.${field} 目标不存在`).toBeTruthy()
          expect(deps.has(targetPack!), `${e.id}.${field} -> ${targetPack} 不在 ${p.id} 依赖里`).toBe(true)
        }
      }
    }
  })
})
