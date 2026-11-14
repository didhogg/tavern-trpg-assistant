// 结算小窗里的自制（B，2026-11-14；探针 tests/e2e/library/p62-kernel-brew-probe.mjs 的结论）。
// Plutonium 在 Foundry 里自己把自制管理器（BrewUtil2）的存储换成了内存（Bundle.js 82023），读自制只走一条路：
//   设置 dataSources.localHomebrew（一串文件名，Bundle.js 77750）→ BrewUtil2.pAddBrewFromUrl(名字) 经「取文件」通道读这个名字（82357、64523）。
// 所以这里只做两件事：① 从库里已装的自制包列出名字；② 按名字交回作者格式原文。只读库已有的存储，不新增格式、不写任何东西。
import type { LibraryView } from '../../library/revision'
import { BREW_STORAGE_KEY } from '../../library/brew-storage'

export interface KernelBrews {
  /** 交给 Plutonium 的「附加自制文件」清单。 */
  names: string[]
  /** 按名字取作者格式原文；不是这一批里的名字 → null。 */
  text(name: string): string | null
}

interface StoredDoc { head?: { docIdLocal?: unknown }; body?: unknown }

/** 这个版本里、这套（cn / en）已装的全部自制包。名字用库自己的包编号（docIdLocal），不写死文件名；原文用到才转成字符串。 */
export async function libraryBrews(view: LibraryView, codeSet: string): Promise<KernelBrews> {
  const raw = (await view.kvGet(codeSet, BREW_STORAGE_KEY)) as StoredDoc[] | null
  const docs = new Map<string, unknown>()
  for (const doc of Array.isArray(raw) ? raw : []) {
    const id = doc?.head?.docIdLocal
    if (typeof id === 'string' && id && doc.body !== undefined) docs.set(`${id}.json`, doc.body)
  }
  return { names: [...docs.keys()], text: (name) => (docs.has(name) ? JSON.stringify(docs.get(name)) : null) }
}

/**
 * 小窗要的文件路径里最后一段的名字。实测（p58，2026-11-14）Plutonium 按「附加自制文件」的名字取文件时，
 * 路径就是光秃秃的名字（相对小窗目录），没有 homebrew/ 前缀，所以只看最后一段；是不是自制由 KernelBrews.text 说了算
 * （名字是库自己的包编号 + .json，不会和官方数据文件重名）。
 */
export function brewNameOf(path: string): string | null {
  const m = /([^/]+)$/.exec(path)
  return m ? decodeURIComponent(m[1]) : null
}
