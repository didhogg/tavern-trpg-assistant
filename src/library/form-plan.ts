// P5.5 §16.10 2b：表单安排（后端判断，界面照着画）。按官方用法统计（field-usage）+ 自动字段（autoFields）+ 出版信息标记（publish），
// 对所有类别同一套规则，不写字段名单：
// - 分块：必填 → 常用（官方 ≥ 10% 的条目在用，按使用率排）→ 更多（其余，收起可搜）；出版信息、自动字段、系统写的（来源由包定、
//   规则版本由规则定）不出现。官方没有这一类（统计 0 条）：除必填外都在「更多」。
// - 几种写法：默认显示官方用得最多的那种，其余按用量排在「换一种写法」里；每种写法的叫法 = 这种写法独有的子项的名字。
// - 套组：用得少的子项（< 10%、不是必填）默认收起。
// - 常见取值：按官方次数排（下拉选项排序、一串代号给常见组合）。
import type { BrewField, FieldShape } from './brew-validate'
import { resolve, type Defs, type Shape } from './field-shape-core'
import type { FieldUsage } from './field-usage'

/** 一个位置（路径同 field-usage：字段名，套组「.子项」，列表里一项「[]」，名字 → 值「{}」）的安排。 */
export interface PlanAt {
  /** 几种写法：下标按用量从多到少（第一个 = 默认）。 */
  order?: number[]
  /** 几种写法：每种的叫法（按 branches 下标）。 */
  names?: string[]
  /** 几种写法：值得放进「换一种写法」菜单的（官方 ≥ 5% 在用；没有统计时全给）。罕见的写法在 JSON 里写。 */
  alt?: number[]
  /** 套组：默认收起的子项（用得少）。 */
  rare?: string[]
  /** 常见取值（按次数从多到少）。 */
  values?: unknown[]
}

export interface FormPlan {
  required: string[]
  common: string[]
  more: string[]
  /** 表单不出现的（出版信息、自动字段、系统写的）。 */
  hidden: string[]
  at: Record<string, PlanAt>
}

const COMMON = 0.1
/** 别的写法至少有这么多官方条目在用，才放进「换一种写法」菜单（1% 时速度、属性值下面到处是菜单，11-13 截图后提到 5%）。 */
const ALT = 0.05
/** 系统写的字段：来源由包决定，规则版本由规则决定（custom-entries persist）。 */
const SYSTEM = new Set(['source', 'edition'])

