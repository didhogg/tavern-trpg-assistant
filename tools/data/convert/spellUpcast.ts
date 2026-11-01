import { DAMAGE_FROM_CN } from './common'

type Rec = Record<string, unknown>
export type Upcast = { kind: 'damage'; dice: string; type: string; step: number } | { kind: 'heal'; dice: string; step: number } | { kind: 'note'; text: string; auto: false }

const DAMAGE_CODES = ['acid', 'bludgeoning', 'cold', 'fire', 'force', 'lightning', 'necrotic', 'piercing', 'poison', 'psychic', 'radiant', 'slashing', 'thunder']

function flat(value: unknown, out: string[] = []): string[] {
  if (typeof value === 'string') out.push(value)
  else if (Array.isArray(value)) for (const v of value) flat(v, out)
  else if (value && typeof value === 'object') for (const v of Object.values(value)) flat(v, out)
  return out
}

/** 升环范围的间隔：`3-9` 逐环（1）；`2,4,6,8` 每两环（2）；不等距返回 undefined。 */
function stepOf(range: string): number | undefined {
  if (/^\d-\d$/.test(range)) return 1
  const levels = range.split(',').map(Number)
  if (levels.length < 3 || levels.some((n) => !Number.isInteger(n))) return undefined
  const d = levels[1] - levels[0]
  return d > 0 && levels.every((n, i) => i === 0 || n - levels[i - 1] === d) ? d : undefined
}

/** 升环追加量的导入统计（构建日志与第 1 站报告用）。 */
export const upcastStats = { spellsWithTag: 0, imported: 0, noted: 0, unresolved: [] as string[] }

/**
 * 从 5etools 的升环标签导入升环结构（G2.5 第 1 站）：
 * `{@scaledamage 8d6|3-9|1d6}` → { kind:'damage', dice:'1d6', type, step }（逐环 step=1；`2,4,6,8` 这种每两环的 step=2；伤害类型取法术唯一的伤害类型，
 * 多种时按基础骰式在正文里找“N 点某某伤害”）；`{@scaledice 1d4|1-9|1d4}` 出现在“恢复/治疗”句子里 → { kind:'heal', dice, step:1 }。
 * 只要法术里有一个标签认不出（伤害类型要玩家选、每两环才加、scaledice 不是恢复……），整个法术只写一条 `note`
 * （原 higherLevel 文字，auto:false，不自动计算），绝不猜、不半自动半文字。
 */
export function upcastFromRaw(raw: Rec, name: string, higherText: string | undefined): Upcast[] | undefined {
  const higher = flat(raw.entriesHigherLevel).join(' ')
  const tags = [...higher.matchAll(/\{@(scaledamage|scaledice) ([^}|]+)\|([^}|]+)\|([^}|]+)\}/g)]
  if (!tags.length) return undefined
  upcastStats.spellsWithTag += 1
  const body = flat(raw.entries).join(' ')
  const inflicted = (Array.isArray(raw.damageInflict) ? raw.damageInflict.map(String) : []).filter((t) => DAMAGE_CODES.includes(t))
  const out: Upcast[] = []
  const bad: string[] = []
  for (const m of tags) {
    const [, tag, base, range, inc] = m
    const step = stepOf(range.trim())
    if (!step) { bad.push(`${name}：${m[0]}（升环范围不是等距）`); continue }
    const dice = inc.replace(/\s+/g, '')
    if (tag === 'scaledamage') {
      let type = inflicted.length === 1 ? inflicted[0] : undefined
      if (!type) {
        const cn = new RegExp(`@damage ${base.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/\s+/g, '\\s*')}[^]*?点([\\u4e00-\\u9fa5]{1,4})伤害`).exec(body)?.[1]
        type = cn ? DAMAGE_FROM_CN[cn.replace(/^[点的]/, '')] : undefined
      }
      if (!type || !DAMAGE_CODES.includes(type)) { bad.push(`${name}：${m[0]}（认不出伤害类型）`); continue }
      out.push({ kind: 'damage', dice, type, step })
    } else {
      const sentence = higher.slice(0, m.index).split(/[。；]/).pop() ?? ''
      if (/恢复|治疗/.test(sentence)) out.push({ kind: 'heal', dice, step })
      else bad.push(`${name}：${m[0]}（scaledice 不在恢复/治疗句子里）`)
    }
  }
  // 两个以上的伤害标签落在同一种伤害类型上（冰墙术：墙体与穿过墙），读取器分不清各追加给哪一部分 → 只留文字
  const types = out.filter((u) => u.kind === 'damage').map((u) => (u as { type: string }).type)
  if (new Set(types).size !== types.length) bad.push(`${name}：多个升环伤害落在同一种伤害类型上`)
  if (bad.length) {
    upcastStats.unresolved.push(...bad)
    if (!higherText) return undefined
    upcastStats.noted += 1
    return [{ kind: 'note', text: higherText, auto: false }]
  }
  upcastStats.imported += 1
  return out
}
