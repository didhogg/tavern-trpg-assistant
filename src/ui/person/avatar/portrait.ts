// 人物头像（驾驶员 2026-11-25：照真实产品做——点头像出菜单，选了图才弹截取框，确认只在截取框里）。
//   存法：人物「头像」字段（img）放截好的方图，所有显示头像的地方直接用它；
//         原图（上传的压缩后整张 / 链接本身）和截取方框放 flags.tavern-trpg.portrait，「重新截取」靠它，不用重新选图。
//   作者系统的默认人像是内部路径（systems/…），界面当作「没有头像」。
export const PORTRAIT_FLAG = 'flags.tavern-trpg.portrait'
/** 截取方框：相对原图宽高的比例（0–1），方框在原图上是正方形。 */
export interface CropRect { x: number; y: number; w: number; h: number }
export interface PortraitSource extends CropRect { src: string }

/** 能显示的头像地址（作者内部路径、空值 = 没有头像）。 */
export const shownAvatar = (img: unknown): string | null => (typeof img === 'string' && /^(https?:|data:image\/|blob:)/i.test(img) ? img : null)

/** 人物上记着的原图与方框（没有 / 坏了 = null）。 */
export function portraitSource(flags: unknown): PortraitSource | null {
  const p = (flags as { 'tavern-trpg'?: { portrait?: Partial<PortraitSource> } } | undefined)?.['tavern-trpg']?.portrait
  if (!p || typeof p.src !== 'string' || !shownAvatar(p.src)) return null
  const n = (v: unknown, d: number) => (typeof v === 'number' && Number.isFinite(v) ? v : d)
  return { src: p.src, x: n(p.x, 0), y: n(p.y, 0), w: n(p.w, 1), h: n(p.h, 1) }
}

const ACCEPT = /^image\/(png|jpeg|webp|gif|avif|bmp)$/
export const IMAGE_ACCEPT = 'image/png,image/jpeg,image/webp,image/gif,image/avif,image/bmp'
const MAX_INPUT = 25 * 1024 * 1024
const MAX_STORED = 600 * 1024

function toDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => { const r = new FileReader(); r.onload = () => resolve(String(r.result)); r.onerror = () => reject(r.error); r.readAsDataURL(blob) })
}
const canvasBlob = (c: HTMLCanvasElement, quality: number): Promise<Blob | null> => new Promise((resolve) => c.toBlob(resolve, 'image/webp', quality))

/** 上传的图：在本机解码、缩到合适大小（最长边 ≤1600、几百 KB 以内）存原图，不存用户原文件。出错抛中文原因。 */
export async function readImageFile(file: File): Promise<string> {
  if (!ACCEPT.test(file.type)) throw Error('这不是图片：请选 PNG、JPG、WebP、GIF、AVIF 或 BMP')
  if (file.size > MAX_INPUT) throw Error('图片太大（超过 25 MB），换一张小一点的')
  let bitmap: ImageBitmap
  try { bitmap = await createImageBitmap(file) } catch { throw Error('这张图打不开，可能已经损坏') }
  try {
    let edge = 1600; let quality = 0.88
    for (let i = 0; i < 8; i++) {
      const f = Math.min(1, edge / Math.max(bitmap.width, bitmap.height))
      const c = document.createElement('canvas')
      c.width = Math.max(1, Math.round(bitmap.width * f)); c.height = Math.max(1, Math.round(bitmap.height * f))
      c.getContext('2d')!.drawImage(bitmap, 0, 0, c.width, c.height)
      const blob = await canvasBlob(c, quality)
      if (blob && blob.size <= MAX_STORED) return toDataUrl(blob)
      quality = Math.max(0.5, quality - 0.1); edge = Math.round(edge * 0.8)
    }
    throw Error('这张图压不到能保存的大小，换一张试试')
  } finally { bitmap.close() }
}

export interface LoadedImage { el: HTMLImageElement; width: number; height: number; /** 能不能在本机截出新图（别的网站不让复制时不能）。 */ bakeable: boolean }

const loadImg = (src: string, cors: boolean): Promise<HTMLImageElement> => new Promise((resolve, reject) => {
  const el = new Image()
  if (cors) el.crossOrigin = 'anonymous'
  el.onload = () => resolve(el); el.onerror = () => reject(Error('load'))
  el.src = src
})

/** 读图：先按「允许复制」读（截出来的图能存成本机图）；对方网站不允许就退一步只显示。读不到抛中文原因。 */
export async function loadImage(src: string): Promise<LoadedImage> {
  const local = /^(data:|blob:)/.test(src)
  try {
    const el = await loadImg(src, !local)
    return { el, width: el.naturalWidth, height: el.naturalHeight, bakeable: true }
  } catch {
    if (local) throw Error('这张图打不开')
  }
  try {
    const el = await loadImg(src, false)
    return { el, width: el.naturalWidth, height: el.naturalHeight, bakeable: false }
  } catch {
    throw Error('这个链接读不到图片：网址打不开，或者不是图片')
  }
}

/** 默认方框：居中、取短边的整块。 */
export function centeredRect(width: number, height: number): CropRect {
  const side = Math.min(width, height)
  return { x: (width - side) / 2 / width, y: (height - side) / 2 / height, w: side / width, h: side / height }
}

/** 按方框截出头像方图（512×512）；对方网站不让复制时交 null。 */
export async function bakePortrait(img: LoadedImage, rect: CropRect, size = 512): Promise<string | null> {
  if (!img.bakeable) return null
  const c = document.createElement('canvas')
  const sw = rect.w * img.width
  const out = Math.max(1, Math.min(size, Math.round(sw)))
  c.width = out; c.height = out
  c.getContext('2d')!.drawImage(img.el, rect.x * img.width, rect.y * img.height, sw, rect.h * img.height, 0, 0, out, out)
  try {
    const blob = await canvasBlob(c, 0.9)
    return blob ? toDataUrl(blob) : null
  } catch { return null }
}
