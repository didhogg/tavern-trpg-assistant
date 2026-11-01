/**
 * 5etools-cn 的图片地址规则。
 *
 * 来源（本机 reference/5etools-cn-main（数据库））：
 * - index.html:14、22：站点 canonical / og:url 是 https://5e.kiwee.top/
 * - js/utils.js:6：DEPLOYED_IMG_ROOT = "/img/"
 * - js/render.js:115：getMediaUrl() 把媒体目录与路径拼起来；有 baseMediaUrls 时用 base + path
 * - js/render.js:16361：怪物 token 路径为 img/bestiary/tokens/<source>/<ENG_name>.webp；
 *   显式 token 用 token.source/token.name，tokenHref 走 internal/external
 * - js/parser.js:2973：nameToTokenName() 先 toAscii（NFD 去音标、Æ/æ 展开）、去掉双引号，再 encodeURIComponent
 * - js/render.js:4809：fluff 立绘 internal 走 getMediaUrl，external 直接用 url
 */

export const MEDIA_ROOT = 'https://5e.kiwee.top/img/'

/** 5etools 的 toAscii：只做 NFD 去音标、Æ/æ 展开、去掉双引号。 */
export function toAscii(name: string): string {
  return name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/Æ/g, 'AE')
    .replace(/æ/g, 'ae')
    .replace(/"/g, '')
}

/** internal 媒体路径 → 完整地址。路径里的空格按 encodeURI 处理，保留 /。 */
export function mediaUrl(path: string): string {
  return `${MEDIA_ROOT}${encodeURI(path)}`
}

/** 怪物隐式 token 地址：img/bestiary/tokens/<source>/<ENG_name>.webp。 */
export function implicitTokenUrl(source: string, nameEn: string): string {
  return mediaUrl(`bestiary/tokens/${source}/${encodeURIComponent(toAscii(nameEn))}.webp`)
}

export interface TokenLike {
  source?: string
  name?: string
  token?: { source?: string; name?: string }
  tokenHref?: { type?: string; path?: string; url?: string }
  tokenUrl?: string
}

/** 怪物 token：显式 token / tokenHref 优先，否则按来源 + 英文名推隐式 token。 */
export function monsterTokenUrl(raw: TokenLike, source: string, nameEn: string): string | undefined {
  if (raw.tokenUrl) return raw.tokenUrl
  if (raw.token?.source && raw.token.name) return implicitTokenUrl(raw.token.source, raw.token.name)
  if (raw.tokenHref?.type === 'internal' && raw.tokenHref.path) return mediaUrl(raw.tokenHref.path)
  if (raw.tokenHref?.type === 'external' && raw.tokenHref.url) return raw.tokenHref.url
  if (raw.token?.name) return implicitTokenUrl(source, raw.token.name)
  return implicitTokenUrl(source, nameEn)
}

/** fluff 立绘 href → 完整地址；只取第一张。 */
export function portraitUrl(href: { type?: string; path?: string; url?: string } | undefined): string | undefined {
  if (!href) return undefined
  if (href.type === 'internal' && href.path) return mediaUrl(href.path)
  if (href.type === 'external' && href.url) return href.url
  return undefined
}
