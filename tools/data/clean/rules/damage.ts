import { mapPlain, mapStrings } from '../walk'
import type { Rule } from '../types'

const WORDS = '强酸|钝击|寒冷|冷冻|火焰|力场|闪电|暗蚀|黯蚀|死灵|穿刺|毒素|心灵|光耀|挥砍|雷鸣'
const FIX: Record<string, string> = { 冷冻: '寒冷', 死灵: '暗蚀', 黯蚀: '暗蚀', 坏死: '暗蚀', 光辉: '光耀' }
// ① 紧跟「伤害/抗性/免疫/易伤」的旧写法
const BEFORE_DAMAGE = /(冷冻|死灵|黯蚀|坏死|光辉)(?=伤害|抗性|免疫|易伤)/g
// ② 「黯蚀」是别名，一律改
const ALIAS = /黯蚀/g
// ③ 伤害类型列表：至少两个伤害类型词，用顿号、逗号、与、和、或连接；最后一项后面不能紧跟汉字（避免「冷冻射线」这类名称）
const LIST = new RegExp(`(?:${WORDS})(?:\\s*(?:[、，,]|与|和|或)\\s*(?:${WORDS}))+(?![\\u4e00-\\u9fff])`, 'g')

// ④ 精类魔契（TCE）的元素礼物按精的种类列出伤害类型：「火焰（火巨灵），冷冻（水巨灵）」
const GENIE = /冷冻(?=（水巨灵）)/g

export function fixDamageWords(plain: string): string {
  return plain
    .replace(GENIE, '寒冷')
    .replace(BEFORE_DAMAGE, (m) => FIX[m])
    .replace(ALIAS, '暗蚀')
    .replace(LIST, (run) => run.replace(/冷冻|死灵|黯蚀/g, (m) => FIX[m]))
}

/** 规则 10：伤害类型统一写成「寒冷」「暗蚀」。名称（冷冻射线、死灵法师…）不动。 */
export const damageRule: Rule = {
  id: 'R10-damage',
  title: '伤害类型统一为寒冷、暗蚀',
  zhOnly: true,
  apply(entry, { record }) {
    const fix = (value: string, path: string): string | undefined => {
      if (!/冷冻|死灵|黯蚀|坏死|光辉/.test(value)) return undefined
      const next = mapPlain(value, fixDamageWords)
      if (next === value) return undefined
      record(path, value, next)
      return next
    }
    const summary = fix(entry.summary, 'summary')
    if (summary !== undefined) entry.summary = summary
    return mapStrings(entry.data, fix) + (summary !== undefined ? 1 : 0)
  },
}
