import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import type { ConversionResult } from '../convert'
import type { Entry } from '../../../src/schemas/pack'
import { BOOK_NAMES } from '../config/books'
import { writeText } from '../lib/io'

interface Pick {
  entry: Entry
  fields: string
}

/** 抽检优先取玩家手册、城主指南、怪物图鉴等最容易对照的书；同一本书内按 id 排序，结果稳定。 */
const BOOK_RANK = ['PHB', 'DMG', 'MM', 'XGE', 'TCE', 'VGM', 'MTF', 'MPMM', 'SCAG', 'BMT']

function bookRank(entry: Entry): number {
  const book = (entry.data.src as { book?: string } | undefined)?.book ?? ''
  const index = BOOK_RANK.indexOf(book)
  return index < 0 ? BOOK_RANK.length : index
}

function allEntries(result: ConversionResult): Entry[] {
  return result.packs.flatMap((p) => p.entries).sort((a, b) => bookRank(a) - bookRank(b) || a.id.localeCompare(b.id))
}

function picker(entries: Entry[]) {
  const used = new Set<string>()
  const take = (predicate: (e: Entry) => boolean, fields: string): Pick | undefined => {
    const entry = entries.find((e) => !used.has(e.id) && predicate(e))
    if (!entry) return undefined
    used.add(entry.id)
    return { entry, fields }
  }
  return { take, used }
}

function pageOf(entry: Entry): string {
  const src = entry.data.src as { book?: string; page?: number } | undefined
  const book = src?.book ? BOOK_NAMES[src.book] ?? src.book : '—'
  return `${book} 第 ${src?.page ?? 0} 页`
}

