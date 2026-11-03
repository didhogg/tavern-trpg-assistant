/** 按焦点把原图裁成 size×size 的容器：返回 img 的宽度、左边距、上边距（像素）。 */
export function cropStyle(focus: { x: number; y: number; size: number }, width: number, height: number, size: number): { width: number; left: number; top: number } {
  const c = Math.max(1, Math.min(focus.size * Math.min(width, height), Math.min(width, height)))
  const k = size / c
  const cx = Math.min(Math.max(focus.x * width, c / 2), width - c / 2)
  const cy = Math.min(Math.max(focus.y * height, c / 2), height - c / 2)
  return { width: width * k, left: -(cx - c / 2) * k, top: -(cy - c / 2) * k }
}
