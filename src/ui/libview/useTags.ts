// 行内标签 → 链接 / 骰子 / 普通文字：全部问作者函数（links.resolveTag 认链接，frame diceTag 认骰子），界面不猜。同一个标签只问一次。
import type { Services } from '../../core/services'
import type { EntryRef } from '../../library/scopes'
import { getSource } from '../../library/sources'
import { tagLabel } from './inline-text'

export type TagResolved =
  | { kind: 'link'; label: string; ref: EntryRef | null; /** 书 / 冒险标签：点了打开这本书的包弹窗（不是条目详情）。 */ pack?: { set: string; source: string; kind: 'book' | 'adventure'; name: string } }
  | { kind: 'dice'; label: string }
  | { kind: 'plain'; label: string }

const memo = new Map<string, Promise<TagResolved>>()

export function resolveTagOnce(s: Services, codeSet: string, tag: string, content: string): Promise<TagResolved> {
  const key = `${codeSet}|${tag}|${content}`
  let p = memo.get(key)
  if (!p) {
    p = (async (): Promise<TagResolved> => {
      const label = tagLabel(content, tag.replace(/^@/, ''))
      try {
        const meta = await s.backend.library.links.resolveTag(codeSet, tag, content)
        if (meta) {
          const loc = meta.located
          const name = meta.displayText || label
          // 书 / 冒险不是一条条目，是一整本：点了直接去这本书 / 包的数据库（包弹窗），不去条目详情
          if (loc && loc.kind === 'corpus') return { kind: 'link', label: name, ref: null, pack: { set: loc.set, source: loc.source ?? '', kind: loc.prop === 'adventure' ? 'adventure' : 'book', name } }
          return { kind: 'link', label: name, ref: loc ? { set: loc.set, prop: loc.prop, hash: loc.hash } : null }
        }
        const frame = await s.backend.library.service.frameOf(codeSet)
        const dice = await frame.call('diceTag', tag, content)
        if (dice) return { kind: 'dice', label }
        // 既不是链接也不是骰子（{@atk mw}、{@dc 18}、{@h} 等）：显示成什么由作者渲染器定（frame renderText，P5-1 B-40），不显示里面的原文
        const full = tag.startsWith('@') ? tag : '@' + tag
        const shown = await frame.call('renderText', '{' + full + (content ? ' ' + content : '') + '}')
        if (shown) return { kind: 'plain', label: shown }
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
