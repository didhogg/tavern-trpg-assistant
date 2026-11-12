// 源登记表的读取（登记内容在 sources.json，加源 = 加一行）。
import registry from './sources.json'

export interface CodeSet {
  repo: string
  commit: string
  version: string
  lang: string
  /** 这套作者程序读写的数据格式（formats.ts 登记）。 */
  format: string
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
  /** 图片根地址（作者图片仓库的镜像，按顺序试；条目里只有相对路径）。图片不入库，用到才取（P5 B-03）。 */
  imageRoots?: string[]
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

/**
 * 官方数据跟上游新提交（P5 B-28）：数据提交号不再恒等于登记表里的那个，更新后改成新提交。
 * 作者程序（vendor）仍是登记表里那一版；只有上游作者程序版本号一致才允许跟（official-update.ts）。
 * 启动时按安装记录恢复（hydrateCommits）；全库一律经 commitOf 取，所以改这里就都跟着变。
 */
const commitOverrides = new Map<string, string>()

export function setCommitOverride(codeSet: string, commit: string | null): void {
  if (commit && commit !== CODE_SETS[codeSet]?.commit) commitOverrides.set(codeSet, commit)
  else commitOverrides.delete(codeSet)
}

function fillWith(template: string, repo: string, commit: string): string {
  return template.replaceAll('{repo}', repo).replaceAll('{commit}', commit)
}

/** 指定提交号的镜像地址（查上游新版本用）。 */
export function mirrorRootsAt(source: SourceEntry, commit: string): string[] {
  return source.mirrors.map((m) => fillWith(m, CODE_SETS[source.codeSet].repo, commit))
}

/** 指定提交号的文件清单地址。 */
export function fileListUrlAt(source: SourceEntry, commit: string): string {
  if (!source.fileList) throw new Error(`${source.id} 没有登记文件清单地址`)
  return fillWith(source.fileList, CODE_SETS[source.codeSet].repo, commit)
}

function fill(template: string, source: SourceEntry): string {
  return fillWith(template, CODE_SETS[source.codeSet].repo, commitOf(source))
}

export function mirrorRoots(source: SourceEntry): string[] {
  return source.mirrors.map((m) => fill(m, source))
}

export function fileListUrl(source: SourceEntry): string {
  if (!source.fileList) throw new Error(`${source.id} 没有登记文件清单地址`)
  return fill(source.fileList, source)
}

export function commitOf(source: SourceEntry): string {
  return commitOverrides.get(source.codeSet) ?? CODE_SETS[source.codeSet].commit
}
