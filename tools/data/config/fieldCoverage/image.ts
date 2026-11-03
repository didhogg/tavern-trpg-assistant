import type { CoverageEntry } from './types'

/** 图片/音频/美术署名整棵子树：一条规则覆盖，不展开成逐路径条目。 */
export const IMAGE_PATH = /(?:^|\.)(images?|hasFluffImages|hrefThumbnail|cover|coverCredit|token|tokenCredit|tokenCustom|prototypeToken|hasToken|altArt|hasCardArt|soundClip|fonts?|img|symbolImg|credit)(?:\.|\[|$)/i

export function imageCoverage(path: string): CoverageEntry | undefined {
  // D1.2b：怪物头像/token 只对 monster 开例外；其它类别仍按图片丢弃。
  if (/^(?:monster\.(?:hasToken|token|tokenCredit)|monster-fluff\.images)(?:\.|\[|$)/.test(path)) {
    return { how: 'mapped', to: path.startsWith('monster-fluff') ? 'data.art.portrait.url' : 'data.art.token.url', wp: 'R7' }
  }
  if (!IMAGE_PATH.test(path)) return undefined
  return /soundClip/i.test(path)
    ? { how: 'dropped', kind: 'audio', why: '音频文件不导入' }
    : { how: 'dropped', kind: 'image', why: '图片/美术资源与署名不导入' }
}
