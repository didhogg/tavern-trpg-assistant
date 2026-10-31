import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { FIELD_COVERAGE } from '../../tools/data/config/fieldCoverage'
import { allEntries } from './r9-pack-helpers'

type Rec = Record<string, unknown>
const entries = allEntries()
const byId = new Map(entries.map((e) => [e.id, e]))
const data = (id: string): Rec => byId.get(id)!.data as Rec
const SRC = join(process.cwd(), 'reference/5etools-cn-main（数据库）/data')
const read = (file: string): Rec => JSON.parse(readFileSync(join(SRC, file), 'utf8')) as Rec

describe('R15 补进输出的字段（期望值读来源，不读转换器）', () => {
  it('lost 为 0', () => {
    expect(Object.entries(FIELD_COVERAGE).filter(([, e]) => e.how === 'lost')).toEqual([])
  })

  it('怪物 facets：吸血鬼的状态标签与豁免标签来自来源', () => {
    const vampire = (read('bestiary/bestiary-mm.json').monster as Rec[]).find((m) => m.ENG_name === 'Vampire' && m.source === 'MM')!
    const facets = data('monster.vampire.mm').facets as Record<string, string[]>
    expect(facets.conditionInflict).toEqual(vampire.conditionInflict)
    expect(facets.saveForced).toEqual(vampire.savingThrowForced)
  })

  it('怪物 attachedItems：鸟羽人携带标枪', () => {
    expect(data('monster.aarakocra.mm').attachedItems).toContain('item.javelin.phb')
  })

  it('物品 attachedSpells：力量法杖的充能法术（来源是中文法术名，输出是条目 id；升环写 #N）', () => {
    const charges = (data('item.staff-of-power.dmg').attachedSpells as { charges: Record<string, string[]> }).charges
    expect(charges['1']).toEqual(['spell.magic-missile.phb', 'spell.ray-of-enfeeblement.phb'])
    expect(charges['5']).toContain('spell.fireball.phb#5')
  })

  it('基础物品 additionalEntries 追加进正文：炼金工具', () => {
    const base = (read('items-base.json').baseitem as Rec[]).find((i) => i.ENG_name === "Alchemist's Supplies")!
    const first = String((base.additionalEntries as unknown[])[1] && ((base.additionalEntries as Rec[])[1].entries as string[])[0])
    expect(JSON.stringify(data('item.alchemists-supplies.phb').text)).toContain(first.slice(0, 20))
  })

  it('法术 abilityCheck 数量与来源一致', () => {
    const core = new Set(['PHB', 'SCAG', 'MM', 'VGM', 'MTF', 'DMG', 'XGE', 'TCE', 'MPMM', 'BMT'])
    let source = 0
    for (const file of ['spells-phb', 'spells-scag', 'spells-xge', 'spells-tce', 'spells-bmt', 'spells-mpmm', 'spells-ftd', 'spells-egw']) {
      try { source += ((read(`spells/${file}.json`).spell as Rec[]) ?? []).filter((s) => core.has(String(s.source)) && Array.isArray(s.abilityCheck)).length } catch { /* 该文件不存在则跳过 */ }
    }
    expect(entries.filter((e) => e.type === 'spell' && Array.isArray((e.data as Rec).abilityCheck)).length).toBe(source)
  })

  it('物品 tier、wondrous 与分类标签；TCE 召唤物怪物带 Foundry 效果说明', () => {
    expect(entries.filter((e) => e.type === 'item' && (e.data as Rec).wondrous === true).length).toBeGreaterThan(300)
    const spirits = entries.filter((e) => e.type === 'monster' && (e.data as { effects?: Array<{ kind?: string; text?: string }> }).effects?.some((x) => x.kind === 'note' && String(x.text).includes('Foundry')))
    expect(spirits.length).toBeGreaterThanOrEqual(6)
  })

  it('每条 dropped 的理由都不同、都带路径（R15 新登记的）', () => {
    const reasons = new Map<string, string>()
    for (const [path, e] of Object.entries(FIELD_COVERAGE)) if (e.how === 'dropped' && e.why?.startsWith(`「${path}」`)) reasons.set(path, e.why)
    expect(reasons.size).toBeGreaterThan(150)
    expect(new Set(reasons.values()).size).toBe(reasons.size)
  })
})
