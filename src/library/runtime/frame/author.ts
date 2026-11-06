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

/**
 * "跳转英文源站"按钮用的英文站编号：照中文站 UrlUtil.autoEncodeEngHash（没有英文名不算；utils.js 第 3640 行），
 * 按条目所在页面算（作者用当前页面的编号函数）。只用来拼跳转链接（listpage.js 第 2110 行），不用来配对中英条目。
 */
export function engSiteHashOf(prop: string, ent: any): string | null {
  const table = A.UrlUtil.URL_TO_ENG_HASH_BUILDER
  const page = A.DataLoader.getPropPage(prop)
  if (!table || !ent?.ENG_name || !table[page]) return null
  return table[page](ent)
}

/** 条目的来源（作者的 SourceUtil.getEntitySource）。 */
export function sourceOf(ent: any): string | null {
  return A.SourceUtil.getEntitySource(ent) ?? null
}
