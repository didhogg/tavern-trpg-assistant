import type { CoverageEntry } from './types'

/** 图片/音频/美术署名整棵子树：一条规则覆盖，不展开成逐路径条目。 */
export const IMAGE_PATH = /(?:^|\.)(images?|hasFluffImages|hrefThumbnail|cover|coverCredit|token|tokenCredit|tokenCustom|prototypeToken|hasToken|altArt|hasCardArt|soundClip|fonts?|img|symbolImg|credit)(?:\.|\[|$)/i

export function imageCoverage(path: string): CoverageEntry | undefined {
  if (!IMAGE_PATH.test(path)) return undefined
  return /soundClip/i.test(path)
    ? { how: 'dropped', kind: 'audio', why: '音频文件不导入' }
    : { how: 'dropped', kind: 'image', why: '图片/美术资源与署名不导入' }
}
