import { readdirSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'

/** 图片文件（驾驶员规定：图片不入库，连路径登记也不做，只数个数；库里只保留图片的网页链接）。 */
const IMAGE_EXT = /\.(png|jpe?g|gif|webp|svg|bmp|avif|ico|tiff?|heic)$/i
export const isImageFile = (rel: string): boolean => IMAGE_EXT.test(rel)

/** 递归列出文件夹下全部文件（相对路径，按字典序，稳定）。只读。 */
export function walkFiles(root: string): string[] {
  const out: string[] = []
  const visit = (dir: string): void => {
    for (const name of readdirSync(dir).sort()) {
      const full = join(dir, name)
      if (statSync(full).isDirectory()) visit(full)
      else out.push(relative(root, full))
    }
  }
  visit(root)
  return out
}
