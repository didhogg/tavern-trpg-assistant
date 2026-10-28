import { tagSpec } from './tags'

export interface RefTarget {
  id: string
  type: string
  name: string
  packId: string
}

export interface RefIndex {
  byTypeName: Map<string, RefTarget[]>
  byTypeNameSource: Map<string, RefTarget>
}

export function addRef(index: RefIndex, target: RefTarget, source: string): void {
  const key = `${target.type}|${target.name}`
  const list = index.byTypeName.get(key) ?? []
  list.push(target)
  index.byTypeName.set(key, list)
  index.byTypeNameSource.set(`${key}|${source.toUpperCase()}`, target)
}

export interface InlineContext {
  index: RefIndex
  book: string
  ownPack: string
  allowed: Set<string>
  softRefs: { count: number }
  missingTags: Map<string, number>
  vars?: Record<string, string>
}

const ATK_NAMES: Record<string, string> = { mw: '近战武器攻击', rw: '远程武器攻击', ms: '近战法术攻击', rs: '远程法术攻击' }
const DICE = /^\d{0,2}d\d{1,3}(?:\s*[+-]\s*\d+)?$/i

function cleanDice(value: string): string | undefined {
  const normalized = value.replace(/\s+/g, '')
  return DICE.test(normalized) ? normalized : undefined
}

function plain(parts: string[], fallback = ''): string {
  const display = parts.find((p, i) => i > 0 && p) ?? parts[0] ?? fallback
  return display || fallback
}

function sourcePart(parts: string[], from = 1): string | undefined {
  for (let i = from; i < parts.length; i++) {
    const part = parts[i]
    if (!part || /^\d+$/.test(part)) continue
    if (/^(?:[A-Z][A-Za-z0-9-]{1,15}|[a-z]{2,8})$/.test(part)) return part.toUpperCase()
  }
  return undefined
}

function resolve(ctx: InlineContext, type: string, name: string, source?: string): RefTarget | undefined {
  if (source) {
    const exact = ctx.index.byTypeNameSource.get(`${type}|${name}|${source}`)
    if (exact) return exact
  }
  const sameBook = ctx.index.byTypeNameSource.get(`${type}|${name}|${ctx.book}`)
  if (sameBook) return sameBook
  return ctx.index.byTypeName.get(`${type}|${name}`)?.[0]
}

function refMarkup(ctx: InlineContext, specType: string, parts: string[]): string {
  const name = parts[0] ?? ''
  const source = sourcePart(parts, 1)
  const display = parts.length > 2 && parts[2] ? parts[2] : name
  const target = resolve(ctx, specType, name, source)
  if (!target || !ctx.allowed.has(target.packId)) {
    ctx.softRefs.count++
    return display
  }
  return `{{ref:${target.id}|${display}}}`
}

function textValue(parts: string[]): string {
  if (parts[0] === 'chance') return parts.slice(3).find(Boolean) ?? parts[0]
  const display = parts.find((p, i) => i > 0 && p)
  return display ?? parts[0] ?? ''
}

function renderTag(name: string, arg: string, ctx: InlineContext): string {
  const spec = tagSpec(name, ctx.book)
  const parts = arg.split('|')
  switch (spec.kind) {
    case 'roll': {
      const scaled = name === 'scaledamage' || name === 'scaledice'
      const source = scaled ? parts[2] || parts[0] : parts[0]
      const dice = cleanDice(source ?? '')
      if (!dice) return plain(parts)
      return `{{roll:${dice}|${parts[2] || parts[0] || dice}}}`
    }
    case 'hit':
      return `{{hit:${parts[0] ?? ''}}}`
    case 'dc':
      return `{{dc:${parts[0] ?? ''}}}`
    case 'atk': {
      const kinds = (parts[0] ?? '').split(',').map((k) => k.trim()).filter(Boolean)
      const names = kinds.map((k) => ATK_NAMES[k] ?? k)
      return `{{atk:${kinds.join(',') || 'mw'}|${parts[1] || names.join('或') || '攻击'}}}`
    }
    case 'ref':
      return refMarkup(ctx, spec.refType ?? 'rule', parts)
    case 'em':
      return `{{em:${inlinePlainText(renderInline(arg, ctx))}}}`
    case 'text':
      if (name === 'note') return renderInline(arg, ctx)
      if (name === 'link') return renderInline(parts[0] ?? '', ctx)
      return renderInline(textValue(parts), ctx)
    default:
      return arg
  }
}

/** 把一段 5etools 行内文本转成 {{种类:参数|显示文字}}（D1 §4.4）。支持嵌套标签。 */
export function renderInline(input: string, ctx: InlineContext): string {
  let out = ''
  let i = 0
  while (i < input.length) {
    if (input.startsWith('{=', i)) {
      const close = input.indexOf('}', i + 2)
      if (close < 0) { out += input.slice(i); break }
      const key = input.slice(i + 2, close)
      out += ctx.vars?.[key] ?? input.slice(i, close + 1)
      i = close + 1
      continue
    }
    if (!input.startsWith('{@', i)) {
      out += input[i++]
      continue
    }
    let depth = 1
    let end = -1
    for (let j = i + 1; j < input.length; j++) {
      if (input[j] === '{') depth++
      else if (input[j] === '}') {
        depth--
        if (depth === 0) {
          end = j
          break
        }
      }
    }
    if (end < 0) {
      out += input.slice(i)
      break
    }
    const inner = input.slice(i + 2, end)
    const space = inner.indexOf(' ')
    const name = space < 0 ? inner : inner.slice(0, space)
    const arg = space < 0 ? '' : inner.slice(space + 1)
    out += renderTag(name, arg, ctx)
    i = end + 1
  }
  return out
}

export function renderInlineList(values: string[], ctx: InlineContext): string[] {
  return values.map((v) => renderInline(v, ctx))
}

/** 供测试与后续渲染使用的纯文本化（去掉行内标记，只留显示文字）。 */
export function inlinePlainText(value: string): string {
  return value
    .replace(/\{\{[a-z]+:([^|}]*)\|([^}]*)\}\}/g, '$2')
    .replace(/\{\{[a-z]+:([^}]*)\}\}/g, '$1')
}
