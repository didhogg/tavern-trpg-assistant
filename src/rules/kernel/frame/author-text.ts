// 作者代码里写死的显示文字（例：语言分组说明「With your DM's permission…」，在作者 Renderer.generic 的静态对象里）：
// 结算小窗跑的是 Plutonium 带的英文作者代码，这里只找出这段文字在作者代码里的位置；主线到本战役的作者小窗（中文战役 = 中文作者代码）
// 同一位置取文字（library/texts.ts）。和 locale.ts 同一个原理：英文版找位置，中文版同位置取；位置不唯一 / 找不到 → null，原样显示。
/* eslint-disable @typescript-eslint/no-explicit-any -- 作者代码是没有类型的 JS。 */
const g = globalThis as any
/** 作者放显示文字的全局对象（Parser 的对照表另有 valueLabels 按编号取）。 */
const ROOTS = ['Renderer']
const MAX_DEPTH = 8

let index: Map<string, string[][]> | null = null
/** 一次性把作者代码里的字符串连同位置记下来（只走普通对象、数组和类的静态字段，不进原型）。 */
function build(): Map<string, string[][]> {
  const out = new Map<string, string[][]>()
  const seen = new WeakSet<object>()
  const walk = (node: any, path: string[]): void => {
    if (typeof node === 'string') { const list = out.get(node) ?? []; list.push(path); out.set(node, list); return }
    if (!node || (typeof node !== 'object' && typeof node !== 'function') || seen.has(node) || path.length > MAX_DEPTH) return
    seen.add(node)
    // 只读普通数据字段；getter 不读（作者的 getter 可能要页面环境），不进原型
    for (const [key, desc] of Object.entries(Object.getOwnPropertyDescriptors(node))) if ('value' in desc && key !== 'prototype') walk(desc.value, [...path, key])
  }
  for (const root of ROOTS) walk(g[root], [root])
  return out
}

/** 这段文字在作者代码里的位置；没有或不止一处 → null。 */
export function authorTextPath(text: string | null | undefined): string[] | null {
  if (!text) return null
  index ??= build()
  const found = index.get(text)
  return found?.length === 1 ? found[0] : null
}
