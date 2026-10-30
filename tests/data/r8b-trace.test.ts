import { existsSync } from 'node:fs'
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { unzipSync, strFromU8 } from 'fflate'
import type { Entry } from '../../src/schemas/pack'
import { BOOKS, SRD_PACK_ID } from '../../tools/data/config/books'
import { FIELD_COVERAGE } from '../../tools/data/config/fieldCoverage'
import { TAG_TARGET_EXCEPTIONS } from '../../tools/data/config/tagTargets'

const ROOT = process.cwd()
const DATA_REPO = process.env.TRPG_DATA_REPO ?? '/Users/xxx/tavern-trpg-data'
const fileOf = (id: string): string => id === SRD_PACK_ID ? join(ROOT, 'packs', `${SRD_PACK_ID}.trpgpack`) : join(DATA_REPO, 'packs', 'dnd5e2014', `${id}-${BOOKS.find((b) => b.packId === id)!.version}.trpgpack`)
async function allEntries(): Promise<Map<string, Entry>> {
  const out = new Map<string, Entry>()
  for (const b of [{ id: SRD_PACK_ID }, ...BOOKS.map((x) => ({ id: x.packId }))]) {
    const file = fileOf(b.id)
    if (!existsSync(file)) throw new Error(`缺少 ${file}`)
    const zip = unzipSync(new Uint8Array(await readFile(file)))
    for (const [name, data] of Object.entries(zip)) if (name.startsWith('entries/')) for (const e of JSON.parse(strFromU8(data)) as Entry[]) out.set(e.id, e)
  }
  return out
}
function valuesAt(value: unknown, path: string): unknown[] {
  const parts = path.split('.')
  let current = [value]
  for (const part of parts) {
    const array = part.endsWith('[]')
    const key = array ? part.slice(0, -2) : part
    current = current.flatMap((item) => {
      if (!item || typeof item !== 'object') return []
      const child = (item as Record<string, unknown>)[key]
      if (child === undefined) return []
      return array && Array.isArray(child) ? child : [child]
    })
  }
  return current
}
const shown = (value: unknown): string => typeof value === 'string' ? value : JSON.stringify(value)

describe('R8b-A 去向抽查', () => {
  const rows: Array<[string, string, string, string]> = [
    ['monster.dex', 'monster.adult-red-dragon.mm', 'data.abilities.dex', '10'],
    ['item-group.entries', 'item.armor-of-resistance-family.dmg', 'data.text', 'd10'],
    ['monster.variant', 'monster.living-portent.bmt', 'data.variants', '活体星辰之碎片'],
    ['base-item.ac', 'item.breastplate-barding.phb', 'data.armor.ac', '14'],
    ['base-item.dmg1', 'item.battleaxe.phb', 'data.weapon.damage[].dice', '1d8'],
    ['base-item.dmg2', 'item.battleaxe.phb', 'data.weapon.versatile', '1d10'],
    ['base-item.packContents[].quantity', 'item.arrows-20.phb', 'data.contents[].qty', '20'],
    ['base-item.rarity', 'item.alchemists-supplies.phb', 'data.rarity', 'none'],
    ['base-item.value', 'item.alchemists-supplies.phb', 'data.value', '5000'],
    ['base-item.weight', 'item.alchemists-supplies.phb', 'data.weight', '8'],
    ['item.ac', 'item.animated-shield.dmg', 'data.armor.ac', '2'],
    ['item.ability.static.str', 'item.belt-of-cloud-giant-strength.dmg', 'data.effects[].value', '27'],
    ['item.activities[].activation.type', 'item.plus-1-rhythm-makers-drum.tce', 'data.activities[].activation.type', 'action'],
    ['item.activities[].name', 'item.plus-1-rhythm-makers-drum.tce', 'data.activities[].name', '恢复吟游诗人激励'],
    ['item.bonusAc', 'item.arrow-catching-shield.dmg', 'data.bonuses.ac', '+2'],
    ['item.bonusSavingThrow', 'item.cloak-of-protection.dmg', 'data.bonuses.save', '+1'],
    ['item.immune', 'item.axe-of-the-dwarvish-lords.dmg', 'data.effects[].damage[]', 'poison'],
    ['item.resist', 'item.acid-absorbing-tattoo.tce', 'data.effects[].damage[]', 'acid'],
    ['item.strength', 'item.armor-of-invulnerability.dmg', 'data.armor.strReq', '15'],
    ['item.weaponCategory', 'item.plus-1-moon-sickle.tce', 'data.weapon.category', 'simple'],
    ['item-group.charges', 'item.ring-of-elemental-command-family.dmg', 'data.charges.max', '5'],
    ['item-group.lootTables', 'item.crystal-ball-legendary-version-family.dmg', 'data.lootTables[]', '魔法物品表I'],
    ['item-group.property', 'item.sword-of-answering-answerer.dmg', 'data.properties[]', 'V'],
    ['item-group.rarity', 'item.absorbing-tattoo-family.tce', 'data.rarity', 'very rare'],
  ]

  it('S 只剩允许的 data.tags 路径', () => {
    const tags = Object.entries(FIELD_COVERAGE).filter(([, e]) => e.to === 'data.tags')
    expect(tags).toHaveLength(25)
    for (const [path] of tags) {
      const last = path.split('.').pop()?.replace(/\[\]$/, '') ?? ''
      expect(/tags$/i.test(last) || last === 'environment' || !!TAG_TARGET_EXCEPTIONS[path], path).toBe(true)
    }
  })

  it('来源路径 → 样本条目 → 输出路径 → 值', async () => {
    const all = await allEntries()
    for (const [source, id, path, expected] of rows) {
      const entry = all.get(id)
      expect(entry, `${source} 缺少样本 ${id}`).toBeDefined()
      const values = valuesAt(entry!.data, path.replace(/^data\./, ''))
      expect(values.map(shown).join('\n'), `${source} → ${path}`).toContain(expected)
    }
  })
})
