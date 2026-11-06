// 小窗里各指令共用的作者入口：初始化、作者编号、英文编号、来源。都只转调作者函数。
/* eslint-disable @typescript-eslint/no-explicit-any -- 作者程序是没有类型的 JS，这里只做转调 */
export const A = globalThis as any

let initialised: Promise<void> | null = null

/** 作者页面启动时做的初始化（B0 已验证的顺序）。 */
export function init(): Promise<void> {
  initialised ??= (async () => {
    A.Renderer.get().setBaseUrl('')
    await A.PrereleaseUtil.pInit()
    await A.BrewUtil2.pInit()
    await A.ExcludeUtil.pInitialise()
  })()
  return initialised
}

/** 按类别名找作者的编号函数：先找类别名，再找类别对应的页面（作者两个入口都登记了）。 */
function builderOf(table: Record<string, (ent: any) => string> | undefined, prop: string): ((ent: any) => string) | null {
  if (!table) return null
  return table[prop] ?? table[A.DataLoader.getPropPage(prop)] ?? null
}

/** 作者编号（URL_TO_HASH_BUILDER）。作者函数对这一条算不出来时返回 null，审计里记为"无编号"。 */
export function hashOf(prop: string, ent: any): string | null {
  const builder = builderOf(A.UrlUtil.URL_TO_HASH_BUILDER, prop)
  try {
    return builder ? builder(ent) : null
  } catch {
    return null
  }
}

/** 英文站编号（中文站的 URL_TO_ENG_HASH_BUILDER；英文程序没有这张表）。算不出来返回 null，进配对清单。 */
export function engHashOf(prop: string, ent: any): string | null {
  const builder = builderOf(A.UrlUtil.URL_TO_ENG_HASH_BUILDER, prop)
  try {
    return builder ? builder(ent) : null
  } catch {
    return null
  }
}

export function hasEngHashTable(): boolean {
  return !!A.UrlUtil.URL_TO_ENG_HASH_BUILDER
}

/** 条目的来源（作者的 SourceUtil.getEntitySource）。 */
export function sourceOf(ent: any): string | null {
  return A.SourceUtil.getEntitySource(ent) ?? null
}