/** 路径上的形状（几种写法那一层不占路径，按「这条路径下面还要往哪走」挑分支）。 */
function shapeAt(fields: BrewField[], defs: Defs, path: string): Shape | null {
  const m = /^([^.[{]+)(.*)$/.exec(path)
  const f = m && fields.find((x) => x.name === m[1])
  if (!m || !f?.shape) return null
  let s: Shape = resolve(f.shape, defs)
  for (const step of m[2].match(/\.[^.[{]+|\[\]|\{\}/g) ?? []) {
    const next = (x: Shape): Shape | null => {
      if (x.c === 'pick') { for (const b of x.branches) { const r = next(resolve(b.shape, defs)); if (r) return r } return null }
      if (step === '[]') return x.c === 'list' ? resolve(x.of, defs) : null
      if (step === '{}') return x.c === 'map' ? resolve(x.of, defs) : null
      if (x.c !== 'group') return null
      const p = x.props.find((q) => q.name === step.slice(1))
      return p ? resolve(p.shape, defs) : null
    }
    const r = next(s)
    if (!r) return null
    s = r
  }
  return s
}

/** 路径最后一段的字段名（alignment[] → alignment，type.tags[] → tags）。 */
const lastName = (path: string): string => /([^.[{\]}]+)(?:\[\]|\{\})*$/.exec(path)?.[1] ?? path

const KIND: Record<string, string> = { text: '自己写', number: '填数字', switch: '是 / 否', select: '从列表选', multiselect: '选几个', list: '写好几个', map: '名字 → 值', entries: '正文', const: '固定值', json: '在 JSON 里写', group: '一组', pick: '几种写法' }

/**
 * 每种写法的叫法：套组写「带 + 这种写法独有的子项」，其他按控件说。重名的补序号。
 * 和字段同名的子项不算（作者常把主值写成同名子项：AC 的 {ac, from}、类型的 {type, tags}、阵营的 {alignment, chance}），
 * 这样阵营那种叫「带概率、备注」而不是「带阵营……」。
 */
export function branchNames(shape: Extract<Shape, { c: 'pick' }>, defs: Defs, label: (name: string) => string, field = ''): string[] {
  const groups = shape.branches.map((b) => resolve(b.shape, defs))
  const propsOf = (s: Shape) => (s.c === 'group' ? s.props.map((p) => p.name) : [])
  const names = groups.map((s, i) => {
    if (s.c !== 'group') return KIND[s.c] ?? '其他'
    const others = new Set(groups.flatMap((o, j) => (j === i ? [] : propsOf(o))))
    const all = propsOf(s).filter((p) => !others.has(p))
    const own = all.filter((p) => p !== field).length ? all.filter((p) => p !== field) : all
    return own.length ? `带${own.slice(0, 3).map(label).join('、')}` : KIND.group
  })
  return names.map((n, i) => (names.indexOf(n) !== i || names.lastIndexOf(n) !== i ? `${n}（${names.slice(0, i + 1).filter((x) => x === n).length}）` : n))
}

export function formPlan(table: { fields: BrewField[]; defs: Defs; labels: Record<string, string> }, usage: FieldUsage | null, auto: string[]): FormPlan {
  const label = (n: string) => table.labels[n] ?? n
  const hidden = table.fields.filter((f) => !f.internal && (f.publish || SYSTEM.has(f.name) || auto.includes(f.name))).map((f) => f.name)
  const usable = table.fields.filter((f) => !f.internal && f.shape && !hidden.includes(f.name))
  const share = (f: BrewField) => (usage?.items ? (usage.fields[f.name] ?? 0) / usage.items : 0)
  const byUse = (a: BrewField, b: BrewField) => share(b) - share(a)
  const optional = usable.filter((f) => !f.required)
  const at: Record<string, PlanAt> = {}
  for (const [path, u] of Object.entries(usage?.at ?? {})) {
    const s = shapeAt(table.fields, table.defs, path)
    if (!s) continue
    const plan: PlanAt = {}
    if (s.c === 'pick') {
      const used = (i: number) => u.branches?.[i] ?? 0
      plan.order = s.branches.map((_, i) => i).sort((a, b) => used(b) - used(a) || a - b)
      const total = s.branches.reduce((n, _, i) => n + used(i), 0)
      plan.alt = plan.order.filter((i) => !total || used(i) / total >= ALT)
      plan.names = branchNames(s, table.defs, label, lastName(path))
    }
    const groups = s.c === 'group' ? [s] : s.c === 'pick' ? s.branches.map((b) => resolve(b.shape, table.defs)).filter((g): g is Extract<Shape, { c: 'group' }> => g.c === 'group') : []
    if (groups.length && u.n) {
      const rare = groups.flatMap((g) => g.props.filter((p) => !p.required && (u.sub?.[p.name] ?? 0) / u.n < COMMON).map((p) => p.name))
      if (rare.length) plan.rare = [...new Set(rare)]
    }
    if (u.values?.length) plan.values = u.values.map(([v]) => JSON.parse(v) as unknown)
    if (Object.keys(plan).length) at[path] = plan
  }
  // 官方没统计到的「几种写法」也要有叫法（自制才有的类别、官方从没用过的字段）
  const names = (shape: FieldShape | undefined, path: string, depth = 0): void => {
    if (!shape || depth > 6) return
    const s = resolve(shape, table.defs)
    if (s.c === 'pick') {
      at[path] ??= {}
      at[path].names ??= branchNames(s, table.defs, label, lastName(path))
      at[path].order ??= s.branches.map((_, i) => i)
      at[path].alt ??= at[path].order
      for (const b of s.branches) names(b.shape, path, depth + 1)
    } else if (s.c === 'group') for (const p of s.props) names(p.shape, `${path}.${p.name}`, depth + 1)
    else if (s.c === 'list') names(s.of, `${path}[]`, depth + 1)
    else if (s.c === 'map') names(s.of, `${path}{}`, depth + 1)
  }
  for (const f of usable) names(f.shape, f.name)
  return {
    required: usable.filter((f) => f.required).map((f) => f.name),
    common: optional.filter((f) => share(f) >= COMMON).sort(byUse).map((f) => f.name),
    more: optional.filter((f) => share(f) < COMMON).sort((a, b) => byUse(a, b) || a.name.localeCompare(b.name)).map((f) => f.name),
    hidden,
    at,
  }
}
