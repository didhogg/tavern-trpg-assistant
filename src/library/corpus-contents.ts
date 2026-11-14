// 自制书 / 冒险的目录（驾驶员 2026-11-14 定：保存时从章节自动算，方案 A）。
// 作者数据里目录（book.contents）和正文（bookData.data）分开存，作者程序只显示目录、不生成目录；
// 作者阅读器按目录里的小节名到这一章的正文里找同名标题（BookUtil._getContentsChapterBlock）。
// 规则：每一章 = 正文里的一个顶层块；小节 = 这一章直接下一层里有名字的块。
// 已有的章（导入的书，作者手选过小节）按章名对上的，保留原来的小节（去掉正文里已经找不到的）和章节序号，不重算。

type Block = Record<string, unknown>
export type ContentsHeader = string | { header: string; [k: string]: unknown }
export interface ContentsChapter { name: string; headers?: ContentsHeader[]; [k: string]: unknown }

const isBlock = (x: unknown): x is Block => !!x && typeof x === 'object' && !Array.isArray(x)
const nameOf = (x: unknown): string | null => (isBlock(x) && typeof x.name === 'string' && x.name.trim() ? x.name : null)
const headerText = (h: ContentsHeader): string => (typeof h === 'string' ? h : h.header)

/** 这一段正文里（任意深度）所有有名字的块的名字。 */
function namesIn(entries: unknown, out = new Set<string>()): Set<string> {
  if (!Array.isArray(entries)) return out
  for (const e of entries) {
    const n = nameOf(e)
    if (n) out.add(n)
    if (isBlock(e)) { namesIn(e.entries, out); namesIn(e.items, out) }
  }
  return out
}

/** 每一章缺章名的位置（从 1 数）；空数组 = 都有章名。 */
export function chaptersWithoutName(data: unknown[]): number[] {
  return data.flatMap((ch, i) => (nameOf(ch) ? [] : [i + 1]))
}

/** 按正文算目录；previous：原来的目录（新建时没有）。 */
export function corpusContents(data: unknown[], previous?: unknown): ContentsChapter[] {
  const old = (Array.isArray(previous) ? previous : []).filter((c): c is ContentsChapter => isBlock(c) && typeof c.name === 'string')
  return data.map((ch) => {
    const name = nameOf(ch) ?? ''
    const body = isBlock(ch) ? ch.entries : undefined
    const was = old.find((c) => c.name === name)
    if (was) {
      const have = namesIn(body)
      const headers = (was.headers ?? []).filter((h) => have.has(headerText(h)))
      if (headers.length) return { ...was, headers } // 字段顺序照原来的，没改的书导出不变
      const { headers: _gone, ...rest } = was
      return rest
    }
    const headers = (Array.isArray(body) ? body : []).map(nameOf).filter((n): n is string => !!n)
    return headers.length ? { name, headers } : { name }
  })
}
