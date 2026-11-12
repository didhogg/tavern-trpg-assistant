// 报错文字（P5-5 §12.3）：横幅里只放一句人话，作者 / 浏览器的原始报错（Error:、调用位置、网址）收进【详情】。
// 后端的报错通常是「中文说明：原始报错」，取前面的中文说明；没有中文说明的取第一行并截短。

/** 一段文字看起来是原始报错（调用栈、文件位置、网址、英文异常名）。 */
const RAW = /(Error\b|Exception|@\S+:\d+|\bat \S|https?:\/\/|\.js\b|\.json\b|tauri:|\n)/

/** 原始报错 → 横幅里的一句话。 */
export function plainError(raw: string | null | undefined, max = 80): string {
  const text = String(raw ?? '').trim()
  if (!text) return '原因未知'
  const parts = text.split('：')
  const kept: string[] = []
  for (const p of parts) {
    if (RAW.test(p) && kept.length) break
    kept.push(RAW.test(p) ? p.split('\n')[0].replace(/^(\w*Error|Exception):\s*/, '') : p)
  }
  const out = kept.join('：').replace(/\s+/g, ' ').trim()
  return out.length > max ? `${out.slice(0, max)}…` : out || '原因未知'
}

/** 原始报错里有没有比那一句话更多的内容（有才给【详情】）。 */
export const hasDetail = (raw: string | null | undefined): boolean => !!raw && plainError(raw, 10_000) !== String(raw).trim()
