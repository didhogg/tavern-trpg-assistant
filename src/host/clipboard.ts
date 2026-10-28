/** 复制文字：优先用剪贴板接口；非安全上下文（http）下退回选中再复制。 */
export async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch (error) {
    console.warn('[trpg-assistant] 剪贴板接口不可用，改用备用方式', error)
  }
  const area = document.createElement('textarea')
  area.value = text
  area.style.cssText = 'position:fixed;left:-9999px;top:0;opacity:0'
  document.body.appendChild(area)
  area.select()
  try {
    return document.execCommand('copy')
  } finally {
    area.remove()
  }
}
