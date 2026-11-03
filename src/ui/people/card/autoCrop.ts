import type { AvatarCrop } from '../../../schemas/people'

/**
 * 头像自动截取框（U5 §4.2.1）：固定 4:5，取能放下的最大框。
 * 宽图水平居中；窄长图宽度取满，垂直取溢出高度的 20%。返回相对原图的比例。
 */
export function autoCropAvatar(width: number, height: number): AvatarCrop {
  if (!Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0) return { x: 0, y: 0, w: 1, h: 1 }
  const ratio = 4 / 5
  if (width / height > ratio) {
    const w = (height * ratio) / width
    return { x: (1 - w) / 2, y: 0, w, h: 1 }
  }
  if (width / height < ratio) {
    const h = width / (height * ratio)
    return { x: 0, y: (1 - h) * 0.2, w: 1, h }
  }
  return { x: 0, y: 0, w: 1, h: 1 }
}

/** 按给定截取框生成 4:5 图片；原图比 320×400 小时按原截取尺寸输出。 */
export async function cropImageToBytes(image: HTMLImageElement, crop: AvatarCrop): Promise<Uint8Array> {
  const cropW = Math.max(1, Math.round(crop.w * image.naturalWidth))
  const cropH = Math.max(1, Math.round(crop.h * image.naturalHeight))
  const outW = Math.min(320, cropW)
  const outH = Math.max(1, Math.round((outW * 5) / 4))
  const canvas = document.createElement('canvas')
  canvas.width = outW
  canvas.height = outH
  const context = canvas.getContext('2d')
  if (!context) throw new Error('浏览器不支持画布')
  context.imageSmoothingEnabled = true
  context.imageSmoothingQuality = 'high'
  context.drawImage(image, crop.x * image.naturalWidth, crop.y * image.naturalHeight, cropW, cropH, 0, 0, outW, outH)
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png'))
  if (!blob) throw new Error('浏览器没有生成截取图')
  return new Uint8Array(await blob.arrayBuffer())
}

/** 把文件转成 4:5 截取图；原图比 320×400 小时按原截取尺寸输出。 */
export async function cropAvatarFile(file: File): Promise<{ bytes: Uint8Array; crop: AvatarCrop }> {
  const url = URL.createObjectURL(file)
  try {
    const image = new Image()
    image.src = url
    await image.decode()
    const crop = autoCropAvatar(image.naturalWidth, image.naturalHeight)
    return { bytes: await cropImageToBytes(image, crop), crop }
  } finally {
    URL.revokeObjectURL(url)
  }
}
