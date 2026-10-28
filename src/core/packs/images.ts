import { TrpgError } from '../errors'

export const MAX_IMAGE_BYTES = 10 * 1024 * 1024

const SIGNATURES: Array<{ mime: string; test: (b: Uint8Array) => boolean }> = [
  { mime: 'image/png', test: (b) => b.length >= 8 && b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47 },
  { mime: 'image/jpeg', test: (b) => b.length >= 3 && b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff },
  { mime: 'image/gif', test: (b) => b.length >= 6 && String.fromCharCode(...b.slice(0, 6)).match(/^GIF8[79]a$/) !== null },
  { mime: 'image/webp', test: (b) => b.length >= 12 && String.fromCharCode(...b.slice(0, 4)) === 'RIFF' && String.fromCharCode(...b.slice(8, 12)) === 'WEBP' },
]

/** 按文件头判定图片类型；不是 png / jpeg / webp / gif 时返回 undefined。 */
export function sniffImageMime(bytes: Uint8Array): string | undefined {
  return SIGNATURES.find((s) => s.test(bytes))?.mime
}

export function assertImage(name: string, bytes: Uint8Array): string {
  if (bytes.length > MAX_IMAGE_BYTES) throw new TrpgError('E_BAD_CONTENT', `文件内容损坏：图片「${name}」过大`)
  const mime = sniffImageMime(bytes)
  if (!mime) throw new TrpgError('E_BAD_CONTENT', `文件内容损坏：图片「${name}」不合法`)
  return mime
}
