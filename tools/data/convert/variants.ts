import type { TextBlock } from '../../../src/schemas/text'
import type { InlineContext } from '../markup/inline'
import { renderInline } from '../markup/inline'
import { convertBlocks } from './blocks'
import { str } from './common'

function isObj(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === 'object' && !Array.isArray(value)
}

function spellName(value: unknown, inline: InlineContext): string {
  if (typeof value === 'string') return renderInline(value, inline)
  if (isObj(value)) return renderInline(str(value.entry) || str(value.name), inline)
  return ''
}

function spellcastingBlocks(raw: Record<string, unknown>, inline: InlineContext): TextBlock[] {
  const body: TextBlock[] = []
  body.push(...convertBlocks(raw.headerEntries, inline))
  const lines: string[] = []
  const spells = isObj(raw.spells) ? raw.spells : {}
  for (const [key, value] of Object.entries(spells)) {
    if (!isObj(value)) continue
    const names = (Array.isArray(value.spells) ? value.spells : []).map((x) => spellName(x, inline)).filter(Boolean)
    if (!names.length) continue
    if (key === '0') lines.push(`戏法：${names.join('、')}`)
    else if (/^\d+$/.test(key)) {
      const slots = typeof value.slots === 'number' ? `（${value.slots} 个法术位）` : ''
      lines.push(`${key} 环${slots}：${names.join('、')}`)
    }
  }
  const will = Array.isArray(raw.will) ? raw.will.map((x) => spellName(x, inline)).filter(Boolean) : []
  if (will.length) lines.push(`随意施放：${will.join('、')}`)
  const daily = isObj(raw.daily) ? raw.daily : {}
  for (const [key, value] of Object.entries(daily)) {
    if (!Array.isArray(value)) continue
    const names = value.map((x) => spellName(x, inline)).filter(Boolean)
    if (!names.length) continue
    const every = key.endsWith('e')
    const times = Number(key.replace(/e$/, ''))
    lines.push(`每日 ${times} 次${every ? '（每个）' : ''}：${names.join('、')}`)
  }
  if (lines.length) body.push({ list: lines })
  body.push(...convertBlocks(raw.footerEntries, inline))
  return [{ h: str(raw.name), body }]
}

function variantBlocks(value: unknown, inline: InlineContext): TextBlock[] {
  if (Array.isArray(value)) return value.flatMap((item) => variantBlocks(item, inline))
  if (typeof value === 'string') return convertBlocks(value, inline)
  if (!isObj(value)) return []
  const type = str(value.type)
  if (type === 'variantSub') return [{ h: str(value.name), body: variantBlocks(value.entries, inline) }]
  if (type === 'spellcasting') return spellcastingBlocks(value, inline)
  if (type === 'entries' || type === 'section') {
    const body = variantBlocks(value.entries, inline)
    return str(value.name) ? [{ h: renderInline(str(value.name), inline), body }] : body
  }
  return convertBlocks(value, inline)
}

export interface MonsterVariant {
  name: string
  nameEn?: string
  kind: 'variant' | 'inset'
  text: TextBlock[]
  src?: { book: string; page?: number }
  version?: { name: string; addAs?: string; addHeadersAs?: string }
}

export function convertVariants(value: unknown, inline: InlineContext): MonsterVariant[] {
  if (!Array.isArray(value)) return []
  const out: MonsterVariant[] = []
  for (const item of value) {
    if (!isObj(item)) continue
    const kind = item.type === 'inset' ? 'inset' : 'variant'
    const name = str(item.name)
    if (!name) continue
    const versionRaw = isObj(item._version) ? item._version : undefined
    const version = versionRaw
      ? { name: str(versionRaw.name) || name, ...(str(versionRaw.addAs) ? { addAs: str(versionRaw.addAs) } : {}), ...(str(versionRaw.addHeadersAs) ? { addHeadersAs: str(versionRaw.addHeadersAs) } : {}) }
      : undefined
    const source = str(item.source)
    out.push({
      name,
      ...(str(item.ENG_name) ? { nameEn: str(item.ENG_name) } : {}),
      kind,
      text: variantBlocks(item.entries, inline),
      ...(source ? { src: { book: source, ...(typeof item.page === 'number' ? { page: item.page } : {}) } } : {}),
      ...(version ? { version } : {}),
    })
  }
  return out
}
