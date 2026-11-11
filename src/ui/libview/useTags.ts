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
      const label = tagLabel(content, tag.replace(/^@/, ''))
      try {
        const meta = await library.links.resolveTag(codeSet, tag, content)
        if (meta) return { kind: 'link', label: meta.displayText || label, target: meta }
        const frame = await library.service.frameOf(codeSet)
        const dice = await frame.call('diceTag', tag, content)
        if (dice) return { kind: 'dice', label }
        // 既不是链接也不是骰子（{@atk mw}、{@dc 18}、{@h} 等）：显示成什么由作者渲染器定（frame renderText，P5-1 B-40），不显示里面的原文
        const full = tag.startsWith('@') ? tag : '@' + tag
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
