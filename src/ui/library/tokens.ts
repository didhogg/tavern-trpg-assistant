const ABILITY: Record<string, string> = {
  str: '力量', dex: '敏捷', con: '体质', int: '智力', wis: '感知', cha: '魅力',
  力量: '力量', 敏捷: '敏捷', 体质: '体质', 智力: '智力', 感知: '感知', 魅力: '魅力',
}
const AB = '(str|dex|con|int|wis|cha|力量|敏捷|体质|智力|感知|魅力)'
const TOKEN = /<\$([^$]+)\$>/g
const RULES: Array<[RegExp, (m: RegExpExecArray) => string]> = [
  [/^(?:title_)?short_name$/, () => '该生物'],
  [new RegExp(`^dc_{1,2}${AB}$`), (m) => `（8＋熟练加值＋${ABILITY[m[1]]}调整值）`],
  [new RegExp(`^(?:to_hit_{1,2}|命中__)${AB}$`), (m) => `（熟练加值＋${ABILITY[m[1]]}调整值）`],
  [new RegExp(`^(?:damage_mod_{1,2}|伤害修正__)${AB}$`), (m) => `＋${ABILITY[m[1]]}调整值`],
  [new RegExp(`^(?:damage_avg__|平均伤害__)([0-9.]+)\\+${AB}$`), (m) => `${m[1]}＋${ABILITY[m[2]]}调整值`],
]

/** 怪物制作部件里的 <$…$> 占位符（要套到具体生物上才有数值）→ 玩家看得懂的文字；不认识的占位符原样保留。 */
export function humanizeTokens(text: string): string {
  if (!text.includes('<$')) return text
  return text.replace(TOKEN, (whole, token: string) => {
    for (const [pattern, make] of RULES) {
      const m = pattern.exec(token)
      if (m) return make(m)
    }
    return whole
  })
}
