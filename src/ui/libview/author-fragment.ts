import { defineComponent, h, shallowRef, watch, type PropType, type VNodeChild } from 'vue'
import type { ResolvedTag } from '../../library/entry-links'
import type { AuthorMarkup } from '../../library/runtime/frame/author-markup'
import { useAppStore } from '../../stores/app'
import ContentLink from './ContentLink.vue'

const elements = new Set('p div span strong b i em u s del small sub sup br hr ul ol li dl dt dd blockquote h2 h3 h4 h5 h6 table caption colgroup col thead tbody tfoot tr th td details summary'.split(' '))
const discarded = new Set('script style template iframe object embed link meta base svg math form input button'.split(' '))

function externalUrl(value: string): string | null {
  try {
    const url = new URL(value)
    return ['http:', 'https:'].includes(url.protocol) ? url.href : null
  } catch { return null }
}

function authorFilter(path: string, codeSet: string): string | null {
  if (!/^[a-z\d-]+\.html(?:#|$)/i.test(path)) return null
  return new URL(path, codeSet === 'cn' ? 'https://5e.kiwee.top/' : 'https://5e.tools/').href
}

/** Interpret inert author markup as Vue nodes. Only authored link targets become controls. */
export default defineComponent({
  props: { markup: { type: Object as PropType<AuthorMarkup>, required: true }, codeSet: { type: String, required: true }, inline: Boolean },
  setup(props) {
    const app = useAppStore()
    const resolved = shallowRef<Record<number, ResolvedTag>>({})
    const nodes = shallowRef<Node[]>([])
    watch(() => [props.markup, props.codeSet] as const, ([markup, codeSet], _, onCleanup) => {
      let current = true
      onCleanup(() => { current = false })
      const template = document.createElement('template')
      template.innerHTML = markup.html
      nodes.value = [...template.content.childNodes]
      resolved.value = {}
      const prefix = `${markup.marker}:`
      const ids = new Set([...template.content.querySelectorAll('[data-trpg-link]')].flatMap((e) => {
        const mark = e.getAttribute('data-trpg-link') ?? ''
        return mark.startsWith(prefix) ? [Number(mark.slice(prefix.length))] : []
      }))
      if (![...ids].some((id) => markup.links[id]?.kind === 'library')) return
      void (async () => {
        const library = app.svc().backend.library
        const view = await library.currentView()
        const pairs = await Promise.all([...ids].map(async (i) => {
          const link = markup.links[i]
          return link?.kind === 'library' ? [i, await library.links.resolveMeta(codeSet, link.meta, view)] as const : null
        }))
        if (current) resolved.value = Object.fromEntries(pairs.filter((p) => p !== null))
      })().catch((e) => console.error('[trpg-assistant] 作者正文里的链接未能定位', e))
    }, { immediate: true })

    function draw(node: Node, key: string): VNodeChild {
      if (node.nodeType === Node.TEXT_NODE) return node.textContent
      if (!(node instanceof Element) || discarded.has(node.localName)) return null
      if (node.hasAttribute('data-rd-h-toggle-button') || node.hasAttribute('data-rd-h-special-toggle-button')) return null
      const children = [...node.childNodes].map((child, i) => draw(child, `${key}.${i}`))
      const mark = node.getAttribute('data-trpg-link')
      if (mark?.startsWith(`${props.markup.marker}:`)) {
        const id = Number(mark.slice(props.markup.marker.length + 1))
        const link = props.markup.links[id]
        const target = resolved.value[id]
        if (link?.kind === 'library') return target
          ? h(ContentLink, { key, target, codeSet: props.codeSet, label: node.textContent ?? '' }, { default: () => children })
          : h('span', { key }, children)
        const url = link?.kind === 'external' ? externalUrl(link.url) : link?.kind === 'filter' ? authorFilter(link.path, props.codeSet) : null
        if (url) return h('a', { key, href: url, target: '_blank', rel: 'noopener noreferrer', class: 'trpg-link', ...(link?.kind === 'filter' ? { title: '在 5etools 打开筛选结果' } : {}) }, children)
      }
      const tag = node.localName
      if (!elements.has(tag)) return children
      const attrs: Record<string, string> = { key }
      if (node.hasAttribute('data-title-index')) {
        const heading = node.querySelector('.ve-rd__h-inner')?.textContent
        if (heading) attrs['data-reader-heading'] = heading
      }
      for (const name of ['colspan', 'rowspan', 'span', 'start', 'title']) {
        const value = node.getAttribute(name)
        if (value !== null) attrs[name] = value
      }
      return h(props.inline && ['p', 'div'].includes(tag) ? 'span' : tag, attrs, children)
    }

    return () => h(props.inline ? 'span' : 'div', { class: props.inline ? 'lib-author-inline' : 'lib-author-block' }, nodes.value.map((node, i) => draw(node, String(i))))
  },
})
