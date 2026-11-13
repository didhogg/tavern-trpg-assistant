// P5.5 §16.10 1d：新建列表里每一类条目是「主条目」「从属」还是「背景介绍与图片」。不写类型名单，按作者自己的规矩认：
// - 背景介绍与图片（作者叫 fluff）：作者 Renderer.utils.pGetProxyFluff 用「主类别名 + Fluff」找（monster → monsterFluff），
//   所以 xxxFluff 且 xxx 也是一类的，就是 xxx 的背景介绍与图片，在 xxx 里编辑，不单独新建。
// - 从属：作者结构定义把「主条目名」写成必填的（子种族必填 raceName、子职必填 className……），在主条目里编辑。
//   必填里指向好几类时取最近的那一层（子职特性同时必填 className 和 subclassShortName → 归子职）。
// 驾驶员 2026-11-13 定不出现在新建列表里的两类：渲染器示例（作者演示页）、引用（作者网站内部用）。

export type EntryKind = 'main' | 'child' | 'fluff'

/** 驾驶员 2026-11-13 定：不出现在新建列表里（作者网站自己用的）。 */
export const NOT_CREATABLE = new Set(['renderdemo', 'citation'])

/** 每一类的上一级（主条目）和种类。props = 新建列表里的类别；required(p) = 这一类结构定义里的必填字段名。 */
export function entryKinds(props: string[], required: (prop: string) => string[]): Map<string, { kind: EntryKind; parent: string | null }> {
  const all = new Set(props)
  const out = new Map<string, { kind: EntryKind; parent: string | null }>()
  // 必填里写了「别的类别名 + Name / ShortName」的，是那一类的从属
  const refsOf = (p: string): string[] => {
    const req = new Set(required(p))
    return [...all].filter((q) => q !== p && (req.has(`${q}Name`) || req.has(`${q}ShortName`)))
  }
  for (const p of props) {
    const base = p.endsWith('Fluff') ? p.slice(0, -'Fluff'.length) : null
    if (base && all.has(base)) { out.set(p, { kind: 'fluff', parent: base }); continue }
    const refs = refsOf(p)
    // 最近的一层：它自己不是别的候选的上一级（子职特性：职业是子职的上一级，所以归子职）
    const nearest = refs.find((q) => !refs.some((r) => r !== q && refsOf(r).includes(q))) ?? refs[0]
    out.set(p, nearest ? { kind: 'child', parent: nearest } : { kind: 'main', parent: null })
  }
  return out
}

/** 作者中文名重名的（status 和 condition 都叫「状态」）：后面补上另一种语言的名字（取不到用类别编号）。 */
export function distinctNames<T extends { prop: string; name: string }>(types: T[], otherName: (prop: string) => string | undefined): T[] {
  const count = new Map<string, number>()
  for (const t of types) count.set(t.name, (count.get(t.name) ?? 0) + 1)
  return types.map((t) => ((count.get(t.name) ?? 0) > 1 ? { ...t, name: `${t.name}（${otherName(t.prop) ?? t.prop}）` } : t))
}
