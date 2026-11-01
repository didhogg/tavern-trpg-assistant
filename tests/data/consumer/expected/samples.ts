import type { SampleIn, SampleOut } from '../derive'

/** 样卡：已选好种族、职业、背景、属性（含种族加值后的最终值）、护甲。期望值全部按 PHB 规则手算（调整值、熟练加值、护甲等级、平均生命值、法术位表、法术豁免难度）。
 * 每张卡的计算过程写在注释里，页码为 PHB 对应章节。 */
export interface Sample { in: SampleIn; want: Partial<SampleOut> }
const S = (s: number, d: number, c: number, i: number, w: number, ch: number): Record<string, number> => ({ str: s, dex: d, con: c, int: i, wis: w, cha: ch })

export const SAMPLES: Sample[] = [
  // 1 野蛮人 1 级人类：无甲防御 10+敏捷+1+体质+2=13；生命 12+2=14；先攻+1；运动 3+2=5；察觉 0+2=2，被动 12
  { in: { name: '野蛮人1', classId: 'class.barbarian.phb', level: 1, raceId: 'race.human.phb', backgroundId: 'background.outlander.phb', scores: S(16, 13, 15, 9, 11, 9), skills: ['perception', 'intimidation'] },
    want: { prof: 2, ac: 13, hp: 14, initiative: 1, speed: 30, darkvision: 0, passivePerception: 12, saves: { str: 5, dex: 1, con: 4, int: -1, wis: 0, cha: -1 }, skills: { athletics: 5, survival: 2, perception: 2, intimidation: 1 } } },
  // 2 吟游诗人 1 级半精灵：皮甲 11+敏捷2=13；生命 8+1=9；法术位 2 个 1 环；豁免 DC 8+2+3=13，攻击 +5
  { in: { name: '诗人1', classId: 'class.bard.phb', level: 1, raceId: 'race.half-elf.phb', backgroundId: 'background.entertainer.phb', scores: S(8, 14, 12, 10, 11, 16), armor: 'Leather Armor', skills: ['persuasion', 'deception', 'perception', 'insight', 'stealth'] },
    want: { ac: 13, hp: 9, initiative: 2, speed: 30, darkvision: 60, passivePerception: 12, slots: [2, 0, 0, 0, 0, 0, 0, 0, 0], spellDc: 13, spellAttack: 5, saves: { dex: 4, cha: 5 }, skills: { persuasion: 5, performance: 5, acrobatics: 4 } } },
  // 3 牧师 1 级丘陵矮人：鳞甲 14+敏捷0（中甲上限2）+盾牌2=16；生命 8+体质3+矮人坚韧1=12；速度 25
  { in: { name: '牧师1', classId: 'class.cleric.phb', level: 1, raceId: 'race.dwarf.phb', subraceId: 'subrace.dwarf-hill.phb', backgroundId: 'background.acolyte.phb', scores: S(14, 10, 16, 8, 16, 12), armor: 'Scale Mail', shield: true, skills: ['medicine', 'persuasion'] },
    want: { ac: 16, hp: 12, initiative: 0, speed: 25, darkvision: 60, passivePerception: 13, slots: [2, 0, 0, 0, 0, 0, 0, 0, 0], spellDc: 13, saves: { wis: 5, cha: 3 }, skills: { insight: 5, religion: 1, medicine: 5 } } },
  // 4 德鲁伊 1 级木精灵：皮甲 11+敏捷2+盾牌2=15；速度 35；察觉熟练（敏锐感官），被动 10+3+2=15
  { in: { name: '德鲁伊1', classId: 'class.druid.phb', level: 1, raceId: 'race.elf.phb', subraceId: 'subrace.elf-wood.phb', backgroundId: 'background.hermit.phb', scores: S(10, 15, 13, 12, 16, 8), armor: 'Leather Armor', shield: true, skills: ['nature', 'survival'] },
    want: { ac: 15, hp: 9, initiative: 2, speed: 35, darkvision: 60, passivePerception: 15, slots: [2, 0, 0, 0, 0, 0, 0, 0, 0], spellDc: 13, saves: { int: 3, wis: 5 } } },
  // 5 战士 1 级变体人类（警觉专长）：链甲 16（重甲不加敏捷）+盾牌 2=18；先攻 敏捷+1 +5=6；被动察觉 10+1+2=13
  { in: { name: '战士1', classId: 'class.fighter.phb', level: 1, raceId: 'race.human.phb', subraceId: 'subrace.human-variant.phb', backgroundId: 'background.soldier.phb', feats: ['feat.alert.phb'], scores: S(16, 12, 14, 10, 12, 8), armor: 'Chain Mail', shield: true, skills: ['perception', 'survival', 'stealth'] },
    want: { ac: 18, hp: 12, initiative: 6, speed: 30, passivePerception: 13, saves: { str: 5, con: 4 } } },
  // 6 武僧 1 级人类：无甲防御 10+敏捷3+感知2=15；生命 8+1=9
  { in: { name: '武僧1', classId: 'class.monk.phb', level: 1, raceId: 'race.human.phb', backgroundId: 'background.criminal.phb', scores: S(12, 16, 13, 10, 15, 9), skills: ['acrobatics', 'stealth'] },
    want: { ac: 15, hp: 9, initiative: 3, speed: 30, saves: { str: 3, dex: 5 } } },
  // 7 圣武士 1 级人类：链甲 16+盾牌 2=18；生命 10+2=12；1 级没有法术位
  { in: { name: '圣武士1', classId: 'class.paladin.phb', level: 1, raceId: 'race.human.phb', backgroundId: 'background.soldier.phb', scores: S(16, 10, 14, 9, 11, 14), armor: 'Chain Mail', shield: true, skills: ['athletics', 'persuasion'] },
    want: { ac: 18, hp: 12, initiative: 0, slots: [0, 0, 0, 0, 0, 0, 0, 0, 0], saves: { wis: 2, cha: 4 } } },
  // 8 游侠 1 级木精灵：皮甲 11+3=14；生命 10+1=11；速度 35
  { in: { name: '游侠1', classId: 'class.ranger.phb', level: 1, raceId: 'race.elf.phb', subraceId: 'subrace.elf-wood.phb', backgroundId: 'background.folk-hero.phb', scores: S(12, 17, 13, 10, 14, 8), armor: 'Leather Armor', skills: ['stealth', 'nature', 'investigation'] },
    want: { ac: 14, hp: 11, initiative: 3, speed: 35, darkvision: 60, passivePerception: 14, saves: { str: 3, dex: 5 } } },
  // 9 游荡者 1 级轻足半身人：皮甲 11+3=14；生命 8+1=9；速度 25
  { in: { name: '游荡者1', classId: 'class.rogue.phb', level: 1, raceId: 'race.halfling.phb', subraceId: 'subrace.halfling-lightfoot.phb', backgroundId: 'background.criminal.phb', scores: S(8, 17, 12, 12, 12, 14), armor: 'Leather Armor', skills: ['acrobatics', 'perception', 'sleight of hand', 'investigation'] },
    want: { ac: 14, hp: 9, initiative: 3, speed: 25, saves: { dex: 5, int: 3 } } },
  // 10 术士 1 级龙脉人类：龙族韧性无甲 13+敏捷2=15；生命 6+2+1=9
  { in: { name: '术士1', classId: 'class.sorcerer.phb', level: 1, subclassId: 'subclass.sorcerer-draconic-bloodline.phb', raceId: 'race.human.phb', backgroundId: 'background.sage.phb', scores: S(8, 14, 14, 9, 10, 16), skills: ['persuasion', 'insight'] },
    want: { ac: 15, hp: 9, slots: [2, 0, 0, 0, 0, 0, 0, 0, 0], spellDc: 13, spellAttack: 5, saves: { con: 4, cha: 5 } } },
  // 11 魔契师 1 级提夫林：皮甲 11+1=12；生命 8+2=10；契约魔法 1 个 1 环位
  { in: { name: '魔契师1', classId: 'class.warlock.phb', level: 1, raceId: 'race.tiefling.phb', backgroundId: 'background.criminal.phb', scores: S(8, 12, 14, 13, 10, 17), armor: 'Leather Armor', skills: ['arcana', 'intimidation'] },
    want: { ac: 12, hp: 10, darkvision: 60, slots: [1, 1], spellDc: 13, spellAttack: 5, saves: { wis: 2, cha: 5 } } },
  // 12 法师 1 级高等精灵：无甲 10+2=12；生命 6+1=7；被动察觉 10+1+2=13
  { in: { name: '法师1', classId: 'class.wizard.phb', level: 1, raceId: 'race.elf.phb', subraceId: 'subrace.elf-high.phb', backgroundId: 'background.sage.phb', scores: S(8, 14, 13, 16, 12, 10), skills: ['investigation', 'insight'] },
    want: { ac: 12, hp: 7, darkvision: 60, passivePerception: 13, slots: [2, 0, 0, 0, 0, 0, 0, 0, 0], spellDc: 13, saves: { int: 5, wis: 3 } } },
  // 13 奇械师 1 级岩侏儒：鳞甲 14+敏捷 min(1,2)=15+盾牌 2=17；生命 8+2=10；速度 25；法术位 2 个
  { in: { name: '奇械师1', classId: 'class.artificer.tce', level: 1, raceId: 'race.gnome.phb', subraceId: 'subrace.gnome-rock.phb', backgroundId: 'background.sage.phb', scores: S(8, 12, 15, 16, 10, 10), armor: 'Scale Mail', shield: true, skills: ['arcana', 'investigation'] },
    want: { ac: 17, hp: 10, speed: 25, darkvision: 60, slots: [2, 0, 0, 0, 0, 0, 0, 0, 0], spellDc: 13, saves: { con: 4, int: 5 } } },
  // 14 武僧 5 级人类：熟练加值 +3；生命 8+1+4×(5+1)=33；无甲移动 +10 尺，速度 40
  { in: { name: '武僧5', classId: 'class.monk.phb', level: 5, raceId: 'race.human.phb', backgroundId: 'background.criminal.phb', scores: S(12, 16, 13, 10, 15, 9), skills: ['acrobatics', 'stealth'] },
    want: { prof: 3, ac: 15, hp: 33, speed: 40, saves: { str: 4, dex: 6 } } },
  // 15 野蛮人 5 级人类：快速移动 +10 尺，速度 40；生命 12+2+4×(7+2)=50
  { in: { name: '野蛮人5', classId: 'class.barbarian.phb', level: 5, raceId: 'race.human.phb', backgroundId: 'background.outlander.phb', scores: S(16, 13, 15, 9, 11, 9), skills: ['perception', 'intimidation'] },
    want: { prof: 3, ac: 13, hp: 50, speed: 40 } },
  // 16 龙脉术士 5 级：生命 6+2+4×(4+2)=32，加龙族韧性每级 +1 共 5=37；法术位 4/3/2；DC 8+3+3=14，攻击 +6
  { in: { name: '术士5', classId: 'class.sorcerer.phb', level: 5, subclassId: 'subclass.sorcerer-draconic-bloodline.phb', raceId: 'race.human.phb', backgroundId: 'background.sage.phb', scores: S(8, 14, 14, 9, 10, 16), skills: ['persuasion', 'insight'] },
    want: { prof: 3, ac: 15, hp: 37, slots: [4, 3, 2, 0, 0, 0, 0, 0, 0], spellDc: 14, spellAttack: 6 } },
  // 17 丘陵矮人战士 5 级（体质 16，调整值 +3）：生命 10+3+4×(6+3)=49，加矮人坚韧每级 +1 共 5=54
  { in: { name: '战士5', classId: 'class.fighter.phb', level: 5, raceId: 'race.dwarf.phb', subraceId: 'subrace.dwarf-hill.phb', backgroundId: 'background.soldier.phb', scores: S(16, 12, 16, 10, 12, 8), armor: 'Chain Mail', shield: true, skills: ['perception', 'survival'] },
    want: { prof: 3, ac: 18, hp: 54, speed: 25 } },
  // 18 变体人类战士 3 级（强健专长）：生命 10+2+2×(6+2)=28，强健每级 +2 共 6=34
  { in: { name: '战士3', classId: 'class.fighter.phb', level: 3, raceId: 'race.human.phb', subraceId: 'subrace.human-variant.phb', backgroundId: 'background.soldier.phb', feats: ['feat.tough.phb'], scores: S(16, 12, 14, 10, 12, 8), armor: 'Chain Mail', shield: true, skills: ['perception', 'survival'] },
    want: { prof: 2, hp: 34 } },
  // 19 战士 1 级变体人类（观察者专长）：被动察觉 10+1+5=16
  { in: { name: '战士观察者', classId: 'class.fighter.phb', level: 1, raceId: 'race.human.phb', subraceId: 'subrace.human-variant.phb', backgroundId: 'background.soldier.phb', feats: ['feat.observant.phb'], scores: S(16, 12, 14, 10, 13, 8), armor: 'Chain Mail', shield: true, skills: ['survival', 'stealth'] },
    want: { passivePerception: 16 } },
]
