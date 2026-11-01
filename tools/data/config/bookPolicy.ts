/**
 * 书目政策表：一本书一行。书名默认取 5etools 的 books.json；只有和 books.json 不同的才写覆盖名。
 * 加一本书 = 在这里加一行（再按需要登记 requires）；包编号、层级（order）、分组都由这一行推出，没有别的地方要改。
 *
 * - tier：1、2 为官方扩展（一档、二档），3 为设定与扩展书；
 * - order：层级，决定「放在哪个包」（展开物品、家族放在层级更高的包）与依赖方向（只能依赖 order 更小的包）；
 * - requires：除了条目引用自动推出的依赖之外，这本书还要求先装的书（来源代号）。只有「引用经裁剪后没有硬引用、
 *   但这本书的规则要建立在那本书之上」的才写；构建会检查它们都在更低的层级。
 */
export interface BookPolicy {
  source: string
  /** book＝三档书；adventure＝冒险（只有怪物与 NPC）。默认 book。 */
  kind?: 'book' | 'adventure'
  tier: 1 | 2 | 3
  recommended: boolean
  order: number
  requires?: string[]
  name?: string
  nameEn?: string
  /** 含 npc 条目的包写 0.3.0；核心 11 个包不写。 */
  minAppVersion?: string
}

/** 当前所有包的版本：内容变了就升版本，设备上已装的才会更新。 */
export const PACK_VERSION = '1.5.0'

export const BOOK_POLICY: BookPolicy[] = [
  { source: 'PHB', tier: 1, recommended: true, order: 1, nameEn: "Player's Handbook" },
  { source: 'SCAG', tier: 1, recommended: true, order: 2 },
  { source: 'DMG', tier: 1, recommended: true, order: 3, nameEn: "Dungeon Master's Guide" },
  { source: 'MM', tier: 1, recommended: true, order: 4, requires: ['DMG'], name: '怪物图鉴（2014）', nameEn: "Monster Manual" },
  { source: 'XGE', tier: 1, recommended: true, order: 5, requires: ['PHB'] },
  { source: 'TCE', tier: 1, recommended: true, order: 6 },
  { source: 'VGM', tier: 2, recommended: true, order: 7, requires: ['PHB'] },
  { source: 'MTF', tier: 2, recommended: true, order: 8 },
  { source: 'MPMM', tier: 2, recommended: true, order: 9, name: '魔邓肯巨献：多元宇宙的怪物' },
  { source: 'BMT', tier: 2, recommended: true, order: 10 },
]
