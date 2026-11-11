// 行内标签 → 链接 / 骰子 / 普通文字：全部问作者函数（links.resolveTag 认链接，frame diceTag 认骰子），界面不猜。同一个标签只问一次。
import type { Services } from '../../core/services'
import type { ResolvedTag } from '../../library/entry-links'
import type { AuthorMarkup } from '../../library/runtime/frame/author-markup'
import { getSource } from '../../library/sources'
import { tagLabel } from './inline-text'

export type TagResolved =
  | { kind: 'link'; label: string; target: ResolvedTag }
  | { kind: 'dice'; label: string }
  | { kind: 'markup'; markup: AuthorMarkup; label: string }
  | { kind: 'plain'; label: string }

const memo = new Map<string, Promise<TagResolved>>()
let generation = -1

export function resolveTagOnce(s: Services, codeSet: string, tag: string, content: string): Promise<TagResolved> {
  const library = s.backend.library
  if (generation !== library.service.generation) { memo.clear(); generation = library.service.generation }
  const key = `${codeSet}|${tag}|${content}`
  let p = memo.get(key)
  if (!p) {
    p = (async (): Promise<TagResolved> => {
      const full = tag.startsWith('@') ? tag : '@' + tag
      const label = tagLabel(content, full.slice(1))
      try {
        const meta = await library.links.resolveTag(codeSet, tag, content)
        if (meta) return { kind: 'link', label: meta.displayText || label, target: meta }
        const frame = await library.service.frameOf(codeSet)
        try {
          if (await frame.call('diceTag', full, content)) return { kind: 'dice', label }
        } catch (e) {
          // 作者的骰子入口会抛出「不处理此标签」，普通标签仍须交给渲染器。
          if (!(e instanceof Error && e.message.includes(`Unhandled tag "${full}"`))) console.warn('[trpg-assistant] 识别骰子标签失败', full, e)
        }
        const markup = await frame.call('renderContent', '{' + full + (content ? ' ' + content : '') + '}')
        if (markup.html) return { kind: 'markup', markup, label }
      } catch (e) {
        console.error('[trpg-assistant] 解析标签失败', tag, e)
      }
      return { kind: 'plain', label }
    })()
    memo.set(key, p)
  }
  return p
}

export const codeSetOf = (setId: string): string => getSource(setId).codeSet
