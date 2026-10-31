import { z } from 'zod'

/** 稳定编号与中文显示。数据里只出现编号，界面通过这张表显示中文。 */

export const ABILITY_KEYS = ['str', 'dex', 'con', 'int', 'wis', 'cha'] as const
export type AbilityKey = (typeof ABILITY_KEYS)[number]
export const ABILITY_LABELS: Record<AbilityKey, string> = { str: '力量', dex: '敏捷', con: '体质', int: '智力', wis: '感知', cha: '魅力' }
export const abilityKeySchema = z.enum(ABILITY_KEYS)

export const SKILLS = {
  acrobatics: { ability: 'dex', label: '杂技' },
  'animal handling': { ability: 'wis', label: '驯兽' },
  arcana: { ability: 'int', label: '奥秘' },
  athletics: { ability: 'str', label: '运动' },
  deception: { ability: 'cha', label: '欺瞒' },
  history: { ability: 'int', label: '历史' },
  insight: { ability: 'wis', label: '洞悉' },
  intimidation: { ability: 'cha', label: '威吓' },
  investigation: { ability: 'int', label: '调查' },
  medicine: { ability: 'wis', label: '医药' },
  nature: { ability: 'int', label: '自然' },
  perception: { ability: 'wis', label: '察觉' },
  performance: { ability: 'cha', label: '表演' },
  persuasion: { ability: 'cha', label: '游说' },
  religion: { ability: 'int', label: '宗教' },
  'sleight of hand': { ability: 'dex', label: '巧手' },
  stealth: { ability: 'dex', label: '隐匿' },
  survival: { ability: 'wis', label: '求生' },
} as const
export const SKILL_KEYS = Object.keys(SKILLS) as [keyof typeof SKILLS, ...Array<keyof typeof SKILLS>]
export const skillSchema = z.enum(SKILL_KEYS)
export type SkillKey = (typeof SKILL_KEYS)[number]
export const SKILL_LABELS: Record<string, string> = Object.fromEntries(Object.entries(SKILLS).map(([key, v]) => [key, v.label]))

export const DAMAGE_TYPES = ['acid', 'bludgeoning', 'cold', 'fire', 'force', 'lightning', 'necrotic', 'piercing', 'poison', 'psychic', 'radiant', 'slashing', 'thunder'] as const
export type DamageType = (typeof DAMAGE_TYPES)[number]
export const damageTypeSchema = z.enum(DAMAGE_TYPES)
export const DAMAGE_LABELS: Record<string, string> = {
  acid: '强酸', bludgeoning: '钝击', cold: '寒冷', fire: '火焰', force: '力场', lightning: '闪电', necrotic: '暗蚀',
  piercing: '穿刺', poison: '毒素', psychic: '心灵', radiant: '光耀', slashing: '挥砍', thunder: '雷鸣',
}

export const CONDITIONS = ['blinded', 'charmed', 'deafened', 'exhaustion', 'frightened', 'grappled', 'incapacitated', 'invisible', 'paralyzed', 'petrified', 'poisoned', 'prone', 'restrained', 'stunned', 'unconscious'] as const
export type ConditionKey = (typeof CONDITIONS)[number]
export const conditionKeySchema = z.enum(CONDITIONS)
export const CONDITION_LABELS: Record<string, string> = {
  blinded: '目盲', charmed: '魅惑', deafened: '耳聋', exhaustion: '力竭', frightened: '恐慌', grappled: '擒抱', incapacitated: '失能',
  invisible: '隐形', paralyzed: '麻痹', petrified: '石化', poisoned: '中毒', prone: '倒地', restrained: '束缚', stunned: '震慑', unconscious: '昏迷',
}

export const LANGUAGES = [
  'common', 'dwarvish', 'elvish', 'giant', 'gnomish', 'goblin', 'halfling', 'orc', 'abyssal', 'celestial', 'draconic',
  'deep speech', 'infernal', 'primordial', 'sylvan', 'undercommon', 'auran', 'terran', 'aquan', 'ignan', 'anystandard', "thieves' cant", 'other',
] as const
export type LanguageKey = (typeof LANGUAGES)[number]
export const languageSchema = z.enum(LANGUAGES)
export const LANGUAGE_LABELS: Record<string, string> = {
  common: '通用语', dwarvish: '矮人语', elvish: '精灵语', giant: '巨人语', gnomish: '侏儒语', goblin: '地精语', halfling: '半身人语', orc: '兽人语',
  abyssal: '深渊语', celestial: '天界语', draconic: '龙语', 'deep speech': '深潜语', infernal: '炼狱语', primordial: '原初语', sylvan: '木族语',
  undercommon: '地底通用语', auran: '风族语', terran: '土族语', aquan: '水族语', ignan: '火族语', anystandard: '任选一种标准语言',
  "thieves' cant": '盗贼黑话', other: '其他（见种族说明）',
}

