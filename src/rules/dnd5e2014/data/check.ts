import { checkJoins } from './joins'
import { structuralRefs } from './refs'

type Rec = Record<string, unknown>
export interface PackCheckInput {
  packId: string
  entries: Array<{ id: string; type: string; data: Rec }>
  /** 查任意已知条目（本包的、已安装的）；不存在返回 undefined。 */
  lookup: (id: string) => { type: string; data: Rec; packId: string } | undefined
  /** 本包能引用的包：自己、SRD、声明的依赖及其依赖的依赖。 */
  reach: Set<string>
}

/**
 * 安装 / 导入一个包时检查条目之间的引用（G1）：官方包与自制包同一套规则。
 * ① 结构引用（升级授予、所属、基础物品、成员、joins……）指向的条目必须存在；
 * ② 目标必须在本包或本包声明的依赖里（方向只能向下）；
 * ③ joins 的语义规则（目标类型、等级、选择池、替代关系）。
 */
export function checkPackEntries(input: PackCheckInput): string[] {
  const problems: string[] = []
  for (const e of input.entries) {
    for (const r of structuralRefs(e.data)) {
      const target = input.lookup(r.id)
      if (!target) problems.push(`「${e.id}」的 ${r.field} 引用了不存在的「${r.id}」`)
      else if (!input.reach.has(target.packId)) problems.push(`「${e.id}」的 ${r.field} 引用的「${r.id}」在没有声明为依赖的包里`)
    }
    problems.push(...checkJoins(e, (id) => { const t = input.lookup(id); return t ? { type: t.type, data: t.data } : undefined }))
  }
  return problems
}
