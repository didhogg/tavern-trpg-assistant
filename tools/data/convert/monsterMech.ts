import type { PlannedEntry } from './plan'
import type { ConvertContext } from './context'
import { resolveUid } from './carry'

type Rec = Record<string, unknown>
const isObj = (v: unknown): v is Rec => !!v && typeof v === 'object' && !Array.isArray(v)
const str = (v: unknown): string => (typeof v === 'string' ? v : '')

/** 条件原话 → `except`（01 F1；表见 04 的 4-7）。 */
function exceptOf(when: string): 'magical' | 'silvered' | 'adamantine' | 'magicalOrSilvered' | 'other' {
  if (/非魔法.{0,6}(或|和|与).{0,4}非银|魔法或银/.test(when)) return 'magicalOrSilvered'
  if (/非魔法/.test(when)) return 'magical'
  if (/非银/.test(when)) return 'silvered'
  if (/非精金/.test(when)) return 'adamantine'
  return 'other'
}

/**
 * 5etools 原始的 resist／immune／vulnerable 里，带条件的是对象 `{resist:[代码…], note:'来自非魔法攻击', cond:true}`。
 * 以前被拼成一串文字；这里把它拆成纯代码＋`*Conditional`（01 F1）。没有条件的对象（`special`、嵌套）保持原文字。
 */
function splitConditional(raw: Rec, data: Rec): void {
  for (const key of ['resist', 'immune', 'vulnerable'] as const) {
    const src = Array.isArray(raw[key]) ? (raw[key] as unknown[]) : []
    const out = Array.isArray(data[key]) ? (data[key] as unknown[]) : []
    if (src.length !== out.length) continue
    const keep: unknown[] = []
    const cond: Array<{ damage: string[]; except: string; when: string }> = []
    src.forEach((item, i) => {
      const list = isObj(item) ? item[key] : undefined
      const when = isObj(item) ? [str(item.preNote), str(item.note)].filter(Boolean).join(' ') : ''
      if (isObj(item) && Array.isArray(list) && list.length && list.every((x) => typeof x === 'string') && when) cond.push({ damage: list as string[], except: exceptOf(when), when })
      else keep.push(out[i])
    })
    if (!cond.length) continue
    data[key] = keep
    data[`${key}Conditional`] = cond
  }
}

/** `{@recharge}`＝6；`{@recharge 5}`＝5–6（01 F2）。 */
function rechargeOf(name: string, shown: string): { min: number; max: number } | undefined {
  const m = /\{@recharge(?:\s+(\d))?\}/.exec(name)
  if (m) return { min: m[1] ? Number(m[1]) : 6, max: 6 }
  const t = /充能\s*(\d)(?:\s*[–\-—~～]\s*(\d))?\s*[）)]/.exec(shown)
  return t ? { min: Number(t[1]), max: t[2] ? Number(t[2]) : Number(t[1]) } : undefined
}

/** 动作名里"（短休或长休后充能）"一类：用一次后休息恢复（不是 d6 充能）。施展某类法术后恢复的写 special。 */
function restUsesOf(shown: string): { max: number; recharge: 'shortOrLong' | 'long' | 'short' | 'special' } | undefined {
  const m = /[（(]([^）)]*充能[^）)]*)[）)]/.exec(shown)
  if (!m || /充能\s*\d/.test(m[1])) return undefined
  const t = m[1]
  if (/短休或长休|短休与长休/.test(t)) return { max: 1, recharge: 'shortOrLong' }
  if (/长休/.test(t)) return { max: 1, recharge: 'long' }
  if (/短休/.test(t)) return { max: 1, recharge: 'short' }
  return { max: 1, recharge: 'special' }
}

/** 传奇动作名里的"（花费 N 个动作）"／"(Costs N Actions)"（01 F3）。 */
function costOf(name: string): number | undefined {
  const m = /花费\s*(\d+)\s*个?动作|Costs\s+(\d+)\s+Actions/i.exec(name)
  return m ? Number(m[1] ?? m[2]) : undefined
}

function eachAction(raw: Rec, data: Rec, fn: (rawAction: Rec, action: Rec, legendary: boolean) => void): void {
  const pairs: Array<[string, unknown, boolean]> = [['trait', data.traits, false], ['action', data.actions, false], ['bonus', data.bonusActions, false], ['reaction', data.reactions, false], ['legendary', isObj(data.legendary) ? data.legendary.actions : undefined, true]]
  for (const [rk, list, legendary] of pairs) {
    const src = Array.isArray(raw[rk]) ? (raw[rk] as unknown[]) : []
    const out = Array.isArray(list) ? (list as unknown[]) : []
    if (src.length !== out.length) continue
    src.forEach((r, i) => { if (isObj(r) && isObj(out[i])) fn(r, out[i] as Rec, legendary) })
  }
}

/** 护甲来源里的 `{@item 板甲|phb}` → `ac[].items`（01 F8）。 */
function acItems(raw: Rec, data: Rec, ctx: ConvertContext, source: string): void {
  const src = Array.isArray(raw.ac) ? raw.ac : []
  const out = Array.isArray(data.ac) ? (data.ac as Rec[]) : []
  if (src.length !== out.length) return
  src.forEach((item, i) => {
    if (!isObj(item) || !Array.isArray(item.from)) return
    const ids = item.from.flatMap((f) => [...str(f).matchAll(/\{@item ([^}|]+)(?:\|([^}|]*))?[^}]*\}/g)].map((m) => resolveUid(ctx, ['item'], `${m[1]}|${m[2] ?? ''}`, source))).filter((x): x is string => !!x)
    if (ids.length) out[i].items = [...new Set(ids)]
  })
}

/** 攻击行动名里恰好含一件携带物的名字 → 该攻击的 `item`（01 F8）。含零件或多件不连。 */
function attackItems(raw: Rec, data: Rec, ctx: ConvertContext, source: string): void {
  const carried = (Array.isArray(raw.attachedItems) ? raw.attachedItems : []).map((u) => [str(u).split('|')[0], resolveUid(ctx, ['item'], str(u), source)] as const).filter((p): p is readonly [string, string] => !!p[0] && !!p[1])
  if (!carried.length) return
  eachAction(raw, data, (_r, action) => {
    const name = str(action.name)
    const hit = carried.filter(([n]) => name.includes(n))
    if (hit.length !== 1) return
    for (const a of Array.isArray(action.activities) ? (action.activities as Rec[]) : []) if (a.kind === 'attack') a.item = hit[0][1]
  })
}

/** 怪物：把 5etools 原始数据里本来就结构化、以前被压成文字的机制读出来。 */
export function addMonsterMechanics(plan: PlannedEntry, data: Rec, ctx: ConvertContext): void {
  const raw = plan.raw as Rec
  splitConditional(raw, data)
  eachAction(raw, data, (r, action, legendary) => {
    const recharge = rechargeOf(str(r.name), str(action.name))
    if (recharge) action.rechargeRoll = recharge
    else { const uses = restUsesOf(str(action.name)); if (uses) action.uses = uses }
    const cost = legendary ? costOf(str(r.name)) : undefined
    if (cost !== undefined && cost > 1) action.cost = cost
  })
  acItems(raw, data, ctx, plan.source)
  attackItems(raw, data, ctx, plan.source)
}
