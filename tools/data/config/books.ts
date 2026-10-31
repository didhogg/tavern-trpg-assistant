import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { sha256Hex } from '../../../src/core/hash'
import { REPO_ROOT } from '../lib/io'
import { BOOK_POLICY, PACK_VERSION } from './bookPolicy'

export interface BookConfig {
  source: string
  packId: string
  name: string
  nameEn: string
  group: string
  tier: 1 | 2 | 3
  version: string
  recommended: boolean
  /** 除条目引用推出的依赖之外，要求先装的书（来源代号）；见 bookPolicy.ts。 */
  requires: string[]
  /** 依赖层级，SRD 为 0。 */
  layer: number
}

export const SRD_PACK_ID = 'dnd5e2014-srd'
export const SRD_VERSION = PACK_VERSION

const TIER_GROUP = { 1: '官方扩展 · 一档', 2: '官方扩展 · 二档', 3: '设定与扩展书 · 三档' } as const

interface BooksJsonEntry { source: string; name: string; ENG_name?: string; published?: string }
const booksJson = (): Map<string, BooksJsonEntry> => {
  const file = join(REPO_ROOT, 'reference', '5etools-cn-main（数据库）', process.env.TRPG_DATA_DIR ?? 'data', 'books.json')
  const list = (JSON.parse(readFileSync(file, 'utf8')) as { book: BooksJsonEntry[] }).book
  return new Map(list.map((b) => [b.source, b]))
}

/** 2024 规则版及之后出版的书（来源代号）：不收录，也不允许出现在展示文字里。 */
export const RETIRED_SOURCES = new Set([...booksJson().values()].filter((b) => (b.published ?? '') >= '2024-09-17').map((b) => b.source))

/** 包编号：dnd5e2014-<来源代号小写，去掉连字符>。现有 11 个包的编号不变。 */
export const packIdOf = (source: string): string => `dnd5e2014-${source.toLowerCase().replace(/-/g, '')}`

/** 由政策表 + 来源的 books.json 生成；导出的名字与形状不变，所有引用点照旧。 */
function buildBooks(): BookConfig[] {
  const json = booksJson()
  return [...BOOK_POLICY].sort((a, b) => a.order - b.order).map((p) => {
    const src = json.get(p.source)
    if (!src) throw new Error(`政策表里的 ${p.source} 不在 books.json 里`)
    return { source: p.source, packId: packIdOf(p.source), name: p.name ?? src.name, nameEn: p.nameEn ?? src.ENG_name ?? src.name, group: TIER_GROUP[p.tier], tier: p.tier, version: PACK_VERSION, recommended: p.recommended, requires: p.requires ?? [], layer: p.order }
  })
}

export const BOOKS: BookConfig[] = buildBooks()

export const BOOK_BY_SOURCE = new Map(BOOKS.map((b) => [b.source, b]))
export const BOOK_SOURCES = new Set(BOOKS.map((b) => b.source))
export const PACK_BY_SOURCE = new Map(BOOKS.map((b) => [b.source, b.packId]))

/** 来源代号 → 书名（去掉「（2014）」这类括号后缀）。 */
export const BOOK_NAMES: Record<string, string> = Object.fromEntries(BOOKS.map((b) => [b.source, b.name.replace(/（[^）]*）$/, '')]))

/** 固定 lineage：同一包的所有版本共用，构建可重现。 */
export function lineageFor(packId: string): string {
  const hex = sha256Hex(new TextEncoder().encode(`tavern-trpg-data:${packId}`)).slice(0, 32).split('')
  hex[12] = '4'
  hex[16] = '8'
  const s = hex.join('')
  return `${s.slice(0, 8)}-${s.slice(8, 12)}-${s.slice(12, 16)}-${s.slice(16, 20)}-${s.slice(20, 32)}`
}

export const CLASS_NAMES: Record<string, string> = {
  野蛮人: 'barbarian',
  吟游诗人: 'bard',
  牧师: 'cleric',
  德鲁伊: 'druid',
  战士: 'fighter',
  武僧: 'monk',
  圣武士: 'paladin',
  游侠: 'ranger',
  游荡者: 'rogue',
  术士: 'sorcerer',
  魔契师: 'warlock',
  法师: 'wizard',
  奇械师: 'artificer',
}

export const CLASS_PRIMARY: Record<string, string[]> = {
  barbarian: ['str'],
  bard: ['cha'],
  cleric: ['wis'],
  druid: ['wis'],
  fighter: ['str'],
  monk: ['dex', 'wis'],
  paladin: ['str', 'cha'],
  ranger: ['dex', 'wis'],
  rogue: ['dex'],
  sorcerer: ['cha'],
  warlock: ['cha'],
  wizard: ['int'],
  artificer: ['int'],
}

