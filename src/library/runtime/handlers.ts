// 把小窗的要求接到本地库：文件 → 对应官方源的原始文件；存储 → kv 表。
// P5 T1：读取按版本层（新层 → 父层 → 旧范围）；写只写准备版本自己的层，旧版本不受影响。
import { isAuthorContentStorageKey } from '../brew-storage'
import type { LibraryDatabase } from '../db'
import type { FileProvider } from '../files'
import type { LibraryView } from '../revision'
import { RevisionRows, kvChainMerged, kvChainRow, kvScopeChain, type KvScopeLink } from '../revision-rows'
import { officialSourceOf } from '../sources'
import type { FrameHandlers } from './host'

export interface HandlerOptions {
  codeSet: string
  db: LibraryDatabase
  files: FileProvider
  /** 本地没有的文件能不能去云端取（安装时才允许；平时只读本地）。 */
  allowNetwork: () => boolean
  /**
   * 固定的库版本（P5 T1）。不给时退回旧的单范围行为（测试 / 兼容）。
   * 给了 view 时，作者同步 / 异步存储都按版本层读写。
   */
  view?: LibraryView
  /** 旧调用方直接指定一个范围（隔离解析、旧测试）。 */
  kvScope?: string
  /** 是否按读上下文过滤来源索引（书目 / 计划要完整索引时关掉）。 */
  filterIndex?: boolean
  /** 书目预取这类只写旧缓存、不写版本（不发版）。 */
  writeLegacy?: boolean
  /** 按指定目标提交读；用于更新检查，不写当前版本。 */
  commit?: string
  /** false = 只读联网文件，不落本地缓存（目标提交目录检查）。 */
  persist?: boolean
}

export function libraryHandlers({ codeSet, db, files, allowNetwork, view, kvScope, filterIndex = true, writeLegacy = false, commit, persist = true }: HandlerOptions): FrameHandlers {
  const source = officialSourceOf(codeSet)
  // 读取沿作用域链（指定范围在最前，再沿版本父链）：和版本库同一套查找，已发布版本的行查内存（revision-rows.ts）
  const chain = async (): Promise<KvScopeLink[]> => view ? kvScopeChain(await view.chain(), codeSet, kvScope) : [{ scope: kvScope ?? codeSet, owner: null }]
  const rows = view?.store.rows ?? new RevisionRows(db)
  const writeScope = async (): Promise<string> => {
    if (kvScope) return kvScope
    if (view) {
      const scope = view.kvWriteScope(codeSet)
      if (!scope) throw new Error('这个库版本是只读的，修改资料要先开一个准备版本')
      return scope
    }
    return kvScope ?? codeSet
  }
  /** 作者同步存储的写入范围；只读版本（没开准备版本、也没指定范围）里网站偏好交 null = 不落库，自制 / 试玩稿内容键照旧报只读。 */
  const localScope = async (key: string): Promise<string | null> =>
    (view && !kvScope && !view.kvWriteScope(codeSet) && !isAuthorContentStorageKey(key)) ? null : `${await writeScope()}:local`
  return {
    file: async (path) => {
      const text = await files.get(source, path, { allowNetwork: allowNetwork(), ...(view ? { view } : {}), ...(writeLegacy ? { writeLegacy: true } : {}), ...(commit ? { commit } : {}), persist })
      if (text === null || !view || !filterIndex) return text
      return await view.filterIndex(path, text, codeSet)
    },
    kvGet: async (key) => {
      const rec = await kvChainRow(rows, await chain(), key)
      return rec && !rec.deleted ? rec.value : null
    },
    kvSet: async (key, value) => { await db.kv.put({ scope: await writeScope(), key, value }) },
    kvRemove: async (key) => { await db.kv.put({ scope: await writeScope(), key, value: null, deleted: true }) },
    // 作者同步存储（localStorage）单独一个范围，和异步存储分开；读取时新层盖旧层
    localSnapshot: async () => Object.fromEntries([...(await kvChainMerged(rows, await chain(), ':local'))].map(([k, v]) => [k, String(v ?? '')])),
    // 阅读用的只读版本里，作者网站自己的偏好（主题、掷骰框样式、界面语言、存储自检…）只留在小窗内存，不写库、不报错（内容键见 isAuthorContentStorageKey）：
    // 与插件无关（驾驶员 2026-11-15；P5-3 执行文档第 169 行"非内容会话写入隔离保存"）。准备版本里照常落库，装书时的写入不受影响。
    localSet: async (key, value) => { const scope = await localScope(key); if (scope) await db.kv.put({ scope, key, value }) },
    localRemove: async (key) => { const scope = await localScope(key); if (scope) await db.kv.put({ scope, key, value: null, deleted: true }) },
  }
}
