import type { ArchiveGroupKey, ArchiveItem } from './archive'

/** 资料弹窗的数据（U5R §10.9）：名称、类别、获得方式、来源、说明正文；没有条目正文时用类别说明。 */
export interface InfoModel {
  title: string
  titleEn?: string
  rows: Array<{ label: string; value: string; ref?: string }>
  /** 条目编号：有就在弹窗里嵌入条目资料页（正文来自数据库）。 */
  ref?: string
  /** 没有条目时的说明正文。 */
  body: string[]
  removable: boolean
}

export const CATEGORY_NOTE: Record<ArchiveGroupKey, string> = {
  resist: '抗性：受到该类型伤害时伤害减半（玩家手册 p197）。同类型的抗性只算一次。',
  immune: '免疫：不受该类型伤害影响（玩家手册 p197）。',
  vulnerable: '易伤：受到该类型伤害时伤害加倍（玩家手册 p197）。',
  condition: '状态免疫：不会陷入该状态（玩家手册附录 A，p290–292）。',
  senses: '感官：黑暗视觉（p183）能在微光和黑暗中看清；盲视、震颤感知、真实视觉见怪物图鉴与玩家手册 p183–185。',
  languages: '语言：能说、读、写的语言（玩家手册 p123 语言表）。',
  weapons: '武器熟练：用该武器攻击时加熟练加值；分简易、军用两大类，也可具名单件（玩家手册 p146）。',
  armor: '护甲熟练：穿戴该类护甲不受惩罚；盾牌单列（玩家手册 p144）。',
  tools: '工具熟练：做相关检定时加熟练加值，专精加两倍（玩家手册 p154）。',
}
export const CATEGORY_NAME: Record<ArchiveGroupKey, string> = { resist: '伤害抗性', immune: '伤害免疫', vulnerable: '伤害易伤', condition: '状态免疫', senses: '感官', languages: '语言', weapons: '武器熟练', armor: '护甲熟练', tools: '工具熟练' }
export const SENSE_NOTE: Record<string, string> = {
  '黑暗视觉': '黑暗视觉：范围内的黑暗视为微光，微光视为明亮，但只能看灰度（玩家手册 p183）。',
  '盲视': '盲视：不靠视力也能感知半径内的环境（怪物图鉴）。',
  '震颤感知': '震颤感知：能感知接触同一表面的生物的位置（怪物图鉴）。',
  '真实视觉': '真实视觉：看透普通或魔法黑暗、隐形、变形等（怪物图鉴）。',
}

export function infoOfArchive(item: ArchiveItem, removable: boolean): InfoModel {
  const kind = CATEGORY_NAME[item.group]
  const sense = item.group === 'senses' ? Object.entries(SENSE_NOTE).find(([k]) => item.label.startsWith(k))?.[1] : undefined
  return {
    title: item.label,
    rows: [{ label: '类别', value: kind }, { label: '获得方式', value: item.source }],
    ref: item.ref,
    body: [sense ?? CATEGORY_NOTE[item.group]],
    removable,
  }
}
