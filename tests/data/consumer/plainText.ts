import { humanizeTokens } from '../../../src/ui/library/tokens'
import { entryFacts, type Fact } from '../../../src/ui/library/facts'
import type { Row } from './load'
import { arr, rec, str } from './util'

/** 把条目导出成给 AI 读的纯文字：去掉 {{ref/roll/dc/hit/atk/em}} 标记，正文块展开成行，表格展开成行。
 * 这是“交给 AI 的文字”（U4）的参考实现：不依赖界面，不泄漏编号和标记。 */
export function cleanMarkup(s: string): string {
  return humanizeTokens(s)
    .replace(/\{\{ref:[^|}]*\|([^}]*)\}\}/g, '$1')
    .replace(/\{\{ref:[^|}]*\}\}/g, '')
    .replace(/\{\{roll:[^|}]*\|([^}]*)\}\}/g, '$1')
    .replace(/\{\{roll:([^}]*)\}\}/g, '$1')
    .replace(/\{\{dc:([^}]*)\}\}/g, 'DC $1')
    .replace(/\{\{hit:([^}]*)\}\}/g, (_m, n: string) => (/^[+-]/.test(n) ? n : /^\d/.test(n) ? `+${n}` : n))
    .replace(/\{\{atk:[^|}]*\|([^}]*)\}\}/g, '$1')
    .replace(/\{\{em:([^}]*)\}\}/g, '$1')
    .replace(/[ \t]+/g, ' ')
    .trim()
}

function block(b: unknown, out: string[], depth = 0): void {
  if (typeof b === 'string') { out.push(cleanMarkup(b)); return }
  const o = rec(b)
  if (typeof o.p === 'string') out.push(cleanMarkup(o.p))
  if (typeof o.h === 'string') { out.push(`【${cleanMarkup(o.h)}】`); for (const x of arr(o.body)) block(x, out, depth + 1) }
  if (Array.isArray(o.list)) for (const x of o.list) { const t: string[] = []; block(x, t, depth + 1); out.push(`- ${t.join(' ')}`) }
  if (o.tableRef !== undefined) out.push(`（见表：${cleanMarkup(str(rec(o.tableRef).label))}）`)
  if (o.table !== undefined) {
    const t = rec(o.table)
    if (Array.isArray(t.cols)) out.push(arr(t.cols).map((c) => cleanMarkup(String(c))).join(' | '))
    for (const r of arr(t.rows)) out.push(arr(r).map((c) => cleanMarkup(String(c))).join(' | '))
  }
  if (typeof o.quote === 'string') out.push(`“${cleanMarkup(o.quote)}”`)
  if (typeof o.read === 'string') out.push(cleanMarkup(o.read))
  if (Array.isArray(o.read)) for (const x of o.read) block(x, out, depth + 1)
}

function section(label: string, list: unknown, out: string[]): void {
  const items = arr(list).map(rec)
  if (!items.length) return
  out.push(`\n${label}`)
  for (const it of items) {
    const t: string[] = []
    for (const b of arr(it.text)) block(b, t)
    const name = str(it.name) || str(it.h)
    out.push(`${name ? name + '：' : ''}${t.join(' ')}`.trim())
  }
}

/** 界面已有的“事实”（entryFacts：职业的熟练与职业表、怪物的数值行、法术的施法时间射程、物品的伤害护甲……）→ 文字。引用的名字用库里的名字补出来。 */
function factLines(facts: Fact[], nameOf: (id: string) => string): string[] {
  const out: string[] = []
  for (const f of facts) {
    const bits: string[] = []
    for (const p of f.parts ?? []) bits.push(typeof p === 'string' ? cleanMarkup(p) : (p.label ?? nameOf(p.ref)))
    if (f.members?.length) bits.push(f.members.map(nameOf).join('、'))
    if (bits.length) out.push(`${f.label}：${bits.join('')}`)
    else out.push(f.label)
    if (f.table) { out.push(f.table.cols.map((c) => cleanMarkup(String(c))).join(' | ')); for (const row of f.table.rows) out.push(row.map((c) => cleanMarkup(String(c))).join(' | ')) }
    for (const sec of f.sections ?? []) { out.push(`【${sec.name}】`); const t: string[] = []; for (const b of sec.text) block(b, t); out.push(...t) }
  }
  return out
}

export function plainText(r: Row, nameOf: (id: string) => string = (id) => id): string {
  const d = r.data
  const out: string[] = [`${r.name}${r.nameEn ? `（${r.nameEn}）` : ''}`, cleanMarkup(r.summary)]
  out.push(...factLines(entryFacts({ type: r.type, data: d } as never), nameOf))
  const body: string[] = []
  for (const b of arr(d.text)) block(b, body)
  for (const b of arr(d.lore)) block(b, body)
  if (typeof d.higherLevel === 'string') body.push(cleanMarkup(d.higherLevel))
  out.push(...body)
  section('特质', d.traits, out)
  section('动作', d.actions, out)
  section('附赠动作', d.bonusActions, out)
  section('反应', d.reactions, out)
  const lg = rec(d.legendary)
  section('传奇动作', lg.actions, out)
  if (arr(lg.lairActions).length) { const t: string[] = []; for (const b of arr(lg.lairActions)) block(b, t); out.push(`\n巢穴动作\n${t.join(' ')}`) }
  if (arr(lg.regionalEffects).length) { const t: string[] = []; for (const b of arr(lg.regionalEffects)) block(b, t); out.push(`\n区域效应\n${t.join(' ')}`) }
  for (const sc of arr(d.spellcasting).map(rec)) { const t: string[] = []; for (const b of arr(sc.text)) block(b, t); if (t.length) out.push(`\n${str(sc.name) || '施法'}：${t.join(' ')}`) }
  if (r.type === 'table' && arr(d.rows).length) {
    out.push('')
    out.push(arr(d.cols).map((c) => cleanMarkup(String(c))).join(' | '))
    for (const row of arr(d.rows).map(rec)) {
      const range = typeof row.min === 'number' ? (row.min === row.max ? `${row.min}` : `${row.min}-${row.max}`) : ''
      out.push(`${range ? range + ' ' : ''}${arr(row.cells).map((c) => cleanMarkup(String(c))).join(' | ')}`)
    }
  }
  return out.filter((x) => x !== undefined).join('\n')
}
