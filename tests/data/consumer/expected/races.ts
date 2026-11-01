/** PHB 第 2 章种族（含亚种合并后的值）。亚种 = 种族 + 亚种：属性加值相加，体型/速度取亚种，黑暗视觉取较大者，语言与熟练取并集。 */
export interface RaceExpect {
  abilities: Record<string, number>
  /** 额外自选的属性加值：[每项加几, 选几项] */
  abilityChoose?: [number, number]
  size: string
  walk: number
  darkvision: number
  langFixed: string[]
  langChoose: number
  skillsFixed?: string[]
  skillChoose?: number
  weaponsFixed?: string[]
  armorFixed?: string[]
  toolChoose?: number
  toolsFixed?: string[]
}
const R = (o: RaceExpect): RaceExpect => o
export const RACE_EXPECT: Record<string, RaceExpect> = {
  'race.dragonborn.phb': R({ abilities: { str: 2, cha: 1 }, size: 'M', walk: 30, darkvision: 0, langFixed: ['common', 'draconic'], langChoose: 0 }),
  'race.dwarf.phb|': R({ abilities: { con: 2 }, size: 'M', walk: 25, darkvision: 60, langFixed: ['common', 'dwarvish'], langChoose: 0, weaponsFixed: ['battleaxe', 'handaxe', 'light hammer', 'warhammer'], toolChoose: 1 }),
  'race.dwarf.phb|subrace.dwarf-hill.phb': R({ abilities: { con: 2, wis: 1 }, size: 'M', walk: 25, darkvision: 60, langFixed: ['common', 'dwarvish'], langChoose: 0, weaponsFixed: ['battleaxe', 'handaxe', 'light hammer', 'warhammer'], toolChoose: 1 }),
  'race.dwarf.phb|subrace.dwarf-mountain.phb': R({ abilities: { con: 2, str: 2 }, size: 'M', walk: 25, darkvision: 60, langFixed: ['common', 'dwarvish'], langChoose: 0, weaponsFixed: ['battleaxe', 'handaxe', 'light hammer', 'warhammer'], armorFixed: ['light', 'medium'], toolChoose: 1 }),
  'race.elf.phb|subrace.elf-high.phb': R({ abilities: { dex: 2, int: 1 }, size: 'M', walk: 30, darkvision: 60, langFixed: ['common', 'elvish'], langChoose: 1, skillsFixed: ['perception'], weaponsFixed: ['longsword', 'shortsword', 'shortbow', 'longbow'] }),
  'race.elf.phb|subrace.elf-wood.phb': R({ abilities: { dex: 2, wis: 1 }, size: 'M', walk: 35, darkvision: 60, langFixed: ['common', 'elvish'], langChoose: 0, skillsFixed: ['perception'], weaponsFixed: ['longsword', 'shortsword', 'shortbow', 'longbow'] }),
  'race.elf.phb|subrace.elf-drow.phb': R({ abilities: { dex: 2, cha: 1 }, size: 'M', walk: 30, darkvision: 120, langFixed: ['common', 'elvish'], langChoose: 0, skillsFixed: ['perception'], weaponsFixed: ['rapier', 'shortsword', 'hand crossbow'] }),
  'race.gnome.phb|subrace.gnome-forest.phb': R({ abilities: { int: 2, dex: 1 }, size: 'S', walk: 25, darkvision: 60, langFixed: ['common', 'gnomish'], langChoose: 0 }),
  'race.gnome.phb|subrace.gnome-rock.phb': R({ abilities: { int: 2, con: 1 }, size: 'S', walk: 25, darkvision: 60, langFixed: ['common', 'gnomish'], langChoose: 0, toolsFixed: ["tinker's tools"] }),
  'race.half-elf.phb': R({ abilities: { cha: 2 }, abilityChoose: [1, 2], size: 'M', walk: 30, darkvision: 60, langFixed: ['common', 'elvish'], langChoose: 1, skillChoose: 2 }),
  'race.half-orc.phb': R({ abilities: { str: 2, con: 1 }, size: 'M', walk: 30, darkvision: 60, langFixed: ['common', 'orc'], langChoose: 0, skillsFixed: ['intimidation'] }),
  'race.halfling.phb|subrace.halfling-lightfoot.phb': R({ abilities: { dex: 2, cha: 1 }, size: 'S', walk: 25, darkvision: 0, langFixed: ['common', 'halfling'], langChoose: 0 }),
  'race.halfling.phb|subrace.halfling-stout.phb': R({ abilities: { dex: 2, con: 1 }, size: 'S', walk: 25, darkvision: 0, langFixed: ['common', 'halfling'], langChoose: 0 }),
  'race.human.phb': R({ abilities: { str: 1, dex: 1, con: 1, int: 1, wis: 1, cha: 1 }, size: 'M', walk: 30, darkvision: 0, langFixed: ['common'], langChoose: 1 }),
  'race.human.phb|subrace.human-variant.phb': R({ abilities: {}, abilityChoose: [1, 2], size: 'M', walk: 30, darkvision: 0, langFixed: ['common'], langChoose: 1, skillChoose: 1 }),
  'race.tiefling.phb': R({ abilities: { cha: 2, int: 1 }, size: 'M', walk: 30, darkvision: 60, langFixed: ['common', 'infernal'], langChoose: 0 }),
}
