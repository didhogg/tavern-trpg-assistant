import type { Entry } from '../../../src/schemas/pack'
import { hasHan, isBlocks } from './cjk'

type Rec = Record<string, unknown>

function at(root: unknown, path: string): unknown {
  let cur: unknown = root
  for (const part of path.split('.')) {
    if (Array.isArray(cur)) cur = cur[Number(part)]
    else if (cur && typeof cur === 'object') cur = (cur as Rec)[part]
    else return undefined
  }
  return cur
}

const hasTag = (value: unknown): boolean => JSON.stringify(value).includes('{@')

/**
 * 构建期校验（R13 §5）：每个 fields 路径在中文 data 里存在且类型一致；英文值里没有汉字、没有 `{@`；
 * 名称与摘要无汉字。引用是否悬空由 `checkReferences` 一并检查。返回错误清单，空即通过。
 */
export function validateI18n(entries: Entry[]): string[] {
  const errors: string[] = []
  for (const entry of entries) {
    const i18n = (entry as { i18n?: { en: { name: string; summary?: string; fields: Record<string, unknown> } } }).i18n
    if (!i18n) continue
    const en = i18n.en
    if (!en.name || hasHan(en.name)) errors.push(`${entry.id}：英文名称为空或含汉字`)
    if (en.summary !== undefined && hasHan(en.summary)) errors.push(`${entry.id}：英文摘要含汉字`)
    for (const [path, value] of Object.entries(en.fields)) {
      const cn = at(entry.data, path)
      if (cn === undefined) { errors.push(`${entry.id}：路径 ${path} 在中文 data 里不存在`); continue }
      if (typeof value === 'string' ? typeof cn !== 'string' : !(isBlocks(value) && isBlocks(cn))) errors.push(`${entry.id}：路径 ${path} 的类型与中文不一致`)
      if (hasHan(value)) errors.push(`${entry.id}：${path} 的英文含汉字`)
      if (hasTag(value)) errors.push(`${entry.id}：${path} 的英文含未转换的 {@`)
    }
  }
  return errors
}
