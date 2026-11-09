// 图片地址（P5 B-03）：条目、背景描述、书目里的图片都只有相对路径（{type:'internal', path:'bestiary/MM/Aarakocra.webp'}），
// 或外部网址（{type:'external', url}）。作者的做法是 Renderer.get().getMediaUrl('img', 路径) = 图片根 + 路径；
// 作者发布时的图片根是自己的图片仓库（set-img-root.sh），扩展里要自己登记。图片文件不入库，界面点开才取。
import { getSource } from './sources'

/** 条目里图片的两种写法（作者结构定义 entry.json 的 mediaHref），也接受直接给相对路径。 */
export type ImageHref = string | { type?: string; path?: string; url?: string } | null | undefined

/** 一张图的候选地址，按图片根的先后顺序（第一个不通就试下一个，和数据源换地址的写法一样）。外部网址只有它自己。 */
export function imageCandidates(roots: readonly string[], href: ImageHref): string[] {
  if (!href) return []
  if (typeof href === 'string') return roots.map((r) => r + encodeURI(href.replace(/^\/+/, '')))
  if (href.type === 'external' || (href.url && !href.path)) return href.url ? [href.url] : []
  return href.path ? roots.map((r) => r + encodeURI(href.path!.replace(/^\/+/, ''))) : []
}

/** 这个数据源登记的图片根。 */
export function imageRootsOf(sourceId: string): string[] {
  return getSource(sourceId).imageRoots ?? []
}

/** 一张图的候选地址（按数据源登记的图片根）。 */
export function imageUrls(sourceId: string, href: ImageHref): string[] {
  return imageCandidates(imageRootsOf(sourceId), href)
}

/** 作者的头像（token）路径取自作者函数后去掉图片根前缀，剩下相对路径。 */
export function stripImageRoot(url: string): string {
  return url.replace(/^\/?img\//, '')
}
