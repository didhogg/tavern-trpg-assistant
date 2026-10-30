import { existsSync } from 'node:fs'
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { unzipSync, strFromU8 } from 'fflate'
import { describe, expect, it } from 'vitest'
import { BOOKS, SRD_PACK_ID } from '../../tools/data/config/books'
import { scanSourceRecords } from '../../tools/data/report/fieldPaths'
import type { Entry } from '../../src/schemas/pack'

const ROOT = process.cwd()
async function packs(): Promise<Map<string, Entry>> {
  const out = new Map<string, Entry>()
  for (const id of [SRD_PACK_ID, ...BOOKS.map((x) => x.packId)]) {
    const file = id === SRD_PACK_ID ? join(ROOT, 'packs', `${SRD_PACK_ID}.trpgpack`) : join(ROOT, '..', 'tavern-trpg-data', 'packs', 'dnd5e2014', `${id}-${BOOKS.find((x) => x.packId === id)!.version}.trpgpack`)
    if (!existsSync(file)) throw new Error(`缺少 ${file}`)
    for (const [name, data] of Object.entries(unzipSync(new Uint8Array(await readFile(file))))) if (name.startsWith('entries/')) for (const e of JSON.parse(strFromU8(data)) as Entry[]) out.set(e.id, e)
  }
  return out
}
type Named = { name: string }
const data = (e: Entry | undefined): Record<string, unknown> => (e?.data ?? {}) as Record<string, unknown>
const names = (list: unknown): string[] => (Array.isArray(list) ? (list as Named[]).map((x) => x.name) : [])

describe('R7b 怪物特性与传奇动作', () => {
  it('金样：特性与传奇动作都送达', async () => {
    const all = await packs()
    expect(names(data(all.get('monster.aarakocra.mm')).traits)).toEqual(['俯冲攻击'])
    const dragon = data(all.get('monster.adult-red-dragon.mm'))
    expect(names(dragon.traits)).toEqual(['传奇抗性 (3/日)'])
    expect((dragon.legendary as { count: number; actions: Named[] }).count).toBe(3)
    expect(names((dragon.legendary as { actions: unknown }).actions)).toEqual(['侦查', '尾击攻击', '振翅攻击（花费2个动作）'])
    expect(names(data(all.get('monster.lich.mm')).traits)).toHaveLength(3)
    expect(names((data(all.get('monster.lich.mm')).legendary as { actions: unknown }).actions)).toHaveLength(4)
    expect(names((data(all.get('monster.mummy-lord.mm')).legendary as { actions: unknown }).actions)).toHaveLength(5)
  })

  it('守卫：核心来源有 trait/legendary 的怪物，输出条数一致', async () => {
    const all = await packs()
    const byKey = new Map<string, Entry[]>()
    for (const e of all.values()) {
      if (e.type !== 'monster') continue
      const key = `${e.nameEn}|${(data(e).src as { book: string }).book}`
      byKey.set(key, [...(byKey.get(key) ?? []), e])
    }
    const bad: string[] = []
    let checked = 0
    for (const r of (await scanSourceRecords()).records) {
      if (r.type !== 'monster' || r.scope !== 'core') continue
      const v = r.value as Record<string, unknown>
      const out = byKey.get(`${String(v.ENG_name)}|${String(v.source)}`)
      if (!out || out.length !== 1) continue
      checked++
      const d = data(out[0])
      if (Array.isArray(v.trait) && v.trait.length !== names(d.traits).length) bad.push(`${out[0].id} traits ${v.trait.length} → ${names(d.traits).length}`)
      if (Array.isArray(v.legendary) && v.legendary.length) {
        const leg = d.legendary as { count: number; actions: unknown[] } | undefined
        if (!leg || leg.actions.length !== v.legendary.length) bad.push(`${out[0].id} legendary ${v.legendary.length} → ${leg?.actions.length}`)
        else if (leg.count !== Number(v.legendaryActions ?? 3)) bad.push(`${out[0].id} count ${leg.count}`)
      }
    }
    expect(checked).toBeGreaterThan(700)
    expect(bad.join('\n')).toBe('')
  })

  it('种族特性仍是条目 id 列表，不受怪物修复影响', async () => {
    const all = await packs()
    const races = [...all.values()].filter((e) => e.type === 'race')
    expect(races.length).toBeGreaterThan(20)
    for (const race of races) {
      const traits = data(race).traits
      if (!Array.isArray(traits)) continue
      for (const id of traits) expect(typeof id === 'string' && all.has(id), `${race.id} -> ${String(id)}`).toBe(true)
    }
  })

  it('R7b 候选：护甲等级、射程、排除条件、变体效果、法术字段、生命值每级', async () => {
    const all = await packs()
    const d = (id: string): Record<string, unknown> => data(all.get(id))
    expect(d('monster.archmage.mm').ac).toContainEqual({ value: 15, condition: '法师护甲时', braces: true })
    expect(d('monster.ambitious-assassin.bmt').ac).toContainEqual({ value: 16, from: '镶钉皮甲' })
    expect(JSON.stringify([d('monster.archmage.mm').resist, d('monster.elemental-spirit.tce').resist, d('monster.elemental-spirit.tce').immune])).not.toMatch(/（（|））/)
    expect((d('item.longbow.phb').weapon as { range: unknown }).range).toEqual({ normal: 150, long: 600 })
    expect((d('item.adamantine-weapon.xge').variantTemplate as { excludes: unknown }).excludes).toEqual({ net: true })
    expect(d('item.battleaxe-berserker-axe.dmg').effects).toEqual([{ kind: 'hpMax', perLevel: 1, transfer: true }])
    expect(d('spell.antagonize.bmt').damageInflict).toEqual(['psychic'])
    expect(d('spell.antagonize.bmt').tags).toEqual(['SGT'])
    expect(d('spell.freedom-of-movement.phb').conditionImmune).toEqual(['paralyzed', 'restrained'])
    expect(d('feat.tough.phb').effects).toEqual([{ kind: 'hpMax', perLevel: 2, transfer: true }])
  })
})
