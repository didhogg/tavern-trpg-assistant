// 把小窗的要求接到本地库：文件 → 对应官方源的原始文件；存储 → kv 表（按作者程序那一套分开；同步存储另一个范围）。
import type { LibraryDatabase } from '../db'
import type { FileProvider } from '../files'
import { officialSourceOf } from '../sources'
import type { FrameHandlers } from './host'

export interface HandlerOptions {
  codeSet: string
  db: LibraryDatabase
  files: FileProvider
  /** 本地没有的文件能不能去云端取（安装时才允许；平时只读本地）。 */
  allowNetwork: () => boolean
  /**
   * 作者存储放在哪个范围（默认 = 这套程序 codeSet）。临时隔离解析（只放一两个自制包、导入预览）用别的范围，
   * 用完由调用方删掉；官方原始文件照常读同一份。
   */
  kvScope?: string
}

export function libraryHandlers({ codeSet, db, files, allowNetwork, kvScope = codeSet }: HandlerOptions): FrameHandlers {
  const source = officialSourceOf(codeSet)
  return {
    file: (path) => files.get(source, path, { allowNetwork: allowNetwork() }),
    kvGet: async (key) => (await db.kv.get([kvScope, key]))?.value ?? null,
    kvSet: async (key, value) => { await db.kv.put({ scope: kvScope, key, value }) },
    kvRemove: async (key) => { await db.kv.delete([kvScope, key]) },
    // 作者同步存储（localStorage）单独一个范围，和异步存储分开
    localSnapshot: async () => Object.fromEntries((await db.kv.where('scope').equals(`${kvScope}:local`).toArray()).map((r) => [r.key, r.value as string])),
    localSet: async (key, value) => { await db.kv.put({ scope: `${kvScope}:local`, key, value }) },
    localRemove: async (key) => { await db.kv.delete([`${kvScope}:local`, key]) },
  }
}
