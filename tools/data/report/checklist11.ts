import { join } from 'node:path'
import type { ConversionResult } from '../convert'
import type { Entry } from '../../../src/schemas/pack'
import { BOOK_NAMES } from '../config/books'
import { writeText } from '../lib/io'

interface Row { id: string; type: string; page: string; fields: string }

function pageOf(e: Entry): string {
  const src = e.data.src as { book?: string; page?: number } | undefined
  return `${BOOK_NAMES[src?.book ?? ''] ?? src?.book ?? '—'} 第 ${src?.page ?? 0} 页`
}

export async function writeChecklist11(root: string, result: ConversionResult): Promise<void> {
  const entries = result.packs.flatMap((p) => p.entries)
  const rows: Row[] = []
  const add = (e: Entry | undefined, fields: string) => { if (e) rows.push({ id: e.id, type: e.type, page: pageOf(e), fields }) }
  const byId = new Map(entries.map((e) => [e.id, e]))

  for (const e of entries.filter((x) => x.type === 'class' && x.data.spellcasting)) {
    const levels = [1, 5, 9, 13, 17, 20]
    for (const level of levels) add(e, `第 ${level} 级：法术位（slotsByLevel）`)
  }
  for (const id of ['subclass.fighter-eldritch-knight.phb', 'subclass.rogue-arcane-trickster.phb']) {
    const e = byId.get(id)
    for (const level of [3, 7, 13, 19]) add(e, `第 ${level} 级：法术位`)
  }
  for (const id of ['class.barbarian.phb', 'class.monk.phb', 'class.rogue.phb', 'class.sorcerer.phb', 'class.bard.phb']) {
    const e = byId.get(id)
    for (const level of [3, 9, 17]) add(e, `第 ${level} 级：职业资源值（scaleValue）`)
  }
  for (const e of entries.filter((x) => (x.type === 'race' || x.type === 'subrace') && (x.data.src as { book?: string } | undefined)?.book === 'PHB')) add(e, '属性加值、速度、感官、抗性、熟练、语言')
  for (const e of entries.filter((x) => x.type === 'background' && (x.data.src as { book?: string } | undefined)?.book === 'PHB')) add(e, '技能/工具/语言熟练、起始装备、背景特性')
  for (const e of entries.filter((x) => x.type === 'feat' && (x.data.src as { book?: string } | undefined)?.book === 'PHB')) add(e, '前置条件、属性提升、效果、赠送法术')
  for (const e of entries.filter((x) => x.type === 'condition')) add(e, '状态效果（effects）')
  for (let level = 1; level <= 6; level++) add(byId.get('condition.exhaustion.phb'), `力竭第 ${level} 级 effects`)
  for (const e of entries.filter((x) => x.type === 'item' && (x.data.category === 'armor' || x.data.category === 'shield'))) add(e, '护甲类别、AC、敏捷上限、力量要求、隐匿劣势')
  for (const id of ['item.ring-of-protection.dmg', 'item.gauntlets-of-ogre-power.dmg', 'item.boots-of-speed.dmg', 'item.potion-of-healing.dmg', 'item.cloak-of-protection.dmg', 'item.bag-of-holding.dmg', 'item.wand-of-magic-missiles.dmg', 'item.broom-of-flying.dmg', 'item.cape-of-the-mountebank.dmg', 'item.amulet-of-health.dmg']) add(byId.get(id), '稀有度、同调、被动效果/行动')
  for (const id of ['spell.fireball.phb', 'spell.magic-missile.phb', 'spell.cure-wounds.phb', 'spell.ray-of-sickness.phb', 'spell.scorching-ray.phb', 'spell.charm-person.phb', 'spell.expeditious-retreat.phb', 'spell.fire-bolt.phb', 'spell.healing-word.phb', 'spell.lightning-bolt.phb', 'spell.hold-person.phb', 'spell.bless.phb', 'spell.sleep.phb', 'spell.dispel-magic.phb', 'spell.guidance.phb', 'spell.eldritch-blast.phb', 'spell.acid-splash.phb', 'spell.mass-cure-wounds.phb', 'spell.burning-hands.phb', 'spell.thunderwave.phb']) add(byId.get(id), '职业列表、攻击/豁免/伤害/治疗、升环缩放')

  const header = ['# D1.1 人工抽检', '', '由构建生成。每条对照官方书核对「要核对的字段」，在「结果」一栏填写「一致」或具体差异。', '', '| # | 类型 | id | 书名与页码 | 要核对的字段 | 结果 |', '|---:|---|---|---|---|---|']
  const body = rows.map((row, i) => `| ${i + 1} | ${row.type} | \`${row.id}\` | ${row.page} | ${row.fields} |  |`)
  await writeText(join(root, 'docs', 'probes', 'D1.1_抽检.md'), [...header, ...body, ''].join('\n'))
}
