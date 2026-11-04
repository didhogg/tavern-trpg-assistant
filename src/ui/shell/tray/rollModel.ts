import type { RollRow } from '../../../rules/dnd5e2014/derive'
import { contestOutcome, meetsDc } from '../../../rules/dnd5e2014/derive'

/** 骰盘「检定 / 豁免」的纯函数：自定义加值校验、骰式拼接、结果判定（U5R §11.2）。 */
export interface CustomRow { id: string; label: string; text: string }
export type CustomParse = { ok: true; text: string } | { ok: false; error: string }

/** 常数（+2 / −1 / 3）或骰式（1d4 / −1d6 / 2d6）；不收别的。 */
export function parseCustom(raw: string): CustomParse {
  const t = raw.trim().replace(/[−–]/g, '-').replace(/\s+/g, '')
  const m = /^([+-]?)(\d+)(?:d(\d+))?$/i.exec(t)
  if (!m) return { ok: false, error: '写成 +2、−1、1d4 或 2d6' }
  const sign = m[1] === '-' ? '-' : '+'
  if (m[3] === undefined) { const n = Number(m[2]); return Number.isFinite(n) && n <= 99 ? { ok: true, text: `${sign}${n}` } : { ok: false, error: '数值太大' } }
  const count = Number(m[2]); const sides = Number(m[3])
  if (count < 1 || count > 20 || sides < 2 || sides > 100) return { ok: false, error: '骰数 1–20，骰面 2–100' }
  return { ok: true, text: `${sign}${count}d${sides}` }
}

export const rowKey = (r: RollRow): string => `${r.label}|${r.source}|${r.dice ?? r.amount ?? ''}`

export interface FormulaPart { key: string; label: string; text: string; source: string }
/** 把自动行（去掉被忽略的）与自定义行拼成骰式：`1d20+4+1d4`；常数合并成一个。 */
export function buildFormula(auto: RollRow[], custom: CustomRow[], ignored: ReadonlySet<string>, base = '1d20'): { expression: string; parts: FormulaPart[] } {
  const parts: FormulaPart[] = []
  let constant = 0
  const dice: string[] = []
  for (const r of auto) {
    if (ignored.has(rowKey(r))) continue
    if (r.dice) { dice.push(`+${r.dice}`); parts.push({ key: rowKey(r), label: r.label, text: `+${r.dice}`, source: r.source }) }
    if (r.amount) { constant += r.amount; parts.push({ key: rowKey(r), label: r.label, text: `${r.amount > 0 ? '+' : '−'}${Math.abs(r.amount)}`, source: r.source }) }
  }
  for (const c of custom) {
    parts.push({ key: c.id, label: c.label, text: c.text.replace('-', '−'), source: '自定义' })
    if (/d/i.test(c.text)) dice.push(c.text)
    else constant += Number(c.text)
  }
  const tail = `${dice.join('')}${constant ? `${constant > 0 ? '+' : '-'}${Math.abs(constant)}` : ''}`
  return { expression: `${base}${tail}`, parts }
}

export type Verdict = { kind: 'pass' | 'fail' | 'win' | 'lose' | 'tie'; text: string }
export function judgeDc(total: number, dc: number): Verdict { return meetsDc(total, dc) ? { kind: 'pass', text: `成功（${total} ≥ DC ${dc}）` } : { kind: 'fail', text: `失败（${total} < DC ${dc}）` } }
export function judgeContest(mine: number, theirs: number): Verdict {
  const r = contestOutcome(mine, theirs)
  return r === 'a' ? { kind: 'win', text: `胜（${mine} > ${theirs}）` } : r === 'b' ? { kind: 'lose', text: `负（${mine} < ${theirs}）` } : { kind: 'tie', text: `平局，局面维持原样（${mine} = ${theirs}）` }
}
export function judgePassive(value: number, dc: number): Verdict { return value >= dc ? { kind: 'pass', text: `通过（被动 ${value} ≥ DC ${dc}）` } : { kind: 'fail', text: `未通过（被动 ${value} < DC ${dc}）` } }
