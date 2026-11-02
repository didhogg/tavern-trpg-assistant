import type { Fact } from './index'

type Obj = Record<string, unknown>
const isObj = (v: unknown): v is Obj => typeof v === 'object' && v !== null && !Array.isArray(v)
const arr = (v: unknown): unknown[] => (Array.isArray(v) ? v : [])
const str = (v: unknown): string => (typeof v === 'string' ? v : typeof v === 'number' ? String(v) : '')
const join = (v: string[]): string => v.filter(Boolean).join('、')

/** 其余有结构化字段的类型；字段名翻译成直白中文，未定的标签在报告列出。 */
export function extraFacts(type: string, d: Obj): Fact[] {
  const out: Fact[] = []
  const add = (label: string, value: string): void => { if (value) out.push({ label, parts: [value] }) }
  switch (type) {
    case 'deity':
      add('称号', str(d.title)); add('阵营', str(d.alignment)); add('领域', join(arr(d.domains).map(str))); add('象征', str(d.symbol)); add('万神殿', str(d.pantheon)); add('领域', join(arr(d.pantheon).map(str)))
      break
    case 'language':
      add('类型', str(d.type)); add('文字', str(d.script)); add('使用者', join(arr(d.speakers).map(str))); add('常见地区', join(arr(d.regions).map(str)))
      break
    case 'feat': case 'condition': case 'disease': case 'status':
      add('前置', str(d.prerequisite)); add('效果', join(arr(d.effects).map(str))); break
    case 'hazard': case 'object': case 'vehicle': case 'monsterPart':
      add('类型', str(d.type)); add('等级', str(d.level)); add('护甲等级', str(d.ac)); add('生命值', isObj(d.hp) ? `${str(d.hp.average)}${d.hp.formula ? `（${str(d.hp.formula)}）` : ''}` : str(d.hp)); add('速度', isObj(d.speed) ? join(Object.entries(d.speed).map(([k, v]) => `${k} ${v} 尺`)) : str(d.speed)); add('属性', isObj(d.abilities) ? join(Object.entries(d.abilities).map(([k, v]) => `${k} ${v}`)) : ''); add('来源', join(arr(d.attachedItems).map(str))); break
    case 'cult': case 'reward': case 'charoption':
      add('类型', str(d.type)); add('先决条件', str(d.prerequisite)); add('效果', join(arr(d.effects).map(str))); add('可选特性', str(d.optionKind)); break
    case 'rule':
      add('类别', str(d.category)); add('规则', str(d.ruleType)); break
    default: break
  }
  return out
}

export function factsToText(facts: Fact[]): string {
  return facts.map((f) => {
    const body = f.parts?.map((p) => typeof p === 'string' ? p : (p.label ?? p.ref)).join('') ?? ''
    const table = f.table ? f.table.rows.map((r) => r.join('／')).join('\n') : ''
    return `${f.label}：${[body, table].filter(Boolean).join('\n')}`
  }).join('\n')
}
