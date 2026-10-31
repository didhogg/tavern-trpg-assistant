type Rec = Record<string, unknown>
const isObj = (v: unknown): v is Rec => !!v && typeof v === 'object' && !Array.isArray(v)

export interface JoinTarget { type: string; data: Rec }
export type JoinLookup = (id: string) => JoinTarget | undefined

/**
 * 「我加入别的条目」（joins）的语义检查，构建与安装共用（见 docs/包格式说明.md §跨包扩展）。
 * 只检查语义；「to 必须在本包或本包声明的依赖里」由调用方的引用校验负责（构建：layers + refs；安装：数据库里查）。
 * 返回问题列表，空数组表示合规。
 */
export function checkJoins(entry: { id: string; type: string; data: Rec }, lookup: JoinLookup): string[] {
  const joins = entry.data.joins
  if (joins === undefined) return []
  if (!Array.isArray(joins)) return [`${entry.id}：joins 必须是数组`]
  const problems: string[] = []
  joins.forEach((j, i) => {
    const at = `${entry.id} 的 joins[${i}]`
    if (!isObj(j) || typeof j.to !== 'string' || (j.as !== 'optional' && j.as !== 'option' && j.as !== 'member')) { problems.push(`${at}：缺少 to 或 as 不合法`); return }
    const target = lookup(j.to)
    if (!target) { problems.push(`${at}：目标「${j.to}」不存在`); return }
    if (j.as === 'member') {
      if (target.type !== 'item' || target.data.category !== 'family') problems.push(`${at}：as=member 的目标必须是物品家族`)
      return
    }
    if (entry.type !== 'feature') problems.push(`${at}：as=${j.as} 只能由特性登记`)
    if (target.type !== 'class' && target.type !== 'subclass') { problems.push(`${at}：目标必须是职业或子职业`); return }
    const level = j.level
    if (typeof level !== 'number' || !Number.isInteger(level) || level < 1 || level > 20) { problems.push(`${at}：level 必须是 1–20 的整数`); return }
    if (j.as === 'optional') {
      if (j.replaces !== undefined) {
        const replaced = typeof j.replaces === 'string' ? lookup(j.replaces) : undefined
        const owner = isObj(replaced?.data.owner) ? replaced!.data.owner.id : undefined
        if (!replaced) problems.push(`${at}：replaces「${String(j.replaces)}」不存在`)
        else if (owner !== j.to) problems.push(`${at}：replaces 必须是目标自己的特性`)
      }
      return
    }
    // option：目标在该等级必须有选择池；有多个时必须用 pool 指明
    const pools = (Array.isArray(target.data.advancement) ? target.data.advancement : []).filter((a): a is Rec => isObj(a) && a.kind === 'itemChoice' && a.level === level)
    if (pools.length === 0) problems.push(`${at}：目标在 ${level} 级没有选择池`)
    else if (pools.length > 1) {
      const hit = typeof j.pool === 'string' ? pools.filter((p) => Array.isArray(p.pool) && p.pool.includes(j.pool)) : []
      if (hit.length !== 1) problems.push(`${at}：目标在 ${level} 级有 ${pools.length} 个选择池，必须用 pool 唯一指明`)
    }
  })
  return problems
}
