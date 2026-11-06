// 官方数据下载计划：照抄作者离线设计（node/build-sw.mjs，中英两站同一套规则）。
//   预载（第 56、57、59 行）："data/*.json"、"data/**/!(adventure)/*.json"、"search/*.json"
//   按需（第 87 行）：        "data/adventure/**/*.json"（冒险正文，用到哪本取哪本）
// 不手写文件名单：文件清单来自 GitHub 锁定版本目录树，这里只按作者的规则分组。
import type { FileList } from './fetcher'

const isJson = (p: string): boolean => p.endsWith('.json')
const parentDir = (p: string): string => p.split('/').at(-2) ?? ''

/** 作者"预载"规则：data 根下的 json；data 下任意子目录里、直接上级目录不叫 adventure 的 json；search 根下的 json。 */
export function isPrecache(path: string): boolean {
  if (!isJson(path)) return false
  const parts = path.split('/')
  if (parts[0] === 'search') return parts.length === 2
  if (parts[0] !== 'data') return false
  if (parts.length === 2) return true
  return parentDir(path) !== 'adventure'
}

/** 作者"按需"规则：data/adventure/ 下的 json。 */
export function isAdventure(path: string): boolean {
  return isJson(path) && path.startsWith('data/adventure/')
}

export interface Plan {
  files: string[]
  bytes: number
}

export function precachePlan(list: FileList): Plan {
  const files = Object.keys(list).filter(isPrecache).sort()
  return { files, bytes: files.reduce((n, p) => n + list[p].size, 0) }
}

export function adventurePlan(list: FileList, fileName: string): Plan {
  const files = Object.keys(list).filter((p) => isAdventure(p) && p.split('/').at(-1) === fileName)
  return { files, bytes: files.reduce((n, p) => n + list[p].size, 0) }
}
