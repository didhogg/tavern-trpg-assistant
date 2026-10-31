/**
 * 数据里的枚举代码 → 中文显示。
 * 稳定编号与中文名统一定义在 src/rules/dnd5e2014/data/enums.ts；这里只做展示适配与代码清洗。
 */
import {
  ABILITY_LABELS, ARMOR_LABELS, CONDITION_LABELS, DAMAGE_LABELS, LANGUAGE_LABELS, RECHARGE_LABELS,
  SCHOOL_LABELS, SIZE_LABELS, SKILL_LABELS, TOOL_LABELS, WEAPON_CATEGORY_LABELS, WEAPON_PROPERTY_LABELS,
} from '../../rules/dnd5e2014/data/enums'

const lookup = (map: Record<string, string>, v: unknown): string => {
  const key = String(v ?? '')
  return map[key] ?? map[key.toLowerCase()] ?? key
}

export const ABILITY: Record<string, string> = ABILITY_LABELS
export const SKILL: Record<string, string> = { ...SKILL_LABELS, any: '任选一项技能', choose: '任选（见背景说明）' }
export const ARMOR_CATEGORY: Record<string, string> = ARMOR_LABELS
export const SIZE: Record<string, string> = SIZE_LABELS
export const MOVE: Record<string, string> = { walk: '步行', swim: '游泳', fly: '飞行', climb: '攀爬', burrow: '掘地', hover: '悬浮' }
export const CREATURE: Record<string, string> = {
  aberration: '异怪', beast: '野兽', celestial: '天界生物', construct: '构装体', dragon: '龙', elemental: '元素生物', fey: '精类', fiend: '邪魔',
  giant: '巨人', humanoid: '类人生物', monstrosity: '怪兽', ooze: '泥怪', plant: '植物', undead: '不死生物',
}
export const ALIGNMENT: Record<string, string> = { L: '守序', N: '中立', C: '混乱', G: '善良', E: '邪恶', U: '无阵营', A: '任意阵营', X: '', Y: '' }
export const SCHOOL: Record<string, string> = SCHOOL_LABELS
export const UNIT: Record<string, string> = { feet: '尺', miles: '里', action: '动作', bonus: '附赠动作', reaction: '反应', minute: '分钟', hour: '小时', round: '轮', day: '天' }
export const DAMAGE: Record<string, string> = DAMAGE_LABELS
export const CONDITION: Record<string, string> = CONDITION_LABELS
export const LANGUAGE: Record<string, string> = LANGUAGE_LABELS
export const TOOL: Record<string, string> = TOOL_LABELS
export const ITEM_CATEGORY: Record<string, string> = {
  weapon: '武器', ammunition: '弹药', wondrous: '奇物', shield: '盾牌', armor: '护甲', gear: '冒险装备', consumable: '消耗品', treasure: '财宝', mount: '坐骑', tool: '工具', vehicle: '载具', template: '变体模板', family: '物品家族',
}
export const RARITY: Record<string, string> = { none: '无', common: '普通', uncommon: '非普通', rare: '珍稀', 'very rare': '极珍稀', legendary: '传说', artifact: '神器', varies: '不定' }
export const WEAPON_CATEGORY: Record<string, string> = WEAPON_CATEGORY_LABELS
export const WEAPON_PROPERTY: Record<string, string> = WEAPON_PROPERTY_LABELS
export const RANGE_SHAPE: Record<string, string> = { point: '点', cone: '锥形', radius: '半径', line: '直线', hemisphere: '半球', sphere: '球形', cube: '立方', special: '特殊' }
export const RANGE_WORD: Record<string, string> = { self: '自身', touch: '触及', sight: '视线内', unlimited: '无限', special: '特殊' }
export const RECHARGE: Record<string, string> = RECHARGE_LABELS
export const RULE_CATEGORY: Record<string, string> = { variant: '变体规则', action: '动作', sense: '感官', skill: '技能', script: '文字系统', itemProperty: '物品属性', itemType: '物品类型', itemTypeExtra: '物品类型附加条目', quickref: '速查' }

export const tr = lookup
/** 带「|」后缀的代码（如 AF|DMG）只取前半。 */
export const trCode = (map: Record<string, string>, v: unknown): string => lookup(map, String(v ?? '').split('|')[0])

/** 抗性、免疫、易伤里常是「英文代码 + 中文备注」的混合写法：把其中的英文伤害类型与状态词换成中文，备注保持原样。 */
export function trWords(text: string): string {
  const words: Record<string, string> = { ...DAMAGE, ...CONDITION }
  return text.replace(/[A-Za-z]+/g, (w) => words[w.toLowerCase()] ?? w)
}
