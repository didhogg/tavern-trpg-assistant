import { uuid } from '../../../core/ids'
import { A, init } from './author'
import { authorPageProps, bookTagMeta, type TagMeta } from './tag-commands'

export type AuthorLink =
  | { kind: 'library'; meta: TagMeta }
  | { kind: 'external'; url: string }
  | { kind: 'filter'; path: string }

export interface AuthorMarkup {
  html: string
  marker: string
  links: AuthorLink[]
}

interface LinkEntry {
  href: {
    type: string; url?: string; path?: string; hash?: string; hashPreEncoded?: boolean
    hover?: { page: string; source?: string; hash?: string; hashPreEncoded?: boolean }
  }
}

function targetOf(entry: LinkEntry, renderedHref: string): AuthorLink | null {
  const href = entry.href
  if (href.type === 'external') return href.url ? { kind: 'external', url: href.url } : null
  if (href.type !== 'internal' || !href.path) return null
  if (href.hash === A.HASH_BLANK) return { kind: 'filter', path: renderedHref }
  const page = href.hover?.page ?? href.path
  const hash = href.hover?.hash ?? href.hash
  if (!hash) return null
  if (page === 'book.html' || page === 'adventure.html') {
    const [id, chapter, header, index] = hash.split(A.HASH_PART_SEP)
    let section = header ?? ''
    try { section = decodeURIComponent(section) } catch { return null }
    const tag = page === 'book.html' ? '@book' : '@adventure'
    return { kind: 'library', meta: bookTagMeta(tag, ['', id, chapter, section, index].join('|')) }
  }
  const props = authorPageProps(page)
  if (!props.length) return null
  const encoded = href.hover?.hash ? href.hover.hashPreEncoded : href.hashPreEncoded
  return { kind: 'library', meta: {
    tag: '', name: '', displayText: '', page, props, source: href.hover?.source ?? null,
    hash: encoded ? hash : A.UrlUtil.encodeForHash(hash),
  } }
}

/** Capture the author's original destinations during one synchronous render. */
export function collectAuthorLinks<T>(render: () => T): { value: T; marker: string; links: AuthorLink[] } {
  const renderer = A.Renderer.get()
  const marker = uuid()
  const links: AuthorLink[] = []
  const value = renderer.withPlugin({
    pluginTypes: ['link'],
    fnPlugin: (_meta: unknown, { input }: { input: LinkEntry }) => {
      const target = targetOf(input, renderer._renderLink_getHref(input))
      if (!target) return { isDisableEvents: true }
      const index = links.push(target) - 1
      return { isDisableEvents: true, attributes: `data-trpg-link="${marker}:${index}"` }
    },
    fn: render,
  }) as T
  return { value, marker, links }
}

export async function renderContent(input: unknown): Promise<AuthorMarkup> {
  await init()
  const { value: html, marker, links } = collectAuthorLinks(() => String(A.Renderer.get().render(input)))
  return { html, marker, links }
}
