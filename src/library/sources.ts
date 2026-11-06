// 源登记表的读取（登记内容在 sources.json，加源 = 加一行）。
import registry from './sources.json'

export interface CodeSet {
  repo: string
  commit: string
  version: string
  lang: string
}

export interface SourceEntry {
  id: string
  kind: 'official' | 'brew'
  lang: string
  codeSet: string
  pair?: string
  repo?: string
  fileList?: string
  mirrors: string[]
}

export const CODE_SETS = registry.codeSets as Record<string, CodeSet>
export const SOURCES = registry.sources as SourceEntry[]

export function getSource(id: string): SourceEntry {
  const s = SOURCES.find((it) => it.id === id)
  if (!s) throw new Error(`源登记表里没有：${id}`)
  return s
}

/** 一套作者程序对应的官方数据源（作者程序读相对路径 data/… 时取的就是它）。 */
export function officialSourceOf(codeSet: string): SourceEntry {
  const s = SOURCES.find((it) => it.kind === 'official' && it.codeSet === codeSet)
  if (!s) throw new Error(`作者程序 ${codeSet} 没有登记对应的官方数据源`)
  return s
}

function fill(template: string, source: SourceEntry): string {
  const set = CODE_SETS[source.codeSet]
  return template.replaceAll('{repo}', set.repo).replaceAll('{commit}', set.commit)
}

export function mirrorRoots(source: SourceEntry): string[] {
  return source.mirrors.map((m) => fill(m, source))
}

export function fileListUrl(source: SourceEntry): string {
  if (!source.fileList) throw new Error(`${source.id} 没有登记文件清单地址`)
  return fill(source.fileList, source)
}

export function commitOf(source: SourceEntry): string {
  return CODE_SETS[source.codeSet].commit
}
