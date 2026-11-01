import { arr, rec } from './util'
import type { Row } from './load'

/** 纯文字机制特性分诊：A 影响派生数值（护甲、速度、生命上限、熟练、抗性、感官、先攻/被动、属性值）；B 影响行动、伤害、资源（需要在 U5.3/U5.5/M6 细化）；C 叙述或裁定。 */
export type Triage = 'A' | 'B' | 'C'
export interface Verdict { cls: Triage; tags: string[] }

const A_PATTERNS: Array<[string, RegExp]> = [
  ['护甲等级', /护甲等级[^。，；]{0,10}(提高|增加|增长|等于|变为|[+＋]\s*\d)|无甲|AC\s*[+＋]/],
  ['速度', /(步行|飞行|游泳|攀爬|掘穴|移动)?速度[^。，；]{0,14}(\d+\s*尺|提高|增加|变为|翻倍|等同)/],
  ['生命上限', /生命值上限|生命值最大值|每(个)?(级|等级)[^。，；]{0,8}生命值/],
  ['熟练', /(获得|习得|拥有)[^。，；]{0,12}(技能|工具|武器|护甲|豁免)[^。，；]{0,6}熟练|熟练项[^。，；]{0,6}(加|获得)|专精/],
  ['抗性免疫', /(获得|拥有)[^。，；]{0,12}(抗性|免疫)|对[^。，；]{0,16}(伤害)[^。，；]{0,6}(抗性|免疫)/],
  ['感官', /黑暗视觉|盲视|颤动感知|真实视觉|夜视/],
  ['先攻被动', /先攻[^。，；]{0,10}(加|[+＋]|优势)|被动(察觉|洞悉|调查|感知)[^。，；]{0,10}(加|[+＋]|提高)/],
  ['属性值', /(力量|敏捷|体质|智力|感知|魅力)(值)?[^。，；]{0,8}(提高|增加|\+\s*\d|[+＋]\d)|属性值[^。，；]{0,8}(提高|增加)/],
]
const B_PATTERNS: Array<[string, RegExp]> = [
  ['伤害', /额外[^。，；]{0,10}伤害|伤害[^。，；]{0,10}(增加|提高|加值)|造成[^。，；]{0,10}点/],
  ['动作', /(以|用)(一个)?(附赠动作|动作|反应)|可以[^。，；]{0,6}(附赠动作|反应)/],
  ['资源', /消耗|每(次)?(短休|长休)|使用次数|次数|重获|恢复/],
  ['攻击结算', /攻击检定|豁免检定|重击|优势|劣势/],
  ['法术', /法术|戏法|施展/],
]

function flat(v: unknown): string {
  if (typeof v === 'string') return v.replace(/\{\{[a-z]+:[^|}]*\|?([^}]*)\}\}/g, '$1')
  if (Array.isArray(v)) return v.map(flat).join(' ')
  if (v && typeof v === 'object') return Object.values(v as Record<string, unknown>).map(flat).join(' ')
  return ''
}

export function triage(row: Row): Verdict {
  const t = flat(row.data.text)
  const a = A_PATTERNS.filter(([, re]) => re.test(t)).map(([n]) => n)
  if (a.length) return { cls: 'A', tags: a }
  const b = B_PATTERNS.filter(([, re]) => re.test(t)).map(([n]) => n)
  if (b.length) return { cls: 'B', tags: b }
  return { cls: 'C', tags: [] }
}

/** 纯文字机制特性：role=mechanic，没有 effects、activities、uses。 */
export function isPlainMechanic(row: Row): boolean {
  return row.type === 'feature' && row.data.role === 'mechanic' && !arr(row.data.effects).length && !arr(row.data.activities).length && row.data.uses === undefined && !rec(row.data).joins
}
