// 行内标签 → 链接 / 骰子 / 普通文字：全部问作者函数（links.resolveTag 认链接，frame diceTag 认骰子），界面不猜。同一个标签只问一次。
import type { Services } from '../../core/services'
import type { EntryRef } from '../../library/scopes'
import { getSource } from '../../library/sources'
import { tagLabel } from './inline-text'

export type TagResolved =
  | { kind: 'link'; label: string; ref: EntryRef | null }
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
          return { kind: 'link', label: meta.displayText || label, ref: loc ? { set: loc.set, prop: loc.prop, hash: loc.hash } : null }
        }
        const dice = await (await s.backend.library.service.frameOf(codeSet)).call('diceTag', tag, content)
        if (dice) return { kind: 'dice', label }
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
