import { existsSync, readFileSync } from 'node:fs'
import { AUTHOR_SOURCE_LIST, AUTHOR_UTILS_ROOT, gitRevision } from './repos'
import type { SourceEntry, Validation } from './types'

/**
 * 作者自己的官方来源清单（5etools-utils/schema/site/sources-5etools.json）与我们从数据里扫出的官方来源取并集：
 * 两边都有的标 data + author-schema；只有作者清单有的补一条（没有记录，也没有文件）；只有数据里有的保持 data。
 */
export function mergeAuthorSourceList(sources: SourceEntry[]): { sources: SourceEntry[]; info: NonNullable<Validation['authorSourceList']> } | null {
  if (!existsSync(AUTHOR_SOURCE_LIST)) return null
  const doc = JSON.parse(readFileSync(AUTHOR_SOURCE_LIST, 'utf8')) as { $defs?: { sources?: { enum?: unknown } } }
  const list = doc.$defs?.sources?.enum
  if (!Array.isArray(list) || !list.every((x) => typeof x === 'string')) throw new Error('作者官方来源清单格式不是预期的字符串枚举')
  const ids = new Set(list as string[])
  const official = new Map(sources.filter((s) => s.kind === 'official').map((s) => [s.id, s]))
  const authorOnly: string[] = []
  for (const id of [...ids].sort()) {
    const hit = official.get(id)
    if (hit) hit.listedBy = ['data', 'author-schema']
    else {
      authorOnly.push(id)
      sources.push({
        key: `official:${id}`, id, kind: 'official', name: id, nameEn: null, abbreviation: null, published: null, edition: 'unknown', declared: true,
        license: null, url: null, version: null, authors: [], convertedBy: [], languages: {}, listedBy: ['author-schema'],
      })
    }
  }
  sources.sort((x, y) => x.key.localeCompare(y.key))
  const dataOnly = [...official.keys()].filter((id) => !ids.has(id)).sort()
  return { sources, info: { file: 'schema/site/sources-5etools.json（5etools-utils）', revision: gitRevision(AUTHOR_UTILS_ROOT), total: ids.size, matched: ids.size - authorOnly.length, authorOnly, dataOnly } }
}
