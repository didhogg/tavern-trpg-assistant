import { sha256Hex } from '../../../src/core/hash'

export interface BookConfig {
  source: string
  packId: string
  name: string
  nameEn: string
  group: string
  tier: 1 | 2
  version: string
  recommended: boolean
  /** 书本身依赖的包（SRD 由构建自动加入）。 */
  requiresBooks: string[]
  /** 依赖层级，SRD 为 0。 */
  layer: number
}

export const SRD_PACK_ID = 'dnd5e2014-srd'
export const SRD_VERSION = '1.1.0'

export const BOOKS: BookConfig[] = [
  { source: 'PHB', packId: 'dnd5e2014-phb', name: '玩家手册（2014）', nameEn: "Player's Handbook", group: '官方扩展 · 一档', tier: 1, version: '1.1.0', recommended: true, requiresBooks: [] , layer: 1 },
  { source: 'SCAG', packId: 'dnd5e2014-scag', name: '剑湾冒险者指南', nameEn: "Sword Coast Adventurer's Guide", group: '官方扩展 · 一档', tier: 1, version: '1.1.0', recommended: true, requiresBooks: ['PHB'] , layer: 2 },
  { source: 'DMG', packId: 'dnd5e2014-dmg', name: '城主指南（2014）', nameEn: "Dungeon Master's Guide", group: '官方扩展 · 一档', tier: 1, version: '1.1.0', recommended: true, requiresBooks: ['PHB', 'SCAG'] , layer: 3 },
  { source: 'MM', packId: 'dnd5e2014-mm', name: '怪物图鉴（2014）', nameEn: 'Monster Manual', group: '官方扩展 · 一档', tier: 1, version: '1.1.0', recommended: true, requiresBooks: ['DMG', 'SCAG'] , layer: 4 },
  { source: 'XGE', packId: 'dnd5e2014-xge', name: '珊娜萨的万事指南', nameEn: "Xanathar's Guide to Everything", group: '官方扩展 · 一档', tier: 1, version: '1.1.0', recommended: true, requiresBooks: ['PHB', 'DMG', 'SCAG'] , layer: 5 },
  { source: 'TCE', packId: 'dnd5e2014-tce', name: '塔莎的万事坩埚', nameEn: "Tasha's Cauldron of Everything", group: '官方扩展 · 一档', tier: 1, version: '1.1.0', recommended: true, requiresBooks: ['PHB'] , layer: 6 },
  { source: 'VGM', packId: 'dnd5e2014-vgm', name: '瓦罗怪物指南', nameEn: "Volo's Guide to Monsters", group: '官方扩展 · 二档', tier: 2, version: '1.1.0', recommended: true, requiresBooks: ['PHB'] , layer: 7 },
  { source: 'MTF', packId: 'dnd5e2014-mtf', name: '魔邓肯的众敌卷册', nameEn: "Mordenkainen's Tome of Foes", group: '官方扩展 · 二档', tier: 2, version: '1.1.0', recommended: true, requiresBooks: ['PHB'] , layer: 8 },
  { source: 'MPMM', packId: 'dnd5e2014-mpmm', name: '魔邓肯巨献：多元宇宙的怪物', nameEn: 'Mordenkainen Presents: Monsters of the Multiverse', group: '官方扩展 · 二档', tier: 2, version: '1.1.0', recommended: true, requiresBooks: ['PHB'] , layer: 9 },
  { source: 'BMT', packId: 'dnd5e2014-bmt', name: '万象无常书', nameEn: 'The Book of Many Things', group: '官方扩展 · 二档', tier: 2, version: '1.1.0', recommended: true, requiresBooks: ['DMG', 'SCAG'] , layer: 10 },
]

export const BOOK_BY_SOURCE = new Map(BOOKS.map((b) => [b.source, b]))
export const BOOK_SOURCES = new Set(BOOKS.map((b) => b.source))
export const PACK_BY_SOURCE = new Map(BOOKS.map((b) => [b.source, b.packId]))

export const BOOK_NAMES: Record<string, string> = {
  PHB: '玩家手册',
  DMG: '城主指南',
  MM: '怪物图鉴',
  XGE: '珊娜萨的万事指南',
  TCE: '塔莎的万事坩埚',
  SCAG: '剑湾冒险者指南',
  VGM: '瓦罗怪物指南',
  MTF: '魔邓肯的众敌卷册',
  MPMM: '魔邓肯巨献：多元宇宙的怪物',
  BMT: '万象无常书',
}

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

