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
  /** 正文里的表格原对象（按 data-trpg-table 的序号）：界面在作者画好的表格上叠掷骰。不收表格时没有。 */
  tables?: unknown[]
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

/**
 * 一次同步渲染里收集作者的原始链接目标；收表格时，把作者画的每张表包一层 data-trpg-table 标记并记下表格原对象
 * （作者渲染器没有表格钩子，这里在这一次渲染期间临时包住作者自己的 _renderTable，渲染完还原）。
 */
export function collectAuthorLinks<T>(render: () => T, { tables: captureTables = true }: { tables?: boolean } = {}): { value: T; marker: string; links: AuthorLink[]; tables: unknown[] } {
  const renderer = A.Renderer.get()
  const marker = uuid()
  const links: AuthorLink[] = []
  const tables: unknown[] = []
  const original = renderer._renderTable
  if (captureTables) {
    renderer._renderTable = function (entry: unknown, textStack: string[], meta: unknown, options: unknown) {
      const index = tables.push(JSON.parse(JSON.stringify(entry))) - 1
      textStack[0] += `<div data-trpg-table="${marker}:${index}">`
      original.call(this, entry, textStack, meta, options)
      textStack[0] += '</div>'
    }
  }
  try {
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
    return { value, marker, links, tables }
  } finally {
    if (captureTables) renderer._renderTable = original
  }
}

/** 一段作者内容的渲染。tables = false：不收表格（随机表组件自己画整张表时用，免得表里再套表格组件）。 */
export async function renderContent(input: unknown, { tables = true }: { tables?: boolean } = {}): Promise<AuthorMarkup> {
  await init()
  const { value: html, marker, links, tables: found } = collectAuthorLinks(() => String(A.Renderer.get().render(input)), { tables })
  return { html, marker, links, ...(found.length ? { tables: found } : {}) }
}
