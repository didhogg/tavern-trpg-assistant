/**
 * 数据里的枚举代码 → 中文显示。
 * 用词来源：数据包自己的中文正文（共库 / 灰机一脉，已核对各词在正文中的用法与次数），
 * 没有对应用法的几个火器属性词由人工译定，见各处注释。
 */
const lookup = (map: Record<string, string>, v: unknown): string => {
  const key = String(v ?? '')
  return map[key] ?? map[key.toLowerCase()] ?? key
}

export const ABILITY: Record<string, string> = { str: '力量', dex: '敏捷', con: '体质', int: '智力', wis: '感知', cha: '魅力' }
export const SKILL: Record<string, string> = {
  acrobatics: '杂技', 'animal handling': '驯兽', arcana: '奥秘', athletics: '运动', deception: '欺瞒', history: '历史', insight: '洞悉',
  intimidation: '威吓', investigation: '调查', medicine: '医药', nature: '自然', perception: '察觉', performance: '表演', persuasion: '游说',
  religion: '宗教', 'sleight of hand': '巧手', stealth: '隐匿', survival: '求生', any: '任选一项技能', choose: '任选（见背景说明）',
}
export const ARMOR_CATEGORY: Record<string, string> = { light: '轻甲', medium: '中甲', heavy: '重甲', shield: '盾牌' }
export const SIZE: Record<string, string> = { T: '微型', S: '小型', M: '中型', L: '大型', H: '巨型', G: '超巨型' }
export const MOVE: Record<string, string> = { walk: '步行', swim: '游泳', fly: '飞行', climb: '攀爬', burrow: '掘地', hover: '悬浮' }
export const CREATURE: Record<string, string> = {
  aberration: '异怪', beast: '野兽', celestial: '天界生物', construct: '构装体', dragon: '龙', elemental: '元素生物', fey: '精类', fiend: '邪魔',
  giant: '巨人', humanoid: '类人生物', monstrosity: '怪兽', ooze: '泥怪', plant: '植物', undead: '不死生物',
}
export const ALIGNMENT: Record<string, string> = { L: '守序', N: '中立', C: '混乱', G: '善良', E: '邪恶', U: '无阵营', A: '任意阵营', X: '', Y: '' }
export const SCHOOL: Record<string, string> = {
  abjuration: '防护', conjuration: '咒法', divination: '预言', enchantment: '惑控', evocation: '塑能', illusion: '幻术', necromancy: '死灵', transmutation: '变化',
}
export const UNIT: Record<string, string> = { feet: '尺', miles: '里', action: '动作', bonus: '附赠动作', reaction: '反应', minute: '分钟', hour: '小时', round: '轮', day: '天' }
export const DAMAGE: Record<string, string> = {
  acid: '强酸', bludgeoning: '钝击', cold: '寒冷', fire: '火焰', force: '力场', lightning: '闪电', necrotic: '暗蚀', piercing: '穿刺',
  poison: '毒素', psychic: '心灵', radiant: '光耀', slashing: '挥砍', thunder: '雷鸣',
}
export const CONDITION: Record<string, string> = {
  blinded: '目盲', charmed: '魅惑', deafened: '耳聋', exhaustion: '力竭', frightened: '恐慌', grappled: '擒抱', incapacitated: '失能', invisible: '隐形',
  paralyzed: '麻痹', petrified: '石化', poisoned: '中毒', prone: '倒地', restrained: '束缚', stunned: '震慑', unconscious: '昏迷',
}
export const LANGUAGE: Record<string, string> = {
  common: '通用语', dwarvish: '矮人语', elvish: '精灵语', giant: '巨人语', gnomish: '侏儒语', goblin: '地精语', halfling: '半身人语', orc: '兽人语',
  abyssal: '深渊语', celestial: '天界语', draconic: '龙语', 'deep speech': '深潜语', infernal: '炼狱语', primordial: '原初语', sylvan: '木族语',
  undercommon: '地底通用语', auran: '风族语', terran: '土族语', aquan: '水族语', ignan: '火族语', "thieves' cant": '盗贼黑话',
  anystandard: '任选一种标准语言', other: '其他（见种族说明）',
}
export const TOOL: Record<string, string> = {
  anygamingset: '任选一种游戏套组', anyartisanstool: '任选一种工匠工具', anymusicalinstrument: '任选一种乐器',
  'disguise kit': '易容工具', 'forgery kit': '伪造工具', "thieves' tools": '盗贼工具', 'herbalism kit': '草药工具', "navigator's tools": '导航工具',
  'vehicles (land)': '陆地载具', 'vehicles (water)': '水上载具', choose: '任选（见背景说明）',
  "poisoner's kit": '毒师工具', "alchemist's supplies": '炼金术士工具', "smith's tools": '铁匠工具', "tinker's tools": '工匠修理工具',
}
export const ITEM_CATEGORY: Record<string, string> = {
  weapon: '武器', ammunition: '弹药', wondrous: '奇物', shield: '盾牌', armor: '护甲', gear: '冒险装备', consumable: '消耗品', treasure: '财宝', mount: '坐骑', tool: '工具', vehicle: '载具',
}
export const RARITY: Record<string, string> = { none: '无', common: '普通', uncommon: '非普通', rare: '珍稀', 'very rare': '极珍稀', legendary: '传说', artifact: '神器', varies: '不定' }
export const WEAPON_CATEGORY: Record<string, string> = { simple: '简易', martial: '军用' }
/** A 弹药、F 灵巧、H 重型、L 轻型、LD 装填、R 触及、S 特殊、T 投掷、2H 双手、V 两用（正文里写作「两用」）、BF 扫射（正文里写作「扫射属性」）。
 *  AF（火器弹药）与 RLD（重新装填）在数据正文中没有用例，按字面意思人工译定。 */
export const WEAPON_PROPERTY: Record<string, string> = {
  A: '弹药', AF: '弹药（火器）', F: '灵巧', H: '重型', L: '轻型', LD: '装填', R: '触及', RLD: '重新装填', S: '特殊', T: '投掷', '2H': '双手', V: '两用', BF: '扫射',
}
export const RANGE_SHAPE: Record<string, string> = { point: '点', cone: '锥形', radius: '半径', line: '直线', hemisphere: '半球', sphere: '球形', cube: '立方', special: '特殊' }
export const RANGE_WORD: Record<string, string> = { self: '自身', touch: '触及', sight: '视线内', unlimited: '无限', special: '特殊' }
export const RECHARGE: Record<string, string> = { dawn: '黎明', dusk: '黄昏', short: '短休', long: '长休' }
export const RULE_CATEGORY: Record<string, string> = { variant: '变体规则', action: '动作' }

export const tr = lookup
/** 带「|」后缀的代码（如 AF|DMG）只取前半。 */
export const trCode = (map: Record<string, string>, v: unknown): string => lookup(map, String(v ?? '').split('|')[0])

/** 抗性、免疫、易伤里常是「英文代码 + 中文备注」的混合写法：把其中的英文伤害类型与状态词换成中文，备注保持原样。 */
export function trWords(text: string): string {
  const words: Record<string, string> = { ...DAMAGE, ...CONDITION }
  return text.replace(/[A-Za-z]+/g, (w) => words[w.toLowerCase()] ?? w)
}
