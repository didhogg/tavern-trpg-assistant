// 把实际语言键交给主线；主线再按同一小窗语言取字。找不到键的文字不能冒充语言包文字。
/* eslint-disable @typescript-eslint/no-explicit-any -- 官方本地化对象没有类型声明 */
import { sha256Hex } from '../../../core/hash'
import { fromAuthor, joined, type FrameText } from '../shown'

const g = globalThis as any
let indexed: object | null = null
const keysByText = new Map<string, string[]>()
const normalize = (text: string) => text.trim().toLowerCase()

function index(): void {
  const i18n = g.game.i18n
  if (indexed === i18n) return
  indexed = i18n
  keysByText.clear()
  const walk = (node: any, path: string[] = []) => {
    for (const [key, value] of Object.entries(node ?? {})) {
      const next = [...path, key]
      if (typeof value === 'string') {
        const text = normalize(value)
        keysByText.set(text, [...(keysByText.get(text) ?? []), next.join('.')])
      } else if (value && typeof value === 'object') walk(value, next)
    }
  }
  walk(i18n.translations)
  walk(i18n._fallback)
}

/** 以真实语言键为准；文字反查仅查已加载的语言字典，多个键须产生同一显示值。 */
export function systemText(text: string, key?: string): FrameText {
  index()
  const i18n = g.game.i18n
  const keys = key ? [key] : [...new Set(keysByText.get(normalize(text)) ?? [])]
  const valid = keys.filter(k => i18n.has(k))
  const values = new Set(valid.map(k => i18n.localize(k)))
  if (valid.length && values.size === 1) return { $t: 'system', key: valid[0], text }
  const parts = text.split('、')
  if (parts.length > 1) return joined(parts.map(part => systemText(part)), '、')
  return fromAuthor(text, null)
}

/** 从上游资料包或程序生成的标题，按原文匹配作者译名表自动生成的语言键。 */
export function generatedText(text: string): FrameText {
  return { $t: 'system', key: `TRPGAssistant.UpstreamText.${sha256Hex(normalize(text)).slice(0, 24)}`, text }
}

/** 一个确实存在的语言键 → 出处（显示文字由主线按同一语言取）；不存在 = null。语言键出处只从本文件产生。 */
export function keyText(key: string): FrameText | null {
  const i18n = g.game.i18n
  return i18n.has(key) ? { $t: 'system', key, text: i18n.localize(key) } : null
}

/** 同一段原文对应的几个候选语言键：按顺序串成回退链（前一个取不到再取后一个）；没有键 = null。 */
export function keyChain(keys: string[], text: string): FrameText | null {
  return keys.reduceRight<FrameText | null>((fallback, key) => ({ $t: 'system', key, text, ...(fallback ? { fallback } : {}) }), null)
}
