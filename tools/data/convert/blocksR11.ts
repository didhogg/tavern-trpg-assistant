import type { TextBlock } from '../../../src/schemas/text'
import { convertBlocks, type BlockOptions } from './blocks'
import { renderInline, type InlineContext } from '../markup/inline'

type Raw = Record<string, unknown>

function isObj(value: unknown): value is Raw {
  return !!value && typeof value === 'object' && !Array.isArray(value)
}

function str(value: unknown): string {
  return typeof value === 'string' ? value : ''
}

function textOf(block: TextBlock): string {
  if ('p' in block) return block.p
  if ('h' in block) return [block.h, ...block.body.map(textOf)].join(' ')
  if ('list' in block) return block.list.join('；')
  if ('quote' in block) return block.quote
  if ('table' in block) return block.table.rows.map((row) => row.join(' ')).join('；')
  return block.read.map(textOf).join('')
}

function renderList(value: unknown, ctx: InlineContext, options: BlockOptions): string {
  return convertBlocks(value, ctx, options).map(textOf).join('')
}

export type BlockExtra = (input: Raw, ctx: InlineContext, options: BlockOptions) => TextBlock[] | undefined

function extra(input: Raw, ctx: InlineContext, options: BlockOptions): TextBlock[] | undefined {
  const type = str(input.type)
  const name = str(input.name)
  if (type === 'image' || type === 'internal') return []
  if (type === 'ingredient') {
    const entry = input.entry
    if (typeof entry === 'string') return [{ p: renderInline(entry, ctx) }]
    if (Array.isArray(entry) || isObj(entry)) return convertBlocks(entry, ctx, options)
    return []
  }
  if (type === 'attack') {
    const code = str(input.attackType)
    const attackName = code === 'MW' ? '近战武器攻击' : code === 'RW' ? '远程武器攻击' : ''
    if (!attackName) throw new Error(`未知的攻击类型：${code || '空'}`)
    const attack = renderList(input.attackEntries, ctx, options)
    const hit = renderList(input.hitEntries, ctx, options)
    const body = `${attackName}：${attack}${hit ? `　命中：${hit}` : ''}`
    return [{ p: body }]
  }
  if (type === 'inset' || type === 'actions') {
    if (!name) return undefined
    return [{ h: renderInline(name, ctx), body: convertBlocks(input.entries, ctx, options) }]
  }
  if (type === 'item' || type === 'itemSub') {
    if (input.entry !== undefined || !Array.isArray(input.entries)) return undefined
    return [{ h: renderInline(name, ctx), body: convertBlocks(input.entries, ctx, options) }]
  }
  if (!type && name && (Array.isArray(input.entries) || isObj(input.entries))) {
    return [{ h: renderInline(name, ctx), body: convertBlocks(input.entries, ctx, options) }]
  }
  return undefined
}

declare module './blocks' {
  interface BlockOptions {
    extra?: BlockExtra
  }
}

export const r11BlockOptions: BlockOptions = { extra }
