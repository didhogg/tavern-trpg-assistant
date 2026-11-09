// 小窗里：官方书目（BE-7）。读作者书目文件（books.json / adventures.json，文件名来自作者加载器登记表的 index，由调用方传入），
// 连同作者的分组表（SourceUtil.ADV_BOOK_GROUPS）、来源全名缩写、版本归类一起交回。只转调作者函数，条目原样。
/* eslint-disable @typescript-eslint/no-explicit-any -- 作者程序是没有类型的 JS，这里只做转调 */
import { A, init } from './author'
import { editionOf, type EditionInfo } from './edit-commands'

export interface DirectoryData {
  /** 作者的分组表（含当前语言站的显示名），顺序即作者导航栏顺序。 */
  groups: Array<{ group: string; displayName: string }>
  /** 每个书目文件的条目原样（书：books.json 的 book；冒险：adventures.json 的 adventure）。 */
  corpora: Array<{ prop: string; items: any[] }>
  /** 书目里出现的每个来源：全名、缩写、版本归类（作者函数）。 */
  sources: Record<string, { full: string; abv: string; edition: EditionInfo }>
}

export async function directory(specs: Array<{ index: string; prop: string }>): Promise<DirectoryData> {
  await init()
  const corpora: DirectoryData['corpora'] = []
  for (const spec of specs) {
    const json = await A.DataUtil.loadJSON(`data/${spec.index}`)
    corpora.push({ prop: spec.prop, items: json[spec.prop] ?? [] })
  }
  const names = [...new Set(corpora.flatMap((c) => c.items.map((it) => A.SourceUtil.getEntitySource(it) as string)))]
  const editions = await editionOf(names)
  const sources: DirectoryData['sources'] = {}
  for (const s of names) sources[s] = { full: A.Parser.sourceJsonToFull(s), abv: A.Parser.sourceJsonToAbv(s), edition: editions[s] }
  return { groups: (A.SourceUtil.ADV_BOOK_GROUPS as DirectoryData['groups']).map((g) => ({ ...g })), corpora, sources }
}
