import type { ConvertContext } from './context'

type Rec = Record<string, unknown>
const isObj = (v: unknown): v is Rec => !!v && typeof v === 'object' && !Array.isArray(v)
const SCHOOL: Record<string, string> = { A: 'abjuration', C: 'conjuration', D: 'divination', E: 'enchantment', V: 'evocation', I: 'illusion', N: 'necromancy', T: 'transmutation' }

interface Choose { level: string; classes: string[]; schools: string[]; ritual: boolean; attack: boolean; count: number }

/** 5etools `{choose: "level=1|class=吟游诗人|school=E;D|components & miscellaneous=仪式|spell attack=m;r;o", count}` → 结构。 */
function parseChoose(obj: Rec, classShort: Map<string, string>): Choose | undefined {
  if (typeof obj.choose !== 'string') return undefined
  const kv = new Map(obj.choose.split('|').map((p) => { const i = p.indexOf('='); return [p.slice(0, i).trim(), p.slice(i + 1).trim()] as const }))
  const level = kv.get('level')
  if (!level || !/^\d$/.test(level)) return undefined
  const classes = (kv.get('class') ?? '').split(';').filter(Boolean).map((c) => classShort.get(c) ?? '')
  if (classes.some((c) => !c)) return undefined
  return { level, classes, schools: (kv.get('school') ?? '').split(';').filter(Boolean).map((s) => SCHOOL[s] ?? ''), ritual: /仪式|ritual/i.test(kv.get('components & miscellaneous') ?? ''), attack: kv.has('spell attack'), count: Number(obj.count ?? 1) }
}

function chooses(set: unknown, classShort: Map<string, string>, out: Choose[] = []): Choose[] {
  if (Array.isArray(set)) for (const x of set) chooses(x, classShort, out)
  else if (isObj(set)) {
    const c = parseChoose(set, classShort)
    if (c) out.push(c)
    else for (const [k, v] of Object.entries(set)) if (k !== 'name' && k !== 'ENG_name' && k !== 'ability') chooses(v, classShort, out)
  }
  return out
}

const token = (c: Choose, cls: string): string => ['spell:class=' + cls, `level=${c.level}`, ...(c.schools.filter(Boolean).length ? [`school=${c.schools.filter(Boolean).join('|')}`] : []), ...(c.ritual ? ['ritual=true'] : []), ...(c.attack ? ['attack=true'] : [])].join(',')

/**
 * 专长的"自选法术"（5etools `additionalSpells` 里的 `choose`）→ 任选记号（01 E3）。
 * 多套（按职业分，如魔法学徒、仪式施法者、法术狙击手）：先选职业，后面的法术池写 `class=@<选择id>`。
 */
export function featSpellChoices(raw: Rec, featId: string, ctx: ConvertContext): Array<Rec> {
  const sets = Array.isArray(raw.additionalSpells) ? raw.additionalSpells : []
  if (!sets.length) return []
  const classShort = new Map<string, string>()
  for (const [key, id] of ctx.classIds) classShort.set(key.split('|')[0], id.split('.')[1])
  const perSet = sets.map((s) => chooses(s, classShort))
  if (!perSet.some((x) => x.length)) return []
  const byClass = sets.length > 1 && perSet.every((x) => x.length && x.every((c) => c.classes.length === 1) && new Set(x.map((c) => c.classes[0])).size === 1)
  if (byClass) {
    const id = `${featId.split('.')[1]}-class`
    const classes = [...new Set(perSet.map((x) => x[0].classes[0]))]
    return [{ id, count: 1, pool: classes.map((c) => `class:${c}`) }, ...perSet[0].map((c) => ({ count: c.count, pool: [token(c, `@${id}`)] }))]
  }
  if (sets.length > 1) return []
  return perSet[0].map((c) => ({ count: c.count, pool: c.classes.length ? c.classes.map((cls) => token(c, cls)) : [token(c, 'any')] }))
}