export async function writeChecklist(root: string, result: ConversionResult): Promise<void> {
  const entries = allEntries(result)
  const rows: Pick[] = []
  const push = (pick: Pick | undefined) => {
    if (pick) rows.push(pick)
  }
  const { take } = picker(entries)

  for (const level of [0, 1, 3, 5, 7, 9]) push(take((e) => e.type === 'spell' && Number(e.data.level) === level, '环阶、学派、施法时间、距离、成分、持续时间'))
  push(take((e) => e.type === 'spell' && Array.isArray(e.data.save) && e.data.save.length > 0, '豁免属性、伤害骰、半伤'))
  push(take((e) => e.type === 'spell' && Boolean((e.data.duration as Array<{ concentration?: boolean }> | undefined)?.some((d) => d.concentration)), '专注、持续时间'))
  push(take((e) => e.type === 'spell' && e.data.ritual === true, '仪式标记、施法时间'))
  push(take((e) => e.type === 'spell' && typeof e.data.higherLevel === 'string' && e.data.higherLevel.length > 0, '升环文本、伤害增长'))
  while (rows.filter((r) => r.entry.type === 'spell').length < 10) push(take((e) => e.type === 'spell', '环阶、学派、施法时间、距离、持续时间、正文'))

  push(take((e) => e.type === 'monster' && Number(crOf(e)) <= 1, '体型、生物类型、AC、HP、CR、动作'))
  push(take((e) => e.type === 'monster' && Boolean(e.data.legendary), '传奇动作、传奇抗性、CR'))
  push(take((e) => e.type === 'monster' && Array.isArray(e.data.spellcasting) && (e.data.spellcasting as unknown[]).length > 0, '施法能力、DC、法术列表'))
  push(take((e) => e.type === 'monster' && e.unique, '具名生物、阵营、属性值、动作'))
  push(take((e) => e.type === 'monster' && Boolean((e.data.creatureType as { swarm?: boolean } | undefined)?.swarm), '群体标记、HP、动作'))
  push(take((e) => e.type === 'monster' && Number(crOf(e)) >= 15, '高 CR、AC、HP、传奇动作'))
  push(take((e) => e.type === 'monster' && Boolean((e.data.cr as { lair?: number } | undefined)?.lair), '巢穴 CR、动作'))
  push(take((e) => e.type === 'monster' && Boolean(e.data.saves), '豁免加值、技能、感官'))
  push(take((e) => e.type === 'monster' && Array.isArray(e.data.actions) && (e.data.actions as unknown[]).length > 1, '动作数量、攻击加值、伤害'))
  while (rows.filter((r) => r.entry.type === 'monster').length < 10) push(take((e) => e.type === 'monster', 'AC、HP、CR、属性值、动作'))

  push(take((e) => e.type === 'item' && e.data.category === 'weapon', '武器类别、伤害骰、伤害类型、属性'))
  push(take((e) => e.type === 'item' && e.data.category === 'armor', '护甲类别、AC、力量需求、隐匿劣势'))
  push(take((e) => e.type === 'item' && typeof e.data.baseItem === 'string', '基础物品、加值、稀有度'))
  push(take((e) => e.type === 'item' && Boolean((e.data.attunement as { required?: boolean } | undefined)?.required), '同调要求、同调对象'))
  push(take((e) => e.type === 'item' && Boolean(e.data.charges), '充能次数、恢复方式'))
  push(take((e) => e.type === 'item' && e.data.category === 'consumable', '消耗品、使用效果'))
  push(take((e) => e.type === 'item' && e.data.rarity === 'artifact', '神器、词条、同调'))
  push(take((e) => e.type === 'item' && e.data.category === 'wondrous', '奇物、稀有度、正文'))
  push(take((e) => e.type === 'item' && e.data.category === 'shield', '盾牌 AC、力量需求'))
  while (rows.filter((r) => r.entry.type === 'item').length < 10) push(take((e) => e.type === 'item', '类别、稀有度、重量、价值、正文'))

  push(take((e) => e.type === 'feature' && (e.data.owner as { type?: string } | undefined)?.type === 'class', '所属职业、等级、正文'))
  push(take((e) => e.type === 'feature' && (e.data.owner as { type?: string } | undefined)?.type === 'subclass', '所属子职业、等级、正文'))
  push(take((e) => e.type === 'feature' && Boolean(e.data.optional), '可选特性、选择池'))
  push(take((e) => e.type === 'feature' && Boolean(e.data.choices), '选择数量、候选池、等级'))
  push(take((e) => e.type === 'feature' && Number(e.data.level ?? 0) <= 3, '低等级特性、正文'))
  push(take((e) => e.type === 'feature' && Number(e.data.level ?? 0) >= 10, '高等级特性、数值成长'))

  push(take((e) => e.type === 'race' && Boolean(e.data.flexibleAbility), '可自选属性、体型、速度'))
  push(take((e) => e.type === 'subrace', '所属种族、属性加值、黑暗视觉'))
  push(take((e) => e.type === 'race' && typeof e.data.darkvision === 'number', '黑暗视觉、语言、特性'))
  push(take((e) => e.type === 'race' && (e.data.src as { book?: string } | undefined)?.book === 'PHB', '属性加值、速度、特性'))
  push(take((e) => e.type === 'race' || e.type === 'subrace', '体型、速度、属性加值、特性'))

  push(take((e) => e.type === 'background' && Array.isArray(e.data.characteristics) && (e.data.characteristics as unknown[]).length > 0, '技能熟练、装备、个性表'))
  push(take((e) => e.type === 'background' && typeof e.data.feature === 'string', '背景特性、技能熟练'))
  push(take((e) => e.type === 'background', '技能、工具、语言、装备'))

  push(take((e) => e.type === 'feat' && Boolean(e.data.requires), '前置条件、增益'))
  push(take((e) => e.type === 'feat', '增益、属性提升'))
  push(take((e) => e.type === 'feat', '正文、来源'))

  push(take((e) => e.type === 'table' && Array.isArray(e.data.cols) && (e.data.cols as unknown[]).length > 1, '骰子、多列表头、全部行'))
  push(take((e) => e.type === 'table' && Array.isArray(e.data.rows) && (e.data.rows as Array<{ then?: unknown }>).some((r) => r.then), '再掷一次、范围覆盖'))

  push(take((e) => e.type === 'condition' || e.type === 'rule', '效果、正文、来源'))
  const expected: Array<{ test: (e: Entry) => boolean; count: number }> = [
    { test: (e) => e.type === 'spell', count: 10 },
    { test: (e) => e.type === 'monster', count: 10 },
    { test: (e) => e.type === 'item', count: 10 },
    { test: (e) => e.type === 'feature', count: 6 },
    { test: (e) => e.type === 'race' || e.type === 'subrace', count: 5 },
    { test: (e) => e.type === 'background', count: 3 },
    { test: (e) => e.type === 'feat', count: 3 },
    { test: (e) => e.type === 'table', count: 2 },
    { test: (e) => e.type === 'condition' || e.type === 'rule', count: 1 },
  ]
  for (const group of expected) {
    while (rows.filter((r) => group.test(r.entry)).length < group.count) push(take(group.test, '正文、来源'))
  }
  if (rows.length !== 50) throw new Error(`抽检应有 50 条，实际 ${rows.length} 条`)

  // 保留已填写的「结果」：按 id 沿用上一版文件里的内容。
  const file = join(root, 'docs', 'probes', 'D1_抽检.md')
  const previous = new Map<string, string>()
  for (const line of (await readFile(file, 'utf-8').catch(() => '')).split('\n')) {
    const cells = line.split('|').map((c) => c.trim())
    const id = /^`(.+)`$/.exec(cells[3] ?? '')?.[1]
    if (id && cells[6]) previous.set(id, cells[6])
  }
  const header = ['# D1 抽检', '', '由构建生成。每条对照官方书核对「要核对的字段」，在「结果」一栏填写「一致」或具体差异。', '', '| # | 类型 | id | 书名与页码 | 要核对的字段 | 结果 |', '|---:|---|---|---|---|---|']
  const body = rows.map((row, index) => `| ${index + 1} | ${row.entry.type} | \`${row.entry.id}\` | ${pageOf(row.entry)} | ${row.fields} | ${previous.get(row.entry.id) ?? ''} |`)
  await writeText(file, [...header, ...body, ''].join('\n'))
}

function crOf(entry: Entry): number {
  const cr = entry.data.cr
  if (typeof cr === 'number') return cr
  if (cr && typeof cr === 'object') return Number((cr as { value?: number }).value ?? 0)
  return 0
}