export const TOOLS = [
  "alchemist's supplies", "brewer's supplies", "calligrapher's supplies", "carpenter's tools", "cartographer's tools", "cobbler's tools",
  "cook's utensils", "glassblower's tools", "jeweler's tools", "leatherworker's tools", "mason's tools", "painter's supplies", "potter's tools",
  "smith's tools", "tinker's tools", "weaver's tools", "woodcarver's tools", 'disguise kit', 'forgery kit', 'herbalism kit', "navigator's tools",
  "poisoner's kit", "thieves' tools", 'gaming set', 'musical instrument', 'vehicles (land)', 'vehicles (water)', 'anyartisanstool', 'anygamingset', 'anymusicalinstrument', 'choose',
] as const
export type ToolKey = (typeof TOOLS)[number]
export const toolSchema = z.enum(TOOLS)
export const TOOL_LABELS: Record<string, string> = {
  "alchemist's supplies": '炼金术士工具', "brewer's supplies": '酿酒工具', "calligrapher's supplies": '书法工具', "carpenter's tools": '木匠工具',
  "cartographer's tools": '制图工具', "cobbler's tools": '鞋匠工具', "cook's utensils": '厨师工具', "glassblower's tools": '吹玻璃工具',
  "jeweler's tools": '珠宝工具', "leatherworker's tools": '皮革工具', "mason's tools": '石匠工具', "painter's supplies": '画家工具',
  "potter's tools": '陶匠工具', "smith's tools": '铁匠工具', "tinker's tools": '工匠修理工具', "weaver's tools": '织工工具', "woodcarver's tools": '木雕工具',
  'disguise kit': '易容工具', 'forgery kit': '伪造工具', 'herbalism kit': '草药工具', "navigator's tools": '导航工具',
  "poisoner's kit": '毒师工具', "thieves' tools": '盗贼工具', 'gaming set': '游戏套组', 'musical instrument': '乐器',
  'vehicles (land)': '陆地载具', 'vehicles (water)': '水上载具', anyartisanstool: '任选一种工匠工具', anygamingset: '任选一种游戏套组',
  anymusicalinstrument: '任选一种乐器', choose: '任选（见说明）',
}

export const ARMOR_CATEGORIES = ['light', 'medium', 'heavy', 'shield'] as const
export const armorCategorySchema = z.enum(ARMOR_CATEGORIES)
export const ARMOR_LABELS: Record<string, string> = { light: '轻甲', medium: '中甲', heavy: '重甲', shield: '盾牌' }
export const WEAPON_CATEGORIES = ['simple', 'martial'] as const
export const weaponCategorySchema = z.enum(WEAPON_CATEGORIES)
export const WEAPON_CATEGORY_LABELS: Record<string, string> = { simple: '简易', martial: '军用' }
export const WEAPON_PROPERTIES = ['A', 'AF', 'F', 'H', 'L', 'LD', 'R', 'RLD', 'S', 'T', '2H', 'V', 'BF'] as const
export const weaponPropertySchema = z.enum(WEAPON_PROPERTIES)
export const WEAPON_PROPERTY_LABELS: Record<string, string> = {
  A: '弹药', AF: '弹药（火器）', F: '灵巧', H: '重型', L: '轻型', LD: '装填', R: '触及', RLD: '重新装填', S: '特殊', T: '投掷', '2H': '双手', V: '两用', BF: '扫射',
}

export const SPELL_SCHOOLS = ['abjuration', 'conjuration', 'divination', 'enchantment', 'evocation', 'illusion', 'necromancy', 'transmutation'] as const
export const spellSchoolSchema = z.enum(SPELL_SCHOOLS)
export const SCHOOL_LABELS: Record<string, string> = {
  abjuration: '防护', conjuration: '咒法', divination: '预言', enchantment: '惑控', evocation: '塑能', illusion: '幻术', necromancy: '死灵', transmutation: '变化',
}
export const CASTER_PROGRESSIONS = ['full', 'half', 'third', 'pact'] as const
export const casterProgressionSchema = z.enum(CASTER_PROGRESSIONS)
export const RECHARGE = ['short', 'long', 'shortOrLong', 'dawn', 'dusk', 'turn', 'round', 'special'] as const
export const rechargeSchema = z.enum(RECHARGE)
export type Recharge = (typeof RECHARGE)[number]
export const RECHARGE_LABELS: Record<string, string> = { short: '短休', long: '长休', shortOrLong: '短休或长休', dawn: '黎明', dusk: '黄昏', turn: '回合', round: '轮', special: '特殊' }

export const SIZES = ['T', 'S', 'M', 'L', 'H', 'G'] as const
export const sizeSchema = z.enum(SIZES)
export const SIZE_LABELS: Record<string, string> = { T: '微型', S: '小型', M: '中型', L: '大型', H: '巨型', G: '超巨型' }

export const CREATURE_TYPES = ['aberration', 'beast', 'celestial', 'construct', 'dragon', 'elemental', 'fey', 'fiend', 'giant', 'humanoid', 'monstrosity', 'ooze', 'plant', 'undead'] as const
export const CREATURE_LABELS: Record<string, string> = {
  aberration: '异怪', beast: '野兽', celestial: '天界生物', construct: '构装体', dragon: '龙', elemental: '元素生物', fey: '精类', fiend: '邪魔',
  giant: '巨人', humanoid: '类人生物', monstrosity: '怪兽', ooze: '泥怪', plant: '植物', undead: '不死生物',
}

export const RULE_ENGINES = [] as const
export type RuleEngine = (typeof RULE_ENGINES)[number]
