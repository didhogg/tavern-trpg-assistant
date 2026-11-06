// 把小窗的要求接到本地库：文件 → 对应官方源的原始文件；存储 → kv 表（按作者程序那一套分开）。
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
}

export function libraryHandlers({ codeSet, db, files, allowNetwork }: HandlerOptions): FrameHandlers {
  const source = officialSourceOf(codeSet)
  return {
    file: (path) => files.get(source, path, { allowNetwork: allowNetwork() }),
    kvGet: async (key) => (await db.kv.get([codeSet, key]))?.value ?? null,
    kvSet: async (key, value) => { await db.kv.put({ scope: codeSet, key, value }) },
    kvRemove: async (key) => { await db.kv.delete([codeSet, key]) },
  }
}
