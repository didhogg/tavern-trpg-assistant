import { readFileSync } from 'node:fs'
import { unzipSync, strFromU8 } from 'fflate'
import { describe, expect, it } from 'vitest'
import { SRD_PACK_ID } from '../../tools/data/config/books'
import { monsterDataSchema } from '../../src/rules/dnd5e2014/data/entries/spell-monster'
import { loadAllPacks, packPath } from './r9-pack-helpers'

describe('任务一：怪物 inventory 与包依赖', () => {
  const packs = loadAllPacks(true)
  const all = packs.flatMap((p) => p.entries)
  const owner = new Map(all.map((e) => [e.id, packs.find((p) => p.entries.includes(e))!.id]))
  const manifestRequires = new Map<string, string[]>()
  for (const p of packs) {
    const raw = unzipSync(new Uint8Array(readFileSync(packPath(p.id))))['trpg-manifest.json']
    const manifest = JSON.parse(strFromU8(raw)) as { pack?: { relationships?: { requires?: Array<{ id?: string }> } } }
    manifestRequires.set(p.id, (manifest.pack?.relationships?.requires ?? []).map((r) => r.id).filter((x): x is string => !!x))
  }
  // 依赖由构建推导，测试只校验「背包引用的包没有越过构建后的依赖闭包」。
  const reach = new Map<string, Set<string>>()
  for (const p of packs) {
    const set = new Set<string>([p.id, SRD_PACK_ID])
    const visit = (id: string): void => { for (const d of manifestRequires.get(id) ?? []) if (!set.has(d)) { set.add(d); visit(d) } }
    visit(p.id)
    reach.set(p.id, set)
  }

  it('全部怪物 inventory 都是合法结构；ref 指向物品，name-only 不重复', () => {
    let monsters = 0
    let refs = 0
    let names = 0
    for (const entry of all) {
      if (entry.type !== 'monster') continue
      const parsed = monsterDataSchema.safeParse(entry.data)
      expect(parsed.success, entry.id).toBe(true)
      const inventory = (entry.data as { inventory?: Array<{ ref?: string; name?: string }> }).inventory ?? []
      if (inventory.length) monsters++
      const seen = new Set<string>()
      for (const item of inventory) {
        expect(Boolean(item.ref) !== Boolean(item.name), `${entry.id}：ref/name 二选一`).toBe(true)
        if (item.ref) {
          refs++
          expect(owner.get(item.ref), `${entry.id} 的 ${item.ref} 不存在`).toBeDefined()
          expect(owner.get(item.ref), `${entry.id} 的 ${item.ref} 不是物品所在包`).toBeTruthy()
          expect(reach.get(owner.get(entry.id)!)!.has(owner.get(item.ref)!), `${entry.id} 的 ${item.ref} 越过依赖`).toBe(true)
          expect(seen.has(item.ref), `${entry.id} 的 ${item.ref} 重复`).toBe(false)
          seen.add(item.ref)
        } else names++
      }
    }
    expect(monsters).toBe(1670)
    expect(refs).toBe(3089)
    expect(names).toBe(17)
  })

  it('第 2 条第 4 项补上的纯文字护甲名：WDMM 的佐拉克与 MGELFT 的丹克伍德矮人', () => {
    for (const id of ['monster.zorak-lightdrinker.wdmm', 'monster.dankwood-duergar.mgelft']) {
      const entry = all.find((e) => e.id === id)
      expect(entry, id).toBeDefined()
      expect((entry!.data as { ac: Array<{ items?: string[] }> }).ac[0].items).toEqual(['item.plate-armor.phb'])
    }
  })

  it('inventory 的引用不会让原有包依赖变宽', () => {
    for (const p of packs) {
      const id = p.id
      const closure = reach.get(id)!
      for (const entry of p.entries) {
        const inv = (entry.data as { inventory?: Array<{ ref?: string }> }).inventory ?? []
        for (const item of inv) if (item.ref) expect(closure.has(owner.get(item.ref)!), `${id}/${entry.id} → ${item.ref}`).toBe(true)
      }
    }
  })
})
