export function element<K extends keyof HTMLElementTagNameMap>(tag: K, className = '', text = ''): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag)
  node.className = className
  node.textContent = text
  return node
}

export function button(text: string, action: () => void, className = 'p6-builder-btn'): HTMLButtonElement {
  const node = element('button', className, text)
  node.type = 'button'
  node.addEventListener('click', action)
  return node
}
