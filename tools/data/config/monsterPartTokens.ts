export interface MonsterPartToken {
  pattern: RegExp
  meaning: string
}

/** 5etools 怪物制作部件里的 <$…$> 占位符；构建时逐个校验，未登记即失败。 */
export const MONSTER_PART_TOKENS: MonsterPartToken[] = [
  { pattern: /^short_name$/, meaning: '生物简称' },
  { pattern: /^title_short_name$/, meaning: '生物简称（首字母大写/标题式）' },
  { pattern: /^dc__(str|dex|con|int|wis|cha)$/, meaning: '豁免 DC = 8 + 该属性调整值 + 熟练加值' },
  { pattern: /^damage_mod__(str|dex|con|int|wis|cha)$/, meaning: '该属性调整值，写在伤害骰后面：0 则为空，正数「 + n」，负数「 - n」' },
  { pattern: /^damage_avg__[0-9.]+\+(str|dex|con|int|wis|cha)$/, meaning: '平均伤害 = 向下取整（该数 + 该属性调整值）' },
  { pattern: /^to_hit__(str|dex|con|int|wis|cha)$/, meaning: '命中加值 = 熟练加值 + 该属性调整值（英文原版写法；中文数据里已译成文字）' },
  { pattern: /^dc_wis$/, meaning: '同 dc__wis（来源拼写瑕疵）' },
  { pattern: /^dc_体质$/, meaning: '同 dc__con（来源拼写瑕疵）' },
  { pattern: /^damage_mod_力量$/, meaning: '同 damage_mod__str（来源拼写瑕疵）' },
  { pattern: /^伤害修正__力量$/, meaning: '同 damage_mod__str（来源拼写瑕疵）' },
  { pattern: /^to_hit_敏捷$/, meaning: '命中加值 = 熟练加值 + 敏捷调整值（来源拼写瑕疵）' },
  { pattern: /^命中__力量$/, meaning: '命中加值 = 熟练加值 + 力量调整值（来源拼写瑕疵）' },
  { pattern: /^平均伤害__7\+力量$/, meaning: '同 damage_avg__7+str（来源拼写瑕疵）' },
]

export function tokenPatternOf(token: string): MonsterPartToken | undefined {
  return MONSTER_PART_TOKENS.find((entry) => entry.pattern.test(token))
}

export function assertMonsterPartTokens(tokens: Iterable<string>): void {
  const unknown = [...tokens].filter((token) => !tokenPatternOf(token))
  if (unknown.length) throw new Error(`未登记的怪物部件令牌：${unknown.join('、')}`)
}
