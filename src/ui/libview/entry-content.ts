type Block = Record<string, unknown>
const record = (value: unknown): value is Block => !!value && typeof value === 'object' && !Array.isArray(value)

/**
 * 找出条目里作者的全部图块（{type:'image'}），不论放在哪个字段：正文、背景、表格里，或条目自己的字段（卡牌的 face / back 等）。
 * 不按字段名清单找（P5-5 §11.5：卡牌的图在 face 字段，旧清单漏了）。
 */
export function imagesOf(content: unknown): Block[] {
  const images = new Map<string, Block>()
  function visit(value: unknown): void {
    if (Array.isArray(value)) { value.forEach(visit); return }
    if (!record(value)) return
    if (value.type === 'image' && record(value.href)) {
      const key = JSON.stringify([value.href, value.title, value.credit])
      if (!images.has(key)) images.set(key, value)
      return
    }
    for (const v of Object.values(value)) visit(v)
  }
  visit(content)
  return [...images.values()]
}
