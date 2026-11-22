// 作者整条渲染（renderEntity）的哪些部分可以搬上界面：资料卡（author-fragment）和建卡弹窗右栏共用这一份规则。
export const MARKUP_ELEMENTS = new Set('p div span strong b i em u s del small sub sup br hr ul ol li dl dt dd blockquote h2 h3 h4 h5 h6 table caption colgroup col thead tbody tfoot tr th td details summary'.split(' '))
export const MARKUP_DISCARDED = new Set('script style template iframe object embed link meta base svg math form input button'.split(' '))
/** 作者的版式类名（ve-* / stats*）带过来按作者规则排版；其他类名不带。 */
export const markupClass = (value: string | null): string => (value ?? '').split(/\s+/).filter((c) => /^(ve-|stats|stripe-|small-caps$|bold$|no-wrap$|w100$)/.test(c)).join(' ')
export const MARKUP_ATTRS = ['colspan', 'rowspan', 'span', 'start', 'title'] as const

/** 只读的同一张资料卡：按上面的规则清成静态 HTML，链接和骰子都变成普通文字（不能点开别的窗口）。 */
export function inertMarkup(html: string): string {
  const source = document.createElement('template')
  source.innerHTML = html
  const out = document.createElement('template')
  const copy = (node: Node, into: Node): void => {
    if (node.nodeType === Node.TEXT_NODE) { into.appendChild(document.createTextNode(node.textContent ?? '')); return }
    if (!(node instanceof Element) || MARKUP_DISCARDED.has(node.localName)) return
    if (node.hasAttribute('data-rd-h-toggle-button') || node.hasAttribute('data-rd-h-special-toggle-button')) return
    let target: Node = into
    if (MARKUP_ELEMENTS.has(node.localName)) {
      const el = document.createElement(node.localName)
      const cls = markupClass(node.getAttribute('class'))
      if (cls) el.className = cls
      for (const name of MARKUP_ATTRS) {
        const value = node.getAttribute(name)
        if (value !== null) el.setAttribute(name, value)
      }
      into.appendChild(el)
      target = el
    }
    for (const child of node.childNodes) copy(child, target)
  }
  for (const child of source.content.childNodes) copy(child, out.content)
  return out.innerHTML
}
