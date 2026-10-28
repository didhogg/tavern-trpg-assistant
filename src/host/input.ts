import { getTextarea, setTextareaValue } from './context'

/** 把文字追加到酒馆输入框末尾（另起一行），保留原文、不发送。成功返回 true。 */
export function appendToInput(text: string): boolean {
  const textarea = getTextarea()
  if (!textarea) return false
  const current = textarea.value
  const next = current ? `${current}${current.endsWith('\n') ? '' : '\n'}${text}` : text
  setTextareaValue(textarea, next)
  return textarea.value === next
}
