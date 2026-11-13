// P5.5 C1 复制时「抄全」：原文里「照另一本书的某条 + 改几处」（作者 _copy 指向别的来源，例：《失落矿坑》毒牙 = 《怪物图鉴》年轻绿龙 + 换名字）
// 复制进【我的库】时用作者自己的拼接（DataUtil.pDoMetaMergeSingle：照 _meta.dependencies 取那本书、按作者合并规则拼好）存成完整的一条，
// 再经作者 DataUtil.cleanJson 去掉运行时字段。这样副本彻底定格：那本书以后怎么更新都不影响；表单里每一格都有内容。
// 指向本包自己来源的 _copy（作者 _meta.internalCopies）不动：它们引用的是副本自己的条目，跟着副本走。
/* eslint-disable @typescript-eslint/no-explicit-any -- 作者程序是没有类型的 JS，这里只做转调 */
import { A, init } from './author'
import { docOf } from './pack-commands'

export interface FlattenResult {
  json: any
  /** 抄全了几条。 */
  flattened: number
  /** 拼不成的（作者找不到原件等）：保持原写法。 */
  failed: Array<{ prop: string; name: string; reason: string }>
}

const low = (v: unknown): string => String(v ?? '').toLowerCase()

/** 把 json 里 _copy 指向 keepSources 以外来源的条目拼成完整的（json 不改，返回新的）。 */
export async function flattenCopies(json: any, keepSources: string[]): Promise<FlattenResult> {
  await init()
  const keep = new Set(keepSources.map(low))
  const out = A.MiscUtil.copyFast(json)
  let flattened = 0
  const failed: FlattenResult['failed'] = []
  for (const [prop, list] of Object.entries(out)) {
    if (prop.startsWith('_') || !Array.isArray(list)) continue
    for (let i = 0; i < list.length; i++) {
      const ent: any = list[i]
      const from = ent?._copy?.source
      if (typeof from !== 'string' || keep.has(low(from))) continue
      try {
        const merged = await A.DataUtil.pDoMetaMergeSingle(prop, { dependencies: { [prop]: [from] } }, A.MiscUtil.copyFast(ent))
        if (!merged || merged._copy) throw new Error('作者没有拼出完整的一条')
        list[i] = A.DataUtil.cleanJson(merged, { isDeleteUniqueId: false })
        flattened++
      } catch (e) {
        failed.push({ prop, name: String(ent?.name ?? ''), reason: e instanceof Error ? e.message : String(e) })
      }
    }
  }
  // 抄全以后不再需要的依赖声明去掉（还有 _copy 指向那个来源的类别留着）
  const deps = out._meta?.dependencies
  if (deps) {
    for (const [prop, srcs] of Object.entries(deps) as Array<[string, string[]]>) {
      const still = srcs.filter((s) => (out[prop] ?? []).some((e: any) => low(e?._copy?.source) === low(s)))
      if (still.length) deps[prop] = still
      else delete deps[prop]
    }
    if (!Object.keys(deps).length) delete out._meta.dependencies
  }
  return { json: out, flattened, failed }
}

/** 已经复制过的旧副本补一次「抄全」（只动 _copy 指向别的来源的条目）。 */
export async function packFlattenCopies(docIdLocal: string): Promise<Omit<FlattenResult, 'json'>> {
  const doc = await docOf(docIdLocal)
  const keep = (doc.body._meta?.sources ?? []).map((s: any) => String(s?.json ?? ''))
  const r = await flattenCopies(doc.body, keep)
  if (r.flattened) {
    doc.body = r.json
    await A.BrewUtil2.pUpdateBrew(doc)
  }
  return { flattened: r.flattened, failed: r.failed }
}
