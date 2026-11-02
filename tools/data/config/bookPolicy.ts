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
  // D1.2b 三档书（只加有怪物的来源；0 怪物的来源不出包）
  { source: 'PSZ', kind: 'book', tier: 3, recommended: false, order: 11 },
  { source: 'PSI', kind: 'book', tier: 3, recommended: false, order: 12 },
  { source: 'PSK', kind: 'book', tier: 3, recommended: false, order: 13 },
  { source: 'PSA', kind: 'book', tier: 3, recommended: false, order: 14 },
  { source: 'PSX', kind: 'book', tier: 3, recommended: false, order: 15 },
  { source: 'PSD', kind: 'book', tier: 3, recommended: false, order: 16 },
  { source: 'GGR', kind: 'book', tier: 3, recommended: false, order: 17 },
  { source: 'AI', kind: 'book', tier: 3, recommended: false, order: 18 },
  { source: 'AWM', kind: 'book', tier: 3, recommended: false, order: 19 },
  { source: 'ERLW', kind: 'book', tier: 3, recommended: false, order: 20 },
  { source: 'EGW', kind: 'book', tier: 3, recommended: false, order: 21 },
  { source: 'MOT', kind: 'book', tier: 3, recommended: false, order: 22 },
  { source: 'MGELFT', kind: 'book', tier: 3, recommended: false, order: 23 },
  { source: 'VRGR', kind: 'book', tier: 3, recommended: false, order: 24 },
  { source: 'DoD', kind: 'book', tier: 3, recommended: false, order: 25 },
  { source: 'MaBJoV', kind: 'book', tier: 3, recommended: false, order: 26 },
  { source: 'FTD', kind: 'book', tier: 3, recommended: false, order: 27 },
  { source: 'SCC', kind: 'book', tier: 3, recommended: false, order: 28 },
  { source: 'MCV1SC', kind: 'book', tier: 3, recommended: false, order: 29 },
  { source: 'BAM', kind: 'book', tier: 3, recommended: false, order: 30 },
  { source: 'HAT-TG', kind: 'book', tier: 3, recommended: false, order: 31 },
  { source: 'BGG', kind: 'book', tier: 3, recommended: false, order: 32 },
  { source: 'MCV4EC', kind: 'book', tier: 3, recommended: false, order: 33 },
  { source: 'MPP', kind: 'book', tier: 3, recommended: false, order: 34 },
  { source: 'AATM', kind: 'book', tier: 3, recommended: false, order: 35 },
  // D1.2b 冒险（只加有怪物的来源；0 怪物的来源不出包）
  { source: 'LMoP', kind: 'adventure', tier: 3, recommended: false, order: 36 },
  { source: 'HotDQ', kind: 'adventure', tier: 3, recommended: false, order: 37 },
  { source: 'RoT', kind: 'adventure', tier: 3, recommended: false, order: 38 },
  { source: 'PotA', kind: 'adventure', tier: 3, recommended: false, order: 39 },
  { source: 'OotA', kind: 'adventure', tier: 3, recommended: false, order: 40 },
  { source: 'CoS', kind: 'adventure', tier: 3, recommended: false, order: 41 },
  { source: 'SKT', kind: 'adventure', tier: 3, recommended: false, order: 42 },
  { source: 'TftYP', kind: 'adventure', tier: 3, recommended: false, order: 43, name: '哈欠传送门故事集', nameEn: 'Tales from the Yawning Portal' },
  { source: 'ToA', kind: 'adventure', tier: 3, recommended: false, order: 44 },
  { source: 'TTP', kind: 'adventure', tier: 3, recommended: false, order: 45 },
  { source: 'WDH', kind: 'adventure', tier: 3, recommended: false, order: 46 },
  { source: 'LLK', kind: 'adventure', tier: 3, recommended: false, order: 47 },
  { source: 'WDMM', kind: 'adventure', tier: 3, recommended: false, order: 48 },
  { source: 'KKW', kind: 'adventure', tier: 3, recommended: false, order: 49 },
  { source: 'GoS', kind: 'adventure', tier: 3, recommended: false, order: 50 },
  { source: 'HftT', kind: 'adventure', tier: 3, recommended: false, order: 51 },
  { source: 'OoW', kind: 'adventure', tier: 3, recommended: false, order: 52 },
  { source: 'DIP', kind: 'adventure', tier: 3, recommended: false, order: 53 },
  { source: 'ESK', kind: 'adventure', tier: 3, recommended: false, order: 54, name: '基础套组', nameEn: 'Essentials Kit' },
  { source: 'DC', kind: 'adventure', tier: 3, recommended: false, order: 55 },
  { source: 'SDW', kind: 'adventure', tier: 3, recommended: false, order: 56 },
  { source: 'SLW', kind: 'adventure', tier: 3, recommended: false, order: 57 },
  { source: 'BGDIA', kind: 'adventure', tier: 3, recommended: false, order: 58 },
  { source: 'LR', kind: 'adventure', tier: 3, recommended: false, order: 59 },
  { source: 'IMR', kind: 'adventure', tier: 3, recommended: false, order: 60 },
  { source: 'RMBRE', kind: 'adventure', tier: 3, recommended: false, order: 61 },
  { source: 'IDRotF', kind: 'adventure', tier: 3, recommended: false, order: 62 },
  { source: 'CM', kind: 'adventure', tier: 3, recommended: false, order: 63 },
  { source: 'HoL', kind: 'adventure', tier: 3, recommended: false, order: 64 },
  { source: 'RtG', kind: 'adventure', tier: 3, recommended: false, order: 65 },
  { source: 'AitFR-ISF', kind: 'adventure', tier: 3, recommended: false, order: 66 },
  { source: 'AitFR-THP', kind: 'adventure', tier: 3, recommended: false, order: 67 },
  { source: 'AitFR-DN', kind: 'adventure', tier: 3, recommended: false, order: 68 },
  { source: 'AitFR-FCD', kind: 'adventure', tier: 3, recommended: false, order: 69 },
  { source: 'NRH-ASS', kind: 'adventure', tier: 3, recommended: false, order: 70 },
  { source: 'NRH-AT', kind: 'adventure', tier: 3, recommended: false, order: 71 },
  { source: 'NRH-AVitW', kind: 'adventure', tier: 3, recommended: false, order: 72 },
  { source: 'NRH-AWoL', kind: 'adventure', tier: 3, recommended: false, order: 73 },
  { source: 'NRH-CoI', kind: 'adventure', tier: 3, recommended: false, order: 74 },
  { source: 'NRH-TCMC', kind: 'adventure', tier: 3, recommended: false, order: 75 },
  { source: 'WBtW', kind: 'adventure', tier: 3, recommended: false, order: 76 },
  { source: 'CRCotN', kind: 'adventure', tier: 3, recommended: false, order: 77 },
  { source: 'JttRC', kind: 'adventure', tier: 3, recommended: false, order: 78 },
  { source: 'DoSI', kind: 'adventure', tier: 3, recommended: false, order: 79 },
  { source: 'LoX', kind: 'adventure', tier: 3, recommended: false, order: 80 },
  { source: 'DSotDQ', kind: 'adventure', tier: 3, recommended: false, order: 81 },
  { source: 'KftGV', kind: 'adventure', tier: 3, recommended: false, order: 82 },
  { source: 'GotSF', kind: 'adventure', tier: 3, recommended: false, order: 83 },
  { source: 'PaBTSO', kind: 'adventure', tier: 3, recommended: false, order: 84 },
  { source: 'ToFW', kind: 'adventure', tier: 3, recommended: false, order: 85 },
  { source: 'CoA', kind: 'adventure', tier: 3, recommended: false, order: 86 },
]
